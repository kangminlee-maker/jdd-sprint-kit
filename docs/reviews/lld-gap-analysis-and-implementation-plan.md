# LLD Gap Analysis & Implementation Plan

> **문서 유형**: Party Mode 5라운드 리뷰 종합 + 구현 계획
> **작성일**: 2026-02-20
> **트리거**: 외부 PRD 분석 보고서(`prd-analysis-report.md`)에서 Sprint Kit의 reconciled/ 출력에 6건의 CRITICAL + 10건의 HIGH Gap 발견
> **참여 에이전트**: John (PM), Winston (Architect), Murat (Test Architect), Sally (UX), Bob (SM), Devil's Advocate, Industry Methods Analyst, BMad Boundary Analyst, Root Cause Analyst, LLD Specialist, Edge/Fail Case Specialist, Gap Discovery Agent, Final Synthesis Agent
> **선행 문서**: 없음 (새 분석 스트림)
> **관련 리서치**: [`progressive-refinement-methodology-survey.md`](progressive-refinement-methodology-survey.md)
> **대체 문서**: [`docs/delta-driven-design.md`](../delta-driven-design.md) — 본 문서의 Gap 분석 및 구현 계획은 유효합니다. Delta-Driven Design 문서가 개념적 기반을 제공하고, 본 문서가 실행 계획을 제공합니다.

---

## Executive Summary

외부 PRD 분석 보고서에서 Sprint Kit의 reconciled/ 출력이 외부 팀의 AI 기반 개발에 필요한 구현 수준의 세부 사항을 갖추지 못했음이 밝혀졌습니다. Party Mode 5라운드(약 20건의 에이전트 분석) 후 근본 원인이 식별되었습니다:

**Sprint Kit의 design.md는 HLD(High-Level Design) 수준에서 작동하지만 LLD(Low-Level Design) 섹션이 부재합니다.** 이것은 누락된 레이어가 아니라, 기존 레이어 내의 불완전한 포맷 정의입니다. 수정 방법은 design.md의 조건부 섹션 확장이며, 새 파일이나 레이어 경계 변경이 아닙니다.

세 가지 구조적 문제가 식별되었습니다:
1. **design.md의 LLD 부재** — 7개 카테고리의 설계 정보가 저장될 곳이 없습니다
2. **Happy Path 편향** — 적대적 검증 단계가 없어 생성기와 검증기가 동일한 사각지대를 공유합니다
3. **Architecture → Stage 7 파이프라인 단절** — XState 생성 입력 소스가 존재하지 않는 Architecture state diagram을 참조합니다

추가로, 원래 10건 외에 6건의 Gap이 발견되었습니다 (Observability, Worker 통합 테스트, Interface Contract 프로토콜, GDPR, Crystallize Carry-Forward 검증, Scope Gate 산출물 커버리지).

---

## 1. 근본 원인 분석

### 1.1 이러한 Gap이 존재하는 이유

Sprint Kit의 산출물 포맷은 단순한 CRUD 중심 기능을 위해 설계되었습니다. 파이프라인이 복잡한 기능(상태 기반 엔티티, 알고리즘 로직, 동시 접근, 스케줄링 작업, Brownfield 마이그레이션)을 만나면, 포맷 정의에 필요한 설계 정보를 담을 구조가 없습니다. 이 정보는 Worker의 자율 판단 영역으로 떨어지며, 다음 문제를 야기합니다:

- 병렬 Worker 간 비일관적 구현
- 오류/엣지 케이스 처리 누락
- 검증 불가능한 구현 (Judge가 대조할 명세 부재)

### 1.2 원래 10건의 Gap 분류

분석 보고서의 10건 모두 **EDGE CASE** (7건) 또는 **PROCESS** (1건)로 분류되었으며, **STRUCTURAL** 문제는 0건입니다. 레이어 경계(PRD → Architecture → Specs → Deliverables → Execute)는 올바릅니다. 부족한 것은 기존 레이어 내의 포맷 완전성입니다.

| Gap | 분류 | 수정 위치 |
|-----|------|----------|
| H5: Concurrency NFR | EDGE CASE | PRD format + Scope Gate |
| H8: Business Rule Matrix | EDGE CASE | PRD format |
| C6: FR-NFR Contradiction | PROCESS | Scope Gate |
| H10: Carry-forward Classification | EDGE CASE | Crystallize protocol |
| H4: Algorithm Specification | EDGE CASE | PRD format + design.md |
| C1/C2: Auto Trigger/Scheduler | EDGE CASE | PRD format + design.md |
| H3/H7: State Machine Detection | EDGE CASE | deliverable-generator |
| H1: Migration Strategy | EDGE CASE | design.md + Scope Gate |

### 1.3 "Happy Path 편향" 패턴

Sprint Kit의 포맷은 단순한 케이스에 최적화되어 있으며 복잡한 케이스를 위한 조건부 포맷이 부족합니다. 이것은 설계 결함이 아니라 성숙도 문제입니다. 수정 방법은 조건부 섹션 확장 — 프로젝트의 복잡도가 요구할 때만 활성화되는 섹션입니다.

---

## 2. LLD Gap 분석

### 2.1 LLD란?

