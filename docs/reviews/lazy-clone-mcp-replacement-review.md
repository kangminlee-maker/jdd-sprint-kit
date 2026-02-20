# Review: Replace Tarball Snapshot with Lazy Clone MCP Server

## Status: FINAL — Party Mode 14 findings + product owner input incorporated

## 1. Current State: Tarball Snapshot Mechanism

### How It Works

1. Sprint Phase 0 (sprint.md Step 0d) parses `## Reference Sources` in brief.md
2. GitHub URLs are extracted; repos listed explicitly download without confirmation
3. Sub-step 0f-2C downloads each repo: `gh api repos/{owner_repo}/tarball/HEAD | tar xz -C /tmp/sprint-{feature}-{name} --strip-components=1`
4. Local path recorded in `sprint-input.md` → `external_resources.external_repos[]`
5. Brownfield Scanner reads sprint-input.md, accesses files via Glob/Grep/Read

### Known Limitations

| # | Limitation | Impact | Observed? |
|---|-----------|--------|-----------|
| T1 | No incremental update — entire tarball re-downloaded each time | Theoretical: wastes bandwidth on large repos | **NOT observed** — Sprint runs once per feature; tarball downloads once in Phase 0. No known case of same-session re-download. |
| T2 | GitHub API rate limits | `gh api` uses authenticated calls via `gh auth` tokens, subject to secondary rate limits on large repos | Theoretical — not yet hit in practice |
| T3 | GitHub-only — no GitLab/Bitbucket | Users with non-GitHub repos must use --add-dir | By design — documented limitation |
| T4 | No git history — files only | Scanner cannot use blame/log for change frequency analysis | Low impact — Scanner does not use blame |
| T5 | /tmp/ persistence — no cleanup, no recovery if OS purges | Scanner finds missing directory → failure with no retry | Real risk on long-running sessions |
| T6 | Single retry on failure | After 1 retry, user must fallback to --add-dir | Acceptable — --add-dir is reliable fallback |
| T7 | **No version tracking** — commit SHA, branch, timestamp not recorded | Cannot answer "which version of the repo was this analysis based on?" after Sprint completes. Brownfield-context.md has no provenance data for external repos. | **Real gap** — affects traceability and debugging |
| T8 | **No repo size check** — downloads entire repo regardless of size | 1GB+ monorepo tarball may take minutes, consume significant disk, or timeout. No warning shown. Partial download (subdirectory only) is not possible with tarball API. | **Real gap** — 1GB+ repos need explicit handling |

### Tarball Strengths (often overlooked)

These properties are easy to lose in a replacement and must be preserved:

| # | Strength | Detail |
|---|----------|--------|
| S1 | **Always fetches current HEAD** | No stale data risk — every download gets the latest state |
| S2 | **No `.git/` directory** | Extracted files are pure content; no risk of `.git/` leaking into Glob/Grep results |
| S3 | **Seamless auth via `gh api`** | Leverages `gh auth` OAuth tokens; works for both public and private repos without extra credential setup |
| S4 | **No persistent state** | No cache to go stale, no disk to accumulate, no cleanup needed |
| S5 | **Single download mechanism** | One code path in sprint.md; no branching logic |

## 2. Proposed Replacement: Lazy Clone MCP Server

### What It Is

A custom MCP server (`docs-mcp-server`) that:
- Performs `git clone --depth 1` on first access to a GitHub repo
- Caches the clone in `~/docs-cache/{org}/{repo}/`
- On re-access within stale period (default 1h): reads from local cache (0ms network)
- On re-access after stale period: `git fetch --depth 1 + reset --hard` (incremental, diff only)
- Exposes 6 MCP tools: `read_doc`, `list_docs`, `search_docs`, `read_multiple_docs`, `refresh_cache`, `list_cache`

### MCP Roots Problem It Solves

`@modelcontextprotocol/server-filesystem` v2025.7.1+ replaces allowed directories when the client sends MCP Roots. This custom server does not declare roots capability, so the problem is bypassed entirely.

## 3. Feasibility Analysis

### 3.1 What the Lazy Clone MCP Actually Solves

