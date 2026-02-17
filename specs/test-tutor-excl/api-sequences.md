# API Sequence Diagrams: test-tutor-excl

## Sequence 1: Post-Lesson Rating with Block

Rating popup trigger → star rating → reason selection → block suggestion → submission.

```mermaid
sequenceDiagram
    actor Student
    participant WebApp as Web App (Next.js)
    participant BFF as BFF (Hono)
    participant Backend as Backend (Spring Boot)
    participant DB as PostgreSQL

    Student->>WebApp: Enter Reservation Tab
    WebApp->>BFF: GET /api/v1/lessons/unrated?limit=1
    BFF->>Backend: GET /lessons/unrated
    Backend->>DB: SELECT lesson WHERE status=FINISH<br/>AND NOT IN lesson_ratings<br/>AND student_id=?
    DB-->>Backend: lesson data
    Backend->>DB: SELECT last_shown_date<br/>FROM rating_popup_tracking
    DB-->>Backend: tracking data
    Backend-->>BFF: { lesson, popup_eligible }
    BFF-->>WebApp: 200 UnratedLessonResponse

    alt popup_eligible = true
        WebApp->>Student: Show Rating Popup
        Student->>WebApp: Select 1 star
        Student->>WebApp: Select negative reasons
        Student->>WebApp: Check "Block this tutor"
        Student->>WebApp: Click Submit

        WebApp->>BFF: POST /api/v1/lessons/{id}/ratings<br/>{ star_rating: 1, negative_reasons, block_tutor: true }
        BFF->>Backend: POST /lessons/{id}/ratings
        Backend->>DB: INSERT INTO lesson_ratings
        DB-->>Backend: rating saved
        Backend->>DB: INSERT INTO tutor_blocks<br/>(block_source=RATING_POPUP)
        DB-->>Backend: block saved
        Backend->>DB: UPSERT rating_popup_tracking<br/>(last_shown_date=today)
        DB-->>Backend: tracking updated
        Backend-->>BFF: 201 { id, block_created: true, block_id }
        BFF-->>WebApp: 201 RatingResponse
        WebApp->>Student: Show "Block Confirmed" toast
    else popup_eligible = false
        WebApp->>Student: No popup shown
    end
```

## Sequence 2: Direct Block from Lesson Detail

Student blocks a tutor directly from the lesson history detail page.

```mermaid
sequenceDiagram
    actor Student
    participant WebApp as Web App (Next.js)
    participant BFF as BFF (Hono)
    participant Backend as Backend (Spring Boot)
    participant DB as PostgreSQL

    Student->>WebApp: Open Lesson Detail Page
    WebApp->>Student: Show page with "Block this tutor" button

    Student->>WebApp: Click "Block this tutor"
    WebApp->>Student: Show Confirmation Dialog

    Student->>WebApp: Confirm block

    WebApp->>BFF: POST /api/v1/tutor-blocks<br/>{ tutor_id, language_type, block_source: LESSON_DETAIL, lesson_id }
    BFF->>Backend: POST /tutor-blocks

    Backend->>DB: SELECT COUNT(*) FROM tutor_blocks<br/>WHERE student_id=? AND language_type=?<br/>AND is_active=true
    DB-->>Backend: count

    alt count < 5
        Backend->>DB: INSERT INTO tutor_blocks
        DB-->>Backend: block saved
        Backend-->>BFF: 201 { id, tutor_id, blocked_at }
        BFF-->>WebApp: 201 BlockResponse
        WebApp->>Student: Show "Blocked" toast<br/>Button changes to "Blocked" state
    else count >= 5
        Backend-->>BFF: 422 BLOCK_LIMIT_EXCEEDED
        BFF-->>WebApp: 422 Error
        WebApp->>Student: Show limit guidance<br/>with management page link
    end
```

## Sequence 3: Block Management - List and Unblock

Student views blocked tutors and unblocks one.

```mermaid
sequenceDiagram
    actor Student
    participant MyPage as MyPage (Vue.js 2)
    participant WebApp as Tutor Management (React SPA)
    participant BFF as BFF (Hono)
    participant Backend as Backend (Spring Boot)
    participant DB as PostgreSQL

    Student->>MyPage: Click "Tutor Management" in menu
    MyPage->>WebApp: Redirect with one-time token<br/>/my/tutor-management?token=xxx

    WebApp->>BFF: POST /api/v1/auth/exchange<br/>{ token: xxx }
    BFF->>Backend: Exchange token
    Backend-->>BFF: { access_token }
    BFF-->>WebApp: 200 Access Token

    WebApp->>BFF: GET /api/v1/tutor-blocks?language_type=EN
    BFF->>Backend: GET /tutor-blocks
    Backend->>DB: SELECT tb.*, tp.name, tp.photo, tp.is_active<br/>FROM tutor_blocks tb<br/>JOIN tutor_profiles tp<br/>WHERE student_id=? AND tb.is_active=true
    DB-->>Backend: blocked tutor list
    Backend-->>BFF: 200 { blocks, count }
    BFF-->>WebApp: 200 BlockListResponse
    WebApp->>Student: Display blocked tutor cards<br/>(3/5 EN blocked)

    Student->>WebApp: Click "Unblock" on inactive tutor
    WebApp->>Student: Show Unblock Confirmation Dialog
    Student->>WebApp: Confirm unblock

    WebApp->>BFF: DELETE /api/v1/tutor-blocks/502
    BFF->>Backend: DELETE /tutor-blocks/502
    Backend->>DB: UPDATE tutor_blocks<br/>SET is_active=false, released_at=NOW()<br/>WHERE id=502 AND student_id=?
    DB-->>Backend: updated
    Backend-->>BFF: 200 { id: 502, released_at }
    BFF-->>WebApp: 200 UnblockResponse
    WebApp->>Student: Remove card, update counter (2/5)<br/>Show "Unblocked" toast
```

## Sequence 4: Matching with Block Filter

How the matching engine excludes blocked tutors.

```mermaid
sequenceDiagram
    actor Student
    participant WebApp as Web App (Next.js)
    participant Backend as Backend (Spring Boot)
    participant DB as PostgreSQL

    Student->>WebApp: Request lesson reservation
    WebApp->>Backend: POST /api/v1/schedules/match<br/>{ language_type: EN, preferred_time }

    Backend->>DB: SELECT tutor_id FROM tutor_blocks<br/>WHERE student_id=? AND language_type='EN'<br/>AND is_active=true
    DB-->>Backend: blocked_tutor_ids [201, 202, 203]

    Backend->>DB: SELECT * FROM tutors<br/>WHERE available=true<br/>AND language='EN'<br/>AND id NOT IN (201, 202, 203)
    DB-->>Backend: available tutors (excluding blocked)

    Backend->>Backend: Weighted random selection<br/>from filtered pool

    Backend-->>WebApp: 200 { matched_tutor }
    WebApp->>Student: Show matched tutor<br/>(guaranteed not blocked)
```
