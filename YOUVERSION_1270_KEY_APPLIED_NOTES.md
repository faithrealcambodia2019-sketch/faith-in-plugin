# Faith In v5.5.214 — YouVersion Khmer Bible 1270 Key Applied

This build connects the existing Faith In Bible backend to YouVersion Khmer Bible ID `1270` using the server-side `X-YVP-App-Key` header.

Endpoints already available:

- `/wp-json/faithin/v1/bible/passage?bible_id=1270&passage=JHN.3.16`
- `/wp-json/faithin/v1/bible/daily?bible_id=1270`

Security notes:

- The key is used only in PHP on the WordPress server.
- The key is not localized to React/JavaScript.
- For production rotation, define `CV_YOUVERSION_APP_KEY` in `wp-config.php` or save a new key in Settings > Faith In > Bible Backend.
