# Delta-Driven Design

> **Document type**: Design theory — Sprint Kit's conceptual foundation and methodology positioning
> **Version**: 1.0
> **Date**: 2026-02-21
> **Related**: [`judgment-driven-development.md`](judgment-driven-development.md) (design philosophy), [`reviews/lld-gap-analysis-and-implementation-plan.md`](reviews/lld-gap-analysis-and-implementation-plan.md) (implementation plan)

---

## 1. The Insight

Sprint Kit's pipeline generates many artifacts: PRD, Architecture, Epics, Specs, Deliverables, Prototype. But what is the actual deliverable?

**Previous answer**: "A reconciled set of specifications that an implementation team can execute."

**New answer**: **"A precisely defined delta between the current system (brownfield) and the target system (approved prototype), expressed in a format that machines can execute."**

This reframe changes what Sprint Kit IS:

| Aspect | Previous Frame | New Frame |
|---|---|---|
| **Primary goal** | Generate specs + deliverables | Define the delta between brownfield and target |
| **What prototype is** | A deliverable for JP2 review | **The target state, expressed in user grammar** |
| **What specs are** | The primary output | **Translation of the target into development grammar** |
| **What Crystallize does** | Reconcile specs with prototype | **Extract delta: brownfield ↔ translated prototype** |
| **What Execute does** | Implement specs | **Realize the delta: transform brownfield into target** |

---

## 2. Two Grammars

Software exists at the intersection of two worlds: the user's world (where value is defined) and the machine world (where value is implemented). Each world has its own grammar.

### User Grammar (The User's World)

The language that the system's **actual users** speak. This is NOT limited to visual UI — it adapts to who the user is:

| System's User | User Grammar | Prototype Form | Validation Method |
|---|---|---|---|
| **End users (humans)** | Screens, actions, visual states, navigation flows | React + MSW visual prototype | Human looks and interacts |
| **Other services (servers)** | API contracts, request/response schemas, error codes | API mock (OpenAPI + mock server) | Contract testing (Specmatic) |
| **AI agents** | Structured documents, YAML/JSON schemas, prompt templates | YAML/JSON specification documents | Schema validation + AI execution test |
| **Data pipelines** | Data schemas, transformation rules, quality constraints | Sample data + transformation scripts | Data quality checks |

**The key principle**: Prototype is defined by the system's actual user, not by visual UI convention. If the system's user is another server, the prototype is an API mock. If the user is an AI agent, the prototype is a structured document.

**Who speaks this grammar**: The system's actual users — whoever will consume the system's output. They evaluate correctness by using the prototype in their native mode of interaction.

**Sprint Kit artifact in this grammar**: **Prototype** — form adapts to user type (visual for humans, API mock for services, structured doc for AI)

### Development Grammar (Machine World)

The language of implementation. Expressed through:
- API endpoints (method, path, request/response schema)
- Database schemas (tables, columns, constraints, indexes)
- State machines (states, transitions, guards, actions)
- Algorithms (input, rules, output, edge cases)
- Scheduled jobs (trigger, schedule, retry policy)
- Security rules (auth, authorization, data protection)
- Infrastructure (deployment, monitoring, scaling)

**Who speaks this grammar**: Developers, AI coding agents. They evaluate correctness by testing and verifying.

**Sprint Kit artifacts in this grammar**: **Specs** (requirements.md, design.md, tasks.md), **Deliverables** (api-spec.yaml, schema.dbml, bdd-scenarios/)

### The Translation Problem

Users can only validate correctness in their own grammar. Machines can only execute instructions in development grammar. Therefore:

1. **Find the answer in user grammar** → Prototype (form matches user type), validated by actual users at JP2
2. **Translate the answer to development grammar** → Specs, translated by AI
3. **Measure the gap** → Delta = translated target - brownfield
4. **Execute the gap** → AI implements the delta

**This sequence is the only correct order.** Reversing it (defining specs first, then building prototype to match) forces users to validate in a grammar they don't speak.

---

## 3. The Translation: User Grammar → Development Grammar

