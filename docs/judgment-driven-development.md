# Judgment-Driven Development

**Sprint Kit Design Philosophy — Execution Extension for the BMad Method**

> jdd-sprint-kit aims to be a tool that enables product experts — not developers —
> to realize their judgments as software deliverables using AI.
> Users don't know code, but they know what their customers want.
> They do only three things:
> decide what to build, see if the result is right, and say why if it isn't.
> Everything else is handled by AI,
> with the goal of dramatically accelerating the speed of live-service development.
>
> The one principle: **Human judgment is the only lasting asset. All AI artifacts are disposable and regenerable.**

---

## Background: Synthesis of Two Systems

### BMad Method — "Trustworthy AI Collaboration"

BMad Method is a top-down planning framework that uses AI as a facilitator.
Through its 12-step step-file architecture, users participate in decisions at every stage,
producing high-quality planning artifacts (Product Brief, PRD, Architecture, Epics).

Core value: **Gap-free requirements definition through exploration and discovery**

### Sprint Kit — "Converse Through Deliverables"

Sprint Kit is an execution layer that runs on top of the BMad Method.
It automatically collects pre-existing inputs (meeting notes, references) and existing system context,
lets AI generate planning artifacts, and has product experts judge at key moments.

Core value: **Rapid realization through expert judgment on concrete deliverables**

### Why the Synthesis

The two systems don't conflict. Depending on **the shape of existing human knowledge**,
they offer different routes, converging on the same artifact format and flowing into the same execution pipeline.

```
BMad Method (Base Platform)
  ├─ Agent Framework (Mary, John, Winston, Sally, Bob...)
  ├─ Workflow Engine (step-file architecture)
  ├─ Facilitation Patterns (A/P/C menu, party mode)
  └─ Artifact Formats (PRD, Architecture, Epics)

Sprint Kit (Execution Extension on BMad)
  ├─ Input Layer: Pre-input processing + brownfield auto-collection
  ├─ Generation Layer: Automated BMad agent orchestration
  ├─ Judgment Layer: Customer-Lens JP1/JP2
  ├─ Execution Layer: Specs → Deliverables → Prototype
  └─ Regeneration: Apply-fix + propagation / regeneration pipeline
```

---

## Design Judgments

### Artifacts as Medium

> Abstract questions yield inaccurate answers. Concrete deliverables yield precise reactions — the fastest, most accurate input.

People answer abstract questions imprecisely, but react to concrete deliverables precisely.

```
Abstract question:     "What matters most in the search feature?"  → Imprecise answer
Concrete deliverable:  "Is this search screen correct?"            → Precise judgment

Abstract question:     "What APIs do we need?"                     → Vague answer
Concrete deliverable:  "Are these 5 endpoints sufficient?"         → Clear judgment
```

This judgment extends BMad Method's "Facilitation Over Generation."
Where BMad facilitates discovery through conversation,
Sprint Kit **facilitates judgment through deliverables.**

Both approaches draw out human expertise;
which is more effective depends on the user's context and situation.

### Input Reduces Cycles

> Pre-inputs (meeting notes, references, existing system context) raise the quality
> of the first generation, reducing regeneration count. Good input is more efficient than multiple judgments.

AI generation cost is not zero. As regeneration count grows, human judgment time accumulates.

```
Total cost = (pre-input cost) + (generation cost × generation count) + (judgment cost × judgment count)

Rich pre-input:    generation count ↓, judgment count ↓  → total cost ↓
No pre-input:      generation count ↑, judgment count ↑  → total cost ↑
```

How Sprint Kit realizes this:
- `specs/{feature}/inputs/`: Where meeting notes, references, and existing docs go
- Brownfield Scanner: Automatically collects existing system context as additional input
- Brief: The minimum direction-setting provided by the user

These three combine so the AI's first generation reaches not "roughly right" but "worth reviewing."

**Real-world example**: If a product team has a 2-hour kickoff meeting
and the notes exist as a document, those notes already contain
most of the information a BMad 12-step interview would uncover.
Simply placing them in inputs/ significantly raises the first PRD generation quality.

### Regeneration Over Modification

> Regeneration, not modification, is the default. All AI artifacts are disposable,
> but since regeneration cost is not zero, Input and Judgment minimize regeneration count.