Low-Level Design(LLD)는 Architecture(HLD)와 코드 사이에 위치합니다. 각 컴포넌트가 내부적으로 **어떻게 동작하는지** — 상태 전환, 알고리즘, 동시성 전략, 오류 처리, 스케줄링 메커니즘을 명세합니다. IEEE 1016(Software Design Description)이 이 레이어를 정의합니다. 현대 AI 네이티브 방법론(GitHub Spec Kit "Plan", Thoughtworks SDD "Specification")은 설계 레이어에 이 정보를 포함합니다.

### 2.2 현재 Sprint Kit 커버리지

| # | LLD 카테고리 | 현재 상태 | 위치 (존재 시) | 완성도 | Gap 설명 |
|---|---|---|---|---|---|
| 1 | **State Transitions** | 조건부 | state-machines/ (Stage 7) | 40% | Stage 7은 "Architecture가 복잡한 상태 관리를 식별"할 때만 트리거 — 감지 규칙이 없는 주관적 기준. Architecture 워크플로우에 상태 다이어그램 생성 단계 없음. |
| 2 | **Entity Lifecycle** | 없음 | — | 0% | 엔티티의 create→active→archive→delete 라이프사이클을 정의하는 산출물 없음 |
| 3 | **Event Choreography** | 없음 | — | 0% | 비동기 이벤트 인과관계/순서 명세 없음 |
| 4 | **Decision Tables** | 없음 | — | 0% | 다중 조건 비즈니스 규칙이 PRD 산문에 흩어져 있음, 구조화된 매트릭스 없음 |
| 5 | **Algorithm Pseudocode** | 없음 | — | 0% | 복잡한 로직이 자연어로만 기술됨 |
| 6 | **Validation Rules** | 부분적 | api-spec.yaml | 30% | OpenAPI를 통한 필드 레벨 유효성 검사; 필드 간 유효성 검사 규칙 누락 |
| 7 | **Priority/Ranking** | 없음 | — | 0% | 정렬/우선순위 알고리즘 미정의 |
| 8 | **API Contracts** | 완전 | api-spec.yaml (Stage 3) | 90% | Gap: 멱등성 키, 속도 제한, 버전 관리 전략 |
| 9 | **Event Schemas** | 없음 | — | 0% | 비동기 메시지 페이로드 스키마 없음 |
| 10 | **Schema Details** | 완전 | schema.dbml (Stage 5) | 85% | Gap: 인덱스 근거, 파티셔닝 전략 |
| 11 | **Migration Plans** | 부분적 | decision-log.md (선택적 ADR) | 30% | 롤백 절차, 데이터 변환 순서, 무중단 전략 없음 |
| 12 | **Concurrency: Locking** | 없음 | — | 0% | 잠금 전략 명세 없음 |
| 13 | **Concurrency: Race Conditions** | 없음 | — | 0% | 충돌 시나리오/해결 명세 없음 |
| 14 | **Concurrency: Transactions** | 없음 | — | 0% | 트랜잭션 경계 정의 없음 |
| 15 | **Concurrency: Idempotency** | 없음 | — | 0% | 멱등성 메커니즘 명세 없음 |
| 16 | **Error: Taxonomy** | 부분적 | api-spec.yaml error codes | 40% | 엔드포인트별 오류는 존재; 시스템 전체 오류 분류 누락 |
| 17 | **Error: Retry Policies** | 없음 | — | 0% | 재시도/백오프 명세 없음 |
| 18 | **Error: Fallback** | 없음 | — | 0% | 폴백/성능 저하 명세 없음 |
| 19 | **Scheduling: Cron Jobs** | 없음 | — | 0% | 배치 스케줄 명세 없음 |
| 20 | **Scheduling: Event Handlers** | 없음 | — | 0% | 이벤트 트리거→핸들러 매핑 없음 |
| 21 | **Cross-cutting: Logging** | 없음 | — | 0% | 로깅 전략 없음 |
| 22 | **Cross-cutting: Monitoring** | 없음 | — | 0% | SLI/SLO/알림 명세 없음 |
| 23 | **Cross-cutting: Caching** | 없음 | — | 0% | 캐시 전략 없음 |
| 24 | **Cross-cutting: Security Patterns** | 부분적 | design.md (JWT 언급) | 30% | 인증 흐름 상세, CORS, CSP, 입력 새니타이징 누락 |
| 25 | **Environment & Config** | 없음 | — | 0% | 환경 변수 목록, 피처 플래그 설정 없음 |

### 2.3 design.md에 추가할 내용 (조건부 섹션)

모든 추가 사항은 **always-detect, conditionally-generate** 패턴을 사용합니다:
- 감지는 모든 프로젝트에서 실행됩니다 (PRD FR에서 패턴 스캔)
- 생성은 패턴이 발견된 경우에만 발생합니다
- 해당되지 않는 경우, Output Summary에 "N/A" 한 줄이 기록됩니다

