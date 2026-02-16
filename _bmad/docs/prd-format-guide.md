# PRD 작성 가이드라인

BMad Method의 PRD 철학을 기반으로 구체화한 PRD 포맷 가이드라인이다.

> **참고 문서:**
> - BMad PRD 철학: `_bmad/bmm/workflows/2-plan-workflows/prd/data/prd-purpose.md`
> - BMad PRD 워크플로우: `_bmad/bmm/workflows/2-plan-workflows/prd/workflow.md`
> - 실제 PRD 예시: `specs/trial-lesson-flow/raw/trial-lesson-flow-prd-v1.3.md`

---

## 1. YAML Frontmatter

모든 PRD는 YAML frontmatter로 시작한다. BMad 워크플로우가 상태를 추적하는 데 사용한다.

```yaml
---
stepsCompleted: ['step-01-init', 'step-02-discovery', ...]
documentStatus: 'draft' | 'review' | 'final'
version: '1.0'
inputDocuments: ['user-provided-draft: 문서 설명']
workflowType: 'prd'
documentCounts:
  briefs: 0
  research: 0
  projectDocs: 0
  userProvided: 1
classification:
  projectType: 'cross-platform-app'  # cross-platform-app | web-app | api-service | ...
  domain: 'edtech'                    # 프로젝트 도메인
  complexity: 'low' | 'medium' | 'high'
  projectContext: 'brownfield'        # 고정값 (기존 서비스 확장)
partyModeInsights:
  ux:
    - 'UX 관점 인사이트'
  architecture:
    - '아키텍처 관점 인사이트'
  business:
    - '비즈니스 관점 인사이트'
  qa:
    - 'QA 관점 인사이트 (엣지 케이스)'
# 기능별 추가 메타데이터 (선택)
projectInfo:
  name: '{프로젝트명}'
  # 기능에 필요한 도메인 수치들
mvpConfig:
  # MVP 범위 설정값
---
```

### 필수 필드

| 필드 | 용도 |
|------|------|
| `stepsCompleted` | BMad 워크플로우 진행 상태 추적 |
| `documentStatus` | 문서 상태 (draft → review → final) |
| `version` | 문서 버전 |
| `classification` | 프로젝트 분류 (domain: 'edtech', projectContext: 'brownfield' 고정) |
| `partyModeInsights` | Party Mode에서 도출된 다관점 인사이트 |

### 선택 필드

| 필드 | 용도 |
|------|------|
| `projectInfo` | 기능 관련 도메인 수치 (유저 수, 튜터 수 등) |
| `mvpConfig` | MVP 범위를 결정하는 핵심 설정값 |
| `projectScope` | 기능 범위 설정 (예: 예약 기간 +2일, 최대 슬롯 5개) |

---

## 2. 문서 헤더

```markdown
# Product Requirements Document - {기능명 한글} ({기능명 영문})

**Author:** {team_name}
**Date:** YYYY-MM-DD
**Version:** X.Y
**Status:** Draft | Review | Final
```

---

## 3. 섹션 구조

### 필수 섹션 (순서대로)

| # | 섹션 | 핵심 내용 |
|---|------|-----------|
| 1 | Brownfield Sources | 참고한 brownfield 소스 목록 (MCP 서버, Input Documents)과 각 소스에서 발견한 내용 |
| 2 | Executive Summary | 제품, 기능, 핵심 가치, 타겟 규모, 목표 지표 |
| 3 | Success Criteria | User/Business/Technical Success + Measurable Outcomes |
| 4 | Product Scope | MVP (P0/P1), Growth Phase, Vision |
| 5 | User Journeys | 페르소나 기반 시나리오 (Happy Path + Edge Cases) |
| 6 | Domain-Specific Requirements | 개인정보, 데이터 정책, 도메인 규칙 |
| 7 | Cross-platform App 기술 요구사항 | 기술 스택, API 설계, 컴포넌트 구조 |
| 8 | Functional Requirements | 기능 요구사항 (FR 번호 체계) |
| 9 | Non-Functional Requirements | 성능, 보안, 신뢰성, 통합 |
| 10 | QA Considerations | 엣지 케이스, 테스트 시나리오 |

