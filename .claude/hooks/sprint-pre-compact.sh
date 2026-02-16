#!/bin/bash
# PreCompact hook: Save active Sprint state before compaction
# Sprint 진행 중 auto-compaction 발생 시 상태를 recovery 파일에 저장

INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd')

# Find the most recently modified sprint-log.md
SPRINT_LOG=$(find "$CWD/specs" -name "sprint-log.md" -type f -maxdepth 3 2>/dev/null | head -1)

if [ -z "$SPRINT_LOG" ]; then
  exit 0  # No active sprint
fi

FEATURE_DIR=$(dirname "$SPRINT_LOG")
FEATURE_NAME=$(basename "$FEATURE_DIR")
SPRINT_INPUT="$FEATURE_DIR/inputs/sprint-input.md"

# Extract sprint-input frontmatter (between --- markers)
FRONTMATTER=""
if [ -f "$SPRINT_INPUT" ]; then
  FRONTMATTER=$(sed -n '/^---$/,/^---$/p' "$SPRINT_INPUT" 2>/dev/null)
fi

# Read sprint-log
LOG_CONTENT=$(cat "$SPRINT_LOG" 2>/dev/null)

# Save recovery file
RECOVERY_FILE="$CWD/.claude/sprint-recovery.json"
jq -n \
  --arg feature "$FEATURE_NAME" \
  --arg log "$LOG_CONTENT" \
  --arg input "$FRONTMATTER" \
  --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '{
    feature_name: $feature,
    saved_at: $ts,
    sprint_log: $log,
    sprint_input_frontmatter: $input
  }' > "$RECOVERY_FILE"

exit 0
