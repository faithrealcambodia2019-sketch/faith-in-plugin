<?php
/**
 * Faith In Bible backend service.
 *
 * Centralizes Bible text/search/media calls so frontend tools never expose API keys.
 */
if (!defined('ABSPATH')) { exit; }

class CV_Bible_Service {
    const API_BIBLE_BASE = 'https://api.scripture.api.bible/v1';
    const BIBLE_API_BASE = 'https://bible-api.com';
    const BIBLE_BRAIN_BASE = 'https://4.dbt.io/api';
    const YOUVERSION_BASE = 'https://api.youversion.com/v1';

    public static function settings() {
        $defaults = array(
            'api_bible_key' => '',
            'api_bible_default_id' => '',
            'api_bible_version_map' => array(
                'KJV' => '',
                'WEB' => '',
                'ESV' => '',
                'NIV' => '',
                'KHMER_OLD_1954' => '1270',
            ),
            'bible_brain_key' => '',
            'youversion_app_key' => '',
            'youversion_default_bible_id' => '1270',
            'cache_minutes' => 1440,
        );
        $saved = get_option('cv_bible_settings', array());
        if (!is_array($saved)) { $saved = array(); }
        $saved = wp_parse_args($saved, $defaults);
        $saved['api_bible_version_map'] = is_array($saved['api_bible_version_map'] ?? null) ? wp_parse_args($saved['api_bible_version_map'], $defaults['api_bible_version_map']) : $defaults['api_bible_version_map'];
        return $saved;
    }

    public static function sanitize_settings($input) {
        $current = self::settings();
        $out = array();
        $out['api_bible_key'] = sanitize_text_field($input['api_bible_key'] ?? '');
        $out['api_bible_default_id'] = sanitize_text_field($input['api_bible_default_id'] ?? '');
        $out['bible_brain_key'] = sanitize_text_field($input['bible_brain_key'] ?? '');
        $out['youversion_app_key'] = sanitize_text_field($input['youversion_app_key'] ?? '');
        $out['youversion_default_bible_id'] = sanitize_text_field($input['youversion_default_bible_id'] ?? '1270');
        if ($out['youversion_default_bible_id'] === '') { $out['youversion_default_bible_id'] = '1270'; }
        $out['cache_minutes'] = max(5, min(10080, absint($input['cache_minutes'] ?? $current['cache_minutes'])));
        $out['api_bible_version_map'] = array();
        foreach (array('KJV','WEB','ESV','NIV','KHMER_OLD_1954') as $version) {
            $out['api_bible_version_map'][$version] = sanitize_text_field($input['api_bible_version_map'][$version] ?? '');
        }
        return $out;
    }

    private static function version_id($version) {
        $settings = self::settings();
        $version = strtoupper(sanitize_key($version));
        if (!empty($settings['api_bible_version_map'][$version])) {
            return $settings['api_bible_version_map'][$version];
        }
        return !empty($settings['api_bible_default_id']) ? $settings['api_bible_default_id'] : '';
    }

    private static function cache_ttl() {
        $settings = self::settings();
        return max(300, absint($settings['cache_minutes']) * MINUTE_IN_SECONDS);
    }

    private static function request_json($url, $args = array(), $cache_key = '') {
        if ($cache_key) {
            $cached = get_transient($cache_key);
            if ($cached !== false) { return $cached; }
        }
        $response = wp_remote_get($url, wp_parse_args($args, array('timeout' => 18)));
        if (is_wp_error($response)) { return $response; }
        $code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $json = json_decode($body, true);
        if ($code < 200 || $code >= 300 || !is_array($json)) {
            return new WP_Error('cv_bible_http_error', 'Bible API request failed.', array('status' => $code, 'body' => $body));
        }
        if ($cache_key) { set_transient($cache_key, $json, self::cache_ttl()); }
        return $json;
    }

    private static function api_bible_get($path, $query = array(), $version = '') {
        $settings = self::settings();
        if (empty($settings['api_bible_key'])) {
            return new WP_Error('cv_api_bible_missing_key', 'API.Bible key is not configured.');
        }
        $url = trailingslashit(self::API_BIBLE_BASE) . ltrim($path, '/');
        if (!empty($query)) { $url = add_query_arg($query, $url); }
        $cache_key = 'cv_api_bible_' . md5($url . '|' . $version);
        return self::request_json($url, array('headers' => array('api-key' => $settings['api_bible_key'])), $cache_key);
    }

    private static function is_khmer_old_version($version) {
        $version = strtoupper(trim((string) $version));
        return in_array($version, array('KHMER_OLD_1954', 'KHMER1954', 'KOV1954', 'YOUVERSION_1270', '1270'), true);
    }


    public static function register_rest_routes() {
        register_rest_route('faithin/v1', '/bible/passage', array(
            'methods' => WP_REST_Server::READABLE,
            'callback' => array(__CLASS__, 'rest_get_passage'),
            'permission_callback' => '__return_true',
            'args' => array(
                'bible_id' => array('sanitize_callback' => 'sanitize_text_field'),
                'passage' => array('sanitize_callback' => 'sanitize_text_field'),
            ),
        ));

        register_rest_route('faithin/v1', '/bible/daily', array(
            'methods' => WP_REST_Server::READABLE,
            'callback' => array(__CLASS__, 'rest_get_daily_verse'),
            'permission_callback' => '__return_true',
            'args' => array(
                'bible_id' => array('sanitize_callback' => 'sanitize_text_field'),
                'passage' => array('sanitize_callback' => 'sanitize_text_field'),
            ),
        ));
    }

    public static function rest_get_passage($request) {
        $settings = self::settings();
        $bible_id = sanitize_text_field($request->get_param('bible_id') ?: ($settings['youversion_default_bible_id'] ?? '1270'));
        $passage = sanitize_text_field($request->get_param('passage') ?: 'JHN.3.16');
        $result = self::youversion_get_passage($bible_id, $passage);
        if (is_wp_error($result)) { return $result; }
        return rest_ensure_response($result);
    }

    public static function rest_get_daily_verse($request) {
        $settings = self::settings();
        $bible_id = sanitize_text_field($request->get_param('bible_id') ?: ($settings['youversion_default_bible_id'] ?? '1270'));
        $passage = sanitize_text_field($request->get_param('passage') ?: self::daily_passage_for_today());
        $result = self::youversion_get_passage($bible_id, $passage);
        if (!is_wp_error($result)) {
            $result['daily'] = true;
            return rest_ensure_response($result);
        }
        return rest_ensure_response(self::daily_fallback_verse($passage, $result));
    }