### 선택 섹션

| 섹션 | 조건 |
|------|------|
| Event Tracking | 이벤트 로깅/분석이 필요한 기능 |
| Project Scoping & Phased Development | 복잡한 다단계 개발 계획이 필요한 경우 |
| Innovation Analysis | 경쟁 차별화 분석이 필요한 경우 |

---

## 4. 각 섹션 작성 규칙

### 4.1 Executive Summary

**목적:** 한 페이지 안에 기능의 본질을 전달한다.

**필수 요소:**
- 제품명, 기능명, 핵심 가치 (한 문장)
- 핵심 요약 테이블: 타겟 규모, MVP 범위, 플랫폼, 개발 리소스, 예상 기간
- 목표 지표 테이블: 지표, 현재값, 목표값

```markdown
## Executive Summary

**제품:** {프로젝트명} - {프로젝트 설명}
**기능:** {기능명}
**핵심 가치:** "{한 문장 핵심 가치}"

### 핵심 요약

| 항목 | 내용 |
|------|------|
| **타겟 규모** | ... |
| **MVP 범위** | ... |
| **플랫폼** | Web + iOS + Android |
| **개발 리소스** | N명 |
| **예상 기간** | N주 |

### 목표 지표

| 지표 | 현재 | 목표 |
|------|------|------|
| ... | ... | ... |
```

### 4.2 Success Criteria

**목적:** 성공을 정량적으로 정의한다.

**필수 구조:**
- **User Success**: 사용자 관점 성공 기준
- **Business Success**: 비즈니스 관점 성공 기준
- **Technical Success**: 기술 관점 성공 기준 (성능, 정합성)
- **Measurable Outcomes**: 테이블로 정리 (지표, 현재, 목표, 측정 방법)

```markdown
## Success Criteria

### User Success
- 기능 사용 후 **재수강률 N% 달성** (기준선 X% → +Y%p)
- ...

### Business Success
- 기능 출시 N개월 내 **활성 유저 M%가 1회 이상 사용**
- ...

### Technical Success
- {핵심 기술 지표} **< Nms** ({측정 방법})
- ...

### Measurable Outcomes

| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|-----------|
| ... | ... | ... | ... |
```

**규칙:**
- 모든 지표는 수치화 가능해야 한다
- 측정 방법을 반드시 명시한다
- "개선", "향상" 같은 모호한 표현 금지 → 구체적 수치 사용

### 4.3 Product Scope

**목적:** 무엇을 만들고, 무엇을 만들지 않는지 명확히 한다.

**필수 구조:**
- **MVP**: P0 (핵심), P1 (중요) 우선순위 구분. 테이블 형식.
- **Growth**: Phase별 목표와 기능 목록
- **Vision**: 장기 방향성

```markdown
## Product Scope

### MVP - 1차 출시

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| ... | ... | P0 |
| ... | ... | P1 |

### Growth Phase 1: {목표} (MVP+N주)

**목표:** {측정 가능한 목표}

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| ... | ... | P0 |

### Vision (Future)

| 기능 | 방향 |
|------|------|
| ... | ... |
```

**규칙:**
- P0/P1 구분을 명확히 한다
- Growth Phase마다 측정 가능한 목표를 설정한다
- 이미 구현 완료된 항목은 `**✅ 완료**`로 표시한다
- 기존 시스템을 활용하는 경우 `> ✅ **기존 시스템 활용:**` 블록으로 명시한다

### 4.4 User Journeys

**목적:** 기능을 사용자의 실제 경험으로 시각화한다.

**형식:** 스토리텔링 (Opening Scene → Rising Action → Climax → Resolution)

```markdown
### Journey N: {이름} - {시나리오 설명} ({유형})

**페르소나:** {이름} ({나이}, {직업/상황})

**Opening Scene:**
{사용자의 상황과 동기}

**Rising Action:**
{기능과의 상호작용 과정}

**Climax:**
{핵심 인터랙션 순간}

**Resolution:**
{결과와 사용자의 감정/행동 변화}
```

