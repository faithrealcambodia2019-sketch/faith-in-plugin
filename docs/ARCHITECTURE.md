# Architecture

Faith In is a standalone Next.js App Router application.

## System boundaries

- **Next.js** renders the application and owns HTTP routes, headers, and deployment configuration.
- **Firebase Authentication** establishes user identity in the browser.
- **Cloud Firestore** stores application records. Security Rules are the authorization boundary for browser access.
- **Vercel Blob** stores new uploads under UID-scoped paths after a server route verifies the caller's Firebase ID token and inspects the file signature.
- **Cloud Storage** remains configured for legacy files and as a backward-compatible storage path; its rules preserve existing UID-scoped objects.
- **Vercel** builds and serves the application from the GitHub `main` branch.
- **GitHub** stores source code only. It must never contain production user data or private credentials.

## Repository structure

- `app/` — pages and route handlers
- `lib/` — typed application and Firebase configuration
- `public/assets/` — versioned UI assets used by the current visual runtime
- `firestore.rules` — Firestore authorization and validation policy
- `firestore.indexes.json` — additive indexes used by privacy-safe feed queries
- `storage.rules` — Storage authorization and upload validation policy

Private account fields live in `users/{uid}`. The member directory reads the
email-free `publicProfiles/{uid}` projection. The projection is backfilled on a
member's next successful login; account documents and IDs are never moved.

The PHP/WordPress package and duplicate source assets were removed. The existing visual runtime is retained as a browser application so the established UI remains unchanged while individual features are migrated into typed React modules.
