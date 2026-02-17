# Tasks: test-tutor-excl

## Task Summary

| Task | Title | Entropy | Worker | Dependencies | Story |
|------|-------|---------|--------|-------------|-------|
| T-1 | DB Schema Migration | Low | Worker-1 | None | E4-S4.1 |
| T-2 | Shared TypeScript Types | Low | Worker-2 | None | E4-S4.2 |
| T-3 | Unrated Lesson API | Medium | Worker-1 | T-1 | E1-S1.1 |
| T-4 | Rating Submit API | Medium | Worker-1 | T-1 | E1-S1.2 |
| T-5 | Tutor Block API | High | Worker-1 | T-1 | E2-S2.1 |
| T-6 | Block Release API | Medium | Worker-1 | T-1 | E3-S3.3 |
| T-7 | Matching Engine Block Filter | High | Worker-3 | T-5 | E2-S2.2 |
| T-8 | API Client Hooks | Medium | Worker-2 | T-2 | E4-S4.3 |
| T-9 | Rating Popup UI | Medium | Worker-4 | T-3, T-8 | E1-S1.3 |
| T-10 | Reason Selector UI | Medium | Worker-4 | T-9 | E1-S1.4 |
| T-11 | Block Suggestion UI | Medium | Worker-4 | T-10, T-5 | E1-S1.5 |
| T-12 | Lesson Detail Block Button | Medium | Worker-4 | T-5, T-8 | E2-S2.3 |
| T-13 | Block Limit Logic | Medium | Worker-1 | T-5 | E2-S2.4 |
| T-14 | Block Confirm Dialog | Low | Worker-4 | T-8 | E2-S2.5 |
| T-15 | Block Management Page | Medium | Worker-5 | T-6, T-8 | E3-S3.1 |
| T-16 | Unblock UI | Medium | Worker-5 | T-15 | E3-S3.2 |
| T-17 | MyPage Auth Handoff | High | Worker-5 | T-15 | E3-S3.4 |

## Task Dependency DAG

```
T-1 (DB Schema) ──┬──► T-3 (Unrated API) ─────────────────────────────────┐
                   │                                                         │
                   ├──► T-4 (Rating API)                                    │
                   │                                                         │
                   ├──► T-5 (Block API) ──┬──► T-7 (Matching Filter)       │
                   │                      ├──► T-11 (Block Suggest) ◄──┐    │
                   │                      ├──► T-12 (Detail Block) ◄─┐ │    │
                   │                      └──► T-13 (Block Limit)    │ │    │
                   │                                                  │ │    │
                   └──► T-6 (Release API) ──► T-15 (Mgmt Page) ──► T-16 (Unblock)
                                                │                    │ │    │
                                                └──► T-17 (Auth)     │ │    │
                                                                     │ │    │
T-2 (Types) ──► T-8 (API Hooks) ──┬─────────────────────────────────┘ │    │
                                   ├──► T-14 (Confirm Dialog)          │    │
                                   ├──► T-9 (Popup UI) ──► T-10 (Reasons) ─┘
                                   └──► T-15 (Mgmt Page)
```

## Parallel Execution Groups

| Phase | Tasks | Workers | Notes |
|-------|-------|---------|-------|
| Phase 0 (Foundation) | T-1, T-2 | Worker-1, Worker-2 | Parallel — no dependencies |
| Phase 1 (APIs + Hooks) | T-3, T-4, T-5, T-6, T-8 | Worker-1, Worker-2 | T-3/T-4/T-5/T-6 parallel after T-1; T-8 after T-2 |
| Phase 2 (UI + Integration) | T-7, T-9, T-12, T-13, T-14, T-15 | Worker-3, Worker-4, Worker-5 | After respective API dependencies |
| Phase 3 (Composite UI) | T-10, T-11, T-16, T-17 | Worker-4, Worker-5 | After Phase 2 components |

---

## Task: T-1: DB Schema Migration
- **Entropy**: Low
- **Worker**: Worker-1
- **Dependencies**: None
- **Owned Files**:
  - backend/src/main/resources/db/migration/V{N}__create_lesson_ratings.sql
  - backend/src/main/resources/db/migration/V{N+1}__create_tutor_blocks.sql
  - backend/src/main/resources/db/migration/V{N+2}__create_rating_popup_tracking.sql
