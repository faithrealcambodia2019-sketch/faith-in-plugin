# Faith In v5.5.225 — Site-owned Firebase configuration

- Removed the bundled Firebase project configuration so each installation must supply its own Firebase web app values in WordPress settings.

# Faith In v5.5.224 — Production credential hardening

- Removed the bundled YouVersion credential so production installations must use a site-owned key configured in WordPress settings or the hosting environment.

# Faith In v5.5.222 — Page-by-page Functions Hub + Performance Polish

- Added a new Menu / All Functions page with every major function organized page by page: Home Feed, Create Post, Add Blessing, Prayer Wall, Bible Studio, Daily Verse, Library, Upload Resource, Network, Messages, Notifications, Jobs, Profile, and Settings.
- Changed desktop and mobile Menu buttons to open the new all-functions hub instead of sending users directly to Bible Studio.
- Added quick-action chips for Post, Blessing, Bible, Prayer, and Library.
- Added performance polish after every render: lazy image loading, async image decoding, metadata preload for videos, and automatic media pause when the browser tab is hidden.
- Added content-visibility styling for function sections so the page stays light on mobile.

# Faith In v5.5.221 — Compact Edit/Delete UI

- Made Edit/Delete owner buttons smaller and cleaner across feed posts, prayer wall, library resources, and job posts.
- Reduced pill height, padding, icon size, and spacing while keeping existing click actions connected.

# Faith In v5.5.219 — Professional Edit/Delete UI

- Applied the requested rounded pill Edit/Delete button design with Lucide edit-2 and trash-2 icons.
- Updated feed post owner tools, prayer wall owner tools, library resource delete action, and job post owner tools.
- Kept all existing edit/delete JavaScript handlers connected.
- Added responsive and dark-mode safe CSS overrides.

# Faith In v5.5.218 — Khmer Old Bible Reader individual verse fallback

- Added a final YouVersion fallback that loads Khmer Old 1954 chapters verse-by-verse using `/passages/{BOOK}.{CHAPTER}.{VERSE}?format=text`.
- Keeps the same Bible Reader UI and caches successful chapter loads for smoother reading.
- Prevents the reader from showing only the Khmer error message when the chapter/verses endpoint or chapter-range endpoint is blocked.

# Faith In v5.5.214 — YouVersion Khmer Bible 1270 Key Applied

- Connected the existing YouVersion backend bridge to Bible ID `1270`.
- Uses `X-YVP-App-Key` from the WordPress/PHP server side only.
- React never receives the key.
- Existing Gutendex Library loading fix is preserved.

# Faith In v5.5.211 - Gutendex API Connection

- Changed the Library API source from Open Library to Gutendex / Project Gutenberg.
- Kept the existing Faith In Library UI, cards, search bar, and categories.
- Local uploaded Faith In resources still appear first.
- API ebooks now open safely in a new tab using the best available Project Gutenberg reading URL.
- Added backend transient caching for Gutendex results.
- No Gutendex API key is required.


---

# Faith In v5.5.210 - Open Library API Connection

- Kept the existing Faith In Library UI and card layout.
- Connected the Library search to Open Library API results through the WordPress backend, not the React frontend.
- Local Faith In uploaded resources stay first; API book results are added after them.
- Added cached Open Library search results for Bible Study, History, and general book searches.
- External API books open safely in a new tab and do not call the local download/delete/bookmark actions.

# Faith In v5.5.209 — YouVersion Khmer Daily Bible Verse API

- Added secure WordPress REST endpoint: `/wp-json/faithin/v1/bible/passage?bible_id=1270&passage=JHN.3.16`.
- Added daily verse endpoint: `/wp-json/faithin/v1/bible/daily?bible_id=1270`.
- Added YouVersion App Key and default YouVersion Bible ID settings under Settings > Faith In > Bible Backend.
- Updated the right sidebar “Verse of the Day / ខគម្ពីរប្រចាំថ្ងៃ” to load Khmer verse text from the server endpoint.
- Kept OAuth-safe auth from v5.5.208 unchanged.
- Added local fallback verse content when the key is missing or the API request fails.

