# Sprint Input Format Guide

> `sprint-input.md`는 Phase 0 (Smart Launcher)이 생성하는 **Sprint SSOT 파일**이다.
> 사용자 원본(brief.md + 참고 자료)을 분석하여 Auto Sprint Pipeline에 전달할 구조화된 입력을 생성한다.

---

## 파일 위치

```
specs/{feature}/inputs/sprint-input.md
```

- 사용자 원본 파일과 같은 `inputs/` 디렉토리에 위치
- Phase 0이 자동 생성 (사용자 편집 금지)
- Auto Sprint의 모든 하위 에이전트가 이 파일을 참조

---

## YAML Frontmatter

```yaml
---
feature: {feature-name}
generated_at: {ISO 8601}
generated_by: sprint-onboarding-phase-0
brief_grade: A | B | C
goals:
  - {goal_1}
  - {goal_2}
  - {goal_3}
complexity: simple | medium | complex
brief_sentences:
  - id: BRIEF-1
    text: "{Brief 문장 1}"
  - id: BRIEF-2
    text: "{Brief 문장 2}"
causal_chain:
  phenomenon: "{text}"
  phenomenon_source: "{파일명 | inferred_from_brief | user_confirmed}"
  phenomenon_evidence: "{문서 내 해당 구절 또는 위치}"
  root_cause: "{text}"
  root_cause_source: "{파일명 | inferred_from_brief | user_confirmed}"
  root_cause_evidence: "{문서 내 해당 구절 또는 위치}"
  solution_rationale: "{text}"
  rationale_source: "{파일명 | inferred_from_brief | user_confirmed}"
  rationale_evidence: "{문서 내 해당 구절 또는 위치}"
  feature_request: "{text}"
  feature_source: "brief"
  chain_status: complete | partial | feature_only
time_estimate:
  initial_range: "{N}~{M}분"
input_files:
  - name: brief.md
    type: core-brief
    lines: {N}
  - name: meeting-notes.md
    type: reference
    category: meeting-notes
    lines: {N}
    relevance: high
brownfield_status: greenfield | configured | partial-failure | local-only
brownfield_topology: standalone | co-located | msa | monorepo
document_project_path: "{path or null}"
document_project_status: fresh | stale | expired | null
fallback_tier: 1 | 2 | 3
validation:
  brief_included: true
  references_processed: 3/3
  discovered_requirements: 7
  goals_mapped: 3/3
  contradictions_detected: 1
tracking_source: brief | success-criteria
flags:
  force_jp1_review: false  # C등급 Brief 시 true
---
```

### Frontmatter 필드 설명

| 필드 | 필수 | 설명 |
|------|------|------|
| `feature` | Y | Feature name (kebab-case) |
| `generated_at` | Y | 생성 시각 (ISO 8601) |
| `generated_by` | Y | `sprint-onboarding-phase-0` (Sprint 경로) 또는 `specs-direct` (Direct 경로) |
| `brief_grade` | Y | Brief 품질 등급 (A/B/C) |
| `goals` | Y | 추출된 목표 3~5개 |
| `complexity` | Y | 복잡도 분류 (simple/medium/complex) |
| `input_files` | Y | 처리된 입력 파일 목록 |
| `brownfield_status` | Y | Brownfield 소스 상태 (`local-only`: co-located 코드만, MCP/document-project 없음) |
| `brownfield_topology` | Y | 감지된 배포 토폴로지 (`standalone`/`co-located`/`msa`/`monorepo`) |
| `document_project_path` | N | document-project 산출물 경로 (없으면 `null`) |
| `document_project_status` | N | document-project 신선도 (`fresh`/`stale`/`expired`/`null`) |
| `fallback_tier` | Y | 분석 성공 수준 (1=풍부, 2=최소, 3=Brief만) |
| `validation` | Y | 자가 점검 결과 (`discovered_requirements`는 Discovered Requirements 개수) |
| `brief_sentences` | Y | Brief 문장 분해 결과 (id: BRIEF-N, text: 원문 문장). PRD FR의 source 태깅에 사용 |
| `causal_chain` | N | 인과 사슬 4계층 + source/evidence + chain_status. 선택 사항 — feature_only일 때 사용자가 opt-in하지 않으면 비어있을 수 있음 |
| `causal_chain.chain_status` | (causal_chain 존재 시 Y) | `complete`(전부 확인됨), `partial`(일부 추론됨), `feature_only`(사용자가 추가하지 않기로 선택) |
| `time_estimate` | Y | 복잡도 기반 초기 시간 범위 |
| `tracking_source` | Y | Brief 추적 소스. `brief`: BRIEF-N 기반 (Sprint 경로), `success-criteria`: PRD Success Criteria 기반 (Guided/Direct 경로) |
| `flags.force_jp1_review` | Y | JP1 강제 리뷰 여부 |

