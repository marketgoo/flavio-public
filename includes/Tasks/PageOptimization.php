<?php

declare(strict_types=1);

namespace Flavio\Tasks;

use WP_REST_Request;
use WP_REST_Response;

/**
 * PageOptimization class for page content optimization suggestions
 * 
 * This task type provides AI-powered suggestions for improving page content.
 * Currently uses mock data - will be replaced with real API calls.
 * 
 * Endpoints:
 * - GET  /tasks/page-optimization/{page_id} - Get page info
 * - POST /tasks/page-optimization/topics - Get topic suggestions based on user input
 * - POST /tasks/page-optimization/proposals - Get proposed changes for a topic
 * - POST /tasks/page-optimization/apply - Apply the proposed changes
 */
class PageOptimization
{

  /**
   * Mock topics for demonstration
   */
  private array $mock_topics = [
    'Improve SEO meta tags',
    'Enhance content readability',
    'Add structured data',
    'Optimize headings hierarchy',
    'Improve call-to-action',
  ];

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
    // Get page info
    register_rest_route('flavio/v1', '/tasks/page-optimization/(?P<page_id>\d+)', [
      'methods' => 'GET',
      'callback' => [$this, 'get_page_info'],
      'permission_callback' => [$this, 'check_admin_permissions'],
      'args' => [
        'page_id' => [
          'required' => true,
          'type' => 'integer',
          'description' => 'The page ID to optimize',
        ],
      ],
    ]);

    // Get topic suggestions
    register_rest_route('flavio/v1', '/tasks/page-optimization/topics', [
      'methods' => 'POST',
      'callback' => [$this, 'get_topics'],
      'permission_callback' => [$this, 'check_admin_permissions'],
      'args' => [
        'query' => [
          'required' => false,
          'type' => 'string',
          'description' => 'User query to filter/generate topics',
        ],
        'page_id' => [
          'required' => true,
          'type' => 'integer',
          'description' => 'The page ID to get topics for',
        ],
      ],
    ]);

    // Get proposed changes for a topic
    register_rest_route('flavio/v1', '/tasks/page-optimization/proposals', [
      'methods' => 'POST',
      'callback' => [$this, 'get_proposals'],
      'permission_callback' => [$this, 'check_admin_permissions'],
      'args' => [
        'topic' => [
          'required' => true,
          'type' => 'string',
          'description' => 'The selected topic',
        ],
        'page_id' => [
          'required' => true,
          'type' => 'integer',
          'description' => 'The page ID to get proposals for',
        ],
      ],
    ]);

    // Apply proposed changes
    register_rest_route('flavio/v1', '/tasks/page-optimization/apply', [
      'methods' => 'POST',
      'callback' => [$this, 'apply_changes'],
      'permission_callback' => [$this, 'check_admin_permissions'],
      'args' => [
        'page_id' => [
          'required' => true,
          'type' => 'integer',
          'description' => 'The page ID to apply changes to',
        ],
        'task_id' => [
          'required' => true,
          'type' => 'integer',
          'description' => 'The task ID',
        ],
        'proposals' => [
          'required' => true,
          'type' => 'array',
          'description' => 'The proposals to apply (may be edited by user)',
        ],
      ],
    ]);

