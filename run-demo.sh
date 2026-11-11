#!/usr/bin/env sh
# Run the demonstration center locally, beside the cockpit it embeds.
#
# The center names its artifacts by address rather than importing them, so a center built against the published
# address shows the published cockpit even on this host. This starts the cockpit's own preview server over its built
# demonstration, hands the center that address, and stops the cockpit when the center exits.
#
#   ./run-demo.sh                        both, on the defaults below
#   CENTER_PORT=4411 ./run-demo.sh       the center on another port
#   DELTA_URL=https://... ./run-demo.sh  a cockpit this host is not running; no preview server is started
#   DEMO_REBUILD=1 ./run-demo.sh         rebuild the cockpit before showing it
#
# Astro serves one dev server per project, and the center is a second root of this one, so a dev server already running
# for the marketing site is replaced rather than left to block this run.
#
# The cockpit is another repository, so its directory is named rather than assumed: DELTA_DIR points at a checkout and
# defaults to the sibling this project is developed beside.
set -eu

REPO_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CENTER_PORT=${CENTER_PORT:-4321}
DELTA_PORT=${DELTA_PORT:-5276}
DELTA_DIR=${DELTA_DIR:-../kletos/apps/delta}

say() {
    printf '%s\n' "$*"
}

fail() {
    printf 'run-demo: %s\n' "$*" >&2
    exit 1
}

command -v npm >/dev/null 2>&1 || fail 'npm is not on PATH'
[ -x "$REPO_ROOT/node_modules/.bin/astro" ] ||
    fail "the center's dependencies are not installed: run npm install in $REPO_ROOT"

# A cockpit address given is a cockpit this host is not serving, which is what a run against a deployment is.
serve_delta=1
if [ -n "${DELTA_URL:-}" ]; then
    serve_delta=0
else
    [ -x "$DELTA_DIR/node_modules/.bin/vite" ] ||
        fail "no cockpit at DELTA_DIR=$DELTA_DIR: name a checkout, or give DELTA_URL a cockpit already served"
    DELTA_URL="http://localhost:$DELTA_PORT"
fi

delta_pid=
center_pid=

# Both servers are waited on from here rather than left in the foreground: a foreground child defers a signal until that
# child has already exited on its own, which is the one case where the cockpit would outlive the run.
cleanup() {
    trap - EXIT INT TERM
    [ -z "$center_pid" ] || kill "$center_pid" 2>/dev/null || true
    [ -z "$delta_pid" ] || kill "$delta_pid" 2>/dev/null || true
    wait 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 130' INT TERM

if [ "$serve_delta" = 1 ]; then
    # The preview server answers from the build, not from the sources, so a cockpit whose sources moved on is rebuilt
    # here unless the caller says the build in hand is the one to show.
    if [ "${DEMO_REBUILD:-0}" = 1 ] || [ ! -f "$DELTA_DIR/dist-demo/index.html" ]; then
        say 'run-demo: building the cockpit'
        ( cd "$DELTA_DIR" && npm run build:demo ) || fail 'the cockpit did not build'
    fi

    say "run-demo: the cockpit on $DELTA_URL"
    (
        cd "$DELTA_DIR"
        DELTA_DEMO=1
        export DELTA_DEMO
        exec ./node_modules/.bin/vite preview --port "$DELTA_PORT"
    ) &
    delta_pid=$!

    # The center leads with a frame over this address, so it is not opened before the address answers.
    if command -v curl >/dev/null 2>&1; then
        tries=0
        until curl -sf -o /dev/null "$DELTA_URL/"; do
            tries=$((tries + 1))
            [ "$tries" -lt 40 ] || fail "the cockpit did not answer on $DELTA_URL"
            sleep 0.25
        done
    fi
fi

say "run-demo: the center on http://localhost:$CENTER_PORT"
say ''

cd "$REPO_ROOT"
PUBLIC_DELTA_URL="$DELTA_URL/" "$REPO_ROOT/node_modules/.bin/astro" dev --root demo --port "$CENTER_PORT" --force &
center_pid=$!

wait "$center_pid"
