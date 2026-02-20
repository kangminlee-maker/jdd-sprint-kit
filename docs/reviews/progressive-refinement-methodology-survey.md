# Progressive Abstraction Refinement: Methodology Survey

> **Document type**: Research survey — methodology taxonomy + multi-pass refinement analysis
> **Date**: 2026-02-20
> **Trigger**: LLD Gap Analysis required understanding of how methodologies handle abstraction lowering
> **Related**: `lld-gap-analysis-and-implementation-plan.md`

---

## 1. Taxonomy: 11 Categories of Refinement Approaches

Every software system transitions from "idea" to "code". The question is HOW abstraction is lowered at each step, and what CONTROLS prevent information loss during refinement.

### Category Overview

| # | Category | Core Principle | Refinement Direction | AI Compatibility |
|---|---|---|---|---|
| 1 | Top-Down Decomposition | Define the whole first, decompose into parts | Downward | Low |
| 2 | Iterative/Incremental | Refine all levels simultaneously, a little at a time | Spiral | Medium |
| 3 | Emergent Design | Write code, discover design through refactoring | **Upward** | Low |
| 4 | Domain-Driven | Domain model is the heart; technology serves the domain | Core → outward | Medium |
| 5 | Contract-First | Agree on interfaces first; implement independently in parallel | Middle → outward | **High** |
| 6 | Behavior-First | Define expected behaviors first; implement to satisfy them | Outside → inward | **High** |
| 7 | Event-First | Business is a sequence of events; derive structure from events | Timeline → structure | Medium |
| 8 | Prototype-First | Users respond accurately to concrete artifacts, not abstract questions | Outside → inward | **High** |
| 9 | Spec-Driven | Specification is the source of truth; code is a derived artifact | Downward | **Very High** |
| 10 | Constraint-Driven | Define constraints/fitness functions; design must satisfy them | Boundary → interior | Medium |
| 11 | AI-Native | AI implements, humans judge | Downward + Bounce | **Highest** |

---

### 1.1 Top-Down Decomposition

**Methodologies**: Waterfall (Royce 1970), V-Model (German IABG 1990s), IEEE 12207, MIL-STD-498, DO-178C

**Context of emergence**: Large government/defense IT projects in the 1970s-80s needed predictable processes with traceable accountability. The cost of discovering errors late was catastrophic (e.g., aircraft software).

**Philosophy**: "If we define everything correctly upfront, implementation is mechanical translation." Assumes requirements can be fully known before design begins.

**Abstraction lowering**:
```
Requirements (SRS) → System Design (SDD) → Detailed Design (LLD) → Code
```

**Controls**: Traceability Matrix (requirements ↔ design ↔ code ↔ tests), Phase Gate Reviews

**When to use**: Stable requirements, regulatory compliance required (aviation, medical, nuclear). Cost of late-stage change is catastrophic.

**When NOT to use**: Uncertain requirements, need for user feedback, exploratory development.

---

### 1.2 Iterative/Incremental Refinement

**Methodologies**: RUP (IBM), Spiral Model (Boehm 1986), SAFe, DSDM

**Context of emergence**: Waterfall's "discover problems only at the end" caused cost explosions. Boehm's Spiral Model (1986) introduced risk-driven iteration. RUP formalized this into 4 phases (Inception → Elaboration → Construction → Transition).

**Philosophy**: "We cannot know everything upfront, but we can identify and resolve the highest risks first." Risk drives the process, not documents or code.

**Abstraction lowering**: Each iteration refines ALL abstraction levels simultaneously:
```
Iteration 1: Vision → rough architecture → core prototype → key risk resolution
Iteration 2: Refined requirements → architecture baseline → more features → more risks resolved
...
Iteration N: Stable requirements → final architecture → complete system → deployment
```

**Controls**: Milestone Reviews (LCO, LCA, IOC), risk-driven iteration planning, demos at each iteration end.

**When to use**: Large organizations, high-risk projects, requirements that clarify gradually.

