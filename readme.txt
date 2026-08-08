=== Faith In ===
Contributors: faithin
Tags: faith, library, social, bible, prayer, resources
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 5.5.225
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Faith In provides a Christian community interface with Library resources, social feed, prayer wall, jobs, messages, and Bible tools.

== Description ==
Faith In is a WordPress plugin for a faith-based community app. This package includes security hardening for public profile privacy, upload handling, Library loading states, pagination, and uninstall safety.

== Installation ==
1. Upload the plugin folder to /wp-content/plugins/.
2. Activate Faith In in WordPress Admin > Plugins.
3. Configure Faith In Media Storage and authentication settings.
4. Add the [curated_vault] shortcode to the page where the app should appear.

== Privacy & Third-Party Services ==

This plugin can interact with several third-party services. Site owners are
responsible for disclosing this in their own privacy policy and obtaining any
consent required by local law (GDPR, CCPA, etc.).

* Firebase Authentication (Google) - When a user signs in with Google or
  Firebase, their Firebase ID token is sent to the WordPress server for
  verification against Google's public certificates. The user's email,
  display name, and avatar URL may be stored in WordPress options under the
  cv_app_profile_* prefix. No password is ever transmitted to or stored by
  this plugin.
* Google Drive (Apps Script) - When configured, user-uploaded media is
  forwarded to a customer-controlled Google Apps Script Web App for storage
  in the customer's own Google Drive. Only the file bytes, filename, MIME
  type, and a hashed authorId are sent. The destination URL is configured
  in WordPress Admin > Settings > Faith In Media Storage.
* Firebase Storage - Alternative storage backend; same data scope as above.
* Tailwind CDN and Lucide CDN - Front-end CSS/JS utility libraries are
  loaded from cdn.tailwindcss.com and unpkg.com on Faith In platform pages.
  These requests reveal the user's IP and User-Agent to those CDNs. Site
  owners wishing to avoid this should bundle Tailwind and Lucide locally
  (see "Performance Notes" below).

No user data is sent to Anthropic or to the Faith In project authors by this
plugin.

== Security Notes ==

* Keep your Google Drive shared secret private. It is stored as a WordPress
  option (curated_vault_google_drive_shared_secret) and rotated automatically
  on first use if missing.
* Use the included storage.rules and firestore.rules for Firebase Storage /
  Firestore if Firebase uploads are enabled.
* Public profile payloads do not expose user email addresses except to the
  profile owner or a WordPress administrator.
* Write AJAX actions (post, comment, like, prayer, job, profile update,
  upload, follow, message) require a valid cv_nonce. A session cookie alone
  is not sufficient.
* Uploads reject any filename containing dangerous tokens (.php, .phtml,
  .phar, .pl, .py, .cgi, .asp, .aspx, .jsp, .sh, .bash, .exe, .com, .bat,
  .cmd, .js, .mjs, .html, .htm, .svg, .svgz, .swf, .jar, .war, .hta) and any
  file whose detected MIME is application/octet-stream unless it is a HEIC
  image with the matching extension.
* To fully remove plugin data on uninstall (including social tables), define
  CURATED_VAULT_DELETE_ALL_DATA as true in wp-config.php before deactivating
  the plugin from the Plugins screen.

== Performance Notes ==

* Front-end assets (style.css, social-mvp.css, main.js) are only enqueued on
  Faith In platform pages.
* Polling for messages (30s) and notifications (20s) pauses while the
  browser tab is hidden.
* For best performance on production sites, replace the Tailwind CDN and
  Lucide CDN imports with locally bundled assets. The Tailwind CDN runtime
  compiler is intended for development. This is not done by default in this
  build to avoid breaking the existing visual design.

== Sample Data ==

By default, no sample posts, jobs, or resources are inserted on activation.
To restore the demo seed (useful for fresh staging sites), either:

* Set the WordPress option curated_vault_install_sample_data to 1 before
  first activation, or
* Define CURATED_VAULT_INSTALL_SAMPLE_DATA as true in wp-config.php.

== Changelog ==

= 5.5.225 =
* Removed the bundled Firebase project configuration. Configure Firebase per site in WordPress settings before enabling Firebase authentication.

= 5.5.224 =
* Removed the bundled YouVersion credential. Configure the key in WordPress settings or with `CV_YOUVERSION_APP_KEY` in the hosting environment.

= 5.5.222 =
* Added page-by-page All Functions menu hub.
* Added quick links for Home Feed, Create Post, Add Blessing, Prayer Wall, Bible Studio, Daily Verse, Library, Upload Resource, Network, Messages, Notifications, Jobs, Profile, and Settings.
* Added render-time performance polish for media lazy loading and hidden-tab media pause.
* Made the Edit/Delete owner action buttons smaller and more compact on desktop and mobile.
* Reduced button padding, icon size, gap, and top spacing while preserving the same edit/delete behavior.

