---
description: "Auto-generate Specs + Full-stack Deliverables from a single Brief (Auto Sprint)"
---

<!-- Quick Map
  Purpose: Brief → Auto Sprint Full-stack generation
  Dispatch: @auto-sprint (Phase 1-2)
  Inputs: $ARGUMENTS (Brief text or feature-name)
  Key Steps: Parse → Locate → Grade → Causal → Goals → Brownfield → Generate → Confirm → @auto-sprint
-->

# /sprint — Auto Sprint

> **Dispatch Target**: `@auto-sprint` (Phase 1-2 delegated; Phase 0 runs directly)

## Purpose

Auto-generate Specs + Full-stack Deliverables from a single user Brief. Humans review at 2 Judgment Points.

## When to Use

When you want to run the full Sprint pipeline automatically. Start with a single Brief.

## Inputs

`$ARGUMENTS` — 2 entry points:
- Case 1 (Inline Brief): `/sprint "Describe the feature you want"` — start immediately without reference materials
- Case 2 (Feature Name): `/sprint feature-name` — requires pre-populated `specs/{feature-name}/inputs/`
- Empty: display usage instructions (in {communication_language}) and exit

Prerequisites:
- `preview-template/` directory exists

## Procedure

Load config per Language Protocol in jdd-sprint-guide.md.

### Phase 0: Smart Launcher (runs in main session)

Analyze `$ARGUMENTS`, generate sprint-input.md, and hand off to @auto-sprint.

#### Step 0a: Entry Branching

**Pre-validation**: If `$ARGUMENTS` is empty or whitespace-only, display usage (in {communication_language}) and exit:
```
Usage:
  /sprint "Brief text"     — Quick Start (immediate start)
  /sprint feature-name     — Full (requires inputs/ folder preparation)

Quick Start: Wrap your Brief text in quotes.
Full: Create specs/{feature-name}/inputs/brief.md first.
```

Parse `$ARGUMENTS` — 2 entry points, 1 pipeline:

**Case 1: Inline Brief** (`/sprint "Build a tutor exclusion feature"`)
1. Auto-generate feature_name:
   - If Brief is in a non-English language: translate key terms to English kebab-case
   - If Brief is in English: extract key terms as kebab-case
   - Examples: "Build tutor exclusion" → `tutor-exclusion`, "Add rating popup" → `rating-popup`
2. Validate feature_name: `/^[a-z0-9][a-z0-9-]*$/` — retry on failure (max 3 attempts)
3. Detect existing artifact conflicts:
   - `specs/{feature_name}/` exists + has `inputs/` → switch to Case 2 (confirm whether to use existing brief.md)
   - `specs/{feature_name}/` exists + no `inputs/` → append `-v2` suffix to feature_name
4. Create `specs/{feature_name}/inputs/` directory
5. Save Brief text to `specs/{feature_name}/inputs/brief.md`
6. Quick Start path → proceed to Step 0c without reference materials

**Case 2: Feature Name** (`/sprint tutor-exclusion`)
1. Validate feature_name: `/^[a-z0-9][a-z0-9-]*$/`
   - On failure: error (in {communication_language}): "feature_name may only contain lowercase letters, numbers, and hyphens."

2. **Verify specs/ base structure**:
   - If `specs/` folder missing → create + place `specs/README.md` + notify (in {communication_language})
   - If `specs/README.md` missing → create
   - README content: Sprint usage + folder structure guide

3. **Verify specs/{feature_name}/ exists**:
   If missing → auto-create + guide:
   a. Create `specs/{feature_name}/inputs/`
   b. Generate `specs/{feature_name}/inputs/brief.md` template (in {document_output_language}):
      Section headings and placeholder text must be written in {document_output_language}.
      HTML comments (guidance for the user) are written in {communication_language}.
      The `## Reference Sources` section heading and sub-section headings are always in English (machine-parseable).

      Example (when document_output_language=Korean, communication_language=Korean):
      ```markdown
      # {feature_name}

      ## 배경
      (이 기능이 필요한 이유를 작성하세요)

      ## 만들어야 할 기능
      (구체적인 기능을 설명하세요)

      ## Reference Sources

      ### GitHub
      <!-- 기존 서비스 코드가 있으면 URL과 탐색 힌트를 작성하세요 -->
      <!-- - https://github.com/{owner}/{repo} -->
      <!--   탐색 힌트: 관련 모듈 경로, 주의사항 등 -->

      ### Figma
      <!-- Figma 디자인 URL이 있으면 작성하세요 -->
      <!-- - https://figma.com/design/{fileKey}/... -->

      ### Policy Docs
      <!-- Scanner가 우선 탐색할 정책/도메인 문서명 -->
      <!-- - document-name.md -->

      ### Scan Notes
      <!-- Brownfield 탐색 시 참고할 자유 형식 메모 -->
      ```
   c. Message (in {communication_language}):
      ```
      Sprint 프로젝트 생성 완료: {feature_name}

      specs/{feature_name}/inputs/brief.md

      brief.md를 작성한 후 다시 실행하세요:
        /sprint {feature_name}

      참조 문서(회의록, 기획서 등)가 있으면 inputs/에 함께 넣어주세요.
      brief.md 하단의 '참고 소스' 섹션에 GitHub repo URL, Figma URL을 선언하면
      Sprint이 기존 시스템을 자동으로 분석합니다.
      ```
   d. Exit (brief.md 작성 대기)

