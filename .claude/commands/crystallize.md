---
description: "Reconcile all artifacts from finalized prototype"
---

<!-- Quick Map
  Purpose: Finalized prototype → reconciled/ artifact set
  Dispatch: Runs directly (orchestrates BMad agents + @deliverable-generator)
  Inputs: $ARGUMENTS (feature-name)
  Key Steps: Precondition → Decision Context → Analyze → Reconcile Planning → Generate Specs → Reconcile Deliverables → Verify → Summary
  Route: All routes (Sprint, Guided, Direct)
-->

# /crystallize — Prototype-First Artifact Reconciliation

> **Dispatch**: Runs directly (orchestrates sub-agents sequentially)
> **Route**: All routes (Sprint, Guided, Direct)

## Purpose

After JP2 prototype iteration, reconcile all upstream artifacts to match the finalized prototype. Creates a `reconciled/` directory with the definitive artifact set for execution and long-term reference.

The prototype becomes the source of truth for product behavior. Existing artifacts are preserved untouched — reconciled versions are written to a separate directory.

## When to Use

- After iterating on a prototype at JP2 until it matches the desired product
- When documents need to accurately reflect the final product for execution (/parallel) and long-term reference (maintenance, handoff)
- Available on all routes: Sprint (`[S]` at JP2), Guided (`[S]` at `/preview` Step 3), Direct (`[S]` at `/preview` Step 3), or standalone (`/crystallize feature-name`)

**Note**: Within `/sprint` auto-sprint flow, Crystallize is triggered via [S] Crystallize menu option at JP2. Within `/preview`, it is triggered via [S] at Step 3. The standalone command is for cases where JP2 was completed with [C] but reconciliation is needed later.

## Inputs

`$ARGUMENTS`: feature-name (required)
- `/crystallize feature-name` — specify target feature

## Precondition Validation

Before starting the pipeline, verify:

1. `specs/{feature}/preview/` exists AND `src/` contains at least one `.tsx` file (Glob: `specs/{feature}/preview/src/**/*.tsx`)
2. `specs/{feature}/planning-artifacts/` exists with `prd.md`, `architecture.md`, `epics-and-stories.md` (all 3 required)
3. Decision records available (optional — enriches S0 context when present):
   - `specs/{feature}/decision-diary.md` OR `specs/{feature}/jp2-review-log.md` OR `specs/{feature}/sprint-log.md`
   - If none exist, S0 is skipped and S1 runs without decision context
4. If `specs/{feature}/reconciled/` already exists: prompt user — overwrite or abort

On validation failure: report missing items (in {communication_language}) and abort.

## Procedure

Load config per Language Protocol in jdd-sprint-guide.md.

### Step S0: Decision Context Analysis

Analyze JP2 decision records to understand the intent and context behind prototype modifications BEFORE analyzing the code. This enables S1 and S2 to distinguish deliberate business decisions from implementation details.

**Progress**: `"[S0/7] Analyzing JP2 decision context..."`

1. Create `specs/{feature}/reconciled/` directory and `reconciled/planning-artifacts/`
2. Copy immutable files:
   - `specs/{feature}/planning-artifacts/brownfield-context.md` → `reconciled/planning-artifacts/brownfield-context.md`
3. Copy decision records to reconciled/ (if exists):
   - `specs/{feature}/decision-diary.md` → `reconciled/decision-diary.md`
   - OR `specs/{feature}/jp2-review-log.md` → `reconciled/jp2-review-log.md` (fallback, serves equivalent role)
4. Read JP2 decision records:
   - Primary: `specs/{feature}/decision-diary.md` (if exists)
   - Fallback: `specs/{feature}/jp2-review-log.md` (if exists, serves equivalent role)
   - Also: `specs/{feature}/sprint-log.md` "JP Interactions" section (if exists)
5. Produce decision context summary (Conductor writes directly — lightweight synthesis, not a Task):

Write to `specs/{feature}/reconciled/decision-context.md`:

