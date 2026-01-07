<?php

namespace Flavio;

use Exception;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Data class for handling data endpoint
 */
class Data {

    /**
     * @var ApiConnector
     */
    private $api_conector;

    /**
     * Constructor
     */
    public function __construct() {
        $this->api_conector = new ApiConnector();
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    /**
     * Register REST API routes
     */
    public function register_routes(): void
    {
        register_rest_route('flavio/v1', '/data', [
            'methods' => 'GET',
            'callback' => [$this, 'get_data'],
            'permission_callback' => [$this, 'check_admin_permissions'],
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
     * Get account data via API (endpoint)
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_data(WP_REST_Request $request): WP_REST_Response
    {
        try {
            $data = $this->fetch_account_data();

            if (!$data['success']) {
                return new WP_REST_Response([
                    'success' => false,
                    'message' => $data['message']
                ], $data['status'] ?? 400);
            }

            return $data['response'];

        } catch (Exception $e) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Error getting data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Fetch account data from API
     *
     * @return array
     */
    private function fetch_account_data(): array {
        // Get account ID from JWT
        $account_id = $this->api_conector->getUuid();

        if (empty($account_id)) {
            return [
                'success' => false,
                'message' => 'Account ID not found. Please authenticate first.',
                'status' => 400
            ];
        }

        // Build the API URI
        $uri = "/accounts/{$account_id}";

        // Call the external API
        $response = $this->api_conector->call(
            $uri,
            'GET',
            '',
            'en'
        );

        return [
            'success' => true,
            'response' => $response
        ];
    }

    /**
     * Get a specific task by task_id
     *
     * @param string $task_id
     * @return array|null
     */
    public function getTask(string $task_id): ?array
    {
        try {
            $data = $this->fetch_account_data();

            if (!$data['success']) {
                return null;
            }

            // Extract response data
	        $tasks = $data['response']->get_data()['data']['attributes']['site']['tasks'];

            // Find the task with matching task_id
            foreach ($tasks as $task) {
                if (isset($task['task_id']) && $task['task_id'] === $task_id) {
                    return $task;
                }
            }

            return null;

        } catch (Exception $e) {
            // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Intentional error logging
            error_log('Error getting task: ' . $e->getMessage());
            return null;
        }
    }
}
