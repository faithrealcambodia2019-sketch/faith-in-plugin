#!/bin/bash
#
# Faith In — go live
# ==================
# Publishes the marketing site, SEO layer and Firebase data backend to
# faithin.co, and deploys the security rules that posting depends on.
#
# Run it from the project folder:
#
#     cd "$HOME/Documents/New project/faith-in-platform"
#     bash go-live.sh
#
set -euo pipefail

cd "$(dirname "$0")" || exit 1

say()  { printf '\n\033[1;35m▸ %s\033[0m\n' "$1"; }
ok()   { printf '\033[0;32m  ✓ %s\033[0m\n' "$1"; }
warn() { printf '\033[0;33m  ! %s\033[0m\n' "$1"; }
die()  { printf '\033[0;31m  ✗ %s\033[0m\n\n' "$1"; exit 1; }

# ---------------------------------------------------------------------------
say "1/6  Checking the project"
# ---------------------------------------------------------------------------
[ -f package.json ] || die "Run this from the faith-in-platform folder."
[ -f public/assets/js/faith-in-backend.js ] || die "faith-in-backend.js is missing — the changes were not applied."
[ -d "app/(marketing)" ] || die "The marketing pages are missing — the changes were not applied."
ok "All expected files are present"

# ---------------------------------------------------------------------------
say "2/6  Checking archived source"
# ---------------------------------------------------------------------------
# app/page.tsx had to be moved aside; two files cannot both serve "/".
if [ -d _to_delete ]; then
  warn "_to_delete/ is preserved locally and excluded by .gitignore"
else
  ok "No archived source folder found"
fi
if [ -f app/page.tsx ]; then
  die "app/page.tsx still exists and will collide with the new homepage. Delete it, then re-run."
fi

# ---------------------------------------------------------------------------
say "3/6  Installing dependencies"
# ---------------------------------------------------------------------------
npm install --no-audit --no-fund || die "npm install failed."
ok "Dependencies installed"

# ---------------------------------------------------------------------------
say "4/6  Testing and building"
# ---------------------------------------------------------------------------
npm test || die "The backend tests failed. Nothing has been pushed — send me the output above."
ok "Backend tests passed"

npm run lint || die "Lint failed. Nothing has been pushed."
npm run typecheck || die "Type checking failed. Nothing has been pushed."
npm run test:rules || die "Firestore authorization tests failed. Nothing has been pushed."
ok "Code and authorization checks passed"

npm run build || die "The production build failed. Nothing has been pushed — send me the output above."
ok "Production build succeeded"

# ---------------------------------------------------------------------------
say "5/6  Publishing to GitHub (Vercel will deploy faithin.co)"
# ---------------------------------------------------------------------------
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "  Current branch: $BRANCH"

git add -A || die "git add failed."

if git diff --cached --quiet; then
  warn "No changes to commit — they may already be committed"
else
  git commit -m "Add marketing site, SEO layer, and Firebase data backend

Serve / as a server-rendered, indexable marketing site and move the
application to /app. Implement the data backend the app has been missing
since the WordPress conversion, so login, posting, media upload, the feed,
reactions and comments work again." || die "git commit failed."
  ok "Committed"
fi

echo "  Pushing… (if you are asked to sign in to GitHub, do that in the window that opens)"
git push origin "$BRANCH" || die "git push failed. Check your GitHub sign-in, then re-run."
ok "Pushed to origin/$BRANCH"

# ---------------------------------------------------------------------------
say "6/6  Deploying the Firebase security rules"
# ---------------------------------------------------------------------------
# Without this, posting fails with a permission error: the old rules locked
# every collection except "users", so the posts collection cannot be written.
if ! command -v firebase >/dev/null 2>&1; then
  warn "The Firebase CLI is not installed."
  echo "     Install it, then deploy the rules:"
  echo "       npm install -g firebase-tools"
  echo "       firebase login"
  echo "       firebase deploy --only firestore:rules,firestore:indexes,storage"
  echo ""
  warn "POSTING WILL NOT WORK UNTIL THOSE RULES ARE DEPLOYED."
else
  firebase deploy --only firestore:rules,firestore:indexes,storage || {
    warn "Rules deploy failed — you may need to run: firebase login"
    warn "POSTING WILL NOT WORK UNTIL THOSE RULES ARE DEPLOYED."
  }
fi

# ---------------------------------------------------------------------------
printf '\n\033[1;32m==================================================\033[0m\n'
printf '\033[1;32m  Done. Vercel is building faithin.co now.\033[0m\n'
printf '\033[1;32m==================================================\033[0m\n\n'
echo "Check the deployment:   https://vercel.com/faithrealcambodia2019-sketchs-projects/faith-in"
echo ""
echo "Then test on faithin.co:"
echo "  1. The homepage should show the marketing site, not a login form."
echo "  2. Log in, write a post with a photo, and publish it."
echo "  3. If posting fails, the Firebase rules in step 6 did not deploy."
echo ""
echo "Google sign-in works through Firebase when the Google provider is enabled."
echo "To enable GitHub sign-in after configuring it in Firebase, add:"
echo "  NEXT_PUBLIC_GITHUB_AUTH_ENABLED = true"
echo ""
