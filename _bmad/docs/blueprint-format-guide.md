# Blueprint Writing Guidelines

Format definition for a document that conveys a product's **"why" and "how it works"** to the target audience in a self-contained manner.

> **Reference documents:**
> - PRD format guide: `_bmad/docs/prd-format-guide.md`
> - Sprint Kit Blueprint (instance): `docs/blueprint.md`
> - JDD philosophy: `docs/judgment-driven-development.md`

---

## 1. Self-Containment Principle

If the Blueprint's target audience **does not read code**, operational details must be included in the Blueprint.

- "See code for details" or "See agent file" is allowed only when the target audience can read code
- The Blueprint is the **only comprehensive document** for the target audience
- Even if tool, agent, or workflow descriptions "overlap" with agent definition files, they must be included since this is the **only accessible form** for the target audience

**Verification criterion**: Can the target audience recreate this product/service with AI using only this document?

---

## 2. YAML Frontmatter

Every Blueprint starts with a YAML frontmatter.

```yaml
---
synced_to: "{commit-hash}"     # Last commit where non-Blueprint source file changes were reflected
audience: "{target audience}"   # e.g., "non-developer product expert", "entire team", "external investors"
product: "{product name}"
version: "{document version}"
---
```

### Required Fields

| Field | Purpose |
|-------|---------|
| `audience` | Target audience definition. Determines self-containment level and terminology depth |
| `product` | Product/service name covered by the Blueprint |

### Optional Fields

| Field | Purpose |
|-------|---------|
| `synced_to` | Source file sync tracking (last reflected commit of non-Blueprint files) |
| `version` | Document version |

---

## 3. Vision Statement

Place a **vision statement** in a blockquote immediately below the frontmatter.

- Describe what the product aspires to be in 3-5 sentences
- Target audience must grasp "what this product is" from the first paragraph
- **Core principle**: State the product's core principle as one sentence at the end of the vision statement

```markdown
> {product} aspires to be a {tool/service/platform} that enables {who} to {what}.
> ...
>
> Core principle: **{one-sentence core principle}**
```

---

## 4. 8-Section Structure

### Overview

| # | Section | One-Line Purpose |
|---|---------|-----------------|
| 1 | **Problem** | Why this product exists |
| 2 | **Thesis** | Core principle + design judgments + preconditions |
| 3 | **User Model** | Who uses it and what role they play |
| 4 | **Value Chain** | System components + pipeline + routes + cost |
| 5 | **Judgment & Feedback** | How judgments are made + feedback mechanisms |
| 6 | **Constraints & Trade-offs** | What it doesn't do + conscious trade-offs |
| 7 | **Risk Model** | Assumptions + what breaks + detection signals |
| 8 | **Current State** | Current status + unvalidated hypotheses + known gaps |

### Appendix (optional)

| Appendix | Purpose |
|----------|---------|
| A. Setup & Operations | Setup, configuration, operations guide |
| B. File Structure | Directory tree + per-file roles |
| C. Glossary | Product-specific term definitions |

---

## 5. Per-Section Writing Rules

### S1 Problem

**Purpose**: Define the problem this product solves.

**Required elements**:
- Current state of the problem (who struggles in what situation)
- Why existing solutions are insufficient
- Why this problem matters

**Quality criteria**:
- Non-experts should understand the severity of the problem
- Describe the problem only, without mentioning the solution

**Anti-patterns**:
- No: Describe the solution first and reverse-engineer the problem
- No: Use only industry jargon, making it incomprehensible to the target audience

---

### S2 Thesis

**Purpose**: State the core principle and design judgments for the problem.

**Required structure**:

```
2. Thesis
  2.1 Core Principle — one sentence. Same as "core principle" in the vision statement
  2.2 Design Judgments — specific judgments to realize the core principle
  2.3 Preconditions — what must be true for the core principle to hold
  2.4 When the Principle Fails — scenarios where the core principle breaks down
```

