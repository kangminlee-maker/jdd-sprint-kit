---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-requirements', 'step-04-scope', 'step-05-journeys', 'step-06-complete']
documentStatus: 'final'
version: '1.0'
inputDocuments:
  - 'product-brief: specs/test-tutor-excl/planning-artifacts/product-brief.md'
  - 'sprint-input: specs/test-tutor-excl/inputs/sprint-input.md'
  - 'brownfield-context: specs/test-tutor-excl/planning-artifacts/brownfield-context.md'
workflowType: 'prd'
documentCounts:
  briefs: 1
  research: 0
  projectDocs: 4
  userProvided: 0
classification:
  projectType: 'web-app'
  domain: 'edtech'
  complexity: 'medium'
  projectContext: 'brownfield'
partyModeInsights:
  ux:
    - '평가 팝업은 수업 종료 직후가 아닌 예약 탭 진입 시 노출하여 자연스러운 전환 제공'
    - '건너뛰기를 텍스트 링크로 처리하여 평가 강제감 최소화'
  architecture:
    - '매칭 엔진 차단 필터는 SQL WHERE NOT IN 방식으로 가용 튜터 풀 쿼리에 직접 적용'
    - 'MyPage(Vue.js 2) → React SPA 전환은 URL 파라미터 토큰 방식으로 최소 침습 연동'
  business:
    - '평가-차단 연계로 단일 기능이 세 가지 비즈니스 목표(만족도, 운영 자동화, 모니터링)를 동시 달성'
    - '차단 한도 5명/언어는 매칭 풀 보호와 사용자 자유도의 균형점'
  qa:
    - '동시 차단 요청(race condition), 비활성 튜터 차단 한도 산정, 언어 전환 시 한도 독립성 검증 필요'
    - '기존 예약 수업은 차단 영향 받지 않음을 엄격히 테스트'
projectInfo:
  name: 'EduTalk Tutor Exclusion'
  active_students_monthly: '추정 수천명'
  active_tutors: '추정 수백명'
  languages: ['EN', 'JP']
mvpConfig:
  block_limit_per_language: 5
  rating_popup_daily_limit: 1
  rating_scale: '1-5'
---

# Product Requirements Document - 튜터 제외(차단) 기능 (Tutor Exclusion)

**Author:** Auto Sprint (John — Product Manager)
**Date:** 2026-02-17
**Version:** 1.0
**Status:** Final

## Brownfield Sources

본 PRD는 아래 소스에서 기존 시스템 정보를 수집하여 brownfield 컨텍스트를 반영하였다.

### MCP 서버

| MCP 서버 | 용도 | 발견 사항 |
|----------|------|-----------|
| svc-map | 서비스 맵 | 미구성 — 해당 없음 |
| figma | 디자인 데이터 | 미구성 — 해당 없음 |
| backend-docs | 백엔드 정책 | local-docs 대체: 26개 기존 API 확인, lesson_feedbacks 테이블 확인, 매칭 알고리즘 구조 확인 |
| client-docs | 클라이언트 UI/UX | local-docs 대체: 12개 기존 컴포넌트 확인, 예약 탭/수업 상세/MyPage 화면 구조 확인 |

### Input Documents

| 문서 | 주요 Brownfield 정보 |
|------|---------------------|
| 260115-sync-meeting.md | MyPage(Vue.js 2) → React SPA 연동 방식 (URL 파라미터 토큰), ClassBoard 세션 분리 |
| 260123-kickoff-meeting.md | 기존 NPS 푸시 방식(25% 확률, 응답률 23%), lesson_feedbacks 테이블 존재 |
| brownfield-context.md | 전체 기존 시스템 스키마, API, 컴포넌트, 도메인 규칙 (L1+L2) |

### PRD 내 Brownfield 표기법

- `(기존)` / `(신규)` / `(기존+확장)` 태깅: 컴포넌트 트리에서 기존/신규 구분
- `> ✅ **기존 시스템 활용:**` 블록: 기존 시스템 활용 포인트 명시
- `[BROWNFIELD]` 태그: 기존 시스템 연동이 필요한 FR에 표기

## Executive Summary

**제품:** EduTalk - 1:1 온라인 영어/일본어 회화 튜터링 플랫폼
**기능:** 튜터 제외(차단) 기능
**핵심 가치:** "수강생이 원치 않는 튜터와의 재매칭을 스스로 방지하고, 수업 후 평가 데이터 수집을 자연스럽게 향상시킨다"

### 핵심 요약

