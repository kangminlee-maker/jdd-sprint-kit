# Delta-Driven Design

> **문서 유형**: 설계 이론 — Sprint Kit의 개념적 토대와 방법론 위치
> **Version**: 1.1
> **Date**: 2026-02-22
> **Related**: [`judgment-driven-development.md`](judgment-driven-development.md) (설계 철학), [`translation-ontology.md`](translation-ontology.md) (통합 프레이밍), [`reviews/lld-gap-analysis-and-implementation-plan.md`](reviews/lld-gap-analysis-and-implementation-plan.md) (구현 계획)

---

## 1. 핵심 통찰

Sprint Kit의 파이프라인은 많은 산출물을 생성한다: PRD, Architecture, Epics, Specs, Deliverables, Prototype. 그런데 실제 최종 산출물은 무엇인가?

**기존 답변**: "구현 팀이 실행할 수 있는 조정된 명세 집합."

**새로운 답변**: **"현재 시스템(Brownfield)과 목표 시스템(승인된 Prototype) 사이의 Delta(변경분)를 정밀하게 정의한 것으로, 기계가 실행할 수 있는 형식으로 표현된다."**

이 관점 전환은 Sprint Kit의 본질을 바꾼다:

| 관점 | 기존 프레임 | 새로운 프레임 |
|---|---|---|
| **주요 목표** | Specs + Deliverables 생성 | Brownfield와 Target 사이의 Delta 정의 |
| **Prototype의 정체** | JP2 리뷰용 산출물 | **User Grammar로 표현된 목표 상태** |
| **Specs의 정체** | 주된 산출물 | **목표 상태를 Development Grammar로 번역한 것** |
| **Crystallize의 역할** | Specs와 Prototype 조정 | **Delta 추출: Brownfield ↔ 번역된 Prototype** |
| **Execute의 역할** | Specs 구현 | **Delta 실현: Brownfield를 Target으로 전환** |

---

## 2. 두 가지 Grammar

소프트웨어는 두 세계의 교차점에 존재한다: 사용자의 세계(가치가 정의되는 곳)와 기계의 세계(가치가 구현되는 곳). 각 세계에는 고유한 Grammar(문법)가 있다.

### User Grammar (사용자의 세계)

시스템의 **실제 사용자**가 쓰는 언어이다. 시각적 UI에 국한되지 않으며, 사용자가 누구인지에 따라 달라진다:

| 시스템 사용자 | User Grammar | Prototype 형태 | 검증 방법 |
|---|---|---|---|
| **최종 사용자 (인간)** | 화면, 동작, 시각적 상태, 내비게이션 흐름 | React + MSW 시각적 Prototype | 사람이 보고 상호작용함 |
| **다른 서비스 (서버)** | API 계약, 요청/응답 스키마, 에러 코드 | API mock (OpenAPI + mock server) | 계약 테스트 (Specmatic) |
| **AI 에이전트** | 구조화된 문서, YAML/JSON 스키마, 프롬프트 템플릿 | YAML/JSON 명세 문서 | 스키마 검증 + AI 실행 테스트 |
| **데이터 파이프라인** | 데이터 스키마, 변환 규칙, 품질 제약 | 샘플 데이터 + 변환 스크립트 | 데이터 품질 검사 |

**핵심 원칙**: Prototype은 시각적 UI 관례가 아니라 시스템의 실제 사용자에 의해 정의된다. 시스템의 사용자가 다른 서버라면 Prototype은 API mock이다. 사용자가 AI 에이전트라면 Prototype은 구조화된 문서이다.

**이 Grammar를 사용하는 주체**: 시스템의 실제 사용자 — 시스템의 출력을 소비할 누구든. 그들은 자신의 고유한 상호작용 방식으로 Prototype을 사용하여 정확성을 평가한다.

**이 Grammar에 해당하는 Sprint Kit 산출물**: **Prototype** — 형태가 사용자 유형에 맞춰 적응한다 (인간은 시각적, 서비스는 API mock, AI는 구조화된 문서)

### Development Grammar (기계의 세계)

구현의 언어이다. 다음으로 표현된다:
- API 엔드포인트 (메서드, 경로, 요청/응답 스키마)
- 데이터베이스 스키마 (테이블, 컬럼, 제약조건, 인덱스)
- 상태 머신 (상태, 전이, 가드, 액션)
- 알고리즘 (입력, 규칙, 출력, 엣지 케이스)
- 스케줄된 작업 (트리거, 스케줄, 재시도 정책)
- 보안 규칙 (인증, 인가, 데이터 보호)
- 인프라 (배포, 모니터링, 스케일링)

**이 Grammar를 사용하는 주체**: 개발자, AI 코딩 에이전트. 이들은 테스트와 검증을 통해 정확성을 평가한다.

**이 Grammar에 해당하는 Sprint Kit 산출물**: **Specs** (requirements.md, design.md, tasks.md), **Deliverables** (api-spec.yaml, schema.dbml, bdd-scenarios/)

### 번역 문제

사용자는 자신의 Grammar로만 정확성을 검증할 수 있다. 기계는 Development Grammar의 명령만 실행할 수 있다. 따라서:

1. **User Grammar에서 답을 찾는다** → Prototype (형태가 사용자 유형에 맞음), 실제 사용자가 JP2에서 검증
2. **답을 Development Grammar로 번역한다** → Specs, AI가 번역
3. **격차를 측정한다** → Delta = 번역된 Target - Brownfield
4. **격차를 실행한다** → AI가 Delta를 구현

**이 순서만이 올바른 순서이다.** 이를 뒤집으면(Specs를 먼저 정의하고 그에 맞춰 Prototype을 만들면) 사용자에게 자신이 사용하지 않는 Grammar로 검증하도록 강요하게 된다.

---

## 3. 번역: User Grammar → Development Grammar

이 번역은 열린 추상화가 아니다. 알려진 요소들 사이의 규칙 기반 매핑이다.

### 번역 규칙

| User Grammar 요소 (Prototype에서 관찰 가능) | Development Grammar 대응물 (Specs 내) |
|---|---|
| 화면 / 페이지 | 라우트 정의 + 페이지 컴포넌트 + API 호출 목록 |
| 사용자 동작 (버튼 클릭, 폼 제출) | API 엔드포인트 (메서드 + 경로 + 요청 본문) |
| 화면에 표시된 데이터 | API 응답 스키마 + DB 쿼리 패턴 |
| 화면 간 내비게이션 | 라우트 전이 + 조건부 리다이렉트 규칙 |
| 상태 배지 / 라벨 (Active, Expired 등) | 엔티티 상태 enum + 상태 전이 규칙 |
| 에러 메시지 ("이미 활성화됨") | API 에러 코드 + HTTP 상태 + 에러 조건 |
| 빈 상태 ("아직 항목이 없습니다") | API 빈 응답 처리 + 조건부 UI |
| 로딩 상태 (스피너) | 비동기 API 호출 + 로딩 상태 관리 |
| 자동 동작 텍스트 ("자동 활성화됩니다") | Scheduler/Trigger 정의 + cron/이벤트 규칙 |
| 계산된 값 ("사용 가능한 레슨 2개") | 알고리즘 명세 (입력 → 규칙 → 출력) |
| 목록 정렬 | API 쿼리 파라미터 + 정렬 알고리즘 |
| 권한 기반 UI (관리자 전용 버튼) | 인가 규칙 + API 미들웨어 |
| 폼 검증 메시지 | 입력 검증 규칙 (필드 단위 + 교차 필드) |
| 확인 다이얼로그 | 비즈니스 규칙 + 상태 전제조건 검사 |
| 알림/토스트 | 이벤트 트리거 + 알림 채널 + 메시지 템플릿 |