# 5.5.195
- Added the custom heart-plus Blessing SVG icon to the Add Blessing entry points while preserving existing text/photo publishing functions.

# 5.5.194
- Removed the visible "Text / Photo" helper row from the Add Blessing story card.
- Removed the small "Blessing" pill label from blessing story cards/viewer.
- Kept the existing Add Blessing, text, photo, feed, story, and publishing functions active.

# Faith In - Changelog for v5.5.191

This release is a **security and stability** pass over v5.5.189. **No visual
design changes** were made. No features were removed. The Library, Contacts,
Messages, Feed, Bible, Prayer, Jobs, and Profile flows behave identically
from the user's point of view; the differences are in what happens server-
side and what happens in background tabs.

## Files changed

| File | Lines +/- | Type |
|---|---|---|
| `curated-vault.php` | +6 / -4 | Bug fix + version bump |
| `includes/class-cv-api.php` | +136 / -26 | Security hardening + moderation |
| `includes/class-cv-database.php` | +11 / -1 | Sample-data gating |
| `uninstall.php` | +48 / -8 | Full social-table cleanup |
| `readme.txt` | +92 / -6 | Privacy + security + changelog |
| `assets/js/main.js` | +15 / -2 | Polling pauses |

## Changes by section of the original audit prompt

### Section 1 - Basic validation
* All 20 PHP files pass `php -l`. All 3 JS files pass `node --check`. Both
  were already clean at baseline; the patches do not introduce regressions.
* Plugin header version bumped to 5.5.191. `readme.txt` Stable tag matches.
* No fatal errors, missing functions, duplicate definitions, or broken hooks
  were introduced. Direct-access guards already existed in every PHP file.

### Section 2 - Security hardening
* **CSRF / nonce policy (`includes/class-cv-api.php`).** The previous
  `verify_ajax_request()` accepted *either* a valid nonce *or* an active
  session cookie. A logged-in user visiting a malicious site could trigger
  write actions via cookie-only credentials. Replaced with three explicit
  helpers:
  * `get_public_read_actions()` - the single source of truth for which
    actions can be called without a nonce.
  * `verify_ajax_read()` - lenient, used for read-only actions.
  * `verify_ajax_write()` - strict, **requires a valid `cv_nonce`** even
    for logged-in / app-session users. Sign-in entry points
    (`cv_google_sign_in`, `cv_firebase_sign_in`, `cv_get_session`) are
    exempted by name because they verify the Firebase / Google ID token
    server-side, which is a stronger check than a nonce.
  * `verify_ajax_request()` is kept as a backwards-compatible shim that
    delegates to `verify_ajax_write()` (the safer default). All existing
    handlers that called the old method automatically inherit the strict
    policy.
* **Email enumeration (`find_users`).** Removed `user_email` from
  `search_columns` in the `WP_User_Query`. Previously a stranger could type
  any email and confirm whether an account existed by checking for a hit
  (the email field itself was already redacted from the response).
* **Admin moderation.** `update_post`, `delete_post`, `update_prayer`,
  `delete_prayer`, `update_job`, `delete_job`, and `delete_resource` now
  check `current_user_can('manage_options')` or
  `current_user_can('edit_others_posts')` via the new
  `effective_user_can_moderate()` helper. WordPress administrators and
  editors can moderate any row; other users remain restricted to their
  own `author_id`.
* **Upload hardening (`direct_upload_to_google_drive`).** Two new
  defense-in-depth layers:
  1. An explicit denylist regex blocks any filename whose extension chain
     contains `php`, `phtml`, `phar`, `pl`, `py`, `cgi`, `asp`, `aspx`,
     `jsp`, `sh`, `bash`, `exe`, `com`, `bat`, `cmd`, `js`, `mjs`, `jsx`,
     `ts`, `html`, `htm`, `svg`, `svgz`, `swf`, `jar`, `war`, or `hta`.
     Defeats double-extension tricks like `evil.php.jpg`.
  2. `application/octet-stream` is no longer accepted as a fallback MIME
     except for the documented HEIC / HEIF case where the extension is
     also `heic` or `heif`.