4. **Full scan** — scan `specs/{feature_name}/` contents at once:

   a. **inputs/ scan**:
      - Collect file list (distinguish brief.md presence)
      - 0 files or no inputs/ → `input_status: empty`
      - brief.md only → `input_status: brief-only`
      - brief.md + references → `input_status: full`
      - References only (no brief.md) → `input_status: references-only`

   b. **brownfield-context.md detection**:
      - Check `specs/{feature_name}/brownfield-context.md` or `specs/{feature_name}/planning-artifacts/brownfield-context.md`
      - If found → estimate levels (L1~L4) based on `## L1`, `## L2` headings

   c. **planning-artifacts/ detection**:
      - Check for prd.md, architecture.md, epics-and-stories.md
      - All 3 present → `artifacts_status: complete`
      - Some present → `artifacts_status: partial`
      - None → `artifacts_status: none`

   d. **BMad artifact detection** (`_bmad-output/planning-artifacts/`):
      - prd.md + architecture.md + (epics.md or epics-and-stories.md) all present → `bmad_output: found`

5. **Scan result summary** (in {communication_language}):
   ```
   specs/{feature_name}/ scan complete

   inputs/ ({N} files):
     - {filename1}
     - {filename2}
     ...

   brief.md: {found / not found → generating from references}
   brownfield-context.md: {found ({levels}, reusing existing) / not found → will scan}
   planning-artifacts/: {complete ({N} files) / partial ({N} files) / none}
   ```

6. **Input status determination + route branching**:

   **Priority check** — when planning artifacts are complete:
   If `artifacts_status: complete` or `bmad_output: found`:
   Present options (in {communication_language}):
   ```
   Planning artifacts found.
   Location: {path}

   [1] Proceed with /specs {feature_name} (Recommended)
   [2] Run Sprint Auto Pipeline from scratch
   ```
   [1] selected: guide to `/specs {feature_name}` and exit
   [2] selected: continue to input_status branching below

   **input_status branching**:

   | input_status | Route |
   |---|---|
   | full / brief-only | **Normal Sprint** → Step 0b |
   | references-only | **AI Brief generation** (Step 0a-brief) → Step 0b |
   | empty | **Error** (see below) |

   Empty error (in {communication_language}):
   ```
   No materials found in inputs/.

   To start a Sprint, add materials to inputs/ and re-run:
   - Brief, meeting notes, references — any format accepted
   - References alone (without Brief) are also sufficient
   ```

#### Step 0a-brief: AI Brief Generation

When `input_status: references-only` (no brief.md but references exist):

1. Read all reference materials in inputs/
2. Compose a Brief from references:
   - Background / problem context
   - Core features to build
   - User scenarios (if found in references)
   - Constraints (if found in references)
3. Save to `specs/{feature_name}/inputs/brief.md`
4. Brief generation principles:
   - Faithfully reflect content explicitly mentioned in references
   - Mark AI-inferred items with `(AI-inferred)`
   - Do not fabricate content absent from references
5. Proceed to Step 0b (Brief grade determined in Step 0c)

#### Step 0b: inputs/ Scan + Defense Limits

Scan files in `specs/{feature_name}/inputs/`.

**Defense limits**:
- Max file count: 20
- Max total size: 50MB (individual file limit also 50MB; on overflow — PDF: first 100 pages, others: first 50,000 lines)
- PDF max pages: 100 (truncate beyond)
- Supported formats: `*.md`, `*.txt`, `*.pdf`, `*.png`, `*.jpg`, `*.jpeg`, `*.yaml`, `*.json`, `*.csv`
- Unsupported formats: warn + skip

**Overflow priority**:
1. `brief.md` is **always included** (cannot be excluded)
2. Sort remaining files by most recently modified
3. Select top 19 (brief.md + 19 = 20)
4. Warn about excluded files

**0 reference files (brief.md only)**: Normal path. Skip Reference Materials section in Step 0d. Fallback Tier 1.

#### Step 0c: Brief Grade Determination

Read brief.md and assess quality.

**Feature count criteria**: Count independent user actions expressed as verb+object combinations in the Brief. Example: "block", "unblock", "view block list" = 3 features. Sub-options (reason selection, etc.) are not counted as features.