**각 행이 하나의 번역 규칙이다.** Prototype의 모든 User Grammar 요소는 하나 이상의 Development Grammar 요소에 매핑된다. 매핑되지 않는 요소가 있으면 번역 테이블에 새로운 행이 필요하다 — 그러나 구조는 항상 동일하다: User Grammar 요소 → Development 대응물.

### 번역이 추가하는 것 (Carry-Forward)

일부 Development Grammar 요소는 User Grammar 대응물이 없다 — 사용자에게는 보이지 않지만 시스템에 필수적인 것들이다:

| Development Grammar 요소 | Prototype에서 보이지 않는 이유 | 출처 |
|---|---|---|
| 성능 목표 (p95 < 500ms) | MSW mock에서 지연 시간을 관찰할 수 없음 | PRD NFR |
| 보안 규칙 (JWT, CORS, 입력 살균) | Mock이 보안을 강제하지 않음 | Architecture |
| 마이그레이션 전략 (ALTER TABLE, 데이터 백필) | Mock이 새 데이터를 사용함 | Brownfield 분석 |
| 동시성 처리 (락, 멱등성) | 단일 사용자 Prototype | PRD NFR |
| 모니터링/알림 (SLI/SLO, 대시보드) | 운영 환경이 없음 | 운영 요구사항 |
| 에러 재시도/폴백 (서킷 브레이커, 백오프) | Mock이 항상 응답함 | Architecture |

이 항목들은 PRD, Architecture, Brownfield 컨텍스트에서 최종 Specs로 Carry-Forward(이월)된다. 번역 출력에 추가된다:

```
Complete Specs = translate(Prototype) + carry-forward(PRD, Architecture, Brownfield)
```

### Carry-Forward 생명주기

Carry-Forward 항목은 Crystallize 파이프라인을 통해 정의된 생명주기를 따른다:

```
Collection → Classification → Resolution → Registry → Translation → Verification
(S3 Agent B)   (4-way)        (S3-R)       (S3.5)     (S4)          (S7)
```

1. **Collection**: Agent B가 Prototype에서 발견되지 않는 PRD FR을 식별한다
2. **Classification**: 각 항목을 INVISIBLE, ACCESS_GATED, OUT_OF_SCOPE, 또는 MISSING으로 분류한다
3. **Resolution**: MISSING 항목 → DECISION_REQUIRED, S3-R Phase B에서 제품 전문가에게 제시한다. 사용자가 확인해야 Registry에 들어갈 수 있다
4. **Registry**: S3.5가 모든 Carry-Forward 후보를 수집하고 (사용자가 확인한 MISSING 항목 포함) 생명주기 상태를 할당한다 (INJECT/CONFLICT/DROP/DEFER)
5. **Translation**: S4가 Registry를 먼저 읽는다 — INJECT 항목만 조정된 산출물에 포함된다. Registry가 없으면 (레거시): 임시 Carry-Forward를 폴백으로 사용한다
6. **Verification**: S7이 INJECT 항목이 존재하는지, 미허가 Carry-Forward가 없는지 확인한다

이 생명주기는 임시 Carry-Forward의 두 가지 실패 모드를 방지한다: 무음 누락(번역 중 항목이 잊힘)과 환각 추가(AI가 어떤 소스 문서에도 없는 항목을 추가).

---

## 4. Delta

### 정의

```
Delta = Complete Specs - Brownfield
      = [translate(Prototype, Constraints) + carry-forward] - Brownfield
```

여기서:
- **translate(Prototype, Constraints)**: 모든 User Grammar 요소를 Development Grammar로 변환한 것으로, Brownfield Constraint Profile에 의해 파라미터화됨
- **carry-forward**: 비가시적 요구사항 (NFR, 보안, 마이그레이션, 운영)
- **Brownfield**: 기존 시스템을 Development Grammar로 기술한 것 (brownfield-context.md L1-L4 + Constraint Profile)

### 정밀 Delta

Delta 계산의 품질은 **Target**(번역된 Prototype)과 **Baseline**(Brownfield) 모두의 정밀도에 달려 있다. 두 수준의 Brownfield 정밀도가 존재한다:

| 수준 | Brownfield 내용 | Delta 정밀도 | 충분한 용도 |
|-------|-------------------|-----------------|---------------|
| **Structural** (L1-L4) | 도메인 개념, API, 컴포넌트, 파일 경로 | "무엇을 건드릴지" | 계획, 태스크 분해, 영향 분석 |
| **Constraint** (L1-L4 + CP) | 위 + nullable 규칙, enum DB 값, 네이밍 패턴, 트랜잭션 매니저, 락 패턴 | "건드릴 때 어떤 규칙을 지켜야 하는지" | 번역 정확도, 마이그레이션 계획, 구현 정확성 |

Constraint Profile 없이 번역하면 기존 코드와 충돌하는 Specs가 만들어질 수 있다 (예: DB에 `UNLIMIT`으로 저장되어 있는데 `UNLIMITED`를 사용하거나, 필드가 NOT NULL인데 nullable이라고 가정하는 경우). Constraint Profile은 번역 함수에 **규칙 수준의** Brownfield 데이터를 제공하여 이 격차를 해소한다.

```
translate(Prototype, ∅)           → specs가 기존 코드와 충돌할 수 있다
translate(Prototype, Constraints) → specs가 기존 코드 패턴을 준수한다
```

### Brownfield 스캔: 두 가지 목적

Brownfield 스캔은 파이프라인의 서로 다른 단계에서 근본적으로 다른 두 가지 목적을 수행한다:

| 목적 | 시점 | 답하는 질문 | 정밀도 수준 |
|---------|--------|-------------------|-----------------|
| **방향 스캔** | Phase 1 (Pass 1 + Pass 2) | "우리 기능에 영향을 미치는 기존 시스템 요소가 무엇인가?" | Structural (L1-L4) + Constraint Profile 일괄 |
| **Delta 스캔** | Crystallize S2 | "JP2 반복 중 추가된 개념에 대한 제약이 있는가?" | 증분 CP만 (Delta 개념) |

Phase 1 스캔은 구조적 레이어와 Constraint Profile을 단일 패스에서 수집한다 (Stage 3 탐색 중 제약이 추출됨 — 추가 파일 읽기 없음). Crystallize 스캔은 증분적이다 — Prototype에 나타났지만 Phase 1 CP에 없던 도메인 개념만 대상으로 한다.

### Delta 구성요소

| Delta 유형 | 의미 | 예시 |
|---|---|---|
| **Positive delta** | 생성하거나 변경해야 함 | 새 API 엔드포인트, 새 DB 컬럼, 새 상태 전이 |
| **Zero delta** | 이미 존재하며 변경 불필요 | Prototype이 그대로 사용하는 기존 API |
| **Negative delta** | 제거하거나 폐기해야 함 | 새 버전으로 대체된 구 API, 데드 코드 정리 |
| **Modification delta** | 기존 요소 변경 필요 | API 응답에 새 필드 추가, DB 컬럼 타입 변경 |

### Delta가 올바른 단위인 이유

Delta가 정밀하게 정의되면 실행은 기계적이 된다:
- 각 Positive delta 항목 → Worker의 태스크
- 각 Modification delta 항목 → File Ownership을 가진 Brownfield 인식 태스크
- 각 Negative delta 항목 → 정리 태스크
- Zero delta 항목 → 작업 불필요 (회귀 테스트로 검증)

