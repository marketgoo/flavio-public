<?php
declare(strict_types=1);

namespace Flavio;

use WP_REST_Request;
use WP_REST_Response;

/**
 * Tasks class for managing tasks
 */
class Tasks extends ApiConnector {

	/**
	 * Constructor
	 */
	public function __construct() {
		parent::__construct();
		add_action('rest_api_init', [$this, 'register_routes']);
	}

	/**
	 * Register REST API routes
	 */
	public function register_routes(): void {
		register_rest_route('flavio/v1', '/task/dismiss/(?P<task_id>[a-zA-Z0-9-]+)', [
			'methods' => 'POST',
			'callback' => [$this, 'dismiss_task'],
			'permission_callback' => [$this, 'check_admin_permissions'],
			'args' => [
				'task_id' => [
					'required' => true,
					'type' => 'string',
					'description' => 'The task ID to dismiss',
				],
			],
		]);
	}

	/**
	 * Check if a user has admin permissions
	 *
	 * @return bool
	 */
	public function check_admin_permissions(): bool {
		return current_user_can('manage_options');
	}

	/**
	 * Dismiss a task
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response
	 */
	public function dismiss_task(WP_REST_Request $request): WP_REST_Response {
		$task_id = $request->get_param('task_id');
		$account_id = $this->getUuid();

		if (!$account_id) {
			return new WP_REST_Response([
				'success' => false,
				'message' => 'Account ID not found.'
			], 400);
		}

		$uri = "/accounts/{$account_id}/dismiss-task/{$task_id}";

		return $this->call($uri, 'POST');
	}
}