| 항목 | 내용 |
|------|------|
| **타겟 규모** | 전체 활성 수강생 |
| **MVP 범위** | 수업 후 평가 + 튜터 차단(3진입점) + 차단 관리 페이지 |
| **플랫폼** | Web (Next.js 15 + React SPA) |
| **개발 리소스** | 프론트엔드 1~2명, 백엔드 1명 |
| **예상 기간** | 3~4주 (개발+QA) |

### 목표 지표

| 지표 | 현재 | 목표 |
|------|------|------|
| 수업 후 평가 응답률 | 6% | 20%+ |
| CX 수동 매칭 제외 처리 | 15~20건/월 | <5건/월 |
| 튜터 불만 관련 환불 | ~300만원/월 | 50% 감소 |

## Success Criteria

### User Success

- 수업 후 평가 팝업이 노출된 수강생의 **50% 이상이 별점을 제출**한다 (건너뛰기 50% 미만)
- 부정 평가(1~2점) 수강생의 **15% 이상이 차단 기능을 사용**한다
- 차단된 튜터가 이후 해당 수강생의 **매칭 결과에 0회 노출**된다

### Business Success

- 출시 30일 내 **수업 후 평가 응답률 20% 이상** 달성 (현재 6%)
- 출시 60일 내 **CX 수동 매칭 제외 요청 <5건/월** (현재 15~20건)
- 출시 90일 내 **튜터 불만 관련 월 환불액 50% 감소** (현재 ~300만원)

### Technical Success

- 차단 목록 필터 적용 후 **매칭 API 응답시간 < 500ms** (p95, 현재 수준 유지)
- 평가 팝업 렌더링 **< 200ms** (p95)
- 차단 적용 후 **매칭 정합성 100%** (차단 튜터 매칭 0건)

### Measurable Outcomes

| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|-----------|
| 수업 후 평가 응답률 | 6% | 20%+ | (평가 제출 수 / 수업 완료 수) x 100, 일별 집계 |
| 평가 팝업 완료율 | N/A | 50%+ | (별점 제출 수 / 팝업 노출 수) x 100 |
| CX 매칭 제외 요청 | 15~20건/월 | <5건/월 | CS 티켓 카테고리 "매칭 제외" 건수 |
| 튜터 불만 환불액 | ~300만원/월 | <150만원/월 | 환불 사유 "튜터 불만" 카테고리 합산 |
| 차단 기능 사용률 | N/A | 부정 평가의 15%+ | (차단 수 / 1~2점 평가 수) x 100 |
| 매칭 정합성 | N/A | 100% | 차단 후 매칭 결과에 차단 튜터 포함 건수 = 0 |

## Product Scope

### MVP - 1차 출시

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 수업 후 평가 팝업 | 예약 탭 진입 시 미평가 수업 평가 (별점+사유) | P0 |
| 평가 → 차단 연계 | 부정 평가(1~2점) 시 차단 제안 체크박스 | P0 |
| 수업 이력 차단 | 수업 상세 페이지에서 직접 차단 | P0 |
| 차단 관리 페이지 | 차단 목록 조회, 해제, 비활성 표시 | P0 |
| 매칭 엔진 차단 필터 | 차단 튜터 매칭 풀 제외 | P0 |
| 차단 한도 관리 | 언어당 5명 한도 + 초과 안내 | P1 |

### Growth Phase 1: 데이터 활용 (MVP+8주)

**목표:** 수집된 평가/차단 데이터 기반 튜터 품질 관리 체계 구축

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 관리자 차단 통계 대시보드 | 일별/주별 차단 건수, 다빈도 차단 튜터 순위 | P0 |
| 앱 푸시 평가 리마인더 | 미평가 수업에 대한 알림 (알림 피로도 고려) | P1 |

### Vision (Future)

| 기능 | 방향 |
|------|------|
| 선호 튜터 지정 | 긍정 평가 기반 매칭 가중치 부여 |
| 역방향 차단 | 튜터 → 수강생 매칭 회피 |
| 자동 품질 스코어링 | 평가+차단 패턴 기반 튜터 자동 평가 |
| 비활성 튜터 자동 해제 | 퇴사/장기 휴직 튜터 차단 자동 해제 정책 |

## User Journeys

### Journey 1: 수진 - 수업 후 부정 평가 → 차단 (Happy Path)

**페르소나:** 수진 (29세, 마케팅 회사원, EduTalk 영어 수강 3개월차)

