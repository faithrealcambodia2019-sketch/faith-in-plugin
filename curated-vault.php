<?php
/**
 * Plugin Name: Faith In
 * Description: Faith In with public article publishing, resource uploads, social feed, prayer wall, and Bible tools.
 * Version: 5.5.225
 * Author: Faith In Team
 * Plugin URI: https://faithin.co
 * Author URI: https://faithin.co
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: curated-vault
 */
if (!defined('ABSPATH')) { exit; }

// WordPress.com pre-flight checks can load plugins before this optional core constant exists.
// Define the normal WordPress default here so page creation/upgrades do not fatal.
if (!defined('WP_POST_REVISIONS')) {
    define('WP_POST_REVISIONS', true);
}

if (!defined('CURATED_VAULT_VERSION')) { define('CURATED_VAULT_VERSION', '5.5.225'); }
if (!defined('CURATED_VAULT_MAX_UPLOAD_BYTES')) { define('CURATED_VAULT_MAX_UPLOAD_BYTES', 25 * 1024 * 1024); }

// Security: never ship private API keys in the plugin package. Set this in
// wp-config.php as CV_GEMINI_API_KEY, or save it in the WordPress option
// cv_gemini_api_key from a secure admin-only flow.
if (!defined('CV_GEMINI_API_KEY')) {
    $cv_gemini_api_key_from_env = getenv('CV_GEMINI_API_KEY');
    if (!empty($cv_gemini_api_key_from_env)) {
        define('CV_GEMINI_API_KEY', trim((string) $cv_gemini_api_key_from_env));
    }
}

// Optional YouVersion App Key for the Khmer Daily Bible Verse endpoint.
// Prefer defining this in wp-config.php or server environment instead of shipping keys in JavaScript.
if (!defined('CV_YOUVERSION_APP_KEY')) {
    $cv_youversion_app_key_from_env = getenv('CV_YOUVERSION_APP_KEY');
    if (!empty($cv_youversion_app_key_from_env)) {
        define('CV_YOUVERSION_APP_KEY', trim((string) $cv_youversion_app_key_from_env));
    }
}

if (!defined('CURATED_VAULT_GOOGLE_DRIVE_UPLOAD_URL')) { define('CURATED_VAULT_GOOGLE_DRIVE_UPLOAD_URL', 'https://script.google.com/macros/s/AKfycbwi8DMNRXZ8zl24T4-lPGM48xoCK-q-5ckGSTjgo3yV_34xXGXAqRH8Yz5WOaPfXp8QXg/exec'); }
if (!defined('CURATED_VAULT_PLUGIN_DIR')) { define('CURATED_VAULT_PLUGIN_DIR', plugin_dir_path(__FILE__)); }
if (!defined('CURATED_VAULT_PLUGIN_URL')) { define('CURATED_VAULT_PLUGIN_URL', plugin_dir_url(__FILE__)); }

if (!function_exists('curated_vault_output_custom_favicon')) {
function curated_vault_output_custom_favicon() {
    if (!defined('CURATED_VAULT_PLUGIN_URL')) { return; }
    $version = defined('CURATED_VAULT_VERSION') ? CURATED_VAULT_VERSION : '1.0.0';
    $asset_version = rawurlencode((string) $version);
    $favicon_svg = esc_url(CURATED_VAULT_PLUGIN_URL . 'assets/images/favicon.svg?v=' . $asset_version);
    $favicon_ico = esc_url(CURATED_VAULT_PLUGIN_URL . 'assets/images/favicon.ico?v=' . $asset_version);
    $favicon_32 = esc_url(CURATED_VAULT_PLUGIN_URL . 'assets/images/favicon-32x32.png?v=' . $asset_version);
    $apple_touch = esc_url(CURATED_VAULT_PLUGIN_URL . 'assets/images/favicon-180x180.png?v=' . $asset_version);
    echo "\n";
    echo '<link rel="icon" type="image/svg+xml" href="' . $favicon_svg . '" />' . "\n";
    echo '<link rel="icon" type="image/png" sizes="32x32" href="' . $favicon_32 . '" />' . "\n";
    echo '<link rel="shortcut icon" href="' . $favicon_ico . '" />' . "\n";
    echo '<link rel="apple-touch-icon" sizes="180x180" href="' . $apple_touch . '" />' . "\n";
}
}
add_action('wp_head', 'curated_vault_output_custom_favicon', 100);
add_action('login_head', 'curated_vault_output_custom_favicon', 100);
add_action('admin_head', 'curated_vault_output_custom_favicon', 100);

if (!function_exists('curated_vault_google_drive_upload_url')) {
function curated_vault_google_drive_upload_url() {
    $saved = trim((string) get_option('curated_vault_google_drive_upload_url', ''));
    $fallback = defined('CURATED_VAULT_GOOGLE_DRIVE_UPLOAD_URL') ? trim((string) CURATED_VAULT_GOOGLE_DRIVE_UPLOAD_URL) : '';
    // If an admin accidentally pasted the shortened visible URL with "...", ignore it and use the bundled working /exec URL.
    if ($saved && strpos($saved, '...') === false && preg_match('~^https://script\.google\.com/macros/s/[A-Za-z0-9_-]+/exec$~', $saved)) {
        return esc_url_raw($saved);
    }
    return esc_url_raw($fallback);
}
}

if (!function_exists('curated_vault_generate_google_drive_shared_secret')) {
function curated_vault_generate_google_drive_shared_secret() {
    try {
        return 'cv_' . bin2hex(random_bytes(32));
    } catch (Exception $e) {
        return 'cv_' . hash('sha256', uniqid('', true) . '|' . microtime(true) . '|' . (defined('AUTH_KEY') ? AUTH_KEY : 'faith-in'));
    }
}
}

if (!function_exists('curated_vault_google_drive_shared_secret')) {
function curated_vault_google_drive_shared_secret() {
    if (defined('CURATED_VAULT_GOOGLE_DRIVE_SHARED_SECRET') && trim((string) CURATED_VAULT_GOOGLE_DRIVE_SHARED_SECRET) !== '') {
        return trim((string) CURATED_VAULT_GOOGLE_DRIVE_SHARED_SECRET);
    }
    $saved = function_exists('get_option') ? trim((string) get_option('curated_vault_google_drive_shared_secret', '')) : '';
    if ($saved === '' || strlen($saved) < 32) {
        $saved = curated_vault_generate_google_drive_shared_secret();
        if (function_exists('update_option')) {
            update_option('curated_vault_google_drive_shared_secret', $saved, false);
        }
    }
    return $saved;
}
}

if (!function_exists('curated_vault_set_google_drive_shared_secret')) {
function curated_vault_set_google_drive_shared_secret($secret = '') {
    $secret = trim((string) $secret);
    if ($secret === '') { $secret = curated_vault_generate_google_drive_shared_secret(); }
    $secret = preg_replace('/[^A-Za-z0-9_\-]/', '', $secret);
    if (strlen($secret) < 32) { $secret = curated_vault_generate_google_drive_shared_secret(); }
    update_option('curated_vault_google_drive_shared_secret', $secret, false);
    return $secret;
}
}

if (!function_exists('curated_vault_send_security_headers')) {
function curated_vault_send_security_headers() {
    if (is_admin() || headers_sent()) { return; }
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('X-Frame-Options: SAMEORIGIN');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
}
}
add_action('send_headers', 'curated_vault_send_security_headers', 20);


if (!function_exists('curated_vault_media_storage_settings')) {
function curated_vault_media_storage_settings() {
    $defaults = array(
        'destination' => 'google_drive',
        'firebase_storage_bucket' => 'faith-app-98a5f.firebasestorage.app',
        'firebase_storage_prefix' => 'faith-in-uploads',
        'firebase_service_account_json' => '',
    );
    $saved = get_option('curated_vault_media_storage_settings', array());
    if (!is_array($saved)) { $saved = array(); }
    $settings = wp_parse_args($saved, $defaults);
    $settings['destination'] = ($settings['destination'] === 'firebase_storage') ? 'firebase_storage' : 'google_drive';
    $settings['firebase_storage_bucket'] = sanitize_text_field($settings['firebase_storage_bucket'] ?: $defaults['firebase_storage_bucket']);
    $settings['firebase_storage_prefix'] = trim(sanitize_text_field($settings['firebase_storage_prefix'] ?: $defaults['firebase_storage_prefix']), '/');
    return $settings;
}
}


if (!function_exists('curated_vault_media_storage_destination')) {
function curated_vault_media_storage_destination() {
    $settings = curated_vault_media_storage_settings();
    return $settings['destination'];
}
}


if (!function_exists('curated_vault_firebase_storage_service_account')) {
function curated_vault_firebase_storage_service_account() {
    $settings = curated_vault_media_storage_settings();
    $raw = trim((string) ($settings['firebase_service_account_json'] ?? ''));
    if ($raw === '') { return null; }
    $data = json_decode($raw, true);
    if (!is_array($data) || empty($data['client_email']) || empty($data['private_key'])) { return null; }
    return $data;
}
}


if (!function_exists('curated_vault_firebase_storage_bucket')) {
function curated_vault_firebase_storage_bucket() {
    $settings = curated_vault_media_storage_settings();
    $bucket = trim((string) ($settings['firebase_storage_bucket'] ?? ''));
    $bucket = preg_replace('~^gs://~', '', $bucket);
    $bucket = preg_replace('~^https?://~', '', $bucket);
    $bucket = trim($bucket, '/');
    return sanitize_text_field($bucket ?: 'faith-app-98a5f.firebasestorage.app');
}
}


if (!function_exists('curated_vault_firebase_storage_prefix')) {
function curated_vault_firebase_storage_prefix() {
    $settings = curated_vault_media_storage_settings();
    $prefix = trim((string) ($settings['firebase_storage_prefix'] ?? 'faith-in-uploads'), '/');
    return sanitize_text_field($prefix ?: 'faith-in-uploads');
}
}



if (!function_exists('curated_vault_google_drive_settings_page')) {
function curated_vault_google_drive_settings_page() {
    if (!current_user_can('manage_options')) { return; }
    $message = '';
    $secret_regenerated = false;
    $storage_settings = curated_vault_media_storage_settings();

    if (isset($_POST['curated_vault_drive_settings_nonce']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['curated_vault_drive_settings_nonce'])), 'curated_vault_drive_settings')) {
        $url = isset($_POST['curated_vault_google_drive_upload_url']) ? esc_url_raw(trim((string) wp_unslash($_POST['curated_vault_google_drive_upload_url']))) : '';
        $destination = isset($_POST['curated_vault_media_storage_destination']) ? sanitize_key(wp_unslash($_POST['curated_vault_media_storage_destination'])) : 'google_drive';
        $destination = ($destination === 'firebase_storage') ? 'firebase_storage' : 'google_drive';
        $bucket = isset($_POST['curated_vault_firebase_storage_bucket']) ? sanitize_text_field(wp_unslash($_POST['curated_vault_firebase_storage_bucket'])) : 'faith-app-98a5f.firebasestorage.app';
        $prefix = isset($_POST['curated_vault_firebase_storage_prefix']) ? trim(sanitize_text_field(wp_unslash($_POST['curated_vault_firebase_storage_prefix'])), '/') : 'faith-in-uploads';
        $service_account_json = isset($_POST['curated_vault_firebase_service_account_json']) ? trim((string) wp_unslash($_POST['curated_vault_firebase_service_account_json'])) : '';
        $clear_service_account = !empty($_POST['curated_vault_clear_firebase_service_account']);
        if (!empty($_POST['curated_vault_regenerate_drive_secret']) && function_exists('curated_vault_set_google_drive_shared_secret')) {
            curated_vault_set_google_drive_shared_secret();
            $secret_regenerated = true;
        }

        if ($url && !preg_match('~^https://script\.google\.com/macros/s/.+/exec$~', $url)) {
            $message = '<div class="notice notice-error"><p>Please paste the Google Apps Script Web App URL ending in <code>/exec</code>.</p></div>';
        } else {
            update_option('curated_vault_google_drive_upload_url', $url, false);

            $new_storage_settings = $storage_settings;
            $new_storage_settings['destination'] = $destination;
            $new_storage_settings['firebase_storage_bucket'] = $bucket ?: 'faith-app-98a5f.firebasestorage.app';
            $new_storage_settings['firebase_storage_prefix'] = $prefix ?: 'faith-in-uploads';

            if ($clear_service_account) {
                $new_storage_settings['firebase_service_account_json'] = '';
            } elseif ($service_account_json !== '') {
                $decoded = json_decode($service_account_json, true);
                if (!is_array($decoded) || empty($decoded['client_email']) || empty($decoded['private_key'])) {
                    $message = '<div class="notice notice-error"><p>Firebase service account JSON was not saved. Please paste the full JSON key file content with <code>client_email</code> and <code>private_key</code>.</p></div>';
                } else {
                    $new_storage_settings['firebase_service_account_json'] = wp_json_encode($decoded);
                }
            }

            if ($message === '') {
                update_option('curated_vault_media_storage_settings', $new_storage_settings, false);
                $storage_settings = curated_vault_media_storage_settings();
                $message = $secret_regenerated
                    ? '<div class="notice notice-warning"><p>Faith In media storage settings saved. Google Drive shared secret regenerated. Update <code>CURATED_VAULT_UPLOAD_SECRET</code> in Apps Script, redeploy the Web App, then test uploads.</p></div>'
                    : '<div class="notice notice-success"><p>Faith In media storage settings saved.</p></div>';
            }
        }
    }

    $current = curated_vault_google_drive_upload_url();
    $storage_settings = curated_vault_media_storage_settings();
    $service_account_ready = curated_vault_firebase_storage_service_account() ? true : false;
    ?>
    <div class="wrap">
        <h1>Faith In Media Storage</h1>
        <?php echo wp_kses_post($message); ?>
        <p><strong>Simple mode:</strong> your app data stays in WordPress. This page only controls where uploaded files/images are stored.</p>
        <form method="post">
            <?php wp_nonce_field('curated_vault_drive_settings', 'curated_vault_drive_settings_nonce'); ?>
            <h2>Upload destination</h2>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row">Where should new uploads go?</th>
                    <td>
                        <label><input type="radio" name="curated_vault_media_storage_destination" value="google_drive" <?php checked($storage_settings['destination'], 'google_drive'); ?> /> Keep Google Drive</label><br />
                        <label><input type="radio" name="curated_vault_media_storage_destination" value="firebase_storage" <?php checked($storage_settings['destination'], 'firebase_storage'); ?> /> Firebase Storage only</label>
                        <p class="description">This does not move your database to Firestore. Posts, users, comments, prayers, jobs, and settings remain in WordPress.</p>
                    </td>
                </tr>
            </table>

            <h2>Firebase Storage</h2>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="curated_vault_firebase_storage_bucket">Storage bucket</label></th>
                    <td>
                        <input name="curated_vault_firebase_storage_bucket" id="curated_vault_firebase_storage_bucket" type="text" class="regular-text code" value="<?php echo esc_attr($storage_settings['firebase_storage_bucket']); ?>" placeholder="faith-app-98a5f.firebasestorage.app" />
                        <p class="description">For your project link, use <code>faith-app-98a5f.firebasestorage.app</code>.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="curated_vault_firebase_storage_prefix">Upload folder prefix</label></th>
                    <td>
                        <input name="curated_vault_firebase_storage_prefix" id="curated_vault_firebase_storage_prefix" type="text" class="regular-text code" value="<?php echo esc_attr($storage_settings['firebase_storage_prefix']); ?>" placeholder="faith-in-uploads" />
                        <p class="description">New files will be saved under this folder in Firebase Storage.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="curated_vault_firebase_service_account_json">Service account JSON</label></th>
                    <td>
                        <textarea name="curated_vault_firebase_service_account_json" id="curated_vault_firebase_service_account_json" class="large-text code" rows="8" placeholder="Paste the Firebase/Google Cloud service account JSON here. Leave blank to keep the current saved key."></textarea>
                        <p class="description">Status: <strong><?php echo $service_account_ready ? 'configured' : 'not configured'; ?></strong>. Create this in Firebase Console / Google Cloud IAM, then paste the full JSON key here once.</p>
                        <?php if ($service_account_ready): ?>
                            <label><input type="checkbox" name="curated_vault_clear_firebase_service_account" value="1" /> Remove saved Firebase service account key</label>
                        <?php endif; ?>
                    </td>
                </tr>
            </table>

            <h2>Google Drive fallback</h2>
            <p>If you choose Google Drive above, the plugin keeps using your Apps Script uploader.</p>
            <table class="widefat striped" style="max-width:920px;margin:16px 0;"><tbody>
                <tr><th scope="row" style="width:240px;">Private Drive folder ID</th><td><code>13EeE--U74k_82pdFfAqMd5CptIi3jh-_</code></td></tr>
                <tr><th scope="row">Shared secret</th><td><code><?php echo esc_html(curated_vault_google_drive_shared_secret()); ?></code><p class="description">This is generated per website. It must match <code>CURATED_VAULT_UPLOAD_SECRET</code> in the Apps Script file included with this plugin.</p><label><input type="checkbox" name="curated_vault_regenerate_drive_secret" value="1" /> Regenerate this secret</label></td></tr>
                <tr>
                    <th scope="row"><label for="curated_vault_google_drive_upload_url">Apps Script Web App /exec URL</label></th>
                    <td><input name="curated_vault_google_drive_upload_url" id="curated_vault_google_drive_upload_url" type="url" class="regular-text code" style="width:680px;max-width:100%;" value="<?php echo esc_attr($current); ?>" placeholder="https://script.google.com/macros/s/AKfycb.../exec" /></td>
                </tr>
            </tbody></table>
            <?php submit_button('Save media storage settings'); ?>
        </form>
    </div>
    <?php
}
}