    private static function youversion_app_key() {
        $constant_key = defined('CV_YOUVERSION_APP_KEY') ? trim((string) CV_YOUVERSION_APP_KEY) : '';
        if ($constant_key !== '') { return $constant_key; }
        $env_key = getenv('CV_YOUVERSION_APP_KEY');
        if (!empty($env_key)) { return trim((string) $env_key); }
        $settings = self::settings();
        $saved_key = trim((string) ($settings['youversion_app_key'] ?? ''));
        if ($saved_key !== '') { return $saved_key; }
        return '';
    }

    private static function sanitize_youversion_bible_id($bible_id) {
        $bible_id = sanitize_text_field($bible_id ?: '1270');
        $bible_id = preg_replace('/[^A-Za-z0-9_-]/', '', $bible_id);
        return $bible_id ?: '1270';
    }

    private static function sanitize_youversion_passage($passage) {
        $passage = strtoupper(sanitize_text_field($passage ?: 'JHN.3.16'));
        $passage = preg_replace('/[^A-Z0-9\.\-:,]/', '', $passage);
        return $passage ?: 'JHN.3.16';
    }

    public static function youversion_get_passage($bible_id = '1270', $passage = 'JHN.3.16') {
        $app_key = self::youversion_app_key();
        if ($app_key === '') {
            return new WP_Error('cv_youversion_missing_key', 'YouVersion App Key is not configured. Add it in Settings > Faith In > Bible Backend, or define CV_YOUVERSION_APP_KEY in wp-config.php.', array('status' => 503));
        }

        $bible_id = self::sanitize_youversion_bible_id($bible_id);
        $passage = self::sanitize_youversion_passage($passage);
        $url = add_query_arg(array('format' => 'text'), trailingslashit(self::YOUVERSION_BASE) . 'bibles/' . rawurlencode($bible_id) . '/passages/' . rawurlencode($passage));
        $cache_key = 'cv_youversion_passage_' . md5($url . '|khmer-old-1954-v3');
        $cached = get_transient($cache_key);
        if ($cached !== false) { return $cached; }

        $response = wp_remote_get($url, array(
            'timeout' => 18,
            'headers' => array(
                'X-YVP-App-Key' => $app_key,
                'Accept' => 'application/json, text/plain;q=0.9, */*;q=0.8',
            ),
        ));
        if (is_wp_error($response)) { return $response; }

        $code = (int) wp_remote_retrieve_response_code($response);
        $body = (string) wp_remote_retrieve_body($response);
        if ($code < 200 || $code >= 300) {
            return new WP_Error('cv_youversion_http_error', 'YouVersion Bible API request failed.', array('status' => $code, 'body' => $body));
        }

        $json = json_decode($body, true);
        $result = is_array($json)
            ? self::normalize_youversion_passage_response($json, $bible_id, $passage)
            : self::normalize_youversion_text_response($body, $bible_id, $passage);

        if (is_wp_error($result)) { return $result; }
        set_transient($cache_key, $result, self::cache_ttl());
        return $result;
    }

    private static function youversion_get_chapter($book, $chapter, $bible_id = '1270') {
        $book = sanitize_text_field($book ?: 'John');
        $chapter_number = max(1, absint($chapter ?: 1));
        $book_usfm = self::youversion_book_usfm($book);

        // YouVersion's current Platform API has a dedicated chapter verses route.
        // Use it first so the Bible Reader can load whole Khmer chapters instead of
        // falling back to the single-passage endpoint only.
        $verses_result = self::youversion_get_chapter_verses($bible_id, $book_usfm, $chapter_number);
        if (!is_wp_error($verses_result) && !empty($verses_result['items'])) {
            return array(
                'book' => $book,
                'chapter' => (string) $chapter_number,
                'version' => 'KHMER_OLD_1954',
                'version_name' => self::youversion_version_name($bible_id),
                'items' => $verses_result['items'],
                'source' => $verses_result['source'] ?? 'youversion-verses',
            );
        }

        // Fallback 1: chapter passage, e.g. JHN.3.
        // Fallback 2: verse range, e.g. 1CO.1.1-1CO.1.31.
        $passages = array_filter(array_unique(array(
            self::api_bible_chapter_id($book, $chapter_number),
            self::youversion_chapter_range_id($book, $chapter_number),
        )));

        $last_error = is_wp_error($verses_result) ? $verses_result : null;
        foreach ($passages as $passage) {
            $result = self::youversion_get_passage($bible_id, $passage);
            if (is_wp_error($result)) { $last_error = $result; continue; }

            $text = trim((string) ($result['text'] ?? $result['khmer'] ?? ''));
            if ($text === '') {
                $last_error = new WP_Error('cv_youversion_empty_chapter', 'YouVersion returned an empty Khmer Bible chapter.', array('status' => 502));
                continue;
            }

            $items = self::split_youversion_chapter_to_verses($text);
            if (!empty($items)) {
                return array(
                    'book' => $book,
                    'chapter' => (string) $chapter_number,
                    'version' => 'KHMER_OLD_1954',
                    'version_name' => self::youversion_version_name($bible_id),
                    'items' => $items,
                    'source' => 'youversion-passage',
                );
            }
            $last_error = new WP_Error('cv_youversion_no_verse_items', 'Could not split the Khmer Bible chapter into verses.', array('status' => 502));
        }

        // Final fallback: load every verse one by one through the same passage
        // endpoint that is already proven to work for examples like JHN.3.16.
        // This is slower on the first request, but it is cached and is much more
        // reliable when the chapter/verses or chapter-range endpoints return
        // metadata only, 204, 404, 406, or blocked-license responses.
        $individual = self::youversion_get_chapter_individual_verses($bible_id, $book, $book_usfm, $chapter_number);
        if (!is_wp_error($individual) && !empty($individual['items'])) {
            return array(
                'book' => $book,
                'chapter' => (string) $chapter_number,
                'version' => 'KHMER_OLD_1954',
                'version_name' => self::youversion_version_name($bible_id),
                'items' => $individual['items'],
                'source' => $individual['source'] ?? 'youversion-individual-passages',
            );
        }
        if (is_wp_error($individual)) { $last_error = $individual; }

        return $last_error ?: new WP_Error('cv_youversion_chapter_failed', 'YouVersion Khmer Bible chapter could not be loaded.', array('status' => 502));
    }

