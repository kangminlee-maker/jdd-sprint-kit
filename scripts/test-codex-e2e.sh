#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

FEATURE="tutor-exclusion-test2"
BASE_BRANCH="main"
REPORT_PATH=""
RUN_PREVIEW_BUILD=true

usage() {
  cat <<'EOF'
Usage:
  bash scripts/test-codex-e2e.sh [--feature <name>] [--base-branch <branch>] [--report <path>] [--skip-preview-build]

Examples:
  bash scripts/test-codex-e2e.sh
  bash scripts/test-codex-e2e.sh --feature tutor-exclusion-test2
  bash scripts/test-codex-e2e.sh --feature my-feature --report specs/my-feature/codex-e2e-report.md
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --feature)
      FEATURE="${2:-}"
      shift 2
      ;;
    --base-branch)
      BASE_BRANCH="${2:-}"
      shift 2
      ;;
    --report)
      REPORT_PATH="${2:-}"
      shift 2
      ;;
    --skip-preview-build)
      RUN_PREVIEW_BUILD=false
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 2
      ;;
  esac
done

if [[ -z "$REPORT_PATH" ]]; then
  REPORT_PATH="$PROJECT_ROOT/specs/$FEATURE/codex-e2e-report.md"
fi

mkdir -p "$(dirname "$REPORT_PATH")"

NOW_UTC="$(date -u '+%Y-%m-%d %H:%M:%S UTC')"
CURRENT_BRANCH="$(git -C "$PROJECT_ROOT" branch --show-current || true)"
DIRTY_COUNT="$(git -C "$PROJECT_ROOT" status --porcelain | wc -l | tr -d ' ')"

if [[ -x "$PROJECT_ROOT/.venv/bin/python" ]]; then
  PYTHON_BIN="$PROJECT_ROOT/.venv/bin/python"
else
  PYTHON_BIN="$(command -v python3 || true)"
fi

if [[ -z "$PYTHON_BIN" ]]; then
  echo "python3 not found and .venv/bin/python missing" >&2
  exit 1
fi

PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0
RESULT_ROWS=""

run_check() {
  local id="$1"
  local scope="$2"
  local command="$3"

  local output_file
  output_file="$(mktemp)"
  trap 'rm -f "$output_file"' RETURN
  local status="PASS"
  local detail=""

  if (cd "$PROJECT_ROOT" && bash -lc "$command") >"$output_file" 2>&1; then
    PASS_COUNT=$((PASS_COUNT + 1))
    detail="ok"
  else
    status="FAIL"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    detail="$(tail -n 2 "$output_file" | tr '\n' ' ' | sed 's/[[:space:]]\+/ /g' | sed 's/|/\\|/g')"
    [[ -z "$detail" ]] && detail="command failed"
  fi

  RESULT_ROWS="${RESULT_ROWS}| ${id} | ${scope} | ${status} | ${detail} |\n"
  rm -f "$output_file"
  trap - RETURN
}

run_skip() {
  local id="$1"
  local scope="$2"
  local reason="$3"
  SKIP_COUNT=$((SKIP_COUNT + 1))
  RESULT_ROWS="${RESULT_ROWS}| ${id} | ${scope} | SKIP | ${reason} |\n"
}

run_check "P0-1" "Toolchain present" "command -v git >/dev/null && command -v node >/dev/null && command -v npm >/dev/null && command -v python3 >/dev/null"
run_check "P0-2" "Core files present" "test -f AGENTS.md && test -f .codex/config.toml.example && test -f scripts/parallel-orchestrator.py"
run_check "P0-3" "Feature specs present" "test -f specs/$FEATURE/tasks.md && test -f specs/$FEATURE/brownfield-context.md"
run_check "P0-4" "Python env usable" "\"$PYTHON_BIN\" -c 'import sys; print(sys.version_info.major >= 3)' | grep -q True"

run_check "P1-1" "Skills count" "test \"\$(find .agents/skills -name SKILL.md | wc -l | tr -d \" \")\" -ge 60"
run_check "P1-2" "Skills frontmatter" "\"$PYTHON_BIN\" scripts/validate-skills-frontmatter.py"
run_check "P1-3" "Orchestrator help" "\"$PYTHON_BIN\" scripts/parallel-orchestrator.py --help >/dev/null"
run_check "P1-4" "Orchestrator dry-run" "\"$PYTHON_BIN\" scripts/parallel-orchestrator.py --feature \"$FEATURE\" --base-branch \"$BASE_BRANCH\" --dry-run >/dev/null"

if [[ "$RUN_PREVIEW_BUILD" == true ]]; then
  if [[ -f "$PROJECT_ROOT/specs/$FEATURE/preview/package.json" ]]; then
    run_check "P1-5" "Preview build" "cd specs/$FEATURE/preview && npm run build >/dev/null && rm -rf dist tsconfig.tsbuildinfo"
  else
    run_skip "P1-5" "Preview build" "specs/$FEATURE/preview/package.json not found"
  fi
else
  run_skip "P1-5" "Preview build" "--skip-preview-build used"
fi

run_check "P2-1" "OPENAI_API_KEY via env/.env" "test -n \"\${OPENAI_API_KEY:-}\" || (test -f .env && rg -q 'OPENAI_API_KEY' .env)"
run_check "P2-2" "Orchestrator key check message" "OPENAI_API_KEY= \"$PYTHON_BIN\" scripts/parallel-orchestrator.py --feature \"$FEATURE\" 2>&1 | rg -q 'OPENAI_API_KEY is required|project \\.env'"
run_skip "P3-1" "Interactive codex command flow" "Run manually in Codex session: \$specs -> \$preview -> \$parallel -> \$validate"

OVERALL="PASS"
if [[ "$FAIL_COUNT" -gt 0 ]]; then
  OVERALL="FAIL"
fi

cat > "$REPORT_PATH" <<EOF
# Codex E2E Report

- Time: $NOW_UTC
- Feature: $FEATURE
- Base branch: $BASE_BRANCH
- Current branch: $CURRENT_BRANCH
- Dirty files before run: $DIRTY_COUNT
- Overall: **$OVERALL**
- Summary: PASS=$PASS_COUNT, FAIL=$FAIL_COUNT, SKIP=$SKIP_COUNT

## Checks
| ID | Scope | Result | Detail |
|---|---|---|---|
$(printf "%b" "$RESULT_ROWS")

## Manual Follow-up
- Run in Codex CLI session: \`\$specs $FEATURE\` -> \`\$preview $FEATURE\` -> \`\$parallel $FEATURE\` -> \`\$validate $FEATURE\`
- Record final outcome in this file after manual run.
EOF

echo "Report written: $REPORT_PATH"
echo "Overall: $OVERALL (PASS=$PASS_COUNT, FAIL=$FAIL_COUNT, SKIP=$SKIP_COUNT)"

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  exit 1
fi