```markdown
# Decision Context: {feature_name}

## Route
{sprint / guided / direct} — {rich context / limited context}

## JP2 Modification Intent Summary
| # | Change | Intent | Business Decision | Affected Area |
|---|--------|--------|-------------------|---------------|

## Key Business Decisions
| ID | Decision | Rationale |
|----|----------|-----------|

## Context for Prototype Analysis
(Free-text summary: what to look for in the code, which changes are deliberate business decisions vs implementation adjustments)
```

If no decision records exist, skip this step and proceed to S1 without decision context. When decision records are minimal (Guided/Direct routes), S0 produces a lighter context document — prototype analysis (S1) carries more weight in this case.

### Step S1: Prototype Analysis

Analyze the finalized prototype code and produce a structured analysis document.

**Progress**: `"[S1/7] Analyzing prototype structure..."`

Invoke prototype analyzer:

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "Analyze the prototype at specs/{feature}/preview/src/.
    Use Glob to discover all .tsx and .ts files dynamically.
    Do NOT assume fixed file paths — discover them.

    Read every discovered file and extract a structured analysis.

    IMPORTANT: Write ALL output in {document_output_language}.

    {if decision-context.md exists}
    Decision context (read this FIRST to understand WHY changes were made):
      specs/{feature}/reconciled/decision-context.md
    Use this context to annotate business rules with their decision origin
    (e.g., 'Business Rule: 용어 변경 → D2 결정에 의한 의도적 선택').
    {end if}

    Output format — write to specs/{feature}/reconciled/prototype-analysis.md:

    # Prototype Analysis: {feature_name}

    ## Screen Inventory
    | Page | Route | Key Interactions | Data Dependencies |

    ## Component Inventory
    | Component | Props | Behavior | Used By |

    ## API Endpoint Inventory (from MSW handlers)
    | Method | Path | Request Schema | Response Schema | Business Rule |

    ## Data Model (from store + types)
    | Entity | Fields | Relationships | Constraints |

    ## User Flows (from navigation + page logic)
    1. {Flow Name}: step1 → step2 → ... → end_state

    Be exhaustive — every page, component, endpoint, entity, and flow must be captured."
```

### Step S2: Reconcile Planning Artifacts

Reconcile PRD, Architecture, and Epics using the prototype analysis as primary input and existing documents as context.

**Product Brief is excluded** — it defines the problem space, which the prototype cannot supply.

**Progress**: `"[S2/7] Reconciling PRD..."` → `"...Architecture..."` → `"...Epics..."` → `"...Cross-artifact validation..."`

#### Reconciliation Principles

- **From prototype**: screens, features, API endpoints, data model, user flows → FR, component structure, API design
- **Carry-forward from existing docs**: market context, competitive analysis, NFRs, security architecture, deployment strategy, scaling, monitoring, ADRs
- **Tagging**: Items not derivable from prototype use classified carry-forward tags:
  - `[carry-forward:defined]` — Fully specified in original docs, confirmed still applicable
  - `[carry-forward:deferred]` — Mentioned but explicitly deferred to post-MVP
  - `[carry-forward:new]` — Added during reconciliation to fill identified gaps
  - `[carry-forward]` — When classification is unclear (treated as `defined` by default)

#### Source Attribution Tags

| Tag | Meaning |
|-----|---------|
| `(source: PROTO, origin: BRIEF-N)` | Confirmed in prototype, originally from brief sentence N |
| `(source: PROTO, origin: DD-N)` | Confirmed in prototype, originated from decision-diary entry N |
| `(source: carry-forward, origin: BRIEF-N)` | Not in prototype, carried from existing doc, originally from brief |
| `(source: carry-forward)` | Not in prototype, carried from existing doc (NFR, security, etc.) |

#### S2a: PRD Reconciliation (John)

```
Task(subagent_type: "general-purpose", model: "opus")
  prompt: "You are John, Product Manager. Read your persona at _bmad/bmm/agents/pm.md.
    Read the PRD format guide at _bmad/docs/prd-format-guide.md.

    IMPORTANT: Write ALL output in {document_output_language}.

    MODE: CRYSTALLIZE — reconcile PRD with finalized prototype.

    Primary input (what the product actually does):
      specs/{feature}/reconciled/prototype-analysis.md

    Decision context (understand WHY changes were made):
      specs/{feature}/reconciled/decision-context.md (if exists)

    Context reference (for content the prototype cannot supply):
      specs/{feature}/planning-artifacts/prd.md
      specs/{feature}/inputs/sprint-input.md (for brief_sentences, if exists)

    Output: Write to specs/{feature}/reconciled/planning-artifacts/prd.md

    Reconciliation rules:
    - Every capability visible in prototype → document as FR with source tag
    - Map each FR to brief_sentences where possible: (source: PROTO, origin: BRIEF-N)
    - Features from JP2 iteration: (source: PROTO, origin: DD-N) referencing decision-diary/decision-context entry
    - NFRs, success criteria, constraints → carry forward: (source: carry-forward)
    - Classify carry-forward items: [carry-forward:defined] for confirmed applicable items, [carry-forward:deferred] for explicitly post-MVP items, [carry-forward:new] for gap-filling additions
    - User journeys: reconstruct from prototype User Flows section
    - Detail level: MAXIMUM — this is the definitive PRD
    - Follow PRD format guide strictly (YAML frontmatter, section structure, FR quality criteria)"