if (!function_exists('curated_vault_google_drive_admin_menu')) {
function curated_vault_google_drive_admin_menu() {
    add_options_page('Faith In Media Storage', 'Faith In Media Storage', 'manage_options', 'curated-vault-google-drive', 'curated_vault_google_drive_settings_page');
}
}

add_action('admin_menu', 'curated_vault_google_drive_admin_menu');

if (!function_exists('curated_vault_get_user_avatar_url')) {
function curated_vault_get_user_avatar_url($user_id, $size = 96) {
    $user_id = absint($user_id);
    if (!$user_id) {
        return '';
    }

    // Prefer uploaded profile photos. New uploads are stored outside the WP Media Library.
    $updated_at = (string) get_user_meta($user_id, 'cv_profile_picture_updated_at', true);
    $stored = esc_url_raw((string) get_user_meta($user_id, 'cv_profile_picture', true));
    if (!empty($stored)) {
        return esc_url_raw(add_query_arg('cv_avatar_v', $updated_at ? $updated_at : time(), $stored));
    }

    // App-only/Firebase users do not exist in wp_users, so get_avatar_url() shows a default pattern.
    // Pull their saved uploaded photo from the app profile instead so feed/profile cards show the real image.
    if (function_exists('curated_vault_app_profile_by_id')) {
        $profile = curated_vault_app_profile_by_id($user_id);
        if (is_array($profile)) {
            foreach (array('avatar_url', 'avatar', 'profile_image_url', 'profile_image', 'photo_url', 'photoURL', 'picture') as $key) {
                if (!empty($profile[$key]) && is_string($profile[$key])) {
                    $profile_avatar = esc_url_raw($profile[$key]);
                    if ($profile_avatar) {
                        $profile_updated = sanitize_text_field((string) ($profile['avatar_updated_at'] ?? $profile['profile_picture_updated_at'] ?? $profile['updated_at'] ?? ''));
                        return $profile_updated ? esc_url_raw(add_query_arg('cv_avatar_v', $profile_updated, $profile_avatar)) : $profile_avatar;
                    }
                }
            }
        }
    }

    $avatar = get_avatar_url($user_id, array('size' => absint($size)));
    return is_string($avatar) ? $avatar : '';
}
}



if (!function_exists('curated_vault_default_verification_payload')) {
function curated_vault_default_verification_payload() {
    return array(
        'show' => false,
        'type' => 'none',
        'level' => 'standard',
        'label' => 'Standard',
        'status_label' => 'Standard',
        'settings_label' => 'Standard',
        'badge_label' => '',
        'title' => 'Standard account',
        'description' => 'This account is active but does not currently display a public verification badge.',
        'rank' => 0,
        'is_verified' => false,
        'is_founder' => false,
        'is_google_verified' => false,
        'is_purple_tick' => false,
        'requirements' => array('Sign in with a verified Google account to receive the Gmail verification badge.'),
        'next_steps' => array('Keep your name and profile information up to date.'),
        'can_request_review' => true,
    );
}
}


if (!function_exists('curated_vault_build_verification_payload')) {
function curated_vault_build_verification_payload($type = 'none', $overrides = array()) {
    $type = sanitize_key($type);
    $catalog = array(
        'blue' => array(
            'show' => true,
            'type' => 'blue',
            'level' => 'founder',
            'label' => 'Founder',
            'status_label' => 'Blue tick',
            'settings_label' => 'Blue tick',
            'badge_label' => 'Founder',
            'title' => 'Founder account',
            'description' => 'Founder verification is reserved for the official Faith In founder account.',
            'rank' => 100,
            'is_verified' => true,
            'is_founder' => true,
            'is_google_verified' => true,
            'is_purple_tick' => false,
            'requirements' => array(),
            'next_steps' => array('No action needed.'),
            'can_request_review' => false,
        ),
        'purple' => array(
            'show' => true,
            'type' => 'purple',
            'level' => 'first_25',
            'label' => 'First 25',
            'status_label' => 'Purple tick',
            'settings_label' => 'Purple tick',
            'badge_label' => 'First 25',
            'title' => 'First 25 member',
            'description' => 'Purple verification is automatically granted to the first 25 registered Faith In members.',
            'rank' => 80,
            'is_verified' => true,
            'is_founder' => false,
            'is_google_verified' => false,
            'is_purple_tick' => true,
            'requirements' => array(),
            'next_steps' => array('No action needed.'),
            'can_request_review' => false,
        ),
        'yellow' => array(
            'show' => true,
            'type' => 'yellow',
            'level' => 'google',
            'label' => 'Gmail',
            'status_label' => 'Yellow tick',
            'settings_label' => 'Yellow tick',
            'badge_label' => 'Gmail',
            'title' => 'Verified Gmail account',
            'description' => 'Yellow verification confirms the account signed in with a verified Google or Gmail identity.',
            'rank' => 40,
            'is_verified' => true,
            'is_founder' => false,
            'is_google_verified' => true,
            'is_purple_tick' => false,
            'requirements' => array(),
            'next_steps' => array('No action needed.'),
            'can_request_review' => true,
        ),
        'none' => curated_vault_default_verification_payload(),
    );

    $payload = isset($catalog[$type]) ? $catalog[$type] : $catalog['none'];
    if (is_array($overrides) && !empty($overrides)) {
        $payload = array_merge($payload, $overrides);
    }

    if (empty($payload['settings_label'])) {
        $payload['settings_label'] = !empty($payload['status_label']) ? $payload['status_label'] : 'Standard';
    }
    return $payload;
}
}


if (!function_exists('curated_vault_get_app_profile_verification_payload')) {
function curated_vault_get_app_profile_verification_payload($profile) {
    $profile = is_array($profile) ? $profile : array();
    $email = strtolower(trim((string) ($profile['email'] ?? '')));
    $provider = strtolower(trim((string) ($profile['provider'] ?? 'google')));
    $founder_email = apply_filters('curated_vault_founder_verification_email', 'hunchet2030@gmail.com');
    $is_founder = ($email && $email === strtolower(trim((string) $founder_email)));
    $is_google_verified = (strpos($provider, 'google') !== false || preg_match('/@gmail\.com$/', $email));
    $is_first_twenty_five = false;

    if ($email) {
        $index = get_option('cv_app_profile_index', array());
        $index = is_array($index) ? array_values(array_filter(array_map('sanitize_email', $index))) : array();
        $position = array_search($email, $index, true);
        $is_first_twenty_five = ($position !== false && $position < 25) || ($position === false && count($index) < 25);
    }

    if ($is_founder) {
        return curated_vault_build_verification_payload('blue', array(
            'is_google_verified' => true,
            'is_purple_tick' => $is_first_twenty_five,
        ));
    }

    if ($is_first_twenty_five) {
        return curated_vault_build_verification_payload('purple', array(
            'is_google_verified' => $is_google_verified,
        ));
    }

    if ($is_google_verified) {
        return curated_vault_build_verification_payload('yellow');
    }

    return curated_vault_build_verification_payload('none');
}
}


if (!function_exists('curated_vault_get_user_verification_payload')) {
function curated_vault_get_user_verification_payload($user) {
    if ($user instanceof WP_User) {
        $wp_user = $user;
    } else {
        $user_id = absint($user);
        $wp_user = $user_id ? get_user_by('id', $user_id) : false;
    }

    if (!$wp_user) {
        return curated_vault_build_verification_payload('none');
    }

    $email = strtolower(trim((string) $wp_user->user_email));
    $domain = '';
    if (strpos($email, '@') !== false) {
        $parts = explode('@', $email);
        $domain = strtolower((string) end($parts));
    }

    $provider = strtolower(trim((string) get_user_meta($wp_user->ID, 'cv_auth_provider', true)));
    $founder_email = apply_filters('curated_vault_founder_verification_email', 'hunchet2030@gmail.com');
    $is_founder = ($email === strtolower(trim((string) $founder_email)));
    $is_google_verified = ($provider === 'google' || $domain === 'gmail.com');
    $purple_tick_limit = absint(apply_filters('curated_vault_purple_tick_limit', 25));
    $is_first_twenty_five = ($wp_user->ID > 0 && $purple_tick_limit > 0 && $wp_user->ID <= $purple_tick_limit);

    if ($is_founder) {
        return curated_vault_build_verification_payload('blue', array(
            'is_google_verified' => true,
            'is_purple_tick' => $is_first_twenty_five,
        ));
    }

    if ($is_first_twenty_five) {
        return curated_vault_build_verification_payload('purple', array(
            'is_google_verified' => $is_google_verified,
        ));
    }

    if ($is_google_verified) {
        return curated_vault_build_verification_payload('yellow');
    }

    return curated_vault_build_verification_payload('none');
}
}


if (!function_exists('curated_vault_get_current_verification_status_payload')) {
function curated_vault_get_current_verification_status_payload($user_id = 0) {
    $user_id = absint($user_id);
    $payload = null;
    $request = null;

    if (function_exists('curated_vault_get_google_app_session')) {
        $session = curated_vault_get_google_app_session();
        if (is_array($session) && !empty($session['id']) && (!$user_id || absint($session['id']) === $user_id)) {
            $payload = curated_vault_get_app_profile_verification_payload($session);
            $request = is_array($session['verification_request'] ?? null) ? $session['verification_request'] : null;
        }
    }

    if (!$payload && $user_id) {
        $user = get_user_by('id', $user_id);
        if ($user) {
            $payload = curated_vault_get_user_verification_payload($user);
            $request = get_user_meta($user_id, 'cv_verification_request', true);
            $request = is_array($request) ? $request : null;
        } else {
            $profile = function_exists('curated_vault_app_profile_by_id') ? curated_vault_app_profile_by_id($user_id) : null;
            if (is_array($profile)) {
                $payload = curated_vault_get_app_profile_verification_payload($profile);
                $request = is_array($profile['verification_request'] ?? null) ? $profile['verification_request'] : null;
            }
        }
    }

    if (!$payload && is_user_logged_in()) {
        $payload = curated_vault_get_user_verification_payload(wp_get_current_user());
        $request = get_user_meta(get_current_user_id(), 'cv_verification_request', true);
        $request = is_array($request) ? $request : null;
    }

    $payload = is_array($payload) ? $payload : curated_vault_build_verification_payload('none');
    return array(
        'verification' => $payload,
        'request' => $request,
        'tiers' => array(
            curated_vault_build_verification_payload('blue'),
            curated_vault_build_verification_payload('purple'),
            curated_vault_build_verification_payload('yellow'),
            curated_vault_build_verification_payload('none'),
        ),
    );
}
}



