<?php
/**
 * Social MVP REST API.
 *
 * @package CuratedVault
 */

if (!defined('ABSPATH')) {
    exit;
}

class CV_Social_REST {
    const NAMESPACE = 'curated-vault/v1';

    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes() {
        register_rest_route(self::NAMESPACE, '/social/me', array(
            'methods' => WP_REST_Server::READABLE,
            'callback' => array($this, 'me'),
            'permission_callback' => array($this, 'can_read'),
        ));

        register_rest_route(self::NAMESPACE, '/social/profile/(?P<id>\d+)', array(
            'methods' => WP_REST_Server::READABLE,
            'callback' => array($this, 'profile'),
            'permission_callback' => array($this, 'can_read'),
            'args' => array('id' => array('sanitize_callback' => 'absint')),
        ));

        register_rest_route(self::NAMESPACE, '/social/feed', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'feed'),
                'permission_callback' => array($this, 'can_read'),
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'create_post'),
                'permission_callback' => array($this, 'must_be_logged_in'),
            ),
        ));

        register_rest_route(self::NAMESPACE, '/social/posts/(?P<id>\d+)/react', array(
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => array($this, 'react_to_post'),
            'permission_callback' => array($this, 'must_be_logged_in'),
            'args' => array('id' => array('sanitize_callback' => 'absint')),
        ));

        register_rest_route(self::NAMESPACE, '/social/posts/(?P<id>\d+)/comments', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'comments'),
                'permission_callback' => array($this, 'can_read'),
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'create_comment'),
                'permission_callback' => array($this, 'must_be_logged_in'),
            ),
        ));

        register_rest_route(self::NAMESPACE, '/social/follow/(?P<id>\d+)', array(
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => array($this, 'follow'),
            'permission_callback' => array($this, 'must_be_logged_in'),
            'args' => array('id' => array('sanitize_callback' => 'absint')),
        ));

        register_rest_route(self::NAMESPACE, '/social/notifications', array(
            'methods' => WP_REST_Server::READABLE,
            'callback' => array($this, 'notifications'),
            'permission_callback' => array($this, 'must_be_logged_in'),
        ));

        register_rest_route(self::NAMESPACE, '/social/notifications/count', array(
            'methods' => WP_REST_Server::READABLE,
            'callback' => array($this, 'notification_count'),
            'permission_callback' => array($this, 'must_be_logged_in'),
        ));

        register_rest_route(self::NAMESPACE, '/social/notifications/read', array(
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => array($this, 'mark_notifications_read'),
            'permission_callback' => array($this, 'must_be_logged_in'),
        ));

        register_rest_route(self::NAMESPACE, '/social/users/search', array(
            'methods' => WP_REST_Server::READABLE,
            'callback' => array($this, 'search_users'),
            'permission_callback' => array($this, 'must_be_logged_in'),
        ));

        register_rest_route(self::NAMESPACE, '/social/messages/threads', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'message_threads'),
                'permission_callback' => array($this, 'must_be_logged_in'),
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'create_message_thread'),
                'permission_callback' => array($this, 'must_be_logged_in'),
            ),
        ));

        register_rest_route(self::NAMESPACE, '/social/messages/threads/(?P<id>\d+)', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'messages'),
                'permission_callback' => array($this, 'must_be_logged_in'),
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'send_message'),
                'permission_callback' => array($this, 'must_be_logged_in'),
            ),
        ));
    }

    public function can_read() {
        return true;
    }

    public function must_be_logged_in() {
        return $this->current_user_id() > 0;
    }

    private function current_user_id() {
        if (function_exists('curated_vault_get_google_app_session')) {
            $session = curated_vault_get_google_app_session();
            if (is_array($session) && !empty($session['id'])) {
                return absint($session['id']);
            }
        }
        return is_user_logged_in() ? get_current_user_id() : 0;
    }

    private function social_user_payload($user_id) {
        $user_id = absint($user_id);
        if (!$user_id) {
            return null;
        }
        if (function_exists('curated_vault_social_user_summary')) {
            $summary = curated_vault_social_user_summary($user_id);
            if (is_array($summary) && !empty($summary['id'])) {
                return $summary;
            }
        }
        return CV_Social_DB::user_payload($user_id);
    }

    private function social_entity_exists($user_id) {
        $user_id = absint($user_id);
        if (!$user_id) {
            return false;
        }
        if (function_exists('curated_vault_social_entity_exists')) {
            return (bool) curated_vault_social_entity_exists($user_id);
        }
        return (bool) get_user_by('id', $user_id);
    }

    public function me() {
        return rest_ensure_response(array('user' => $this->social_user_payload($this->current_user_id())));
    }

    public function profile(WP_REST_Request $request) {
        $user_id = absint($request['id']);
        $user = $this->social_user_payload($user_id);
        if (!$user) {
            return new WP_Error('cv_social_not_found', __('User not found.', 'curated-vault'), array('status' => 404));
        }
        $user['counts'] = $this->follow_counts($user_id);
        $user['is_following'] = $this->is_following($this->current_user_id(), $user_id);
        return rest_ensure_response(array('user' => $user));
    }

    public function feed(WP_REST_Request $request) {
        global $wpdb;
        $limit = min(50, max(1, absint($request->get_param('per_page') ? $request->get_param('per_page') : 20)));
        $page = max(1, absint($request->get_param('page') ? $request->get_param('page') : 1));
        $offset = ($page - 1) * $limit;
        $posts_table = CV_Social_DB::table('posts');
        $rows = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$posts_table} WHERE status = %s AND visibility = %s ORDER BY created_at DESC LIMIT %d OFFSET %d", 'publish', 'public', $limit, $offset), ARRAY_A);
        return rest_ensure_response(array('items' => array_map(array($this, 'format_post'), $rows)));
    }

    public function create_post(WP_REST_Request $request) {
        global $wpdb;
        $content = wp_kses_post($request->get_param('content'));
        $media_attachment_id = absint($request->get_param('media_attachment_id'));
        $media_url = esc_url_raw((string) $request->get_param('media_url'));
        $media_type = sanitize_key($request->get_param('media_type') ? $request->get_param('media_type') : 'none');

        if ('' === trim(wp_strip_all_tags($content)) && empty($media_url) && !$media_attachment_id) {
            return new WP_Error('cv_social_empty_post', __('Write something or attach media first.', 'curated-vault'), array('status' => 400));
        }

        if ($media_attachment_id) {
            $media_url = wp_get_attachment_url($media_attachment_id);
            $mime = get_post_mime_type($media_attachment_id);
            $media_type = strpos((string) $mime, 'video/') === 0 ? 'video' : 'image';
        }

        $inserted = $wpdb->insert(CV_Social_DB::table('posts'), array(
            'author_id' => $this->current_user_id(),
            'content' => $content,
            'media_attachment_id' => $media_attachment_id,
            'media_url' => $media_url,
            'media_type' => in_array($media_type, array('none', 'image', 'video'), true) ? $media_type : 'none',
            'visibility' => 'public',
            'status' => 'publish',
            'created_at' => current_time('mysql'),
        ), array('%d', '%s', '%d', '%s', '%s', '%s', '%s', '%s'));

        if (!$inserted) {
            return new WP_Error('cv_social_insert_failed', __('Could not create post.', 'curated-vault'), array('status' => 500));
        }

        $post = $wpdb->get_row($wpdb->prepare('SELECT * FROM ' . CV_Social_DB::table('posts') . ' WHERE id = %d', $wpdb->insert_id), ARRAY_A);

        $followers_table = $wpdb->prefix . 'cv_social_follows';
        $followers = $wpdb->get_col($wpdb->prepare("SELECT follower_id FROM {$followers_table} WHERE following_id = %d AND status = %s LIMIT 500", $this->current_user_id(), 'accepted'));
        foreach ((array) $followers as $follower_id) {
            CV_Social_DB::notify(absint($follower_id), $this->current_user_id(), 'new_post', 'post', absint($post['id']), __('shared a new post', 'curated-vault'));
        }

        return rest_ensure_response(array('post' => $this->format_post($post)));
    }

    public function react_to_post(WP_REST_Request $request) {
        global $wpdb;
        $post_id = absint($request['id']);
        $reaction = sanitize_key($request->get_param('reaction') ? $request->get_param('reaction') : 'like');
        $allowed = array('like', 'love', 'support', 'celebrate');
        if (!in_array($reaction, $allowed, true)) {
            $reaction = 'like';
        }

        $post = $this->get_post($post_id);
        if (!$post) {
            return new WP_Error('cv_social_not_found', __('Post not found.', 'curated-vault'), array('status' => 404));
        }

        $existing = $wpdb->get_var($wpdb->prepare('SELECT id FROM ' . CV_Social_DB::table('reactions') . ' WHERE object_type = %s AND object_id = %d AND user_id = %d', 'post', $post_id, $this->current_user_id()));
        if ($existing) {
            $wpdb->delete(CV_Social_DB::table('reactions'), array('id' => absint($existing)), array('%d'));
        } else {
            $wpdb->insert(CV_Social_DB::table('reactions'), array(
                'object_type' => 'post',
                'object_id' => $post_id,
                'user_id' => $this->current_user_id(),
                'reaction' => $reaction,
                'created_at' => current_time('mysql'),
            ), array('%s', '%d', '%d', '%s', '%s'));
            CV_Social_DB::notify(absint($post['author_id']), $this->current_user_id(), 'reaction', 'post', $post_id, __('reacted to your post', 'curated-vault'));
        }

        $count = absint($wpdb->get_var($wpdb->prepare('SELECT COUNT(*) FROM ' . CV_Social_DB::table('reactions') . ' WHERE object_type = %s AND object_id = %d', 'post', $post_id)));
        $wpdb->update(CV_Social_DB::table('posts'), array('reaction_count' => $count), array('id' => $post_id), array('%d'), array('%d'));
        return rest_ensure_response(array('reaction_count' => $count, 'reacted' => !$existing));
    }

    public function comments(WP_REST_Request $request) {
        global $wpdb;
        $post_id = absint($request['id']);
        $rows = $wpdb->get_results($wpdb->prepare('SELECT * FROM ' . CV_Social_DB::table('comments') . ' WHERE post_id = %d AND status = %s ORDER BY created_at ASC LIMIT 100', $post_id, 'publish'), ARRAY_A);
        return rest_ensure_response(array('items' => array_map(array($this, 'format_comment'), $rows)));
    }

    public function create_comment(WP_REST_Request $request) {
        global $wpdb;
        $post_id = absint($request['id']);
        $post = $this->get_post($post_id);
        if (!$post) {
            return new WP_Error('cv_social_not_found', __('Post not found.', 'curated-vault'), array('status' => 404));
        }
        $content = sanitize_textarea_field($request->get_param('content'));
        $parent_id = absint($request->get_param('parent_id'));
        if ('' === trim($content)) {
            return new WP_Error('cv_social_empty_comment', __('Comment cannot be empty.', 'curated-vault'), array('status' => 400));
        }
        $wpdb->insert(CV_Social_DB::table('comments'), array(
            'post_id' => $post_id,
            'parent_id' => $parent_id,
            'author_id' => $this->current_user_id(),
            'content' => $content,
            'status' => 'publish',
            'created_at' => current_time('mysql'),
        ), array('%d', '%d', '%d', '%s', '%s', '%s'));
        $count = absint($wpdb->get_var($wpdb->prepare('SELECT COUNT(*) FROM ' . CV_Social_DB::table('comments') . ' WHERE post_id = %d AND status = %s', $post_id, 'publish')));
        $wpdb->update(CV_Social_DB::table('posts'), array('comment_count' => $count), array('id' => $post_id), array('%d'), array('%d'));
        CV_Social_DB::notify(absint($post['author_id']), $this->current_user_id(), 'comment', 'post', $post_id, __('commented on your post', 'curated-vault'));
        if ($parent_id) {
            $parent_author_id = absint($wpdb->get_var($wpdb->prepare('SELECT author_id FROM ' . CV_Social_DB::table('comments') . ' WHERE id = %d', $parent_id)));
            if ($parent_author_id && $parent_author_id !== absint($post['author_id'])) {
                CV_Social_DB::notify($parent_author_id, $this->current_user_id(), 'reply', 'post', $post_id, __('replied to your comment', 'curated-vault'));
            }
        }
        $comment = $wpdb->get_row($wpdb->prepare('SELECT * FROM ' . CV_Social_DB::table('comments') . ' WHERE id = %d', $wpdb->insert_id), ARRAY_A);
        return rest_ensure_response(array('comment' => $this->format_comment($comment), 'comment_count' => $count));
    }

    public function follow(WP_REST_Request $request) {
        global $wpdb;
        $target_id = absint($request['id']);
        $current_id = $this->current_user_id();
        if (!$target_id || $target_id === $current_id || !$this->social_entity_exists($target_id)) {
            return new WP_Error('cv_social_invalid_follow', __('Invalid follow target.', 'curated-vault'), array('status' => 400));
        }
        $table = $wpdb->prefix . 'cv_social_follows';
        $existing = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$table} WHERE follower_id = %d AND following_id = %d", $current_id, $target_id));
        if ($existing) {
            $wpdb->delete($table, array('id' => absint($existing)), array('%d'));
            $following = false;
        } else {
            $wpdb->insert($table, array('follower_id' => $current_id, 'following_id' => $target_id, 'status' => 'accepted', 'created_at' => current_time('mysql')), array('%d', '%d', '%s', '%s'));
            CV_Social_DB::notify($target_id, $current_id, 'follow', 'user', $target_id, __('started following you', 'curated-vault'));
            $following = true;
        }
        return rest_ensure_response(array('following' => $following, 'counts' => $this->follow_counts($target_id)));
    }

    public function search_users(WP_REST_Request $request) {
        $term = trim(sanitize_text_field((string) $request->get_param('q')));
        $limit = min(24, max(1, absint($request->get_param('per_page') ? $request->get_param('per_page') : 12)));
        $current_id = $this->current_user_id();
        $items_by_id = array();

        $wp_args = array(
            'number' => $limit,
            'exclude' => $current_id ? array($current_id) : array(),
            'fields' => 'all',
        );
        if ($term !== '') {
            $wp_args['search'] = '*' . esc_attr($term) . '*';
            $wp_args['search_columns'] = array('user_login', 'user_nicename', 'display_name', 'user_email');
        } else {
            $wp_args['orderby'] = 'registered';
            $wp_args['order'] = 'DESC';
        }

        $query = new WP_User_Query($wp_args);
        foreach ((array) $query->get_results() as $user) {
            if (!$user || empty($user->ID)) {
                continue;
            }
            $summary = $this->social_user_payload($user->ID);
            if ($summary && empty($summary['is_self'])) {
                $items_by_id[absint($summary['id'])] = $summary;
            }
        }

        if (function_exists('curated_vault_list_app_profiles') && function_exists('curated_vault_app_profile_summary')) {
            $needle = strtolower($term);
            foreach (curated_vault_list_app_profiles(250) as $profile) {
                $summary = curated_vault_app_profile_summary($profile, $current_id);
                if (!$summary || !empty($summary['is_self'])) {
                    continue;
                }
                if ($needle !== '') {
                    $haystack = strtolower(implode(' ', array(
                        $summary['name'] ?? '',
                        $summary['handle'] ?? '',
                        $summary['username'] ?? '',
                        $summary['role'] ?? '',
                        $summary['church'] ?? '',
                        $summary['ministry'] ?? '',
                        $summary['bio'] ?? '',
                    )));
                    if (strpos($haystack, $needle) === false) {
                        continue;
                    }
                }
                $items_by_id[absint($summary['id'])] = $summary;
            }
        }

        $items = array_values($items_by_id);
        usort($items, function($a, $b) {
            $ta = !empty($a['registered_at']) ? strtotime($a['registered_at']) : 0;
            $tb = !empty($b['registered_at']) ? strtotime($b['registered_at']) : 0;
            if ($ta === $tb) {
                return strcasecmp((string) ($a['name'] ?? ''), (string) ($b['name'] ?? ''));
            }
            return $tb <=> $ta;
        });

        return rest_ensure_response(array('items' => array_slice($items, 0, $limit)));
    }

    public function notifications() {
        global $wpdb;
        $table = CV_Social_DB::table('notifications');
        $rows = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$table} WHERE user_id = %d ORDER BY created_at DESC LIMIT 80", $this->current_user_id()), ARRAY_A);
        $items = array();
        foreach ((array) $rows as $row) {
            $row['id'] = absint($row['id']);
            $row['actor_id'] = absint($row['actor_id']);
            $row['object_id'] = absint($row['object_id']);
            $row['is_read'] = absint($row['is_read']);
            $row['actor'] = $this->social_user_payload(absint($row['actor_id']));
            $items[] = $row;
        }
        $unread_count = $this->unread_notification_count();
        $message_unread_count = $this->unread_message_count();
        return rest_ensure_response(array(
            'items' => $items,
            'unread_count' => $unread_count,
            'message_unread_count' => $message_unread_count,
            'total_unread_count' => $unread_count + $message_unread_count,
        ));
    }

    public function notification_count() {
        $unread_count = $this->unread_notification_count();
        $message_unread_count = $this->unread_message_count();
        return rest_ensure_response(array(
            'unread_count' => $unread_count,
            'message_unread_count' => $message_unread_count,
            'total_unread_count' => $unread_count + $message_unread_count,
        ));
    }

    public function mark_notifications_read(WP_REST_Request $request) {
        global $wpdb;
        $id = absint($request->get_param('id'));
        $where = array('user_id' => $this->current_user_id(), 'is_read' => 0);
        $where_format = array('%d', '%d');
        if ($id) {
            $where['id'] = $id;
            $where_format[] = '%d';
        }
        $wpdb->update(CV_Social_DB::table('notifications'), array('is_read' => 1), $where, array('%d'), $where_format);
        return rest_ensure_response(array('success' => true, 'unread_count' => $this->unread_notification_count()));
    }

    private function unread_notification_count() {
        global $wpdb;
        // Message unread state is already calculated from message_thread_members, so
        // exclude message notification rows here to avoid double-counting badges.
        return absint($wpdb->get_var($wpdb->prepare('SELECT COUNT(*) FROM ' . CV_Social_DB::table('notifications') . ' WHERE user_id = %d AND is_read = 0 AND type <> %s', $this->current_user_id(), 'message')));
    }

    private function unread_message_count() {
        global $wpdb;
        $members = CV_Social_DB::table('message_thread_members');
        $messages = CV_Social_DB::table('messages');
        $current_id = $this->current_user_id();
        $rows = $wpdb->get_results($wpdb->prepare("SELECT thread_id, COALESCE(last_read_at, '1970-01-01 00:00:00') AS last_read_at FROM {$members} WHERE user_id = %d", $current_id), ARRAY_A);
        $total = 0;
        foreach ((array) $rows as $row) {
            $total += absint($wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$messages} WHERE thread_id = %d AND sender_id <> %d AND created_at > %s", absint($row['thread_id']), $current_id, $row['last_read_at'])));
        }
        return $total;
    }

    public function message_threads() {
        global $wpdb;
        $members = CV_Social_DB::table('message_thread_members');
        $threads = CV_Social_DB::table('message_threads');
        $messages = CV_Social_DB::table('messages');
        $current_id = $this->current_user_id();

        $rows = $wpdb->get_results($wpdb->prepare("SELECT t.* FROM {$threads} t INNER JOIN {$members} m ON t.id = m.thread_id WHERE m.user_id = %d ORDER BY t.last_message_at DESC, t.created_at DESC LIMIT 50", $current_id), ARRAY_A);
        $items = array();
        foreach ((array) $rows as $row) {
            $thread_id = absint($row['id']);
            $other = $this->thread_other_user($thread_id, $current_id);
            $last = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$messages} WHERE thread_id = %d ORDER BY created_at DESC LIMIT 1", $thread_id), ARRAY_A);
            $member = $wpdb->get_row($wpdb->prepare("SELECT last_read_at FROM {$members} WHERE thread_id = %d AND user_id = %d", $thread_id, $current_id), ARRAY_A);
            $last_read_at = $member && !empty($member['last_read_at']) ? $member['last_read_at'] : '1970-01-01 00:00:00';
            $unread = absint($wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$messages} WHERE thread_id = %d AND sender_id <> %d AND created_at > %s", $thread_id, $current_id, $last_read_at)));
            $items[] = array(
                'id' => $thread_id,
                'other_user' => $other,
                'last_message' => $last ? $this->message_preview($last['body']) : '',
                'last_message_at' => !empty($row['last_message_at']) ? $row['last_message_at'] : $row['created_at'],
                'unread_count' => $unread,
            );
        }
        return rest_ensure_response(array('items' => $items));
    }

    public function create_message_thread(WP_REST_Request $request) {
        global $wpdb;
        $recipient_id = absint($request->get_param('recipient_id'));
        $body = sanitize_textarea_field($request->get_param('body'));
        $attachment = $this->sanitize_message_attachment($request->get_param('attachment'));
        $current_id = $this->current_user_id();
        if (!$recipient_id || $recipient_id === $current_id || !$this->social_entity_exists($recipient_id)) {
            return new WP_Error('cv_social_bad_recipient', __('Recipient not found.', 'curated-vault'), array('status' => 400));
        }
        if (is_wp_error($attachment)) {
            return $attachment;
        }
        if ('' === trim($body) && empty($attachment)) {
            return new WP_Error('cv_social_empty_message', __('Message cannot be empty.', 'curated-vault'), array('status' => 400));
        }

        $thread_id = $this->find_direct_thread($current_id, $recipient_id);
        if (!$thread_id) {
            $wpdb->insert(CV_Social_DB::table('message_threads'), array('created_by' => $current_id, 'last_message_at' => current_time('mysql'), 'created_at' => current_time('mysql')), array('%d', '%s', '%s'));
            $thread_id = absint($wpdb->insert_id);
            foreach (array($current_id, $recipient_id) as $member_id) {
                $wpdb->insert(CV_Social_DB::table('message_thread_members'), array('thread_id' => $thread_id, 'user_id' => absint($member_id), 'created_at' => current_time('mysql')), array('%d', '%d', '%s'));
            }
        }

        $stored_body = $this->prepare_message_storage_body($body, $attachment);
        $wpdb->insert(CV_Social_DB::table('messages'), array('thread_id' => $thread_id, 'sender_id' => $current_id, 'body' => $stored_body, 'created_at' => current_time('mysql')), array('%d', '%d', '%s', '%s'));
        $wpdb->update(CV_Social_DB::table('message_threads'), array('last_message_at' => current_time('mysql')), array('id' => $thread_id), array('%s'), array('%d'));
        $wpdb->update(CV_Social_DB::table('message_thread_members'), array('last_read_at' => current_time('mysql')), array('thread_id' => $thread_id, 'user_id' => $current_id), array('%s'), array('%d', '%d'));
        CV_Social_DB::notify($recipient_id, $current_id, 'message', 'thread', $thread_id, __('sent you a message', 'curated-vault'));
        return rest_ensure_response(array('thread_id' => $thread_id));
    }

    public function messages(WP_REST_Request $request) {
        global $wpdb;
        $thread_id = absint($request['id']);
        $current_id = $this->current_user_id();
        if (!$this->is_thread_member($thread_id, $current_id)) {
            return new WP_Error('cv_social_forbidden', __('You cannot view this thread.', 'curated-vault'), array('status' => 403));
        }
        $wpdb->update(CV_Social_DB::table('message_thread_members'), array('last_read_at' => current_time('mysql')), array('thread_id' => $thread_id, 'user_id' => $current_id), array('%s'), array('%d', '%d'));
        $rows = $wpdb->get_results($wpdb->prepare('SELECT * FROM ' . CV_Social_DB::table('messages') . ' WHERE thread_id = %d ORDER BY created_at ASC LIMIT 100', $thread_id), ARRAY_A);
        foreach ($rows as &$row) {
            $payload = $this->parse_message_payload($row['body']);
            $row['id'] = absint($row['id']);
            $row['thread_id'] = absint($row['thread_id']);
            $row['sender_id'] = absint($row['sender_id']);
            $row['mine'] = ($row['sender_id'] === $current_id);
            $row['sender'] = $this->social_user_payload(absint($row['sender_id']));
            $row['body'] = sanitize_textarea_field($payload['text']);
            $row['attachment'] = $payload['attachment'];
        }
        return rest_ensure_response(array('items' => $rows, 'other_user' => $this->thread_other_user($thread_id, $current_id)));
    }

    public function send_message(WP_REST_Request $request) {
        global $wpdb;
        $thread_id = absint($request['id']);
        $current_id = $this->current_user_id();
        if (!$this->is_thread_member($thread_id, $current_id)) {
            return new WP_Error('cv_social_forbidden', __('You cannot post in this thread.', 'curated-vault'), array('status' => 403));
        }
        $body = sanitize_textarea_field($request->get_param('body'));
        $attachment = $this->sanitize_message_attachment($request->get_param('attachment'));
        if (is_wp_error($attachment)) {
            return $attachment;
        }
        if ('' === trim($body) && empty($attachment)) {
            return new WP_Error('cv_social_empty_message', __('Message cannot be empty.', 'curated-vault'), array('status' => 400));
        }
        $stored_body = $this->prepare_message_storage_body($body, $attachment);
        $wpdb->insert(CV_Social_DB::table('messages'), array('thread_id' => $thread_id, 'sender_id' => $current_id, 'body' => $stored_body, 'created_at' => current_time('mysql')), array('%d', '%d', '%s', '%s'));
        $wpdb->update(CV_Social_DB::table('message_threads'), array('last_message_at' => current_time('mysql')), array('id' => $thread_id), array('%s'), array('%d'));
        $wpdb->update(CV_Social_DB::table('message_thread_members'), array('last_read_at' => current_time('mysql')), array('thread_id' => $thread_id, 'user_id' => $current_id), array('%s'), array('%d', '%d'));
        $other = $this->thread_other_user($thread_id, $current_id);
        if ($other && !empty($other['id'])) {
            CV_Social_DB::notify(absint($other['id']), $current_id, 'message', 'thread', $thread_id, __('sent you a message', 'curated-vault'));
        }
        return rest_ensure_response(array('message_id' => absint($wpdb->insert_id)));
    }


    private function sanitize_message_attachment($attachment) {
        if (empty($attachment) || !is_array($attachment)) {
            return null;
        }

        $type = sanitize_key(isset($attachment['type']) ? $attachment['type'] : 'file');
        if (!in_array($type, array('image', 'video', 'file'), true)) {
            $type = 'file';
        }

        $name = sanitize_file_name(isset($attachment['name']) ? $attachment['name'] : 'attachment');
        if ('' === $name) {
            $name = 'attachment';
        }

        $data_url = isset($attachment['data_url']) ? (string) $attachment['data_url'] : (isset($attachment['dataUrl']) ? (string) $attachment['dataUrl'] : '');
        $data_url = trim($data_url);
        if ('' === $data_url) {
            return null;
        }

        if (strlen($data_url) > 750000) {
            return new WP_Error('cv_social_attachment_too_large', __('Attachment is too large. Please keep files under 500KB.', 'curated-vault'), array('status' => 400));
        }

        if (!preg_match('#^data:([a-z0-9.+\-]+/[a-z0-9.+\-]+);base64,[a-z0-9+/=\r\n]+$#i', $data_url, $matches)) {
            return new WP_Error('cv_social_bad_attachment', __('Attachment format is not supported.', 'curated-vault'), array('status' => 400));
        }

        $mime = strtolower($matches[1]);
        $allowed = array(
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/webm', 'video/ogg',
            'application/pdf', 'text/plain', 'text/csv', 'application/zip',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/octet-stream'
        );
        if (!in_array($mime, $allowed, true)) {
            return new WP_Error('cv_social_bad_attachment_type', __('This attachment type is not allowed.', 'curated-vault'), array('status' => 400));
        }
        if ('image' === $type && 0 !== strpos($mime, 'image/')) {
            $type = 'file';
        }
        if ('video' === $type && 0 !== strpos($mime, 'video/')) {
            $type = 'file';
        }

        return array(
            'type' => $type,
            'name' => $name,
            'mime' => $mime,
            'data_url' => preg_replace('/\s+/', '', $data_url),
        );
    }

    private function prepare_message_storage_body($body, $attachment = null) {
        $text = sanitize_textarea_field($body);
        if (empty($attachment)) {
            return $text;
        }
        return wp_json_encode(array(
            '__cv_msg_payload' => 1,
            'text' => $text,
            'attachment' => $attachment,
        ));
    }

    private function parse_message_payload($raw_body) {
        $raw_body = (string) $raw_body;
        $decoded = json_decode($raw_body, true);
        if (is_array($decoded) && !empty($decoded['__cv_msg_payload'])) {
            $attachment = null;
            if (!empty($decoded['attachment']) && is_array($decoded['attachment'])) {
                $attachment = array(
                    'type' => sanitize_key(isset($decoded['attachment']['type']) ? $decoded['attachment']['type'] : 'file'),
                    'name' => sanitize_file_name(isset($decoded['attachment']['name']) ? $decoded['attachment']['name'] : 'attachment'),
                    'mime' => sanitize_text_field(isset($decoded['attachment']['mime']) ? $decoded['attachment']['mime'] : ''),
                    'data_url' => (string) (isset($decoded['attachment']['data_url']) ? $decoded['attachment']['data_url'] : ''),
                );
            }
            return array(
                'text' => sanitize_textarea_field(isset($decoded['text']) ? $decoded['text'] : ''),
                'attachment' => $attachment,
            );
        }
        return array('text' => $raw_body, 'attachment' => null);
    }

    private function message_preview($raw_body) {
        $payload = $this->parse_message_payload($raw_body);
        $text = trim((string) $payload['text']);
        if ('' !== $text) {
            return sanitize_text_field($text);
        }
        if (!empty($payload['attachment'])) {
            $type = isset($payload['attachment']['type']) ? $payload['attachment']['type'] : 'file';
            if ('image' === $type) {
                return __('Sent an image', 'curated-vault');
            }
            if ('video' === $type) {
                return __('Sent a video', 'curated-vault');
            }
            return __('Sent a file', 'curated-vault');
        }
        return '';
    }

    private function find_direct_thread($user_a, $user_b) {
        global $wpdb;
        $members = CV_Social_DB::table('message_thread_members');
        return absint($wpdb->get_var($wpdb->prepare("SELECT m1.thread_id FROM {$members} m1 INNER JOIN {$members} m2 ON m1.thread_id = m2.thread_id WHERE m1.user_id = %d AND m2.user_id = %d LIMIT 1", absint($user_a), absint($user_b))));
    }

    private function thread_other_user($thread_id, $current_id) {
        global $wpdb;
        $members = CV_Social_DB::table('message_thread_members');
        $other_id = absint($wpdb->get_var($wpdb->prepare("SELECT user_id FROM {$members} WHERE thread_id = %d AND user_id <> %d LIMIT 1", absint($thread_id), absint($current_id))));
        return $other_id ? $this->social_user_payload($other_id) : null;
    }

    private function get_post($post_id) {
        global $wpdb;
        return $wpdb->get_row($wpdb->prepare('SELECT * FROM ' . CV_Social_DB::table('posts') . ' WHERE id = %d AND status = %s', absint($post_id), 'publish'), ARRAY_A);
    }

    private function format_post($row) {
        if (!$row) {
            return null;
        }
        $row['id'] = absint($row['id']);
        $row['author_id'] = absint($row['author_id']);
        $row['author'] = $this->social_user_payload($row['author_id']);
        $row['content'] = wp_kses_post($row['content']);
        $row['media_url'] = esc_url_raw($row['media_url']);
        $row['comment_count'] = absint($row['comment_count']);
        $row['reaction_count'] = absint($row['reaction_count']);
        $row['user_reacted'] = $this->current_user_id() ? $this->user_reacted('post', $row['id']) : false;
        return $row;
    }

    private function format_comment($row) {
        $row['id'] = absint($row['id']);
        $row['post_id'] = absint($row['post_id']);
        $row['parent_id'] = absint($row['parent_id']);
        $row['author_id'] = absint($row['author_id']);
        $row['author'] = $this->social_user_payload($row['author_id']);
        $row['content'] = sanitize_textarea_field($row['content']);
        return $row;
    }

    private function user_reacted($object_type, $object_id) {
        global $wpdb;
        return (bool) $wpdb->get_var($wpdb->prepare('SELECT id FROM ' . CV_Social_DB::table('reactions') . ' WHERE object_type = %s AND object_id = %d AND user_id = %d', sanitize_key($object_type), absint($object_id), $this->current_user_id()));
    }

    private function is_following($follower_id, $following_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'cv_social_follows';
        return (bool) $wpdb->get_var($wpdb->prepare("SELECT id FROM {$table} WHERE follower_id = %d AND following_id = %d AND status = %s", absint($follower_id), absint($following_id), 'accepted'));
    }

    private function follow_counts($user_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'cv_social_follows';
        return array(
            'followers' => absint($wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$table} WHERE following_id = %d AND status = %s", absint($user_id), 'accepted'))),
            'following' => absint($wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$table} WHERE follower_id = %d AND status = %s", absint($user_id), 'accepted'))),
        );
    }

    private function is_thread_member($thread_id, $user_id) {
        global $wpdb;
        return (bool) $wpdb->get_var($wpdb->prepare('SELECT id FROM ' . CV_Social_DB::table('message_thread_members') . ' WHERE thread_id = %d AND user_id = %d', absint($thread_id), absint($user_id)));
    }
}
