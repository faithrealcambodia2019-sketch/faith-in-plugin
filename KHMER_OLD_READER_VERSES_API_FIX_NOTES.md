# Faith In v5.5.217 - Khmer Old Bible Reader YouVersion chapter fix

- Changed Khmer Old 1954 Bible Reader chapter loading to use YouVersion Platform chapter verses endpoint: `/v1/bibles/{id}/books/{book_usfm}/chapters/{chapter}/verses`.
- Kept Bible ID `1270` for Khmer Old Version 1954.
- Added fallback to YouVersion passage chapter and first-to-last verse range when a server returns metadata only.
- Added verse-count mapping so ranges like `1CO.1.1-1CO.1.31` can load correctly.
- Kept the YouVersion App Key server-side only.
