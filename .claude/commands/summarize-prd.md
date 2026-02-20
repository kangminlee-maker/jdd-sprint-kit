---
name: summarize-prd
description: 'Summarize and analyze a PRD document, collect feedback, and edit the original PRD. Use the analyze subcommand for PRD analysis. Pass the project folder name as an argument.'
---

# /summarize-prd — PRD Summary, Analysis & Edit

> **Dispatch Target**: None (direct CLI execution, no sub-agent delegation)

## Purpose

Summarize and analyze PRD documents in `prd/`, then **directly edit the original PRD file** based on user feedback.

## When to Use

When you need to summarize, analyze, or edit a PRD document.

## Inputs

Parse `$ARGUMENTS`:
- `$ARGUMENTS[0]`: project-name or `help`
- `$ARGUMENTS[1]`: optional `analyze`

Formats:
- `<project-name>` → Default Mode (summary → feedback → edit original)
- `<project-name> analyze` → Analyze Mode (summary + PRD analysis → feedback → edit original)
- `help` → Help Mode (usage instructions)

If argument is `help` → **Help Mode**. If last argument is `analyze` → **Analyze Mode**. Otherwise → **Default Mode**.

## Procedure

Load config per Language Protocol in jdd-sprint-guide.md.

### Help Mode

If argument is `help`, output the following (in {communication_language}) and exit.

```
/summarize-prd Usage

Summarize a PRD document, collect feedback, and edit the original PRD.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Usage:
  /summarize-prd <project-name>           Default mode
  /summarize-prd <project-name> analyze   Analyze mode
  /summarize-prd help                     This help

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Default Mode
  Summarize the PRD, then collect feedback to directly edit the original PRD.

  Flow: Select PRD → Summary output → Feedback → Edit original → Repeat → Done

  Example:
    /summarize-prd trial-lesson-flow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analyze Mode (analyze)
  Outputs a PRD analysis report in addition to the summary.
  Auto-reviews internal conflicts, ambiguous definitions, missing edge cases, etc.

  Analysis items:
    1. Internal conflicts     - Contradictory content between sections
    2. Ambiguous definitions  - Vague expressions like TBD, "appropriate"
    3. Missing edge cases     - Unhandled error/state combinations
    4. Success metric issues  - Unmeasurable metrics
    5. Priority/dependency    - P0 depending on P1, etc.
    6. Technical risks        - Concurrency, API design gaps, etc.

  Severity: CRITICAL | WARNING | INFO

  Example:
    /summarize-prd trial-lesson-flow analyze

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Feedback Loop (shared by Default/Analyze)
  After summary (+analysis) output, your feedback directly edits the original PRD.
  A preview is shown before applying changes, requiring your approval.
  Enter "done" to finish.

  Feedback examples:
    - "Fix the conflict issue #1 from the analysis report"
    - "Add DAU metric to success metrics"
    - "Change the error message in FR17"
    - "Make the reservation failure UX policy more specific"
```

### Common Steps

#### 1. Verify Project Folder

If project folder name is empty, list projects in `prd/` and ask for selection (in {communication_language}).

Verify that `prd/<project-name>/` folder exists. If not, list projects in `prd/` and guide to the correct name (in {communication_language}).

#### 2. Select PRD File

List all `.md` files in the folder and **confirm which file is the latest PRD** (in {communication_language}).

#### 3. Read and Summarize PRD

Read the user-specified file and summarize with the following structure (in {document_output_language}):

```markdown
# [Project Name] PRD Summary

## One-Line Summary
[Core purpose of the project in one sentence]

## Background & Intent
- Why this project is needed
- Core problem being solved

## Key Features (by priority)

### MVP (P0)
- Feature 1: description
- Feature 2: description

### MVP (P1)
- Feature 3: description

### Growth Phase
- Feature 4: description

## Success Metrics
| Metric | Current | Target |
|--------|---------|--------|
| Metric name | Current value | Target value |

## Technical Considerations
- Key technical issues or constraints

## MVP Scope vs Follow-up
- What's included in MVP / what's excluded (summary)
```

### Default Mode

After summary output, enter **Feedback Loop** immediately.

### Analyze Mode

