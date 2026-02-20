---
description: "Multi-agent parallel task execution via Native Teams + Git Worktree"
---

# /parallel — Multi-Agent Parallel Execution

> **Dispatch Target**: Native Teams `@worker` agents

## Purpose

Execute tasks in parallel using Native Teams + Git Worktree + gh CLI.

## When to Use

After Specs + Deliverables generation is complete. Run after JP2 approval.

## Inputs

`$ARGUMENTS`: not used

Parameters (when invoked from auto-sprint):
- `specs_root`: Base directory for specs files. Default: `specs/{feature}/`. After Crystallize: `specs/{feature}/reconciled/`.

Prerequisites:
- `{specs_root}/tasks.md` exists
- `{specs_root}/brownfield-context.md` exists (or `{specs_root}/planning-artifacts/brownfield-context.md` for reconciled/)
- File Ownership assignment complete
- Interface contracts (shared types) defined

**Path resolution**: All specs file references in this command use `{specs_root}` as base path. When `specs_root` is not provided, default to `specs/{feature}/`.

## Procedure

Load config per Language Protocol in bmad-sprint-guide.md.

### Step 1: Interface Contract Creation
Create shared types/interfaces first (referenced by all Workers):
- Extract interface contracts from tasks.md
- Generate shared type files (e.g., `src/types.ts`)
- This step is not parallelized

### Step 2: GitHub Issues Creation (gh CLI)
Create each task as a GitHub Issue via gh CLI (`gh issue create`):
```
Each Task → GitHub Issue
- Title: Task description
- Body: owned files, interfaces, dependencies, Entropy level
- Labels: entropy-high / entropy-medium / entropy-low
```

### Step 3: Git Worktree Setup
Create per-task Git Worktrees to prevent file conflicts at the source:
```bash
# Create independent worktree per task
git worktree add ../worktree-{task-id} -b task/{task-id}
```
- Assign each Worker an independent worktree
- Branch from main branch

### Step 4: Native Teams Worker Creation
Create Worker agents via Claude Code Native Teams:
1. Create team via TeamCreate
2. Create each Worker via Task tool (`subagent_type: "worker"`, `model: "sonnet"`)
3. Create tasks via TaskCreate, assign via TaskUpdate
4. Instruct each Worker to reference `{specs_root}/brownfield-context.md` (or `{specs_root}/planning-artifacts/brownfield-context.md` for reconciled/):
   - Follow existing code patterns/conventions (based on configured client-docs MCP)
   - Maintain compatibility when extending existing APIs (based on configured backend-docs MCP)
   - Verify alignment with existing customer journey flows (based on configured svc-map MCP)

### Step 5: Parallel Execution Monitoring
- Each Worker executes its task
- API tasks: Worker self-verifies via Specmatic before completion
- On Worker completion → handoff via SendMessage
- Close Issue via `gh issue close`

#### Worker Failure Protocol
- **Worker crash/timeout**: Mark task as FAILED.
  Other Workers with independent tasks continue.
  Workers dependent on FAILED Worker wait.
- **Failure persists after 2 retries**: Report to user + offer partial merge option with remaining Worker results.
- **Blocker report**: When Worker reports blocker via SendMessage, team lead reassigns to another Worker or escalates to user.

### Step 6: Merge & Integration
After all Workers complete:
1. Merge each worktree's changes into main branch in dependency order
2. Run integration tests
3. On conflict → apply Merge Conflict Resolution Protocol
4. Report merge results to user + confirm whether to auto-run `/validate` (in {communication_language})
   - **Auto-proceed** → run `/validate`
   - **Manual** → user runs `/validate` themselves

### Merge Conflict Resolution Protocol
1. **Shared type file conflicts**: Should not occur since pre-created in Step 1.
   If it does → adopt the version that matches api-spec.yaml.
2. **package.json conflicts**: Merge dependencies as union.
3. **Business logic file conflicts**: File Ownership violation. Request fix from responsible Worker.
4. **Unresolvable conflicts**: Report to user + present relevant diff.

## Constraints
Use the following format for Worker handoffs:
```markdown
## Handoff: Worker-N → Worker-M

### Goal
[What was achieved]

### Changes
- [file]: [change description]

### Open Questions
- [unresolved issues]

### Next Owner
Worker-M — [next task description]
```
