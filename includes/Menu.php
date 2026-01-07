<?php

namespace Flavio;

use Flavio\Render;
use Flavio\CheckToken;

/**
 * Menu class for handling admin menu functionality
 */
class Menu
{

    protected  $render;
    protected  $checkToken;

    /**
     * Constructor
     */
    public function __construct()
    {
        add_action('admin_menu', [$this, 'add_admin_menu']);

        $this->render = new Render();
        $this->checkToken = new CheckToken();
    }

    /**
     * Add admin menu item
     */
    public function add_admin_menu()
    {
        add_menu_page(
            'Flavio',
            'Flavio',
            'manage_options',
            'flavio-page',
            [$this->render, 'render'],
            'dashicons-admin-generic',
            25
        );

        // Hidden menu page for code/token validation
        add_submenu_page(
            null, // Parent slug null = hidden menu
            'Flavio Code',
            'Flavio Code',
            'manage_options',
            'flavio-code-page',
            [$this->checkToken, 'render']
        );

        // Hidden menu page for Goal & Profile
        add_submenu_page(
            null, // Parent slug null = hidden menu
            'Goal & Profile',
            'Goal & Profile',
            'manage_options',
            'flavio-goal-profile',
            [$this->render, 'render'] // Reuses the same React app render
        );
    }
}
