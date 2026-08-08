# Google OAuth origin_mismatch fix

Version 5.5.207 stops the plugin from using a bundled shared Google OAuth Client ID. Google requires each website origin to be authorized in the Google Cloud OAuth client.

To enable Google login:

1. Go to Google Cloud Console > APIs & Services > Credentials.
2. Create or open an OAuth Client ID with application type Web application.
3. Add your WordPress website origin under Authorized JavaScript origins. Use only the origin, for example `https://faithin.co` or `https://www.faithin.co`; no path and no trailing slash.
4. Copy the OAuth Client ID into WordPress Admin > Settings > Faith In > Google Client ID.
5. In Firebase Console > Authentication > Settings > Authorized domains, add your website domain.
6. Clear site/cache/plugin cache and test again.

Email/password login continues to work even if Google Client ID is empty.