**When NOT to use**: Small teams where ceremony overhead exceeds value. Fast time-to-market needs.

---

### 1.3 Emergent Design

**Methodologies**: XP (Beck 1999), Shape Up (Basecamp 2019), Mob Programming, Vibe Coding (2024~)

**Context of emergence**: In the late 1990s, heavyweight processes (RUP, Waterfall) were failing for small teams building web applications. Kent Beck proposed that design should "emerge" from simple code through continuous refactoring, guided by tests.

**Philosophy**: "The simplest design that passes all tests is the best design. More design will emerge as needed through refactoring." Assumes skilled developers can discover good design through code.

**Abstraction lowering**: **Reversed** — starts at code level, rises to design:
```
User Story → minimal test → minimal code → refactor → discover patterns → emerge architecture
```

**Controls**: TDD (tests as behavioral specification), Continuous Integration, Pair/Mob Programming.

**When to use**: Small, skilled teams. Uncertain requirements where exploration is needed. Fast feedback environments.

**When NOT to use**: Large distributed teams. Regulated domains. **AI-driven development** (AI is weak at discovering design through refactoring — see AI Compatibility section).

---

### 1.4 Domain-Driven Refinement

**Methodologies**: DDD Strategic Design (Evans 2003), DDD Tactical Design, Context Mapping

**Context of emergence**: Eric Evans observed that complex business software fails not from technical issues but from misunderstanding the domain. Software models that don't match the business domain create translation costs that compound over time.

**Philosophy**: "The domain model is the heart of the software. All technical decisions serve the domain. Developers and domain experts must share the same language (Ubiquitous Language)."

**Abstraction lowering**:
```
Strategic Design (Bounded Contexts, Core/Supporting/Generic classification)
  → Tactical Design (Aggregates, Entities, Value Objects, Domain Events)
    → Application Layer (Application Services, Command/Query Handlers)
      → Infrastructure Layer (Repositories, ORM, Message Brokers)
```

**Controls**: Ubiquitous Language (prevents translation errors), Bounded Context boundaries (explicit contracts between contexts), Continuous Model Refinement.

**When to use**: Complex business domains. Long-lived systems requiring deep domain understanding. Domain experts available for collaboration.

**When NOT to use**: Simple CRUD applications. No access to domain experts. Rapid prototyping priority.

---

### 1.5 Contract-First Refinement

**Methodologies**: API-First Design (OpenAPI/Swagger), Schema-First (GraphQL SDL, DBML), Design by Contract (Meyer/Eiffel), Consumer-Driven Contracts (Pact), Specmatic

**Context of emergence**: As systems became distributed (SOA, microservices), teams needed to work independently while ensuring their components would integrate correctly. Defining interfaces before implementation enables parallel, independent development.

**Philosophy**: "If we agree on the contract (interface), each side can implement independently. The contract is the only thing that must be correct; implementation details are private."

**Abstraction lowering**:
```
Domain Analysis → Contract Definition (OpenAPI, GraphQL SDL, DBML)
  → Mock Generation (MSW, Prism) → Independent Implementation → Contract Verification
```

**Controls**: Contract Testing (Specmatic, Pact — automated verification that implementation matches contract), Schema Validation (runtime data matches schema), Precondition/Postcondition/Invariant (DbC).

**When to use**: Frontend/backend split development. Microservices. Multi-team parallel development. External API publication.

**When NOT to use**: Solo developer projects. Early exploration where contracts are unknown.

**AI compatibility note**: Contract-First is the **most universally combinable** category — it combines well with almost every other approach. For AI specifically, contracts serve as "verifiable answer keys" that control AI's non-determinism.

---

### 1.6 Behavior-First Refinement

**Methodologies**: BDD (Dan North 2006), TDD (Kent Beck), ATDD, Specification by Example (Gojko Adzic)

**Context of emergence**: Traditional requirements documents were ambiguous, leading to implementations that "met the spec" but not the intent. Dan North proposed describing behavior with concrete examples (Given/When/Then) that both business and technical people could understand.

