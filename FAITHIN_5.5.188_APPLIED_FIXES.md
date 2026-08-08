# Faith In v5.5.188 Applied Fixes

Applied production hardening and stability improvements:

- Protected public API responses from exposing user email addresses to other users.
- Added Library loading, error, and retry states.
- Generated Library category buttons from real resources instead of only hardcoded categories.
- Added default pagination limits for posts, resources, jobs, and prayers to prevent heavy full-table loads.
- Changed Google Drive upload transport to POST JSON so the shared secret is not sent in the URL.
- Hardened Firebase Storage rules with signed-in UID paths, file size limits, and MIME-type restrictions.
- Added database indexes for common feed/library/job/prayer queries.
- Added direct-access protection to include/template PHP files.
- Added uninstall.php with safe default behavior and optional full-data deletion.
- Added WordPress readme.txt and improved plugin header metadata.
- Removed internal patch helper scripts from the production package.

Notes:

- I did not rewrite the full CSS architecture because that is a larger refactor and could risk breaking the current UI. The next best step is to split and minify CSS/JS module by module.
- Firebase Storage uploads should use the path `faith-in-uploads/{uid}/...` to match the hardened rules.
- Redeploy the included Google Apps Script after updating it, because uploads now expect POST.