**필수 여정:**
1. **Happy Path** (1개 이상) — 이상적인 성공 시나리오
2. **Edge Case** (1개 이상) — 예외 상황 대응
3. **Post-MVP** (선택) — Growth 기능이 있는 경우

**여정 끝에 Requirements Summary 테이블 필수:**

```markdown
### Journey Requirements Summary

| 여정 | 필요한 기능 |
|------|-------------|
| {이름} (Happy Path) | 기능1, 기능2, ... |
| {이름} (Edge Case) | 기능3, 기능4, ... |
```

**규칙:**
- 한국어 페르소나 사용 (민지, 수진, 현수 등 실제 이름)
- 구체적인 나이, 직업, 상황 설정
- **볼드**로 UI 요소와 사용자 액션 강조
- 대화체 인용으로 사용자의 속마음 표현
- 각 Journey에서 필요한 FR을 자연스럽게 드러낸다

### 4.5 Domain-Specific Requirements

**목적:** 프로젝트 도메인 특유의 정책과 규칙을 정의한다.

**도메인 공통 고려사항:**
- 개인정보 및 데이터 정책 (데이터 소유권, 탈퇴 시 처리, 보존 기간)
- 튜터 보호 정책 (해당 시)
- 기술적 제약 (GDPR 등)
- 기존 도메인 정책과의 일관성 (Brownfield)

### 4.6 Cross-platform App 기술 요구사항

**목적:** 기술 구현에 필요한 정보를 제공한다.

**필수 요소:**
- 기술 스택 현황 테이블 (현재 상태 + 비고)
- API 요구사항: 기존 API 활용 목록 + 신규 API 테이블
- 컴포넌트 구조: 트리 형식으로 예상 컴포넌트 구조 명시
- 플랫폼별 차이점

```markdown
### 기술 스택 현황

| 항목 | 현재 | 비고 |
|------|------|------|
| **프론트엔드** | React | ... |
| **플랫폼** | Web 기반 앱 | ... |

### API 요구사항

**기존 API 활용:**
- {API 이름} - {설명}

**신규 API 필요:**

| API | 설명 | 우선순위 |
|-----|------|----------|
| ... | ... | P0/P1 |

### 컴포넌트 구조 (예상)

{트리 구조로 컴포넌트 계층 표현}
```

**Brownfield 규칙:**
- 기존 API를 먼저 나열하고, 신규 API를 별도로 분리한다
- 기존 시스템과의 연동 포인트를 명시한다 (`> ✅ **기존 API 활용:**` 형식)
- 신규 API는 우선순위(P0/P1)를 반드시 표기한다

### 4.7 Functional Requirements

**목적:** 구현할 기능의 정확한 계약(contract)을 정의한다.

**번호 체계:** `FR{번호}` — 순차 번호. 도메인별 그룹핑.

```markdown
## Functional Requirements

### {도메인 그룹명} ({영문 그룹명})

- **FR1:** {주어}은/는 {기능}할 수 있다
- **FR2:** 시스템은 {기능}할 수 있다
```

**작성 패턴:**
- `{주어}은/는 {기능}할 수 있다` — 능력(capability) 중심 표현
- 주어: "학생", "시스템", "운영팀", "CS팀" 등
- 하위 항목이 있으면 `FR{번호}-{서브번호}` 사용 (예: FR4-1, FR38-5)
- 특수 그룹이 있으면 `FR-{접두어}{번호}` 사용 (예: FR-LP1)

**BMad PRD 철학 — FR 품질 기준:**

| 기준 | 설명 | 예시 |
|------|------|------|
| **Specific** | 명확하고 구체적 | "학생은 레벨별 교재를 미리볼 수 있다" |
| **Measurable** | 테스트 가능 | "추천 시간대를 가장 빠른 순으로 4개 표시" |
| **No Implementation** | 구현 방식 노출 금지 | ❌ "Redis에 캐싱한다" → ✅ "빠르게 조회할 수 있다 (캐시)" |
| **No Subjective** | 주관적 형용사 금지 | ❌ "빠르게" → ✅ "< 500ms" |

**Anti-Patterns:**
- ❌ "시스템은 사용자가 쉽게 이용할 수 있도록 한다" → 주관적
- ❌ "시스템은 JWT 토큰을 Redis에 저장한다" → 구현 누출
- ❌ "빠른 응답" → NFR로 분리하여 수치화