**Philosophy**: "If we define HOW the system should behave with concrete examples, implementation becomes the process of making those examples pass. The examples ARE the specification."

**Abstraction lowering**:
```
Feature Definition → Concrete Scenarios (Gherkin Given/When/Then)
  → Step Definitions (test automation code) → Implementation → Refactoring
```

**Controls**: Living Documentation (Gherkin scenarios are executable specs), Red-Green-Refactor cycle, Three Amigos sessions (Business + Dev + QA write scenarios together), Example Mapping.

**When to use**: Complex business logic. Communication between business and development is critical. Long-lived systems requiring regression safety.

**When NOT to use**: UI-focused prototyping. Very early exploration where requirements are unknown.

---

### 1.7 Event-First Refinement

**Methodologies**: Event Storming (Brandolini 2013~), Event Modeling (Dymitruk), CQRS, Event Sourcing

**Context of emergence**: Traditional entity-centric modeling (ERD) fails to capture temporal business logic — "what happens, in what order, and why." Alberto Brandolini proposed modeling systems as sequences of business events.

**Philosophy**: "Business is a sequence of events (things that happen). By identifying events first, we discover commands (causes), read models (consequences), and policies (automatic rules). System structure emerges from event flow."

**Abstraction lowering**:
```
Big Picture (Domain Event Timeline) → Process Modeling (Commands + Events + Policies + Read Models)
  → Design Level (Aggregates, Bounded Contexts) → Implementation (Event Handlers, Projections)
```

**Controls**: Event consistency (all state changes traceable as events), Aggregate invariants, Event schema evolution (backward compatibility).

**When to use**: Complex business processes with temporal logic. Audit trail requirements. Microservice domain decomposition.

**When NOT to use**: Simple CRUD. Domains where event concept is unnatural. Immediate consistency required.

---

### 1.8 Prototype-First Refinement

**Methodologies**: Design Sprint (Google Ventures 2010), Lean UX (Gothelf), Lean Startup Build-Measure-Learn (Ries 2011), Rapid Prototyping

**Context of emergence**: Google's product teams found that weeks of debate could be resolved in days by building and testing a prototype. IDEO's design thinking + Basecamp's "Getting Real" philosophy converged into structured rapid prototyping.

**Philosophy**: "Users respond inaccurately to abstract questions but accurately to concrete artifacts. Build the artifact first, then derive requirements from observed reactions."

**Abstraction lowering**:
```
Problem Definition → Prototype Creation → User Testing → Requirement Derivation → Implementation
```

**Controls**: Think-Make-Check cycle, Usability Testing, A/B Testing, 5-day Design Sprint time constraint.

**When to use**: New products/markets. UX as core differentiator. Uncertain user needs. AI era (fast prototype generation via v0, Bolt.new, Lovable).

**When NOT to use**: Backend-logic-heavy systems. Regulatory domains. Non-functional requirements that prototypes can't demonstrate (performance, security).

---

### 1.9 Spec-Driven Refinement

**Methodologies**: GitHub Spec Kit (2025.10), Kiro (AWS 2025.07), Tessl (2025), BMad Method, OpenSpec

**Context of emergence**: AI coding assistants commoditized code generation, shifting the engineering bottleneck from "writing syntax" to "defining intent." Thoughtworks Technology Radar Vol.32 (2025) formalized this as Spec-Driven Development (SDD).

**Philosophy**: "Specification is the primary artifact. Code is generated from specification and is a secondary, derived artifact. Humans think (write specs), AI executes (generate code)."

**Three SDD maturity levels** (Thoughtworks classification):

| Level | Description | Spec-Code Relationship |
|---|---|---|
| Spec-First | Write spec before coding; spec guides AI generation | Spec → Code (one-way, may drift over time) |
| Spec-Anchored | Spec and code synchronized throughout lifecycle | Spec ↔ Code (bidirectional sync maintained) |
| Spec-as-Source | Spec IS the source; code is compiled output, never manually edited | Spec = Source → Code = Build artifact |

