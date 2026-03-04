# Translation Ontology

> **Document type**: Unified framing — philosophical foundation of Sprint Kit's core documents
> **Version**: 1.0
> **Date**: 2026-02-22
> **Related**: [`canonical-projection-model.md`](canonical-projection-model.md) (conceptual foundation), [`judgment-driven-development.md`](judgment-driven-development.md) (design philosophy), [`delta-driven-design.md`](delta-driven-design.md) (design theory), [`blueprint.md`](blueprint.md) (product specification), [`terminology-map.md`](terminology-map.md) (term reference)
> **Future roadmap**: [`reviews/translation-ontology-roadmap.md`](reviews/translation-ontology-roadmap.md)

---

## 1. Foundational Perspective

**"Sprint Kit's core operation (Crystallize) is translation from user grammar to development grammar. Only humans can set the direction of translation."**

This declaration decomposes into two parts:

| Part | Nature | Essence |
|------|--------|---------|
| **A1 — Ontological**: "The core operation is translation" | What Sprint Kit *does* | A rule-based mapping exists between Experience projection and Code projection, and Crystallize executes this mapping |
| **A2 — Axiological**: "Only humans can set the direction" | Why Sprint Kit *needs humans* | The decision of what to translate (what the target should be) cannot be mechanically derived |

From A1, Delta-Driven Design is derived — if translation is the core operation, the delta is translation's natural output.
From A2, Judgment-Driven Development is derived — if humans set the direction, judgment points (JPs) are essential.

### Scope Delimitation

The "translation" framing applies most directly to Crystallize. Sprint Kit's full pipeline includes activities that are not translation:

| Phase | Activity | Relation to Translation |
|-------|----------|------------------------|
| Phase 1 (Answer Discovery) | Solution space exploration, PRD generation, Architecture decisions | Not translation — **search for what to translate** |
| Phase 2 (Crystallize) | User grammar → development grammar conversion, delta extraction | **Translation itself** |
| Phase 3 (Execution) | Delta implementation, code generation | Not translation — **realization of translation results** |

Therefore, "software is translation" is not the claim — **"Sprint Kit's core operation is translation"** is the precise declaration. Phase 1 (exploration) and Phase 3 (execution) are the context around translation, not translation itself.

---

## 2. Hypothesis System

The foundational perspective is not an axiom. It stands on multiple hidden hypotheses, and if these break, the foundational perspective's validity changes. We make these explicit.

### 2.1 Foundational Perspective (A1 + A2)

| ID | Declaration | Nature |
|----|-------------|--------|
| **A1** | Sprint Kit's core operation is translation from user grammar to development grammar | Ontological |
| **A2** | Only humans can set the direction of translation (what to translate) | Axiological |

### 2.2 Auxiliary Hypotheses (H1-H4)

Structural hypotheses required for A1 and A2 to hold. These are conditions for Sprint Kit's design to function correctly.

| ID | Hypothesis | Basis | Breaking Condition |
|----|-----------|-------|-------------------|
| **H1** | The three projections (Experience, Code, Policy) are separable | The system's users, implementers, and regulators use different expression systems | When projections collapse into one — e.g., a solo developer building a personal tool (user = developer = policymaker: all three projections merge) or a heavily regulated system where compliance fully dictates UX (Policy ≈ Experience) |
| **H2** | Deterministic mapping rules exist between the two grammars | The Translation Rules table is finite and enumerable | When mapping is inherently emergent and cannot be rule-ified |
| **H3** | Users can verify correctness only in their own grammar | Product experts judge through prototypes, not through specs | When users can speak development grammar |
| **H4** | Information lost in translation (carry-forward) can be recovered from separate sources | NFR, security, migration, etc. are injected from PRD, Architecture, Brownfield | When carry-forward sources are incomplete or inaccessible — e.g., legacy system with no PRD or architecture docs, or third-party service with no accessible codebase. Sprint Kit degrades: unverifiable carry-forward items are flagged as UNKNOWN provenance |

### 2.3 Empirical Hypotheses (H5-H7)

Empirical conditions required for Sprint Kit's economic principles to hold. These are facts observed at the current technology level and may change with technological advancement.

| ID | Hypothesis | Current Status | Volatility |
|----|-----------|---------------|------------|
| **H5** | AI generation quality is "review-worthy" | True (2024-2026 LLM standard) | Breaks if AI regresses |
| **H6** | Upfront input actually improves generation quality | Observed (Grade A vs C Brief difference) | Weakens if input-agnostic models emerge |
| **H7** | AI regeneration cost is "manageable" (5-15 min/cycle) | True (current standard) | Breaks if cost surges; JP1 becomes unnecessary if cost drops to ~0 |

