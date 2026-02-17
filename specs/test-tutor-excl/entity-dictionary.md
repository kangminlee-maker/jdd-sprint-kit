# Entity Dictionary: test-tutor-excl

| Domain Term (Korean) | English Name | DB Table | API Resource | React Component | BDD Actor |
|---------------------|-------------|----------|-------------|----------------|-----------|
| 수강생 | Student | users (role=STUDENT) | /users/me | - | Student |
| 튜터 | Tutor | users (role=TUTOR) | - | TutorCard | Tutor |
| 튜터 프로필 | TutorProfile | tutor_profiles | - | BlockedTutorCard | - |
| 수업 | Lesson | lessons | /lessons | - | - |
| 수업 후 평가 | LessonRating | lesson_ratings | /lessons/{id}/ratings | RatingPopup | - |
| 별점 | StarRating | lesson_ratings.star_rating | - | StarRating | - |
| 긍정 사유 | PositiveReason | lesson_ratings.positive_reasons | - | ReasonSelector | - |
| 부정 사유 | NegativeReason | lesson_ratings.negative_reasons | - | ReasonSelector | - |
| 튜터 차단 | TutorBlock | tutor_blocks | /tutor-blocks | BlockTutorButton | - |
| 차단 소스 | BlockSource | tutor_blocks.block_source | - | - | - |
| 차단 한도 | BlockLimit | (computed: 5/language) | /tutor-blocks count | - | - |
| 차단 관리 | BlockManagement | - | /tutor-blocks | BlockedTutorList | - |
| 평가 팝업 추적 | PopupTracking | rating_popup_tracking | /lessons/unrated | - | - |
| 미평가 수업 | UnratedLesson | (query result) | /lessons/unrated | RatingPopup | - |
| 매칭 | Matching | schedules (match result) | /schedules/match | - | System |
| 수강권 | Ticket | tickets | - | - | - |
| 구독 | Subscription | subscriptions | - | - | - |
| 언어 유형 | LanguageType | (enum: EN, JP) | - | - | - |

## BlockSource Enum Values

| Value | Description | Entry Point |
|-------|------------|-------------|
| RATING_POPUP | 수업 후 평가 팝업에서 차단 | Rating popup block suggestion |
| LESSON_DETAIL | 수업 이력 상세에서 차단 | Lesson detail page button |
| MANAGEMENT_PAGE | 차단 관리 페이지에서 차단 | Tutor management page |

## Positive Reasons (3~5 star)

| Value | Display (Korean) |
|-------|-----------------|
| CLEAR_EXPLANATION | 설명이 명확했어요 |
| GOOD_PRONUNCIATION | 발음 교정이 도움됐어요 |
| FRIENDLY_ATMOSPHERE | 분위기가 편안했어요 |
| HELPFUL_CORRECTION | 틀린 표현을 잘 고쳐줬어요 |
| GOOD_PACE | 수업 속도가 적당했어요 |

## Negative Reasons (1~2 star)

| Value | Display (Korean) |
|-------|-----------------|
| ONE_SIDED_TALK | 튜터가 일방적으로 대화를 이끌었어요 |
| POOR_PRONUNCIATION | 발음이 부정확했어요 |
| NO_CORRECTION | 틀린 표현을 교정해주지 않았어요 |
| UNCOMFORTABLE | 수업 분위기가 불편했어요 |
| SLOW_PACE | 수업 진행이 너무 느렸어요 |
| FAST_PACE | 수업 진행이 너무 빨랐어요 |