**Tool positioning**:

| Tool | SDD Level | Refinement Steps |
|---|---|---|
| Kiro (AWS) | Spec-First | Requirements → Design → Tasks → Implementation |
| GitHub Spec Kit | Spec-First | Specify → Plan → Tasks → Build |
| Tessl | Spec-Anchored ~ Spec-as-Source | Spec → Code (with `// GENERATED FROM SPEC - DO NOT EDIT`) |
| BMad Method | Spec-First | Brief → PRD → Architecture → Epics → Stories |
| JDD Sprint Kit | Spec-Anchored (via Crystallize) | See Section 3 |

**Controls**: Spec-Code Traceability, Constitution/Guardrails (invariant principles), Scope Gate, Regeneration over Modification.

**When to use**: AI agents handle implementation. Large-team spec-based collaboration. Regulatory compliance + AI implementation intersection.

**When NOT to use**: Exploratory prototyping where spec itself is uncertain. Very fast-changing requirements where spec maintenance cost exceeds value.

---

### 1.10 Constraint-Driven Refinement

**Methodologies**: Evolutionary Architecture + Fitness Functions (Ford/Parsons/Kua), Theory of Constraints (Goldratt), ArchUnit, SLO/SLA-based Design

**Context of emergence**: Long-lived systems accumulate architectural debt. Neal Ford et al. proposed that architecture should be guided by automated "fitness functions" that continuously verify architectural properties.

**Philosophy**: "Define what the system MUST satisfy (constraints), measure compliance automatically, and evolve the design within those constraints. Architecture is not a destination but a continuous journey."

**Abstraction lowering**:
```
Constraint Identification → Fitness Function Definition → Architecture Decisions (ADRs)
  → Implementation → Fitness Function Execution → Evolution
```

**Controls**: Automated Fitness Functions (in CI/CD), ArchUnit tests, SLO monitoring, ADR history.

**When to use**: Long-lived evolving systems. NFRs (performance, security, maintainability) are critical. Architecture debt management.

**When NOT to use**: Initial MVP stage. New domains where constraints are unknown.

---

### 1.11 AI-Native Refinement

**Methodologies**: V-Bounce Model (Hymel 2024), JDD Sprint Kit, Agentic SDLC (2025~)

**Context of emergence**: AI code generation reached production quality (2024-2025), fundamentally changing the economics of software development. The role of humans shifted from "implementer" to "judge/verifier."

**Philosophy**: "AI implements, humans judge. Implementation cost is near-zero, so human time should be spent exclusively on judgment — deciding WHAT to build and WHETHER what was built is correct."

**Abstraction lowering**:
```
Human defines intent → AI generates all artifacts → Human judges → AI refines → Human confirms
  → AI implements production code → AI+Human validate
```

**Controls**: Human-in-the-loop Checkpoints (JP1, JP2), Context Engineering (quality of AI input), Regeneration over Modification, Specification as Prompt, Observability of AI agent actions.

**When to use**: AI coding agents available. Product experts building software without developers. Any environment where implementation talent is scarce but judgment talent exists.

**When NOT to use**: Regulated domains requiring human-written code certification (current limitation). No internet/AI access.

---

## 2. AI Compatibility Assessment

### 2.1 Assessment Criteria

AI compatibility was evaluated on 5 dimensions:

| # | Criterion | What It Measures | Why It Matters for AI |
|---|---|---|---|
| C1 | **Structured Artifacts** | Does the methodology produce machine-parseable outputs? (OpenAPI, Gherkin, DBML, etc.) | AI generates more accurate code from structured input than natural language prose |
| C2 | **Verification Automation** | Can refinement results be verified automatically? (contract tests, BDD, fitness functions) | AI output is non-deterministic (same input → different code). Without automated verification, humans must check every generation |
| C3 | **AI Strength Alignment** | Does the refinement direction align with what AI does well (generation, pattern matching) vs poorly (discovery, context maintenance, emergence)? | AI excels at "generate code from given spec" but struggles with "discover better design from existing code" |
| C4 | **Human Judgment Isolation** | Can human judgment be isolated to specific checkpoints? Or must humans participate throughout? | If human involvement is distributed across the entire process, AI has no autonomous execution window |
| C5 | **Regeneration Affinity** | Does the methodology naturally support "regenerate" over "modify"? | AI's core economic advantage is that regeneration cost is low. Modification-centric methodologies don't leverage this |

