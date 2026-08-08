<?php
/**
 * Faith In uninstall handler.
 *
 * By default this keeps user-generated content safe and only removes plugin
 * options. To fully delete plugin data, define CURATED_VAULT_DELETE_ALL_DATA
 * as true in wp-config.php before uninstalling.
 *
 * v5.5.190: extended the drop list to include every social table created by
 * CV_Social_DB (posts, comments, reactions, notifications, message threads,
 * thread members, messages, and the follows table).
 */
if (!defined('WP_UNINSTALL_PLUGIN')) { exit; }

// Options are always cleared on uninstall - they don't hold user content.
$option_names = array(
    'curated_vault_settings',
    'curated_vault_version',
    'curated_vault_google_drive_upload_url',
    'curated_vault_google_drive_shared_secret',
    'curated_vault_media_storage_destination',
    'curated_vault_firebase_storage_settings',
    'curated_vault_install_sample_data',
    'cv_gemini_api_key',
    'cv_app_profile_index',
);
foreach ($option_names as $option_name) {
    delete_option($option_name);
}

if (defined('CURATED_VAULT_DELETE_ALL_DATA') && CURATED_VAULT_DELETE_ALL_DATA) {
    global $wpdb;

    // Core CV tables (created by CV_Database::create_tables).
    $core_tables = array(
        'cv_resources',
        'cv_posts',
        'cv_post_comments',
        'cv_prayers',
        'cv_jobs',
        'cv_user_prefs',
        'cv_bible_quotes',
        'cv_bible_notes',
        'cv_bible_bookmarks',
        'cv_bible_typing_scores',
    );

    // Social tables (created by CV_Social_DB::create_tables). Previously
    // these were left orphaned in the database after uninstall.
    $social_tables = array(
        'cv_social_posts',
        'cv_social_comments',
        'cv_social_reactions',
        'cv_social_follows',
        'cv_social_notifications',
        'cv_social_message_threads',
        'cv_social_message_thread_members',
        'cv_social_messages',
    );

    foreach (array_merge($core_tables, $social_tables) as $table) {
        // Table names are static strings prefixed with $wpdb->prefix - safe to
        // interpolate directly. wpdb->query cannot prepare DDL.
        $wpdb->query('DROP TABLE IF EXISTS ' . $wpdb->prefix . $table);
    }

    // App-session profile blobs are stored as individual options.
    $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE 'cv_app_profile_%'");

    // Transient rate-limit buckets and magic-link tokens.
    $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '\\_transient\\_cv\\_rl\\_%' ESCAPE '\\\\'");
    $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '\\_transient\\_timeout\\_cv\\_rl\\_%' ESCAPE '\\\\'");
    $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '\\_transient\\_cv\\_magic\\_%' ESCAPE '\\\\'");
    $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '\\_transient\\_timeout\\_cv\\_magic\\_%' ESCAPE '\\\\'");
}