= 5.5.219 =
* Applied professional pill-style Edit/Delete buttons with Lucide icons to post, prayer, library resource, and job owner actions.
* Preserved existing edit/delete functionality while improving hover, mobile, and dark-mode styles.

= 5.5.216 =
* Connected the existing YouVersion backend bridge to Khmer Bible ID 1270 using a server-side X-YVP-App-Key header.
* Preserved the Gutendex Library loading fix and current UI.

= 5.5.205 =
* UI: Blessing music player is hidden from feed cards. Music now appears only inside the Blessing story viewer.
* FEATURE: Blessing story music starts automatically when opened, with a tap-to-play fallback for browsers that block autoplay.
* FEATURE: Users can still choose from 10 built-in free 30-second Christian/worship-style instrumental tracks or upload their own permitted audio.

= 5.5.197 =
* UI: Blessing story viewer is smaller and forced to the true center of the screen on desktop and mobile.
* UI: Blessing text sizing adjusted for the smaller centered story viewer.


= 5.5.192 =
* FEATURE: Add Blessing now opens a dedicated Faith In Blessing composer.
* FEATURE: Blessings support text-only sharing and photo sharing through the existing secure post media pipeline.
* BUG: The composer publish button now enables correctly while typing text-only blessings/posts.
* UI: Blessing posts display a small Blessing label in the feed and the top Photo button opens the post photo picker.
* SECURITY: Write AJAX actions now require a valid cv_nonce; cookie-only
  session is no longer accepted as authentication for state-changing
  operations.
* SECURITY: Removed user_email from find_users search columns to prevent
  email enumeration.
* SECURITY: Added explicit denylist for dangerous file extensions in the
  upload pipeline. Tightened application/octet-stream handling.
* MODERATION: WordPress administrators and editors can now edit/delete any
  post, prayer, job, or resource for moderation purposes.
* BUG: Removed accidental infinite-recursion self-call in the
  cvForceHeaderToViewportTop() helper in curated-vault.php.
* DATA: Sample data is no longer inserted on production activation by
  default. Gated behind option curated_vault_install_sample_data or
  CURATED_VAULT_INSTALL_SAMPLE_DATA constant.
* DATA: uninstall.php now drops all eight social tables and clears
  cv_rl_* / cv_magic_* transient rows when CURATED_VAULT_DELETE_ALL_DATA is
  true.
* PERFORMANCE: Messages and notifications polling now pauses when the tab
  is hidden.

= 5.5.189 =
* Hardened public email privacy.
* Added Library loading, error, retry states, and dynamic categories.
* Added pagination limits to feed, resources, jobs, and prayers.
* Switched Google Drive upload requests from GET query secrets to POST JSON
  body.
* Hardened Firebase Storage rules.
* Added uninstall.php and production metadata.
* Added direct-access guards to include/template PHP files.


= 5.5.216 =
* Added YouVersion Khmer Daily Bible Verse REST endpoint at `/wp-json/faithin/v1/bible/passage`.
* Added `/wp-json/faithin/v1/bible/daily` for the right sidebar Verse of the Day.
* Default YouVersion Bible ID is now `1270` for Khmer Bible text.
* Kept the YouVersion App Key server-side in WordPress settings or `CV_YOUVERSION_APP_KEY`; React never receives the key.
* Added graceful local fallback if YouVersion is not configured or temporarily unavailable.

= 5.5.208 =
* Kept the OAuth-safe authentication system from the last version.
* Google login no longer uses a bundled shared OAuth Client ID, preventing origin_mismatch on unconfigured domains.
* Email/password Firebase Auth remains available when Google login is not configured.
* Preserved Blessing music, Blessing-only story feed behavior, Bible verse, and Contacts right-side rail UI.

= 5.5.207 =
* Prevents Google OAuth origin_mismatch by removing the bundled shared OAuth Client ID.
* Shows the exact site origin admins must add in Google Cloud.
* Keeps email/password login available when Google OAuth is not configured.

= 5.5.218 =
* Added individual verse fallback for Khmer Old 1954 Bible Reader so chapters can load through the proven YouVersion passage endpoint.

= 5.5.223 =
* Upgraded the All Functions page into a professional function hub.
* Added searchable function cards, professional workflow sections, recent tools, and improved mobile layout.
* Added direct routing for Bible Reader, Parallel Bible, Concordance, Scripture Design, Scripture Typing, Sermon Planner, Blessing, Prayer, Messages, Notifications, Library, Upload, Jobs, Profile, and Settings.
* Added stronger focus states, empty search state, and responsive performance-friendly CSS.