    private static function youversion_get_chapter_individual_verses($bible_id, $book, $book_usfm, $chapter_number) {
        $bible_id = self::sanitize_youversion_bible_id($bible_id);
        $book_usfm = preg_replace('/[^A-Z0-9]/', '', strtoupper((string) $book_usfm));
        $chapter_number = max(1, absint($chapter_number));
        $last_verse = self::book_chapter_verse_count($book, $chapter_number);
        if (!$book_usfm || !$chapter_number || !$last_verse) {
            return new WP_Error('cv_youversion_no_individual_range', 'Could not determine the verse range for this Khmer Bible chapter.', array('status' => 400));
        }

        $cache_key = 'cv_youversion_individual_chapter_' . md5($bible_id . '|' . $book_usfm . '|' . $chapter_number . '|khmer-old-1954-v1');
        $cached = get_transient($cache_key);
        if ($cached !== false) { return $cached; }

        $items = array();
        $last_error = null;
        for ($verse = 1; $verse <= $last_verse; $verse++) {
            $passage = $book_usfm . '.' . $chapter_number . '.' . $verse;
            $result = self::youversion_get_passage($bible_id, $passage);
            if (is_wp_error($result)) {
                $last_error = $result;
                continue;
            }
            $text = trim((string) ($result['text'] ?? $result['khmer'] ?? ''));
            if ($text === '') { continue; }

            // Some passage responses include the verse number at the start; remove
            // it so the reader's own <sup> number stays clean and not duplicated.
            $text = preg_replace('/^\s*[0-9០-៩]{1,3}\s+/u', '', $text);
            $items[] = array('v' => $verse, 'text' => $text);
        }

        if (empty($items)) {
            return $last_error ?: new WP_Error('cv_youversion_individual_empty', 'YouVersion individual verse passages returned no Khmer Bible text.', array('status' => 502));
        }

        $result = array('items' => $items, 'source' => 'youversion-individual-passages');
        set_transient($cache_key, $result, self::cache_ttl());
        return $result;
    }

    private static function youversion_get_chapter_verses($bible_id, $book_usfm, $chapter_number) {
        $app_key = self::youversion_app_key();
        if ($app_key === '') {
            return new WP_Error('cv_youversion_missing_key', 'YouVersion App Key is not configured. Add it in Settings > Faith In > Bible Backend, or define CV_YOUVERSION_APP_KEY in wp-config.php.', array('status' => 503));
        }

        $bible_id = self::sanitize_youversion_bible_id($bible_id);
        $book_usfm = preg_replace('/[^A-Z0-9]/', '', strtoupper((string) $book_usfm));
        $chapter_number = max(1, absint($chapter_number));
        if ($book_usfm === '') {
            return new WP_Error('cv_youversion_missing_book', 'Missing YouVersion book code.', array('status' => 400));
        }

        $url = trailingslashit(self::YOUVERSION_BASE) . 'bibles/' . rawurlencode($bible_id) . '/books/' . rawurlencode($book_usfm) . '/chapters/' . rawurlencode((string) $chapter_number) . '/verses';
        $url = add_query_arg(array('format' => 'text', 'page_size' => 100), $url);
        $cache_key = 'cv_youversion_chapter_verses_' . md5($url . '|khmer-old-1954-v2');
        $cached = get_transient($cache_key);
        if ($cached !== false) { return $cached; }

        $json = self::youversion_request_json($url, '');
        if (is_wp_error($json)) { return $json; }

        $node = isset($json['data']) && is_array($json['data']) ? $json['data'] : $json;
        if (!is_array($node) || empty($node)) {
            return new WP_Error('cv_youversion_no_verses', 'YouVersion returned no verse rows for this chapter.', array('status' => 502));
        }

        $items = array();
        $passage_ids = array();
        foreach ($node as $idx => $verse) {
            if (!is_array($verse)) { continue; }
            $passage_id = sanitize_text_field((string) ($verse['passage_id'] ?? $verse['id'] ?? ''));
            if ($passage_id !== '') { $passage_ids[] = $passage_id; }
            $number = self::youversion_verse_number_from_node($verse, $idx + 1);
            $text = self::extract_first_text_value($verse, array('content', 'text', 'body', 'passage_text', 'plain_text', 'value'));
            $text = trim(wp_strip_all_tags(html_entity_decode((string) $text, ENT_QUOTES, 'UTF-8')));
            if ($number > 0 && $text !== '') {
                $items[] = array('v' => $number, 'text' => $text);
            }
        }

        // Some YouVersion verse-list responses are metadata-only. When that happens,
        // fetch the full first-to-last verse range and split it into reader rows.
        if (empty($items) && !empty($passage_ids)) {
            $first = reset($passage_ids);
            $last = end($passage_ids);
            $range = $first && $last ? $first . '-' . $last : '';
            if ($range) {
                $range_result = self::youversion_get_passage($bible_id, $range);
                if (!is_wp_error($range_result)) {
                    $text = trim((string) ($range_result['text'] ?? $range_result['khmer'] ?? ''));
                    $items = self::split_youversion_chapter_to_verses($text);
                }
            }
        }

        if (empty($items)) {
            return new WP_Error('cv_youversion_no_verse_content', 'YouVersion returned verse metadata but no Khmer verse text.', array('status' => 502));
        }

        $result = array('items' => $items, 'source' => 'youversion-verses');
        set_transient($cache_key, $result, self::cache_ttl());
        return $result;
    }

    private static function youversion_request_json($url, $cache_key = '') {
        if ($cache_key) {
            $cached = get_transient($cache_key);
            if ($cached !== false) { return $cached; }
        }
        $app_key = self::youversion_app_key();
        if ($app_key === '') {
            return new WP_Error('cv_youversion_missing_key', 'YouVersion App Key is not configured.', array('status' => 503));
        }
        $response = wp_remote_get($url, array(
            'timeout' => 18,
            'headers' => array(
                'X-YVP-App-Key' => $app_key,
                'Accept' => 'application/json, text/plain;q=0.9, */*;q=0.8',
            ),
        ));
        if (is_wp_error($response)) { return $response; }
        $code = (int) wp_remote_retrieve_response_code($response);
        $body = (string) wp_remote_retrieve_body($response);
        $json = json_decode($body, true);
        if ($code < 200 || $code >= 300 || !is_array($json)) {
            return new WP_Error('cv_youversion_http_error', 'YouVersion Bible API request failed.', array('status' => $code, 'body' => $body));
        }
        if ($cache_key) { set_transient($cache_key, $json, self::cache_ttl()); }
        return $json;
    }

