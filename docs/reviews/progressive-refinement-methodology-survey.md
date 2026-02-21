# Progressive Abstraction Refinement: 방법론 서베이

> **문서 유형**: 리서치 서베이 — 방법론 분류 체계 + 다중 패스 정련 분석
> **날짜**: 2026-02-20
> **트리거**: LLD 갭 분석에서 방법론들이 추상화 하강을 어떻게 처리하는지에 대한 이해가 필요했습니다
> **관련 문서**: `lld-gap-analysis-and-implementation-plan.md`

---

## 1. 분류 체계: 11가지 정련 접근법 카테고리

모든 소프트웨어 시스템은 "아이디어"에서 "코드"로 전환됩니다. 핵심 질문은 각 단계에서 추상화가 어떻게 하강하는지, 그리고 정련 과정에서 정보 손실을 방지하는 어떤 제어 장치가 있는지입니다.

### 카테고리 개요

| # | 카테고리 | 핵심 원칙 | 정련 방향 | AI 호환성 |
|---|---|---|---|---|
| 1 | Top-Down Decomposition | 전체를 먼저 정의하고 부분으로 분해 | 하향 | Low |
| 2 | Iterative/Incremental | 모든 수준을 동시에 조금씩 정련 | 나선형 | Medium |
| 3 | Emergent Design | 코드를 작성하고 리팩토링을 통해 설계를 발견 | **상향** | Low |
| 4 | Domain-Driven | 도메인 모델이 핵심; 기술은 도메인을 위해 봉사 | 핵심 → 외부 | Medium |
| 5 | Contract-First | 인터페이스를 먼저 합의; 독립적으로 병렬 구현 | 중간 → 외부 | **High** |
| 6 | Behavior-First | 기대 동작을 먼저 정의; 이를 충족하도록 구현 | 외부 → 내부 | **High** |
| 7 | Event-First | 비즈니스는 이벤트의 시퀀스; 이벤트에서 구조를 도출 | 타임라인 → 구조 | Medium |
| 8 | Prototype-First | 사용자는 추상적 질문이 아닌 구체적 산출물에 정확히 반응 | 외부 → 내부 | **High** |
| 9 | Spec-Driven | 명세가 source of truth; 코드는 파생 산출물 | 하향 | **Very High** |
| 10 | Constraint-Driven | 제약/적합도 함수를 정의; 설계가 이를 충족해야 함 | 경계 → 내부 | Medium |
| 11 | AI-Native | AI가 구현하고, 사람이 판단 | 하향 + Bounce | **Highest** |

---

### 1.1 Top-Down Decomposition

**방법론**: Waterfall (Royce 1970), V-Model (German IABG 1990s), IEEE 12207, MIL-STD-498, DO-178C

**등장 배경**: 1970-80년대 대규모 정부/방위 IT 프로젝트에서 추적 가능한 책임성을 갖춘 예측 가능한 프로세스가 필요했습니다. 후기 오류 발견의 비용이 치명적이었습니다 (예: 항공기 소프트웨어).

**철학**: "모든 것을 사전에 올바르게 정의하면, 구현은 기계적 번역이다." 설계가 시작되기 전에 요구사항을 완전히 파악할 수 있다고 가정합니다.

**추상화 하강**:
```
Requirements (SRS) → System Design (SDD) → Detailed Design (LLD) → Code
```

**제어 장치**: Traceability Matrix (요구사항 ↔ 설계 ↔ 코드 ↔ 테스트), Phase Gate Reviews

**적합한 경우**: 안정적인 요구사항, 규제 준수 필수 (항공, 의료, 원자력). 후기 변경 비용이 치명적인 경우.

**부적합한 경우**: 불확실한 요구사항, 사용자 피드백이 필요한 경우, 탐색적 개발.

---

### 1.2 Iterative/Incremental Refinement

**방법론**: RUP (IBM), Spiral Model (Boehm 1986), SAFe, DSDM

**등장 배경**: Waterfall의 "끝에 가서야 문제를 발견하는" 방식이 비용 폭증을 초래했습니다. Boehm의 Spiral Model (1986)이 리스크 기반 반복을 도입했고, RUP가 이를 4단계(Inception → Elaboration → Construction → Transition)로 형식화했습니다.

**철학**: "모든 것을 사전에 알 수는 없지만, 가장 높은 리스크를 먼저 식별하고 해결할 수 있다." 문서나 코드가 아닌 리스크가 프로세스를 주도합니다.

**추상화 하강**: 각 반복이 모든 추상화 수준을 동시에 정련합니다:
```
Iteration 1: 비전 → 대략적 아키텍처 → 핵심 프로토타입 → 주요 리스크 해결
Iteration 2: 정련된 요구사항 → 아키텍처 베이스라인 → 더 많은 기능 → 더 많은 리스크 해결
...
Iteration N: 안정된 요구사항 → 최종 아키텍처 → 완전한 시스템 → 배포
```

**제어 장치**: Milestone Reviews (LCO, LCA, IOC), 리스크 기반 반복 계획, 각 반복 종료 시 데모.

