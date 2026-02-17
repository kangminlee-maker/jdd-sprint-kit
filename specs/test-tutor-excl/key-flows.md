# Key Flows: test-tutor-excl

## Flow 1: Post-Lesson Rating with Tutor Block (Happy Path)

Lesson completed → Reservation tab entry → Rating popup → 1 star → Negative reasons → Block checkbox → Submit → Confirm block → Tutor excluded from matching

1. Student completes a lesson (status: FINISH)
2. Student enters the Reservation tab
3. System calls `GET /lessons/unrated?limit=1` to check for unrated lessons
4. System receives lesson data with `popup_eligible: true`
5. Rating popup appears: "How was today's lesson?"
6. Student selects **1 star**
7. Screen transitions to negative reason selection (6 options)
8. Student selects "ONE_SIDED_TALK"
9. "Don't match me with this tutor again" checkbox appears (only for 1-2 stars)
10. Student checks the block checkbox
11. Student clicks **Submit**
12. System calls `POST /lessons/{lessonId}/ratings` with `{ star_rating: 1, negative_reasons: ["ONE_SIDED_TALK"], block_tutor: true }`
13. System receives `{ id, block_created: true, block_id }` from response
14. Block confirmation toast: "Block complete! This tutor will not be matched with you."
15. Next reservation: `POST /schedules/match` excludes the blocked tutor from pool

## Flow 2: Direct Block from Lesson Detail (Happy Path)

Lesson history → Lesson detail page → Block button → Confirm → Tutor blocked

1. Student opens lesson history (past lessons list)
2. Student taps a specific past lesson to view details
3. Lesson detail page shows tutor info, lesson date, and "Block this tutor" button at bottom
4. Student clicks **"Block this tutor"**
5. Confirmation dialog appears: "Block this tutor? You will not be matched with them."
6. Student clicks **Confirm**
7. System calls `POST /tutor-blocks` with `{ tutor_id, language_type: "EN", block_source: "LESSON_DETAIL", lesson_id }`
8. System receives `{ id, tutor_id, blocked_at }`
9. Toast: "Block complete!"
10. Button state changes to "Blocked" (disabled)

## Flow 3: Block Limit Reached → Management → Unblock → Re-block (Edge Case)

Attempt to block 6th tutor → Limit error → Navigate to management → Unblock inactive → Return and block

1. Student has 5 EN tutors already blocked
2. Student rates a lesson 2 stars and checks block checkbox
3. System calls `POST /lessons/{lessonId}/ratings` with `block_tutor: true`
4. System receives `422 BLOCK_LIMIT_EXCEEDED { current: 5, max: 5, management_url: "/my/tutor-management" }`
5. Rating is saved (star + reasons), but block is NOT created
6. Guidance message: "EN tutor block limit (5) reached. Manage your blocks to free up a slot."
7. Student clicks management page link
8. Student navigates to MyPage > Class Settings > Tutor Management
9. System calls `GET /tutor-blocks?language_type=EN`
10. System receives list with count `{ EN: { current: 5, max: 5 } }`
11. Management page displays 5 blocked tutor cards, one marked "Inactive"
12. Student clicks **Unblock** on the inactive tutor
13. Confirmation dialog: "Unblock this tutor? They may be matched with you again."
14. Student confirms
15. System calls `DELETE /tutor-blocks/{blockId}`
16. System receives `{ id, released_at }`
17. Card removed, counter updates to 4/5
18. Student returns to Reservation tab and re-attempts block

## Flow 4: Positive Rating with Skip (Edge Case)

Enter Reservation tab → Rating popup → 4 stars → Next → Skip reasons → Star saved only

1. Student enters the Reservation tab after a good lesson
2. Rating popup appears
3. Student selects **4 stars**
4. Student clicks **Next**
5. System calls `POST /lessons/{lessonId}/ratings` with `{ star_rating: 4 }` (star only saved)
6. Positive reason selection screen appears (5 options)
7. Student clicks **Skip** text link (doesn't want to select reasons)
8. Popup closes
9. Star rating (4) is already saved; no additional data saved
10. No block suggestion shown (block only for 1-2 stars)

## Flow 5: MyPage Auth Handoff (Token Flow)

MyPage menu → Token URL → React SPA → Token exchange → Authenticated access

1. Student is on MyPage (Vue.js 2 legacy app)
2. Student clicks "Tutor Management" under "Class Settings"
3. MyPage generates a one-time auth token
4. Browser navigates to `/my/tutor-management?token=xxx`
5. React SPA extracts token from URL parameter
6. System exchanges token for access token (internal API call)
7. URL token is invalidated after exchange
8. React SPA stores access token and loads blocked tutor list
9. If token is expired (>5 min) or missing: redirect to login page
