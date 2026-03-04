# Canonical + 3 Projections Model

> **Document type**: Conceptual foundation — how Sprint Kit models services
> **Version**: 1.0
> **Date**: 2026-03-04
> **Related**: [`delta-driven-design.md`](delta-driven-design.md) (design theory), [`judgment-driven-development.md`](judgment-driven-development.md) (design philosophy), [`translation-ontology.md`](translation-ontology.md) (hypothesis system), [`blueprint.md`](blueprint.md) (product specification), [`terminology-map.md`](terminology-map.md) (term reference)

---

## 1. The Core Model

A service has a **canonical definition** — the complete, internally consistent description of what the service is and does. This canonical definition is not directly observable. Instead, it is observed through **projections**: partial views that reveal some aspects while hiding others.

Sprint Kit defines three projections:

| Projection | What it reveals | What it hides | Sprint Kit artifact |
|---|---|---|---|
| **Code** | Implementation: API endpoints, DB schema, state machines, algorithms, infrastructure | Customer experience, business policy rationale | Specs (requirements.md, design.md, tasks.md), Deliverables (api-spec.yaml, schema.dbml) |
| **Policy** | Business rules, regulatory constraints, terms of service, compliance requirements | Implementation details, customer experience | policy_docs, PCP (Policy Constraint Profile) |
| **Experience** | What the system's actual user sees and does: screens, interactions, API contracts, data flows | Internal implementation, policy rationale | Prototype (preview/), key-flows.md |

Each projection has two states:

| State | Meaning | Source |
|---|---|---|
| **as-is** | Current system state in this projection | Brownfield scan (Code), existing policy docs (Policy), current product (Experience) |
| **to-be** | Target system state in this projection | JP2-approved prototype (Experience), translated specs (Code), updated policies (Policy) |

The **canonical definition** is the union of all three projections. No single projection contains the complete service — each sees the service from its own angle, losing information from the other two.

---

## 2. Why Three Projections (Not Two)

