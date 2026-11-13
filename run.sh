#!/usr/bin/env sh
#
# Bring up every surface this repository publishes, on this machine, in one step.
#
#   homepage      this package's own site                     HOME_PORT   (4321)
#   demo center   demo/, whose links name the cockpit below   CENTER_PORT (4322)
#   delta demo    the cockpit in the sibling kletos checkout  DELTA_PORT  (5276)
#   blog          reserved: nothing to serve yet              BLOG_PORT   (4323)
#
# The cockpit is the build in its dist-demo, because that is the build the center names
# in its links; --rebuild rebuilds it first, and a checkout without one is built on the
# first run. A host that already serves a cockpit can be named with DELTA_URL, and then
# none is started here. Ctrl-C stops the servers this run started.
#
# Ports are checked before anything starts, because a dev server that finds its port
# taken serves the next one and the web of links above it would then be wrong.
#
# Environment, all optional:
#   HOME_PORT    the homepage's port
#   CENTER_PORT  the demo center's port
#   DELTA_PORT   the cockpit's port
#   BLOG_PORT    the port held for the blog
#   DELTA_DIR    a cockpit checkout, relative to this repository (../kletos/apps/delta)
#   DELTA_URL    a cockpit this host is not serving; none is started here

set -eu

ROOT=$(cd "$(dirname "$0")" && pwd)
cd "$ROOT"

HOME_PORT=${HOME_PORT:-4321}
CENTER_PORT=${CENTER_PORT:-4322}
DELTA_PORT=${DELTA_PORT:-5276}
BLOG_PORT=${BLOG_PORT:-4323}
DELTA_DIR=${DELTA_DIR:-../kletos/apps/delta}

say() { printf 'run: %s\n' "$*"; }
die() { printf 'run: %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<'USAGE'
run.sh: every surface this repository publishes, on this machine.

  ./run.sh            serve the homepage, the demo center and the cockpit
  ./run.sh --rebuild  rebuild the cockpit first
  ./run.sh --help     this text

Ports: HOME_PORT (4321), CENTER_PORT (4322), DELTA_PORT (5276), BLOG_PORT (4323).
DELTA_DIR names another cockpit checkout, DELTA_URL a cockpit this host is not serving.
USAGE
}

rebuild=0
for arg in "$@"; do
  case "$arg" in
    --rebuild) rebuild=1 ;;
    -h | --help) usage; exit 0 ;;
    *) printf 'run: unknown argument %s\n' "$arg" >&2; usage >&2; exit 2 ;;
  esac
done

astro=$ROOT/node_modules/.bin/astro
[ -x "$astro" ] || die "this package is not installed: run npm install"

pids=
stop() {
  for pid in $pids; do
    kill "$pid" 2>/dev/null || true
  done
}
trap 'stop' EXIT
trap 'exit 130' INT TERM

# A bound socket tells the truth a file check cannot: another checkout of this site
# holding 4321 is the common case, and it is the one that would be served instead.
port_free() {
  node -e 'const s=require("net").createServer();s.once("error",()=>process.exit(1));s.listen(Number(process.argv[1]),"127.0.0.1",()=>s.close(()=>process.exit(0)))' "$1" 2>/dev/null
}

need_port() {
  port_free "$1" || die "port $1 is in use: stop what holds it, or set $2"
}

wait_for() {
  command -v curl >/dev/null 2>&1 || return 0
  tries=0
  while [ "$tries" -lt 60 ]; do
    if curl -fsS -o /dev/null --max-time 2 "$1" >/dev/null 2>&1; then return 0; fi
    tries=$((tries + 1))
    sleep 0.5
  done
  die "$1 did not answer"
}

delta_url=${DELTA_URL:-}
own_delta=0

if [ -n "$delta_url" ]; then
  delta_url=$(printf '%s' "$delta_url" | sed 's#/*$##')
else
  [ -x "$DELTA_DIR/node_modules/.bin/vite" ] ||
    die "no cockpit at $DELTA_DIR: run npm install there, or set DELTA_DIR or DELTA_URL"

  if [ "$rebuild" -eq 1 ] || [ ! -f "$DELTA_DIR/dist-demo/index.html" ]; then
    say "building the cockpit"
    (cd "$DELTA_DIR" && npm run build:demo) || die "the cockpit did not build"
  fi

  need_port "$DELTA_PORT" DELTA_PORT
  delta_url="http://localhost:$DELTA_PORT"
  (cd "$DELTA_DIR" && DELTA_DEMO=1 exec ./node_modules/.bin/vite preview --port "$DELTA_PORT" --strictPort) &
  pids="$pids $!"
  own_delta=1
fi

[ "$own_delta" -eq 1 ] && wait_for "$delta_url"

# The blog stack joins here when there is one: a directory, a start command, and
# BLOG_PORT. Until then the port is named in the summary and nothing holds it.

need_port "$HOME_PORT" HOME_PORT
"$astro" dev --port "$HOME_PORT" &
pids="$pids $!"

need_port "$CENTER_PORT" CENTER_PORT
PUBLIC_DELTA_URL="$delta_url/" "$astro" dev --root demo --port "$CENTER_PORT" &
pids="$pids $!"

cat <<SUMMARY

  homepage     http://localhost:$HOME_PORT
  delta demo   $delta_url
  demo center  http://localhost:$CENTER_PORT
  blog         reserved on $BLOG_PORT, nothing to serve yet

  Ctrl-C stops the servers this run started.

SUMMARY

wait
