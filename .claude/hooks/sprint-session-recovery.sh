#!/bin/bash
# SessionStart(compact) hook: Reinject Sprint state after compaction
# Compaction 후 Sprint 상태를 additionalContext로 복원

INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd')
RECOVERY_FILE="$CWD/.claude/sprint-recovery.json"

if [ ! -f "$RECOVERY_FILE" ]; then
  exit 0  # No recovery data
fi

FEATURE=$(jq -r '.feature_name' "$RECOVERY_FILE")
SAVED_AT=$(jq -r '.saved_at' "$RECOVERY_FILE")
SPRINT_LOG=$(jq -r '.sprint_log' "$RECOVERY_FILE")
SPRINT_INPUT=$(jq -r '.sprint_input_frontmatter' "$RECOVERY_FILE")

CONTEXT="[Sprint Recovery — saved at ${SAVED_AT}]
Active Sprint: ${FEATURE}

Sprint Input (frontmatter):
${SPRINT_INPUT}

Sprint Log:
${SPRINT_LOG}"

jq -n --arg ctx "$CONTEXT" '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: $ctx
  }
}'
exit 0
