# Delta-Driven Design: Remaining Work

> **Date**: 2026-02-21
> **Status**: Phase 0-3 + Adversarial Layer complete. Backlog + Phase 3-3 (real Sprint measurement) remaining.
> **Completed commits**:
> - `da1118a` Phase 0: Documentation (delta-driven-design.md, terminology, JDD, blueprint)
> - `3d419ae` Phase 1: LLD Foundation (PRD format, Scope Gate, deliverable-generator, auto-sprint, crystallize, protocol)
> - `ce43767` Option B remaining work tracking
> - `64d7899` Phase 2: Crystallize mandatory + Delta Manifest + JP2 menu restructure
> - `a73e198` Phase 3: Delta-typed validation (judge-business §7 + crystallize S5b verification)
> - `14e7d0f` Adversarial Layer: Devil's Advocate agent + BDD + MSW + pipeline integration
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

### Phase 2: Delta Integration + Crystallize Mandatory ✅

| Task | File | Status |
|---|---|---|
| Crystallize mandatory (Purpose + When to Use rewrite) | `crystallize.md` | Done |
| S0 skip condition expansion (0 Comments → skip) | `crystallize.md` | Done |
| S5b Delta Manifest (7-field schema, 4-valued origin) | `crystallize.md` | Done |
| Crystallize FAIL recovery ([R]/[S]/[X]) | `crystallize.md` | Done |
| S6 Delta Summary table | `crystallize.md` | Done |
| Budget + Progress counters updated (/7→/8) | `crystallize.md` | Done |
| JP2 menu: [A]→[E] Elicitation + [A] Approve & Build | `auto-sprint.md` | Done |
| JP2 Section 1.5: What Changes for Users | `auto-sprint.md` | Done |
| Crystallize auto-execute on [A] Approve & Build | `auto-sprint.md` | Done |
| carry-forward registry in design.md | `deliverable-generator.md` | Done |
| Worker brownfield dynamic path + greenfield skip | `worker.md` | Done |
| validate.md Judge {specs_root} parameterization | `validate.md` | Done |
| JP2 response + Crystallize Flow mandatory | `jdd-sprint-protocol.md` | Done |
| 3 routes: Crystallize (auto) | `jdd-sprint-guide.md` | Done |
| preview.md: [A] Approve & Build + Crystallize auto | `preview.md` | Done |
| Blueprint: Mermaid + Crystallize section + JP2 table + routes + glossary | `blueprint.md` | Done |
| README: Mermaid + pipeline + descriptions | `README.md` | Done |
| delta-driven-design.md §11 update | `delta-driven-design.md` | Done |

### Phase 3: Validation ✅

| Task | File | Status |
|---|---|---|
| S5b delta completeness self-validation | `crystallize.md` | Done |
| §7 Delta Verification (delta-typed checks) | `judge-business.md` | Done |
| §7 Carry-forward verification (defined/deferred/new) | `judge-business.md` | Done |
| Input References {feature_dir}/ parameterization | `judge-business.md` | Done |

### Adversarial Layer ✅

| Task | File | Status |
|---|---|---|
| Devil's Advocate agent (7 Lenses + deduplication + conditional) | `devils-advocate.md` (NEW) | Done |
| Stage 6 adversarial-transitions.feature | `deliverable-generator.md` | Done |
| MSW state transition validation | `deliverable-generator.md` | Done |
| readiness.md endpoint_count | `deliverable-generator.md` | Done |
| Step 5-D pipeline integration | `auto-sprint.md` | Done |
| JP2 Section 3 adversarial results | `auto-sprint.md` | Done |
| §8 Adversarial Scenario Verification | `judge-business.md` | Done |
| Specs File Pattern update | `jdd-sprint-protocol.md` | Done |
| Crystallize S4 adversarial copy | `crystallize.md` | Done |

---

## Remaining

### Phase 3-3: Carry-Forward Ratio Measurement (requires real Sprint)

| # | Task | Content | Prerequisite |
|---|---|---|---|
| 3-3 | Measure carry-forward ratio | On real Sprint, measure `translate(Prototype)` vs `carry-forward` proportion from delta-manifest.md origin field | Real Sprint run with Crystallize |

**Decision gate**: Result determines Option C (full Crystallize T1-T6 redesign) viability.

### Backlog (deferred, trigger-based)

| Item | Trigger Condition | Scope |
|---|---|---|
| FR-NFR contradiction Redirect improvement | Repeated Scope Gate FAIL on contradictions | auto-sprint.md Redirect logic |
| S3/S4 carry-forward tag preservation | carry-forward tags lost during Crystallize | crystallize.md S3, S4 prompts |
| Worker integration test protocol | Worker merge conflicts in parallel execution | parallel.md Step 6 |
| Interface Contract protocol | Type mismatches between Workers | parallel.md Step 1 |
| GDPR/privacy checklist | PII-handling features encountered | scope-gate.md conditional check |
| Crystallize carry-forward verification | carry-forward items missing after Crystallize | crystallize.md S5 enhancement |
| Scope Gate deliverables coverage expansion | BDD/DBML/prototype not verified at deliverables stage | scope-gate.md |
| Prototype Lv3 → Lv3.5 (loading states) | Translation accuracy issues from missing loading states | deliverable-generator.md Stage 10 |
| Translation table expansion (15 → 25 rules) | Real Sprint encounters unmapped UX patterns | delta-driven-design.md Section 3 |
| Prototype Annotations | Prototype-inexpressible items (performance feel, real-time) cause problems | New file format |
| Handoff document for external teams | External team requests after seeing reconciled/ | crystallize.md or new /handoff command |
| regression_bdd field in Delta Manifest | BDD tagging system (@zero-delta) designed in Phase 3 | crystallize.md S5b schema extension |

---

## Decision Gate: Option C

After Phase 3-3 (carry-forward ratio measurement on real Sprint):

| Result | Action |
|---|---|
| carry-forward < 30% | Prototype is truly source of truth. Option C justified — full Crystallize T1-T6 redesign on `feature/option-c-crystallize-redesign` branch |
| carry-forward 30-50% | Mixed. Current pipeline sufficient with incremental improvements |
| carry-forward > 50% | Prototype is one input among many, not sole source of truth. Adjust framing |

**Option C branch**: `feature/option-c-crystallize-redesign` (created from main at ce43767, before Phase 2)

---

## Next Steps

```
All implementation phases complete (Phase 0-3 + Adversarial Layer).

Next:   Run a real Sprint to validate changes end-to-end
Then:   Phase 3-3 — measure carry-forward ratio from delta-manifest.md
Gate:   carry-forward ratio → decide Option C (full Crystallize T1-T6 redesign)
```
