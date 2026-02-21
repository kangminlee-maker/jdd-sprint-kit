# Changelog

All notable changes to JDD Sprint Kit will be documented in this file.

---

## [0.6.0] - 2026-02-21

### Added
- **Delta-Driven Design** — New core document (`docs/delta-driven-design.md`) establishing Sprint Kit's conceptual foundation
  - Sprint Kit's primary goal: defining the delta between brownfield (current) and prototype-validated target
  - Two Grammars model: User Grammar (prototype) → Development Grammar (specs) translation
  - 6 Core Principles (CP1-CP6) + 10 Design Judgments (DJ1-DJ10)
  - 3-Pass Pattern: Answer Discovery → Translation & Delta Extraction → Delta Execution
  - Methodology comparison: 18 methodologies surveyed, 7 key traits identified
- **LLD Conditional Sections** — design.md now generates Low-Level Design sections when project complexity requires
  - State Transitions (Mermaid stateDiagram + transition table) — triggered by State Transition FRs in PRD
  - Algorithm Specs (pseudocode + decision table) — triggered by Algorithmic Logic FRs
  - Concurrency Controls — triggered by Concurrency NFR or brownfield concurrent patterns
  - Scheduler Specs — triggered by scheduled/periodic FR keywords
  - Migration Strategy — triggered by brownfield table modifications
  - Error Handling Strategy — when complexity != simple
  - Operational Specs (logging, monitoring, env vars) — when complexity != simple
- **Delta Manifest** (`reconciled/delta-manifest.md`) — Crystallize S5b output classifying every change
  - 7-field schema: delta_id, type, origin, source_fr, scope, resource, task_id
  - Delta types: positive (new), modification (changed), zero (unchanged), negative (removed)
  - Origin types: proto, carry-forward:defined, carry-forward:deferred, carry-forward:new
  - Carry-forward ratio computation for Option C decision gate
- **Devil's Advocate Agent** (`.claude/agents/devils-advocate.md`) — Adversarial verification
  - 7 Adversarial Lenses: API Boundary, Concurrency, State Transition, Data Integrity, Integration Failure, Business Rule Conflict, Flow Abandonment
  - Conditional execution: skip when simple AND endpoints <= 3
  - Deduplication against existing BDD scenarios
  - Output: adversarial-scenarios.md + bdd-scenarios/adversarial-*.feature (CRITICAL/HIGH)
- **Complex FR Supplementary Structures** in PRD format guide
  - State Transition FRs: States/Transitions/Invariants/Terminal states
  - Algorithmic Logic FRs: Input/Rules/Output
- **NFR categories expanded** — Concurrency (conditional) + Observability (always) added
- **JP2 Section 1.5: What Changes for Users** — Before/After brownfield comparison (L2+ conditional)
- **carry-forward registry** in design.md — explicit lifecycle management for non-prototype items
- **carry-forward classification** — `[carry-forward:defined]`, `[carry-forward:deferred]`, `[carry-forward:new]` tags

### Changed
- **Crystallize is now mandatory** — Runs automatically after JP2 approval on all routes
  - Purpose rewritten: mandatory translation + delta extraction (not optional reconciliation)
  - Pipeline: S0-S6 + new S5b (Delta Manifest). Progress counters updated to /8
  - Failure recovery: [R] Return to JP2 / [K] Skip Crystallize / [X] Exit
  - S0 skip expanded: also skips when Decisions table has 0 rows
- **JP menu restructure** — Consistent keys across JP1 and JP2
  - [A] Advanced Elicitation, [P] Party Mode, [C] Comment — shared across both JPs
  - [S] Start Prototyping (JP1) / [S] Start Crystallize (JP2) — proceed to next step
  - [X] Exit — shared across both JPs
  - Iteration limit messages updated to reference new keys
