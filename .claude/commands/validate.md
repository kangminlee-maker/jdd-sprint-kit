---
description: "Entropy-based 3-Phase verification pipeline (Auto + AI Judge + Visual)"
---

# /validate — Multi-Phase Verification Pipeline

> **Dispatch Target**: `@judge-quality` + `@judge-security` + `@judge-business` (parallel)

## Purpose

A multi-dimensional verification pipeline that adjusts verification density based on Entropy Tolerance.

## When to Use

After Worker implementation is complete. Run after PARALLEL completion + merge.

## Inputs

`$ARGUMENTS`: not used

Parameters (when invoked from auto-sprint):
- `specs_root`: Base directory for specs files. Default: `specs/{feature}/`. After Crystallize: `specs/{feature}/reconciled/`.

Prerequisites:
- PARALLEL complete: all Worker tasks done
- Code merged into main branch
- Build succeeds

**Path resolution**: All specs file references in this command use `{specs_root}` as base path. When `specs_root` is not provided, default to `specs/{feature}/`. This ensures Judges verify against reconciled artifacts when Crystallize was used.

## Procedure

Load config per Language Protocol in bmad-sprint-guide.md.

### Phase 1: Automated Verification (all tasks)
Applied to all Entropy levels:

```bash
npm run lint
npm run type-check
npm run test
npm run build
```

Phase 1 failure → request fix from file's owning Worker → re-run Phase 1 after fix

### Phase 2: AI Judge Verification (Medium + Low Entropy)
Run Judge agents in parallel. Pass each Judge:
- `changed_files`: result of `git diff --name-only {base_branch}...HEAD`
- `feature_dir`: `{specs_root}` (default: `specs/{feature}/`)
- `brownfield_path`: `{specs_root}/brownfield-context.md` (or `{specs_root}/planning-artifacts/brownfield-context.md` for reconciled/)

1. **Code Quality Judge** (`judge-quality`):
   - Code structure, patterns, duplication
   - Project convention compliance
   - **Existing codebase pattern compliance** (based on configured client-docs MCP)
   - Specmatic API contract final verification

2. **Security Judge** (`judge-security`):
   - OWASP Top 10 vulnerability check
   - Injection, XSS, auth bypass
   - **Consistency with existing auth/permission patterns** (based on configured backend-docs MCP)

3. **Business Logic Judge** (`judge-business`):
   - Implementation verification against BMad PRD acceptance criteria
   - Architecture ADR compliance
   - **Alignment with existing domain policies/customer journeys** (based on configured backend-docs, svc-map MCP)

**Low Entropy tasks**: Judges operate in Adversarial mode — thorough review, findings classified by severity:
- `CRITICAL`: Functional failure or security vulnerability. Must fix.
- `HIGH`: Design violation or performance issue. Must fix.
- `SUGGESTION`: Style, refactoring suggestions. Record only, does not block.

**Adversarial exit condition**: PASS when 0 new CRITICAL/HIGH findings. SUGGESTION-only means pass.

Judge invocation — **must invoke all 3 Tasks simultaneously in a single response**:
```
Task(subagent_type: "judge-quality", model: "sonnet")
  prompt: "Read .claude/agents/judge-quality.md and follow it.
    changed_files: {changed_files}
    feature_dir: specs/{feature}/
    brownfield_path: specs/{feature}/brownfield-context.md"

Task(subagent_type: "judge-security", model: "sonnet")
  prompt: "Read .claude/agents/judge-security.md and follow it.
    changed_files: {changed_files}
    feature_dir: specs/{feature}/
    brownfield_path: specs/{feature}/brownfield-context.md"

Task(subagent_type: "judge-business", model: "sonnet")
  prompt: "Read .claude/agents/judge-business.md and follow it.
    changed_files: {changed_files}
    feature_dir: specs/{feature}/
    brownfield_path: specs/{feature}/brownfield-context.md
    sprint_input_path: specs/{feature}/inputs/sprint-input.md"
```
→ Collect all 3 results
→ Critical finding present → FAIL
→ Classify each finding's `failure_source`:
  - `local`: Worker can fix (code bugs, test failures, etc.)
  - `upstream:architecture`: Architecture ADR violation, design mismatch
  - `upstream:prd`: PRD AC contradiction, requirements conflict
→ `local` findings → request Worker fix → re-run only affected Judge
→ `upstream` findings → forward to Circuit Breaker (include failure_source)

### Phase 3: Visual Verification (UI-related tasks)
Applied only to tasks with UI:
1. Visual regression check against BMad UX Design
2. **Change verification against existing service map screens** (configured svc-map MCP screenshots)
3. **Match verification against latest Figma design mockups** (`figma` MCP)
4. Responsive design check
5. Basic accessibility check

### Entropy-Based Phase Matrix

| Entropy | Phase 1 | Phase 2 | Phase 3 |
|---------|---------|---------|---------|
| High    | O       | -       | -       |
| Medium  | O       | O       | (if UI) |
| Low     | O       | O (Adversarial) | (if UI) |

## Constraints

### Fix Process
After `/parallel` completion, Workers are inactive. On verification failure, follow this procedure:
1. Judge generates failure report (file path + line number + severity + fix suggestion)
2. **Create new fix tasks** (TaskCreate) per failed task
3. Re-run small-scale `/parallel` for fix implementation
4. Re-run `/validate` for re-verification

### Retry Limits
- Max **5 iterations** of the above cycle
- Adversarial mode (Low Entropy): failure determined by CRITICAL/HIGH only. SUGGESTIONs do not count toward loop
- **5 cumulative failures** or **3 consecutive failures in same category** → Circuit Breaker auto-triggers
- On Circuit Breaker trigger → run `/circuit-breaker`

## Outputs
Verification result report:
```markdown
## VALIDATE Report: {feature}
- Phase 1 (Auto): PASS/FAIL — [details]
- Phase 2 (Judge): PASS/FAIL — [X critical, Y warnings]
  - Failure Sources: {N} local, {M} upstream
- Phase 3 (Visual): PASS/FAIL/SKIP
- **Overall: PASS/FAIL**
- **Upstream Issues** (if any):
  - {finding} → failure_source: upstream:{stage} → suggested_fix: {fix}
```
