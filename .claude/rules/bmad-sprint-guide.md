# Sprint Kit — BMad Method Execution Extension

> Core principle: **Human judgment is the only lasting asset. All AI artifacts are disposable and regenerable.**
>
> AI builds, humans judge. Human input raises generation quality; human judgment sets direction.
> — Judgment-Driven Development (`docs/judgment-driven-development.md`)
>
> Full product picture: `docs/blueprint.md` (§1 Problem ~ §8 Current State + Appendix)

## Language Protocol

### Config Loading

1. Read `_bmad/bmm/config.yaml` — extract `communication_language`, `document_output_language`
2. If not found, read `_bmad/core/config.yaml`
3. If neither found, default both to `English`

### Language Usage

- **User-facing output** (progress messages, confirmations, errors, JP summaries): use `{communication_language}`
- **Artifact content** (sprint-input.md body, specs, reports): use `{document_output_language}`
- **YAML keys, enum values, file paths**: always English (machine-parseable)

### Placeholder Interpretation

`{communication_language}` is a **directive**, not a literal variable. It means: "Output this message in the language specified by `communication_language` from config.yaml." Commands and agents reference this protocol rather than loading config independently.

### Context Passing Exception

`communication_language` and `document_output_language` are **environment metadata** — execution settings, not domain data. The Conductor may pass them as parameters. This is equivalent to a BMad agent loading config.yaml directly.

## Tool Stack

| Tool | Role |
|------|------|
| **BMad Method** | Base platform: agents, workflow engine, facilitation (`_bmad/`) |
| **Sprint Kit** | BMad execution extension: auto-pipeline, Specs, Deliverables, Prototype |
| **Claude Code** | AI IDE — agent execution environment |
| **Claude Code Native Teams** | Agent coordination, task dependency tracking (`Task`, `SendMessage`) |
| **gh CLI** | GitHub Issue/PR management |

## Route Selection

Sprint Kit offers 3 routes based on user's input readiness.
All routes converge into the same pipeline:

```
[Input + Brownfield + BMad] → [Specs] → JP1 → [Deliverables] → JP2 → [Execute]
```

### Sprint — When you have materials: AI builds, you judge

Use when meeting notes, references, or a brief exist as unstructured context.
AI auto-generates all planning artifacts; product expert judges at JP1/JP2.

```
Place materials in specs/{feature}/inputs/ → /sprint {feature-name}
  Phase 0: Smart Launcher — analyze materials + generate sprint-input.md
  → @auto-sprint (auto-invoked)
  Phase 1: Brownfield 2-Pass → BMad Auto-Pipeline → Specs 4-file
  → JP1: "Is this the right product for the customer?" (requirements judgment)
  Phase 2: Deliverables (OpenAPI + DBML + BDD + Prototype)
  → JP2: "Is this the experience the customer wants?" (prototype judgment)
  → On approval: /parallel → /validate
```

### Guided — When exploration is needed: discover and define with AI

Use for new products, new markets, or idea-stage work requiring systematic exploration.
Build planning artifacts step-by-step through conversation with BMad agents.

```
BMad 12-step (human-AI dialogue):
  /create-product-brief → /create-prd → /create-architecture → /create-epics
→ /specs → JP1 → /preview → JP2
→ /parallel → /validate
```

### Direct — When planning is complete: execute immediately

Use when finished PRD + Architecture + Epics already exist.

```
/specs → JP1 → /preview → JP2
→ /parallel → /validate
```

### Crossover

Routes are not fixed. Adapt as needed:
- Have materials but need deep exploration → use **Guided** route with materials as reference input
- No materials, just want a quick prototype → start **Sprint** with a one-line brief
- After completing BMad 12-step → same as **Direct** (`/specs` auto-detects BMad artifacts)

**Format compatibility**: All routes use the same BMad format (YAML frontmatter + workflow sections) for planning-artifacts. Sprint Kit artifacts are directly recognized by BMad workflows, and vice versa.

**Crossover support matrix**:

