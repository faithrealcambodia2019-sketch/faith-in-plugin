<?php
if (!defined('ABSPATH')) { exit; }
/**
 * API handling class
 */

class CV_API {


private function can_view_user_email($user_id = 0) {
    $user_id = absint($user_id);
    if (current_user_can('manage_options')) { return true; }
    $current_user_id = $this->get_effective_author_id();
    return $user_id > 0 && $current_user_id > 0 && absint($current_user_id) === $user_id;
}

private function protected_user_email($user_id, $email) {
    return $this->can_view_user_email($user_id) ? sanitize_email($email) : '';
}

private function get_pagination_args($default_limit = 50, $max_limit = 100) {
    $default_limit = max(1, absint($default_limit));
    $max_limit = max($default_limit, absint($max_limit));
    $limit = isset($_REQUEST['limit']) ? absint(wp_unslash($_REQUEST['limit'])) : $default_limit;
    $page = isset($_REQUEST['page']) ? absint(wp_unslash($_REQUEST['page'])) : 1;
    $limit = max(1, min($max_limit, $limit));
    $page = max(1, $page);
    return array(
        'limit' => $limit,
        'page' => $page,
        'offset' => ($page - 1) * $limit,
    );
}


private function publishing_auth_mode() {
    if (!function_exists('curated_vault_get_settings')) {
        return 'open';
    }
    $settings = curated_vault_get_settings();
    $mode = $settings['auth_mode'] ?? 'open';
    if ($mode === 'open') { return 'open'; }
    return 'google';
}

private function require_publish_auth_if_needed() {
    $mode = $this->publishing_auth_mode();
    if ($mode !== 'open' && !is_user_logged_in() && !(function_exists('curated_vault_is_app_logged_in') && curated_vault_is_app_logged_in())) {
        wp_send_json_error('Please sign in before publishing.');
        return false;
    }
    return true;
}

private function get_effective_author_id() {
    if (function_exists('curated_vault_get_google_app_session')) {
        $session = curated_vault_get_google_app_session();
        if (is_array($session) && !empty($session['id'])) { return absint($session['id']); }
    }
    return is_user_logged_in() ? get_current_user_id() : 0;
}


private function post_visibility_column_exists($table) {
    global $wpdb;
    return (bool) $wpdb->get_var($wpdb->prepare("SHOW COLUMNS FROM $table LIKE %s", 'post_visibility'));
}

private function normalize_post_visibility($value) {
    $visibility = sanitize_key((string) $value);
    return $visibility === 'private' ? 'private' : 'public';
}


private function is_effective_logged_in() {
    return $this->get_effective_author_id() > 0;
}

private function get_effective_user_payload() {
    if (function_exists('curated_vault_get_google_app_session')) {
        $session = curated_vault_get_google_app_session();
        if (is_array($session) && !empty($session['id'])) { return $session; }
    }
    if (function_exists('curated_vault_get_current_user_payload')) {
        $payload = curated_vault_get_current_user_payload(96);
        if (is_array($payload)) { return $payload; }
    }
    return null;
}

private function get_effective_display_name() {
    $payload = $this->get_effective_user_payload();
    if (is_array($payload) && !empty($payload['name'])) { return sanitize_text_field($payload['name']); }
    if (is_user_logged_in()) { $user = wp_get_current_user(); return sanitize_text_field($user->display_name); }
    return '';
}

private function verify_ajax_request() {
    // BACKWARDS-COMPATIBLE SHIM (v5.5.190):
    // Older callers used this single helper for both reads and writes.
    // Default behaviour now matches a *write* request: nonce is required
    // and session-cookie-only auth is NOT accepted. Read-only AJAX actions
    // explicitly allowed in $public_read_actions still pass through.
    return $this->verify_ajax_write();
}

/**
 * Public read-only AJAX actions. Listed once so the read/write helpers
 * stay in sync. Anything not in this list must use verify_ajax_write().
 */
private function get_public_read_actions() {
    return array(
        'cv_google_sign_in',
        'cv_firebase_sign_in',
        'cv_get_session',
        'cv_get_posts',
        'cv_get_resources',
        'cv_get_jobs',
        'cv_get_prayers',
        'cv_get_suggested_users',
        'cv_find_users',
        'cv_social_get_followers',
        'cv_social_get_following',
        'cv_social_follow_status',
        'cv_bible_get_verses',
        'cv_bible_dictionary',
        'cv_bible_get_quotes',
        'cv_bible_get_media',
        'cv_bible_search',
    );
}

/**
 * Lenient check for read-only public AJAX actions. A valid nonce is
 * still preferred but anonymous reads are allowed without it.
 */
private function verify_ajax_read() {
    $action = isset($_REQUEST['action']) ? sanitize_key(wp_unslash($_REQUEST['action'])) : '';
    if (in_array($action, $this->get_public_read_actions(), true)) {
        return true;
    }
    // Non-read actions must use the write path.
    return $this->verify_ajax_write();
}

/**
 * STRICT check for write AJAX actions. Requires a valid cv_nonce.
 * Having a session cookie is NOT enough on its own — that was the
 * cookie-bypass CSRF surface this fixes.
 *
 * Sign-in entry points (google/firebase) and the no-op session probe
 * are exempted because the page that hosts them may have served from
 * a cache before a nonce was even issued; their bodies do their own
 * token verification on top.
 */
private function verify_ajax_write() {
    $action = isset($_REQUEST['action']) ? sanitize_key(wp_unslash($_REQUEST['action'])) : '';

    // Sign-in entry points: must still work without a nonce because
    // they're how a user *becomes* a session. They verify the Google /
    // Firebase ID token server-side, so this isn't a free pass.
    $bootstrap_actions = array('cv_google_sign_in', 'cv_firebase_sign_in', 'cv_get_session');
    if (in_array($action, $bootstrap_actions, true)) {
        return true;
    }

    // Read-only actions still pass through here for safety: if a
    // write handler is wrongly registered as a read, it still gets
    // rate-limited / nonce-checked downstream.
    if (in_array($action, $this->get_public_read_actions(), true)) {
        return true;
    }

    $nonce = isset($_REQUEST['nonce']) ? sanitize_text_field(wp_unslash($_REQUEST['nonce'])) : '';
    if ($nonce !== '' && wp_verify_nonce($nonce, 'cv_nonce')) {
        return true;
    }

    // Session presence alone is NOT acceptable for writes anymore.
    wp_send_json_error(array(
        'message' => 'Security check failed. Please refresh the page and try again.',
        'code'    => 'cv_nonce_invalid',
    ), 403);
    return false;
}

/**
 * True if the current effective user has admin/moderator privileges
 * over user-generated content. Used to permit cross-author edits.
 */
private function effective_user_can_moderate() {
    if (current_user_can('manage_options')) { return true; }
    if (current_user_can('edit_others_posts')) { return true; }
    return false;
}



private function get_rate_limit_identity() {
    $user_id = $this->get_effective_author_id();
    if ($user_id > 0) {
        return 'user_' . absint($user_id);
    }
    $ip = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : 'unknown';
    return 'ip_' . hash('sha256', $ip);
}

private function rate_limit_request($bucket, $limit = 20, $window = 300) {
    $bucket = sanitize_key((string) $bucket);
    $limit = max(1, absint($limit));
    $window = max(60, absint($window));
    $identity = $this->get_rate_limit_identity();
    $key = 'cv_rl_' . md5($bucket . '|' . $identity);
    $count = (int) get_transient($key);
    if ($count >= $limit) {
        wp_send_json_error(array('message' => 'Too many requests. Please wait a few minutes and try again.'), 429);
        return false;
    }
    set_transient($key, $count + 1, $window);
    return true;
}

private function require_effective_login($message = 'Please sign in first.') {
    if (!$this->is_effective_logged_in()) {
        wp_send_json_error($message);
        return false;
    }
    return true;
}

private static function max_upload_bytes() {
    $max = defined('CURATED_VAULT_MAX_UPLOAD_BYTES') ? (int) CURATED_VAULT_MAX_UPLOAD_BYTES : (25 * 1024 * 1024);
    return (int) apply_filters('curated_vault_max_upload_bytes', max(1024 * 1024, $max));
}

private static function validate_upload_size($file, $label = 'file') {
    $max = self::max_upload_bytes();
    $size = 0;
    if (is_array($file) && isset($file['size'])) {
        $size = is_array($file['size']) ? max(array_map('absint', array_filter((array) $file['size']))) : absint($file['size']);
    }
    if (!$size && is_array($file) && !empty($file['tmp_name']) && !is_array($file['tmp_name']) && file_exists($file['tmp_name'])) {
        $size = filesize($file['tmp_name']);
    }
    if ($size > $max) {
        return new WP_Error('cv_upload_too_large', ucfirst($label) . ' is too large. Maximum size is ' . size_format($max) . '.');
    }
    return true;
}

private function get_follow_counts($user_id) {
    return function_exists('curated_vault_social_counts') ? curated_vault_social_counts($user_id) : array('followers' => 0, 'following' => 0);
}


private function get_follow_user_summaries($ids, $limit = 8) {
    $ids = array_values(array_filter(array_unique(array_map('absint', (array) $ids))));
    if (empty($ids)) { return array(); }
    $ids = array_slice($ids, 0, max(1, intval($limit)));
    $items = array();
    foreach ($ids as $id) {
        $summary = function_exists('curated_vault_social_user_summary') ? curated_vault_social_user_summary($id) : null;
        if ($summary) { $items[] = $summary; }
    }
    return $items;
}

private function update_follow_relationship($target_user_id, $mode = 'follow') {
    if (!$this->is_effective_logged_in()) {
        wp_send_json_error('Please sign in first.');
        return;
    }
    $current_user_id = $this->get_effective_author_id();
    $target_user_id = absint($target_user_id);
    if (!$target_user_id || $target_user_id === $current_user_id || (function_exists('curated_vault_social_entity_exists') && !curated_vault_social_entity_exists($target_user_id))) {
        wp_send_json_error('Invalid user.');
        return;
    }

    $following = function_exists('curated_vault_social_get_ids') ? curated_vault_social_get_ids($current_user_id, 'following') : array();
    $followers = function_exists('curated_vault_social_get_ids') ? curated_vault_social_get_ids($target_user_id, 'followers') : array();

    if ($mode === 'unfollow') {
        $following = array_values(array_diff($following, array($target_user_id)));
        $followers = array_values(array_diff($followers, array($current_user_id)));
    } else {
        if (!in_array($target_user_id, $following, true)) { $following[] = $target_user_id; }
        if (!in_array($current_user_id, $followers, true)) { $followers[] = $current_user_id; }
    }

    if (function_exists('curated_vault_social_set_ids')) {
        curated_vault_social_set_ids($current_user_id, 'following', $following);
        curated_vault_social_set_ids($target_user_id, 'followers', $followers);
    }

    wp_send_json_success(array(
        'message' => $mode === 'unfollow' ? 'Unfollowed successfully.' : 'Following successfully.',
        'user' => function_exists('curated_vault_social_user_summary') ? curated_vault_social_user_summary($target_user_id) : null,
        'is_following' => function_exists('curated_vault_social_is_following') ? curated_vault_social_is_following($current_user_id, $target_user_id) : false,
        'counts' => function_exists('curated_vault_social_counts') ? curated_vault_social_counts($target_user_id) : array('followers' => 0, 'following' => 0),
    ));
}

private function get_profile_resources($user_id, $limit = 6) {
    global $wpdb;
    $table = $wpdb->prefix . 'cv_resources';
    $rows = $wpdb->get_results($wpdb->prepare("SELECT id, title, category, format, image_url, file_url, timestamp, downloads, views FROM $table WHERE author_id = %d ORDER BY timestamp DESC LIMIT %d", $user_id, $limit), ARRAY_A);
    if (!is_array($rows)) {
        return array();
    }
    foreach ($rows as &$row) {
        $row['image_url'] = esc_url_raw($row['image_url'] ?? '');
        $row['file_url'] = esc_url_raw($row['file_url'] ?? '');
        $row['time'] = !empty($row['timestamp']) ? human_time_diff(strtotime($row['timestamp']), current_time('timestamp')) . ' ago' : '';
    }
    return $rows;
}

private function get_profile_articles($user_id, $limit = 6) {
    global $wpdb;
    $table = $wpdb->prefix . 'cv_posts';
    $rows = $wpdb->get_results($wpdb->prepare("SELECT id, title, excerpt, content, cover_image_url, type, likes, comments, timestamp FROM $table WHERE author_id = %d ORDER BY timestamp DESC LIMIT %d", $user_id, $limit), ARRAY_A);
    if (!is_array($rows)) {
        return array();
    }
    $articles = array();
    foreach ($rows as $row) {
        if (($row['type'] ?? '') !== 'article') {
            continue;
        }
        $body = wp_kses_post((string) ($row['content'] ?? ''));
        $excerpt = sanitize_textarea_field($row['excerpt'] ?? '');
        if (empty($excerpt)) {
            $excerpt = wp_trim_words(wp_strip_all_tags($body), 24, '...');
        }
        $articles[] = array(
            'id' => intval($row['id']),
            'title' => sanitize_text_field($row['title'] ?? ''),
            'excerpt' => $excerpt,
            'cover_image_url' => esc_url_raw($row['cover_image_url'] ?? ''),
            'likes' => intval($row['likes'] ?? 0),
            'comments' => intval($row['comments'] ?? 0),
            'time' => !empty($row['timestamp']) ? human_time_diff(strtotime($row['timestamp']), current_time('timestamp')) . ' ago' : '',
        );
    }
    return $articles;
}

private function get_user_settings_payload($user_id) {
    $saved = get_user_meta($user_id, 'cv_account_settings', true);
    $saved = is_array($saved) ? $saved : array();
    return wp_parse_args($saved, array(
        'theme' => 'light',
        'lang' => 'English',
        'notifications' => true,
    ));
}

private function get_user_profile_payload($user) {
    if (!$user) {
        return array('logged_in' => false);
    }
    $followers = get_user_meta($user->ID, 'cv_followers', true);
    $following = get_user_meta($user->ID, 'cv_following', true);
    $followers = is_array($followers) ? array_values(array_filter(array_map('absint', $followers))) : array();
    $following = is_array($following) ? array_values(array_filter(array_map('absint', $following))) : array();
    $counts = array(
        'followers' => count($followers),
        'following' => count($following),
    );
    $articles = $this->get_profile_articles($user->ID, 12);
    $resources = $this->get_profile_resources($user->ID, 12);
    return array(
        'logged_in' => true,
        'name' => $user->display_name,
        'email' => sanitize_email($user->user_email),
        'avatar_url' => function_exists('curated_vault_get_user_avatar_url') ? curated_vault_get_user_avatar_url($user->ID, 96) : get_avatar_url($user->ID, array('size' => 96)),
        'cover_url' => esc_url_raw((string) get_user_meta($user->ID, 'cv_profile_cover_image', true)),
        'cover_drive_url' => esc_url_raw((string) get_user_meta($user->ID, 'cv_profile_cover_drive_url', true)),
        'username' => $user->user_login,
        'gender' => (string) get_user_meta($user->ID, 'cv_gender', true),
        'role' => (string) get_user_meta($user->ID, 'cv_role', true),
        'location' => (string) get_user_meta($user->ID, 'cv_location', true),
        'industry' => (string) get_user_meta($user->ID, 'cv_industry', true),
        'church' => (string) get_user_meta($user->ID, 'cv_church', true),
        'ministry' => (string) get_user_meta($user->ID, 'cv_ministry', true),
        'bio' => (string) get_user_meta($user->ID, 'description', true),
        'joined' => !empty($user->user_registered) ? mysql2date('j-M-Y', $user->user_registered) : '',
        'verification' => function_exists('curated_vault_get_user_verification_payload') ? curated_vault_get_user_verification_payload($user) : array('show' => false, 'type' => 'none', 'label' => ''),
        'followers_count' => intval($counts['followers']),
        'following_count' => intval($counts['following']),
        'followers' => $this->get_follow_user_summaries($followers, 12),
        'following' => $this->get_follow_user_summaries($following, 12),
        'articles' => $articles,
        'resources' => $resources,
        'settings' => $this->get_user_settings_payload($user->ID),
    );
}

    public function __construct() {

        add_filter('upload_mimes', array($this, 'allow_cv_frontend_media_mimes'));
        add_filter('mime_types', array($this, 'allow_cv_frontend_media_mimes'));
        add_filter('wp_check_filetype_and_ext', array($this, 'fix_cv_frontend_media_filetype'), 10, 5);

        add_action('wp_ajax_cv_social_follow_user', array($this, 'social_follow_user'));
        add_action('wp_ajax_nopriv_cv_social_follow_user', array($this, 'social_follow_user'));
        add_action('wp_ajax_cv_social_unfollow_user', array($this, 'social_unfollow_user'));
        add_action('wp_ajax_nopriv_cv_social_unfollow_user', array($this, 'social_unfollow_user'));
        add_action('wp_ajax_cv_social_get_followers', array($this, 'social_get_followers'));
        add_action('wp_ajax_nopriv_cv_social_get_followers', array($this, 'social_get_followers'));
        add_action('wp_ajax_cv_social_get_following', array($this, 'social_get_following'));
        add_action('wp_ajax_nopriv_cv_social_get_following', array($this, 'social_get_following'));
        add_action('wp_ajax_cv_social_follow_status', array($this, 'social_follow_status'));
        add_action('wp_ajax_nopriv_cv_social_follow_status', array($this, 'social_follow_status'));
        add_action('wp_ajax_cv_get_suggested_users', array($this, 'get_suggested_users'));
        add_action('wp_ajax_nopriv_cv_get_suggested_users', array($this, 'get_suggested_users'));
        add_action('wp_ajax_cv_find_users', array($this, 'find_users'));
        add_action('wp_ajax_nopriv_cv_find_users', array($this, 'find_users'));

        add_action('wp_ajax_cv_get_resources', array($this, 'get_resources'));
        add_action('wp_ajax_nopriv_cv_get_resources', array($this, 'get_resources'));
        add_action('wp_ajax_cv_upload_resource', array($this, 'upload_resource'));
        add_action('wp_ajax_nopriv_cv_upload_resource', array($this, 'upload_resource'));
        add_action('wp_ajax_cv_get_posts', array($this, 'get_posts'));
        add_action('wp_ajax_nopriv_cv_get_posts', array($this, 'get_posts'));
        add_action('wp_ajax_cv_create_post', array($this, 'create_post'));
        add_action('wp_ajax_nopriv_cv_create_post', array($this, 'create_post'));
        add_action('wp_ajax_cv_stage_post_media', array($this, 'stage_post_media'));
        add_action('wp_ajax_nopriv_cv_stage_post_media', array($this, 'stage_post_media'));
        add_action('wp_ajax_cv_update_post', array($this, 'update_post'));
        add_action('wp_ajax_nopriv_cv_update_post', array($this, 'update_post'));
        add_action('wp_ajax_cv_delete_post', array($this, 'delete_post'));
        add_action('wp_ajax_nopriv_cv_delete_post', array($this, 'delete_post'));
        add_action('wp_ajax_cv_get_jobs', array($this, 'get_jobs'));
        add_action('wp_ajax_nopriv_cv_get_jobs', array($this, 'get_jobs'));
        add_action('wp_ajax_cv_create_job', array($this, 'create_job'));
        add_action('wp_ajax_nopriv_cv_create_job', array($this, 'create_job'));
        add_action('wp_ajax_cv_update_job', array($this, 'update_job'));
        add_action('wp_ajax_nopriv_cv_update_job', array($this, 'update_job'));
        add_action('wp_ajax_cv_delete_job', array($this, 'delete_job'));
        add_action('wp_ajax_nopriv_cv_delete_job', array($this, 'delete_job'));
        add_action('wp_ajax_cv_get_prayers', array($this, 'get_prayers'));
        add_action('wp_ajax_nopriv_cv_get_prayers', array($this, 'get_prayers'));
        add_action('wp_ajax_cv_create_prayer', array($this, 'create_prayer'));
        add_action('wp_ajax_nopriv_cv_create_prayer', array($this, 'create_prayer'));
        add_action('wp_ajax_cv_update_prayer', array($this, 'update_prayer'));
        add_action('wp_ajax_nopriv_cv_update_prayer', array($this, 'update_prayer'));
        add_action('wp_ajax_cv_delete_prayer', array($this, 'delete_prayer'));
        add_action('wp_ajax_nopriv_cv_delete_prayer', array($this, 'delete_prayer'));
        add_action('wp_ajax_cv_like_post', array($this, 'like_post'));
        add_action('wp_ajax_nopriv_cv_like_post', array($this, 'like_post'));
        add_action('wp_ajax_cv_create_post_comment', array($this, 'create_post_comment'));
        add_action('wp_ajax_nopriv_cv_create_post_comment', array($this, 'create_post_comment'));
        add_action('wp_ajax_cv_repost_post', array($this, 'repost_post'));
        add_action('wp_ajax_nopriv_cv_repost_post', array($this, 'repost_post'));
        add_action('wp_ajax_cv_share_post', array($this, 'share_post'));
        add_action('wp_ajax_nopriv_cv_share_post', array($this, 'share_post'));
        add_action('wp_ajax_cv_download_resource', array($this, 'download_resource'));
        add_action('wp_ajax_nopriv_cv_download_resource', array($this, 'download_resource'));
        add_action('wp_ajax_cv_toggle_bookmark', array($this, 'toggle_bookmark'));
        add_action('wp_ajax_nopriv_cv_toggle_bookmark', array($this, 'toggle_bookmark'));
        add_action('wp_ajax_cv_delete_resource', array($this, 'delete_resource'));
        add_action('wp_ajax_nopriv_cv_delete_resource', array($this, 'delete_resource'));
        add_action('wp_ajax_nopriv_cv_request_magic_link', array($this, 'request_magic_link'));
        add_action('wp_ajax_cv_request_magic_link', array($this, 'request_magic_link'));
        add_action('wp_ajax_nopriv_cv_google_sign_in', array($this, 'google_sign_in'));
        add_action('wp_ajax_cv_google_sign_in', array($this, 'google_sign_in'));
        add_action('wp_ajax_nopriv_cv_firebase_sign_in', array($this, 'firebase_sign_in'));
        add_action('wp_ajax_cv_firebase_sign_in', array($this, 'firebase_sign_in'));
        add_action('wp_ajax_nopriv_cv_phone_sign_up', array($this, 'phone_sign_up'));
        add_action('wp_ajax_cv_phone_sign_up', array($this, 'phone_sign_up'));
        add_action('wp_ajax_cv_get_session', array($this, 'get_session'));
        add_action('wp_ajax_nopriv_cv_get_session', array($this, 'get_session'));
        add_action('wp_ajax_cv_update_profile', array($this, 'update_profile'));
        add_action('wp_ajax_nopriv_cv_update_profile', array($this, 'update_profile'));
        add_action('wp_ajax_cv_follow_user', array($this, 'follow_user'));
        add_action('wp_ajax_nopriv_cv_follow_user', array($this, 'follow_user'));
        add_action('wp_ajax_cv_unfollow_user', array($this, 'unfollow_user'));
        add_action('wp_ajax_nopriv_cv_unfollow_user', array($this, 'unfollow_user'));
        add_action('wp_ajax_cv_logout', array($this, 'logout'));
        add_action('wp_ajax_nopriv_cv_logout', array($this, 'logout'));
        add_action('wp_ajax_cv_update_user_settings', array($this, 'update_user_settings'));
        add_action('wp_ajax_nopriv_cv_update_user_settings', array($this, 'update_user_settings'));
        add_action('wp_ajax_cv_get_verification_status', array($this, 'get_verification_status'));
        add_action('wp_ajax_nopriv_cv_get_verification_status', array($this, 'get_verification_status'));
        add_action('wp_ajax_cv_request_verification', array($this, 'request_verification'));
        add_action('wp_ajax_nopriv_cv_request_verification', array($this, 'request_verification'));
        add_action('wp_ajax_cv_bible_get_verses', array($this, 'bible_get_verses'));
        add_action('wp_ajax_nopriv_cv_bible_get_verses', array($this, 'bible_get_verses'));
        add_action('wp_ajax_cv_bible_dictionary', array($this, 'bible_dictionary'));
        add_action('wp_ajax_nopriv_cv_bible_dictionary', array($this, 'bible_dictionary'));
        add_action('wp_ajax_cv_bible_get_quotes', array($this, 'bible_get_quotes'));
        add_action('wp_ajax_nopriv_cv_bible_get_quotes', array($this, 'bible_get_quotes'));
        add_action('wp_ajax_cv_bible_get_media', array($this, 'bible_get_media'));
        add_action('wp_ajax_nopriv_cv_bible_get_media', array($this, 'bible_get_media'));
        add_action('wp_ajax_cv_bible_search', array($this, 'bible_search'));
        add_action('wp_ajax_nopriv_cv_bible_search', array($this, 'bible_search'));
        add_action('wp_ajax_cv_bible_get_notes', array($this, 'bible_get_notes'));
        add_action('wp_ajax_cv_bible_save_typing_score', array($this, 'bible_save_typing_score'));
        add_action('wp_ajax_cv_bible_save_notes', array($this, 'bible_save_notes'));
        add_action('wp_ajax_cv_bible_save_stats', array($this, 'bible_save_stats'));
        add_action('wp_ajax_cv_bible_ai_image', array($this, 'bible_ai_image'));
    }