    // Quick apply from task card (without viewing details)
    register_rest_route('flavio/v1', '/tasks/page-optimization', [
      'methods' => 'POST',
      'callback' => [$this, 'quick_apply'],
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
   * Get page info for optimization
   *
   * @param WP_REST_Request $request
   * @return WP_REST_Response
   */
  public function get_page_info(WP_REST_Request $request): WP_REST_Response
  {
    $page_id = (int) $request->get_param('page_id');
    $page = get_post($page_id);

    if (!$page) {
      return new WP_REST_Response([
        'success' => false,
        'message' => 'Page not found.'
      ], 404);
    }

    return new WP_REST_Response([
      'success' => true,
      'data' => [
        'id' => $page->ID,
        'title' => $page->post_title,
        'url' => get_permalink($page->ID),
        'type' => $page->post_type,
        'status' => $page->post_status,
      ]
    ], 200);
  }

  /**
   * Get topic suggestions (mock)
   *
   * @param WP_REST_Request $request
   * @return WP_REST_Response
   */
  public function get_topics(WP_REST_Request $request): WP_REST_Response
  {
    $query = $request->get_param('query') ?? '';

    // Simulate API delay
    usleep(500000); // 500ms

    // If user typed something, include it as first suggestion
    $topics = $this->mock_topics;
    if (!empty($query)) {
      array_unshift($topics, $query);
      $topics = array_unique($topics);
    }

    return new WP_REST_Response([
      'success' => true,
      'data' => [
        'topics' => array_slice($topics, 0, 5),
        'message' => 'Here are some topics I can help you with:',
      ]
    ], 200);
  }

  /**
   * Get proposed changes for a topic (mock)
   *
   * @param WP_REST_Request $request
   * @return WP_REST_Response
   */
  public function get_proposals(WP_REST_Request $request): WP_REST_Response
  {
    $topic = $request->get_param('topic');
    $page_id = (int) $request->get_param('page_id');

    // Simulate API delay
    usleep(800000); // 800ms

    // Get page info for context
    $page = get_post($page_id);
    $page_title = $page ? $page->post_title : 'Your Page';

    // Mock proposals based on topic
    $proposals = $this->generate_mock_proposals($topic, $page_title);

    return new WP_REST_Response([
      'success' => true,
      'data' => [
        'proposals' => $proposals,
        'message' => "Great choice! Here are my suggestions for \"{$topic}\":",
      ]
    ], 200);
  }

  /**
   * Generate mock proposals based on topic
   *
   * @param string $topic
   * @param string $page_title
   * @return array
   */
  private function generate_mock_proposals(string $topic, string $page_title): array
  {
    return [
      [
        'id' => 'page_title',
        'title' => "📣 I've refined the page title",
        'type' => 'text',
        'label' => 'Title',
        'proposed' => "Caring for Handmade Jewelry: What You Need to Know",
      ],
      [
        'id' => 'content',
        'title' => "🖊️ Here's an updated version of your content",
        'type' => 'textarea',
        'label' => 'Content',
        'proposed' => "How to Care for Handmade Jewelry: Easy Tips to Keep Every Piece Beautiful\n\nHandmade jewelry is special — each piece is crafted with care and attention to detail. Taking a few simple steps to maintain it can keep it looking beautiful for years. Here's how you can care for your favorite jewelry without hassle.\n\n1. Handle Your Jewelry Gently\n\nTreat your pieces with care. Avoid pulling, bending, or wearing them during activities that could cause scratches or breakage. Take off rings, bracelets, or necklaces before exercising, cleaning, or swimming.\n\n2. Keep Jewelry Clean\n\nDirt, oils, and sweat can dull the shine of your jewelry. Clean your pieces regularly using a soft cloth. For metal or gemstones, use mild soap and warm water if needed, then dry thoroughly. Avoid harsh chemicals that could damage delicate materials.\n\n3. Store Jewelry Properly\n\nProper storage prevents tangling, scratches, and tarnishing. Use a soft pouch, separate compartments in a jewelry box, or individual boxes for each piece. Keep pieces away from direct sunlight, heat, and humidity.",
      ],
      [
        'id' => 'meta',
        'title' => "📂 Here's how your page will appear in search results",
        'type' => 'meta',
        'metaTitle' => "Caring for Handmade Jewelry: What You Need to Know",
        'metaDescription' => "Discover the best ways to clean, store, and protect handmade jewelry. Easy steps to keep every piece looking beautiful and lasting longer.",
      ],
      [
        'id' => 'tags_categories',
        'title' => "⚡ These tags and categories improve content grouping",
        'type' => 'tags',
        'tags' => ['handmade', 'jewelry care', 'DIY'],
        'categories' => ['Fashion', 'Accessories', 'Lifestyle'],
        'availableCategories' => [
          'Fashion',
          'Accessories',
          'Lifestyle',
          'Gifts',
          'Handmade',
          'Jewelry',
          'Tutorials',
          'Materials'
        ],
      ],
      [
        'id' => 'structured_data',
        'title' => "🧩 I've added extra page details for search engines",
        'type' => 'info',
        'description' => "I've added structured data to your page to help search engines better understand its content and context. This improves how your page is indexed and can enhance its appearance in search results.",
      ],
    ];
  }

  /**
   * Apply proposed changes (mock - just returns success)
   *
   * @param WP_REST_Request $request
   * @return WP_REST_Response
   */
  public function apply_changes(WP_REST_Request $request): WP_REST_Response
  {
    $page_id = (int) $request->get_param('page_id');
    $task_id = (int) $request->get_param('task_id');
    $proposals = $request->get_param('proposals');

    // Simulate API delay
    usleep(1000000); // 1s

    // In a real implementation, we would:
    // 1. Update the page content with the proposals
    // 2. Mark the task as completed in the backend
    // 3. Return the updated page info

    return new WP_REST_Response([
      'success' => true,
      'message' => 'Changes applied successfully!',
      'data' => [
        'page_id' => $page_id,
        'task_id' => $task_id,
        'changes_applied' => count($proposals),
      ]
    ], 200);
  }

  /**
   * Quick apply from task card (applies default optimizations)
   *
   * @param WP_REST_Request $request
   * @return WP_REST_Response
   */
  public function quick_apply(WP_REST_Request $request): WP_REST_Response
  {
    // Simulate API delay
    usleep(1000000); // 1s

    return new WP_REST_Response([
      'success' => true,
      'message' => 'Page optimization applied successfully!',
    ], 200);
  }
}