| Transition | Support | Description |
|------------|---------|-------------|
| Guided → Sprint Kit | ✅ | `/specs` auto-detects `_bmad-output/`. "Continue fast" |
| Sprint Kit → Guided deep-dive | ✅ | Guided agents read planning-artifacts for deeper exploration. "Start fast, explore deep" |
| Sprint Kit → BMad validate | ✅ | planning-artifacts/ directly usable |
| Sprint Kit → BMad Phase 4 | ⚠ | No auto-conversion. planning-artifacts are compatible, but tasks.md-specific data (DAG, Entropy, File Ownership) requires manual transfer |

**Sprint Kit-exclusive concepts**: Entropy Tolerance, File Ownership, DAG-based parallel execution, and SSOT Reference Priority are Sprint Kit-only concepts not present in BMad. They are optimized for `/parallel` execution and are not carried over when switching to BMad Phase 4.

**Scope Gate vs Implementation Readiness**: Sprint Kit's per-step Scope Gate is a finer-grained check than BMad's Implementation Readiness. If all Scope Gates PASS, BMad Implementation Readiness is also likely to pass. To run BMad `check-implementation-readiness` separately, reference planning-artifacts/ directly.

> For small tasks, use BMad Quick Flow: `/quick-spec` → `/dev-story` → `/code-review`

## BMad Agents

- Mary (Analyst): brainstorming, research, Product Brief
- John (PM): PRD, Epics & Stories
- Winston (Architect): Architecture, ADR
- Amelia (Dev): story implementation
- Bob (SM): Sprint Planning, story preparation
- Sally (UX Designer): UX Design
- Barry (Quick Flow Solo Dev): Quick Spec → Dev → Review
- Murat (Test Architect): Master Test Architect
- Paige (Tech Writer): Technical Documentation

## Sprint Agents

### Auto Sprint
- `@auto-sprint` — Sprint orchestration + Conductor 4 roles (Goal Tracking, Scope Gate, Budget, Redirect)
- `@scope-gate` — 3-stage validation (Structured Probe + Checklist + Holistic Review)
- `@brownfield-scanner` — MCP Brownfield collection (L1~L4)
- `@deliverable-generator` — Full-stack artifact generation (Specs + OpenAPI + DBML + BDD + Prototype)

### Execute
- `@worker` — Task implementation in isolated worktree + Specmatic API contract self-verification
- `@judge-quality` — Code structure, patterns, duplication, conventions + Specmatic contract compliance
- `@judge-security` — OWASP Top 10 vulnerabilities, injection, auth bypass
- `@judge-business` — Implementation verification against BMad PRD acceptance criteria

## Sprint Commands

- `/sprint` — **Sprint route**: Brief/materials → auto Specs + Deliverables + Prototype (2 JPs)
- `/specs` — **Specs generation**: Planning Artifacts → Specs 4-file
- `/preview` — **Deliverables generation**: Specs → OpenAPI + DBML + BDD + Prototype
- `/parallel` — Multi-agent parallel execution
- `/validate` — 3-Phase verification pipeline
- `/circuit-breaker` — Course correction
- `/summarize-prd` — PRD summary/analysis + feedback integration

## Project Structure

```
{project-root}/
├── CLAUDE.md                           # User project rules (not modified by Sprint Kit)
├── .mcp.json                           # MCP server configuration
├── .claude/
│   ├── rules/                          # Sprint Kit rules
│   ├── agents/                         # Sprint agents
│   └── commands/                       # BMad + Sprint commands
├── _bmad/                              # BMad Method (base platform)
│   ├── bmm/                            # BMad agents, workflows
│   └── docs/                           # Format guides (PRD, Blueprint, Sprint Input, etc.)
├── _bmad-output/                       # BMad artifact output (Guided route)
│   └── planning-artifacts/             # Product Brief, PRD, Architecture, Epics
├── docs/                               # Framework documentation
│   ├── blueprint.md                    # Product Blueprint (§1~§8 + Appendix)
│   └── judgment-driven-development.md  # Design philosophy (JDD)
├── specs/                              # Sprint artifacts (per feature)
│   └── {feature}/
│       ├── inputs/                     # User originals + sprint-input.md
│       ├── planning-artifacts/         # BMad artifacts (Sprint/Direct route)
│       ├── brownfield-context.md       # Frozen snapshot
│       ├── requirements.md
│       ├── design.md
│       ├── tasks.md
│       └── preview/                    # React + MSW prototype
└── src/                                # Source code
```