- **Story**: E4-S4.1 (DB Schema Migration)
- **AC**: AC-M1 (tables created), AC-B5 (indexes for matching query)
- **Subtasks**:
  1. [ ] Create Flyway migration for `lesson_ratings` table with UNIQUE(lesson_id), indexes on student_id and tutor_id
  2. [ ] Create Flyway migration for `tutor_blocks` table with partial unique index `WHERE is_active = TRUE`
  3. [ ] Create Flyway migration for `rating_popup_tracking` table with UNIQUE(student_id)
  4. [ ] Verify all tables follow EduTalk DB conventions (snake_case, BIGINT PK, created_at/updated_at)

## Task: T-2: Shared TypeScript Types
- **Entropy**: Low
- **Worker**: Worker-2
- **Dependencies**: None
- **Owned Files**:
  - packages/types/src/rating.ts
  - packages/types/src/tutor-block.ts
- **Story**: E4-S4.2 (Shared TypeScript Types)
- **AC**: AC-R2 (rating types), AC-B4 (block types)
- **Subtasks**:
  1. [ ] Define Rating types: SubmitRatingRequest, RatingResponse, UnratedLessonResponse, StarRating (1-5), PositiveReason enum, NegativeReason enum
  2. [ ] Define TutorBlock types: BlockTutorRequest, BlockListResponse, BlockedTutor, BlockCount, UnblockResponse, BlockSource enum, LanguageType enum
  3. [ ] Define Zod validation schemas for BFF validation
  4. [ ] Ensure types align with API design (architecture Section 4)

## Task: T-3: Unrated Lesson API
- **Entropy**: Medium
- **Worker**: Worker-1
- **Dependencies**: T-1
- **Owned Files**:
  - backend/src/main/java/com/edutalk/rating/controller/RatingController.java (GET /lessons/unrated)
  - backend/src/main/java/com/edutalk/rating/repository/RatingPopupTrackingRepository.java
  - backend/src/main/java/com/edutalk/rating/domain/RatingPopupTracking.java
  - backend/src/main/java/com/edutalk/rating/dto/UnratedLessonResponse.java
- **Story**: E1-S1.1 (Unrated Lesson Query API)
- **AC**: AC-R1, AC-R5
- **Subtasks**:
  1. [ ] Implement `GET /api/v1/lessons/unrated?limit=1` endpoint
  2. [ ] Query lessons WHERE status = FINISH AND lesson_id NOT IN lesson_ratings AND student_id = currentUser
  3. [ ] Check `rating_popup_tracking.last_shown_date` for popup_eligible (today vs last shown)
  4. [ ] Return lesson details (id, tutor_name, tutor_photo, language_type, scheduled_at) + popup_eligible flag
  5. [ ] Return empty response when no unrated lessons exist

## Task: T-4: Rating Submit API
- **Entropy**: Medium
- **Worker**: Worker-1
- **Dependencies**: T-1
- **Owned Files**:
  - backend/src/main/java/com/edutalk/rating/controller/RatingController.java (POST /lessons/{id}/ratings)
  - backend/src/main/java/com/edutalk/rating/service/RatingService.java
  - backend/src/main/java/com/edutalk/rating/repository/LessonRatingRepository.java
  - backend/src/main/java/com/edutalk/rating/domain/LessonRating.java
  - backend/src/main/java/com/edutalk/rating/dto/SubmitRatingRequest.java
- **Story**: E1-S1.2 (Rating Submit API)
- **AC**: AC-R2, AC-R3, AC-R4
- **Subtasks**:
  1. [ ] Implement `POST /api/v1/lessons/{lessonId}/ratings` endpoint
  2. [ ] Validate: star_rating 1-5, positive_reasons for 3-5 stars, negative_reasons for 1-2 stars
  3. [ ] Verify student participated in the lesson (403 if not)
  4. [ ] Return 409 ALREADY_RATED if rating exists
  5. [ ] Save rating and update rating_popup_tracking
  6. [ ] If block_tutor=true and star<=2, delegate to Block Service (atomic transaction)

