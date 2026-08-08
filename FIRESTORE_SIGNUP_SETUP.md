# Firestore signup setup for Faith In

This build connects the Faith In plugin signup form to Firebase Authentication and Firestore.

## What changed

- The plugin login card now has a real **Sign Up** mode.
- Email/password signup creates a Firebase Auth user.
- The new user is saved to Firestore at `users/{uid}`.
- Email/password sign-in updates `lastLoginAt` and keeps the Firestore user document in sync.
- Signup with Google uses the Firebase Auth Google popup so the Google user can also be saved to Firestore. Existing Google login mode still uses the current Google Identity Services flow.

## Required Firebase setup

1. In Firebase Console, open your project.
2. Go to **Authentication > Sign-in method**.
3. Enable **Email/Password**.
4. Optional: enable **Google** if you want Google signup to save to Firestore too.
5. Go to **Firestore Database** and create a database if you have not already.
6. Publish the included `firestore.rules` in Firestore Rules.
7. In WordPress Admin > Settings > Faith In, fill in the Firebase Web App config fields:
   - API Key
   - Auth Domain
   - Project ID
   - App ID
   - Messaging Sender ID, Storage Bucket, Measurement ID if available
8. In Firebase Authentication settings, add your website domain to **Authorized domains**.



## Firestore rules to publish

Replace your current locked rule:

```js
match /{document=**} {
  allow read, write: if false;
}
```

with the included `firestore.rules` file. It allows signed-in users to create, read, and update only their own document at `users/{uid}`, while keeping every other collection locked.

## Firestore user document shape

The signup flow writes a document like this:

```js
users/{firebaseUid} = {
  uid,
  email,
  emailLower,
  displayName,
  photoURL,
  provider,
  providers,
  appUserId,
  siteOrigin,
  status,
  createdAt,
  updatedAt,
  lastLoginAt
}
```

## Notes

The WordPress app-session system remains in place. Firestore stores the Firebase signup profile, while the Faith In UI still uses the existing WordPress AJAX/session flow after sign-in.


## WordPress plugin install

1. In WordPress Admin, go to **Plugins > Add New > Upload Plugin**.
2. Upload the ZIP file from this build.
3. Activate or replace the existing Faith In plugin.
4. Clear any WordPress/site cache so the new JavaScript file is loaded.
