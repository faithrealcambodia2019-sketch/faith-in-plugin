# Security

## Data handling

- User data belongs in Firebase, not GitHub.
- Private credentials belong in Vercel environment variables or `.env.local`, never in tracked files.
- Variables beginning with `NEXT_PUBLIC_` are visible to browsers and must never contain secrets.
- Firebase web configuration is public by design. Security comes from Authentication, App Check, and Security Rules.

## Authorization

- A user can read and update only their own `users/{uid}` document.
- Other signed-in members can read the email-free `publicProfiles/{uid}` projection used by the member directory.
- Profile creates and updates use field allowlists; unknown or privileged fields are denied.
- UID, email, status, and creation metadata cannot be changed by client updates.
- New uploads require a valid Firebase ID token, are stored under the verified UID, and are checked by file signature as well as declared type and a 25 MB limit.
- Vercel Blob uploads currently use public, unguessable URLs. Post visibility protects the Firestore record, not a Blob URL that has already been shared. Moving sensitive media to a private Blob store with an authenticated download proxy is recommended before treating uploads as confidential.
- Firebase Storage legacy paths remain readable only by authenticated members.
- All unspecified Firestore and Storage access is denied.

## Browser protection

Production responses enable HSTS, a Content Security Policy, MIME sniffing protection, clickjacking protection, restrictive referrer handling, origin isolation, and a limited browser Permissions Policy.

The legacy application still needs inline event handlers, so the current CSP
permits inline script on `/app`. Tailwind is compiled locally and no longer
requires a runtime CDN or `unsafe-eval`. Removing the remaining allowance
requires migrating the browser runtime into bundled React modules; treat that
as a planned hardening step rather than silently breaking the signed-in app.

## Firebase App Check

Set `NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY` to a reCAPTCHA Enterprise site key registered for the Firebase web app. Deploy the client first, monitor App Check metrics, and only then enable enforcement for Authentication, Firestore, and Storage in Firebase Console.

## Reporting a vulnerability

Use the repository's GitHub Security tab to submit a private vulnerability report. Do not publish credentials or personal data in a public issue.