- **validate.md Judge paths parameterized** — `{specs_root}` replaces hardcoded `specs/{feature}/` in all 3 Judge invocations. Brownfield path has planning-artifacts/ fallback.
- **worker.md brownfield path** — Dynamic with `{specs_root}` + fallback + greenfield skip
- **Stage 7 XState input source** — Changed from "Architecture state diagrams" to "design.md State Transitions section" (pipeline wiring fix)
- **judge-business.md** — Input References use `{feature_dir}/`, §7 Delta Verification, §8 Adversarial Scenario Verification added
- **Scope Gate enhancements** — FR-NFR contradiction check (prd stage), LLD mapping checks (spec stage: State Transitions, Algorithm Specs, Concurrency Controls, Error Handling, Operational Specs), complexity acquisition path documented
- **deliverable-generator.md** — Stage 6 adversarial-transitions.feature, MSW state transition validation (when state-machines/ exists), endpoint_count in readiness.md JP2 Data
- **Step 5-D Devil's Advocate Pass** — Inserted between Scope Gate deliverables and JP2. Results in Section 3 with CRITICAL warning.
- **complexity value unified** — `'low'|'medium'|'high'` → `'simple'|'medium'|'complex'` in PRD format guide

### Documentation
- **docs/delta-driven-design.md** — Core theory document (CP1-CP6, DJ1-DJ10, translation rules, methodology survey)
- **docs/judgment-driven-development.md** — Delta-Driven Design reference section added
- **docs/terminology-map.md** — 14 delta terms + 6 never-translate additions
- **docs/blueprint.md** — Crystallize mandatory, Mermaid flowchart, JP2 table, routes, glossary updated
- **README.md** — Pipeline diagram + Crystallize descriptions updated
- **docs/reviews/** — LLD gap analysis, progressive refinement methodology survey, option-b remaining work tracker

---

## [0.5.4] - 2026-02-20

### Fixed
- **8 stale references corrected** — Removed "Sprint-route only" qualifier from Crystallize Flow section title, JP2 response option, and `/crystallize` command description. Updated Blueprint to version 0.5.3, budget ~85-125 turns, and glossary route info.
- **.gitignore updated** — Added `specs/*` exclusion with `!specs/test-tutor-excl` re-inclusion, so per-feature Sprint artifacts are ignored while the tutorial example remains tracked.

---

## [0.5.3] - 2026-02-20

### Improved
- **Tarball snapshot persistent cache** — Extraction path moved from `/tmp/` to `~/docs-cache/{feature}/{name}/`, surviving OS temp cleanup between Phase 0 and Scanner execution
- **Snapshot version tracking** — Records commit SHA, branch, and timestamp via `gh api commits/{ref}` after each tarball download. Propagates to brownfield-context.md `data_sources` for traceability
- **Large repo size warning** — Pre-checks repo size via `gh api repos/{owner_repo}` before download. Repos >= 1GB show a warning with size and `--add-dir` alternative, then proceed without blocking
- **Branch extraction from GitHub URL** — URLs with `/tree/{branch}` path now extract the branch for targeted tarball download (default: HEAD)

---

## [0.5.2] - 2026-02-20

### Added
- **S0 Decision Context Analysis** — New step before prototype analysis (S1). Reads decision-diary.md or jp2-review-log.md to understand JP2 modification intent and context. S1 and S2 agents use this to distinguish deliberate business decisions from implementation details.
- **`/preview` [S] Crystallize option** — Guided/Direct routes can now trigger Crystallize from `/preview` Step 3, with decision-diary.md feedback recording
- **decision-diary.md in `/preview`** — `/preview` Step 3 initializes and records JP feedback to decision-diary.md (route metadata included)

### Changed
- **Crystallize available on all routes** — Removed "Sprint-route only" restriction. Sprint (auto-sprint [S]), Guided (/preview [S]), Direct (/preview [S]), standalone (/crystallize) all supported. Decision records are optional — they enrich S0 when present.
- **sprint-log.md precondition relaxed** — No longer required for Crystallize. Decision records (decision-diary.md, jp2-review-log.md, sprint-log.md) are all optional context sources.
- **`{document_output_language}` directive propagated** — Added to ALL Task prompts (S2a/S2b/S2c/S2-G/S3/S4/S5), not just S1.
- **S4 Task dispatch specified** — S4 now has explicit Task invocation block (previously underspecified).
- **S3 output_base path** — Fixed to avoid double-nesting with deliverable-generator (feature_name='reconciled', output_base='specs/{feature}/')
- **Budget aligned** — ~85-125 turns consistently across all files (was ~85-120 in some)
- **parallel.md brownfield path** — Uses `{specs_root}` instead of hardcoded `specs/{feature}/`

### Fixed
- **prototype-analysis.md written in wrong language** — S1 Task prompt lacked `{document_output_language}` directive, causing output to default to English.
- **Crystallize pipeline step count** — Updated from 6 steps (S1-S6) to 7 steps (S0-S6) across all files.

---

## [0.5.1] - 2026-02-20

### Fixed
- **npm package missing `crystallize.md`** — `/crystallize` command was not included in the `SPRINT_KIT_FILES.commands` manifest, so `npx jdd-sprint-kit init/update` would not install it. Added to manifest.

---

## [0.5.0] - 2026-02-20

### Added
- **`/crystallize` command** — Prototype-first artifact reconciliation after JP2 iteration
  - When prototype is finalized through JP2 feedback cycles, reconciles all upstream artifacts to match
  - Creates `reconciled/` directory with definitive artifact set — original artifacts preserved untouched
  - 6-step pipeline: Prototype Analysis → Reconcile Planning (PRD/Architecture/Epics) → Generate Specs → Reconcile Deliverables → Cross-Artifact Consistency Check → Summary
  - Source attribution tags: `(source: PROTO, origin: BRIEF-N)`, `(source: PROTO, origin: DD-N)`, `(source: carry-forward)` — preserves traceability from original brief through prototype iteration
  - `[carry-forward]` tag for items not derivable from prototype (NFRs, security, deployment, scaling)
  - Product Brief excluded from scope (defines problem space, not derivable from UI code)
  - Sprint-route only (depends on decision-diary.md and sprint-log.md JP Interactions)
- **JP2 `[S] Crystallize` menu option** — Triggers Crystallize pipeline from within auto-sprint JP2 flow
  - Separate budget (~85-120 turns) independent from JP2 iteration limit (5 rounds)
  - On completion, proceeds to `/parallel` with `specs_root=reconciled/`
- **decision-diary.md** — Structured JP decision summary table (replaces feedback-log.md)
  - Records JP, Type, Content, Processing method, Result per decision
  - Role: product expert quick reference (vs sprint-log.md for full interaction audit)
- **sprint-log.md JP Interactions section** — Full text of each JP exchange recorded in real-time
  - Visual Summary presented, user input, impact analysis, processing choice, result
  - Serves as AI context for Crystallize and audit trail

### Changed
- **`specs_root` parameter** — Added to `/parallel` and `/validate` commands
  - Default: `specs/{feature}/` (backward compatible)
  - After Crystallize: `specs/{feature}/reconciled/`
  - Judges (@judge-business, @judge-quality, @judge-security) verify against reconciled artifacts
- **deliverable-generator** — Added optional `prototype_analysis_path` parameter for specs-only mode cross-reference during Crystallize
- **Specs File Pattern** — `reconciled/` subdirectory added to protocol, mirroring existing structure minus excluded items (product-brief, sprint-log, readiness, inputs/, preview/)

### Verified
- **Crystallize pipeline tested on `duplicate-ticket-purchase`** — real Sprint feature with 14 JP2 revisions (test predated decision-diary.md naming; used jp2-review-log.md which served equivalent role)
  - S1: 13 source files analyzed → 6 screens, 17 API endpoints, 9 entities, 13 user flows extracted
  - S2: PRD (16→39 FRs), Architecture (5→12 ADRs), Epics (6/26→8/36) reconciled. S2-G cross-artifact PASS
  - S3: Specs 4-file generated (36 tasks, 4 Workers, DAG with critical path)
  - S4: api-spec.yaml verified (3 missing endpoints discovered and added: hold, hold/cancel, refund-convert), BDD regenerated (5 feature files)
  - S5: 8 gaps found → all fixed (api-spec +3 endpoints, BDD +4 scenarios, task ID naming unified). Re-verified PASS
  - S6: reconciled/ directory with 21 files, 39/39 FR traceability, 15/15 API coverage

### Design Decisions
- Party Mode 2-round review (8 BMad agents) validated the design
  - Round 1: 2 CRITICAL + 6 HIGH findings → all resolved in v2
  - Round 2: 0 CRITICAL, 1 HIGH (N1: /validate integration) → resolved
  - Key decisions: "reconcile" not "reverse-generate", separate reconciled/ directory (rollback-safe), compound source tags for traceability

---

## [0.4.1] - 2026-02-20

### Fixed
- **brief.md template language** — Section headings and placeholder text follow `document_output_language`, HTML comments (user guidance) follow `communication_language`. Reference Sources section headings are always in English (machine-parseable).

---

## [0.4.0] - 2026-02-20

### Added
- **English Pack** — All agents (8), commands (7), rules (3), format guides (3), Blueprint, and JDD docs rewritten English-first (Phase 0–5, 6 stages)
- **Language Protocol** — Multi-language output via `config.yaml`
  - `communication_language`: system message language (progress, errors, JP summaries)
  - `document_output_language`: generated document language (sprint-input.md, artifacts)
  - YAML keys/enums/file paths always in English (machine-parseable)
- **Brownfield Scanner Improvement** — Topology-aware scan
  - Auto-detect project deployment structure (co-located/monorepo/msa/standalone) and select scan strategy
  - MCP Fallback redesign with 4-category classification (topology-based severity)
  - Figma MCP integration (`get_metadata`/`get_design_context`)
  - scan_metadata, dynamic data_sources, Entity Index, Ontology Coverage, Self-Validation core checks
  - Monorepo package scoping, MSA/monorepo disambiguation edge guards
- **`--add-dir` external data access** — Replace filesystem MCP servers with `--add-dir`
  - Claude Code's MCP security blocks paths outside the project root, so external repos use `--add-dir` instead
  - Directories added via `--add-dir` are accessed with Glob/Grep/Read (no MCP needed)
  - Figma remains MCP because its data is live and cannot be downloaded as files
- **Tarball Snapshot** — Auto-download read-only snapshot when GitHub repo URLs are declared in brief.md
  - Downloads current files only via `gh api tarball/HEAD` (not a git clone, no history)
  - Repos declared in Reference Sources section are downloaded without confirmation (explicit user intent)
  - Auto-detected repos (not in Reference Sources) require user confirmation via AskUserQuestion
- **brief.md Reference Sources section** — Structured `## Reference Sources` with 4 sub-sections
  - GitHub: existing service repo URLs + exploration hints
  - Figma: design file URLs
  - Policy Docs: document names for Scanner to prioritize
  - Scan Notes: free-text guidance for Brownfield scan direction
- **/sprint auto-create folder** — When `/sprint feature-name` is run and the folder does not exist, auto-creates `specs/{feature}/inputs/` + brief.md template, then exits with guidance
- **Phase 0 write-once** — sprint-input.md is written once at Step 0g (no intermediate edits, resolves hook conflicts)
- **terminology-map.md** — Korean-English term reference (`docs/terminology-map.md`)
- **CONTRIBUTING.md** + GitHub issue/PR templates

