---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
documentStatus: 'final'
version: '1.0'
inputDocuments:
  - 'prd: specs/test-tutor-excl/planning-artifacts/prd.md'
  - 'brownfield-context: specs/test-tutor-excl/planning-artifacts/brownfield-context.md'
date: 2026-02-17
author: Auto Sprint (Winston — Architect)
---

# Architecture: Tutor Exclusion (test-tutor-excl)

## 1. System Context

### 1.1 Overview

EduTalk의 기존 수업 매칭 시스템에 **수업 후 평가 + 튜터 차단** 기능을 추가한다. 핵심은 매칭 엔진이 차단 목록을 참조하여 가용 튜터 풀에서 차단된 튜터를 제외하는 것이다.

### 1.2 System Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│  Student Web App (Next.js 15)                                │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │Reservation│  │Lesson Detail │  │Tutor Management SPA  │   │
│  │Tab        │  │Page          │  │(React, linked from   │   │
│  │+ Rating   │  │+ Block Button│  │ MyPage Vue.js 2)     │   │
│  │  Popup    │  │              │  │                      │   │
│  └─────┬─────┘  └──────┬───────┘  └──────────┬───────────┘   │
│        │               │                      │               │
│        └───────────────┼──────────────────────┘               │
│                        │                                      │
└────────────────────────┼──────────────────────────────────────┘
                         │ HTTPS (JWT Bearer)
┌────────────────────────┼──────────────────────────────────────┐
│  BFF (Hono)            │                                      │
│  ┌─────────────────────▼─────────────────────────────────┐   │
│  │ /api/ratings, /api/tutor-blocks                       │   │
│  │ (validation + token relay)                            │   │
│  └─────────────────────┬─────────────────────────────────┘   │
└────────────────────────┼──────────────────────────────────────┘
                         │ Internal HTTP
┌────────────────────────┼──────────────────────────────────────┐
│  Backend (Spring Boot)  │                                      │
│  ┌──────────┐  ┌───────▼──────┐  ┌──────────────────────┐   │
│  │ Matching  │  │ Rating       │  │ Block                │   │
│  │ Engine    │◄─┤ Service      │  │ Service              │   │
│  │ (existing)│  │ (new)        │  │ (new)                │   │
│  └─────┬─────┘  └──────────────┘  └──────────┬───────────┘   │
│        │                                      │               │
│  ┌─────▼──────────────────────────────────────▼───────────┐   │
│  │ PostgreSQL 15                                          │   │
│  │ lesson_ratings (new) | tutor_blocks (new)              │   │
│  │ lessons (existing)   | tutor_profiles (existing)       │   │
│  └────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

### 1.3 Key Actors

| Actor | Description | Interface |
|-------|-------------|-----------|
| Student | 수업을 수강하고 평가/차단하는 사용자 | Web App (Next.js) |
| Matching Engine | 가용 튜터 풀에서 학생에게 튜터를 배정 | Internal Service |
| CX Team | 매칭 제외 요청을 수동 처리하던 운영팀 | Admin Dashboard (향후) |

## 2. Architecture Decisions

### ADR-001: 신규 Rating 엔드포인트 vs 기존 Feedback 엔드포인트 확장

**Context**: 기존 `POST /lessons/{lessonId}/feedback`이 존재하며 lesson_feedbacks 테이블에 저장됨.

**Decision**: 신규 `POST /lessons/{lessonId}/ratings` 엔드포인트와 `lesson_ratings` 테이블을 생성한다.

**Rationale**:
- 기존 NPS 피드백과 신규 평가는 데이터 구조가 다름 (NPS 1~10 vs 별점 1~5 + 사유 배열)
- 기존 lesson_feedbacks 데이터 마이그레이션 불필요
- 점진적 전환: 기존 NPS 푸시 시스템과 병행 가능
- 기존 피드백 관련 리포팅 시스템에 영향 없음

