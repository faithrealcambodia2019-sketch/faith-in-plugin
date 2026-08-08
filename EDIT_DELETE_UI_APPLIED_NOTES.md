# Edit/Delete UI Applied

Version: 5.5.219

Applied the requested professional pill-style Edit/Delete UI across owner actions:

- Feed post Edit/Delete buttons
- Prayer wall Edit/Delete buttons
- Library resource Delete button
- Job post Edit/Delete buttons when the current user owns the job post

The existing handlers remain connected:

- `editPost()` / `deletePost()`
- `editPrayer()` / `deletePrayer()`
- `deleteResource()`
- `editJob()` / `deleteJob()`

CSS class added: `cv-owner-action-pill` with edit/delete variants.