### 4.8 Non-Functional Requirements

**목적:** 시스템의 품질 속성을 정량적으로 정의한다.

**필수 카테고리:**

| 카테고리 | 포함 내용 |
|----------|-----------|
| Performance | API 응답시간, 로딩시간 (p95 기준) |
| Reliability | 가용성, 동시성 처리, 데이터 정합성 |
| Integration | 기존 시스템과의 호환성, 하위 호환성 |
| Security | 인증, 인가, 데이터 보호 (해당 시) |
| Error Handling | 공통 에러 처리 정책 (해당 시) |

**테이블 형식:**

```markdown
### Performance

| NFR | 요구사항 | 측정 방법 |
|-----|----------|-----------|
| NFR1 | {요구사항} < {수치} ({백분위}) | {측정 방법} |
```

**BMad PRD 철학 — NFR 품질 기준:**
- 모든 NFR은 수치화 + 측정 방법 필수
- ❌ "시스템은 확장 가능해야 한다" → ✅ "10x 부하 증가를 수평 확장으로 처리"
- ❌ "높은 가용성" → ✅ "99.5% 업타임"

### 4.9 QA Considerations

**목적:** 테스트 시 고려해야 할 엣지 케이스와 시나리오를 정의한다.

**테이블 형식:**

```markdown
### {테스트 그룹명} ({우선순위})

| 케이스 | 시나리오 | 예상 처리 |
|--------|----------|-----------|
| ... | ... | ... |
```

**규칙:**
- 우선순위(P0/P1)별로 그룹핑한다
- UX 정책이 있으면 플로우차트(```...```)로 시각화한다
- 회귀 테스트 포인트를 명시한다

---

## 5. Brownfield 작성 원칙

Brownfield 프로젝트(운영 중인 서비스 확장)에서는 모든 PRD에서 기존 시스템과의 관계를 명확히 한다.

### 5.1 기존 시스템 참조 표기

```markdown
> ✅ **기존 시스템 활용:** {어떤 기존 기능을 어떻게 활용하는지}
```

```markdown
> ✅ **기존 API 활용:** {기존 API 이름 및 용도}
```

### 5.2 기존 vs 신규 구분

- API 설계 시 "기존 API 활용" / "신규 API 필요"를 분리한다
- 컴포넌트 구조에서 `(기존)` / `(신규)` / `(기존 + 확장)` 를 표기한다
- 이미 완료된 기능은 `**✅ 완료**` 표시한다

### 5.3 MCP 데이터 활용

PRD 작성 시 다음 MCP에서 기존 시스템 정보를 조회하여 반영한다:

| MCP | 확인 사항 |
|-----|-----------|
| `backend-docs` | 기존 API, 도메인 정책, 데이터 모델 |
| `client-docs` | 기존 컴포넌트, 화면 흐름, 코드 패턴 |
| `svc-map` | 기존 고객 여정, 화면 플로우 |
| `figma` | 최신 디자인 시안 |

### 5.4 Brownfield Sources 섹션 (필수)

PRD 문서 앞단(문서 헤더 바로 아래, Executive Summary 바로 위)에 `## Brownfield Sources` 섹션을 반드시 포함한다. 어떤 소스에서 어떤 brownfield 정보를 참고했는지 추적 가능하도록 기록한다.

**필수 구조:**

```markdown
## Brownfield Sources

본 PRD는 아래 소스에서 기존 시스템 정보를 수집하여 brownfield 컨텍스트를 반영하였다.

### MCP 서버

| MCP 서버 | 용도 | 발견 사항 |
|----------|------|-----------|
| svc-map | 서비스 맵 | {조사 결과: Screen ID, 플로우 등} |
| figma | 디자인 데이터 | {조사 결과: Node ID, 디자인 패턴 등} |
| backend-docs | 백엔드 정책 | {조사 결과: API, 도메인 로직 등} |
| client-docs | 클라이언트 UI/UX | {조사 결과: 컴포넌트, 패턴 등} |

### Input Documents

| 문서 | 주요 Brownfield 정보 |
|------|---------------------|
| {문서명} | {해당 문서에서 확인된 기존 시스템 정보} |

### PRD 내 Brownfield 표기법

- `(기존)` / `(신규)` / `(기존+확장)` 태깅: 컴포넌트 트리에서 기존/신규 구분
- `> ✅ **기존 시스템 활용:**` 블록: 기존 시스템 활용 포인트 명시
```