**Reference supplement criteria**: If 2+ reference files exist and at least 1 has relevance=high, treat as "supplemented."

| Grade | Condition | Action |
|-------|-----------|--------|
| **A** (sufficient) | 3+ features mentioned, 1+ scenario mentioned, or references supplement | Proceed normally |
| **B** (moderate) | 1~2 features mentioned, no scenarios | Show warning at Step 0h confirmation |
| **C** (insufficient) | 0 features, keywords only | Present Sprint-not-recommended options |

**Grade C handling**:
- Present options via AskUserQuestion (in {communication_language}):
  - [1] Proceed anyway → set `force_jp1_review: true` flag
  - [2] Supplement Brief → generate questions from 5 perspectives:
    1. Core features and background (What problem exists? What feature to build?)
    2. User scenarios (In what situations will it be used?)
    3. Constraints (Is integration with existing systems needed?)
    4. Priority (Must-have vs nice-to-have)
    5. Edge cases (Expected behavior on failure/error)
    Append answers to brief.md under `## Supplementary Answers` section → re-grade
- **Re-grade limit**: Max 2 supplement rounds. If still Grade C after 2 rounds, auto-proceed with `force_jp1_review: true`.

#### Step 0d: Reference Analysis + sprint-input.md Generation

See `_bmad/docs/sprint-input-format.md` for reference analysis format.

1. **Read brief.md in full** — preserve original (include verbatim in Core Brief section)
2. **Decompose Brief sentences + assign IDs**:
   Decompose each semantic unit (sentence or clause) in the Brief and assign unique IDs.
   - Only decompose sentences describing features/actions (exclude background, greetings, etc.)
   - ID format: `BRIEF-{N}` (sequential from 1)
   - Record in sprint-input.md `brief_sentences` field:
     ```yaml
     brief_sentences:
       - id: BRIEF-1
         text: "Allow students to block specific tutors"
       - id: BRIEF-2
         text: "Blocked tutors are excluded from matching"
       - id: BRIEF-3
         text: "Students can manage their block list"
     ```
   - These IDs are used by the PRD Agent for `(source: BRIEF-N)` tagging on FRs
3. **Read + summarize reference materials**:
   - 200 lines or fewer: include in full
   - Over 200 lines: extract Key Points, Constraints, Decisions as summary
   - Images: filename + description text only
   - PDF: read via Read tool (100-page limit)
3. **Extract Discovered Requirements**:
   - Requirements found in references but absent from Brief
   - 5 or fewer: include all (default: included in Sprint scope)
   - Over 5: include top 3, rest as "next Sprint candidates"
4. **Contradiction detection**: Record contradictions between Brief and references in Detected Contradictions (no auto-resolution)
5. **Parse Reference Sources section from brief.md** (if exists):
   - Detect heading (canonical → fallback): `## Reference Sources` / `## 참고 소스` / `## References`
   - Parse sub-sections (canonical → fallback):
     - `### GitHub` / `### GitHub`: extract URLs + per-URL notes (indented text below URL)
       - URL pattern: `https://github.com/{owner}/{repo}` (`.git` suffix auto-strip)
       - Notes: non-URL indented lines below each URL
     - `### Figma` / `### Figma`: extract URLs + notes
       - URL pattern: `https://figma.com/design/{fileKey}/...` or `.../file/{fileKey}/...`
     - `### Policy Docs` / `### 정책 문서`: collect document names (line items)
     - `### Scan Notes` / `### 탐색 메모`: collect as free-text
   - 참고 소스 섹션의 GitHub repos는 사용자 명시 의도 → AskUserQuestion 없이 다운로드 대상 확정
   - 섹션이 없거나 비어있으면 → skip (기존 auto-detect만 사용)
   - HTML 주석으로 감싸인 라인 (`<!-- ... -->`)은 skip (템플릿 상태 그대로)
6. **Figma URL auto-detection + merge**:
   While reading inputs/ files (steps 1-3 above), detect Figma URL patterns in all file contents:
   - Pattern: `https://figma.com/design/{fileKey}/...` or `https://figma.com/file/{fileKey}/...`
   - Extract `fileKey` from each matched URL
   - Merge with step 5 Figma URLs → deduplicate by `fileKey`
   - 참고 소스 섹션 출처: `source_file: "brief.md#참고-소스"`, auto-detect 출처: detected filename
   - If no Figma URLs found (neither 참고 소스 nor auto-detect): omit `external_resources.figma`
