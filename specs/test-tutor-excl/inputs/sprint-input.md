---
feature: test-tutor-excl
generated_at: 2026-02-17T23:00:00+09:00
generated_by: sprint-onboarding-phase-0
brief_grade: A
goals:
  - "수업 후 평가 시스템 구현 (별점 + 사유 선택 + 팝업 플로우)"
  - "튜터 차단 기능 구현 (3가지 진입점 + 매칭 풀 즉시 제외)"
  - "차단 관리 페이지 구현 (목록 조회, 해제, 비활성 튜터 표시)"
  - "수업 후 평가 데이터 수집률 향상 (현재 6% → 목표 20% 이상)"
complexity: medium
brief_sentences:
  - id: BRIEF-1
    text: "수업 후 예약 탭 진입 시 미평가 수업에 대해 평가 팝업을 노출한다"
  - id: BRIEF-2
    text: "1~5점 별점으로 수업을 평가할 수 있다"
  - id: BRIEF-3
    text: "부정 평가(1~2점) 시 차단 제안 체크박스를 표시한다"
  - id: BRIEF-4
    text: "특정 튜터를 차단하면 매칭 풀에서 즉시 제외된다"
  - id: BRIEF-5
    text: "수업 이력 상세 페이지에서 직접 차단할 수 있다"
  - id: BRIEF-6
    text: "차단 한도는 언어당 최대 5명이다"
  - id: BRIEF-7
    text: "차단 관리 페이지에서 차단 목록을 관리한다"
  - id: BRIEF-8
    text: "차단 해제 시 해당 튜터가 매칭 풀에 복귀한다"
causal_chain:
  phenomenon: "랜덤 매칭에서 부정적 경험 튜터와 재매칭되어 수강생 불만, 수업 취소, 서비스 이탈이 발생하고 있다"
  phenomenon_source: "260123-kickoff-meeting.md"
  phenomenon_evidence: "랜덤 매칭 특성상 이전에 부정적 경험이 있었던 튜터와 재매칭될 수 있음. 이 경우 수강생은 수업을 취소하거나 시간대를 변경하게 되며, 이는 만족도 하락과 이탈로 이어짐."
  root_cause: "매칭 시스템이 수강생의 부정적 경험(차단 의사)을 반영하지 않으며, 수업 후 평가 체계가 부재(평가율 6%)하여 튜터 품질 모니터링이 불가능하다"
  root_cause_source: "260123-kickoff-meeting.md"
  root_cause_evidence: "현재 수업 후 NPS 평가 응답률: 23%, 실제 수업 완료 건 대비 별점을 남기는 비율: 약 6%. CX팀이 월 15~20건 수동으로 매칭 제외 처리 중."
  solution_rationale: "수강생이 직접 튜터를 차단하여 매칭 풀에서 제외하고, 수업 후 평가 수집과 차단을 연계하여 평가 데이터 수집률을 높이면서 문제 튜터를 식별한다"
  rationale_source: "260123-kickoff-meeting.md"
  rationale_evidence: "수강생 만족도 향상 + 운영 자동화 + 튜터 모니터링 강화 — 세 가지 목적을 동시에 달성해야 한다고 PM이 정리"
  feature_request: "수업 후 평가 + 튜터 차단 + 차단 관리 기능"
  feature_source: "brief"
  chain_status: complete
time_estimate:
  initial_range: "60~120분"
input_files:
  - name: brief.md
    type: core-brief
    lines: 75
    note: "AI-generated from references"
  - name: 260115-sync-meeting.md
    type: reference
    category: 회의록
    lines: 73
    relevance: high
  - name: 260123-kickoff-meeting.md
    type: reference
    category: 회의록
    lines: 167
    relevance: high
  - name: 260123-kickoff-summary.md
    type: reference
    category: 회의록 요약
    lines: 84
    relevance: high
  - name: 260123-kickoff-transcript.md
    type: reference
    category: 회의록 서술
    lines: 77
    relevance: high
brownfield_status: local-only
brownfield_topology: co-located
document_project_path: null
document_project_status: null
pre_existing_brownfield:
  path: specs/test-tutor-excl/brownfield-context.md
  levels: [L1, L2]
fallback_tier: 1
validation:
  brief_included: true
  references_processed: 4/4
  discovered_requirements: 2
  goals_mapped: 4/4
  contradictions_detected: 0
tracking_source: brief
flags:
  force_jp1_review: false
---

# Sprint Input: test-tutor-excl

## Core Brief

# 튜터 제외(차단) 기능

## 배경

EduTalk는 1:1 영어/일본어 회화 수업을 랜덤 튜터 매칭으로 제공하고 있다. 랜덤 매칭 특성상 이전에 부정적 경험이 있었던 튜터와 재매칭될 수 있으며, 이 경우 수강생은 수업을 취소하거나 서비스를 이탈하게 된다.

