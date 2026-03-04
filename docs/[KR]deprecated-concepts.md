# Deprecated Concepts

> **문서 유형**: 아카이브 — Canonical + 3 Projections 모델로 대체된 개념들
> **Version**: 1.0
> **Date**: 2026-03-04
> **관련 문서**: [`canonical-projection-model.md`](canonical-projection-model.md) (대체 모델), [`delta-driven-design.md`](delta-driven-design.md) (원본 출처)

---

## 1. Calculus 비유

**무엇이었는가**: Sprint Kit의 파이프라인을 Calculus 개념으로 설명하는 수학적 프레이밍(DDD §5.1-5.3)이었다:
- Delta 추출 = Differentiation (변화율 추출)
- 시스템 복원 = Integration (Brownfield + Delta + Carry-Forward = 완전한 시스템)
- Carry-forward = Constant of integration (Differentiation 시 소실되는 정보)
- 왕복 검증 = Calculus의 기본 정리(Differentiation과 Integration은 역연산)

**원래의 매핑 테이블**:

| Calculus | Delta-Driven Design |
|---|---|
| f(x) — 원래 함수 | Complete System — 목표 시스템 |
| f'(x) — 도함수 | Delta — 변경분 |
| ∫f'(x)dx — 부정적분 | Brownfield + Delta — 가시적 변경의 합 |
| C — Constant of integration | Carry-Forward — 비가시적 요구사항 |
| C는 초기/경계 조건으로 결정 | Carry-Forward는 PRD/Architecture/Brownfield로부터 결정 |

**대체된 이유**: Calculus 용어(Differentiation, Integration, Constant of integration, 기본 정리)는 설명적 이점 없이 용어 부담만 증가시켰다. Sprint Kit의 동작을 이해하는 데 Calculus 지식은 필요하지 않았다 — 비유는 구조적으로 타당했지만 교육적으로 불필요했다.

**무엇으로 대체되었는가**: **Convergence** (canonical-projection-model.md §3). 모든 파이프라인 단계는 Convergence 프로세스이다: 격차를 측정하고, 0이 될 때까지 반복한다. 이는 비유를 경유하지 않고 동일한 동작을 직접 설명한다.

**원본 참조**: DDD v1.1 §5.1-5.3 ("Differentiation and Integration", "Carry-Forward as the Constant of Integration", "Round-Trip Verification = Fundamental Theorem of Calculus")

---

## 2. π Notation Projections

**무엇이었는가**: 시스템을 고차원 객체로 보고 이해관계자별 Projection으로 관찰한다는 사영 기하학 프레이밍(DDD §5.4)이었다:

```
π_customer(S) = 고객이 보는 시스템 (UI, 인터랙션, 플로우)
π_developer(S) = 개발자가 보는 시스템 (API, DB, 상태 머신)
π_security(S) = 보안 팀이 보는 시스템 (인증, 인가, 암호화)
π_ops(S) = 운영 팀이 보는 시스템 (배포, 모니터링, 스케일링)
```

Carry-forward는 "특정 Projection의 축소된 차원에서 소실되는 정보"로 정의되었다.

**대체된 이유**: π notation은 명확한 규칙 없이 무한한 수의 Projection(π_customer, π_developer, π_security, π_ops, ...)을 도입했다. 실제로 Sprint Kit은 정확히 3개의 Projection으로 운영된다. 수학적 표기법은 이 단순함을 가렸다.

**무엇으로 대체되었는가**: **3개의 명명된 Projection** (canonical-projection-model.md §1): Code, Policy, Experience. 각각은 구체적인 Sprint Kit 산출물과 소스 역할에 매핑된다. 무한한 N-Projection 모델은 고정된, 실행 가능한 집합으로 축소되었다.

**원본 참조**: DDD v1.1 §5.4 ("Prototype as Projection")

---

## 3. Constrained Optimization

**무엇이었는가**: Sprint Kit의 의사결정 구조를 제약 최적화 문제로 설명하는 수학적 프레이밍(DDD §5.5)이었다:

```
maximize: π_customer(S)       ← 고객 경험 (목적 함수)
subject to:
  π_security(S) ≥ threshold    ← 보안 요구사항 (제약)
  π_ops(S) ≥ threshold          ← 운영 요구사항 (제약)
  π_perf(S) ≥ threshold         ← 성능 요구사항 (제약)
```

"빈 실행 가능 영역"(제약 충돌)은 JP에서 비즈니스 판단이 필요한 NFR 충돌에 매핑되었다.

**원래의 매핑 테이블**:

| 수학적 프레이밍 | Sprint Kit 대응 |
|---|---|
| 목적 함수 (π_customer) | FR — 기능 요구사항 |
| 제약 (π_security, π_ops, ...) | NFR — 비기능 요구사항 |
| 실행 가능 영역 | 모든 NFR을 충족하면서 FR을 구현하는 설계 |
| 빈 실행 가능 영역 | NFR 충돌 → 비즈니스 판단 필요 |
| 최적 해 선택 | JP1/JP2에서의 판단 |

**대체된 이유**: Constrained Optimization 프레이밍은 FR/NFR 구분을 수학적 언어로 재서술했을 뿐 실행 가능한 통찰을 추가하지 않았다. Sprint Kit은 이미 JP 충돌 해결을 통해 제약 충돌을 처리하고 있었다 — 이를 "Constrained Optimization"이라 명명하는 것은 메커니즘을 변경하지 않았다.

**무엇으로 대체되었는가**: **JP 충돌 해결** (JDD와 파이프라인에서 직접 설명). Projection 간 충돌이 발생할 때(예: 최선의 고객 경험이 보안 요구사항을 위반할 때), JP가 비즈니스 판단의 시점이다. 수학적 프레이밍은 필요하지 않다.

**원본 참조**: DDD v1.1 §5.5 ("Projection Hierarchy: Constrained Optimization")

---

## 4. Two Grammars를 주요 프레임으로 사용

**무엇이었는가**: 소프트웨어가 두 세계의 교차점에 존재한다고 설명하는 기본 개념 모델(DDD §2)이었다:
- **User Grammar**: 시스템의 실제 사용자가 사용하는 언어 (화면, 동작, API 계약)
- **Development Grammar**: 구현의 언어 (API 엔드포인트, DB 스키마, 상태 머신)

이 두 Grammar 사이의 번역이 Sprint Kit의 핵심 동작이었다.

**주요 프레임에서 대체된 이유**: Policy는 User Grammar도 Development Grammar도 아니다. Policy에는 고유한 화자(법무, 컴플라이언스, 비즈니스 전략가), 고유한 Grammar(규정, 약관, 제약), 고유한 검증 방법(규정 대비 검토)이 있다. Policy를 Development Grammar에 포함시키면 모델에서 정책 제약이 보이지 않게 되었다.

**무엇으로 대체되었는가**: **Three Projections** (canonical-projection-model.md §2): Experience (= User Grammar), Code (= Development Grammar), Policy (신규). Two Grammars 모델은 번역 규칙 내의 **운용 약칭**으로 보존된다 — "User Grammar를 Development Grammar로 번역한다"는 "Experience projection을 Code projection으로 번역한다"로서 여전히 유효하다.

**원본 참조**: DDD §2 ("Two Grammars")

**상태**: "User Grammar"와 "Development Grammar"라는 용어는 DDD §3 번역 규칙과 terminology map에서 운용 약칭으로 계속 사용된다. 삭제되지 않으며, 역할이 주요 개념 프레임에서 운용 어휘로 전환된다.