    public function allow_cv_frontend_media_mimes($mimes) {
        if (!is_array($mimes)) {
            $mimes = array();
        }
        return array_merge($mimes, self::cv_post_media_allowed_mimes());
    }

    public function fix_cv_frontend_media_filetype($data, $file, $filename, $mimes, $real_mime = '') {
        $ext = strtolower((string) pathinfo((string) $filename, PATHINFO_EXTENSION));
        $map = array(
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'jpe' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'heic' => 'image/heic',
            'heif' => 'image/heif',
            'mp4' => 'video/mp4',
            'm4v' => 'video/mp4',
            'mov' => 'video/quicktime',
            'qt' => 'video/quicktime',
            'webm' => 'video/webm',
            'ogv' => 'video/ogg',
        );

        if (isset($map[$ext])) {
            if (empty($data['ext']) || empty($data['type']) || $data['type'] === 'application/octet-stream') {
                $data['ext'] = $ext;
                $data['type'] = $map[$ext];
                $data['proper_filename'] = $filename;
            }
        }

        return $data;
    }


    public function get_suggested_users() {
        $this->verify_ajax_request();

        $current_user_id = $this->get_effective_author_id();
        $limit = max(1, min(32, absint($_POST['limit'] ?? 12)));
        $following = $current_user_id ? get_user_meta($current_user_id, 'cv_following', true) : array();
        $following = is_array($following) ? array_values(array_filter(array_map('absint', $following))) : array();

        $current_role = $current_user_id ? trim((string) get_user_meta($current_user_id, 'cv_role', true)) : '';
        $current_church = $current_user_id ? trim((string) get_user_meta($current_user_id, 'cv_church', true)) : '';
        $current_ministry = $current_user_id ? trim((string) get_user_meta($current_user_id, 'cv_ministry', true)) : '';

        $exclude = array_values(array_filter(array_unique(array_merge(array($current_user_id), $following))));
        $user_query = array(
            'number' => max($limit * 5, 20),
            'orderby' => 'registered',
            'order' => 'DESC',
            'fields' => 'all',
        );
        if (!empty($exclude)) {
            $user_query['exclude'] = $exclude;
        }

        $users = get_users($user_query);
        $items = array();

        foreach ($users as $user) {
            if (!$user || empty($user->ID)) {
                continue;
            }
            $summary = function_exists('curated_vault_social_user_summary') ? curated_vault_social_user_summary($user->ID) : null;
            if (!$summary) {
                continue;
            }
            if (!empty($summary['is_self']) || !empty($summary['is_following'])) {
                continue;
            }

            $role = trim((string) ($summary['role'] ?? ''));
            $church = trim((string) ($summary['church'] ?? ''));
            $ministry = trim((string) ($summary['ministry'] ?? ''));
            $subtitle = $role ?: ($ministry ?: ($church ?: 'Christian creator'));

            $score = 0;
            if (!empty($summary['avatar_url'])) {
                $score += 12;
            }
            if ($current_church !== '' && $church !== '' && strcasecmp($current_church, $church) === 0) {
                $score += 35;
            }
            if ($current_ministry !== '' && $ministry !== '' && strcasecmp($current_ministry, $ministry) === 0) {
                $score += 22;
            }
            if ($current_role !== '' && $role !== '' && strcasecmp($current_role, $role) === 0) {
                $score += 18;
            }

            $registered_ts = !empty($user->user_registered) ? strtotime($user->user_registered) : 0;
            if ($registered_ts > 0) {
                $days_old = max(0, floor((time() - $registered_ts) / DAY_IN_SECONDS));
                $score += max(0, 30 - min(30, (int) $days_old));
            }

            $summary['subtitle'] = $subtitle;
            $summary['role'] = $subtitle;
            $summary['registered_at'] = !empty($user->user_registered) ? mysql2date('c', $user->user_registered) : '';
            $summary['is_new_user'] = ($registered_ts > 0 && ((time() - $registered_ts) <= (30 * DAY_IN_SECONDS)));
            $summary['score'] = $score;
            $items[] = $summary;
        }

        if (function_exists('curated_vault_list_app_profiles') && function_exists('curated_vault_app_profile_summary')) {
            foreach (curated_vault_list_app_profiles(max($limit * 5, 50)) as $profile) {
                $summary = curated_vault_app_profile_summary($profile, $current_user_id);
                if (!$summary || !empty($summary['is_self']) || !empty($summary['is_following'])) { continue; }
                $subtitle = trim((string) ($summary['role'] ?: ($summary['ministry'] ?: ($summary['church'] ?: 'Google member'))));
                $summary['subtitle'] = $subtitle;
                $summary['role'] = $subtitle;
                $registered_ts = !empty($summary['registered_at']) ? strtotime($summary['registered_at']) : time();
                $summary['is_new_user'] = ($registered_ts > 0 && ((time() - $registered_ts) <= (30 * DAY_IN_SECONDS)));
                $summary['score'] = 40 + (!empty($summary['avatar_url']) ? 12 : 0) + max(0, 30 - min(30, (int) floor((time() - $registered_ts) / DAY_IN_SECONDS)));
                $items[] = $summary;
            }
        }

        usort($items, function($a, $b) {            $score_a = isset($a['score']) ? (int) $a['score'] : 0;
            $score_b = isset($b['score']) ? (int) $b['score'] : 0;
            if ($score_a === $score_b) {
                $time_a = !empty($a['registered_at']) ? strtotime($a['registered_at']) : 0;
                $time_b = !empty($b['registered_at']) ? strtotime($b['registered_at']) : 0;
                return $time_b <=> $time_a;
            }
            return $score_b <=> $score_a;
        });

        $items = array_slice($items, 0, $limit);

        wp_send_json_success(array(
            'items' => $items,
            'current_user_id' => $current_user_id,
            'count' => count($items),
            'limit' => $limit,
        ));
    }


    public function find_users() {
        $this->verify_ajax_request();

        $current_user_id = $this->get_effective_author_id();
        $search = sanitize_text_field(wp_unslash($_POST['search'] ?? ''));
        $limit = max(1, min(50, absint($_POST['limit'] ?? 20)));
        $users_by_id = array();

        if ($search !== '') {
            $base_args = array(
                'number' => $limit,
                'fields' => 'all',
            );

            $name_query = new WP_User_Query(array_merge($base_args, array(
                'search' => '*' . $search . '*',
                // SECURITY (v5.5.190): user_email removed from search_columns to
                // prevent email enumeration. Returning email='' alone wasn't
                // enough — a hit confirmed the address existed in the system.
                'search_columns' => array('user_login', 'user_nicename', 'display_name'),
            )));
            foreach ((array) $name_query->get_results() as $user) {
                if ($user && !empty($user->ID)) { $users_by_id[$user->ID] = $user; }
            }

            $meta_query = new WP_User_Query(array_merge($base_args, array(
                'meta_query' => array(
                    'relation' => 'OR',
                    array('key' => 'cv_role', 'value' => $search, 'compare' => 'LIKE'),
                    array('key' => 'cv_church', 'value' => $search, 'compare' => 'LIKE'),
                    array('key' => 'cv_ministry', 'value' => $search, 'compare' => 'LIKE'),
                    array('key' => 'description', 'value' => $search, 'compare' => 'LIKE'),
                ),
            )));
            foreach ((array) $meta_query->get_results() as $user) {
                if ($user && !empty($user->ID)) { $users_by_id[$user->ID] = $user; }
            }
        } else {
            $query = new WP_User_Query(array(
                'number' => $limit,
                'orderby' => 'registered',
                'order' => 'DESC',
                'fields' => 'all',
            ));
            foreach ((array) $query->get_results() as $user) {
                if ($user && !empty($user->ID)) { $users_by_id[$user->ID] = $user; }
            }
        }

        $users = array_slice(array_values($users_by_id), 0, $limit);
        $items = array();

        foreach ($users as $user) {
            if (!$user || empty($user->ID)) { continue; }
            $summary = function_exists('curated_vault_social_user_summary') ? curated_vault_social_user_summary($user->ID) : null;
            if (!$summary) {
                $summary = array(
                    'id' => intval($user->ID),
                    'name' => $user->display_name ?: $user->user_login,
                    'handle' => '@' . sanitize_title($user->display_name ?: $user->user_login),
                    'avatar_url' => function_exists('curated_vault_get_user_avatar_url') ? curated_vault_get_user_avatar_url($user->ID, 80) : get_avatar_url($user->ID, array('size' => 80)),
                    'role' => (string) get_user_meta($user->ID, 'cv_role', true),
                    'location' => (string) get_user_meta($user->ID, 'cv_location', true),
                    'industry' => (string) get_user_meta($user->ID, 'cv_industry', true),
                    'church' => (string) get_user_meta($user->ID, 'cv_church', true),
                    'ministry' => (string) get_user_meta($user->ID, 'cv_ministry', true),
                    'counts' => $this->get_follow_counts($user->ID),
                );
            }
            $summary['email'] = '';
            $summary['joined'] = !empty($user->user_registered) ? mysql2date('j-M-Y', $user->user_registered) : '';
            $summary['registered_at'] = !empty($user->user_registered) ? mysql2date('c', $user->user_registered) : '';
            $summary['bio'] = wp_trim_words(wp_strip_all_tags((string) get_user_meta($user->ID, 'description', true)), 22, '...');
            $summary['is_self'] = $current_user_id && intval($user->ID) === intval($current_user_id);
            $summary['is_following'] = ($current_user_id && function_exists('curated_vault_social_is_following')) ? curated_vault_social_is_following($current_user_id, $user->ID) : false;
            $summary['counts'] = function_exists('curated_vault_social_counts') ? curated_vault_social_counts($user->ID) : $this->get_follow_counts($user->ID);
            $items[] = $summary;
        }

        if (function_exists('curated_vault_list_app_profiles') && function_exists('curated_vault_app_profile_summary')) {
            $needle = strtolower($search);
            foreach (curated_vault_list_app_profiles(200) as $profile) {
                $summary = curated_vault_app_profile_summary($profile, $current_user_id);
                if (!$summary) { continue; }
                if ($needle !== '') {
                    $haystack = strtolower(implode(' ', array(
                        $summary['name'] ?? '', $summary['handle'] ?? '', $summary['username'] ?? '',
                        $summary['role'] ?? '', $summary['church'] ?? '', $summary['ministry'] ?? '', $summary['bio'] ?? ''
                    )));
                    if (strpos($haystack, $needle) === false) { continue; }
                }
                $items[] = $summary;
            }
            usort($items, function($a, $b) {
                $ta = !empty($a['registered_at']) ? strtotime($a['registered_at']) : 0;
                $tb = !empty($b['registered_at']) ? strtotime($b['registered_at']) : 0;
                return $tb <=> $ta;
            });
            $items = array_slice($items, 0, $limit);
        }

        wp_send_json_success(array(
            'items' => $items,            'count' => count($items),
            'search' => $search,
            'current_user_id' => $current_user_id,
        ));
    }

    /**
     * Returns Gutendex / Project Gutenberg books in the same shape as Faith In Library resources.
     * This keeps the existing Library UI untouched while adding API-backed public-domain ebooks.
     */
    private function get_gutendex_resources($search, $category, $limit = 24) {
        $limit = max(1, min(32, absint($limit)));
        $category = sanitize_text_field((string) $category);
        $search = trim(sanitize_text_field((string) $search));

        $category_key = strtolower($category);
        $query_text = $search;
        $topic = '';

        if ($search === '') {
            if ($category_key === 'bible study') {
                $query_text = 'bible';
                $topic = 'bible';
            } elseif ($category_key === 'history') {
                $topic = 'history';
            } elseif ($category_key && $category_key !== 'all') {
                $topic = $category;
            }
        } else {
            if ($category_key === 'bible study') {
                $topic = 'bible';
            } elseif ($category_key === 'history') {
                $topic = 'history';
            } elseif ($category_key && $category_key !== 'all') {
                $topic = $category;
            }
        }

        $cache_key = 'cv_gutendex_' . md5(strtolower($query_text) . '|' . strtolower($topic) . '|' . $category_key . '|' . $limit);
        $cached = get_transient($cache_key);
        if (is_array($cached)) {
            return $cached;
        }

        $args = array('sort' => 'popular');
        if ($query_text !== '') {
            $args['search'] = $query_text;
        }
        if ($topic !== '') {
            $args['topic'] = $topic;
        }

        $url = add_query_arg($args, 'https://gutendex.com/books');

        $response = wp_remote_get($url, array(
            'timeout' => 3,
            'redirection' => 3,
            'headers' => array(
                'Accept' => 'application/json',
                'User-Agent' => 'FaithInLibrary/' . (defined('CURATED_VAULT_VERSION') ? CURATED_VAULT_VERSION : '1.0'),
            ),
        ));

        if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
            return array();
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (!is_array($data) || empty($data['results']) || !is_array($data['results'])) {
            return array();
        }

        $books = array();
        foreach (array_slice($data['results'], 0, $limit) as $book) {
            if (empty($book['id']) || empty($book['title'])) {
                continue;
            }

            $book_id = absint($book['id']);
            if (!$book_id) {
                continue;
            }

            $title = sanitize_text_field((string) $book['title']);

            $authors = array();
            if (!empty($book['authors']) && is_array($book['authors'])) {
                foreach (array_slice($book['authors'], 0, 3) as $author) {
                    if (!empty($author['name'])) {
                        $name = sanitize_text_field((string) $author['name']);
                        if ($name !== '') { $authors[] = $name; }
                    }
                }
            }
            $author_label = !empty($authors) ? implode(', ', $authors) : 'Project Gutenberg';

            $subjects = array();
            if (!empty($book['subjects']) && is_array($book['subjects'])) {
                foreach (array_slice($book['subjects'], 0, 8) as $subject) {
                    $subject = sanitize_text_field((string) $subject);
                    if ($subject !== '') { $subjects[] = $subject; }
                }
            }

            $bookshelves = array();
            if (!empty($book['bookshelves']) && is_array($book['bookshelves'])) {
                foreach (array_slice($book['bookshelves'], 0, 5) as $shelf) {
                    $shelf = sanitize_text_field((string) $shelf);
                    if ($shelf !== '') { $bookshelves[] = $shelf; }
                }
            }

            $formats = (!empty($book['formats']) && is_array($book['formats'])) ? $book['formats'] : array();
            $cover_url = '';
            $read_url = '';
            $download_url = '';

            foreach ($formats as $mime => $format_url) {
                $mime_l = strtolower((string) $mime);
                if ($cover_url === '' && strpos($mime_l, 'image/') === 0 && !empty($format_url)) {
                    $cover_url = esc_url_raw($format_url);
                }
            }

            $read_preferences = array('text/html', 'application/pdf', 'text/plain');
            foreach ($read_preferences as $preferred) {
                foreach ($formats as $mime => $format_url) {
                    $mime_l = strtolower((string) $mime);
                    if ($read_url === '' && strpos($mime_l, $preferred) === 0 && !empty($format_url)) {
                        $read_url = esc_url_raw($format_url);
                    }
                }
                if ($read_url !== '') { break; }
            }

            $download_preferences = array('application/epub+zip', 'application/x-mobipocket-ebook', 'text/plain', 'text/html', 'application/pdf');
            foreach ($download_preferences as $preferred) {
                foreach ($formats as $mime => $format_url) {
                    $mime_l = strtolower((string) $mime);
                    if ($download_url === '' && strpos($mime_l, $preferred) === 0 && !empty($format_url)) {
                        $download_url = esc_url_raw($format_url);
                    }
                }
                if ($download_url !== '') { break; }
            }

            $gutenberg_url = esc_url_raw('https://www.gutenberg.org/ebooks/' . $book_id);
            if ($read_url === '') { $read_url = $gutenberg_url; }
            if ($download_url === '') { $download_url = $read_url; }

            $subject_text = strtolower(implode(' ', $subjects) . ' ' . implode(' ', $bookshelves) . ' ' . $title . ' ' . $query_text . ' ' . $topic);
            $book_category = 'Books';
            if (strpos($subject_text, 'bible') !== false || strpos($subject_text, 'theology') !== false || strpos($subject_text, 'christian') !== false || strpos($subject_text, 'religion') !== false) {
                $book_category = 'Bible Study';
            }
            if ($category_key === 'history' || strpos($subject_text, 'history') !== false) {
                $book_category = 'History';
            }
            if ($category_key && $category_key !== 'all') {
                $book_category = $category;
            }

            $languages = array();
            if (!empty($book['languages']) && is_array($book['languages'])) {
                foreach (array_slice($book['languages'], 0, 3) as $language) {
                    $language = sanitize_text_field((string) $language);
                    if ($language !== '') { $languages[] = strtoupper($language); }
                }
            }

            $download_count = !empty($book['download_count']) ? absint($book['download_count']) : 0;

            $description_parts = array('Free public-domain ebook from Project Gutenberg via Gutendex.');
            if ($author_label !== 'Project Gutenberg') { $description_parts[] = 'Author: ' . $author_label . '.'; }
            if (!empty($subjects)) { $description_parts[] = 'Subject: ' . implode(', ', array_slice($subjects, 0, 3)) . '.'; }
            if (!empty($languages)) { $description_parts[] = 'Language: ' . implode(', ', $languages) . '.'; }
            $description_parts[] = 'Open the book to read or download the available Project Gutenberg format.';

            $books[] = array(
                'id' => 'gutendex:' . $book_id,
                'source' => 'gutendex',
                'api_source' => 'gutendex',
                'external' => true,
                'title' => $title,
                'description' => sanitize_textarea_field(implode(' ', $description_parts)),
                'category' => sanitize_text_field($book_category),
                'format' => 'Ebook / Read',
                'type' => 'book',
                'size' => 'PG #' . $book_id,
                'author' => sanitize_text_field($author_label),
                'author_title' => 'Project Gutenberg',
                'country' => !empty($languages) ? implode(', ', $languages) : 'Global',
                'views' => 0,
                'downloads' => $download_count,
                'download_count' => $download_count,
                'image_url' => $cover_url,
                'cover_image_url' => $cover_url,
                'thumbnail_url' => $cover_url,
                'file_url' => $read_url,
                'url' => $read_url,
                'open_url' => $read_url,
                'download_url' => $download_url,
                'gutenberg_url' => $gutenberg_url,
                'can_delete' => false,
                'verification' => array('show' => false, 'type' => 'none', 'label' => ''),
            );
        }

        set_transient($cache_key, $books, 6 * HOUR_IN_SECONDS);
        return $books;
    }

