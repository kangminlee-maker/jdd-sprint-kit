# Translation Ontology 로드맵

> **문서 유형**: 로드맵 — Translation Ontology 논의에서 도출된 향후 과제
> **날짜**: 2026-02-22
> **관련 문서**: [`../translation-ontology.md`](../translation-ontology.md), [`../delta-driven-design.md`](../delta-driven-design.md), [`../judgment-driven-development.md`](../judgment-driven-development.md)

---

## 1. BMad 분리

### 1.1 현재 상태

Sprint Kit은 BMad Method를 활용하며, 현재 여러 지점에서 BMad에 하드코딩 종속되어 있다:

| 파일 | 종속 지점 |
|------|----------|
| `.claude/agents/auto-sprint.md` | BMad 에이전트 경로 하드코딩 (Mary, John, Winston) |
| `.claude/agents/crystallize.md` | BMad 에이전트 경로 하드코딩 (John, Winston) |
| `.claude/rules/jdd-sprint-protocol.md` | `_bmad/docs/prd-format-guide.md` 필수 참조 |
| 포맷 가이드 전체 | BMad 내부(`_bmad/docs/`)에 위치 |

### 1.2 이론적 구조

Translation Ontology(§5)에서 분석한 바와 같이, Sprint Kit의 논리적 핵심(번역, 델타, 판단)은 BMad에 의존하지 않는다. BMad가 담당하는 것은 "답 발견" Phase(Phase 1)의 탐색 품질이다.

접점은 산출물 포맷 계약이다:
- planning-artifacts/ 디렉토리의 파일 포맷(PRD, Architecture, Epics)이 인터페이스 역할
- Sprint Kit은 이 포맷을 입력으로 받아 Specs, Deliverables, Prototype을 생성
- BMad든 다른 프레임워크든, 동일 포맷의 산출물을 생성하면 Sprint Kit이 작동

### 1.3 분리를 위한 작업 항목

- [ ] 포맷 계약을 BMad 외부로 추출 (예: `docs/format-contracts/` 또는 `.claude/formats/`)
  - `prd-format-guide.md`, `architecture-format.md` 등을 BMad 디렉토리에서 독립 위치로 이동
  - BMad 내부에는 해당 포맷을 참조하는 래퍼만 유지
- [ ] `auto-sprint.md`, `crystallize.md`에서 에이전트 경로를 설정 변수화
  - 현재: `Read _bmad/bmm/personas/pm.md` (하드코딩)
  - 목표: `config.yaml`의 `discovery_engine.agents.pm` 경로를 참조
- [ ] `_bmad/bmm/config.yaml`에 `discovery_engine` 설정 추가
  - 에이전트 경로, 워크플로우 경로, 포맷 가이드 경로를 설정으로 관리
- [ ] GSD 등 다른 프레임워크 연동 시 어댑터 패턴 설계
  - 다른 프레임워크가 동일한 planning-artifacts/ 포맷으로 출력하면 Sprint Kit이 작동
  - 포맷이 다른 경우, 어댑터가 해당 프레임워크의 출력을 Sprint Kit 포맷으로 변환

---

## 2. QUERY-N: 번역 불가 비즈니스 결정 배치 질의

### 2.1 설계 개요

Crystallize 과정에서 번역 규칙을 적용할 수 없는 갭이 발견될 수 있다. 이 갭 중 일부는 비즈니스 결정이 필요한 것이다.

**발동 조건** (세 가지 모두 충족 시):
1. 기존 입력(프로토타입, PRD, Architecture, Brownfield)으로 해결 불가
2. 하류 산출물에 대한 영향이 높음 (조용히 기본값을 적용하면 위험)
3. 프로덕트 전문가가 답변 가능한 비즈니스 질문

**동작 방식**:
- Crystallize가 갭을 감지하면 배치로 수집
- 프로덕트 전문가에게 한 번에 질의 (개별 인터럽트가 아닌 배치)
- 응답은 sourced input으로 등록 (`QUERY-N` 태그)
- 등록된 응답을 반영하여 Crystallize 재개

**기존 메커니즘과의 관계**: 현재 이런 갭은 AI가 기본값을 적용하거나 (TECH-N, §3), 프로토타입에서 유추하거나, 누락된 채 진행된다. QUERY-N은 "비즈니스 결정이 필요한 갭"을 명시적으로 포착하는 메커니즘이다.

### 2.2 미해결 설계 과제

- [ ] 갭 20건+ 시 에스컬레이션 전략
  - 20건 이상의 QUERY가 배치로 제시되면 사용자 부담이 과중
  - 우선순위 분류? 단계적 질의? 임계값 초과 시 재생성 권고?
