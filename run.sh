#!/usr/bin/env sh
#
# Bring up every surface this repository publishes, on this machine or on the web, in one step.
#
#   homepage      this package's own site                       HOME_PORT   (4321)
#   corpus hub    demo/, the pages the corpus renders            CENTER_PORT (4322)
#   delta demo    Delta shown as Delta, the exhibition board  DEMO_PORT   (5276)
#   corpus        Ktema Systems' records, `--board corpus`     VIEW_PORT   (5277)
#   blog          reserved: nothing to serve yet                 BLOG_PORT   (4323)
#
# The two cockpits are one application. Delta is the viewer stack, and the delta demo is Delta
# shown as itself. The Corpus app is Delta's first customer: Ktema Systems' own records, served.
# Both are up, so a reader can compare what the application is with what it does for a customer.
#
# `--deploy` is the same pipeline against the web: it takes the corpus hub's export, builds both
# renderings, and publishes them to their Cloudflare Pages projects. Nothing else changes, so
# what a person looks at locally is what a deploy sends.
#
# The builds are the cockpit's dist-demo, because that is the build the hub names in its links;
# --rebuild rebuilds them first, and a checkout without one is built on the first run.
# A host that already serves one can be named with DELTA_URL, and then none is started here.
# Ctrl-C stops the servers this run started.
#
# Environment, all optional:
#   NODE          the interpreter to run the servers with, chosen automatically when unset
#   HOME_PORT     the homepage's port
#   CENTER_PORT   the corpus hub's port
#   DEMO_PORT     the delta demo's port
#   VIEW_PORT     the Corpus app's port
#   BLOG_PORT     the port held for the blog
#   DELTA_DIR     a cockpit checkout, relative to this repository (../kletos/apps/delta)
#   DELTA_URL     a cockpit this host is not serving; none is started here
#   CORPUS_URL    the published export, which is what a deploy takes
#   CORPUS_SOURCE an export beside this checkout, which is what a local run takes when there is one

set -eu

ROOT=$(cd "$(dirname "$0")" && pwd)
cd "$ROOT"

HOME_PORT=${HOME_PORT:-4321}
CENTER_PORT=${CENTER_PORT:-4322}
DEMO_PORT=${DEMO_PORT:-5276}
VIEW_PORT=${VIEW_PORT:-5277}
BLOG_PORT=${BLOG_PORT:-4323}
DELTA_DIR=${DELTA_DIR:-../kletos/apps/delta}

say() { printf 'run: %s\n' "$*"; }
die() { printf 'run: %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<'USAGE'
run.sh: every surface this repository publishes, here or on the web.

  ./run.sh                     serve the homepage, the corpus hub, the demo and the corpus
  ./run.sh --deploy            take the published corpus, build both renderings, and publish them
  ./run.sh --rebuild           rebuild the cockpits before serving them
  ./run.sh --board NAME        serve that board instead of the exhibition, through the cockpit's launcher
  ./run.sh --brand NAME        the name the board's cockpit goes by
  ./run.sh --help              this text

--delta and --web belong to the cockpit's own launcher, and this one points there.
Ports: HOME_PORT (4321), CENTER_PORT (4322), DEMO_PORT (5276), VIEW_PORT (5277),
BLOG_PORT (4323).
NODE names the interpreter to run the servers with. DELTA_DIR names another cockpit
checkout, DELTA_URL a cockpit this host is not serving. CORPUS_URL names the export a
deploy takes, and CORPUS_SOURCE an export beside this checkout.
USAGE
}

rebuild=0
deploy=0
board=
brand=
while [ $# -gt 0 ]; do
  case "$1" in
    --rebuild) rebuild=1 ;;
    --deploy) deploy=1 ;;
    # The viewer is what this launcher already serves, and the board is how another one is drawn here. Naming the
    # viewer's own launcher in this one is a command for the other tree, and it is answered where it can be followed.
    --delta | --web)
      die "--delta and --web are the viewer's own launcher: (cd $(dirname "$(dirname "$DELTA_DIR")") && ./run.sh --delta --web); here, --board NAME draws a board"
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

# The deploy is the same pipeline as a local run, stopping at the publish instead of a server. It is answered here rather
# than at the bottom of the file so that a deploy never binds a port or starts a viewer it would leave running.
if [ "$deploy" -eq 1 ]; then
  [ -z "$board" ] || die '--deploy publishes the corpus itself; a board is what a local run draws with --board'
  [ -z "$brand" ] || die '--deploy publishes the corpus itself; --brand names a viewer a local run starts'
  say 'taking the published corpus and publishing both renderings'
  exec node tools/demo.mjs publish
fi

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

