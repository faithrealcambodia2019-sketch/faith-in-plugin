# Faith In Firebase Storage only setup

This package keeps the Faith In app data in WordPress. It only adds Firebase Storage as an upload destination for files/images/videos.

## What connects to Firebase

- **Firebase Storage**: optional upload destination for new images/videos/files.
- **Firebase Authentication**: optional only for email/password login.
- **Google login**: uses Google Identity Services, not Firebase Auth, so the Firebase `auth/unauthorized-domain` error should no longer block Google login.
- **Firestore**: not used.

## WordPress setup

1. Upload and activate the plugin zip.
2. Go to **WordPress Admin > Settings > Faith In Media Storage**.
3. Choose **Firebase Storage only**.
4. Bucket should be:

   ```text
   faith-app-98a5f.firebasestorage.app
   ```

5. Paste your Firebase/Google Cloud service account JSON.
6. Save.

## Login setup

Go to **WordPress Admin > Settings > Faith In**.

Google login uses the **Google Client ID** field. Firebase Auth settings below it are optional and are only needed if you want the email/password form to use Firebase Auth.

For your Firebase project, these Firebase fields should be:

```text
Firebase Auth Domain: faith-app-98a5f.firebaseapp.com
Firebase Project ID: faith-app-98a5f
Storage Bucket: faith-app-98a5f.firebasestorage.app
```

The plugin no longer bundles the old `faith-in-50359` Firebase Auth project values.

## Storage rules

A suggested `storage.rules` file is included. The plugin uploads with a service account, so server uploads do not depend on Firebase client rules. The rules are still useful if you later allow direct client access.
