# Khmer Old Version 1954 Bible Reader Update

- Added Khmer Old Version 1954 as the first Bible Reader version option.
- Set the Bible Reader default version to `KHMER_OLD_1954`.
- Connected Bible Reader chapter loading to the existing server-side YouVersion API proxy using Bible ID `1270`.
- Kept KJV, WEB, ESV, and NIV available as optional comparison/English versions.
- Added safe Khmer fallback messaging if the YouVersion request cannot load.
- Bumped plugin version to 5.5.216 to force browser cache refresh.