# A preview server answers in under a second; a cockpit's dev server starts a sim beside it and can take a minute on a
# cold cache. The wait is long enough for that and ends in a message rather than in a run that looks like it started.
wait_for() {
  command -v curl >/dev/null 2>&1 || return 0
  tries=0
  while [ "$tries" -lt 240 ]; do
    if curl -fsS -o /dev/null --max-time 2 "$1" >/dev/null 2>&1; then return 0; fi
    tries=$((tries + 1))
    sleep 0.5
  done
  die "$1 did not answer after 120s: its log above says why"
}

delta_url=${DELTA_URL:-}
demo_url=
own_delta=0

# The hub is a projection of the corpus, so a run takes the export in when there is one to hand: the published one named
# by CORPUS_URL, or the sibling checkout's. A page served from a copy the corpus moved past is the one thing this surface
# must not do, and taking the copy is cheap.
corpus_at=${CORPUS_URL:-}
if [ -z "$corpus_at" ] && [ -n "${CORPUS_SOURCE:-}" ]; then
  corpus_at=$CORPUS_SOURCE
fi
# A sibling checkout is where a person is most likely to have just built one, and it is the producer's own build
# directory rather than a copy: the export never lives in the tree it came from.
sibling=${KTEMA_DIR:-../ktema}/.build/corpus/export
if [ -z "$corpus_at" ] && [ -f "$sibling/bench.json" ]; then
  corpus_at=$sibling
fi
if [ -n "$corpus_at" ]; then
  say "taking the corpus from $corpus_at"
  CORPUS_URL="$corpus_at" node tools/demo.mjs take || die 'the corpus could not be taken into both renderings'
elif [ "$deploy" -eq 1 ]; then
  die 'a deploy publishes the corpus: set CORPUS_URL to the published export'
fi

# Both cockpits come from one checkout, so the build is made once and served twice: the demo on the exhibition board
# and the Corpus app on the corpus board. The board and the record it reads are files the cockpit's own launcher serves
# and a demonstration build does not carry, so the corpus board is started there rather than here.
if [ -n "$delta_url" ]; then
  delta_url=$(printf '%s' "$delta_url" | sed 's#/*$##')
  demo_url=$delta_url
else
  [ -x "$DELTA_DIR/node_modules/.bin/vite" ] ||
    die "no cockpit at $DELTA_DIR: run npm install there, or set DELTA_DIR or DELTA_URL"

  if [ "$rebuild" -eq 1 ] || [ ! -f "$DELTA_DIR/dist-demo/index.html" ]; then
    say "building the cockpit"
    (cd "$DELTA_DIR" && npm run build:demo) || die "the cockpit did not build"
  fi

  take_port "$DEMO_PORT" DEMO_PORT
  demo_url="http://localhost:$DEMO_PORT"
  (cd "$DELTA_DIR" && DELTA_DEMO=1 exec ./node_modules/.bin/vite preview --port "$DEMO_PORT" --strictPort) &
  pids="$pids $!"
  own_delta=1
fi

# The Corpus app is the same build under the corpus board. A board that is not the corpus is what `--board` names, and
# it is served here in its place: a run draws one board, so the two are never confused about which corpus is on screen.
view_board=${board:-corpus}
launcher=$(cd "$DELTA_DIR/../.." && pwd)
if [ -x "$launcher/run.sh" ]; then
  take_port "$VIEW_PORT" VIEW_PORT
  set -- --delta --web --board "$view_board"
  [ -n "$brand" ] && set -- "$@" --brand "$brand"
  say "the Corpus app draws the $view_board board, on http://localhost:$VIEW_PORT"
  (cd "$launcher" && KLET_WEB_PORT="$VIEW_PORT" DELTA_SITE="http://localhost:$CENTER_PORT" exec ./run.sh "$@") &
  pids="$pids $!"
else
  say "no cockpit launcher at $launcher: $view_board is not served here"
fi

[ "$own_delta" -eq 1 ] && wait_for "$demo_url"

# The blog stack joins here when there is one: a directory, a start command, and
# BLOG_PORT. Until then the port is named in the summary and nothing holds it.

take_port "$HOME_PORT" HOME_PORT
"$astro" dev --port "$HOME_PORT" &
pids="$pids $!"

take_port "$CENTER_PORT" CENTER_PORT
PUBLIC_DELTA_URL="http://localhost:$VIEW_PORT/" "$astro" dev --root demo --port "$CENTER_PORT" &
pids="$pids $!"

cat <<SUMMARY

  homepage       http://localhost:$HOME_PORT
  corpus hub     http://localhost:$CENTER_PORT
  delta demo     ${demo_url:-not served: DELTA_URL names one}
  corpus         http://localhost:$VIEW_PORT  (board: $view_board)
  blog           reserved on $BLOG_PORT, nothing to serve yet

  Ctrl-C stops the servers this run started. --deploy publishes both renderings instead.

SUMMARY

wait