    private static function youversion_verse_number_from_node($verse, $fallback) {
        $candidates = array($verse['title'] ?? '', $verse['id'] ?? '', $verse['passage_id'] ?? '');
        foreach ($candidates as $candidate) {
            $candidate = (string) $candidate;
            if (preg_match('/([0-9០-៩]{1,3})$/u', $candidate, $m)) {
                return self::localized_number_to_int($m[1]);
            }
        }
        return absint($fallback);
    }

    private static function split_youversion_chapter_to_verses($text) {
        $text = html_entity_decode(wp_strip_all_tags((string) $text), ENT_QUOTES, 'UTF-8');
        $text = trim(preg_replace('/\s+/u', ' ', $text));
        if ($text === '') { return array(); }

        preg_match_all('/(?:^|\s)([0-9០-៩]{1,3})\s+(.+?)(?=(?:\s+[0-9០-៩]{1,3}\s+)|$)/u', $text, $matches, PREG_SET_ORDER);
        $items = array();
        foreach ($matches as $match) {
            $number = self::localized_number_to_int($match[1]);
            $verse_text = trim($match[2]);
            if ($number > 0 && $verse_text !== '') {
                $items[] = array('v' => $number, 'text' => $verse_text);
            }
        }
        if (!empty($items)) { return $items; }

        return self::split_text_to_verses($text);
    }

    private static function localized_number_to_int($value) {
        $normalized = strtr((string) $value, array('០'=>'0','១'=>'1','២'=>'2','៣'=>'3','៤'=>'4','៥'=>'5','៦'=>'6','៧'=>'7','៨'=>'8','៩'=>'9'));
        return absint($normalized);
    }

    private static function normalize_youversion_passage_response($json, $bible_id, $passage) {
        $node = isset($json['data']) && is_array($json['data']) ? $json['data'] : $json;
        $text = self::extract_first_text_value($node, array('content', 'text', 'body', 'passage_text', 'plain_text', 'value'));
        $reference = self::extract_first_text_value($node, array('reference', 'human_reference', 'display_reference', 'title', 'label'));

        if (!$text && isset($node[0]) && is_array($node[0])) {
            $text = self::extract_first_text_value($node[0], array('content', 'text', 'body', 'passage_text', 'plain_text', 'value'));
            $reference = $reference ?: self::extract_first_text_value($node[0], array('reference', 'human_reference', 'display_reference', 'title', 'label'));
        }

        $text = trim(wp_strip_all_tags((string) $text));
        $reference = trim(wp_strip_all_tags((string) ($reference ?: $passage)));
        if ($text === '') {
            return new WP_Error('cv_youversion_empty_passage', 'YouVersion returned an empty Bible passage.', array('status' => 502));
        }

        return array(
            'bible_id' => $bible_id,
            'passage' => $passage,
            'reference' => $reference,
            'ref' => $reference,
            'khmerRef' => $reference,
            'text' => $text,
            'khmer' => $text,
            'source' => 'youversion',
            'version_name' => self::youversion_version_name($bible_id),
        );
    }

    private static function normalize_youversion_text_response($body, $bible_id, $passage) {
        $text = trim(wp_strip_all_tags((string) $body));
        if ($text === '') {
            return new WP_Error('cv_youversion_empty_response', 'YouVersion returned an empty response.', array('status' => 502));
        }
        return array(
            'bible_id' => $bible_id,
            'passage' => $passage,
            'reference' => $passage,
            'ref' => $passage,
            'khmerRef' => $passage,
            'text' => $text,
            'khmer' => $text,
            'source' => 'youversion',
            'version_name' => self::youversion_version_name($bible_id),
        );
    }

    private static function extract_first_text_value($source, $keys) {
        if (!is_array($source)) { return ''; }
        foreach ($keys as $key) {
            if (isset($source[$key]) && is_scalar($source[$key]) && trim((string) $source[$key]) !== '') {
                return (string) $source[$key];
            }
        }
        foreach ($source as $value) {
            if (is_array($value)) {
                $found = self::extract_first_text_value($value, $keys);
                if ($found !== '') { return $found; }
            }
        }
        return '';
    }

    private static function youversion_version_name($bible_id) {
        $bible_id = (string) $bible_id;
        if ($bible_id === '1270') {
            return 'ព្រះគម្ពីរបរិសុទ្ធ ១៩៥៤ (ពគប) - Khmer Old Version';
        }
        return 'YouVersion Bible ' . $bible_id;
    }

    private static function daily_passage_for_today() {
        $passages = array(
            'JHN.3.16', 'PSA.23.1', 'ROM.12.12', 'PRO.3.5', 'PHP.4.13',
            'ISA.41.10', 'MAT.5.16', 'ROM.8.28', '1CO.13.4', 'JER.29.11',
            'PSA.46.10', 'HEB.11.1', 'JHN.14.6', 'GAL.5.22', 'EPH.2.8'
        );
        $day = (int) gmdate('z', current_time('timestamp', true));
        return $passages[$day % count($passages)];
    }

    private static function daily_fallback_verse($passage = '', $error = null) {
        $items = array(
            array('passage' => 'JHN.3.16', 'ref' => 'John 3:16', 'khmerRef' => 'យ៉ូហាន ៣:១៦', 'text' => 'For God so loved the world, that he gave his only begotten Son.', 'khmer' => 'ដ្បិតព្រះទ្រង់ស្រឡាញ់មនុស្សលោក ដល់ម៉្លេះបានជាទ្រង់ប្រទានព្រះរាជបុត្រាទ្រង់តែ១ ដើម្បីឲ្យអ្នកណាដែលជឿដល់ព្រះរាជបុត្រានោះ មិនត្រូវវិនាសឡើយ គឺឲ្យមានជីវិតអស់កល្បជានិច្ចវិញ'),
            array('passage' => 'PSA.23.1', 'ref' => 'Psalm 23:1', 'khmerRef' => 'ទំនុកតម្កើង ២៣:១', 'text' => 'The LORD is my shepherd; I shall not want.', 'khmer' => 'ទំនុកនៃស្តេចដាវីឌ។ ព្រះយេហូវ៉ាទ្រង់ជាអ្នកគង្វាលខ្ញុំ ខ្ញុំនឹងមិនខ្វះអ្វីសោះ'),
            array('passage' => 'ROM.12.12', 'ref' => 'Romans 12:12', 'khmerRef' => 'រ៉ូម ១២:១២', 'text' => 'Rejoicing in hope; patient in tribulation; continuing instant in prayer.', 'khmer' => 'ចូរអរសប្បាយក្នុងសេចក្ដីសង្ឃឹម អត់ធ្មត់ក្នុងសេចក្ដីវេទនា ហើយខ្ជាប់ខ្ជួនក្នុងសេចក្ដីអធិស្ឋាន'),
            array('passage' => 'PRO.3.5', 'ref' => 'Proverbs 3:5', 'khmerRef' => 'សុភាសិត ៣:៥', 'text' => 'Trust in the LORD with all thine heart.', 'khmer' => 'ចូរទុកចិត្តដល់ព្រះយេហូវ៉ា ឲ្យអស់ពីចិត្ត'),
            array('passage' => 'PHP.4.13', 'ref' => 'Philippians 4:13', 'khmerRef' => 'ភីលីព ៤:១៣', 'text' => 'I can do all things through Christ which strengtheneth me.', 'khmer' => 'ខ្ញុំអាចនឹងធ្វើគ្រប់ការទាំងអស់បាន ដោយសារព្រះគ្រីស្ទដែលចំរើនកម្លាំងដល់ខ្ញុំ'),
        );
        $day = (int) gmdate('z', current_time('timestamp', true));
        $selected = $items[$day % count($items)];
        $selected['bible_id'] = '1270';
        $selected['reference'] = $selected['ref'];
        $selected['source'] = 'local-fallback';
        $selected['version_name'] = self::youversion_version_name('1270');
        $selected['fallback'] = true;
        if (is_wp_error($error)) {
            $selected['message'] = $error->get_error_message();
        }
        return $selected;
    }

