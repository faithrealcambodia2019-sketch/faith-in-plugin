# Security

## Data handling

- User data belongs in Firebase, not GitHub.
- Private credentials belong in Vercel environment variables or `.env.local`, never in tracked files.
- Variables beginning with `NEXT_PUBLIC_` are visible to browsers and must never contain secrets.
- Firebase web configuration is public by design. Security comes from Authentication, App Check, and Security Rules.

## Authorization

- A user can read and update only their own `users/{uid}` document.
- Profile creates and updates use field allowlists; unknown or privileged fields are denied.
- UID, email, status, and creation metadata cannot be changed by client updates.
- Uploads are restricted to the authenticated user's path, approved content types, and a 25 MB limit.
- Files are readable only by authenticated members.
- All unspecified Firestore and Storage access is denied.

## Browser protection

Production responses enable HSTS, MIME sniffing protection, clickjacking protection, restrictive referrer handling, and a limited browser Permissions Policy.

## Firebase App Check

Set `NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY` to a reCAPTCHA Enterprise site key registered for the Firebase web app. Deploy the client first, monitor App Check metrics, and only then enable enforcement for Authentication, Firestore, and Storage in Firebase Console.

## Reporting a vulnerability

Use the repository's GitHub Security tab to submit a private vulnerability report. Do not publish credentials or personal data in a public issue.