| 섹션 | 감지 트리거 | 생성 시 내용 |
|---|---|---|
| **State Transitions** | PRD FR에 2개 이상의 명시적 상태명 + 전환 동사 | Mermaid stateDiagram-v2 + 전환 테이블 (from → event → to → guard → side-effect) |
| **Algorithm Specs** | PRD FR에 matching/ranking/calculate/filter 키워드 | 의사코드 + 입출력 계약 + 엣지 케이스 테이블 |
| **Concurrency Controls** | NFR에 concurrent/race/consistency 언급, 또는 동일 리소스에 2개 이상 쓰기 API | 충돌 시나리오 테이블 + 잠금 전략 + 멱등성 메커니즘 |
| **Scheduler Specs** | PRD FR에 scheduled/periodic/cron/trigger/batch 키워드 | 트리거 인벤토리 테이블 (스케줄, 트리거 유형, 실패 처리) |
| **Migration Strategy** | Brownfield AND schema.dbml에 [BROWNFIELD] 수정 테이블 | 마이그레이션 단계 테이블 (순서, 유형, 롤백, 위험) |
| **Error Handling Strategy** | **항상 생성** (모든 프로젝트에 오류 처리 필요) | 오류 분류 + 재시도 정책 + 폴백 전략 |
| **Operational Specs** | **항상 생성** | 로깅 전략 + 모니터링/알림 + 캐싱 (조건부) + 타임존 정책 (조건부) + 환경 변수 |

---

## 3. 파이프라인 연결 오류

### 3.1 Architecture → Stage 7 XState 단절

**현재 상태**: deliverable-generator Stage 7은 다음과 같이 기술합니다:
```
Source: Architecture state diagrams
```
그러나 Architecture 워크플로우(step-01~step-08)에는 **상태 다이어그램을 생성하는 절차가 없습니다**. Architecture 워크플로우 파일에서 "state diagram", "state machine", "statechart", "XState"를 검색하면 결과가 0건입니다.

**수정**: 두 가지 변경:
1. Auto Sprint Step 2c (Architecture 생성 프롬프트): 조건부 상태 다이어그램 생성 지시 추가
2. Stage 7 입력 소스: "Architecture state diagrams"에서 "design.md State Transitions section"으로 변경

이를 통해 신뢰할 수 있는 데이터 흐름이 생성됩니다:
```
PRD State Transition FR → Architecture State Diagrams (조건부) → design.md State Transitions → Stage 7 XState
```

### 3.2 C6: FR-NFR 모순 검사 누락

**현재 상태**: Scope Gate가 FR과 NFR을 독립적으로 검사합니다. 교차 검증이 존재하지 않습니다.

**수정**: Scope Gate `prd` 단계에 체크리스트 항목 1개 추가:
```
- [ ] No FR-NFR contradictions exist
```

---

## 4. Happy Path 편향 & 적대적 접근

### 4.1 문제

현재 파이프라인: 생성기(deliverable-generator)가 검증기(Self-Validation)이기도 합니다. 동일한 맥락 = 동일한 사각지대. 엣지 케이스는 PRD AC에서만 생성되며, 다음을 놓칩니다:

- 유효하지 않은 상태 전환
- 동시 접근 충돌
- 비즈니스 규칙 충돌
- API 오류 코드 커버리지 Gap
- 흐름 이탈 시나리오
- 통합 실패 시나리오

### 4.2 해결책: Devil's Advocate Pass

산출물 생성 후, JP2 전에 실행되는 전용 적대적 검증 단계입니다.

**파이프라인 내 위치**:
```
[Deliverables (Stage 3-10)] → [Scope Gate: deliverables] → [Devil's Advocate Pass] → [JP2]
```

**7가지 적대적 렌즈**:

| 렌즈 | 대상 파일 | 발견 내용 |
|------|----------|----------|
| API Boundary Violation | api-spec.yaml | 누락된 오류 코드 BDD 커버리지, 빈값/null 입력 처리 |
| Concurrency & Race Condition | api-spec.yaml + schema.dbml | 중복 생성, 한계값에서의 카운터 오버플로우, 동시 상태 전환 |
| State Transition Edge | state-machines/ + key-flows.md | 유효하지 않은 전환, 중복 이벤트, 타임아웃 처리 |
| Data Integrity & Migration | schema.dbml + brownfield-context.md | FK 삭제 처리, API 응답의 NULL, 새 컬럼 기본값 |
| Integration Failure | api-spec.yaml + brownfield-context.md | 외부 API 타임아웃/오류, 인증 핸드오프 실패, 스키마 불일치 |
| Business Rule Conflict | prd.md FRs + key-flows.md | 동시 적용되는 상충 규칙, 실행 취소/롤백 부작용 |
| Flow Abandonment | key-flows.md | 흐름 중간 이탈, 네트워크 끊김, 이중 제출, 뒤로 가기 탐색 |

**출력**:
- `adversarial-scenarios.md` — 심각도(CRITICAL/HIGH/MEDIUM)가 포함된 발견 보고서
- `bdd-scenarios/adversarial-*.feature` — CRITICAL + HIGH 발견에 대한 자동 생성 BDD
- `readiness.md` — 적대적 Pass 결과로 업데이트

**조건부 실행**: `complexity: simple` 또는 `api endpoints ≤ 3`인 경우 건너뜁니다.

### 4.3 MSW State Transition Validation (Sally의 발견)

