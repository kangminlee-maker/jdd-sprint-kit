# Translation Ontology Roadmap

> **Document type**: Roadmap — future tasks derived from Translation Ontology discussion
> **Date**: 2026-02-22
> **Related**: [`../translation-ontology.md`](../translation-ontology.md), [`../delta-driven-design.md`](../delta-driven-design.md), [`../judgment-driven-development.md`](../judgment-driven-development.md)

---

## 1. BMad Separation

### 1.1 Current State

Sprint Kit utilizes the BMad Method and is currently hardcoded-dependent on BMad at several points:

| File | Dependency Point |
|------|-----------------|
| `.claude/agents/auto-sprint.md` | BMad agent paths hardcoded (Mary, John, Winston) |
| `.claude/agents/crystallize.md` | BMad agent paths hardcoded (John, Winston) |
| `.claude/rules/jdd-sprint-protocol.md` | `_bmad/docs/prd-format-guide.md` mandatory reference |
| All format guides | Located inside BMad (`_bmad/docs/`) |

### 1.2 Theoretical Structure

As analyzed in Translation Ontology (§5), Sprint Kit's logical core (translation, delta, judgment) does not depend on BMad. What BMad handles is the exploration quality of the "Answer Discovery" Phase (Phase 1).

The contact point is the artifact format contract:
- File formats in the planning-artifacts/ directory (PRD, Architecture, Epics) serve as the interface
- Sprint Kit receives these formats as input and generates Specs, Deliverables, Prototype
- Whether BMad or another framework produces them, Sprint Kit works as long as the output follows the same format

### 1.3 Work Items for Separation

- [ ] Extract format contracts out of BMad (e.g., `docs/format-contracts/` or `.claude/formats/`)
  - Move `prd-format-guide.md`, `architecture-format.md`, etc. from BMad directory to independent location
  - Retain only wrappers inside BMad that reference those formats
- [ ] Parameterize agent paths in `auto-sprint.md`, `crystallize.md`
  - Current: `Read _bmad/bmm/personas/pm.md` (hardcoded)
  - Target: Reference `config.yaml`'s `discovery_engine.agents.pm` path
- [ ] Add `discovery_engine` settings to `_bmad/bmm/config.yaml`
  - Manage agent paths, workflow paths, format guide paths as configuration
- [ ] Design adapter pattern for integration with other frameworks (GSD, etc.)
  - If another framework outputs the same planning-artifacts/ format, Sprint Kit works
  - If the format differs, an adapter converts that framework's output to Sprint Kit format

---

## 2. QUERY-N: Batch Query for Untranslatable Business Decisions

### 2.1 Design Overview

During Crystallize, gaps may be discovered where translation rules cannot be applied. Some of these gaps require business decisions.

**Trigger conditions** (all three must be met):
1. Cannot be resolved with existing input (prototype, PRD, Architecture, Brownfield)
2. High downstream impact (applying a default value silently would be risky)
3. The product expert can answer this business question

**Behavior**:
- Crystallize detects gaps and collects them as a batch
- Queried to the product expert all at once (batch, not individual interrupts)
- Responses are registered as sourced input (`QUERY-N` tag)
- Crystallize resumes with registered responses

**Relationship to existing mechanisms**: Currently such gaps are handled by AI applying defaults (TECH-N, §3), inferring from the prototype, or proceeding with the gap unaddressed. QUERY-N is a mechanism that explicitly captures "gaps requiring business decisions."

### 2.2 Unresolved Design Issues

- [ ] Escalation strategy when gap count exceeds 20+
  - Presenting 20+ QUERYs as a batch is excessive user burden
  - Priority classification? Staged queries? Recommend regeneration when threshold exceeded?
- [ ] Classification criteria for business/technical decision boundary
  - "How long should data be retained?" → Business (QUERY-N)
  - "What indexing strategy?" → Technical (TECH-N)
  - Classification rules for ambiguous boundaries
- [ ] Insertion point for batch query stage in `crystallize.md` pipeline
  - After S1 (prototype analysis)? During S3 (spec generation)? Before S5 (cross-artifact consistency)?
  - Gap detection scope varies depending on insertion point
- [ ] Collect gap count distribution data from actual Sprints
  - Currently no empirical data on gap frequency
  - Need to observe several actual Sprints to measure how many QUERY-N-eligible gaps arise

---

## 3. TECH-N: AI Default Technical Decision Inventory

### 3.1 Design Overview

Technical decisions that the product expert cannot answer must have AI-applied defaults. These decisions are **explicitly inventoried** so implementation experts can review them.

**Target**: Complement to QUERY-N — while QUERY-N covers "business decisions humans must answer," TECH-N covers "technical decisions where AI applied defaults."

**Examples**:
- TECH-1: Pagination strategy → offset-based (default)
- TECH-2: Cache expiry policy → 5 min TTL (default)
- TECH-3: File upload size limit → 10MB (default)

**Purpose**: Make AI's default decisions "transparent." Currently such decisions are made implicitly, with issues discovered only after implementation.

### 3.2 Unresolved Design Issues

- [ ] Resolving tension with FP1: mechanism to prevent de facto permanence of AI decisions
  - FP1 declares "human judgment is the only lasting asset"
  - But if TECH-N defaults are implemented without review, AI decisions become de facto permanent
  - Is a mandatory review gate needed? Or is inventorying sufficient?
- [ ] Managing regeneration cost when defaults are changed after downstream propagation
  - After TECH-N defaults are already reflected in api-spec.yaml, schema.dbml, etc.
  - If an implementation expert changes a default, all downstream artifacts must be regenerated
  - Need impact scope analysis and partial regeneration
- [ ] Add TECH-N review checklist to `/validate` `@judge-quality`
  - Judge reviews whether each item in the TECH-N inventory is appropriate
  - Flags inappropriate defaults
- [ ] Classification criteria for TECH-N items: "no downstream impact" vs "has downstream impact"
  - No downstream impact: variable naming, logging level, etc. → review optional
  - Has downstream impact: DB indexing strategy, cache policy, etc. → review mandatory
- [ ] Mandatory review gate design (before vs after Crystallize completion)
  - Before Crystallize completion: present TECH-N inventory alongside JP2? (user burden)
  - After Crystallize completion: implementation expert review before /parallel starts?
  - At /validate stage: post-hoc review?

---

## 4. Priority and Dependencies

| Item | Priority | Dependencies | Notes |
|------|----------|-------------|-------|
| BMad separation — extract format contracts | Medium | None | Required before integrating other frameworks |
| BMad separation — parameterize agent paths | Medium | Format contract extraction | Proceed simultaneously with config.yaml design |
| QUERY-N — collect gap frequency data | High | None | Confirm actual need before designing |
| QUERY-N — pipeline insertion design | Low | Gap frequency data | Over-engineering risk without data |
| TECH-N — inventory mechanism | Medium | None | Can start with simple list |
| TECH-N — mandatory review gate | Low | Inventory mechanism | Decide after accumulating real usage experience |
