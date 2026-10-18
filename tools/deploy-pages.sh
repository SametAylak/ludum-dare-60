#!/bin/sh
# Builds the game and publishes dist/ as the gh-pages branch, which GitHub Pages serves.
# It builds here, not in CI, because audio/voices.bin is made from recordings that aren't in the repo (see README).
set -e
cd "$(dirname "$0")/.."
pnpm build
[ -f audio/voices.bin ] || { echo "deploy-pages: no audio/voices.bin; download the recordings and run pnpm voices first." >&2; exit 1; }
touch dist/.nojekyll
index="$(git rev-parse --absolute-git-dir)/pages-index"; rm -f "$index"
GIT_INDEX_FILE="$index" git --work-tree=dist add -A .
tree=$(GIT_INDEX_FILE="$index" git write-tree); rm -f "$index"
git fetch -q origin gh-pages 2>/dev/null || true
parent=$(git rev-parse -q --verify origin/gh-pages || true)
commit=$(git commit-tree "$tree" ${parent:+-p "$parent"} -m "Deploy $(git rev-parse --short HEAD)")
git push origin "$commit:refs/heads/gh-pages"
