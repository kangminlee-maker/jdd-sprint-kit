# CLAUDE.md — JDD Sprint Kit

## Project Overview

JDD Sprint Kit — a BMad Method execution extension that automates AI-driven product development sprints with Judgment Points. It provides a CLI (`jdd-sprint-kit init/update/compat-check`) and Claude Code agents/commands/rules for running the Sprint, Guided, and Direct routes.

## Tech Stack

<!-- auto:tech-stack -->
- Programming Language: JavaScript (ESM, Node.js >=18), Python (scripts only)
- Framework: CLI toolkit (commander, @clack/prompts, fs-extra)
- Package Manager: npm
<!-- /auto:tech-stack -->

## Verification Loop

<!-- auto:verify -->
After every change: `node bin/cli.js --help` (smoke test — no test/lint scripts defined yet).
Before PR: `node scripts/build-templates.js` (prepublishOnly).
<!-- /auto:verify -->

## Code Style

Follow `@.claude/rules/coding-conventions.md` for all code.

## Project Patterns

Follow `@.claude/rules/project-patterns.md` for file naming, conventions, and terminology.

## Plan Mode — Design Protocol

Every non-trivial task starts in plan mode. Complete all 4 steps before switching to auto-accept.

**Step 1 — Scope Lock**
- In scope: concrete outcomes this change delivers
- Out of scope: anything else (tag Phase 2 if worth revisiting)
- Affected surface: which existing files/modules are touched
- Never expand scope mid-design

**Step 2 — Contracts First**
Define before writing any implementation:
- Input/output types: exact signatures for every public function/endpoint
- State transitions: all states, triggers, and illegal transitions
- Error cases: every failure mode with its type
- Invariants: conditions that must always hold

**Step 3 — Pre-mortem**
Answer explicitly before finalizing:
1. "If this fails in production, what breaks first?"
2. "What system state does this design not handle?"
3. "What assumption about existing code might be wrong?"
→ Any gap found → revise Step 2 contracts first

**Step 4 — Simplicity Gate**
- Remove any abstraction layer that isn't required for correctness
- Every new file/type/function must trace to a Step 1 requirement
- Plan must be understandable in <5 minutes by a new reader

**Transition**: If Claude can't 1-shot the implementation from this plan, the plan isn't done. Return to plan mode.

## Parallel Work

Subagents for clean context windows. One agent per file. For parallel streams: `git worktree add .claude/worktrees/<n> origin/main`

## Prohibitions

- No skipped error handling
- No commits without tests
- No breaking API changes without discussion
- No scope expansion beyond Step 1 lock
- No implementation with unresolved pre-mortem gaps
- No abstractions without concrete in-scope justification

## Self-Improvement

After every correction → update this file with a prevention rule.