7. **GitHub repo URL auto-detection + merge**:
   While reading inputs/ files (steps 1-3 above), detect GitHub repo URL patterns in all file contents:
   - Pattern: `https://github.com/{owner}/{repo}` (path, query, fragment after repo name are ignored)
   - Extract `owner/repo` from each matched URL. Collect unique pairs.
   - Deduplicate with step 5 GitHub repos (by `owner/repo` unit)
   - **Auto-detected repos NOT in 참고 소스 섹션** → present via AskUserQuestion (in {communication_language}):
     ```
     GitHub 리포지토리 URL이 감지되었습니다: {owner}/{repo}
     이 리포지토리의 코드를 Sprint에 반영하면 기존 시스템 분석 정확도가 향상됩니다.
     (읽기 전용 스냅샷 다운로드, clone이 아닙니다)

     [1] 다운로드하여 반영 (Recommended)
     [2] URL만 참고 정보로 기록
     [3] 무시
     ```
     - [1] selected → mark as download target
     - [2] selected → mark as `reference-only` (no download)
     - [3] selected → do not record
   - **Repos already in 참고 소스 섹션** → skip AskUserQuestion (already confirmed by user)
   - Non-GitHub URLs (GitLab, Bitbucket, etc.) detected → inform (in {communication_language}):
     "현재 GitHub URL만 자동 감지됩니다. GitLab/Bitbucket은 git clone + claude --add-dir로 추가하세요."
   - If no GitHub URLs found (neither 참고 소스 nor auto-detect): omit `external_resources.github_repos`
8. **Set tracking_source**: `tracking_source: brief` — Sprint route always uses BRIEF-N based tracking
9. **Causal Chain extraction**:
   Structure the background of the feature request from Core Brief + Reference Materials.

   **Layer structure**:
   - Layer 4 (Feature Request): always confirmed from Brief
   - Layer 1 (Phenomenon): search Brief + references
   - Layer 2 (Root Cause): search Brief + references
   - Layer 3 (Solution Rationale): search Brief + references

   **Determination criteria**:
   - "confirmed": content found directly in documents. Record passage/location in `_evidence`.
   - "inferred": AI inferred from context. Record inference basis in `_evidence`.
   - "unclear": no clues.

   **chain_status determination**:
   | chain_status | Condition | Handling |
   |--------------|-----------|----------|
   | **complete** | Layers 1~3 all "confirmed" | Proceed without questions |
   | **partial** | Some are "inferred" | Confirm only inferred Layers with user |
   | **feature_only** | Layers 1~3 all "unclear" | Ask user about Layers 1~3 |

   **When partial** — per-Layer confirmation:
   Present only "inferred" Layers via AskUserQuestion (in {communication_language}). Each Layer can be confirmed/edited independently.
   ```
   The following items are AI inferences. Please verify:

   Root cause: "Matching system does not reflect negative experiences" ← AI inference
     [Correct] / [Needs revision]
   ```
   On revision, update `_source` to `user_confirmed`.

   **When feature_only** — optional questions:
   AskUserQuestion opt-in (in {communication_language}):
   "Adding a causal chain (why this feature is needed) enables a more accurate Sprint. Would you like to add one?"
   - **Yes** → 3 questions:
     1. What problem is occurring? (Phenomenon)
     2. What do you think causes it? (Root Cause)
     3. How does this feature address that cause? (Solution Rationale)
     Record results in causal_chain + `chain_status: "complete"` or `"partial"`
   - **No** → `chain_status: "feature_only"`, `force_cp1_causal_review: false`, proceed normally

   Record results in sprint-input.md frontmatter `causal_chain`.

#### Step 0e: Goals Extraction + Complexity Classification

From sprint-input.md Core Brief + Discovered Requirements:
- **Extract 3~5 Goals** (specific, verifiable objectives)
- **Classify complexity**:
  - `simple`: single domain, 3 or fewer APIs
  - `medium`: 2~3 domains, 4~10 APIs
  - `complex`: multiple domains, 10+ APIs or complex state management

Record Goals and complexity in sprint-input.md frontmatter.

**Time estimate generation**:
Record initial time range in sprint-input.md frontmatter based on complexity:
- simple: 30~60 min
- medium: 60~120 min
- complex: 120~240 min

> These are initial estimates and will auto-calibrate as Sprint execution data accumulates.

#### Step 0f: Brownfield Source Status Check + Topology Determination

##### Sub-step 0f-0: Existing brownfield-context.md Reuse Decision

If brownfield-context.md was found in Step 0a scan:
1. Read file contents and verify included levels (L1~L4)
2. Record in sprint-input.md frontmatter:
   ```yaml
   pre_existing_brownfield:
     path: specs/{feature_name}/brownfield-context.md
     levels: [L1, L2]  # detected levels
   ```
3. Topology determination (Sub-steps 0f-1 ~ 0f-3) proceeds normally
4. Auto Sprint Step 1 will scan only missing levels based on the existing file

If no existing brownfield-context.md → proceed with source detection below.

Detect current project's Brownfield sources using **cumulative (AND)** approach. Collect all sources then merge into brownfield-context.md.