`state-machines/`가 존재할 때, 프로토타입의 MSW 핸들러는 전환 적법성을 검증해야 합니다. 유효하지 않은 전환은 조용히 성공하는 대신 422를 반환합니다. 이를 통해 JP2 판단 왜곡을 방지합니다 — 사용자가 프로토타입에서 불가능한 상태 전환이 성공하는 것을 보는 상황을 차단합니다.

---

## 5. 추가 발견 Gap (원래 10건 외)

| 우선순위 | Gap | 영향 범위 | 해결 위치 |
|---|---|---|---|
| **P0** | Observability(모니터링/로깅/알림) 명세 누락 | 모든 프로젝트 | prd-format-guide NFR + design.md Operational Specs |
| **P0** | Worker 통합 테스트 구체성 부족 | 모든 병렬 실행 | /parallel Step 6 프로토콜 |
| **P0** | /parallel Interface Contract 프로토콜 불충분 | 모든 병렬 실행 | /parallel Step 1 프로토콜 |
| P1 | GDPR/개인정보 체크리스트 부재 | PII 프로젝트 | prd-format-guide + Scope Gate |
| P1 | Crystallize Carry-Forward 검증 누락 | S 경로 | crystallize.md S5 |
| P1 | Scope Gate 산출물 커버리지 불충분 | 모든 프로젝트 | scope-gate.md |
| P2 | API 버전 관리 전략 부재 | Brownfield | deliverable-generator Stage 3 |
| P2 | 접근성 명세가 구조적으로 배제됨 | 공개/글로벌 서비스 | prd-format-guide NFR |
| P2 | 피처 플래그/점진적 롤아웃 부재 | 라이브 서비스 | prd-format-guide Optional Sections |
| P3 | UX Writing 일관성 구조 누락 | UX 품질 | Entity Dictionary 확장 |
| P3 | i18n/l10n 완전 부재 | 다국어 프로젝트 | prd-format-guide Domain-Specific |

---

## 6. 제안 솔루션 아키텍처

### 6.1 설계 원칙

1. **조건부 활성화**: 모든 새 섹션은 감지 트리거가 매칭될 때만 활성화됩니다. 단순 CRUD 프로젝트는 추가 오버헤드가 전혀 없습니다.
2. **Always-detect**: 섹션 필요 여부 감지는 항상 수행됩니다. "필요한지 확인"은 필수이고, "생성"은 조건부입니다.
3. **기존 레이어 확장**: 새 파일이나 레이어 없이, design.md 포맷 + PRD 포맷 + Scope Gate 검사를 확장합니다.
4. **생성과 적대적 검증의 분리**: Devil's Advocate Pass는 전용 단계이며, 생성에 내장되지 않습니다.
5. **PRD 경계 보존**: PRD는 WHAT(비즈니스 규칙)을 정의하고, design.md는 HOW(기술적 설계)를 정의합니다. PRD의 상태 전환 FR은 상태/전환/불변조건(비즈니스 규칙)을 명세하고, design.md는 Mermaid 다이어그램/잠금 전략/의사코드(기술적 설계)를 명세합니다.

### 6.2 변경 후 데이터 흐름

```
PRD (State/Algorithm FR 보강)
  ↓ Scope Gate: FR-NFR 모순 검사 [NEW]
Architecture (조건부 상태 다이어그램) [NEW]
  ↓ Scope Gate: LLD 매핑 검사 [NEW]
design.md (7개 조건부 LLD 섹션) [NEW]
  ↓
Deliverables (Stage 7이 design.md State Transitions 읽기) [FIX]
  ↓
BDD (적대적 시나리오) [NEW]
MSW (State transition validation) [NEW]
  ↓
Devil's Advocate Pass [NEW]
  ↓
JP2 (readiness.md에 적대적 결과 포함)
```

---

## 7. 파일별 구체적 변경사항

### 7.1 `_bmad/docs/prd-format-guide.md`

**변경 A: Complex FR Supplementary Structures** (Section 4.7, Anti-Patterns 뒤)

State Transition FR과 Algorithmic Logic FR을 위한 조건부 구조를 추가합니다. 구현 누출 없이 비즈니스 규칙(상태, 전환, 불변조건, 입출력)을 명세합니다.

```markdown
**Complex FR Supplementary Structures (conditional)**:

When an FR involves state transitions or algorithmic logic, supplement the
capability statement with structured detail.

**State Transition FRs**: When an FR involves entity state changes:
- **States**: {state1} | {state2} | {state3} | ...
- **Transitions**: {state1} → {state2} (trigger: {event}), ...
- **Invariants**: {rules that must never be violated}
- **Terminal states**: {states with no outgoing transitions}

**Algorithmic Logic FRs**: When an FR involves non-trivial computation:
- **Input**: {what data enters the computation}
- **Rules**: {ordered list of business rules applied}
- **Output**: {what the computation produces}
```

**변경 B: NFR Concurrency + Observability 카테고리** (Section 4.8)

Required categories 테이블을 확장합니다:

| Category | Contents | When Mandatory |
|----------|----------|----------------|
| Performance | API response time, load time (p95) | Always |
| **Concurrency** | Race condition handling, idempotency | When 2+ users can modify same resource |
| Reliability | Availability, data consistency | Always |
| Integration | Backward compatibility | When brownfield |
| Security | Auth, data protection | When user data involved |
| **Observability** | SLI/SLO targets, alerting conditions, logging requirements | Always |
| Error Handling | Common error policies | Always |

