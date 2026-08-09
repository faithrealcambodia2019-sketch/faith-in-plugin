# Deployment

## Application

The GitHub `main` branch deploys automatically to the Vercel project `faith-in`. Production uses `faithin.co`; `www.faithin.co` redirects permanently to the apex domain.

Before publishing:

1. Run `npm run lint`.
2. Run `npm run build`.
3. Review the staged diff for credentials and unrelated files.
4. Push to GitHub and verify the resulting Vercel deployment.

## Firebase rules

The Firebase project is declared in `.firebaserc`. After authenticating the Firebase CLI, deploy rules with:

```bash
firebase deploy --only firestore:rules,storage
```

Review changes in the Firebase Console and test with a non-administrator account before enabling App Check enforcement.
