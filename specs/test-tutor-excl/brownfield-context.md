---
feature: test-tutor-excl
layers:
  - name: L1
    source_step: tutorial/pre-generated
    created_at: 2026-02-16
    search_keywords:
      - 튜터
      - 수업
      - 매칭
      - 평가
      - 차단
      - 예약
      - MyPage
      - ClassBoard
    sources:
      - type: local-docs
        name: inputs/backend-docs
      - type: local-docs
        name: inputs/client-docs
    discovered:
      domain_concepts: 6
      user_flows: 5
      screen_ids:
        - "/"
        - "/reservation"
        - "/reservation/past"
        - "/my"
        - "/my/subscription"
        - "/my/tickets"
        - "/lesson/[id]"
        - "/lesson/[id]/board"
        - "/lesson/[id]/review"
  - name: L2
    sub_phase: complete
    source_step: tutorial/pre-generated
    created_at: 2026-02-16
    search_keywords:
      - lesson API
      - schedule API
      - tutor matching
      - lesson feedback
      - NPS
      - tutor_profiles
      - lessons table
      - schedules table
    sources:
      - type: local-docs
        name: inputs/backend-docs
      - type: local-docs
        name: inputs/client-docs
    discovered:
      existing_apis: 26
      existing_components: 12
      domain_rules: 15
data_sources:
  document-project: not-configured
  local-codebase: not-configured
  svc-map: not-configured
  figma: not-configured
  backend-docs: local-docs
  client-docs: local-docs
gaps:
  - keyword: 튜터 차단
    classification: 신규 기능
    note: 현재 시스템에 차단 기능 없음. 매칭 엔진에 제외 필터 추가 필요
  - keyword: 수업 후 평가 팝업
    classification: 신규 기능
    note: 현재 NPS는 수업 종료 후 25% 확률 푸시 발송. 팝업 방식은 신규
  - keyword: 차단 관리 페이지
    classification: 신규 기능
    note: MyPage에 '수업 설정 > 튜터 관리' 메뉴 신규 추가 필요
---

## L1: Domain Concept Layer

### Service Overview

EduTalk은 1:1 온라인 영어/일본어 회화 튜터링 플랫폼이다. 학생이 시간대를 예약하면 시스템이 가용 튜터를 자동 매칭하는 랜덤 매칭 구조.

### Tech Stack

| 영역 | 기술 |
|------|------|
| Backend | Java 17, Spring Boot 3.x, PostgreSQL 15, Redis 7, AWS SQS |
| Web | Next.js 15 (App Router), React 19, Tailwind CSS, TanStack Query v5 |
| Native | React Native + Expo (튜터 전용 모바일 앱) |
| BFF | Hono, Drizzle ORM, Zod |
| Legacy | Nuxt.js 2 (점진 마이그레이션 중, Q2 2026 완료 목표) |
| Monorepo | pnpm workspaces + Turborepo |
| Design System | Storybook 기반 공용 컴포넌트 (`packages/ui`) |
| Feature Flags | Flagsmith |
| Monitoring | Datadog RUM, Sentry, Datadog APM |
| Deploy | Docker → ECR → EKS, CloudFront CDN |

### Domain Concepts

| 도메인 | 설명 | 핵심 엔티티 | Source |
|--------|------|------------|--------|
| subscription | 구독 플랜 관리, 티켓 발급 | Subscription, Ticket | backend-docs |
| payment | PG 연동, 결제/환불 처리 | Payment, Refund | backend-docs |
| lesson | 수업 생성, 진행, 완료 | Lesson, LessonFeedback | backend-docs |
| schedule | 튜터 가용 시간, 매칭 알고리즘 | Schedule, MatchResult | backend-docs |
| user | 학생/튜터/관리자 계정 관리 | User, TutorProfile | backend-docs |
| coupon | 프로모션 쿠폰 발급 및 적용 | Coupon, CouponUsage | backend-docs |

### Core Terms