**변경 C: 체크리스트 추가** (Section 9)

```markdown
- [ ] Concurrency NFR section present when multi-user write scenarios exist
- [ ] Observability NFR section present with SLI/SLO targets
- [ ] State Transition FRs include States/Transitions/Invariants structure
- [ ] Algorithm Logic FRs include Input/Rules/Output structure
```

**예상 추가량**: 약 40줄

### 7.2 `.claude/agents/scope-gate.md`

**변경 A: PRD stage** — FR-NFR 모순 검사 (필수, 모든 프로젝트)

```markdown
- [ ] No FR-NFR contradictions exist (FR capabilities achievable within NFR constraints)
```

**변경 B: Spec stage** — LLD 매핑 검사 (조건부)

```markdown
**design.md checks (additional)**:
- [ ] State transition FRs (if any in PRD) have corresponding State Transitions section in design.md
- [ ] Algorithmic logic FRs (if any in PRD) have corresponding Algorithm Specs section in design.md
- [ ] Error Handling Strategy section exists
- [ ] Operational Specifications section exists
```

**예상 추가량**: 약 15줄

### 7.3 `.claude/agents/deliverable-generator.md`

**변경 A: Stage 2 design.md LLD 조건부 섹션**

design.md 생성 지시에 추가합니다 (기존 4개 불릿 포인트 뒤):

```markdown
**LLD Conditional Sections** (include only when PRD FRs contain corresponding patterns):

Scan PRD FRs for the following patterns. If detected, generate the section:

| PRD Pattern | design.md Section | Content |
|---|---|---|
| State Transition FR | ### State Transitions | Mermaid stateDiagram-v2 + transition table |
| Algorithm Logic FR | ### Algorithm Specs | Pseudocode + decision table + edge cases |
| Concurrency NFR | ### Concurrency Controls | Lock strategy + conflict resolution |
| Scheduler/batch FR | ### Scheduler Specs | Trigger table + failure recovery |
| Brownfield + schema changes | ### Migration Strategy | Step table + rollback + risk |
| Always | ### Error Handling Strategy | Error classification + retry + fallback |
| Always | ### Operational Specs | Logging + monitoring + env vars |

If none of the conditional patterns are detected, omit those sections.
```

**변경 B: Stage 7 입력 소스 수정**

```markdown
### Stage 7: XState State Machines (conditional)

Generate state-machines/ only if design.md contains a ### State Transitions section:

- Source: design.md State Transitions section (NOT Architecture state diagrams)
- One XState machine per state flow
- Include guard conditions and invariant assertions

Skip if design.md has no State Transitions section.
```

**변경 C: Stage 6 적대적 시나리오** (조건부)

```markdown
**Adversarial scenarios** (conditional — when PRD contains State Transition FRs):
- Generate @adversarial tagged scenarios for:
  - Invalid transition attempts
  - Concurrent transition conflicts
  - Invariant violation attempts
```

**변경 D: Stage 10 MSW state transition validation** (조건부)

```markdown
**State Transition Validation in MSW** (conditional — when state-machines/ exists):
- MSW handlers for state-transitioning entities must validate transition legality
- On invalid transition: return 422 with error details
- Import transition rules from state-machines/ TypeScript definitions
```

**예상 추가량**: 약 60줄

### 7.4 `.claude/agents/auto-sprint.md`

**변경: Step 2c Architecture 프롬프트 확장**

Step 2c (Architecture - Winston) 프롬프트 끝에 추가합니다:

```markdown
CONDITIONAL — State Diagrams:
If the PRD contains FRs with explicit state transitions (States/Transitions/Invariants),
include a '## State Diagrams' section in Architecture with:
- One Mermaid stateDiagram-v2 per state-transitioning entity
- Transition events and guard conditions
If no state transition FRs exist in PRD, omit this section.
```

**예상 추가량**: 약 10줄

### 7.5 `.claude/rules/jdd-sprint-protocol.md`

**변경: Crystallize Carry-Forward 분류**

기존 Carry-Forward 설명을 분류된 태그로 교체합니다:

```markdown
Items carried forward from existing documents are classified:

| Classification | Tag | Meaning |
|---|---|---|
| Defined | [carry-forward:defined] | Fully specified, confirmed applicable |
| Deferred | [carry-forward:deferred] | Mentioned but explicitly deferred to post-MVP |
| New | [carry-forward:new] | Added during reconciliation to fill gaps |
```

**예상 추가량**: 약 12줄

### 7.6 `.claude/agents/devils-advocate.md` (새 파일)

Devil's Advocate Pass를 위한 새로운 에이전트 정의입니다. 포함 내용:
- 감지 규칙이 있는 7가지 적대적 렌즈
- Negative Scenario Generator 규칙 (api-spec 오류 코드, 상태 전환 매트릭스, 비즈니스 규칙 충돌에서 BDD 자동 생성)
- 출력 포맷 (adversarial-scenarios.md + adversarial-*.feature)
- 심각도 분류 기준 (CRITICAL/HIGH/MEDIUM)
- 조건부 실행 규칙 (단순 프로젝트 건너뛰기)

**예상 크기**: 약 300줄

---