- 최근 3개월 튜터 관련 CS 인입: 약 100건, 이 중 "다시 만나기 싫다" 유형 18%
- 외부 설문(500명): 56%가 원치 않는 튜터를 만난 경험 있음
- CX팀이 월 15~20건 수동으로 매칭 제외 처리 중
- 튜터 불만 관련 월 환불액 약 300만원

## 만들어야 할 기능

### 1. 수업 후 평가

수강생이 ClassBoard에서 수업을 마치고 예약 탭에 진입하면, 미평가 수업에 대해 "오늘 수업은 어떠셨나요?" 팝업을 노출한다.

- 하루 1회, 가장 최근 수업 1건만 노출
- 1~5점 별점 선택
- 긍정(3~5점): 좋았던 점 복수 선택 → 제출
- 부정(1~2점): 아쉬운 점 복수 선택 + "이 튜터를 다시 만나지 않을래요" 차단 제안 체크박스 → 제출
- 건너뛰기(텍스트 링크)로 평가를 강제하지 않음
- 저장: "다음" 클릭 → 별점만 저장, "제출" → 별점+사유 저장, 건너뛰기/X닫기 → 저장 안 함

### 2. 튜터 차단

수강생이 특정 튜터를 차단하면 해당 튜터가 매칭 풀에서 즉시 제외된다.

- 진입점 3가지:
  1. 수업 후 평가에서 부정(1~2점) 시 차단 제안
  2. 수업 이력 상세 페이지에서 직접 차단
  3. 차단 관리 페이지에서 추가
- 차단 한도: 언어당 최대 5명 (영어 5명 + 일본어 5명 별도)
- 한도 초과 시: 안내 메시지 + 차단 관리 페이지 이동 유도
- 이미 예약된 수업에는 영향 없음, 차단 이후 새 예약부터 적용

### 3. 차단 관리 페이지

MyPage > 수업 설정 > 튜터 관리 메뉴에서 차단 목록을 관리한다.

- 차단된 튜터 프로필(이름, 사진), 차단 일시, 마지막 수업 일시 표시
- 차단 해제: 해제 버튼 → 확인 팝업 → 해제 완료 → 매칭 풀 복귀
- 비활성(퇴사/장기 휴직) 튜터: '비활성' 라벨 표시, 차단 한도에 포함

## 사용자 시나리오

**시나리오 1: 수업 후 평가 → 차단**
수강생이 수업 종료 후 예약 탭으로 돌아옴 → 평가 팝업 노출 → 1점 선택 → 아쉬운 점 선택 → "이 튜터를 다시 만나지 않을래요" 체크 → 제출 → 차단 확인 팝업 → 차단 완료 → 이후 예약에서 해당 튜터 매칭 제외

**시나리오 2: 수업 이력에서 차단**
수강생이 과거 불쾌했던 수업을 떠올리고 수업 이력 상세 페이지에서 "이 튜터 차단하기" 클릭 → 확인 팝업 → 차단 완료

**시나리오 3: 차단 관리**
수강생이 차단 한도(5명)에 도달 → 새로운 차단 시도 시 안내 메시지 → 차단 관리 페이지 이동 → 기존 차단 해제 후 새 차단 추가

## 제약 조건

- 차단 단위: 사용자 ID 기준 (기기/세션 무관)
- 데이터 보존: 해제 후에도 차단 이력 보존 (관리자 조회용)
- 차단 관리 UI: React SPA (기존 MyPage는 Vue.js 2 레거시, 새 기능은 React로 개발하여 링크 연결)
- 이번 스프린트 범위: 수강생 → 튜터 방향 차단만 (튜터 → 수강생 방향은 향후 검토)

## 기대 효과

- 수강생 만족도 향상: 원치 않는 튜터와의 재매칭 방지 → 이탈 감소
- 운영 자동화: CX팀 수동 제외 처리 → 수강생 셀프서비스로 전환
- 튜터 모니터링 강화: 수업 후 평가 데이터 수집률 향상 (현재 6% → 목표 20% 이상)
- 환불 감소: 튜터 불만 관련 환불 월 약 300만원 감소 예상

## 미결 사항

- 평가 팝업 노출 타이밍 세부 (수업 종료 후 몇 분 뒤?)
- 튜터에게 차단 사실 알림 여부
- 관리자 대시보드 차단 통계 노출 범위
- 차단 사유의 튜터 평가 반영 방식
- 비활성 튜터 자동 해제 정책 (향후 검토)
- 앱 푸시로 미평가 수업 리마인더 발송 여부

## Reference Materials

