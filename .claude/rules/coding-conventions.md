# Coding Conventions

Self-contained, explicit, linearly readable code.

## File Structure
- One concern = one file. Co-locate types, constants, logic.
- Acceptable duplication over fragile shared abstraction.
- Export only what's consumed externally.
- Soft limit: 300 lines. Split by concern, not category.

## Naming
Names eliminate the need for comments:
- Booleans: `is/has/should/can`
- Transforms: `to/from/parse`
- Validation: `validate/assert`
- Events: `handle/on`
- Factories: `create/build/make`
- Fetching: `fetch/load/get`
- Constants: `UPPER_SNAKE_CASE`
- Avoid: single-letter vars, `data`/`info`/`temp`/`obj`, abbreviations

## Functions
- Pure by default: inputs → outputs, no side effects.
- Separate computation (pure) from coordination (I/O).
- Max 40 lines, max 3 params (options object beyond that).
- Early returns over nested if/else.
- No nested ternaries.

## Errors
- Fail fast: validate at boundary, not deep inside.
- Never empty catch. Include context: what failed, which inputs, why.

## Control Flow
- Linear top-to-bottom. No implicit event chain ordering.
- Explicit parallel vs sequential async.

## Config as Data
- Business rules as data structures, not procedural branches.
- New option = data change, not logic change.

## Module Boundaries
```
[External] → [Boundary: parse/validate] → [Pure Logic] → [Boundary: persist/send]
```
Business logic never imports I/O directly. Pass deps as params.

## Comments & Tests
- Comments: WHY only. Workarounds: link to issue. Delete commented-out code.
- Tests: co-locate. Behavior names. AAA pattern. Mock I/O only.

<!-- auto:programming-language-rules -->
## JavaScript (ESM)
- Use `import`/`export` exclusively. No `require()`.
- `function` keyword for top-level named functions. Arrow for inline callbacks only.
- Prefer `const` over `let`. Never `var`.
- Use `node:` prefix for built-in modules (`node:fs`, `node:path`).
- Destructure imports at the top: `import { readFileSync } from 'node:fs'`.
- No default exports. Named exports only.
- Use optional chaining (`?.`) and nullish coalescing (`??`) over manual null checks.
- Template literals over string concatenation.
- Use `Error` subclasses with descriptive messages for domain errors.
- Async/await over raw Promises. No `.then()` chains.


## Python (scripts only)
- Type hints on all function params and returns.
- Use `pathlib` over `os.path`.
- Use `raise` with specific exception types.
- Docstrings: Google style.
- Imports: standard lib → third-party → local, separated by blank lines.
<!-- /auto:programming-language-rules -->

## Do NOT
- Nested ternaries
- Empty catch blocks
- Mixed I/O and business logic
- Commented-out code
- Magic numbers
- Mutate function params
