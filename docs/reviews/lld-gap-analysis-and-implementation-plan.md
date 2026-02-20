# LLD Gap Analysis & Implementation Plan

> **Document type**: Party Mode 5-round review synthesis + Implementation plan
> **Date**: 2026-02-20
> **Trigger**: External PRD analysis report (`prd-analysis-report.md`) found 6 CRITICAL + 10 HIGH gaps in Sprint Kit's reconciled/ output
> **Participating agents**: John (PM), Winston (Architect), Murat (Test Architect), Sally (UX), Bob (SM), Devil's Advocate, Industry Methods Analyst, BMad Boundary Analyst, Root Cause Analyst, LLD Specialist, Edge/Fail Case Specialist, Gap Discovery Agent, Final Synthesis Agent
> **Prior document**: None (new analysis stream)
> **Related research**: [`progressive-refinement-methodology-survey.md`](progressive-refinement-methodology-survey.md)
> **Superseded by**: [`docs/delta-driven-design.md`](../delta-driven-design.md) — This document's gap analysis and implementation plan remain valid. The Delta-Driven Design document provides the conceptual foundation; this document provides the execution plan.

---

## Executive Summary

An external PRD analysis report revealed that Sprint Kit's reconciled/ output lacks implementation-level detail needed for AI-driven development by external teams. After 5 rounds of Party Mode review (~20 agent analyses), the root cause was identified:

**Sprint Kit's design.md operates at HLD (High-Level Design) level but lacks LLD (Low-Level Design) sections.** This is not a missing layer — it is an incomplete format definition within an existing layer. The fix is conditional section expansion in design.md, not a new file or layer boundary change.

Three structural problems were identified:
1. **LLD absence in design.md** — 7 categories of design information have no home
2. **Happy Path bias** — No adversarial verification step exists; generator and verifier share the same blindspots
3. **Architecture → Stage 7 pipeline disconnect** — XState generation input source references non-existent Architecture state diagrams

Additionally, 6 gaps outside the original 10 were discovered (Observability, Worker integration testing, Interface Contract protocol, GDPR, Crystallize carry-forward verification, Scope Gate deliverables coverage).

---

## 1. Root Cause Analysis

### 1.1 Why these gaps exist

Sprint Kit's artifact formats were designed for straightforward CRUD-centric features. When the pipeline encounters complex features (stateful entities, algorithmic logic, concurrent access, scheduled jobs, brownfield migration), the format definitions have no structure to capture the necessary design information. This information falls into Worker's autonomous decision space, causing:

- Inconsistent implementations across parallel Workers
- Missing error/edge case handling
- Unverifiable implementations (Judges have no spec to verify against)

### 1.2 Classification of the original 10 gaps

All 10 gaps from the analysis report were classified as **EDGE CASE** (7) or **PROCESS** (1), with **0 STRUCTURAL** problems. The layer boundaries (PRD → Architecture → Specs → Deliverables → Execute) are correct. What's missing is format completeness within existing layers.

| Gap | Classification | Fix Location |
|-----|---------------|-------------|
| H5: Concurrency NFR | EDGE CASE | PRD format + Scope Gate |
| H8: Business Rule Matrix | EDGE CASE | PRD format |
| C6: FR-NFR Contradiction | PROCESS | Scope Gate |
| H10: Carry-forward Classification | EDGE CASE | Crystallize protocol |
| H4: Algorithm Specification | EDGE CASE | PRD format + design.md |
| C1/C2: Auto Trigger/Scheduler | EDGE CASE | PRD format + design.md |
| H3/H7: State Machine Detection | EDGE CASE | deliverable-generator |
| H1: Migration Strategy | EDGE CASE | design.md + Scope Gate |

### 1.3 The "Happy Path bias" pattern

Sprint Kit's formats are optimized for the simple case and lack conditional formats for the complex case. This is a maturity issue, not a design flaw. The fix is conditional section expansion — sections that activate only when the project's complexity requires them.

---

## 2. LLD Gap Analysis

### 2.1 What is LLD?

Low-Level Design (LLD) sits between Architecture (HLD) and Code. It specifies **how each component behaves internally** — state transitions, algorithms, concurrency strategies, error handling, scheduling mechanics. IEEE 1016 (Software Design Description) defines this layer. Modern AI-native methods (GitHub Spec Kit "Plan", Thoughtworks SDD "Specification") include this information in their design layer.