**개발의 품질은 Delta 정의의 품질에 의해 결정된다.** Delta가 완전하고 정밀하면 구현은 올바를 것이다. Delta가 불완전하거나 모호하면 아무리 숙련된 구현이라도 보상할 수 없다.

이것이 Sprint Kit의 주요 목표가 코드 생성이 아닌 Delta 정의인 이유이다.

---

## 5. 수학적 프레이밍: 미적분학과 사영

Delta-Driven Design의 핵심 개념은 미적분학과 사영기하학의 개념에 정확히 대응한다. 이 수학적 프레이밍은 구조적 유비이다 — 같은 연산을 다른 언어로 기술한 것이며, 완전한 수학적 동치(동형사상)를 주장하지는 않는다.

### 미분과 적분

Delta 추출은 미분이다 — 변화율을 추출하는 연산:

```
f'(x) ↔ Delta extraction
```

전체 시스템 복원은 적분이다 — Delta로부터 원래 시스템을 복원하는 것:

```
∫f'(x)dx + C ↔ Brownfield + Delta + Carry-Forward = Complete System
```

| 미적분학 | Delta-Driven Design |
|---|---|
| f(x) — 원래 함수 | Complete System — 목표 시스템 |
| f'(x) — 도함수 | Delta — 변경분 |
| ∫f'(x)dx — 부정적분 | Brownfield + Delta — 가시적 변경의 합 |
| C — 적분 상수 | Carry-Forward — 비가시적 요구사항 |
| C는 초기/경계 조건으로 결정됨 | Carry-Forward는 PRD/Architecture/Brownfield로부터 결정됨 |

### 적분 상수로서의 Carry-Forward

미분에서 상수의 도함수는 0이다. 아무리 미분해도 상수는 사라진다. 정확히 같은 이유로, Carry-Forward 항목은 Prototype에서 보이지 않는다:

| 미적분학 | Delta-Driven Design |
|---|---|
| d/dx[C] = 0 | NFR/보안은 Prototype에서 보이지 않음 |
| 적분만으로는 C를 복원할 수 없음 | Prototype 번역만으로는 비가시적 요구사항을 복원할 수 없음 |
| 초기 조건 f(x₀) = y₀이 C를 결정함 | PRD, Architecture, Brownfield가 Carry-Forward를 결정함 |
| C를 생략하면 불완전한 해를 얻음 | Carry-Forward를 생략하면 불완전한 시스템을 얻음 |

이것이 Crystallize에서 Carry-Forward가 필수인 이유이다. Prototype 번역(부정적분)만으로는 시스템을 완전하게 만들 수 없다 — 초기/경계 조건(PRD, Architecture)에 의해 결정되는 적분 상수(Carry-Forward)가 추가되어야 한다.

### 왕복 검증 = 미적분학의 기본정리

미적분학의 기본정리는 미분과 적분이 역연산임을 보장한다:

```
∫(d/dx[f(x)])dx + C = f(x)
```

Delta-Driven Design의 왕복 검증도 같은 구조를 가진다:

```
translate(Prototype) → Specs → re-generate → Re-Prototype ≈ Prototype
```

미분(Delta 추출) 후 적분(시스템 복원)하면 원래 함수(Prototype)를 복원해야 한다. 복원되지 않으면 번역 중 정보가 손실된 것이다 — 적분 상수(Carry-Forward)가 누락되었거나 미분(번역 규칙)이 불완전했음을 의미한다.

### 사영으로서의 Prototype

완전한 시스템 S는 고차원 객체이다 — API, DB, 보안, 성능, 모니터링, UI, 비즈니스 로직 등. Prototype은 이 고차원 시스템을 특정 관점에서 저차원 뷰로 사영한 것이다:

```
π_customer(S) = 고객이 본 시스템 (UI, 상호작용, 흐름)
π_developer(S) = 개발자가 본 시스템 (API, DB, 상태 머신)
π_security(S) = 보안 팀이 본 시스템 (인증, 인가, 암호화)
π_ops(S) = 운영 팀이 본 시스템 (배포, 모니터링, 스케일링)
```

각 사영은 서로 다른 정보를 잃는다. 고객 사영(π_customer)은 보안 규칙을 보여주지 않고, 보안 사영(π_security)은 UI 레이아웃을 보여주지 않는다. Carry-Forward는 **특정 사영에서 축소된 차원으로 인해 손실된 정보**이다.

CT 스캔이 여러 각도의 사영을 결합하여 원래의 3D 구조를 재구성하듯, Sprint Kit은 여러 관점의 산출물(Prototype, PRD, Architecture, Brownfield)을 결합하여 완전한 시스템 명세를 재구성한다.

### 사영 위계: 제약 최적화

**모든 사영이 동등하지는 않다.** 이것은 Two Grammar 모델에 대한 중요한 보정이다.

고객(주 사용자) 사영은 **목적 함수** — 최적화 대상이다. 나머지 사영(개발, 보안, 운영)은 **제약 조건** — 충족되어야 하지만 최적화 대상은 아니다.

```
maximize: π_customer(S)     ← 고객 경험 (목적 함수)
subject to:
  π_security(S) ≥ threshold  ← 보안 요구사항 (제약)
  π_ops(S) ≥ threshold        ← 운영 요구사항 (제약)
  π_perf(S) ≥ threshold       ← 성능 요구사항 (제약)
```

이 구조는 Sprint Kit의 현재 설계에 정확히 매핑된다:

| 수학적 프레이밍 | Sprint Kit 대응물 |
|---|---|
| 목적 함수 (π_customer) | FR — 기능 요구사항 |
| 제약 조건 (π_security, π_ops, ...) | NFR — 비기능 요구사항 |
| 허용 영역 (모든 제약을 만족하는 해 집합) | 모든 NFR을 충족하면서 FR을 구현하는 설계 |
| 빈 허용 영역 (제약 충돌) | NFR 충돌 → 비즈니스 판단 필요 |
| 최적해 선택 | JP1/JP2에서의 판단 |

제약이 충돌할 때 — 예를 들어 최적의 고객 경험이 보안 요구사항을 위반할 때 — 허용 영역이 빈 집합이 된다. 어떤 제약을 완화할지는 기계적으로 결정할 수 없다. **이것이 FP1("인간의 판단만이 유일하게 지속되는 자산")이 필수인 이유이다** — 제약 충돌의 해결은 비즈니스 판단이며, JP가 그 판단의 순간이다.

### 시사점

이 수학적 프레이밍은 새로운 것을 추가하지 않는다 — **현재 파이프라인이 이미 이 구조를 체현하고 있음을 드러낸다**.

- Crystallize는 이미 미분(Delta 추출) + 상수 주입(Carry-Forward)을 수행하고 있었다
- 왕복 검증은 이미 미적분학의 기본정리를 적용하고 있었다
- Prototype은 이미 고객 사영이었다
- PRD의 FR/NFR 구분은 이미 목적 함수/제약 구조였다
- JP 판단은 이미 제약 충돌 해결이었다

나아가, **Two Grammar 모델은 위계적 N-사영 모델의 특수한 경우임이 드러난다**. User Grammar는 목적 함수 역할을 하는 고객 사영이고, Development Grammar는 나머지 제약 사영들을 하나로 묶은 것이다. 2개에서 N개 사영으로 확장해도 파이프라인의 구조는 바뀌지 않는다 — 각 추가 사영에 대해 Carry-Forward와 검증이 필요할 뿐이다.