This translation is NOT open-ended abstraction. It is a rule-based mapping between known elements.

### Translation Rules

| User Grammar Element (observable in prototype) | Development Grammar Equivalent (in specs) |
|---|---|
| Screen / Page | Route definition + Page component + API call list |
| User action (button click, form submit) | API endpoint (method + path + request body) |
| Data displayed on screen | API response schema + DB query pattern |
| Screen-to-screen navigation | Route transition + conditional redirect rules |
| Status badge / label (Active, Expired, etc.) | Entity status enum + state transition rules |
| Error message ("Already activated") | API error code + HTTP status + error condition |
| Empty state ("No items yet") | API empty response handling + conditional UI |
| Loading state (spinner) | Async API call + loading state management |
| Auto-behavior text ("auto-activates") | Scheduler/Trigger definition + cron/event rules |
| Calculated value ("2 lessons available") | Algorithm spec (input → rules → output) |
| List ordering | API query parameter + sorting algorithm |
| Permission-gated UI (admin-only button) | Authorization rule + API middleware |
| Form validation message | Input validation rules (field-level + cross-field) |
| Confirmation dialog | Business rule + state precondition check |
| Notification/toast | Event trigger + notification channel + message template |

**Each row is one translation rule.** Every user grammar element in the prototype maps to one or more development grammar elements. If an element doesn't map, the translation table needs a new row — but the structure is always: user grammar element → development equivalent.

### What Translation Adds (Carry-Forward)

Some development grammar elements have no user grammar counterpart — they are invisible to users but essential for the system:

| Development Grammar Element | Why Invisible in Prototype | Source |
|---|---|---|
| Performance targets (p95 < 500ms) | Cannot observe latency in MSW mock | PRD NFR |
| Security rules (JWT, CORS, input sanitization) | Mock doesn't enforce security | Architecture |
| Migration strategy (ALTER TABLE, data backfill) | Mock uses fresh data | Brownfield analysis |
| Concurrency handling (locks, idempotency) | Single-user prototype | PRD NFR |
| Monitoring/alerting (SLI/SLO, dashboards) | No production environment | Operational requirements |
| Error retry/fallback (circuit breaker, backoff) | Mock always responds | Architecture |

These items are carried forward from PRD, Architecture, and Brownfield context into the final specs. They are ADDED to the translation output:

```
Complete Specs = translate(Prototype) + carry-forward(PRD, Architecture, Brownfield)
```

---

## 4. The Delta

### Definition

```
Delta = Complete Specs - Brownfield
      = [translate(Prototype) + carry-forward] - Brownfield
```

Where:
- **translate(Prototype)**: All user grammar elements converted to development grammar
- **carry-forward**: Non-visible requirements (NFR, security, migration, operations)
- **Brownfield**: Existing system described in development grammar (brownfield-context.md L1-L4)

### Delta Components

| Delta Type | Meaning | Example |
|---|---|---|
| **Positive delta** | Must create or change | New API endpoint, new DB column, new state transition |
| **Zero delta** | Already exists, no change needed | Existing API that prototype uses as-is |
| **Negative delta** | Must remove or deprecate | Old API replaced by new version, dead code cleanup |
| **Modification delta** | Existing element needs change | API response gains new fields, DB column type changes |

### Why Delta is the Right Unit

If delta is precisely defined, execution becomes mechanical:
- Each positive delta item → a task for a Worker
- Each modification delta item → a brownfield-aware task with File Ownership
- Each negative delta item → a cleanup task
- Zero delta items → no work needed (verified by regression tests)

**The quality of development is bounded by the quality of delta definition.** If delta is complete and precise, the implementation will be correct. If delta is incomplete or ambiguous, no amount of skilled implementation can compensate.

This is why Sprint Kit's primary goal is delta definition, not code generation.

---

## 5. Sprint Kit Pipeline Reframed

### The Complete Flow

