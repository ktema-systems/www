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
#   NODE         the interpreter to run the servers with, chosen automatically when unset
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

  ./run.sh                     serve the homepage, the demo center and the cockpit
  ./run.sh --rebuild           rebuild the cockpit first
  ./run.sh --board corpus      the cockpit drawing that board, through the cockpit's own launcher
  ./run.sh --brand Acme        the name that cockpit goes by
  ./run.sh --help              this text

--delta and --web belong to the cockpit's own launcher, and this one points there.
Ports: HOME_PORT (4321), CENTER_PORT (4322), DELTA_PORT (5276), BLOG_PORT (4323).
NODE names the interpreter to run the servers with. DELTA_DIR names another cockpit
checkout, DELTA_URL a cockpit this host is not serving.
USAGE
}

rebuild=0
board=
brand=
while [ $# -gt 0 ]; do
  case "$1" in
    --rebuild) rebuild=1 ;;
    # The cockpit is what this launcher already serves, and the board is how another one is drawn here. Naming the
    # cockpit's own launcher in this one is a command for the other tree, and it is answered where it can be followed.
    --delta | --web)
      die "--delta and --web are the cockpit's own launcher: (cd $(dirname "$(dirname "$DELTA_DIR")") && ./run.sh --delta --web); here, --board NAME draws a board"
      ;;
    --board)
      [ $# -ge 2 ] || die '--board wants a name: --board corpus'
      board=$2
      shift
      ;;
    --brand)
      [ $# -ge 2 ] || die '--brand wants a name: --brand Acme'
      brand=$2
      shift
      ;;
    -h | --help) usage; exit 0 ;;
    *) printf 'run: unknown argument %s\n' "$1" >&2; usage >&2; exit 2 ;;
  esac
  shift
done

# Astro refuses to start below the Node floor this package declares, and an unchecked run
# repeats that refusal once per surface. The interpreter is resolved here, once, and every
# child inherits it through PATH, so the whole run agrees on one version.
node_floor=$(sed -n 's/.*"node": *">=\([0-9][0-9.]*\)".*/\1/p' package.json | head -1)
[ -n "$node_floor" ] || die "package.json declares no engines.node floor to check against"

meets_floor() {
  "$1" -e "
    const floor = '$node_floor'.split('.').map(Number);
    const have = process.versions.node.split('.').map(Number);
    for (let i = 0; i < 3; i += 1) {
      if (have[i] !== floor[i]) process.exit(have[i] > floor[i] ? 0 : 1);
    }
    process.exit(0);
  " >/dev/null 2>&1
}

# PATH first, then where a version manager or a package manager leaves one; NODE overrides
# both and is refused rather than silently replaced.
node_bin=
if [ -n "${NODE:-}" ]; then
  [ -x "$NODE" ] || die "NODE=$NODE is not executable"
  meets_floor "$NODE" || die "NODE=$NODE is $("$NODE" -v 2>/dev/null), below the $node_floor this package requires"
  node_bin=$NODE
else
  for candidate in "$(command -v node 2>/dev/null || true)" \
                   "$HOME"/.nvm/versions/node/*/bin/node \
                   /opt/homebrew/bin/node /usr/local/bin/node; do
    [ -x "$candidate" ] 2>/dev/null || continue
    if meets_floor "$candidate"; then
      node_bin=$candidate
      break
    fi
  done
fi
[ -n "$node_bin" ] || die "no node at or above $node_floor was found: install one, or set NODE to its path"
PATH=$(dirname "$node_bin"):$PATH
export PATH
say "node $("$node_bin" -v) at $node_bin"

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

# A port this run needs is taken from whatever held it: a server left behind by a launcher that died is the thing this
# run replaces, and it is not a reason to ask a person to clean up first. One that ignores the signal is killed.
take_port() {
  for pid in $(lsof -ti "tcp:$1" -sTCP:LISTEN 2>/dev/null || true); do
    say "port $1 was held by $pid: $(ps -o command= -p "$pid" 2>/dev/null | cut -c1-64); stopping it"
    kill "$pid" 2>/dev/null || true
  done
  tries=0
  while ! port_free "$1" && [ "$tries" -lt 50 ]; do
    sleep 0.1
    tries=$((tries + 1))
  done
  if ! port_free "$1"; then
    for pid in $(lsof -ti "tcp:$1" -sTCP:LISTEN 2>/dev/null || true); do kill -KILL "$pid" 2>/dev/null || true; done
    sleep 0.2
  fi
  port_free "$1" || die "port $1 is still held: $2"
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

# The center is a projection of the volume, so a run takes the export in when the sibling checkout has one. A page
# served from a copy the corpus moved past is the one thing this surface must not do, and the copy is cheap.
if [ -f "${KTEMA_DIR:-../ktema}/corpus/export/bench.json" ]; then
  node tools/demo.mjs take || die 'the corpus could not be taken into both consumers'
fi

if [ -n "$delta_url" ]; then
  delta_url=$(printf '%s' "$delta_url" | sed 's#/*$##')
elif [ -n "$board" ]; then
  # A board other than the exhibition's is the cockpit's dev server, because the board and the record it reads are files
  # the cockpit's own launcher serves and a demonstration build does not carry. It is started there rather than here so
  # the board, the sim and the port are that launcher's to get right.
  launcher=$(cd "$DELTA_DIR/../.." && pwd)
  [ -x "$launcher/run.sh" ] || die "no cockpit launcher at $launcher: set DELTA_DIR"
  take_port "$DELTA_PORT" DELTA_PORT
  delta_url="http://localhost:$DELTA_PORT"
  set -- --delta --web --board "$board"
  [ -n "$brand" ] && set -- "$@" --brand "$brand"
  say "the cockpit draws the $board board, on $delta_url"
  (cd "$launcher" && KLET_WEB_PORT="$DELTA_PORT" DELTA_SITE="http://localhost:$CENTER_PORT" exec ./run.sh "$@") &
  pids="$pids $!"
  own_delta=1
else
  [ -x "$DELTA_DIR/node_modules/.bin/vite" ] ||
    die "no cockpit at $DELTA_DIR: run npm install there, or set DELTA_DIR or DELTA_URL"

  if [ "$rebuild" -eq 1 ] || [ ! -f "$DELTA_DIR/dist-demo/index.html" ]; then
    say "building the cockpit"
    (cd "$DELTA_DIR" && npm run build:demo) || die "the cockpit did not build"
  fi

  take_port "$DELTA_PORT" DELTA_PORT
  delta_url="http://localhost:$DELTA_PORT"
  (cd "$DELTA_DIR" && DELTA_DEMO=1 exec ./node_modules/.bin/vite preview --port "$DELTA_PORT" --strictPort) &
  pids="$pids $!"
  own_delta=1
fi

[ "$own_delta" -eq 1 ] && wait_for "$delta_url"

# The blog stack joins here when there is one: a directory, a start command, and
# BLOG_PORT. Until then the port is named in the summary and nothing holds it.

take_port "$HOME_PORT" HOME_PORT
"$astro" dev --port "$HOME_PORT" &
pids="$pids $!"

take_port "$CENTER_PORT" CENTER_PORT
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