**S2.1 Core Principle**:
- One sentence
- Restatement of the principle already declared in the vision statement

**S2.2 Design Judgments**:
- Number and format are flexible (3-10 recommended)
- Each judgment follows this structure:
  - **Name** (English, short declarative statement)
  - **One-line summary** (blockquote)
  - **Explanation**: Why this judgment + examples
  - **Product implementation**: How this judgment manifests in the product

**S2.3 Preconditions**:
- Things that must be true for the core principle to hold
- e.g., "AI generation quality must be at a reviewable level"

**S2.4 When the Principle Fails**:
- Scenarios where the core principle fails
- What happens when it fails

**Quality criteria**:
- Each design judgment in S2.2 must be referenced as rationale in S4 (Value Chain), S5 (Judgment), S6 (Constraints)
- The causal chain "principle → judgment → implementation" must be clear

**Anti-patterns**:
- No: Number design judgments as "Principle 1, Principle 2" (judgments are not principles)
- No: List declarations without rationale
- No: Omit preconditions and failure scenarios

---

### S3 User Model

**Purpose**: Who uses this product and what role they play.

**Required elements**:
- Target user definition (affirmative: what expertise they have)
- What users do (specific role/behavior list)
- What the system does (what users don't do)

**Quality criteria**:
- Define users by expertise, not by negation ("not a ~")
- Clear boundary between user role and system role

**Anti-patterns**:
- No: Define by negation ("non-developer", "non-expert")
- No: Ambiguous boundary between user and system roles

---

### S4 Value Chain

**Purpose**: How the product delivers value. Explain system components, process, routes, and cost.

**Required structure**:

```
4. Value Chain
  4.1 System Components — tools, agents, external integrations, etc.
  4.2 Pipeline — full workflow details
  4.3 Route Selection — variations by input state/user type
  4.4 Cost Structure — cost formula or ROI analysis
```

**S4.1 System Components**:
- Tools/services/agents/external integrations table
- One-line role description for each component

**S4.2 Pipeline**:
- **Follow-Along pattern recommended**: Describe "what the user sees (external)" and "system behavior (internal)" in parallel at each step
- Each step includes:
  - User perspective: what the user does / receives
  - System internals: input → processing → output
  - Artifacts: generated outputs
  - On failure: error situations and responses
  - **Rationale design judgment**: why this step exists (references S2.2)
- Depth appropriate to target audience
  - Delivery app: summary level like "order → matching → delivery → rating"
  - Dev tool: detailed per-phase walkthrough

**S4.3 Route Selection**:
- Branching by input state/user type
- Specify convergence points for all routes
- Whether cross-route transitions (crossover) are possible

**S4.4 Cost Structure**:
- Cost formula or ROI comparison
- Time/cost comparison with real-world workflow (if applicable)

**Quality criteria**:
- Each step in S4.2 must cite a rationale design judgment
- Target audience must be able to follow the entire process end-to-end

**Anti-patterns**:
- No: List components without explaining the flow
- No: Omit failure paths in the pipeline
- No: "See code for details" (violates self-containment principle)

---

### S5 Judgment & Feedback

**Purpose**: How users judge and how feedback is incorporated.

**Required elements**:
- Judgment model (JPs, star ratings, quizzes, reviews, etc. — whatever fits the product)
- Details at each judgment point (what they see, what they judge, how they respond)
- Feedback incorporation mechanism (how feedback flows back into the system)
- Reverse loop (when later stages discover errors in earlier stages)

**Quality criteria**:
- Judgment points are implementations of S2.2 design judgments (cite explicitly)
- Feedback incorporation paths are specific (what scope is modified/regenerated)

**Anti-patterns**:
- No: "We incorporate user feedback" level of abstract description
- No: Omit feedback cost/scope

---

### S6 Constraints & Trade-offs

**Purpose**: What this product consciously does not do and its trade-offs.

**Required elements**:
- Boundaries: what this product does not do
- Trade-offs: consciously chosen directions and their costs
- Left open: what has not been decided yet and why

**Quality criteria**:
- Each trade-off connects to an S2.2 design judgment
- "What it doesn't do" must be clear enough to prevent scope confusion

**Anti-patterns**:
- No: No constraints, "can do everything"
- No: Hide the cost of trade-offs

---

### S7 Risk Model

**Purpose**: Define core assumptions, what happens if they break, and detection signals.

**Required structure**:

| Assumption | If Broken | Detection Signal |
|-----------|-----------|-----------------|
| {what must be true} | {impact when broken} | {how to detect it} |

**Quality criteria**:
- Connect to S2.3 preconditions
- Detection signals must be specific and measurable

**Anti-patterns**:
- No: List risks without detection methods
- No: "No risks"

---

### S8 Current State

**Purpose**: Honestly describe the product's current state.

**Required elements**:
- Current version/state
- Unvalidated hypotheses (not yet validated through real usage)
- Known gaps (differences between design and implementation)

**Quality criteria**:
- Consistent with CHANGELOG or release notes
- Unvalidated hypotheses connect to S7 assumptions

**Anti-patterns**:
- No: Hide incomplete state and describe as "complete product"
- No: Describe unimplemented features as if implemented

---

## 6. Appendix Guide

Appendices hold reference information without disrupting the main text flow.

**Principles**:
- Appendices also follow the self-containment principle. Do not reference agent files or code
- Target audience must understand all terms and structures within the Appendix

**Common Appendices**:

| Appendix | Purpose | Inclusion Criteria |
|----------|---------|-------------------|
| Setup & Operations | Setup, configuration, operations guide | When target audience directly installs/operates |
| File Structure | Directory tree + per-file roles | When file structure understanding is needed |
| Glossary | Product-specific term definitions | When 10+ product-specific terms exist |

---

## 7. Writing Rules

### Language

- Match the target audience's language (Korean products in Korean, international products in English)
- Use technical terms at the target audience's level. Define unavoidable terms in the glossary (Appendix C)

### Information Density

- Every sentence must carry information weight
- Remove filler words, repetition, decorative prose
- Use tables when more efficient than prose

### Reference Rules

- Intra-Blueprint section references: `S{number}` format (e.g., "see S2.2 Design Judgments")
- External document references: check self-containment principle first. Reference only if target audience can access
- Design judgment references: use English judgment names when citing rationale in S4, S5, S6

### Length Guide

| Product Complexity | Expected Length | S4 Proportion |
|-------------------|----------------|---------------|
| Simple (single feature) | 200-400 lines | 30% |
| Medium (multi-feature service) | 400-800 lines | 40% |
| Complex (platform/toolkit) | 800-1200 lines | 45% |

---

## 8. Checklist (Self-Review)

Verify the following after Blueprint completion:

### Structure

- [ ] YAML frontmatter has `audience` field
- [ ] Vision statement exists immediately below frontmatter
- [ ] All 8 sections exist (S1-S8)
- [ ] Appendix included if needed

### Self-Containment

- [ ] Zero occurrences of "see code" or "see agent file"
- [ ] Target audience can understand the product from this document alone
- [ ] All terms are defined within the document or in the glossary

### Causal Chain

- [ ] S2.1 (principle) → S2.2 (judgments) → referenced as rationale in S4/S5/S6
- [ ] S2.3 (preconditions) → connected in S7 (Risk Model)
- [ ] Each step in S4.2 cites a rationale design judgment

### Information Preservation (when rewriting existing documents)

- [ ] All information from the existing document is mapped to the new structure
- [ ] Verified zero loss items via mapping table

### Consistency

- [ ] Vision statement core principle = S2.1 core principle (same sentence)
- [ ] S8 Current State is consistent with CHANGELOG
- [ ] External reference documents (JDD, etc.) have role division, not overlap