##### Sub-step 0f-1: Local document-project Detection

1. Read `_bmad/bmm/config.yaml` → extract `project_knowledge` value
   - If missing, search fallback paths: `docs/`, `global/` in order
2. Check for `{project_knowledge}/project-scan-report.json`
3. If found → Staleness check (based on `timestamps.last_updated`, days elapsed = today - last_updated):
   - **<= 30 days** → `document_project_status: fresh`, use normally
   - **> 30 days AND <= 90 days** → `document_project_status: stale` + suggest refresh (in {communication_language}):
     "Codebase analysis docs were generated {N} days ago. Refresh? [1] Refresh then start [2] Proceed with current docs"
   - **> 90 days** → `document_project_status: expired` + warn (in {communication_language}):
     "Codebase analysis docs are outdated ({N} days). Not using them."
     Do not use document-project data (document_project_path: null)
4. Set `document_project_path`: `project_knowledge` value (null if expired)
5. If not found + BMad installed (`_bmad/bmm/` exists) + build tools present (see Sub-step 0f-3) → suggest auto-generation (in {communication_language}):
   ```
   First-time codebase analysis for this project.
   Understanding existing APIs, DB, and service structure enables a more accurate Sprint.
   [1] Analyze then start (~15 min)
   [2] Start immediately
   ```
   [1] selected: run `Skill("bmad:bmm:workflows:document-project")` → re-run Sub-step 0f-1 on completion
   [2] selected: proceed with `document_project_path: null`

##### Sub-step 0f-2: External Data Source Detection

Detect accessible external data sources and record them in sprint-input.md.

**A. `--add-dir` directories (recommended for local clones)**

1. Check which `--add-dir` directories are accessible by attempting Glob on known paths
   - For each role (backend-docs, client-docs, svc-map): attempt `Glob("**/*.md", path={dir})` or similar
   - If files found → record as accessible external source
2. If a known external repo path is inaccessible:
   ```
   External repo path '{path}' is not accessible.
   Add it via --add-dir flag when launching Claude Code:
     claude --add-dir {path}
   ```
   - [1] Restart Claude Code with --add-dir, then re-check
   - [2] Add data to `specs/{feature}/inputs/` manually, then re-check
   - [3] Proceed without this external data (reduced accuracy)

   [1] or [2] selected: re-run Sub-step 0f-2 once after user action.
   [3] selected: record source as unavailable and proceed.

3. **Record detected repos in sprint-input.md** `external_resources.external_repos`:
   For each accessible `--add-dir` directory, add an entry:
   ```yaml
   external_resources:
     external_repos:
       - name: "{directory-name}"  # derived from path basename
         path: "{full accessible path}"
         access_method: "add-dir"
   ```
   Scanner reads this field from sprint-input.md to discover external sources (same pattern as `external_resources.figma`).

**B. MCP servers (for non-filesystem sources)**

1. Read `.mcp.json` → extract registered MCP server list
2. For non-filesystem MCP servers (e.g., Figma): verify connectivity
3. Filesystem MCP servers in `.mcp.json` → warn and recommend `--add-dir` instead:
   ```
   Filesystem MCP server '{server_name}' detected in .mcp.json.
   Filesystem MCP servers are restricted to the project root by Claude Code security.
   Use --add-dir for external repo access instead:
     claude --add-dir {path}
   ```

##### Sub-step 0f-2b: Figma MCP Check (when external_resources.figma exists)

If Step 0d detected Figma URLs and recorded them in sprint-input.md `external_resources.figma`:

1. Attempt Figma MCP connectivity: call `whoami` via Figma MCP
2. **Success** → update sprint-input.md `external_resources.figma.status: configured`
3. **Failure** (MCP not connected) → present options via AskUserQuestion (in {communication_language}):
   ```
   Figma design URL detected, but Figma MCP is not connected.
   Connecting allows Sprint to analyze existing design data.

   [1] Connect now (opens browser for OAuth)
   [2] Continue without Figma
   ```
   - [1] selected: guide `claude mcp add --transport http figma https://mcp.figma.com/mcp` → after auth, re-check `whoami` → update status to `configured`
   - [2] selected: update status to `not-configured`, Sprint continues without Figma data

If no Figma URLs were detected in Step 0d → skip this sub-step entirely (no prompt).

##### Sub-step 0f-2C: GitHub Repo Snapshot (when external_resources.github_repos has status: pending items)

If Step 0d detected GitHub repo URLs and user selected [1] (download):

1. **gh auth check**: Run `gh auth status`
   - Failure → present via AskUserQuestion (in {communication_language}):
     ```
     GitHub 인증이 필요합니다.
     [1] gh auth login 실행 후 재시도
     [2] 해당 repo 없이 계속
     ```
     - [1] selected: guide user to run `gh auth login`, then re-check
     - [2] selected: update github_repos status to `not-configured`, proceed