**적합한 경우**: 대규모 조직, 고위험 프로젝트, 점진적으로 명확해지는 요구사항.

**부적합한 경우**: 의례적 오버헤드가 가치를 초과하는 소규모 팀. 빠른 시장 출시가 필요한 경우.

---

### 1.3 Emergent Design

**방법론**: XP (Beck 1999), Shape Up (Basecamp 2019), Mob Programming, Vibe Coding (2024~)

**등장 배경**: 1990년대 후반, 무거운 프로세스(RUP, Waterfall)가 웹 애플리케이션을 만드는 소규모 팀에서 실패하고 있었습니다. Kent Beck은 테스트의 안내를 받으며 지속적인 리팩토링을 통해 간단한 코드에서 설계가 "출현"해야 한다고 제안했습니다.

**철학**: "모든 테스트를 통과하는 가장 단순한 설계가 최선의 설계이다. 더 많은 설계는 리팩토링을 통해 필요할 때 출현할 것이다." 숙련된 개발자가 코드를 통해 좋은 설계를 발견할 수 있다고 가정합니다.

**추상화 하강**: **역방향** — 코드 수준에서 시작하여 설계로 상승:
```
User Story → 최소한의 테스트 → 최소한의 코드 → 리팩토링 → 패턴 발견 → 아키텍처 출현
```

**제어 장치**: TDD (동작 명세로서의 테스트), Continuous Integration, Pair/Mob Programming.

**적합한 경우**: 소규모 숙련 팀. 탐색이 필요한 불확실한 요구사항. 빠른 피드백 환경.

**부적합한 경우**: 대규모 분산 팀. 규제 도메인. **AI 기반 개발** (AI는 리팩토링을 통한 설계 발견에 약함 — AI 호환성 섹션 참조).

---

### 1.4 Domain-Driven Refinement

**방법론**: DDD Strategic Design (Evans 2003), DDD Tactical Design, Context Mapping

**등장 배경**: Eric Evans는 복잡한 비즈니스 소프트웨어가 기술적 문제가 아닌 도메인에 대한 오해로 실패한다는 것을 관찰했습니다. 비즈니스 도메인과 일치하지 않는 소프트웨어 모델은 시간이 지남에 따라 복리로 증가하는 번역 비용을 만들어냅니다.

**철학**: "도메인 모델이 소프트웨어의 핵심이다. 모든 기술적 결정은 도메인을 위해 봉사한다. 개발자와 도메인 전문가는 같은 언어를 공유해야 한다 (Ubiquitous Language)."

**추상화 하강**:
```
Strategic Design (Bounded Contexts, Core/Supporting/Generic 분류)
  → Tactical Design (Aggregates, Entities, Value Objects, Domain Events)
    → Application Layer (Application Services, Command/Query Handlers)
      → Infrastructure Layer (Repositories, ORM, Message Brokers)
```

**제어 장치**: Ubiquitous Language (번역 오류 방지), Bounded Context 경계 (컨텍스트 간 명시적 계약), Continuous Model Refinement.

**적합한 경우**: 복잡한 비즈니스 도메인. 깊은 도메인 이해가 필요한 장기 운영 시스템. 협업 가능한 도메인 전문가 존재.

**부적합한 경우**: 단순한 CRUD 애플리케이션. 도메인 전문가에 대한 접근 불가. 빠른 프로토타이핑 우선.

---

### 1.5 Contract-First Refinement

**방법론**: API-First Design (OpenAPI/Swagger), Schema-First (GraphQL SDL, DBML), Design by Contract (Meyer/Eiffel), Consumer-Driven Contracts (Pact), Specmatic

**등장 배경**: 시스템이 분산화됨에 따라 (SOA, 마이크로서비스) 팀들은 독립적으로 작업하면서도 컴포넌트가 올바르게 통합되도록 보장해야 했습니다. 구현 전에 인터페이스를 정의하면 병렬적이고 독립적인 개발이 가능해집니다.

**철학**: "계약(인터페이스)에 합의하면, 양쪽이 독립적으로 구현할 수 있다. 올바르어야 하는 것은 계약뿐이며, 구현 세부사항은 비공개이다."

**추상화 하강**:
```
Domain Analysis → Contract Definition (OpenAPI, GraphQL SDL, DBML)
  → Mock Generation (MSW, Prism) → Independent Implementation → Contract Verification
```

**제어 장치**: Contract Testing (Specmatic, Pact — 구현이 계약과 일치하는지 자동 검증), Schema Validation (런타임 데이터가 스키마와 일치), Precondition/Postcondition/Invariant (DbC).

**적합한 경우**: 프론트엔드/백엔드 분리 개발. 마이크로서비스. 다중 팀 병렬 개발. 외부 API 공개.

**부적합한 경우**: 1인 개발자 프로젝트. 계약이 알려지지 않은 초기 탐색 단계.

**AI 호환성 참고**: Contract-First는 **가장 보편적으로 결합 가능한** 카테고리입니다 — 거의 모든 다른 접근법과 잘 결합됩니다. AI에 특히 중요한 것은 계약이 AI의 비결정성을 제어하는 "검증 가능한 정답지" 역할을 한다는 점입니다.