```

#### S2b: Architecture Reconciliation (Winston)

```
Task(subagent_type: "general-purpose", model: "opus")
  prompt: "You are Winston, Architect. Read your persona at _bmad/bmm/agents/architect.md.

    IMPORTANT: Write ALL output in {document_output_language}.

    MODE: CRYSTALLIZE — reconcile Architecture with finalized prototype.

    Primary input:
      specs/{feature}/reconciled/prototype-analysis.md
      specs/{feature}/reconciled/planning-artifacts/prd.md (just written by S2a)

    Decision context (understand WHY design decisions were made):
      specs/{feature}/reconciled/decision-context.md (if exists)

    Context reference:
      specs/{feature}/planning-artifacts/architecture.md
      specs/{feature}/planning-artifacts/brownfield-context.md
      specs/{feature}/decision-log.md (if exists)

    Output: Write to specs/{feature}/reconciled/planning-artifacts/architecture.md

    Reconciliation rules:
    - Component architecture: derive from actual prototype component structure
    - API design: derive from actual MSW handlers in prototype analysis
    - Data model: derive from actual store/types in prototype analysis
    - Security, deployment, scaling, monitoring, infrastructure → classify as [carry-forward:defined], [carry-forward:deferred], or [carry-forward:new]
    - ADRs: preserve still-applicable originals, mark superseded ones, add new decisions from prototype
    - Detail level: MAXIMUM"
```

#### S2c: Epics Reconciliation (John)

```
Task(subagent_type: "general-purpose", model: "opus")
  prompt: "You are John, Product Manager. Read your persona at _bmad/bmm/agents/pm.md.

    IMPORTANT: Write ALL output in {document_output_language}.

    MODE: CRYSTALLIZE — reconcile Epics with finalized prototype.

    Primary input:
      specs/{feature}/reconciled/planning-artifacts/prd.md
      specs/{feature}/reconciled/planning-artifacts/architecture.md
      specs/{feature}/reconciled/prototype-analysis.md (cross-reference)

    Context reference:
      specs/{feature}/planning-artifacts/epics-and-stories.md

    Output: Write to specs/{feature}/reconciled/planning-artifacts/epics-and-stories.md

    Reconciliation rules:
    - Stories should reflect actual prototype pages and features
    - AC should reference actual prototype component behavior
    - Maintain Epic → Story → AC hierarchy
    - Tag stories as new/existing-extension per brownfield context
    - Stories not visible in prototype (e.g., Growth Phase, security, monitoring): classify as [carry-forward:defined], [carry-forward:deferred], or [carry-forward:new]
    - Detail level: MAXIMUM"
```

#### S2-G: Cross-Artifact Consistency Gate

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "You are @scope-gate. Read your agent definition at .claude/agents/scope-gate.md.

    IMPORTANT: Write ALL output in {document_output_language}.

    Validate cross-artifact consistency of 3 reconciled planning artifacts:
    - specs/{feature}/reconciled/planning-artifacts/prd.md
    - specs/{feature}/reconciled/planning-artifacts/architecture.md
    - specs/{feature}/reconciled/planning-artifacts/epics-and-stories.md

    Cross-artifact checks:
    1. Every PRD FR maps to at least one Architecture component
    2. Every Architecture component maps to at least one Epic story
    3. Every PRD FR maps to at least one Epic story
    4. No orphan stories (stories without FR linkage)

    Output: PASS with summary, or FAIL with gap list."
```