Pre-AI modification (patching) approach:
```
Doc v1 → feedback → partial edit to v1 → v1.1 → feedback → partial edit → v1.2
Problem: Accumulated patches break document consistency
```

AI-era regeneration approach:
```
Doc v1 → feedback → entirely new v2 reflecting feedback → feedback → v3
Advantage: Consistent results every time
Prerequisite: Human judgments (feedback) accumulate and feed into the next generation
```

**Human judgment is the only lasting asset. Everything else is regenerable.**

How Sprint Kit realizes this:
- Circuit Breaker: A normal regeneration trigger, not an emergency mode
- JP Comment → Regeneration: Regeneration scope dynamically determined by feedback magnitude
- JP Comment → Apply-fix + propagation: Small feedback propagated bidirectionally within existing artifacts + Scope Gate verification
- Regardless of approach, the user chooses after seeing the cost (cost transparency)

**Practical balance**: Since regeneration cost is not zero,
Input Reduces Cycles reduces the regeneration count,
and Customer-Lens Judgment Points set direction at the right moments,
preventing unnecessary regeneration.

### Customer-Lens Judgment Points

> Human intervention is placed at moments where one can judge
> "what product will be served to the customer."
> Judgment always takes place on top of concrete deliverables.

Definition of a product expert:
- ~~"Non-developer" as the opposite of developer~~
- **A customer expert — the person best positioned to judge what the deliverables should look like**

Checkpoints derive from this definition.

Ideally, from Brief input one would go straight to the prototype (JP2), with the user judging only the deliverables. However, at current AI speeds, reaching JP2 in one shot takes tens of minutes, so JP1 is placed in between to confirm requirements direction first. **JP2 is the essential judgment point; JP1 is a pragmatic supplement for current technology limitations.** When AI becomes fast enough, Brief → JP2 without JP1 becomes possible.

**JP1 (Judgment Point 1): "Is this the right product for the customer?"**
```
Subject:     Requirements, user scenarios, feature scope, priorities
Format:      PRD core content presented as a customer journey narrative
             "When the customer is in situation A trying to do B, the system provides C."
Product expert judges:
  - "Does this scenario match actual customer situations?"
  - "Are any scenarios missing?"
  - "Are the priorities correct?"
Response: Confirm / Comment
```

**JP2 (Judgment Point 2): "Is this the experience the customer wants?"**
```
Subject:     Prototype, screen flows, interactions
Format:      Working prototype + key scenario guide
             "Try scenario 1: Login → Dashboard → Feature X"
Product expert judges:
  - "Is this screen layout natural for the customer?"
  - "Does the feature work as the customer expects?"
  - "Are any screens or flows missing?"
Response: Confirm / Comment
```

**Comment — Feedback Corrects Direction:**

When Comment is selected, the system analyzes the feedback's impact scope
and presents two options with cost: apply-fix + propagation vs. regeneration.
The user chooses after seeing the cost.

```
JP1/JP2 → Comment → feedback input
  → System: impact analysis
  → [Apply-fix + propagation] N files, ~M min, includes Scope Gate verification
  → [Regeneration] From Phase X, ~M min
  → User selects → execution → return to JP
```

Regeneration scope is dynamically determined by feedback magnitude.
Small feedback regenerates only Deliverables; large feedback starts from PRD;
a direction change triggers Brief revision and Sprint restart.
If JP2 reveals that the requirements themselves were wrong, the regeneration scope
naturally extends to before JP1 — this is not failure but
**a normal discovery facilitated by concrete deliverables.**

**Structural Assistance — BMad 12-step value compressed into a checklist:**

When the product expert judges at JP1, BMad 12-step discoveries
are provided as a structural checklist:
```
□ Are all key user types included?
□ Are edge-case scenarios considered?
□ Is the relationship to existing features clear?
□ Are success metrics measurable?
```

This checklist compensates for bottom-up's weakness (difficulty spotting gaps)
with top-down's strength (structured exploration).

### Knowledge Shape Determines Route

> The route depends on the shape in which human knowledge exists.

```
Shape of Human Knowledge                Best Route
──────────────────────────────────────────────────────
A. Rich unstructured context            Bottom-up (Sprint Kit Auto Sprint)
   (meeting notes, data, experience)    AI structures → human judges → regenerate

B. Unexplored territory                 Top-down (BMad 12-step)
   (new market, new problem)            AI asks → human discovers → AI structures

C. Already-structured artifacts         Direct (Sprint Kit /specs)
   (existing PRD, complete specs)       Straight to the execution pipeline
```