**Consequences**:
- 기존 NPS와 신규 Rating 데이터가 분리됨 (향후 통합 필요 시 마이그레이션)
- 두 시스템이 일시적으로 병행 운영됨

### ADR-002: 차단 필터를 매칭 엔진 쿼리에 직접 적용

**Context**: 매칭 엔진은 `POST /schedules/match`에서 가용 튜터 풀을 쿼리하여 가중치 기반으로 선택한다.

**Decision**: 매칭 쿼리의 WHERE 절에 `NOT IN (SELECT tutor_id FROM tutor_blocks WHERE student_id = ? AND is_active = true AND language_type = ?)` 조건을 추가한다.

**Rationale**:
- 가장 단순하고 정합성이 높은 방법
- 차단 목록 크기가 작음 (최대 5명/언어)
- 별도 캐시 레이어 불필요 (쿼리 성능 영향 무시 가능)
- 매칭 엔진의 기존 쿼리 구조를 최소한으로 변경

**Consequences**:
- 매칭 엔진에 직접적 의존성 추가
- 향후 차단 한도가 크게 증가하면 성능 재검토 필요 (현재 5명은 무시 가능)

### ADR-003: React SPA 연동 방식 (MyPage → Tutor Management)

**Context**: MyPage는 Vue.js 2 레거시 앱. 신규 차단 관리 페이지는 React로 개발.

**Decision**: MyPage 메뉴에서 URL 파라미터로 1회용 인증 토큰을 전달하여 React SPA를 연다.

**Rationale**:
- 260115-sync-meeting에서 확정된 패턴
- 레거시 앱 수정 최소화 (메뉴 링크 1줄 추가)
- 세션 공유 불필요 (토큰 기반 독립 인증)
- Nuxt.js 2 마이그레이션(Q2 2026) 후 자연스럽게 통합 가능

**Consequences**:
- 토큰 만료/무효화 처리 필요
- 사용자가 두 앱 간 전환 시 미세한 UX 단절 가능

### ADR-004: 차단 이력 보존 방식 (Soft Delete)

**Context**: 차단 해제 후에도 이력을 보존해야 함 (관리자 패턴 분석용).

**Decision**: `tutor_blocks` 테이블에 `is_active` boolean + `released_at` timestamp을 사용한다.

**Rationale**:
- 기존 EduTalk DB 컨벤션(soft delete with `deleted_at`)과 유사하지만, 차단 해제는 논리적으로 삭제가 아닌 상태 변경
- `is_active = false, released_at = now()`로 해제 기록
- 매칭 쿼리는 `is_active = true`만 조회
- 관리자는 전체 이력 조회 가능

**Consequences**:
- 데이터가 누적되지만 차단 건수 자체가 적어 문제 없음
- 재차단 시 새로운 레코드 생성 (이력 추적 용이)

### ADR-005: 평가 팝업 "하루 1회" 기준

**Context**: "하루 1회"의 기준을 정의해야 함.

**Decision**: 자정(00:00 KST) 기준으로 일별 리셋한다. 서버 사이드에서 `last_popup_shown_date`를 추적한다.

**Rationale**:
- 가장 직관적인 사용자 경험 (날짜 기반)
- 서버 사이드 추적으로 기기/세션 무관하게 일관성 유지
- 클라이언트 시간 조작 방지

**Consequences**:
- Redis 또는 DB에 마지막 팝업 노출 날짜 저장 필요
- 자정 직전/직후 수업 완료 시 edge case 존재 (허용 가능)

## 3. Data Model

### 3.1 New Tables