---

## 6. Sprint Kit 파이프라인 재프레이밍

### 전체 흐름

```
[Phase 0: Establish Baseline]
  Brownfield scan → brownfield-context.md (L1~L4)
  = Development Grammar로 표현된 현재 시스템

[Phase 1: Find the Answer in User Grammar]
  Brief + Brownfield → PRD → Architecture → Specs → Deliverables → Prototype
  = User Grammar로 표현된 목표 상태
  JP1: "방향이 맞는가?" (인간이 탐색 방향을 검증)
  JP2: "이것이 답인가?" (인간이 User Grammar로 된 목표를 검증)

[Phase 2: Translate and Measure]
  translate(Approved Prototype) → Development Grammar로 된 Target
  + carry-forward(NFR, Security, Migration, Operations)
  = Complete Target Specs

  Complete Target Specs - Brownfield = Delta
  = 현재와 목표 사이의 정밀하게 정의된 격차

[Phase 3: Execute]
  Implement Delta → Brownfield가 Target으로 전환됨
  Validate: 구현된 시스템 ≈ Prototype 동작
```

### 각 단계의 실체

| 단계 | 기존 이해 | 재프레이밍된 이해 |
|---|---|---|
| Phase 0 (Smart Launcher) | 입력 수집 | **Development Grammar로 된 Brownfield 베이스라인 수립** |
| Brownfield Scan | 기존 시스템 정보 수집 | **현재 상태를 구조화된 Development Grammar로 파싱** |
| PRD 생성 | 요구사항 정의 | **User Grammar 답을 향한 해 공간 탐색** |
| Architecture | 기술적 결정 | **해 공간 제약 (Carry-Forward의 원천)** |
| Specs 4-file | 구현 계약 정의 | **Prototype 생성을 위한 중간 발판** |
| Deliverables | 구현 산출물 생성 | **User Grammar로 된 목표 상태 생성 (Prototype)** |
| JP1 | 요구사항 판단 | **Prototype에 투자하기 전 탐색 방향 검증** |
| JP2 | 경험 판단 | **User Grammar로 된 목표 상태 확인 ("이것이 답이다")** |
| Crystallize | Specs와 Prototype 조정 | **User Grammar → Development Grammar 번역 + Delta 추출** |
| Execute | Specs 구현 | **Delta 실현: 현재를 목표로 전환** |
| Validate | 구현 검증 | **검증: 현재 + Delta ≈ 목표** |

### 3-Pass 패턴 재프레이밍

| Pass | 기존 이름 | 재프레이밍된 이름 | 일어나는 일 |
|---|---|---|---|
| 1차 | Generative | **Answer Discovery** | User Grammar에서 올바른 답을 찾는다 (인간이 검증) |
| 2차 | Reconciliatory | **Translation & Delta Extraction** | User Grammar 답을 Dev Grammar로 변환하고 Brownfield와의 격차를 측정한다 |
| 3차 | Realization | **Delta Execution** | 정밀하게 정의된 격차를 구현한다 |

---

## 7. 왜 "구체 → 추상"이 강점이 되는가

기존 우려: "Crystallize는 Prototype에서 Specs로 추상화한다 — 그런데 AI는 추상화를 잘 못한다."

재프레이밍: **Crystallize는 추상화가 아니다. 알려진 두 Grammar 사이의 번역이다.**

| 연산 | AI가 하는 일 | AI 적합도 |
|---|---|---|
| 추상화 (Emergent Design) | 코드에서 새로운 패턴을 발견 | 낮음 — 미학적 판단, 전체 맥락 필요 |
| **번역 (Crystallize)** | **알려진 User Grammar 요소를 알려진 Dev 요소로 매핑 규칙을 사용하여 변환** | **높음 — 규칙 기반, 구조화, 검증 가능** |

번역이 기계적인 이유:
1. **두 Grammar 모두 알려져 있다** — User Grammar 요소와 Dev 요소가 열거되어 있다
2. **매핑 규칙이 존재한다** — 각 User Grammar 요소에 정의된 Dev 대응물이 있다
3. **입력이 한정적이다** — Prototype은 유한한 화면, 동작, 상태의 집합이다
4. **출력 형식이 고정되어 있다** — Specs 파일에 정의된 구조가 있다
5. **검증이 가능하다** — 왕복: Specs → Prototype 재생성 → 원본과 비교

---

## 8. 왕복 검증

번역 중 정보 손실이 없는지 검증하기 위해:

```
Prototype (원본, JP2 승인)
  → translate → Specs (Development Grammar)
    → re-generate → Re-Prototype (Specs만으로 재생성)
      → compare → Original Prototype ≈ Re-Prototype?
```

재생성된 Prototype이 원본과 구조적으로 일치하면 (같은 라우트, 같은 컴포넌트, 같은 API 호출, 같은 상태) 번역은 무손실이다. 차이가 있으면 번역 격차를 나타낸다.

이것이 Crystallize S7 (Cross-Artifact Consistency) 검사이며, 번역 검증 단계로 재프레이밍된 것이다. §5의 수학적 프레이밍에서 이것은 미적분학의 기본정리와 같은 구조이다.

---

## 9. Greenfield에 대한 시사점

Brownfield가 없을 때 (처음부터 새로 만드는 시스템):

```
Brownfield = ∅ (비어 있음)
Delta = translate(Prototype) + carry-forward - ∅
      = translate(Prototype) + carry-forward
      = Complete Specs (전체 시스템)
```

모델은 우아하게 퇴화한다. Greenfield에서 Delta는 전체 Specs이다. Brownfield에서 Delta는 변경 집합이다. 파이프라인은 동일하며, Brownfield 베이스라인만 달라진다.

---

## 10. 구현 시사점

이 재프레이밍은 Sprint Kit 구성요소에 대한 시사점을 가진다: Crystallize 파이프라인, design.md 형식, 중간물 vs 최종 산출물로서의 Specs, 인수인계, Validate 단계, 번역 규칙 완전성, Carry-Forward 메커니즘.

### 9.1 번역 파라미터로서의 Constraint Profile

각 번역 규칙(§3 테이블)에는 암묵적인 Brownfield 파라미터가 있다. Constraint Profile은 이를 명시적으로 만든다:

| 번역 규칙 | CP 파라미터 | 효과 |
|---|---|---|
| 상태 배지 → 엔티티 enum | CP.6 Enum/State Values | Prototype 표시 라벨 대신 기존 DB 저장 값 사용 |
| 사용자 동작 → API 엔드포인트 | CP.5 API Patterns | 기존 버전 관리, 경로 네이밍, 응답 엔벨로프 준수 |
| 표시된 데이터 → API 응답 | CP.1 Entity Constraints | nullable, 컬럼 타입, FK 관계 준수 |
| 에러 메시지 → 에러 코드 | CP.2 Naming Conventions | 기존 에러 코드 패턴 준수 |
| 자동 동작 → Scheduler | CP.3 Transaction Patterns | 기존 트랜잭션 매니저 사용 |
| 권한 → Auth 미들웨어 | CP.5 API Patterns (auth header) | 기존 인증 구조 준수 |

CP 없이 번역하면 이러한 파라미터를 추측해야 한다 — 구현 시 사후 수정이 필요한 Specs가 만들어진다. CP가 있으면 번역은 완전히 파라미터화된다: `translate(element, CP) → spec`.