| Limitation | Tarball | Lazy Clone MCP | Real Improvement? |
|-----------|---------|----------------|-------------------|
| T1: Incremental update | Full re-download | `git fetch` (diff only) | **MARGINAL** — T1 is not observed in practice. Sprint downloads once per feature. |
| T2: API rate limits | GitHub REST API (authenticated) | HTTPS git protocol (also rate-limited by GitHub) | **NO** — HTTPS clone is also subject to GitHub rate limiting. Unauthenticated clones are aggressively throttled. This is not "no API" — it is a different protocol endpoint, still controlled by GitHub. |
| T3: GitHub-only | GitHub only | GitHub only (HTTPS clone) | NO — still GitHub only |
| T4: No git history | Files only | `--depth 1` (latest commit only) | MARGINAL — 1 commit, not useful for blame |
| T5: /tmp/ persistence | /tmp/ (OS may purge) | ~/docs-cache/ (persistent) | YES — survives across sessions |
| T6: Single retry | 1 retry | Auto-retry via stale check | YES — transparent re-fetch |

**Honest assessment**: Only T5 and T6 are genuine improvements. T1 and T2, the headline motivations, are weaker than initially presented.

### 3.2 New Problems Introduced by Full MCP Replacement

| # | Problem | Severity | Detail |
|---|---------|----------|--------|
| P1 | **MCP tool indirection** | HIGH | Scanner uses Glob (glob patterns), Grep (regex, context lines, file type filters), Read (line offsets). MCP `search_docs` is a reference implementation using `toLowerCase().includes()` — but even if improved with ripgrep, MCP tools add network/IPC overhead per call vs direct filesystem access. The architectural cost remains. |
| P2 | **Dual search path** | HIGH | Current: all sources use Glob/Grep/Read. MCP introduction splits the tool path, requiring conditional logic in the scanner for every search operation. |
| P3 | **MCP server lifecycle** | MEDIUM | Must be running before Sprint starts; crashes require restart. Tarball has no persistent process. |
| P4 | **Redundant with --add-dir** | LOW | Useful only when no local clone exists — same niche as tarball. |
| P5 | **Security model change** | MEDIUM | MCP server with empty DOCS_ALLOWED_ORGS allows any repo clone. Tarball requires per-repo user confirmation. |

**Note on P1**: The original review criticized `search_docs` as "naive string matching." Party Mode correctly identified this as targeting the reference implementation, not the MCP architecture. However, even with ripgrep integration, MCP tools add IPC overhead and cannot match the zero-overhead integration of Glob/Grep/Read which run in-process in Claude Code. The architectural cost (P2: dual search path) is the stronger argument.

### 3.3 Architecture Fit Assessment

Current Sprint Kit architecture principle: **all external file access uses Glob/Grep/Read**.

This principle was established when filesystem MCP was replaced with `--add-dir` (Phase A, 2026-02-20). The entire scanner, all 4 stages, and all rules in jdd-mcp-search.md are built around this assumption.

Introducing the Lazy Clone MCP server would **reverse this architectural decision**:

```
Current (unified):
  Local codebase ──→ Glob/Grep/Read
  --add-dir repos ──→ Glob/Grep/Read
  tarball repos   ──→ Glob/Grep/Read
  Figma           ──→ MCP (exception: live API data only)

Full MCP replacement (split):
  Local codebase  ──→ Glob/Grep/Read
  --add-dir repos ──→ Glob/Grep/Read
  Lazy Clone repos──→ MCP tools (read_doc, search_docs, etc.)  ← NEW PATH
  Figma           ──→ MCP
```

**Verdict on full MCP replacement: REJECT.** The architectural cost (dual search path) outweighs the benefits.

## 4. Alternative: Hybrid Approach — Shallow Clone as Download Backend Only

Instead of MCP tools for file access, use shallow clone **only for the download/cache step**, then expose the cached directory to Glob/Grep/Read via the existing path.

### How It Would Work

1. Sprint Phase 0 detects GitHub URLs (same as current)
2. Instead of `gh api tarball/HEAD | tar xz`, run `git clone --depth 1` into cache directory
3. If cache exists and is fresh, skip clone
4. Record cache path in `sprint-input.md` → `external_resources.external_repos[]`
5. Scanner uses Glob/Grep/Read on the cached path (same as current tarball)

### What This Preserves

- Single access path (Glob/Grep/Read for everything)
- No MCP server lifecycle management
- Scanner code unchanged
- jdd-mcp-search.md rules unchanged

### What This Gains

| Benefit | Detail |
|---------|--------|
| Persistent cache | `~/docs-cache/` survives across sessions (not /tmp/) |
| Faster re-runs | If cache is fresh, Phase 0 skips download entirely |
| Incremental fetch | `git fetch --depth 1` transfers diff only (when stale) |

