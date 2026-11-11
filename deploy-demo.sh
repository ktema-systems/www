#!/usr/bin/env sh
# Manual deploy of the demonstration center to Cloudflare Pages.
#
# The center is a site of its own: its own source under demo/, its own artifact, and its own Pages project. It names the
# applications it shows by address, so it is deployed on its own schedule and never builds them.
#
# Needs a Wrangler login (`npx wrangler@4 login`) or CLOUDFLARE_API_TOKEN. `PUBLIC_DELTA_URL` is the address the delta
# artifact is embedded from; a build without it points at the project the cockpit publishes to.
set -eu

PROJECT=${CENTER_PAGES_PROJECT:-ktema-demo}

cd "$(dirname "$0")"

if ! command -v npm >/dev/null 2>&1; then
  echo "deploy-demo: npm is not on PATH" >&2
  exit 1
fi

if ! npx wrangler@4 whoami >/dev/null 2>&1; then
  echo "deploy-demo: Wrangler is not logged in; run 'npx wrangler@4 login'" >&2
  exit 1
fi

echo "deploy-demo: building the center"
npm run build:demo

# A build that exits zero without a home page or the artifact page would publish a shell with nothing in it.
for need in index.html delta/index.html; do
  if [ ! -f "demo-dist/$need" ]; then
    echo "deploy-demo: demo-dist/$need is missing" >&2
    exit 1
  fi
done

echo "deploy-demo: uploading to Cloudflare Pages ($PROJECT)"
npx wrangler@4 pages deploy demo-dist --project-name="$PROJECT" --commit-dirty=true
