---
description: "VALIDATE 반복 실패 시 체계적인 방향 전환"
---

# /circuit-breaker — 방향 전환

> **디스패치 대상**: 조건부 — Auto Sprint → Phase 1 재실행 / Non-Auto → `/bmad/bmm/workflows/correct-course`

## 목적

VALIDATE 실패가 반복되거나 치명적인 문제가 발견되었을 때 체계적으로 방향을 전환한다.

## 사용 시점

### 자동 트리거
- 동일 카테고리에서 VALIDATE 연속 3회 실패
- VALIDATE 누적 5회 실패
- 아키텍처 수준의 설계 결함 발견

### 수동 트리거
- 사용자 또는 에이전트가 `/circuit-breaker` 실행

`$ARGUMENTS`: 사용하지 않음

## 절차

jdd-sprint-guide.md의 Language Protocol에 따라 설정을 로드한다.

### Step 1: 실패 컨텍스트 요약 (Context Compaction)
현재 작업 상태를 요약하여 `specs/{feature}/planning-artifacts/circuit-breaker-log.md`에 추가한다:
```markdown
## Circuit Breaker Context — {timestamp}

### What Was Attempted
- [시도한 접근 방식]

### Failure Causes
- [실패 원인]

### Partial Successes
- [성공한 부분]

### Learnings
- [이번 시도에서 얻은 교훈]
```

재실행 시, 이 파일을 관련 Phase 에이전트의 입력으로 전달한다:
"이전 시도에서 다음 문제가 발생했습니다: {circuit-breaker-log.md 참조}"

### Step 2: 심각도 평가

Judge 또는 Scope Gate 결과의 `failure_source`를 참조하여 심각도를 평가한다:

**경미한 문제 (Execute 내에서 해결 가능) — `failure_source: local`:**
- 태스크 구현 난항
- 반복적인 테스트 실패
- 코드 품질 미달

→ Spec 수정 → Execute 재실행

**중대한 문제 (설계 수준) — `failure_source: upstream:{stage}`:**
- 아키텍처 수준의 설계 결함 (`upstream:architecture`)
- PRD 요구사항 모순 (`upstream:prd`)
- 기술 스택 변경 필요 (`upstream:architecture`)

→ Auto Sprint: 실패 교훈을 반영하여 원인 단계({stage})부터 재실행
→ Non-Auto Sprint: BMad `/bmad/bmm/workflows/correct-course` 실행

**`failure_source`가 없는 경우**: 기존 분류 기준 사용 (구현 난항 = 경미, 설계 결함 = 중대)

### Step 3: 코드 폐기 (Disposable Code)
```
보존:                         폐기:
─────                         ─────
BMad PRD                      생성된 모든 코드
BMad Architecture + ADR       Worktree
BMad Epic/Story               빌드 산출물
specs/ (수정 후)
brownfield-context.md
실패 교훈 컨텍스트
```

### Step 4: 복구

**경미한 문제 → Execute 재실행:**
1. 실패 교훈을 Spec에 반영
2. 수정된 Spec으로 Execute 재실행 (PARALLEL → VALIDATE)

**중대한 문제 → 설계 단계로 복귀:**

Auto Sprint 모드:
1. 실패 교훈 컨텍스트를 Phase 1에 전달
2. Auto Sprint Phase 1 재실행 (실패 교훈 포함)

Non-Auto Sprint 모드:
1. 사용자에게 실패 컨텍스트 요약 제시 (Step 1 결과, {communication_language} 사용)
2. 선택지 제공 ({communication_language} 사용):
   a) `/bmad/bmm/workflows/correct-course` (BMad 대화형 방향 전환)
      → 실패 컨텍스트(`circuit-breaker-log.md`)를 워크플로우 입력으로 전달
      → 범위 변경 분석 → PRD/Architecture 영향 평가 → BMad 산출물 업데이트
   b) Planning Artifact 수동 편집 → `/specs` 재실행
   c) 중단

## 제약 사항
코드가 아닌 Spec이 핵심 자산이므로, Circuit Breaker 트리거 시 실제 손실은 최소화된다.
코드를 전부 폐기해도 Spec은 보존되기 때문에 재구현 비용이 낮게 유지된다.