---

### 1.6 Behavior-First Refinement

**방법론**: BDD (Dan North 2006), TDD (Kent Beck), ATDD, Specification by Example (Gojko Adzic)

**등장 배경**: 전통적인 요구사항 문서는 모호하여 "스펙을 충족하지만" 의도는 충족하지 못하는 구현을 초래했습니다. Dan North는 비즈니스와 기술 담당자 모두가 이해할 수 있는 구체적인 예제(Given/When/Then)로 동작을 기술하는 방법을 제안했습니다.

**철학**: "구체적인 예제로 시스템이 어떻게 동작해야 하는지 정의하면, 구현은 그 예제를 통과시키는 과정이 된다. 예제가 곧 명세이다."

**추상화 하강**:
```
Feature Definition → Concrete Scenarios (Gherkin Given/When/Then)
  → Step Definitions (테스트 자동화 코드) → Implementation → Refactoring
```

**제어 장치**: Living Documentation (Gherkin 시나리오가 실행 가능한 명세), Red-Green-Refactor 사이클, Three Amigos 세션 (비즈니스 + 개발 + QA가 함께 시나리오 작성), Example Mapping.

**적합한 경우**: 복잡한 비즈니스 로직. 비즈니스와 개발 간의 커뮤니케이션이 중요한 경우. 회귀 안전성이 필요한 장기 운영 시스템.

**부적합한 경우**: UI 중심의 프로토타이핑. 요구사항이 알려지지 않은 매우 초기 탐색 단계.

---

### 1.7 Event-First Refinement

**방법론**: Event Storming (Brandolini 2013~), Event Modeling (Dymitruk), CQRS, Event Sourcing

**등장 배경**: 전통적인 엔티티 중심 모델링(ERD)은 시간적 비즈니스 로직을 — "무엇이, 어떤 순서로, 왜 발생하는가" — 포착하지 못합니다. Alberto Brandolini는 시스템을 비즈니스 이벤트의 시퀀스로 모델링할 것을 제안했습니다.

**철학**: "비즈니스는 이벤트(발생하는 것들)의 시퀀스이다. 이벤트를 먼저 식별함으로써 커맨드(원인), 리드 모델(결과), 정책(자동 규칙)을 발견한다. 시스템 구조는 이벤트 흐름에서 출현한다."

**추상화 하강**:
```
Big Picture (Domain Event Timeline) → Process Modeling (Commands + Events + Policies + Read Models)
  → Design Level (Aggregates, Bounded Contexts) → Implementation (Event Handlers, Projections)
```

**제어 장치**: 이벤트 일관성 (모든 상태 변경이 이벤트로 추적 가능), Aggregate 불변성, 이벤트 스키마 진화 (하위 호환성).

**적합한 경우**: 시간적 로직이 있는 복잡한 비즈니스 프로세스. 감사 추적 요구사항. 마이크로서비스 도메인 분해.

**부적합한 경우**: 단순한 CRUD. 이벤트 개념이 부자연스러운 도메인. 즉각적 일관성이 필요한 경우.

---

### 1.8 Prototype-First Refinement

**방법론**: Design Sprint (Google Ventures 2010), Lean UX (Gothelf), Lean Startup Build-Measure-Learn (Ries 2011), Rapid Prototyping

**등장 배경**: Google의 제품 팀은 몇 주간의 논쟁이 프로토타입을 만들고 테스트함으로써 며칠 만에 해결될 수 있다는 것을 발견했습니다. IDEO의 디자인 사고 + Basecamp의 "Getting Real" 철학이 구조화된 Rapid Prototyping으로 수렴했습니다.

**철학**: "사용자는 추상적 질문에는 부정확하게 반응하지만 구체적 산출물에는 정확하게 반응한다. 산출물을 먼저 만들고, 관찰된 반응에서 요구사항을 도출한다."

**추상화 하강**:
```
Problem Definition → Prototype Creation → User Testing → Requirement Derivation → Implementation
```

**제어 장치**: Think-Make-Check 사이클, 사용성 테스트, A/B 테스트, 5일 Design Sprint 시간 제약.

**적합한 경우**: 새로운 제품/시장. UX가 핵심 차별화 요소인 경우. 불확실한 사용자 요구. AI 시대 (v0, Bolt.new, Lovable을 통한 빠른 프로토타입 생성).

**부적합한 경우**: 백엔드 로직 중심 시스템. 규제 도메인. 프로토타입으로는 시연할 수 없는 비기능 요구사항 (성능, 보안).

---

### 1.9 Spec-Driven Refinement

**방법론**: GitHub Spec Kit (2025.10), Kiro (AWS 2025.07), Tessl (2025), BMad Method, OpenSpec

**등장 배경**: AI 코딩 어시스턴트가 코드 생성을 상용화하면서 엔지니어링 병목이 "구문 작성"에서 "의도 정의"로 이동했습니다. Thoughtworks Technology Radar Vol.32 (2025)가 이를 Spec-Driven Development (SDD)로 형식화했습니다.

