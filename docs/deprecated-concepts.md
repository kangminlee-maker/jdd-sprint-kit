# Deprecated Concepts

> **Document type**: Archive — concepts replaced by the Canonical + 3 Projections model
> **Version**: 1.0
> **Date**: 2026-03-04
> **Related**: [`canonical-projection-model.md`](canonical-projection-model.md) (replacement), [`delta-driven-design.md`](delta-driven-design.md) (original source)

---

## 1. Calculus Metaphor

**What it was**: A mathematical framing (DDD §5.1-5.3) that described Sprint Kit's pipeline using calculus concepts:
- Delta extraction = differentiation (extracting the rate of change)
- System restoration = integration (Brownfield + Delta + Carry-Forward = Complete System)
- Carry-forward = constant of integration (information lost when differentiating)
- Round-trip verification = fundamental theorem of calculus (differentiation and integration are inverse operations)

**Original mapping table**:

| Calculus | Delta-Driven Design |
|---|---|
| f(x) — original function | Complete System — target system |
| f'(x) — derivative | Delta — the change |
| ∫f'(x)dx — indefinite integral | Brownfield + Delta — sum of visible changes |
| C — constant of integration | Carry-Forward — non-visible requirements |
| C determined by initial/boundary conditions | Carry-Forward determined from PRD/Architecture/Brownfield |

**Why replaced**: The calculus vocabulary (differentiation, integration, constant of integration, fundamental theorem) added terminology overhead without explanatory benefit. Understanding calculus was not required to understand Sprint Kit's operations — the analogy was structurally valid but pedagogically unnecessary.

**What replaced it**: **Convergence** (canonical-projection-model.md §3). All pipeline stages are convergence processes: measure a gap, iterate until zero. This describes the same operations directly rather than through analogy.

**Original reference**: DDD v1.1 §5.1-5.3 ("Differentiation and Integration", "Carry-Forward as the Constant of Integration", "Round-Trip Verification = Fundamental Theorem of Calculus")

---

## 2. π Notation Projections

**What it was**: A projective geometry framing (DDD §5.4) that described the system as a high-dimensional object viewed through stakeholder-specific projections:

```
π_customer(S) = system as seen by customers (UI, interactions, flows)
π_developer(S) = system as seen by developers (API, DB, state machines)
π_security(S) = system as seen by security team (auth, authorization, encryption)
π_ops(S) = system as seen by operations (deployment, monitoring, scaling)
```

Carry-forward was defined as "the information lost in a particular projection's collapsed dimensions."

**Why replaced**: The π notation introduced an unbounded number of projections (π_customer, π_developer, π_security, π_ops, ...) without clear rules for which projections matter. In practice, Sprint Kit operates with exactly three projections. The mathematical notation obscured this simplicity.

**What replaced it**: **Three named projections** (canonical-projection-model.md §1): Code, Policy, Experience. Each maps to concrete Sprint Kit artifacts and source roles. The unbounded N-projection model is collapsed to a fixed, actionable set.

**Original reference**: DDD v1.1 §5.4 ("Prototype as Projection")

---

## 3. Constrained Optimization

**What it was**: A mathematical framing (DDD §5.5) that described Sprint Kit's decision structure as a constrained optimization problem:

```
maximize: π_customer(S)       ← customer experience (objective function)
subject to:
  π_security(S) ≥ threshold    ← security requirements (constraint)
  π_ops(S) ≥ threshold          ← operational requirements (constraint)
  π_perf(S) ≥ threshold         ← performance requirements (constraint)
```

The "empty feasible region" (constraint conflict) was mapped to NFR conflicts requiring business judgment at JPs.

**Original mapping table**:

| Mathematical Framing | Sprint Kit Counterpart |
|---|---|
| Objective function (π_customer) | FR — functional requirements |
| Constraints (π_security, π_ops, ...) | NFR — non-functional requirements |
| Feasible region | Design satisfying all NFRs while implementing FRs |
| Empty feasible region | NFR conflicts → business judgment required |
| Optimal solution selection | Judgment at JP1/JP2 |

**Why replaced**: The constrained optimization framing restated FR/NFR distinction in mathematical language without adding actionable insight. Sprint Kit already handles constraint conflicts through JP conflict resolution — naming this "constrained optimization" did not change the mechanism.

**What replaced it**: **JP conflict resolution** (described directly in JDD and the pipeline). When projections conflict (e.g., best customer experience violates a security requirement), JPs are the moments for business judgment. No mathematical framing needed.

**Original reference**: DDD v1.1 §5.5 ("Projection Hierarchy: Constrained Optimization")

---

## 4. Two Grammars as Primary Frame

**What it was**: The foundational conceptual model (DDD §2) describing software as existing at the intersection of two worlds:
- **User Grammar**: The language the system's actual users speak (screens, actions, API contracts)
- **Development Grammar**: The language of implementation (API endpoints, DB schemas, state machines)

Translation between these two grammars was Sprint Kit's core operation.

**Why replaced as primary frame**: Policy is neither User Grammar nor Development Grammar. It has its own speakers (legal, compliance, business strategists), its own grammar (regulations, terms, constraints), and its own validation method (review against regulations). Folding policy into Development Grammar made policy constraints invisible in the model.

**What replaced it**: **Three Projections** (canonical-projection-model.md §2): Experience (= User Grammar), Code (= Development Grammar), Policy (new). The Two Grammars model is preserved as **operational shorthand** in translation rules — "translate User Grammar to Development Grammar" remains valid as "translate Experience projection to Code projection."

**Original reference**: DDD §2 ("Two Grammars")

**Status**: The terms "User Grammar" and "Development Grammar" remain in active use within DDD §3 translation rules and the terminology map as operational shorthand. They are not deleted — their role shifts from primary conceptual frame to operational vocabulary.