| 한국어 | English | 설명 |
|--------|---------|------|
| 튜터 | Tutor | 수업을 진행하는 원어민/전문 강사. 네이티브 앱 사용 |
| 학생 | Student | 수업을 수강하는 사용자. 웹앱 사용 |
| 수업 | Lesson | 1:1 화상 수업 세션 (기본 25분) |
| 매칭 | Matching | 학생-튜터 자동 배정. 튜터 가용 시간 + 가중치 기반 알고리즘 |
| 수강권 | Ticket | 수업 1회 이용권. 예약 시 1매 차감, 취소 시 복구 |
| 구독 | Subscription | 월간 수강 플랜. 자동 결제 + 수강권 충전 |
| ClassBoard | ClassBoard | 화상 수업 진행 플랫폼. WebRTC 영상 + 화이트보드 + 채팅 |
| NPS | NPS | 수업 만족도 점수. 수업 종료 후 학생 평가 (1~5점) |

### Existing User Flows (Student)

**Flow 1: 수업 예약**
홈 → 예약 탭 (`/reservation`) → 날짜/시간 선택 → 확인 바텀시트 → 매칭 처리 → 예약 완료

**Flow 2: 수업 진행**
예약 탭 → 수업 상세 (`/lesson/[id]`) → ClassBoard 입장 (`/lesson/[id]/board`) → 25분 수업 → 수업 종료 → 수업 리뷰 (`/lesson/[id]/review`, NPS 1~5점) → 예약 탭

**Flow 3: 수업 취소**
예약 탭 → 수업 상세 → "수업 취소" → 취소 확인 (사유 선택) → 수강권 복구 (1시간 전 취소 시)

**Flow 4: 구독 관리**
마이페이지 (`/my`) → 구독 관리 (`/my/subscription`) → 플랜 변경 또는 해지

**Flow 5: 지난 레슨 확인**
예약 탭 → "지난 레슨" (`/reservation/past`) → 수업 상세 → 녹화 재생

### Screen Route Map

| Route | Screen | App |
|-------|--------|-----|
| `/` | 홈 대시보드 | web |
| `/reservation` | 예약 탭 (예정 수업) | web |
| `/reservation/past` | 지난 레슨 | web |
| `/my` | 마이페이지 | web |
| `/my/subscription` | 구독 관리 | web |
| `/my/tickets` | 수강권 관리 | web |
| `/lesson/[id]` | 수업 상세 | web |
| `/lesson/[id]/board` | ClassBoard | web |
| `/lesson/[id]/review` | 수업 리뷰 | web |
| `/app/user/*` | 레거시 페이지 (Nuxt.js 프록시) | legacy-web |

### Client Architecture

```
edutalk/
├── apps/
│   ├── web/              # Next.js 15 — 학생 웹 (주력)
│   │   └── src/app/
│   │       ├── (student)/ — reservation/, my/, lesson/[id]/
│   │       ├── (tutor)/
│   │       └── (auth)/
│   ├── native/           # React Native + Expo — 튜터 모바일
│   ├── server/           # Hono BFF 서버
│   └── legacy-web/       # Nuxt.js 2 — 마이그레이션 중
├── packages/
│   ├── ui/               # 공용 디자인 시스템
│   ├── utils/            # 유틸리티
│   ├── types/            # 공유 TypeScript 타입
│   └── api-client/       # TanStack Query hooks
└── turbo.json
```

---

## L2: Behavior Layer

### Existing APIs

**Base URL**: `https://api.edutalk.io/api/v1`
**Auth**: JWT Bearer Token (Access 1h, Refresh 14d)
**Pagination**: 커서 기반 (`?cursor={lastId}&size=20`)