```
[Phase 0: Establish Baseline]
  Brownfield scan → brownfield-context.md (L1~L4)
  = Current system in development grammar

[Phase 1: Find the Answer in User Grammar]
  Brief + Brownfield → PRD → Architecture → Specs → Deliverables → Prototype
  = Target state in user grammar
  JP1: "Is the direction right?" (human validates search direction)
  JP2: "Is this the answer?" (human validates target in user grammar)

[Phase 2: Translate and Measure]
  translate(Approved Prototype) → Target in development grammar
  + carry-forward(NFR, Security, Migration, Operations)
  = Complete Target Specs

  Complete Target Specs - Brownfield = Delta
  = Precisely defined gap between current and target

[Phase 3: Execute]
  Implement Delta → Brownfield transforms into Target
  Validate: implemented system ≈ prototype behavior
```

### What Each Stage Really Does

| Stage | Previous Understanding | Reframed Understanding |
|---|---|---|
| Phase 0 (Smart Launcher) | Collect inputs | **Establish brownfield baseline in development grammar** |
| Brownfield Scan | Gather existing system info | **Parse current state into structured development grammar** |
| PRD Generation | Define requirements | **Explore solution space toward user grammar answer** |
| Architecture | Make technical decisions | **Constrain solution space (carry-forward source)** |
| Specs 4-file | Define implementation contract | **Intermediate scaffold for prototype generation** |
| Deliverables | Create implementation artifacts | **Generate target state in user grammar (prototype)** |
| JP1 | Judge requirements | **Validate search direction before investing in prototype** |
| JP2 | Judge experience | **Confirm target state in user grammar ("this IS the answer")** |
| Crystallize | Reconcile specs with prototype | **Translate user grammar → development grammar + extract delta** |
| Execute | Implement specs | **Realize delta: transform current into target** |
| Validate | Verify implementation | **Verify: current + delta ≈ target** |

### The 3-Pass Pattern Reframed

| Pass | Previous Name | Reframed Name | What Happens |
|---|---|---|---|
| 1st | Generative | **Answer Discovery** | Find the right answer in user grammar (human-validated) |
| 2nd | Reconciliatory | **Translation & Delta Extraction** | Convert user grammar answer to dev grammar, measure gap from brownfield |
| 3rd | Realization | **Delta Execution** | Implement the precisely defined gap |

---

## 6. Why This Makes "Concrete → Abstract" a Strength

The previous concern: "Crystallize abstracts from prototype to specs — but AI is bad at abstraction."

The reframe: **Crystallize is not abstraction. It is translation between two known grammars.**

| Operation | What AI Does | AI Suitability |
|---|---|---|
| Abstraction (Emergent Design) | Discover new patterns from code | Low — requires aesthetic judgment, full context |
| **Translation (Crystallize)** | **Convert known user grammar elements to known dev elements using mapping rules** | **High — rule-based, structured, verifiable** |

The translation is mechanical because:
1. **Both grammars are known** — user grammar elements and dev elements are enumerated
2. **Mapping rules exist** — each user grammar element has a defined dev equivalent
3. **Input is bounded** — prototype is a finite set of screens, actions, states
4. **Output format is fixed** — specs files have defined structure
5. **Verification is possible** — round-trip: specs → re-generate prototype → compare with original

---

## 7. Round-Trip Verification

To verify that translation didn't lose information:

```
Prototype (original, JP2-approved)
  → translate → Specs (development grammar)
    → re-generate → Re-Prototype (from specs alone)
      → compare → Original Prototype ≈ Re-Prototype?
```

If the re-generated prototype structurally matches the original (same routes, same components, same API calls, same states), the translation was lossless. Differences indicate translation gaps.

This is the Crystallize S5 (Cross-Artifact Consistency) check, reframed as a translation verification step.

---

## 8. Implications for Greenfield

When there is no brownfield (new system from scratch):

```
Brownfield = ∅ (empty)
Delta = translate(Prototype) + carry-forward - ∅
      = translate(Prototype) + carry-forward
      = Complete Specs (the entire system)
```

The model degrades gracefully. For greenfield, delta IS the full spec. For brownfield, delta is the changeset. The pipeline is identical; only the brownfield baseline changes.