**철학**: "명세가 주요 산출물이다. 코드는 명세에서 생성되는 2차적, 파생 산출물이다. 사람이 생각하고 (명세 작성), AI가 실행한다 (코드 생성)."

**SDD 성숙도 3단계** (Thoughtworks 분류):

| 수준 | 설명 | Spec-Code 관계 |
|---|---|---|
| Spec-First | 코딩 전에 명세 작성; 명세가 AI 생성을 안내 | Spec → Code (단방향, 시간이 지나면 드리프트 가능) |
| Spec-Anchored | 명세와 코드가 라이프사이클 전반에 걸쳐 동기화 | Spec ↔ Code (양방향 동기화 유지) |
| Spec-as-Source | 명세가 소스; 코드는 컴파일된 출력물, 수동 편집 불가 | Spec = Source → Code = Build artifact |

**도구 포지셔닝**:

| 도구 | SDD 수준 | 정련 단계 |
|---|---|---|
| Kiro (AWS) | Spec-First | Requirements → Design → Tasks → Implementation |
| GitHub Spec Kit | Spec-First | Specify → Plan → Tasks → Build |
| Tessl | Spec-Anchored ~ Spec-as-Source | Spec → Code (`// GENERATED FROM SPEC - DO NOT EDIT` 포함) |
| BMad Method | Spec-First | Brief → PRD → Architecture → Epics → Stories |
| JDD Sprint Kit | Spec-Anchored (Crystallize를 통해) | 섹션 3 참조 |

**제어 장치**: Spec-Code Traceability, Constitution/Guardrails (불변 원칙), Scope Gate, 수정보다 재생성.

**적합한 경우**: AI 에이전트가 구현을 담당하는 경우. 대규모 팀의 명세 기반 협업. 규제 준수 + AI 구현이 교차하는 환경.

**부적합한 경우**: 명세 자체가 불확실한 탐색적 프로토타이핑. 명세 유지 비용이 가치를 초과할 정도로 매우 빠르게 변하는 요구사항.

---

### 1.10 Constraint-Driven Refinement

**방법론**: Evolutionary Architecture + Fitness Functions (Ford/Parsons/Kua), Theory of Constraints (Goldratt), ArchUnit, SLO/SLA-based Design

**등장 배경**: 장기 운영 시스템은 아키텍처 부채를 축적합니다. Neal Ford 등은 아키텍처 속성을 지속적으로 검증하는 자동화된 "적합도 함수"로 아키텍처를 안내해야 한다고 제안했습니다.

**철학**: "시스템이 반드시 충족해야 하는 것(제약)을 정의하고, 준수 여부를 자동으로 측정하며, 그 제약 안에서 설계를 진화시킨다. 아키텍처는 도착지가 아니라 지속적인 여정이다."

**추상화 하강**:
```
Constraint Identification → Fitness Function Definition → Architecture Decisions (ADRs)
  → Implementation → Fitness Function Execution → Evolution
```

**제어 장치**: 자동화된 Fitness Functions (CI/CD 내), ArchUnit 테스트, SLO 모니터링, ADR 이력.

**적합한 경우**: 장기적으로 진화하는 시스템. NFR (성능, 보안, 유지보수성)이 중요한 경우. 아키텍처 부채 관리.

**부적합한 경우**: 초기 MVP 단계. 제약이 알려지지 않은 새로운 도메인.

---

### 1.11 AI-Native Refinement

**방법론**: V-Bounce Model (Hymel 2024), JDD Sprint Kit, Agentic SDLC (2025~)

**등장 배경**: AI 코드 생성이 프로덕션 품질에 도달하면서 (2024-2025) 소프트웨어 개발의 경제학이 근본적으로 변화했습니다. 사람의 역할이 "구현자"에서 "판단자/검증자"로 전환되었습니다.

**철학**: "AI가 구현하고, 사람이 판단한다. 구현 비용이 거의 제로이므로, 사람의 시간은 오직 판단에만 사용되어야 한다 — 무엇을 만들지 결정하고, 만들어진 것이 올바른지 판단하는 데."

**추상화 하강**:
```
사람이 의도를 정의 → AI가 모든 산출물 생성 → 사람이 판단 → AI가 정련 → 사람이 확인
  → AI가 프로덕션 코드 구현 → AI+사람이 검증
```

**제어 장치**: Human-in-the-loop Checkpoints (JP1, JP2), Context Engineering (AI 입력의 품질), 수정보다 재생성, 프롬프트로서의 명세, AI 에이전트 행동의 관찰 가능성.

**적합한 경우**: AI 코딩 에이전트를 사용할 수 있는 환경. 개발자 없이 소프트웨어를 만드는 제품 전문가. 구현 인재는 부족하지만 판단 인재가 있는 환경.

**부적합한 경우**: 사람이 작성한 코드 인증이 필요한 규제 도메인 (현재 한계). 인터넷/AI 접근 불가 환경.

---

## 2. AI 호환성 평가

### 2.1 평가 기준

AI 호환성은 5가지 차원에서 평가되었습니다:

| # | 기준 | 측정 대상 | AI에 중요한 이유 |
|---|---|---|---|
| C1 | **Structured Artifacts** | 방법론이 기계 파싱 가능한 출력을 생성하는가? (OpenAPI, Gherkin, DBML 등) | AI는 자연어 산문보다 구조화된 입력에서 더 정확한 코드를 생성합니다 |
| C2 | **Verification Automation** | 정련 결과를 자동으로 검증할 수 있는가? (계약 테스트, BDD, 적합도 함수) | AI 출력은 비결정적입니다 (같은 입력 → 다른 코드). 자동 검증 없이는 사람이 매번 확인해야 합니다 |
| C3 | **AI Strength Alignment** | 정련 방향이 AI가 잘하는 것(생성, 패턴 매칭)과 일치하는가? 잘 못하는 것(발견, 컨텍스트 유지, 출현)은 아닌가? | AI는 "주어진 명세에서 코드 생성"에 뛰어나지만 "기존 코드에서 더 나은 설계 발견"에는 어려움을 겪습니다 |
| C4 | **Human Judgment Isolation** | 사람의 판단을 특정 체크포인트에 격리할 수 있는가? 전 과정에 참여해야 하는가? | 사람의 개입이 전체 과정에 분산되면 AI에 자율 실행 구간이 없습니다 |
| C5 | **Regeneration Affinity** | 방법론이 자연스럽게 "수정" 대신 "재생성"을 지원하는가? | AI의 핵심 경제적 장점은 재생성 비용이 낮다는 것입니다. 수정 중심 방법론은 이 장점을 활용하지 못합니다 |

### 2.2 카테고리별 평가

| 카테고리 | C1 Structured | C2 Auto-verify | C3 AI Strength | C4 Judgment Isolation | C5 Regeneration | **종합** |
|---|---|---|---|---|---|---|
| 1. Top-Down | Low (산문 문서) | Low (사람 리뷰) | Partial (분해 OK, 발견 NO) | Low (매 단계 사람 승인) | Low (수정 문화) | **Low** |
| 2. Iterative | Medium (UML 모델) | Medium (데모 + 일부 자동화) | Medium (반복당 AI, 리스크 판단은 사람) | Medium (마일스톤 사람, 나머지 AI) | Medium (반복 ≈ 재생성) | **Medium** |
| 3. Emergent | Low (코드 = 산출물) | High (TDD/CI) | **Low** (AI는 리팩토링을 통한 설계 발견에 약함) | Low (페어/모브 = 상시 사람) | Low (진화, 재생성 아님) | **Low** |
| 4. Domain-Driven | Medium (Context Map 구조화) | Medium (Aggregate 불변성 테스트 가능) | Partial (전술적 OK, 전략적은 사람) | Medium (전략적은 사람, 나머지 AI) | Low (도메인 모델 진화) | **Medium** |
| 5. Contract-First | **High** (OpenAPI, DBML) | **High** (Specmatic, Pact) | **High** (계약에서 생성 = AI 핵심 역량) | **High** (계약 정의 사람, 구현 AI) | **High** (계약 기반 재생성 자연스러움) | **High** |
| 6. Behavior-First | **High** (Gherkin) | **High** (실행 가능한 시나리오) | **High** (테스트 통과 = AI 강점) | **High** (시나리오 사람, 구현 AI) | **High** (시나리오 변경 → 재생성) | **High** |
| 7. Event-First | Medium (이벤트 모델) | Medium (이벤트 소싱 검증 가능) | Partial (핸들러 OK, 발견은 사람) | Medium (Big Picture 사람, 나머지 AI) | Low (이벤트 스키마 하위 호환) | **Medium** |
| 8. Prototype-First | Medium (프로토타입 코드) | Low (사용자 테스트 = 사람) | **High** (AI 프로토타입 생성 매우 빠름) | **High** (프로토타입 AI, 판단 사람) | **High** (프로토타입 재생성 비용 ≈ 0) | **High** |
| 9. Spec-Driven | **Very High** (구조화된 명세) | **High** (Scope Gate, 계약) | **Very High** (명세 = AI 프롬프트) | **Very High** (명세 리뷰 사람, 나머지 AI) | **Very High** (명세 변경 → 재생성 = 핵심 원칙) | **Very High** |
| 10. Constraint-Driven | High (코드로서의 적합도 함수) | **High** (자동화된 적합도 실행) | Partial (실행 AI, 제약 정의 사람) | Medium (제약 정의 사람, 실행 AI) | Medium (진화, 그러나 적합도 자동 실행) | **Medium** |
| 11. AI-Native | **High** (AI 소비용으로 설계) | **High** (JP + 자동 검증) | **Highest** (AI를 구현자로 설계) | **Highest** (사람 = 판단자만) | **Highest** (재생성 > 수정 = 설계 원칙) | **Highest** |

### 2.3 Emergent Design의 AI 호환성이 낮은 이유

이것은 가장 직관에 반하는 평가입니다. XP/TDD는 현대적이고, 테스트 자동화를 강조하며, 높은 개발자 만족도를 보입니다. 왜 AI와 맞지 않을까요?