### 2.2 Current Sprint Kit coverage

| # | LLD Category | Current Status | Where (if exists) | Completeness | Gap Description |
|---|---|---|---|---|---|
| 1 | **State Transitions** | Conditional | state-machines/ (Stage 7) | 40% | Stage 7 only triggers on "Architecture identifies complex state management" — subjective criterion with no detection rule. Architecture workflow has no state diagram generation step. |
| 2 | **Entity Lifecycle** | Missing | — | 0% | No artifact defines create→active→archive→delete lifecycle for entities |
| 3 | **Event Choreography** | Missing | — | 0% | No async event causality/ordering specification |
| 4 | **Decision Tables** | Missing | — | 0% | Multi-condition business rules scattered in PRD prose, no structured matrix |
| 5 | **Algorithm Pseudocode** | Missing | — | 0% | Complex logic described in natural language only |
| 6 | **Validation Rules** | Partial | api-spec.yaml | 30% | Field-level validation via OpenAPI; cross-field validation rules missing |
| 7 | **Priority/Ranking** | Missing | — | 0% | Sorting/priority algorithms undefined |
| 8 | **API Contracts** | Complete | api-spec.yaml (Stage 3) | 90% | Gap: idempotency keys, rate limits, versioning strategy |
| 9 | **Event Schemas** | Missing | — | 0% | No async message payload schema |
| 10 | **Schema Details** | Complete | schema.dbml (Stage 5) | 85% | Gap: index rationale, partitioning strategy |
| 11 | **Migration Plans** | Partial | decision-log.md (optional ADR) | 30% | No rollback procedure, data transformation sequence, zero-downtime strategy |
| 12 | **Concurrency: Locking** | Missing | — | 0% | No lock strategy specification |
| 13 | **Concurrency: Race Conditions** | Missing | — | 0% | No conflict scenario/resolution specification |
| 14 | **Concurrency: Transactions** | Missing | — | 0% | No transaction boundary definition |
| 15 | **Concurrency: Idempotency** | Missing | — | 0% | No idempotency mechanism specification |
| 16 | **Error: Taxonomy** | Partial | api-spec.yaml error codes | 40% | Per-endpoint errors exist; system-wide error classification missing |
| 17 | **Error: Retry Policies** | Missing | — | 0% | No retry/backoff specification |
| 18 | **Error: Fallback** | Missing | — | 0% | No fallback/degradation specification |
| 19 | **Scheduling: Cron Jobs** | Missing | — | 0% | No batch schedule specification |
| 20 | **Scheduling: Event Handlers** | Missing | — | 0% | No event trigger→handler mapping |
| 21 | **Cross-cutting: Logging** | Missing | — | 0% | No logging strategy |
| 22 | **Cross-cutting: Monitoring** | Missing | — | 0% | No SLI/SLO/alerting specification |
| 23 | **Cross-cutting: Caching** | Missing | — | 0% | No cache strategy |
| 24 | **Cross-cutting: Security Patterns** | Partial | design.md (JWT mention) | 30% | Auth flow detail, CORS, CSP, input sanitization missing |
| 25 | **Environment & Config** | Missing | — | 0% | No env var listing, feature flag configuration |

### 2.3 What to add to design.md (conditional sections)

All additions use the **always-detect, conditionally-generate** pattern:
- Detection runs on every project (scan PRD FRs for patterns)
- Generation only occurs when the pattern is found
- When not applicable, a single "N/A" line is recorded in the Output Summary

| Section | Detection Trigger | Content When Generated |
|---|---|---|
| **State Transitions** | PRD FR has 2+ explicit state names + transition verbs | Mermaid stateDiagram-v2 + transition table (from → event → to → guard → side-effect) |
| **Algorithm Specs** | PRD FR has matching/ranking/calculate/filter keywords | Pseudocode + input/output contract + edge case table |
| **Concurrency Controls** | NFR mentions concurrent/race/consistency, OR 2+ write APIs on same resource | Conflict scenario table + lock strategy + idempotency mechanism |
| **Scheduler Specs** | PRD FR has scheduled/periodic/cron/trigger/batch keywords | Trigger inventory table (schedule, trigger type, failure handling) |
| **Migration Strategy** | Brownfield AND schema.dbml has [BROWNFIELD] modified tables | Migration step table (order, type, rollback, risk) |
| **Error Handling Strategy** | **Always generated** (every project needs error handling) | Error classification + retry policy + fallback strategy |
| **Operational Specs** | **Always generated** | Logging strategy + monitoring/alerting + caching (conditional) + timezone policy (conditional) + environment variables |

