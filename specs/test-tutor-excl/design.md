# Design: test-tutor-excl

## System Architecture

### Overview

EduTalk's existing lesson matching system is extended with **post-lesson rating** and **tutor block** capabilities. The core integration point is the matching engine's tutor pool query, which now filters out blocked tutors via a `NOT IN` subquery.

### System Context

```
Student Web App (Next.js 15)
  ├── Reservation Tab + Rating Popup
  ├── Lesson Detail + Block Button
  └── Tutor Management SPA (React, linked from MyPage)
           │
           │ HTTPS (JWT Bearer)
           ▼
  BFF (Hono) — /api/ratings, /api/tutor-blocks
           │
           │ Internal HTTP
           ▼
  Backend (Spring Boot 3.x)
  ├── Rating Service (new)
  ├── Block Service (new)
  └── Matching Engine (existing, modified)
           │
           ▼
  PostgreSQL 15
  ├── lesson_ratings (new)
  ├── tutor_blocks (new)
  ├── rating_popup_tracking (new)
  └── lessons, users, schedules (existing)
```

## Module Structure

### Frontend Modules

| Module | Path | Type | Description |
|--------|------|------|-------------|
| RatingPopup | `apps/web/src/app/(student)/reservation/_components/rating-popup/` | New | Rating popup container with state machine |
| StarRating | `...rating-popup/StarRating.tsx` | New | 1-5 star selection UI |
| ReasonSelector | `...rating-popup/ReasonSelector.tsx` | New | Positive/negative reason multi-select |
| BlockSuggestion | `...rating-popup/BlockSuggestion.tsx` | New | Block suggestion checkbox (1-2 stars) |
| BlockTutorButton | `apps/web/src/app/(student)/lesson/[id]/_components/BlockTutorButton.tsx` | New | Direct block from lesson detail |
| TutorManagement | `apps/web/src/app/(student)/my/tutor-management/` | New | Block management SPA page |
| BlockedTutorList | `...tutor-management/_components/BlockedTutorList.tsx` | New | Blocked tutor card list |
| BlockedTutorCard | `...tutor-management/_components/BlockedTutorCard.tsx` | New | Individual blocked tutor card |
| UnblockConfirmDialog | `...tutor-management/_components/UnblockConfirmDialog.tsx` | New | Unblock confirmation modal |
| ReservationPage | `apps/web/src/app/(student)/reservation/page.tsx` | Modified | RatingPopup trigger added |
| LessonDetailPage | `apps/web/src/app/(student)/lesson/[id]/page.tsx` | Modified | BlockTutorButton added |

### Backend Modules

| Module | Path | Type | Description |
|--------|------|------|-------------|
| RatingController | `backend/.../rating/controller/RatingController.java` | New | Rating API endpoints |
| RatingService | `backend/.../rating/service/RatingService.java` | New | Rating business logic |
| LessonRatingRepository | `backend/.../rating/repository/LessonRatingRepository.java` | New | Rating data access |
| RatingPopupTrackingRepository | `backend/.../rating/repository/RatingPopupTrackingRepository.java` | New | Popup tracking data access |
| LessonRating | `backend/.../rating/domain/LessonRating.java` | New | Rating entity |
| RatingPopupTracking | `backend/.../rating/domain/RatingPopupTracking.java` | New | Popup tracking entity |
| TutorBlockController | `backend/.../block/controller/TutorBlockController.java` | New | Block API endpoints |
| TutorBlockService | `backend/.../block/service/TutorBlockService.java` | New | Block business logic |
| TutorBlockRepository | `backend/.../block/repository/TutorBlockRepository.java` | New | Block data access |
| TutorBlock | `backend/.../block/domain/TutorBlock.java` | New | Block entity |
| MatchingService | `backend/.../schedule/service/MatchingService.java` | Modified | Block filter WHERE clause added |

### Shared Packages

| Package | Path | Type | Description |
|---------|------|------|-------------|
| rating.ts | `packages/types/src/rating.ts` | New | Rating TypeScript types |
| tutor-block.ts | `packages/types/src/tutor-block.ts` | New | TutorBlock TypeScript types |
| useUnratedLesson | `packages/api-client/src/hooks/useUnratedLesson.ts` | New | Unrated lesson query hook |
| useSubmitRating | `packages/api-client/src/hooks/useSubmitRating.ts` | New | Rating submission mutation hook |
| useTutorBlocks | `packages/api-client/src/hooks/useTutorBlocks.ts` | New | Block list query hook |
| useBlockTutor | `packages/api-client/src/hooks/useBlockTutor.ts` | New | Block mutation hook |
| useUnblockTutor | `packages/api-client/src/hooks/useUnblockTutor.ts` | New | Unblock mutation hook |

## Data Model

### New Tables

#### lesson_ratings
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, GENERATED ALWAYS AS IDENTITY | |
| lesson_id | BIGINT | FK lessons(id), UNIQUE | One rating per lesson |
| student_id | BIGINT | FK users(id), NOT NULL | Rating author |
| tutor_id | BIGINT | FK users(id), NOT NULL | Rated tutor |
| language_type | VARCHAR(4) | NOT NULL | EN or JP |
| star_rating | SMALLINT | NOT NULL, CHECK 1-5 | Star rating value |
| positive_reasons | TEXT[] | nullable | Positive reason codes (3-5 stars) |
| negative_reasons | TEXT[] | nullable | Negative reason codes (1-2 stars) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

