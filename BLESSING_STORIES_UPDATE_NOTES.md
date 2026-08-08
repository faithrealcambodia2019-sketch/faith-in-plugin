# Blessing Stories update - v5.5.193

Implemented the Add Blessing experience inside the top story-style carousel.

## Changed

- Recent Blessing posts now appear as story cards in the carousel.
- Blessing cards show the real user avatar/name and display either the uploaded photo or a text preview.
- Clicking a Blessing card opens a story viewer matched to the Faith In system.
- The viewer supports Amen, Comment/View in feed, Share, and close actions.
- The Add Blessing card now clearly shows text and photo support.
- Empty-state cards guide users to share testimony, add a photo, or encourage others.

## Validation

- `node --check assets/js/main.js` passed.
- `php -l` passed for all PHP files.
