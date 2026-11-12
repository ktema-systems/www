#!/usr/bin/env bash
# The C surface on two architectures, for the demo center's terminal proof.
#
# The same test body is linked from C and run under QEMU on a Cortex-M4 and on a RISC-V
# core. The measurement lines are compared, which is what "architecture neutral" is worth
# once it is run rather than asserted.
#
# Run from the demo center root: demo/tools/record/proof-capi-arch.sh
set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
repo=$(git -C "$here" rev-parse --show-toplevel)
ktema=${KTEMA_DIR:-$repo/../ktema}
cd "$ktema"

arm=$(mktemp)
riscv=$(mktemp)
trap 'rm -f "$arm" "$riscv"' EXIT

echo "One C test body, two architectures."
echo
printf '  %-36s %s\n' "verify/capi/test.c" "$(wc -l < verify/capi/test.c | tr -d ' ') lines, shared"
printf '  %-36s %s\n' "verify/capi-arm/platform_arm.c" "the Cortex-M4 hooks"
printf '  %-36s %s\n' "verify/capi/platform_riscv32.c" "the RISC-V hooks"
echo

echo "== Cortex-M4, qemu-system-arm, machine mps2-an386 =="
verify/capi-arm/check.sh | tee "$arm"
echo
echo "== RISC-V, qemu-system-riscv32, machine virt =="
verify/capi/check.sh | tee "$riscv"
echo

measure() {
    grep -E '^(loop|count|framing|addresses|coordinate|box|query|enumeration|intent|bare intent|hint|claim|conclude|footprint|PASS)' "$1"
}

if diff -q <(measure "$arm") <(measure "$riscv") >/dev/null; then
    echo "== the same $(measure "$arm" | wc -l | tr -d ' ') measurements on both architectures =="
    measure "$arm" | sed 's/^/  /'
else
    echo "the two architectures disagreed:"
    diff <(measure "$arm") <(measure "$riscv") || true
    exit 1
fi