```sql
-- 수업 후 평가
CREATE TABLE lesson_ratings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id),
    student_id BIGINT NOT NULL REFERENCES users(id),
    tutor_id BIGINT NOT NULL REFERENCES users(id),
    language_type VARCHAR(4) NOT NULL, -- EN, JP
    star_rating SMALLINT NOT NULL CHECK (star_rating BETWEEN 1 AND 5),
    positive_reasons TEXT[], -- 긍정 사유 배열 (3~5점)
    negative_reasons TEXT[], -- 부정 사유 배열 (1~2점)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_lesson_ratings_lesson UNIQUE (lesson_id)
);

CREATE INDEX idx_lesson_ratings_student ON lesson_ratings(student_id);
CREATE INDEX idx_lesson_ratings_tutor ON lesson_ratings(tutor_id);

-- 튜터 차단
CREATE TABLE tutor_blocks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id),
    tutor_id BIGINT NOT NULL REFERENCES users(id),
    language_type VARCHAR(4) NOT NULL, -- EN, JP
    block_source VARCHAR(20) NOT NULL, -- RATING_POPUP, LESSON_DETAIL, MANAGEMENT_PAGE
    lesson_id BIGINT REFERENCES lessons(id), -- 차단 계기 수업 (nullable)
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    blocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_tutor_blocks_active UNIQUE (student_id, tutor_id, language_type) WHERE (is_active = TRUE)
);

CREATE INDEX idx_tutor_blocks_student_active ON tutor_blocks(student_id, language_type) WHERE (is_active = TRUE);
CREATE INDEX idx_tutor_blocks_tutor ON tutor_blocks(tutor_id);

-- 평가 팝업 노출 추적
CREATE TABLE rating_popup_tracking (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id),
    last_shown_date DATE NOT NULL,
    last_shown_lesson_id BIGINT NOT NULL REFERENCES lessons(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_popup_tracking_student UNIQUE (student_id)
);
```

### 3.2 Entity Relationship

```
users (1) ────── (N) lesson_ratings (as student)
users (1) ────── (N) lesson_ratings (as tutor)
lessons (1) ──── (0..1) lesson_ratings

users (1) ────── (N) tutor_blocks (as student)
users (1) ────── (N) tutor_blocks (as tutor)

users (1) ────── (0..1) rating_popup_tracking

-- Existing relations preserved:
lessons (N) ──── (1) users (as tutor)
lessons (N) ──── (1) users (as student)
schedules ───── matching engine reads tutor_blocks
```

## 4. API Design

### 4.1 New Endpoints

#### Rating API

```
POST /api/v1/lessons/{lessonId}/ratings
  Auth: Required (STUDENT)
  Body: {
    star_rating: 1-5,
    positive_reasons?: string[],  // 3~5점
    negative_reasons?: string[],  // 1~2점
    block_tutor?: boolean         // 1~2점일 때만 유효
  }
  Response 201: { id, star_rating, created_at }
  Response 409: { error: "ALREADY_RATED" }

GET /api/v1/lessons/unrated
  Auth: Required (STUDENT)
  Query: ?limit=1
  Response 200: {
    lesson: { id, tutor_name, tutor_photo, language_type, scheduled_at },
    popup_eligible: boolean  // 오늘 이미 팝업을 봤는지
  }
```

#### Block API

```
POST /api/v1/tutor-blocks
  Auth: Required (STUDENT)
  Body: {
    tutor_id: number,
    language_type: "EN" | "JP",
    block_source: "RATING_POPUP" | "LESSON_DETAIL" | "MANAGEMENT_PAGE",
    lesson_id?: number
  }
  Response 201: { id, tutor_id, blocked_at }
  Response 409: { error: "ALREADY_BLOCKED" }
  Response 422: { error: "BLOCK_LIMIT_EXCEEDED", current: 5, max: 5, management_url: "/my/tutor-management" }

DELETE /api/v1/tutor-blocks/{blockId}
  Auth: Required (STUDENT, owner only)
  Response 200: { id, released_at }
  Response 404: { error: "BLOCK_NOT_FOUND" }

GET /api/v1/tutor-blocks
  Auth: Required (STUDENT)
  Query: ?language_type=EN
  Response 200: {
    blocks: [{
      id, tutor_id, tutor_name, tutor_photo,
      language_type, blocked_at, last_lesson_at,
      tutor_is_active: boolean
    }],
    count: { current: 3, max: 5 }
  }
```

