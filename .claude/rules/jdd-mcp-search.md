# MCP Search Protocol

## Project External Data Configuration

This project can reference existing service backend, client, and design data through external sources.

### Access Methods

Two methods exist for accessing external repositories. Choose based on whether you have a local clone.

#### Method 1: `--add-dir` (Recommended for local clones)

When external repositories are cloned locally, add them via `--add-dir` flag when launching Claude Code:

```bash
claude --add-dir /path/to/backend-docs --add-dir /path/to/client-docs --add-dir /path/to/svc-map
```

Directories added via `--add-dir` are accessible with Glob, Grep, and Read — the same tools used for the project's own codebase. No MCP server configuration is needed.

**Why this is recommended**: Direct filesystem access is faster, more reliable, and avoids MCP server path restrictions. Use this whenever a local clone exists.

#### Method 2: MCP Servers (for services without local clones)

For data sources that cannot be cloned locally (e.g., Figma live design data), configure MCP servers in `.mcp.json`. See `.mcp.json.example` for reference.

> **Do not use filesystem MCP servers for local clones.** Claude Code's MCP security restricts filesystem MCP servers to the project root directory. Use `--add-dir` instead.

#### Method 3: GitHub Repo Snapshot (원격 repo, clone 없이)

brief.md의 `## 참고 소스` 섹션에 GitHub repo URL을 선언하거나, inputs/ 파일에 URL을 포함하면 Sprint 시작 시 자동으로 읽기 전용 스냅샷을 다운로드합니다.
clone이 아닙니다 — git history 없이 현재 파일만 다운로드하여 temp 디렉토리에 추출합니다.
Scanner는 추출된 파일에 Glob/Grep/Read로 접근합니다 (--add-dir와 동일한 방식).
GitHub URL만 지원됩니다. GitLab/Bitbucket은 --add-dir를 사용하세요.

### External Data Source Roles

These roles apply regardless of access method (`--add-dir` or MCP):

| Role              | Purpose                                                     | Access Method |
| ----------------- | ----------------------------------------------------------- | ------------- |
| **backend-docs**  | Backend domain policies, API specs, business logic          | `--add-dir` (local clone) |
| **client-docs**   | Client UI/UX, screen flows, component structure             | `--add-dir` (local clone) |
| **svc-map**       | Brownfield service map: customer journeys, screenshots, flow data | `--add-dir` (local clone) |
| **figma**         | Figma live design data: wireframes, components, design tokens | MCP server (OAuth) |

> - The `figma` MCP server uses OAuth authentication. Add via `claude mcp add --transport http figma https://mcp.figma.com/mcp`, then authenticate at `/mcp`.
> - When `svc-map` and `figma` data conflict, prefer `figma` (more recent).

### Search Strategy

When answering domain-related questions, **always search from multiple perspectives and provide an integrated answer**.

#### Search Order

1. **Classify question**: Determine if it concerns client / backend / design / multiple areas
2. **Multi-search**: Search relevant sources (--add-dir directories, MCP servers) in parallel when possible
3. **Integrated answer**: Distinguish backend, client, and design perspectives in the response

#### Search Criteria by Perspective

| Keywords/Topics                                            | Search Target                         |
| ---------------------------------------------------------- | ------------------------------------- |
| API, endpoints, data models, business logic, auth, permissions | backend-docs (--add-dir or MCP)  |
| UI code, component implementation, state management, code structure | client-docs (--add-dir or MCP) |
| Customer journeys, screen flows, service maps, screenshots | svc-map (--add-dir or MCP)            |
| Wireframes, design mockups, layouts, design tokens, styles | figma MCP                             |
| Full feature, domain policies, service flows               | **all sources**                       |

#### Tool Selection by Access Method

| Access Method | Index/Structure | Content Search | Full Read |
|---------------|----------------|----------------|-----------|
| `--add-dir` directory | **Glob** | **Grep** | **Read** |
| MCP server | MCP list/index tools | MCP search tools | MCP read tools |

### Response Format

Use the following format when answering domain-related questions:

```
## [Topic]

### Backend Perspective
- API endpoints: ...
- Business logic: ...
- Data models: ...

### Client Perspective
- Screen flows: ...
- State management: ...
- UI components: ...

### Design Perspective
- Wireframes/mockups: ...
- Design tokens: ...
- Component specs: ...

### Integrated Summary
[Explain how backend, client, and design connect]
```

## Local Codebase Search Protocol

In co-located topologies (monolith, MSA, monorepo), the local codebase and `--add-dir` directories can be searched directly.

### Local Search Tool Mapping

All local paths — project codebase and `--add-dir` directories — use the same tools:

| MCP Action     | Local Equivalent | Purpose                            |
|----------------|------------------|------------------------------------|
| MCP index read | **Glob**         | Directory structure, file patterns |
| MCP search     | **Grep**         | Code keyword and pattern search    |
| MCP file read  | **Read**         | Full file content reading          |

### Search Priority (co-located)

When the same information is found in multiple sources within a co-located topology:

1. **Local codebase** (most accurate — actual code)
2. **`--add-dir` external repos** (local clones of external services)
3. **tarball-snapshot** (읽기 전용 스냅샷, 시점 고정)
4. **document-project artifacts** (structured documentation)
5. **MCP servers** (external reference — Figma, etc.)

### Excluded Paths

Always exclude the following paths from local searches:

```
node_modules/    .git/         dist/        build/
vendor/          target/       __pycache__/  coverage/
.next/           .nuxt/        out/          .cache/
```
