# JP2 종합 리뷰 컨텍스트 — test-tutor-excl

> 이 문서는 JP2 시점에서 사용자가 요청한 종합 재검토(Party Mode) 결과와
> 후속 설계철학 논의를 보존합니다. Context compaction 대비용.

## 1. 리뷰 배경

### 사용자 요청
JP2 AskUserQuestion을 거절하고, 다음을 요청:
> "지금까지 진행한 내용(auto-sprint 시작부터 JP2까지)을 바탕으로, 설계철학과 실용성을 고려했을 때 과정과 결과가 잘못된 부분이 없는지 재검토 해 보자. 파티모드로 진행 부탁해."

### 리뷰 범위
- 전체 Sprint 과정: Phase 0 Smart Launcher → Phase 1 Planning → JP1 (Party Mode + 3건 반영) → Phase 2 Deliverables → JP2
- 생성된 산출물 전체 (13+ 파일 + 프로토타입)
- 관점: JDD 6원칙 정합성 + 실용성

### 참석 에이전트
Mary (Analyst), John (PM), Winston (Architect), Sally (UX), Murat (Test Architect), Bob (SM)

---

## 2. 산출물 리뷰 결과

### CRITICAL — 2건

#### [C-1] PendingRatingResponse에 tutor_id 누락 — 5개 파일 전파

**문제**: GET `/ratings/pending` 응답에 `tutor_id`가 없음. 하지만 Block-from-Rating 플로우(Flow 1)에서 POST `/tutors/blocks`를 호출하려면 `tutor_id`가 필수.

**전파 범위** (5개 파일에 걸친 체계적 누락):
1. `planning-artifacts/prd.md` API Detail (line 246-257): tutor_id 없음
2. `planning-artifacts/architecture.md` API Detail (line 244-257): tutor_id 없음
3. `design.md` API endpoint table (line 95): response에 tutor_id 없음
4. `api-spec.yaml` PendingRatingResponse schema (line 274-295): tutor_id 없음
5. `preview/src/api/types.ts` PendingLesson interface (line 1-8): tutor_id 없음

**결과**: 프로토타입 `RatingPopup.tsx:68`에서 `tutor_id: lesson.lesson_id`로 잘못 전송.

**영향**: Block-from-Rating 전체 플로우가 실제 구현 시 동작하지 않음.

**수정 방안**: PendingRatingResponse에 `tutor_id: integer` 추가 (5개 파일 모두).

#### [C-2] architecture.md SQL에 partial unique index가 아닌 일반 UNIQUE constraint

**문제**: `architecture.md:185`의 CREATE TABLE에:
```sql
CONSTRAINT uq_tutor_blocks_active UNIQUE (student_id, tutor_id, language_type)
```
이것은 일반 UNIQUE. JP1 Party Mode에서 partial unique index(`WHERE unblocked_at IS NULL`)로 수정했지만, architecture.md에는 미반영.

**현황**:
- design.md:75 — 올바름 (partial unique)
- schema.dbml:83 — 올바름
- tasks.md T-1:53 — 올바름
- architecture.md:185 — 올바르지 않음 (일반 UNIQUE)

**수정 방안**: architecture.md의 CONSTRAINT → CREATE UNIQUE INDEX ... WHERE unblocked_at IS NULL.

### MINOR — 2건

#### [M-1] api-spec.yaml에 security 적용 누락
`securitySchemes.BearerAuth` 정의되어 있지만 endpoint/전역에 미적용. Specmatic 계약 테스트 시 인증 검증 빠짐.

#### [M-2] 프로토타입 토스트 UX 패턴 불일치
긍정 평가 완료: 모달 내부 메시지 → 1.5초 후 모달 닫힘.
차단 완료: fixed position 하단 토스트.
같은 앱 내 피드백 패턴 2가지 혼재. 프로토타입 목적으로는 충분하나 실제 구현 시 통일 권장.