## 8. 구현 계획

### Phase 1: Foundation (저위험, 고영향)

| 순서 | 변경사항 | 파일 | 위험도 | 라인 수 |
|---|---|---|---|---|
| 1-1 | FR-NFR 모순 검사 | scope-gate.md | LOW | +2 |
| 1-2 | Concurrency + Observability NFR 카테고리 | prd-format-guide.md | LOW | +15 |
| 1-3 | Complex FR Supplementary Structures | prd-format-guide.md | LOW | +20 |
| 1-4 | 체크리스트 추가 | prd-format-guide.md | LOW | +5 |
| 1-5 | Carry-Forward 분류 | jdd-sprint-protocol.md | LOW | +12 |

**합계**: 3개 파일, 약 54줄, 예상 소요시간 30-45분

### Phase 2: LLD Channel (중위험, 핵심 변경)

| 순서 | 변경사항 | 파일 | 위험도 | 라인 수 |
|---|---|---|---|---|
| 2-1 | design.md LLD 조건부 섹션 | deliverable-generator.md | MEDIUM | +30 |
| 2-2 | Stage 7 입력 소스 수정 | deliverable-generator.md | LOW (버그 수정) | +5 |
| 2-3 | Architecture 상태 다이어그램 프롬프트 | auto-sprint.md | LOW | +10 |
| 2-4 | Scope Gate LLD 매핑 검사 | scope-gate.md | LOW | +10 |

**합계**: 3개 파일, 약 55줄, 예상 소요시간 45-60분

### Phase 3: Adversarial Layer (높은 복잡도)

| 순서 | 변경사항 | 파일 | 위험도 | 라인 수 |
|---|---|---|---|---|
| 3-1 | Devil's Advocate 에이전트 정의 | devils-advocate.md (NEW) | MEDIUM | ~300 |
| 3-2 | BDD 적대적 시나리오 | deliverable-generator.md | LOW | +15 |
| 3-3 | MSW state transition validation | deliverable-generator.md | LOW | +10 |
| 3-4 | 파이프라인 통합 (Step 5-D) | auto-sprint.md | MEDIUM | +30 |

**합계**: 3개 파일 (1개 신규), 약 355줄, 예상 소요시간 60-90분

### Phase 4: Additional Gaps (백로그)

원래 10건 외 발견된 P0-P1 Gap 해결:

| 항목 | 범위 | Phase |
|---|---|---|
| Observability NFR | Phase 1 (1-2)에서 처리 | 완료 |
| Worker 통합 테스트 | /parallel 프로토콜 개선 | 향후 |
| Interface Contract 프로토콜 | /parallel Step 1 개선 | 향후 |
| GDPR/개인정보 체크리스트 | Scope Gate 조건부 검사 | 향후 |
| Crystallize Carry-Forward 검증 | crystallize.md S5 개선 | 향후 |
| Scope Gate 산출물 커버리지 | scope-gate.md 확장 | 향후 |

---

## 9. 검증 전략

### Shadow Run 대상

| Phase | 테스트 기능 | 검증 |
|---|---|---|
| Phase 1 | 기존 기능 아무거나 | Scope Gate가 FR-NFR 모순을 포착; PRD가 해당 시 Concurrency NFR 포함 |
| Phase 2 | 복잡한 상태 기반 기능 | design.md에 State Transitions + Algorithm Specs 포함; Stage 7이 design.md에서 XState 생성 |
| Phase 3 | BDD 포함 복잡한 기능 | adversarial-scenarios.md 생성; @adversarial BDD 시나리오 존재 |

### 회귀 검사

기존 Shadow Run 결과(specs/test-tutor-excl, 5/5 PASS)는 각 Phase 후에도 유효해야 합니다.

### 롤백 계획

모든 변경은 **추가적**(기존 코드 삭제 또는 재구성 없음)입니다. 각 Phase는 다른 Phase에 영향을 주지 않고 `git revert`로 독립적으로 되돌릴 수 있습니다.

---

## 10. 설계 결정 & 근거

### D1: 새 파일 생성 대신 design.md 확장

**결정**: `detailed-design.md`를 새로 만드는 대신 design.md에 LLD 섹션을 추가합니다.

**근거**: Worker는 이미 design.md를 기본 설계 참조로 읽습니다. 같은 파일에 섹션을 추가하면 Worker의 SSOT Reference Priority를 변경할 필요가 없습니다. 새 파일은 Worker 에이전트, Scope Gate, traceability-matrix, 그리고 모든 다운스트림 소비자를 업데이트해야 합니다.

### D2: 필수 섹션 대신 조건부 활성화

**결정**: 모든 LLD 섹션은 always-detect / conditionally-generate 패턴을 사용합니다.

**근거**: 단순 CRUD 프로젝트(전체 기능의 약 60-70%로 추정)는 상태 머신, 알고리즘 명세, 동시성 제어가 필요하지 않습니다. 필수 섹션은 빈값/N/A 노이즈를 생성하여, PRD format guide의 Information Density 원칙("모든 문장은 정보 비중을 가져야 한다")을 위반합니다.

### D3: 생성에 내장하지 않고 별도 Pass로 Devil's Advocate 분리

**결정**: Stage 6 BDD 생성을 확장하는 대신 전용 적대적 검증 단계를 만듭니다.

