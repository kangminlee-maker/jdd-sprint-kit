# PRD Writing Guidelines

Format guidelines for PRDs, based on the BMad Method's PRD philosophy.

> **Reference documents:**
> - BMad PRD philosophy: `_bmad/bmm/workflows/2-plan-workflows/prd/data/prd-purpose.md`
> - BMad PRD workflow: `_bmad/bmm/workflows/2-plan-workflows/prd/workflow.md`

---

## 1. YAML Frontmatter

Every PRD starts with a YAML frontmatter. Used by BMad workflows for state tracking.

```yaml
---
stepsCompleted: ['step-01-init', 'step-02-discovery', ...]
documentStatus: 'draft' | 'review' | 'final'
version: '1.0'
inputDocuments: ['user-provided-draft: document description']
workflowType: 'prd'
documentCounts:
  briefs: 0
  research: 0
  projectDocs: 0
  userProvided: 1
classification:
  projectType: 'cross-platform-app'  # cross-platform-app | web-app | api-service | ...
  domain: 'edtech'                    # project domain
  complexity: 'low' | 'medium' | 'high'
  projectContext: 'brownfield'        # fixed value (existing service extension)
partyModeInsights:
  ux:
    - 'UX perspective insight'
  architecture:
    - 'Architecture perspective insight'
  business:
    - 'Business perspective insight'
  qa:
    - 'QA perspective insight (edge cases)'
# Feature-specific additional metadata (optional)
projectInfo:
  name: '{project name}'
  # Domain-specific numbers for the feature
mvpConfig:
  # MVP scope settings
---
```

### Required Fields

| Field | Purpose |
|-------|---------|
| `stepsCompleted` | BMad workflow progress tracking |
| `documentStatus` | Document status (draft → review → final) |
| `version` | Document version |
| `classification` | Project classification (domain: 'edtech', projectContext: 'brownfield' fixed) |
| `partyModeInsights` | Multi-perspective insights from Party Mode |

### Optional Fields

| Field | Purpose |
|-------|---------|
| `projectInfo` | Domain-specific numbers for the feature (user count, tutor count, etc.) |
| `mvpConfig` | Key settings determining MVP scope |
| `projectScope` | Feature scope settings (e.g., reservation period +2 days, max 5 slots) |

---

## 2. Document Header

```markdown
# Product Requirements Document - {Feature Name}

**Author:** {team_name}
**Date:** YYYY-MM-DD
**Version:** X.Y
**Status:** Draft | Review | Final
```

---

## 3. Section Structure

### Required Sections (in order)

| # | Section | Core Content |
|---|---------|-------------|
| 1 | Brownfield Sources | List of referenced brownfield sources (MCP servers, Input Documents) and findings from each |
| 2 | Executive Summary | Product, feature, core value, target scale, goal metrics |
| 3 | Success Criteria | User/Business/Technical Success + Measurable Outcomes |
| 4 | Product Scope | MVP (P0/P1), Growth Phase, Vision |
| 5 | User Journeys | Persona-based scenarios (Happy Path + Edge Cases) |
| 6 | Domain-Specific Requirements | Privacy, data policies, domain rules |
| 7 | Technical Requirements | Tech stack, API design, component structure |
| 8 | Functional Requirements | Functional requirements (FR numbering system) |
| 9 | Non-Functional Requirements | Performance, security, reliability, integration |
| 10 | QA Considerations | Edge cases, test scenarios |

### Optional Sections

| Section | Condition |
|---------|-----------|
| Event Tracking | Features requiring event logging/analytics |
| Project Scoping & Phased Development | Complex multi-phase development plans |
| Innovation Analysis | Competitive differentiation analysis needed |

---

## 4. Per-Section Writing Rules

### 4.1 Executive Summary

**Purpose:** Convey the essence of the feature within one page.

**Required elements:**
- Product name, feature name, core value (one sentence)
- Summary table: target scale, MVP scope, platform, dev resources, estimated timeline
- Goal metrics table: metric, current value, target value