### REFERENCE — 4건 (긍정)
- [R-1] Brief → FR 추적 빈틈 없음 (BRIEF-1~11 전부 매핑)
- [R-2] Causal Chain 전파 일관성 양호
- [R-3] JDD 6원칙 전부 적합 판정
- [R-4] BDD 28 시나리오 커버리지 양호

---

## 3. 프로세스 원인 분석

### C-1의 프로세스 원인: 교차 엔드포인트 데이터 의존성 검증 부재

**역추적**:
```
PRD (John) → API 설계 시 tutor_id 누락 (최초 발생)
  → Architecture (Winston) → 같은 누락 전파
    → Specs → 같은 누락
      → Deliverables → 5개 파일에 동일 누락
```

**핵심**: 현재 Scope Gate와 Traceability Matrix는 FR → API를 **독립적으로** 매핑.
API 간 **데이터 의존 체인** ("GET 응답의 필드가 POST 요청에 충분한가?")는 검증하지 않음.

### C-2의 프로세스 원인: Party Mode 수정의 역방향 전파 메커니즘 부재

**역추적**:
```
JP1 Party Mode → Winston 발견 → 수정 적용: design.md, tasks.md, schema.dbml (downstream)
  → architecture.md (upstream) 미수정
    → Post-Party Scope Gate → specs/ 파일만 검증 → PASS
```

**핵심**: Auto Sprint 파이프라인은 정방향(planning-artifacts → specs → deliverables) 생성만 자동화.
Party Mode의 역방향 전파(specs → planning-artifacts) 메커니즘이 없음.

### 공통 근본 원인

```
근본 원인: 같은 정보가 5개 파일에 다른 포맷으로 존재 (다중 표현)
  → 파이프라인이 정방향 생성만 자동화 (역전파 없음)
  → Scope Gate가 단일 산출물 검증 (교차 검증 없음)
  → Party Mode가 부분 수정 적용 (재생성 원칙과 충돌)
```

---

## 4. 설계철학 논의 — JDD 원칙 3의 실용적 보정

### 핵심 긴장

JDD 원칙 3: "재생성이 기본, 산출물은 소모품"
→ 산출물이 **소모품(output)**이면 동기화 불필요 (버리고 다시 만들면 됨)

실제 파이프라인: 각 단계가 이전 단계 출력을 입력으로 소비
→ 산출물이 **중간 상태(state)**가 됨 → 동기화 필수

**현재 파이프라인은 산출물을 중간 상태로 사용하면서, 소모품처럼 관리하고 있음.**

### Party Mode가 드러낸 것

정상 흐름(정방향 생성)과 전체 재생성(Circuit Breaker) 경로에서는 원칙 3이 작동.
**Party Mode만이 "재생성이 아닌 부분 수정"을 적용하는 유일한 경로.**
→ 설계 문서에 정의되지 않은 제3의 패턴.

### 사용자 프레이밍: Ideal Gas 비유

> 설계철학은 이상적인 상황을 상정 (ideal gas law: PV=nRT)
> 현실 구현은 실용성을 위한 compromise가 필요 (Van der Waals 보정항)
> 설계철학을 바꾸는 게 아니라, 모델 하에서 실용적 튜닝

### 1차 논의 결과 — 초기 2축 프레이밍 (BMad 에이전트 토론)

**Mary**: 부분 수정이 일어나는 시점을 정리 → Party Mode만이 유일하게 원칙 3이 작동하지 않는 경로.

**Winston**: 보정항 위치 후보 3가지 제시:
- 위치 1: 수정 시점 (Party Mode 적용 시) — context 부담 큼
- 위치 2: 검증 시점 (Post-Party Scope Gate) — 기존 메커니즘 확장, 자연스러움 ✓
- 위치 3: 소비 시점 (Worker 우선순위 규칙) — 불일치 허용하되 우선순위로 해결
- **위치 2 + 위치 3 조합 제안**

