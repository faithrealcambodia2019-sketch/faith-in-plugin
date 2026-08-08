# Add Blessing working update - v5.5.192

This build makes the home carousel/button label **Add Blessing** functional as a Faith In composer flow.

## Changed

- Add Blessing now opens a dedicated Blessing composer instead of a generic post/story action.
- Users can share text-only blessings.
- Users can add up to 10 photos to a blessing using the existing secure post media pipeline.
- The Share Blessing button now enables/disables correctly while typing text or waiting for media upload.
- Blessing posts are saved to the normal Faith In feed with the current signed-in user as author.
- Blessing posts display a small Blessing label in the feed to match the system.
- The top composer Photo button now opens the post photo picker instead of the Library upload flow.

## Validation

- `node --check assets/js/main.js` passed.
- `php -l` passed for all PHP files.