    private static function normalize_book_for_public_api($book) {
        $book = trim((string) $book);
        $aliases = array('Psalm' => 'Psalms', 'Song' => 'Song of Solomon');
        return $aliases[$book] ?? $book;
    }

    public static function get_chapter($book, $chapter, $version = 'KHMER_OLD_1954') {
        $book = sanitize_text_field($book ?: 'John');
        $chapter = preg_replace('/[^0-9]/', '', (string) ($chapter ?: '1'));
        if (!$chapter) { $chapter = '1'; }
        $version = strtoupper(sanitize_text_field($version ?: 'KHMER_OLD_1954'));

        if (self::is_khmer_old_version($version)) {
            $khmer = self::youversion_get_chapter($book, $chapter, '1270');
            if (!is_wp_error($khmer)) { return $khmer; }
            return array(
                'book' => $book,
                'chapter' => $chapter,
                'version' => 'KHMER_OLD_1954',
                'version_name' => self::youversion_version_name('1270'),
                'items' => self::local_khmer_old_fallback_verses($book, $chapter),
                'source' => 'local-khmer-old-fallback',
                'message' => $khmer->get_error_message(),
            );
        }

        $api_bible_id = self::version_id($version);

        if ($api_bible_id) {
            $chapter_id = self::api_bible_chapter_id($book, $chapter);
            $json = self::api_bible_get('/bibles/' . rawurlencode($api_bible_id) . '/chapters/' . rawurlencode($chapter_id), array('content-type' => 'text', 'include-notes' => 'false', 'include-titles' => 'true'), $version);
            if (!is_wp_error($json) && !empty($json['data']['content'])) {
                return array(
                    'book' => $book,
                    'chapter' => $chapter,
                    'version' => $version,
                    'items' => self::split_text_to_verses(wp_strip_all_tags($json['data']['content'])),
                    'source' => 'api.bible',
                );
            }
        }

        $public = self::get_chapter_public_api($book, $chapter, $version);
        if (!is_wp_error($public)) { return $public; }

        return array(
            'book' => $book,
            'chapter' => $chapter,
            'version' => $version,
            'items' => self::local_fallback_verses($book, $chapter, $version),
            'source' => 'local-fallback',
        );
    }

    private static function get_chapter_public_api($book, $chapter, $version) {
        $translation = strtolower($version);
        if (!in_array($translation, array('kjv','web','asv'), true)) {
            $translation = 'kjv';
        }
        $reference = self::normalize_book_for_public_api($book) . ' ' . $chapter;
        $url = add_query_arg(array('translation' => $translation), trailingslashit(self::BIBLE_API_BASE) . rawurlencode($reference));
        $json = self::request_json($url, array(), 'cv_public_bible_' . md5($url));
        if (is_wp_error($json) || empty($json['verses']) || !is_array($json['verses'])) { return new WP_Error('cv_public_bible_empty', 'No public Bible API verses found.'); }
        $items = array();
        foreach ($json['verses'] as $verse) {
            $items[] = array(
                'v' => intval($verse['verse'] ?? 0),
                'text' => trim(wp_strip_all_tags($verse['text'] ?? '')),
            );
        }
        return array('book' => $book, 'chapter' => $chapter, 'version' => strtoupper($translation), 'items' => $items, 'source' => 'bible-api.com');
    }

    public static function search($query, $version = 'KJV', $limit = 20) {
        $query = sanitize_text_field($query);
        $version = strtoupper(sanitize_text_field($version ?: 'KJV'));
        if (!$query) { return array('items' => array(), 'source' => 'none'); }
        $api_bible_id = self::version_id($version);
        if ($api_bible_id) {
            $json = self::api_bible_get('/bibles/' . rawurlencode($api_bible_id) . '/search', array('query' => $query, 'limit' => max(1, min(50, absint($limit)))), $version);
            if (!is_wp_error($json) && !empty($json['data']['verses'])) {
                $items = array();
                foreach ($json['data']['verses'] as $verse) {
                    $items[] = array(
                        'reference' => sanitize_text_field($verse['reference'] ?? ''),
                        'text' => trim(wp_strip_all_tags($verse['text'] ?? '')),
                    );
                }
                return array('items' => $items, 'source' => 'api.bible');
            }
        }
        $local = self::local_word_study($query);
        return array('items' => array(), 'word' => $local, 'source' => 'local-word-study');
    }

    public static function get_media() {
        $settings = self::settings();
        if (!empty($settings['bible_brain_key'])) {
            $url = add_query_arg(array('key' => $settings['bible_brain_key'], 'media' => 'audio'), self::BIBLE_BRAIN_BASE . '/bibles');
            $json = self::request_json($url, array(), 'cv_bible_brain_media_' . md5($url));
            if (!is_wp_error($json) && is_array($json)) {
                $items = array();
                foreach (array_slice($json, 0, 12) as $item) {
                    $items[] = array(
                        'id' => sanitize_text_field($item['dbp_vid'] ?? $item['id'] ?? ''),
                        'title' => sanitize_text_field($item['name'] ?? $item['language'] ?? 'Audio Bible'),
                        'speaker' => 'Bible Brain',
                        'duration' => sanitize_text_field($item['media'] ?? 'Audio'),
                        'image' => 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=600&q=80',
                    );
                }
                if (!empty($items)) { return array('items' => $items, 'source' => 'bible-brain'); }
            }
        }
        return array('items' => self::sample_media(), 'source' => 'local-media');
    }