H7 is particularly significant. If regeneration cost drops sufficiently (≈ 0), the reason for JP1's existence vanishes — Brief can go straight to JP2. Conversely, if cost surges, "disposable treatment" becomes impossible and the system regresses to patch-based modification.

### Significance of Hypothesis Categorization

| Category | Hypotheses | Dependent Principles |
|----------|-----------|---------------------|
| **Logical necessity** | A1, A2, H1, H2, H3, H4 | DDD, JDD, FP1-FP6 |
| **Technology-dependent** | H5, H6, H7 | Cost formula, JP1 existence, regeneration-default principle |

Even if technology-dependent hypotheses break, the logical structure (two grammars, translation, need for judgment) remains valid. Only the realization method changes.

---

## 3. Derivation Structure (5-Layer)

The derivation path from foundational perspective to Sprint Kit's principles, design judgments, and implementation is organized into 5 layers.

| Layer | Name | Content | Examples |
|-------|------|---------|----------|
| **L1** | Foundational Perspective | A1 + A2 | "The core operation is translation. Humans set the direction." |
| **L2** | Hypotheses | H1-H7 | "Two grammars are separable", "AI generation is review-worthy" |
| **L3** | Core Principles | FP1-FP6 | "Human judgment is the only lasting asset", "Translation is rule-based" |
| **L4** | Design Judgments | DJ1-DJ10, JDD design judgments | "Expand design.md", "Carry-forward lifecycle management" |
| **L5** | Implementation Re-description | Pipeline, artifacts, tools | Crystallize, Delta Manifest, Translation Rules |

### Note on L5

L5 is a **re-description** of existing implementation. Translation Ontology adds no new implementation — it reinterprets the operations the existing pipeline already performs through the translation framing. This reinterpretation is a "structural analogy." The mathematical correspondences (calculus, projections) are valid as analogy, not as isomorphism — describing the same operations in a different language without claiming complete mathematical equivalence.

---

## 4. Derivation Paths

### 4.1 JDD Derivation (A2 → FP1 → Medium(H7) → JP)

```
A2: Only humans can set the direction
  → FP1: Human judgment is the only lasting asset
    → H7: Regeneration cost is manageable
      → Design judgment: Artifacts are disposable and regenerable
        → H3: Users can verify correctness only in their own grammar
          → Artifacts as Medium: Judge on top of concrete deliverables
            → JP1 (direction validation) + JP2 (target validation)
```

**JP1's unique function — direction validation**:

JP1 is not simply "let's check midway because AI is slow." JP1 has a unique function that JP2 cannot replace:

| Validation Type | JP1 (Direction Validation) | JP2 (Target Validation) |
|----------------|---------------------------|------------------------|
| "Are any scenarios missing?" | **Essential** — what's not in the prototype is invisible | Partial — can only validate what exists |
| "Are priorities correct?" | **Essential** — only judgeable at requirements level | Impossible — prototype doesn't express priority |
| "Does this scenario match real customers?" | **Essential** — presented as customer journey narrative | Partial — can only experience what's implemented |
| "Is the screen layout natural?" | Impossible — text-level only | **Essential** — direct experience |
| "Does the feature work as expected?" | Impossible — technical spec level | **Essential** — direct manipulation |

Therefore, JP1 may not completely disappear even if AI speed becomes infinite. Its form may change — for example, presenting a requirements checklist alongside the prototype.

### 4.2 DDD Derivation (A1+H1+H2 → 3-Projection → FP6(H4) → FP4)

```
A1: The core operation is translation
  + H1: Three projections are separable
  + H2: Deterministic mapping rules exist
    → 3-Projection Model: Experience ↔ Code (+ Policy carry-forward)
      + H4: Projection gaps are recoverable from separate sources
        → FP6: Translation is rule-based
          → Complete Specs = translate(Prototype) + carry-forward
            → FP4: Delta definition is the primary goal
              → Delta = Complete Specs - Brownfield
```

**FP6 Multi-Input Structure**:

Translation input is not the prototype alone. Complete translation combines three inputs:

| Input | Role | Source |
|-------|------|--------|
| **Prototype** | Target state expressed in user grammar | JP2 approval |
| **Carry-forward sources** | Non-visible requirements (NFR, security, migration) | PRD, Architecture, Brownfield |
| **Brownfield baseline** | Current system state | brownfield-context.md L1-L4 |

```
translate(Prototype, CarryForwardSources, Brownfield)
  = translate(Prototype) + carry-forward(PRD, Architecture, Brownfield) - Brownfield
  = Delta
```

If any of the three inputs is missing, translation is incomplete:
- Without prototype: no translation target
- Without carry-forward: projection gaps missing (non-visible requirements lost)
- Without Brownfield: cannot compute delta (degrades to ∅ for Greenfield)