### Changed
- **BMAD Sprint Kit → JDD Sprint Kit** — Renamed to comply with BMad TRADEMARK.md (14 files, 47 substitutions)
- **Dead parameter cleanup** — Replace `brownfield_sources` parameter with sprint-input.md self-serve pattern
  - Before: callers (auto-sprint, specs) were supposed to pass brownfield_sources but never did (dead parameter)
  - After: Scanner reads `external_resources` directly from sprint-input.md to discover external sources
- **Terminology cleanup** — `mcp_servers` → `external_sources`, `brownfield_sources` → `external_resources`, source type `mcp` → `external` (7 sites)
- **Blueprint structure improvements** — Tool Selection Rationale, cross-section references, Appendix D: Blueprint Sync Criteria
- **npm dependency updates** — commander ^14.0.3, @clack/prompts ^1.0.1, fs-extra ^11.3.3

### Migration from 0.3.1

Update files via `npx jdd-sprint-kit update`. Manual migration required for:

1. **Product name**: BMAD Sprint Kit → JDD Sprint Kit. If CLAUDE.md references the old name, update manually.
2. **MCP config**: If `.mcp.json` has filesystem MCP servers, switch to `--add-dir`. Figma MCP stays as-is.
3. **config.yaml**: Set `communication_language` and `document_output_language` for localized output. Defaults to English if unset.
4. **Existing Sprint artifacts**: brownfield-context.md `scan_metadata.mcp_servers` → `scan_metadata.external_sources`. Existing files are backward-compatible.