### 2.2 Per-Category Assessment

| Category | C1 Structured | C2 Auto-verify | C3 AI Strength | C4 Judgment Isolation | C5 Regeneration | **Overall** |
|---|---|---|---|---|---|---|
| 1. Top-Down | Low (prose docs) | Low (human reviews) | Partial (decompose OK, discover NO) | Low (human approval every phase) | Low (modification culture) | **Low** |
| 2. Iterative | Medium (UML models) | Medium (demos + some automation) | Medium (AI per iteration, risk judgment human) | Medium (milestones human, rest AI) | Medium (iteration ≈ regeneration) | **Medium** |
| 3. Emergent | Low (code = artifact) | High (TDD/CI) | **Low** (AI weak at design discovery via refactoring) | Low (pair/mob = constant human) | Low (evolution, not regeneration) | **Low** |
| 4. Domain-Driven | Medium (Context Map structured) | Medium (Aggregate invariants testable) | Partial (tactical OK, strategic human) | Medium (strategic human, rest AI) | Low (domain model evolves) | **Medium** |
| 5. Contract-First | **High** (OpenAPI, DBML) | **High** (Specmatic, Pact) | **High** (generate from contract = AI core) | **High** (contract def human, impl AI) | **High** (contract-based regen natural) | **High** |
| 6. Behavior-First | **High** (Gherkin) | **High** (executable scenarios) | **High** (pass tests = AI strength) | **High** (scenarios human, impl AI) | **High** (scenario change → regen) | **High** |
| 7. Event-First | Medium (event model) | Medium (event sourcing verifiable) | Partial (handlers OK, discovery human) | Medium (Big Picture human, rest AI) | Low (event schema backward compat) | **Medium** |
| 8. Prototype-First | Medium (prototype code) | Low (user testing = human) | **High** (AI prototype gen very fast) | **High** (prototype AI, judgment human) | **High** (prototype regen cost ≈ 0) | **High** |
| 9. Spec-Driven | **Very High** (structured specs) | **High** (Scope Gate, contracts) | **Very High** (spec = AI prompt) | **Very High** (spec review human, rest AI) | **Very High** (spec change → regen = core principle) | **Very High** |
| 10. Constraint-Driven | High (fitness functions as code) | **High** (automated fitness execution) | Partial (execution AI, constraint def human) | Medium (constraint def human, execution AI) | Medium (evolution, but fitness auto-runs) | **Medium** |
| 11. AI-Native | **High** (designed for AI consumption) | **High** (JP + automated verification) | **Highest** (designed for AI as implementer) | **Highest** (human = judge only) | **Highest** (regen > modify = design principle) | **Highest** |

### 2.3 Why Emergent Design Has Low AI Compatibility

This is the most counter-intuitive rating. XP/TDD is modern, emphasizes test automation, and has high developer satisfaction. Why doesn't it work with AI?

**Reason 1: AI is weak at design discovery through refactoring.** Emergent Design's core premise is "write code, then discover better abstractions through refactoring." AI excels at "generate code from given spec" but struggles with "look at these 3 classes and extract a common pattern." Refactoring requires maintaining full codebase context and making aesthetic/structural judgments that current AI handles inconsistently.

**Reason 2: Modification vs Regeneration.** Emergent Design evolves code incrementally (modify existing code). AI's economic advantage is regeneration (generate from scratch). Asking AI to understand existing code and make surgical modifications is harder and less reliable than giving it a spec and generating fresh code.

