# FaithIn v5.5.185 - System-Matched Smooth UI

Applied the post action UI to the existing WordPress social system without replacing the backend.

## Changes
- Kept the REST/WordPress backend as the source of truth.
- Changed the post action row to Amen, Comment, and Share.
- Centered each action across the row on desktop and mobile.
- Added native share/copy-link behavior for Share without breaking the feed.
- Made Amen update in place without re-rendering the whole feed.
- Made comments open/close smoothly and update counts after replies.
- Fixed double escaping in comment text returned by the REST API.
- Added safer selector escaping for post notification scrolling.

## Validation
- PHP syntax checked.
- JavaScript syntax checked.
- Existing message and notification endpoints remain connected.
- Notification polling now refreshes only badges, so it will not wipe a user’s post/comment draft while they are typing.
- Messenger background refresh now avoids re-rendering while the user is typing a message.
