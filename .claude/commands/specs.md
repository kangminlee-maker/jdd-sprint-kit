---
description: "BMad 산출물에서 Specs 4-file 생성 (Brownfield L4 + Entity Dictionary)"
---

# /specs — Specs Generation

> **Dispatch Target**: `@brownfield-scanner` (L4) + `@deliverable-generator` (specs-only)

## Purpose

BMad 산출물에서 Specs 4-file을 생성한다.

## When to Use

BMad Phase 3 산출물이 준비되어 Implementation Readiness를 통과한 후.

## Inputs

`$ARGUMENTS`: 사용하지 않음

선행 파일:
- `specs/{feature}/planning-artifacts/prd.md` (또는 PRD 역할 문서)
- `specs/{feature}/planning-artifacts/architecture.md` (또는 아키텍처 문서)
- `specs/{feature}/planning-artifacts/epics*.md` (또는 에픽/스토리 문서)
- Implementation Readiness 통과 여부 확인

> **참고**: Guided Sprint에서 planning-artifacts가 다른 위치에 있다면, feature 디렉토리로 먼저 이동한다.

## Procedure

### Step 0: Feature 디렉토리 확인

1. feature name 결정 (kebab-case)
2. `specs/{feature}/planning-artifacts/` 디렉토리 확인
3. Planning artifacts가 다른 위치에 있다면 `specs/{feature}/planning-artifacts/`로 복사

### Step 1: Brownfield L4 Append

`@brownfield-scanner`를 targeted 모드로 호출하여 L4 (Code Layer)를 추가한다:

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "You are @brownfield-scanner. Read and follow your agent definition at .claude/agents/brownfield-scanner.md.
    Execute Targeted Scan (mode='targeted').
    Input files:
    - Architecture: specs/{feature}/planning-artifacts/architecture.md
    - Epics: specs/{feature}/planning-artifacts/epics-and-stories.md
    brownfield_path: specs/{feature}/planning-artifacts/brownfield-context.md
    Append L3 + L4 layers to existing file."
```

> Frozen snapshot 복사는 `@deliverable-generator` Stage 2에서 수행한다.

**기존 Brownfield 상태에 따른 동작**:

| 기존 상태 | 동작 |
|-----------|------|
| 없음 | 사용자에게 안내: Pass 1 (Broad Scan) 필요 |
| L1+L2만 | Targeted Scan으로 L3+L4 추가 |
| L1~L3 | Targeted Scan으로 L4만 추가 |
| L1~L4 | Frozen snapshot만 복사 (Targeted Scan 생략) |

### Step 2: Specs 생성

`@deliverable-generator`를 specs-only 모드로 호출한다:

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "You are @deliverable-generator. Read and follow your agent definition at .claude/agents/deliverable-generator.md.
    Generate specs in specs-only mode.
    planning_artifacts: specs/{feature}/planning-artifacts/
    feature_name: {feature-name}
    output_base: specs/
    mode: specs-only"
```

이 모드에서는 Entity Dictionary (Stage 1) + Specs 4-file (Stage 2)만 생성:
- Entity Dictionary로 명명 일관성 보장
- requirements.md (PRD → 요구사항)
- design.md (Architecture → 설계)
- tasks.md (Epics → 병렬 태스크 + Entropy + File Ownership)

### Step 3: 계획 출력

생성된 `tasks.md`를 사용자에게 보여주고 승인을 받는다.
승인 후 `/preview` (Deliverables 생성)로 진행한다.

## Outputs
- `specs/{feature-name}/brownfield-context.md`
- `specs/{feature-name}/requirements.md`
- `specs/{feature-name}/design.md`
- `specs/{feature-name}/tasks.md`
