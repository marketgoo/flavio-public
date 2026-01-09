<?php

declare(strict_types=1);

namespace Flavio\Traits;

use Exception;
use Flavio\ApiConnector;

/**
 * Trait for token exchange functionality
 * 
 * Shared logic for exchanging temporary tokens for final JWTs
 * Used by CheckToken (signature flow) and ActivationCode (code flow)
 */
trait TokenExchange
{
  /**
   * Exchange temporary token with external API for final JWT
   *
   * @param string $temp_token The temporary token to exchange
   * @return array{success: bool, token?: string, message?: string}
   */
  protected function exchange_token(string $temp_token): array
  {
    try {
      $api_connector = new ApiConnector();

      // Call API: GET /authorize-token/{temp_token} with Authorization: Token {temp_token}
      $response = $api_connector->call(
        '/authorize-token/' . $temp_token,
        'GET',
        '',
        'en',
        [],
        false,
        [],
        ['Authorization' => 'Token ' . $temp_token]
      );


      if (!isset($response->data['success']) || !$response->data['success']) {
        $message = $response->data['message'] ?? 'Token exchange failed';
        return [
          'success' => false,
          'message' => $message,
        ];
      }

      // JSON:API structure: data.attributes.bearer
      $token = $response->data['data']['attributes']['bearer'] ?? '';

      if (empty($token)) {
        return [
          'success' => false,
          'message' => 'No bearer token received from API',
        ];
      }

      return [
        'success' => true,
        'token' => $token,
      ];
    } catch (Exception $e) {
      return [
        'success' => false,
        'message' => 'Error exchanging token: ' . $e->getMessage(),
      ];
    }
  }

  /**
   * Store the JWT token and parse metadata
   *
   * @param string $token The JWT token to store
   */
  protected function store_token_data(string $token): void
  {
    // Store the JWT token
    update_option('flavio_token', $token);

    // Parse JWT to extract and store metadata (iss, sub, uuid)
    $jwt_data = $this->parse_jwt_payload($token);
    if ($jwt_data) {
      update_option('flavio_api_domain', $jwt_data['iss'] ?? '');
      update_option('flavio_site_domain', $jwt_data['sub'] ?? '');
      update_option('flavio_plan_uuid', $jwt_data['uuid'] ?? '');
    }
  }

  /**
   * Parse JWT payload to extract metadata
   * 
   * Note: This treats the JWT as mostly opaque, only extracting metadata
   * for convenience. The bearer should be used as-is for API calls.
   *
   * @param string $jwt The JWT bearer token
   * @return array|null Parsed payload or null if parsing fails
   */
  protected function parse_jwt_payload(string $jwt): ?array
  {
    try {
      // JWT format: header.payload.signature
      $parts = explode('.', $jwt);

      if (count($parts) !== 3) {
        error_log('Flavio: Invalid JWT format'); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log -- Production logging for OAuth flow errors, not debug code.
        return null;
      }

      // Decode the payload (second part)
      $payload = base64_decode(strtr($parts[1], '-_', '+/'));

      if (!$payload) {
        error_log('Flavio: Failed to decode JWT payload'); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log -- Production logging for OAuth flow errors, not debug code.
        return null;
      }

      $data = json_decode($payload, true);

      if (!$data) {
        error_log('Flavio: Failed to parse JWT payload JSON'); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log -- Production logging for OAuth flow errors, not debug code.
        return null;
      }

      return $data;
    } catch (Exception $e) {
      error_log('Flavio: Error parsing JWT: ' . $e->getMessage()); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log -- Production logging for OAuth flow errors, not debug code.
      return null;
    }
  }
}
