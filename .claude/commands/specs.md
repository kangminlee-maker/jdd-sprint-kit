---
description: "Generate Specs 4-file from BMad artifacts (Brownfield L4 + Entity Dictionary)"
---

# /specs — Specs Generation

> **Dispatch Target**: `@brownfield-scanner` (L4) + `@deliverable-generator` (specs-only)

## Purpose

Generate Specs 4-file from BMad artifacts.

## When to Use

After BMad Phase 3 artifacts are ready and pass Implementation Readiness.

## Inputs

`$ARGUMENTS`: feature-name (kebab-case, optional)
- `/specs feature-name` — specify feature name
- `/specs` (no args) — auto-detect BMad artifacts + suggest feature-name

## Procedure

Load config per Language Protocol in jdd-sprint-guide.md.

### Step 0: Feature Directory + Artifact Discovery

#### Step 0a: Determine Feature Name

1. Parse `$ARGUMENTS`:
   - **feature-name provided** → `feature = $ARGUMENTS`, validate then proceed to Step 0b
   - **No args** → Auto-detect (below)

2. **Auto-detect** (when no args):
   a. Check for `_bmad-output/planning-artifacts/prd.md`
   b. If found: extract feature-name from PRD title (frontmatter `title` or first H1, convert to kebab-case)
   c. Confirm with user (in {communication_language}):
      ```
      BMad planning artifacts found.
      PRD: "{PRD title}" → feature-name: {extracted name}

      [1] Proceed with {extracted name} (Recommended)
      [2] Enter a different name
      ```
   d. If not found: display usage (in {communication_language}) and exit:
      ```
      Usage: /specs feature-name

      Examples:
        /specs tutor-exclusion     — work in specs/tutor-exclusion/
        /specs rating-popup        — work in specs/rating-popup/

      After BMad 12-step: /specs {feature-name}
      To start from references: /sprint {feature-name}
      ```

3. Validate feature-name: `/^[a-z0-9][a-z0-9-]*$/`

#### Step 0b: Planning Artifacts Discovery

Search for artifacts in the following order:

**Path 1**: `specs/{feature}/planning-artifacts/` (Sprint Kit default)
- Check for prd.md, architecture.md, epics*.md

**Path 2**: `_bmad-output/planning-artifacts/` (BMad Guided output)
- Search only if Path 1 yields nothing
- If found: create `specs/{feature}/planning-artifacts/` directory + copy files
- File name mapping: `epics.md` → `epics-and-stories.md`
- Optional files: `product-brief.md`, `ux-design-specification.md` (copy if present)

**Discovery failure**: If neither path has artifacts, error (in {communication_language}):
```
Cannot find planning artifacts.

Checked locations:
  1. specs/{feature}/planning-artifacts/  (Sprint route)
  2. _bmad-output/planning-artifacts/     (BMad Guided route)

BMad 12-step: /create-product-brief → /create-prd → /create-architecture → /create-epics
Sprint route: /sprint {feature-name}
```

#### Step 0c: Artifact Completeness Check

| Artifacts Present | Status | Guidance |
|---|---|---|
| PRD + Architecture + Epics | **Complete** — proceed to Step 0d | — |
| PRD + Architecture (no Epics) | **Partial** | "Epics required. Generate with `/create-epics`." |
| PRD only (no Architecture) | **Partial** | "Architecture and Epics required. Generate with `/create-architecture` → `/create-epics`." |
| No PRD | **Incomplete** | "PRD required. Start with `/create-prd`." |

On partial/incomplete status: display error message (in {communication_language}) and exit.

#### Step 0d: sprint-input.md Check + Generation

> **Order dependency**: This step must run before Step 1 (Brownfield). Brownfield Scanner (Broad Scan) references sprint-input.md as input.

1. Check for `specs/{feature}/inputs/sprint-input.md`
2. **If exists**: check `tracking_source` field.
   - `tracking_source` present → use existing value (do not edit file)
   - `tracking_source` missing → add `tracking_source: success-criteria` to frontmatter
3. **If missing**: create `specs/{feature}/inputs/` directory + minimal sprint-input.md:

