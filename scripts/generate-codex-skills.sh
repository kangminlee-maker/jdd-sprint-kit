#!/usr/bin/env bash
# generate-codex-skills.sh
# Generates Codex CLI skill files (.agents/skills/{name}/SKILL.md) from BMad manifests.
# Reads agent-manifest.csv and workflow-manifest.csv from _bmad/_config/
# Also creates core task skills manually.

set -euo pipefail

# Resolve project root (one level up from scripts/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

SKILLS_DIR="$PROJECT_ROOT/.agents/skills"
AGENT_MANIFEST="$PROJECT_ROOT/_bmad/_config/agent-manifest.csv"
WORKFLOW_MANIFEST="$PROJECT_ROOT/_bmad/_config/workflow-manifest.csv"

AGENT_COUNT=0
WORKFLOW_COUNT=0
TASK_COUNT=0
MANUAL_TASK_EXPECTED=2

# ---------------------------------------------------------------------------
# Helper: create a skill directory and write SKILL.md
# Usage: write_skill <skill-name> <content>
# ---------------------------------------------------------------------------
write_skill() {
  local skill_name="$1"
  local content="$2"
  local skill_dir="$SKILLS_DIR/$skill_name"

  mkdir -p "$skill_dir"
  printf '%s\n' "$content" > "$skill_dir/SKILL.md"
}

# ---------------------------------------------------------------------------
# Helper: truncate a string to N characters (at word boundary if possible)
# Usage: truncate_str <string> <max_len>
# ---------------------------------------------------------------------------
truncate_str() {
  local str="$1"
  local max_len="$2"
  if [ "${#str}" -le "$max_len" ]; then
    printf '%s' "$str"
    return
  fi
  # Cut at max_len then trim to last space
  local cut="${str:0:$max_len}"
  # Try to find last space
  if [[ "$cut" == *" "* ]]; then
    cut="${cut% *}"
  fi
  printf '%s' "$cut"
}

# ---------------------------------------------------------------------------
# Parse CSV field: handle quoted fields with commas and escaped quotes
# This uses a simple approach: read the full line, parse fields respecting quotes
# ---------------------------------------------------------------------------

# We use Python for reliable CSV parsing since bash CSV parsing is fragile
check_python() {
  if command -v python3 &>/dev/null; then
    echo "python3"
  elif command -v python &>/dev/null; then
    echo "python"
  else
    echo "ERROR: Python is required for CSV parsing" >&2
    exit 1
  fi
}

PYTHON="$(check_python)"

AGENT_EXPECTED="$("$PYTHON" -c "
import csv
with open('$AGENT_MANIFEST', 'r', encoding='utf-8') as f:
    print(sum(1 for _ in csv.DictReader(f)))
")"
WORKFLOW_EXPECTED="$("$PYTHON" -c "
import csv
with open('$WORKFLOW_MANIFEST', 'r', encoding='utf-8') as f:
    print(sum(1 for _ in csv.DictReader(f)))
")"

# ---------------------------------------------------------------------------
# 1. Generate Agent Skills
# ---------------------------------------------------------------------------
echo "=== Generating Agent Skills ==="

# Use Python to parse the CSV and emit tab-separated values we can read in bash
while IFS=$'\t' read -r name displayName role module path; do
  # Skip empty lines
  [ -z "$name" ] && continue

  skill_name="bmad-${module}-agent-${name}"
  desc_role="$(truncate_str "$role" 60)"
  description="${displayName} - ${desc_role}"

  content="---
name: ${skill_name}
description: \"${description}\"
---
You must fully embody this agent's persona and follow all activation instructions exactly as specified. NEVER break character until given an exit command.

<agent-activation>
1. LOAD the FULL agent file from ${path}
2. READ its entire contents — this contains the complete agent persona, menu, and instructions
3. Execute ALL activation steps exactly as written in the agent file
4. Follow the agent's persona and menu system precisely
5. Stay in character throughout the session
</agent-activation>"

  write_skill "$skill_name" "$content"
  echo "  Created: $skill_name"
  AGENT_COUNT=$((AGENT_COUNT + 1))