Indexes: `idx_lesson_ratings_student(student_id)`, `idx_lesson_ratings_tutor(tutor_id)`

#### tutor_blocks
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, GENERATED ALWAYS AS IDENTITY | |
| student_id | BIGINT | FK users(id), NOT NULL | Blocking student |
| tutor_id | BIGINT | FK users(id), NOT NULL | Blocked tutor |
| language_type | VARCHAR(4) | NOT NULL | EN or JP |
| block_source | VARCHAR(20) | NOT NULL | RATING_POPUP, LESSON_DETAIL, MANAGEMENT_PAGE |
| lesson_id | BIGINT | FK lessons(id), nullable | Trigger lesson |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | Soft delete flag |
| blocked_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| released_at | TIMESTAMPTZ | nullable | Unblock timestamp |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

Indexes: `idx_tutor_blocks_student_active(student_id, language_type) WHERE is_active = TRUE`, `idx_tutor_blocks_tutor(tutor_id)`
Constraints: `uq_tutor_blocks_active UNIQUE (student_id, tutor_id, language_type) WHERE is_active = TRUE`

#### rating_popup_tracking
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, GENERATED ALWAYS AS IDENTITY | |
| student_id | BIGINT | FK users(id), UNIQUE | One record per student |
| last_shown_date | DATE | NOT NULL | Last popup shown date (KST) |
| last_shown_lesson_id | BIGINT | FK lessons(id), NOT NULL | Lesson shown in popup |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

### Entity Relationships

```
users (1) ──── (N) lesson_ratings (as student)
users (1) ──── (N) lesson_ratings (as tutor)
lessons (1) ──── (0..1) lesson_ratings

users (1) ──── (N) tutor_blocks (as student)
users (1) ──── (N) tutor_blocks (as tutor)

users (1) ──── (0..1) rating_popup_tracking

schedules ───── matching engine reads tutor_blocks (indirect)
```

## Endpoint Inventory

> Note: Detailed API schemas are defined in `api-spec.yaml` (SSOT). This section provides a summary.

### New Endpoints

| Method | Path | Auth | Description | FR |
|--------|------|------|-------------|-----|
| POST | `/api/v1/lessons/{lessonId}/ratings` | STUDENT | Submit lesson rating (star + reasons + optional block) | FR2, FR5 |
| GET | `/api/v1/lessons/unrated` | STUDENT | Get most recent unrated lesson + popup eligibility | FR1 |
| POST | `/api/v1/tutor-blocks` | STUDENT | Create tutor block | FR7, FR8, FR9, FR10 |
| DELETE | `/api/v1/tutor-blocks/{blockId}` | STUDENT (owner) | Release tutor block (soft delete) | FR14 |
| GET | `/api/v1/tutor-blocks` | STUDENT | List blocked tutors with count info | FR13 |

### Modified Endpoints

| Method | Path | Modification | FR |
|--------|------|-------------|-----|
| POST | `/api/v1/schedules/match` | Add `WHERE NOT IN (tutor_blocks)` filter to tutor pool query | FR10 |

### Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 409 | ALREADY_RATED | Lesson already has a rating |
| 409 | ALREADY_BLOCKED | Tutor already blocked by this student |
| 422 | BLOCK_LIMIT_EXCEEDED | Per-language block limit (5) reached |
| 404 | BLOCK_NOT_FOUND | Block record not found or already released |
| 403 | NOT_BLOCK_OWNER | Attempt to access another student's block |

## Brownfield Touchpoints

### Modified Existing Systems

| System | Change | Risk | Mitigation |
|--------|--------|------|------------|
| MatchingService.java | WHERE NOT IN clause added to tutor pool query | MEDIUM | Feature flag (TUTOR_BLOCK_ENABLED), index optimization, max 5 blocks keeps subquery small |
| reservation/page.tsx | RatingPopup component import + trigger | LOW | Lazy loaded, async query, no LCP impact |
| lesson/[id]/page.tsx | BlockTutorButton component added | LOW | Conditional render, no existing layout change |
| MyPage menu (Vue.js 2) | One link added: "Tutor Management" | LOW | No legacy code modification, link-only |

### Architecture Decision Records

| ADR | Decision | Rationale |
|-----|----------|-----------|
| ADR-001 | New `/ratings` endpoint instead of extending `/feedback` | Different data structure (1-5 + reasons vs NPS 1-10), no migration needed, parallel operation |
| ADR-002 | Block filter via WHERE NOT IN in matching query | Simplest approach, max 5 items, no cache layer needed |
| ADR-003 | URL parameter token handoff (MyPage to React SPA) | Confirmed in sync meeting, minimal legacy modification |
| ADR-004 | Soft delete for block records (is_active + released_at) | Preserves history for admin pattern analysis |
| ADR-005 | Server-side popup tracking with midnight KST reset | Consistent across devices, prevents client manipulation |

### Feature Flag

```
TUTOR_BLOCK_ENABLED: boolean (Flagsmith)
  Stage 1: Internal testing (employees only)
  Stage 2: 10% canary
  Stage 3: 50% gradual rollout
  Stage 4: 100% full deployment
```

### Migration Strategy

1. Flyway migration scripts create 3 new tables (no existing table modification)
2. Existing `lesson_feedbacks` data preserved (no migration/conversion)
3. Feature flag controls runtime activation
4. Rollback: flag OFF disables popup + block filter; DB data preserved