### 4.3 Economic Principles Derivation (H5+H6 → Input Quality, Regeneration, Cost)

```
H5: AI generation is review-worthy
  + H6: Upfront input improves quality
    → Input reduces cycles
      + H7: Regeneration cost is manageable
        → Regeneration over modification (FP5)
          → Cost formula: C_total = C_input + C_gen × N_gen + C_judge × N_judge + C_carry + C_brownfield
```

Economic principles depend entirely on empirical hypotheses (H5-H7). If these change:
- H5 breaks → artifacts not review-worthy → entire system fails to function
- H6 breaks → inputs/ becomes meaningless → shift to pure iterate model
- H7 drops sharply → regeneration cost ≈ 0 → JP1 unnecessary, Brief → JP2 direct

---

## 5. Document Relationships and Structural Positions

### 4-Document Responsibility Matrix

| Concern | JDD | DDD | Blueprint | Translation Ontology |
|---------|-----|-----|-----------|---------------------|
| **Why human judgment is needed** | Primary | - | Summary | Derivation path |
| **What two grammars and translation are** | Reference | Primary | Summary | Hypothesis structure |
| **How the pipeline works** | - | Primary | Primary | Re-description |
| **What the user does** | Summary | - | Primary | - |
| **Where principles come from** | Declaration | Declaration | Declaration | **Derivation path** |
| **What changes when hypotheses break** | - | - | Risk model | **Hypothesis system** |

Translation Ontology does **not repeat** the content of other documents. Its role is to reveal where the principles each document declares are derived from, and what hypotheses they stand upon.

### Sprint Kit and BMad Relationship

**Current state**: Sprint Kit utilizes the BMad Method and is currently dependent on BMad.

Specific dependency points:
- `auto-sprint.md`: BMad agent paths hardcoded (Mary, John, Winston)
- `crystallize.md`: BMad agent paths hardcoded (John, Winston)
- `jdd-sprint-protocol.md`: `_bmad/docs/prd-format-guide.md` mandatory reference
- Format guides: Located inside BMad (`_bmad/docs/`)

**Theoretical structure**: Sprint Kit's logical core (translation, delta, judgment) does not depend on BMad. What BMad handles is the exploration quality of the "Answer Discovery" Phase (Phase 1), which could be replaced by other frameworks (GSD, etc.). The contact point is the artifact format contract (planning-artifacts/ directory).

**Separation roadmap**: See [`reviews/translation-ontology-roadmap.md`](reviews/translation-ontology-roadmap.md) §1.

---

## 6. Corrections

During the Translation Ontology discussion, items requiring correction in existing documents were discovered.

### 6.1 JP1: Direction Validation as Unique Function

**Previous description**: "JP2 is the essential judgment point; JP1 is a practical supplement for current technology limitations."

**Correction**: JP1 has a unique **direction validation** function that JP2 cannot replace. Detecting missing scenarios not present in the prototype, judging priorities at the requirements level, and confirming alignment with customer journeys cannot be performed at JP2. JP1 is simultaneously a practical supplement and has its own unique role of direction validation.

**Correction scope**: JDD, Blueprint. (See §4.1 JP1 table)

### 6.2 FP6: Multi-Input Translation Rule

**Previous description**: Translation input described as if prototype alone.

**Correction**: Complete translation combines three inputs: prototype, carry-forward sources, and Brownfield baseline. Without the prototype alone, the integration constant (carry-forward) is missing and translation is incomplete. (See §4.2 FP6 Multi-Input Structure)

**Correction scope**: DDD FP6 — add multi-input structure explanation.

### 6.3 Regeneration: Provenance-Based Criteria

**Previous description**: Regeneration scope described as determined only by "feedback magnitude."

**Correction**: Regeneration scope is more precisely determined by feedback **provenance**:

| Feedback Provenance | Meaning | Regeneration Scope |
|--------------------|---------|-------------------|
| Already present in user's original input | Translation/generation error | Regenerate that stage only |
| Not in user input but inferable from it | AI inference omission | Regenerate that stage + downstream |
| Entirely absent from user input — new requirement | New input | Edit Brief, restart pipeline |

Provenance-based classification enables more precise regeneration cost estimation.

**Correction scope**: JDD "Regeneration Over Modification" section.

### 6.4 Cost Formula Refinement

**Previous description**: `Total cost = (upfront input cost) + (generation cost × generation count) + (judgment cost × judgment count)`

**Correction**: The 3-term formula is intuitive but omits carry-forward cost and Brownfield collection cost:

```
C_total = C_input + C_gen × N_gen + C_judge × N_judge + C_carry + C_brownfield
```