## Task: T-5: Tutor Block API
- **Entropy**: High
- **Worker**: Worker-1
- **Dependencies**: T-1
- **Owned Files**:
  - backend/src/main/java/com/edutalk/block/controller/TutorBlockController.java (POST /tutor-blocks, GET /tutor-blocks)
  - backend/src/main/java/com/edutalk/block/service/TutorBlockService.java
  - backend/src/main/java/com/edutalk/block/repository/TutorBlockRepository.java
  - backend/src/main/java/com/edutalk/block/domain/TutorBlock.java
  - backend/src/main/java/com/edutalk/block/dto/BlockTutorRequest.java
  - backend/src/main/java/com/edutalk/block/dto/BlockListResponse.java
- **Story**: E2-S2.1 (Tutor Block API)
- **AC**: AC-B1, AC-B2, AC-B4, AC-B5
- **Subtasks**:
  1. [ ] Implement `POST /api/v1/tutor-blocks` — create block with tutor_id, language_type, block_source, optional lesson_id
  2. [ ] Enforce per-language limit (5): count active blocks WHERE student_id AND language_type AND is_active=true
  3. [ ] Return 422 BLOCK_LIMIT_EXCEEDED with current count, max, management_url
  4. [ ] Return 409 ALREADY_BLOCKED if active block exists
  5. [ ] Handle concurrent requests via UNIQUE constraint (partial index)
  6. [ ] Implement `GET /api/v1/tutor-blocks?language_type=EN` — list with tutor details + count info
  7. [ ] Join tutor_profiles for is_active status + tutor name/photo

## Task: T-6: Block Release API
- **Entropy**: Medium
- **Worker**: Worker-1
- **Dependencies**: T-1
- **Owned Files**:
  - backend/src/main/java/com/edutalk/block/controller/TutorBlockController.java (DELETE /tutor-blocks/{blockId})
  - backend/src/main/java/com/edutalk/block/dto/UnblockResponse.java
- **Story**: E3-S3.3 (Block Release API)
- **AC**: AC-M3, AC-M4, AC-M5
- **Subtasks**:
  1. [ ] Implement `DELETE /api/v1/tutor-blocks/{blockId}` endpoint
  2. [ ] Verify ownership: block.student_id must match JWT student_id (403 NOT_BLOCK_OWNER)
  3. [ ] Soft delete: set is_active=false, released_at=now()
  4. [ ] Return 404 BLOCK_NOT_FOUND if block doesn't exist or already released
  5. [ ] Preserve block history (no physical delete)

## Task: T-7: Matching Engine Block Filter
- **Entropy**: High
- **Worker**: Worker-3
- **Dependencies**: T-5
- **Owned Files**:
  - backend/src/main/java/com/edutalk/schedule/service/MatchingService.java (modification)
- **Story**: E2-S2.2 (Matching Engine Block Filter)
- **AC**: AC-B5, AC-B6
- **Server Start**: Existing matching service
- **Subtasks**:
  1. [ ] Add WHERE NOT IN (SELECT tutor_id FROM tutor_blocks WHERE student_id=? AND language_type=? AND is_active=true) to matching query
  2. [ ] Gate behind feature flag TUTOR_BLOCK_ENABLED
  3. [ ] Verify matching API p95 < 500ms with block filter
  4. [ ] Ensure 100% matching consistency (0 blocked tutors in results)
  5. [ ] Ensure all existing matching test suite passes

## Task: T-8: API Client Hooks
- **Entropy**: Medium
- **Worker**: Worker-2
- **Dependencies**: T-2
- **Owned Files**:
  - packages/api-client/src/hooks/useUnratedLesson.ts
  - packages/api-client/src/hooks/useSubmitRating.ts
  - packages/api-client/src/hooks/useTutorBlocks.ts
  - packages/api-client/src/hooks/useBlockTutor.ts
  - packages/api-client/src/hooks/useUnblockTutor.ts