    public function get_resources() {
        $this->verify_ajax_request();

        global $wpdb;
        $table = $wpdb->prefix . 'cv_resources';

        $search = sanitize_text_field(wp_unslash($_REQUEST['search'] ?? ''));
        $category = sanitize_text_field(wp_unslash($_REQUEST['category'] ?? 'All'));
        $sort = sanitize_text_field(wp_unslash($_REQUEST['sort'] ?? 'Popular'));
        $include_api = sanitize_text_field(wp_unslash($_REQUEST['include_api'] ?? '1'));
        $include_api = !in_array(strtolower($include_api), array('0', 'false', 'no'), true);
        $pagination = $this->get_pagination_args(60, 120);

        $where = array();
        $params = array();

        if (!empty($search)) {
            $where[] = "(title LIKE %s OR description LIKE %s)";
            $params[] = '%' . $wpdb->esc_like($search) . '%';
            $params[] = '%' . $wpdb->esc_like($search) . '%';
        }

        if ($category !== 'All') {
            $where[] = "category = %s";
            $params[] = $category;
        }

        $where_clause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        $order_by = $sort === 'Newest' ? 'timestamp DESC' : 'downloads DESC, views DESC';

        $sql = "SELECT * FROM $table $where_clause ORDER BY $order_by LIMIT %d OFFSET %d";
        $params[] = $pagination['limit'];
        $params[] = $pagination['offset'];
        $query = $wpdb->prepare($sql, $params);
        $resources = $wpdb->get_results($query, ARRAY_A);
        if (!is_array($resources)) { $resources = array(); }

        // Add author info
        foreach ($resources as &$resource) {
            $user = get_userdata($resource['author_id']);
            $resource['author'] = !empty($resource['contributor_name']) ? $resource['contributor_name'] : ($user ? $user->display_name : 'Guest Contributor');
            $resource['role'] = $resource['contributor_role'] ?? '';
            $resource['church'] = $resource['contributor_church'] ?? '';
            $resource['ministry'] = $resource['contributor_ministry'] ?? '';
            $resource['author_avatar'] = function_exists('curated_vault_get_user_avatar_url') ? curated_vault_get_user_avatar_url($resource['author_id'], 40) : get_avatar_url($resource['author_id'], array('size' => 40));
            $resource['verification'] = function_exists('curated_vault_get_user_verification_payload') ? curated_vault_get_user_verification_payload(intval($resource['author_id'])) : array('show' => false, 'type' => 'none', 'label' => '');
            $resource['can_delete'] = $this->get_effective_author_id() == intval($resource['author_id']);
        }
        unset($resource);

        // v5.5.213: Do not block the Library screen while the external Gutendex API loads.
        // The browser now fetches API books in the background after local resources render.
        if ($include_api) {
            $api_limit = !empty($search) ? 32 : 24;
            $api_resources = $this->get_gutendex_resources($search, $category, $api_limit);
            if (!empty($api_resources)) {
                $first_local = array_slice($resources, 0, 2);
                $remaining_local = array_slice($resources, 2);
                $resources = array_merge($first_local, $api_resources, $remaining_local);
            }
        }

        wp_send_json_success($resources);
    }

    public function upload_resource() {
        $this->verify_ajax_request();
        if (!$this->rate_limit_request('upload_resource', 8, HOUR_IN_SECONDS)) { return; }
        if (!$this->require_publish_auth_if_needed()) { return; }

        $title = sanitize_text_field($_POST['title'] ?? '');
        $description = sanitize_textarea_field($_POST['description'] ?? '');
        $category = sanitize_text_field($_POST['category'] ?? '');
        $format = sanitize_text_field($_POST['format'] ?? 'file');
        $contributor_name = sanitize_text_field($_POST['contributor_name'] ?? $_POST['userName'] ?? '');
        $contributor_role = sanitize_text_field($_POST['contributor_role'] ?? $_POST['role'] ?? '');
        $contributor_church = sanitize_text_field($_POST['contributor_church'] ?? $_POST['church'] ?? '');
        $contributor_ministry = sanitize_text_field($_POST['contributor_ministry'] ?? $_POST['ministry'] ?? '');

        if (empty($title)) { wp_send_json_error('Title is required'); return; }
        if (empty($contributor_name)) { wp_send_json_error('Name is required'); return; }
        if (empty($_FILES['file']) || empty($_FILES['file']['name'])) { wp_send_json_error('No file uploaded'); return; }

        $allowed = array_merge(self::cv_post_media_allowed_mimes(), array(
            'pdf' => 'application/pdf',
            'mp3' => 'audio/mpeg',
            'wav' => 'audio/wav',
            'zip' => 'application/zip',
        ));
        $drive_result = self::direct_upload_to_google_drive($_FILES['file'], array(
            'type' => 'resource',
            'userName' => $contributor_name,
            'role' => $contributor_role,
            'church' => $contributor_church,
            'ministry' => $contributor_ministry,
            'title' => $title,
            'category' => $category,
            'format' => $format,
        ), $allowed, 'resource file');
        if (is_wp_error($drive_result)) {
            wp_send_json_error('Media storage upload failed: ' . $drive_result->get_error_message());
            return;
        }

        $file_url = esc_url_raw($drive_result['url']);
        $mime_type = sanitize_mime_type($drive_result['mime']);
        $file_size = sanitize_text_field($drive_result['size']);
        $thumbnail_url = '';

        if (!empty($_FILES['thumbnail']) && !empty($_FILES['thumbnail']['name'])) {
            $thumb_result = self::direct_upload_to_google_drive($_FILES['thumbnail'], array(
                'type' => 'resource_thumbnail',
                'title' => $title,
                'category' => $category,
                'format' => $format,
            ), array(
                'jpg|jpeg|jpe' => 'image/jpeg',
                'png' => 'image/png',
                'gif' => 'image/gif',
                'webp' => 'image/webp',
                'heic' => 'image/heic',
                'heif' => 'image/heif',
            ), 'thumbnail');
            if (is_wp_error($thumb_result)) {
                wp_send_json_error('Media storage thumbnail upload failed: ' . $thumb_result->get_error_message());
                return;
            }
            $thumbnail_url = esc_url_raw($thumb_result['url']);
        }
        if (!$thumbnail_url) {
            $thumbnail_url = self::get_drive_placeholder_thumbnail_url($title, $format, $mime_type);
        }

        global $wpdb;
        $table = $wpdb->prefix . 'cv_resources';
        $author_id = $this->get_effective_author_id();
        $resource_data = array(
            'title' => $title,
            'description' => $description,
            'type' => ucfirst($format) . ' (' . strtoupper($format) . ')',
            'format' => $format,
            'category' => $category,
            'author_id' => $author_id,
            'contributor_name' => $contributor_name,
            'contributor_role' => $contributor_role,
            'contributor_church' => $contributor_church,
            'contributor_ministry' => $contributor_ministry,
            'drive_path' => sanitize_text_field($drive_result['path'] ?? ''),
            'file_url' => $file_url,
            'image_url' => $thumbnail_url,
            'size' => $file_size,
        );
        $wpdb->insert($table, $resource_data);
        $new_resource_id = $wpdb->insert_id;
        $resource_data['id'] = $new_resource_id;
        $resource_data['author'] = $contributor_name ?: 'Guest Contributor';
        $resource_data['role'] = $contributor_role;
        $resource_data['church'] = $contributor_church;
        $resource_data['ministry'] = $contributor_ministry;
        $resource_data['views'] = 0;
        $resource_data['downloads'] = 0;
        $resource_data['likes'] = 0;
        $resource_data['timestamp'] = current_time('mysql');
        $resource_data['author_avatar'] = function_exists('curated_vault_get_user_avatar_url') ? curated_vault_get_user_avatar_url($author_id, 40) : get_avatar_url($author_id, array('size' => 40));
        $resource_data['verification'] = function_exists('curated_vault_get_user_verification_payload') ? curated_vault_get_user_verification_payload($author_id) : array('show' => false, 'type' => 'none', 'label' => '');
        $resource_data['can_delete'] = $this->get_effective_author_id() == intval($author_id);

        wp_send_json_success(array(
            'message' => 'Resource uploaded successfully.',
            'drive_warning' => '',
            'resource' => $resource_data,
        ));
    }

    private static function normalize_google_drive_file_url($url) {
        $url = esc_url_raw((string) $url);
        if (!$url) { return ''; }
        $file_id = '';
        if (preg_match('~/file/d/([^/]+)~', $url, $m)) {
            $file_id = $m[1];
        } elseif (preg_match('~[?&]id=([^&]+)~', $url, $m)) {
            $file_id = $m[1];
        }
        if ($file_id) {
            return esc_url_raw('https://drive.google.com/uc?export=download&id=' . rawurlencode($file_id));
        }
        return $url;
    }

    private static function google_drive_preview_url($url) {
        $url = esc_url_raw((string) $url);
        if (!$url) { return ''; }
        $file_id = '';
        if (preg_match('~/file/d/([^/]+)~', $url, $m)) {
            $file_id = $m[1];
        } elseif (preg_match('~[?&]id=([^&]+)~', $url, $m)) {
            $file_id = $m[1];
        }
        if ($file_id) {
            return esc_url_raw('https://drive.google.com/file/d/' . rawurlencode($file_id) . '/preview');
        }
        return '';
    }