**Soft Constraint 원칙**: CP 항목은 Soft Constraint이다 — 기존 코드에서 관찰된 패턴이지, 절대적인 규칙이 아니다. 유일한 Hard Constraint는 위반 시 런타임 오류를 일으키는 DB 강제 규칙이다 (NOT NULL, FK 무결성, 타입 캐스트 데이터 손실). 다른 모든 CP 패턴(네이밍 관례, API 패턴, enum 매핑)은 규칙으로 자동 적용되는 것이 아니라 제품 전문가의 결정으로 제시된다. `jdd-sprint-protocol.md`의 Validation Principles를 참고한다.

### 9.2 Crystallize 검증 레이어

S3 (Constraint-Aware Validation)은 원래 파이프라인의 공백을 해결한다: 번역 입력(Prototype)이 번역 시작 전에 Brownfield 제약에 대해 검증되지 않았다. 두 병렬 검증기가 서로 다른 이슈 클래스를 포착한다:

- **Constraint Validator** (Agent A): Prototype 가정과 기존 코드 규칙 사이의 충돌을 포착한다 (가설: CRITICAL의 30-40%). 발견 사항은 HARD_CONFLICT (DB 강제 → 자동 해결), DECISION_REQUIRED (Soft Constraint → 사용자 결정), 또는 PROTOTYPE_GAP (구조적 공백 → Carry-Forward 옵션)으로 분류된다
- **Structural Validator** (Agent B): Prototype 자체 내의 논리 완전성 이슈를 포착한다 (가설: CRITICAL의 40-50%). 누락된 FR에 대해 4단계 분류를 사용한다: INVISIBLE, ACCESS_GATED, OUT_OF_SCOPE (→ 자동 Carry-Forward), MISSING (→ DECISION_REQUIRED)

결합 포착률 가설: 번역 전 CRITICAL 이슈의 70-80%. 이 비율은 경험적으로 측정된 값이 아닌 설계 목표이다. 실제 포착률은 첫 실제 Sprint 실행(Phase 3-3) 후 보정될 것이다. 나머지 20-30%는 전체 팀 분석을 통해서만 발견 가능한 도메인 특화 또는 교차 관심사 이슈로 예상된다.

> 상세한 재평가 및 구현 계획: [`reviews/lld-gap-analysis-and-implementation-plan.md`](reviews/lld-gap-analysis-and-implementation-plan.md)

---

## 11. 설계 원칙 (Core Principles + Design Judgments)

### Core Principles

Sprint Kit의 모든 결정을 이끄는 기반 신념이다. Delta-Driven Design 재프레이밍을 반영하여 업데이트되었다.

#### FP1: 인간의 판단만이 유일하게 지속되는 자산이다 (RETAINED)

모든 AI 산출물은 일회용이고 재생성 가능하다. 인간의 입력은 생성 품질을 높이고, 인간의 판단은 방향을 설정한다. 이 원칙은 변하지 않았다 — JDD의 토대이다.

**Delta 프레임 강화**: Delta 프레임에서 인간의 판단은 목표 상태(JP2)와 탐색 방향(JP1)을 확인한다. 그 외의 모든 것 — 번역, Delta 추출, 실행 — 은 AI의 영역이다.

#### FP2: Prototype은 시스템의 실제 사용자에 맞춰 적응한다 (NEW)

Prototype은 시각적 UI 목업에 국한되지 않는다. Prototype의 형태는 시스템의 실제 사용자에 맞아야 한다:
- 인간 사용자 → 시각적 Prototype (React + MSW)
- 서비스 소비자 → API mock (OpenAPI + mock server)
- AI 소비자 → 구조화된 문서 (YAML/JSON)
- 데이터 파이프라인 → 샘플 데이터 + 변환 스크립트

**근거**: Prototype의 목적은 실제 사용자가 자신의 고유한 Grammar로 정확성을 검증하게 하는 것이다. 사용자가 다른 서버라면 React UI를 보여주는 것은 무의미하다 — 그들에게는 검증할 API 계약이 필요하다.

**시사점**: `deliverable-generator.md` Stage 10은 React + MSW에 하드코딩되지 않고 사용자 유형에 따라 파라미터화되어야 한다.

#### FP3: Spec 완전성이 비결정성을 제어하고, 우아한 퇴화가 나머지를 관리한다 (NEW)

AI 코드 생성은 비결정적이다: 같은 입력이 다른 출력을 만들 수 있다. 그러나 비결정성은 AI의 고정된 속성이 아니다 — Spec 완전성의 함수이다:

```
Non-determinism = f(1 / spec_completeness)
```

- Spec이 완전할수록 (시각적 가이드, UI 패턴, API 계약, 상태 머신) → 비결정성이 줄어든다
- Spec이 불완전할수록 (모호한 요구사항, 디자인 가이드 없음) → 비결정성이 늘어난다

**트레이드오프**: 과잉 명세는 비효율을 만든다 (생성 비용, 유지보수 부담, 컨텍스트 윈도우 소비). 과소 명세는 비결정성을 만든다 (일관성 없는 출력, 재작업).

**Sprint Kit의 위치**: 극단이 아닌 최적의 트레이드오프를 추구한다. 일부 비결정성은 불가피함을 수용하고 우아한 퇴화를 설계한다:

| Spec 영역 | Sprint Kit의 수준 | 수용된 비결정성 |
|---|---|---|
| API 계약 | 높음 (OpenAPI 3.1) | 거의 0 (Specmatic이 강제) |
| DB 스키마 | 높음 (DBML) | 거의 0 (마이그레이션 스크립트가 강제) |
| 상태 전이 | 중간 (감지 시 XState) | 낮음 (상태 머신이 제약) |
| UI 레이아웃/스타일 | 낮음 (시각적 가이드 없음) | **높음** (CSS, 컴포넌트 구조가 다양) |
| 변수 네이밍 | 낮음 (Entity Dictionary만) | 중간 (내부 네이밍이 다양) |

**우아한 퇴화 전략**: 비결정성이 높은 곳(UI 레이아웃, 내부 네이밍)에서는 변동을 수용하고 Contract Testing + BDD에 의존하여 기능적 정확성을 검증한다. 시각적 변동을 제거하기 위해 과잉 명세하지 않는다 — 비용 대비 가치가 없다.

#### FP4: Delta 정의가 Sprint Kit의 주요 목표이다 (NEW)

Sprint Kit의 목적은 "Specs 생성"이나 "Prototype 구축"이 아니다. **현재 시스템(Brownfield)과 목표 시스템(사용자 검증된 Prototype) 사이의 Delta를 정의하는 것**이며, 기계가 실행할 수 있는 형식으로 표현된다.

```
Delta = translate(Prototype) + carry-forward - Brownfield
```

Delta가 정밀하게 정의되면 구현은 기계적이 된다. 개발의 품질은 Delta 정의의 품질에 의해 결정된다.

#### FP5: 수정보다 재생성 (RETAINED, 재프레이밍)

산출물을 변경해야 할 때, 편집하는 대신 소스에서 재생성한다. AI 재생성 비용은 낮고, 수동 편집은 불일치를 도입한다.

**Delta 프레임 추가**: 이 원칙은 Delta 자체에도 적용된다. Delta가 변경되면 (예: JP2 피드백이 목표를 수정) 영향받는 Delta 항목을 패치하는 대신 재생성한다.

#### FP6: 번역은 규칙 기반이지 판단 기반이 아니다 (NEW)

