#!/usr/bin/env bash
# Re-record the demo center's terminal proofs: one cast per proof, one still per cast, and
# an optional upload. The casts are not kept; the still and the URL are, so this script is
# what makes a proof reproducible.
#
# Usage: demo/tools/record/record.sh [--upload] [name ...]
#
# With no names every proof is recorded. --upload (or UPLOAD=1) pushes each cast to
# asciinema.org and prints the URL, which replaces the proof's href in
# demo/src/data/artifacts.ts. KTEMA_DIR points at the engine checkout; the default is the
# sibling ../ktema of this repository.
set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
repo=$(git -C "$here" rev-parse --show-toplevel)
ktema=${KTEMA_DIR:-$repo/../ktema}
export KTEMA_DIR="$ktema"

upload=${UPLOAD:-0}
selected=()
for arg in "$@"; do
    case "$arg" in
        --upload) upload=1 ;;
        *) selected+=("$arg") ;;
    esac
done

want() {
    [ ${#selected[@]} -eq 0 ] && return 0
    for name in "${selected[@]}"; do
        [ "$name" = "$1" ] && return 0
    done
    return 1
}

# name | command | upload title. A command is run from the engine checkout unless the name
# is marked, which is where the session itself lives in this repository.
manifest=$(cat <<'EOF'
device|verify/device/check.sh|Ktema: the device tier and the host write the same volume
region|verify/region/check.sh|Ktema: a power cut at every byte, and a volume that converges
smoke|__smoke__|Ktema: a 13-step record round trip, hashed to one digest
capi-arm|__capi_arm__|Ktema: one C test body, a Cortex-M4 and a RISC-V core
faults|verify/faults/check.sh|Ktema: a refused write, a worn medium, a buffered write
EOF
)

castdir=$(mktemp -d)
trap 'rm -rf "$castdir"' EXIT

while IFS='|' read -r name command title; do
    [ -z "$name" ] && continue
    want "$name" || continue

    case "$command" in
        __smoke__)
            cwd=$ktema
            command="target/debug/ktema-sim verify/scenarios/smoke.txt target/demo/smoke --reset"
            ( cd "$ktema" && rm -rf target/demo && mkdir -p target/demo && cargo build -q -p ktema-sim )
            ;;
        __capi_arm__)
            cwd=$repo
            command="demo/tools/record/proof-capi-arch.sh"
            ;;
        *)
            cwd=$ktema
            ;;
    esac

    cast="$castdir/$name.cast"
    echo "recording $name"
    ( cd "$cwd" && asciinema rec --window-size 120x30 -c "$command" --idle-time-limit 1 --overwrite "$cast" )

    agg --select 100% --no-loop --font-size 18 "$cast" "$cast.gif"
    still="$repo/demo/public/proofs/$name.png"
    if command -v sips >/dev/null 2>&1; then
        sips -s format png "$cast.gif" --out "$still" >/dev/null
    elif command -v ffmpeg >/dev/null 2>&1; then
        ffmpeg -loglevel error -y -i "$cast.gif" -frames:v 1 "$still"
    else
        echo "need sips or ffmpeg to turn the cast into a still" >&2
        exit 1
    fi

    if [ "$upload" = 1 ]; then
        url=$(asciinema upload "$cast" --title "$title" --visibility unlisted 2>&1 \
            | grep -o 'https://asciinema.org/a/[A-Za-z0-9]*')
        echo "  $name  $url"
        echo "  replace its href in demo/src/data/artifacts.ts"
    fi
done <<<"$manifest"
