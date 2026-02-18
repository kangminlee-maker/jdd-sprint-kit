# Contributing to JDD Sprint Kit

Thank you for your interest in contributing to JDD Sprint Kit!

## Understanding the Project

Before diving into code, read the **[Blueprint](docs/blueprint.md)** — it's the single document that explains what this product does, why it exists, and how everything fits together. Written for non-developers, it covers the full picture from problem definition (S1) through current state and known gaps (S8).

Key sections for contributors:
- **S4 Value Chain** — how the Sprint pipeline works end-to-end
- **S6.3 Left Open** — deferred design decisions open for contribution
- **S8.3 Unvalidated Hypotheses** — areas needing real-world validation
- **S8.4 Known Gaps** — known limitations

Design philosophy: [Judgment-Driven Development](docs/judgment-driven-development.md)

## Getting Started

### Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI
- Node.js 18+
- Git, GitHub CLI (`gh`)
- [BMad Method](https://github.com/nicholasgriffintn/bmad-method)

### Setup

```bash
git clone https://github.com/kangminlee-maker/jdd-sprint-kit.git
cd jdd-sprint-kit
npm install
npx bmad-method install
```

## How to Contribute

### Reporting Issues

- Use the [Bug Report](.github/ISSUE_TEMPLATE/bug-report.md) or [Feature Request](.github/ISSUE_TEMPLATE/feature-request.md) templates
- Include reproduction steps for bugs
- For Sprint pipeline issues, include `specs/{feature}/sprint-log.md` if available

### Pull Requests

1. Create a branch from `main`
2. Make your changes
3. Verify no unintended Korean residue in service code: `grep -rP '[가-힣]'` on changed files
   (Korean in `docs/terminology-map.md` Korean column and Sprint test outputs is expected)
4. Open a PR using the provided template

## Project Structure

```
.claude/rules/     — Sprint Kit rules (loaded by Claude Code)
.claude/agents/    — Agent definitions
.claude/commands/  — Slash commands (/sprint, /specs, /preview, etc.)
_bmad/             — BMad Method base platform (upstream, do not modify)
docs/              — Product docs (Blueprint, JDD, Terminology Map)
src/               — CLI source code
```

## Conventions

### Language

- **Service code** (rules, agents, commands, format guides): English-first
- **Runtime output**: Adapts to `communication_language` in config.yaml
- **Terminology**: Use canonical English terms from [`docs/terminology-map.md`](docs/terminology-map.md)
- **Never translate**: YAML field names, enum values, file paths, agent persona names (full list in terminology-map.md)

### Commits

- Use conventional commit prefixes: `feat:`, `fix:`, `docs:`, `chore:`
- Keep commits focused (one logical change per commit)

### Blueprint Updates

When your change affects customer-visible behavior, update `docs/blueprint.md`. See **Appendix D: Blueprint Sync Criteria** in the Blueprint for guidance.

## Questions?

Open an [issue](https://github.com/kangminlee-maker/jdd-sprint-kit/issues) or start a [discussion](https://github.com/kangminlee-maker/jdd-sprint-kit/discussions).