**Opening Scene:**
수진은 오늘 영어 수업을 마치고 EduTalk 앱의 예약 탭으로 돌아왔다. 방금 수업한 튜터가 수업 내내 자기 이야기만 해서 회화 연습이 전혀 안 됐다. "이 튜터랑은 다시 안 만났으면..."

**Rising Action:**
예약 탭에 진입하자 **"오늘 수업은 어떠셨나요?"** 평가 팝업이 나타난다. 수진은 **1점**을 선택한다. 화면이 아쉬운 점 선택으로 전환되고, "튜터가 일방적으로 대화를 이끌었어요"를 선택한다. 하단에 **"이 튜터를 다시 만나지 않을래요"** 체크박스가 보인다.

**Climax:**
수진은 체크박스를 체크하고 **제출** 버튼을 누른다. **"이 튜터를 차단하시겠습니까?"** 확인 팝업이 나타나고, 수진은 **확인**을 탭한다. "차단 완료! 앞으로 이 튜터와 매칭되지 않습니다" 토스트가 표시된다.

**Resolution:**
수진은 다음날 수업을 예약한다. 매칭 결과에 어제 차단한 튜터는 포함되지 않는다. "이제 마음 편하게 수업 들을 수 있겠다."

### Journey 2: 현수 - 과거 수업 이력에서 차단 (Happy Path)

**페르소나:** 현수 (34세, IT 개발자, EduTalk 일본어 수강 6개월차)

**Opening Scene:**
현수는 지난주에 만난 튜터가 계속 떠오른다. 발음 교정을 부탁했는데 무시당한 기분이었다. 오늘 또 그 튜터와 매칭될까 걱정된다.

**Rising Action:**
현수는 예약 탭에서 **"지난 레슨"**을 탭하고, 해당 수업을 찾아 상세 페이지로 진입한다. 페이지 하단에 **"이 튜터 차단하기"** 버튼이 보인다.

**Climax:**
현수가 버튼을 탭하면 **"이 튜터를 차단하시겠습니까? 앞으로 이 튜터와 매칭되지 않습니다."** 확인 팝업이 나타난다. 현수는 **확인**을 선택한다.

**Resolution:**
"차단 완료" 토스트와 함께 버튼이 "차단됨" 상태로 변경된다. 현수는 안심하고 다음 수업을 예약한다.

### Journey 3: 민지 - 차단 한도 도달 → 관리 (Edge Case)

**페르소나:** 민지 (25세, 대학원생, EduTalk 영어+일본어 수강 1년차)

**Opening Scene:**
민지는 영어 튜터 5명을 이미 차단한 상태다. 오늘 수업에서 또 다른 튜터와 좋지 않은 경험을 했다.

**Rising Action:**
평가 팝업에서 2점을 주고 차단 체크박스를 체크한 후 제출한다. 그런데 **"영어 튜터 차단 한도(5명)에 도달했습니다. 차단 관리 페이지에서 기존 차단을 해제한 후 다시 시도해주세요."** 메시지가 나타난다.

**Climax:**
민지는 안내 링크를 탭하여 **MyPage > 수업 설정 > 튜터 관리** 페이지로 이동한다. 차단 목록을 보니 3개월 전에 차단한 튜터 중 한 명이 **비활성** 상태로 표시되어 있다. "아, 이 사람은 이미 안 만날 텐데 해제해도 되겠다." 민지는 해당 튜터의 **해제** 버튼을 탭하고, 확인 팝업에서 **해제**를 선택한다.

**Resolution:**
"차단 해제 완료" 토스트 후 차단 수가 4/5로 줄어든다. 민지는 예약 탭으로 돌아가 오늘의 튜터를 차단한다. "일본어 쪽은 아직 차단 0명이니 따로 관리할 필요 없겠다."

### Journey 4: 태호 - 긍정 평가 → 건너뛰기 (Edge Case)

**페르소나:** 태호 (42세, 무역 회사원, EduTalk 영어 수강 2개월차)

**Opening Scene:**
태호는 오늘 수업이 만족스러웠다. 예약 탭으로 돌아오자 평가 팝업이 나타난다.

**Rising Action:**
태호는 **4점**을 선택하고 **다음** 버튼을 누른다. 좋았던 점 선택 화면이 나오지만, 바빠서 넘어가고 싶다.

**Climax:**
태호는 **건너뛰기** 텍스트 링크를 탭한다.

**Resolution:**
팝업이 닫히고 별점(4점)만 저장된다. 태호는 "나중에 시간 나면 자세히 남겨야지"라고 생각하며 다음 수업을 예약한다. 차단 제안은 긍정 평가이므로 노출되지 않았다.