### New Problems the Hybrid Approach Introduces

These are problems that **tarball does not have** — regressions the hybrid must solve:

| # | Problem | Severity | Detail |
|---|---------|----------|--------|
| H1 | **Stale cache serves outdated data silently** | HIGH | Tarball always fetches current HEAD. Hybrid with 1-hour stale window treats 59-minute-old data as "fresh." If repo X changes after Feature-A caches it, Feature-B starting 50 minutes later gets the old version silently. This is worse than tarball's behavior. |
| H2 | **`.git/` directory leaks into Scanner results** | HIGH | Tarball extraction has no `.git/`. Shallow clone has one. Scanner's Glob patterns (e.g., `**/*.md`) will match `.git/` contents unless every Glob/Grep call explicitly excludes it. Current Scanner was not designed with `.git/` in cached repos. |
| H3 | **Race condition on shared cache** | MEDIUM | `git fetch + git reset --hard` on a cache directory while another Sprint session reads from it can cause partially written files. Tarball writes to a unique `/tmp/sprint-{feature}-{name}/` per Sprint — no sharing. |
| H4 | **Branch collision in cache path** | HIGH | Cache path `~/docs-cache/{owner}/{repo}` has no branch component. Feature-A needs `org/repo@main`, Feature-B needs `org/repo@develop` → they overwrite each other. |
| H5 | **Private repo authentication gap** | HIGH | Tarball uses `gh api` which leverages `gh auth` OAuth tokens seamlessly. `git clone https://...` uses a separate git credential store. Many users with `gh auth` configured do NOT have HTTPS git credentials configured. Private repos that work with tarball will fail with shallow clone. Even public repos may hit lower unauthenticated rate limits. |
| H6 | **Unbounded disk growth** | MEDIUM | `/tmp/` is OS-managed and auto-cleared. `~/docs-cache/` grows indefinitely with no cleanup. After months of Sprint usage, dozens of repos accumulate. |
| H7 | **Complexity in natural-language instructions** | MEDIUM | sprint.md is a prompt, not executable code. Cache freshness checks, git error classification, branch routing, race condition avoidance — expressed as natural-language instructions for an LLM to follow — are harder to make deterministic than TypeScript. The implementation is not "~60 lines of shell" but "~60 lines of LLM instruction that must handle edge cases reliably." |

## 5. Comparative Assessment

### Tarball vs Hybrid: Honest Trade-off

| Dimension | Tarball (current) | Hybrid (shallow clone) | Winner |
|-----------|------------------|----------------------|--------|
| Data freshness | Always current HEAD | Stale within window | **Tarball** |
| Auth simplicity | `gh auth` tokens, zero config | Requires `gh auth setup-git` or git credentials | **Tarball** |
| No `.git/` contamination | Guaranteed (no `.git/`) | Requires explicit exclusion | **Tarball** |
| Concurrent safety | Unique /tmp/ per Sprint | Shared cache, race condition | **Tarball** |
| Single download mechanism | Yes | Yes (if no fallback) | Tie |
| Cache persistence | /tmp/ (OS may purge) | ~/docs-cache/ (persistent) | **Hybrid** |
| Re-run speed | Full re-download | Skip if fresh | **Hybrid** |
| Disk management | OS handles /tmp/ | Manual cleanup needed | **Tarball** |
| Branch support | N/A (no cache) | Requires branch in path | **Tarball** (simpler) |

**Score: Tarball 6, Hybrid 2, Tie 1.**

The hybrid approach introduces more problems than it solves. The two genuine benefits (persistent cache, faster re-runs) do not justify the 7 new problems.

## 6. Recommendation

### Primary: Keep Tarball, Fix Three Gaps (T5 + T7 + T8)

Three real-world gaps exist in the current tarball mechanism. All fixable without changing the download mechanism.

#### Fix 1: Persistent extraction path (T5)

**Move tarball extraction from `/tmp/` to `~/docs-cache/`.**

```
Current:  /tmp/sprint-{feature}-{owner}-{repo}/
Proposed: ~/docs-cache/{feature}/{owner}-{repo}/
```

This captures the persistent cache benefit without introducing any of H1-H7:

| Property | Result |
|----------|--------|
| Data freshness | Always current HEAD (tarball re-downloads each Sprint) |
| Auth | `gh auth` tokens (unchanged) |
| `.git/` contamination | None (tarball has no `.git/`) |
| Concurrent safety | Unique directory per feature (no sharing) |
| Download mechanism | Single path (`gh api tarball`) |
| Persistence | `~/docs-cache/` survives across sessions |
| Disk management | Per-feature directories; can add cleanup |

