---
description: "VALIDATE 반복 실패 시 체계적 방향 전환"
---

# /circuit-breaker — Course Correction

> **Dispatch Target**: Conditional — Auto Sprint → Phase 1 재실행 / Non-Auto → `/bmad/bmm/workflows/correct-course`

## Purpose

VALIDATE 실패가 반복되거나 중대한 문제가 발견되었을 때 체계적으로 방향을 전환한다.

## When to Use

### 자동 발동
- 동일 카테고리 3회 연속 VALIDATE 실패
- 5회 누적 VALIDATE 실패
- 아키텍처 레벨 설계 결함 발견

### 수동 발동
- 사용자 또는 에이전트가 `/circuit-breaker` 실행

`$ARGUMENTS`: 사용하지 않음

## Procedure

### Step 1: 실패 컨텍스트 요약 (Context Compaction)
현재까지의 작업 상태를 요약하고 `specs/{feature}/planning-artifacts/circuit-breaker-log.md`에 append:
```markdown
## Circuit Breaker Context — {timestamp}

### 시도한 것
- [어떤 접근을 시도했는가]

### 실패 원인
- [왜 실패했는가]

### 부분 성공
- [어떤 부분이 성공적이었는가]

### 학습
- [이번 시도에서 배운 것]
```

재실행 시 이 파일을 해당 단계 에이전트에 입력으로 전달:
"이전 시도에서 다음 문제가 발견되었다: {circuit-breaker-log.md 참조}"

### Step 2: 심각도 판단

Judge 또는 Scope Gate 결과의 `failure_source`를 참조하여 심각도를 판단한다:

**경미한 문제 (Execute 내부 해결) — `failure_source: local`:**
- 특정 태스크 구현 난항
- 테스트 실패 반복
- 코드 품질 미달

→ Spec 수정 → Execute 재실행

**중대한 문제 (설계 수준) — `failure_source: upstream:{stage}`:**
- 아키텍처 레벨 설계 결함 (`upstream:architecture`)
- PRD 요구사항 자체의 모순 (`upstream:prd`)
- 기술 스택 변경 필요 (`upstream:architecture`)

→ Auto Sprint: 원인 단계({stage})부터 재실행 (실패 학습 반영)
→ Non-Auto Sprint: BMad '/bmad/bmm/workflows/correct-course' 실행

**failure_source가 없는 경우**: 기존 분류 기준(구현 난항=경미, 설계 결함=중대)으로 판단

### Step 3: 코드 폐기 (Disposable Code)
```
보존:                        폐기:
─────                        ─────
BMad PRD                     모든 생성 코드
BMad Architecture + ADR      워크트리
BMad Epic/Story              빌드 산출물
specs/ (수정 후)
brownfield-context.md
실패 학습 컨텍스트
```

### Step 4: 복귀

**경미 → Execute 재실행:**
1. 실패 학습 컨텍스트를 Spec에 반영
2. 수정된 Spec으로 Execute (PARALLEL → VALIDATE) 재실행

**중대 → 설계 단계 복귀:**

Auto Sprint 모드:
1. 실패 학습 컨텍스트를 Phase 1에 전달
2. Auto Sprint Phase 1 재실행 (실패 학습 반영)

Non-Auto Sprint 모드:
1. 실패 컨텍스트 요약을 사용자에게 제시 (Step 1 결과)
2. 사용자에게 선택지 제공:
   a) `/bmad/bmm/workflows/correct-course` (BMad 대화형 수정)
      → 실패 컨텍스트(`circuit-breaker-log.md`)를 워크플로우 시작 시 입력으로 전달
      → 변경 범위 분석 → PRD/Architecture 영향도 평가 → BMad 산출물 업데이트
   b) Planning Artifacts 직접 수정 → `/specs` 재실행
   c) 중단

## Constraints
코드가 아닌 스펙이 자산이므로, Circuit Breaker 발동 시 실질적 손실이 최소화된다.
코드를 전량 폐기해도 스펙이 보존되므로 재구현 비용이 낮다.