### Journey Requirements Summary

| 여정 | 필요한 기능 |
|------|-------------|
| 수진 (Happy Path - 평가 → 차단) | 평가 팝업, 별점, 부정 사유 선택, 차단 제안 체크박스, 차단 확인 팝업, 매칭 필터 |
| 현수 (Happy Path - 이력 차단) | 수업 이력 상세, 차단 버튼, 차단 확인 팝업, 매칭 필터 |
| 민지 (Edge Case - 한도 관리) | 차단 한도 안내, 차단 관리 페이지, 비활성 표시, 해제 기능 |
| 태호 (Edge Case - 긍정 평가 건너뛰기) | 평가 팝업, 별점 저장, 건너뛰기, 부분 저장 |

## Domain-Specific Requirements

### 데이터 정책

- **차단 이력 보존**: 차단 해제 후에도 차단 이력은 soft-delete로 보존한다 (관리자 패턴 분석용)
- **평가 데이터 소유권**: 평가 데이터는 수강생과 수업에 귀속된다
- **탈퇴 시 처리**: 수강생 탈퇴 시 차단 레코드는 익명화(student_id null) 후 90일 보존, 이후 삭제

### 튜터 보호 정책

- **차단 사실 비공개**: 튜터에게 차단 사실을 알리지 않는다 (이번 스프린트 범위)
- **차단 사유 비공개**: 개별 차단 사유는 튜터에게 노출하지 않는다
- **관리자 조회 가능**: 관리자는 차단 통계를 조회할 수 있다 (향후 Phase에서 구현)

### 매칭 풀 보호

- **차단 한도**: 언어당 최대 5명 (매칭 가용 풀의 과도한 축소 방지)
- **기존 예약 보호**: 차단 적용은 차단 시점 이후 새로운 예약부터. 기존 예약된 수업은 영향 없음

## Cross-platform App 기술 요구사항

### 기술 스택 현황

| 항목 | 현재 | 비고 |
|------|------|------|
| **프론트엔드** | Next.js 15, React 19, Tailwind CSS | 예약 탭, 수업 상세 |
| **BFF** | Hono, Drizzle ORM, Zod | API 중계, 인증 처리 |
| **백엔드** | Java 17, Spring Boot 3.x, PostgreSQL 15 | 핵심 비즈니스 로직 |
| **상태 관리** | TanStack Query v5 (서버), Zustand (클라이언트) | |
| **레거시** | Nuxt.js 2 (MyPage) | 링크 연결 방식으로 연동 |

### API 요구사항

**기존 API 활용:**

> ✅ **기존 API 활용:**
> - `GET /lessons` — 미평가 수업 조회 (rating 필터 추가)
> - `GET /lessons/{lessonId}` — 수업 상세 (차단 버튼 표시용 튜터 정보)
> - `POST /lessons/{lessonId}/feedback` — 기존 피드백 엔드포인트 (확장 또는 신규 대체)
> - `POST /schedules/match` — 매칭 시 차단 필터 적용 [BROWNFIELD]

**신규 API 필요:**

| API | 설명 | 우선순위 |
|-----|------|----------|
| `POST /lessons/{lessonId}/ratings` | 수업 후 평가 제출 (별점 + 사유) | P0 |
| `GET /lessons/unrated` | 미평가 수업 조회 (평가 팝업 트리거) | P0 |
| `POST /tutor-blocks` | 튜터 차단 | P0 |
| `DELETE /tutor-blocks/{blockId}` | 차단 해제 | P0 |
| `GET /tutor-blocks` | 내 차단 목록 조회 (언어별) | P0 |
| `GET /tutor-blocks/count` | 차단 한도 확인 (언어별 현재/최대) | P1 |

### 컴포넌트 구조 (예상)

```
app/(student)/
├── reservation/
│   ├── page.tsx (기존)
│   └── components/
│       └── RatingPopup/ (신규)
│           ├── RatingPopup.tsx
│           ├── StarRating.tsx
│           ├── ReasonSelector.tsx
│           └── BlockSuggestion.tsx
├── lesson/[id]/
│   ├── page.tsx (기존+확장 — 차단 버튼 추가)
│   └── components/
│       └── BlockTutorButton.tsx (신규)
└── my/
    └── tutor-management/ (신규 — React SPA)
        ├── page.tsx
        ├── BlockedTutorList.tsx
        ├── BlockedTutorCard.tsx
        └── UnblockConfirmDialog.tsx

packages/
├── api-client/ (기존+확장)
│   └── hooks/
│       ├── useRatings.ts (신규)
│       └── useTutorBlocks.ts (신규)
└── ui/ (기존)
    ├── Modal.tsx
    ├── Toast.tsx
    └── StarRating.tsx (신규 — 공용 컴포넌트)
```