**Reason 3: Constant human involvement.** XP assumes pair/mob programming — humans collaborating in real-time. If you pair-program with AI, you must engage at every moment, losing AI's autonomous execution advantage.

### 2.4 Why Contract-First is the Universal AI Partner

In the combination compatibility matrix, Contract-First combines well with almost every category (O in nearly all cells). For AI specifically:

- Contracts (OpenAPI, Gherkin, DBML) are **machine-readable answer keys**
- No matter what code AI generates, if it passes contract tests, it's a correct implementation
- This is the only structural mechanism to control AI's non-determinism (same spec → different code)
- Therefore, adding Contract-First to ANY methodology improves its AI compatibility

This is why Sprint Kit uses Contract-First (api-spec.yaml + Specmatic) as a core pillar.

---

## 3. Multi-Pass Refinement: Sprint Kit's 3-Pass Pattern

### 3.1 Sprint Kit's Pattern Defined

| Pass | Name | Direction | Nature | Human Input |
|---|---|---|---|---|
| 1 | **Generative** | Downward (abstract → concrete) | Creating artifacts that didn't exist | JP1: requirements judgment |
| 2 | **Reconciliatory** | **Bidirectional** (concrete ↔ abstract) | Aligning built with planned | JP2: experience judgment |
| 3 | **Realization** | Downward (spec → code) | Making confirmed design real | None (AI autonomous) |

### 3.2 Comparison with Other Multi-Pass Methodologies

| Methodology | # Passes | 2nd Pass Nature | Reconciliatory Pass? | Philosophy |
|---|---|---|---|---|
| V-Model | 2 | **Verification** (does it match plan?) | No — plan is immutable | Define correctly upfront |
| V-Bounce (2024) | N (fast loops) | **Verification** (AI output check) | No — no systematic bidirectional alignment | AI bounces through implementation |
| W-Model | 2 (parallel) | **Early testing** (test alongside development) | No | Test earlier, not just later |
| Spiral | N (spirals) | **Risk resolution** (address highest risk) | No — same-shaped passes repeat | Risk drives the process |
| Double Diamond | 2 | **Solution exploration** (2nd diamond) | No — no upstream artifact update | Separate problem and solution space |
| Design Sprint | 1 + test | **User testing** (prototype reaction) | No — no upstream artifact update | Prototype reveals truth |
| Shape Up | 2 + breaker | **Building** (team implements) | No — team adjusts implicitly | Fixed time controls scope |
| Lean BML | N (loops) | **Market measurement** (real customer data) | No — next loop's hypothesis changes | Learn from market reality |
| PDCA | N (cycles) | **Check** (observe results) | Partial — Act adjusts Plan | Scientific method applied |
| SDD Spec-Anchored | Continuous | **Bidirectional sync** (spec ↔ code) | Yes — continuous | Spec and code always aligned |
| Kiro | 1 + manual refine | **Manual edit** (user updates spec) | No — one-directional manual update | Structured spec generation |
| **Sprint Kit** | **3** | **Reconciliation** (bidirectional realignment) | **Yes — explicit dedicated pass** | Judgment is the lasting asset |

### 3.3 What Makes Sprint Kit's 2nd Pass Unique

Most methodologies' 2nd pass is **verification** — "did we build what we planned?" If the answer is "no", you go back to pass 1.

Sprint Kit's 2nd pass is **reconciliation** — the prototype reveals realities that the plan didn't anticipate, and these realities are **back-propagated to ALL upstream artifacts**. The `reconciled/` directory contains a complete, internally consistent artifact set where plan and prototype are aligned.

This is not verification (checking). It is restructuring (realigning).

### 3.4 Philosophical Underpinning

**Closest analog: Peirce's Logic of Inquiry** (not Hegel's dialectic)

| Peirce | Sprint Kit | Activity |
|---|---|---|
| Abduction (hypothesis generation) | Pass 1 (Generative) | Generate best explanation/design from inputs |
| Deduction (predict from hypothesis) | Prototype | Deduce what the design looks like when realized |
| Induction (revise from observation) | Pass 2 (Reconciliatory) | Inductively revise upstream from prototype observations |