---

## 3. Pipeline Connection Errors

### 3.1 Architecture → Stage 7 XState disconnect

**Current state**: deliverable-generator Stage 7 says:
```
Source: Architecture state diagrams
```
But Architecture workflow (step-01 through step-08) has **no procedure to generate state diagrams**. Grep for "state diagram", "state machine", "statechart", "XState" in Architecture workflow files returns 0 results.

**Fix**: Two changes:
1. Auto Sprint Step 2c (Architecture generation prompt): Add conditional state diagram generation instruction
2. Stage 7 input source: Change from "Architecture state diagrams" to "design.md State Transitions section"

This creates a reliable data flow:
```
PRD State Transition FR → Architecture State Diagrams (conditional) → design.md State Transitions → Stage 7 XState
```

### 3.2 C6: FR-NFR contradiction check missing

**Current state**: Scope Gate checks FRs and NFRs independently. No cross-validation exists.

**Fix**: Add 1 checklist item to Scope Gate `prd` stage:
```
- [ ] No FR-NFR contradictions exist
```

---

## 4. Happy Path Bias & Adversarial Approach

### 4.1 Problem

Current pipeline: generator (deliverable-generator) is also the verifier (Self-Validation). Same context = same blindspots. Edge cases are only generated from PRD AC, missing:

- Invalid state transitions
- Concurrent access conflicts
- Business rule collisions
- API error code coverage gaps
- Flow abandonment scenarios
- Integration failure scenarios

### 4.2 Solution: Devil's Advocate Pass

A dedicated adversarial verification step that runs AFTER deliverables generation, BEFORE JP2.

**Position in pipeline**:
```
[Deliverables (Stage 3-10)] → [Scope Gate: deliverables] → [Devil's Advocate Pass] → [JP2]
```

**7 Adversarial Lenses**:

| Lens | Target Files | What It Finds |
|------|-------------|---------------|
| API Boundary Violation | api-spec.yaml | Missing error code BDD coverage, empty/null input handling |
| Concurrency & Race Condition | api-spec.yaml + schema.dbml | Duplicate creation, counter overflow at limit, simultaneous state transitions |
| State Transition Edge | state-machines/ + key-flows.md | Invalid transitions, duplicate events, timeout handling |
| Data Integrity & Migration | schema.dbml + brownfield-context.md | FK deletion handling, NULL in API responses, default values for new columns |
| Integration Failure | api-spec.yaml + brownfield-context.md | External API timeout/error, auth handoff failure, schema mismatch |
| Business Rule Conflict | prd.md FRs + key-flows.md | Conflicting rules applied simultaneously, undo/rollback side effects |
| Flow Abandonment | key-flows.md | Mid-flow user dropout, network drop, double submit, back navigation |

**Output**:
- `adversarial-scenarios.md` — Findings report with severity (CRITICAL/HIGH/MEDIUM)
- `bdd-scenarios/adversarial-*.feature` — Auto-generated BDD for CRITICAL + HIGH findings
- `readiness.md` — Updated with adversarial pass results

**Conditional execution**: Skip for `complexity: simple` or `api endpoints ≤ 3`.

### 4.3 MSW State Transition Validation (Sally's finding)

When `state-machines/` exists, MSW handlers in the prototype must validate transition legality. Invalid transitions return 422 instead of silently succeeding. This prevents JP2 judgment distortion — users seeing impossible state transitions succeed in the prototype.

---

## 5. Additional Gaps Discovered (Beyond Original 10)