| API | Method | Path | 인증 | Relevance | Source |
|-----|--------|------|------|-----------|--------|
| 회원가입 | POST | `/users/signup` | - | 사용자 기반 | backend-docs |
| 내 프로필 조회 | GET | `/users/me` | Required | 차단 관리 페이지 진입 | backend-docs |
| 프로필 수정 | PUT | `/users/me` | Required | - | backend-docs |
| 이메일 로그인 | POST | `/auth/login` | - | - | backend-docs |
| 소셜 로그인 | POST | `/auth/social` | - | - | backend-docs |
| 토큰 갱신 | POST | `/auth/refresh` | Refresh | - | backend-docs |
| 수업 생성 | POST | `/lessons` | STUDENT | 매칭 시 차단 필터 적용 지점 | backend-docs |
| 수업 목록 | GET | `/lessons` | Required | 수업 이력 → 차단 진입점 | backend-docs |
| 수업 상세 | GET | `/lessons/{lessonId}` | Required | 수업 이력 상세 → 차단 버튼 | backend-docs |
| 수업 상태 변경 | PUT | `/lessons/{lessonId}/status` | Required | 수업 완료 → 평가 트리거 | backend-docs |
| 수업 취소 | POST | `/lessons/{lessonId}/cancel` | STUDENT | - | backend-docs |
| 수업 피드백 | POST | `/lessons/{lessonId}/feedback` | STUDENT | 기존 NPS 평가 (확장 대상) | backend-docs |
| 수업 녹화 | GET | `/lessons/{lessonId}/recording` | Required | - | backend-docs |
| 구독 플랜 목록 | GET | `/subscriptions/plans` | - | - | backend-docs |
| 구독 생성 | POST | `/subscriptions` | STUDENT | - | backend-docs |
| 내 구독 조회 | GET | `/subscriptions/me` | Required | - | backend-docs |
| 구독 취소 | POST | `/subscriptions/{subId}/cancel` | STUDENT | - | backend-docs |
| 티켓 잔여 조회 | GET | `/subscriptions/{subId}/tickets` | Required | - | backend-docs |
| 결제 시작 | POST | `/payments/initiate` | STUDENT | - | backend-docs |
| 결제 승인 | POST | `/payments/confirm` | System | - | backend-docs |
| 환불 요청 | POST | `/payments/{paymentId}/refund` | STUDENT | - | backend-docs |
| 결제 내역 | GET | `/payments/history` | Required | - | backend-docs |
| 가용 시간대 조회 | GET | `/schedules/available` | STUDENT | 매칭 풀 → 차단 필터 적용 | backend-docs |
| 튜터 매칭 | POST | `/schedules/match` | STUDENT | 핵심 연동 지점: 차단 목록 제외 필터 | backend-docs |
| 튜터 가용 슬롯 | GET | `/schedules/tutors/{tutorId}/slots` | Required | - | backend-docs |
| 스케줄 수정 | PUT | `/schedules/{scheduleId}` | TUTOR | - | backend-docs |

### Existing DB Schema

**DBMS**: PostgreSQL 15 / ORM: JPA/Hibernate / Migration: Flyway / Naming: snake_case

```
users (1) ──── (N) subscriptions
  │                    │
  │                    └── (1) ── (N) tickets
  │                                    │
  │                                    └── (1) ── (N) lessons
  │
  ├── (1) ── (0..1) tutor_profiles
  ├── (1) ── (N) payments
  └── (1:TUTOR) ── (N) schedules

lessons (N) ──── (1) users (as tutor)
lessons (1) ──── (0..N) lesson_feedbacks
```

**Core Tables**:

| Table | Key Columns | Relevance |
|-------|-------------|-----------|
| `users` | id, email, name, role (STUDENT/TUTOR/ADMIN), language_type, status | 차단 주체(student) + 대상(tutor) 식별 |
| `tutor_profiles` | user_id (FK, UNIQUE), languages[], rating_avg, total_lessons, matching_weight, is_active | 매칭 가중치, 활동 상태 → 비활성 튜터 판별 |
| `lessons` | student_id, tutor_id, ticket_id, language_type, status, scheduled_at | 수업 이력 → 평가/차단 대상 튜터 식별 |
| `lesson_feedbacks` | (lessons 1:N) | 기존 NPS 피드백. 신규 평가 시스템과 관계 정리 필요 |
| `subscriptions` | user_id, plan_type, language_type, status, daily_limit | 언어별 구독 → 차단 한도 언어 구분 근거 |
| `tickets` | subscription_id, user_id, type (COUNT/UNLIMIT), used_count, status | - |
| `payments` | user_id, subscription_id, amount, status, pg_provider | - |
| `schedules` | tutor_id, date, time_slot, is_available, lesson_id | 매칭 시 가용 튜터 풀 조회 → 차단 필터 적용 지점 |

**DB Conventions** (신규 테이블 설계 시 준수):
- PK: `id` BIGINT AUTO_INCREMENT
- FK: `{entity}_id`
- Timestamp: `TIMESTAMPTZ`, `created_at` / `updated_at` 필수
- Soft delete: `deleted_at` nullable
- Index naming: `pk_`, `fk_`, `uq_`, `idx_` prefix

### Existing UI Components