- **Story**: E4-S4.3 (API Client Hooks)
- **AC**: AC-R1, AC-B2, AC-M3
- **Subtasks**:
  1. [ ] Implement useUnratedLesson() — TanStack Query, queryKey: ['lessons', 'unrated']
  2. [ ] Implement useSubmitRating() — mutation with optimistic update
  3. [ ] Implement useTutorBlocks(languageType) — queryKey: ['tutor-blocks', languageType]
  4. [ ] Implement useBlockTutor() — mutation, invalidate tutor-blocks cache on success
  5. [ ] Implement useUnblockTutor() — mutation, optimistic update, invalidate cache
  6. [ ] All hooks include error handling for 409, 422 status codes

## Task: T-9: Rating Popup UI
- **Entropy**: Medium
- **Worker**: Worker-4
- **Dependencies**: T-3, T-8
- **Owned Files**:
  - apps/web/src/app/(student)/reservation/_components/rating-popup/RatingPopup.tsx
  - apps/web/src/app/(student)/reservation/_components/rating-popup/StarRating.tsx
  - apps/web/src/app/(student)/reservation/_components/rating-popup/types.ts
  - apps/web/src/app/(student)/reservation/page.tsx (modification — add popup trigger)
- **Story**: E1-S1.3 (Rating Popup UI)
- **AC**: AC-R1, AC-R2, AC-R5, AC-R6
- **Subtasks**:
  1. [ ] RatingPopup.tsx — popup container with state machine (idle → star → reasons → submitted)
  2. [ ] StarRating.tsx — 1-5 star interactive selection
  3. [ ] Trigger on reservation page: if useUnratedLesson returns popup_eligible=true, show popup
  4. [ ] "Next" button saves star only via useSubmitRating
  5. [ ] Popup shown once per day (re-entry same day check via server response)
  6. [ ] Lazy load popup component (no LCP impact)

## Task: T-10: Reason Selector UI
- **Entropy**: Medium
- **Worker**: Worker-4
- **Dependencies**: T-9
- **Owned Files**:
  - apps/web/src/app/(student)/reservation/_components/rating-popup/ReasonSelector.tsx
- **Story**: E1-S1.4 (Reason Selector UI)
- **AC**: AC-R3, AC-R4
- **Subtasks**:
  1. [ ] Show 5 positive reasons (chip/tag multi-select) for 3-5 stars
  2. [ ] Show 6 negative reasons for 1-2 stars
  3. [ ] "Submit" button saves star + selected reasons
  4. [ ] "Skip" text link closes popup without saving
  5. [ ] X close button closes popup without saving

## Task: T-11: Block Suggestion UI
- **Entropy**: Medium
- **Worker**: Worker-4
- **Dependencies**: T-10, T-5
- **Owned Files**:
  - apps/web/src/app/(student)/reservation/_components/rating-popup/BlockSuggestion.tsx
- **Story**: E1-S1.5 (Block Suggestion Checkbox)
- **AC**: AC-B1, AC-B2
- **Subtasks**:
  1. [ ] Show checkbox only for 1-2 star ratings: "Don't match me with this tutor again"
  2. [ ] On submit with checkbox checked: save rating, then show block confirmation popup
  3. [ ] On block confirm: call useBlockTutor, show success toast
  4. [ ] On block cancel: save rating only (no block)
  5. [ ] Handle block limit exceeded (422) — show guidance message

## Task: T-12: Lesson Detail Block Button
- **Entropy**: Medium
- **Worker**: Worker-4
- **Dependencies**: T-5, T-8
- **Owned Files**:
  - apps/web/src/app/(student)/lesson/[id]/_components/BlockTutorButton.tsx
  - apps/web/src/app/(student)/lesson/[id]/page.tsx (modification — add button)
- **Story**: E2-S2.3 (Lesson Detail Block Button)
- **AC**: AC-B3
- **Subtasks**:
  1. [ ] Add "Block this tutor" button at bottom of lesson detail page
  2. [ ] Show "Blocked" disabled state if tutor already blocked
  3. [ ] On click: show block confirmation dialog
  4. [ ] On confirm: call useBlockTutor with block_source=LESSON_DETAIL
  5. [ ] Handle limit exceeded (422) — guidance message with management link