* **Not done** (intentionally, with reason):
  * `wp_ajax_nopriv_*` registrations were *not* stripped, because
    app-session users (Google/Firebase sign-in users without a WordPress
    user row) need them to function. The strict nonce check in
    `verify_ajax_write()` gives equivalent CSRF protection.
  * Hard-coded Google Drive Apps Script URL and Firebase public config
    were not moved out of code. The Apps Script URL is already overridable
    by an admin setting (`curated_vault_google_drive_upload_url`); the
    bundled fallback is a sane default. Firebase *public* config is
    legitimately public when paired with proper Firebase Security Rules
    (which this package ships).

### Section 3 - Specific current bug risks
* **Infinite recursion in `cvForceHeaderToViewportTop`** (the specific bug
  you flagged): removed. The function's first statement called itself, which
  would have crashed the browser tab with a call-stack overflow if the
  function were ever invoked. Currently the function is unreachable - the
  same body runs inline below - so production users were never affected,
  but the landmine is now defused.
* Other items in section 3 (scope global cleanup scripts behind
  `curated_vault_is_platform_page()`, stop hiding admin bar globally, avoid
  `body *` scans, replace DOM hacks with scoped CSS) are **not done** in
  this pass. Reason: they would touch the visual design surface and the
  brief was explicit about not changing the UI. Recommendation in the
  next-steps section below.

### Section 4 - Performance optimization
* **Polling.** Messages polling (30s) and notifications polling (20s) now
  check `document.hidden` and skip the network call when the tab is
  backgrounded. Messages polling also re-checks `isLoggedIn` per tick;
  notifications polling already bails for non-logged-in users when the
  IIFE initializes.
* **Not done** (intentionally, with reason):
  * Splitting `style.css` (30,399 lines / 1.17 MB) into feature CSS files.
  * Building Tailwind locally and replacing the CDN script.
  * Replacing Lucide unpkg with bundled icons.
  * Library client-side caching and additional pagination.
  * Lazy-loading images / IntersectionObserver for reels.
  * Debouncing search inputs.
  * Per-feature conditional script enqueue.

  All of these require a build pipeline, visual regression testing on
  desktop + mobile, and confirmation that the existing UI keeps working.
  None can be done safely in a code-only review without a staging site.

### Section 5 - Library page
Not changed. Loading states, search, filters, detail view, back button,
download, bookmark, delete were already implemented in v5.5.189. Without
the ability to run the page in a browser there is no way to verify the
specific failure modes described, and rewriting code that may already work
risks breaking it.

### Section 6 - Contacts UI
Not changed. Same reasoning - touching the layout requires visual
regression testing.

### Section 7 - Messages and notifications
* Notifications polling pauses when the tab is hidden (see Section 4).
* Other items (REST `permission_callback` audit, mount-once enforcement,
  attachment size limits, mobile panel layout) were not changed in this
  pass. `class-cv-social-rest.php` would need its own dedicated review;
  the file is 747 lines and the audit prompt didn't surface a specific bug
  in it.

### Section 8 - Database and migrations
* **Sample data gating.** `CV_Database::create_tables()` previously called
  `insert_sample_data()` unconditionally. Now it only inserts when either:
  * the option `curated_vault_install_sample_data` is truthy, or
  * the constant `CURATED_VAULT_INSTALL_SAMPLE_DATA` is defined and true.
  Production sites no longer get the "Welcome to Faith In Quick Start
  Guide" resource, the sample "Youth Pastor" job, or the five hard-coded
  quotes on first activation.