**The choice follows user context. The system does not force a route.**

Real-world usage patterns:
| User Situation | Input Shape | Best Route | Entry Point |
|----------------|-------------|------------|-------------|
| PM after kickoff meeting | Meeting notes + references | Bottom-up | `/sprint feature-name` |
| Founder ideating a new product | Just an idea | Top-down | `/create-product-brief` |
| Designer executing from mockups | Figma URL + description | Bottom-up | `/sprint feature-name` |
| Executing an existing PRD | Complete PRD | Direct | `/specs feature-name` |
| Quick prototype for scope check | One-line brief | Bottom-up | `/sprint "description"` |

**Top-down and bottom-up differ not in "depth":**
- Top-down depth: Precision of problem definition — "exactly what should we build"
- Bottom-up depth: Accuracy of judgment — "is this the right thing"
- Both are deep. They're deep in different places.

### Auto-Context, Human-Judgment

> Technical context collection is automated by AI.
> For humans, it is translated into customer impact and only judgment is requested.

In brownfield environments, mapping relationships to existing systems
is not the product expert's job. AI collects automatically,
and presents to the product expert in a form suitable for judgment.

```
AI collects:                            Presented to human:
"Existing API /api/v1/tutors has        "The existing 'tutor management'
 GET, POST, DELETE endpoints.            feature will be affected. Adding
 TutorService class lacks a              a new 'block' feature to the
 blockTutor method.                      current tutor list screen will
 No tutor_block_list table in DB"        change the existing user experience.
                                         Do you approve?"
```

How Sprint Kit realizes this:
- Brownfield Scanner: Automatically collects from MCP servers, document-project, local codebase
- brownfield-context.md: Layered structure from L1 (domain) → L2 (behavior) → L3 (component) → L4 (code)
- At JP1/JP2: Technical brownfield data translated into customer impact for presentation

---

## Mapping to Real Product Team Workflows

Sprint Kit replaces the parts of a real product team's workflow that AI can handle,
while preserving the parts where humans excel.

```
Real Product Team                        Sprint Kit Equivalent
──────────────────────────────────────────────────────────────
1. Kickoff meeting (2 hours)            → Save notes in inputs/ (~0 min)
2. Someone drafts PRD (1 day)           → ██ AI generates PRD ██ (~5 min)
3. PRD review meeting (1 hour)          → JP1: PRD judgment (~10 min)
4. PRD revision (half day)              → ██ AI regenerates if needed ██ (~3 min)
5. Design → Prototype (1 week)          → ██ AI generates prototype ██ (~10 min)
6. Prototype review (1 hour)            → JP2: Prototype judgment (~15 min)
7. Revision → Final sign-off (days)     → ██ AI regenerates if needed ██ (~10 min)

Human time: ~25 min (previous: 4 hours 30 min + days of waiting)
```

**What AI replaces:** Structuring, writing, implementation (tasks where humans are relatively slow)
**What humans keep:** Providing context, judging, setting direction (tasks where humans are far more accurate)

---

## Methodology Evolution in the AI Era

### Lessons from Waterfall → Agile

Top-down (Waterfall) development pursued "gap-free upfront definition,"
but in practice, gaps could never be reduced to zero. Acknowledging this limitation
and compensating through iteration was Agile's core insight.

### The Agile → Judgment-Driven Transition

Bottom-up (Judgment-Driven) development pursues "AI builds, human judges,"
but in practice, AI generation cost and time cannot reach zero.
Acknowledging this limitation, **raising first-generation quality through pre-inputs
and correcting direction at well-placed judgment points** is Sprint Kit's core design.

```
Waterfall:  Define gap-free → implement in one shot (ideal)
            Gaps discovered → high cost of backtracking (reality)

Agile:      Gradual improvement through iteration (solution)
            But each iteration incurs implementation cost

JDD:        AI generates fast → human judges → regenerate (ideal)
            Regeneration cost ≠ 0, judgment also takes time (reality)
            → Input quality ↑ + judgment timing optimization = minimal regeneration (solution)
```

**This is the core of a service used by many people in reality.**
Not a theoretical ideal, but finding the working balance point in actual product organizations.