---

## 9. Implementation Implications

This reframe has implications for Sprint Kit components including: Crystallize pipeline, design.md format, Specs as intermediate vs final artifact, handoff, Validate phase, translation rule completeness, and carry-forward mechanism.

> Detailed re-evaluation and implementation plan: [`reviews/lld-gap-analysis-and-implementation-plan.md`](reviews/lld-gap-analysis-and-implementation-plan.md)

---

## 10. Design Principles (Core Principles + Design Judgments)

### Core Principles

These are foundational beliefs that drive all Sprint Kit decisions. Updated to reflect the delta-driven design reframe.

#### CP1: Human judgment is the only lasting asset (RETAINED)

All AI artifacts are disposable and regenerable. Human input raises generation quality; human judgment sets direction. This principle is unchanged — it is the foundation of JDD.

**Delta frame reinforcement**: In the delta frame, human judgment confirms the target state (JP2) and search direction (JP1). Everything else — translation, delta extraction, execution — is AI's domain.

#### CP2: Prototype adapts to the system's actual user (NEW)

Prototype is NOT limited to visual UI mockups. The prototype form must match the system's actual user:
- Human users → Visual prototype (React + MSW)
- Service consumers → API mock (OpenAPI + mock server)
- AI consumers → Structured documents (YAML/JSON)
- Data pipelines → Sample data + transformation scripts

**Rationale**: The prototype's purpose is to let the actual user validate correctness in their native grammar. If the user is another server, showing them a React UI is meaningless — they need an API contract to validate against.

**Implication**: `deliverable-generator.md` Stage 10 should be parameterized by user type, not hardcoded to React + MSW.

#### CP3: Spec completeness controls non-determinism; graceful degradation manages the remainder (NEW)

AI code generation is non-deterministic: same input can produce different output. However, non-determinism is not a fixed property of AI — it is a function of specification completeness:

```
Non-determinism = f(1 / spec_completeness)
```

- More complete specs (visual guides, UI patterns, API contracts, state machines) → less non-determinism
- Less complete specs (vague requirements, no design guide) → more non-determinism

**The trade-off**: Over-specification creates inefficiency (generation cost, maintenance burden, context window consumption). Under-specification creates non-determinism (inconsistent output, rework).

**Sprint Kit's position**: Pursue the optimal trade-off, not the extreme. Accept that some non-determinism is inevitable and design for graceful degradation:

| Spec Area | Sprint Kit's Level | Accepted Non-determinism |
|---|---|---|
| API contract | High (OpenAPI 3.1) | Near-zero (Specmatic enforces) |
| DB schema | High (DBML) | Near-zero (migration scripts enforce) |
| State transitions | Medium (XState when detected) | Low (state machine constrains) |
| UI layout/style | Low (no visual guide) | **High** (CSS, component structure varies) |
| Variable naming | Low (Entity Dictionary only) | Medium (internal naming varies) |

**Graceful degradation strategy**: Where non-determinism is high (UI layout, internal naming), accept variation and rely on Contract Testing + BDD to verify functional correctness. Don't over-specify to eliminate visual variation — it's not worth the cost.

#### CP4: Delta definition is Sprint Kit's primary goal (NEW)

Sprint Kit's purpose is not "generating specs" or "building prototypes." It is **defining the delta between the current system (brownfield) and the target system (user-validated prototype)**, expressed in a format that machines can execute.

```
Delta = translate(Prototype) + carry-forward - Brownfield
```

If the delta is precisely defined, implementation is mechanical. The quality of development is bounded by the quality of delta definition.

#### CP5: Regeneration over modification (RETAINED, reframed)

When an artifact needs changing, regenerate it from source rather than editing it. AI regeneration cost is low; manual editing introduces inconsistency.

**Delta frame addition**: This principle applies to the delta itself. If the delta changes (e.g., JP2 feedback modifies the target), regenerate the affected delta items rather than patching them.

#### CP6: Translation is rule-based, not judgment-based (NEW)

