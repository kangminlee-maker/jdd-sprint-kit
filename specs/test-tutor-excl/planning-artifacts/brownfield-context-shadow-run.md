---
feature: test-tutor-excl
scan_metadata:
  topology: co-located
  merge_priority: local
  local_stages_executed: [1, 2, 3, 4]
  external_sources:
    attempted: ["backend-docs", "client-docs", "svc-map"]
    succeeded: ["backend-docs", "client-docs", "svc-map"]
layers:
  - name: L1
    source_step: auto-sprint/brownfield-scan-pass-1
    created_at: 2026-02-20
    search_keywords:
      - 튜터
      - 차단
      - 매칭
      - 평가
      - NPS
      - 수업 후
      - 예약
      - MyPage
      - 수업 이력
      - 레슨
    sources:
      - type: local-path
        name: backend-docs (podo-backend)
      - type: local-path
        name: client-docs (podo-app)
      - type: local-path
        name: svc-map (podo_svc_map)
    discovered:
      domain_concepts: 12
      user_flows: 6
      screen_ids: ["23:679", "23:523", "23:89"]
  - name: L2
    source_step: auto-sprint/brownfield-scan-pass-1
    created_at: 2026-02-20
    search_keywords:
      - PodoScheduleServiceV2
      - TutorComparable
      - MatchingWeight
      - GT_TUTOR
      - le_matching_weight
      - booking
      - reservation
      - class-report
      - tutor-profile
      - completed-lessons
    sources:
      - type: local-path
        name: backend-docs (podo-backend)
      - type: local-path
        name: client-docs (podo-app)
      - type: local-path
        name: svc-map (podo_svc_map)
    discovered:
      existing_apis: 14
      existing_components: 8
      domain_rules: 6
data_sources:
  document-project: not-configured
  local-codebase: ok
  backend-docs: ok
  client-docs: ok
  svc-map: ok
  figma: not-configured
gaps:
  - type: new-feature
    keyword: "tutor_exclusion"
    severity: LOW
    note: "튜터 차단(제외) 기능은 기존 시스템에 없는 완전 신규 기능. 차단 테이블, API, UI 모두 새로 구현 필요."
  - type: new-feature
    keyword: "post_lesson_rating"
    severity: LOW
    note: "수업 후 별점 평가 팝업은 기존 시스템에 없음. 기존 lesson-review는 수업 리포트 내 리뷰(텍스트)이며, 별점+사유 선택 팝업과는 다른 기능."
  - type: new-feature
    keyword: "block_management_page"
    severity: LOW
    note: "차단 관리 페이지(React SPA)는 신규. MyPage(Vue.js 2 레거시)에서 링크로 연결하는 구조."
  - type: data-absent
    keyword: "mypage_vue_source"
    severity: MEDIUM
    note: "MyPage(Vue.js 2 레거시) 소스코드가 apps/legacy-web/pages/app/user/podo/mypage/ 에 존재하나, 튜터 관리 메뉴는 현재 없음. 새 메뉴 추가 방식 확인 필요."
---

## L1: Domain Concept Layer

### Customer Journey Position

- **Flow**: 정규레슨 플로우 (Regular Lesson Flow)
- **Position**: 수업 완료 후 → 평가 → 차단 결정 → 이후 매칭에서 제외
- **Screen IDs**: `23:679` (이 튜터 다시 만나지 않기+튜터 NPS 개선), `23:523` (수업 완료 화면)
- **Adjacent Flows**: 정규레슨 예약, 기타 > 마이포도 플로우 (13 screens)

(source: local-path/svc-map — brownfield_map.md, flow_order.json)

### Domain Concepts Found