if (!function_exists('curated_vault_create_social_follows_table')) {
function curated_vault_create_social_follows_table() {
    global $wpdb;
    $table = $wpdb->prefix . 'cv_social_follows';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE {$table} (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        follower_id BIGINT UNSIGNED NOT NULL,
        following_id BIGINT UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY follower_following (follower_id, following_id),
        KEY follower_id (follower_id),
        KEY following_id (following_id),
        KEY created_at (created_at)
    ) {$charset_collate};";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta($sql);
}
}


register_activation_hook(__FILE__, 'curated_vault_create_social_follows_table');
if (!function_exists('curated_vault_social_table')) {
function curated_vault_social_table() {
    global $wpdb;
    return $wpdb->prefix . 'cv_social_follows';
}
}


if (!function_exists('curated_vault_app_profile_by_id')) {
function curated_vault_app_profile_by_id($user_id) {
    $user_id = absint($user_id);
    if (!$user_id || !function_exists('curated_vault_list_app_profiles')) { return null; }
    foreach (curated_vault_list_app_profiles(500) as $profile) {
        if (absint($profile['id'] ?? 0) === $user_id) { return $profile; }
    }
    return null;
}
}


if (!function_exists('curated_vault_social_entity_exists')) {
function curated_vault_social_entity_exists($user_id) {
    $user_id = absint($user_id);
    if (!$user_id) { return false; }
    if (get_user_by('id', $user_id)) { return true; }
    return (bool) curated_vault_app_profile_by_id($user_id);
}
}


if (!function_exists('curated_vault_social_get_ids')) {
function curated_vault_social_get_ids($user_id, $type = 'following') {
    $user_id = absint($user_id);
    $meta_key = $type === 'followers' ? 'cv_followers' : 'cv_following';
    if (!$user_id) { return array(); }

    $wp_user = get_user_by('id', $user_id);
    if ($wp_user) {
        $ids = get_user_meta($user_id, $meta_key, true);
    } else {
        $profile = curated_vault_app_profile_by_id($user_id);
        $ids = is_array($profile) ? ($profile[$type === 'followers' ? 'followers' : 'following'] ?? array()) : array();
    }

    return is_array($ids) ? array_values(array_filter(array_unique(array_map('absint', $ids)))) : array();
}
}


if (!function_exists('curated_vault_social_set_ids')) {
function curated_vault_social_set_ids($user_id, $type, $ids) {
    $user_id = absint($user_id);
    $type = $type === 'followers' ? 'followers' : 'following';
    $meta_key = $type === 'followers' ? 'cv_followers' : 'cv_following';
    $ids = is_array($ids) ? array_values(array_filter(array_unique(array_map('absint', $ids)))) : array();
    if (!$user_id) { return false; }

    $wp_user = get_user_by('id', $user_id);
    if ($wp_user) {
        update_user_meta($user_id, $meta_key, $ids);
        return true;
    }

    $profile = curated_vault_app_profile_by_id($user_id);
    if (is_array($profile) && !empty($profile['email'])) {
        $profile[$type] = $ids;
        if ($type === 'followers') { $profile['followers_count'] = count($ids); }
        if ($type === 'following') { $profile['following_count'] = count($ids); }
        curated_vault_save_app_profile($profile['email'], $profile);

        $session = curated_vault_get_google_app_session();
        if (is_array($session) && absint($session['id'] ?? 0) === $user_id) {
            curated_vault_update_google_app_session(array(
                $type => $ids,
                $type . '_count' => count($ids),
            ));
        }
        return true;
    }

    return false;
}
}


if (!function_exists('curated_vault_social_is_following')) {
function curated_vault_social_is_following($follower_id, $following_id) {
    $follower_id = absint($follower_id);
    $following_id = absint($following_id);
    if (!$follower_id || !$following_id) { return false; }
    return in_array($following_id, curated_vault_social_get_ids($follower_id, 'following'), true);
}
}


if (!function_exists('curated_vault_social_counts')) {
function curated_vault_social_counts($user_id) {
    $user_id = absint($user_id);
    if (!$user_id) { return array('followers' => 0, 'following' => 0); }
    return array(
        'followers' => count(curated_vault_social_get_ids($user_id, 'followers')),
        'following' => count(curated_vault_social_get_ids($user_id, 'following')),
    );
}
}



if (!function_exists('curated_vault_current_effective_user_id')) {
function curated_vault_current_effective_user_id() {
    if (function_exists('curated_vault_get_google_app_session')) {
        $session = curated_vault_get_google_app_session();
        if (is_array($session) && !empty($session['id'])) { return absint($session['id']); }
    }
    return is_user_logged_in() ? get_current_user_id() : 0;
}
}

if (!function_exists('curated_vault_public_profile_email')) {
function curated_vault_public_profile_email($user_id, $email) {
    $user_id = absint($user_id);
    if (current_user_can('manage_options')) { return sanitize_email($email); }
    $current_user_id = curated_vault_current_effective_user_id();
    return ($user_id && $current_user_id && $current_user_id === $user_id) ? sanitize_email($email) : '';
}
}

if (!function_exists('curated_vault_social_user_summary')) {
function curated_vault_social_user_summary($user_id) {
    $user_id = absint($user_id);
    if (!$user_id) { return null; }

    $current_user_id = 0;
    if (function_exists('curated_vault_get_google_app_session')) {
        $session = curated_vault_get_google_app_session();
        if (is_array($session) && !empty($session['id'])) { $current_user_id = absint($session['id']); }
    }
    if (!$current_user_id && is_user_logged_in()) { $current_user_id = get_current_user_id(); }

    $app_profile = curated_vault_app_profile_by_id($user_id);
    if (is_array($app_profile)) {
        return curated_vault_app_profile_summary($app_profile, $current_user_id);
    }

    $user = get_user_by('id', $user_id);
    if (!$user) { return null; }
    $name = $user->display_name ? $user->display_name : $user->user_login;

    return array(
        'id' => $user_id,
        'app_user' => false,
        'name' => $name,
        'email' => curated_vault_public_profile_email($user_id, $user->user_email),
        'handle' => '@' . sanitize_title($name ? $name : $user->user_login),
        'avatar_url' => function_exists('curated_vault_get_user_avatar_url') ? curated_vault_get_user_avatar_url($user_id, 80) : get_avatar_url($user_id, array('size' => 80)),
        'role' => (string) get_user_meta($user_id, 'cv_role', true),
        'location' => (string) get_user_meta($user_id, 'cv_location', true),
        'industry' => (string) get_user_meta($user_id, 'cv_industry', true),
        'church' => (string) get_user_meta($user_id, 'cv_church', true),
        'ministry' => (string) get_user_meta($user_id, 'cv_ministry', true),
        'verification' => function_exists('curated_vault_get_user_verification_payload') ? curated_vault_get_user_verification_payload($user) : array('show' => false, 'type' => 'none', 'label' => ''),
        'is_self' => $current_user_id && $current_user_id === $user_id,
        'is_following' => $current_user_id ? curated_vault_social_is_following($current_user_id, $user_id) : false,
        'counts' => curated_vault_social_counts($user_id),
    );
}
}


if (!function_exists('curated_vault_social_list')) {
function curated_vault_social_list($user_id, $type = 'followers', $limit = 50) {
    $user_id = absint($user_id);
    $limit = max(1, min(100, absint($limit)));
    $ids = array_slice(array_reverse(curated_vault_social_get_ids($user_id, $type === 'following' ? 'following' : 'followers')), 0, $limit);

    $items = array();
    foreach ($ids as $id) {
        $summary = curated_vault_social_user_summary($id);
        if ($summary) { $items[] = $summary; }
    }
    return $items;
}
}

if (!function_exists('curated_vault_google_session_cookie_name')) {
function curated_vault_google_session_cookie_name() { return 'cv_google_session'; }
}

if (!function_exists('curated_vault_google_session_key')) {
function curated_vault_google_session_key($token) { return 'cv_google_session_' . hash_hmac('sha256', (string) $token, wp_salt('auth')); }
}

if (!function_exists('curated_vault_app_user_id_from_email')) {
function curated_vault_app_user_id_from_email($email) { $email = strtolower(trim((string) $email)); return $email ? absint((sprintf('%u', crc32($email)) % 2000000000) + 100000) : 0; }
}

if (!function_exists('curated_vault_app_profile_key')) {
function curated_vault_app_profile_key($email) { return 'cv_app_profile_' . md5(strtolower(trim((string) $email))); }
}

if (!function_exists('curated_vault_get_saved_app_profile')) {
function curated_vault_get_saved_app_profile($email) {
    $email = sanitize_email($email);
    if (!$email) { return array(); }
    $saved = get_option(curated_vault_app_profile_key($email), array());
    return is_array($saved) ? $saved : array();
}
}

if (!function_exists('curated_vault_save_app_profile')) {
function curated_vault_save_app_profile($email, $profile) {
    $email = sanitize_email($email);
    if (!$email || !is_array($profile)) { return false; }
    $profile['email'] = $email;
    $profile['id'] = curated_vault_app_user_id_from_email($email);
    $profile['provider'] = sanitize_text_field($profile['provider'] ?? 'google');
    $profile['registered_at'] = !empty($profile['registered_at']) ? sanitize_text_field($profile['registered_at']) : gmdate('c');
    $profile['joined'] = !empty($profile['joined']) ? sanitize_text_field($profile['joined']) : date_i18n('j-M-Y');
    update_option(curated_vault_app_profile_key($email), $profile, false);
    $index = get_option('cv_app_profile_index', array());
    $index = is_array($index) ? $index : array();
    if (!in_array($email, $index, true)) {
        $index[] = $email;
        update_option('cv_app_profile_index', array_values(array_unique($index)), false);
    }
    return true;
}
}

if (!function_exists('curated_vault_list_app_profiles')) {
function curated_vault_list_app_profiles($limit = 100) {
    global $wpdb;
    $limit = max(1, min(500, absint($limit)));
    $emails = get_option('cv_app_profile_index', array());
    $emails = is_array($emails) ? array_values(array_filter(array_map('sanitize_email', $emails))) : array();
    $rows = $wpdb->get_col($wpdb->prepare("SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s LIMIT %d", $wpdb->esc_like('cv_app_profile_') . '%', $limit));
    foreach ((array) $rows as $option_name) {
        $profile = get_option($option_name, array());
        if (is_array($profile) && !empty($profile['email'])) { $emails[] = sanitize_email($profile['email']); }
    }
    $emails = array_values(array_unique(array_filter($emails)));
    $profiles = array();
    foreach ($emails as $email) {
        $profile = curated_vault_get_saved_app_profile($email);
        if (!is_array($profile) || empty($profile['email'])) { continue; }
        $profile['id'] = curated_vault_app_user_id_from_email($profile['email']);
        $profile['logged_in'] = true;
        $profile['provider'] = $profile['provider'] ?? 'google';
        $profile['username'] = !empty($profile['username']) ? $profile['username'] : sanitize_title($profile['name'] ?? current(explode('@', $profile['email'])));
        $profile['handle'] = !empty($profile['handle']) ? $profile['handle'] : '@' . $profile['username'];
        $profile['verification'] = function_exists('curated_vault_get_app_profile_verification_payload') ? curated_vault_get_app_profile_verification_payload($profile) : (!empty($profile['verification']) && is_array($profile['verification']) ? $profile['verification'] : array('show' => true, 'type' => 'yellow', 'label' => 'Google', 'title' => 'Verified Google account', 'is_google_verified' => true));
        $profiles[] = $profile;
    }
    usort($profiles, function($a, $b) {
        $ta = !empty($a['registered_at']) ? strtotime($a['registered_at']) : 0;
        $tb = !empty($b['registered_at']) ? strtotime($b['registered_at']) : 0;
        return $tb <=> $ta;
    });
    return array_slice($profiles, 0, $limit);
}
}

if (!function_exists('curated_vault_app_profile_summary')) {
function curated_vault_app_profile_summary($profile, $current_user_id = 0) {
    if (!is_array($profile) || empty($profile['email'])) { return null; }
    $id = curated_vault_app_user_id_from_email($profile['email']);
    $name = sanitize_text_field($profile['name'] ?? current(explode('@', $profile['email'])));
    $username = !empty($profile['username']) ? sanitize_title($profile['username']) : sanitize_title($name ?: current(explode('@', $profile['email'])));
    $followers = is_array($profile['followers'] ?? null) ? array_values(array_filter(array_map('absint', $profile['followers']))) : array();
    $following = is_array($profile['following'] ?? null) ? array_values(array_filter(array_map('absint', $profile['following']))) : array();
    $avatar_url = '';
    foreach (array('avatar_url', 'avatar', 'profile_image_url', 'profile_image', 'photo_url', 'photoURL', 'picture') as $avatar_key) {
        if (!empty($profile[$avatar_key]) && is_string($profile[$avatar_key])) {
            $avatar_url = esc_url_raw($profile[$avatar_key]);
            if ($avatar_url) { break; }
        }
    }
    $avatar_updated = sanitize_text_field((string) ($profile['avatar_updated_at'] ?? $profile['profile_picture_updated_at'] ?? ''));
    if ($avatar_url && $avatar_updated) {
        $avatar_url = esc_url_raw(add_query_arg('cv_avatar_v', $avatar_updated, $avatar_url));
    }
    return array(
        'id' => $id,
        'app_user' => true,
        'provider' => sanitize_text_field($profile['provider'] ?? 'google'),
        'name' => $name,
        'handle' => '@' . $username,
        'username' => $username,
        'avatar_url' => $avatar_url,
        'avatar' => $avatar_url,
        'cover_url' => esc_url_raw($profile['cover_url'] ?? ($profile['cover_image'] ?? '')),
        'role' => sanitize_text_field($profile['role'] ?? ''),
        'location' => sanitize_text_field($profile['location'] ?? ''),
        'industry' => sanitize_text_field($profile['industry'] ?? ''),
        'church' => sanitize_text_field($profile['church'] ?? ''),
        'ministry' => sanitize_text_field($profile['ministry'] ?? ''),
        'bio' => wp_trim_words(wp_strip_all_tags((string) ($profile['bio'] ?? '')), 22, '...'),
        'joined' => sanitize_text_field($profile['joined'] ?? ''),
        'registered_at' => sanitize_text_field($profile['registered_at'] ?? ''),
        'verification' => function_exists('curated_vault_get_app_profile_verification_payload') ? curated_vault_get_app_profile_verification_payload($profile) : (!empty($profile['verification']) && is_array($profile['verification']) ? $profile['verification'] : array('show' => true, 'type' => 'yellow', 'label' => 'Google', 'title' => 'Verified Google account', 'is_google_verified' => true)),
        'is_self' => $current_user_id && absint($current_user_id) === $id,
        'is_following' => ($current_user_id && function_exists('curated_vault_social_is_following')) ? curated_vault_social_is_following($current_user_id, $id) : ($current_user_id && in_array(absint($current_user_id), $followers, true)),
        'counts' => array('followers' => count($followers), 'following' => count($following)),
        'followers_count' => count($followers),
        'following_count' => count($following),
    );
}
}