Crystallize의 "구체 → 추상" 단계는 열린 추상화가 아니라 알려진 두 Grammar 사이의 번역이다. 번역은 매핑 테이블(User Grammar Element → Development Grammar Equivalent)을 따르며 명시적 규칙이 있다.

번역 규칙이 불충분한 곳(추론이 필요한 항목, 예: 자동 동작 텍스트 → Scheduler 정의)에서는 이 항목들이 무음 추측 대신 Carry-Forward 검증 대상으로 명시적으로 플래그된다.

**다중 입력 구조**: 번역 입력은 Prototype 단독이 아니다. 완전한 번역은 세 가지 입력을 결합한다:
- **Prototype**: User Grammar로 표현된 목표 상태 (JP2 승인)
- **Carry-Forward 소스**: 비가시적 요구사항 — NFR, 보안, 마이그레이션 (PRD, Architecture, Brownfield)
- **Brownfield 베이스라인**: 현재 시스템 상태 (brownfield-context.md L1-L4)

세 입력 중 하나라도 빠지면 번역은 불완전하다. Prototype 없이는 번역 대상이 없고, Carry-Forward 없이는 적분 상수가 빠지며(§5), Brownfield 없이는 Delta를 계산할 수 없다.

> 기반 관점과 가설 체계: [`translation-ontology.md`](translation-ontology.md) §4.2

### Design Judgments

Sprint Kit 구현을 위한 구체적 결정들이다. 도구가 발전함에 따라 변경될 수 있다.

#### DJ1: 새 파일 생성 대신 design.md 확장 (RETAINED)

LLD 섹션은 별도의 `detailed-design.md`가 아닌 design.md에 들어간다. Worker는 이미 design.md를 주요 참조로 읽고 있다.

#### DJ2: 필수 섹션 대신 조건부 활성화 (RETAINED)

모든 LLD 섹션과 번역 출력은 always-detect / conditionally-generate를 사용한다. 단순한 프로젝트는 오버헤드가 0이다.

#### DJ3: 별도 패스로서의 Devil's Advocate (RETAINED, 재프레이밍)

적대적 검증은 생성에 내장되지 않고 전용 단계("Delta가 완전한가?")이다. Delta 프레임에서는 산출물 품질이 아닌 Delta 완전성을 검증한다.

#### DJ4: PRD 상태 전이 구조는 비즈니스 규칙이다 (RETAINED)

PRD FR의 States/Transitions/Invariants는 User Grammar 요소(비즈니스 규칙)이지, Development Grammar(구현)가 아니다. 이것은 번역의 입력이지 출력이 아니다.

#### DJ5: Stage 7 입력 소스 수정 (RETAINED)

Stage 7 (XState) 입력을 "Architecture 상태 다이어그램"에서 "design.md State Transitions 섹션"으로 변경한다. 이것은 파이프라인 배선 버그를 수정한다.

#### DJ6: 필수 NFR로서의 Observability (RETAINED)

모든 배포된 서비스는 모니터링이 필요하다. Observability NFR은 프로젝트 유형과 무관하게 항상 필수이다.

#### DJ7: Carry-Forward 항목은 명시적 생명주기 관리가 필요하다 (NEW)

Development Grammar에 존재하지만 User Grammar 대응물이 없는 항목(NFR, 보안, 마이그레이션, 모니터링)은 반드시:
1. S3에서 **분류**되어야 한다 — Agent B의 4단계 분류(INVISIBLE/ACCESS_GATED/OUT_OF_SCOPE/MISSING)가 처리 방식을 결정한다
2. S3.5에서 **등록**되어야 한다 — carry-forward-registry.md가 생명주기 상태를 할당한다 (INJECT/CONFLICT/DROP/DEFER)
3. S4에서 **주입**되어야 한다 — Registry의 INJECT 항목만 조정된 산출물에 포함된다 (임시 Carry-Forward 불가). Registry가 없을 때 (레거시 또는 Mode B): 임시 Carry-Forward를 폴백으로 사용한다
4. S7에서 **검증**되어야 한다 — Registry 준수 검사, Delta 상대적 구조 시그니처, 커버리지 준수
5. Delta에서 **분류**되어야 한다 (항목별 positive/modification/zero)

#### DJ8: 표준 Crystallize 출력으로서의 Delta Manifest (NEW)

Crystallize는 모든 변경을 positive(새로운), modification(변경된), negative(제거된), 또는 zero(변경 없음)로 분류하는 Delta Manifest를 생성해야 한다. 이 Manifest는 Delta 유형별 테스트, 회귀 범위 산정, 인수인계의 전제 조건이다.

#### DJ9: JP2는 User Grammar로 Delta를 보여준다 (NEW)

JP2 Visual Summary에는 사용자 관점에서 무엇이 변하는지를 보여주는 "Before/After" 섹션이 포함되어야 한다. 사용자는 "Prototype이 맞다"뿐만 아니라 "현재 시스템에서의 이 변경이 맞다"를 확인한다.

#### DJ10: 비결정성 트레이드오프는 숨겨지지 않고 명시된다 (NEW)

Sprint Kit이 비결정성을 수용하는 곳(예: UI 레이아웃 변동)에서 이것은 구체적인 우아한 퇴화 전략을 가진 문서화된 설계 선택이다 — 인정되지 않은 격차가 아니다. 각 영역의 Spec 완전성 수준은 명시적으로 기술된다 (FP3 테이블 참조).

---

## 12. 변하지 않는 것

| 요소 | 유지 이유 |
|---|---|
| **FP1: 인간의 판단만이 유일하게 지속되는 자산** | JDD의 토대. Delta 재프레이밍에 의해 변하지 않음 |
| **JP1 / JP2 구조** | JP1은 탐색 방향을 검증하고, JP2는 답을 검증한다. 둘 다 User Grammar를 사용한다. 새로운 JP가 필요하지 않다 |
| **Brownfield Scanner** | 베이스라인을 수립한다. 이제 구조적 레이어(L1-L4)와 Constraint Profile(CP.1-CP.7) 모두를 수집한다 — "두 가지 정밀도 수준의 Development Grammar로 된 현재 상태" |
| **3-Pass 패턴** | 여전히 Answer Discovery → Translation & Delta Extraction → Delta Execution |
| **Contract-First (Specmatic)** | 실행 중 비결정성을 제어한다 (FP3 전략) |
| **BDD Scenarios** | Development Grammar로 번역된 목표의 일부 |
| **Brief → Prototype 파이프라인** | 각 단계가 Answer Discovery를 수행한다. 구조 변경 불필요 (Party Mode 확인됨) |
| **파이프라인 실행 흐름** | Crystallize는 JP2 이후 필수이다. /parallel은 항상 reconciled/를 받는다. Delta Manifest (S8)는 항상 생성된다 |

---

## 13. 구현 로드맵

> 파일별 변경, 단계적 롤아웃, 검증 전략을 포함한 상세 구현 계획: [`reviews/lld-gap-analysis-and-implementation-plan.md`](reviews/lld-gap-analysis-and-implementation-plan.md)

**요약**: Option B (점진적 통합) 선택됨. Sprint Kit의 파이프라인은 이미 올바른 연산을 수행하고 있다 — 이 재프레이밍은 개념적 정렬을 제공한다.

| Phase | 범위 | 주요 변경 |
|---|---|---|
| 0 | 문서화 | 용어, JDD 참조, Blueprint 참조 |
| 1 | LLD 토대 | design.md 조건부 섹션, Scope Gate 검사, PRD 형식 |
| 2 | Delta 통합 | Delta Manifest, JP2 Before/After, Carry-Forward Registry |
| 3 | 검증 | Delta 완전성 검사, Zero delta 회귀, Carry-Forward 비율 측정 |