### 260115-sync-meeting.md
- **Category**: 회의록
- **Relevance**: high
- **Key Points**:
  - 튜터 제외 기능의 MyPage 연동 방안 논의 (레거시 싱크 미팅)
  - MyPage는 Vue.js 2 기반 레거시 SPA, 신규 기능은 React로 개발하여 링크 연결
  - 인증 토큰은 URL 파라미터로 MyPage에서 React 앱으로 전달
  - 평가 팝업은 ClassBoard가 아닌 EduTalk 메인(예약 탭)에서 노출 (별도 도메인 세션 문제)
  - 과거 수업 이력 상세 페이지에서도 차단 가능
  - MyPage 메뉴 위치: '수업 설정 > 튜터 관리' 확정
- **Constraints**: ClassBoard는 별도 도메인이라 세션 공유 불가
- **Decisions**:
  - 차단 관리 UI는 React SPA, MyPage에서 링크 연결
  - 평가 팝업은 예약 탭 진입 시 노출
  - 과거 수업 이력 차단은 수업 상세 페이지 안에 배치

### 260123-kickoff-meeting.md
- **Category**: 회의록
- **Relevance**: high
- **Key Points**:
  - 전체 기능 범위 확정: 수업 후 평가 + 튜터 차단 + 차단 관리
  - CS 데이터: 3개월 100건, "다시 만나기 싫다" 18%, 월 수동 제외 15~20건
  - 외부 설문: 500명 중 56%가 원치 않는 튜터 경험, CS 문의는 12%에 불과
  - NPS 응답률 23%, 실제 별점 비율 6% — 평가 데이터 극히 부족
  - 튜터 불만 관련 환불 월 약 300만원
  - 세 가지 목적: 수강생 만족도 향상, 운영 자동화, 튜터 모니터링 강화
  - 평가 플로우: 별점 → 긍정/부정 분기 → 사유 선택 → 차단 제안
  - 저장 로직: 단계별 저장 (별점만/별점+사유/미저장)
  - 차단 진입점 3가지, 한도 언어당 5명
  - 비활성 튜터: 한도 포함, 자동 해제는 향후 검토
- **Constraints**: 이번 스프린트는 수강생→튜터 방향만
- **Decisions**:
  - 차단 한도 언어당 5명 (매칭 풀 보호)
  - 비활성 튜터 한도 포함 (MVP 단순화)
  - 앱 푸시 리마인더 보류 (알림 피로도)

### 260123-kickoff-summary.md
- **Category**: 회의록 요약
- **Relevance**: high
- **Key Points**:
  - 260123-kickoff-meeting.md의 구조화된 요약본
  - 핵심 지표, 기능 설계(A/B/C), 정책, 액션 아이템, 미결 사항을 표 형태로 정리
  - 일정: 기획 확정 2/6, 디자인 완료 2/13, 개발 착수 2/16, QA 3/9, 배포 3/16
- **Constraints**: 킥오프 미팅과 동일
- **Decisions**: 킥오프 미팅과 동일

### 260123-kickoff-transcript.md
- **Category**: 회의록 서술
- **Relevance**: high
- **Key Points**:
  - 260123-kickoff-meeting.md의 서술형 버전
  - 논의 과정과 맥락이 상세히 기록됨
  - 이미 예약된 수업에는 영향 없음 확인 (차단 이후 새 예약부터 적용)
  - 차단 해제 후에도 이력 보존 — 관리자가 반복 차단 패턴 분석에 활용
  - 향후 확장: 선호 튜터 지정, 튜터→수강생 매칭 회피 (이번 범위 외)
- **Constraints**: 킥오프 미팅과 동일
- **Decisions**: 킥오프 미팅과 동일

## Discovered Requirements

### 참고 자료에서 발견 (근거 있음)
- [DISC-01] MyPage(Vue.js 2) → React SPA 인증 연동은 URL 파라미터로 토큰 전달 (source: 260115-sync-meeting.md, evidence: "인증 토큰은 URL 파라미터로 넘기고, React 앱에서 API 호출")
- [DISC-02] 관리자 대시보드에서 차단 통계 조회 기능 — 일별/주별 차단 건수, 가장 많이 차단된 튜터 순위 (source: 260123-kickoff-transcript.md, evidence: "어드민 대시보드에서 차단 통계를 볼 수 있으면 좋겠다", 이번 Sprint 범위 미확정)

## Brownfield Status

| Source | Type | Status | Notes |
|--------|------|--------|-------|
| document-project | local-docs | not-configured | project-scan-report.json 미발견 |
| backend-docs MCP | mcp | not-configured | .mcp.json 미존재 |
| client-docs MCP | mcp | not-configured | .mcp.json 미존재 |
| svc-map MCP | mcp | not-configured | .mcp.json 미존재 |
| figma MCP | mcp | not-configured | .mcp.json 미존재 |
| pre-existing brownfield | local-file | ok | specs/test-tutor-excl/brownfield-context.md (L1+L2) |