### Delta-Driven Design

Sprint Kit's 3-pass pattern (Answer Discovery → Translation & Delta Extraction → Delta Execution) reframes the pipeline's purpose: **defining the delta between the current system (brownfield) and the target state (user-validated prototype)**, not generating specs.

The prototype is the target state expressed in the system's actual user's grammar — visual UI for human users, API mocks for service consumers, structured documents for AI consumers. Crystallize translates this target into development grammar using rule-based mapping, not open-ended abstraction. The delta between translated target and brownfield baseline is what needs to be built.

Spec completeness controls AI non-determinism: more complete specs produce more consistent output. Sprint Kit accepts a trade-off — high specification where contracts matter (API, DB schema), lower specification where variation is acceptable (UI layout, internal naming) — and uses contract testing and BDD to verify functional correctness regardless of variation.

> Full theory, core principles (CP1-CP6), design judgments (DJ1-DJ10), translation rules, and methodology comparison: [`docs/delta-driven-design.md`](delta-driven-design.md)

---

## Appendix: Key Insights from the Design Discussion Process

### The Problem with "Non-Developer" Framing

In early discussions, Sprint Kit's target user was defined as "non-developer."
This is a subtractive definition — the anti of developer —
that fails to capture these users' actual expertise.

**Revised definition**: "A customer expert — the person best positioned
to judge what the deliverables should look like" — i.e., a product expert.

Impact of this redefinition on checkpoint design:
- Before: Technical quality gates (Brief mapping %, Scope Gate results)
- After: Customer-perspective judgment points (customer journey narrative, experience verification)

### Not "Deep vs Quick" but "Top-down vs Bottom-up"

In early discussions, routes were classified by "exploration depth" (Deep planning vs Quick execution).
This framing reflects a typical developer perspective, implying bottom-up is "shallow."

**Revised framing**: Both routes are deep. They're deep in different areas.
- Top-down: Deep in precision of problem definition
- Bottom-up: Deep in accuracy of judgment on deliverables

### Dissolving the Bridge Concept

Early design planned a "Bridge" command to transfer BMad artifacts to Sprint Kit.
Discussion revealed this concept was unnecessary:

1. The two systems already share the same artifact format (same prd-format-guide)
2. Sprint Kit's `/specs` just needs to resolve the planning-artifacts path to connect
3. A Bridge is a "translator between two systems," but in the extension-pack model no translation is needed

**Conclusion**: Sprint Kit is not a separate system from BMad but an extension pack,
so the connection point is not a command but a file-format contract (the planning-artifacts/ directory).

### Realistic Correction of the "Regeneration Cost ≈ 0" Assumption

Early discussions proceeded on the premise that "AI regeneration cost is roughly zero."
Reality check:

```
Full Auto Sprint cycle: 5–15 min
PRD regeneration: 2–5 min
Prototype regeneration: 5–10 min
```

Cost is not zero. As regeneration count grows, human judgment time accumulates.
This realistic constraint is the reason Input Reduces Cycles exists.

**Practical balance point**: The goal is to reduce regeneration to 1–2 cycles
by raising first-generation quality through pre-inputs and brownfield context.

### Practical Correction of Regeneration Over Modification — When Apply-Fix Is Allowed

"Regeneration over modification" is the default. Artifacts are disposable,
and feedback-informed fresh generation ensures consistency.

A boundary condition discovered during actual Sprint execution:
In the pipeline, artifacts are not independent disposables but **intermediate state**.
The same information (e.g., data model) exists in different formats across PRD, Architecture, Design,
API Spec, Prototype, and more.
Applying full regeneration to small changes inverts the cost-benefit ratio.

```
Premise:            Artifacts are independent disposables → regeneration is always efficient
Real-world finding: Artifacts are interdependent state → regeneration is inefficient for small changes
Correction:         Add apply-fix + propagation option + Scope Gate verification for consistency
```

Why apply-fix is safe: The rationale for defaulting to regeneration is
"modification breaks consistency."
Since Scope Gate verifies cross-artifact consistency after modification,
the risk of consistency breakdown is structurally blocked.

**Regeneration is the default.** Apply-fix is
an option the system presents alongside cost. The user decides after seeing the cost.
Implemented in the protocol (jdd-sprint-protocol.md).