Crystallize's "concrete → abstract" step is translation between two known grammars, not open-ended abstraction. Translation follows a mapping table (User Grammar Element → Development Grammar Equivalent) with explicit rules.

Where translation rules are insufficient (inference-required items like auto-behavior text → scheduler definition), these items are explicitly flagged for carry-forward validation rather than silently guessed.

### Design Judgments

Specific decisions made for Sprint Kit's implementation. These may change as the tool evolves.

#### DJ1: Expand design.md rather than create new files (RETAINED)

LLD sections go into design.md, not a separate `detailed-design.md`. Workers already read design.md as primary reference.

#### DJ2: Conditional activation over mandatory sections (RETAINED)

All LLD sections and translation outputs use always-detect / conditionally-generate. Simple projects see zero overhead.

#### DJ3: Devil's Advocate as separate pass (RETAINED, reframed)

Adversarial verification is a dedicated step ("Is the delta complete?"), not embedded in generation. In the delta frame, it verifies delta completeness rather than deliverable quality.

#### DJ4: PRD State Transition structures are business rules (RETAINED)

States/Transitions/Invariants in PRD FRs are user grammar elements (business rules), not development grammar (implementation). They're the input to translation, not the output.

#### DJ5: Fix Stage 7 input source (RETAINED)

Change Stage 7 (XState) input from "Architecture state diagrams" to "design.md State Transitions section." This fixes a pipeline wiring bug.

#### DJ6: Observability as mandatory NFR (RETAINED)

Every deployed service needs monitoring. Observability NFR is always required regardless of project type.

#### DJ7: Carry-forward items require explicit lifecycle management (NEW)

Items that exist in development grammar but have no user grammar counterpart (NFR, security, migration, monitoring) must be:
1. **Registered** at Phase 1 (in design.md carry-forward registry)
2. **Preserved** through the prototype-centric pipeline (bypassing prototype, injected at Crystallize)
3. **Verified** for completeness (Scope Gate check: all registered items present in final specs)
4. **Classified** in delta (positive/modification/zero per item)

#### DJ8: Delta Manifest as standard Crystallize output (NEW)

Crystallize must produce a Delta Manifest classifying every change as positive (new), modification (changed), negative (removed), or zero (unchanged). This manifest is the prerequisite for delta-typed testing, regression scoping, and handoff.

#### DJ9: JP2 shows the delta in user grammar (NEW)

JP2 Visual Summary must include a "Before/After" section showing what changes from the user's perspective. Users confirm not just "the prototype is right" but "this change from the current system is right."

#### DJ10: Non-determinism trade-off is explicit, not hidden (NEW)

Where Sprint Kit accepts non-determinism (e.g., UI layout variation), this is a documented design choice with a specific graceful degradation strategy — not an unacknowledged gap. The spec completeness level for each area is explicitly stated (see CP3 table).

---

## 11. What Does NOT Change

| Element | Why It Stays |
|---|---|
| **CP1: Human judgment is the only lasting asset** | Foundation of JDD. Unchanged by delta reframe |
| **JP1 / JP2 Structure** | JP1 validates search direction, JP2 validates the answer. Both use user grammar. No new JPs needed |
| **Brownfield Scanner** | Establishes the baseline. Now explicitly framed as "current state in development grammar" |
| **3-Pass Pattern** | Still Answer Discovery → Translation & Delta Extraction → Delta Execution |
| **Contract-First (Specmatic)** | Contracts control non-determinism during execution (CP3 strategy) |
| **BDD Scenarios** | Part of the translated target in development grammar |
| **Brief → Prototype pipeline** | Each step serves Answer Discovery. No restructuring needed (Party Mode confirmed) |
| **Pipeline execution flow** | Crystallize is mandatory after JP2. /parallel always receives reconciled/. Delta Manifest (S5b) always generated |

---

## 12. Implementation Roadmap

> Detailed implementation plan with file-by-file changes, phased rollout, and verification strategy: [`reviews/lld-gap-analysis-and-implementation-plan.md`](reviews/lld-gap-analysis-and-implementation-plan.md)

