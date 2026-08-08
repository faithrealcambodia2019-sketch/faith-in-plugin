<?php
/**
 * Social MVP shortcodes and assets.
 *
 * @package CuratedVault
 */

if (!defined('ABSPATH')) {
    exit;
}

class CV_Social_Shortcodes {
    public function __construct() {
        add_shortcode('curated_vault_social', array($this, 'render_social_app'));
    }

    public function render_social_app() {
        $this->enqueue_assets();
        ob_start();
        include CURATED_VAULT_PLUGIN_DIR . 'templates/social-mvp.php';
        return ob_get_clean();
    }

    private function enqueue_assets() {
        wp_enqueue_style('curated-vault-social-mvp', CURATED_VAULT_PLUGIN_URL . 'assets/css/social-mvp.css', array(), CURATED_VAULT_VERSION);
        wp_enqueue_script('curated-vault-social-mvp', CURATED_VAULT_PLUGIN_URL . 'assets/js/social-mvp.js', array(), CURATED_VAULT_VERSION, true);

        $current_social_id = 0;
        if (function_exists('curated_vault_get_google_app_session')) {
            $session = curated_vault_get_google_app_session();
            if (is_array($session) && !empty($session['id'])) {
                $current_social_id = absint($session['id']);
            }
        }
        if (!$current_social_id && is_user_logged_in()) {
            $current_social_id = get_current_user_id();
        }

        wp_localize_script('curated-vault-social-mvp', 'cvSocialMvp', array(
            'root' => esc_url_raw(rest_url('curated-vault/v1')),
            'nonce' => wp_create_nonce('wp_rest'),
            'isLoggedIn' => $current_social_id > 0,
            'currentUser' => $current_social_id ? CV_Social_DB::user_payload($current_social_id) : null,
            'loginUrl' => esc_url_raw(wp_login_url(get_permalink())),
        ));
    }
}