2. **For each repo with status: pending**:
   a. Progress message (in {communication_language}): "원격 리포지토리 스냅샷 다운로드 중... ({N}/{total}: {owner_repo})"
   b. **Extract branch from URL** (if present):
      - URL pattern `https://github.com/{owner}/{repo}/tree/{branch}` → extract `{branch}`
      - URL pattern `https://github.com/{owner}/{repo}` (no `/tree/`) → default `{ref}` = `HEAD`
      - Store `{ref}` for tarball API call and commit query
   c. **Repo size pre-check**: `gh api repos/{owner_repo} --jq '.size'` (returns KB)
      - Size < 1GB (< 1048576 KB): proceed silently
      - Size >= 1GB: warn (in {communication_language}), then proceed without blocking:
        ```
        ⚠ {owner_repo}: approximately {size_mb}MB. Download may take several minutes.
          For partial access (specific directories only), use: git clone + claude --add-dir
          Downloading...
        ```
   d. **Create cache directory**: `mkdir -p ~/docs-cache/{feature}/{name} && chmod 700 ~/docs-cache/{feature}/{name}`
      - `{name}` = `{owner}-{repo}` (slash replaced with hyphen)
   e. **Download + extract**: `gh api repos/{owner_repo}/tarball/{ref} | tar xz -C ~/docs-cache/{feature}/{name} --strip-components=1`
   f. **Record snapshot version**: `gh api repos/{owner_repo}/commits/{ref} --jq '.sha + " " + .commit.committer.date'`
      - Parse output: `{snapshot_commit}` = first field (SHA), `{snapshot_at}` = second field (ISO 8601)
      - `{snapshot_branch}` = `{ref}` if explicitly extracted from URL, otherwise `"HEAD"`
   g. **On success** → add to `external_resources.external_repos`:
      ```yaml
      - name: "{owner}-{repo}"
        path: "~/docs-cache/{feature}/{name}/"
        access_method: "tarball-snapshot"
        source_url: "https://github.com/{owner_repo}"
        snapshot_commit: "{snapshot_commit}"
        snapshot_branch: "{snapshot_branch}"
        snapshot_at: "{snapshot_at}"
      ```
      Update github_repos status to `configured`
   h. **On failure** → classify error and present via AskUserQuestion (in {communication_language}):

      | Error Pattern | Message |
      |---------------|---------|
      | HTTP 404 | "리포지토리를 찾을 수 없습니다. URL을 확인하세요." |
      | HTTP 403 | "접근 권한이 없습니다. gh auth login을 확인하세요." |
      | DNS/network | "네트워크 연결을 확인하세요." |
      | Other | "다운로드 실패: {error}" |

      Options:
      - [1] 재시도
      - [2] 해당 repo 없이 계속
      - [3] --add-dir로 수동 접근

      - [1] selected: retry step 2e (max 1 retry)
      - [2] selected: update github_repos status to `not-configured`, proceed
      - [3] selected: guide user to clone + --add-dir, update github_repos status to `not-configured`

      Note: if only the version query (step 2f) fails, proceed with download success — record `snapshot_commit: "unknown"`.

   i. Completion message (in {communication_language}): "다운로드 완료 ({total}/{total}, {elapsed}초)"

3. **Update github_repos status**: `configured` (all succeeded) / `not-configured` (any failed)

If no github_repos with status: pending → skip this sub-step entirely.

##### Sub-step 0f-3: Topology Determination + brownfield_status Decision

**Build tool file detection**: If any of these files exist at project root → "build tools present":
`package.json`, `go.mod`, `pom.xml`, `build.gradle`, `Cargo.toml`, `pyproject.toml`, `Makefile`, `CMakeLists.txt`, `mix.exs`, `Gemfile`, `composer.json`

**Monorepo detection**: If any of these files exist at project root → "monorepo":
`pnpm-workspace.yaml`, `lerna.json`, `nx.json`, `rush.json`, `project-parts.json`, `turbo.json`

**MSA detection refinement**: External sources + Build Tools does not always mean MSA. Additional heuristics:
- If build tools present AND external sources configured AND local codebase has `src/` or `app/` at root level → likely `co-located` (not MSA)
- MSA is indicated when: external sources reference services NOT found in local codebase, or endpoint URLs point to different hosts/ports
- When ambiguous between co-located and MSA: default to `co-located` (local-first is safer)

**Monorepo vs co-located disambiguation**:
- Monorepo requires an explicit workspace config file (listed above). Multiple `package.json` in subdirectories alone does not qualify.
- If monorepo file exists but only 1 package is defined → treat as `co-located` (effectively single-package)

**Decision matrix**:

Detection priority order: monorepo → co-located → msa → standalone.