```markdown
## Executive Summary

**Product:** {project name} - {description}
**Feature:** {feature name}
**Core Value:** "{one-sentence core value}"

### Summary

| Item | Details |
|------|---------|
| **Target Scale** | ... |
| **MVP Scope** | ... |
| **Platform** | Web + iOS + Android |
| **Dev Resources** | N people |
| **Estimated Timeline** | N weeks |

### Goal Metrics

| Metric | Current | Target |
|--------|---------|--------|
| ... | ... | ... |
```

### 4.2 Success Criteria

**Purpose:** Define success quantitatively.

**Required structure:**
- **User Success**: Success criteria from the user's perspective
- **Business Success**: Success criteria from the business perspective
- **Technical Success**: Technical success criteria (performance, consistency)
- **Measurable Outcomes**: Table format (metric, current, target, measurement method)

```markdown
## Success Criteria

### User Success
- Achieve **N% re-enrollment rate** after feature use (baseline X% → +Y%p)
- ...

### Business Success
- Within N months of launch, **M% of active users use the feature at least once**
- ...

### Technical Success
- {key technical metric} **< Nms** ({measurement method})
- ...

### Measurable Outcomes

| Metric | Current | Target | Measurement Method |
|--------|---------|--------|--------------------|
| ... | ... | ... | ... |
```

**Rules:**
- All metrics must be quantifiable
- Measurement method must be specified
- No vague expressions like "improve" or "enhance" → use specific numbers

### 4.3 Product Scope

**Purpose:** Clarify what will be built and what will not.

**Required structure:**
- **MVP**: P0 (core), P1 (important) priority distinction. Table format.
- **Growth**: Goals and feature list per phase
- **Vision**: Long-term direction

```markdown
## Product Scope

### MVP - Initial Release

| Feature | Description | Priority |
|---------|-------------|----------|
| ... | ... | P0 |
| ... | ... | P1 |

### Growth Phase 1: {goal} (MVP+N weeks)

**Goal:** {measurable goal}

| Feature | Description | Priority |
|---------|-------------|----------|
| ... | ... | P0 |

### Vision (Future)

| Feature | Direction |
|---------|-----------|
| ... | ... |
```

**Rules:**
- P0/P1 distinction must be clear
- Each Growth Phase must have a measurable goal
- Already-completed items marked with `**Done**`
- When leveraging existing systems, use `> **Existing system:** ` block

### 4.4 User Journeys

**Purpose:** Visualize the feature through the user's actual experience.

**Format:** Storytelling (Opening Scene → Rising Action → Climax → Resolution)

```markdown
### Journey N: {name} - {scenario description} ({type})

**Persona:** {name} ({age}, {occupation/situation})

**Opening Scene:**
{user's situation and motivation}

**Rising Action:**
{interaction process with the feature}

**Climax:**
{key interaction moment}

**Resolution:**
{outcome and change in user's feelings/behavior}
```

**Required journeys:**
1. **Happy Path** (1+ minimum) — ideal success scenario
2. **Edge Case** (1+ minimum) — exception handling
3. **Post-MVP** (optional) — if Growth features exist

**Requirements Summary table required at journey end:**

```markdown
### Journey Requirements Summary

| Journey | Required Features |
|---------|-------------------|
| {name} (Happy Path) | Feature1, Feature2, ... |
| {name} (Edge Case) | Feature3, Feature4, ... |
```

**Rules:**
- Use concrete personas with specific age, occupation, and situation
- **Bold** UI elements and user actions
- Use quotes to express user's inner thoughts
- Naturally reveal required FRs within each Journey

### 4.5 Domain-Specific Requirements

**Purpose:** Define policies and rules specific to the project domain.

**Common domain considerations:**
- Privacy and data policies (data ownership, handling on account deletion, retention periods)
- Tutor protection policies (if applicable)
- Technical constraints (GDPR, etc.)
- Consistency with existing domain policies (Brownfield)

### 4.6 Technical Requirements

**Purpose:** Provide information needed for technical implementation.

