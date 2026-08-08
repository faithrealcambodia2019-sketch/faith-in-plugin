<?php
if (!defined('ABSPATH')) { exit; }
class CV_Database {
    public static function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        $table_resources = $wpdb->prefix . 'cv_resources';
        $sql_resources = "CREATE TABLE $table_resources (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            title text NOT NULL,
            description text,
            type varchar(50) NOT NULL,
            format varchar(20) NOT NULL,
            category varchar(100) NOT NULL,
            audience varchar(100),
            size varchar(20),
            language varchar(50) DEFAULT 'English',
            translated tinyint(1) DEFAULT 0,
            available_languages text,
            author_id bigint(20) unsigned NOT NULL DEFAULT 0,
            contributor_name varchar(190),
            contributor_role varchar(190),
            contributor_church varchar(190),
            contributor_ministry varchar(190),
            drive_path text,
            country varchar(100) DEFAULT 'Global',
            downloads int DEFAULT 0,
            views int DEFAULT 0,
            tags text,
            featured tinyint(1) DEFAULT 0,
            file_url text,
            image_url text,
            timestamp datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY author_id (author_id),
            KEY category (category),
            KEY timestamp (timestamp),
            KEY downloads_views (downloads, views)
        ) $charset_collate;";

        $table_posts = $wpdb->prefix . 'cv_posts';
        $sql_posts = "CREATE TABLE $table_posts (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            author_id bigint(20) unsigned NOT NULL,
            content longtext NOT NULL,
            type varchar(20) DEFAULT 'text',
            title text,
            excerpt text,
            cover_image_url text,
            cover_media_id bigint(20) unsigned DEFAULT 0,
            cover_media_url text,
            cover_drive_url text,
            cover_drive_path text,
            media_json longtext,
            media_type varchar(20) DEFAULT 'image',
            contributor_name varchar(190),
            contributor_role varchar(190),
            contributor_church varchar(190),
            contributor_ministry varchar(190),
            post_visibility varchar(20) DEFAULT 'public',
            likes int DEFAULT 0,
            comments int DEFAULT 0,
            reposts int DEFAULT 0,
            shares int DEFAULT 0,
            timestamp datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY author_id (author_id),
            KEY post_visibility (post_visibility),
            KEY timestamp (timestamp),
            KEY type (type)
        ) $charset_collate;";

        $table_post_comments = $wpdb->prefix . 'cv_post_comments';
        $sql_post_comments = "CREATE TABLE $table_post_comments (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            post_id mediumint(9) NOT NULL,
            author_id bigint(20) unsigned NOT NULL,
            content text NOT NULL,
            media_attachment_id bigint(20) unsigned DEFAULT 0,
            media_url text,
            media_drive_url text,
            media_drive_path text,
            media_type varchar(20) DEFAULT 'none',
            status varchar(20) DEFAULT 'publish',
            timestamp datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY post_id (post_id),
            KEY author_id (author_id),
            KEY status (status),
            KEY timestamp (timestamp)
        ) $charset_collate;";

        $table_prayers = $wpdb->prefix . 'cv_prayers';
        $sql_prayers = "CREATE TABLE $table_prayers (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            author_id bigint(20) unsigned NOT NULL,
            content text NOT NULL,
            prayed_count int DEFAULT 0,
            urgent tinyint(1) DEFAULT 0,
            timestamp datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY author_id (author_id),
            KEY urgent (urgent),
            KEY timestamp (timestamp)
        ) $charset_collate;";

        $table_jobs = $wpdb->prefix . 'cv_jobs';
        $sql_jobs = "CREATE TABLE $table_jobs (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            author_id bigint(20) unsigned NOT NULL DEFAULT 0,
            title varchar(190) NOT NULL,
            organization varchar(190) NOT NULL,
            location varchar(190) DEFAULT '',
            job_type varchar(50) DEFAULT 'Full-time',
            description longtext,
            apply_url text,
            contact_email varchar(190),
            timestamp datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY author_id (author_id),
            KEY job_type (job_type),
            KEY location (location),
            KEY timestamp (timestamp)
        ) $charset_collate;";

        $table_user_prefs = $wpdb->prefix . 'cv_user_prefs';
        $sql_user_prefs = "CREATE TABLE $table_user_prefs (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            bookmarks text,
            downloads text,
            favorites text,
            settings text,
            PRIMARY KEY (id),
            UNIQUE KEY user_id (user_id)
        ) $charset_collate;";


        $table_bible_quotes = $wpdb->prefix . 'cv_bible_quotes';
        $sql_bible_quotes = "CREATE TABLE $table_bible_quotes (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            quote_type varchar(30) NOT NULL DEFAULT 'general',
            quote_text text NOT NULL,
            author varchar(190) DEFAULT '',
            category varchar(100) DEFAULT '',
            source varchar(190) DEFAULT '',
            tags text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY quote_type (quote_type),
            KEY category (category)
        ) $charset_collate;";

        $table_bible_notes = $wpdb->prefix . 'cv_bible_notes';
        $sql_bible_notes = "CREATE TABLE $table_bible_notes (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            reference varchar(190) DEFAULT '',
            note_title varchar(190) DEFAULT '',
            note_body longtext,
            tags text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY reference (reference)
        ) $charset_collate;";

        $table_bible_bookmarks = $wpdb->prefix . 'cv_bible_bookmarks';
        $sql_bible_bookmarks = "CREATE TABLE $table_bible_bookmarks (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            reference varchar(190) NOT NULL,
            verse_text text,
            color varchar(30) DEFAULT '',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY reference (reference)
        ) $charset_collate;";

        $table_bible_typing_scores = $wpdb->prefix . 'cv_bible_typing_scores';
        $sql_bible_typing_scores = "CREATE TABLE $table_bible_typing_scores (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            reference varchar(190) NOT NULL,
            wpm int DEFAULT 0,
            accuracy int DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY reference (reference)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_resources);
        dbDelta($sql_posts);
        dbDelta($sql_post_comments);
        dbDelta($sql_prayers);
        dbDelta($sql_jobs);
        dbDelta($sql_user_prefs);
        dbDelta($sql_bible_quotes);
        dbDelta($sql_bible_notes);
        dbDelta($sql_bible_bookmarks);
        dbDelta($sql_bible_typing_scores);

        // SAMPLE DATA (v5.5.190): only seed demo rows when an admin has
        // explicitly opted in via the option curated_vault_install_sample_data
        // or the constant CURATED_VAULT_INSTALL_SAMPLE_DATA. Production sites
        // no longer get a hard-coded "Youth Pastor" job or sample resource on
        // first activation.
        $should_seed = (defined('CURATED_VAULT_INSTALL_SAMPLE_DATA') && CURATED_VAULT_INSTALL_SAMPLE_DATA)
            || (bool) get_option('curated_vault_install_sample_data', false);
        if ($should_seed) {
            self::insert_sample_data();
        }
    }

    private static function insert_sample_data() {
        global $wpdb;
        $table_resources = $wpdb->prefix . 'cv_resources';
        $sample_resource = $wpdb->get_var("SELECT id FROM $table_resources LIMIT 1");
        if (!$sample_resource) {
            $wpdb->insert($table_resources, array(
                'title' => 'Welcome to Faith In - Quick Start Guide',
                'description' => 'A getting started guide on using the global repository.',
                'type' => 'Document (PDF)',
                'format' => 'pdf',
                'category' => 'History',
                'audience' => 'Global Church',
                'size' => '1 MB',
                'language' => 'English',
                'author_id' => 1,
                'contributor_name' => 'Faith In Team',
                'contributor_role' => 'Admin',
                'contributor_church' => 'Global Church',
                'contributor_ministry' => 'Resources',
                'downloads' => 50,
                'views' => 120,
                'tags' => 'New, Guide',
                'featured' => 1,
                'image_url' => 'https://images.unsplash.com/photo-1455390582262-044cdead27d8?q=80&w=800&auto=format&fit=crop',
                'file_url' => 'https://example.com/sample.pdf'
            ));
        }
        $table_jobs = $wpdb->prefix . 'cv_jobs';
        $sample_job = $wpdb->get_var("SELECT id FROM $table_jobs LIMIT 1");
        if (!$sample_job) {
            $wpdb->insert($table_jobs, array(
                'author_id' => 1,
                'title' => 'Youth Pastor',
                'organization' => 'Grace Community Church',
                'location' => 'Phnom Penh, Cambodia',
                'job_type' => 'Full-time',
                'description' => 'Lead youth ministry, disciple students, and help coordinate weekly gatherings and outreach.',
                'contact_email' => get_option('admin_email')
            ));
        }

        $table_bible_quotes = $wpdb->prefix . 'cv_bible_quotes';
        $sample_quote = $wpdb->get_var("SELECT id FROM $table_bible_quotes LIMIT 1");
        if (!$sample_quote) {
            $quotes = array(
                array('general', 'Faith does not eliminate questions. But faith knows where to take them.', 'Elisabeth Elliot', 'Faith'),
                array('general', 'God is most glorified in us when we are most satisfied in Him.', 'John Piper', 'Worship'),
                array('general', 'To be a Christian without prayer is no more possible than to be alive without breathing.', 'Martin Luther', 'Prayer'),
                array('preacher', 'He is no fool who gives what he cannot keep to gain what he cannot lose.', 'Jim Elliot', 'Mission'),
                array('preacher', 'If you are not seeking the Lord, the Devil is seeking you.', 'Charles Spurgeon', 'Warning')
            );
            foreach ($quotes as $quote) {
                $wpdb->insert($table_bible_quotes, array(
                    'quote_type' => $quote[0],
                    'quote_text' => $quote[1],
                    'author' => $quote[2],
                    'category' => $quote[3],
                    'source' => 'Faith In starter data'
                ));
            }
        }
    }

    public static function drop_tables() {
        global $wpdb;
        $tables = array($wpdb->prefix . 'cv_resources',$wpdb->prefix . 'cv_posts',$wpdb->prefix . 'cv_post_comments',$wpdb->prefix . 'cv_prayers',$wpdb->prefix . 'cv_jobs',$wpdb->prefix . 'cv_user_prefs',$wpdb->prefix . 'cv_bible_quotes',$wpdb->prefix . 'cv_bible_notes',$wpdb->prefix . 'cv_bible_bookmarks',$wpdb->prefix . 'cv_bible_typing_scores');
        foreach ($tables as $table) {
            $wpdb->query("DROP TABLE IF EXISTS $table");
        }
    }
}
