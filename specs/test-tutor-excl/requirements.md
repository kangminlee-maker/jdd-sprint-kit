# Requirements: test-tutor-excl

## Functional Requirements

### Post-Lesson Rating

| ID | Requirement | Priority | Entropy | Source | Classification |
|----|------------|----------|---------|--------|---------------|
| FR1 | Student can see a rating popup for unrated lessons when entering the Reservation tab | P0 | Medium | BRIEF-1 | core |
| FR1-1 | Popup is shown once per day, only for the most recent unrated lesson | P0 | Low | BRIEF-1 | core |
| FR1-2 | Popup is shown only for lessons with FINISH status | P0 | Low | BRIEF-1 | core |
| FR2 | Student can rate a lesson with 1-5 star rating | P0 | Low | BRIEF-2 | core |
| FR3 | Student can select multiple positive reasons (3-5 stars) | P0 | Low | BRIEF-2 | enabling |
| FR4 | Student can select multiple negative reasons (1-2 stars) | P0 | Low | BRIEF-2 | enabling |
| FR5 | System can save rating data incrementally | P0 | Medium | BRIEF-2 | enabling |
| FR5-1 | Clicking "Next" saves star rating only | P0 | Low | BRIEF-2 | enabling |
| FR5-2 | Clicking "Submit" saves star rating + reasons | P0 | Low | BRIEF-2 | enabling |
| FR5-3 | Skip or X-close saves nothing | P0 | Low | BRIEF-2 | enabling |
| FR6 | Student can skip the rating (shown as text link) | P1 | Low | BRIEF-1 | supporting |

### Tutor Block

| ID | Requirement | Priority | Entropy | Source | Classification |
|----|------------|----------|---------|--------|---------------|
| FR7 | Student can see "Don't match me with this tutor again" checkbox on negative rating (1-2 stars) | P0 | Low | BRIEF-3 | core |
| FR8 | Student can block a tutor directly from lesson history detail page | P0 | Medium | BRIEF-5 | core |
| FR9 | Student can block a tutor from the block management page | P1 | Low | BRIEF-7 | supporting |
| FR10 | System immediately excludes blocked tutors from matching pool | P0 | High | BRIEF-4 | core |
| FR10-1 | Block applies to new reservations after the block timestamp only | P0 | Medium | BRIEF-4 | core |
| FR10-2 | Existing scheduled lessons are not affected | P0 | Low | BRIEF-4 | core |
| FR11 | System enforces a maximum of 5 blocks per language | P0 | Medium | BRIEF-6 | enabling |
| FR11-1 | EN and JP block limits are independent | P0 | Low | BRIEF-6 | enabling |
| FR11-2 | When limit exceeded, show guidance message with link to management page | P0 | Low | BRIEF-6 | enabling |
| FR12 | System shows confirmation popup before blocking | P1 | Low | AI-inferred | supporting |

### Block Management

| ID | Requirement | Priority | Entropy | Source | Classification |
|----|------------|----------|---------|--------|---------------|
| FR13 | Student can view blocked tutor list on the management page | P0 | Medium | BRIEF-7 | core |
| FR13-1 | Display tutor name, profile photo, block timestamp, last lesson date | P0 | Low | BRIEF-7 | core |
| FR13-2 | Inactive (resigned/long-term leave) tutors show "Inactive" label | P0 | Low | BRIEF-7 | core |
| FR13-3 | Inactive tutors count toward block limit | P0 | Low | BRIEF-7 | core |
| FR14 | Student can unblock a blocked tutor | P0 | Medium | BRIEF-8 | core |
| FR14-1 | Unblock shows confirmation popup | P0 | Low | BRIEF-8 | core |
| FR14-2 | Unblocked tutor returns to matching pool | P0 | Low | BRIEF-8 | core |
| FR15 | System preserves block history after unblock (soft delete) for admin review | P1 | Low | DISC-01 | enabling |

### Authentication Integration

| ID | Requirement | Priority | Entropy | Source | Classification |
|----|------------|----------|---------|--------|---------------|
| FR16 | System can pass auth token via URL parameter from MyPage (Vue.js 2) to Tutor Management page (React SPA) | P0 | High | DISC-01 | enabling |

## Non-Functional Requirements

### Performance

| ID | Requirement | Target | Measurement |
|----|------------|--------|-------------|
| NFR1 | Rating popup rendering time | < 200ms (p95) | Datadog RUM: popup component mount time |
| NFR2 | Matching API response time with block filter | < 500ms (p95) | Datadog APM: `/schedules/match` endpoint |
| NFR3 | Block management page initial load | < 1s (p95) | Datadog RUM: React SPA initial render |
| NFR4 | Block/unblock API response time | < 300ms (p95) | Datadog APM: `/tutor-blocks` endpoint |

### Reliability

| ID | Requirement | Target | Measurement |
|----|------------|--------|-------------|
| NFR5 | Block-to-matching exclusion consistency | 100% | Daily batch: cross-verify block records vs matching results |
| NFR6 | Concurrent block/unblock race condition prevention | 0 duplicates | Pessimistic lock or UNIQUE constraint |
| NFR7 | Rating data loss | 0 records lost | Client retry + server logging on save failure |

### Integration

| ID | Requirement | Target | Measurement |
|----|------------|--------|-------------|
| NFR8 | Backward compatibility with existing matching API | 100% existing tests pass | Existing matching test suite |
| NFR9 | MyPage to React SPA token failure handling | Redirect to login | E2E test scenario |
| NFR10 | Coexistence with existing lesson_feedbacks data | No data loss | Migration script verification |

### Security

| ID | Requirement | Target | Measurement |
|----|------------|--------|-------------|
| NFR11 | Block API authorization — own blocks only | student_id verified from JWT | API authorization test |
| NFR12 | URL parameter token single-use invalidation | Token invalid after exchange | Token reuse attempt test |

## Acceptance Criteria Summary

### Post-Lesson Rating
- AC-R1: Entering Reservation tab with unrated FINISH lesson and popup_eligible=true triggers rating popup
- AC-R2: Star rating (1-5) selection UI displays correctly
- AC-R3: "Next" button saves star only; "Submit" saves star + reasons; Skip/X saves nothing
- AC-R4: Positive reasons (5 options) appear for 3-5 stars; Negative reasons (6 options) appear for 1-2 stars
- AC-R5: Popup shows once per day (re-entry same day does not re-trigger)
- AC-R6: Popup renders within 200ms (p95)

### Tutor Block
- AC-B1: "Don't match me again" checkbox appears only for 1-2 star ratings
- AC-B2: Checking block + submit triggers confirmation popup, then creates block on confirm
- AC-B3: Lesson detail page shows "Block this tutor" button; shows "Blocked" when already blocked
- AC-B4: Block limit of 5 per language enforced; exceeding shows guidance with management link
- AC-B5: Blocked tutor appears 0 times in subsequent matching results
- AC-B6: Already-scheduled lessons unaffected by new blocks

### Block Management
- AC-M1: Management page displays blocked tutors with name, photo, block date, last lesson date
- AC-M2: Inactive tutors show "Inactive" label
- AC-M3: Unblock button triggers confirmation, then soft-deletes block record
- AC-M4: After unblock, tutor returns to matching pool; counter updates immediately
- AC-M5: Block history preserved after unblock (admin query)

### Authentication
- AC-A1: MyPage menu link passes one-time token via URL parameter
- AC-A2: React SPA exchanges token for access token on entry
- AC-A3: Token expired (5min) or missing redirects to login page