| Concept | Source | Reference |
|---------|--------|-----------|
| 튜터 (Tutor) | backend-docs | `GT_TUTOR` table, `Tutor.java` entity — id, name, language, type, classPause, canUse, customMatchingValue 등 (source: local-path/backend-docs — Tutor.java) |
| 수강생 (Student/User) | backend-docs | `User` entity — userId 기반 수업 예약 및 매칭 대상 (source: local-path/backend-docs — UserInfoService.java) |
| 수업 (Lecture/Class) | backend-docs | `Lecture` entity — classId 기반, 상태 관리 (LectureStatus), AI 진단 이벤트 포함 (source: local-path/backend-docs — Lecture.java) |
| 매칭 (Matching) | backend-docs | `Matching.java` DTO — tutorId, studentId, classId 조합. `PodoScheduleServiceV2.getMatchingTutors()` 로 매칭 튜터 목록 조회 (source: local-path/backend-docs — Matching.java) |
| 매칭 가중치 (MatchingWeight) | backend-docs | `le_matching_weight` table — PRICE, SCHEDULE, NPS, CURRICULUM 4가지 가중치 타입. 튜터 매칭 우선순위 결정 요소 (source: local-path/backend-docs — MatchingWeight.java) |
| 튜터 비교/정렬 (TutorComparable) | backend-docs | `TutorComparable.java` — priceFactor, scheduleFactor, **npsFactor**, curriculumFactor 4가지 요소로 score 계산. 동점 시 랜덤 (source: local-path/backend-docs — TutorComparable.java) |
| 스케줄 (Schedule) | backend-docs | `PodoScheduleServiceV2` — 수업 예약, 취소, 변경, 튜터 스케줄 관리. `book()`, `cancel()`, `change()` 핵심 메서드 (source: local-path/backend-docs — PodoScheduleServiceV2.java) |
| 예약 탭 (Booking/Reservation) | client-docs | `/booking` (수업 예약), `/reservation` (예약 내역) — Next.js App Router (source: local-path/client-docs — apps/web/src/app/(internal)/booking/) |
| 수업 이력 (Completed Lessons) | client-docs | `CompletedLessonsSection` 위젯 — 지난 레슨 목록, RegularLessonCard/SmartTalkLessonCard 분기 (source: local-path/client-docs — completed-lessons-section.tsx) |
| 튜터 프로필 (Tutor Profile) | client-docs | `TutorProfileBottomSheet` 위젯 — tutorId 기반 프로필 조회, 이름/해시태그/자격증/소개 표시 (source: local-path/client-docs — tutor-profile-bottom-sheet.tsx) |
| 마이포도 (MyPodo/MyPage) | client-docs | `/my-podo` 라우트 — 쿠폰, 공지사항, 알림 설정, 결제 수단 관리. Vue.js 레거시 MyPage도 `/app/user/podo/mypage/` 에 공존 (source: local-path/client-docs — routes-index.md) |
| 수업 리뷰 (Lesson Review) | client-docs | `/lessons/classroom/:classID/review` — 수업 완료 후 리뷰 작성 페이지 (기존). 별점+사유 팝업과는 별개 (source: local-path/client-docs — routes-index.md) |

### Existing User Flows

**1. 정규레슨 예약 플로우** (source: local-path/svc-map — brownfield_map.md §3.3)
- 홈 → 예약 탭 → 날짜 선택 → 시간 선택 (튜터 스케줄 기반) → 예약 확인
- 57개 화면 구성, 하위 13개 섹션 포함
- 튜터 매칭은 `getMatchingTutors(lectureId, utcStart, isAdmin)` API로 수행 (source: local-path/backend-docs)

**2. 수업 완료 후 리포트/리뷰 플로우** (source: local-path/client-docs — routes-index.md)
- 수업 종료 → `/lessons/classroom/:classID/report` → `/lessons/classroom/:classID/review` → `/lessons/classroom/:classID/review-complete`
- 현재 리뷰는 텍스트 기반. 별점 평가 팝업 없음.

**3. 마이포도 플로우** (source: local-path/svc-map — brownfield_map.md §3.6)
- 마이포도 메인 → 쿠폰/공지/알림설정/결제수단/플랜 관리
- 13개 화면 구성. "수업 설정 > 튜터 관리" 메뉴 현재 없음.

**4. 수업 이력 조회 플로우** (source: local-path/client-docs — completed-lessons-section.tsx)
- `/reservation` 페이지 하단 "지난 레슨" 섹션
- 수업 카드 클릭 → CompletedLessonsBottomSheet (tutorId 전달)
- 현재 바텀시트에는 차단 기능 없음.

**5. 이 튜터 다시 만나지 않기 (기획 존재)** (source: local-path/svc-map — brownfield_map.md §3.3)
- 정규레슨 플로우 하위 섹션: "이 튜터 다시 만나지 않기+튜터 nps 개선" (1 screen, node `23:679`)
- 기존 Figma Board에 기획 화면 1장 존재하지만, 백엔드/프론트엔드에 구현 없음.

**6. 레거시 MyPage → React SPA 연결 패턴** (source: local-path/client-docs — architecture/overview.md §5.3)
- Next.js에서 Nuxt.js로 프록시: `/app/user/podo/:path+` → `localhost:3005`
- Vue.js 2 레거시와 React SPA 공존 방식 확립됨.

---

## L2: Behavior Layer

### Existing APIs