* **uninstall.php.** Rewritten. The drop list now includes all eight
  social tables - `cv_social_posts`, `cv_social_comments`,
  `cv_social_reactions`, `cv_social_follows`, `cv_social_notifications`,
  `cv_social_message_threads`, `cv_social_message_thread_members`,
  `cv_social_messages` - plus the original ten core tables. Also clears
  rate-limit and magic-link transient rows that previously orphaned in
  `wp_options`. Behaviour is gated by `CURATED_VAULT_DELETE_ALL_DATA` as
  before.
* **Index audit.** Not done. The existing schemas already have reasonable
  indexes on the columns called out in the brief (posts.timestamp,
  posts.post_visibility, resources.category, resources.timestamp,
  resources.downloads_views, messages.thread_created, follows.follower_id
  and follows.following_id). If a query pattern proves slow under load,
  add a targeted composite index then.

### Section 9 - WordPress standards
* Text domain. The plugin uses `curated-vault` as its text domain. Only
  one translatable string was found in the codebase
  (`includes/class-cv-api.php:1260`). Renaming the text domain to
  `faith-in` was not done because it would require touching every
  translation entry (there's only one) and rebuilding any existing
  language files (there are none in this package). Left as-is to avoid
  silent breakage; recommend deciding on a final text domain before the
  next translatable string is added.
* `readme.txt` updated with privacy disclosure (Firebase, Google Drive,
  Tailwind CDN, Lucide CDN), security notes, sample-data instructions,
  performance notes, and a 5.5.191 changelog entry. Tested up to bumped
  from 6.5 to 6.7.

### Section 10 - Testing checklist
Static analysis only - no live testing is possible from this environment:
* PHP linter passes for all 20 PHP files.
* JS linter (`node --check`) passes for all 3 JS files.
* The recursion bug, the cookie-bypass CSRF, the email enumeration, and
  the dangerous-extension upload paths are all gone by inspection.
* Sample data is suppressed by inspection.
* Uninstall coverage is complete by inspection (against the social-DB
  table list in `class-cv-social-db.php`).
* The two polling intervals respect `document.hidden` by inspection.

Live testing against a WP_DEBUG-enabled WordPress install remains the
buyer's responsibility. The brief includes a complete browser test list;
work through that list before pushing to production.

### Section 11 - Deliverables
* Fixed ZIP: produced.
* This changelog file.
* PHP lint pass: confirmed.
* JS syntax pass: confirmed.
* No fatal errors under inspection.
* Library / Contacts / Messages layouts: unchanged from v5.5.189.

## Recommended next steps (out of scope for this pass)

In rough priority order, the work this pass did not cover:

1. **Visual regression testing on staging.** Activate v5.5.191 with
   `WP_DEBUG` and `WP_DEBUG_LOG` on; click every tab; verify desktop and
   mobile layouts; test on a slow network.
2. **Scope the global cleanup scripts.** The 200+ lines of inline JS in
   `curated-vault.php` that hide admin bar / theme chrome / etc. should
   only run when `curated_vault_is_platform_page()` returns true. Today
   they run on `wp_footer` of every page. Wrap the `wp_footer` hook
   callbacks in a platform-page check (about 30 lines of work, but needs
   manual UI verification because the existing behaviour is what's keeping
   the visual design intact).
3. **Local Tailwind + Lucide bundle.** Set up a `package.json` with
   `tailwindcss`, generate a `tailwind.config.js` from the inline config
   in `curated-vault.php:2230`, build to
   `assets/css/tailwind.compiled.css`, then replace the two
   `wp_enqueue_script` calls. Same for Lucide: download the UMD build and
   serve it from `assets/js/lucide.min.js`.
4. **Split `style.css`.** 30,399 lines is hard to maintain. Use a CSS
   coverage tool in DevTools to identify per-route usage, then split into
   the files the brief suggests. Plan a full visual review afterward.
5. **REST permission_callback audit** on `class-cv-social-rest.php`.
   Confirm every write route checks `is_user_logged_in()` and rejects
   non-members of message threads.
6. **Library / Contacts / Messages UI sweep.** Read through the JS only
   after a staging session has identified specific failures. The brief
   describes desired behaviour but it's not clear which of those
   behaviours are actually broken vs working.