**이유 1: AI는 리팩토링을 통한 설계 발견에 약합니다.** Emergent Design의 핵심 전제는 "코드를 작성한 다음, 리팩토링을 통해 더 나은 추상화를 발견하라"입니다. AI는 "주어진 명세에서 코드 생성"에 뛰어나지만 "이 3개의 클래스를 보고 공통 패턴을 추출하라"에는 어려움을 겪습니다. 리팩토링은 전체 코드베이스 컨텍스트를 유지하고 현재 AI가 일관성 없이 처리하는 미학적/구조적 판단을 내려야 합니다.

**이유 2: 수정 vs 재생성.** Emergent Design은 코드를 점진적으로 진화시킵니다 (기존 코드 수정). AI의 경제적 장점은 재생성 (처음부터 생성)입니다. AI에게 기존 코드를 이해하고 정밀한 수정을 하라고 요청하는 것은 명세를 주고 새 코드를 생성하게 하는 것보다 더 어렵고 덜 신뢰할 수 있습니다.

**이유 3: 상시적 사람의 개입.** XP는 페어/모브 프로그래밍을 가정합니다 — 사람이 실시간으로 협업하는 것입니다. AI와 페어 프로그래밍을 하면 매 순간 참여해야 하므로 AI의 자율 실행 장점을 잃게 됩니다.

### 2.4 Contract-First가 보편적 AI 파트너인 이유

결합 호환성 매트릭스에서 Contract-First는 거의 모든 카테고리와 잘 결합됩니다 (거의 모든 셀에서 O). AI에 특히 중요한 이유:

- 계약 (OpenAPI, Gherkin, DBML)은 **기계 판독 가능한 정답지**입니다
- AI가 어떤 코드를 생성하든, 계약 테스트를 통과하면 올바른 구현입니다
- 이것이 AI의 비결정성을 제어하는 유일한 구조적 메커니즘입니다 (같은 명세 → 다른 코드)
- 따라서 어떤 방법론에든 Contract-First를 추가하면 AI 호환성이 향상됩니다

이것이 Sprint Kit이 Contract-First (api-spec.yaml + Specmatic)를 핵심 기둥으로 사용하는 이유입니다.

---

## 3. Multi-Pass Refinement: Sprint Kit의 3-Pass 패턴

### 3.1 Sprint Kit의 패턴 정의

| Pass | 이름 | 방향 | 성격 | 사람의 입력 |
|---|---|---|---|---|
| 1 | **Generative** | 하향 (추상 → 구체) | 존재하지 않았던 산출물 생성 | JP1: 요구사항 판단 |
| 2 | **Reconciliatory** | **양방향** (구체 ↔ 추상) | 만들어진 것과 계획한 것의 정합 | JP2: 경험 판단 |
| 3 | **Realization** | 하향 (명세 → 코드) | 확인된 설계의 실체화 | 없음 (AI 자율) |

### 3.2 다른 Multi-Pass 방법론과의 비교

| 방법론 | Pass 수 | 2차 Pass 성격 | Reconciliatory Pass 유무 | 철학 |
|---|---|---|---|---|
| V-Model | 2 | **Verification** (계획과 일치하는가?) | 없음 — 계획은 불변 | 사전에 올바르게 정의 |
| V-Bounce (2024) | N (빠른 루프) | **Verification** (AI 출력 확인) | 없음 — 체계적 양방향 정합 없음 | AI가 구현을 바운스 |
| W-Model | 2 (병렬) | **Early testing** (개발과 함께 테스트) | 없음 | 나중이 아닌 일찍 테스트 |
| Spiral | N (나선) | **Risk resolution** (최고 리스크 해결) | 없음 — 같은 형태의 pass 반복 | 리스크가 프로세스를 주도 |
| Double Diamond | 2 | **Solution exploration** (2차 다이아몬드) | 없음 — 상류 산출물 업데이트 없음 | 문제 공간과 솔루션 공간 분리 |
| Design Sprint | 1 + 테스트 | **User testing** (프로토타입 반응) | 없음 — 상류 산출물 업데이트 없음 | 프로토타입이 진실을 드러냄 |
| Shape Up | 2 + breaker | **Building** (팀이 구현) | 없음 — 팀이 암묵적으로 조정 | 고정된 시간이 범위를 제어 |
| Lean BML | N (루프) | **Market measurement** (실제 고객 데이터) | 없음 — 다음 루프의 가설이 변경 | 시장 현실에서 학습 |
| PDCA | N (사이클) | **Check** (결과 관찰) | 부분적 — Act가 Plan을 조정 | 과학적 방법 적용 |
| SDD Spec-Anchored | 연속적 | **Bidirectional sync** (명세 ↔ 코드) | 있음 — 연속적 | 명세와 코드가 항상 정합 |
| Kiro | 1 + 수동 정련 | **Manual edit** (사용자가 명세 수정) | 없음 — 단방향 수동 수정 | 구조화된 명세 생성 |
| **Sprint Kit** | **3** | **Reconciliation** (양방향 재정합) | **있음 — 명시적 전용 pass** | 판단이 영속하는 자산 |

### 3.3 Sprint Kit의 2차 Pass가 독특한 이유

