# Decision Log: test-tutor-excl

## ADR-001: New Rating Endpoint Instead of Extending Feedback

**Context**: EduTalk has an existing `POST /lessons/{lessonId}/feedback` endpoint that saves NPS-style feedback (1-10 scale) to the `lesson_feedbacks` table.

**Decision**: Create a new `POST /lessons/{lessonId}/ratings` endpoint with a new `lesson_ratings` table.

**Consequences**:
- (+) Different data structure (1-5 stars + reason codes vs NPS 1-10): no awkward migration
- (+) Existing NPS reporting system remains unaffected
- (+) Parallel operation during transition period
- (-) Two feedback systems temporarily coexist
- (-) Future consolidation may be needed

## ADR-002: Block Filter via WHERE NOT IN in Matching Query

**Context**: The matching engine selects tutors from a weighted pool. Blocked tutors must be excluded.

**Decision**: Add `WHERE id NOT IN (SELECT tutor_id FROM tutor_blocks WHERE student_id=? AND language_type=? AND is_active=true)` to the matching query.

**Consequences**:
- (+) Simplest possible implementation
- (+) Max 5 items in subquery: negligible performance impact
- (+) No cache invalidation complexity
- (+) Existing partial index `(student_id, language_type) WHERE is_active = TRUE` optimizes the subquery
- (-) Direct coupling between matching engine and block table
- (-) If limit increases significantly (>50), join approach should be considered

## ADR-003: URL Parameter Token for MyPage to React SPA Handoff

**Context**: MyPage is a Vue.js 2 legacy app. The new Tutor Management page is a React SPA. Session sharing between the two is complex.

**Decision**: MyPage generates a one-time auth token passed via URL parameter. React SPA exchanges it for an access token.

**Consequences**:
- (+) Minimal legacy code modification (one link addition)
- (+) Independent authentication, no session sharing needed
- (+) Natural migration path when Nuxt.js 2 is replaced (Q2 2026)
- (-) Token expiry handling needed (5-minute window)
- (-) Minor UX discontinuity between apps

## ADR-004: Soft Delete for Block Records

**Context**: Block history must be preserved for admin pattern analysis even after unblock.

**Decision**: Use `is_active` boolean + `released_at` timestamp. Unblock sets `is_active=false, released_at=NOW()`. Re-block creates a new record.

**Consequences**:
- (+) Full history trail for admin analytics
- (+) Simple re-block semantics (new record)
- (+) Partial unique index `WHERE is_active = TRUE` prevents duplicate active blocks
- (-) Data accumulates over time (acceptable given low volume)

## ADR-005: Server-Side Popup Tracking with KST Midnight Reset

**Context**: "Once per day" popup display requires a time reference. Could be client-side (localStorage) or server-side (DB).

**Decision**: Server-side tracking via `rating_popup_tracking` table with `last_shown_date` (DATE type, KST timezone).

**Consequences**:
- (+) Consistent across devices and sessions
- (+) Prevents client-side time manipulation
- (+) Simple midnight reset logic (DATE comparison)
- (-) Additional DB table and query per Reservation tab entry
- (-) Edge case around midnight (acceptable)