**근거**: 근본적인 문제는 생성기와 검증기가 동일한 맥락을 공유한다는 것입니다(동일한 사각지대). 적대적 사고를 같은 생성 프롬프트에 내장하면 두 관심사 모두 희석됩니다. 분리를 통해 진정한 적대적 관점을 보장합니다 — Devil's Advocate는 생성 편향 없이 완성된 산출물을 읽습니다.

### D4: PRD의 State Transition 구조는 비즈니스 규칙이지 구현이 아닙니다

**결정**: PRD FR에 State/Transition/Invariant 구조를 허용합니다.

**근거**: "주문은 결제가 수신되면 PENDING에서 CONFIRMED로 전환할 수 있다"는 비즈니스 규칙(WHAT)이지 구현 세부사항(HOW)이 아닙니다. "비관적 잠금이 포함된 XState 사용"은 구현입니다. 보충 구조는 구현 메커니즘을 규정하지 않으면서 비즈니스 상태 규칙을 명세합니다. 이는 BMad PRD Philosophy의 "No Implementation Leakage" 원칙과 일관됩니다.

### D5: Architecture 워크플로우 단계 추가 대신 Stage 7 입력 소스 수정

**결정**: Stage 7 입력을 "Architecture state diagrams"에서 "design.md State Transitions"로 변경합니다.

**근거**: Architecture 워크플로우는 BMad 코어이며(Sprint Kit 소유가 아님), 수정하면 Guided 경로에 영향을 줍니다. 대신 Auto Sprint 프롬프트가 Architecture에서 조건부로 상태 다이어그램을 생성하고, design.md가 이를 Stage 7이 소비하는 구조화된 포맷으로 변환합니다. Guided 경로에서는 Architect(Winston)가 step-04/step-05에서 자연스럽게 상태 다이어그램을 논의합니다.

### D6: Observability를 필수 NFR 카테고리로

**결정**: Observability를 "항상 필수" NFR 카테고리에 추가합니다.

**근거**: 배포되는 모든 서비스에는 모니터링과 알림이 필요합니다. Concurrency(다중 사용자 쓰기에 조건부)와 달리, Observability는 보편적입니다. PRD에 SLI/SLO 목표가 정의되지 않으면 배포 후 검증의 근거가 없습니다. 이것은 모든 프로젝트에 영향을 미치는 P0 Gap으로 식별되었습니다.

---

## 11. 변경하지 않는 것

| 항목 | 이유 |
|---|---|
| 레이어 경계 (PRD/Architecture/Specs/Deliverables/Execute) | 근본 원인 분석에서 경계가 올바름을 확인 (STRUCTURAL Gap 0건) |
| PRD의 what/why 문서 역할 | State Transition FR 보충은 비즈니스 규칙이지 구현이 아님 |
| JP1/JP2 구조 | 새 judgment point 불필요; 기존 2-JP 구조가 충분 |
| Architecture 워크플로우 파일 | BMad 코어; Auto Sprint 프롬프트를 통해 변경 |
| brownfield-context-format.md | Carry-Forward 분류는 Crystallize reconciled/ 산출물에 적용, brownfield-context 자체에 적용되지 않음 |
| sprint.md / specs.md | Phase 0 런처와 Specs 생성 커맨드는 변경 불필요; 모든 수정은 포맷 정의와 에이전트에 적용 |

---

## 12. 향후 라운드를 위한 미결 항목

| 항목 | 트리거 조건 | 설명 |
|---|---|---|
| Handoff 문서 (외부 팀 내보내기) | 외부 팀이 reconciled/를 본 후 요청 | reconciled/README.md 또는 handoff.md 인덱스 문서 |
| Worker 통합 테스트 프로토콜 | Phase 3 구현 후 | /parallel Step 6 구체적 통합 테스트 실행 |
| Interface Contract 프로토콜 | Phase 3 구현 후 | /parallel Step 1 api-spec.yaml에서 공유 타입 생성 |
| 성능 테스트 시나리오 | NFR 성능 목표 정의 시 | 산출물 내 부하 테스트 시나리오 명세 |
| GDPR/개인정보 체크리스트 | PII 처리 기능 발생 시 | Scope Gate 개인정보 정책 조건부 검사 |
| 외부 라이브러리 의존성 관리 | 병렬 실행 충돌 시 | design.md "Approved Libraries" 섹션 |

---

## Appendix A: Progressive Refinement Methodology Survey (요약)

전체 리서치 문서: [`progressive-refinement-methodology-survey.md`](progressive-refinement-methodology-survey.md)

### 주요 발견

**1. Sprint Kit의 3-pass 패턴(Generate → Reconcile → Realize)은 방법론 영역에서 고유합니다.**

기존 방법론 중 이 정확한 패턴을 가진 것은 없습니다. 대부분의 방법론은 2번째 pass로 검증(checking)을 사용합니다. Sprint Kit은 정합(reconciliation, 양방향 재정렬)을 사용합니다 — 프로토타입 현실이 모든 상류 산출물에 역전파되어, reconciled/ 산출물 세트를 생산합니다.

