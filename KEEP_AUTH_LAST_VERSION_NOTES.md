# Faith In v5.5.208 — Keep Auth From Last Version

This build keeps the authentication behavior from v5.5.207 OAuth Safe.

## Preserved authentication behavior
- Email/password Firebase Auth stays enabled.
- Google login is available only when the site owner adds their own Google OAuth Client ID in **Settings → Faith In**.
- The plugin does not force a bundled shared Google OAuth Client ID. This avoids Google `origin_mismatch` errors on domains that are not authorized for that client.
- The settings screen shows the exact Authorized JavaScript origin and Firebase Auth redirect URI to add in Google Cloud.

## Preserved app features
- Blessing music files and Blessing story autoplay behavior are kept.
- Blessing posts stay in Blessing stories instead of the normal feed.
- Bible verse and Contacts right-side UI from the latest version are kept.