#### Fix 2: Version tracking (T7)

After tarball download, query the commit SHA and record it in sprint-input.md:

```
gh api repos/{owner_repo}/commits/{ref} --jq '.sha + " " + .commit.committer.date'
```

Where `{ref}` is the branch extracted from the URL (default: `HEAD`).

Record in `external_resources.external_repos[]`:

```yaml
- name: "org-backend-api"
  path: "~/docs-cache/{feature}/org-backend-api/"
  access_method: "tarball-snapshot"
  source_url: "https://github.com/org/backend-api"
  snapshot_commit: "a1b2c3d"          # NEW — commit SHA at download time
  snapshot_branch: "main"              # NEW — branch (from URL or default)
  snapshot_at: "2026-02-20T14:30:00Z"  # NEW — commit timestamp
```

This data propagates to brownfield-context.md `data_sources` section, enabling traceability: "this Brownfield analysis was based on commit `a1b2c3d` of `org/backend-api` (main branch, 2026-02-20T14:30Z)."

**Cost**: 1 additional `gh api` call per repo (sub-second). No behavioral change.

#### Fix 3: Repo size check + large repo warning (T8)

Before tarball download, query repo size:

```
gh api repos/{owner_repo} --jq '.size'
```

GitHub API `.size` returns KB. Apply the following logic:

| Size | Action |
|------|--------|
| < 1GB | Download without interruption |
| >= 1GB | **Warn + continue**: display repo size, inform that download may take time, then proceed. No blocking confirmation. For monorepo partial access, inform about `--add-dir` as alternative. |

Warning message (in `{communication_language}`):

```
⚠ {owner_repo}: approximately {size_mb}MB. Download may take several minutes.
  For partial access (specific directories only), use: git clone + claude --add-dir
  Downloading...
```

**Design decision**: Warn-and-continue, not warn-and-ask. Rationale:
- The user already declared this repo in `## Reference Sources` (explicit intent).
- Blocking on confirmation interrupts the automated Phase 0 flow.
- The warning provides the `--add-dir` alternative if the user wants to abort and retry manually.
- Tarball API does not support partial downloads (subdirectory only), so for repos where size is truly prohibitive, `--add-dir` with local sparse checkout is the only alternative.

### Secondary: If Cross-Sprint Cache Reuse Is Later Needed

If a future need arises to reuse a repo across multiple features without re-downloading:

1. Add a freshness check: if `~/docs-cache/{owner}-{repo}/` exists and was modified within N minutes, skip download
2. Keep using `gh api tarball` for re-download (not git clone) — preserves auth simplicity and no `.git/`
3. Include branch in the cache key if branch support is needed: `~/docs-cache/{owner}-{repo}@{branch}/`

This is an incremental enhancement, not a replacement of the download mechanism.

### What NOT to Do

1. **Do not replace tarball with `git clone --depth 1`** — introduces H1-H7 without proportional benefit
2. **Do not introduce the Lazy Clone MCP server** — reverses the Phase A architectural decision (Glob/Grep/Read for everything)
3. **Do not maintain two download mechanisms** (shallow clone + tarball fallback) — doubles the code paths and instruction complexity

### What to Do with the MCP Server Guide

The Lazy Clone MCP server guide (`docs-mcp-server-guide.md`) is a well-designed piece of work. It solves a real problem — the MCP Roots protocol directory replacement issue — but that problem does not exist in Sprint Kit's current architecture (Sprint Kit does not use filesystem MCP servers for external repos).

**Preserve the guide as reference material** for a scenario where MCP-based access to external repos becomes necessary (e.g., if a future MCP client requires roots-aware servers). It is not needed for the current tarball-to-cache migration.

## 7. Design Decisions (Resolved)