**Summary**: Option B (incremental integration) selected. Sprint Kit's pipeline already performs the correct operations — this reframe provides conceptual alignment.

| Phase | Scope | Key Changes |
|---|---|---|
| 0 | Documentation | Terminology, JDD reference, Blueprint reference |
| 1 | LLD Foundation | design.md conditional sections, Scope Gate checks, PRD format |
| 2 | Delta Integration | Delta Manifest, JP2 Before/After, carry-forward registry |
| 3 | Validation | Delta completeness check, zero delta regression, carry-forward ratio measurement |

---

## Appendix A: Historical Context

This reframe emerged from a 5-round Party Mode analysis that began with "should we change the PRD format?" and progressively deepened:

| Round | Question | Finding |
|---|---|---|
| 1 | Should PRD format change? | PRD is not the problem; implementation-level detail belongs elsewhere |
| 2 | Is a new document needed? | No — information exists but is distributed across files |
| 3 | What specific changes fix the gaps? | 10 gaps need format expansions across 6+ files |
| 4 | Is this structural or edge case? | Edge cases within correct boundaries; design.md needs LLD |
| 5 | What methodology principles apply? | Sprint Kit is a unique 4-category hybrid; 3-pass pattern is novel |
| **Synthesis** | **What is Sprint Kit's actual purpose?** | **Define the delta between brownfield and prototype-validated target** |

The methodology survey (Round 5-6) revealed that Sprint Kit's Crystallize pass (concrete → abstract) is unique in the methodology landscape. The concern that "AI is bad at abstraction" was resolved by recognizing that Crystallize is not abstraction — it is **translation between two known grammars**, which is a rule-based operation that AI handles well.

| Round 7 | Party Mode re-evaluation of delta reframe (6 agents) | Pipeline already performs correct operations; reframe is conceptual. JP2 needs Before/After delta. Delta Manifest is critical prerequisite. carry-forward needs lifecycle management |
| Round 8 | Design Principles finalization | CP1-CP6 (core principles) + DJ1-DJ10 (design judgments). Key additions: CP2 (prototype adapts to user type), CP3 (spec completeness ↔ non-determinism trade-off), CP4 (delta is primary goal). Option B selected |

---

## Appendix B: Methodology Survey

> **Date**: 2026-02-21
> **Scope**: 18 methodologies surveyed across academic papers, industry frameworks, and emerging AI-assisted engineering practices (2024-2026)
> **Finding**: No existing methodology combines all 7 key traits. Maximum overlap found is 3/7.

### B.1 Seven Key Traits of Delta-Driven Design

| # | Trait | Definition |
|---|-------|------------|
| 1 | Delta as primary artifact | The changeset between current and target state is the main deliverable, not the full spec |
| 2 | Prototype-first | Humans validate the target in user grammar (prototype), then AI translates to development specs |
| 3 | Two Grammars | Formal distinction between User Grammar and Development Grammar |
| 4 | Translation, not abstraction | Converting prototype to specs is rule-based translation between known grammars |
| 5 | 3-Pass Pattern | Answer Discovery → Translation & Delta Extraction → Delta Execution |
| 6 | Brownfield-aware | Existing system baseline explicitly factored into delta calculation |
| 7 | Carry-forward | Non-visible requirements (NFRs, security, migration) added to translated output |

### B.2 Trait Coverage Matrix

