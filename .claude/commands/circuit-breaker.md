---
description: "Systematic course correction on repeated VALIDATE failures"
---

# /circuit-breaker — Course Correction

> **Dispatch Target**: Conditional — Auto Sprint → Phase 1 re-run / Non-Auto → `/bmad/bmm/workflows/correct-course`

## Purpose

Systematically correct course when VALIDATE failures repeat or critical issues are discovered.

## When to Use

### Auto-Trigger
- 3 consecutive VALIDATE failures in the same category
- 5 cumulative VALIDATE failures
- Architecture-level design flaw discovered

### Manual Trigger
- User or agent runs `/circuit-breaker`

`$ARGUMENTS`: not used

## Procedure

Load config per Language Protocol in jdd-sprint-guide.md.

### Step 1: Failure Context Summary (Context Compaction)
Summarize current work state and append to `specs/{feature}/planning-artifacts/circuit-breaker-log.md`:
```markdown
## Circuit Breaker Context — {timestamp}

### What Was Attempted
- [What approaches were tried]

### Failure Causes
- [Why they failed]

### Partial Successes
- [What parts succeeded]

### Learnings
- [What was learned from this attempt]
```

On re-run, pass this file as input to the relevant phase agent:
"Previous attempt encountered the following issues: {see circuit-breaker-log.md}"

### Step 2: Severity Assessment

Assess severity by referencing `failure_source` from Judge or Scope Gate results:

**Minor issues (resolvable within Execute) — `failure_source: local`:**
- Task implementation difficulties
- Repeated test failures
- Code quality shortfalls

→ Fix specs → re-run Execute

**Major issues (design-level) — `failure_source: upstream:{stage}`:**
- Architecture-level design flaws (`upstream:architecture`)
- PRD requirements contradictions (`upstream:prd`)
- Tech stack change needed (`upstream:architecture`)

→ Auto Sprint: re-run from cause stage ({stage}) with failure learnings
→ Non-Auto Sprint: run BMad `/bmad/bmm/workflows/correct-course`

**When failure_source is absent**: Use existing classification (implementation difficulty = minor, design flaw = major)

### Step 3: Code Disposal (Disposable Code)
```
Preserved:                    Disposed:
─────                         ─────
BMad PRD                      All generated code
BMad Architecture + ADR       Worktrees
BMad Epic/Story               Build artifacts
specs/ (after fixes)
brownfield-context.md
Failure learning context
```

### Step 4: Recovery

**Minor → Execute re-run:**
1. Reflect failure learnings in Specs
2. Re-run Execute (PARALLEL → VALIDATE) with fixed Specs

**Major → Return to design phase:**

Auto Sprint mode:
1. Pass failure learning context to Phase 1
2. Re-run Auto Sprint Phase 1 (with failure learnings)

Non-Auto Sprint mode:
1. Present failure context summary to user (Step 1 result, in {communication_language})
2. Offer choices (in {communication_language}):
   a) `/bmad/bmm/workflows/correct-course` (BMad interactive correction)
      → Pass failure context (`circuit-breaker-log.md`) as workflow input
      → Change scope analysis → PRD/Architecture impact assessment → BMad artifact update
   b) Manually edit Planning Artifacts → re-run `/specs`
   c) Abort

## Constraints
Since specs — not code — are the asset, actual loss on Circuit Breaker trigger is minimized.
Even full code disposal preserves specs, keeping reimplementation cost low.