Party Mode identified 5 deferred questions. All resolved here:

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| Q1 | Should `~/docs-cache/` be configurable? | **Fixed path, no env var.** | Sprint Kit does not expose env vars as configuration surface. `~/docs-cache/` is predictable and documented. If a user needs a different path, they can symlink. |
| Q2 | Stale threshold configurable? | **Not applicable.** | Primary recommendation uses tarball (always fresh). If secondary enhancement is adopted, use a fixed 1-hour threshold — configurable thresholds add complexity for minimal benefit. |
| Q3 | Cleanup command for old caches? | **Yes — add to backlog.** | `~/docs-cache/` needs a cleanup mechanism. Simplest: document manual `rm -rf ~/docs-cache/{feature}/` per feature. Automation (e.g., TTL-based) can follow if disk growth becomes a real issue. |
| Q4 | Tarball fallback on clone failure? | **No fallback — primary recommendation keeps tarball as the only mechanism.** | Maintaining two download paths doubles complexity. |
| Q5 | Branch detection from GitHub URL? | **Yes — extract branch from URL path when present.** | URL pattern `github.com/org/repo/tree/{branch}` should extract `{branch}`. Default to `HEAD` (which `gh api tarball/HEAD` already handles). No cache path conflict since tarball uses per-feature directories. |
| Q6 | How to handle version tracking for tarball snapshots? | **Record commit SHA + branch + timestamp via `gh api commits/{ref}` after download.** | 1 additional API call per repo (sub-second). Enables traceability in brownfield-context.md. |
| Q7 | How to handle large repos (1GB+)? | **Warn-and-continue: show size, inform about --add-dir alternative, proceed with download.** | User declared the repo explicitly in Reference Sources. Blocking confirmation interrupts automated flow. Tarball API does not support partial download. |

## 8. Implementation Scope

### Minimal (Primary Recommendation — T5 + T7 + T8)

| File | Change |
|------|--------|
| `.claude/commands/sprint.md` | Sub-step 0f-2C: (1) change `mkdir` target from `/tmp/` to `~/docs-cache/{feature}/{name}`. (2) Add `gh api repos/{owner_repo} --jq '.size'` pre-check + 1GB warning. (3) Add `gh api repos/{owner_repo}/commits/{ref}` post-download for version tracking. (4) Add branch extraction from GitHub URL. |
| `_bmad/docs/sprint-input-format.md` | Add `snapshot_commit`, `snapshot_branch`, `snapshot_at` fields to `external_repos[]`. Document `~/docs-cache/` as extraction path. |
| `.claude/rules/jdd-mcp-search.md` | Method 3: update path description (tarball → persistent cache) |
| `_bmad/docs/brownfield-context-format.md` | `data_sources` section: document snapshot provenance fields |
| `CHANGELOG.md` | Record the change |

**Estimated: 5 files, ~40 lines changed. No scanner or agent changes.**

## Appendix: Party Mode Findings Log + Product Owner Input

14 findings from adversarial review + 2 product owner concerns, all incorporated:

| # | Finding | Disposition |
|---|---------|-------------|
| 1 | T1 (incremental update) is a phantom problem | T1 downgraded in §1; honest assessment added in §3.1 |
| 2 | `.git/` directory contaminates Scanner results | Added as H2 in §4; resolved by keeping tarball (no `.git/`) |
| 3 | Stale cache is worse than tarball | Added as H1 in §4; key factor in rejecting hybrid |
| 4 | "No API rate limiting" is false | Corrected in §3.1 — HTTPS clone is also rate-limited |
| 5 | `git reset --hard` race condition | Added as H3 in §4; resolved by per-feature directories |
| 6 | Branch collision in cache path | Added as H4 in §4; resolved by per-feature directories |
| 7 | "~60 lines" estimate is deceptive for prompt instructions | Added as H7 in §4; primary recommendation is ~20 lines |
| 8 | search_docs criticism targets implementation, not architecture | Reframed in §3.2 note — P2 (dual search path) is the stronger argument |
| 9 | Tarball fallback = two mechanisms | Resolved in §6: no fallback, tarball is the only mechanism |
| 10 | Private repo auth gap | Added as H5 in §4; resolved by keeping `gh api` |
| 11 | Disk space management missing | Resolved in Q3 (§7): cleanup documented as backlog item |
| 12 | Section 7 defers critical decisions | All 5 questions resolved in §7 |
| 13 | "Lazy loading" is an irrelevant trade-off | Removed from document entirely |
| 14 | `gh auth` ≠ `git` credentials | Added as H5 detail in §4; resolved by keeping `gh api` |

**Product owner input** (post-Party Mode):

| # | Concern | Disposition |
|---|---------|-------------|
| PO-1 | No version tracking — cannot trace which commit the snapshot represents | Added as T7 in §1; Fix 2 in §6 (commit SHA + branch + timestamp via `gh api commits/{ref}`) |
| PO-2 | Large repo size — no handling for 1GB+ repos | Added as T8 in §1; Fix 3 in §6 (size pre-check + warn-and-continue + --add-dir guidance) |