    private static function firebase_storage_base64url($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function firebase_storage_access_token() {
        if (!function_exists('curated_vault_firebase_storage_service_account')) {
            return new WP_Error('cv_firebase_storage_missing_helpers', 'Firebase Storage settings are unavailable.');
        }
        $account = curated_vault_firebase_storage_service_account();
        if (!is_array($account)) {
            return new WP_Error('cv_firebase_storage_service_account_missing', 'Firebase Storage service account JSON is missing. Go to WordPress Admin > Settings > Faith In Media Storage.');
        }
        $client_email = sanitize_text_field($account['client_email'] ?? '');
        $private_key = (string) ($account['private_key'] ?? '');
        $private_key = str_replace('\\n', "\n", $private_key);
        if (!$client_email || !$private_key) {
            return new WP_Error('cv_firebase_storage_service_account_invalid', 'Firebase Storage service account JSON is missing client_email or private_key.');
        }
        $cache_key = 'cv_firebase_storage_token_' . md5($client_email . '|' . ($account['private_key_id'] ?? ''));
        $cached = get_transient($cache_key);
        if (is_string($cached) && $cached !== '') { return $cached; }

        if (!function_exists('openssl_sign')) {
            return new WP_Error('cv_firebase_storage_openssl_missing', 'OpenSSL is required to sign the Firebase Storage service account request.');
        }
        $now = time();
        $header = array('alg' => 'RS256', 'typ' => 'JWT');
        $claims = array(
            'iss' => $client_email,
            'scope' => 'https://www.googleapis.com/auth/devstorage.read_write',
            'aud' => 'https://oauth2.googleapis.com/token',
            'iat' => $now,
            'exp' => $now + 3600,
        );
        $unsigned = self::firebase_storage_base64url(wp_json_encode($header)) . '.' . self::firebase_storage_base64url(wp_json_encode($claims));
        $signature = '';
        $ok = openssl_sign($unsigned, $signature, $private_key, OPENSSL_ALGO_SHA256);
        if (!$ok) {
            return new WP_Error('cv_firebase_storage_jwt_sign_failed', 'Could not sign the Firebase Storage service account request.');
        }
        $jwt = $unsigned . '.' . self::firebase_storage_base64url($signature);
        $response = wp_remote_post('https://oauth2.googleapis.com/token', array(
            'timeout' => 30,
            'headers' => array('Accept' => 'application/json'),
            'body' => array(
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt,
            ),
        ));
        if (is_wp_error($response)) {
            return new WP_Error('cv_firebase_storage_token_http_error', 'Firebase Storage token request failed: ' . $response->get_error_message());
        }
        $code = (int) wp_remote_retrieve_response_code($response);
        $body = (string) wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        if ($code < 200 || $code >= 300 || !is_array($data) || empty($data['access_token'])) {
            $snippet = trim(wp_strip_all_tags($body));
            if (strlen($snippet) > 240) { $snippet = substr($snippet, 0, 240) . '...'; }
            return new WP_Error('cv_firebase_storage_token_invalid', 'Firebase Storage token request failed. HTTP ' . intval($code) . ($snippet ? ' - ' . sanitize_text_field($snippet) : ''));
        }
        $ttl = !empty($data['expires_in']) ? max(300, ((int) $data['expires_in']) - 120) : 3300;
        set_transient($cache_key, sanitize_text_field($data['access_token']), $ttl);
        return sanitize_text_field($data['access_token']);
    }

    private static function firebase_storage_object_url_path($object_name) {
        $parts = explode('/', (string) $object_name);
        $parts = array_map('rawurlencode', $parts);
        return implode('/', $parts);
    }

    private static function upload_file_to_firebase_storage($file_path, $file_name, $mime_type, $extra = array()) {
        if (empty($file_path) || !file_exists($file_path) || !is_readable($file_path)) {
            return new WP_Error('cv_firebase_storage_file_missing', 'Uploaded file could not be read before sending to Firebase Storage.');
        }
        if (!function_exists('curated_vault_firebase_storage_bucket')) {
            return new WP_Error('cv_firebase_storage_not_available', 'Firebase Storage helper functions are missing.');
        }
        $bucket = curated_vault_firebase_storage_bucket();
        if (!$bucket) {
            return new WP_Error('cv_firebase_storage_bucket_missing', 'Firebase Storage bucket is missing.');
        }
        $access_token = self::firebase_storage_access_token();
        if (is_wp_error($access_token)) { return $access_token; }

        $safe_file_name = sanitize_file_name($file_name ?: 'faith-in-file');
        $safe_mime_type = $mime_type ?: 'application/octet-stream';
        $prefix = function_exists('curated_vault_firebase_storage_prefix') ? curated_vault_firebase_storage_prefix() : 'faith-in-uploads';
        $type = sanitize_key((string) ($extra['type'] ?? 'uploads'));
        if (!$type) { $type = 'uploads'; }
        $uuid = function_exists('wp_generate_uuid4') ? wp_generate_uuid4() : md5(uniqid('', true));
        $object_name = trim($prefix, '/') . '/' . $type . '/' . gmdate('Y/m') . '/' . $uuid . '-' . $safe_file_name;
        $download_token = function_exists('wp_generate_uuid4') ? wp_generate_uuid4() : md5(uniqid('', true));
        $contents = file_get_contents($file_path);
        if ($contents === false) {
            return new WP_Error('cv_firebase_storage_read_failed', 'Could not read upload file for Firebase Storage.');
        }

        $upload_url = 'https://storage.googleapis.com/' . rawurlencode($bucket) . '/' . self::firebase_storage_object_url_path($object_name);
        $response = wp_remote_request($upload_url, array(
            'method' => 'PUT',
            'timeout' => 120,
            'headers' => array(
                'Authorization' => 'Bearer ' . $access_token,
                'Content-Type' => $safe_mime_type,
                'Cache-Control' => 'public, max-age=31536000',
                'x-goog-meta-firebaseStorageDownloadTokens' => $download_token,
            ),
            'body' => $contents,
        ));
        if (is_wp_error($response)) {
            return new WP_Error('cv_firebase_storage_http_error', 'Firebase Storage upload failed: ' . $response->get_error_message());
        }
        $code = (int) wp_remote_retrieve_response_code($response);
        $body = (string) wp_remote_retrieve_body($response);
        if ($code < 200 || $code >= 300) {
            $snippet = trim(wp_strip_all_tags($body));
            if (strlen($snippet) > 240) { $snippet = substr($snippet, 0, 240) . '...'; }
            return new WP_Error('cv_firebase_storage_upload_failed', 'Firebase Storage upload failed. HTTP ' . intval($code) . ($snippet ? ' - ' . sanitize_text_field($snippet) : ''));
        }

        $download_url = 'https://firebasestorage.googleapis.com/v0/b/' . rawurlencode($bucket) . '/o/' . rawurlencode($object_name) . '?alt=media&token=' . rawurlencode($download_token);
        return array(
            'url' => esc_url_raw($download_url),
            'name' => sanitize_text_field($safe_file_name),
            'path' => sanitize_text_field('Firebase Storage/' . $object_name),
            'object' => sanitize_text_field($object_name),
        );
    }

    private static function direct_upload_to_google_drive($file, $extra = array(), $allowed_mimes = array(), $label = 'file') {
        if (!is_array($file) || empty($file['tmp_name']) || empty($file['name'])) {
            return new WP_Error('cv_direct_upload_missing', ucfirst($label) . ' is missing.');
        }
        if (!empty($file['error'])) {
            return new WP_Error('cv_direct_upload_error', ucfirst($label) . ' upload error code: ' . intval($file['error']));
        }
        $tmp = (string) $file['tmp_name'];
        if (!is_uploaded_file($tmp) && !file_exists($tmp)) {
            return new WP_Error('cv_direct_upload_tmp_missing', ucfirst($label) . ' temporary file is missing.');
        }
        $size_check = self::validate_upload_size($file, $label);
        if (is_wp_error($size_check)) { return $size_check; }

        $name = sanitize_file_name($file['name']);
        if ($name === '') {
            return new WP_Error('cv_direct_upload_bad_name', ucfirst($label) . ' has an invalid file name.');
        }

        // SECURITY (v5.5.190): block dangerous extensions outright, even
        // before MIME check. Defense in depth: filenames like "evil.php.jpg"
        // get sanitized but if any of these tokens show up anywhere in the
        // extension chain, reject the file. Bracketed list also blocks
        // double-extension and disguised script types.
        $name_lower = strtolower($name);
        $dangerous_pattern = '/\.(php\d?|phtml|phar|pl|py|cgi|asp|aspx|jsp|sh|bash|exe|com|bat|cmd|js|mjs|jsx|ts|html?|htm|svg|svgz|swf|jar|war|hta)(?:$|\.)/i';
        if (preg_match($dangerous_pattern, $name_lower)) {
            return new WP_Error('cv_direct_upload_unsafe_ext', ucfirst($label) . ' type is not supported.');
        }

        $incoming_type = !empty($file['type']) ? sanitize_mime_type($file['type']) : '';
        $checked = wp_check_filetype_and_ext($tmp, $name, $allowed_mimes ?: null);
        $ext = strtolower((string) (!empty($checked['ext']) ? $checked['ext'] : pathinfo($name, PATHINFO_EXTENSION)));
        $mime = sanitize_mime_type(!empty($checked['type']) ? $checked['type'] : '');
        if (!$mime && function_exists('mime_content_type')) {
            $mime = sanitize_mime_type((string) @mime_content_type($tmp));
        }
        if (!$mime) { $mime = $incoming_type ?: 'application/octet-stream'; }
        if (!empty($allowed_mimes)) {
            $allowed_values = array_values($allowed_mimes);
            $ext_allowed = false;
            foreach ($allowed_mimes as $exts => $allowed_mime) {
                $parts = array_map('trim', explode('|', (string) $exts));
                if (in_array($ext, $parts, true)) { $ext_allowed = true; break; }
            }
            $mime_allowed = in_array($mime, $allowed_values, true);
            // HEIC/HEIF can legitimately arrive as application/octet-stream from
            // some browsers; everything else with an octet-stream MIME and no
            // extension match is rejected.
            $heic_fallback = $ext_allowed && in_array($ext, array('heic', 'heif'), true) && in_array($incoming_type, array('image/heic', 'image/heif', 'application/octet-stream', ''), true);
            if ((!$ext_allowed || (!$mime_allowed && !$heic_fallback))) {
                return new WP_Error('cv_direct_upload_bad_type', ucfirst($label) . ' type is not supported.');
            }
            // SECURITY (v5.5.190): tighten the octet-stream fallback further -
            // even when extension is in the allow list, refuse the upload if
            // the detected MIME is octet-stream UNLESS we're in the HEIC path.
            if ($mime === 'application/octet-stream' && !$heic_fallback) {
                return new WP_Error('cv_direct_upload_unknown_type', ucfirst($label) . ' could not be verified as a safe media type.');
            }
        }
        $destination = function_exists('curated_vault_media_storage_destination') ? curated_vault_media_storage_destination() : 'google_drive';
        if ($destination === 'firebase_storage') {
            $drive_result = self::upload_file_to_firebase_storage($tmp, $name, $mime, $extra);
        } else {
            $drive_result = self::upload_file_to_google_drive($tmp, $name, $mime, $extra);
        }
        if (is_wp_error($drive_result)) { return $drive_result; }
        $url = ($destination === 'firebase_storage') ? esc_url_raw($drive_result['url'] ?? '') : self::normalize_google_drive_file_url($drive_result['url'] ?? '');
        if (!$url) { return new WP_Error('cv_direct_upload_no_url', 'Media storage did not return a usable URL.'); }
        return array(
            'id' => 0,
            'url' => esc_url_raw($url),
            'original_url' => esc_url_raw($drive_result['url'] ?? $url),
            'preview_url' => ($destination === 'firebase_storage') ? esc_url_raw($url) : self::google_drive_preview_url($drive_result['url'] ?? $url),
            'path' => sanitize_text_field($drive_result['path'] ?? ''),
            'name' => sanitize_text_field($drive_result['name'] ?? $name),
            'mime' => sanitize_mime_type($mime),
            'size' => !empty($file['size']) ? size_format((int) $file['size']) : (file_exists($tmp) ? size_format(filesize($tmp)) : 'Unknown'),
        );
    }

    private static function upload_file_to_google_drive($file_path, $file_name, $mime_type, $extra = array()) {
        $drive_upload_url = function_exists('curated_vault_google_drive_upload_url') ? curated_vault_google_drive_upload_url() : (defined('CURATED_VAULT_GOOGLE_DRIVE_UPLOAD_URL') ? CURATED_VAULT_GOOGLE_DRIVE_UPLOAD_URL : '');
        if (empty($drive_upload_url)) {
            return new WP_Error('cv_drive_not_configured', 'Google Drive upload URL is not configured. Go to WordPress Admin > Settings > Faith In Media Storage, paste your Apps Script /exec URL, and save.');
        }

        if (empty($file_path) || !file_exists($file_path) || !is_readable($file_path)) {
            return new WP_Error('cv_drive_file_missing', 'Uploaded file could not be read before sending to Google Drive.');
        }

        $safe_file_name = sanitize_file_name($file_name ?: 'curated-vault-file');
        $safe_mime_type = $mime_type ?: 'application/octet-stream';

        /* v5.5.15: Use Apps Script doGet with a temporary WordPress file URL to avoid HTTP 400 POST rejection. */
        $uploads = wp_upload_dir();
        if (!empty($uploads['error'])) {
            return new WP_Error('cv_drive_upload_dir_error', sanitize_text_field($uploads['error']));
        }

        $temp_dir = trailingslashit($uploads['basedir']) . 'cv-drive-temp';
        $temp_url_base = trailingslashit($uploads['baseurl']) . 'cv-drive-temp';
        if (!wp_mkdir_p($temp_dir)) {
            return new WP_Error('cv_drive_temp_dir_failed', 'Could not create temporary Google Drive upload folder.');
        }

        if (!file_exists(trailingslashit($temp_dir) . 'index.html')) {
            @file_put_contents(trailingslashit($temp_dir) . 'index.html', '');
        }

        $ext = strtolower(pathinfo($safe_file_name, PATHINFO_EXTENSION));
        if (!$ext) { $ext = 'bin'; }
        $token = wp_generate_password(40, false, false);
        $temp_name = 'faith-in-' . time() . '-' . $token . '.' . $ext;
        $temp_path = trailingslashit($temp_dir) . $temp_name;
        $source_url = trailingslashit($temp_url_base) . rawurlencode($temp_name);

        if (!@copy($file_path, $temp_path)) {
            return new WP_Error('cv_drive_temp_copy_failed', 'Could not prepare temporary upload file for Google Drive.');
        }
        @chmod($temp_path, 0644);

        $shared_secret = function_exists('curated_vault_google_drive_shared_secret') ? curated_vault_google_drive_shared_secret() : (defined('CURATED_VAULT_GOOGLE_DRIVE_SHARED_SECRET') ? trim((string) CURATED_VAULT_GOOGLE_DRIVE_SHARED_SECRET) : '');
        if (!$shared_secret) {
            @unlink($temp_path);
            return new WP_Error('cv_drive_secret_missing', 'Google Drive shared secret is not configured.');
        }

        $query = array(
            'action' => 'upload',
            'secret' => $shared_secret,
            'sourceUrl' => $source_url,
            'fileName' => $safe_file_name,
            'mimeType' => $safe_mime_type,
            'source' => 'curated-vault',
            't' => time(),
        );
        foreach ((array) $extra as $key => $value) {
            if (is_scalar($value)) {
                $query[$key] = sanitize_text_field((string) $value);
            }
        }

        $args = array(
            'timeout' => 120,
            'redirection' => 5,
            'blocking' => true,
            'sslverify' => true,
            'user-agent' => 'FaithIn/' . (defined('CURATED_VAULT_VERSION') ? CURATED_VAULT_VERSION : '5.5'),
            'headers' => array(
                'Accept' => 'application/json, text/plain, */*',
                'Cache-Control' => 'no-cache',
                'Content-Type' => 'application/json; charset=utf-8',
            ),
            'body' => wp_json_encode($query),
        );

        $response = wp_remote_post($drive_upload_url, $args);
        @unlink($temp_path);

        if (is_wp_error($response)) {
            return new WP_Error('cv_drive_http_error', 'Google Drive upload failed: ' . $response->get_error_message());
        }

        $code = (int) wp_remote_retrieve_response_code($response);
        $body = (string) wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if ($code < 200 || $code >= 300 || !is_array($data)) {
            $snippet = trim(wp_strip_all_tags($body));
            if (strlen($snippet) > 240) { $snippet = substr($snippet, 0, 240) . '...'; }
            return new WP_Error('cv_drive_http_error', 'Google Drive upload failed. Apps Script request did not return valid JSON. HTTP ' . intval($code) . ($snippet ? ' - ' . sanitize_text_field($snippet) : ''));
        }

        if (!empty($data['error'])) {
            return new WP_Error('cv_drive_script_error', sanitize_text_field($data['error']));
        }

        $url = '';
        if (!empty($data['id']) && function_exists('curated_vault_drive_proxy_url')) {
            $url = curated_vault_drive_proxy_url((string) $data['id']);
        }
        if (empty($url)) {
            foreach (array('url', 'fileUrl', 'webViewLink', 'webContentLink', 'downloadUrl') as $key) {
                if (!empty($data[$key])) { $url = (string) $data[$key]; break; }
            }
        }
        if (empty($url)) {
            return new WP_Error('cv_drive_no_url', 'Google Drive did not return a file URL.');
        }

        return array(
            'url' => esc_url_raw($url),
            'name' => sanitize_text_field($data['name'] ?? $data['fileName'] ?? $file_name),
            'path' => sanitize_text_field($data['path'] ?? $data['folderPath'] ?? 'Private Google Drive')
        );
    }

    private static function store_post_media_locally($file, $allowed_mimes = array()) {
        if (empty($file['tmp_name']) || !file_exists($file['tmp_name'])) {
            return new WP_Error('cv_local_missing', 'Local preview file is missing.');
        }
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');

        $local_file = $file;
        $local_file['name'] = sanitize_file_name($local_file['name'] ?? ('faith-in-media-' . time()));
        $overrides = array('test_form' => false);
        if (!empty($allowed_mimes)) { $overrides['mimes'] = $allowed_mimes; }
        $movefile = wp_handle_sideload($local_file, $overrides);
        if (!is_array($movefile) || !empty($movefile['error'])) {
            return new WP_Error('cv_local_upload_failed', sanitize_text_field($movefile['error'] ?? 'Could not save local preview.'));
        }

        $attachment_id = 0;
        $filetype = wp_check_filetype(basename($movefile['file']), null);
        $attachment = array(
            'guid' => esc_url_raw($movefile['url']),
            'post_mime_type' => sanitize_mime_type($filetype['type'] ?? ($movefile['type'] ?? 'application/octet-stream')),
            'post_title' => sanitize_text_field(pathinfo($local_file['name'], PATHINFO_FILENAME)),
            'post_content' => '',
            'post_status' => 'inherit',
        );
        $attachment_id = wp_insert_attachment($attachment, $movefile['file']);
        if (!is_wp_error($attachment_id) && $attachment_id) {
            $metadata = wp_generate_attachment_metadata($attachment_id, $movefile['file']);
            if (!is_wp_error($metadata) && !empty($metadata)) {
                wp_update_attachment_metadata($attachment_id, $metadata);
            }
        }

        return array(
            'id' => is_wp_error($attachment_id) ? 0 : absint($attachment_id),
            'url' => esc_url_raw($movefile['url']),
            'file' => sanitize_text_field($movefile['file']),
            'type' => sanitize_mime_type($movefile['type'] ?? ''),
        );
    }

    private static function get_drive_placeholder_thumbnail_url($title, $format, $mime_type = '') {
        $label = strtoupper(preg_replace('/[^a-zA-Z0-9]+/', ' ', $format ?: 'FILE') ?: 'FILE');
        if (strpos((string) $mime_type, 'video/') === 0) { $label = 'VIDEO'; }
        if (strpos((string) $mime_type, 'image/') === 0) { $label = 'IMAGE'; }
        if ($mime_type === 'application/pdf') { $label = 'PDF'; }
        $safe_title = esc_html(wp_trim_words($title ?: 'Resource', 8, ''));
        $safe_label = esc_html($label);
        $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1067" viewBox="0 0 800 1067">'
            . '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#15202B"/><stop offset="1" stop-color="#1FA88A"/></linearGradient></defs>'
            . '<rect width="800" height="1067" rx="56" fill="url(#g)"/>'
            . '<circle cx="640" cy="180" r="130" fill="#ffffff" opacity="0.10"/>'
            . '<rect x="110" y="210" width="580" height="647" rx="36" fill="#ffffff" opacity="0.13"/>'
            . '<text x="400" y="470" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" font-weight="700" fill="#ffffff">' . $safe_label . '</text>'
            . '<text x="400" y="585" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#ffffff">Faith In</text>'
            . '<foreignObject x="140" y="650" width="520" height="140"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;font-size:34px;font-weight:700;color:white;text-align:center;line-height:1.25;">' . $safe_title . '</div></foreignObject>'
            . '</svg>';
        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }

    private function format_post_comment_row($row) {
        $author_id = absint($row['author_id'] ?? 0);
        $user = $author_id ? get_userdata($author_id) : false;
        $current_user_id = $this->get_effective_author_id();
        $session_payload = $this->get_effective_user_payload();
        $name = $user ? $user->display_name : (($session_payload && absint($session_payload['id'] ?? 0) === $author_id && !empty($session_payload['name'])) ? sanitize_text_field($session_payload['name']) : __('Community Member', 'curated-vault'));
        $author = array(
            'id' => $author_id,
            'name' => sanitize_text_field($name),
            'handle' => '@' . sanitize_title($name ?: 'community-member'),
            'avatar' => function_exists('curated_vault_get_user_avatar_url') ? curated_vault_get_user_avatar_url($author_id, 80) : get_avatar_url($author_id, array('size' => 80)),
            'avatar_url' => function_exists('curated_vault_get_user_avatar_url') ? curated_vault_get_user_avatar_url($author_id, 80) : get_avatar_url($author_id, array('size' => 80)),
            'email' => ($user && $this->can_view_user_email($author_id)) ? sanitize_email($user->user_email) : '',
            'verification' => function_exists('curated_vault_get_user_verification_payload') ? curated_vault_get_user_verification_payload($author_id) : array('show' => false, 'type' => 'none', 'label' => ''),
            'is_self' => $current_user_id && $current_user_id === $author_id,
            'is_following' => $current_user_id ? curated_vault_social_is_following($current_user_id, $author_id) : false,
            'counts' => curated_vault_social_counts($author_id),
        );
        $timestamp_unix = strtotime((string) ($row['timestamp'] ?? ''));
        return array(
            'id' => absint($row['id'] ?? 0),
            'post_id' => absint($row['post_id'] ?? 0),
            'content' => sanitize_textarea_field($row['content'] ?? ''),
            'media_attachment_id' => absint($row['media_attachment_id'] ?? 0),
            'media_url' => esc_url_raw($row['media_url'] ?? ''),
            'media_drive_url' => esc_url_raw($row['media_drive_url'] ?? ''),
            'media_drive_path' => sanitize_text_field($row['media_drive_path'] ?? ''),
            'media_type' => sanitize_key($row['media_type'] ?? 'none'),
            'time' => $timestamp_unix ? human_time_diff($timestamp_unix, current_time('timestamp')) . ' ago' : '',
            'author' => $author,
        );
    }

    private function get_recent_post_comments($post_id, $limit = 3) {
        global $wpdb;
        $table = $wpdb->prefix . 'cv_post_comments';
        $post_id = absint($post_id);
        $limit = max(1, min(10, absint($limit)));
        $exists = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $table));
        if ($exists !== $table) {
            return array();
        }
        $rows = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table WHERE post_id = %d AND status = %s ORDER BY timestamp DESC LIMIT %d", $post_id, 'publish', $limit), ARRAY_A);
        $rows = array_reverse(is_array($rows) ? $rows : array());
        return array_map(array($this, 'format_post_comment_row'), $rows);
    }

    public function get_posts() {
        $this->verify_ajax_request();

        global $wpdb;
        $table = $wpdb->prefix . 'cv_posts';
        $pagination = $this->get_pagination_args(50, 100);
        $current_user_id = $this->get_effective_author_id();
        $has_visibility_column = $this->post_visibility_column_exists($table);
        if ($has_visibility_column) {
            if ($current_user_id > 0) {
                $posts = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table WHERE (post_visibility IS NULL OR post_visibility = '' OR post_visibility = %s OR author_id = %d) ORDER BY timestamp DESC LIMIT %d OFFSET %d", 'public', $current_user_id, $pagination['limit'], $pagination['offset']), ARRAY_A);
            } else {
                $posts = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table WHERE (post_visibility IS NULL OR post_visibility = '' OR post_visibility = %s) ORDER BY timestamp DESC LIMIT %d OFFSET %d", 'public', $pagination['limit'], $pagination['offset']), ARRAY_A);
            }
        } else {
            $posts = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table ORDER BY timestamp DESC LIMIT %d OFFSET %d", $pagination['limit'], $pagination['offset']), ARRAY_A);
        }

        foreach ($posts as &$post) {
            $user = get_userdata($post['author_id']);
            $display_name = !empty($post['contributor_name']) ? $post['contributor_name'] : ($user ? $user->display_name : 'Guest Author');
            $author_id = absint($post['author_id']);
            $post['author'] = array(
                'id' => $author_id,
                'name' => $display_name,
                'handle' => '@' . sanitize_title($display_name ?: ($user ? $user->user_login : 'guest-author')),
                'avatar' => function_exists('curated_vault_get_user_avatar_url') ? curated_vault_get_user_avatar_url($author_id, 80) : get_avatar_url($author_id, array('size' => 80)),
                'avatar_url' => function_exists('curated_vault_get_user_avatar_url') ? curated_vault_get_user_avatar_url($author_id, 80) : get_avatar_url($author_id, array('size' => 80)),
                'country' => !empty($post['contributor_church']) ? $post['contributor_church'] : 'Global',
                'role' => sanitize_text_field($post['contributor_role'] ?? ''),
                'church' => sanitize_text_field($post['contributor_church'] ?? ''),
                'ministry' => sanitize_text_field($post['contributor_ministry'] ?? ''),
                'email' => ($user && $this->can_view_user_email($author_id)) ? sanitize_email($user->user_email) : '',
                'verification' => function_exists('curated_vault_get_user_verification_payload') ? curated_vault_get_user_verification_payload($author_id) : array('show' => false, 'type' => 'none', 'label' => ''),
                'is_self' => $current_user_id && $current_user_id === $author_id,
                'is_following' => $current_user_id ? curated_vault_social_is_following($current_user_id, $author_id) : false,
                'counts' => curated_vault_social_counts($author_id),
            );
            $post_visibility = $this->normalize_post_visibility($post['post_visibility'] ?? 'public');
            $post['post_visibility'] = $post_visibility;
            $post['visibility'] = $post_visibility;
            if (($post['type'] ?? '') === 'blessing') {
                $allowed_blessing_colors = array('blue', 'purple', 'sunrise', 'emerald', 'rose', 'slate');
                $blessing_color = sanitize_key($post['excerpt'] ?? '');
                $post['blessing_bg_color'] = in_array($blessing_color, $allowed_blessing_colors, true) ? $blessing_color : 'blue';
            }
            if (($post['type'] ?? '') === 'article') {
                $post['article_title'] = sanitize_text_field($post['title'] ?? '');
                $post['article_body'] = wp_kses_post((string) ($post['content'] ?? ''));
                $post['article_excerpt'] = sanitize_textarea_field($post['excerpt'] ?? '');
                if (empty($post['article_excerpt'])) {
                    $post['article_excerpt'] = wp_trim_words(wp_strip_all_tags((string) $post['article_body']), 32, '...');
                }
                $post['cover_image_url'] = esc_url_raw($post['cover_image_url'] ?? '');
                $post['reading_time'] = max(1, (int) ceil(str_word_count(wp_strip_all_tags((string) $post['article_body'])) / 220));
            }
            $timestamp_unix = strtotime((string) $post['timestamp']);
            $post['time'] = $timestamp_unix ? human_time_diff($timestamp_unix, current_time('timestamp')) . ' ago' : '';
            $post['published_date'] = $timestamp_unix ? wp_date('M j, Y', $timestamp_unix) : '';
            $post['published_time'] = $timestamp_unix ? wp_date('g:i A', $timestamp_unix) : '';
            $current_reactions = $current_user_id ? get_user_meta($current_user_id, 'cv_post_reactions', true) : array();
            $current_reactions = is_array($current_reactions) ? $current_reactions : array();
            $post['current_user_reaction'] = $current_user_id && !empty($current_reactions[(string) $post['id']]) ? sanitize_key($current_reactions[(string) $post['id']]) : '';
            $post['likes'] = absint($post['likes'] ?? 0);
            $post['comments'] = absint($post['comments'] ?? 0);
            $post['comment_count'] = $post['comments'];
            $post['reposts'] = absint($post['reposts'] ?? 0);
            $post['repost_count'] = $post['reposts'];
            $post['shares'] = absint($post['shares'] ?? 0);
            $post['share_count'] = $post['shares'];
            $post['recent_comments'] = $this->get_recent_post_comments($post['id'], 3);
            $post['cover_media_url'] = esc_url_raw($post['cover_media_url'] ?? '');
            $post['cover_drive_url'] = esc_url_raw($post['cover_drive_url'] ?? '');
            $post['cover_drive_path'] = sanitize_text_field($post['cover_drive_path'] ?? '');
            $media_items = array();
            if (!empty($post['media_json'])) {
                $decoded_media = json_decode((string) $post['media_json'], true);
                if (is_array($decoded_media)) {
                    foreach ($decoded_media as $item) {
                        if (!is_array($item) || empty($item['url'])) { continue; }
                        $media_items[] = array(
                            'url' => esc_url_raw($item['url']),
                            'local_url' => esc_url_raw($item['local_url'] ?? $item['url']),
                            'drive_url' => esc_url_raw($item['drive_url'] ?? ''),
                            'type' => sanitize_key($item['type'] ?? 'image'),
                            'mime' => sanitize_mime_type($item['mime'] ?? ''),
                            'id' => absint($item['id'] ?? 0),
                            'downloadable' => array_key_exists('downloadable', $item) ? (bool) $item['downloadable'] : true,
                            'preview_url' => esc_url_raw($item['preview_url'] ?? ''),
                            'is_blessing_music' => !empty($item['is_blessing_music']),
                            'name' => sanitize_text_field($item['name'] ?? ''),
                            'preset_id' => sanitize_key($item['preset_id'] ?? ''),
                        );
                    }
                }
            }
            if (empty($media_items) && !empty($post['cover_image_url'])) {
                $media_items[] = array('url' => esc_url_raw($post['cover_image_url']), 'type' => 'image', 'mime' => 'image', 'id' => absint($post['cover_media_id'] ?? 0), 'downloadable' => true);
            }
            $post['media_items'] = $media_items;
            $post['media_type'] = sanitize_key($post['media_type'] ?? (count($media_items) > 1 ? 'gallery' : 'image'));
            $post['can_edit'] = $this->get_effective_author_id() === intval($post['author_id']);
            $post['can_delete'] = $post['can_edit'];
        }

        wp_send_json_success($posts);
    }

    private static function cv_post_media_allowed_mimes() {
        return array(
            'jpg|jpeg|jpe' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'heic' => 'image/heic',
            'heif' => 'image/heif',
            'mp4|m4v' => 'video/mp4',
            'mov|qt' => 'video/quicktime',
            'webm' => 'video/webm',
            'ogv' => 'video/ogg',
        );
    }

    private static function cv_blessing_music_allowed_mimes() {
        return array(
            'mp3' => 'audio/mpeg',
            'm4a|m4b' => 'audio/mp4',
            'aac' => 'audio/aac',
            'wav' => 'audio/wav',
            'ogg|oga' => 'audio/ogg',
            'opus' => 'audio/opus',
        );
    }

    private static function cv_blessing_preset_music_library() {
        return array(
            'grace-morning' => array('name' => 'Grace Morning', 'file' => 'grace-morning.mp3'),
            'gentle-hallelujah' => array('name' => 'Gentle Hallelujah', 'file' => 'gentle-hallelujah.mp3'),
            'peaceful-praise' => array('name' => 'Peaceful Praise', 'file' => 'peaceful-praise.mp3'),
            'joyful-light' => array('name' => 'Joyful Light', 'file' => 'joyful-light.mp3'),
            'hope-rising' => array('name' => 'Hope Rising', 'file' => 'hope-rising.mp3'),
            'still-waters' => array('name' => 'Still Waters', 'file' => 'still-waters.mp3'),
            'faithful-heart' => array('name' => 'Faithful Heart', 'file' => 'faithful-heart.mp3'),
            'worship-glow' => array('name' => 'Worship Glow', 'file' => 'worship-glow.mp3'),
            'mercy-rain' => array('name' => 'Mercy Rain', 'file' => 'mercy-rain.mp3'),
            'kingdom-dawn' => array('name' => 'Kingdom Dawn', 'file' => 'kingdom-dawn.mp3'),
        );
    }

    private static function cv_get_blessing_preset_music($preset_id) {
        $preset_id = sanitize_key($preset_id);
        $library = self::cv_blessing_preset_music_library();
        if (empty($preset_id) || empty($library[$preset_id])) { return null; }
        $item = $library[$preset_id];
        $file = sanitize_file_name($item['file']);
        $path = (defined('CURATED_VAULT_PLUGIN_DIR') ? CURATED_VAULT_PLUGIN_DIR : plugin_dir_path(dirname(__FILE__))) . 'assets/audio/blessings/' . $file;
        if (!file_exists($path)) { return null; }
        $base_url = defined('CURATED_VAULT_PLUGIN_URL') ? CURATED_VAULT_PLUGIN_URL : plugin_dir_url(dirname(__FILE__));
        $version = defined('CURATED_VAULT_VERSION') ? CURATED_VAULT_VERSION : '1.0.0';
        return array(
            'id' => $preset_id,
            'name' => sanitize_text_field($item['name']),
            'url' => esc_url_raw($base_url . 'assets/audio/blessings/' . $file . '?v=' . rawurlencode((string) $version)),
            'file' => $file,
            'mime' => 'audio/mpeg',
        );
    }


    public function stage_post_media() {
        $this->verify_ajax_request();
        if (!$this->rate_limit_request('stage_post_media', 20, HOUR_IN_SECONDS)) { return; }
        if (!$this->require_publish_auth_if_needed()) { return; }

        if (empty($_FILES['post_media']) || empty($_FILES['post_media']['name'])) {
            wp_send_json_error('Please choose an image or Reel video first.');
            return;
        }

        $title = sanitize_text_field($_POST['title'] ?? '');
        $allow_download = isset($_POST['allow_download']) ? (bool) absint($_POST['allow_download']) : true;
        $post_visibility = $this->normalize_post_visibility($_POST['post_visibility'] ?? 'public');
        if (!$this->is_effective_logged_in()) { $post_visibility = 'public'; }
        $allowed_mimes = self::cv_post_media_allowed_mimes();
        $names = is_array($_FILES['post_media']['name']) ? $_FILES['post_media']['name'] : array($_FILES['post_media']['name']);
        $count = min(count(array_filter($names)), 10);
        if ($count < 1) { wp_send_json_error('No media file received.'); return; }

        $video_count = 0;
        for ($i = 0; $i < $count; $i++) {
            $mime = is_array($_FILES['post_media']['type']) ? sanitize_mime_type($_FILES['post_media']['type'][$i] ?? '') : sanitize_mime_type($_FILES['post_media']['type'] ?? '');
            $name = is_array($_FILES['post_media']['name']) ? ($_FILES['post_media']['name'][$i] ?? '') : $_FILES['post_media']['name'];
            if (strpos((string) $mime, 'video/') === 0 || preg_match('/\.(mp4|m4v|mov|qt|webm|ogv)$/i', (string) $name)) { $video_count++; }
        }
        if ($video_count > 1 || ($video_count === 1 && $count > 1)) {
            wp_send_json_error('Please upload either one Reel video or up to 10 images, not both.');
            return;
        }

        $media_items = array();
        for ($i = 0; $i < $count; $i++) {
            $field = 'cv_stage_post_media_' . $i;
            $_FILES[$field] = array(
                'name' => is_array($_FILES['post_media']['name']) ? ($_FILES['post_media']['name'][$i] ?? '') : $_FILES['post_media']['name'],
                'type' => is_array($_FILES['post_media']['type']) ? ($_FILES['post_media']['type'][$i] ?? '') : $_FILES['post_media']['type'],
                'tmp_name' => is_array($_FILES['post_media']['tmp_name']) ? ($_FILES['post_media']['tmp_name'][$i] ?? '') : $_FILES['post_media']['tmp_name'],
                'error' => is_array($_FILES['post_media']['error']) ? ($_FILES['post_media']['error'][$i] ?? 0) : $_FILES['post_media']['error'],
                'size' => is_array($_FILES['post_media']['size']) ? ($_FILES['post_media']['size'][$i] ?? 0) : $_FILES['post_media']['size'],
            );
            if (empty($_FILES[$field]['name'])) { unset($_FILES[$field]); continue; }
            $incoming_type = !empty($_FILES[$field]['type']) ? sanitize_mime_type($_FILES[$field]['type']) : '';
            $file_name = !empty($_FILES[$field]['name']) ? sanitize_file_name($_FILES[$field]['name']) : '';
            $file_type = wp_check_filetype($file_name, $allowed_mimes);
            if (empty($incoming_type) && !empty($file_type['type'])) { $incoming_type = sanitize_mime_type($file_type['type']); }
            $is_video = strpos((string) $incoming_type, 'video/') === 0 || in_array(strtolower((string) ($file_type['ext'] ?? '')), array('mp4','m4v','mov','qt','webm','ogv'), true);
            $result = self::direct_upload_to_google_drive($_FILES[$field], array(
                'type' => $is_video ? 'post_reel' : 'post_image',
                'authorId' => $this->get_effective_author_id(),
                'title' => $title,
            ), $allowed_mimes, $is_video ? 'Reel video' : 'post image');

            // v5.5.18: also keep a normal WordPress upload URL for instant feed previews.
            // The selected cloud storage destination remains the private backup/storage destination; the local URL is used for fast browser rendering.
            $local_result = self::store_post_media_locally($_FILES[$field], $allowed_mimes);
            unset($_FILES[$field]);
            if (is_wp_error($result)) {
                wp_send_json_error('Media upload failed: ' . $result->get_error_message());
                return;
            }
            $local_url = is_array($local_result) && !empty($local_result['url']) ? esc_url_raw($local_result['url']) : esc_url_raw($result['url']);
            $media_items[] = array(
                'id' => 0,
                'url' => $local_url,
                'local_url' => $local_url,
                'type' => $is_video ? 'video' : 'image',
                'mime' => sanitize_mime_type($result['mime']),
                'drive_url' => esc_url_raw($result['url']),
                'drive_path' => sanitize_text_field($result['path'] ?? ''),
                'preview_url' => esc_url_raw($result['preview_url'] ?? ''),
                'downloadable' => $allow_download,
            );
        }

        if (empty($media_items)) { wp_send_json_error('No media was uploaded.'); return; }
        $first = $media_items[0];
        wp_send_json_success(array(
            'message' => 'Upload complete. You can publish now.',
            'media_items' => $media_items,
            'cover_image_url' => esc_url_raw($first['url']),
            'cover_media_url' => esc_url_raw($first['url']),
            'cover_drive_url' => esc_url_raw($first['drive_url'] ?? ''),
            'cover_drive_path' => sanitize_text_field($first['drive_path'] ?? ''),
            'media_type' => ($first['type'] === 'video') ? 'reel' : (count($media_items) > 1 ? 'gallery' : 'image'),
        ));
    }

    public function create_post() {
        $this->verify_ajax_request();
        if (!$this->rate_limit_request('create_post', 20, 10 * MINUTE_IN_SECONDS)) { return; }
        if (!$this->require_publish_auth_if_needed()) { return; }

        $type = sanitize_text_field($_POST['type'] ?? 'text');
        $raw_content = wp_unslash($_POST['content'] ?? '');
        $title = sanitize_text_field($_POST['title'] ?? '');
        $excerpt = sanitize_textarea_field($_POST['excerpt'] ?? '');
        if ($type === 'blessing') {
            $allowed_blessing_colors = array('blue', 'purple', 'sunrise', 'emerald', 'rose', 'slate');
            $blessing_color = sanitize_key($excerpt);
            $excerpt = in_array($blessing_color, $allowed_blessing_colors, true) ? $blessing_color : 'blue';
        }
        $contributor_name = sanitize_text_field($_POST['contributor_name'] ?? '');
        $contributor_role = sanitize_text_field($_POST['contributor_role'] ?? '');
        $contributor_church = sanitize_text_field($_POST['contributor_church'] ?? '');
        $contributor_ministry = sanitize_text_field($_POST['contributor_ministry'] ?? '');
        $allow_download = isset($_POST['allow_download']) ? (bool) absint($_POST['allow_download']) : true;
        $post_visibility = $this->normalize_post_visibility($_POST['post_visibility'] ?? 'public');
        if (!$this->is_effective_logged_in()) { $post_visibility = 'public'; }
        $blessing_preset_music_id = ($type === 'blessing') ? sanitize_key($_POST['blessing_preset_music'] ?? '') : '';
        $blessing_preset_music = $blessing_preset_music_id ? self::cv_get_blessing_preset_music($blessing_preset_music_id) : null;
        $has_blessing_music_upload = ($type === 'blessing' && !empty($_FILES['blessing_music']) && !empty($_FILES['blessing_music']['name']));
        $has_blessing_preset_music = ($type === 'blessing' && !empty($blessing_preset_music));
        $staged_media_raw = wp_unslash($_POST['staged_media'] ?? '');
        $staged_media_items = array();
        if (!empty($staged_media_raw)) {
            $decoded_staged = json_decode((string) $staged_media_raw, true);
            if (is_array($decoded_staged)) { $staged_media_items = $decoded_staged; }
        }
        $has_staged_media = !empty($staged_media_items);
        $has_incoming_media = $has_staged_media || (!empty($_FILES['post_media']) && !empty($_FILES['post_media']['name'])) || (!empty($_FILES['cover_image']) && !empty($_FILES['cover_image']['name'])) || $has_blessing_music_upload || $has_blessing_preset_music;

        if ($type === 'article') {
            if (empty($title) || empty($raw_content) || empty($contributor_name)) {
                wp_send_json_error('Article title, article body, and author name are required');
                return;
            }
            $content = wp_kses_post($raw_content);
            if (empty($excerpt)) {
                $excerpt = wp_trim_words(wp_strip_all_tags($content), 32, '...');
            }
        } else {
            $content = sanitize_textarea_field($raw_content);
            if (empty($content) && !$has_incoming_media) {
                wp_send_json_error('Content or media is required');
                return;
            }
        }

        $cover_image_url = '';
        $cover_media_id = 0;
        $cover_media_url = '';
        $cover_drive_url = '';
        $cover_drive_path = '';
        $post_drive_warning = '';
        $media_items = array();
        $media_type = 'image';

        $upload_one_post_media = function($field_name, $kind_hint = 'image') use (&$post_drive_warning, $title, $allow_download) {
            $allowed_mimes = self::cv_post_media_allowed_mimes();
            $incoming_type = !empty($_FILES[$field_name]['type']) ? sanitize_mime_type($_FILES[$field_name]['type']) : '';
            $file_name = !empty($_FILES[$field_name]['name']) ? sanitize_file_name($_FILES[$field_name]['name']) : '';
            $file_type = wp_check_filetype($file_name, $allowed_mimes);
            if (empty($incoming_type) && !empty($file_type['type'])) { $incoming_type = sanitize_mime_type($file_type['type']); }
            $is_video = strpos((string) $incoming_type, 'video/') === 0 || in_array(strtolower((string) ($file_type['ext'] ?? '')), array('mp4','m4v','mov','qt','webm','ogv'), true);
            $is_image = strpos((string) $incoming_type, 'image/') === 0 || in_array(strtolower((string) ($file_type['ext'] ?? '')), array('jpg','jpeg','jpe','png','gif','webp','heic','heif'), true);
            if (!$is_image && !$is_video) {
                return new WP_Error('cv_bad_media_type', 'Please upload images or a Reel video file only. Supported video files include MP4, MOV, M4V, WEBM, and OGV.');
            }
            $drive_result = self::direct_upload_to_google_drive($_FILES[$field_name], array(
                'type' => $is_video ? 'post_reel' : 'post_image',
                'authorId' => $this->get_effective_author_id(),
                'title' => $title,
            ), $allowed_mimes, $is_video ? 'Reel video' : 'post image');
            $local_result = self::store_post_media_locally($_FILES[$field_name], $allowed_mimes);
            if (is_wp_error($drive_result)) { return $drive_result; }
            $local_url = is_array($local_result) && !empty($local_result['url']) ? esc_url_raw($local_result['url']) : esc_url_raw($drive_result['url']);
            return array(
                'id' => 0,
                'url' => $local_url,
                'local_url' => $local_url,
                'type' => $is_video ? 'video' : 'image',
                'mime' => sanitize_mime_type($drive_result['mime']),
                'drive_url' => esc_url_raw($drive_result['url']),
                'drive_path' => sanitize_text_field($drive_result['path'] ?? ''),
                'preview_url' => esc_url_raw($drive_result['preview_url'] ?? ''),
                'downloadable' => $allow_download,
            );
        };

        // Media is uploaded directly to the selected storage destination. Nothing is registered in WordPress Media Library unless a local preview is needed.
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/media.php');

        if (!empty($staged_media_items)) {
            foreach ($staged_media_items as $item) {
                if (!is_array($item) || empty($item['url'])) { continue; }
                $item_type = sanitize_key($item['type'] ?? 'image');
                $media_items[] = array(
                    'id' => 0,
                    'url' => esc_url_raw($item['local_url'] ?? $item['url']),
                    'local_url' => esc_url_raw($item['local_url'] ?? $item['url']),
                    'type' => in_array($item_type, array('image', 'video'), true) ? $item_type : 'image',
                    'mime' => sanitize_mime_type($item['mime'] ?? ''),
                    'drive_url' => esc_url_raw($item['drive_url'] ?? $item['url']),
                    'drive_path' => sanitize_text_field($item['drive_path'] ?? ''),
                    'preview_url' => esc_url_raw($item['preview_url'] ?? ''),
                    'downloadable' => array_key_exists('downloadable', $item) ? (bool) $item['downloadable'] : $allow_download,
                );
            }
        } elseif (!empty($_FILES['post_media']) && !empty($_FILES['post_media']['name'])) {
            $names = is_array($_FILES['post_media']['name']) ? $_FILES['post_media']['name'] : array($_FILES['post_media']['name']);
            $count = count(array_filter($names));
            $count = min($count, 10);
            $video_count = 0;
            for ($i = 0; $i < $count; $i++) {
                $tmp_name = is_array($_FILES['post_media']['tmp_name']) ? ($_FILES['post_media']['tmp_name'][$i] ?? '') : $_FILES['post_media']['tmp_name'];
                if (!$tmp_name) { continue; }
                $mime = is_array($_FILES['post_media']['type']) ? sanitize_mime_type($_FILES['post_media']['type'][$i] ?? '') : sanitize_mime_type($_FILES['post_media']['type'] ?? '');
                if (strpos((string) $mime, 'video/') === 0 || preg_match('/\.(mp4|m4v|mov|qt|webm|ogv)$/i', (string) (is_array($_FILES['post_media']['name']) ? ($_FILES['post_media']['name'][$i] ?? '') : $_FILES['post_media']['name']))) { $video_count++; }
            }
            if ($video_count > 1 || ($video_count === 1 && $count > 1)) {
                wp_send_json_error('Please upload either one Reel video or up to 10 images, not both.');
                return;
            }
            for ($i = 0; $i < $count; $i++) {
                $field = 'cv_post_media_' . $i;
                $_FILES[$field] = array(
                    'name' => is_array($_FILES['post_media']['name']) ? ($_FILES['post_media']['name'][$i] ?? '') : $_FILES['post_media']['name'],
                    'type' => is_array($_FILES['post_media']['type']) ? ($_FILES['post_media']['type'][$i] ?? '') : $_FILES['post_media']['type'],
                    'tmp_name' => is_array($_FILES['post_media']['tmp_name']) ? ($_FILES['post_media']['tmp_name'][$i] ?? '') : $_FILES['post_media']['tmp_name'],
                    'error' => is_array($_FILES['post_media']['error']) ? ($_FILES['post_media']['error'][$i] ?? 0) : $_FILES['post_media']['error'],
                    'size' => is_array($_FILES['post_media']['size']) ? ($_FILES['post_media']['size'][$i] ?? 0) : $_FILES['post_media']['size'],
                );
                if (empty($_FILES[$field]['name'])) { continue; }
                $media = $upload_one_post_media($field);
                unset($_FILES[$field]);
                if (is_wp_error($media)) {
                    wp_send_json_error('Media upload failed: ' . $media->get_error_message());
                    return;
                }
                $media_items[] = $media;
            }
        } elseif (!empty($_FILES['cover_image']) && !empty($_FILES['cover_image']['name'])) {
            $media = $upload_one_post_media('cover_image');
            if (is_wp_error($media)) {
                wp_send_json_error('Cover image upload failed: ' . $media->get_error_message());
                return;
            }
            $media_items[] = $media;
        }

        if ($type === 'blessing' && !empty($_FILES['blessing_music']) && !empty($_FILES['blessing_music']['name'])) {
            $allowed_music_mimes = self::cv_blessing_music_allowed_mimes();
            $music_file = $_FILES['blessing_music'];
            $music_name = sanitize_file_name($music_file['name'] ?? 'christian-music.mp3');
            $music_mime = !empty($music_file['type']) ? sanitize_mime_type($music_file['type']) : '';
            $music_ext = strtolower(pathinfo($music_name, PATHINFO_EXTENSION));
            $allowed_music_exts = array('mp3', 'm4a', 'm4b', 'aac', 'wav', 'ogg', 'oga', 'opus');
            $is_audio = strpos((string) $music_mime, 'audio/') === 0 || in_array($music_ext, $allowed_music_exts, true);
            if (!$is_audio) {
                wp_send_json_error('Christian music upload failed: please use MP3, M4A, AAC, WAV, OGG, or OPUS audio.');
                return;
            }
            $music_drive_result = self::direct_upload_to_google_drive($music_file, array(
                'type' => 'blessing_music',
                'authorId' => $this->get_effective_author_id(),
                'title' => $title ?: 'Faith In blessing music',
            ), $allowed_music_mimes, 'Christian music');
            if (is_wp_error($music_drive_result)) {
                wp_send_json_error('Christian music upload failed: ' . $music_drive_result->get_error_message());
                return;
            }
            $music_local_result = self::store_post_media_locally($music_file, $allowed_music_mimes);
            $music_local_url = is_array($music_local_result) && !empty($music_local_result['url']) ? esc_url_raw($music_local_result['url']) : esc_url_raw($music_drive_result['url']);
            $media_items[] = array(
                'id' => is_array($music_local_result) ? absint($music_local_result['id'] ?? 0) : 0,
                'url' => $music_local_url,
                'local_url' => $music_local_url,
                'type' => 'audio',
                'mime' => sanitize_mime_type($music_drive_result['mime'] ?? $music_mime),
                'drive_url' => esc_url_raw($music_drive_result['url'] ?? ''),
                'drive_path' => sanitize_text_field($music_drive_result['path'] ?? ''),
                'preview_url' => '',
                'downloadable' => false,
                'is_blessing_music' => true,
                'name' => sanitize_text_field($_POST['blessing_music_name'] ?? $music_name),
            );
        } elseif ($type === 'blessing' && !empty($blessing_preset_music)) {
            $media_items[] = array(
                'id' => 0,
                'url' => esc_url_raw($blessing_preset_music['url']),
                'local_url' => esc_url_raw($blessing_preset_music['url']),
                'type' => 'audio',
                'mime' => sanitize_mime_type($blessing_preset_music['mime']),
                'drive_url' => '',
                'drive_path' => '',
                'preview_url' => '',
                'downloadable' => false,
                'is_blessing_music' => true,
                'preset_id' => sanitize_key($blessing_preset_music['id']),
                'name' => sanitize_text_field($blessing_preset_music['name']),
            );
        }

        if (!empty($media_items)) {
            $visual_items = array_values(array_filter($media_items, function($item) {
                return is_array($item) && sanitize_key($item['type'] ?? '') !== 'audio';
            }));
            if (!empty($visual_items)) {
                $first = $visual_items[0];
                $cover_image_url = esc_url_raw($first['url']);
                $cover_media_id = absint($first['id']);
                $cover_media_url = esc_url_raw($first['url']);
                $cover_drive_url = esc_url_raw($first['drive_url'] ?? '');
                $cover_drive_path = sanitize_text_field($first['drive_path'] ?? '');
                $media_type = ($first['type'] === 'video') ? 'reel' : (count($visual_items) > 1 ? 'gallery' : 'image');
            } else {
                $media_type = 'audio';
            }
        }

        global $wpdb;
        $table = $wpdb->prefix . 'cv_posts';
        $insert_data = array(
            'author_id' => $this->get_effective_author_id(),
            'content' => $content,
            'type' => $type,
            'title' => $title,
            'excerpt' => $excerpt,
            'cover_image_url' => $cover_image_url,
            'cover_media_id' => $cover_media_id,
            'cover_media_url' => $cover_media_url,
            'cover_drive_url' => $cover_drive_url,
            'cover_drive_path' => $cover_drive_path,
            'media_json' => wp_json_encode($media_items),
            'media_type' => $media_type,
            'contributor_name' => $contributor_name,
            'contributor_role' => $contributor_role,
            'contributor_church' => $contributor_church,
            'contributor_ministry' => $contributor_ministry,
        );
        if ($this->post_visibility_column_exists($table)) {
            $insert_data['post_visibility'] = $post_visibility;
        }
        $wpdb->insert($table, $insert_data);

        wp_send_json_success('Post created successfully.' . $post_drive_warning);
    }


    public function get_jobs() {
        $this->verify_ajax_request();

        global $wpdb;
        $table = $wpdb->prefix . 'cv_jobs';
        $pagination = $this->get_pagination_args(50, 100);
        $jobs = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table ORDER BY timestamp DESC LIMIT %d OFFSET %d", $pagination['limit'], $pagination['offset']), ARRAY_A);

        foreach ($jobs as &$job) {
            $user = get_userdata($job['author_id']);
            $job['title'] = sanitize_text_field($job['title'] ?? '');
            $job['organization'] = sanitize_text_field($job['organization'] ?? '');
            $job['location'] = sanitize_text_field($job['location'] ?? '');
            $job['job_type'] = sanitize_text_field($job['job_type'] ?? 'Full-time');
            $job['description'] = sanitize_textarea_field($job['description'] ?? '');
            $job['apply_url'] = esc_url_raw($job['apply_url'] ?? '');
            $job['contact_email'] = sanitize_email($job['contact_email'] ?? '');
            $job['time'] = human_time_diff(strtotime($job['timestamp']), current_time('timestamp')) . ' ago';
            $job['author'] = array(
                'name' => $user ? $user->display_name : 'Community Member',
                'avatar' => function_exists('curated_vault_get_user_avatar_url') ? curated_vault_get_user_avatar_url(intval($job['author_id']), 80) : get_avatar_url(intval($job['author_id']), array('size' => 80)),
            );
            $job['can_edit'] = $this->get_effective_author_id() === intval($job['author_id']);
            $job['can_delete'] = $job['can_edit'];
        }

        wp_send_json_success($jobs);
    }

    public function create_job() {
        $this->verify_ajax_request();
        if (!$this->rate_limit_request('create_job', 10, 10 * MINUTE_IN_SECONDS)) { return; }
        if (!$this->require_publish_auth_if_needed()) { return; }
        if (!$this->require_effective_login('Please sign in before posting a job.')) { return; }

        $title = sanitize_text_field($_POST['title'] ?? '');
        $organization = sanitize_text_field($_POST['organization'] ?? '');
        $location = sanitize_text_field($_POST['location'] ?? '');
        $job_type = sanitize_text_field($_POST['job_type'] ?? 'Full-time');
        $description = sanitize_textarea_field($_POST['description'] ?? '');
        $apply_url = esc_url_raw($_POST['apply_url'] ?? '');
        $contact_email = sanitize_email($_POST['contact_email'] ?? '');

        if (empty($title) || empty($organization) || empty($description)) {
            wp_send_json_error('Job title, organization, and description are required.');
            return;
        }

        if (empty($apply_url) && empty($contact_email)) {
            wp_send_json_error('Please add an apply link or contact email.');
            return;
        }

        global $wpdb;
        $table = $wpdb->prefix . 'cv_jobs';
        $inserted = $wpdb->insert($table, array(
            'author_id' => $this->get_effective_author_id(),
            'title' => $title,
            'organization' => $organization,
            'location' => $location,
            'job_type' => $job_type,
            'description' => $description,
            'apply_url' => $apply_url,
            'contact_email' => $contact_email,
        ));

        if (!$inserted) {
            wp_send_json_error('Could not post the job right now.');
            return;
        }

        wp_send_json_success('Job posted successfully.');
    }

    public function update_job() {
        $this->verify_ajax_request();

        if (!$this->is_effective_logged_in()) {
            wp_send_json_error('Please sign in first.');
            return;
        }

        $job_id = intval($_POST['job_id'] ?? 0);
        $user_id = $this->get_effective_author_id();
        $is_moderator = $this->effective_user_can_moderate();
        $title = sanitize_text_field($_POST['title'] ?? '');
        $organization = sanitize_text_field($_POST['organization'] ?? '');
        $location = sanitize_text_field($_POST['location'] ?? '');
        $job_type = sanitize_text_field($_POST['job_type'] ?? 'Full-time');
        $description = sanitize_textarea_field($_POST['description'] ?? '');
        $apply_url = esc_url_raw($_POST['apply_url'] ?? '');
        $contact_email = sanitize_email($_POST['contact_email'] ?? '');

        if (empty($title) || empty($organization) || empty($description)) {
            wp_send_json_error('Job title, organization, and description are required.');
            return;
        }

        global $wpdb;
        $table = $wpdb->prefix . 'cv_jobs';
        $where = $is_moderator ? array('id' => $job_id) : array('id' => $job_id, 'author_id' => $user_id);
        $updated = $wpdb->update($table, array(
            'title' => $title,
            'organization' => $organization,
            'location' => $location,
            'job_type' => $job_type,
            'description' => $description,
            'apply_url' => $apply_url,
            'contact_email' => $contact_email,
        ), $where);

        if ($updated === false) {
            wp_send_json_error('Could not update the job.');
            return;
        }

        wp_send_json_success('Job updated successfully.');
    }

    public function delete_job() {
        $this->verify_ajax_request();

        if (!$this->is_effective_logged_in()) {
            wp_send_json_error('Please sign in first.');
            return;
        }

        $job_id = intval($_POST['job_id'] ?? 0);
        $user_id = $this->get_effective_author_id();
        $is_moderator = $this->effective_user_can_moderate();

        global $wpdb;
        $table = $wpdb->prefix . 'cv_jobs';
        $where = $is_moderator ? array('id' => $job_id) : array('id' => $job_id, 'author_id' => $user_id);
        $deleted = $wpdb->delete($table, $where);

        if (!$deleted) {
            wp_send_json_error('Job not found or you do not have permission to delete it.');
            return;
        }

        wp_send_json_success('Job deleted successfully.');
    }

    public function get_prayers() {
        $this->verify_ajax_request();

        global $wpdb;
        $table = $wpdb->prefix . 'cv_prayers';
        $pagination = $this->get_pagination_args(50, 100);

        $prayers = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table ORDER BY timestamp DESC LIMIT %d OFFSET %d", $pagination['limit'], $pagination['offset']), ARRAY_A);

        foreach ($prayers as &$prayer) {
            $user = get_userdata($prayer['author_id']);
            $prayer['author'] = $user ? $user->display_name : 'Unknown';
            $prayer['time'] = human_time_diff(strtotime($prayer['timestamp']), current_time('timestamp')) . ' ago';
            $prayer['can_edit'] = $this->get_effective_author_id() === intval($prayer['author_id']);
            $prayer['can_delete'] = $prayer['can_edit'];
        }

        wp_send_json_success($prayers);
    }

    public function create_prayer() {
        $this->verify_ajax_request();
        if (!$this->rate_limit_request('create_prayer', 10, 10 * MINUTE_IN_SECONDS)) { return; }
        if (!$this->require_effective_login('Please sign in before posting a prayer request.')) { return; }

        $content = sanitize_textarea_field($_POST['content']);
        $urgent = isset($_POST['urgent']) ? 1 : 0;

        if (empty($content)) {
            wp_send_json_error('Content is required');
            return;
        }

        global $wpdb;
        $table = $wpdb->prefix . 'cv_prayers';

        $wpdb->insert($table, array(
            'author_id' => $this->get_effective_author_id(),
            'content' => $content,
            'urgent' => $urgent
        ));

        wp_send_json_success('Prayer request created successfully');
    }

    public function update_post() {
        $this->verify_ajax_request();

        if (!$this->is_effective_logged_in()) {
            wp_send_json_error('Please sign in first.');
            return;
        }

        $post_id = intval($_POST['post_id'] ?? 0);
        $user_id = $this->get_effective_author_id();
        $is_moderator = $this->effective_user_can_moderate();
        $raw_content = wp_unslash($_POST['content'] ?? '');
        $title = sanitize_text_field($_POST['title'] ?? '');
        $excerpt = sanitize_textarea_field($_POST['excerpt'] ?? '');
        $post_visibility = $this->normalize_post_visibility($_POST['post_visibility'] ?? 'public');

        global $wpdb;
        $table = $wpdb->prefix . 'cv_posts';
        // MODERATION (v5.5.190): admins/editors may edit any row; everyone else
        // is restricted to their own author_id.
        if ($is_moderator) {
            $post = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $post_id));
        } else {
            $post = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d AND author_id = %d", $post_id, $user_id));
        }

        if (!$post) {
            wp_send_json_error('Post not found or you do not have permission to edit it.');
            return;
        }

        $where = $is_moderator ? array('id' => $post_id) : array('id' => $post_id, 'author_id' => $user_id);

        if (($post->type ?? '') === 'article') {
            if (empty($title) || empty($raw_content)) {
                wp_send_json_error('Article title and article body are required.');
                return;
            }
            $content = wp_kses_post($raw_content);
            if (empty($excerpt)) {
                $excerpt = wp_trim_words(wp_strip_all_tags($content), 32, '...');
            }
            $update_data = array(
                'title' => $title,
                'content' => $content,
                'excerpt' => $excerpt,
            );
            if ($this->post_visibility_column_exists($table)) { $update_data['post_visibility'] = $post_visibility; }
            $updated = $wpdb->update($table, $update_data, $where);
        } else {
            $content = sanitize_textarea_field($raw_content);
            if (empty($content)) {
                wp_send_json_error('Content is required.');
                return;
            }
            $update_data = array('content' => $content);
            if ($this->post_visibility_column_exists($table)) { $update_data['post_visibility'] = $post_visibility; }
            $updated = $wpdb->update($table, $update_data, $where);
        }

        if ($updated === false) {
            wp_send_json_error('Could not update the post.');
            return;
        }

        wp_send_json_success('Post updated successfully.');
    }

    public function delete_post() {
        $this->verify_ajax_request();

        if (!$this->is_effective_logged_in()) {
            wp_send_json_error('Please sign in first.');
            return;
        }

        $post_id = intval($_POST['post_id'] ?? 0);
        $user_id = $this->get_effective_author_id();
        $is_moderator = $this->effective_user_can_moderate();

        global $wpdb;
        $table = $wpdb->prefix . 'cv_posts';
        // MODERATION (v5.5.190): admins/editors may delete any row.
        if ($is_moderator) {
            $deleted = $wpdb->delete($table, array('id' => $post_id));
        } else {
            $deleted = $wpdb->delete($table, array('id' => $post_id, 'author_id' => $user_id));
        }

        if (!$deleted) {
            wp_send_json_error('Post not found or you do not have permission to delete it.');
            return;
        }

        wp_send_json_success('Post deleted successfully.');
    }

    public function update_prayer() {
        $this->verify_ajax_request();

        if (!$this->is_effective_logged_in()) {
            wp_send_json_error('Please sign in first.');
            return;
        }

        $prayer_id = intval($_POST['prayer_id'] ?? 0);
        $user_id = $this->get_effective_author_id();
        $is_moderator = $this->effective_user_can_moderate();
        $content = sanitize_textarea_field(wp_unslash($_POST['content'] ?? ''));

        if (empty($content)) {
            wp_send_json_error('Prayer request cannot be empty.');
            return;
        }

        global $wpdb;
        $table = $wpdb->prefix . 'cv_prayers';
        $where = $is_moderator ? array('id' => $prayer_id) : array('id' => $prayer_id, 'author_id' => $user_id);
        $updated = $wpdb->update($table, array('content' => $content), $where);

        if ($updated === false) {
            wp_send_json_error('Could not update the prayer request.');
            return;
        }

        wp_send_json_success('Prayer request updated.');
    }

    public function delete_prayer() {
        $this->verify_ajax_request();

        if (!$this->is_effective_logged_in()) {
            wp_send_json_error('Please sign in first.');
            return;
        }

        $prayer_id = intval($_POST['prayer_id'] ?? 0);
        $user_id = $this->get_effective_author_id();
        $is_moderator = $this->effective_user_can_moderate();

        global $wpdb;
        $table = $wpdb->prefix . 'cv_prayers';
        $where = $is_moderator ? array('id' => $prayer_id) : array('id' => $prayer_id, 'author_id' => $user_id);
        $deleted = $wpdb->delete($table, $where);

        if (!$deleted) {
            wp_send_json_error('Prayer request not found or you do not have permission to delete it.');
            return;
        }

        wp_send_json_success('Prayer request deleted.');
    }
    public function like_post() {
        $this->verify_ajax_request();

        if (!$this->is_effective_logged_in()) {
            wp_send_json_error('Please sign in first.');
            return;
        }

        $post_id = intval($_POST['post_id'] ?? 0);
        $reaction = sanitize_key($_POST['reaction'] ?? 'like');
        $allowed = array('like', 'celebrate', 'support', 'love', 'insightful', 'funny');
        if (!in_array($reaction, $allowed, true)) {
            $reaction = 'like';
        }

        global $wpdb;
        $table = $wpdb->prefix . 'cv_posts';
        $post = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $post_id));

        if (!$post) {
            wp_send_json_error('Post not found');
            return;
        }

        $user_id = $this->get_effective_author_id();
        $reactions = get_user_meta($user_id, 'cv_post_reactions', true);
        $reactions = is_array($reactions) ? $reactions : array();
        $key = (string) $post_id;
        $previous = !empty($reactions[$key]) ? sanitize_key($reactions[$key]) : '';
        $likes = max(0, intval($post->likes));

        if ($previous === $reaction) {
            unset($reactions[$key]);
            $likes = max(0, $likes - 1);
            $reaction = '';
        } else {
            $reactions[$key] = $reaction;
            if (empty($previous)) {
                $likes++;
            }
        }

        update_user_meta($user_id, 'cv_post_reactions', $reactions);
        $wpdb->update($table, array('likes' => $likes), array('id' => $post_id), array('%d'), array('%d'));

        wp_send_json_success(array(
            'post_id' => $post_id,
            'reaction' => $reaction,
            'likes' => $likes,
            'liked' => !empty($reaction),
        ));
    }

    public function create_post_comment() {
        $this->verify_ajax_request();
        if (!$this->rate_limit_request('create_post_comment', 30, 10 * MINUTE_IN_SECONDS)) { return; }

        if (!$this->is_effective_logged_in()) {
            wp_send_json_error('Please sign in first.');
            return;
        }

        $post_id = absint($_POST['post_id'] ?? 0);
        $content = sanitize_textarea_field(wp_unslash($_POST['content'] ?? ''));
        $comment_media_id = 0;
        $comment_media_url = '';
        $comment_drive_url = '';
        $comment_drive_path = '';
        $comment_media_type = 'none';
        $comment_drive_warning = '';

        if (!empty($_FILES['comment_image']) && !empty($_FILES['comment_image']['name'])) {
            $incoming_type = !empty($_FILES['comment_image']['type']) ? sanitize_mime_type($_FILES['comment_image']['type']) : '';
            if (strpos((string) $incoming_type, 'image/') !== 0) {
                wp_send_json_error('Comment image must be an image file.');
                return;
            }
            $drive_result = self::direct_upload_to_google_drive($_FILES['comment_image'], array(
                'type' => 'post_comment_image',
                'authorId' => $this->get_effective_author_id(),
                'postId' => $post_id,
            ), array(
                'jpg|jpeg|jpe' => 'image/jpeg',
                'png' => 'image/png',
                'gif' => 'image/gif',
                'webp' => 'image/webp',
                'heic' => 'image/heic',
                'heif' => 'image/heif',
            ), 'comment image');
            if (is_wp_error($drive_result)) {
                wp_send_json_error('Comment image upload failed: ' . $drive_result->get_error_message());
                return;
            }
            $comment_media_id = 0;
            $comment_media_url = esc_url_raw($drive_result['url']);
            $comment_media_type = 'image';
            $comment_drive_url = esc_url_raw($drive_result['url']);
            $comment_drive_path = sanitize_text_field($drive_result['path'] ?? '');
        }

        if (!$post_id || (empty($content) && empty($comment_media_url))) {
            wp_send_json_error('Comment cannot be empty.');
            return;
        }

        global $wpdb;
        $posts_table = $wpdb->prefix . 'cv_posts';
        $comments_table = $wpdb->prefix . 'cv_post_comments';
        $post = $wpdb->get_row($wpdb->prepare("SELECT * FROM $posts_table WHERE id = %d", $post_id));
        if (!$post) {
            wp_send_json_error('Post not found.');
            return;
        }

        $inserted = $wpdb->insert($comments_table, array(
            'post_id' => $post_id,
            'author_id' => $this->get_effective_author_id(),
            'content' => $content,
            'media_attachment_id' => $comment_media_id,
            'media_url' => $comment_media_url,
            'media_drive_url' => $comment_drive_url,
            'media_drive_path' => $comment_drive_path,
            'media_type' => $comment_media_type,
            'status' => 'publish',
        ), array('%d', '%d', '%s', '%d', '%s', '%s', '%s', '%s', '%s'));

        if (!$inserted) {
            wp_send_json_error('Could not save the comment.');
            return;
        }

        $count = absint($wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $comments_table WHERE post_id = %d AND status = %s", $post_id, 'publish')));
        $wpdb->update($posts_table, array('comments' => $count), array('id' => $post_id), array('%d'), array('%d'));
        $comment = $wpdb->get_row($wpdb->prepare("SELECT * FROM $comments_table WHERE id = %d", $wpdb->insert_id), ARRAY_A);

        wp_send_json_success(array(
            'post_id' => $post_id,
            'comment_count' => $count,
            'comment' => $this->format_post_comment_row($comment),
            'drive_warning' => trim($comment_drive_warning),
        ));
    }

    public function repost_post() {
        $this->verify_ajax_request();

        if (!$this->is_effective_logged_in()) {
            wp_send_json_error('Please sign in first.');
            return;
        }

        $post_id = absint($_POST['post_id'] ?? 0);
        global $wpdb;
        $table = $wpdb->prefix . 'cv_posts';
        $post = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $post_id));
        if (!$post) {
            wp_send_json_error('Post not found.');
            return;
        }
        $count = max(0, absint($post->reposts)) + 1;
        $wpdb->update($table, array('reposts' => $count), array('id' => $post_id), array('%d'), array('%d'));
        wp_send_json_success(array('post_id' => $post_id, 'repost_count' => $count));
    }

    public function share_post() {
        $this->verify_ajax_request();

        if (!$this->is_effective_logged_in()) {
            wp_send_json_error('Please sign in first.');
            return;
        }

        $post_id = absint($_POST['post_id'] ?? 0);
        global $wpdb;
        $table = $wpdb->prefix . 'cv_posts';
        $post = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $post_id));
        if (!$post) {
            wp_send_json_error('Post not found.');
            return;
        }
        $count = max(0, absint($post->shares)) + 1;
        $wpdb->update($table, array('shares' => $count), array('id' => $post_id), array('%d'), array('%d'));
        wp_send_json_success(array('post_id' => $post_id, 'share_count' => $count));
    }

    public function download_resource() {
        $this->verify_ajax_request();

        $resource_id = intval($_POST['resource_id'] ?? 0);
        if ($resource_id <= 0) {
            wp_send_json_error('Resource id is missing.');
            return;
        }

        global $wpdb;
        $table = $wpdb->prefix . 'cv_resources';

        $resource = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $resource_id));

        if (!$resource) {
            wp_send_json_error('Resource not found');
            return;
        }

        $raw_url = esc_url_raw((string) ($resource->file_url ?? ''));
        if (empty($raw_url)) {
            wp_send_json_error('This resource does not have a downloadable file yet.');
            return;
        }

        // v5.5.149: resource downloads are public library actions. Count the click,
        // then return a mobile-friendly direct URL so iOS/Android can open the book/file.
        $download_url = self::normalize_google_drive_file_url($raw_url);
        if (empty($download_url)) { $download_url = $raw_url; }
        $new_count = max(0, intval($resource->downloads)) + 1;
        $wpdb->update($table, array('downloads' => $new_count), array('id' => $resource_id), array('%d'), array('%d'));

        $filename_base = sanitize_file_name(wp_strip_all_tags((string) ($resource->title ?? 'faith-in-resource')));
        if (empty($filename_base)) { $filename_base = 'faith-in-resource'; }

        wp_send_json_success(array(
            'url' => esc_url_raw($download_url),
            'source_url' => $raw_url,
            'filename' => $filename_base,
            'downloads' => $new_count,
            'resource_id' => $resource_id,
        ));
    }

    public function toggle_bookmark() {
        $this->verify_ajax_request();

        if (!$this->is_effective_logged_in()) {
            wp_send_json_error('User not logged in');
            return;
        }

        $resource_id = intval($_POST['resource_id']);
        $user_id = $this->get_effective_author_id();

        global $wpdb;
        $table = $wpdb->prefix . 'cv_user_prefs';

        $prefs = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE user_id = %d", $user_id));

        if (!$prefs) {
            $bookmarks = array($resource_id);
            $wpdb->insert($table, array(
                'user_id' => $user_id,
                'bookmarks' => json_encode($bookmarks)
            ));
        } else {
            $bookmarks = json_decode($prefs->bookmarks, true) ?: array();

            if (in_array($resource_id, $bookmarks)) {
                $bookmarks = array_diff($bookmarks, array($resource_id));
            } else {
                $bookmarks[] = $resource_id;
            }

            $wpdb->update($table, array('bookmarks' => json_encode($bookmarks)), array('user_id' => $user_id));
        }

        wp_send_json_success('Bookmark toggled');
    }

    public function delete_resource() {
        $this->verify_ajax_request();

        if (!$this->is_effective_logged_in()) {
            wp_send_json_error('User not logged in');
            return;
        }

        $resource_id = intval($_POST['resource_id']);
        $user_id = $this->get_effective_author_id();
        $is_moderator = $this->effective_user_can_moderate();

        global $wpdb;
        $table = $wpdb->prefix . 'cv_resources';

        // MODERATION (v5.5.190): admins/editors may delete any resource.
        if ($is_moderator) {
            $resource = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $resource_id));
        } else {
            $resource = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d AND author_id = %d", $resource_id, $user_id));
        }

        if (!$resource) {
            wp_send_json_error('Resource not found or you do not have permission to delete it');
            return;
        }

        // Delete the file from WordPress media library if it exists
        if (!empty($resource->file_url)) {
            $attachment_id = attachment_url_to_postid($resource->file_url);
            if ($attachment_id) {
                wp_delete_attachment($attachment_id, true);
            }
        }

        // Delete from database
        $wpdb->delete($table, array('id' => $resource_id));

        wp_send_json_success('Resource deleted successfully');
    }

    public function request_magic_link() {
        $this->verify_ajax_request();
        if (!$this->rate_limit_request('request_magic_link', 5, 15 * MINUTE_IN_SECONDS)) { return; }
        if (!function_exists('curated_vault_get_settings') || !function_exists('curated_vault_magic_link_key')) {
            wp_send_json_error('Email sign-in is not available right now.');
            return;
        }
        $settings = curated_vault_get_settings();
        $email = sanitize_email($_POST['email'] ?? '');
        if (!$email || !is_email($email)) {
            wp_send_json_error('Please enter a valid email address.');
            return;
        }
        $token = wp_generate_password(48, false, false);
        set_transient(curated_vault_magic_link_key($token), array('email' => $email, 'created' => time()), 30 * MINUTE_IN_SECONDS);
        $link = add_query_arg(array('cv_magic_login' => 1, 'cv_token' => rawurlencode($token)), home_url('/'));
        $subject = !empty($settings['magic_link_subject']) ? $settings['magic_link_subject'] : 'Your sign-in link for Faith In';
        $message = "Click this link to sign in to Faith In:\n\n" . $link . "\n\nThis link expires in 30 minutes. If you did not request it, you can ignore this email.";
        $sent = wp_mail($email, $subject, $message);
        if (!$sent) {
            delete_transient(curated_vault_magic_link_key($token));
            wp_send_json_error('Could not send the sign-in email. Please check WordPress mail/SMTP settings.');
            return;
        }
        wp_send_json_success('Check your email for a Faith In sign-in link.');
    }


    public function phone_sign_up() {
        $this->verify_ajax_request();
        if (!$this->rate_limit_request('phone_sign_up', 5, 15 * MINUTE_IN_SECONDS)) { return; }
        wp_send_json_error('Phone sign-up is disabled. Please continue with Google.');
    }

    private function firebase_base64url_decode($value) {
        $value = strtr((string) $value, '-_', '+/');
        $pad = strlen($value) % 4;
        if ($pad) { $value .= str_repeat('=', 4 - $pad); }
        return base64_decode($value, true);
    }

    private function firebase_json_decode_part($part) {
        $decoded = $this->firebase_base64url_decode($part);
        if ($decoded === false) { return null; }
        $json = json_decode($decoded, true);
        return is_array($json) ? $json : null;
    }

    private function firebase_public_certs() {
        $cached = get_transient('cv_firebase_public_certs');
        if (is_array($cached) && !empty($cached)) { return $cached; }
        $url = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
        $response = wp_remote_get($url, array('timeout' => 15));
        if (is_wp_error($response)) { return new WP_Error('cv_firebase_certs_unavailable', 'Could not load Firebase public certificates.'); }
        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);
        if ($code < 200 || $code >= 300 || !is_array($body) || empty($body)) {
            return new WP_Error('cv_firebase_certs_invalid', 'Firebase public certificates were unavailable.');
        }
        set_transient('cv_firebase_public_certs', $body, HOUR_IN_SECONDS);
        return $body;
    }

    private function verify_firebase_id_token($id_token) {
        if (!function_exists('openssl_verify')) {
            return new WP_Error('cv_openssl_missing', 'OpenSSL is required to verify Firebase sign-in tokens.');
        }
        if (!function_exists('curated_vault_get_settings')) {
            return new WP_Error('cv_settings_missing', 'Settings are unavailable.');
        }
        $settings = curated_vault_get_settings();
        $project_id = sanitize_text_field($settings['firebase_project_id'] ?? '');
        if (!$project_id) {
            return new WP_Error('cv_firebase_not_configured', 'Firebase Project ID is missing. Add it in Settings > Faith In.');
        }
        $parts = explode('.', (string) $id_token);
        if (count($parts) !== 3) {
            return new WP_Error('cv_bad_firebase_token', 'Firebase sign-in token has an invalid format.');
        }
        list($header_part, $payload_part, $signature_part) = $parts;
        $header = $this->firebase_json_decode_part($header_part);
        $payload = $this->firebase_json_decode_part($payload_part);
        $signature = $this->firebase_base64url_decode($signature_part);
        if (!$header || !$payload || $signature === false) {
            return new WP_Error('cv_bad_firebase_token', 'Firebase sign-in token could not be decoded.');
        }
        if (($header['alg'] ?? '') !== 'RS256' || empty($header['kid'])) {
            return new WP_Error('cv_bad_firebase_token', 'Firebase sign-in token is not signed with the expected algorithm.');
        }
        $certs = $this->firebase_public_certs();
        if (is_wp_error($certs)) { return $certs; }
        $kid = sanitize_text_field($header['kid']);
        if (empty($certs[$kid])) {
            delete_transient('cv_firebase_public_certs');
            return new WP_Error('cv_firebase_cert_missing', 'Firebase public certificate for this token was not found. Please try again.');
        }
        $verified = openssl_verify($header_part . '.' . $payload_part, $signature, $certs[$kid], OPENSSL_ALGO_SHA256);
        if ($verified !== 1) {
            return new WP_Error('cv_firebase_signature_invalid', 'Firebase sign-in token signature is invalid.');
        }
        $now = time();
        $issuer = 'https://securetoken.google.com/' . $project_id;
        if (($payload['aud'] ?? '') !== $project_id || ($payload['iss'] ?? '') !== $issuer) {
            return new WP_Error('cv_firebase_claims_invalid', 'Firebase sign-in token is for a different project.');
        }
        if (empty($payload['sub']) || !is_string($payload['sub']) || strlen($payload['sub']) > 128) {
            return new WP_Error('cv_firebase_subject_invalid', 'Firebase sign-in token does not contain a valid user ID.');
        }
        if (empty($payload['exp']) || intval($payload['exp']) < $now) {
            return new WP_Error('cv_firebase_token_expired', 'Firebase sign-in token has expired. Please sign in again.');
        }
        if (!empty($payload['iat']) && intval($payload['iat']) > ($now + 300)) {
            return new WP_Error('cv_firebase_token_future', 'Firebase sign-in token is not valid yet.');
        }
        return $payload;
    }

    public function firebase_sign_in() {
        $this->verify_ajax_request();
        if (!$this->rate_limit_request('firebase_sign_in', 30, 10 * MINUTE_IN_SECONDS)) { return; }
        $id_token = sanitize_text_field($_POST['id_token'] ?? '');
        $provider = sanitize_text_field($_POST['provider'] ?? 'firebase');
        if (!$id_token) {
            wp_send_json_error('Missing Firebase sign-in token.');
            return;
        }
        $claims = $this->verify_firebase_id_token($id_token);
        if (is_wp_error($claims)) {
            wp_send_json_error($claims->get_error_message());
            return;
        }
        $email = sanitize_email($claims['email'] ?? '');
        if (!$email || !is_email($email)) {
            wp_send_json_error('Firebase did not return a valid email address.');
            return;
        }
        $display_name = sanitize_text_field($claims['name'] ?? current(explode('@', $email)));
        $picture = esc_url_raw($claims['picture'] ?? '');
        if (!function_exists('curated_vault_set_google_app_session')) {
            wp_send_json_error('Faith In app sessions are unavailable. Please update the plugin files.');
            return;
        }
        $profile = curated_vault_set_google_app_session(array(
            'name' => $display_name ?: current(explode('@', $email)),
            'email' => $email,
            'avatar_url' => $picture,
            'provider' => $provider === 'google' ? 'firebase_google' : 'firebase_password',
            'firebase_uid' => sanitize_text_field($claims['sub'] ?? ''),
        ));
        if (!$profile) {
            wp_send_json_error('Could not start the Faith In app session.');
            return;
        }
        $profile['wp_user_id'] = 0;
        $profile['wordpress_user_created'] = false;
        wp_send_json_success($profile);
    }

    public function google_sign_in() {
        $this->verify_ajax_request();
        if (!$this->rate_limit_request('google_sign_in', 30, 10 * MINUTE_IN_SECONDS)) { return; }
        if (!function_exists('curated_vault_get_settings')) {
            wp_send_json_error('Settings are unavailable.');
            return;
        }
        $settings = curated_vault_get_settings();
        $credential = sanitize_text_field($_POST['credential'] ?? '');
        if (!$credential) {
            wp_send_json_error('Missing Google credential.');
            return;
        }
        if (empty($settings['google_client_id'])) {
            wp_send_json_error('Google sign-in is not configured yet. Add the Google Client ID in Settings > Curated Vault, or switch publishing access mode to Open or Magic Link.');
            return;
        }
        $response = wp_remote_get('https://oauth2.googleapis.com/tokeninfo?id_token=' . rawurlencode($credential), array('timeout' => 20));
        if (is_wp_error($response)) {
            wp_send_json_error('Could not verify the Google sign-in right now.');
            return;
        }
        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);
        if ($code < 200 || $code >= 300 || !is_array($body)) {
            wp_send_json_error('Google sign-in verification failed.');
            return;
        }
        $aud = sanitize_text_field($body['aud'] ?? '');
        $email = sanitize_email($body['email'] ?? '');
        $email_verified = !empty($body['email_verified']) && ($body['email_verified'] === 'true' || $body['email_verified'] === true);
        $hd = sanitize_text_field($body['hd'] ?? '');
        if ($aud !== $settings['google_client_id']) {
            wp_send_json_error('This Google account token is for a different app.');
            return;
        }
        if (!$email || !$email_verified) {
            wp_send_json_error('Google did not return a verified email address.');
            return;
        }
        if (!empty($settings['google_allowed_domain'])) {
            $allowed = strtolower(trim($settings['google_allowed_domain']));
            if (strtolower($hd) !== $allowed && strtolower(substr(strrchr($email, '@') ?: '', 1)) !== $allowed) {
                wp_send_json_error('This Google account is not allowed on this platform.');
                return;
            }
        }
        $display_name = sanitize_text_field($body['name'] ?? current(explode('@', $email)));
        $picture = esc_url_raw($body['picture'] ?? '');

        // v5.5.58: Google sign-in is app-session only. Do not create or log in
        // WordPress users, because WordPress.com then shows visitors in the
        // invite / Secure Sign On user list.
        if (!function_exists('curated_vault_set_google_app_session')) {
            wp_send_json_error('Google app sessions are unavailable. Please update the plugin files.');
            return;
        }
        $profile = curated_vault_set_google_app_session(array(
            'name' => $display_name,
            'email' => $email,
            'avatar_url' => $picture,
            'google_sub' => sanitize_text_field($body['sub'] ?? ''),
        ));
        if (!$profile) {
            wp_send_json_error('Could not start the Google app session.');
            return;
        }
        $profile['wp_user_id'] = 0;
        $profile['wordpress_user_created'] = false;
        wp_send_json_success($profile);
    }

    public function get_session() {
        $this->verify_ajax_request();
        if (function_exists('curated_vault_get_google_app_session')) {
            $session = curated_vault_get_google_app_session();
            if (is_array($session)) { wp_send_json_success($session); return; }
        }
        if (!is_user_logged_in()) {
            wp_send_json_success(array('logged_in' => false));
            return;
        }
        $user = wp_get_current_user();
        wp_send_json_success($this->get_user_profile_payload($user));
    }

    public function follow_user() {
        $this->verify_ajax_request();
        $this->update_follow_relationship($_POST['target_user_id'] ?? 0, 'follow');
    }

    public function unfollow_user() {
        $this->verify_ajax_request();
        $this->update_follow_relationship($_POST['target_user_id'] ?? 0, 'unfollow');
    }


    public function get_verification_status() {
        $this->verify_ajax_request();
        if (!$this->is_effective_logged_in()) {
            wp_send_json_error('Please sign in first.');
            return;
        }

        $user_id = $this->get_effective_author_id();
        $status = function_exists('curated_vault_get_current_verification_status_payload')
            ? curated_vault_get_current_verification_status_payload($user_id)
            : array('verification' => array('show' => false, 'type' => 'none', 'label' => 'Standard', 'settings_label' => 'Standard'));

        wp_send_json_success($status);
    }

    public function request_verification() {
        $this->verify_ajax_request();
        if (!$this->rate_limit_request('request_verification', 5, HOUR_IN_SECONDS)) { return; }
        if (!$this->is_effective_logged_in()) {
            wp_send_json_error('Please sign in first.');
            return;
        }

        $user_id = $this->get_effective_author_id();
        $payload = $this->get_effective_user_payload();
        $note = sanitize_textarea_field(wp_unslash($_POST['note'] ?? ''));
        $requested_for = sanitize_key($_POST['requested_for'] ?? 'manual_review');
        if (!in_array($requested_for, array('manual_review', 'yellow', 'purple', 'blue'), true)) {
            $requested_for = 'manual_review';
        }

        $request = array(
            'status' => 'pending',
            'requested_for' => $requested_for,
            'note' => $note,
            'requested_at' => current_time('mysql'),
            'user_id' => $user_id,
            'name' => sanitize_text_field($payload['name'] ?? ''),
            'email' => sanitize_email($payload['email'] ?? ''),
        );

        $app_session = function_exists('curated_vault_get_google_app_session') ? curated_vault_get_google_app_session() : null;
        $wp_user = get_user_by('id', $user_id);

        if (is_array($app_session) && !empty($app_session['id']) && absint($app_session['id']) === $user_id) {
            if (function_exists('curated_vault_update_google_app_session')) {
                curated_vault_update_google_app_session(array('verification_request' => $request));
            }
        } elseif ($wp_user) {
            update_user_meta($user_id, 'cv_verification_request', $request);
        } else {
            $profile = function_exists('curated_vault_app_profile_by_id') ? curated_vault_app_profile_by_id($user_id) : null;
            if (is_array($profile) && !empty($profile['email']) && function_exists('curated_vault_save_app_profile')) {
                $profile['verification_request'] = $request;
                curated_vault_save_app_profile($profile['email'], $profile);
            }
        }

        $admin_email = get_option('admin_email');
        if ($admin_email && is_email($admin_email)) {
            $subject = 'Faith In verification request';
            $message = "A Faith In member requested verification review.\n\n"
                . 'Name: ' . ($request['name'] ?: 'Unknown') . "\n"
                . 'Email: ' . ($request['email'] ?: 'Unknown') . "\n"
                . 'Requested for: ' . $request['requested_for'] . "\n"
                . 'Note: ' . ($request['note'] ?: '-') . "\n"
                . 'Requested at: ' . $request['requested_at'] . "\n";
            wp_mail($admin_email, $subject, $message);
        }

        $status = function_exists('curated_vault_get_current_verification_status_payload')
            ? curated_vault_get_current_verification_status_payload($user_id)
            : array('verification' => array('show' => false, 'type' => 'none', 'label' => 'Standard', 'settings_label' => 'Standard'), 'request' => $request);
        $status['request'] = $request;

        wp_send_json_success($status);
    }

    public function update_user_settings() {
        $this->verify_ajax_request();
        if (!$this->is_effective_logged_in()) {
            wp_send_json_error('Please sign in first.');
            return;
        }
        $user_id = $this->get_effective_author_id();
        $theme = sanitize_text_field($_POST['theme'] ?? 'light');
        $lang = sanitize_text_field($_POST['lang'] ?? 'English');
        $notifications_raw = $_POST['notifications'] ?? true;
        $settings = array(
            'theme' => in_array($theme, array('light', 'dark'), true) ? $theme : 'light',
            'lang' => in_array($lang, array('English', 'Khmer'), true) ? $lang : 'English',
            'notifications' => filter_var($notifications_raw, FILTER_VALIDATE_BOOLEAN),
        );
        update_user_meta($user_id, 'cv_account_settings', $settings);
        wp_send_json_success(array('settings' => $settings));
    }

    public function logout() {
        $this->verify_ajax_request();
        $had_session = false;
        if (function_exists('curated_vault_get_google_app_session') && curated_vault_get_google_app_session()) {
            $had_session = true;
            curated_vault_clear_google_app_session();
        }
        if (is_user_logged_in()) { $had_session = true; wp_logout(); }
        if (!$had_session) { wp_send_json_error('You are not signed in.'); return; }
        wp_send_json_success('Signed out successfully.');
    }

    public function update_profile() {
        $this->verify_ajax_request();
        if (!$this->rate_limit_request('update_profile', 20, HOUR_IN_SECONDS)) { return; }
        $effective_user_id = $this->get_effective_author_id();
        if (!$effective_user_id) {
            wp_send_json_error('Please sign in first.');
            return;
        }

        $app_session = function_exists('curated_vault_get_google_app_session') ? curated_vault_get_google_app_session() : null;
        $user = get_user_by('id', $effective_user_id);
        $is_app_only_user = is_array($app_session) && !empty($app_session['id']) && (!$user || is_wp_error($user));
        if (!$is_app_only_user) {
            // WordPress users still use normal WP profile storage.
            wp_set_current_user($effective_user_id);
            if (!$user || is_wp_error($user)) {
                wp_send_json_error('Please sign in first.');
                return;
            }
        }
        $display_name = sanitize_text_field($_POST['display_name'] ?? '');
        $gender = sanitize_text_field($_POST['gender'] ?? '');
        $role = sanitize_text_field($_POST['role'] ?? '');
        $location = sanitize_text_field($_POST['location'] ?? '');
        $industry = sanitize_text_field($_POST['industry'] ?? '');
        $church = sanitize_text_field($_POST['church'] ?? '');
        $ministry = sanitize_text_field($_POST['ministry'] ?? '');
        $bio = sanitize_textarea_field($_POST['bio'] ?? '');

        if ($display_name === '') {
            wp_send_json_error('Full name is required.');
            return;
        }

        if (!$is_app_only_user) {
            $result = wp_update_user(array(
                'ID' => $user->ID,
                'display_name' => $display_name,
                'nickname' => $display_name,
                'description' => $bio,
            ));

            if (is_wp_error($result)) {
                wp_send_json_error($result->get_error_message());
                return;
            }

            update_user_meta($user->ID, 'cv_gender', $gender);
            update_user_meta($user->ID, 'cv_role', $role);
            update_user_meta($user->ID, 'cv_location', $location);
            update_user_meta($user->ID, 'cv_industry', $industry);
            update_user_meta($user->ID, 'cv_church', $church);
            update_user_meta($user->ID, 'cv_ministry', $ministry);
        }

        $profile_drive_warning = '';
        $cover_drive_warning = '';
        $app_profile_updates = array(
            'name' => $display_name,
            'gender' => $gender,
            'role' => $role,
            'location' => $location,
            'industry' => $industry,
            'church' => $church,
            'ministry' => $ministry,
            'bio' => $bio,
            'username' => sanitize_title($display_name ?: ($app_session['email'] ?? 'user')),
            'handle' => '@' . sanitize_title($display_name ?: ($app_session['email'] ?? 'user')),
        );
        if (!empty($_FILES['profile_cover']) && !empty($_FILES['profile_cover']['name'])) {
            $incoming_cover_type = !empty($_FILES['profile_cover']['type']) ? sanitize_mime_type($_FILES['profile_cover']['type']) : '';
            if (strpos((string) $incoming_cover_type, 'image/') !== 0) {
                wp_send_json_error('Try Again');
                return;
            }
            $cover_drive_result = self::direct_upload_to_google_drive($_FILES['profile_cover'], array(
                'type' => 'profile_cover',
                'userId' => $effective_user_id,
                'displayName' => $display_name,
            ), array(
                'jpg|jpeg|jpe' => 'image/jpeg',
                'png' => 'image/png',
                'gif' => 'image/gif',
                'webp' => 'image/webp',
                'heic' => 'image/heic',
                'heif' => 'image/heif',
            ), 'cover photo');
            if (is_wp_error($cover_drive_result)) {
                wp_send_json_error('Try Again');
                return;
            }
            $cover_url = esc_url_raw($cover_drive_result['url']);
            if ($is_app_only_user) {
                $cover_updated_at = (string) time();
                $app_profile_updates['cover_url'] = $cover_url;
                $app_profile_updates['cover_image'] = $cover_url;
                $app_profile_updates['cover_updated_at'] = $cover_updated_at;
                $app_profile_updates['profile_cover_updated_at'] = $cover_updated_at;
            } else {
                update_user_meta($user->ID, 'cv_profile_cover_drive_url', $cover_url);
                update_user_meta($user->ID, 'cv_profile_cover_drive_path', sanitize_text_field($cover_drive_result['path'] ?? ''));
                update_user_meta($user->ID, 'cv_profile_cover_image', $cover_url);
                delete_user_meta($user->ID, 'cv_profile_cover_attachment_id');
                update_user_meta($user->ID, 'cv_profile_cover_updated_at', time());
            }
        }

        if (!empty($_FILES['profile_image']) && !empty($_FILES['profile_image']['name'])) {
            $incoming_type = !empty($_FILES['profile_image']['type']) ? sanitize_mime_type($_FILES['profile_image']['type']) : '';
            if (strpos((string) $incoming_type, 'image/') !== 0) {
                wp_send_json_error('Try Again');
                return;
            }
            $profile_drive_result = self::direct_upload_to_google_drive($_FILES['profile_image'], array(
                'type' => 'profile_photo',
                'userId' => $effective_user_id,
                'displayName' => $display_name,
            ), array(
                'jpg|jpeg|jpe' => 'image/jpeg',
                'png' => 'image/png',
                'gif' => 'image/gif',
                'webp' => 'image/webp',
                'heic' => 'image/heic',
                'heif' => 'image/heif',
            ), 'profile photo');
            if (is_wp_error($profile_drive_result)) {
                wp_send_json_error('Try Again');
                return;
            }
            $image_url = esc_url_raw($profile_drive_result['url']);
            if ($is_app_only_user) {
                $avatar_updated_at = (string) time();
                $app_profile_updates['avatar_url'] = $image_url;
                $app_profile_updates['avatar'] = $image_url;
                $app_profile_updates['profile_image_url'] = $image_url;
                $app_profile_updates['profile_image'] = $image_url;
                $app_profile_updates['photo_url'] = $image_url;
                $app_profile_updates['photoURL'] = $image_url;
                $app_profile_updates['picture'] = $image_url;
                $app_profile_updates['avatar_updated_at'] = $avatar_updated_at;
                $app_profile_updates['profile_picture_updated_at'] = $avatar_updated_at;
            } else {
                update_user_meta($user->ID, 'cv_profile_picture_drive_url', $image_url);
                update_user_meta($user->ID, 'cv_profile_picture_drive_path', sanitize_text_field($profile_drive_result['path'] ?? ''));
                update_user_meta($user->ID, 'cv_profile_picture', $image_url);
                delete_user_meta($user->ID, 'cv_profile_picture_attachment_id');
                update_user_meta($user->ID, 'cv_profile_picture_updated_at', time());
            }
        }

        if ($is_app_only_user) {
            $updated_profile = function_exists('curated_vault_update_google_app_session') ? curated_vault_update_google_app_session($app_profile_updates) : array_merge($app_session, $app_profile_updates);
            wp_send_json_success(array(
                'message' => 'Success',
                'drive_warning' => '',
                'user' => $updated_profile,
            ));
            return;
        }
        $updated_user = get_user_by('id', $user->ID);
        wp_send_json_success(array(
            'message' => 'Success',
            'drive_warning' => '',
            'user' => $this->get_user_profile_payload($updated_user),
        ));
    }


    private function social_verify_nonce() {
        $this->verify_ajax_request();
    }

    private function social_follow_meta_update($follower_id, $following_id, $mode = 'follow') {
        $follower_id = absint($follower_id);
        $following_id = absint($following_id);

        $following = function_exists('curated_vault_social_get_ids') ? curated_vault_social_get_ids($follower_id, 'following') : array();
        $followers = function_exists('curated_vault_social_get_ids') ? curated_vault_social_get_ids($following_id, 'followers') : array();

        if ($mode === 'unfollow') {
            $following = array_values(array_diff($following, array($following_id)));
            $followers = array_values(array_diff($followers, array($follower_id)));
        } else {
            if (!in_array($following_id, $following, true)) { $following[] = $following_id; }
            if (!in_array($follower_id, $followers, true)) { $followers[] = $follower_id; }
        }

        if (function_exists('curated_vault_social_set_ids')) {
            curated_vault_social_set_ids($follower_id, 'following', $following);
            curated_vault_social_set_ids($following_id, 'followers', $followers);
        }
    }

    private function social_send_follow_payload($target_user_id) {
        $target_user_id = absint($target_user_id);
        $current_user_id = $this->get_effective_author_id();

        wp_send_json_success(array(
            'target_user' => curated_vault_social_user_summary($target_user_id),
            'is_following' => $current_user_id ? curated_vault_social_is_following($current_user_id, $target_user_id) : false,
            'current_user_counts' => $current_user_id ? curated_vault_social_counts($current_user_id) : array('followers' => 0, 'following' => 0),
            'followers' => curated_vault_social_list($target_user_id, 'followers', 50),
            'following' => curated_vault_social_list($target_user_id, 'following', 50),
        ));
    }

    public function social_follow_user() {
        $this->social_verify_nonce();
        if (!$this->is_effective_logged_in()) {
            wp_send_json_error(array('message' => 'Please sign in to follow users.'));
        }

        $follower_id = $this->get_effective_author_id();
        $following_id = absint($_POST['user_id'] ?? 0);

        if (!$following_id || (function_exists('curated_vault_social_entity_exists') && !curated_vault_social_entity_exists($following_id))) {
            wp_send_json_error(array('message' => 'User not found.'));
        }

        if ($follower_id === $following_id) {
            wp_send_json_error(array('message' => 'You cannot follow yourself.'));
        }

        $this->social_follow_meta_update($follower_id, $following_id, 'follow');
        $this->social_send_follow_payload($following_id);
    }

    public function social_unfollow_user() {
        $this->social_verify_nonce();
        if (!$this->is_effective_logged_in()) {
            wp_send_json_error(array('message' => 'Please sign in to unfollow users.'));
        }

        $follower_id = $this->get_effective_author_id();
        $following_id = absint($_POST['user_id'] ?? 0);

        if (!$following_id || (function_exists('curated_vault_social_entity_exists') && !curated_vault_social_entity_exists($following_id))) {
            wp_send_json_error(array('message' => 'User not found.'));
        }

        if ($follower_id === $following_id) {
            wp_send_json_error(array('message' => 'You cannot unfollow yourself.'));
        }

        $this->social_follow_meta_update($follower_id, $following_id, 'unfollow');
        $this->social_send_follow_payload($following_id);
    }

    public function social_get_followers() {
        $this->social_verify_nonce();
        $user_id = absint($_POST['user_id'] ?? $this->get_effective_author_id());
        if (!$user_id || (function_exists('curated_vault_social_entity_exists') && !curated_vault_social_entity_exists($user_id))) {
            wp_send_json_error(array('message' => 'User not found.'), 404);
        }

        wp_send_json_success(array(
            'items' => curated_vault_social_list($user_id, 'followers', 100),
            'counts' => curated_vault_social_counts($user_id),
        ));
    }

    public function social_get_following() {
        $this->social_verify_nonce();
        $user_id = absint($_POST['user_id'] ?? $this->get_effective_author_id());
        if (!$user_id || (function_exists('curated_vault_social_entity_exists') && !curated_vault_social_entity_exists($user_id))) {
            wp_send_json_error(array('message' => 'User not found.'), 404);
        }

        wp_send_json_success(array(
            'items' => curated_vault_social_list($user_id, 'following', 100),
            'counts' => curated_vault_social_counts($user_id),
        ));
    }

    public function social_follow_status() {
        $this->social_verify_nonce();
        $user_id = absint($_POST['user_id'] ?? 0);
        if (!$user_id || (function_exists('curated_vault_social_entity_exists') && !curated_vault_social_entity_exists($user_id))) {
            wp_send_json_error(array('message' => 'User not found.'), 404);
        }

        $current_user_id = $this->get_effective_author_id();
        wp_send_json_success(array(
            'target_user' => curated_vault_social_user_summary($user_id),
            'is_following' => $current_user_id ? curated_vault_social_is_following($current_user_id, $user_id) : false,
            'is_self' => $current_user_id && $current_user_id === $user_id,
            'counts' => curated_vault_social_counts($user_id),
        ));
    }


    private function bible_verify_read_request() {
        return $this->verify_ajax_request();
    }

    public function bible_get_verses() {
        $this->bible_verify_read_request();
        $book = sanitize_text_field(wp_unslash($_POST['book'] ?? 'John'));
        $chapter = sanitize_text_field(wp_unslash($_POST['chapter'] ?? '1'));
        $version = sanitize_text_field(wp_unslash($_POST['version'] ?? 'KJV'));
        if (class_exists('CV_Bible_Service')) {
            wp_send_json_success(CV_Bible_Service::get_chapter($book, $chapter, $version));
        }
        wp_send_json_error(array('message' => 'Bible backend service is not loaded.'));
    }

    public function bible_dictionary() {
        $this->bible_verify_read_request();
        $query = sanitize_text_field(wp_unslash($_POST['query'] ?? ''));
        $version = sanitize_text_field(wp_unslash($_POST['version'] ?? 'KJV'));
        if (class_exists('CV_Bible_Service')) {
            $result = CV_Bible_Service::search($query, $version, 20);
            $item = isset($result['word']) ? $result['word'] : null;
            wp_send_json_success(array(
                'query' => $query,
                'item' => $item,
                'items' => $result['items'] ?? array(),
                'source' => $result['source'] ?? 'backend',
            ));
        }
        wp_send_json_error(array('message' => 'Bible search backend service is not loaded.'));
    }

    public function bible_get_quotes() {
        $this->bible_verify_read_request();
        $type = sanitize_text_field(wp_unslash($_POST['type'] ?? 'General'));
        $items = class_exists('CV_Bible_Service') ? CV_Bible_Service::quotes($type) : array();
        wp_send_json_success(array('items' => $items));
    }

    public function bible_get_media() {
        $this->bible_verify_read_request();
        if (class_exists('CV_Bible_Service')) {
            wp_send_json_success(CV_Bible_Service::get_media());
        }
        wp_send_json_success(array('items' => array()));
    }

    public function bible_search() {
        $this->bible_verify_read_request();
        $query = sanitize_text_field(wp_unslash($_POST['query'] ?? ''));
        $version = sanitize_text_field(wp_unslash($_POST['version'] ?? 'KJV'));
        $result = class_exists('CV_Bible_Service') ? CV_Bible_Service::search($query, $version, 25) : array('items' => array());
        wp_send_json_success($result);
    }

    public function bible_save_typing_score() {
        if (!$this->verify_ajax_request()) { return; }
        if (!$this->is_effective_logged_in()) {
            wp_send_json_error(array('message' => 'Please sign in to save typing scores.'));
        }
        $reference = sanitize_text_field(wp_unslash($_POST['reference'] ?? ''));
        $wpm = absint($_POST['wpm'] ?? 0);
        $accuracy = absint($_POST['accuracy'] ?? 0);
        if (class_exists('CV_Bible_Service')) {
            CV_Bible_Service::save_typing_score($this->get_effective_author_id(), $reference, $wpm, $accuracy);
        }
        wp_send_json_success(array('reference' => $reference, 'wpm' => $wpm, 'accuracy' => $accuracy));
    }

    public function bible_get_notes() {
        if (!$this->verify_ajax_request()) { return; }
        if (!$this->is_effective_logged_in()) {
            wp_send_json_error(array('message' => 'Please sign in to load notes.'));
        }
        $user_id = $this->get_effective_author_id();
        $notes = get_user_meta($user_id, 'cv_bible_sermon_notes', true);
        $notes = is_array($notes) ? $notes : array('Doctrine' => '', 'Encouragement' => '', 'Application' => '');
        $stats = get_user_meta($user_id, 'cv_bible_dashboard_stats', true);
        $stats = is_array($stats) ? $stats : array('streak' => 5, 'weeks' => 17);
        wp_send_json_success(array('notes' => $notes, 'stats' => $stats));
    }

    public function bible_save_notes() {
        if (!$this->verify_ajax_request()) { return; }
        if (!$this->is_effective_logged_in()) {
            wp_send_json_error(array('message' => 'Please sign in to save notes.'));
        }
        $notes = $_POST['notes'] ?? array();
        if (is_string($notes)) {
            $decoded = json_decode(wp_unslash($notes), true);
            $notes = is_array($decoded) ? $decoded : array();
        }
        $clean = array(
            'Doctrine' => sanitize_textarea_field(wp_unslash($notes['Doctrine'] ?? '')),
            'Encouragement' => sanitize_textarea_field(wp_unslash($notes['Encouragement'] ?? '')),
            'Application' => sanitize_textarea_field(wp_unslash($notes['Application'] ?? '')),
        );
        update_user_meta($this->get_effective_author_id(), 'cv_bible_sermon_notes', $clean);
        wp_send_json_success(array('notes' => $clean));
    }

    public function bible_save_stats() {
        if (!$this->verify_ajax_request()) { return; }
        if (!$this->is_effective_logged_in()) {
            wp_send_json_error(array('message' => 'Please sign in to save stats.'));
        }
        $stats = array('streak' => max(0, absint($_POST['streak'] ?? 5)), 'weeks' => max(0, absint($_POST['weeks'] ?? 17)));
        update_user_meta($this->get_effective_author_id(), 'cv_bible_dashboard_stats', $stats);
        wp_send_json_success(array('stats' => $stats));
    }

    public function bible_ai_image() {
        if (!$this->verify_ajax_request()) { return; }
        if (!$this->require_effective_login('Please sign in to generate AI images.')) { return; }
        if (!$this->rate_limit_request('bible_ai_image', 6, HOUR_IN_SECONDS)) { return; }
        $prompt = sanitize_textarea_field(wp_unslash($_POST['prompt'] ?? ''));
        if (!$prompt) {
            wp_send_json_error(array('message' => 'Please enter an image prompt first.'));
        }

        $api_key = defined('CV_GEMINI_API_KEY') ? trim((string) CV_GEMINI_API_KEY) : '';
        if ($api_key === '') {
            $api_key = trim((string) get_option('cv_gemini_api_key', ''));
        }
        if (!$api_key) {
            wp_send_json_error(array('message' => 'Gemini API key is not configured.'));
        }

        $instruction = 'Create a beautiful 1080x1080 social-media background image for a Bible verse design. IMPORTANT: do not add any words, captions, Bible references, letters, logos, or watermarks inside the image. Visual style should be elegant, peaceful, inspiring, and suitable behind scripture text. Prompt: ' . $prompt;
        $payload = array(
            'contents' => array(
                array(
                    'parts' => array(
                        array('text' => $instruction),
                    ),
                ),
            ),
            'generationConfig' => array(
                'responseModalities' => array('TEXT', 'IMAGE'),
            ),
        );

        $models = array(
            'gemini-2.0-flash-preview-image-generation',
            'gemini-2.0-flash-exp-image-generation',
        );
        $last_message = 'Gemini image generation failed.';

        foreach ($models as $model) {
            $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($model) . ':generateContent?key=' . rawurlencode($api_key);
            $response = wp_remote_post($endpoint, array(
                'timeout' => 90,
                'headers' => array('Content-Type' => 'application/json'),
                'body' => wp_json_encode($payload),
            ));

            if (is_wp_error($response)) {
                $last_message = $response->get_error_message();
                continue;
            }

            $code = (int) wp_remote_retrieve_response_code($response);
            $body = (string) wp_remote_retrieve_body($response);
            $data = json_decode($body, true);

            if ($code >= 400) {
                if (!empty($data['error']['message'])) {
                    $last_message = sanitize_text_field($data['error']['message']);
                } else {
                    $last_message = 'Gemini returned HTTP ' . $code . '.';
                }
                continue;
            }

            $parts = array();
            if (!empty($data['candidates']) && is_array($data['candidates'])) {
                foreach ($data['candidates'] as $candidate) {
                    if (!empty($candidate['content']['parts']) && is_array($candidate['content']['parts'])) {
                        $parts = array_merge($parts, $candidate['content']['parts']);
                    }
                }
            }

            foreach ($parts as $part) {
                if (!empty($part['inlineData']['data'])) {
                    $mime = !empty($part['inlineData']['mimeType']) ? sanitize_text_field($part['inlineData']['mimeType']) : 'image/png';
                    $image = 'data:' . $mime . ';base64,' . $part['inlineData']['data'];
                    wp_send_json_success(array(
                        'image' => $image,
                        'model' => $model,
                        'message' => 'Background generated with Gemini.',
                    ));
                }
            }

            foreach ($parts as $part) {
                if (!empty($part['text'])) {
                    $last_message = sanitize_text_field($part['text']);
                    break;
                }
            }
        }

        wp_send_json_error(array('message' => $last_message));
    }

}