**Required elements:**
- Tech stack status table (current state + notes)
- API requirements: existing API usage list + new API table
- Component structure: expected component hierarchy in tree format
- Platform-specific differences

```markdown
### Tech Stack Status

| Item | Current | Notes |
|------|---------|-------|
| **Frontend** | React | ... |
| **Platform** | Web-based app | ... |

### API Requirements

**Existing API Usage:**
- {API name} - {description}

**New APIs Needed:**

| API | Description | Priority |
|-----|-------------|----------|
| ... | ... | P0/P1 |

### Component Structure (Expected)

{tree structure showing component hierarchy}
```

**Brownfield rules:**
- List existing APIs first, then separate new APIs
- Specify integration points with existing systems (`> **Existing API:** ` format)
- New APIs must include priority (P0/P1)

### 4.7 Functional Requirements

**Purpose:** Define the exact contract of features to be implemented.

**Numbering system:** `FR{number}` — sequential numbers. Grouped by domain.

```markdown
## Functional Requirements

### {Domain Group Name}

- **FR1:** {subject} can {capability}
- **FR2:** The system can {capability}
```

**Writing patterns:**
- `{subject} can {capability}` — capability-centric expression
- Subjects: "Student", "System", "Operations team", "CS team", etc.
- Sub-items use `FR{number}-{sub}` (e.g., FR4-1, FR38-5)
- Special groups use `FR-{prefix}{number}` (e.g., FR-LP1)

**BMad PRD Philosophy — FR Quality Criteria:**

| Criterion | Description | Example |
|-----------|-------------|---------|
| **Specific** | Clear and concrete | "Student can preview level-specific textbooks" |
| **Measurable** | Testable | "Display 4 recommended time slots in earliest-first order" |
| **No Implementation** | No implementation leakage | No: "Cache in Redis" → Yes: "Can be retrieved quickly (cached)" |
| **No Subjective** | No subjective adjectives | No: "fast" → Yes: "< 500ms" |

**Anti-Patterns:**
- No: "The system allows users to easily use" → subjective
- No: "The system stores JWT tokens in Redis" → implementation leakage
- No: "Fast response" → separate as NFR with specific numbers

### 4.8 Non-Functional Requirements

**Purpose:** Define system quality attributes quantitatively.

**Required categories:**

| Category | Contents |
|----------|----------|
| Performance | API response time, load time (p95 basis) |
| Reliability | Availability, concurrency handling, data consistency |
| Integration | Compatibility with existing systems, backward compatibility |
| Security | Authentication, authorization, data protection (if applicable) |
| Error Handling | Common error handling policies (if applicable) |

**Table format:**

```markdown
### Performance

| NFR | Requirement | Measurement Method |
|-----|-------------|-------------------|
| NFR1 | {requirement} < {value} ({percentile}) | {measurement method} |
```

**BMad PRD Philosophy — NFR Quality Criteria:**
- All NFRs must have numeric targets + measurement method
- No: "The system should be scalable" → Yes: "Handle 10x load increase via horizontal scaling"
- No: "High availability" → Yes: "99.5% uptime"

### 4.9 QA Considerations

**Purpose:** Define edge cases and scenarios to consider during testing.

**Table format:**

```markdown
### {Test Group Name} ({priority})

| Case | Scenario | Expected Handling |
|------|----------|-------------------|
| ... | ... | ... |
```

**Rules:**
- Group by priority (P0/P1)
- Visualize UX policies with flowcharts when applicable
- Specify regression test points

---

## 5. Brownfield Writing Principles

For brownfield projects (extending live services), every PRD must clarify the relationship with the existing system.

### 5.1 Existing System Reference Notation

```markdown
> **Existing system:** {what existing feature is used and how}
```

```markdown
> **Existing API:** {existing API name and usage}
```

### 5.2 Existing vs New Distinction

- Separate "Existing API Usage" / "New APIs Needed" in API design
- Tag `(existing)` / `(new)` / `(existing + extension)` in component structure
- Mark already-completed features with `**Done**`

### 5.3 MCP Data Usage