## Task: T-13: Block Limit Logic
- **Entropy**: Medium
- **Worker**: Worker-1
- **Dependencies**: T-5
- **Owned Files**:
  - (Part of TutorBlockService.java — shared with T-5)
- **Story**: E2-S2.4 (Block Limit Management Logic)
- **AC**: AC-B4
- **Subtasks**:
  1. [ ] Verify EN and JP limits are independent (5 each)
  2. [ ] GET /tutor-blocks response includes count: { current, max } per language
  3. [ ] Double-pack (EN+JP) students can block up to 10 total (5+5)
  4. [ ] Inactive tutors count toward limit
  5. [ ] Limit exceeded error includes management_url in response

## Task: T-14: Block Confirm Dialog
- **Entropy**: Low
- **Worker**: Worker-4
- **Dependencies**: T-8
- **Owned Files**:
  - apps/web/src/app/(student)/reservation/_components/rating-popup/BlockConfirmDialog.tsx
- **Story**: E2-S2.5 (Block Confirmation Popup)
- **AC**: AC-B2
- **Subtasks**:
  1. [ ] Reusable confirmation dialog: "Block this tutor? You will not be matched with them."
  2. [ ] "Confirm" / "Cancel" buttons
  3. [ ] On confirm: execute block callback + show success toast
  4. [ ] Shared by all entry points (rating popup, lesson detail, management page)

## Task: T-15: Block Management Page
- **Entropy**: Medium
- **Worker**: Worker-5
- **Dependencies**: T-6, T-8
- **Owned Files**:
  - apps/web/src/app/(student)/my/tutor-management/page.tsx
  - apps/web/src/app/(student)/my/tutor-management/layout.tsx
  - apps/web/src/app/(student)/my/tutor-management/_components/BlockedTutorList.tsx
  - apps/web/src/app/(student)/my/tutor-management/_components/BlockedTutorCard.tsx
- **Story**: E3-S3.1 (Block List Page)
- **AC**: AC-M1, AC-M2
- **Subtasks**:
  1. [ ] page.tsx — entry point with token verification (from MyPage URL param)
  2. [ ] layout.tsx — independent layout for React SPA (MyPage integration)
  3. [ ] BlockedTutorList.tsx — card list of blocked tutors via useTutorBlocks
  4. [ ] BlockedTutorCard.tsx — tutor name, photo, block date, last lesson date, "Inactive" label
  5. [ ] Show current/max block count (e.g., "3/5")
  6. [ ] Empty state message when no blocks
  7. [ ] Language tab filter (EN / JP)

## Task: T-16: Unblock UI
- **Entropy**: Medium
- **Worker**: Worker-5
- **Dependencies**: T-15
- **Owned Files**:
  - apps/web/src/app/(student)/my/tutor-management/_components/UnblockConfirmDialog.tsx
- **Story**: E3-S3.2 (Unblock Feature)
- **AC**: AC-M3, AC-M4
- **Subtasks**:
  1. [ ] "Unblock" button on each BlockedTutorCard
  2. [ ] Confirmation dialog: "Unblock this tutor? They may be matched with you again."
  3. [ ] On confirm: call useUnblockTutor, remove card from list, show toast
  4. [ ] Counter updates immediately (optimistic update)

## Task: T-17: MyPage Auth Handoff
- **Entropy**: High
- **Worker**: Worker-5
- **Dependencies**: T-15
- **Owned Files**:
  - apps/web/src/app/(student)/my/tutor-management/page.tsx (token handling part)
  - apps/legacy-web/... (MyPage menu link addition)
- **Story**: E3-S3.4 (MyPage to React SPA Auth)
- **AC**: AC-A1, AC-A2, AC-A3
- **Subtasks**:
  1. [ ] Add "Tutor Management" link in MyPage (Vue.js 2) menu under "Class Settings"
  2. [ ] Link passes one-time auth token as URL parameter
  3. [ ] React SPA page.tsx: extract token from URL, exchange for access token
  4. [ ] Invalidate URL token after exchange
  5. [ ] Token expired (>5min) or missing: redirect to login page
  6. [ ] Direct URL access without token: redirect to login page
