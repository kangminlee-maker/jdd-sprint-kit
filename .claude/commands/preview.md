---
description: "Generate Full-stack Deliverables from Specs (OpenAPI, DBML, BDD, Prototype)"
---

# /preview — Deliverables Generation

> **Dispatch Target**: `@deliverable-generator` (deliverables-only)

## Purpose

Generate Full-stack Deliverables (OpenAPI, DBML, BDD, Prototype, etc.) from Specs 4-file.

## When to Use

After Specs 4-file generation is complete. The step after `/specs`.

## Inputs

`$ARGUMENTS`: not used

Required files (in `specs/{feature}/` directory):
- `requirements.md`
- `design.md`
- `tasks.md`
- `brownfield-context.md`

## Procedure

Load config per Language Protocol in bmad-sprint-guide.md.

### Step 1: Specs Verification

1. Search for feature directory under `specs/`
2. Verify Specs 4-file existence (requirements.md, design.md, tasks.md, brownfield-context.md)
3. Verify `specs/{feature}/planning-artifacts/` exists (for Entity Dictionary rebuild)
4. If missing, guide user to run `/specs` first (in {communication_language})

### Step 2: Deliverables Generation

Invoke `@deliverable-generator` in deliverables-only mode:

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "You are @deliverable-generator. Read and follow your agent definition at .claude/agents/deliverable-generator.md.
    Generate deliverables in deliverables-only mode.
    planning_artifacts: specs/{feature}/planning-artifacts/
    feature_name: {feature-name}
    output_base: specs/
    preview_template: preview-template/
    mode: deliverables-only"
```

This mode reads existing Specs 4-file and executes Stages 3-10:
- OpenAPI 3.1 YAML (API contract)
- API Sequence Diagrams (Mermaid)
- DBML Schema (database)
- BDD/Gherkin Scenarios (acceptance tests)
- XState State Machines (when applicable)
- Decision Log (ADR)
- Traceability Matrix (tracing)
- React Prototype + MSW Mock API

### Step 3: Output Review

Initialize `specs/{feature}/decision-diary.md` if it does not exist (with route metadata: `route: guided` or `route: direct`).

Present generated Sprint Output Package to user for review (in {communication_language}):

| Option | Label | Description |
|--------|-------|-------------|
| **A** | Approve | Proceed to `/parallel` (parallel implementation) |
| **S** | Crystallize | Reconcile all documents to match prototype, then proceed to execution |
| **F1** | Feedback (Deliverables) | Re-run Step 2 (Specs preserved) |
| **F2** | Feedback (design) | Re-run `/specs` (modify Planning Artifacts) |
| **X** | Abort | Exit (artifacts preserved) |

**On feedback (F1/F2)**: Record feedback to `specs/{feature}/decision-diary.md` Decisions table (Type, Content, Processing, Result) before re-running.

**On [S] Crystallize**: Record selection in decision-diary.md → invoke `/crystallize {feature}`.

**Iteration limit**: F1/F2 selections combined max 5 times. On exceed, warn (in {communication_language}): "5 review/edit rounds complete. Select [A] Approve, [S] Crystallize, or [X] Abort."

## Outputs
- `specs/{feature-name}/api-spec.yaml`
- `specs/{feature-name}/api-sequences.md`
- `specs/{feature-name}/schema.dbml`
- `specs/{feature-name}/bdd-scenarios/`
- `specs/{feature-name}/decision-log.md`
- `specs/{feature-name}/traceability-matrix.md`
- `specs/{feature-name}/preview/` (React + MSW)

## Constraints
1. **Disposable Preview**: Preview code is fully isolated from production. Never migrate to production.
2. **Specs first**: Issues found in preview are resolved by fixing specs, not code.
3. **OpenAPI as Single Source of Truth**: API types, Mock server, and docs all derive from one spec.
4. **Entity Dictionary consistency**: All artifact naming follows the Entity Dictionary.
