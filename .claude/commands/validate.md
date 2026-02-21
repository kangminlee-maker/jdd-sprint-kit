---
description: "Entropy 기반 3단계 검증 파이프라인 (자동화 + AI Judge + 시각적 검증)"
---

# /validate — 다단계 검증 파이프라인

> **디스패치 대상**: `@judge-quality` + `@judge-security` + `@judge-business` (병렬)

## 목적

Entropy Tolerance에 따라 검증 밀도를 조정하는 다차원 검증 파이프라인.

## 사용 시점

Worker 구현 완료 후. 병렬 실행 완료 + 머지 이후에 실행.

## 입력

`$ARGUMENTS`: 사용하지 않음

파라미터 (auto-sprint에서 호출 시):
- `specs_root`: 명세 파일의 기본 디렉토리. 기본값: `specs/{feature}/`. Crystallize 이후: `specs/{feature}/reconciled/`.

사전 조건:
- 병렬 실행 완료: 모든 Worker 태스크 완료
- 코드가 main 브랜치에 머지됨
- 빌드 성공

**경로 해석**: 이 커맨드의 모든 명세 파일 참조는 `{specs_root}`를 기본 경로로 사용. `specs_root`가 제공되지 않으면 `specs/{feature}/`를 기본값으로 사용. 이를 통해 Crystallize 사용 시 Judge가 reconciled 산출물을 기준으로 검증하도록 보장.

## 절차

jdd-sprint-guide.md의 언어 프로토콜에 따라 설정 로드.

### Phase 1: 자동화 검증 (전체 태스크)
모든 Entropy 레벨에 적용:

```bash
npm run lint
npm run type-check
npm run test
npm run build
```

Phase 1 실패 → 해당 파일 소유 Worker에게 수정 요청 → 수정 후 Phase 1 재실행

### Phase 2: AI Judge 검증 (Medium + Low Entropy)
Judge 에이전트를 병렬로 실행. 각 Judge에 다음을 전달:
- `changed_files`: `git diff --name-only {base_branch}...HEAD` 결과
- `feature_dir`: `{specs_root}` (기본값: `specs/{feature}/`)
- `brownfield_path`: `{specs_root}/brownfield-context.md` (또는 reconciled/ 사용 시 `{specs_root}/planning-artifacts/brownfield-context.md`)

1. **코드 품질 Judge** (`judge-quality`):
   - 코드 구조, 패턴, 중복
   - 프로젝트 컨벤션 준수
   - **기존 시스템 코드베이스 패턴 준수** (설정된 client-docs MCP 기반)
   - Specmatic API 계약 최종 검증

2. **보안 Judge** (`judge-security`):
   - OWASP Top 10 취약점 점검
   - 인젝션, XSS, 인증 우회
   - **기존 시스템 인증/권한 패턴과의 일관성** (설정된 backend-docs MCP 기반)

3. **비즈니스 로직 Judge** (`judge-business`):
   - BMad PRD 수용 기준 대비 구현 검증
   - Architecture ADR 준수
   - **기존 시스템 도메인 정책/고객 여정과의 정합성** (설정된 backend-docs, svc-map MCP 기반)

**Low Entropy 태스크**: Judge는 Adversarial 모드로 동작 — 철저한 리뷰, 발견 사항을 심각도별로 분류:
- `CRITICAL`: 기능 장애 또는 보안 취약점. 반드시 수정.
- `HIGH`: 설계 위반 또는 성능 문제. 반드시 수정.
- `SUGGESTION`: 스타일, 리팩토링 제안. 기록만 하며 블록하지 않음.

**Adversarial 종료 조건**: 새로운 CRITICAL/HIGH 발견이 0건일 때 PASS. SUGGESTION만 있으면 통과.