### 4.2 Modified Endpoints

#### Matching Engine (Existing)

```
POST /api/v1/schedules/match [BROWNFIELD MODIFICATION]
  Change: 매칭 쿼리에 차단 필터 추가
  Before: SELECT tutors WHERE available AND language = ?
  After:  SELECT tutors WHERE available AND language = ?
          AND id NOT IN (
            SELECT tutor_id FROM tutor_blocks
            WHERE student_id = ? AND language_type = ? AND is_active = true
          )
  Impact: WHERE 절 1개 추가. 인덱스 활용으로 성능 영향 무시 가능.
```

### 4.3 Error Response Convention

기존 EduTalk API 에러 패턴을 준수한다:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable message",
  "details": {}  // optional
}
```

| Status | Error Code | Description |
|--------|-----------|-------------|
| 409 | ALREADY_RATED | 해당 수업에 이미 평가 존재 |
| 409 | ALREADY_BLOCKED | 해당 튜터가 이미 차단 상태 |
| 422 | BLOCK_LIMIT_EXCEEDED | 언어별 차단 한도 초과 |
| 404 | BLOCK_NOT_FOUND | 차단 레코드 미존재 또는 이미 해제 |
| 403 | NOT_BLOCK_OWNER | 타인의 차단 레코드 접근 시도 |

## 5. Component Architecture

### 5.1 Frontend Components

```
apps/web/src/
├── app/(student)/
│   ├── reservation/
│   │   ├── page.tsx                    (기존 — RatingPopup 트리거 추가)
│   │   └── _components/
│   │       └── rating-popup/           (신규)
│   │           ├── RatingPopup.tsx     — 팝업 컨테이너 + 상태 머신
│   │           ├── StarRating.tsx      — 별점 선택 UI
│   │           ├── ReasonSelector.tsx  — 긍정/부정 사유 선택
│   │           ├── BlockSuggestion.tsx — 차단 제안 체크박스
│   │           └── types.ts           — 로컬 타입 정의
│   ├── lesson/[id]/
│   │   ├── page.tsx                    (기존 — 차단 버튼 추가)
│   │   └── _components/
│   │       └── BlockTutorButton.tsx    (신규)
│   └── my/
│       └── tutor-management/           (신규 — React SPA)
│           ├── page.tsx               — 진입점 + 토큰 검증
│           ├── _components/
│           │   ├── BlockedTutorList.tsx
│           │   ├── BlockedTutorCard.tsx
│           │   └── UnblockConfirmDialog.tsx
│           └── layout.tsx             — 독립 레이아웃 (MyPage 연동)
└── ...

packages/api-client/src/hooks/          (기존 — 신규 hook 추가)
├── useUnratedLesson.ts                 (신규)
├── useSubmitRating.ts                  (신규)
├── useTutorBlocks.ts                   (신규)
├── useBlockTutor.ts                    (신규)
└── useUnblockTutor.ts                  (신규)

packages/types/src/                     (기존 — 신규 타입 추가)
├── rating.ts                           (신규)
└── tutor-block.ts                      (신규)
```

### 5.2 Backend Services

```
backend/src/main/java/com/edutalk/
├── rating/                             (신규 모듈)
│   ├── controller/RatingController.java
│   ├── service/RatingService.java
│   ├── repository/LessonRatingRepository.java
│   ├── repository/RatingPopupTrackingRepository.java
│   ├── domain/LessonRating.java
│   ├── domain/RatingPopupTracking.java
│   └── dto/
│       ├── SubmitRatingRequest.java
│       └── UnratedLessonResponse.java
├── block/                              (신규 모듈)
│   ├── controller/TutorBlockController.java
│   ├── service/TutorBlockService.java
│   ├── repository/TutorBlockRepository.java
│   ├── domain/TutorBlock.java
│   └── dto/
│       ├── BlockTutorRequest.java
│       ├── BlockListResponse.java
│       └── UnblockResponse.java
└── schedule/                           (기존 — 수정)
    └── service/MatchingService.java    (차단 필터 추가)