| Priority | Gap | Impact Scope | Resolution Location |
|---|---|---|---|
| **P0** | Observability (monitoring/logging/alerting) specification missing | All projects | prd-format-guide NFR + design.md Operational Specs |
| **P0** | Worker integration test concreteness lacking | All parallel execution | /parallel Step 6 protocol |
| **P0** | /parallel Interface Contract protocol insufficient | All parallel execution | /parallel Step 1 protocol |
| P1 | GDPR/privacy checklist absent | PII projects | prd-format-guide + Scope Gate |
| P1 | Crystallize carry-forward verification missing | S route | crystallize.md S5 |
| P1 | Scope Gate deliverables coverage insufficient | All projects | scope-gate.md |
| P2 | API versioning strategy absent | Brownfield | deliverable-generator Stage 3 |
| P2 | Accessibility specification structurally excluded | Public/global services | prd-format-guide NFR |
| P2 | Feature flag/gradual rollout absent | Live services | prd-format-guide Optional Sections |
| P3 | UX Writing consistency structure missing | UX quality | Entity Dictionary extension |
| P3 | i18n/l10n completely absent | Multilingual projects | prd-format-guide Domain-Specific |

---

## 6. Proposed Solution Architecture

### 6.1 Design principles

1. **Conditional activation**: All new sections activate only when detection triggers match. Simple CRUD projects see zero additional overhead.
2. **Always-detect**: Detection of whether a section is needed is ALWAYS performed. "We check if it's needed" is mandatory; "We generate it" is conditional.
3. **Existing layer expansion**: No new files or layers. Expand design.md format + PRD format + Scope Gate checks.
4. **Separation of generation and adversarial verification**: Devil's Advocate Pass is a dedicated step, not embedded in generation.
5. **Preserve PRD boundary**: PRD defines WHAT (business rules), design.md defines HOW (technical design). State transition FRs in PRD specify states/transitions/invariants (business rules); design.md specifies Mermaid diagrams/lock strategies/pseudocode (technical design).

### 6.2 Data flow after changes

```
PRD (State/Algorithm FR supplements)
  ↓ Scope Gate: FR-NFR contradiction check [NEW]
Architecture (Conditional state diagrams) [NEW]
  ↓ Scope Gate: LLD mapping check [NEW]
design.md (7 conditional LLD sections) [NEW]
  ↓
Deliverables (Stage 7 reads design.md State Transitions) [FIX]
  ↓
BDD (Adversarial scenarios) [NEW]
MSW (State transition validation) [NEW]
  ↓
Devil's Advocate Pass [NEW]
  ↓
JP2 (with adversarial results in readiness.md)
```

---

## 7. Specific Changes by File

### 7.1 `_bmad/docs/prd-format-guide.md`

**Change A: Complex FR Supplementary Structures** (Section 4.7, after Anti-Patterns)

Add conditional structures for State Transition FRs and Algorithmic Logic FRs. These specify business rules (states, transitions, invariants, input/output) without implementation leakage.

```markdown
**Complex FR Supplementary Structures (conditional)**:

When an FR involves state transitions or algorithmic logic, supplement the
capability statement with structured detail.

**State Transition FRs**: When an FR involves entity state changes:
- **States**: {state1} | {state2} | {state3} | ...
- **Transitions**: {state1} → {state2} (trigger: {event}), ...
- **Invariants**: {rules that must never be violated}
- **Terminal states**: {states with no outgoing transitions}

**Algorithmic Logic FRs**: When an FR involves non-trivial computation:
- **Input**: {what data enters the computation}
- **Rules**: {ordered list of business rules applied}
- **Output**: {what the computation produces}
```

**Change B: NFR Concurrency + Observability categories** (Section 4.8)

Expand Required categories table:

| Category | Contents | When Mandatory |
|----------|----------|----------------|
| Performance | API response time, load time (p95) | Always |
| **Concurrency** | Race condition handling, idempotency | When 2+ users can modify same resource |
| Reliability | Availability, data consistency | Always |
| Integration | Backward compatibility | When brownfield |
| Security | Auth, data protection | When user data involved |
| **Observability** | SLI/SLO targets, alerting conditions, logging requirements | Always |
| Error Handling | Common error policies | Always |

**Change C: Checklist additions** (Section 9)