1. If monorepo config file detected AND 2+ packages defined → `monorepo`
2. If build tools present AND no external sources → `co-located`
3. If build tools present AND external sources → check local codebase for service code:
   - Service code found locally → `co-located`
   - No local service code (only configs/scripts) → `msa`
4. If no build tools AND external sources → `standalone`
5. If nothing → `standalone` + `greenfield`

**Fallback decision matrix** (when heuristics above are inconclusive):

| document-project | External Sources | Build Tools | Monorepo | topology | brownfield_status |
|-----------------|-----------------|-------------|----------|----------|-------------------|
| any | any | any | yes (2+ pkgs) | `monorepo` | `configured` (if doc-project/external has at least one) or `local-only` |
| any | any | yes | no | `co-located` | `configured` or `local-only` |
| any | yes | no | no | `standalone` | `configured` |
| no | no | yes | no | `co-located` | `local-only` |
| no | no | no | no | `standalone` | `greenfield` |

- Partial source failure: `partial-failure` (topology determined by working sources)
- Record `brownfield_topology` and `brownfield_status` in sprint-input.md frontmatter

Record results in sprint-input.md Brownfield Status section and frontmatter.

##### Sub-step 0f-3b: Monorepo Package Scoping (only when topology=monorepo)

When topology is determined as `monorepo`:

1. **Parse workspace config**: Read the detected workspace config file (pnpm-workspace.yaml, lerna.json, etc.) to extract package list
2. **AI recommends relevant packages**: Based on Brief keywords + goals, recommend packages that are likely relevant to this Sprint
3. **Present to user** via AskUserQuestion (in {communication_language}):
   ```
   Monorepo detected. {N} packages found.

   AI-recommended packages for this Sprint:
   ✓ packages/auth — likely relevant (matches: "login", "user")
   ✓ apps/web — likely relevant (matches: "UI", "screen")
   ✓ packages/shared — shared utilities

   Excluded (can override):
   ✗ packages/billing — not related to Brief
   ✗ apps/admin — not related to Brief

   [1] Accept recommendations (Recommended)
   [2] Modify selection
   ```
   - [1] selected: use recommended packages
   - [2] selected: user specifies which to include/exclude → update selection
4. **Record in sprint-input.md frontmatter**:
   ```yaml
   monorepo_packages:
     - path: "packages/auth"
       reason: "matches Brief keyword: login"
     - path: "apps/web"
       reason: "matches Brief keyword: UI"
     - path: "packages/shared"
       reason: "shared utilities"
   ```

##### Sub-step 0f-4: Topology Log (no user interrupt)

Record topology detection result in sprint-log.md (create if not exists):
```markdown
| {timestamp} | Topology Detection | topology={topology}, brownfield_status={status}, sources: document-project={dp_status}, external={N} sources, local={local_status}, figma={figma_status} |
```

This is a log entry only — no user confirmation or interrupt required. Topology is visible at JP1 if the user wants to verify.

#### Step 0g: sprint-input.md Generation + Validation Checksum

1. **Generate sprint-input.md**: Integrate all data collected in Steps 0d~0f and Write to `specs/{feature_name}/inputs/sprint-input.md` (single Write — no prior Edit).
   - 참고 소스 섹션의 `policy_docs`, `scan_notes` → `external_resources`에 포함
   - `github_repos`에 `notes` 필드 전달 (참고 소스 섹션에서 추출된 per-URL notes)
   - All "record in sprint-input.md" instructions in Steps 0d~0f are in-memory accumulation → materialized here as a single file Write

2. **Validation checksum** — verify sprint-input.md was generated correctly:

```
- Brief original included: Y/N
- References processed: N/M
- Discovered Requirements: N
- Goals mapping: N/M goals linked to Brief keywords
- Contradictions detected: N
- input_files ↔ Reference Materials 1:1 match: Y/N
```

Record validation results in sprint-input.md frontmatter `validation`.

**Fallback Tier determination logic**:

| Condition | Tier |
|-----------|------|
| brief.md read success + all references success | 1 |
| brief.md read success + no references (Quick Start) | 1 |
| brief.md read success + some/all references failed | 2 |
| Case 1 entry + brief.md save failed | 3 (use in-memory inline Brief only) |
| Case 2 entry + brief.md read failed | 4 (abort Sprint) |
| Cannot identify specific features/services from Brief content | 4 (abort Sprint) |

**Validation failure handling**:

| Failed Item | Action |
|-------------|--------|
| Brief original included: N | Regenerate sprint-input.md (1 retry) |
| References processed: M < N | Downgrade to Tier 2 + warn |
| Goals mapping: 0 | Tier 4 (abort Sprint — cannot extract goals) |

Max 1 retry. If still failing after retry, proceed with best effort at current Tier.

