<?php
if (!defined('ABSPATH')) { exit; }
/**
 * Main Curated Vault Class
 */

class Curated_Vault {

    public function __construct() {
        $this->load_dependencies();
        $this->define_admin_hooks();
        $this->define_public_hooks();
    }

    private function load_dependencies() {
        if (!class_exists('CV_Database')) {
            if (!class_exists('CV_Database')) { require_once CURATED_VAULT_PLUGIN_DIR . 'includes/class-cv-database.php'; }
        }
        if (!class_exists('CV_Bible_Service')) {
            if (!class_exists('CV_Bible_Service')) { require_once CURATED_VAULT_PLUGIN_DIR . 'includes/services/class-cv-bible-service.php'; }
        }
        if (!class_exists('CV_API')) {
            if (!class_exists('CV_API')) { require_once CURATED_VAULT_PLUGIN_DIR . 'includes/class-cv-api.php'; }
        }

        if (class_exists('CV_API')) {
            new CV_API();
        }
    }

    private function define_admin_hooks() {
        add_action('admin_init', 'curated_vault_register_settings');
        add_action('admin_menu', 'curated_vault_add_admin_menu');
    }

    private function define_public_hooks() {
        add_action('init', 'curated_vault_handle_magic_link_login');
        if (class_exists('CV_Bible_Service')) {
            add_action('rest_api_init', array('CV_Bible_Service', 'register_rest_routes'));
        }
        add_action('wp_enqueue_scripts', 'curated_vault_enqueue_scripts');
        add_shortcode('curated_vault', 'curated_vault_shortcode');
    }

    public function run() {
        // Plugin initialization is complete when this class is instantiated.
    }
}