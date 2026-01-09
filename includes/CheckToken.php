<?php

declare(strict_types=1);

namespace Flavio;

use Flavio\Traits\TokenExchange;

/**
 * CheckToken class for handling OAuth2-like token exchange
 *
 * Flow:
 * 1. User arrives with a temporary token, signature, and nonce in URL
 * 2. Validate WordPress nonce (CSRF protection)
 * 3. Validate signature against stored signature
 * 4. Exchange temporary token with external API for final JWT
 * 5. Store final JWT and metadata
 * 6. Redirect to main Flavio page
 *
 * Security:
 * - WordPress nonce verification (CSRF protection, validates request origin)
 * - Signature validation (comparing URL signature against stored signature)
 * - One-time use signature (deleted after successful token exchange)
 * - Admin-only access (only users with manage_options capability can reach this page)
 * - Token exchange with external API (temporary token is validated by external service)
 */
class CheckToken
{
  use TokenExchange;

  /**
   * Constructor
   */
  public function __construct()
  {
    // Hook early to process token exchange before any output
    add_action('admin_init', [$this, 'maybe_process_token_exchange']);
  }

  /**
   * Check if we should process token exchange and do it early (before any output)
   */
  public function maybe_process_token_exchange(): void
  {
    // Check if we have a nonce first
    if (!isset($_GET['_wpnonce'])) {
      return;
    }

    // Verify nonce before checking any other parameters
    $nonce = sanitize_text_field(wp_unslash($_GET['_wpnonce']));
    if (!wp_verify_nonce($nonce, 'flavio_oauth_callback')) {
      return;
    }

    // Now it's safe to check other parameters after nonce verification
    $is_code_page = isset($_GET['page']) && $_GET['page'] === 'flavio-code-page';
    $has_token = isset($_GET['token']) && isset($_GET['signature']);

    if ($is_code_page && $has_token) {
      $this->process_token_exchange();
    }
  }

  /**
   * Render the token check page
   */
  public function render(): void
  {
    // If we reach here, token exchange either failed or didn't happen
    print '<main id="flavio">
            <p class="flavio-loading">Validating session...</p>
        </main>';
  }

  /**
   * Process the token exchange flow
   *
   * Security layers:
   * 1. Nonce verification - Already validated in maybe_process_token_exchange()
   * 2. Signature validation - URL signature must match stored signature
   * 3. One-time use - Signature is deleted after successful exchange
   * 4. Permission check - Page is only accessible to admins (manage_options)
   */
  private function process_token_exchange(): void
  {
    // Nonce already verified in maybe_process_token_exchange()
    // Safe to read parameters
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    $signature = isset($_GET['signature']) ? sanitize_text_field(wp_unslash($_GET['signature'])) : '';
    // phpcs:ignore WordPress.Security.NonceVerification.Recommended
    $temp_token = isset($_GET['token']) ? sanitize_text_field(wp_unslash($_GET['token'])) : '';

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
					Error: ' . esc_html($message) . '
				</p>
					<a href="' . esc_url($flavio_url) . '">Back to Flavio</a>
		   </div>';
  }
}
