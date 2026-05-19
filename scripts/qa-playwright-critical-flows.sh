#!/usr/bin/env bash
set -euo pipefail

# Critical PRD/userflow smoke harness.
# Start the app first, then run:
#   BASE_URL=http://localhost:3000 npm run qa:playwright

BASE_URL="${BASE_URL:-http://localhost:3000}"
CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
PWCLI="${PWCLI:-$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh}"
SESSION="${PLAYWRIGHT_CLI_SESSION:-hotqa}"
OUT_DIR="${PLAYWRIGHT_OUT_DIR:-output/playwright}"

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required for the Playwright CLI wrapper." >&2
  exit 1
fi

if [[ ! -x "$PWCLI" ]]; then
  echo "Playwright CLI wrapper not found at $PWCLI" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

routes=(
  "/login"
  "/planning"
  "/large-work"
  "/large-work?largeWorkId=1&view=operations"
  "/daily-report?sourceType=team_plan&sourceId=1&workDate=2026-05-19"
  "/monthly-plan"
  "/work-report"
  "/contacts"
)

for route in "${routes[@]}"; do
  safe_name="$(printf '%s' "$route" | sed -E 's#^/##; s#[^A-Za-z0-9._-]+#-#g; s#^-|-$##g')"
  [[ -n "$safe_name" ]] || safe_name="root"
  url="${BASE_URL}${route}"
  echo "Checking $url"
  "$PWCLI" --session "$SESSION" open "$url" >/dev/null
  "$PWCLI" --session "$SESSION" snapshot > "$OUT_DIR/${safe_name}.snapshot.txt"
  "$PWCLI" --session "$SESSION" eval "JSON.stringify({ path: location.pathname + location.search, title: document.title, bodyText: document.body.innerText.slice(0, 500) })" > "$OUT_DIR/${safe_name}.page.json"
done

"$PWCLI" --session "$SESSION" close >/dev/null || true

echo "Playwright critical-flow artifacts written to $OUT_DIR"
