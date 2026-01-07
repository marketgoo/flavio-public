<?php

declare(strict_types=1);

namespace Flavio;

use Flavio\Traits\TokenExchange;

/**
 * CheckToken class for handling OAuth2-like token exchange
 *
 * Flow:
 * 1. User arrives with a temporary token and signature in URL
 * 2. Validate signature against stored signature
 * 3. Exchange temporary token with external API for final JWT
 * 4. Store final JWT and metadata
 * 5. Redirect to main Flavio page
 *
 * Security Note:
 * This class intentionally does NOT use WordPress nonces because it handles
 * an external OAuth-like flow. Security is provided through:
 * - Signature validation (comparing URL signature against stored signature)
 * - One-time use signature (deleted after successful token exchange)
 * - Admin-only access (only users with manage_options capability can reach this page)
 * - Token exchange with external API (temporary token is validated by external service)
 *
 * This is the standard security model for OAuth callback handlers.
 */
class CheckToken
{
  use TokenExchange;

  /**
   * Constructor
   */
  public function __construct() {}

  /**
   * Render the token check page and process token exchange
   */
  public function render(): void
  {
    // Process token exchange first (may redirect)
    $this->process_token_exchange();

    // Only render if we didn't redirect
    print '<main id="flavio">
            <p class="flavio-loading">Validating session...</p>
        </main>';
  }

  /**
   * Process the token exchange flow
   *
   * Security: This method does NOT use nonce verification because it's an external
   * OAuth-like callback. Instead, it uses:
   * 1. Signature validation - URL signature must match stored signature
   * 2. One-time use - Signature is deleted after successful exchange
   * 3. Permission check - Page is only accessible to admins (manage_options)
   */
  private function process_token_exchange(): void
  {
    // phpcs:disable WordPress.Security.NonceVerification.Recommended -- OAuth callback: uses signature validation, not nonce. See class docblock for security details.
    $signature = isset($_GET['signature']) ? sanitize_text_field(wp_unslash($_GET['signature'])) : '';
    $temp_token = isset($_GET['token']) ? sanitize_text_field(wp_unslash($_GET['token'])) : '';
    // phpcs:enable WordPress.Security.NonceVerification.Recommended

    // Validate required parameters
    if (empty($signature) || empty($temp_token)) {
      $this->render_error('Both signature and token parameters are required');
      return;
    }

    // Validate signature
    $stored_signature = get_option('flavio_signature');

    if (empty($stored_signature)) {
      $this->render_error('No signature found. Generate one first.');
      return;
    }

    if ($signature !== $stored_signature) {
      $this->render_error('Invalid signature');
      return;
    }

    // Exchange temporary token for final JWT
    $result = $this->exchange_token($temp_token);

    if (!$result['success']) {
      $this->render_error($result['message']);
      return;
    }

    // Store the final JWT token and metadata
    $this->store_token_data($result['token']);

    // Delete the signature after successful token storage
    delete_option('flavio_signature');

    // Redirect to main Flavio page
    $this->redirect_to_flavio();
  }

  /**
   * Redirect to main Flavio page after successful token storage
   */
  private function redirect_to_flavio(): void
  {
    $redirect_url = admin_url('admin.php?page=flavio-page');

    wp_safe_redirect($redirect_url);
    exit;
  }

  /**
   * Render an error message
   *
   * @param string $message The error message to display
   */
  private function render_error(string $message): void
  {
    $flavio_url = admin_url('admin.php?page=flavio-page');

    print '<div style="padding: 20px; text-align: center;">
				<p style="color: #dc3545;">
					Error: ' . $message . '
				</p>
					<a href="' . $flavio_url . '">Back to Flavio</a>
		   </div>';
  }
}