After summary output, **output PRD analysis report** then enter Feedback Loop.

#### Analysis Report Writing

Thoroughly review the full PRD and find issues per category. Mark categories with no issues as "No issues found."

```markdown
# PRD Analysis Report

## 1. Internal Conflicts
Find contradictory or conflicting content within the document.
- Section A says X, but Section B says Y
- Numbers/conditions differ across sections
- Priorities stated differently across sections

Example:
> WARNING: **[Conflict]** Executive Summary says "reservation period +2 days", but
> FR4-1 says "3 days including today". Same policy but confusing expression.
> Location: Executive Summary vs FR4-1

## 2. Ambiguous or Unclear Definitions
Find vague expressions that make development/QA judgment difficult.
- Unclear expressions like "appropriate", "as needed", "etc."
- Requirements missing specific values/conditions
- Items remaining as TBD

Example:
> WARNING: **[Ambiguous]** FR3 says "specific image assets require further discussion (TBD)".
> Must be finalized before development starts.
> Location: FR3

## 3. Missing Edge Cases / Omitted Scenarios
Find unhandled cases in documented flows.
- Missing error/failure scenarios
- Unaddressed user state combinations
- Concurrency/timing issues

Example:
> WARNING: **[Missing]** When network disconnects right after reservation completion,
> server sees success but client perceives failure — this case is not in test scenarios.
> Location: QA Considerations > Test Scenarios

## 4. Success Metrics / Measurability Issues
Review realism of target numbers and specificity of measurement methods.
- Metrics with unclear measurement methods
- Metrics lacking current values to judge achievement
- Misaligned causal relationships between metrics

## 5. Priority / Dependency Issues
Find problems with feature dependencies or priority placement.
- P0 feature depending on P1 feature
- Growth Phase features conflicting with MVP features
- Features that should come first but are placed later

## 6. Technical Risks
Find implementation concerns.
- Inadequate concurrency/race condition handling
- Gap between performance targets and feature complexity
- Missing parts of API design

## Summary

| Severity | Count | Key Issues |
|----------|-------|------------|
| CRITICAL (must fix) | N | ... |
| WARNING (recommend fix) | N | ... |
| INFO (can improve) | N | ... |
```

### Feedback Loop

#### 5. Request Feedback

After summary (+ analysis report in Analyze Mode) output, request feedback for editing the original PRD (in {communication_language}).

```
---
If there are parts to modify/improve in the original PRD, please provide feedback.
If none, enter "done".

Examples:
- "Fix the conflict issue #1 from the analysis report"
- "Success metrics are missing DAU. Add it."
- "Reservation failure UX policy is vague. Make it specific."
- "Change the error message in FR17 requirement."
```

#### 6. Edit Original PRD

When user provides feedback:

1. **Find the relevant section in the original PRD file.**
   - Read the original PRD file selected in step 2 to locate the edit target.

2. **Show edit preview** (in {communication_language}):
   ```
   Edit target: prd/<project-name>/<filename>

   Changes:
   - (before) ...
   + (after) ...

   Apply these changes?
   ```

3. **Edit the original file after user approval.**
   - On approval: edit the original PRD file using the Edit tool.
   - On rejection: collect additional feedback on the edit direction.

4. **Request feedback again after edit** (in {communication_language}):
   ```
   ---
   Original PRD has been updated.
   If there are more parts to modify, please provide feedback. If none, enter "done".
   ```

Repeat this process until user enters "done".

#### 7. Completion

Output (in {communication_language}):
```
PRD editing complete.
Modified file: prd/<project-name>/<filename>
```

## Outputs

- Modified PRD file: `prd/<project-name>/<filename>`

## Constraints

1. **Always cite evidence.** Specify the exact location in the original PRD (section name, FR number, table, etc.) with a `Location:` marker.
2. **Classify severity.**
   - CRITICAL: Conflicts/omissions that must be resolved before development
   - WARNING: Should fix, but development can proceed
   - INFO: Suggestions for quality improvement
3. **Provide fix suggestions.** Don't just point out problems — concretely suggest how to fix them.
4. **Don't force issues.** Mark categories with genuinely no problems as "No issues found."

$ARGUMENTS
