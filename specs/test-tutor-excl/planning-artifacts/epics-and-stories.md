---
stepsCompleted: [1, 2, 3, 4]
documentStatus: 'final'
version: '1.0'
inputDocuments:
  - 'prd: specs/test-tutor-excl/planning-artifacts/prd.md'
  - 'architecture: specs/test-tutor-excl/planning-artifacts/architecture.md'
  - 'brownfield-context: specs/test-tutor-excl/planning-artifacts/brownfield-context.md'
date: 2026-02-17
author: Auto Sprint (John — Product Manager)
---

# Epics & Stories: Tutor Exclusion (test-tutor-excl)

## Epic Overview

| Epic | Name | Priority | Stories | Type |
|------|------|----------|---------|------|
| E1 | 수업 후 평가 시스템 | P0 | 5 | 신규 |
| E2 | 튜터 차단 기능 | P0 | 5 | 신규 + 기존 확장 |
| E3 | 차단 관리 페이지 | P0 | 4 | 신규 |
| E4 | 공유 기반 (Shared Foundation) | P0 | 3 | 신규 + 기존 확장 |

## Dependencies

```
E4 (공유 기반) ──► E1 (평가 시스템) ──► E2 (차단 기능)
                                          │
E4 ──► E3 (차단 관리) ◄─────────────────┘
```

E4는 모든 Epic의 선행 조건이다 (DB 스키마, 공통 타입, API 클라이언트).

---

## Epic 1: 수업 후 평가 시스템

**Goal**: 수강생이 수업 완료 후 예약 탭에서 자연스럽게 평가를 남길 수 있다.
**Related FRs**: FR1, FR2, FR3, FR4, FR5, FR6

### Story 1.1: 미평가 수업 조회 API (신규)

**As** 시스템, **I want** 수강생의 미평가 수업을 조회할 수 있다, **so that** 평가 팝업 노출 여부를 판단할 수 있다.

**Acceptance Criteria:**
- [ ] `GET /api/v1/lessons/unrated?limit=1` 엔드포인트가 가장 최근 미평가 완료 수업 1건을 반환한다
- [ ] `popup_eligible` 필드가 당일 팝업 노출 여부를 반영한다 (rating_popup_tracking 참조)
- [ ] 수업 상태가 FINISH인 것만 대상이다
- [ ] 미평가 수업이 없으면 빈 응답을 반환한다

**Dependencies**: E4 Story 4.1 (DB 스키마)

### Story 1.2: 수업 평가 제출 API (신규)

**As** 수강생, **I want** 수업에 대한 별점과 사유를 제출할 수 있다, **so that** 수업 품질 피드백을 남길 수 있다.

**Acceptance Criteria:**
- [ ] `POST /api/v1/lessons/{lessonId}/ratings` 엔드포인트가 별점(1~5) + 사유를 저장한다
- [ ] 별점만 제출 가능하다 (사유는 선택)
- [ ] 이미 평가된 수업에 대해 409 ALREADY_RATED를 반환한다
- [ ] 해당 수업에 참여하지 않은 학생의 요청은 403을 반환한다
- [ ] 팝업 노출 추적 기록(rating_popup_tracking)이 업데이트된다

**Dependencies**: E4 Story 4.1

### Story 1.3: 평가 팝업 UI 컴포넌트 (신규)

**As** 수강생, **I want** 예약 탭 진입 시 평가 팝업을 볼 수 있다, **so that** 직전 수업을 쉽게 평가할 수 있다.

**Acceptance Criteria:**
- [ ] 예약 탭 진입 시 미평가 수업이 있고 popup_eligible=true이면 팝업이 자동 노출된다
- [ ] 별점(1~5) 선택 UI가 표시된다
- [ ] "다음" 버튼 클릭 시 별점만 저장되고 사유 선택 화면으로 전환된다
- [ ] 팝업은 하루 1회만 노출된다 (같은 날 재진입 시 미노출)
- [ ] 팝업 렌더링은 200ms 이내이다 (p95)

**Dependencies**: Story 1.1, E4 Story 4.3

### Story 1.4: 긍정/부정 사유 선택 UI (신규)

**As** 수강생, **I want** 별점에 따라 좋았던 점 또는 아쉬운 점을 선택할 수 있다, **so that** 구체적인 피드백을 남길 수 있다.