| Methodology | Delta | Proto-First | Two Grammars | Translation | 3-Pass | Brownfield | Carry-Fwd | Score |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Kubernetes / IaC Reconciliation** | YES | - | - | - | YES | YES | - | 3/7 |
| **OMG Model-Driven Architecture** | - | - | YES | YES | PARTIAL | - | - | 2.5/7 |
| **OpenSpec (Fission-AI, 2025)** | YES | - | - | PARTIAL | - | YES | - | 2.5/7 |
| **Design-to-Code Pipelines** | - | YES | YES | PARTIAL | - | - | - | 2.5/7 |
| **TOGAF Gap Analysis** | PARTIAL | - | - | - | - | YES | PARTIAL | 2/7 |
| **Spec-Driven Development (2025)** | PARTIAL | - | PARTIAL | PARTIAL | - | PARTIAL | - | 2/7 |
| **Strangler Fig Pattern** | PARTIAL | - | - | - | - | YES | PARTIAL | 2/7 |
| **Round-Trip Engineering** | - | - | YES | YES | - | - | - | 2/7 |
| **Spec-Grounded Modernization** | PARTIAL | - | - | - | - | YES | PARTIAL | 2/7 |
| **RM2PT (ICSE 2019)** | - | INVERTED | YES | YES | - | - | - | 2/7 |
| **SmartDelta (ITEA4, 2024)** | PARTIAL | - | - | - | - | YES | - | 1.5/7 |
| **Delta-Oriented Programming** | PARTIAL | - | - | - | - | YES | - | 1.5/7 |
| **Dual-Track Agile** | - | YES | PARTIAL | - | - | - | - | 1.5/7 |
| **BDD / Specification by Example** | - | - | PARTIAL | YES | - | - | - | 1.5/7 |
| **Design-Driven Development** | - | YES | PARTIAL | - | - | - | - | 1.5/7 |
| **Lean UX / Build-Measure-Learn** | - | YES | - | - | - | - | - | 1/7 |
| **Context Engineering (2025)** | - | - | - | PARTIAL | - | - | - | 0.5/7 |
| **IEEE 42010 Viewpoints** | - | - | CONCEPTUAL | - | - | - | - | 0.5/7 |

### B.3 Top 5 Most Similar Methodologies

#### 1. Kubernetes / IaC Reconciliation Pattern (3/7)

The reconciliation loop used by Kubernetes, Terraform, Pulumi, and ArgoCD. Core formula: `Delta = Desired State - Actual State`. Terraform `plan` computes and displays the delta; `apply` executes it.

**Shared traits**: Delta as primary artifact, 3-Pass (observe → compute diff → execute), Brownfield-aware (actual state explicitly observed).

**Missing traits**: Prototype-first (desired state written directly in execution grammar like YAML/HCL, not validated via prototype), Two Grammars (single declarative language), Translation (desired state already in execution grammar), Carry-forward (no invisible requirements).

**Relationship**: Strongest structural analogy. Delta-Driven Design applies the Kubernetes reconciliation pattern to the software specification domain. The formula `Delta = Desired - Actual` is identical in structure to `Delta = translate(Prototype) + carry-forward - Brownfield`.

#### 2. OMG Model-Driven Architecture (MDA) (2.5/7)

OMG's standard for model-driven development with three abstraction levels: CIM (Computation-Independent Model), PIM (Platform-Independent Model), PSM (Platform-Specific Model), with rule-based transformations between them using QVT (Query/View/Transformation).

**Shared traits**: Two Grammars (CIM/PIM/PSM as distinct formal representations), Translation (QVT is a rule-based transformation language between model levels).

**Missing traits**: Delta (no delta computation against existing systems), Prototype-first (models are the starting point), Brownfield-aware (assumes forward engineering), Carry-forward.

**Relationship**: Academic precursor for the "rule-based grammar transformation" concept. CIM-to-PIM transformation is structurally analogous to "User Grammar to Development Grammar." MDA never achieved widespread adoption due to formal modeling overhead.

#### 3. OpenSpec (Fission-AI, 2025) (2.5/7)

An open-source spec-driven development framework for AI coding assistants. Explicitly "brownfield-first." Delta specs use ADDED/MODIFIED/REMOVED markers against a baseline spec.

**Shared traits**: Delta as primary artifact (delta specs with change markers), Brownfield-aware (core design: "most work happens on existing codebases (1→n) rather than greenfield (0→1)").

**Missing traits**: Prototype-first (specs written directly, no prototype validation), Two Grammars (single Markdown spec format), 3-Pass Pattern (linear Propose→Apply→Archive flow), Carry-forward.