- [ ] 비즈니스/기술 결정 경계의 분류 기준
  - "데이터 보존 기간은 얼마인가?" → 비즈니스 (QUERY-N)
  - "인덱스 전략은?" → 기술 (TECH-N)
  - 경계가 모호한 경우의 분류 규칙
- [ ] `crystallize.md` 파이프라인에 배치 질의 단계 삽입 위치
  - S1(프로토타입 분석) 후? S3(스펙 생성) 중? S5(교차 일관성) 전?
  - 삽입 시점에 따라 갭 감지 범위가 달라짐
- [ ] 실제 Sprint에서 갭 건수 분포 데이터 수집
  - 현재는 갭 빈도에 대한 경험적 데이터가 없음
  - 수 건의 실제 Sprint을 관찰하여 QUERY-N 대상 갭이 얼마나 발생하는지 측정 필요

---

## 3. TECH-N: AI 기본값 기술 결정 목록

### 3.1 설계 개요

프로덕트 전문가가 답변할 수 없는 기술 결정은 AI가 기본값을 적용해야 한다. 이 결정들을 **명시적으로 목록화**하여 구현 전문가가 검토할 수 있게 한다.

**대상**: QUERY-N의 보완물 — QUERY-N이 "사람이 답해야 하는 비즈니스 결정"이라면, TECH-N은 "AI가 기본값을 적용한 기술 결정"이다.

**예시**:
- TECH-1: 페이지네이션 전략 → offset 기반 (기본값)
- TECH-2: 캐시 만료 정책 → 5분 TTL (기본값)
- TECH-3: 파일 업로드 크기 제한 → 10MB (기본값)

**목적**: AI의 기본값 결정을 "투명하게" 만든다. 현재는 이런 결정이 암묵적으로 이루어져, 구현 후에야 문제가 발견된다.

### 3.2 미해결 설계 과제

- [ ] FP1과의 긴장 해소: AI 결정의 사실상 영속화 방지 메커니즘
  - FP1은 "사람의 판단만이 영속 자산"이라고 선언
  - 그러나 TECH-N의 기본값이 검토 없이 구현되면 AI 결정이 사실상 영속화됨
  - 검토 강제 게이트가 필요한가? 아니면 목록화만으로 충분한가?
- [ ] 하류 산출물 반영 후 번복 시 재생성 비용 관리
  - TECH-N 기본값이 이미 api-spec.yaml, schema.dbml 등에 반영된 후
  - 구현 전문가가 기본값을 변경하면 하류 산출물을 모두 재생성해야 함
  - 변경 영향 범위 분석과 부분 재생성이 필요
- [ ] `/validate` `@judge-quality`에 TECH-N 검토 체크리스트 추가
  - Judge가 TECH-N 목록의 각 항목이 적절한지 검토
  - 부적절한 기본값을 감지하여 플래그
- [ ] TECH-N 항목의 "하류 영향 없음/있음" 분류 기준
  - 하류 영향 없음: 변수 명명, 로깅 레벨 등 → 검토 선택사항
  - 하류 영향 있음: DB 인덱스 전략, 캐시 정책 등 → 검토 필수
- [ ] 검토 강제 게이트 설계 (Crystallize 완료 전 vs 후)
  - Crystallize 완료 전: TECH-N 목록을 JP2와 함께 제시? (사용자 부담)
  - Crystallize 완료 후: /parallel 시작 전에 구현 전문가 검토?
  - /validate 단계에서 사후 검토?

---

## 4. 우선순위와 의존성

| 항목 | 우선순위 | 의존성 | 비고 |
|------|---------|--------|------|
| BMad 분리 — 포맷 계약 추출 | 중 | 없음 | 다른 프레임워크 연동 전 선행 필요 |
| BMad 분리 — 에이전트 경로 변수화 | 중 | 포맷 계약 추출 | config.yaml 설계와 동시 진행 |
| QUERY-N — 갭 빈도 데이터 수집 | 높음 | 없음 | 설계 전에 실제 필요성 확인 |
| QUERY-N — 파이프라인 삽입 설계 | 낮음 | 갭 빈도 데이터 | 데이터 없이 설계하면 과잉 엔지니어링 위험 |
| TECH-N — 목록화 메커니즘 | 중 | 없음 | 단순 목록부터 시작 가능 |
| TECH-N — 검토 강제 게이트 | 낮음 | 목록화 메커니즘 | 실제 사용 경험 축적 후 결정 |