**Acceptance Criteria:**
- [ ] 3~5점 선택 시 긍정 사유 복수 선택 화면이 표시된다
- [ ] 1~2점 선택 시 부정 사유 복수 선택 화면이 표시된다
- [ ] "제출" 버튼 클릭 시 별점 + 사유가 함께 저장된다
- [ ] "건너뛰기" 텍스트 링크 클릭 시 팝업이 닫히고 아무것도 저장되지 않는다
- [ ] X 닫기 버튼 클릭 시 팝업이 닫히고 아무것도 저장되지 않는다

**Dependencies**: Story 1.3

### Story 1.5: 차단 제안 체크박스 (신규)

**As** 수강생, **I want** 부정 평가(1~2점) 시 차단 제안을 볼 수 있다, **so that** 원하면 즉시 차단할 수 있다.

**Acceptance Criteria:**
- [ ] 1~2점 선택 후 사유 선택 화면에 "이 튜터를 다시 만나지 않을래요" 체크박스가 표시된다
- [ ] 3~5점 선택 시에는 차단 제안이 표시되지 않는다
- [ ] 체크 후 "제출" 시 평가 저장 + 차단 확인 팝업이 순차 표시된다
- [ ] 차단 확인 팝업에서 "확인" 시 차단이 실행된다
- [ ] 차단 확인 팝업에서 "취소" 시 차단 없이 평가만 저장된다

**Dependencies**: Story 1.4, E2 Story 2.1

---

## Epic 2: 튜터 차단 기능

**Goal**: 수강생이 원치 않는 튜터를 차단하면 매칭 풀에서 즉시 제외된다.
**Related FRs**: FR7, FR8, FR9, FR10, FR11, FR12

### Story 2.1: 튜터 차단 API (신규)

**As** 수강생, **I want** 특정 튜터를 차단할 수 있다, **so that** 해당 튜터와 매칭되지 않는다.

**Acceptance Criteria:**
- [ ] `POST /api/v1/tutor-blocks` 엔드포인트가 차단을 생성한다
- [ ] 요청에 tutor_id, language_type, block_source가 포함된다
- [ ] 이미 차단된 튜터에 대해 409 ALREADY_BLOCKED를 반환한다
- [ ] 언어당 5명 한도 초과 시 422 BLOCK_LIMIT_EXCEEDED를 반환한다
- [ ] 차단 생성 시 is_active=true, blocked_at=now()로 저장된다
- [ ] 동시 요청 시 UNIQUE constraint로 중복 방지된다

**Dependencies**: E4 Story 4.1

### Story 2.2: 매칭 엔진 차단 필터 (기존 확장)

**As** 시스템, **I want** 매칭 시 차단된 튜터를 제외할 수 있다, **so that** 수강생이 차단한 튜터와 매칭되지 않는다.

**Acceptance Criteria:**
- [ ] `POST /schedules/match` 쿼리에 `NOT IN (tutor_blocks WHERE student_id=? AND language_type=? AND is_active=true)` 조건이 추가된다
- [ ] 차단 필터 적용 후 매칭 API 응답시간 < 500ms (p95)
- [ ] 차단된 튜터가 매칭 결과에 0건 포함된다 (정합성 100%)
- [ ] Feature flag(`TUTOR_BLOCK_ENABLED`)로 조건부 적용된다
- [ ] 기존 매칭 테스트 스위트가 통과한다

**Dependencies**: Story 2.1

### Story 2.3: 수업 이력 상세 차단 버튼 (기존 확장)

**As** 수강생, **I want** 수업 이력 상세 페이지에서 튜터를 차단할 수 있다, **so that** 과거 수업에서 불만족했던 튜터를 차단할 수 있다.

**Acceptance Criteria:**
- [ ] 수업 상세 페이지(`/lesson/[id]`) 하단에 "이 튜터 차단하기" 버튼이 표시된다
- [ ] 이미 차단된 튜터의 경우 "차단됨" 비활성 상태로 표시된다
- [ ] 버튼 클릭 시 차단 확인 팝업이 표시된다
- [ ] 확인 시 차단 API가 호출되고 "차단 완료" 토스트가 표시된다
- [ ] 한도 초과 시 안내 메시지와 관리 페이지 링크가 표시된다

**Dependencies**: Story 2.1, E4 Story 4.3

### Story 2.4: 차단 한도 관리 로직 (신규)

**As** 시스템, **I want** 언어별 차단 한도를 관리할 수 있다, **so that** 매칭 풀이 과도하게 축소되지 않는다.