**John**: 문제의 크기 측정:
- 이번 Sprint Party Mode 3건 중 다중 표현 영향은 1건(데이터 모델 변경)만
- C-1(tutor_id)은 Party Mode 문제가 아니라 최초 생성 시 누락 → 별도 문제로 분리

**Bob**: 구조적 위치 제안:
- JDD 원칙 3은 수정 불필요 (이상 기체 법칙은 그대로)
- **Sprint 프로토콜(jdd-sprint-protocol.md)에 보정 규칙 추가** (철학과 구현 분리)

**Murat**: C-1은 별도 축:
- key-flows 생성 시 API 데이터 흐름 추적 검증 추가
- "이 API 호출에 필요한 데이터가 이전 step 응답에서 획득 가능한가?"

**Mary 종합**: 보정항이 두 축으로 나뉨:
- **축 1**: 부분 수정 시 정합성 (C-2 계열) — Post-Party Scope Gate 교차 검증 확장
- **축 2**: 교차 API 데이터 흐름 검증 (C-1 계열) — key-flows/api-spec 생성 시 추가
- 두 축 모두 기존 메커니즘 확장이지 새 메커니즘 도입 아님

### 2차 논의 — 축 1 리프레이밍 + 확정

**사용자 인사이트**: Party Mode 수정과 사용자 직접 피드백은 본질적으로 같다 — 둘 다 사용자가 내린 결정. 다르게 처리할 이유 없음. 진짜 질문은 "JP 피드백 시 재생성 vs 수정반영" 전략.

**리프레이밍**: "Party Mode 보정항" → **"JP 피드백 처리 전략"**으로 승격. 더 범용적이고 더 단순.

**사용자 추가 인사이트**: Redirect도 결국 재생성 옵션의 스케일 차이일 뿐, Comment와 종류가 다르지 않다.

**확정 설계 — JP 응답 모델 단순화**:

```
JP → Confirm → 다음 Phase
   → Comment → 피드백 입력 → 시스템이 영향 분석 → 처리 옵션(+cost) 제시:
       - 수정반영+전파: N개 파일, ~M분
       - 재생성: Phase X부터, ~M분
     사용자가 cost 기반으로 선택
```

**핵심 설계 결정**:

| 항목 | 결정 |
|------|------|
| JP 응답 | Confirm / Comment 2가지로 단순화. Redirect 폐기 (Comment에 흡수) |
| Comment 처리 | 피드백 먼저 받고 → 시스템이 영향 분석 → 옵션+cost 동적 제시 |
| 옵션 구성 | 수정반영+전파 / 재생성 (범위는 피드백에 따라 동적 결정) |
| 수정반영 안전망 | 전파 완료 후 Scope Gate 검증 필수 (Murat 제안) |
| 원칙 | 처리 방식 통일 (Party Mode든 직접 피드백이든 동일 메커니즘) |
| cost 투명성 | A/B 모두 사용자에게 cost 보여주고 선택은 사용자 몫 |

### 합의 사항

| 항목 | 결론 |
|------|------|
| JDD 원칙 3 | 수정 불필요 (이상 모델 유지) |
| 보정항 위치 | Sprint 프로토콜. 철학과 구현 분리 |
| 축 1 (확정) | JP 피드백 처리 전략: Confirm/Comment 단순화 + 수정반영/재생성 cost 기반 선택 |
| 축 2 (확정) | API Data Sufficiency Check: 생성 지침(deliverable-generator) + 검증 절차(scope-gate) |
| 설계 원칙 | 기존 메커니즘 확장, 새 메커니즘 미도입 |

---

## 5. 축 2 확정 설계 — API Data Sufficiency Check

### 3차 논의 — 접근 A vs B 전원 토론

**접근 A**: key-flows 포맷 유지 + AI 판단 검증 (scope-gate 체크 항목 추가)
**접근 B**: key-flows 포맷 확장(API 데이터 흐름 테이블) + 구조적 검증

