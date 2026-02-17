# Traceability Matrix: test-tutor-excl

## FR → Design → Task → BDD → API → DB

| FR | Design | Task | BDD | API | DB | Status |
|----|--------|------|-----|-----|----|--------|
| FR1 | design.md#RatingPopup | T-3, T-9 | rating.feature:Popup appears | GET /lessons/unrated | rating_popup_tracking | TRACED |
| FR1-1 | design.md#RatingPopup | T-3, T-9 | rating.feature:Once per day | GET /lessons/unrated | rating_popup_tracking | TRACED |
| FR1-2 | design.md#RatingPopup | T-3 | rating.feature:FINISH status | GET /lessons/unrated | lessons | TRACED |
| FR2 | design.md#StarRating | T-4, T-9 | rating.feature:1-star, 4-star | POST /lessons/{id}/ratings | lesson_ratings | TRACED |
| FR3 | design.md#ReasonSelector | T-4, T-10 | rating.feature:Positive reasons | POST /lessons/{id}/ratings | lesson_ratings.positive_reasons | TRACED |
| FR4 | design.md#ReasonSelector | T-4, T-10 | rating.feature:Negative reasons | POST /lessons/{id}/ratings | lesson_ratings.negative_reasons | TRACED |
| FR5 | design.md#RatingPopup | T-4, T-9 | rating.feature:Star only, Submit | POST /lessons/{id}/ratings | lesson_ratings | TRACED |
| FR5-1 | design.md#RatingPopup | T-4, T-9 | rating.feature:Star only then skip | POST /lessons/{id}/ratings | lesson_ratings | TRACED |
| FR5-2 | design.md#RatingPopup | T-4, T-10 | rating.feature:4-star with reasons | POST /lessons/{id}/ratings | lesson_ratings | TRACED |
| FR5-3 | design.md#RatingPopup | T-9 | rating.feature:Skip, X close | - | - | TRACED |
| FR6 | design.md#RatingPopup | T-9 | rating.feature:Skip text link | - | - | TRACED |
| FR7 | design.md#BlockSuggestion | T-11 | tutor-block.feature:Checkbox 1-2 stars | POST /lessons/{id}/ratings (block_tutor) | tutor_blocks | TRACED |
| FR8 | design.md#BlockTutorButton | T-12 | tutor-block.feature:Lesson detail block | POST /tutor-blocks | tutor_blocks | TRACED |
| FR9 | design.md#TutorManagement | T-15 | tutor-block.feature:Management block | POST /tutor-blocks | tutor_blocks | TRACED |
| FR10 | design.md#MatchingEngine | T-7 | tutor-block.feature:Excluded from matching | POST /schedules/match (modified) | tutor_blocks | TRACED |
| FR10-1 | design.md#MatchingEngine | T-7 | tutor-block.feature:New reservations only | POST /schedules/match | tutor_blocks | TRACED |
| FR10-2 | design.md#MatchingEngine | T-7 | tutor-block.feature:Existing unaffected | - | schedules | TRACED |
| FR11 | design.md#BlockLimit | T-5, T-13 | block-limit.feature:Limit enforced | POST /tutor-blocks (422) | tutor_blocks | TRACED |
| FR11-1 | design.md#BlockLimit | T-13 | block-limit.feature:Independent limits | POST /tutor-blocks | tutor_blocks | TRACED |
| FR11-2 | design.md#BlockLimit | T-13 | block-limit.feature:Guidance message | POST /tutor-blocks (422) | - | TRACED |
| FR12 | design.md#BlockConfirmDialog | T-14 | tutor-block.feature:Confirmation popup | - | - | TRACED |
| FR13 | design.md#BlockedTutorList | T-15 | block-management.feature:View list | GET /tutor-blocks | tutor_blocks | TRACED |
| FR13-1 | design.md#BlockedTutorCard | T-15 | block-management.feature:Card details | GET /tutor-blocks | tutor_blocks, tutor_profiles | TRACED |
| FR13-2 | design.md#BlockedTutorCard | T-15 | block-management.feature:Inactive label | GET /tutor-blocks | tutor_profiles.is_active | TRACED |
| FR13-3 | design.md#BlockLimit | T-13 | block-limit.feature:Inactive counts | - | tutor_blocks | TRACED |
| FR14 | design.md#UnblockConfirmDialog | T-6, T-16 | block-management.feature:Unblock | DELETE /tutor-blocks/{id} | tutor_blocks | TRACED |
| FR14-1 | design.md#UnblockConfirmDialog | T-16 | block-management.feature:Unblock confirm | - | - | TRACED |
| FR14-2 | design.md#MatchingEngine | T-6, T-7 | block-management.feature:Returns to pool | DELETE /tutor-blocks/{id} | tutor_blocks.is_active | TRACED |
| FR15 | design.md#SoftDelete | T-6 | block-management.feature:History preserved | DELETE /tutor-blocks/{id} | tutor_blocks (soft delete) | TRACED |
| FR16 | design.md#AuthHandoff | T-17 | auth-handoff.feature:Token handoff | POST /auth/exchange | - | TRACED |

## Coverage Summary

| Category | Total | Traced | Gap |
|----------|-------|--------|-----|
| Functional Requirements | 26 (incl. sub-FRs) | 26 | 0 |
| BDD Scenarios | 37 | 37 | - |
| API Endpoints | 5 new + 1 modified | 6 | 0 |
| DB Tables | 3 new + 3 existing | 6 | 0 |
| Tasks | 17 | 17 | 0 |

**Traceability Gaps: 0** — All FRs have full coverage chains.