**On S2-G FAIL**: Include gap report in retry prompt → re-invoke the agent responsible for the gap ("Fix these specific inconsistencies: {gap_list}") → retry once → 2nd failure: notify user with gap list + recommend manual review.

### Step S3: Generate Execution Specs

Generate Specs 4-file from reconciled planning artifacts.

**Progress**: `"[S3/7] Generating execution specs (requirements + design + tasks)..."`

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "You are @deliverable-generator. Read and follow your agent definition at .claude/agents/deliverable-generator.md.

    IMPORTANT: Write ALL output in {document_output_language}.

    Generate specs in specs-only mode.
    planning_artifacts: specs/{feature}/reconciled/planning-artifacts/
    prototype_analysis_path: specs/{feature}/reconciled/prototype-analysis.md
    feature_name: reconciled
    output_base: specs/{feature}/
    mode: specs-only

    NOTE: output_base is specs/{feature}/ and feature_name is 'reconciled',
    so output files will be written to specs/{feature}/reconciled/ directory."
```

**Post-S3: Entropy/File Ownership Re-annotation**

After specs generation:
1. Read existing `specs/{feature}/tasks.md` for Entropy Tolerance + File Ownership patterns
2. Map to new `reconciled/tasks.md` tasks:
   - Match by Story ID (E{N}-S{M}) first
   - Then by file path overlap
   - Unmapped new tasks: default Entropy "Medium", File Ownership unassigned
3. If unmapped tasks exist, report to user (in {communication_language})

**Scope Gate**: Invoke @scope-gate with `stage=spec` on reconciled/ specs.

### Step S4: Reconcile Deliverables

Verify existing deliverables against prototype. Regenerate where needed.

**Progress**: `"[S4/7] Verifying API spec..."` → `"...Regenerating BDD scenarios..."` → ...

Invoke deliverable reconciler:

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "Reconcile deliverables for specs/{feature}/reconciled/.

    IMPORTANT: Write ALL output in {document_output_language}.

    ## Verify Phase
    Compare existing deliverables against prototype and reconciled PRD:

    1. api-spec.yaml: Read specs/{feature}/api-spec.yaml. Compare endpoints against
       specs/{feature}/reconciled/prototype-analysis.md 'API Endpoint Inventory'.
       If endpoints match (count + paths): copy to reconciled/.
       If mismatch: regenerate from prototype-analysis + reconciled PRD.

    2. schema.dbml: Read specs/{feature}/schema.dbml. Compare against
       prototype-analysis.md 'Data Model'. Copy or regenerate.

    3. api-sequences.md: Read specs/{feature}/api-sequences.md. Compare against
       reconciled api-spec. Copy or regenerate.

    ## Regenerate Phase (always regenerate — source documents changed)

    4. bdd-scenarios/: Regenerate from specs/{feature}/reconciled/planning-artifacts/prd.md
       acceptance criteria. Write to reconciled/bdd-scenarios/.

    5. key-flows.md: Regenerate from prototype-analysis User Flows +
       reconciled PRD user journeys. Write to reconciled/key-flows.md.

    6. traceability-matrix.md: Rebuild FR → Design → Task → BDD → API from
       ALL reconciled/ artifacts. Target: 0 gaps. Use canonical task IDs from
       reconciled/tasks.md (T-01, T-02, etc.). Write to reconciled/traceability-matrix.md.

    7. decision-log.md: Read specs/{feature}/decision-log.md (original ADRs).
       Merge with JP decisions from reconciled/decision-context.md.
       Mark superseded ADRs. Write to reconciled/decision-log.md."
```

**Scope Gate**: Invoke @scope-gate with `stage=deliverables` on reconciled/ deliverables.

### Step S5: Cross-Artifact Consistency Check

Verify mutual consistency across the entire reconciled/ artifact set.