**전원 접근 A 지지**:
- **Winston**: 검증 정밀도 차이 크지 않음. 포맷 변경 파급 범위가 큼.
- **John**: scope-gate 자체가 AI 판단 기반 — 같은 레벨에서 확장이 일관적.
- **Sally**: key-flows는 JP2 사용자용 서사 문서 — 기술 테이블은 목적 불일치.
- **Murat**: A라도 구체적 검증 절차를 명시하면 효과적. (본인 B 제안에서 전환)
- **Bob**: 구현 비용 차이 명확 — A가 압도적으로 가벼움.
- **Mary**: "기존 메커니즘 확장" 원칙에 A가 정확히 부합.

### 확정 설계

**위치 1 — deliverable-generator 생성 지침 추가**:
> "key-flows의 각 플로우에서, 후행 API 호출의 요청 필드가 선행 API 호출의 응답에 포함되어 있는지 확인하라. 부족한 필드가 있으면 해당 API의 응답 스키마를 보강하라."

**위치 2 — scope-gate에 API Data Sufficiency Check 절차 추가**:
1. key-flows에서 API 호출 Step 추출
2. Flow별 API 호출 순서 정리
3. api-spec.yaml에서 요청/응답 스키마 참조
4. 후행 API 요청 필드의 선행 API 응답 포함 여부 확인
5. 획득 경로 불명확한 필드 → WARN

**설계 원칙**: 포맷 변경 없음, 새 산출물 없음. 기존 에이전트 정의에 항목 추가만.

---

## 6. 미결 사항

1. ~~**축 1 구체 설계**~~ → **확정 완료** (섹션 4 "2차 논의" 참조)
2. ~~**축 2 구체 설계**~~ → **확정 완료** (섹션 5 참조)
3. ~~**축 1 + 축 2 구현**~~ → **구현 완료**
   - jdd-sprint-protocol.md: JP 응답 Confirm/Comment 단순화 + Comment 처리 플로우 + 재생성 범위 참조 테이블
   - auto-sprint.md: JP1/JP2 메뉴 R→F 변경 + Comment 처리 플로우(A/P/F 공통) + Feedback Re-execution 통합
   - deliverable-generator.md: Stage 4b API Data Flow Verification 추가 + Self-Validation item 9 추가
   - scope-gate.md: deliverables 스테이지 추가 (API Data Sufficiency Check + 체크리스트)
4. ~~**JDD 문서 반영 방법**~~ → **구현 완료**
   - 원칙 4: JP 응답 `Confirm / Comment` 단순화, 역방향 루프 → Comment 재생성 스케일로 흡수
   - 원칙 3: "Sprint Kit에서의 실현"에 수정반영+전파 + cost 투명성 반영
   - 상단 구조도: Regeneration 라인 업데이트
   - 부록 확장(실용적 보정 근거): **구현 완료** — "원칙 3의 실용적 보정" 섹션 추가
5. ~~**Sprint Kit 프로토콜 추가 반영**~~ → **구현 완료**
   - Party Mode 검증: scope-gate deliverables 호출 경로 누락 발견 (Murat 지적)
   - 전원 합의: auto-sprint.md에 Step 5-G (scope-gate deliverables) 추가
   - FAIL 시 Deliverables 재생성 (`mode: deliverables-only`)
6. ~~**이번 Sprint 산출물 수정**~~ → **불필요 (종결)**
   - 프로세스 개선을 위한 테스트 Sprint. 산출물 자체의 수정은 불필요.
   - C-1, C-2, M-1은 프로세스 개선(축 1, 2)으로 향후 Sprint에서 방지됨

---

## 6. Sprint 상태

- **현재 위치**: JP2 시점 (JP2 승인/거절 미결정)
- **JP2 전 상태**: Deliverables 생성 완료, 프로토타입 동작 확인
- **보류 중**: 설계철학 논의 완료 후 JP2 판단 → `/parallel` 실행
- **Sprint Log**: `specs/test-tutor-excl/sprint-log.md` 참조 (Step 5까지 기록됨)
