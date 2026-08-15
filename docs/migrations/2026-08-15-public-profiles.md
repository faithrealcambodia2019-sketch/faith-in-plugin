# Public profile privacy migration

This is an additive, non-destructive Firestore migration. It does not delete,
rename, overwrite, or move any existing account document.

## Why it exists

The original member directory queried `users/{uid}` directly. Those documents
also contain email addresses and account settings, so allowing every signed-in
member to query them exposed fields that the directory did not need.

## Safe rollout order

1. Deploy the application code. On each successful login it writes an
   email-free projection to `publicProfiles/{uid}` while leaving `users/{uid}`
   unchanged.
2. Confirm new and returning users have a `publicProfiles/{uid}` document.
3. Deploy `firestore.rules` and `firestore.indexes.json` together.
4. Test the member directory with a non-administrator account.

Existing members are backfilled lazily on their next successful login. If an
immediate full backfill is required, use a one-off Admin SDK script against a
verified backup and copy only the allowlisted public fields. Do not export email,
settings, authentication data, or verification requests to `publicProfiles`.

## Rollback

Rolling back the application and rules leaves `publicProfiles` as an unused
additive collection. The original `users` documents and all IDs remain intact.