```

## 6. Sequence Flows

### 6.1 Post-Lesson Rating with Block

```
Student          Web App           BFF              Backend           DB
  │                │                │                  │               │
  │ Enter          │                │                  │               │
  │ Reservation ──►│                │                  │               │
  │ Tab            │ GET /lessons/  │                  │               │
  │                │ unrated ──────►│ GET /api/v1/     │               │
  │                │                │ lessons/unrated──►│ query         │
  │                │                │                  │ unrated ─────►│
  │                │                │                  │◄──────────────│
  │                │◄───────────────│◄─────────────────│               │
  │ See Popup ◄────│                │                  │               │
  │                │                │                  │               │
  │ Rate 1 star    │                │                  │               │
  │ + reasons ────►│                │                  │               │
  │ + block ✓      │ POST /lessons/ │                  │               │
  │                │ {id}/ratings──►│ POST /api/v1/    │               │
  │                │                │ lessons/{id}/    │               │
  │                │                │ ratings─────────►│ save rating   │
  │                │                │                  │──────────────►│
  │                │                │                  │               │
  │                │                │                  │ if block=true │
  │                │                │                  │ create block  │
  │                │                │                  │──────────────►│
  │                │                │                  │◄──────────────│
  │                │◄───────────────│◄─────────────────│               │
  │ Block          │                │                  │               │
  │ Confirmed ◄────│                │                  │               │
```

### 6.2 Matching with Block Filter

```
Student          Web App           Backend           DB
  │                │                  │               │
  │ Reserve ──────►│ POST /schedules/ │               │
  │                │ match ──────────►│               │
  │                │                  │ query blocks  │
  │                │                  │──────────────►│
  │                │                  │◄──────────────│
  │                │                  │               │
  │                │                  │ query tutors  │
  │                │                  │ WHERE NOT IN  │
  │                │                  │ blocked_ids   │
  │                │                  │──────────────►│
  │                │                  │◄──────────────│
  │                │                  │               │
  │                │                  │ weighted      │
  │                │                  │ random select │
  │                │◄─────────────────│               │
  │ Matched ◄──────│                  │               │