대부분의 방법론의 2차 pass는 **검증**입니다 — "계획한 대로 만들었는가?" 답이 "아니오"이면 1차 pass로 돌아갑니다.

Sprint Kit의 2차 pass는 **정합**입니다 — 프로토타입이 계획이 예상하지 못한 현실을 드러내고, 이 현실이 **모든 상류 산출물에 역전파됩니다**. `reconciled/` 디렉토리에는 계획과 프로토타입이 정합된 완전하고 내부적으로 일관된 산출물 세트가 포함됩니다.

이것은 검증(확인)이 아닙니다. 재구조화(재정합)입니다.

### 3.4 철학적 기반

**가장 가까운 유비: Peirce의 탐구의 논리** (Hegel의 변증법이 아님)

| Peirce | Sprint Kit | 활동 |
|---|---|---|
| Abduction (가설 생성) | Pass 1 (Generative) | 입력에서 최선의 설명/설계 생성 |
| Deduction (가설에서 예측) | Prototype | 설계가 실현되면 어떤 모습인지 연역 |
| Induction (관찰에서 수정) | Pass 2 (Reconciliatory) | 프로토타입 관찰에서 상류를 귀납적으로 수정 |

Hegel이 아닌 Peirce인 이유: Hegel의 변증법은 "상승하는 진리"를 추구합니다 (정 → 반 → 합 → 더 높은 정...). Sprint Kit은 "실용적 가설 정련"을 추구합니다 — 추상적 진리를 향해 상승하는 것이 아니라 실용적 솔루션을 향해 수렴합니다. 방향이 철학적이 아니라 실용적입니다.

### 3.5 이 패턴이 AI 시대에 출현한 이유

Reconciliatory pass는 **전체 산출물 세트를 재생성**해야 합니다. 이것은 AI 이전에는 경제적으로 불가능했습니다:

| 시대 | 산출물 재생성 비용 | 가능한 pass 구조 |
|---|---|---|
| Pre-AI | 수주~수개월 | 검증만 (문제 발견에서 중단) → V-Model |
| Early AI (2023-24) | 수시간~수일 | 더 빠른 검증 루프 → V-Bounce |
| AI-Native (2025-26) | 수분~수시간 | 전체 정합 (발견 + 재정합 + 재생성) → Sprint Kit |

AI가 생성 비용을 충분히 낮추어 "검증" (문제 발견, 중단)을 "정합" (발견 + 수정 + 재정합)으로 업그레이드할 수 있게 되었습니다. 이것이 Sprint Kit 3-pass 패턴의 방법론적 의의입니다.

### 3.6 Reconciliatory Pass가 AI 생성에서 더 중요한 이유

세 가지 이유:

1. **산출물 간 드리프트**: 사람이 산출물을 만들 때는 하나의 두뇌가 암묵적 일관성을 유지합니다. AI가 산출물을 독립적으로 생성하면 산출물 간 구조적 드리프트가 본질적으로 발생합니다. 정합이 이 드리프트를 해결하는 유일한 체계적 메커니즘입니다.

2. **구체화를 통한 발견**: AI가 생성한 프로토타입에는 명시적으로 요청하지 않은 기능/패턴이 포함되는 경우가 많습니다 (AI의 추론에 의한). 일부는 가치 있는 발견입니다. 정합은 이러한 발견을 공식적으로 상류 산출물에 통합합니다.

3. **Spec-code 드리프트 해결**: SDD의 핵심 과제 (spec-code 드리프트)를 프로덕션 단계 (높은 비용)가 아닌 프로토타입 단계 (낮은 비용)에서 해결합니다.

---

## 4. 결합 호환성 매트릭스

(O = 잘 결합됨, X = 충돌, △ = 부분적 결합 가능)

|  | Top-Down | Iterative | Emergent | DDD | Contract | Behavior | Event | Prototype | Spec-Driven | Constraint | AI-Native |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Top-Down** | - | △ | X | △ | O | △ | △ | X | O | O | △ |
| **Iterative** | △ | - | △ | O | O | O | O | O | O | O | O |
| **Emergent** | X | △ | - | △ | △ | O | △ | △ | X | △ | X |
| **DDD** | △ | O | △ | - | O | O | O | △ | O | O | △ |
| **Contract** | O | O | △ | O | - | O | O | O | O | O | O |
| **Behavior** | △ | O | O | O | O | - | O | O | O | O | O |
| **Event** | △ | O | △ | O | O | O | - | △ | O | O | △ |
| **Prototype** | X | O | △ | △ | O | O | △ | - | O | △ | O |
| **Spec-Driven** | O | O | X | O | O | O | O | O | - | O | O |
| **Constraint** | O | O | △ | O | O | O | O | △ | O | - | O |
| **AI-Native** | △ | O | X | △ | O | O | △ | O | O | O | - |

**핵심 관찰**:
- **Contract-First**가 가장 보편적으로 결합 가능 (거의 모든 셀에서 O)
- **Behavior-First**도 높은 결합 호환성 보유
- **Emergent Design**은 대부분의 사전 정의 접근법과 충돌
- **Spec-Driven + AI-Native**는 자연스러운 쌍 (명세 = AI 프롬프트)

