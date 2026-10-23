#!/usr/bin/env sh
# Manual production deploy of the built site to Cloudflare Pages.
# Needs a Wrangler login (`npx wrangler@4 login`) or CLOUDFLARE_API_TOKEN.
set -eu

PROJECT=ktema-www

cd "$(dirname "$0")"

if ! command -v npm >/dev/null 2>&1; then
  echo "deploy: npm is not on PATH" >&2
  exit 1
fi

if ! npx wrangler@4 whoami >/dev/null 2>&1; then
  echo "deploy: Wrangler is not logged in; run 'npx wrangler@4 login'" >&2
  exit 1
fi

echo "deploy: building"
npm run build

# A build that exits zero without a home page would upload an empty site.
if [ ! -f dist/index.html ]; then
  echo "deploy: dist/index.html is missing" >&2
  exit 1
fi

echo "deploy: uploading to Cloudflare Pages ($PROJECT)"
npx wrangler@4 pages deploy dist --project-name="$PROJECT" --commit-dirty=true
