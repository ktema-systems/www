#!/usr/bin/env bash
# Measure the two baselines the engine is compared against, on this host.
#
# The engine's own numbers belong to `benches/run.sh` in the ktema checkout, because that
# bench owns the format. This script measures the same records in the two things a buyer
# would otherwise reach for on the same host, so the three rows are one comparison.
#
# Usage: run.sh
set -euo pipefail
cd "$(dirname "$0")"

host="$(uname -sm)"
mkdir -p result

cc -O2 -Wall -Wextra -std=c11 -DHOST="\"$host\"" bench.c -lsqlite3 -o bench

work="${TMPDIR:-/tmp}/ktema-bench"
mkdir -p "$work"

./bench "$work" | tee result/peers.json