**Acceptance Criteria:**
- [ ] 영어와 일본어 차단 한도가 각각 독립적으로 5명이다
- [ ] `GET /api/v1/tutor-blocks` 응답에 `count: { current, max }` 정보가 포함된다
- [ ] 더블팩(EN+JP) 수강생은 총 10명까지 차단 가능하다
- [ ] 비활성 튜터도 차단 한도에 포함된다
- [ ] 한도 초과 시 차단 관리 페이지 URL이 에러 응답에 포함된다

**Dependencies**: Story 2.1

### Story 2.5: 차단 확인 팝업 공통 컴포넌트 (신규)

**As** 수강생, **I want** 차단 전 확인 팝업을 볼 수 있다, **so that** 실수로 차단하는 것을 방지할 수 있다.

**Acceptance Criteria:**
- [ ] "이 튜터를 차단하시겠습니까? 앞으로 이 튜터와 매칭되지 않습니다." 메시지 표시
- [ ] "확인" / "취소" 버튼이 있다
- [ ] 확인 시 차단 실행 + "차단 완료" 토스트 표시
- [ ] 취소 시 아무 동작 없이 팝업 닫기
- [ ] 모든 차단 진입점(평가, 이력, 관리)에서 공통 사용

**Dependencies**: E4 Story 4.3 (공용 UI)

---

## Epic 3: 차단 관리 페이지

**Goal**: 수강생이 차단 목록을 직접 관리(조회, 해제, 추가)할 수 있다.
**Related FRs**: FR13, FR14, FR15, FR16

### Story 3.1: 차단 목록 조회 페이지 (신규)

**As** 수강생, **I want** 차단 관리 페이지에서 차단 목록을 볼 수 있다, **so that** 현재 차단 상태를 확인할 수 있다.

**Acceptance Criteria:**
- [ ] MyPage > 수업 설정 > 튜터 관리 경로로 접근 가능하다
- [ ] 차단된 튜터 목록이 카드 형태로 표시된다 (이름, 사진, 차단 일시, 마지막 수업 일시)
- [ ] 비활성(퇴사/장기 휴직) 튜터에 "비활성" 라벨이 표시된다
- [ ] 현재 차단 수 / 최대 한도가 표시된다 (예: "3/5명")
- [ ] 빈 목록일 때 적절한 빈 상태 메시지가 표시된다

**Dependencies**: Story 3.4 (인증 연동), E4 Story 4.1

### Story 3.2: 차단 해제 기능 (신규)

**As** 수강생, **I want** 차단된 튜터를 해제할 수 있다, **so that** 해당 튜터가 매칭 풀에 복귀한다.

**Acceptance Criteria:**
- [ ] 차단 카드에 "해제" 버튼이 표시된다
- [ ] 버튼 클릭 시 확인 팝업이 표시된다 ("차단을 해제하시겠습니까? 이 튜터가 다시 매칭될 수 있습니다.")
- [ ] 확인 시 `DELETE /api/v1/tutor-blocks/{blockId}` API가 호출된다
- [ ] 해제 완료 시 목록에서 해당 카드가 제거되고 "차단 해제 완료" 토스트가 표시된다
- [ ] 차단 수 카운터가 즉시 업데이트된다

**Dependencies**: Story 3.1

### Story 3.3: 차단 해제 API (신규)

**As** 시스템, **I want** 차단을 해제할 수 있다, **so that** 수강생이 차단 목록을 관리할 수 있다.

**Acceptance Criteria:**
- [ ] `DELETE /api/v1/tutor-blocks/{blockId}` 엔드포인트가 차단을 해제한다
- [ ] 해제 시 `is_active=false`, `released_at=now()`로 업데이트된다 (soft delete)
- [ ] 본인의 차단만 해제 가능하다 (403 NOT_BLOCK_OWNER)
- [ ] 이미 해제된 차단에 대해 404 BLOCK_NOT_FOUND를 반환한다
- [ ] 차단 이력은 보존된다 (관리자 조회용)

**Dependencies**: E4 Story 4.1

### Story 3.4: MyPage → React SPA 인증 연동 (기존 확장)

**As** 수강생, **I want** MyPage에서 차단 관리 페이지로 원활하게 이동할 수 있다, **so that** 별도 로그인 없이 차단을 관리할 수 있다.

