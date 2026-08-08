# Gutendex API Connection Notes

This build keeps the existing Faith In Library UI and connects the Library search to Gutendex through the WordPress backend.

## What changed

- Replaced Open Library API search with Gutendex / Project Gutenberg book metadata.
- The same Library endpoint still returns local Faith In resources first.
- API books are appended after local resources and shaped like the existing Library cards.
- API books use `Open Book` and open the best available Project Gutenberg reading URL safely in a new tab.
- Bible Study and History filters map to Gutendex topic/search parameters.
- No Gutendex API key is required.

## Notes

Gutendex provides public-domain Project Gutenberg ebooks, not a 45 million metadata catalog. For a free readable ebook library, this is safer because the books are public domain and include read/download formats when available.