```

## 7. Impact Analysis

### 건드리는 영역 (기존 시스템 변경)

| 영역 | 기존 → 변경 | 위험도 |
|------|------------|--------|
| 매칭 엔진 (`MatchingService.java`) | 가용 튜터 쿼리 → WHERE NOT IN 조건 추가 | MEDIUM |
| 예약 탭 (`reservation/page.tsx`) | 기존 페이지 → RatingPopup 컴포넌트 임포트 추가 | LOW |
| 수업 상세 (`lesson/[id]/page.tsx`) | 기존 페이지 → BlockTutorButton 추가 | LOW |
| MyPage 메뉴 (Vue.js 2 레거시) | 기존 메뉴 → "수업 설정 > 튜터 관리" 링크 1줄 추가 | LOW |

### 신규 생성

| 영역 | 내용 |
|------|------|
| `lesson_ratings` 테이블 | 수업 후 평가 데이터 저장 |
| `tutor_blocks` 테이블 | 튜터 차단 레코드 |
| `rating_popup_tracking` 테이블 | 평가 팝업 노출 추적 |
| Rating API (`/lessons/{id}/ratings`, `/lessons/unrated`) | 평가 제출 및 미평가 수업 조회 |
| Block API (`/tutor-blocks`) | 차단 CRUD |
| RatingPopup 컴포넌트 | 평가 팝업 UI |
| Tutor Management SPA | 차단 관리 페이지 |
| BFF 라우트 | 신규 API 중계 |

### Side-effects

| 변경 | 영향받는 기존 기능 | 대응 |
|------|-------------------|------|
| 매칭 쿼리 WHERE 절 추가 | 매칭 성공률 미세 감소 (차단 튜터 제외) | 차단 한도 5명으로 제한하여 매칭 풀 보호. 모니터링 지표 추가 |
| 예약 탭 팝업 추가 | 예약 탭 진입 속도 | 팝업은 lazy load, 진입 후 비동기 조회. LCP에 영향 없음 |
| MyPage 메뉴 변경 | 레거시 MyPage 안정성 | 링크 1줄 추가만으로 최소 침습. 레거시 코드 수정 없음 |
| 신규 DB 테이블 | 기존 DB 성능 | 독립 테이블이므로 기존 쿼리 영향 없음. 인덱스 최적화 완료 |

## 8. Security Considerations

### 8.1 Authorization

- 차단 API: `student_id` 검증 필수 (JWT에서 추출, 파라미터 조작 방지)
- 차단 해제: `blockId`의 `student_id`가 요청자와 일치하는지 검증
- 평가 API: `lessonId`의 수업에 해당 학생이 참여했는지 검증

### 8.2 Token Handoff (MyPage → React SPA)

- MyPage에서 1회용 인증 토큰을 URL 파라미터로 전달
- React SPA 진입 시 토큰으로 Access Token 교환
- 교환 후 URL 파라미터의 토큰은 무효화
- 토큰 유효 기간: 5분 (짧은 수명으로 가로채기 위험 최소화)

### 8.3 Rate Limiting

- 기존 Rate Limiting 정책 적용: 인증 100 req/min
- 차단 API 추가 제한: 학생당 10 req/min (남용 방지)

## 9. Scalability & Performance

### 9.1 Query Performance

- `tutor_blocks` 인덱스: `(student_id, language_type) WHERE is_active = TRUE` — 매칭 쿼리의 차단 필터에 최적화
- 차단 목록 최대 크기: 5명/언어 → NOT IN 쿼리 비용 무시 가능
- 추가 캐시 레이어 불필요 (Redis 사용하지 않음)

### 9.2 Future Scaling

- 차단 한도가 크게 증가하면 (>50명): 매칭 쿼리에서 JOIN 방식으로 전환 검토
- 관리자 통계 대시보드 추가 시: 읽기 전용 리플리카 활용 권장

## 10. Monitoring & Observability

| Metric | Tool | Alert Threshold |
|--------|------|----------------|
| 매칭 API p95 latency | Datadog APM | >500ms |
| 차단 필터 적용 후 매칭 풀 크기 | Custom metric | 가용 풀 <3명 경고 |
| 평가 팝업 노출율 vs 완료율 | Datadog RUM | 완료율 <30% 모니터링 |
| 차단/해제 API 에러율 | Datadog APM | >1% 에러 경고 |
| 차단으로 인한 매칭 실패율 | Custom metric | >5% 경고 |

## 11. Migration Strategy

### 11.1 Database Migration

1. Flyway 마이그레이션 스크립트로 3개 테이블 생성
2. 기존 `lesson_feedbacks` 데이터는 유지 (마이그레이션/변환 없음)
3. 기존 CX 수동 매칭 제외 데이터는 `tutor_blocks`로 마이그레이션 검토 (선택)

### 11.2 Feature Flag Rollout

```
TUTOR_BLOCK_ENABLED: boolean (Flagsmith)
  - Stage 1: 내부 테스트 (직원만)
  - Stage 2: 10% 카나리 배포
  - Stage 3: 50% 점진 확대
  - Stage 4: 100% 전체 배포
```

### 11.3 Rollback Plan

- Feature flag OFF → 평가 팝업 미노출, 차단 API 비활성화
- DB 테이블/데이터는 유지 (rollback 시에도 삭제하지 않음)
- 매칭 엔진: feature flag로 차단 필터 조건부 적용