if (!function_exists('curated_vault_set_google_app_session')) {
function curated_vault_set_google_app_session($profile) {
    $email = sanitize_email($profile['email'] ?? '');
    if (!$email) { return null; }
    $name = sanitize_text_field($profile['name'] ?? current(explode('@', $email)));
    $avatar_url = esc_url_raw($profile['avatar_url'] ?? '');
    $provider = sanitize_text_field($profile['provider'] ?? 'google');
    if (!$provider) { $provider = 'google'; }
    $verification = function_exists('curated_vault_get_app_profile_verification_payload')
        ? curated_vault_get_app_profile_verification_payload(array('email' => $email, 'provider' => $provider))
        : ((strpos($provider, 'google') !== false)
            ? array('show' => true, 'type' => 'yellow', 'label' => 'Google', 'title' => 'Verified Google account', 'is_google_verified' => true)
            : array('show' => false, 'type' => 'none', 'label' => 'Standard', 'title' => 'Standard account', 'is_google_verified' => false));
    $base = array('logged_in' => true, 'provider' => $provider, 'id' => curated_vault_app_user_id_from_email($email), 'name' => ($name ?: $email), 'email' => $email, 'avatar_url' => $avatar_url, 'username' => sanitize_title($name ?: current(explode('@', $email))), 'handle' => '@' . sanitize_title($name ?: current(explode('@', $email))), 'role' => '', 'location' => '', 'industry' => '', 'church' => '', 'ministry' => '', 'bio' => '', 'joined' => '', 'followers_count' => 0, 'following_count' => 0, 'followers' => array(), 'following' => array(), 'resources' => array(), 'articles' => array(), 'settings' => array('theme' => 'light', 'lang' => 'English', 'notifications' => true), 'verification' => $verification);
    $saved = curated_vault_get_saved_app_profile($email);
    $payload = wp_parse_args($saved, $base);
    $payload['logged_in'] = true;
    $payload['provider'] = $provider;
    $payload['email'] = $email;
    $payload['id'] = curated_vault_app_user_id_from_email($email);
    $payload['name'] = !empty($saved['name']) ? sanitize_text_field($saved['name']) : ($name ?: $email);
    $payload['avatar_url'] = !empty($saved['avatar_url']) ? esc_url_raw($saved['avatar_url']) : $avatar_url;
    $payload['verification'] = $verification;
    curated_vault_save_app_profile($email, $payload);
    $token = wp_generate_password(64, false, false);
    set_transient(curated_vault_google_session_key($token), $payload, 14 * DAY_IN_SECONDS);
    setcookie(curated_vault_google_session_cookie_name(), $token, array('expires' => time() + 14 * DAY_IN_SECONDS, 'path' => '/', 'domain' => defined('COOKIE_DOMAIN') ? COOKIE_DOMAIN : '', 'secure' => is_ssl(), 'httponly' => true, 'samesite' => 'Lax'));
    $_COOKIE[curated_vault_google_session_cookie_name()] = $token;
    return $payload;
}
}

if (!function_exists('curated_vault_update_google_app_session')) {
function curated_vault_update_google_app_session($updates) {
    $name = curated_vault_google_session_cookie_name();
    $token = isset($_COOKIE[$name]) ? sanitize_text_field(wp_unslash($_COOKIE[$name])) : '';
    if (!$token || !is_array($updates)) { return null; }
    $payload = get_transient(curated_vault_google_session_key($token));
    if (!is_array($payload) || empty($payload['email'])) { return null; }
    $payload = array_merge($payload, $updates);
    $payload['logged_in'] = true;
    curated_vault_save_app_profile($payload['email'], $payload);
    set_transient(curated_vault_google_session_key($token), $payload, 14 * DAY_IN_SECONDS);
    return $payload;
}
}

if (!function_exists('curated_vault_get_google_app_session')) {
function curated_vault_get_google_app_session() {
    $name = curated_vault_google_session_cookie_name();
    $token = isset($_COOKIE[$name]) ? sanitize_text_field(wp_unslash($_COOKIE[$name])) : '';
    if (!$token) { return null; }
    $payload = get_transient(curated_vault_google_session_key($token));
    if (is_array($payload) && !empty($payload['email']) && function_exists('curated_vault_get_saved_app_profile')) {
        $saved_profile = curated_vault_get_saved_app_profile($payload['email']);
        if (is_array($saved_profile) && !empty($saved_profile)) {
            $session_payload = $payload;
            $payload = wp_parse_args($saved_profile, $payload);
            foreach (array('avatar_url', 'avatar', 'profile_image_url', 'profile_image', 'photo_url', 'photoURL', 'picture') as $avatar_key) {
                if (empty($payload[$avatar_key]) && !empty($session_payload[$avatar_key])) {
                    $payload[$avatar_key] = $session_payload[$avatar_key];
                }
            }
            $payload['logged_in'] = true;
            $payload['email'] = sanitize_email($payload['email']);
            $payload['id'] = function_exists('curated_vault_app_user_id_from_email') ? curated_vault_app_user_id_from_email($payload['email']) : absint($payload['id'] ?? 0);
            set_transient(curated_vault_google_session_key($token), $payload, 14 * DAY_IN_SECONDS);
        }
    }
    if (is_array($payload) && !empty($payload['email']) && function_exists('curated_vault_get_app_profile_verification_payload')) {
        $payload['verification'] = curated_vault_get_app_profile_verification_payload($payload);
    }
    return is_array($payload) ? $payload : null;
}
}

if (!function_exists('curated_vault_is_app_logged_in')) {
function curated_vault_is_app_logged_in() { return (bool) curated_vault_get_google_app_session(); }
}


if (!function_exists('curated_vault_drive_proxy_signature')) {
function curated_vault_drive_proxy_signature($file_id) {
    $secret = function_exists('curated_vault_google_drive_shared_secret') ? curated_vault_google_drive_shared_secret() : (defined('CURATED_VAULT_GOOGLE_DRIVE_SHARED_SECRET') ? trim((string) CURATED_VAULT_GOOGLE_DRIVE_SHARED_SECRET) : '');
    return $secret ? hash_hmac('sha256', (string) $file_id, $secret) : '';
}
}

if (!function_exists('curated_vault_drive_proxy_url')) {
function curated_vault_drive_proxy_url($file_id) {
    $file_id = preg_replace('/[^A-Za-z0-9_-]/', '', (string) $file_id);
    if (!$file_id) { return ''; }
    return esc_url_raw(add_query_arg(array('cv_drive_file' => $file_id, 'cv_sig' => curated_vault_drive_proxy_signature($file_id)), home_url('/')));
}
}

if (!function_exists('curated_vault_maybe_proxy_drive_file')) {
function curated_vault_maybe_proxy_drive_file() {
    $file_id = isset($_GET['cv_drive_file']) ? preg_replace('/[^A-Za-z0-9_-]/', '', wp_unslash((string) $_GET['cv_drive_file'])) : '';
    if (!$file_id) { return; }
    $sig = isset($_GET['cv_sig']) ? sanitize_text_field(wp_unslash((string) $_GET['cv_sig'])) : '';
    $expected = curated_vault_drive_proxy_signature($file_id);
    if (!$expected || !hash_equals($expected, $sig)) { status_header(403); exit('Invalid file signature.'); }
    if (!is_user_logged_in() && !curated_vault_is_app_logged_in()) { status_header(403); exit('Please sign in to view this private file.'); }
    $secret = function_exists('curated_vault_google_drive_shared_secret') ? curated_vault_google_drive_shared_secret() : (defined('CURATED_VAULT_GOOGLE_DRIVE_SHARED_SECRET') ? trim((string) CURATED_VAULT_GOOGLE_DRIVE_SHARED_SECRET) : '');
    if (!$secret) { status_header(500); exit('Google Drive shared secret is not configured.'); }
    $download_url = add_query_arg(array('action' => 'download', 'id' => $file_id, 'secret' => $secret), curated_vault_google_drive_upload_url());
    $response = wp_remote_get($download_url, array('timeout' => 60, 'redirection' => 3, 'sslverify' => true));
    if (is_wp_error($response)) { status_header(502); exit('Could not fetch private file.'); }
    $data = json_decode((string) wp_remote_retrieve_body($response), true);
    if ((int) wp_remote_retrieve_response_code($response) < 200 || (int) wp_remote_retrieve_response_code($response) >= 300 || !is_array($data) || empty($data['success']) || empty($data['fileData'])) { status_header(404); exit('Private file not found.'); }
    $mime = sanitize_mime_type($data['mimeType'] ?? 'application/octet-stream');
    $name = sanitize_file_name($data['name'] ?? 'private-file');
    $binary = base64_decode((string) $data['fileData'], true);
    if ($binary === false) { status_header(500); exit('Private file could not be decoded.'); }
    nocache_headers();
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . strlen($binary));
    header('Content-Disposition: inline; filename="' . $name . '"');
    echo $binary;
    exit;
}
}

add_action('template_redirect', 'curated_vault_maybe_proxy_drive_file', 0);

if (!function_exists('curated_vault_clear_google_app_session')) {
function curated_vault_clear_google_app_session() { $name = curated_vault_google_session_cookie_name(); $token = isset($_COOKIE[$name]) ? sanitize_text_field(wp_unslash($_COOKIE[$name])) : ''; if ($token) { delete_transient(curated_vault_google_session_key($token)); } setcookie($name, '', array('expires' => time() - HOUR_IN_SECONDS, 'path' => '/', 'domain' => defined('COOKIE_DOMAIN') ? COOKIE_DOMAIN : '', 'secure' => is_ssl(), 'httponly' => true, 'samesite' => 'Lax')); unset($_COOKIE[$name]); }
}

if (!function_exists('curated_vault_get_current_user_payload')) {
function curated_vault_get_current_user_payload($size = 96) {
    $app_session = curated_vault_get_google_app_session();
    if ($app_session) { return $app_session; }
    if (!is_user_logged_in()) { return null; }
    $current_user = wp_get_current_user();
    return array(
        'id' => (int) $current_user->ID,
        'name' => $current_user->display_name,
        'email' => $current_user->user_email,
        'avatar_url' => curated_vault_get_user_avatar_url($current_user->ID, $size),
        'username' => $current_user->user_login,
        'gender' => (string) get_user_meta($current_user->ID, 'cv_gender', true),
        'role' => (string) get_user_meta($current_user->ID, 'cv_role', true),
        'location' => (string) get_user_meta($current_user->ID, 'cv_location', true),
        'industry' => (string) get_user_meta($current_user->ID, 'cv_industry', true),
        'church' => (string) get_user_meta($current_user->ID, 'cv_church', true),
        'ministry' => (string) get_user_meta($current_user->ID, 'cv_ministry', true),
        'bio' => (string) get_user_meta($current_user->ID, 'description', true),
        'joined' => !empty($current_user->user_registered) ? mysql2date('j-M-Y', $current_user->user_registered) : '',
        'verification' => curated_vault_get_user_verification_payload($current_user),
        'followers_count' => (int) curated_vault_social_counts($current_user->ID)['followers'],
        'following_count' => (int) curated_vault_social_counts($current_user->ID)['following'],
        'followers' => curated_vault_social_list($current_user->ID, 'followers', 50),
        'following' => curated_vault_social_list($current_user->ID, 'following', 50),
        'settings' => wp_parse_args(is_array(get_user_meta($current_user->ID, 'cv_account_settings', true)) ? get_user_meta($current_user->ID, 'cv_account_settings', true) : array(), array('theme' => 'light', 'lang' => 'English', 'notifications' => true)),
    );
}
}


if (!class_exists('Curated_Vault')) { require_once CURATED_VAULT_PLUGIN_DIR . 'includes/class-curated-vault.php'; }
if (!class_exists('CV_Database')) { require_once CURATED_VAULT_PLUGIN_DIR . 'includes/class-cv-database.php'; }
if (!class_exists('CV_API')) { require_once CURATED_VAULT_PLUGIN_DIR . 'includes/class-cv-api.php'; }
if (!class_exists('CV_Social_DB')) { require_once CURATED_VAULT_PLUGIN_DIR . 'includes/social/class-cv-social-db.php'; }
if (!class_exists('CV_Social_REST')) { require_once CURATED_VAULT_PLUGIN_DIR . 'includes/social/class-cv-social-rest.php'; }
if (!class_exists('CV_Social_Shortcodes')) { require_once CURATED_VAULT_PLUGIN_DIR . 'includes/social/class-cv-social-shortcodes.php'; }