    public static function quotes($type = 'General') {
        global $wpdb;
        $table = $wpdb->prefix . 'cv_bible_quotes';
        $quote_type = strtolower($type) === 'preacher' ? 'preacher' : 'general';
        $rows = $wpdb->get_results($wpdb->prepare("SELECT quote_text, author, category, source FROM {$table} WHERE quote_type = %s ORDER BY RAND() LIMIT 24", $quote_type), ARRAY_A);
        if (is_array($rows) && !empty($rows)) {
            return array_map(function($row) {
                return array('text' => $row['quote_text'], 'author' => $row['author'], 'category' => $row['category'], 'source' => $row['source']);
            }, $rows);
        }
        return strtolower($type) === 'preacher' ? self::sample_preacher_quotes() : self::sample_general_quotes();
    }

    public static function save_typing_score($user_id, $reference, $wpm, $accuracy) {
        global $wpdb;
        if (!$user_id) { return false; }
        $table = $wpdb->prefix . 'cv_bible_typing_scores';
        return $wpdb->insert($table, array(
            'user_id' => absint($user_id),
            'reference' => sanitize_text_field($reference),
            'wpm' => absint($wpm),
            'accuracy' => max(0, min(100, absint($accuracy))),
            'created_at' => current_time('mysql'),
        ));
    }

    private static function api_bible_chapter_id($book, $chapter) {
        return self::youversion_book_usfm($book) . '.' . absint($chapter);
    }

