# Project Patterns — JDD Sprint Kit

## File & Directory Naming

<!-- auto:naming -->
- Directories: `kebab-case/`
- Files: `kebab-case` (e.g., `compat-check.js`, `sprint-input.md`)
<!-- /auto:naming -->
- Artifact filenames: fixed names (`prd.md`, `tasks.md`, `tech-spec.md`). Never rename.
- Config: `sprint-kit.config.yaml`, `brownfield-manifest.yaml`

## YAML Conventions
- Sprint Kit configs: `snake_case` keys
- BMad artifacts: `camelCase` keys
- Never mix conventions within one file.

## Artifact Three-Layer Structure
```
planning-artifacts/          # AI working drafts (regenerable)
├── prd.md
├── tech-spec.md
└── ...
specs/                       # JP1-approved top-level specs
├── prd.md                   # promoted from planning-artifacts
└── ...
reconciled/                  # post-JP2 crystallized specs (delta-applied)
└── ...
```
Promotion: `planning-artifacts/ → specs/` at JP1. `specs/ → reconciled/` at JP2.

## Language Protocol
- All files on `main`: English.
- YAML keys, enum values, file paths: always English regardless of `locale` config.
- User-facing string values: follow `locale` setting.
- Comments in code: English.

## Terminology Boundaries
| Term | Usage | NOT |
|------|-------|-----|
| Crystallize | process name ("Crystallize phase") | verb for general conversion |
| Translate | verb ("translate user grammar to dev grammar") | process/phase name |
| Reconcile | internal step within Crystallize | user-facing term |
| Delta | the scoped change set | generic "diff" |
| Brownfield | existing system context | "legacy" or "current" |
| Judgment Point | JP1/JP2 decision gates | "review" or "approval" |

## Abbreviation Registry
`JP` (Judgment Point), `DDD` (Delta-Driven Design), `PRD`, `BMad`, `QA`
No other abbreviations without adding to this registry.

## Branch Rule

<!-- auto:branch -->
`main` = always deployable. All work on feature branches.
<!-- /auto:branch -->