```yaml
---
feature: {feature_name}
generated_at: {ISO 8601}
generated_by: specs-direct
tracking_source: success-criteria
brief_grade: A
goals: []
brief_sentences: []
brownfield_status: greenfield
brownfield_topology: standalone
document_project_path: null
fallback_tier: 1
flags:
  force_jp1_review: false
---

## Source
specs-direct: Specs generated directly from BMad planning artifacts (Sprint Phase 0 bypassed)
```

> `goals: []` is handled by Scope Gate's Goals Fallback (extracts from PRD Success Criteria).
> `brief_grade: A` assumes BMad/manual artifacts have been user-verified.
> `complexity` field omitted — not consumed by downstream agents in specs-direct route.

### Step 1: Brownfield L4 Append

Invoke `@brownfield-scanner` in targeted mode to add L4 (Code Layer):

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "You are @brownfield-scanner. Read and follow your agent definition at .claude/agents/brownfield-scanner.md.
    Execute Targeted Scan (mode='targeted').
    Input files:
    - Architecture: specs/{feature}/planning-artifacts/architecture.md
    - Epics: specs/{feature}/planning-artifacts/epics-and-stories.md
    - sprint_input_path: specs/{feature}/inputs/sprint-input.md
    - topology: {brownfield_topology from sprint-input.md frontmatter, default: 'standalone'}
    brownfield_path: specs/{feature}/planning-artifacts/brownfield-context.md
    Append L3 + L4 layers to existing file. After L3+L4 complete, populate the Entity Index table.
    Note: Scanner reads external_resources.external_repos from sprint-input.md to discover external data sources."
```

> Frozen snapshot copy is handled by `@deliverable-generator` Stage 2.

**Behavior based on existing Brownfield state**:

| Existing State | Action |
|----------------|--------|
| None | Suggest Brownfield scan (see below) |
| L1+L2 only | Targeted Scan to add L3+L4 |
| L1~L3 | Targeted Scan to add L4 only |
| L1~L4 | Copy frozen snapshot only (skip Targeted Scan) |

**When no Brownfield exists**:

First, perform quick topology detection (same logic as sprint.md Step 0f-3):
- Detect build tool files + .mcp.json

| Detection Result | Action |
|------------------|--------|
| greenfield (no build tools, no MCP) | Proceed to Step 2 without brownfield-context.md |
| Build tools or MCP present | AskUserQuestion (in {communication_language}): "Existing system detected. Running Brownfield scan enables more accurate Specs." [1] Run (Broad + Targeted) [2] Skip |

[1] selected:
1. Determine topology using sprint.md Step 0f-3 logic (build tools + .mcp.json + monorepo files)
2. Detect `--add-dir` external repo paths using sprint.md Step 0f-2A logic → record in sprint-input.md `external_resources.external_repos`
3. Run @brownfield-scanner broad mode → generate L1+L2
   - `sprint_input_path: specs/{feature}/inputs/sprint-input.md` (created in Step 0d, with external_repos recorded)
   - `topology: {detected topology}`
   - `local_codebase_root: {if topology is co-located/msa/monorepo then '.' else null}`
4. Follow with Targeted Scan (L3+L4, passing same topology) → append to brownfield-context.md
5. **Update sprint-input.md frontmatter**:
   - `brownfield_status` → `configured` / `local-only` based on scan results
   - `brownfield_topology` → detection result (`standalone` / `co-located` / `msa` / `monorepo`)

[2] selected: proceed to Step 2 without scan (sprint-input.md retains default `greenfield`)

### Step 2: Specs Generation

Invoke `@deliverable-generator` in specs-only mode:

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "You are @deliverable-generator. Read and follow your agent definition at .claude/agents/deliverable-generator.md.
    Generate specs in specs-only mode.
    planning_artifacts: specs/{feature}/planning-artifacts/
    feature_name: {feature-name}
    output_base: specs/
    mode: specs-only"
```

This mode generates Entity Dictionary (Stage 1) + Specs 4-file (Stage 2) only:
- Entity Dictionary for naming consistency
- requirements.md (PRD → requirements)
- design.md (Architecture → design)
- tasks.md (Epics → parallel tasks + Entropy + File Ownership)

### Step 3: Plan Output

Present generated `tasks.md` to user for approval.
After approval, proceed to `/preview` (Deliverables generation).

## Outputs
- `specs/{feature-name}/brownfield-context.md`
- `specs/{feature-name}/requirements.md`
- `specs/{feature-name}/design.md`
- `specs/{feature-name}/tasks.md`
