# Faith In v5.5.222 — Page-by-page Functions + Performance Notes

## What changed

This version adds a clean **All Functions** page that works as a page-by-page hub for the whole Faith In app. It keeps the feed clean while still giving users quick access to every major function.

## Pages/functions included

- Home Feed
- Create Post
- Add Blessing
- Prayer Wall
- Bible Studio
- Daily Bible Verse
- Library
- Upload Resource
- Network
- Messages
- Notifications
- Jobs
- Profile
- Settings

## Performance improvements

- Images inside the app are marked for lazy loading after render.
- Images use async decoding where supported.
- Videos preload only metadata instead of full media by default.
- Audio/video pauses when the browser tab is hidden.
- New function sections use CSS content-visibility for smoother mobile performance.

## Files changed

- `assets/js/main.js`
- `assets/css/style.css`
- `curated-vault.php`
- `readme.txt`
- `CHANGELOG.md`