**Tier 4 abort message** (in {communication_language}):
```
Cannot identify features to build from the Brief.
Please include the following in brief.md:
- What feature to build (e.g., "tutor exclusion feature")
- Who uses it (e.g., "students")
- Expected behavior (e.g., "blocked tutors excluded from matching")
After editing, re-run: /sprint {feature_name}
```

#### Step 0h: "Start Sprint?" Confirmation

Present a layered confirmation screen via AskUserQuestion.

First display analysis results as text (in {communication_language}):

```markdown
## Sprint Start Confirmation — {feature_name}

### Goals (as understood by AI)
1. {goal_1}
2. {goal_2}
3. {goal_3}

### Analysis Results
- Complexity: {simple/medium/complex}
- Brief grade: {A/B/C}
- References: {N} analyzed
- Brownfield: {greenfield / configured / local-only / N sources, M operational}
- Topology: {standalone / co-located / msa / monorepo}
- Codebase analysis: {fresh / stale / expired / not configured}
- Causal chain: {complete / partial / feature_only / not configured}
- Estimated time: {N}~{M} min

### Warnings (shown only when applicable — 1-line summary + see sprint-input.md for details)
- Warning: Brief grade B — AI will infer details
- Warning: Brief grade C — Brief is insufficient. Forced review scheduled at JP1.
- Warning: {N} contradictions detected (see sprint-input.md)
- Warning: Brownfield source inaccessible: {source_name}
- Warning: {M} of {N} references skipped (limit exceeded or unsupported format)
- Warning: Causal chain unconfirmed — proceeding with AI inference. Must verify at JP1.

### Discovered Additional Requirements (shown only when applicable)
- [DISC-01] {content} (source: {filename}) — included in Sprint scope
- [DISC-02] {content} (source: {filename}) — included in Sprint scope
{if over 5}
- ... and {N} more are next Sprint candidates (see sprint-input.md)

Details: specs/{feature_name}/inputs/sprint-input.md
```

Then AskUserQuestion (in {communication_language}):

| Option | Description |
|--------|-------------|
| **Continue** | Start Sprint |
| **Adjust** | Modify goals/complexity/Discovered Requirements (free input → update sprint-input.md → re-confirm) |
| **Exit** | Abort (inputs/ preserved; edit brief.md then `/sprint {feature_name}` to restart) |

**Adjust handling**: User free input → update goals, complexity, discovered_requirements in memory → delete existing sprint-input.md → re-Write sprint-input.md with updated data (hook allows Write when file does not exist) → re-display Step 0h confirmation.

**Exit handling message** (in {communication_language}):
```
Sprint aborted.

Preserved artifacts:
- specs/{feature_name}/inputs/ (original Brief + references + sprint-input.md)

Restart: /sprint {feature_name}
Edit Brief then restart: edit brief.md → /sprint {feature_name}
```

#### Step 0h → Auto Sprint Launch

On Continue, invoke `@auto-sprint` agent:

```
Task(subagent_type: "general-purpose")
  prompt: "You are @auto-sprint. Read and follow your agent definition at .claude/agents/auto-sprint.md.
    Input:
      feature_name: {feature_name}
      sprint_input_path: specs/{feature_name}/inputs/sprint-input.md
      goals: {goals array from sprint-input.md}
      complexity: {complexity from sprint-input.md}
      flags: { force_jp1_review: {true/false} }
      document_project_path: {document_project_path from sprint-input.md, or null}
      brownfield_topology: {brownfield_topology from sprint-input.md}
      pre_existing_brownfield_path: {pre_existing_brownfield.path from sprint-input.md, or null}"
```

---

Auto Sprint then auto-executes:

### Phase 1: Planning → Specs
1. Brownfield 2-Pass scan (referencing sprint-input.md)
2. BMad Auto-Pipeline (Brief → PRD → Architecture → Epics)
3. Scope Gate verification at each step
4. Specs 4-file generation (@deliverable-generator specs-only)

→ **Judgment Point 1**: Specs review (task structure, Entropy, File Ownership)
- **Approve** → proceed to Phase 2
- **Feedback** → re-run from affected step
- **Abort** → exit

### Phase 2: Deliverables
5. Full-stack Deliverables generation (@deliverable-generator deliverables-only)
6. Sprint Output Package assembly

→ **Judgment Point 2**: Sprint Output review (prototype + specs)
- **Approve** → run `/parallel` (parallel implementation)
- **Feedback** → regenerate Deliverables or revise Specs
- **Abort** → exit

## Outputs
- `specs/{feature}/inputs/` — user originals + sprint-input.md (SSOT)
- `specs/{feature}/planning-artifacts/` — BMad artifacts (PRD, Architecture, Epics, Brownfield Context)
- `specs/{feature}/` — Specs 4-file + Deliverables
- `specs/{feature}/preview/` — working prototype