## Functional Requirements

### 수업 후 평가 (Post-Lesson Rating)

- **FR1:** 수강생은 예약 탭 진입 시 미평가 수업에 대한 평가 팝업을 볼 수 있다 (source: BRIEF-1) [core]
  - FR1-1: 팝업은 하루 1회, 가장 최근 미평가 수업 1건만 노출된다
  - FR1-2: 팝업은 수업 완료 상태(FINISH)인 수업에 대해서만 노출된다
- **FR2:** 수강생은 1~5점 별점으로 수업을 평가할 수 있다 (source: BRIEF-2) [core]
- **FR3:** 수강생은 긍정 평가(3~5점) 시 좋았던 점을 복수 선택할 수 있다 (source: BRIEF-2) [enabling]
- **FR4:** 수강생은 부정 평가(1~2점) 시 아쉬운 점을 복수 선택할 수 있다 (source: BRIEF-2) [enabling]
- **FR5:** 시스템은 평가 데이터를 단계별로 저장할 수 있다 (source: BRIEF-2) [enabling]
  - FR5-1: "다음" 클릭 시 별점만 저장된다
  - FR5-2: "제출" 클릭 시 별점 + 사유가 저장된다
  - FR5-3: 건너뛰기 또는 X닫기 시 아무것도 저장되지 않는다
- **FR6:** 수강생은 평가를 건너뛸 수 있다 (텍스트 링크로 표시) (source: BRIEF-1) [supporting]

### 튜터 차단 (Tutor Block)

- **FR7:** 수강생은 부정 평가(1~2점) 시 "이 튜터를 다시 만나지 않을래요" 차단 제안 체크박스를 볼 수 있다 (source: BRIEF-3) [core]
- **FR8:** 수강생은 수업 이력 상세 페이지에서 튜터를 직접 차단할 수 있다 (source: BRIEF-5) [core]
- **FR9:** 수강생은 차단 관리 페이지에서 튜터를 추가 차단할 수 있다 (source: BRIEF-7) [supporting]
- **FR10:** 시스템은 차단된 튜터를 매칭 풀에서 즉시 제외할 수 있다 (source: BRIEF-4) [core]
  - FR10-1: 차단 적용은 차단 시점 이후 새 예약부터 적용된다 [BROWNFIELD]
  - FR10-2: 이미 예약된 수업에는 영향이 없다
- **FR11:** 시스템은 언어당 최대 5명의 차단 한도를 적용할 수 있다 (source: BRIEF-6) [enabling]
  - FR11-1: 영어와 일본어 차단 한도는 독립적이다
  - FR11-2: 한도 초과 시 안내 메시지와 차단 관리 페이지 이동 링크를 표시한다
- **FR12:** 시스템은 차단 시 확인 팝업을 표시할 수 있다 (source: AI-inferred, reason: '비가역적 행위에 대한 확인 UX 패턴') [supporting]

### 차단 관리 (Block Management)

- **FR13:** 수강생은 차단 관리 페이지에서 차단 목록을 조회할 수 있다 (source: BRIEF-7) [core]
  - FR13-1: 차단된 튜터의 이름, 프로필 사진, 차단 일시, 마지막 수업 일시가 표시된다
  - FR13-2: 비활성(퇴사/장기 휴직) 튜터는 "비활성" 라벨이 표시된다
  - FR13-3: 비활성 튜터도 차단 한도에 포함된다
- **FR14:** 수강생은 차단된 튜터를 해제할 수 있다 (source: BRIEF-8) [core]
  - FR14-1: 해제 시 확인 팝업이 표시된다
  - FR14-2: 해제 완료 시 해당 튜터가 매칭 풀에 복귀한다
- **FR15:** 시스템은 차단 해제 후에도 차단 이력을 보존할 수 있다 (관리자 조회용) (source: DISC-01, evidence: "데이터 보존: 해제 후에도 차단 이력 보존") [enabling]

### 인증 연동 (Authentication Integration)

- **FR16:** 시스템은 MyPage(Vue.js 2)에서 차단 관리 페이지(React SPA)로 URL 파라미터를 통해 인증 토큰을 전달할 수 있다 (source: DISC-01) [BROWNFIELD] [enabling]

