# Faith In Web Application

Faith In is a standalone Christian community application built with Next.js, Firebase Authentication, Cloud Firestore, and Cloud Storage. It is deployed from GitHub to Vercel at [faithin.co](https://faithin.co).

This repository contains the web application only. It is not a WordPress plugin, and it contains no PHP runtime.

## Local development

1. Copy `.env.example` to `.env.local` and add the public Firebase web configuration.
2. Install dependencies with `npm install`.
3. Start the application with `npm run dev`.

Never commit service-account credentials, private keys, passwords, or user data. Firebase web configuration values are public identifiers; access is enforced by Authentication, App Check, and Security Rules.

## Commands

- `npm run dev` — local development
- `npm run build` — production build and type validation
- `npm run lint` — code quality checks
- `npm run typecheck` — standalone TypeScript validation
- `npm test` — Firebase compatibility backend tests
- `npm run test:rules` — local Firestore authorization tests (never production)

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Security](docs/SECURITY.md)
- [Deployment](docs/DEPLOYMENT.md)