**작성 규칙:**
- MCP 서버에서 조사한 결과가 없으면 "해당 없음" 또는 "조회 결과 없음"으로 명시한다 (행 자체를 삭제하지 않는다)
- Screen ID, Node ID 등 구체적 참조 정보를 포함하여 추후 검증이 가능하도록 한다
- Input Documents에서 확인된 기존 시스템 관련 정보만 기재한다 (신규 요구사항은 제외)
- 이 섹션은 `{planning_artifacts}/brownfield-context.md`의 L1+L2 레이어 요약이다. 상세 brownfield 데이터(API 목록, 컴포넌트 경로, 서비스 연동 포인트 등)는 brownfield-context.md를 참조한다

---

## 6. 정보 밀도 (Information Density)

BMad PRD의 핵심 철학: **모든 문장이 정보 무게를 가져야 한다.**

### Anti-Patterns (제거 대상)

| 잘못된 표현 | 올바른 표현 |
|-------------|-------------|
| "시스템은 사용자가 ~하도록 허용한다" | "사용자는 ~할 수 있다" |
| "중요한 점은~" | 사실을 직접 서술 |
| "~하기 위해서" | "~하려면" 또는 직접 서술 |
| 대화체 채움말 | 직접적이고 간결한 서술 |

### 목표
- 단어당 최대 정보량
- 제로 허위 장식
- 정확하고 테스트 가능한 언어

---

## 7. 추적성 체인 (Traceability Chain)

PRD 내에서 다음 추적성을 유지한다:

```
Vision → Success Criteria → User Journeys → Functional Requirements
```

- 모든 FR은 특정 User Journey에서 도출 가능해야 한다
- 모든 Success Criteria는 Measurable Outcomes로 측정 가능해야 한다
- User Journey Requirements Summary가 FR과 매핑되어야 한다

---

## 8. 파일 저장 위치

모든 PRD는 프로젝트별 디렉토리에 저장된다:

```
specs/{feature}/planning-artifacts/prd.md
```

Auto Sprint, `/specs` 모두 이 경로에 최종 PRD를 생성한다.

레거시 PRD(버전 이력 등)는 `specs/{feature}/raw/`에 보관:
- `specs/{feature}/raw/{feature}-prd-v1.md`

---

## 9. 체크리스트 (Self-Review)

PRD 작성 완료 후 다음을 확인한다:

- [ ] YAML frontmatter의 `classification`에 `domain: 'edtech'`, `projectContext: 'brownfield'` 설정
- [ ] `partyModeInsights`에 ux, architecture, business, qa 최소 1개씩 인사이트 포함
- [ ] **Brownfield Sources 섹션**이 문서 헤더 아래, Executive Summary 위에 존재 (MCP 서버 조사 결과 + Input Documents 정리)
- [ ] Executive Summary에 핵심 요약 + 목표 지표 테이블 존재
- [ ] Success Criteria에 Measurable Outcomes 테이블 존재 (지표, 현재, 목표, 측정 방법)
- [ ] Product Scope에 P0/P1 구분 + Growth Phase + Vision 존재
- [ ] User Journeys에 Happy Path 1개 + Edge Case 1개 이상 + Requirements Summary
- [ ] 기존 시스템 활용/신규 구분이 API와 컴포넌트에 명시됨
- [ ] 모든 FR이 능력(capability) 형식 ("~할 수 있다")
- [ ] 모든 FR에 주관적 형용사 없음 (빠른, 쉬운, 직관적 등)
- [ ] 모든 NFR에 수치 + 측정 방법 존재
- [ ] QA Considerations에 엣지 케이스 테이블 존재
- [ ] Brownfield 참조 표기 (`✅ 기존 시스템 활용`, `기존/신규` 구분)