Judge 호출 — **단일 응답에서 3개의 Task를 반드시 동시에 호출해야 함**.
참고: `{specs_root}` 기본값은 `specs/{feature}/`. Crystallize 이후: `specs/{feature}/reconciled/`.
brownfield_path: `{specs_root}/brownfield-context.md` 파일이 존재하면 해당 경로 사용, 없으면 `{specs_root}/planning-artifacts/brownfield-context.md` 사용.
sprint_input_path는 항상 원본 `specs/{feature}/inputs/sprint-input.md`를 사용 (Crystallize의 영향을 받지 않음).

```
Task(subagent_type: "judge-quality", model: "sonnet")
  prompt: "Read .claude/agents/judge-quality.md and follow it.
    changed_files: {changed_files}
    feature_dir: {specs_root}
    brownfield_path: {specs_root}/brownfield-context.md (fallback: {specs_root}/planning-artifacts/brownfield-context.md)"

Task(subagent_type: "judge-security", model: "sonnet")
  prompt: "Read .claude/agents/judge-security.md and follow it.
    changed_files: {changed_files}
    feature_dir: {specs_root}
    brownfield_path: {specs_root}/brownfield-context.md (fallback: {specs_root}/planning-artifacts/brownfield-context.md)"

Task(subagent_type: "judge-business", model: "sonnet")
  prompt: "Read .claude/agents/judge-business.md and follow it.
    changed_files: {changed_files}
    feature_dir: {specs_root}
    brownfield_path: {specs_root}/brownfield-context.md (fallback: {specs_root}/planning-artifacts/brownfield-context.md)
    sprint_input_path: specs/{feature}/inputs/sprint-input.md"
```
→ 3개 결과 모두 수집
→ CRITICAL 발견 존재 시 → FAIL
→ 각 발견 사항의 `failure_source` 분류:
  - `local`: Worker가 수정 가능 (코드 버그, 테스트 실패 등)
  - `upstream:architecture`: Architecture ADR 위반, 설계 불일치
  - `upstream:prd`: PRD AC 모순, 요구사항 충돌
→ `local` 발견 사항 → Worker에게 수정 요청 → 영향받은 Judge만 재실행
→ `upstream` 발견 사항 → Circuit Breaker로 전달 (failure_source 포함)

### Phase 3: 시각적 검증 (UI 관련 태스크)
UI가 있는 태스크에만 적용:
1. BMad UX 설계 대비 시각적 회귀 점검
2. **기존 시스템 서비스 맵 화면 대비 변경 사항 검증** (설정된 svc-map MCP 스크린샷)
3. **최신 Figma 디자인 목업 대비 일치 여부 검증** (`figma` MCP)
4. 반응형 디자인 점검
5. 기본 접근성 점검

### Entropy 기반 단계 매트릭스

| Entropy | Phase 1 | Phase 2 | Phase 3 |
|---------|---------|---------|---------|
| High    | O       | -       | -       |
| Medium  | O       | O       | (UI 있을 때) |
| Low     | O       | O (Adversarial) | (UI 있을 때) |

## 제약 사항

### 수정 프로세스
`/parallel` 완료 후 Worker는 비활성 상태. 검증 실패 시 다음 절차 수행:
1. Judge가 실패 보고서 생성 (파일 경로 + 라인 번호 + 심각도 + 수정 제안)
2. 실패한 태스크별로 **새 수정 태스크 생성** (TaskCreate)
3. 수정 구현을 위한 소규모 `/parallel` 재실행
4. 재검증을 위한 `/validate` 재실행

### 재시도 한도
- 위 사이클 최대 **5회 반복**
- Adversarial 모드 (Low Entropy): CRITICAL/HIGH 기준으로만 실패 판정. SUGGESTION은 루프 횟수에 미산입
- **누적 5회 실패** 또는 **동일 카테고리에서 연속 3회 실패** → Circuit Breaker 자동 발동
- Circuit Breaker 발동 시 → `/circuit-breaker` 실행

## 출력
검증 결과 보고서:
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
