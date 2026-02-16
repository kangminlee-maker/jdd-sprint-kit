---
description: "Entropy 기반 3-Phase 검증 파이프라인 (Auto + AI Judge + Visual)"
---

# /validate — Multi-Phase Verification Pipeline

> **Dispatch Target**: `@judge-quality` + `@judge-security` + `@judge-business` (parallel)

## Purpose

Entropy Tolerance에 따라 검증 밀도를 조절하는 다차원 검증 파이프라인이다.

## When to Use

Worker 구현 완료 후. PARALLEL 완료 + merge 후 실행.

## Inputs

`$ARGUMENTS`: 사용하지 않음

선행 조건:
- PARALLEL 완료: 모든 Worker 태스크 done
- 코드가 메인 브랜치에 merge 완료
- 빌드 성공

## Procedure

### Phase 1: 자동 검증 (모든 태스크)
모든 Entropy 레벨에 적용:

```bash
npm run lint
npm run type-check
npm run test
npm run build
```

Phase 1 실패 시 → 해당 파일의 Worker에게 수정 요청 → 수정 후 Phase 1 재실행

### Phase 2: AI Judge 검증 (Medium + Low Entropy)
Judge 에이전트를 병렬로 실행한다. 각 Judge에 다음을 전달한다:
- `changed_files`: `git diff --name-only {base_branch}...HEAD` 결과
- `feature_dir`: `specs/{feature}/`
- `brownfield_path`: `specs/{feature}/brownfield-context.md`

1. **Code Quality Judge** (`judge-quality`):
   - 코드 구조, 패턴, 중복 검증
   - 프로젝트 컨벤션 준수 여부
   - **기존 코드베이스 패턴 준수 여부** (configured client-docs MCP 기반)
   - Specmatic API 계약 최종 검증

2. **Security Judge** (`judge-security`):
   - OWASP Top 10 취약점 검증
   - 인젝션, XSS, 인증 우회
   - **기존 인증/권한 패턴과의 일관성** (configured backend-docs MCP 기반)

3. **Business Logic Judge** (`judge-business`):
   - BMad PRD 수용 기준 대비 구현 검증
   - Architecture ADR 준수 여부
   - **기존 도메인 정책/고객 여정과의 정합성** (configured backend-docs, svc-map MCP 기반)

**Low Entropy 태스크**: Judge가 Adversarial 모드로 동작 — 빠짐없이 검토하되, 발견 사항을 severity로 분류:
- `CRITICAL`: 기능 장애 또는 보안 취약점. 반드시 수정.
- `HIGH`: 설계 위반 또는 성능 문제. 반드시 수정.
- `SUGGESTION`: 스타일, 리팩토링 제안. 기록만 하고 차단하지 않음.

**Adversarial 종료 조건**: 새로운 CRITICAL/HIGH 발견이 0개이면 PASS. SUGGESTION만 남아있으면 통과.

Judge 실행 방법 — **반드시 하나의 응답에서 3개 Task를 동시 호출**한다:
```
Task(subagent_type: "judge-quality", model: "sonnet")
  prompt: "Read .claude/agents/judge-quality.md and follow it.
    changed_files: {changed_files}
    feature_dir: specs/{feature}/
    brownfield_path: specs/{feature}/brownfield-context.md"

Task(subagent_type: "judge-security", model: "sonnet")
  prompt: "Read .claude/agents/judge-security.md and follow it.
    changed_files: {changed_files}
    feature_dir: specs/{feature}/
    brownfield_path: specs/{feature}/brownfield-context.md"

Task(subagent_type: "judge-business", model: "sonnet")
  prompt: "Read .claude/agents/judge-business.md and follow it.
    changed_files: {changed_files}
    feature_dir: specs/{feature}/
    brownfield_path: specs/{feature}/brownfield-context.md
    sprint_input_path: specs/{feature}/inputs/sprint-input.md"
```
→ 3개 결과를 수집
→ Critical finding이 있으면 FAIL
→ 각 finding의 `failure_source`를 분류:
  - `local`: Worker가 수정 가능 (코드 버그, 테스트 실패 등)
  - `upstream:architecture`: Architecture ADR 위반, 설계 불일치
  - `upstream:prd`: PRD AC 자체의 모순, 요구사항 충돌
→ `local` finding → Worker에게 수정 요청 → 수정 후 해당 Judge만 재실행
→ `upstream` finding → Circuit Breaker로 전달 (failure_source 포함)

### Phase 3: 시각적 검증 (UI 관련 태스크)
UI가 있는 태스크에만 적용:
1. BMad UX Design 대비 시각적 회귀 확인
2. **기존 서비스맵 화면 대비 변경점 확인** (configured svc-map MCP 스크린샷)
3. **Figma 최신 디자인 시안 대비 일치 여부** (`figma` MCP)
4. 반응형 디자인 확인
5. 접근성 기본 체크

### Entropy-Based Phase Matrix

| Entropy | Phase 1 | Phase 2 | Phase 3 |
|---------|---------|---------|---------|
| High    | O       | -       | -       |
| Medium  | O       | O       | (UI시)  |
| Low     | O       | O (Adversarial) | (UI시) |

## Constraints

### 수정 프로세스
`/parallel` 완료 후에는 Worker가 비활성 상태이므로, 검증 실패 시 다음 절차를 따른다:
1. Judge가 실패 리포트 생성 (file path + line number + severity + fix suggestion)
2. 실패 태스크별 **수정 태스크를 새로 생성** (TaskCreate)
3. 소규모 `/parallel` 재실행으로 수정 구현
4. `/validate` 재실행으로 재검증

### 재시도 제한
- 위 사이클 최대 **5회 반복**
- Adversarial 모드 (Low Entropy): CRITICAL/HIGH 기준으로만 실패 판정. SUGGESTION은 루프 카운트에 불포함
- **5회 누적 실패** 또는 **동일 카테고리 3회 연속 실패** → Circuit Breaker 자동 발동
- Circuit Breaker 발동 시 → `/circuit-breaker` 실행

## Outputs
검증 결과 리포트:
```markdown
## VALIDATE Report: {feature}
- Phase 1 (Auto): PASS/FAIL — [details]
- Phase 2 (Judge): PASS/FAIL — [X critical, Y warnings]
  - Failure Sources: {N} local, {M} upstream
- Phase 3 (Visual): PASS/FAIL/SKIP
- **Overall: PASS/FAIL**
- **Upstream Issues** (if any):
  - {finding} → failure_source: upstream:{stage} → suggested_fix: {fix}
```