done < <("$PYTHON" -c "
import csv, sys
with open('$AGENT_MANIFEST', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        name = row['name'].strip()
        displayName = row['displayName'].strip()
        role = row['role'].strip()
        module = row['module'].strip()
        path = row['path'].strip()
        # Output tab-separated
        print(f'{name}\t{displayName}\t{role}\t{module}\t{path}')
")

echo "  Agents generated: $AGENT_COUNT"
echo ""

# ---------------------------------------------------------------------------
# 2. Generate Workflow Skills
# ---------------------------------------------------------------------------
echo "=== Generating Workflow Skills ==="

while IFS=$'\t' read -r name description module path; do
  [ -z "$name" ] && continue

  skill_name="bmad-${module}-workflow-${name}"
  desc_short="$(truncate_str "$description" 80)"

  content="---
name: ${skill_name}
description: \"${desc_short}\"
---
LOAD the FULL ${path},
READ its entire contents and follow its directions exactly!"

  write_skill "$skill_name" "$content"
  echo "  Created: $skill_name"
  WORKFLOW_COUNT=$((WORKFLOW_COUNT + 1))

done < <("$PYTHON" -c "
import csv, sys
with open('$WORKFLOW_MANIFEST', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        name = row['name'].strip()
        desc = row['description'].strip()
        module = row['module'].strip()
        path = row['path'].strip()
        print(f'{name}\t{desc}\t{module}\t{path}')
")

echo "  Workflows generated: $WORKFLOW_COUNT"
echo ""

# ---------------------------------------------------------------------------
# 3. Generate Core Task Skills (manual)
# ---------------------------------------------------------------------------
echo "=== Generating Core Task Skills ==="

# index-docs
skill_name="bmad-core-task-index-docs"
content='---
name: bmad-core-task-index-docs
description: "Generates or updates an index.md of all documents in the specified directory"
---
LOAD and execute the task at: _bmad/core/tasks/index-docs.xml

Follow all instructions in the task file exactly as written.'

write_skill "$skill_name" "$content"
echo "  Created: $skill_name"
TASK_COUNT=$((TASK_COUNT + 1))

# shard-doc
skill_name="bmad-core-task-shard-doc"
content='---
name: bmad-core-task-shard-doc
description: "Splits large markdown documents into smaller, organized files based on level 2 sections"
---
LOAD and execute the task at: _bmad/core/tasks/shard-doc.xml

Follow all instructions in the task file exactly as written.'

write_skill "$skill_name" "$content"
echo "  Created: $skill_name"
TASK_COUNT=$((TASK_COUNT + 1))

echo "  Tasks generated: $TASK_COUNT"
echo ""

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
TOTAL=$((AGENT_COUNT + WORKFLOW_COUNT + TASK_COUNT))
EXPECTED_TOTAL=$((AGENT_EXPECTED + WORKFLOW_EXPECTED + MANUAL_TASK_EXPECTED))
echo "=== Summary ==="
echo "  Agents:    $AGENT_COUNT"
echo "  Workflows: $WORKFLOW_COUNT"
echo "  Tasks:     $TASK_COUNT"
echo "  Total:     $TOTAL"
echo ""

if [ "$AGENT_COUNT" -eq "$AGENT_EXPECTED" ] && \
   [ "$WORKFLOW_COUNT" -eq "$WORKFLOW_EXPECTED" ] && \
   [ "$TASK_COUNT" -eq "$MANUAL_TASK_EXPECTED" ] && \
   [ "$TOTAL" -eq "$EXPECTED_TOTAL" ]; then
  echo "SUCCESS: Generated expected skills (agents=$AGENT_EXPECTED, workflows=$WORKFLOW_EXPECTED, tasks=$MANUAL_TASK_EXPECTED, total=$EXPECTED_TOTAL)."
else
  echo "WARNING: Skill generation mismatch."
  echo "  Expected: agents=$AGENT_EXPECTED, workflows=$WORKFLOW_EXPECTED, tasks=$MANUAL_TASK_EXPECTED, total=$EXPECTED_TOTAL"
  echo "  Actual:   agents=$AGENT_COUNT, workflows=$WORKFLOW_COUNT, tasks=$TASK_COUNT, total=$TOTAL"
fi