---

## Body 섹션

### Core Brief (필수)

```markdown
## Core Brief

{brief.md 전문 — 원문 그대로 보존, 절대 수정 금지}
```

- brief.md의 전체 내용을 **원문 그대로** 포함
- 요약/편집/재구성 금지
- Auto Sprint의 모든 BMad 에이전트가 이 섹션을 참조

### Reference Materials (선택)

```markdown
## Reference Materials

### {filename-1}
- **Category**: {회의록 | 고객 데이터 | 분석 보고서 | 와이어프레임 | 기타}
- **Relevance**: {high | medium | low}
- **Key Points**:
  - {핵심 포인트 1}
  - {핵심 포인트 2}
- **Constraints**: {제약사항}
- **Decisions**: {결정사항}
```

- 200줄 이하 파일: 전문 포함
- 200줄 초과 파일: 요약 (Key Points, Constraints, Decisions 추출)
- 이미지 파일(PNG, JPG): 파일명 + 설명 텍스트만 포함
- PDF: 앞 100페이지만 처리

### Discovered Requirements (선택)

```markdown
## Discovered Requirements

### 참고 자료에서 발견 (근거 있음)
- [DISC-01] {내용} (source: {filename}, evidence: "{해당 구절}")

### AI 추론으로 추가 (사용자 확인 필요)
- [DISC-02] {내용} (inferred_reason: "{AI 판단 근거}")
```

- Brief에 없지만 참고 자료에서 발견된 요구사항
- **출처 분류**: "참고 자료에서 발견"과 "AI 추론"을 명시 구분. JP1에서 구분 표시됨
- 5개 이하: 전부 포함 (기본값: Sprint 범위에 포함)
- 5개 초과: 핵심 3개만 포함, 나머지는 "다음 Sprint 후보"로 별도 표기

### Detected Contradictions (선택)

```markdown
## Detected Contradictions

| # | Brief Says | Reference Says | Source | Status |
|---|-----------|---------------|--------|--------|
| 1 | {A} | {B} | meeting.md | 미해결 |
```

- 모순이 없으면 섹션 생략
- MVP에서는 감지만 하고 자동 해결은 안 함
- 사용자에게 "Sprint 시작?" 확인 시 주의사항으로 표시

### Brownfield Status (선택)

```markdown
## Brownfield Status

| Source | Type | Status | Notes |
|--------|------|--------|-------|
| {source} | mcp / document-project / local-codebase | ok / error / not-configured | {details} |
```

- Kit Onboarding 상태에 따른 Brownfield 소스 접속 결과
- `greenfield`: 소스 없음 (이 섹션 생략 가능)
- `configured`: 모든 소스 정상
- `partial-failure`: 일부 소스 접속 실패
- `local-only`: co-located 코드만 존재 (MCP/document-project 없음)

---

## Brief 품질 등급 기준

| 등급 | 조건 | Phase 0 행동 |
|------|------|-------------|
| **A** (충분) | 기능 3+ 언급, 시나리오 1+ 언급, 또는 참고 자료가 보완 | 정상 진행 |
| **B** (보통) | 기능 1~2 언급, 시나리오 없음 | "Sprint 시작?" 확인 시 경고 표시 |
| **C** (불충분) | 기능 0, 단순 키워드만 | Sprint 비권장 옵션 제시, 진행 시 `force_jp1_review: true` |

---

## Fallback Tier 정의

| Tier | 조건 | sprint-input.md 내용 |
|------|------|---------------------|
| **1** | 전체 분석 성공 | Core Brief + Reference + Insights + Contradictions |
| **2** | brief.md만 분석 가능 (참고 자료 실패) | Core Brief만 |
| **3** | inline Brief만 (brief.md 자동 생성) | Brief 원문만 |
| **4** | 이해 불가 | Sprint 중단 (sprint-input.md 미생성) |

---

## 방어 제한

| 항목 | 제한 |
|------|------|
| 최대 파일 수 | 20개 |
| 최대 총 크기 | 50MB |
| PDF 최대 페이지 | 100페이지 (초과분 무시) |
| 지원 형식 | `*.md`, `*.txt`, `*.pdf`, `*.png`, `*.jpg`, `*.jpeg`, `*.yaml`, `*.json`, `*.csv` |
| 미지원 형식 | 경고 + 스킵 |
| 제한 초과 시 | 경고 표시 + 최근 수정 파일 우선 처리 |