---

## Appendix A: 역사적 맥락

이 재프레이밍은 "PRD 형식을 바꿔야 하는가?"로 시작하여 점진적으로 깊어진 5라운드 Party Mode 분석에서 나왔다:

| 라운드 | 질문 | 발견 |
|---|---|---|
| 1 | PRD 형식을 바꿔야 하는가? | PRD가 문제가 아니다; 구현 수준 세부사항은 다른 곳에 속한다 |
| 2 | 새 문서가 필요한가? | 아니다 — 정보는 존재하지만 파일들에 분산되어 있다 |
| 3 | 어떤 구체적 변경이 격차를 해소하는가? | 6개 이상의 파일에 걸쳐 10개 격차에 형식 확장이 필요하다 |
| 4 | 구조적인가 엣지 케이스인가? | 올바른 경계 내의 엣지 케이스; design.md에 LLD가 필요하다 |
| 5 | 어떤 방법론 원칙이 적용되는가? | Sprint Kit은 고유한 4범주 하이브리드; 3-Pass 패턴은 새롭다 |
| **종합** | **Sprint Kit의 실제 목적은?** | **Brownfield와 Prototype 검증된 Target 사이의 Delta를 정의하는 것** |

방법론 조사(라운드 5-6)에서 Sprint Kit의 Crystallize 패스(구체 → 추상)가 방법론 지형에서 독특함이 드러났다. "AI는 추상화를 잘 못한다"는 우려는 Crystallize가 추상화가 아니라 **알려진 두 Grammar 사이의 번역**이며 AI가 잘 처리하는 규칙 기반 연산임을 인식하여 해소되었다.

| 라운드 7 | Delta 재프레이밍의 Party Mode 재평가 (6명의 에이전트) | 파이프라인은 이미 올바른 연산을 수행; 재프레이밍은 개념적이다. JP2에 Before/After Delta가 필요하다. Delta Manifest는 핵심 전제 조건이다. Carry-Forward에 생명주기 관리가 필요하다 |
| 라운드 8 | 설계 원칙 확정 | FP1-FP6 (Core Principles) + DJ1-DJ10 (Design Judgments). 핵심 추가: FP2 (Prototype은 사용자 유형에 적응), FP3 (Spec 완전성 ↔ 비결정성 트레이드오프), FP4 (Delta가 주요 목표). Option B 선택 |
| 라운드 9 | 수학적 프레이밍 | 미적분학/사영/제약 최적화 유비. Carry-Forward = 적분 상수, Prototype = 사영, 구현 = 제약 최적화. Two Grammar 모델이 위계적 N-사영의 특수한 경우임을 확인 |

---

## Appendix B: 방법론 조사

> **Date**: 2026-02-21
> **Scope**: 학술 논문, 산업 프레임워크, 신흥 AI 지원 엔지니어링 실무(2024-2026)에 걸쳐 18개 방법론을 조사
> **Finding**: 7가지 핵심 특성을 모두 결합한 기존 방법론은 없다. 발견된 최대 중첩은 3/7이다.

### B.1 Delta-Driven Design의 7가지 핵심 특성

| # | 특성 | 정의 |
|---|-------|------------|
| 1 | Delta가 주요 산출물 | 현재와 목표 상태 사이의 변경 집합이 전체 Spec이 아닌 주요 산출물이다 |
| 2 | Prototype 우선 | 인간이 User Grammar(Prototype)로 목표를 검증한 후, AI가 Development Specs로 번역한다 |
| 3 | Two Grammars | User Grammar와 Development Grammar의 형식적 구분 |
| 4 | 추상화가 아닌 번역 | Prototype을 Specs로 변환하는 것은 알려진 Grammar 사이의 규칙 기반 번역이다 |
| 5 | 3-Pass Pattern | Answer Discovery → Translation & Delta Extraction → Delta Execution |
| 6 | Brownfield 인식 | 기존 시스템 베이스라인이 Delta 계산에 명시적으로 반영된다 |
| 7 | Carry-Forward | 비가시적 요구사항(NFR, 보안, 마이그레이션)이 번역된 출력에 추가된다 |

### B.2 특성 커버리지 매트릭스

| 방법론 | Delta | Proto-First | Two Grammars | Translation | 3-Pass | Brownfield | Carry-Fwd | Score |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Kubernetes / IaC Reconciliation** | YES | - | - | - | YES | YES | - | 3/7 |
| **OMG Model-Driven Architecture** | - | - | YES | YES | PARTIAL | - | - | 2.5/7 |
| **OpenSpec (Fission-AI, 2025)** | YES | - | - | PARTIAL | - | YES | - | 2.5/7 |
| **Design-to-Code Pipelines** | - | YES | YES | PARTIAL | - | - | - | 2.5/7 |
| **TOGAF Gap Analysis** | PARTIAL | - | - | - | - | YES | PARTIAL | 2/7 |
| **Spec-Driven Development (2025)** | PARTIAL | - | PARTIAL | PARTIAL | - | PARTIAL | - | 2/7 |
| **Strangler Fig Pattern** | PARTIAL | - | - | - | - | YES | PARTIAL | 2/7 |
| **Round-Trip Engineering** | - | - | YES | YES | - | - | - | 2/7 |
| **Spec-Grounded Modernization** | PARTIAL | - | - | - | - | YES | PARTIAL | 2/7 |
| **RM2PT (ICSE 2019)** | - | INVERTED | YES | YES | - | - | - | 2/7 |
| **SmartDelta (ITEA4, 2024)** | PARTIAL | - | - | - | - | YES | - | 1.5/7 |
| **Delta-Oriented Programming** | PARTIAL | - | - | - | - | YES | - | 1.5/7 |
| **Dual-Track Agile** | - | YES | PARTIAL | - | - | - | - | 1.5/7 |
| **BDD / Specification by Example** | - | - | PARTIAL | YES | - | - | - | 1.5/7 |
| **Design-Driven Development** | - | YES | PARTIAL | - | - | - | - | 1.5/7 |
| **Lean UX / Build-Measure-Learn** | - | YES | - | - | - | - | - | 1/7 |
| **Context Engineering (2025)** | - | - | - | PARTIAL | - | - | - | 0.5/7 |
| **IEEE 42010 Viewpoints** | - | - | CONCEPTUAL | - | - | - | - | 0.5/7 |

### B.3 가장 유사한 5개 방법론

#### 1. Kubernetes / IaC Reconciliation Pattern (3/7)

Kubernetes, Terraform, Pulumi, ArgoCD가 사용하는 Reconciliation Loop(조정 루프)이다. 핵심 공식: `Delta = Desired State - Actual State`. Terraform의 `plan`은 Delta를 계산하고 표시하며, `apply`는 이를 실행한다.

**공유 특성**: Delta가 주요 산출물, 3-Pass (관찰 → 차이 계산 → 실행), Brownfield 인식 (실제 상태를 명시적으로 관찰).

**미보유 특성**: Prototype 우선 (목적 상태가 YAML/HCL 같은 실행 Grammar로 직접 작성되며 Prototype으로 검증되지 않음), Two Grammars (단일 선언적 언어), Translation (목적 상태가 이미 실행 Grammar에 있음), Carry-Forward (비가시적 요구사항 없음).

