#!/bin/bash
# PreToolUse(Write|Edit) hook: Block writes to read-only paths
# Sprint 원본 입력 파일과 BMad 설정 파일을 보호

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Protected patterns
case "$FILE_PATH" in
  */specs/*/inputs/*)
    # Extract feature dir from path: specs/{feature}/inputs/...
    FEATURE_DIR=$(echo "$FILE_PATH" | sed -n 's|.*/specs/\([^/]*\)/inputs/.*|\1|p')
    SPRINT_INPUT="specs/${FEATURE_DIR}/inputs/sprint-input.md"
    # Allow writes before Phase 0 completes (sprint-input.md not yet generated)
    if [ -n "$FEATURE_DIR" ] && [ -f "$SPRINT_INPUT" ]; then
      jq -n '{
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: "specs/*/inputs/ is read-only after Phase 0. sprint-input.md already exists."
        }
      }'
      exit 0
    fi
    ;;
  */_bmad/_config/*)
    jq -n '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "_bmad/_config/ is read-only. Agent manifest and config must not be modified during Sprint."
      }
    }'
    exit 0
    ;;
esac

exit 0