Sprint Kit originally used a **Two Grammars** model: User Grammar (the user's world) and Development Grammar (the machine world). This model worked until ontology and policy sources were added.

### The Gap in Two Grammars

Policy is neither User Grammar nor Development Grammar:

| Aspect | User Grammar | Development Grammar | Policy |
|---|---|---|---|
| Who speaks it | System's actual users | Developers, AI coding agents | Legal, compliance, business strategists |
| What it expresses | Desired experience | Implementation details | Constraints, rules, boundaries |
| Validation method | Use the prototype | Test and verify | Review against regulations |

Policy was implicitly folded into Development Grammar as "NFR constraints." But policy has its own grammar, its own speakers, its own validation method. Treating it as a subset of Development Grammar made policy constraints invisible in the model.

### Mapping to the Original Model

The Three Projections model is an extension, not a replacement:

| Two Grammars (operational shorthand) | Three Projections |
|---|---|
| User Grammar | Experience projection |
| Development Grammar | Code projection |
| (implicit in Development Grammar) | Policy projection |

The terms "User Grammar" and "Development Grammar" remain valid as operational shorthand in translation rules (DDD §3). The Three Projections model makes the conceptual structure explicit.

---

## 3. Convergence

Every stage of Sprint Kit's pipeline is a **convergence process**: measuring a gap and iterating until the gap reaches zero.

| Pipeline Stage | What converges | Gap measure | Zero means |
|---|---|---|---|
| **Phase 1 (BMad)** | Problem understanding → solution direction | Completeness of planning artifacts | Ready for JP1 |
| **JP1** | Intent alignment between product expert and generated artifacts | Comment count: 0 = [S], >0 = iterate | Direction confirmed |
| **JP2** | Experience alignment between product expert and prototype | Comment count: 0 = [S], >0 = iterate | Target confirmed |
| **Crystallize S3** | Consistency between prototype and brownfield constraints | Finding count: 0 = PASS, >0 = resolve | All conflicts resolved |
| **Crystallize S7** | Cross-artifact consistency after translation | Gap count: 0 = PASS, >0 = fix | All artifacts aligned |
| **Validate** | Implementation correctness against specs | Failure count: 0 = PASS, >0 = fix | Implementation verified |

### Why Convergence Replaces the Calculus Metaphor

The previous mathematical framing (DDD §5, now archived in [`deprecated-concepts.md`](deprecated-concepts.md)) described the pipeline using calculus concepts: differentiation, integration, constant of integration, fundamental theorem. While structurally valid as analogy, the calculus vocabulary added terminology overhead without explanatory benefit.

Convergence describes the same structure directly:
- "Measuring a gap" replaces "differentiation"
- "Iterating until zero" replaces "integration"
- "Information missing from one projection" replaces "constant of integration"
- "Gap reaches zero" replaces "fundamental theorem of calculus"

The operations are identical. The description is direct rather than analogical.

---

## 4. Carry-Forward as Projection Gaps

**Carry-forward** is information that exists in one projection but has no counterpart in another.

| Carry-forward type | Where it exists | Where it is absent | Example |
|---|---|---|---|
| NFR (performance, scalability) | Code as-is, Policy | Experience | "Response time < 200ms" — invisible in prototype |
| Security (auth, encryption) | Code as-is, Policy | Experience | "AES-256 encryption at rest" — invisible in prototype |
| Migration (data transformation) | Code as-is | Experience, Policy | "Migrate legacy CHAR(1) status to INT enum" — invisible in both |
| Regulatory compliance | Policy | Experience | "Data retention max 3 years" — invisible in prototype |
| Operations (monitoring, scaling) | Code as-is | Experience, Policy | "Auto-scale at 80% CPU" — invisible in both |

The Three Projections model makes carry-forward structurally obvious: it is precisely the set of information that falls outside the Experience projection but inside Code or Policy projections. This is why carry-forward is mandatory — translating the Experience projection alone produces an incomplete Code projection.

Carry-forward lifecycle is unchanged. See DDD §3 for lifecycle stages and injection rules.

---

## 5. Translation Reframed

Translation in Sprint Kit converts the Experience projection (to-be) into the Code projection (to-be), constrained by the Code projection (as-is):

```
translate(Experience_to_be, CP) → Code_to_be (partial)
  + carry-forward(Policy_to_be, Code_as_is non-Experience items)
  → Code_to_be (complete)
```

Where:
- `Experience_to_be` = JP2-approved prototype
- `CP` = Constraint Profile (patterns from Code_as_is that must be preserved)
- `Policy_to_be` = carry-forward items from Policy projection
- `Code_as_is non-Experience items` = carry-forward items from existing Code projection (NFR, security, operations)

Translation rules are unchanged. See DDD §3 for the mapping table.

---

## 6. Delta Reframed

Delta is the difference between two states of the Code projection:

```
Delta = Code_to_be − Code_as_is
```

Each delta item is a change in the Code projection. Delta types (positive, modification, negative, zero) and the delta manifest format are unchanged. See DDD §4 for delta classification.

Each projection offers its own view of the same underlying delta:
- **Code view**: API endpoints to add/modify/remove, DB columns to migrate, state machines to update
- **Policy view**: compliance rules that the delta must satisfy, regulatory constraints on the change
- **Experience view**: screens that change, flows that are added/removed, interactions that differ

These are not three separate deltas — they are three perspectives on a single delta.

---

## 7. Projection Metadata as Development Roadmap

Each projection's **metadata** — structured information about the projection's content — defines what Sprint Kit can reason about. The completeness of metadata is the upper bound of Sprint quality: Sprint Kit cannot generate specs for aspects it cannot observe.

### Current Metadata Coverage

| Projection | Metadata Source | Current Coverage | Gap |
|---|---|---|---|
| **Code** | Brownfield scan (L1-L4), Constraint Profile (CP.1-CP.7), `--add-dir`, tarball | High for backend code; lower for infra/ops | Infrastructure-as-code, CI/CD pipelines, monitoring configs |
| **Policy** | `policy_docs` field, PCP (PCP.1-PCP.5) | Partial — requires explicit policy documents | Implicit policies not documented, cross-regulation interactions |
| **Experience** | Prototype (preview/), key-flows.md, Figma (MCP) | High for UI-based systems | Non-visual user types (API consumers, data pipelines) have lower prototype fidelity |

### Source Roles Map to Projections

The source roles declared in brief-template.md frontmatter map directly to projections:

| Source Role | Primary Projection | Secondary Projection |
|---|---|---|
| `backend` | Code | — |
| `client` | Code + Experience | — |
| `code` | Code + Experience | — |
| `ontology` | Code (L1 terms) | Experience (UI labels) |
| `design-system` | Experience (UI patterns) | Code (component structure) |
| `policy` | Policy | — |
| `svc-map` | Experience (flows) | Code (service boundaries) |
| `figma` | Experience (design) | — |

---

## 8. Relationship to Existing Documents

| Document | Role | What it covers |
|---|---|---|
| **This document** | Conceptual foundation | How Sprint Kit models services: canonical definition, 3 projections, convergence |
| [`delta-driven-design.md`](delta-driven-design.md) | Design theory | Translation rules, delta types, carry-forward lifecycle, FP/DJ principles, methodology comparison |
| [`judgment-driven-development.md`](judgment-driven-development.md) | Design philosophy | Why human judgment matters, JP design, artifact-as-medium, regeneration principle |
| [`translation-ontology.md`](translation-ontology.md) | Hypothesis system | What assumptions the model rests on, derivation paths, falsifiability conditions |
| [`blueprint.md`](blueprint.md) | Product specification | Full product description for users: sections, flows, configuration |
| [`terminology-map.md`](terminology-map.md) | Term reference | Korean-English canonical term mapping |

This document does **not** redefine translation rules, delta types, or carry-forward lifecycle — those belong to DDD. It provides the conceptual frame that makes these mechanisms structurally motivated rather than ad-hoc.