**Acceptance Criteria:**
- [ ] MyPage(Vue.js 2)의 "수업 설정 > 튜터 관리" 메뉴가 URL 파라미터로 1회용 토큰을 전달하여 React SPA를 연다
- [ ] React SPA 진입 시 토큰으로 Access Token을 교환한다
- [ ] 교환 후 URL의 토큰은 무효화된다
- [ ] 토큰 만료(5분) 시 로그인 페이지로 리다이렉트한다
- [ ] 토큰 없이 직접 URL 접근 시 로그인 페이지로 리다이렉트한다

**Dependencies**: E4 Story 4.1

---

## Epic 4: 공유 기반 (Shared Foundation)

**Goal**: 모든 Epic에서 공통으로 사용하는 DB 스키마, 타입, API 클라이언트를 제공한다.

### Story 4.1: DB 스키마 마이그레이션 (신규)

**As** 개발팀, **I want** 신규 테이블을 생성할 수 있다, **so that** 평가/차단 데이터를 저장할 수 있다.

**Acceptance Criteria:**
- [ ] Flyway 마이그레이션으로 `lesson_ratings`, `tutor_blocks`, `rating_popup_tracking` 3개 테이블이 생성된다
- [ ] 모든 테이블이 EduTalk DB 컨벤션을 준수한다 (snake_case, BIGINT PK, created_at/updated_at)
- [ ] 적절한 인덱스가 생성된다 (Architecture Section 3 참조)
- [ ] UNIQUE constraint가 적용된다 (lesson_ratings.lesson_id, tutor_blocks 복합)
- [ ] Partial unique index (`WHERE is_active = TRUE`)가 tutor_blocks에 적용된다

**Dependencies**: None (첫 번째 실행)

### Story 4.2: 공유 TypeScript 타입 정의 (신규)

**As** 프론트엔드 개발팀, **I want** 공유 TypeScript 타입을 사용할 수 있다, **so that** API 응답 타입이 일관된다.

**Acceptance Criteria:**
- [ ] `packages/types/src/rating.ts`에 Rating 관련 타입이 정의된다
- [ ] `packages/types/src/tutor-block.ts`에 TutorBlock 관련 타입이 정의된다
- [ ] API 요청/응답 스키마가 Zod 스키마로 정의된다 (BFF 검증용)
- [ ] 모든 타입이 API 설계(Architecture Section 4)와 일치한다

**Dependencies**: None (Story 4.1과 병렬 가능)

### Story 4.3: API 클라이언트 훅 (신규)

**As** 프론트엔드 개발팀, **I want** TanStack Query 기반 API 훅을 사용할 수 있다, **so that** 서버 상태를 효율적으로 관리할 수 있다.

**Acceptance Criteria:**
- [ ] `useUnratedLesson()` — 미평가 수업 조회
- [ ] `useSubmitRating()` — 평가 제출 (낙관적 업데이트)
- [ ] `useTutorBlocks(languageType)` — 차단 목록 조회
- [ ] `useBlockTutor()` — 차단 실행 (낙관적 업데이트, 차단 목록 캐시 무효화)
- [ ] `useUnblockTutor()` — 차단 해제 (낙관적 업데이트, 차단 목록 캐시 무효화)
- [ ] 모든 훅이 에러 처리(409, 422 등)를 포함한다

**Dependencies**: Story 4.2

---

## Story Dependencies Summary

```
4.1 (DB Schema) ─────┬──► 1.1 (Unrated API) ──► 1.3 (Popup UI) ──► 1.4 (Reason UI) ──► 1.5 (Block Suggest)
                      │                                                                        │
                      ├──► 1.2 (Rating API)                                                   │
                      │                                                                        │
                      ├──► 2.1 (Block API) ──┬──► 2.2 (Matching Filter)                      │
                      │                      ├──► 2.3 (History Block) ◄────────────────────────┘
                      │                      └──► 2.4 (Limit Logic)
                      │
                      ├──► 3.1 (Block List) ──► 3.2 (Unblock UI)
                      ├──► 3.3 (Unblock API)
                      └──► 3.4 (Auth Handoff)

4.2 (Types) ─────────► 4.3 (API Hooks) ──► 1.3, 2.3, 2.5, 3.1
```

## Velocity Estimation

| Epic | Story Points | Estimated Days |
|------|-------------|----------------|
| E4: Shared Foundation | 5 | 2 |
| E1: Post-Lesson Rating | 13 | 4 |
| E2: Tutor Block | 13 | 4 |
| E3: Block Management | 8 | 3 |
| **Total** | **39** | **~13 working days** |

Note: E1과 E2는 E4 완료 후 병렬 진행 가능. E3는 E4 완료 후 E1/E2와 병렬 진행 가능.