| API | Method | Relevance | Source |
|-----|--------|-----------|--------|
| `PodoScheduleServiceV2.getMatchingTutors(lectureId, utcStart, isAdmin)` | Internal | **핵심** — 튜터 매칭 시 제외 필터 삽입 지점 | local-path/backend-docs — PodoScheduleServiceV2.java |
| `PodoScheduleServiceV2.book(userId, classId, utcClassDateTime, lessonTime, acceptLangType)` | Internal | 수업 예약. 차단된 튜터 매칭 방지 후단 | local-path/backend-docs — PodoScheduleServiceV2.java |
| `PodoScheduleServiceV2.cancel(classId, pushYn, adminPenaltyYn)` | Internal | 수업 취소. 이미 예약된 수업에는 차단 영향 없음 (Brief 제약) | local-path/backend-docs — PodoScheduleServiceV2.java |
| `PodoScheduleServiceV2.cancelAndReassign(classId, pushYn, tutorId, force)` | Internal | 취소 후 재배정. 재배정 시 차단 필터 적용 필요 | local-path/backend-docs — PodoScheduleServiceV2.java |
| `PodoScheduleServiceV2.updateMatchingWeight(type, weight)` | Internal | 매칭 가중치 변경 (PRICE/SCHEDULE/NPS/CURRICULUM). NPS 가중치 관련 | local-path/backend-docs — PodoScheduleServiceV2.java |
| `TutorService / TutorServiceImpl` | Internal | 튜터 정보 관리. 프로필, 활성 상태 조회 | local-path/backend-docs — TutorService.java |
| `TutorQueryDslRepository` | Internal | 튜터 조회 (QueryDSL). 매칭 대상 튜터 필터링 쿼리 | local-path/backend-docs — TutorQueryDslRepository.java |
| `GET /api/v1/lessons/history` | BFF | 수업 이력 조회 — 차단 진입점(수업 이력 상세) 데이터 원천 | local-path/client-docs — api-index.md |
| `POST /api/v1/lessons/book-schedule` | BFF | 수업 예약 — 차단 필터가 적용된 매칭 결과 기반 예약 | local-path/client-docs — api-index.md |
| `GET /api/v1/users/profile` | BFF | 사용자 프로필 조회 — 마이페이지 연동 | local-path/client-docs — api-index.md |
| `getTutorSchedulesForReg(classId, startDateTime, endDateTime)` | Client Action | 튜터 스케줄 조회 (예약 화면용) — cnt 기반 가용 튜터 수 표시 | local-path/client-docs — use-schedule.ts |
| `tutorEntityQueries.getTutorProfile({ tutorId })` | Client Query | 튜터 프로필 조회 — 차단 관리 페이지에서 프로필 표시 재사용 가능 | local-path/client-docs — tutor-profile-bottom-sheet.tsx |
| `getCompletedLessons(params, bearerToken)` | Client Action | 완료 수업 목록 — 수업 이력에서 차단 진입점 데이터 | local-path/client-docs — completed-lessons-section.tsx |
| `PodoScheduleController / PodoScheduleControllerV3` | REST | 스케줄 API 컨트롤러. V3는 최신 버전 | local-path/backend-docs — PodoScheduleControllerV3.java |

### Existing UI Components

| Component | Path | Relevance | Source |
|-----------|------|-----------|--------|
| `BookingView` | `apps/web/src/views/booking/` | 예약 화면. 예약 탭 진입 시 평가 팝업 트리거 지점 | local-path/client-docs — booking/page.tsx |
| `CompletedLessonsSection` | `apps/web/src/widgets/completed-lessons/` | 지난 레슨 목록. 수업 이력 차단 진입점 | local-path/client-docs — completed-lessons-section.tsx |
| `CompletedLessonsBottomSheet` | `apps/web/src/widgets/completed-lessons/` | 완료 수업 상세 바텀시트. tutorId 전달됨 — 차단 버튼 추가 지점 | local-path/client-docs — completed-lessons-section.tsx |
| `TutorProfileBottomSheet` | `apps/web/src/widgets/tutor-profile/` | 튜터 프로필 바텀시트. 이름/해시태그/자격증/소개 표시 — 차단 관리에서 재사용 가능 | local-path/client-docs — tutor-profile-bottom-sheet.tsx |
| `RegularLessonCard` | `apps/web/src/features/booking-lesson/` | 정규 수업 카드. 수업 이력 목록 아이템 | local-path/client-docs — completed-lessons-section.tsx |
| `LessonDetailList` | `apps/web/src/widgets/lesson-detail-list/` | 수업 상세 목록. CompletedLessonCard, ReservedLessonCard 등 상태별 분기 | local-path/client-docs — lesson-detail-list.tsx |
| Legacy MyPage | `apps/legacy-web/pages/app/user/podo/mypage/` | Vue.js 2 마이페이지. 새 React SPA 차단 관리 페이지와 링크 연결 | local-path/client-docs — routes-index.md |
| BottomSheet (design-system) | `@podo-app/design-system-temp` | BottomSheetRoot, BottomSheetContent, BottomSheetHeader — 평가 팝업 및 확인 팝업 재사용 | local-path/client-docs — tutor-profile-bottom-sheet.tsx |