Why Peirce over Hegel: Hegel's dialectic pursues "ascending truth" (thesis → antithesis → synthesis → higher thesis...). Sprint Kit pursues "pragmatic hypothesis refinement" — converging toward a practical solution, not ascending toward abstract truth. The direction is practical, not philosophical.

### 3.5 Why This Pattern Emerged in the AI Era

The Reconciliatory pass requires **regenerating the entire artifact set**. This was economically impossible before AI:

| Era | Artifact regeneration cost | Possible pass structure |
|---|---|---|
| Pre-AI | Weeks to months | Verification only (stop at finding problems) → V-Model |
| Early AI (2023-24) | Hours to days | Faster verification loops → V-Bounce |
| AI-Native (2025-26) | Minutes to hours | Full reconciliation (find + realign + regenerate) → Sprint Kit |

AI lowered generation cost enough that "verification" (finding problems, stopping) could be upgraded to "reconciliation" (finding + fixing + realigning). This is the methodological significance of Sprint Kit's 3-pass pattern.

### 3.6 The Reconciliatory Pass is MORE Important with AI Generation

Three reasons:

1. **Inter-artifact drift**: When humans create artifacts, one brain maintains implicit consistency. When AI generates artifacts independently, structural drift between artifacts is inherent. Reconciliation is the only systematic mechanism to resolve this drift.