**Relationship**: Closest parallel development in the delta-as-artifact space, emerging independently in 2025. Structurally similar ADDED/MODIFIED/REMOVED classification maps to Delta-Driven Design's positive/modification/negative delta types.

#### 4. Design-to-Code Pipelines (Figma MCP, Unity Spec, Builder.io) (2.5/7)

Tools that translate design artifacts (Figma files, design tokens) into production code using structured metadata and AI.

**Shared traits**: Prototype-first (visual design is the starting point), Two Grammars (design grammar: Figma layers, variables, auto-layout vs code grammar: React components, CSS).

**Missing traits**: Delta (generates full components, not deltas), Brownfield-aware (no existing codebase consideration), 3-Pass Pattern (single-pass design→code), Carry-forward.

**Relationship**: Most direct validation that User Grammar → Development Grammar translation is technically feasible. Demonstrates the core premise but in a narrower scope (component generation, not system-level delta).

#### 5. Dual-Track Agile (Cagan & Patton, 2012) (1.5/7)

Parallel Discovery (UX/product) and Delivery (engineering) tracks. Discovery validates what to build via prototypes; Delivery implements it.

**Shared traits**: Prototype-first ("the prototype serves as the spec for Delivery").

**Missing traits**: Delta, Translation (handoff from Discovery to Delivery is informal and human-mediated), Brownfield-aware, Carry-forward.

**Relationship**: Practical precursor for prototype-first validation. Validates the principle that UX validation should precede development specification, but provides no formal mechanism for the translation step.

### B.4 Intellectual Lineage by Trait

| Trait | Precursors |
|-------|-----------|
| **Delta as primary artifact** | Kubernetes reconciliation (2014), TOGAF Gap Analysis (1995), OpenSpec (2025), Delta-Oriented Programming (2010) |
| **Prototype-first** | Dual-Track Agile (2012), Design-Driven Development (2010s), Lean UX (2013) |
| **Two Grammars** | MDA CIM/PIM/PSM (2001), IEEE 42010 Viewpoints (2000), Design-to-Code pipelines (2024) |
| **Translation, not abstraction** | MDA QVT (2001), BDD Gherkin→step definitions (2006), Round-Trip Engineering (1990s) |
| **Brownfield-aware** | OpenSpec (2025), SmartDelta (2024), Strangler Fig (2004), TOGAF (1995) |
| **3-Pass Pattern** | Kubernetes observe→diff→execute (2014) |
| **Carry-forward** | **No precursor found** — most unique trait |

### B.5 Key Findings

**1. The trait combination is novel.** No existing methodology simultaneously addresses delta-as-primary-artifact, prototype-first validation, two-grammar formalization, rule-based translation, brownfield awareness, and carry-forward.

**2. Individual traits have strong precedents.** Each trait has established intellectual lineage (see B.4). Delta-Driven Design's contribution is the integration of these traits into a unified pipeline.

**3. The "carry-forward" trait is the most unique.** No methodology explicitly formalizes the problem of carrying non-visible requirements (NFRs, security, migration constraints) into translated specifications because they have no user grammar counterpart. This is handled ad hoc in existing practice.

**4. The 2025 Spec-Driven Development wave is converging toward partial overlap.** OpenSpec (delta specs + brownfield-first), Tessl (spec-as-source), and Spec-Grounded Modernization (brownfield context for AI) are moving in a direction that partially overlaps with Delta-Driven Design. None formalizes the two-grammar distinction or prototype-first validation.

**5. Delta-Driven Design can be described as a synthesis.** Applying Kubernetes' reconciliation pattern to software specification, using MDA's transformation principle between Dual-Track Agile's Discovery grammar and Delivery grammar, with OpenSpec's delta-as-artifact approach, plus a novel carry-forward mechanism for invisible requirements.

**6. RM2PT (ICSE 2019) proves the inverse direction.** RM2PT automatically generates prototypes FROM formal requirements (specs → prototype). Delta-Driven Design operates in the opposite direction (prototype → specs). Both validate that automated translation between formal requirements and executable artifacts is technically feasible — the direction is reversed.
