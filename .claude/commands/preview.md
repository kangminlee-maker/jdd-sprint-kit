---
description: "Specs에서 Full-stack Deliverables 생성 (OpenAPI, DBML, BDD, Prototype)"
---

# /preview — Deliverables Generation

> **Dispatch Target**: `@deliverable-generator` (deliverables-only)

## Purpose

Specs 4-file에서 Full-stack Deliverables(OpenAPI, DBML, BDD, Prototype 등)를 생성한다.

## When to Use

Specs 4-file 생성이 완료된 후. `/specs` 다음 단계.

## Inputs

`$ARGUMENTS`: 사용하지 않음

선행 파일 (`specs/{feature}/` 디렉토리):
- `requirements.md`
- `design.md`
- `tasks.md`
- `brownfield-context.md`

## Procedure

### Step 1: Specs 확인

1. `specs/` 하위에서 feature 디렉토리 탐색
2. Specs 4-file 존재 확인 (requirements.md, design.md, tasks.md, brownfield-context.md)
3. `specs/{feature}/planning-artifacts/` 존재 확인 (Entity Dictionary 재구축용)
4. 없으면 사용자에게 `/specs` 선행 실행을 안내

### Step 2: Deliverables 생성

`@deliverable-generator`를 deliverables-only 모드로 호출한다:

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "You are @deliverable-generator. Read and follow your agent definition at .claude/agents/deliverable-generator.md.
    Generate deliverables in deliverables-only mode.
    planning_artifacts: specs/{feature}/planning-artifacts/
    feature_name: {feature-name}
    output_base: specs/
    preview_template: preview-template/
    mode: deliverables-only"
```

이 모드에서는 기존 Specs 4-file을 읽고 Stage 3-10을 실행:
- OpenAPI 3.1 YAML (API 계약)
- API Sequence Diagrams (Mermaid)
- DBML Schema (데이터베이스)
- BDD/Gherkin Scenarios (수용 테스트)
- XState State Machines (해당 시에만)
- Decision Log (ADR)
- Traceability Matrix (추적)
- React Prototype + MSW Mock API

### Step 3: 결과물 확인

생성된 Sprint Output Package를 사용자에게 보여주고 확인을 받는다:

- **승인** → `/parallel` 실행 (병렬 구현)
- **피드백 (Deliverables)** → Step 2 재실행 (Specs 보존)
- **피드백 (설계)** → `/specs` 재실행 (Planning Artifacts 수정)
- **중단** → 종료

## Outputs
- `specs/{feature-name}/api-spec.yaml`
- `specs/{feature-name}/api-sequences.md`
- `specs/{feature-name}/schema.dbml`
- `specs/{feature-name}/bdd-scenarios/`
- `specs/{feature-name}/decision-log.md`
- `specs/{feature-name}/traceability-matrix.md`
- `specs/{feature-name}/preview/` (React + MSW)

## Constraints
1. **Disposable Preview**: 프리뷰 코드는 프로덕션과 완전 분리. 절대 프로덕션으로 이관하지 않는다
2. **Specs 우선**: 프리뷰에서 발견한 문제는 코드가 아닌 스펙을 수정하여 해결
3. **OpenAPI as Single Source of Truth**: API 타입, Mock 서버, 문서 모두 하나의 spec에서 파생
4. **Entity Dictionary 일관성**: 모든 산출물의 명명은 Entity Dictionary를 따른다