## Non-Functional Requirements

### Performance

| NFR | 요구사항 | 측정 방법 |
|-----|----------|-----------|
| NFR1 | 평가 팝업 렌더링 < 200ms (p95) | Datadog RUM: 팝업 컴포넌트 마운트 시간 |
| NFR2 | 차단 필터 적용 후 매칭 API 응답 < 500ms (p95) | Datadog APM: `/schedules/match` 엔드포인트 |
| NFR3 | 차단 관리 페이지 초기 로드 < 1s (p95) | Datadog RUM: React SPA 초기 렌더 |
| NFR4 | 차단/해제 API 응답 < 300ms (p95) | Datadog APM: `/tutor-blocks` 엔드포인트 |

### Reliability

| NFR | 요구사항 | 측정 방법 |
|-----|----------|-----------|
| NFR5 | 차단 → 매칭 제외 정합성 100% | 일별 배치: 차단 레코드 vs 매칭 결과 교차 검증 |
| NFR6 | 차단/해제 동시 요청 처리 (race condition 방지) | 비관적 락 또는 UNIQUE constraint |
| NFR7 | 평가 데이터 유실 0건 | 저장 실패 시 클라이언트 재시도 + 서버 로깅 |

### Integration

| NFR | 요구사항 | 측정 방법 |
|-----|----------|-----------|
| NFR8 | 기존 매칭 API와 하위 호환 유지 | 기존 매칭 테스트 스위트 통과 |
| NFR9 | MyPage → React SPA 토큰 전달 실패 시 로그인 페이지 리다이렉트 | E2E 테스트 시나리오 |
| NFR10 | 기존 lesson_feedbacks 데이터와의 공존 (기존 NPS 데이터 유지) | 마이그레이션 스크립트 검증 |

### Security

| NFR | 요구사항 | 측정 방법 |
|-----|----------|-----------|
| NFR11 | 차단 API는 본인의 차단만 조회/수정 가능 (student_id 검증) | API 권한 테스트 |
| NFR12 | URL 파라미터 토큰은 1회성 사용 후 무효화 | 토큰 재사용 시도 테스트 |

## QA Considerations

### 핵심 시나리오 (P0)

| 케이스 | 시나리오 | 예상 처리 |
|--------|----------|-----------|
| 동시 차단 | 두 기기에서 동시에 같은 튜터 차단 | UNIQUE constraint로 중복 방지, 두 번째 요청에 "이미 차단됨" 응답 |
| 차단 후 즉시 예약 | 차단 완료 직후 수업 예약 | 매칭 결과에 차단 튜터 미포함 (캐시 무효화) |
| 한도 경계 | 4명 차단 상태에서 2건 동시 차단 요청 | 선착순 1건 성공, 나머지 한도 초과 에러 |
| 비활성 튜터 차단 | 이미 비활성인 튜터를 차단 시도 | 차단 허용 (비활성도 한도에 포함) |

### 평가 플로우 (P0)

| 케이스 | 시나리오 | 예상 처리 |
|--------|----------|-----------|
| 당일 다수 수업 | 하루에 3건 수업 완료 후 예약 탭 진입 | 가장 최근 1건만 팝업 노출 |
| 팝업 재노출 | 건너뛰기 후 같은 날 예약 탭 재진입 | 팝업 재노출하지 않음 (당일 1회 제한) |
| 네트워크 오류 | 평가 제출 중 네트워크 단절 | 클라이언트 재시도 버튼 표시 |
| 별점만 저장 후 앱 종료 | "다음" 클릭 후 사유 선택 전 앱 종료 | 별점만 저장된 상태 유지 |

### 통합 시나리오 (P1)

| 케이스 | 시나리오 | 예상 처리 |
|--------|----------|-----------|
| 차단 해제 직후 재차단 | 해제 → 즉시 재차단 | 허용 (새로운 차단 레코드 생성, 이전 이력 보존) |
| 언어 전환 | 영어 5명 차단 후 일본어 차단 시도 | 독립 한도이므로 일본어 차단 정상 처리 |
| MyPage 토큰 만료 | 토큰 전달 후 React SPA 진입 시 토큰 만료 | 로그인 페이지로 리다이렉트 |
| 더블팩 수강생 | EN+JP 더블팩 수강생의 차단 한도 | 영어 5명 + 일본어 5명 독립 관리 (총 10명 가능) |
