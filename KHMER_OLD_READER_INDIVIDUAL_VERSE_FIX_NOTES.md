# Faith In v5.5.218 - Khmer Old Reader individual verse fallback

This version keeps the same Bible Reader UI and improves Khmer Old 1954 loading. If the YouVersion chapter verses endpoint or full chapter passage endpoint fails, the backend now loads each verse through the passage endpoint, for example `1CO.1.1`, `1CO.1.2`, and caches the completed chapter.