```markdown
- [ ] Concurrency NFR section present when multi-user write scenarios exist
- [ ] Observability NFR section present with SLI/SLO targets
- [ ] State Transition FRs include States/Transitions/Invariants structure
- [ ] Algorithm Logic FRs include Input/Rules/Output structure
```

**Estimated addition**: ~40 lines

### 7.2 `.claude/agents/scope-gate.md`

**Change A: PRD stage** — FR-NFR contradiction check (mandatory, all projects)

```markdown
- [ ] No FR-NFR contradictions exist (FR capabilities achievable within NFR constraints)
```

**Change B: Spec stage** — LLD mapping check (conditional)

```markdown
**design.md checks (additional)**:
- [ ] State transition FRs (if any in PRD) have corresponding State Transitions section in design.md
- [ ] Algorithmic logic FRs (if any in PRD) have corresponding Algorithm Specs section in design.md
- [ ] Error Handling Strategy section exists
- [ ] Operational Specifications section exists
```

**Estimated addition**: ~15 lines

### 7.3 `.claude/agents/deliverable-generator.md`

**Change A: Stage 2 design.md LLD conditional sections**

Add to the design.md generation instruction (after existing 4 bullet points):

```markdown
**LLD Conditional Sections** (include only when PRD FRs contain corresponding patterns):

Scan PRD FRs for the following patterns. If detected, generate the section:

| PRD Pattern | design.md Section | Content |
|---|---|---|
| State Transition FR | ### State Transitions | Mermaid stateDiagram-v2 + transition table |
| Algorithm Logic FR | ### Algorithm Specs | Pseudocode + decision table + edge cases |
| Concurrency NFR | ### Concurrency Controls | Lock strategy + conflict resolution |
| Scheduler/batch FR | ### Scheduler Specs | Trigger table + failure recovery |
| Brownfield + schema changes | ### Migration Strategy | Step table + rollback + risk |
| Always | ### Error Handling Strategy | Error classification + retry + fallback |
| Always | ### Operational Specs | Logging + monitoring + env vars |

If none of the conditional patterns are detected, omit those sections.
```

**Change B: Stage 7 input source fix**

```markdown
### Stage 7: XState State Machines (conditional)

Generate state-machines/ only if design.md contains a ### State Transitions section:

- Source: design.md State Transitions section (NOT Architecture state diagrams)
- One XState machine per state flow
- Include guard conditions and invariant assertions

Skip if design.md has no State Transitions section.
```

**Change C: Stage 6 adversarial scenarios** (conditional)

```markdown
**Adversarial scenarios** (conditional — when PRD contains State Transition FRs):
- Generate @adversarial tagged scenarios for:
  - Invalid transition attempts
  - Concurrent transition conflicts
  - Invariant violation attempts
```

**Change D: Stage 10 MSW state transition validation** (conditional)

```markdown
**State Transition Validation in MSW** (conditional — when state-machines/ exists):
- MSW handlers for state-transitioning entities must validate transition legality
- On invalid transition: return 422 with error details
- Import transition rules from state-machines/ TypeScript definitions
```

**Estimated addition**: ~60 lines

### 7.4 `.claude/agents/auto-sprint.md`

**Change: Step 2c Architecture prompt expansion**

Add to the end of Step 2c (Architecture - Winston) prompt:

```markdown
CONDITIONAL — State Diagrams:
If the PRD contains FRs with explicit state transitions (States/Transitions/Invariants),
include a '## State Diagrams' section in Architecture with:
- One Mermaid stateDiagram-v2 per state-transitioning entity
- Transition events and guard conditions
If no state transition FRs exist in PRD, omit this section.
```

**Estimated addition**: ~10 lines

### 7.5 `.claude/rules/jdd-sprint-protocol.md`

**Change: Crystallize carry-forward classification**

Replace the existing carry-forward description with classified tags:

```markdown
Items carried forward from existing documents are classified:

| Classification | Tag | Meaning |
|---|---|---|
| Defined | [carry-forward:defined] | Fully specified, confirmed applicable |
| Deferred | [carry-forward:deferred] | Mentioned but explicitly deferred to post-MVP |
| New | [carry-forward:new] | Added during reconciliation to fill gaps |
```

**Estimated addition**: ~12 lines

### 7.6 `.claude/agents/devils-advocate.md` (NEW FILE)

