---
description: "Specs로부터 풀스택 Deliverables 생성 (OpenAPI, DBML, BDD, Prototype)"
---

# /preview — Deliverables 생성

> **디스패치 대상**: `@deliverable-generator` (deliverables-only)

## 목적

Specs 4-file로부터 풀스택 Deliverables (OpenAPI, DBML, BDD, Prototype 등)를 생성합니다.

## 사용 시점

Specs 4-file 생성이 완료된 이후. `/specs` 다음 단계입니다.

## 입력

`$ARGUMENTS`: 사용하지 않음

필수 파일 (`specs/{feature}/` 디렉토리 내):
- `requirements.md`
- `design.md`
- `tasks.md`
- `brownfield-context.md`

## 절차

jdd-sprint-guide.md의 Language Protocol에 따라 config를 로드합니다.

### Step 1: Specs 검증

1. `specs/` 하위에서 feature 디렉토리를 탐색합니다
2. Specs 4-file 존재 여부 확인 (requirements.md, design.md, tasks.md, brownfield-context.md)
3. `specs/{feature}/planning-artifacts/` 존재 여부 확인 (Entity Dictionary 재구성용)
4. 누락된 경우, 먼저 `/specs` 실행을 안내합니다 ({communication_language}로)

### Step 2: Deliverables 생성

`@deliverable-generator`를 deliverables-only 모드로 호출합니다:

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

이 모드는 기존 Specs 4-file을 읽고 Stage 3~10을 실행합니다:
- OpenAPI 3.1 YAML (API 계약)
- API Sequence Diagrams (Mermaid)
- DBML Schema (데이터베이스)
- BDD/Gherkin Scenarios (인수 테스트)
- XState State Machines (해당되는 경우)
- Decision Log (ADR)
- Traceability Matrix (추적)
- React Prototype + MSW Mock API

### Step 3: 결과물 검토

`specs/{feature}/decision-diary.md`가 없으면 초기화합니다 (라우트 메타데이터 포함: `route: guided` 또는 `route: direct`).

생성된 Sprint Output Package를 사용자에게 검토용으로 제시합니다 ({communication_language}로):

| 옵션 | 레이블 | 설명 |
|------|--------|------|
| **A** | Approve & Build | 프로토타입 확정 → Crystallize (번역 + 델타 계산, 약 15~20분) → `/parallel` |
| **F1** | Feedback (Deliverables) | Step 2 재실행 (Specs 유지) |
| **F2** | Feedback (설계) | `/specs` 재실행 (기획 산출물 수정) |
| **X** | Abort | 종료 (산출물 보존) |

**피드백 시 (F1/F2)**: 재실행 전에 `specs/{feature}/decision-diary.md` Decisions 테이블에 피드백을 기록합니다 (Type, Content, Processing, Result).

**[A] Approve & Build 선택 시**: decision-diary.md에 선택 내용 기록 → `/crystallize {feature}` 호출 → 완료 후 `specs_root=reconciled/`로 `/parallel` 진행.

**반복 제한**: F1/F2 선택 횟수 합산 최대 5회. 초과 시 경고 ({communication_language}로): "검토/수정 5라운드를 완료했습니다. [A] Approve & Build 또는 [X] Abort를 선택하세요."

## 출력물
- `specs/{feature-name}/api-spec.yaml`
- `specs/{feature-name}/api-sequences.md`
- `specs/{feature-name}/schema.dbml`
- `specs/{feature-name}/bdd-scenarios/`
- `specs/{feature-name}/decision-log.md`
- `specs/{feature-name}/traceability-matrix.md`
- `specs/{feature-name}/preview/` (React + MSW)

## 제약 사항
1. **일회용 Preview**: Preview 코드는 프로덕션과 완전히 격리됩니다. 프로덕션으로 마이그레이션하지 않습니다.
2. **Specs 우선**: Preview에서 발견된 문제는 코드가 아닌 Specs를 수정하여 해결합니다.
3. **OpenAPI를 단일 진실 공급원으로**: API 타입, Mock 서버, 문서 모두 하나의 spec에서 파생됩니다.
4. **Entity Dictionary 일관성**: 모든 산출물 명명은 Entity Dictionary를 따릅니다.
