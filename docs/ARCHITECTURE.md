# Architecture

Faith In is a standalone Next.js App Router application.

## System boundaries

- **Next.js** renders the application and owns HTTP routes, headers, and deployment configuration.
- **Firebase Authentication** establishes user identity in the browser.
- **Cloud Firestore** stores application records. Security Rules are the authorization boundary for browser access.
- **Cloud Storage** stores user-owned media under UID-scoped paths.
- **Vercel** builds and serves the application from the GitHub `main` branch.
- **GitHub** stores source code only. It must never contain production user data or private credentials.

## Repository structure

- `app/` — pages and route handlers
- `lib/` — typed application and Firebase configuration
- `public/assets/` — versioned UI assets used by the current visual runtime
- `firestore.rules` — Firestore authorization and validation policy
- `storage.rules` — Storage authorization and upload validation policy

The PHP/WordPress package and duplicate source assets were removed. The existing visual runtime is retained as a browser application so the established UI remains unchanged while individual features are migrated into typed React modules.