---

## 예시

### 예시 1: Full (Tier 1, A등급, 참고 자료 포함)

```yaml
---
feature: tutor-exclusion
generated_at: 2026-02-13T10:30:00+09:00
generated_by: sprint-onboarding-phase-0
brief_grade: A
goals:
  - 수업 후 튜터 차단 기능 구현
  - 차단된 튜터 매칭 제외 필터링
  - 차단 관리 UI 제공
complexity: medium
causal_chain:
  phenomenon: "수업 후 튜터에 대한 불만이 지속적으로 접수되지만 해소 방법이 없음"
  phenomenon_source: "cs-report.md"
  phenomenon_evidence: "최근 3개월간 튜터 관련 불만 접수 증가 추세"
  root_cause: "매칭 시스템이 부정적 경험을 반영하지 않아 동일 튜터와 반복 매칭"
  root_cause_source: "inferred_from_brief"
  root_cause_evidence: "차단된 튜터는 이후 매칭에서 제외되어야 합니다 → 현재 제외 메커니즘 부재 추론"
  solution_rationale: "학생이 특정 튜터를 차단하여 매칭 풀에서 제외하는 방식으로 부정적 경험 반복 방지"
  rationale_source: "brief"
  rationale_evidence: "학생이 특정 튜터를 차단할 수 있는 기능을 만들어주세요"
  feature_request: "수업 후 튜터 차단 기능 + 매칭 제외 + 차단 관리 UI"
  feature_source: "brief"
  chain_status: complete
time_estimate:
  initial_range: "60~120분"
input_files:
  - name: brief.md
    type: core-brief
    lines: 25
  - name: cs-report.md
    type: reference
    category: 고객 데이터
    lines: 150
    relevance: high
  - name: competitor-analysis.md
    type: reference
    category: 분석 보고서
    lines: 80
    relevance: medium
brownfield_status: configured
brownfield_topology: standalone
document_project_path: null
document_project_status: null
fallback_tier: 1
validation:
  brief_included: true
  references_processed: 2/2
  discovered_requirements: 4
  goals_mapped: 3/3
  contradictions_detected: 0
tracking_source: brief
flags:
  force_jp1_review: false
---

# Sprint Input: tutor-exclusion

## Core Brief

수업 후 튜터에 대한 평가 기능과 연계하여, 학생이 특정 튜터를 차단할 수 있는 기능을 만들어주세요.
차단된 튜터는 이후 매칭에서 제외되어야 합니다.
...

## Reference Materials

### cs-report.md
- **Category**: 고객 데이터
- **Relevance**: high
- **Key Points**:
  - 최근 3개월간 튜터 관련 불만 접수 증가 추세
  - 주요 불만: 수업 태도, 시간 미준수
- **Constraints**: 차단은 학생 → 튜터 방향만 지원
- **Decisions**: 없음

### competitor-analysis.md
- **Category**: 분석 보고서
- **Relevance**: medium
- **Key Points**:
  - 경쟁사 A: 차단 + 사유 선택
  - 경쟁사 B: 차단 + 해제 기능
- **Constraints**: 없음
- **Decisions**: 없음

## Discovered Requirements

- [DISC-01] 차단 사유 선택 UI 필요 (source: competitor-analysis.md)
- [DISC-02] 차단 해제 기능 필요 (source: competitor-analysis.md)

## Brownfield Status

| Source | Type | Status | Notes |
|--------|------|--------|-------|
| backend-docs | mcp | ok | API 문서 접근 정상 |
| client-docs | mcp | ok | 클라이언트 문서 접근 정상 |
| svc-map | mcp | ok | 서비스 맵 접근 정상 |
| figma | mcp | ok | Figma 보드 접근 정상 |
```

### 예시 2: Minimal (Tier 3, Inline Brief, B등급)

```yaml
---
feature: quick-feature
generated_at: 2026-02-13T15:00:00+09:00
generated_by: sprint-onboarding-phase-0
brief_grade: B
goals:
  - "튜터 차단 기능 구현"
complexity: simple
causal_chain:
  phenomenon: ""
  phenomenon_source: ""
  phenomenon_evidence: ""
  root_cause: ""
  root_cause_source: ""
  root_cause_evidence: ""
  solution_rationale: ""
  rationale_source: ""
  rationale_evidence: ""
  feature_request: "튜터 차단 기능 구현"
  feature_source: "brief"
  chain_status: feature_only
time_estimate:
  initial_range: "30~60분"
input_files:
  - name: brief.md
    type: core-brief
    lines: 1
brownfield_status: greenfield
brownfield_topology: standalone
document_project_path: null
document_project_status: null
fallback_tier: 3
validation:
  brief_included: true
  references_processed: 0/0
  discovered_requirements: 0
  goals_mapped: 1/1
  contradictions_detected: 0
tracking_source: brief
flags:
  force_jp1_review: false
---

# Sprint Input: quick-feature

## Core Brief

튜터 차단 기능을 만들어줘
```