| 방법론 | 2번째 Pass 특성 | 상류 산출물 업데이트 여부 |
|---|---|---|
| V-Model | Verification | 아니오 (계획 불변) |
| Spiral | Risk resolution | 아니오 (동일 형태 pass) |
| Design Sprint | User testing | 아니오 (상류 업데이트 없음) |
| SDD Spec-Anchored | Bidirectional sync | 예 (지속적) |
| **Sprint Kit** | **Reconciliation** | **예 (일괄, JP2 시점)** |

**2. 이 패턴은 AI 이전에는 경제적으로 불가능했습니다.**

정합은 전체 산출물 세트를 재생성해야 합니다. AI 이전 비용: 수 주~수 개월. AI 네이티브 비용: 수 분~수 시간. AI가 생성 비용을 충분히 낮추어 "검증"(문제 발견, 중단)을 "정합"(발견 + 수정 + 재정렬)으로 업그레이드할 수 있게 되었습니다.

**3. Sprint Kit은 4가지 카테고리 하이브리드입니다: Spec-Driven + Contract-First + Prototype-First + AI-Native.**

- Spec-Driven: AI가 기획 산출물을 자동 생성
- Contract-First: OpenAPI + Specmatic이 AI 비결정성을 제어
- Prototype-First: JP2에서 구체적 산출물에 대한 판단
- AI-Native: 사람이 판단하고, AI가 구현

**4. AI 호환성을 5가지 기준으로 평가했습니다** (자세한 내용은 전체 문서 참조):

| 기준 | 측정 항목 |
|---|---|
| C1: Structured Artifacts | 기계 파싱 가능한 출력인가? |
| C2: Verification Automation | 결과를 자동 검증할 수 있는가? |
| C3: AI Strength Alignment | AI 강점(생성) vs 약점(발견)에 맞는가? |
| C4: Human Judgment Isolation | 인간 입력을 체크포인트로 격리할 수 있는가? |
| C5: Regeneration Affinity | 수정보다 재생성을 지원하는가? |

Contract-First가 보편적 AI 결합성에서 가장 높은 점수를 받았습니다. Emergent Design은 가장 낮은 점수를 받았습니다(AI는 리팩토링을 통한 설계 발견에 약합니다).

**5. 가장 가까운 철학적 유사체: Hegel의 변증법이 아니라 Peirce의 탐구 논리입니다.**

| Peirce | Sprint Kit | 활동 |
|---|---|---|
| Abduction | Pass 1 (Generative) | 입력에서 최선의 설계 생성 |
| Deduction | Prototype | 설계가 실현되면 어떤 모습인지 연역 |
| Induction | Pass 2 (Reconciliatory) | 프로토타입 관찰에서 상류 수정 |

### 산업 방법론 Gap 매핑

10개 Gap 항목이 다른 방법론에서는 어디에 위치하는가?

| 항목 | Waterfall | RUP | DDD | Shape Up | GitHub Spec Kit |
|---|---|---|---|---|---|
| State Machines | LLD | Design Model | Tactical (Aggregate) | Builder 재량 | Plan |
| Schedulers | LLD | Design Model | Implementation | Builder 재량 | Plan |
| Migration | LLD | Deployment Model | Implementation | Builder 재량 | Plan |
| Algorithms | LLD | Design Model | Tactical (Domain Service) | Builder 재량 | Plan |
| Concurrency | LLD | Design Model | Implementation | Builder 재량 | Plan |
| Business Rules | SRS + LLD | Analysis Model | Tactical (Entity/VO) | Pitch | Specify |
| API Schemas | LLD | Design Model | Implementation | Builder 재량 | Plan |

**공통 발견**: 10개 방법론 중 8개가 명시적 LLD/Detailed Design 레이어를 가지고 있습니다. Sprint Kit의 design.md가 그에 해당하며 — 포맷 확장만 필요합니다.

---

## Appendix B: Party Mode 라운드 요약

| 라운드 | 초점 | 주요 발견 |
|---|---|---|
| Round 1 | PRD 포맷과 분석 보고서 비교 | PRD format guide에 11개 Gap; 5개 포맷 + 5개 조건부 + 1개 프로세스 |
| Round 2 | Handoff 문서 & 문서 네이밍 | PRD ≠ 구현 명세; 포맷 Gap과 별개의 관심사 |
| Round 3 | Gap 해결 제안 (6개 에이전트 병렬) | John: PRD 조건부 섹션; Winston: design.md LLD; Murat: BDD + 테스트 완전성; Sally: MSW validation; Bob: 3단계 계획; DA: 최소 3개 파일 변경 |
| Round 4 | 구조적 vs 엣지 케이스 분석 (4개 에이전트 병렬) | 0 STRUCTURAL / 7 EDGE CASE / 1 PROCESS; "Happy Path 편향" 패턴; LLD 레이어 부재이나 design.md 확장으로 수정 가능 |
| Round 5 | 제로 베이스 재검토 (4개 에이전트 병렬) | LLD 종합 매핑 (50개 카테고리, 25개 Gap); Devil's Advocate Pass 설계; 6건의 추가 P0-P3 Gap 발견 |
| Round 6 | Progressive refinement 방법론 서베이 | 11개 카테고리 분류; Sprint Kit의 3-pass 패턴 고유; AI 호환성 5개 기준 평가 |