**관계**: 가장 강한 구조적 유비이다. Delta-Driven Design은 Kubernetes Reconciliation 패턴을 소프트웨어 명세 영역에 적용한다. `Delta = Desired - Actual` 공식은 `Delta = translate(Prototype) + carry-forward - Brownfield`와 구조적으로 동일하다.

#### 2. OMG Model-Driven Architecture (MDA) (2.5/7)

세 가지 추상화 수준을 가진 OMG의 모델 기반 개발 표준이다: CIM (Computation-Independent Model), PIM (Platform-Independent Model), PSM (Platform-Specific Model). 이들 사이의 규칙 기반 변환에 QVT (Query/View/Transformation)를 사용한다.

**공유 특성**: Two Grammars (CIM/PIM/PSM이 별개의 형식적 표현), Translation (QVT가 모델 수준 사이의 규칙 기반 변환 언어).

**미보유 특성**: Delta (기존 시스템에 대한 Delta 계산 없음), Prototype 우선 (모델이 출발점), Brownfield 인식 (순방향 엔지니어링을 가정), Carry-Forward.

**관계**: "규칙 기반 Grammar 변환" 개념의 학술적 선행자이다. CIM-to-PIM 변환은 "User Grammar에서 Development Grammar로"와 구조적으로 유사하다. MDA는 형식적 모델링 오버헤드로 인해 광범위한 채택에 이르지 못했다.

#### 3. OpenSpec (Fission-AI, 2025) (2.5/7)

AI 코딩 어시스턴트를 위한 오픈소스 Spec 기반 개발 프레임워크이다. 명시적으로 "Brownfield 우선"이다. Delta Spec에 베이스라인 Spec에 대한 ADDED/MODIFIED/REMOVED 마커를 사용한다.

**공유 특성**: Delta가 주요 산출물 (변경 마커가 있는 Delta Spec), Brownfield 인식 (핵심 설계: "대부분의 작업은 Greenfield(0→1)가 아닌 기존 코드베이스(1→n)에서 발생한다").

**미보유 특성**: Prototype 우선 (Spec이 직접 작성되며 Prototype 검증 없음), Two Grammars (단일 Markdown Spec 형식), 3-Pass Pattern (선형 Propose→Apply→Archive 흐름), Carry-Forward.

**관계**: Delta-as-artifact 공간에서 가장 가까운 병렬 개발이며 2025년에 독립적으로 등장했다. 구조적으로 유사한 ADDED/MODIFIED/REMOVED 분류가 Delta-Driven Design의 positive/modification/negative Delta 유형에 매핑된다.

#### 4. Design-to-Code Pipelines (Figma MCP, Unity Spec, Builder.io) (2.5/7)

디자인 산출물(Figma 파일, 디자인 토큰)을 구조화된 메타데이터와 AI를 사용하여 프로덕션 코드로 번역하는 도구들이다.

**공유 특성**: Prototype 우선 (시각적 디자인이 출발점), Two Grammars (디자인 Grammar: Figma 레이어, 변수, auto-layout vs 코드 Grammar: React 컴포넌트, CSS).

**미보유 특성**: Delta (Delta가 아닌 전체 컴포넌트를 생성), Brownfield 인식 (기존 코드베이스 고려 없음), 3-Pass Pattern (단일 패스 디자인→코드), Carry-Forward.

**관계**: User Grammar → Development Grammar 번역이 기술적으로 실현 가능하다는 가장 직접적인 검증이다. 핵심 전제를 보여주지만 더 좁은 범위이다 (시스템 수준 Delta가 아닌 컴포넌트 생성).

#### 5. Dual-Track Agile (Cagan & Patton, 2012) (1.5/7)

병렬적인 Discovery(UX/제품)와 Delivery(엔지니어링) 트랙이다. Discovery는 Prototype을 통해 무엇을 만들지 검증하고, Delivery는 이를 구현한다.

**공유 특성**: Prototype 우선 ("Prototype이 Delivery의 Spec 역할을 한다").

**미보유 특성**: Delta, Translation (Discovery에서 Delivery로의 인수인계가 비공식적이고 인간 매개), Brownfield 인식, Carry-Forward.

**관계**: Prototype 우선 검증의 실무적 선행자이다. UX 검증이 개발 명세에 선행해야 한다는 원칙을 검증하지만, 번역 단계에 대한 공식적 메커니즘은 제공하지 않는다.

### B.4 특성별 지적 계보

| 특성 | 선행자 |
|-------|-----------|
| **Delta가 주요 산출물** | Kubernetes reconciliation (2014), TOGAF Gap Analysis (1995), OpenSpec (2025), Delta-Oriented Programming (2010) |
| **Prototype 우선** | Dual-Track Agile (2012), Design-Driven Development (2010s), Lean UX (2013) |
| **Two Grammars** | MDA CIM/PIM/PSM (2001), IEEE 42010 Viewpoints (2000), Design-to-Code pipelines (2024) |
| **추상화가 아닌 번역** | MDA QVT (2001), BDD Gherkin→step definitions (2006), Round-Trip Engineering (1990s) |
| **Brownfield 인식** | OpenSpec (2025), SmartDelta (2024), Strangler Fig (2004), TOGAF (1995) |
| **3-Pass Pattern** | Kubernetes observe→diff→execute (2014) |
| **Carry-Forward** | **선행자 없음** — 가장 독특한 특성 |

### B.5 핵심 발견

**1. 특성 조합이 새롭다.** Delta를 주요 산출물로, Prototype 우선 검증, Two Grammar 형식화, 규칙 기반 번역, Brownfield 인식, Carry-Forward를 동시에 다루는 기존 방법론은 없다.

**2. 개별 특성은 강한 선행이 있다.** 각 특성에 확립된 지적 계보가 있다 (B.4 참조). Delta-Driven Design의 기여는 이러한 특성들을 통합 파이프라인으로 결합한 것이다.

**3. "Carry-Forward" 특성이 가장 독특하다.** User Grammar 대응물이 없는 비가시적 요구사항(NFR, 보안, 마이그레이션 제약)을 번역된 명세에 이월하는 문제를 명시적으로 형식화한 방법론은 없다. 기존 실무에서는 이것이 임시적으로 처리된다.

**4. 2025년의 Spec 기반 개발 흐름이 부분적 중첩을 향해 수렴하고 있다.** OpenSpec (Delta Spec + Brownfield 우선), Tessl (Spec-as-source), Spec-Grounded Modernization (AI를 위한 Brownfield 컨텍스트)이 Delta-Driven Design과 부분적으로 겹치는 방향으로 움직이고 있다. 어느 것도 Two Grammar 구분이나 Prototype 우선 검증을 형식화하지 않았다.

**5. Delta-Driven Design은 종합으로 설명할 수 있다.** Kubernetes의 Reconciliation 패턴을 소프트웨어 명세 영역에 적용하되, MDA의 변환 원칙을 Dual-Track Agile의 Discovery Grammar와 Delivery Grammar 사이에 사용하고, OpenSpec의 Delta-as-artifact 접근법에 비가시적 요구사항을 위한 새로운 Carry-Forward 메커니즘을 더한 것이다.

**6. RM2PT (ICSE 2019)는 역방향을 증명한다.** RM2PT는 형식적 요구사항으로부터 Prototype을 자동 생성한다 (Specs → Prototype). Delta-Driven Design은 반대 방향으로 동작한다 (Prototype → Specs). 둘 다 형식적 요구사항과 실행 가능한 산출물 사이의 자동 번역이 기술적으로 실현 가능함을 검증한다 — 방향이 뒤집혀 있을 뿐이다.