A new agent definition for the Devil's Advocate Pass. Contains:
- 7 Adversarial Lenses with detection rules
- Negative Scenario Generator rules (auto-generate BDD from api-spec error codes, state transition matrix, business rule conflicts)
- Output format (adversarial-scenarios.md + adversarial-*.feature)
- Severity classification criteria (CRITICAL/HIGH/MEDIUM)
- Conditional execution rules (skip for simple projects)

**Estimated size**: ~300 lines

---

## 8. Implementation Plan

### Phase 1: Foundation (Low-risk, high-impact)

| Order | Change | File | Risk | Lines |
|---|---|---|---|---|
| 1-1 | FR-NFR contradiction check | scope-gate.md | LOW | +2 |
| 1-2 | Concurrency + Observability NFR categories | prd-format-guide.md | LOW | +15 |
| 1-3 | Complex FR Supplementary Structures | prd-format-guide.md | LOW | +20 |
| 1-4 | Checklist additions | prd-format-guide.md | LOW | +5 |
| 1-5 | carry-forward classification | jdd-sprint-protocol.md | LOW | +12 |

**Total**: 3 files, ~54 lines, estimated 30-45 min

### Phase 2: LLD Channel (Medium-risk, core change)

| Order | Change | File | Risk | Lines |
|---|---|---|---|---|
| 2-1 | design.md LLD conditional sections | deliverable-generator.md | MEDIUM | +30 |
| 2-2 | Stage 7 input source fix | deliverable-generator.md | LOW (bug fix) | +5 |
| 2-3 | Architecture state diagram prompt | auto-sprint.md | LOW | +10 |
| 2-4 | Scope Gate LLD mapping checks | scope-gate.md | LOW | +10 |

**Total**: 3 files, ~55 lines, estimated 45-60 min

### Phase 3: Adversarial Layer (Higher complexity)

| Order | Change | File | Risk | Lines |
|---|---|---|---|---|
| 3-1 | Devil's Advocate agent definition | devils-advocate.md (NEW) | MEDIUM | ~300 |
| 3-2 | BDD adversarial scenarios | deliverable-generator.md | LOW | +15 |
| 3-3 | MSW state transition validation | deliverable-generator.md | LOW | +10 |
| 3-4 | Pipeline integration (Step 5-D) | auto-sprint.md | MEDIUM | +30 |

**Total**: 3 files (1 new), ~355 lines, estimated 60-90 min

### Phase 4: Additional Gaps (Backlog)

Address P0-P1 gaps discovered outside the original 10:

| Item | Scope | Phase |
|---|---|---|
| Observability NFR | Covered in Phase 1 (1-2) | Done |
| Worker integration testing | /parallel protocol enhancement | Future |
| Interface Contract protocol | /parallel Step 1 enhancement | Future |
| GDPR/privacy checklist | Scope Gate conditional check | Future |
| Crystallize carry-forward verification | crystallize.md S5 enhancement | Future |
| Scope Gate deliverables coverage | scope-gate.md expansion | Future |

---

## 9. Verification Strategy

### Shadow Run targets

| Phase | Test Feature | Verification |
|---|---|---|
| Phase 1 | Any existing feature | Scope Gate catches FR-NFR contradictions; PRD includes Concurrency NFR when applicable |
| Phase 2 | Complex stateful feature | design.md contains State Transitions + Algorithm Specs; Stage 7 generates XState from design.md |
| Phase 3 | Complex feature with BDD | adversarial-scenarios.md generated; @adversarial BDD scenarios exist |

### Regression check

Existing Shadow Run results (specs/test-tutor-excl, 5/5 PASS) must remain valid after each phase.

### Rollback plan

All changes are **additive** (no existing code deleted or restructured). Each phase can be independently reverted via `git revert` without affecting other phases.

---

## 10. Design Decisions & Rationale

### D1: Expand design.md rather than create a new file

**Decision**: Add LLD sections to design.md instead of creating `detailed-design.md`.

**Rationale**: Workers already read design.md as their primary design reference. Adding sections to the same file means no change to Worker's SSOT Reference Priority. A new file would require updating Worker agent, Scope Gate, traceability-matrix, and all downstream consumers.

### D2: Conditional activation over mandatory sections

