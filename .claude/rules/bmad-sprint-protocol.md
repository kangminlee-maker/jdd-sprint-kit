# Sprint Execution Protocol

## BMad Artifact Writing Rules

- **When writing a PRD, always read `_bmad/docs/prd-format-guide.md` first and follow its format.** Comply with all rules: YAML frontmatter, section structure, FR/NFR quality criteria, Brownfield notation, etc.

## Brownfield Data Flow (Sprint x MCP)

Brownfield data is used at every Sprint phase. Sources are cumulatively collected from 3 origins: document-project, MCP, and local codebase.

| Phase | Brownfield Usage |
|-------|-----------------|
| **Phase 0 Step 0f** (pre-Sprint) | Detect document-project + MCP + build tools → determine topology + `brownfield_status` |
| **Pass 1: Broad Scan** (Sprint start) | Stage 0: consume document-project → Stage 1~4: MCP + local scan → brownfield-context.md **L1 + L2** |
| **BMad Phase 1-3** | Reference brownfield-context.md L1+L2 |
| **Pass 2: Targeted Scan** (post-Epics) | Reference Stage 0 data + backend-docs/client-docs MCP + local scan → brownfield-context.md **L3 + L4** |
| **Specs generation** (`/specs`) | Copy frozen snapshot (@deliverable-generator Stage 2) |
| **Parallel** (`/parallel`) | Workers read frozen snapshot |
| **Validate** (`/validate`) | Judges verify against brownfield-context.md |

## Causal Chain Propagation Flow (Optional)

Causal Chain is optional. Only propagated when user opts in during Phase 0.

| Phase | Causal Chain Usage |
|-------|-------------------|
| **Phase 0** (sprint.md) | Extract causal chain from Brief + References (opt-in) → record in sprint-input.md |
| **Product Brief** (Mary) | Layer 1+2 problem definition (when causal_chain provided) |
| **PRD** (John) | Classify FRs as core/enabling/supporting (when causal_chain provided); core FRs link to root_cause |
| **Scope Gate** | causal_alignment check (when sprint_input_path provided): FR classification validation + unlinked FR warnings |
| **JP1** | Advanced (Layer 3): Causal Chain Alignment + FR Linkage visualization (only when not feature_only) |
| **Validate** (@judge-business) | Verify that core FR implementations actually resolve root_cause (when causal_chain provided) |

## Brief Tracking Flow

| Phase | Brief Tracking Usage |
|-------|---------------------|
| **Phase 0** (sprint.md) | Decompose Brief into sentences + assign BRIEF-N IDs → record in sprint-input.md `brief_sentences` |
| **PRD** (John) | Tag each FR with `(source: BRIEF-N / DISC-N / AI-inferred)` |
| **JP1** | Section 1: Brief sentence ↔ FR mapping table. Warn on unmapped sentences |
| **JP1** | Section 2: Items beyond Brief (reference discovery vs AI inference, separated) |

### Tracking Source Determination

Tracking source is auto-determined by the `brief_sentences` field in sprint-input.md:

| Condition | Tracking Source | Route |
|-----------|----------------|-------|
| `brief_sentences` exists and is non-empty | BRIEF-N based tracking | Sprint route |
| `brief_sentences` missing or empty array | PRD Success Criteria > Measurable Outcomes | Guided / Direct route |

In either case:
- Verify each PRD FR maps to a tracking source item
- Present "original intent ↔ FR mapping table" at JP1
- Flag unmapped tracking source items as warnings

## Specs File Pattern

```
specs/{feature}/
├── inputs/                     # Phase 0 (user originals + Sprint Input SSOT, read-only)
│   ├── brief.md                # User Brief (AI-generated if only references exist)
│   ├── *.md / *.pdf / ...      # Reference materials (optional)
│   └── sprint-input.md         # Phase 0 auto-generated SSOT (includes Causal Chain)
│
├── planning-artifacts/         # BMad Phase 1-3 artifacts (retained per project)
│   ├── product-brief.md        # Product Brief
│   ├── prd.md                  # PRD
│   ├── architecture.md         # Architecture + ADR
│   ├── epics-and-stories.md    # Epics & Stories
│   └── brownfield-context.md   # L1~L4 raw collection (appended during work)
│
├── sprint-log.md               # Sprint execution log (timeline + decisions + issues)
├── brownfield-context.md       # Frozen snapshot (L1~L4, for Workers)
├── entity-dictionary.md        # Entity Dictionary
├── requirements.md             # PRD → requirements
├── design.md                   # Architecture → design
├── tasks.md                    # Epics → parallel tasks + Entropy + File Ownership
│
├── api-spec.yaml               # OpenAPI 3.1 (API contract — shared by MSW Mock + Specmatic)
├── api-sequences.md            # Mermaid sequence diagrams
├── schema.dbml                 # Database schema (DBML)
├── bdd-scenarios/              # Gherkin acceptance tests
├── state-machines/             # XState definitions (when applicable)
├── decision-log.md             # ADRs + AI reasoning trace
├── traceability-matrix.md      # FR → Design → Task → BDD → API mapping
├── key-flows.md                # Key user flows step-by-step (for JP2 verification)
├── readiness.md                # JP1/JP2 Readiness data (for Layer 0 auto-approval)
└── preview/                    # React + MSW prototype (npm run dev)
```