---

## [0.3.1] - 2026-02-18

### Changed
- **Blueprint rewritten to universal 8-Section structure** — Part 1~5 → §1~§8 + Appendix A/B/C
  - §1 Problem, §2 Thesis (core principles + design decisions), §3 User Model, §4 Value Chain (pipeline walkthrough + routes + cost), §5 Judgment & Feedback, §6 Constraints & Trade-offs, §7 Risk Model, §8 Current State
  - Agent I/O table consolidated into §4.1 (moved from Part 5.2)
  - Added "rationale design decision" to each pipeline step
  - Appendices separated: Installation/Operation (A), File Structure (B), Glossary (C)
- **§8 Current State pipeline verification status table** — Post-JP2 stages (Parallel, Validate, Circuit Breaker) explicitly marked as "implemented, unverified"

### Added
- **Blueprint Format Guide** — New `_bmad/docs/blueprint-format-guide.md`
  - Universal Product Blueprint format definition (8-Section + self-contained principle + self-review checklist)

---

## [0.3.0] - 2026-02-18

### Added
- **MSW Mock Layer** — Complete Prism removal + stateful prototype transition
  - Browser Service Worker-based network intercept (no Vite proxy needed)
  - In-memory store + seed data for stateful CRUD
  - DevPanel for state reset/seed control
  - `@redocly/cli` lint + `tsc --noEmit` replaces Prism Smoke Test