| Term | Meaning | How to Reduce |
|------|---------|---------------|
| C_input | Upfront input collection/preparation cost | Leverage existing materials |
| C_gen × N_gen | AI generation cost × iteration count | C_input ↑ → N_gen ↓ |
| C_judge × N_judge | Judgment cost × judgment count | C_input ↑ → N_judge ↓ |
| C_carry | Carry-forward registration/verification cost | Structured PRD/Architecture |
| C_brownfield | Brownfield collection/parsing cost | MCP/--add-dir auto-collection |

The 3-term formula is sufficient for user-facing explanations. The 5-term formula is used for internal system optimization.

**Correction scope**: Blueprint S4.4 — add 5-term formula alongside.

### 6.5 BMad: "Extension Pack" → "Utilizes" (Acknowledging Current Dependency)

**Previous description**: "Sprint Kit = BMad execution extension pack", "BMad is the base platform"

**Correction**: "Extension pack" implies Sprint Kit was built to fit BMad's design. In reality, Sprint Kit **utilizes** BMad while its logical core (translation, delta, judgment) does not depend on BMad. The current implementation is dependent on BMad, and separating this dependency is a future task.

- "BMad execution extension pack" → "Utilizes BMad Method"
- "BMad is the base platform" → "Currently dependent on BMad; separation see roadmap"

**Correction scope**: JDD, Blueprint.

---

## 7. Limitations and Open Questions

### 7.1 Activities Not Explained by "Translation"

Sprint Kit's pipeline includes activities not captured by the translation framing:

- **Exploration (Phase 1)**: PRD generation, Architecture decisions are activities that "find what to translate," not translation itself. BMad agent facilitation, Party Mode analysis, etc. are discovery processes unrelated to translation.
- **Implementation (Phase 3)**: Workers converting delta to code is "realization" rather than translation. Code generation requires implementation judgments (library selection, performance optimization, etc.) beyond translation rules.
- **Verification (Validate)**: Judge agents' quality/security/business verification is not translation accuracy verification but independent quality assurance.

### 7.2 Projection Model Resolution

The ontological ambiguity between "Two Grammars" and "N-Projections" (previously an open question) has been resolved by the **Canonical + 3 Projections model** ([`canonical-projection-model.md`](canonical-projection-model.md)):

- **How many projections?** Three: Code, Policy, Experience. Fixed set, not unbounded N.
- **What is their relationship?** Each projection reveals different aspects of a single canonical definition. No hierarchy — JPs resolve conflicts between projections through business judgment.
- **What about inter-projection interactions?** Carry-forward is precisely the inter-projection information gap. The 3-Projection model makes this structurally explicit.

The Two Grammars terminology (User Grammar, Development Grammar) is preserved as operational shorthand in translation rules.

### 7.3 Verification Status of Empirical Hypotheses (H5-H7)

| Hypothesis | Verification Method | Current Data |
|-----------|-------------------|-------------|
| H5 (AI review-worthy) | JP1/JP2 Comment ratio | Limited — few Sprint observations |
| H6 (Input improves quality) | Grade A vs C Brief comparison | Qualitative observation only |
| H7 (Regeneration cost manageable) | Cycle time measurement | 5-15 min/cycle (current observation) |

Systematic verification of these hypotheses requires accumulation of actual Sprint Kit usage.

---

## Appendix: Derivation Process

### Discussion History

Translation Ontology emerged from meta-analysis derived from the DDD mathematical framing (§5) discussion. It was discovered in the process of seeking a unified framing that runs through the 4 core documents (JDD, DDD, Blueprint, Terminology Map).

Key discussion stages:
1. **Unification attempt**: Can the principles of all 4 documents be derived from a common foundation?
2. **"Translation" framing discovery**: Recognizing that Crystallize's essence is inter-grammar translation
3. **Axiom system attempt**: Attempting to set "software is translation" as an axiom
4. **Party Mode triple verification**: Verification by logician, editor, and Devil's Advocate
5. **Post-correction finalization**: Correcting overclaims → restructured as foundational perspective + hypothesis system

### Party Mode Verification Results

Three reviewers examined the initial draft and made the following corrections:

| Initial Claim | Correction | Reviewer | Reason |
|--------------|-----------|----------|--------|
| "Axiom" | "Foundational perspective" | Logician | Hidden hypotheses H1-H7 exist, so it is not an axiom |
| "Software is translation" | "Crystallize is translation" | Devil's Advocate | Phase 1 (exploration) and Phase 3 (execution) are not translation |
| "Structural isomorphism" | "Structural analogy" | Logician | Insufficient basis to claim complete mathematical equivalence |
| QUERY-N/TECH-N design included | Separated to roadmap | Editor | Including unimplemented designs in the main text causes confusion |
| BMad separation plan included | Separated to roadmap | Editor | Separate current state description from future tasks |

These corrections are reflected in §1-§7 of this document.
