#!/bin/bash
# Notification hook: Send desktop notification when Claude needs user input
# macOS only — JP1/JP2 대기 시 사용자에게 알림

if [[ "$(uname)" == "Darwin" ]]; then
  osascript -e 'display notification "Claude Code needs your attention" with title "JDD Sprint Kit"' 2>/dev/null
fi

exit 0