| Component Area | Path | Relevance | Source |
|----------------|------|-----------|--------|
| 예약 탭 | `app/(student)/reservation/` | 수업 후 평가 팝업 노출 지점 | client-docs |
| 수업 상세 | `app/(student)/lesson/[id]/` | 수업 이력 → 차단 버튼 진입점 | client-docs |
| 수업 리뷰 | `app/(student)/lesson/[id]/review` | 기존 NPS 평가 (신규 평가로 대체/확장) | client-docs |
| ClassBoard | `app/(student)/lesson/[id]/board` | 수업 종료 후 → 평가 트리거 시작점 | client-docs |
| MyPage | `app/(student)/my/` | 차단 관리 메뉴 추가 위치 | client-docs |
| 구독 관리 | `app/(student)/my/subscription` | - | client-docs |
| 수강권 관리 | `app/(student)/my/tickets` | - | client-docs |
| 레거시 프로필 | `/app/user/profile` (Nuxt.js) | MyPage 메뉴 추가 시 레거시 연동 고려 | client-docs |
| 홈 대시보드 | `app/page.tsx` | - | client-docs |
| TanStack Query hooks | `packages/api-client/` | 신규 API hook 추가 위치 | client-docs |
| 공용 UI | `packages/ui/` | Modal, Toast, Button 등 재사용 | client-docs |
| 상태 관리 | Zustand | 모달 상태 등 클라이언트 상태 | client-docs |

### Domain Rules Discovered

**Lesson Lifecycle**:
1. 수업 생성 시 티켓 차감 → `PRESTUDY` → 튜터 매칭 → `RESERVED` → `START` → `FINISH`
2. 매칭: 가용 튜터 풀에서 가중치 기반 랜덤 선택. 실패 시 3회 재시도 (1분 간격)
3. 수업 시간: 25분. WebRTC P2P, TURN 서버 폴백
4. 녹화: S3 저장, 30일 보관

**Cancellation Policy**:
- 수업 시작 1시간 전: 무료 취소 + 티켓 복구
- 수업 시작 1시간 이내: 티켓 소진 (복구 없음)
- 수업 시작 후: 취소 불가

**No-show Handling** (scheduled_at + 15min):
- 학생 노쇼: `FINISH` 처리, 티켓 소진
- 튜터 노쇼: `CANCEL` 처리, 티켓 복구, 튜터 패널티
- 양측 노쇼: `CANCEL` 처리, 티켓 복구

**Existing Feedback (NPS)**:
- 수업 종료 후 25% 확률로 NPS 설문 푸시 발송
- 현재 응답률: ~23% (NPS), ~6% (별점)
- `POST /lessons/{id}/feedback` 엔드포인트 존재

**Subscription Types**:
- UNLIMITED: 월 정기, 일일 제한 (1/2/3회)
- COUNT_BASED: 회차제 (월 8/12회, 30회 패키지)
- TRIAL: 1회 무료 체험
- 언어: EN, JP, ENJP (더블팩)

**Auto-renewal**:
- 갱신일 06:00 KST 자동 결제. 실패 시 +1일, +3일, +5일 재시도. 최종 실패 → SUSPENDED

**Authentication**:
- JWT Bearer (Access 1h, Refresh 14d)
- httpOnly Secure Cookie (XSS 방지)
- BFF에서 refresh token 자동 교체
- Rate limiting: 인증 100 req/min, 비인증 20 req/min, 결제 10 req/min

**Client State Management**:
- Server state: TanStack Query v5 (캐싱, 자동 리프레시, 낙관적 업데이트)
- Client state: Zustand (모달, 필터)
- Form: React Hook Form + Zod
- Feature flags: Flagsmith (`useFlagsmith()` hook)

**Legacy Integration**:
- `/app/user/*` 경로는 Next.js → Nuxt.js 리버스 프록시
- 2026 Q2 완전 마이그레이션 목표

### Self-Validation Report

| Check | Result |
|-------|--------|
| Document-Project Coverage | N/A (not configured) |
| Keyword Coverage | 8/8 Brief keywords have ≥1 result |
| Cross-Validation | backend-docs ↔ client-docs 일관성 확인: lesson status codes 일치, API paths 일치 |
| Data Sources | local-docs (inputs/backend-docs, inputs/client-docs) |
| Gap Classification | 3 gaps — 모두 '신규 기능' (기존 시스템에 해당 기능 없음) |