---

## 5. Sprint Kit의 포지션: 4-Category 하이브리드

Sprint Kit은 의도적으로 4가지 카테고리를 결합합니다:

| Sprint Kit 단계 | 주요 카테고리 | 보조 | 역할 |
|---|---|---|---|
| Phase 0-1 (BMad Pipeline) | **Spec-Driven** | Top-Down | AI가 모든 기획 산출물을 자동 생성 |
| JP1 | **AI-Native** | — | 사람이 요구사항을 판단 (고객 렌즈) |
| Deliverables | **Contract-First** + **Behavior-First** | Spec-Driven | OpenAPI 계약 + BDD 시나리오 + 프로토타입 |
| JP2 | **Prototype-First** | AI-Native | 사람이 구체적 프로토타입에서 경험을 판단 |
| Crystallize | Spec-Driven (양방향) | — | 프로토타입 ↔ 명세 정합 |
| Parallel | Contract-First | AI-Native | 계약 기반 병렬 구현 |
| Validate | Behavior-First + Constraint-Driven | — | BDD + 품질/보안/비즈니스 검증 |

### Sprint Kit이 독자적으로 결합하는 것

| 독자적 요소 | 다른 방법론에 없는 것 | Sprint Kit의 솔루션 |
|---|---|---|
| 양방향 정련 (명세 → 프로토타입 → 명세) | Spec-Driven은 단방향; Prototype-First는 명세를 업데이트하지 않음 | Crystallize가 프로토타입 현실을 상류 산출물에 역전파 |
| 판단 기반 체크포인트 (비개발자용) | 리뷰는 기술적 전문성을 가정 | JP1/JP2는 고객 렌즈 판단만 요구 |
| 재생성 비용 투명성 | 대부분의 방법론은 변경 비용을 정량화하지 않음 | Comment → Impact Analysis가 사용자 결정 전에 수정/재생성 비용 제시 |
| Brownfield 자동 수집 | 대부분의 방법론은 기존 시스템을 수동 분석 | L1-L4 기존 코드/API/도메인 자동 스캔 |
| Entropy Tolerance + File Ownership | 병렬 충돌 방지 메커니즘 없음 | 태스크별 파일 소유권 + 변경 허용 범위 사전 정의 |

---

## 6. 역사적 진화

```
1970s  Waterfall (순차적 하향식) ──────────────────┐
1980s  Spiral (리스크 기반 반복) ───────────────────┤
1990s  RUP (구조화된 반복) + DDD (도메인 중심) ─────├── 사람 중심 정련
2000s  XP (출현) + BDD (동작) + Event Storming ─────┤
2010s  Design Sprint (프로토타입) + SAFe (확장) ─────┘
                                                      │
2024   V-Bounce (AI 구현 전제) ──────────────────────┐
2025   SDD 출현 (Spec-Driven) ───────────────────────├── AI 시대 정련
2025~  JDD Sprint Kit (판단 기반 하이브리드) ─────────┘
```

---

## Sources

- [V-Bounce Model (Hymel 2024) - arXiv](https://arxiv.org/abs/2408.03416)
- [Expanding V-Model for AI Systems (2025) - arXiv](https://arxiv.org/abs/2502.13184)
- [Spec-Driven Development - Thoughtworks Radar](https://www.thoughtworks.com/radar/techniques/spec-driven-development)
- [SDD: From Code to Contract - arXiv](https://arxiv.org/html/2602.00180v1)
- [Understanding SDD: Kiro, spec-kit, Tessl - Martin Fowler](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)
- [Kiro - Spec-driven AI Development](https://kiro.dev/)
- [Anthropic 2026 Agentic Coding Trends Report](https://resources.anthropic.com/2026-agentic-coding-trends-report)
- [Addy Osmani - LLM Coding Workflow 2026](https://addyosmani.com/blog/ai-coding-workflow/)
- [Context Engineering for AI Agents - Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Spiral Model - Wikipedia](https://en.wikipedia.org/wiki/Spiral_model)
- [Double Diamond - Design Council](https://www.designcouncil.org.uk/our-resources/the-double-diamond/)
- [Design Sprint - GV](https://www.gv.com/sprint/)
- [Shape Up - Basecamp](https://basecamp.com/shapeup)
- [BMAD Method - GitHub](https://github.com/bmad-code-org/BMAD-METHOD)
- [GitHub Spec Kit - Microsoft Developer](https://developer.microsoft.com/blog/spec-driven-development-spec-kit)
- [BMAD vs spec-kit vs OpenSpec vs PromptX Comparison](https://redreamality.com/blog/-sddbmad-vs-spec-kit-vs-openspec-vs-promptx/)
- [SAGE: Self-Abstraction SWE Agent - Salesforce](https://www.salesforce.com/blog/sage-swe/?bc=OTH)
- [Limits of Spec-Driven Development - Isoform](https://isoform.ai/blog/the-limits-of-spec-driven-development)
- [SDD and the Future of Software Development - Cesar Soto Valero](https://www.cesarsotovalero.net/blog/sdd-and-the-future-of-software-development.html)