When writing PRDs, query existing system information from these MCPs:

| MCP | What to Check |
|-----|---------------|
| `backend-docs` | Existing APIs, domain policies, data models |
| `client-docs` | Existing components, screen flows, code patterns |
| `svc-map` | Existing customer journeys, screen flows |
| `figma` | Latest design mockups |

### 5.4 Brownfield Sources Section (required)

Include a `## Brownfield Sources` section at the top of the PRD (below document header, above Executive Summary). Record which sources were referenced and what brownfield information was found, for traceability.

**Required structure:**

```markdown
## Brownfield Sources

This PRD incorporates brownfield context gathered from the following sources.

### MCP Servers

| MCP Server | Purpose | Findings |
|------------|---------|----------|
| svc-map | Service map | {findings: Screen IDs, flows, etc.} |
| figma | Design data | {findings: Node IDs, design patterns, etc.} |
| backend-docs | Backend policies | {findings: APIs, domain logic, etc.} |
| client-docs | Client UI/UX | {findings: components, patterns, etc.} |

### Input Documents

| Document | Key Brownfield Information |
|----------|---------------------------|
| {document name} | {existing system info found in this document} |

### PRD Brownfield Notation

- `(existing)` / `(new)` / `(existing + extension)` tagging: distinguish existing vs new in component trees
- `> **Existing system:** ` blocks: specify existing system usage points
```

**Writing rules:**
- If MCP query returned no results, state "Not applicable" or "No results found" (do not delete the row)
- Include specific references like Screen IDs, Node IDs to enable later verification
- Only record existing system information from Input Documents (exclude new requirements)
- This section summarizes L1+L2 layers of `{planning_artifacts}/brownfield-context.md`. For detailed brownfield data (API lists, component paths, service integration points), refer to brownfield-context.md

---

## 6. Information Density

Core BMad PRD philosophy: **Every sentence must carry information weight.**

### Anti-Patterns (remove)

| Wrong Expression | Correct Expression |
|-----------------|-------------------|
| "The system allows users to ~" | "Users can ~" |
| "An important point is ~" | State the fact directly |
| "In order to ~" | State directly |
| Conversational filler words | Direct, concise statements |

### Goals
- Maximum information per word
- Zero false decoration
- Precise, testable language

---

## 7. Traceability Chain

Maintain the following traceability within the PRD:

```
Vision → Success Criteria → User Journeys → Functional Requirements
```

- Every FR must be derivable from a specific User Journey
- Every Success Criteria must be measurable via Measurable Outcomes
- User Journey Requirements Summary must map to FRs

---

## 8. File Storage Location

All PRDs are stored in per-project directories:

```
specs/{feature}/planning-artifacts/prd.md
```

Both Auto Sprint and `/specs` generate the final PRD at this path.

Legacy PRDs (version history, etc.) are stored in `specs/{feature}/raw/`:
- `specs/{feature}/raw/{feature}-prd-v1.md`

---

## 9. Checklist (Self-Review)

Verify the following after PRD completion:

- [ ] YAML frontmatter `classification` has `domain: 'edtech'`, `projectContext: 'brownfield'`
- [ ] `partyModeInsights` includes at least 1 insight each for ux, architecture, business, qa
- [ ] **Brownfield Sources section** exists below document header, above Executive Summary (MCP server findings + Input Documents)
- [ ] Executive Summary has summary table + goal metrics table
- [ ] Success Criteria has Measurable Outcomes table (metric, current, target, measurement method)
- [ ] Product Scope has P0/P1 distinction + Growth Phase + Vision
- [ ] User Journeys has 1+ Happy Path + 1+ Edge Case + Requirements Summary
- [ ] Existing system/new distinction is specified in APIs and components
- [ ] All FRs are in capability form ("can ~")
- [ ] No FRs contain subjective adjectives (fast, easy, intuitive, etc.)
- [ ] All NFRs have numeric targets + measurement method
- [ ] QA Considerations has edge case table
- [ ] Brownfield notation present (`**Existing system:**`, existing/new distinction)
