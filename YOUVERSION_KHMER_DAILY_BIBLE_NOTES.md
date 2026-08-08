# Faith In v5.5.209 — YouVersion Khmer Daily Bible Verse

This version adds a secure WordPress REST bridge for YouVersion Bible API passage requests.

## Endpoints

- `/wp-json/faithin/v1/bible/passage?bible_id=1270&passage=JHN.3.16`
- `/wp-json/faithin/v1/bible/daily?bible_id=1270`

## API key

Add the YouVersion App Key in **Settings > Faith In > Bible Backend**, or define it in `wp-config.php`:

```php
define('CV_YOUVERSION_APP_KEY', 'YOUR_APP_KEY');
```

The key stays on the WordPress server and is sent to YouVersion as `X-YVP-App-Key`. It is not exposed in React or `cv_ajax`.

## Default Bible ID

The default YouVersion Bible ID is `1270` for Khmer Bible text.