**Decision**: All LLD sections use always-detect / conditionally-generate pattern.

**Rationale**: Simple CRUD projects (estimated 60-70% of features) don't need state machines, algorithm specs, or concurrency controls. Mandatory sections would create empty/N/A noise, violating PRD format guide's Information Density principle ("Every sentence must carry information weight").

### D3: Devil's Advocate as separate pass, not embedded in generation

**Decision**: Create a dedicated adversarial verification step rather than expanding Stage 6 BDD generation.

**Rationale**: The fundamental problem is that generator and verifier share the same context (same blindspots). Embedding adversarial thinking into the same generation prompt dilutes both concerns. Separation ensures genuine adversarial perspective — the Devil's Advocate reads finished artifacts without generation bias.

### D4: PRD State Transition structures are business rules, not implementation

**Decision**: Allow State/Transition/Invariant structures in PRD FRs.

**Rationale**: "Order can transition from PENDING to CONFIRMED when payment is received" is a business rule (WHAT), not an implementation detail (HOW). "Use XState with pessimistic locking" is implementation. The supplementary structures specify business state rules without prescribing implementation mechanisms. This is consistent with BMad PRD Philosophy's "No Implementation Leakage" principle.

### D5: Fix Stage 7 input source rather than adding Architecture workflow steps

**Decision**: Change Stage 7 input from "Architecture state diagrams" to "design.md State Transitions".

**Rationale**: Architecture workflow is BMad core (not Sprint Kit owned). Modifying it affects the Guided route. Instead, the Auto Sprint prompt conditionally generates state diagrams in Architecture, and design.md transforms them into the structured format that Stage 7 consumes. For Guided route, the Architect (Winston) naturally discusses state diagrams in step-04/step-05.

### D6: Observability as mandatory NFR category

**Decision**: Add Observability to the "always required" NFR categories.

**Rationale**: Every deployed service needs monitoring and alerting. Unlike Concurrency (conditional on multi-user write), Observability is universal. Without SLI/SLO targets defined in PRD, there is no basis for post-deployment verification. This was identified as a P0 gap affecting all projects.

---

## 11. What We Are NOT Changing

| Item | Reason |
|---|---|
| Layer boundaries (PRD/Architecture/Specs/Deliverables/Execute) | Root cause analysis confirmed boundaries are correct (0 STRUCTURAL gaps) |
| PRD's role as what/why document | State Transition FR supplements are business rules, not implementation |
| JP1/JP2 structure | No new judgment points needed; existing 2-JP structure is sufficient |
| Architecture workflow files | BMad core; changes via Auto Sprint prompt instead |
| brownfield-context-format.md | carry-forward classification applies to Crystallize reconciled/ artifacts, not brownfield-context itself |
| sprint.md / specs.md | Phase 0 launcher and Specs generation commands don't need changes; all fixes are in format definitions and agents |

---

## 12. Open Items for Future Rounds

| Item | Trigger Condition | Description |
|---|---|---|
| Handoff document (external team export) | External team requests after seeing reconciled/ | reconciled/README.md or handoff.md index document |
| Worker integration test protocol | After Phase 3 implementation | /parallel Step 6 concrete integration test execution |
| Interface Contract protocol | After Phase 3 implementation | /parallel Step 1 shared type generation from api-spec.yaml |
| Performance test scenarios | NFR performance targets defined | Load test scenario specification in deliverables |
| GDPR/privacy checklist | PII-handling features encountered | Scope Gate conditional check for privacy policy |
| External library dependency management | Parallel execution conflicts | design.md "Approved Libraries" section |

---

## Appendix A: Progressive Refinement Methodology Survey (Summary)

Full research document: [`progressive-refinement-methodology-survey.md`](progressive-refinement-methodology-survey.md)

### Key Findings

**1. Sprint Kit's 3-pass pattern (Generate → Reconcile → Realize) is unique in the methodology landscape.**

No existing methodology has this exact pattern. Most methods use verification (checking) as their 2nd pass. Sprint Kit uses reconciliation (bidirectional realignment) — prototype realities are back-propagated to ALL upstream artifacts, producing a reconciled/ artifact set.

