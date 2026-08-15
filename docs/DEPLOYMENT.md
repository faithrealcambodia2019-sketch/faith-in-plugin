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

## Firebase data backend (added August 2026)

The application originally ran on a WordPress PHP backend. When it became a
standalone Next.js app, `/api/compat` was left returning HTTP 501 for every
data action, which meant creating posts, loading the feed, commenting, liking
and editing a profile all failed silently for members.

`public/assets/js/faith-in-backend.js` now serves those actions directly from
Firebase. It installs a jQuery ajax transport that intercepts requests to
`cv_ajax.ajax_url`, reads the `action`, and fulfils it against Firebase Auth,
Cloud Firestore and Cloud Storage, returning the same `{ success, data }`
envelope the application already expected. No calling code changed.

### Required deployment step

**The Firestore rules must be deployed or posting will fail with a permission
error.** The previous rules locked every collection except `users`, so the
`posts` collection could not be written to at all.

```bash
firebase deploy --only firestore:rules,storage
```

Verify afterwards in the Firebase console under Firestore → Rules that the
`posts` block is present.

### What is implemented

| Area | Actions | Status |
|---|---|---|
| Auth | `cv_get_session`, `cv_firebase_sign_in`, `cv_logout` | Live — creates the Firestore profile on first sign-in |
| Feed | `cv_create_post`, `cv_get_posts`, `cv_update_post`, `cv_delete_post` | Live — text, images, video, blessings, visibility |
| Engagement | `cv_like_post`, `cv_create_post_comment`, `cv_share_post`, `cv_repost_post` | Live — one reaction per member, tap again to remove |
| Media | `cv_stage_post_media` | Live — uploads to Cloud Storage |
| Library | `cv_get_resources`, `cv_upload_resource`, `cv_delete_resource`, `cv_download_resource` | Live — with download counts |
| Prayer | `cv_get_prayers`, `cv_create_prayer`, `cv_update_prayer`, `cv_delete_prayer` | Live — including "I prayed for this" |
| Jobs | `cv_get_jobs`, `cv_create_job`, `cv_update_job`, `cv_delete_job` | Live |
| Members | `cv_find_users`, `cv_get_suggested_users` | Live — searches name, church, ministry, role, location |
| Following | `cv_social_follow_user`, `cv_social_unfollow_user`, `cv_social_get_followers`, `cv_social_get_following` | Live |
| Profile | `cv_update_profile`, `cv_update_user_settings` | Live — name, photo, theme, language |
| Verification | `cv_get_verification_status`, `cv_request_verification` | Live — requests are stored; granting a badge is a manual admin step |
| Bible | `cv_bible_save_notes`, `cv_bible_get_notes`, `cv_bible_save_typing_score` | Live |
| Bible text | `cv_bible_get_verses`, `cv_bible_dictionary`, `cv_bible_get_quotes`, `cv_bible_get_media` | Not implemented — needs a licensed Bible text source |
| Messaging | REST endpoints under `rest_root` | Not implemented — needs a real-time backend |
| AI images | `cv_bible_ai_image` | Not implemented — needs an image generation provider |

Anything not implemented returns a plain-language "still being built" message
rather than an error. Each remaining action is a small addition to the
`actions` map in `faith-in-backend.js`.

### Tests

```bash
npm test
```

Runs `tests/backend.test.mjs`, which loads the backend with a fake jQuery and
fake Firebase and exercises the transport end to end — session creation, text
and media posts, the 25MB limit, feed shaping, reactions, comments, deletion,
and pass-through of non-application requests.

### Limits

- 25MB per file, 10 files per post — kept in step with `storage.rules`.
- Uploads go to `faith-in-uploads/{uid}/`, which the storage rules already
  restrict to the owning member.
