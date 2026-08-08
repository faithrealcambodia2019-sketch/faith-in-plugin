# Faith In hardening notes - v5.5.177

This package removes bundled private secrets and adds safer defaults without changing the visible UI.

## Important setup after installing

1. Go to WordPress Admin > Settings > Faith In Media Storage.
2. Copy the displayed **Shared secret**.
3. Open `google-drive-apps-script.js`, replace `PASTE_SHARED_SECRET_FROM_WORDPRESS_SETTINGS` with that secret, then redeploy the Google Apps Script Web App.
4. If you use Gemini image generation, define `CV_GEMINI_API_KEY` in `wp-config.php` or save `cv_gemini_api_key` securely. The key is no longer bundled in the plugin.

## Security improvements added

- Removed the hard-coded Gemini API key from the plugin code.
- Replaced the shared Google Drive upload secret with a per-site generated secret.
- Added AJAX rate limiting for sign-in, magic links, posting, profile updates, uploads, comments, verification requests, prayers, and AI image generation.
- Required sign-in before using the Gemini AI image endpoint to protect paid API usage.
- Added a 25 MB default upload cap, filterable with `curated_vault_max_upload_bytes`.
- Strengthened upload file validation using WordPress filetype checks instead of trusting the browser MIME type.
- Added basic frontend security headers: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, and `Permissions-Policy`.
- Added blank `index.php` files to plugin directories to reduce directory-listing exposure.

## Notes

Google Drive uploads will fail until the Apps Script secret matches the WordPress shared secret shown in the settings page. This is intentional: the old package shipped the same secret to everyone, which is not safe for production.