### Domain Rules Discovered

**1. 매칭 가중치 시스템** (source: local-path/backend-docs — MatchingWeight.java, TutorComparable.java)
- 4가지 가중치: PRICE, SCHEDULE, NPS, CURRICULUM
- `TutorComparable.score()` = scheduleFactor + priceFactor + npsFactor + curriculumFactor (Integer 반올림)
- 동점 시 랜덤 정렬 (공정성)
- MAX_VALUE_NPS = 10, MAX_VALUE_CURRICULUM = 10 (상수 정의)
- **차단된 튜터는 가중치 이전에 매칭 풀에서 완전 제외해야 함** (가중치 조절이 아닌 필터링)

**2. 레거시-React 공존 패턴** (source: local-path/client-docs — architecture/overview.md §3.4, §5.3)
- MyPage는 Vue.js 2 (`/app/user/podo/mypage/`)로 레거시 운영 중
- 신규 기능은 React SPA로 개발, MyPage에서 링크 연결
- Next.js → Nuxt.js 프록시: `/app/user/podo/:path+` → `localhost:3005`
- 인증 토큰은 URL 파라미터로 MyPage → React 앱으로 전달 (Brief의 DISC-01과 일치)

**3. Feature-Sliced Design 아키텍처** (source: local-path/client-docs — architecture/overview.md §3.1)
- 계층: core → entities → features → shared → widgets → views
- Import alias: `@core/*`, `@entities/*`, `@features/*`, `@shared/*`, `@widgets/*`
- 새 기능(평가, 차단)은 `entities/` + `features/` + `widgets/` 에 배치해야 함

**4. 피처 플래그 기반 점진적 출시** (source: local-path/client-docs — architecture/overview.md §10)
- Flagsmith 사용. `@podo/flags` 패키지
- 예약 페이지도 `migration_booking_react` 플래그로 제어 중 (source: local-path/client-docs — booking/page.tsx)
- 평가 팝업과 차단 기능도 피처 플래그로 제어 가능

**5. 튜터 언어 구분** (source: local-path/backend-docs — Tutor.java, LangType.java)
- `Tutor.language` 필드 (Language enum)
- `LangType` enum — 영어/일본어 구분
- Brief의 "차단 한도: 언어당 최대 5명"에 대응하는 기존 언어 구분 체계 존재

**6. BFF 미들웨어 체인** (source: local-path/client-docs — architecture/overview.md §3.3)
- Hono 기반 BFF: requestId → timeout(10s) → CORS → baseMiddleware(인증/로깅)
- 새 차단 API는 BFF 도메인(`domains/`)에 추가하거나, 레거시 API(podo-backend)에 직접 추가 후 BFF에서 프록시
- Zod + @hono/zod-openapi로 타입 안전 API 정의

---

### Self-Validation Report

| Check | Result |
|-------|--------|
| Topology Compliance | topology=co-located, local_stages=[1,2,3,4], external_attempted=3, merge_priority=local -- COMPLIANT |
| Source Coverage | L1: backend-docs, client-docs, svc-map; L2: backend-docs, client-docs, svc-map -- ALL LAYERS HAVE 3+ SOURCES |
| Keyword Coverage | 14/16 Brief keywords have >=1 result (weighted: goal-related 2x). Missing: "차단 관리 페이지" (new-feature), "평가 팝업" (new-feature). Coverage: 87.5% -- PASS |
| Ontology Coverage | N/A (document_project_path is null) |
| Document-Project Coverage | N/A (document_project_path is null) |
| Cross-Validation | backend-docs MatchingWeight NPS와 svc-map "튜터 NPS 개선" 섹션 일치. client-docs lesson-review 라우트와 svc-map 정규레슨 플로우 일치. 소스 간 충돌 없음. |
| Data Sources | backend-docs: ok, client-docs: ok, svc-map: ok, local-codebase: ok, document-project: not-configured, figma: not-configured |
| Gap Classification | 3x new-feature (LOW): 튜터 차단, 수업 후 평가, 차단 관리 페이지. 1x data-absent (MEDIUM): MyPage Vue 소스 내 튜터 관리 메뉴 부재. |

---

## Entity Index

| Entity | L1 | L2 | L3 | L4 | Primary Source |
|--------|----|----|----|----|----------------|