### 예시 3: C등급 Brief + 모순 감지 + force_jp1_review

```yaml
---
feature: tutor-feedback
generated_at: 2026-02-13T16:00:00+09:00
generated_by: sprint-onboarding-phase-0
brief_grade: C
goals:
  - "수업 피드백 시스템 구현"
complexity: simple
causal_chain:
  phenomenon: "수업 후 피드백 수집 채널이 없어 서비스 개선 데이터 부족"
  phenomenon_source: "inferred_from_brief"
  phenomenon_evidence: "Brief '피드백' 키워드 + 회의록 '수업 후 별점 평가 기능 요청'에서 추론"
  root_cause: "구조화된 수업 품질 평가 체계 부재"
  root_cause_source: "inferred_from_brief"
  root_cause_evidence: "별점 + 텍스트 코멘트 요청에서 현재 평가 체계 부재 추론"
  solution_rationale: "별점 + 텍스트 기반 피드백 시스템으로 수업 품질 데이터 체계적 수집"
  rationale_source: "inferred_from_brief"
  rationale_evidence: "회의록 '5점 만점 별점 + 텍스트 코멘트'에서 추론"
  feature_request: "수업 피드백 시스템 구현"
  feature_source: "brief"
  chain_status: partial
time_estimate:
  initial_range: "30~60분"
input_files:
  - name: brief.md
    type: core-brief
    lines: 2
  - name: meeting-notes.md
    type: reference
    category: 회의록
    lines: 45
    relevance: high
brownfield_status: greenfield
brownfield_topology: standalone
document_project_path: null
document_project_status: null
fallback_tier: 2
validation:
  brief_included: true
  references_processed: 1/1
  discovered_requirements: 2
  goals_mapped: 1/1
  contradictions_detected: 1
tracking_source: brief
flags:
  force_jp1_review: true
---

# Sprint Input: tutor-feedback

## Core Brief

피드백

## Reference Materials

### meeting-notes.md
- **Category**: 회의록
- **Relevance**: high
- **Key Points**:
  - 수업 후 별점 평가 기능 요청
  - 5점 만점 별점 + 텍스트 코멘트
- **Constraints**: 튜터에게 익명 처리
- **Decisions**: 별점 3점 이하 시 자동 알림

## Discovered Requirements

- [DISC-01] 별점 평가 UI 필요 (source: meeting-notes.md)
- [DISC-02] 튜터 익명 처리 로직 필요 (source: meeting-notes.md)

## Detected Contradictions

| # | Brief Says | Reference Says | Source | Status |
|---|-----------|---------------|--------|--------|
| 1 | (기능 미언급) | 5점 만점 별점 + 텍스트 코멘트 | meeting-notes.md | 미해결 |
```

### 예시 4: specs-direct (Direct 경로, BMad 산출물 완성 후)

```yaml
---
feature: tutor-exclusion
generated_at: 2026-02-13T18:00:00+09:00
generated_by: specs-direct
brief_grade: A
goals:
  - "수업 후 튜터 차단 기능 구현"
  - "차단된 튜터 매칭 제외 필터링"
  - "차단 관리 UI 제공"
brief_sentences: []
causal_chain: null
time_estimate:
  initial_range: "60~120분"
input_files: []
brownfield_status: configured
brownfield_topology: standalone
document_project_path: null
document_project_status: null
fallback_tier: 1
validation:
  brief_included: false
  references_processed: 0/0
  discovered_requirements: 0
  goals_mapped: 3/3
  contradictions_detected: 0
tracking_source: success-criteria
flags:
  force_jp1_review: false
---
```

- **Direct 경로**: BMad 12단계를 완료하여 planning-artifacts가 이미 존재할 때 `/specs`가 자동 생성
- `generated_by: specs-direct` — Phase 0 미경유
- `brief_sentences: []` — Brief 문장 추적 대신 PRD Success Criteria 추적
- `tracking_source: success-criteria` — JP1에서 PRD Measurable Outcomes 기반 매핑
- `causal_chain: null` — Direct 경로에서는 인과 사슬 미생성
