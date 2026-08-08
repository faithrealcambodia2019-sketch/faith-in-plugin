<?php
/**
 * Social MVP database layer.
 *
 * @package CuratedVault
 */

if (!defined('ABSPATH')) {
    exit;
}

class CV_Social_DB {
    public static function table($name) {
        global $wpdb;
        return $wpdb->prefix . 'cv_social_' . sanitize_key($name);
    }

    public static function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        $posts = self::table('posts');
        $comments = self::table('comments');
        $reactions = self::table('reactions');
        $follows = $wpdb->prefix . 'cv_social_follows';
        $notifications = self::table('notifications');
        $threads = self::table('message_threads');
        $thread_members = self::table('message_thread_members');
        $messages = self::table('messages');

        $sql = array();
        $sql[] = "CREATE TABLE {$posts} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            author_id BIGINT UNSIGNED NOT NULL,
            content LONGTEXT NOT NULL,
            media_attachment_id BIGINT UNSIGNED DEFAULT 0,
            media_url TEXT NULL,
            media_type VARCHAR(20) DEFAULT 'none',
            visibility VARCHAR(20) DEFAULT 'public',
            status VARCHAR(20) DEFAULT 'publish',
            comment_count BIGINT UNSIGNED DEFAULT 0,
            reaction_count BIGINT UNSIGNED DEFAULT 0,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NULL,
            PRIMARY KEY (id),
            KEY author_id (author_id),
            KEY visibility_status_created (visibility, status, created_at),
            KEY created_at (created_at)
        ) {$charset_collate};";

        $sql[] = "CREATE TABLE {$comments} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            post_id BIGINT UNSIGNED NOT NULL,
            parent_id BIGINT UNSIGNED DEFAULT 0,
            author_id BIGINT UNSIGNED NOT NULL,
            content LONGTEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'publish',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NULL,
            PRIMARY KEY (id),
            KEY post_id (post_id),
            KEY parent_id (parent_id),
            KEY author_id (author_id),
            KEY status_created (status, created_at)
        ) {$charset_collate};";

        $sql[] = "CREATE TABLE {$reactions} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            object_type VARCHAR(20) NOT NULL DEFAULT 'post',
            object_id BIGINT UNSIGNED NOT NULL,
            user_id BIGINT UNSIGNED NOT NULL,
            reaction VARCHAR(20) NOT NULL DEFAULT 'like',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY object_user (object_type, object_id, user_id),
            KEY user_id (user_id),
            KEY reaction (reaction)
        ) {$charset_collate};";

        $sql[] = "CREATE TABLE {$follows} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            follower_id BIGINT UNSIGNED NOT NULL,
            following_id BIGINT UNSIGNED NOT NULL,
            status VARCHAR(20) DEFAULT 'accepted',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY follower_following (follower_id, following_id),
            KEY follower_id (follower_id),
            KEY following_id (following_id),
            KEY status (status),
            KEY created_at (created_at)
        ) {$charset_collate};";

        $sql[] = "CREATE TABLE {$notifications} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT UNSIGNED NOT NULL,
            actor_id BIGINT UNSIGNED DEFAULT 0,
            type VARCHAR(50) NOT NULL,
            object_type VARCHAR(50) DEFAULT '',
            object_id BIGINT UNSIGNED DEFAULT 0,
            message TEXT NULL,
            is_read TINYINT(1) DEFAULT 0,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_read_created (user_id, is_read, created_at),
            KEY actor_id (actor_id),
            KEY object_lookup (object_type, object_id)
        ) {$charset_collate};";

        $sql[] = "CREATE TABLE {$threads} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            created_by BIGINT UNSIGNED NOT NULL,
            last_message_at DATETIME NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY created_by (created_by),
            KEY last_message_at (last_message_at)
        ) {$charset_collate};";

        $sql[] = "CREATE TABLE {$thread_members} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            thread_id BIGINT UNSIGNED NOT NULL,
            user_id BIGINT UNSIGNED NOT NULL,
            last_read_at DATETIME NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY thread_user (thread_id, user_id),
            KEY user_id (user_id)
        ) {$charset_collate};";

        $sql[] = "CREATE TABLE {$messages} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            thread_id BIGINT UNSIGNED NOT NULL,
            sender_id BIGINT UNSIGNED NOT NULL,
            body LONGTEXT NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY thread_created (thread_id, created_at),
            KEY sender_id (sender_id)
        ) {$charset_collate};";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        foreach ($sql as $statement) {
            dbDelta($statement);
        }
    }

    public static function user_payload($user_id) {
        $user_id = absint($user_id);
        if (!$user_id) {
            return null;
        }

        // FaithIn uses two identity types: normal WordPress users and app-session
        // users created by Google/Firebase sign-in. Keep message/profile payloads
        // consistent with the rest of the platform by resolving both here.
        if (function_exists('curated_vault_social_user_summary')) {
            $summary = curated_vault_social_user_summary($user_id);
            if (is_array($summary) && !empty($summary['id'])) {
                return $summary;
            }
        }

        $user = get_user_by('id', $user_id);
        if (!$user) {
            return null;
        }

        $name = $user->display_name ? $user->display_name : $user->user_login;
        $avatar = function_exists('curated_vault_get_user_avatar_url') ? curated_vault_get_user_avatar_url($user_id, 96) : get_avatar_url($user_id, array('size' => 96));
        return array(
            'id' => $user_id,
            'app_user' => false,
            'name' => $name,
            'handle' => '@' . sanitize_title($user->user_login),
            'avatar_url' => esc_url_raw($avatar),
            'bio' => (string) get_user_meta($user_id, 'description', true),
            'role' => (string) get_user_meta($user_id, 'cv_role', true),
            'church' => (string) get_user_meta($user_id, 'cv_church', true),
            'ministry' => (string) get_user_meta($user_id, 'cv_ministry', true),
        );
    }

    public static function notify($user_id, $actor_id, $type, $object_type = '', $object_id = 0, $message = '') {
        global $wpdb;
        $user_id = absint($user_id);
        $actor_id = absint($actor_id);
        if (!$user_id || $user_id === $actor_id) {
            return false;
        }
        return $wpdb->insert(
            self::table('notifications'),
            array(
                'user_id' => $user_id,
                'actor_id' => $actor_id,
                'type' => sanitize_key($type),
                'object_type' => sanitize_key($object_type),
                'object_id' => absint($object_id),
                'message' => sanitize_text_field($message),
                'created_at' => current_time('mysql'),
            ),
            array('%d', '%d', '%s', '%s', '%d', '%s', '%s')
        );
    }
}
