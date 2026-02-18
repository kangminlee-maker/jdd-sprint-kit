# MCP Search Protocol

## Project MCP Server Configuration

This project can reference existing service backend, client, and design data through MCP servers.

### MCP Server Setup

Create a `.mcp.json` file at the project root to configure MCP servers. See `.mcp.json.example` for reference.

MCP server roles used in Sprint:

| Role              | Purpose                                                     | Agent Reference Name |
| ----------------- | ----------------------------------------------------------- | -------------------- |
| **backend-docs**  | Backend domain policies, API specs, business logic          | `backend-docs MCP`   |
| **client-docs**   | Client UI/UX, screen flows, component structure             | `client-docs MCP`    |
| **svc-map**       | Brownfield service map: customer journeys, screenshots, flow data | `svc-map MCP`  |
| **figma**         | Figma live design data: wireframes, components, design tokens | `figma MCP`        |

> - The `figma` MCP server uses OAuth authentication. Add via `claude mcp add --transport http figma https://mcp.figma.com/mcp`, then authenticate at `/mcp`.
> - When `svc-map` and `figma` data conflict, prefer `figma` (more recent).

### Search Strategy

When answering domain-related questions, **always search from multiple perspectives and provide an integrated answer**.

#### Search Order

1. **Classify question**: Determine if it concerns client / backend / design / multiple areas
2. **Multi-search**: Search relevant MCP servers in parallel when possible
3. **Integrated answer**: Distinguish backend, client, and design perspectives in the response

#### Search Criteria by Perspective

| Keywords/Topics                                            | Search Target                         |
| ---------------------------------------------------------- | ------------------------------------- |
| API, endpoints, data models, business logic, auth, permissions | backend-docs MCP                   |
| UI code, component implementation, state management, code structure | client-docs MCP                |
| Customer journeys, screen flows, service maps, screenshots | svc-map MCP                           |
| Wireframes, design mockups, layouts, design tokens, styles | figma MCP                             |
| Full feature, domain policies, service flows               | **backend + client + svc-map + Figma** |

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

In co-located topologies (monolith, MSA, monorepo), the local codebase can be searched directly.

### Local Search Tool Mapping

| MCP Action     | Local Equivalent | Purpose                            |
|----------------|------------------|------------------------------------|
| MCP index read | **Glob**         | Directory structure, file patterns |
| MCP search     | **Grep**         | Code keyword and pattern search    |
| MCP file read  | **Read**         | Full file content reading          |

### Search Priority (co-located)

When the same information is found in multiple sources within a co-located topology:

1. **Local codebase** (most accurate — actual code)
2. **document-project artifacts** (structured documentation)
3. **MCP servers** (external reference)

### Excluded Paths

Always exclude the following paths from local searches:

```
node_modules/    .git/         dist/        build/
vendor/          target/       __pycache__/  coverage/
.next/           .nuxt/        out/          .cache/
```