if (!function_exists('curated_vault_get_settings')) {
function curated_vault_get_settings() {
    $defaults = array(
        'auth_mode' => 'google',
        // Google OAuth must be configured per website origin in Google Cloud.
        // Do not ship a shared client ID because it causes origin_mismatch on other domains.
        'google_client_id' => '',
        'google_allowed_domain' => '',
        'magic_link_enabled' => 1,
        'magic_link_subject' => 'Your sign-in link for Faith In',
        // Firebase Authentication is optional and must be configured for each site.
        // Do not bundle a shared project configuration in a public plugin package.
        'firebase_api_key' => '',
        'firebase_auth_domain' => '',
        'firebase_project_id' => '',
        'firebase_storage_bucket' => '',
        'firebase_messaging_sender_id' => '',
        'firebase_app_id' => '',
        'firebase_measurement_id' => '',
    );
    $saved = get_option('curated_vault_settings', array());
    if (!is_array($saved)) {
        $saved = array();
    }
    $settings = wp_parse_args($saved, $defaults);
    // v5.5.207: never force a bundled Google OAuth Client ID.
    // Google blocks OAuth when the current website origin is not authorized for that client.
    // Keep custom client IDs, but clear old bundled/demo IDs so visitors see a setup notice instead of origin_mismatch.
    $bundled_google_client_ids = array(
        '983443597716-aus88dqg97fovkgl3f0v5kf7333576kg.apps.googleusercontent.com',
        '467180112232-lm63enmvpgbjoo07t09sjigv3vdtnq43.apps.googleusercontent.com',
    );
    if (in_array((string) ($settings['google_client_id'] ?? ''), $bundled_google_client_ids, true)) {
        $settings['google_client_id'] = '';
    }
    if (!isset($settings['google_allowed_domain'])) {
        $settings['google_allowed_domain'] = '';
    }
    // v5.5.87: migrate away from the old bundled Firebase Auth project.
    // Existing WordPress installs may have saved faith-in-50359 values in the database.
    // Replace only those old bundled values so the browser stops initializing the wrong project.
    $old_firebase_project = (
        ($settings['firebase_project_id'] ?? '') === 'faith-in-50359'
        || ($settings['firebase_auth_domain'] ?? '') === 'faith-in-50359.firebaseapp.com'
        || ($settings['firebase_app_id'] ?? '') === '1:270481288945:web:0610dd8af34971c507c350'
    );
    if ($old_firebase_project) {
        foreach (array('firebase_api_key','firebase_auth_domain','firebase_project_id','firebase_storage_bucket','firebase_messaging_sender_id','firebase_app_id','firebase_measurement_id') as $key) {
            $settings[$key] = $defaults[$key];
        }
    } else {
        foreach (array('firebase_api_key','firebase_auth_domain','firebase_project_id','firebase_storage_bucket','firebase_messaging_sender_id','firebase_app_id','firebase_measurement_id') as $key) {
            if (!isset($settings[$key])) { $settings[$key] = $defaults[$key]; }
            if (trim((string) $settings[$key]) === '') {
                $settings[$key] = $defaults[$key];
            }
        }
    }
    return $settings;
}
}


if (!function_exists('curated_vault_get_firebase_public_config')) {
function curated_vault_get_firebase_public_config($settings = null) {
    $settings = is_array($settings) ? $settings : curated_vault_get_settings();
    $config = array();
    $map = array(
        'apiKey' => 'firebase_api_key',
        'authDomain' => 'firebase_auth_domain',
        'projectId' => 'firebase_project_id',
        'storageBucket' => 'firebase_storage_bucket',
        'messagingSenderId' => 'firebase_messaging_sender_id',
        'appId' => 'firebase_app_id',
        'measurementId' => 'firebase_measurement_id',
    );
    foreach ($map as $public_key => $setting_key) {
        $value = isset($settings[$setting_key]) ? trim((string) $settings[$setting_key]) : '';
        if ($value !== '') { $config[$public_key] = $value; }
    }
    return $config;
}
}



if (!function_exists('curated_vault_get_effective_auth_mode')) {
function curated_vault_get_effective_auth_mode() {
    $settings = curated_vault_get_settings();
    $mode = $settings['auth_mode'] ?? 'open';
    if ($mode === 'open') { return 'open'; }
    return 'google';
}
}


if (!function_exists('curated_vault_register_settings')) {
function curated_vault_register_settings() {
    register_setting('curated_vault_settings_group', 'curated_vault_settings', 'curated_vault_sanitize_settings');
    if (class_exists('CV_Bible_Service')) {
        register_setting('curated_vault_settings_group', 'cv_bible_settings', array('CV_Bible_Service', 'sanitize_settings'));
    }
}
}


if (!function_exists('curated_vault_sanitize_settings')) {
function curated_vault_sanitize_settings($input) {
    $out = curated_vault_get_settings();
    $out['auth_mode'] = in_array(($input['auth_mode'] ?? 'google'), array('open', 'google'), true) ? $input['auth_mode'] : 'google';
    $out['google_client_id'] = sanitize_text_field($input['google_client_id'] ?? '');
    $out['google_allowed_domain'] = sanitize_text_field($input['google_allowed_domain'] ?? '');
    $out['magic_link_enabled'] = !empty($input['magic_link_enabled']) ? 1 : 0;
    $out['magic_link_subject'] = sanitize_text_field($input['magic_link_subject'] ?? 'Your sign-in link for Faith In');
    foreach (array('firebase_api_key','firebase_auth_domain','firebase_project_id','firebase_storage_bucket','firebase_messaging_sender_id','firebase_app_id','firebase_measurement_id') as $key) {
        $out[$key] = sanitize_text_field($input[$key] ?? '');
    }
    return $out;
}
}


if (!function_exists('curated_vault_add_admin_menu')) {
function curated_vault_add_admin_menu() {
    add_options_page('Faith In', 'Faith In', 'manage_options', 'curated-vault-settings', 'curated_vault_render_settings_page');
}
}


if (!function_exists('curated_vault_render_settings_page')) {
function curated_vault_render_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    $settings = curated_vault_get_settings();
    $site_origin = esc_url(home_url());
    $auth_handler = '';
    if (!empty($settings['firebase_auth_domain'])) {
        $auth_handler = 'https://' . sanitize_text_field($settings['firebase_auth_domain']) . '/__/auth/handler';
    }
    ?>
    <div class="wrap">
        <h1>Faith In Settings</h1>
        <form method="post" action="options.php">
            <?php settings_fields('curated_vault_settings_group'); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="cv_auth_mode">Publishing access mode</label></th>
                    <td>
                        <select id="cv_auth_mode" name="curated_vault_settings[auth_mode]">
                            <option value="open" <?php selected($settings['auth_mode'], 'open'); ?>>Open publishing</option>
                            <option value="google" <?php selected($settings['auth_mode'], 'google'); ?>>Sign-in required: Email/Password + Google</option>
                        </select>
                        <p class="description">Sign-in required mode shows the plugin login/signup card. Email/password signup uses Firebase Auth and saves the user to Firestore at users/{uid}; Google sign-in also starts a Faith In app session without creating WordPress.com users.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="cv_google_client_id">Google Client ID</label></th>
                    <td>
                        <input id="cv_google_client_id" name="curated_vault_settings[google_client_id]" type="text" class="regular-text" value="<?php echo esc_attr($settings['google_client_id']); ?>" />
                        <p class="description"><strong>Required for Google login.</strong> Create a Web application OAuth Client ID in Google Cloud, then add this exact Authorized JavaScript origin: <code><?php echo esc_html($site_origin); ?></code></p>
                        <?php if (!empty($auth_handler)) : ?>
                            <p class="description">If you also use Firebase Google sign-in, add this Authorized redirect URI in the same Google OAuth client: <code><?php echo esc_html($auth_handler); ?></code></p>
                        <?php endif; ?>
                        <p class="description">Leave this empty to hide Google login and use email/password login only. This prevents Google's <code>origin_mismatch</code> screen on unconfigured domains.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="cv_google_allowed_domain">Allowed Google Workspace domain</label></th>
                    <td>
                        <input id="cv_google_allowed_domain" name="curated_vault_settings[google_allowed_domain]" type="text" class="regular-text" value="<?php echo esc_attr($settings['google_allowed_domain']); ?>" placeholder="example.org" />
                        <p class="description">Optional. Leave blank to allow all verified Google accounts to sign up and sign in.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row" colspan="2"><h2 style="margin:18px 0 0;">Firebase Authentication <span style="font-size:13px;font-weight:600;color:#64748b;">for signup, login, and Firestore users</span></h2></th>
                </tr>
                <tr>
                    <th scope="row">Current Firebase project</th>
                    <td>
                        <p><strong><?php echo esc_html($settings['firebase_project_id'] ?: 'not configured'); ?></strong></p>
                        <p class="description">Firebase is now used by the plugin for email/password signup, login, password reset, and Firestore user profiles. Firebase Storage is configured separately in <strong>Settings &gt; Faith In Media Storage</strong>.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="cv_firebase_api_key">Firebase API Key</label></th>
                    <td><input id="cv_firebase_api_key" name="curated_vault_settings[firebase_api_key]" type="text" class="regular-text" value="<?php echo esc_attr($settings['firebase_api_key']); ?>" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="cv_firebase_auth_domain">Firebase Auth Domain</label></th>
                    <td><input id="cv_firebase_auth_domain" name="curated_vault_settings[firebase_auth_domain]" type="text" class="regular-text" value="<?php echo esc_attr($settings['firebase_auth_domain']); ?>" placeholder="your-project.firebaseapp.com" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="cv_firebase_project_id">Firebase Project ID</label></th>
                    <td><input id="cv_firebase_project_id" name="curated_vault_settings[firebase_project_id]" type="text" class="regular-text" value="<?php echo esc_attr($settings['firebase_project_id']); ?>" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="cv_firebase_app_id">Firebase App ID</label></th>
                    <td><input id="cv_firebase_app_id" name="curated_vault_settings[firebase_app_id]" type="text" class="regular-text" value="<?php echo esc_attr($settings['firebase_app_id']); ?>" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="cv_firebase_messaging_sender_id">Messaging Sender ID</label></th>
                    <td><input id="cv_firebase_messaging_sender_id" name="curated_vault_settings[firebase_messaging_sender_id]" type="text" class="regular-text" value="<?php echo esc_attr($settings['firebase_messaging_sender_id']); ?>" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="cv_firebase_storage_bucket">Storage Bucket</label></th>
                    <td><input id="cv_firebase_storage_bucket" name="curated_vault_settings[firebase_storage_bucket]" type="text" class="regular-text" value="<?php echo esc_attr($settings['firebase_storage_bucket']); ?>" placeholder="your-project.appspot.com" /></td>
                </tr>
                <tr>
                    <th scope="row"><label for="cv_firebase_measurement_id">Measurement ID</label></th>
                    <td><input id="cv_firebase_measurement_id" name="curated_vault_settings[firebase_measurement_id]" type="text" class="regular-text" value="<?php echo esc_attr($settings['firebase_measurement_id']); ?>" />
                    <p class="description">Only needed if you want the email/password login form to use Firebase Auth. Copy these values from Firebase Console &gt; Project settings &gt; Your apps &gt; Web app, then enable Email/Password in Firebase Authentication &gt; Sign-in method.</p>
                    <p class="description"><strong>For your project:</strong> Auth domain should be <code>faith-app-98a5f.firebaseapp.com</code>, project ID should be <code>faith-app-98a5f</code>, and storage bucket should be <code>faith-app-98a5f.firebasestorage.app</code>.</p></td>
                </tr>
            </table>
            <h2>Bible Backend</h2>
            <?php $bible_settings = class_exists('CV_Bible_Service') ? CV_Bible_Service::settings() : array(); ?>
            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="cv_api_bible_key">API.Bible key</label></th>
                    <td>
                        <input id="cv_api_bible_key" name="cv_bible_settings[api_bible_key]" type="password" class="regular-text" value="<?php echo esc_attr($bible_settings['api_bible_key'] ?? ''); ?>" autocomplete="off" />
                        <p class="description">Recommended main provider for Bible Reader, Parallel Bible, and Concordance. Keep this key secret in WordPress settings.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="cv_api_bible_default_id">Default API.Bible Bible ID</label></th>
                    <td>
                        <input id="cv_api_bible_default_id" name="cv_bible_settings[api_bible_default_id]" type="text" class="regular-text" value="<?php echo esc_attr($bible_settings['api_bible_default_id'] ?? ''); ?>" placeholder="Example: de4e12af7f28f599-02" />
                        <p class="description">Used when a selected version does not have a mapped Bible ID below. If empty, the plugin falls back to public-domain KJV/WEB where possible.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Version Bible IDs</th>
                    <td>
                        <?php foreach (array('KJV','WEB','ESV','NIV') as $cv_version): ?>
                            <p><label style="display:inline-block;width:48px;"><strong><?php echo esc_html($cv_version); ?></strong></label>
                            <input name="cv_bible_settings[api_bible_version_map][<?php echo esc_attr($cv_version); ?>]" type="text" class="regular-text" value="<?php echo esc_attr($bible_settings['api_bible_version_map'][$cv_version] ?? ''); ?>" placeholder="API.Bible ID for <?php echo esc_attr($cv_version); ?>" /></p>
                        <?php endforeach; ?>
                        <p class="description">Only add Bible versions you are licensed/approved to use.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="cv_youversion_app_key">YouVersion App Key</label></th>
                    <td>
                        <input id="cv_youversion_app_key" name="cv_bible_settings[youversion_app_key]" type="password" class="regular-text" value="<?php echo esc_attr($bible_settings['youversion_app_key'] ?? ''); ?>" autocomplete="off" />
                        <p class="description">Used only on the WordPress server for the Khmer Bible Reader and Daily Bible Verse. The key is sent as <code>X-YVP-App-Key</code> and is never exposed in React/JavaScript. You may also define <code>CV_YOUVERSION_APP_KEY</code> in <code>wp-config.php</code>.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="cv_youversion_default_bible_id">Default YouVersion Bible ID</label></th>
                    <td>
                        <input id="cv_youversion_default_bible_id" name="cv_bible_settings[youversion_default_bible_id]" type="text" class="regular-text" value="<?php echo esc_attr($bible_settings['youversion_default_bible_id'] ?? '1270'); ?>" placeholder="1270" />
                        <p class="description">Default is <code>1270</code> for Khmer Old Version 1954. Example endpoint: <code><?php echo esc_html(rest_url('faithin/v1/bible/passage?bible_id=1270&passage=JHN.3.16')); ?></code></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="cv_bible_brain_key">Bible Brain key</label></th>
                    <td>
                        <input id="cv_bible_brain_key" name="cv_bible_settings[bible_brain_key]" type="password" class="regular-text" value="<?php echo esc_attr($bible_settings['bible_brain_key'] ?? ''); ?>" autocomplete="off" />
                        <p class="description">Optional provider for audio/media Bible content.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="cv_bible_cache_minutes">Bible cache minutes</label></th>
                    <td><input id="cv_bible_cache_minutes" name="cv_bible_settings[cache_minutes]" type="number" min="5" max="10080" value="<?php echo esc_attr($bible_settings['cache_minutes'] ?? 1440); ?>" /></td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
        <hr />
        <p><strong>Firebase auth mode:</strong> Visitors can sign in with Google or Email/Password through Firebase. The backend verifies Firebase ID tokens and starts a private Faith In app session without creating WordPress.com users.</p>
    </div>
    <?php
}
}