## Handoff Rules

### BMad → Execute (on Phase 3 completion)

When BMad Phase 3 passes Implementation Readiness:
1. Verify artifacts in `specs/{feature}/planning-artifacts/` (PRD, Architecture, Epics)
2. Run `/specs` to generate Specs 4-file
3. Tag Entropy Tolerance + assign File Ownership

### BMad Guided Route → Sprint Execution

When BMad 12-step artifacts exist in `_bmad-output/planning-artifacts/`:
1. `/specs` auto-discovers and places them into `specs/{feature}/planning-artifacts/`
2. `/specs` runs without sprint-input.md
3. Goals are extracted from PRD's Success Criteria > Measurable Outcomes
4. Brownfield scan runs normally within `/specs`

### On Worker Completion

When a Worker completes a task:
1. Mark task as completed via TaskUpdate
2. Close GitHub Issue via `gh issue close`
3. Notify dependent Workers via SendMessage

### On Circuit Breaker Trigger

- 3 consecutive or 5 cumulative VALIDATE failures in the same category → `/circuit-breaker` auto-triggers
- Minor → fix specs → re-execute
- Major → re-run Auto Sprint Phase 1 (non-Auto Sprint: BMad `/bmad/bmm/workflows/correct-course`)

## File Ownership Rules

Rules to prevent file conflicts during PARALLEL phase:
1. Each task's owned files are declared in `specs/{feature}/tasks.md`
2. Workers may only modify files assigned to them
3. Shared type/interface files are created before PARALLEL starts
4. To modify shared files, request via SendMessage to team lead

## Judgment Point Criteria

JPs are not technical quality gates — they are customer-lens judgment moments for product experts.
See `docs/judgment-driven-development.md` Customer-Lens Judgment Points.

### JP1: "Is this the right product for the customer?"

- **Judgment target**: requirements, user scenarios, feature scope, priorities
- **Presentation format**: customer journey narrative + original intent ↔ FR mapping + structural checklist
- **Response**: Confirm / Comment

### JP2: "Is this the experience the customer wants?"

- **Judgment target**: prototype, screen flows, interactions
- **Presentation format**: working prototype + key scenario walkthrough guide
- **Response**: Confirm / Comment

### Comment Handling Flow

When Comment is selected at a JP, the following flow applies.
This flow handles Party Mode discoveries, Advanced Elicitation results, and direct feedback identically.
Regardless of how the feedback was discovered, the processing mechanism is the same.

1. **Feedback input**: User provides modification details as free text
2. **Impact analysis**: System analyzes feedback scope and produces:
   - For apply-fix: list of affected files (upstream + downstream) + estimated time
   - For regenerate: restart Phase + estimated time
3. **Present options**: Two options with cost:
   - **Apply fix + propagate**: Direct edits in existing artifacts + bidirectional propagation to dependent files (N files, ~M min)
   - **Regenerate**: Re-run pipeline from the affected Phase (~M min)
4. **User selects**: User chooses based on cost
5. **Execute + verify**:
   - Apply fix: edit all files → mandatory Scope Gate verification → return to JP on PASS
   - Regenerate: re-run pipeline from the affected Phase → includes Scope Gate

### Regeneration Scope Reference Table

Guide for determining regeneration start point based on feedback magnitude:

| Feedback Magnitude | JP1 Regeneration Scope | JP2 Regeneration Scope |
|-------------------|----------------------|----------------------|
| Direction change (what to build changes) | Abort Sprint → edit brief.md → restart | Phase 1 from start (PRD onward, re-pass JP1) |
| Scope/UX change | From PRD (Step 2b) | From PRD (Step 2b, re-pass JP1) |
| Technical/design change | From Architecture (Step 2c) | From affected BMad step (re-pass JP1) |
| Task structure change | Regenerate Specs (Step 3) | Regenerate Deliverables only (Step 5) |
| Spec/prototype adjustment | N/A | Regenerate Deliverables only (Step 5) |

This table is a reference for the system when calculating regeneration scope during impact analysis.
Users see the calculated cost alongside the options.