    private static function youversion_book_usfm($book) {
        $map = array(
            'Genesis'=>'GEN','Exodus'=>'EXO','Leviticus'=>'LEV','Numbers'=>'NUM','Deuteronomy'=>'DEU','Joshua'=>'JOS','Judges'=>'JDG','Ruth'=>'RUT','1 Samuel'=>'1SA','2 Samuel'=>'2SA','1 Kings'=>'1KI','2 Kings'=>'2KI','1 Chronicles'=>'1CH','2 Chronicles'=>'2CH','Ezra'=>'EZR','Nehemiah'=>'NEH','Esther'=>'EST','Job'=>'JOB','Psalm'=>'PSA','Psalms'=>'PSA','Proverbs'=>'PRO','Ecclesiastes'=>'ECC','Song of Solomon'=>'SNG','Isaiah'=>'ISA','Jeremiah'=>'JER','Lamentations'=>'LAM','Ezekiel'=>'EZK','Daniel'=>'DAN','Hosea'=>'HOS','Joel'=>'JOL','Amos'=>'AMO','Obadiah'=>'OBA','Jonah'=>'JON','Micah'=>'MIC','Nahum'=>'NAM','Habakkuk'=>'HAB','Zephaniah'=>'ZEP','Haggai'=>'HAG','Zechariah'=>'ZEC','Malachi'=>'MAL','Matthew'=>'MAT','Mark'=>'MRK','Luke'=>'LUK','John'=>'JHN','Acts'=>'ACT','Romans'=>'ROM','1 Corinthians'=>'1CO','2 Corinthians'=>'2CO','Galatians'=>'GAL','Ephesians'=>'EPH','Philippians'=>'PHP','Colossians'=>'COL','1 Thessalonians'=>'1TH','2 Thessalonians'=>'2TH','1 Timothy'=>'1TI','2 Timothy'=>'2TI','Titus'=>'TIT','Philemon'=>'PHM','Hebrews'=>'HEB','James'=>'JAS','1 Peter'=>'1PE','2 Peter'=>'2PE','1 John'=>'1JN','2 John'=>'2JN','3 John'=>'3JN','Jude'=>'JUD','Revelation'=>'REV'
        );
        $book = trim((string) $book);
        return $map[$book] ?? strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $book), 0, 3));
    }

    private static function youversion_chapter_range_id($book, $chapter) {
        $book_usfm = self::youversion_book_usfm($book);
        $chapter = absint($chapter);
        $last_verse = self::book_chapter_verse_count($book, $chapter);
        if (!$book_usfm || !$chapter || !$last_verse) { return ''; }
        return $book_usfm . '.' . $chapter . '.1-' . $book_usfm . '.' . $chapter . '.' . $last_verse;
    }

    private static function book_chapter_verse_count($book, $chapter) {
        $chapter = absint($chapter);
        $counts = array(
            'Genesis'=>array(31,25,24,26,32,22,24,22,29,32,32,20,18,24,21,16,27,33,38,18,34,24,20,67,34,35,46,22,35,43,55,32,20,31,29,43,36,30,23,23,57,38,34,34,28,34,31,22,33,26),
            'Exodus'=>array(22,25,22,31,23,30,29,28,35,29,10,51,22,31,27,36,16,27,25,26,36,31,33,18,40,37,21,43,46,38,18,35,23,35,35,38,29,31,43,38),
            'Leviticus'=>array(17,16,17,35,19,30,38,36,24,20,47,8,59,57,33,34,16,30,37,27,24,33,44,23,55,46,34),
            'Numbers'=>array(54,34,51,49,31,27,89,26,23,36,35,16,33,45,41,50,13,32,22,29,35,41,30,25,18,65,23,31,39,17,54,42,56,29,34,13),
            'Deuteronomy'=>array(46,37,29,49,33,25,26,20,29,22,32,32,18,29,23,22,20,22,21,20,23,30,25,22,19,19,26,68,29,20,30,52,29,12),
            'Joshua'=>array(18,24,17,24,15,27,26,35,27,43,23,24,33,15,63,10,18,28,51,9,45,34,16,33),
            'Judges'=>array(36,23,31,24,31,40,25,35,57,18,40,15,25,20,20,31,13,31,30,48,25),
            'Ruth'=>array(22,23,18,22),
            '1 Samuel'=>array(28,36,21,22,12,21,17,22,27,27,15,25,23,52,35,23,58,30,24,42,15,23,29,22,44,25,12,25,11,31,13),
            '2 Samuel'=>array(27,32,39,12,25,23,29,18,13,19,27,31,39,33,37,23,29,33,43,26,22,51,39,25),
            '1 Kings'=>array(53,46,28,34,18,38,51,66,28,29,43,33,34,31,34,34,24,46,21,43,29,53),
            '2 Kings'=>array(18,25,27,44,27,33,20,29,37,36,21,21,25,29,38,20,41,37,37,21,26,20,37,20,30),
            '1 Chronicles'=>array(54,55,24,43,26,81,40,40,44,14,47,40,14,17,29,43,27,17,19,8,30,19,32,31,31,32,34,21,30),
            '2 Chronicles'=>array(17,18,17,22,14,42,22,18,31,19,23,16,22,15,19,14,19,34,11,37,20,12,21,27,28,23,9,27,36,27,21,33,25,33,27,23),
            'Ezra'=>array(11,70,13,24,17,22,28,36,15,44),
            'Nehemiah'=>array(11,20,32,23,19,19,73,18,38,39,36,47,31),
            'Esther'=>array(22,23,15,17,14,14,10,17,32,3),
            'Job'=>array(22,13,26,21,27,30,21,22,35,22,20,25,28,22,35,22,16,21,29,29,34,30,17,25,6,14,23,28,25,31,40,22,33,37,16,33,24,41,30,24,34,17),
            'Psalm'=>array(6,12,8,8,12,10,17,9,20,18,7,8,6,7,5,11,15,50,14,9,13,31,6,10,22,12,14,9,11,12,24,11,22,22,28,12,40,22,13,17,13,11,5,26,17,11,9,14,20,23,19,9,6,7,23,13,11,11,17,12,8,12,11,10,13,20,7,35,36,5,24,20,28,23,10,12,20,72,13,19,16,8,18,12,13,17,7,18,52,17,16,15,5,23,11,13,12,9,9,5,8,28,22,35,45,48,43,13,31,7,10,10,9,8,18,19,2,29,176,7,8,9,4,8,5,6,5,6,8,8,3,18,3,3,21,26,9,8,24,13,10,7,12,15,21,10,20,14,9,6),
            'Psalms'=>array(6,12,8,8,12,10,17,9,20,18,7,8,6,7,5,11,15,50,14,9,13,31,6,10,22,12,14,9,11,12,24,11,22,22,28,12,40,22,13,17,13,11,5,26,17,11,9,14,20,23,19,9,6,7,23,13,11,11,17,12,8,12,11,10,13,20,7,35,36,5,24,20,28,23,10,12,20,72,13,19,16,8,18,12,13,17,7,18,52,17,16,15,5,23,11,13,12,9,9,5,8,28,22,35,45,48,43,13,31,7,10,10,9,8,18,19,2,29,176,7,8,9,4,8,5,6,5,6,8,8,3,18,3,3,21,26,9,8,24,13,10,7,12,15,21,10,20,14,9,6),
            'Proverbs'=>array(33,22,35,27,23,35,27,36,18,32,31,28,25,35,33,33,28,24,29,30,31,29,35,34,28,28,27,28,27,33,31),
            'Ecclesiastes'=>array(18,26,22,16,20,12,29,17,18,20,10,14),
            'Song of Solomon'=>array(17,17,11,16,16,13,13,14),
            'Isaiah'=>array(31,22,26,6,30,13,25,22,21,34,16,6,22,32,9,14,14,7,25,6,17,25,18,23,12,21,13,29,24,33,9,20,24,17,10,22,38,22,8,31,29,25,28,28,25,13,15,22,26,11,23,15,12,17,13,12,21,14,21,22,11,12,19,12,25,24),
            'Jeremiah'=>array(19,37,25,31,31,30,34,22,26,25,23,17,27,22,21,21,27,23,15,18,14,30,40,10,38,24,22,17,32,24,40,44,26,22,19,32,21,28,18,16,18,22,13,30,5,28,7,47,39,46,64,34),
            'Lamentations'=>array(22,22,66,22,22),
            'Ezekiel'=>array(28,10,27,17,17,14,27,18,11,22,25,28,23,23,8,63,24,32,14,44,37,31,49,27,17,21,36,26,21,26,18,32,33,31,15,38,28,23,29,49,26,20,27,31,25,24,23,35),
            'Daniel'=>array(21,49,30,37,31,28,28,27,27,21,45,13),
            'Hosea'=>array(11,23,5,19,15,11,16,14,17,15,12,14,16,9),
            'Joel'=>array(20,32,21),
            'Amos'=>array(15,16,15,13,27,14,17,14,15),
            'Obadiah'=>array(21),
            'Jonah'=>array(17,10,10,11),
            'Micah'=>array(16,13,12,13,15,16,20),
            'Nahum'=>array(15,13,19),
            'Habakkuk'=>array(17,20,19),
            'Zephaniah'=>array(18,15,20),
            'Haggai'=>array(15,23),
            'Zechariah'=>array(21,13,10,14,11,15,14,23,17,12,17,14,9,21),
            'Malachi'=>array(14,17,18,6),
            'Matthew'=>array(25,23,17,25,48,34,29,34,38,42,30,50,58,36,39,28,27,35,30,34,46,46,39,51,46,75,66,20),
            'Mark'=>array(45,28,35,41,43,56,37,38,50,52,33,44,37,72,47,20),
            'Luke'=>array(80,52,38,44,39,49,50,56,62,42,54,59,35,35,32,31,37,43,48,47,38,71,56,53),
            'John'=>array(51,25,36,54,47,71,53,59,41,42,57,50,38,31,27,33,26,40,42,31,25),
            'Acts'=>array(26,47,26,37,42,15,60,40,43,48,30,25,52,28,41,40,34,28,41,38,40,30,35,27,27,32,44,31),
            'Romans'=>array(32,29,31,25,21,23,25,39,33,21,36,21,14,23,33,27),
            '1 Corinthians'=>array(31,16,23,21,13,20,40,13,27,33,34,31,13,40,58,24),
            '2 Corinthians'=>array(24,17,18,18,21,18,16,24,15,18,33,21,14),
            'Galatians'=>array(24,21,29,31,26,18),
            'Ephesians'=>array(23,22,21,32,33,24),
            'Philippians'=>array(30,30,21,23),
            'Colossians'=>array(29,23,25,18),
            '1 Thessalonians'=>array(10,20,13,18,28),
            '2 Thessalonians'=>array(12,17,18),
            '1 Timothy'=>array(20,15,16,16,25,21),
            '2 Timothy'=>array(18,26,17,22),
            'Titus'=>array(16,15,15),
            'Philemon'=>array(25),
            'Hebrews'=>array(14,18,19,16,14,20,28,13,28,39,40,29,25),
            'James'=>array(27,26,18,17,20),
            '1 Peter'=>array(25,25,22,19,14),
            '2 Peter'=>array(21,22,18),
            '1 John'=>array(10,29,24,21,21),
            '2 John'=>array(13),
            '3 John'=>array(14),
            'Jude'=>array(25),
            'Revelation'=>array(20,29,22,11,14,17,17,13,21,11,19,17,18,20,8,21,18,24,21,15,27,21),
        );
        if (!isset($counts[$book]) || !isset($counts[$book][$chapter - 1])) { return 0; }
        return absint($counts[$book][$chapter - 1]);
    }

    private static function split_text_to_verses($text) {
        $text = trim(preg_replace('/\s+/', ' ', (string) $text));
        if (!$text) { return array(); }
        $parts = preg_split('/(?=\b\d{1,3}\s+)/', $text, -1, PREG_SPLIT_NO_EMPTY);
        $items = array();
        foreach ($parts as $idx => $part) {
            if (preg_match('/^(\d{1,3})\s+(.*)$/', trim($part), $m)) {
                $items[] = array('v' => intval($m[1]), 'text' => trim($m[2]));
            }
        }
        if (empty($items)) { $items[] = array('v' => 1, 'text' => $text); }
        return $items;
    }

    private static function local_khmer_old_fallback_verses($book, $chapter) {
        $library = array(
            'John' => array(
                '1' => array(
                    array('v' => 1, 'text' => 'មិនទាន់អាចផ្ទុកខគម្ពីរខ្មែរ ១៩៥៤ ពី YouVersion បានទេ។ សូមពិនិត្យ YouVersion App Key និងការតភ្ជាប់ម៉ាស៊ីនមេ។'),
                ),
                '3' => array(
                    array('v' => 16, 'text' => 'ដ្បិតព្រះទ្រង់ស្រឡាញ់មនុស្សលោក ដល់ម៉្លេះបានជាទ្រង់ប្រទានព្រះរាជបុត្រាទ្រង់តែ១ ដើម្បីឲ្យអ្នកណាដែលជឿដល់ព្រះរាជបុត្រានោះ មិនត្រូវវិនាសឡើយ គឺឲ្យមានជីវិតអស់កល្បជានិច្ចវិញ'),
                ),
            ),
            'Psalm' => array(
                '23' => array(
                    array('v' => 1, 'text' => 'ព្រះយេហូវ៉ាទ្រង់ជាអ្នកគង្វាលខ្ញុំ ខ្ញុំនឹងមិនខ្វះអ្វីសោះ'),
                ),
            ),
        );
        return $library[$book][$chapter] ?? array(array('v' => 1, 'text' => 'មិនទាន់អាចផ្ទុកខគម្ពីរខ្មែរ ១៩៥៤ ពី YouVersion បានទេ។ សូមពិនិត្យ YouVersion App Key និងការតភ្ជាប់ម៉ាស៊ីនមេ។'));
    }

    private static function local_fallback_verses($book, $chapter, $version) {
        $library = array(
            'John' => array('1' => array(array('v'=>1,'text'=>'In the beginning was the Word, and the Word was with God, and the Word was God.'),array('v'=>2,'text'=>'The same was in the beginning with God.'),array('v'=>3,'text'=>'All things were made by him; and without him was not any thing made that was made.')), '3' => array(array('v'=>16,'text'=>'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.'))),
            'Genesis' => array('1' => array(array('v'=>1,'text'=>'In the beginning God created the heaven and the earth.'),array('v'=>2,'text'=>'And the earth was without form, and void; and darkness was upon the face of the deep.'))),
            'Romans' => array('8' => array(array('v'=>28,'text'=>'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.'))),
            'Psalm' => array('23' => array(array('v'=>1,'text'=>'The Lord is my shepherd; I shall not want.'),array('v'=>2,'text'=>'He maketh me to lie down in green pastures: he leadeth me beside the still waters.'),array('v'=>3,'text'=>'He restoreth my soul: he leadeth me in the paths of righteousness for his name’s sake.'))),
        );
        return $library[$book][$chapter] ?? array(array('v' => 1, 'text' => 'No verse data found yet. Add an API.Bible key in Settings > Faith In > Bible Backend for full Bible access.'));
    }

    private static function local_word_study($query) {
        $items = array(
            'grace' => array('original' => 'charis', 'transliteration' => "khar'-ece", 'meaning' => 'Graciousness; divine favor and its transforming influence.'),
            'love' => array('original' => 'agape', 'transliteration' => "ag-ah'-pay", 'meaning' => 'Self-giving covenant love; affection, benevolence, and charity.'),
            'faith' => array('original' => 'pistis', 'transliteration' => "pis'-tis", 'meaning' => 'Trust, confidence, belief, faithfulness, and conviction.'),
            'peace' => array('original' => 'eirene', 'transliteration' => "i-ray'-nay", 'meaning' => 'Peace, wholeness, rest, quietness, and reconciliation.'),
        );
        $key = strtolower(trim($query));
        return $items[$key] ?? null;
    }

    private static function sample_general_quotes() {
        return array(
            array('text' => 'Faith does not eliminate questions. But faith knows where to take them.', 'author' => 'Elisabeth Elliot'),
            array('text' => 'God is most glorified in us when we are most satisfied in Him.', 'author' => 'John Piper'),
            array('text' => 'To be a Christian without prayer is no more possible than to be alive without breathing.', 'author' => 'Martin Luther'),
        );
    }

    private static function sample_preacher_quotes() {
        return array(
            array('text' => 'He is no fool who gives what he cannot keep to gain what he cannot lose.', 'author' => 'Jim Elliot'),
            array('text' => 'If you are not seeking the Lord, the Devil is seeking you.', 'author' => 'Charles Spurgeon'),
        );
    }

    private static function sample_media() {
        return array(
            array('id' => 1, 'title' => 'The Book of John', 'speaker' => 'Faith In Social Studio', 'duration' => '45:00', 'image' => 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=600&q=80'),
            array('id' => 2, 'title' => 'Grace in Romans', 'speaker' => 'Faith In Social Studio', 'duration' => '32:15', 'image' => 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=600&q=80'),
            array('id' => 3, 'title' => 'Context of Genesis', 'speaker' => 'Faith In Social Studio', 'duration' => '50:20', 'image' => 'https://images.unsplash.com/photo-1505664177242-70b13d2f2c8f?auto=format&fit=crop&w=600&q=80'),
        );
    }
}
