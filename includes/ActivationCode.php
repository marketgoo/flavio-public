<?php

declare(strict_types=1);

namespace Flavio;

use Exception;
use Flavio\Traits\TokenExchange;
use WP_REST_Request;
use WP_REST_Response;

/**
 * ActivationCode class for handling activation code authentication
 * 
 * Flow:
 * 1. User gets a 6-character activation code from Flavio web
 * 2. User enters code in WordPress plugin
 * 3. Code is exchanged for JWT token via API
 * 4. JWT is stored and user is authenticated
 */
class ActivationCode
{
  use TokenExchange;

  /**
   * Constructor
   */
  public function __construct()
  {
    add_action('rest_api_init', [$this, 'register_routes']);
  }

  /**
   * Register REST API routes
   */
  public function register_routes(): void
  {
    register_rest_route('flavio/v1', '/activate', [
      'methods' => 'POST',
      'callback' => [$this, 'activate'],
      'permission_callback' => [$this, 'check_admin_permissions'],
      'args' => [
        'code' => [
          'required' => true,
          'type' => 'string',
          'sanitize_callback' => 'sanitize_text_field',
          'validate_callback' => function ($value) {
            return is_string($value) && strlen($value) === 6;
          },
        ],
      ],
    ]);
  }

  /**
   * Check if a user has admin permissions
   *
   * @return bool
   */
  public function check_admin_permissions(): bool
  {
    return current_user_can('manage_options');
  }

  /**
   * Activate using a 6-character code
   *
   * @param WP_REST_Request $request
   * @return WP_REST_Response
   */
  public function activate(WP_REST_Request $request): WP_REST_Response
  {
    try {
      $code = $request->get_param('code');

      if (empty($code)) {
        return new WP_REST_Response([
          'success' => false,
          'message' => 'Activation code is required',
        ], 400);
      }

      // Exchange activation code for JWT token
      // The activation code acts as a temporary token
      $result = $this->exchange_token($code);

      if (!$result['success']) {
        return new WP_REST_Response([
          'success' => false,
          'message' => $result['message'] ?? 'Invalid activation code',
        ], 400);
      }

      // Store the JWT token and metadata
      $this->store_token_data($result['token']);

      return new WP_REST_Response([
        'success' => true,
        'message' => 'Activation successful',
      ], 200);
    } catch (Exception $e) {
      return new WP_REST_Response([
        'success' => false,
        'message' => 'Error during activation: ' . $e->getMessage(),
      ], 500);
    }
  }
}
