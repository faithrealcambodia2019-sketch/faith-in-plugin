# FaithIn Notification System - v5.5.182

This build matches notifications to the professional messenger UI and fixes the notification count flow.

## Improved
- Notification panel now matches the LinkedIn/Telegram-style message UI.
- Notification badge count no longer double-counts unread messages.
- Notification types now correctly support reaction, comment, reply, follow, message, and new post.
- Added All, Unread, Messages, and Activity filters.
- Added single-notification read handling.
- Mark all read still works.
- Message notifications can open the related chat thread.
- Post/reaction/comment notifications try to scroll to the related post.
- Better empty states, unread dots, icons, mobile styling, and panel behavior.

## Files changed
- `includes/social/class-cv-social-rest.php`
- `assets/js/main.js`
- `assets/js/social-mvp.js`
- `assets/css/style.css`
- `assets/css/social-mvp.css`
- `curated-vault.php` version bump to 5.5.182
