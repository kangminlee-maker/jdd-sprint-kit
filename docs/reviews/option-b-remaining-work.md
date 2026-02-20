# Option B Remaining Work: Incremental Delta Integration

> **Date**: 2026-02-21
> **Status**: Phase 0 + Phase 1 complete. Phase 2-3 + Backlog remaining.
> **Completed commits**:
> - `da1118a` Phase 0: Documentation (delta-driven-design.md, terminology, JDD, blueprint)
> - `3d419ae` Phase 1: LLD Foundation (PRD format, Scope Gate, deliverable-generator, auto-sprint, crystallize, protocol)
> **Related**: [`delta-driven-design.md`](../delta-driven-design.md), [`lld-gap-analysis-and-implementation-plan.md`](lld-gap-analysis-and-implementation-plan.md)

---

## Completed

### Phase 0: Documentation ✅

| Task | File | Status |
|---|---|---|
| delta-driven-design.md as core document | `docs/delta-driven-design.md` | Done |
| 14 delta terms in terminology-map | `docs/terminology-map.md` | Done |
| JDD reference section | `docs/judgment-driven-development.md` | Done |
| Blueprint reference link + Crystallize description | `docs/blueprint.md` | Done |

### Phase 1: LLD Foundation ✅

| Task | File | Status |
|---|---|---|
| FR-NFR contradiction check | `scope-gate.md` | Done |
| Concurrency + Observability NFR categories | `prd-format-guide.md` | Done |
| Complex FR Supplementary Structures | `prd-format-guide.md` | Done |
| Checklist additions (5 items) | `prd-format-guide.md` | Done |
| carry-forward classification (defined/deferred/new) | `jdd-sprint-protocol.md` + `crystallize.md` | Done |
| design.md LLD 7 conditional sections | `deliverable-generator.md` | Done |
| Stage 7 input source fix (Architecture → design.md) | `deliverable-generator.md` | Done |
| Architecture state diagram prompt | `auto-sprint.md` | Done |
| Scope Gate spec LLD mapping checks (5 items) | `scope-gate.md` | Done |
| State Transition/Algorithmic FR structural checks in prd stage | `scope-gate.md` | Done |
| complexity value fix + explicit acquisition path | `prd-format-guide.md` + `deliverable-generator.md` + `scope-gate.md` | Done |

---

## Remaining

### Phase 2: Delta Integration

Core delta additions that make the delta concept operational in the pipeline.

| # | Task | File | Content | Prerequisite | Risk |
|---|---|---|---|---|---|
| 2-1 | Delta Manifest output | `crystallize.md` | Add delta classification step in Crystallize producing `delta-manifest.md` with positive/zero/negative/modification items | Phase 1 done | MEDIUM |
| 2-2 | JP2 Before/After delta section | `auto-sprint.md` | Add "Customer-visible Changes" section to JP2 Visual Summary showing what changes from current system | Phase 1 done | LOW |
| 2-3 | JP2 Translation Preview | `auto-sprint.md` | Show user "here's what we'll extract from this prototype" before JP2 confirmation | 2-2 done | LOW |
| 2-4 | carry-forward registry in design.md | `deliverable-generator.md` | Explicit carry-forward item listing at design.md generation (birth + registration step of lifecycle) | Phase 1 done | LOW |

**Dependencies**: 2-1 enables Phase 3 (delta-typed testing requires manifest). 2-2 and 2-3 are independent of 2-1.

**Estimated effort**: ~80 lines across 3 files, 2-3 hours including verification.

### Phase 3: Validation

Data-driven validation that informs whether full Crystallize redesign (Option C) is needed.

| # | Task | File | Content | Prerequisite | Risk |
|---|---|---|---|---|---|
| 3-1 | Delta completeness check | `scope-gate.md` | Verify all delta manifest items have corresponding tasks in tasks.md | 2-1 done | LOW |
| 3-2 | Zero delta regression scope | `validate.md` / `judge-business.md` | Delta-typed verification: positive=implement, modification=change, zero=regression, negative=removal | 2-1 done | MEDIUM |
| 3-3 | Measure carry-forward ratio | (analysis, not code) | On real Sprint, measure `translate(Prototype)` vs `carry-forward` proportion. If carry-forward > 50%, "prototype as source of truth" framing needs adjustment | Phase 2 done + real Sprint run | N/A |

**Key decision gate**: Phase 3-3 result determines whether Option C is justified.

### Adversarial Layer (from LLD Gap Analysis Phase 3)

| # | Task | File | Content | Risk |
|---|---|---|---|---|
| A-1 | Devil's Advocate agent definition | `.claude/agents/devils-advocate.md` (NEW) | 7 Adversarial Lenses + Negative Scenario Generator + severity classification + conditional execution | MEDIUM |
| A-2 | BDD adversarial scenarios | `deliverable-generator.md` | @adversarial tagged scenarios for invalid transitions, concurrent conflicts, invariant violations | LOW |
| A-3 | MSW state transition validation | `deliverable-generator.md` | MSW handlers validate transition legality when state-machines/ exists, return 422 on invalid | LOW |
| A-4 | Pipeline integration (Step 5-D) | `auto-sprint.md` | Devil's Advocate Pass after Scope Gate deliverables, before JP2 | MEDIUM |

**Estimated effort**: ~400 lines (300 new agent + 100 across existing files), 3-4 hours.

### Backlog (deferred, trigger-based)

| Item | Trigger Condition | Scope |
|---|---|---|
| FR-NFR contradiction Redirect improvement | Repeated Scope Gate FAIL on contradictions | auto-sprint.md Redirect logic |
| S3/S4 carry-forward tag preservation | carry-forward tags lost during Crystallize reconciliation | crystallize.md S3, S4 prompts |
| Worker integration test protocol | Worker merge conflicts in parallel execution | parallel.md Step 6 |
| Interface Contract protocol | Type mismatches between Workers | parallel.md Step 1 |
| GDPR/privacy checklist | PII-handling features encountered | scope-gate.md conditional check |
| Crystallize carry-forward verification | carry-forward items missing after Crystallize | crystallize.md S5 enhancement |
| Scope Gate deliverables coverage expansion | BDD/DBML/prototype not verified at deliverables stage | scope-gate.md |
| Prototype Lv3 → Lv3.5 (loading states) | Translation accuracy issues from missing loading states | deliverable-generator.md Stage 10 |
| Translation table expansion (15 → 25 rules) | Real Sprint encounters unmapped UX patterns | delta-driven-design.md Section 3 |
| Prototype Annotations | Prototype-inexpressible items (performance feel, real-time) cause problems | New file format |
| Handoff document for external teams | External team requests after seeing reconciled/ | crystallize.md or new /handoff command |

---

## Decision Gate: Option B → Option C

After Phase 3-3 (carry-forward ratio measurement on real Sprint):

| Result | Action |
|---|---|
| carry-forward < 30% | Prototype is truly source of truth. Option C justified — proceed to full Crystallize T1-T6 redesign |
| carry-forward 30-50% | Mixed. Option B sufficient with incremental improvements |
| carry-forward > 50% | Prototype is one input among many, not source of truth. Reframe language but keep current pipeline |

---

## Suggested Execution Order

```
Next:     Phase 2 (2-2 JP2 Before/After → 2-3 Translation Preview → 2-1 Delta Manifest → 2-4 carry-forward registry)
Then:     Phase 3-1, 3-2 (delta-typed verification)
Parallel: Adversarial Layer (A-1 through A-4) — independent of Phase 2-3
Gate:     Phase 3-3 (real Sprint measurement) → decide on Option C
```