if (!function_exists('curated_vault_magic_link_key')) {
function curated_vault_magic_link_key($token) {
    return 'cv_magic_login_' . hash_hmac('sha256', (string) $token, wp_salt('auth'));
}
}


if (!function_exists('curated_vault_create_or_get_user_for_email')) {
function curated_vault_create_or_get_user_for_email($email, $display_name = '') {
    $email = sanitize_email($email);
    if (!$email) { return new WP_Error('cv_bad_email', 'Invalid email address.'); }
    $user = get_user_by('email', $email);
    if ($user && !is_wp_error($user)) { return (int) $user->ID; }
    $base_login = sanitize_user(current(explode('@', $email)), true);
    if (!$base_login) { $base_login = 'faithinuser'; }
    $login = $base_login;
    $i = 1;
    while (username_exists($login)) {
        $login = $base_login . $i;
        $i++;
    }
    $name = sanitize_text_field($display_name ?: current(explode('@', $email)));
    return wp_insert_user(array(
        'user_login' => $login,
        'user_pass' => wp_generate_password(32, true, true),
        'user_email' => $email,
        'display_name' => $name,
        'nickname' => $name,
        'role' => 'subscriber',
    ));
}
}


if (!function_exists('curated_vault_sign_in_email_user')) {
function curated_vault_sign_in_email_user($email, $display_name = '', $provider = 'email') {
    $email = sanitize_email($email);
    if (!$email) { return new WP_Error('cv_bad_email', 'Invalid email address.'); }

    // App-session only: magic-link sign-in must not create or log in a
    // WordPress user, otherwise WordPress.com shows visitors in the invite list.
    if (function_exists('curated_vault_set_google_app_session')) {
        $profile = curated_vault_set_google_app_session(array(
            'name' => $display_name ?: current(explode('@', $email)),
            'email' => $email,
            'avatar_url' => '',
            'provider' => sanitize_text_field($provider),
        ));
        if (is_array($profile)) { $profile['wp_user_id'] = 0; $profile['wordpress_user_created'] = false; return $profile; }
    }
    return new WP_Error('cv_app_session_unavailable', 'Faith In app sessions are unavailable. Please update the plugin files.');
}
}


if (!function_exists('curated_vault_handle_magic_link_login')) {
function curated_vault_handle_magic_link_login() {
    if (empty($_GET['cv_magic_login']) || empty($_GET['cv_token'])) { return; }
    $token = sanitize_text_field(wp_unslash($_GET['cv_token']));
    $payload = get_transient(curated_vault_magic_link_key($token));
    if (!is_array($payload) || empty($payload['email'])) {
        wp_die('This sign-in link is invalid or has expired. Please request a new magic link.', 'Faith In sign-in', array('response' => 403));
    }
    delete_transient(curated_vault_magic_link_key($token));
    $profile = curated_vault_sign_in_email_user($payload['email'], $payload['name'] ?? '', 'email');
    if (is_wp_error($profile)) {
        wp_die(esc_html($profile->get_error_message()), 'Faith In sign-in', array('response' => 403));
    }
    wp_safe_redirect(remove_query_arg(array('cv_magic_login', 'cv_token'), home_url('/')));
    exit;
}
}


if (!function_exists('curated_vault_init')) {
function curated_vault_init() {
    $plugin = new Curated_Vault();
    $plugin->run();
    if (class_exists('CV_Social_REST')) {
        new CV_Social_REST();
    }
    if (class_exists('CV_Social_Shortcodes')) {
        new CV_Social_Shortcodes();
    }
}
}

add_action('plugins_loaded', 'curated_vault_init');

if (!function_exists('curated_vault_maybe_upgrade')) {
function curated_vault_maybe_upgrade() {
    $installed_version = get_option('curated_vault_version', '0');
    if (version_compare($installed_version, CURATED_VAULT_VERSION, '<')) {
        CV_Database::create_tables();
        if (class_exists('CV_Social_DB')) {
            CV_Social_DB::create_tables();
        }
        curated_vault_make_app_front_page();
        update_option('curated_vault_version', CURATED_VAULT_VERSION);
    }
}
}

add_action('plugins_loaded', 'curated_vault_maybe_upgrade', 20);