| Methodology | 2nd Pass Nature | Updates upstream artifacts? |
|---|---|---|
| V-Model | Verification | No (plan immutable) |
| Spiral | Risk resolution | No (same-shaped passes) |
| Design Sprint | User testing | No (no upstream update) |
| SDD Spec-Anchored | Bidirectional sync | Yes (continuous) |
| **Sprint Kit** | **Reconciliation** | **Yes (batch, at JP2)** |

**2. This pattern was economically impossible before AI.**

Reconciliation requires regenerating the entire artifact set. Pre-AI cost: weeks-months. AI-Native cost: minutes-hours. AI lowered generation cost enough to upgrade "verification" (find problems, stop) to "reconciliation" (find + fix + realign).

**3. Sprint Kit is a 4-category hybrid: Spec-Driven + Contract-First + Prototype-First + AI-Native.**

- Spec-Driven: AI auto-generates planning artifacts
- Contract-First: OpenAPI + Specmatic control AI non-determinism
- Prototype-First: JP2 judgment on concrete artifact
- AI-Native: humans judge, AI implements

**4. AI compatibility was assessed on 5 criteria** (see full document for details):

| Criterion | Measures |
|---|---|
| C1: Structured Artifacts | Machine-parseable outputs? |
| C2: Verification Automation | Can results be auto-verified? |
| C3: AI Strength Alignment | Matches AI strengths (generation) vs weaknesses (discovery)? |
| C4: Human Judgment Isolation | Can human input be isolated to checkpoints? |
| C5: Regeneration Affinity | Supports regeneration over modification? |

Contract-First scores highest on universal AI combinability. Emergent Design scores lowest (AI is weak at design discovery through refactoring).

**5. Closest philosophical analog: Peirce's Logic of Inquiry**, not Hegel's dialectic.

| Peirce | Sprint Kit | Activity |
|---|---|---|
| Abduction | Pass 1 (Generative) | Generate best design from inputs |
| Deduction | Prototype | Deduce what design looks like realized |
| Induction | Pass 2 (Reconciliatory) | Revise upstream from prototype observations |

### Industry Methodology Gap Mapping

Where do the 10 gap items live in other methodologies?

| Item | Waterfall | RUP | DDD | Shape Up | GitHub Spec Kit |
|---|---|---|---|---|---|
| State Machines | LLD | Design Model | Tactical (Aggregate) | Builder discretion | Plan |
| Schedulers | LLD | Design Model | Implementation | Builder discretion | Plan |
| Migration | LLD | Deployment Model | Implementation | Builder discretion | Plan |
| Algorithms | LLD | Design Model | Tactical (Domain Service) | Builder discretion | Plan |
| Concurrency | LLD | Design Model | Implementation | Builder discretion | Plan |
| Business Rules | SRS + LLD | Analysis Model | Tactical (Entity/VO) | Pitch | Specify |
| API Schemas | LLD | Design Model | Implementation | Builder discretion | Plan |

**Common finding**: 8 of 10 methodologies have an explicit LLD/Detailed Design layer. Sprint Kit's design.md is the equivalent — it just needs format expansion.

---

## Appendix B: Party Mode Round Summary

| Round | Focus | Key Finding |
|---|---|---|
| Round 1 | PRD format comparison with analysis report | PRD format guide has 11 gaps; 5 format + 5 conditional + 1 process |
| Round 2 | Handoff document & document naming | PRD ≠ implementation spec; separate concern from format gaps |
| Round 3 | Gap solution proposals (6 agents parallel) | John: PRD conditional sections; Winston: design.md LLD; Murat: BDD + Test Completeness; Sally: MSW validation; Bob: 3-phase plan; DA: minimum 3-file change |
| Round 4 | Structural vs edge case analysis (4 agents parallel) | 0 STRUCTURAL / 7 EDGE CASE / 1 PROCESS; "Happy Path bias" pattern; LLD layer absent but fixable via design.md expansion |
| Round 5 | Zero-base rethink (4 agents parallel) | LLD comprehensive mapping (50 categories, 25 gaps); Devil's Advocate Pass design; 6 additional P0-P3 gaps discovered |
| Round 6 | Progressive refinement methodology survey | 11 categories taxonomized; Sprint Kit's 3-pass pattern unique; AI compatibility 5-criteria assessment |