- **Comment Handling Flow** — Unified processing mechanism for JP feedback
  - Impact analysis → present [apply-fix + propagate] / [regenerate] cost → user selects
  - Party Mode discoveries, Advanced Elicitation results, and direct feedback all use the same flow
  - `feedback-log.md` artifact added (under planning-artifacts/)
- **API Data Sufficiency verification** — New Scope Gate `deliverables` stage
  - Validates that all API responses provide fields required by dependent endpoints
- **SSOT Reference Priority** — Explicit priority rules between artifacts
  - `api-spec.yaml` > `design.md` API section
  - `schema.dbml` > `design.md` data model section
- **JP2 change visibility** — JP1→JP2 auto-correction tracking
  - `jp1_to_jp2_changes` field added to `readiness.md`
  - Changes auto-displayed in JP2 Section 0
- **JDD Principle 3 pragmatic adjustment** — Documented conditions for apply-fix + propagate
  - Small-scope feedback: apply-fix allowed with mandatory Scope Gate verification
  - Appendix added to `docs/judgment-driven-development.md`
- **BMad crossover support matrix** documented (Guided ↔ Sprint Kit ↔ BMad validate)
- `specs/` folder README added

### Changed
- **JP feedback model simplified** — Confirm/Comment/Redirect 3-option → Confirm/Comment 2-option
  - Backward loop: Comment's "regenerate option" scope naturally extends to pre-JP1 Phases
- **Phase 0 UX redesign** — Brief no longer required + full scan + brownfield reuse
- **auto-sprint foreground execution** — Background → foreground switch for improved stability
- **Scope Gate retry limit** — A/P combined max 3 → A/P/F combined max 5
- `docs/` folder restructured by purpose (`design/`, `reviews/`)
- `blueprint.md` YAML frontmatter: `synced_to` field added (source file sync tracking)