// v5.5.151: WordPress.com may keep the previous version active while checking the uploaded ZIP.
// Use unique activation callbacks and deactivate older versioned plugin folders after activation.
if (!function_exists('faithin_v55146_deactivate_old_versioned_plugins')) {
    function faithin_v55146_deactivate_old_versioned_plugins() {
        if (!function_exists('deactivate_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        $current = plugin_basename(__FILE__);
        $active = (array) get_option('active_plugins', array());
        $network_active = function_exists('get_site_option') ? array_keys((array) get_site_option('active_sitewide_plugins', array())) : array();
        $plugins = array_unique(array_merge($active, $network_active));
        foreach ($plugins as $plugin_file) {
            if ($plugin_file === $current) {
                continue;
            }
            if (preg_match('~^faith-in-login-ui-firestore-v5\.5\.[^/]+/curated-vault\.php$~', (string) $plugin_file)) {
                deactivate_plugins($plugin_file, true, false);
            }
        }
    }
}

if (!function_exists('faithin_v55146_activate')) {
    function faithin_v55146_activate() {
        faithin_v55146_deactivate_old_versioned_plugins();
        if (class_exists('CV_Database')) {
            CV_Database::create_tables();
        }
        if (class_exists('CV_Social_DB')) {
            CV_Social_DB::create_tables();
        }
        update_option('curated_vault_version', CURATED_VAULT_VERSION);
        if (function_exists('curated_vault_make_app_front_page')) {
            curated_vault_make_app_front_page();
        }
        flush_rewrite_rules();
    }
}

if (!function_exists('faithin_v55146_deactivate')) {
    function faithin_v55146_deactivate() {
        flush_rewrite_rules();
    }
}

register_activation_hook(__FILE__, 'faithin_v55146_activate');
if (!function_exists('curated_vault_activate')) {
function curated_vault_activate() {
    CV_Database::create_tables();
    if (class_exists('CV_Social_DB')) {
        CV_Social_DB::create_tables();
    }
    update_option('curated_vault_version', CURATED_VAULT_VERSION);
    curated_vault_make_app_front_page();
    flush_rewrite_rules();
}
}


register_deactivation_hook(__FILE__, 'faithin_v55146_deactivate');
if (!function_exists('curated_vault_deactivate')) {
function curated_vault_deactivate() {
    flush_rewrite_rules();
}
}


if (!function_exists('curated_vault_is_platform_page')) {
function curated_vault_is_platform_page() {
    // v5.5.138: the public root domain should be the Faith In app/login page.
    if (!is_admin() && (is_front_page() || is_home())) {
        return true;
    }

    global $post;
    if (is_a($post, 'WP_Post')) {
        $content = (string) $post->post_content;
        if (has_shortcode($content, 'curated_vault') || has_shortcode($content, 'curated_vault_social')) {
            return true;
        }
    }

    return is_page('curated-vault') || is_page('faith-in');
}
}


if (!function_exists('curated_vault_platform_body_class')) {
function curated_vault_platform_body_class($classes) {
    if (curated_vault_is_platform_page()) {
        $classes[] = 'cv-faith-in-platform';
    }
    return $classes;
}
}

add_filter('body_class', 'curated_vault_platform_body_class');

if (!function_exists('curated_vault_front_page_app_content')) {
function curated_vault_front_page_app_content($content) {
    if (is_admin() || !is_main_query() || !in_the_loop()) {
        return $content;
    }
    if (is_front_page() || is_home()) {
        return do_shortcode('[curated_vault]');
    }
    return $content;
}
}

add_filter('the_content', 'curated_vault_front_page_app_content', 1);

if (!function_exists('curated_vault_hide_theme_navigation_css')) {
function curated_vault_hide_theme_navigation_css() {
    // v5.5.94: output safe standalone CSS globally; it only activates when the Faith In app is present/body class is added.
    ?>
    <style id="curated-vault-hide-theme-navigation">
        /* v5.5.137 - Hide the WordPress/theme top header shown as "faithin.co / About / Faith In / Learn more" on all device sizes. */
        body > header,
        body #masthead,
        body .site-header,
        body .wp-site-blocks > header,
        body .wp-site-blocks > .wp-block-template-part:first-child:has(.wp-block-site-title),
        body .wp-site-blocks > .wp-block-template-part:first-child:has(.wp-block-navigation),
        body .wp-block-template-part:has(.wp-block-site-title),
        body .wp-block-template-part:has(.wp-block-navigation),
        body .wp-block-group:has(.wp-block-site-title):has(.wp-block-navigation),
        body .wp-block-group:has(a[href*="about"]):has(a[href*="learn"]),
        body .wp-block-group:has(a[href*="faith-in"]):has(a[href*="learn"]) {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            min-height: 0 !important;
            max-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            overflow: hidden !important;
        }

        /* v5.5.151 - Remove the WordPress admin-bar top offset/blank strip so the Faith In header sits flush at the top. */
        html.cv-faith-in-app-page,
        html:has(body .curated-vault-premium-wrap),
        html:has(body #cv-root),
        html:has(body #cv-social-mvp) {
            margin-top: 0 !important;
            padding-top: 0 !important;
        }

        body.cv-faith-in-platform,
        body:has(.curated-vault-premium-wrap),
        body:has(#cv-root),
        body:has(#cv-social-mvp) {
            margin-top: 0 !important;
            padding-top: 0 !important;
        }

        body.cv-faith-in-platform #wpadminbar,
        body:has(.curated-vault-premium-wrap) #wpadminbar,
        body:has(#cv-root) #wpadminbar,
        body:has(#cv-social-mvp) #wpadminbar {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            min-height: 0 !important;
            max-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
        }

        body.cv-faith-in-platform .glass-nav.cv-fixed-clean-nav,
        body.cv-faith-in-platform #cv-root .glass-nav.cv-fixed-clean-nav,
        body.cv-faith-in-platform #cv-social-mvp .glass-nav.cv-fixed-clean-nav,
        body:has(.curated-vault-premium-wrap) .glass-nav.cv-fixed-clean-nav,
        body:has(#cv-root) #cv-root .glass-nav.cv-fixed-clean-nav,
        body:has(#cv-social-mvp) #cv-social-mvp .glass-nav.cv-fixed-clean-nav {
            top: 0 !important;
        }



        /* v5.5.151 - compact header spacing fallback. */
        html,
        html.cv-faith-in-app-page,
        html:has(body .curated-vault-premium-wrap),
        html:has(body #cv-root),
        html:has(body #cv-social-mvp),
        body.cv-faith-in-platform,
        body:has(.curated-vault-premium-wrap),
        body:has(#cv-root),
        body:has(#cv-social-mvp) {
            margin-top: 0 !important;
            padding-top: 0 !important;
        }
        #wpadminbar {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            min-height: 0 !important;
            max-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
        }
        .glass-nav.cv-fixed-clean-nav,
        .cv-fixed-clean-nav,
        body.cv-faith-in-platform .glass-nav.cv-fixed-clean-nav,
        body.cv-faith-in-platform #cv-root .glass-nav.cv-fixed-clean-nav,
        body.cv-faith-in-platform #cv-social-mvp .glass-nav.cv-fixed-clean-nav,
        body:has(.curated-vault-premium-wrap) .glass-nav.cv-fixed-clean-nav,
        body:has(#cv-root) #cv-root .glass-nav.cv-fixed-clean-nav,
        body:has(#cv-social-mvp) #cv-social-mvp .glass-nav.cv-fixed-clean-nav {
            top: 0 !important;
            margin-top: 0 !important;
            padding-top: 0 !important;
            min-height: 58px !important;
            height: 58px !important;
            max-height: 58px !important;
        }
        .curated-vault-premium-wrap,
        #cv-root,
        #cv-social-mvp {
            padding-top: 58px !important;
        }

        /* v5.5.93 - Make the Faith In login/app page standalone by removing theme header/footer chrome. */
        body.cv-faith-in-platform {
            margin: 0 !important;
            padding: 0 !important;
        }

        body.cv-faith-in-platform > header,
        body.cv-faith-in-platform > footer,
        body.cv-faith-in-platform #masthead,
        body.cv-faith-in-platform #colophon,
        body.cv-faith-in-platform .site-header,
        body.cv-faith-in-platform .site-footer,
        body.cv-faith-in-platform .entry-header,
        body.cv-faith-in-platform .page-header,
        body.cv-faith-in-platform .entry-title,
        body.cv-faith-in-platform .page-title,
        body.cv-faith-in-platform .wp-site-blocks > header,
        body.cv-faith-in-platform .wp-site-blocks > footer,
        body.cv-faith-in-platform .wp-site-blocks > .wp-block-template-part,
        body.cv-faith-in-platform .wp-block-template-part,
        body.cv-faith-in-platform .main-navigation,
        body.cv-faith-in-platform .primary-navigation,
        body.cv-faith-in-platform .secondary-navigation,
        body.cv-faith-in-platform .wp-block-navigation,
        body.cv-faith-in-platform .wp-block-site-logo,
        body.cv-faith-in-platform .wp-block-site-title,
        body.cv-faith-in-platform .site-branding,
        body.cv-faith-in-platform .custom-logo-link,
        body.cv-faith-in-platform .menu-toggle {
            display: none !important;
        }

        body.cv-faith-in-platform .wp-block-group:has(.wp-block-site-logo),
        body.cv-faith-in-platform .wp-block-group:has(.wp-block-site-title),
        body.cv-faith-in-platform .wp-block-group:has(.wp-block-navigation) {
            display: none !important;
        }

        body.cv-faith-in-platform .wp-site-blocks,
        body.cv-faith-in-platform .site,
        body.cv-faith-in-platform .site-content,
        body.cv-faith-in-platform .content-area,
        body.cv-faith-in-platform main,
        body.cv-faith-in-platform article,
        body.cv-faith-in-platform .entry-content,
        body.cv-faith-in-platform .wp-block-post-content {
            margin: 0 !important;
            padding: 0 !important;
            max-width: none !important;
        }

        body.cv-faith-in-platform .wp-site-blocks > *,
        body.cv-faith-in-platform .entry-content > *,
        body.cv-faith-in-platform .wp-block-post-content > *,
        body.cv-faith-in-platform .is-layout-constrained > * {
            max-width: none !important;
        }

        body.cv-faith-in-platform .curated-vault-premium-wrap,
        body.cv-faith-in-platform #cv-social-mvp {
            margin: 0 !important;
            padding: 0 !important;
            max-width: none !important;
        }

    /* v5.5.151 - zero top-space nav hard fallback. */
    html.cv-faith-in-app-page,
    html:has(body .curated-vault-premium-wrap),
    html:has(body #cv-root),
    html:has(body #cv-social-mvp),
    body.cv-faith-in-platform,
    body:has(.curated-vault-premium-wrap),
    body:has(#cv-root),
    body:has(#cv-social-mvp) {
        margin: 0 !important;
        margin-top: 0 !important;
        padding: 0 !important;
        padding-top: 0 !important;
        top: 0 !important;
        width: 100% !important;
        max-width: none !important;
        overflow-x: hidden !important;
    }
    #wpadminbar,
    html.cv-faith-in-app-page #wpadminbar,
    body.cv-faith-in-platform #wpadminbar,
    body:has(.curated-vault-premium-wrap) #wpadminbar,
    body:has(#cv-root) #wpadminbar,
    body:has(#cv-social-mvp) #wpadminbar {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        overflow: hidden !important;
    }
    .glass-nav.cv-fixed-clean-nav,
    .cv-fixed-clean-nav,
    .cv-react-global-nav,
    #cv-root .glass-nav.cv-fixed-clean-nav,
    #cv-social-mvp .glass-nav.cv-fixed-clean-nav,
    .curated-vault-premium-wrap .glass-nav.cv-fixed-clean-nav {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: auto !important;
        width: 100% !important;
        max-width: 100vw !important;
        margin: 0 !important;
        margin-top: 0 !important;
        padding: 0 !important;
        padding-top: 0 !important;
        min-height: 58px !important;
        height: 58px !important;
        max-height: 58px !important;
        transform: none !important;
        z-index: 999999 !important;
        overflow: visible !important;
    }
    .curated-vault-premium-wrap,
    #cv-root,
    #cv-social-mvp {
        margin-top: 0 !important;
        padding-top: 58px !important;
    }
    .glass-nav.cv-fixed-clean-nav .cv-nav-shell,
    .cv-fixed-clean-nav .cv-nav-shell,
    #cv-root .cv-react-nav-shell,
    #cv-social-mvp .cv-nav-shell,
    .curated-vault-premium-wrap .cv-nav-shell {
        height: 58px !important;
        min-height: 58px !important;
        max-height: 58px !important;
        margin-top: 0 !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        align-items: center !important;
    }
    .cv-faith-in-kill-space,
    .cv-theme-chrome-hidden,
    .cv-theme-top-spacer-hidden {
        display: none !important;
        visibility: hidden !important;
        height: 0 !important;
        min-height: 0 !important;
        max-height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        overflow: hidden !important;
    }

    </style>
    <?php
}
}

add_action('wp_head', 'curated_vault_hide_theme_navigation_css', 1);

if (!function_exists('curated_vault_hide_theme_navigation_js')) {
function curated_vault_hide_theme_navigation_js() {
    // v5.5.94: output safe cleanup JS globally; it only changes pages containing the Faith In app.
    ?>
    <script id="curated-vault-hide-theme-navigation-js">
        (function () {
            function cvHidePublicSiteHeaderChrome() {
                if (!document.body) { return; }

                function hasFaithInApp(element) {
                    return !!(element && element.querySelector && element.querySelector('.curated-vault-premium-wrap, #cv-root, #cv-social-mvp, .cv-react-global-nav'));
                }

                function hideChromeElement(element) {
                    if (!element || element.id === 'wpadminbar' || hasFaithInApp(element)) { return; }
                    element.classList.add('cv-theme-chrome-hidden');
                    element.setAttribute('aria-hidden', 'true');
                    element.style.setProperty('display', 'none', 'important');
                    element.style.setProperty('visibility', 'hidden', 'important');
                    element.style.setProperty('height', '0', 'important');
                    element.style.setProperty('min-height', '0', 'important');
                    element.style.setProperty('max-height', '0', 'important');
                    element.style.setProperty('margin', '0', 'important');
                    element.style.setProperty('padding', '0', 'important');
                    element.style.setProperty('border', '0', 'important');
                    element.style.setProperty('overflow', 'hidden', 'important');
                }

                function chooseHeaderTarget(element) {
                    if (!element || hasFaithInApp(element)) { return null; }
                    var target = element.closest('header, #masthead, .site-header, .wp-block-template-part');
                    if (target && !hasFaithInApp(target)) { return target; }
                    target = element.closest('.wp-block-group, .wp-block-columns, .wp-block-column, .wp-block-navigation, .site-branding');
                    while (target && target.parentElement && target.parentElement !== document.body && !hasFaithInApp(target.parentElement)) {
                        var parent = target.parentElement;
                        var isTopShell = parent.classList && (parent.classList.contains('wp-site-blocks') || parent.classList.contains('site') || parent.classList.contains('site-content') || parent.classList.contains('entry-content'));
                        if (isTopShell) { break; }
                        var parentText = (parent.innerText || '').replace(/\s+/g, ' ').trim();
                        if (/faithin\.co/i.test(parentText) || (/\bAbout\b/i.test(parentText) && /Learn more/i.test(parentText))) {
                            target = parent;
                            continue;
                        }
                        break;
                    }
                    return target;
                }

                document.querySelectorAll('body > header, #masthead, .site-header, .wp-site-blocks > header').forEach(function (element) {
                    hideChromeElement(element);
                });

                document.querySelectorAll('.wp-block-site-title, .wp-block-site-logo, .wp-block-navigation, .site-title, .site-branding, .custom-logo-link').forEach(function (element) {
                    hideChromeElement(chooseHeaderTarget(element) || element);
                });

                document.querySelectorAll('body *').forEach(function (element) {
                    if (hasFaithInApp(element) || element.id === 'wpadminbar') { return; }
                    var text = (element.innerText || '').replace(/\s+/g, ' ').trim();
                    if (!text) { return; }
                    if (/faithin\.co/i.test(text) && (/\bAbout\b/i.test(text) || /Learn more/i.test(text) || /Faith In/i.test(text))) {
                        hideChromeElement(chooseHeaderTarget(element) || element);
                    }
                    if (/\bAbout\b/i.test(text) && /Faith In/i.test(text) && /Learn more/i.test(text)) {
                        hideChromeElement(chooseHeaderTarget(element) || element);
                    }
                });
            }

            function cvMountFaithInAppAtBodyTop() {
                var wrap = document.querySelector('.curated-vault-premium-wrap');
                if (!wrap || !document.body) { return; }
                document.documentElement.classList.add('cv-faith-in-app-page');
                document.body.classList.add('cv-faith-in-platform');
                document.documentElement.style.setProperty('margin', '0', 'important');
                document.documentElement.style.setProperty('padding', '0', 'important');
                document.body.style.setProperty('margin', '0', 'important');
                document.body.style.setProperty('padding', '0', 'important');
                if (wrap.parentElement !== document.body || document.body.firstElementChild !== wrap) {
                    document.body.insertBefore(wrap, document.body.firstChild || null);
                }
                wrap.classList.add('cv-body-mounted-app');
                wrap.style.setProperty('margin', '0', 'important');
                wrap.style.setProperty('padding', '0', 'important');
                wrap.style.setProperty('padding-top', '58px', 'important');
                wrap.style.setProperty('width', '100%', 'important');
                wrap.style.setProperty('max-width', 'none', 'important');
                document.querySelectorAll('[data-cv-global-nav="1"], #cv-react-global-nav, .cv-react-global-nav, .glass-nav.cv-fixed-clean-nav, .cv-fixed-clean-nav').forEach(function(nav){
                    nav.style.setProperty('position','fixed','important');
                    nav.style.setProperty('top','0','important');
                    nav.style.setProperty('left','0','important');
                    nav.style.setProperty('right','0','important');
                    nav.style.setProperty('width','100%','important');
                    nav.style.setProperty('height','58px','important');
                    nav.style.setProperty('min-height','58px','important');
                    nav.style.setProperty('max-height','58px','important');
                    nav.style.setProperty('margin','0','important');
                    nav.style.setProperty('padding','0','important');
                    nav.style.setProperty('z-index','2147483000','important');
                });
            }

            function hideThemeChrome() {
                cvMountFaithInAppAtBodyTop();

                // FIX (v5.5.192): removed accidental self-call `cvForceHeaderToViewportTop();`
                // on the next line, which would infinite-loop the call stack if this nested
                // function were ever invoked. Body is preserved intact.
                function cvForceHeaderToViewportTop() {
                    var app = document.querySelector('.curated-vault-premium-wrap, #cv-root, #cv-social-mvp');
                    if (!app || !document.body) { return; }
                    document.documentElement.classList.add('cv-faith-in-app-page');
                    document.body.classList.add('cv-faith-in-platform');
                    document.documentElement.style.setProperty('margin-top', '0', 'important');
                    document.documentElement.style.setProperty('padding-top', '0', 'important');
                    document.body.style.setProperty('margin', '0', 'important');
                    document.body.style.setProperty('margin-top', '0', 'important');
                    document.body.style.setProperty('padding', '0', 'important');
                    document.body.style.setProperty('padding-top', '0', 'important');

                    document.querySelectorAll('#wpadminbar').forEach(function (bar) {
                        bar.classList.add('cv-theme-top-spacer-hidden');
                        bar.setAttribute('aria-hidden', 'true');
                        bar.style.setProperty('display', 'none', 'important');
                        bar.style.setProperty('visibility', 'hidden', 'important');
                        bar.style.setProperty('height', '0', 'important');
                        bar.style.setProperty('min-height', '0', 'important');
                        bar.style.setProperty('max-height', '0', 'important');
                        bar.style.setProperty('margin', '0', 'important');
                        bar.style.setProperty('padding', '0', 'important');
                        bar.style.setProperty('border', '0', 'important');
                        bar.style.setProperty('overflow', 'hidden', 'important');
                    });

                    document.querySelectorAll('.glass-nav.cv-fixed-clean-nav, .cv-fixed-clean-nav, .cv-react-global-nav').forEach(function (nav) {
                        nav.style.setProperty('position', 'fixed', 'important');
                        nav.style.setProperty('top', '0', 'important');
                        nav.style.setProperty('left', '0', 'important');
                        nav.style.setProperty('right', '0', 'important');
                        nav.style.setProperty('bottom', 'auto', 'important');
                        nav.style.setProperty('width', '100%', 'important');
                        nav.style.setProperty('max-width', '100vw', 'important');
                        nav.style.setProperty('margin', '0', 'important');
                        nav.style.setProperty('margin-top', '0', 'important');
                        nav.style.setProperty('padding', '0', 'important');
                        nav.style.setProperty('padding-top', '0', 'important');
                        nav.style.setProperty('min-height', '58px', 'important');
                        nav.style.setProperty('height', '58px', 'important');
                        nav.style.setProperty('max-height', '58px', 'important');
                        nav.style.setProperty('transform', 'none', 'important');
                        nav.style.setProperty('z-index', '999999', 'important');
                    });

                    document.querySelectorAll('.curated-vault-premium-wrap, #cv-root, #cv-social-mvp').forEach(function (node) {
                        node.style.setProperty('margin-top', '0', 'important');
                        node.style.setProperty('padding-top', '58px', 'important');
                    });

                    var node = app;
                    while (node && node !== document.body && node !== document.documentElement) {
                        var parent = node.parentElement;
                        if (parent) {
                            parent.style.setProperty('margin-top', '0', 'important');
                            parent.style.setProperty('padding-top', '0', 'important');
                            parent.style.setProperty('border-top', '0', 'important');
                            Array.prototype.slice.call(parent.children).forEach(function (sibling) {
                                if (sibling === node || sibling.contains(app) || sibling.tagName === 'SCRIPT' || sibling.tagName === 'STYLE') { return; }
                                var isBefore = !!(sibling.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING);
                                if (isBefore) {
                                    sibling.classList.add('cv-theme-top-spacer-hidden');
                                    sibling.setAttribute('aria-hidden', 'true');
                                    sibling.style.setProperty('display', 'none', 'important');
                                    sibling.style.setProperty('visibility', 'hidden', 'important');
                                    sibling.style.setProperty('height', '0', 'important');
                                    sibling.style.setProperty('min-height', '0', 'important');
                                    sibling.style.setProperty('max-height', '0', 'important');
                                    sibling.style.setProperty('margin', '0', 'important');
                                    sibling.style.setProperty('padding', '0', 'important');
                                    sibling.style.setProperty('border', '0', 'important');
                                    sibling.style.setProperty('overflow', 'hidden', 'important');
                                }
                            });
                        }
                        node = parent;
                    }
                }
                cvHidePublicSiteHeaderChrome();
                var app = document.querySelector('.curated-vault-premium-wrap, #cv-root, #cv-social-mvp');
                if (!app || !document.body) { return; }
                document.body.classList.add('cv-faith-in-platform');
                document.documentElement.classList.add('cv-faith-in-app-page');
                document.documentElement.style.setProperty('margin-top', '0', 'important');
                document.documentElement.style.setProperty('padding-top', '0', 'important');
                document.body.style.setProperty('margin-top', '0', 'important');
                document.body.style.setProperty('padding-top', '0', 'important');
                
                var cvNavs = document.querySelectorAll('.glass-nav.cv-fixed-clean-nav, .cv-fixed-clean-nav');
                cvNavs.forEach(function (nav) {
                    nav.style.setProperty('top', '0', 'important');
                    nav.style.setProperty('margin-top', '0', 'important');
                    nav.style.setProperty('padding-top', '0', 'important');
                    nav.style.setProperty('min-height', '58px', 'important');
                    nav.style.setProperty('height', '58px', 'important');
                    nav.style.setProperty('max-height', '58px', 'important');
                });
                var cvApps = document.querySelectorAll('.curated-vault-premium-wrap, #cv-root, #cv-social-mvp');
                cvApps.forEach(function (app) {
                    app.style.setProperty('padding-top', '58px', 'important');
                });

                var cvAdminBar = document.getElementById('wpadminbar');
                if (cvAdminBar) {
                    cvAdminBar.setAttribute('aria-hidden', 'true');
                    cvAdminBar.style.setProperty('display', 'none', 'important');
                    cvAdminBar.style.setProperty('visibility', 'hidden', 'important');
                    cvAdminBar.style.setProperty('height', '0', 'important');
                    cvAdminBar.style.setProperty('min-height', '0', 'important');
                    cvAdminBar.style.setProperty('max-height', '0', 'important');
                    cvAdminBar.style.setProperty('margin', '0', 'important');
                    cvAdminBar.style.setProperty('padding', '0', 'important');
                    cvAdminBar.style.setProperty('overflow', 'hidden', 'important');
                }

                var selectors = [
                    'body > header',
                    'body > footer',
                    '#masthead',
                    '#colophon',
                    '.site-header',
                    '.site-footer',
                    '.entry-header',
                    '.page-header',
                    '.entry-title',
                    '.page-title',
                    '.wp-site-blocks > header',
                    '.wp-site-blocks > footer',
                    '.main-navigation',
                    '.primary-navigation',
                    '.secondary-navigation',
                    '.wp-block-navigation',
                    '.wp-block-site-logo',
                    '.wp-block-site-title',
                    '.site-branding',
                    '.custom-logo-link',
                    '.menu-toggle'
                ];

                selectors.forEach(function (selector) {
                    document.querySelectorAll(selector).forEach(function (element) {
                        if (!element.contains(app)) {
                            element.style.setProperty('display', 'none', 'important');
                        }
                    });
                });

                document.querySelectorAll('.wp-block-template-part').forEach(function (element) {
                    if (!element.contains(app)) {
                        element.style.setProperty('display', 'none', 'important');
                    }
                });
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', hideThemeChrome);
                document.addEventListener('DOMContentLoaded', cvHidePublicSiteHeaderChrome);
            } else {
                hideThemeChrome();
                cvHidePublicSiteHeaderChrome();
            }
            window.addEventListener('load', hideThemeChrome);
            window.addEventListener('load', cvMountFaithInAppAtBodyTop);
            window.addEventListener('load', cvHidePublicSiteHeaderChrome);
            setTimeout(cvHidePublicSiteHeaderChrome, 50);
            setTimeout(cvHidePublicSiteHeaderChrome, 300);
            setTimeout(cvHidePublicSiteHeaderChrome, 1000);
            setTimeout(hideThemeChrome, 50);
            setTimeout(cvMountFaithInAppAtBodyTop, 50);
            setTimeout(hideThemeChrome, 300);
            setTimeout(cvMountFaithInAppAtBodyTop, 300);
            setTimeout(hideThemeChrome, 1000);
            setTimeout(cvMountFaithInAppAtBodyTop, 1000);
        })();
    </script>
    <?php
}
}

add_action('wp_footer', 'curated_vault_hide_theme_navigation_js', 1000);



if (!function_exists('faithin_v55148_mobile_no_space_footer_js')) {
function faithin_v55148_mobile_no_space_footer_js() {
    ?>
    <script id="faithin-v55148-mobile-no-space-footer-js">
    (function () {
        function isMobile() {
            return !!(window.matchMedia && window.matchMedia('(max-width: 900px), (hover: none) and (pointer: coarse)').matches);
        }
        function fixMobileTopGap() {
            if (!isMobile() || !document.body) { return; }
            var html = document.documentElement;
            var body = document.body;
            html.classList.add('cv-faith-in-app-page', 'cv-mobile-no-top-gap');
            body.classList.add('cv-faith-in-platform', 'cv-mobile-no-top-gap');
            [html, body].forEach(function (node) {
                node.style.setProperty('margin', '0', 'important');
                node.style.setProperty('margin-top', '0', 'important');
                node.style.setProperty('padding', '0', 'important');
                node.style.setProperty('padding-top', '0', 'important');
                node.style.setProperty('top', '0', 'important');
                node.style.setProperty('overflow-x', 'hidden', 'important');
            });
            document.querySelectorAll('.curated-vault-premium-wrap, #cv-root, #cv-social-mvp').forEach(function (node) {
                node.style.setProperty('margin', '0', 'important');
                node.style.setProperty('margin-top', '0', 'important');
                node.style.setProperty('padding-top', '0', 'important');
                node.style.setProperty('top', '0', 'important');
                node.style.setProperty('transform', 'none', 'important');
                node.style.setProperty('width', '100%', 'important');
                node.style.setProperty('max-width', 'none', 'important');
            });
            document.querySelectorAll('#cv-react-global-nav, [data-cv-global-nav="1"], .cv-react-global-nav, .glass-nav.cv-fixed-clean-nav, .cv-fixed-clean-nav').forEach(function (nav) {
                nav.style.setProperty('position', 'sticky', 'important');
                nav.style.setProperty('top', '0', 'important');
                nav.style.setProperty('inset', '0 0 auto 0', 'important');
                nav.style.setProperty('left', '0', 'important');
                nav.style.setProperty('right', '0', 'important');
                nav.style.setProperty('width', '100%', 'important');
                nav.style.setProperty('max-width', '100vw', 'important');
                nav.style.setProperty('height', 'auto', 'important');
                nav.style.setProperty('min-height', '0', 'important');
                nav.style.setProperty('max-height', 'none', 'important');
                nav.style.setProperty('margin', '0', 'important');
                nav.style.setProperty('padding', '0', 'important');
                nav.style.setProperty('transform', 'none', 'important');
                nav.style.setProperty('background', '#ffffff', 'important');
                nav.style.setProperty('z-index', '2147483000', 'important');
                nav.style.setProperty('overflow', 'visible', 'important');
            });
            document.querySelectorAll('#cv-react-global-nav .cv-nav-shell, [data-cv-global-nav="1"] .cv-nav-shell, .cv-react-global-nav .cv-nav-shell, .cv-fixed-clean-nav .cv-nav-shell, #cv-root .cv-react-nav-shell').forEach(function (shell) {
                shell.style.setProperty('display', 'none', 'important');
                shell.style.setProperty('height', '0', 'important');
                shell.style.setProperty('min-height', '0', 'important');
                shell.style.setProperty('max-height', '0', 'important');
                shell.style.setProperty('padding', '0', 'important');
                shell.style.setProperty('margin', '0', 'important');
                shell.style.setProperty('overflow', 'hidden', 'important');
            });
            document.querySelectorAll('.cv-react-mobile-top, .cv-nav-mobile-wrap').forEach(function (node) {
                node.style.setProperty('display', 'block', 'important');
                node.style.setProperty('margin', '0', 'important');
                node.style.setProperty('padding', '0', 'important');
                node.style.setProperty('border-top', '0', 'important');
                node.style.setProperty('background', '#ffffff', 'important');
            });
            document.querySelectorAll('.cv-nav-mobile-row, .cv-top-icon-nav-mobile').forEach(function (row) {
                row.style.setProperty('min-height', '64px', 'important');
                row.style.setProperty('padding', '0 14px', 'important');
                row.style.setProperty('margin', '0', 'important');
                row.style.setProperty('align-items', 'center', 'important');
            });
            document.querySelectorAll('#cv-root > main, .curated-vault-premium-wrap > main, #cv-root .cv-react-feed-page, #cv-root .cv-feed-page-linkedin').forEach(function (main) {
                main.style.setProperty('margin-top', '0', 'important');
                main.style.setProperty('padding-top', '0', 'important');
            });
        }
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fixMobileTopGap);
        else fixMobileTopGap();
        window.addEventListener('load', fixMobileTopGap);
        window.addEventListener('resize', fixMobileTopGap);
        window.addEventListener('orientationchange', fixMobileTopGap);
        [0, 30, 100, 250, 600, 1200, 2500].forEach(function (delay) { setTimeout(fixMobileTopGap, delay); });
        if (window.MutationObserver) {
            var mobileTopGapScheduled = false;
            function scheduleFixMobileTopGap() {
                if (mobileTopGapScheduled) { return; }
                mobileTopGapScheduled = true;
                (window.requestAnimationFrame || window.setTimeout)(function () {
                    mobileTopGapScheduled = false;
                    fixMobileTopGap();
                }, 16);
            }
            var observer = new MutationObserver(scheduleFixMobileTopGap);
            if (document.body) observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
        }
    })();
    </script>
    <?php
}
}
add_action('wp_footer', 'faithin_v55148_mobile_no_space_footer_js', 1001);

if (!function_exists('curated_vault_enqueue_scripts')) {
function curated_vault_enqueue_scripts() {
    if (!curated_vault_is_platform_page()) return;

    wp_enqueue_script('curated-vault-tailwind', 'https://cdn.tailwindcss.com', array(), null, false);
    wp_add_inline_script('curated-vault-tailwind', "tailwind.config={darkMode:'class',theme:{extend:{fontFamily:{sans:['Inter','sans-serif'],serif:['Merriweather','serif']},colors:{brand:{vault:'#1FA88A',dark:'#15202B',bgStart:'#EAF8F4',bgEnd:'#F5FCF9'}},animation:{'fade-in':'fadeIn 0.3s ease-out forwards','slide-up':'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards','slide-in-bottom':'slideInBottom 0.3s ease-out forwards'},keyframes:{fadeIn:{'0%':{opacity:'0'},'100%':{opacity:'1'}},slideUp:{'0%':{transform:'translateY(20px)',opacity:'0'},'100%':{transform:'translateY(0)',opacity:'1'}},slideInBottom:{'0%':{transform:'translateY(100%)'},'100%':{transform:'translateY(0)'}}}}}};", 'before');
    wp_enqueue_style('curated-vault-fonts', 'https://fonts.googleapis.com/css2?family=Koh+Santepheap:wght@400;700;900&family=Poppins:wght@800&display=swap', array(), null);
    wp_enqueue_style('curated-vault-custom', CURATED_VAULT_PLUGIN_URL . 'assets/css/style.css', array('curated-vault-fonts'), CURATED_VAULT_VERSION);
    wp_enqueue_script('curated-vault-lucide', 'https://unpkg.com/lucide@latest/dist/umd/lucide.js', array(), null, true);
    $settings = curated_vault_get_settings();
    $main_deps = array('jquery', 'curated-vault-tailwind');
    if (!empty($settings['google_client_id'])) {
        wp_enqueue_script('google-identity-services', 'https://accounts.google.com/gsi/client', array(), null, true);
        $main_deps[] = 'google-identity-services';
    }
    wp_enqueue_script('curated-vault-main', CURATED_VAULT_PLUGIN_URL . 'assets/js/main.js', $main_deps, CURATED_VAULT_VERSION, true);
    $current_user = wp_get_current_user();
    wp_localize_script('curated-vault-main', 'cv_ajax', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('cv_nonce'),
        'rest_root' => esc_url_raw(rest_url('curated-vault/v1')),
        'rest_faithin_root' => esc_url_raw(rest_url('faithin/v1')),
        'rest_nonce' => wp_create_nonce('wp_rest'),
        'plugin_url' => CURATED_VAULT_PLUGIN_URL,
        'auth' => array(
            'mode' => curated_vault_get_effective_auth_mode(),
            'google_client_id' => $settings['google_client_id'],
            'allowed_domain' => $settings['google_allowed_domain'],
            'magic_link_enabled' => !empty($settings['magic_link_enabled']),
            'firebase_config' => curated_vault_get_firebase_public_config($settings),
            'site_domain' => wp_parse_url(home_url(), PHP_URL_HOST),
            'site_origin' => home_url(),
            'register_url' => wp_registration_url(),
            'is_logged_in' => (curated_vault_is_app_logged_in() || is_user_logged_in()),
            'current_user' => curated_vault_get_current_user_payload(96),
            'verification_status' => function_exists('curated_vault_get_current_verification_status_payload') ? curated_vault_get_current_verification_status_payload() : null,
        ),
    ));
}
}


if (!function_exists('curated_vault_shortcode')) {
function curated_vault_shortcode() {
    ob_start();
    include CURATED_VAULT_PLUGIN_DIR . 'templates/main-template.php';
    return ob_get_clean();
}
}


if (!function_exists('curated_vault_create_page')) {
function curated_vault_create_page() {
    $page = get_page_by_path('faith-in');
    if (!$page) {
        $page = get_page_by_title('Faith In');
    }

    if ($page instanceof WP_Post) {
        $needs_update = false;
        $updates = array('ID' => $page->ID);
        $content = (string) $page->post_content;
        if (!has_shortcode($content, 'curated_vault') && !has_shortcode($content, 'curated_vault_social')) {
            $updates['post_content'] = '[curated_vault]';
            $needs_update = true;
        }
        if ($page->post_status !== 'publish') {
            $updates['post_status'] = 'publish';
            $needs_update = true;
        }
        if ($needs_update) {
            wp_update_post($updates, true, false);
        }
        return (int) $page->ID;
    }

    $page_id = wp_insert_post(array(
        'post_title'   => 'Faith In',
        'post_name'    => 'faith-in',
        'post_content' => '[curated_vault]',
        'post_status'  => 'publish',
        'post_type'    => 'page',
    ), true, false);

    return is_wp_error($page_id) ? 0 : (int) $page_id;
}
}


if (!function_exists('curated_vault_make_app_front_page')) {
function curated_vault_make_app_front_page() {
    // v5.5.138: make https://faithin.co/ open the Faith In login/app page.
    $page_id = curated_vault_create_page();
    if ($page_id > 0) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', $page_id);
    }
}
}


if (!function_exists('cv_render_nav')) {
function cv_render_nav() {
    return '<div>Navigation will be rendered by JavaScript</div>';
}
}