**Progress**: `"[S5/7] Cross-artifact consistency check..."`

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "Perform cross-artifact consistency verification on specs/{feature}/reconciled/.

    IMPORTANT: Write ALL output in {document_output_language}.

    Read ALL files in reconciled/ directory.
    Also read prototype MSW handlers (Glob: specs/{feature}/preview/src/mocks/**/*.ts).

    Verify:
    1. Every screen/component/API in prototype-analysis.md → has matching FR in prd.md
    2. Every FR in prd.md → reflected in requirements.md
    3. Every requirement in requirements.md → assigned in tasks.md
    4. traceability-matrix.md has 0 gaps
    5. api-spec.yaml endpoints match MSW handler endpoints (count + paths)
    6. bdd-scenarios/ cover all prd.md acceptance criteria

    Output: PASS (gap=0) or FAIL with gap list and count."
```

**On FAIL**:
- Gap <= 3: auto-fix (Edit affected files) → re-verify
- Gap > 3: present gap list to user → user selects: fix / skip / abort

### Step S6: Summary + Confirmation

Present reconciliation results to user (in {communication_language}).

**Progress**: `"[S6/7] Generating summary..."`

**Output format**:

```
## Crystallize Complete

### Key Flows from Prototype
(from prototype-analysis.md User Flows)
1. {Flow 1}: step → step → end
2. {Flow 2}: ...

### Flow-to-Artifact Mapping
| Key Flow | PRD FR | Design Section | Task | BDD Coverage | Status |
|----------|--------|---------------|------|-------------|--------|
| Flow 1   | FR1,2  | design §A     | T-1  | 3 scenarios | ✅     |

### Changes from Original
- Features confirmed from prototype: {N} (source: PROTO, origin: BRIEF-N)
- Features from JP2 iteration: {N} (source: PROTO, origin: DD-N)
- Carried forward from original: {N} (source: carry-forward)

### Verification
- Cross-artifact consistency: PASS (gap 0)
- Traceability coverage: {N}/{M} FRs fully traced

### reconciled/ created ({N} files)

Select: [C] Continue to /parallel | [R] Review reconciled/ | [X] Exit
```

**[C]**: Proceed to `/parallel` with `specs_root=specs/{feature}/reconciled/`
**[R]**: Show reconciled/ file list, allow user to read specific files, then return to menu
**[X]**: Exit (reconciled/ preserved)

## Budget

~85-125 turns across 9 Task invocations. Separate from JP2 iteration budget. S0 runs inline (no Task invocation).

| Step | Model | Est. Turns |
|------|-------|------------|
| S0 Decision Context | Conductor (inline) | 0 (no Task) |
| S1 Prototype Analysis | Sonnet | 5-8 |
| S2a PRD | Opus | 15-20 |
| S2b Architecture | Opus | 15-20 |
| S2c Epics | Opus | 10-15 |
| S2-G Cross-artifact | Sonnet | 5-8 |
| S3 Specs + S3-G | Sonnet | 18-25 |
| S4 Deliverables | Sonnet | 10-15 |
| S5 Consistency | Sonnet | 5-8 |

## Outputs

```
specs/{feature}/reconciled/
├── decision-context.md             # S0 (if decision records exist)
├── prototype-analysis.md           # S1
├── planning-artifacts/
│   ├── prd.md
│   ├── architecture.md
│   ├── epics-and-stories.md
│   └── brownfield-context.md
├── entity-dictionary.md            # S3
├── requirements.md
├── design.md
├── tasks.md
├── api-spec.yaml                   # S4
├── api-sequences.md
├── schema.dbml
├── bdd-scenarios/
├── key-flows.md
├── traceability-matrix.md
├── decision-log.md
└── decision-diary.md               # (if exists in parent)
```

## Constraints

1. **Prototype is immutable**: preview/ is never modified during Crystallize
2. **Original artifacts are immutable**: specs/{feature}/ files (outside reconciled/) are never modified
3. **Product Brief excluded**: Product Brief defines problem space — not reconcilable from prototype
4. **Brownfield not re-scanned**: brownfield-context.md is copied as-is (JP2 iteration changes product design, not existing system landscape)