### Fixed
- preview-template build: `node_modules` excluded
- JDD Principle 4 factual error corrected (Scope Gate invocation timing)

### Removed
- **Prism (Mock Server)** — Fully replaced by MSW + `@redocly/cli` + `tsc`
- **JP Redirect response** — Absorbed into Comment Handling Flow (backward loop redesign from 0.2.0)

### Migration from 0.2.0

1. **preview-template update**: `@stoplight/prism-cli`, `concurrently` removed. `msw`, `@redocly/cli` added. Apply via `npx jdd-sprint-kit update`
2. **Existing Sprint artifacts' preview/**: Prism-based prototypes require manual regeneration (re-run `/preview`)
3. **JP feedback**: Redirect option removed. When Comment is selected, apply-fix/regenerate options are presented with cost
4. **CLAUDE.md**: If user project rules reference Prism, manually change to MSW

---

## [0.2.0] - 2026-02-16

### Added
- **Judgment-Driven Development (JDD)** — 6-principle design philosophy introduced
  - `docs/judgment-driven-development.md` added
- **3-route system** — Sprint / Guided / Direct routes formalized
  - Sprint: materials-based auto-pipeline (`/sprint`)
  - Guided: BMad 12-step dialogue then join pipeline (`/specs`)
  - Direct: execute immediately from finished planning-artifacts (`/specs`)
- **tracking_source** field — Explicit Brief tracking source (`brief` or `success-criteria`)
- **specs-direct mode** — Direct route support for `/specs` command
- **BMad artifact auto-detection** — Discovers `_bmad-output/planning-artifacts/`
- **Backward loop** — "Redirect to JP1" option from JP2 *(redesigned into Comment Handling Flow in 0.3.0)*
- Blueprint rewritten from scratch (walkthrough format + parallel external/internal narrative)
- CHANGELOG.md (this file)

### Changed
- **CP → JP terminology** — Checkpoint → Judgment Point
  - CP1 → JP1 ("Is this the right product for the customer?")
  - CP2 → JP2 ("Is this the experience the customer wants?")
  - `force_cp1_review` → `force_jp1_review`
- **Layer 0 auto-approval removed** — JP1 now mandatory, 4 conditions converted to info banner
- **JP1 Visual Summary redesign** — Customer journey narrative + original intent ↔ FR mapping
- **Route naming** — Auto Sprint/Guided Sprint/Direct Sprint → Sprint/Guided/Direct
- `package.json` description: `"Judgment-Driven Development toolkit for BMad Method"`
- README.md: JDD integration, Mermaid JP diagram, 3-route reflection

### Migration from 0.1.0

Update files via `npx jdd-sprint-kit update`. Manual migration required for:

1. **sprint-input.md**: Existing `force_cp1_review` field is auto-recognized as `force_jp1_review` (backward compatible)
2. **tracking_source**: New field not present in existing sprint-input.md. Automatically added in newly created Sprints
3. **CLAUDE.md**: User project rules — not modified by Sprint Kit. If CP/JP terminology is in use, change manually

---

## [0.1.0] - 2026-02-15

### Added
- Initial release
- Sprint auto-pipeline (Phase 0 → Brownfield → BMad Auto → Specs → Deliverables → Parallel → Validate)
- 8 Sprint agents (auto-sprint, scope-gate, brownfield-scanner, deliverable-generator, worker, judge-quality, judge-security, judge-business)
- 7 Sprint commands (sprint, specs, preview, parallel, validate, circuit-breaker, summarize-prd)
- Brownfield Scanner (MCP + document-project + local codebase)
- React + Prism prototype auto-generation
- Multi-IDE support (Claude Code, Codex CLI, Gemini Code Assist)
- Hook system (desktop-notify, protect-readonly, pre-compact, session-recovery)
- `npx jdd-sprint-kit init/update/compat-check` CLI
- Tutorial project (test-tutor-excl)