2. **Discovery through concretization**: AI-generated prototypes often contain features/patterns not explicitly requested (from AI's inference). Some are valuable discoveries. Reconciliation formally integrates these discoveries into upstream artifacts.

3. **Spec-code drift resolution**: SDD's core challenge (spec-code drift) is resolved at prototype stage (low cost) rather than production stage (high cost).

---

## 4. Combination Compatibility Matrix

(O = combines well, X = conflicts, △ = partial combination possible)

|  | Top-Down | Iterative | Emergent | DDD | Contract | Behavior | Event | Prototype | Spec-Driven | Constraint | AI-Native |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Top-Down** | - | △ | X | △ | O | △ | △ | X | O | O | △ |
| **Iterative** | △ | - | △ | O | O | O | O | O | O | O | O |
| **Emergent** | X | △ | - | △ | △ | O | △ | △ | X | △ | X |
| **DDD** | △ | O | △ | - | O | O | O | △ | O | O | △ |
| **Contract** | O | O | △ | O | - | O | O | O | O | O | O |
| **Behavior** | △ | O | O | O | O | - | O | O | O | O | O |
| **Event** | △ | O | △ | O | O | O | - | △ | O | O | △ |
| **Prototype** | X | O | △ | △ | O | O | △ | - | O | △ | O |
| **Spec-Driven** | O | O | X | O | O | O | O | O | - | O | O |
| **Constraint** | O | O | △ | O | O | O | O | △ | O | - | O |
| **AI-Native** | △ | O | X | △ | O | O | △ | O | O | O | - |

**Key observations**:
- **Contract-First** is the most universally combinable (O in nearly all cells)
- **Behavior-First** also has high combination compatibility
- **Emergent Design** conflicts with most pre-definition approaches
- **Spec-Driven + AI-Native** is a natural pair (spec = AI prompt)

---

## 5. Sprint Kit's Position: 4-Category Hybrid

Sprint Kit deliberately combines 4 categories:

| Sprint Kit Phase | Primary Category | Supporting | Role |
|---|---|---|---|
| Phase 0-1 (BMad Pipeline) | **Spec-Driven** | Top-Down | AI auto-generates all planning artifacts |
| JP1 | **AI-Native** | — | Human judges requirements (customer lens) |
| Deliverables | **Contract-First** + **Behavior-First** | Spec-Driven | OpenAPI contracts + BDD scenarios + Prototype |
| JP2 | **Prototype-First** | AI-Native | Human judges experience on concrete prototype |
| Crystallize | Spec-Driven (bidirectional) | — | Prototype ↔ spec reconciliation |
| Parallel | Contract-First | AI-Native | Contract-based parallel implementation |
| Validate | Behavior-First + Constraint-Driven | — | BDD + quality/security/business verification |

### What Sprint Kit Uniquely Combines

| Unique Element | Absent in Other Methods | Sprint Kit's Solution |
|---|---|---|
| Bidirectional refinement (spec → prototype → spec) | Spec-Driven is unidirectional; Prototype-First doesn't update specs | Crystallize back-propagates prototype reality to upstream artifacts |
| Judgment-based checkpoints (for non-developers) | Reviews assume technical expertise | JP1/JP2 require only customer-lens judgment |
| Regeneration cost transparency | Most methods don't quantify change cost | Comment → Impact Analysis presents fix/regenerate costs before user decides |
| Brownfield auto-collection | Most methods analyze existing systems manually | L1-L4 automatic scan of existing code/API/domain |
| Entropy Tolerance + File Ownership | No parallel conflict prevention | Per-task file ownership + change tolerance predefined |

---

## 6. Historical Evolution

```
1970s  Waterfall (sequential top-down) ──────────────────┐
1980s  Spiral (risk-driven iteration) ───────────────────┤
1990s  RUP (structured iteration) + DDD (domain center) ─├── Human-centric refinement
2000s  XP (emergence) + BDD (behavior) + Event Storming ─┤
2010s  Design Sprint (prototype) + SAFe (scale) ─────────┘
                                                          │
2024   V-Bounce (AI implementation assumed) ──────────────┐
2025   SDD emergence (Spec-Driven) ───────────────────────├── AI-era refinement
2025~  JDD Sprint Kit (judgment-based hybrid) ────────────┘
```

---

## Sources

- [V-Bounce Model (Hymel 2024) - arXiv](https://arxiv.org/abs/2408.03416)
- [Expanding V-Model for AI Systems (2025) - arXiv](https://arxiv.org/abs/2502.13184)
- [Spec-Driven Development - Thoughtworks Radar](https://www.thoughtworks.com/radar/techniques/spec-driven-development)
- [SDD: From Code to Contract - arXiv](https://arxiv.org/html/2602.00180v1)
- [Understanding SDD: Kiro, spec-kit, Tessl - Martin Fowler](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)
- [Kiro - Spec-driven AI Development](https://kiro.dev/)
- [Anthropic 2026 Agentic Coding Trends Report](https://resources.anthropic.com/2026-agentic-coding-trends-report)
- [Addy Osmani - LLM Coding Workflow 2026](https://addyosmani.com/blog/ai-coding-workflow/)
- [Context Engineering for AI Agents - Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Spiral Model - Wikipedia](https://en.wikipedia.org/wiki/Spiral_model)
- [Double Diamond - Design Council](https://www.designcouncil.org.uk/our-resources/the-double-diamond/)
- [Design Sprint - GV](https://www.gv.com/sprint/)
- [Shape Up - Basecamp](https://basecamp.com/shapeup)
- [BMAD Method - GitHub](https://github.com/bmad-code-org/BMAD-METHOD)
- [GitHub Spec Kit - Microsoft Developer](https://developer.microsoft.com/blog/spec-driven-development-spec-kit)
- [BMAD vs spec-kit vs OpenSpec vs PromptX Comparison](https://redreamality.com/blog/-sddbmad-vs-spec-kit-vs-openspec-vs-promptx/)
- [SAGE: Self-Abstraction SWE Agent - Salesforce](https://www.salesforce.com/blog/sage-swe/?bc=OTH)
- [Limits of Spec-Driven Development - Isoform](https://isoform.ai/blog/the-limits-of-spec-driven-development)
- [SDD and the Future of Software Development - Cesar Soto Valero](https://www.cesarsotovalero.net/blog/sdd-and-the-future-of-software-development.html)
