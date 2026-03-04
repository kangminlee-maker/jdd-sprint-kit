# Canonical + 3 Projections 모델

> **문서 유형**: 개념적 기반 — Sprint Kit가 서비스를 모델링하는 방식
> **Version**: 1.0
> **Date**: 2026-03-04
> **관련 문서**: [`delta-driven-design.md`](delta-driven-design.md) (설계 이론), [`judgment-driven-development.md`](judgment-driven-development.md) (설계 철학), [`translation-ontology.md`](translation-ontology.md) (가설 체계), [`blueprint.md`](blueprint.md) (제품 명세), [`terminology-map.md`](terminology-map.md) (용어 참조)

---

## 1. 핵심 모델

서비스에는 **canonical definition**이 존재한다 — 서비스가 무엇이고 무엇을 하는지에 대한 완전하고 내부적으로 일관된 기술이다. 이 canonical definition은 직접 관측할 수 없다. 대신 **projection**을 통해 관측한다: 일부 측면을 드러내면서 다른 측면을 숨기는 부분적 관점이다.

Sprint Kit는 세 가지 projection을 정의한다:

| Projection | 드러내는 것 | 숨기는 것 | Sprint Kit 산출물 |
|---|---|---|---|
| **Code** | 구현: API 엔드포인트, DB 스키마, 상태 기계, 알고리즘, 인프라 | 고객 경험, 비즈니스 정책 근거 | Specs (requirements.md, design.md, tasks.md), Deliverables (api-spec.yaml, schema.dbml) |
| **Policy** | 비즈니스 규칙, 규제 제약, 이용약관, 컴플라이언스 요건 | 구현 세부사항, 고객 경험 | policy_docs, PCP (Policy Constraint Profile) |
| **Experience** | 시스템의 실제 사용자가 보고 하는 것: 화면, 상호작용, API 계약, 데이터 흐름 | 내부 구현, 정책 근거 | Prototype (preview/), key-flows.md |

각 projection에는 두 가지 상태가 있다:

| 상태 | 의미 | 출처 |
|---|---|---|
| **as-is** | 이 projection에서 현재 시스템 상태 | Brownfield 스캔 (Code), 기존 정책 문서 (Policy), 현재 제품 (Experience) |
| **to-be** | 이 projection에서 목표 시스템 상태 | JP2 승인 Prototype (Experience), 번역된 specs (Code), 갱신된 정책 (Policy) |

**canonical definition**은 세 projection의 합집합이다. 어떤 단일 projection도 완전한 서비스를 담지 못한다 — 각각은 자신의 각도에서 서비스를 바라보며, 나머지 두 projection의 정보를 잃는다.

---

## 2. 세 Projection인 이유 (둘이 아닌)

Sprint Kit는 원래 **Two Grammars** 모델을 사용했다: User Grammar(사용자의 세계)와 Development Grammar(기계의 세계). 이 모델은 ontology와 policy 소스가 추가되기 전까지는 잘 작동했다.

### Two Grammars의 빈틈

Policy는 User Grammar도 Development Grammar도 아니다:

| 측면 | User Grammar | Development Grammar | Policy |
|---|---|---|---|
| 누가 사용하는가 | 시스템의 실제 사용자 | 개발자, AI 코딩 에이전트 | 법률, 컴플라이언스, 비즈니스 전략가 |
| 무엇을 표현하는가 | 원하는 경험 | 구현 세부사항 | 제약, 규칙, 경계 |
| 검증 방법 | Prototype 사용 | 테스트 및 검증 | 규정 대조 검토 |

Policy는 Development Grammar의 "NFR 제약"으로 암묵적으로 포함되어 있었다. 그러나 Policy는 자체 grammar, 자체 화자, 자체 검증 방법을 가진다. Development Grammar의 하위 집합으로 취급하면 정책 제약이 모델에서 보이지 않게 된다.

### 기존 모델과의 대응

Three Projections 모델은 대체가 아니라 확장이다:

| Two Grammars (operational shorthand) | Three Projections |
|---|---|
| User Grammar | Experience projection |
| Development Grammar | Code projection |
| (Development Grammar에 암묵적으로 포함) | Policy projection |

"User Grammar"와 "Development Grammar"라는 용어는 번역 규칙(DDD 3)에서 operational shorthand로서 유효하다. Three Projections 모델은 개념적 구조를 명시적으로 만든다.

---

## 3. Convergence

Sprint Kit 파이프라인의 모든 단계는 **Convergence 과정**이다: 갭을 측정하고 갭이 0에 도달할 때까지 반복한다.

| 파이프라인 단계 | 수렴 대상 | 갭 측정 기준 | 0의 의미 |
|---|---|---|---|
| **Phase 1 (BMad)** | 문제 이해 → 솔루션 방향 | 기획 산출물의 완전성 | JP1 준비 완료 |
| **JP1** | 제품 전문가와 생성된 산출물 간 의도 정렬 | 코멘트 수: 0 = [S], >0 = 반복 | 방향 확정 |
| **JP2** | 제품 전문가와 Prototype 간 경험 정렬 | 코멘트 수: 0 = [S], >0 = 반복 | 목표 확정 |
| **Crystallize S3** | Prototype과 Brownfield 제약 간 일관성 | 발견 수: 0 = PASS, >0 = 해결 | 모든 충돌 해결 |
| **Crystallize S7** | 번역 후 교차 산출물 일관성 | 갭 수: 0 = PASS, >0 = 수정 | 모든 산출물 정렬 |
| **Validate** | Specs 대비 구현 정확성 | 실패 수: 0 = PASS, >0 = 수정 | 구현 검증 완료 |

### Convergence가 미적분 비유를 대체하는 이유

이전의 수학적 프레이밍(DDD 5, 현재 [`deprecated-concepts.md`](deprecated-concepts.md)에 아카이브)은 파이프라인을 미적분 개념으로 기술했다: 미분, 적분, 적분 상수, 기본 정리. 구조적으로는 유효한 비유였으나, 미적분 어휘는 설명적 이점 없이 용어 부담만 추가했다.

Convergence는 동일한 구조를 직접 기술한다:
- "갭 측정"이 "미분"을 대체한다
- "0이 될 때까지 반복"이 "적분"을 대체한다
- "한 projection에서 누락된 정보"가 "적분 상수"를 대체한다
- "갭이 0에 도달"이 "미적분의 기본 정리"를 대체한다

연산은 동일하다. 기술 방식이 비유적이 아니라 직접적이다.

---

## 4. Projection 갭으로서의 Carry-Forward

**Carry-forward**는 한 projection에는 존재하지만 다른 projection에는 대응물이 없는 정보이다.

| Carry-forward 유형 | 존재하는 곳 | 부재하는 곳 | 예시 |
|---|---|---|---|
| NFR (성능, 확장성) | Code as-is, Policy | Experience | "응답 시간 < 200ms" — Prototype에서 보이지 않음 |
| 보안 (인증, 암호화) | Code as-is, Policy | Experience | "AES-256 정지 데이터 암호화" — Prototype에서 보이지 않음 |
| 마이그레이션 (데이터 변환) | Code as-is | Experience, Policy | "레거시 CHAR(1) 상태를 INT enum으로 마이그레이션" — 둘 다에서 보이지 않음 |
| 규제 컴플라이언스 | Policy | Experience | "데이터 보존 최대 3년" — Prototype에서 보이지 않음 |
| 운영 (모니터링, 스케일링) | Code as-is | Experience, Policy | "CPU 80%에서 Auto-scale" — 둘 다에서 보이지 않음 |

Three Projections 모델은 carry-forward를 구조적으로 자명하게 만든다: Experience projection 바깥이면서 Code 또는 Policy projection 안에 있는 정보의 집합이 정확히 carry-forward이다. Experience projection만 번역하면 불완전한 Code projection이 생성되기 때문에, carry-forward는 필수적이다.

Carry-forward 생명주기는 변경 없다. 생명주기 단계와 주입 규칙은 DDD 3 참조.

---

## 5. 재구성된 Translation

Sprint Kit에서 Translation은 Experience projection (to-be)를 Code projection (to-be)로 변환하며, Code projection (as-is)에 의해 제약된다:

```
translate(Experience_to_be, CP) → Code_to_be (partial)
  + carry-forward(Policy_to_be, Code_as_is non-Experience items)
  → Code_to_be (complete)
```

각 요소의 의미:
- `Experience_to_be` = JP2 승인 Prototype
- `CP` = Constraint Profile (Code_as_is에서 보존해야 할 패턴)
- `Policy_to_be` = Policy projection에서의 carry-forward 항목
- `Code_as_is non-Experience items` = 기존 Code projection에서의 carry-forward 항목 (NFR, 보안, 운영)

Translation 규칙은 변경 없다. 매핑 테이블은 DDD 3 참조.

---

## 6. 재구성된 Delta

Delta는 Code projection의 두 상태 간 차이이다:

```
Delta = Code_to_be − Code_as_is
```

각 delta 항목은 Code projection에서의 변경이다. Delta 유형(positive, modification, negative, zero)과 delta manifest 형식은 변경 없다. Delta 분류는 DDD 4 참조.

각 projection은 동일한 기저 delta에 대한 자체 관점을 제공한다:
- **Code 관점**: 추가/수정/제거할 API 엔드포인트, 마이그레이션할 DB 컬럼, 갱신할 상태 기계
- **Policy 관점**: delta가 충족해야 할 컴플라이언스 규칙, 변경에 대한 규제 제약
- **Experience 관점**: 변경되는 화면, 추가/제거되는 흐름, 달라지는 상호작용

이것은 세 개의 별도 delta가 아니다 — 단일 delta에 대한 세 가지 관점이다.

---

## 7. 개발 로드맵으로서의 Projection Metadata

각 projection의 **metadata** — projection 내용에 대한 구조화된 정보 — 는 Sprint Kit가 추론할 수 있는 범위를 정의한다. Metadata의 완전성이 Sprint 품질의 상한선이다: Sprint Kit는 관측할 수 없는 측면에 대해서는 specs를 생성할 수 없다.

### 현재 Metadata 커버리지

| Projection | Metadata 출처 | 현재 커버리지 | 갭 |
|---|---|---|---|
| **Code** | Brownfield 스캔 (L1-L4), Constraint Profile (CP.1-CP.7), `--add-dir`, tarball | 백엔드 코드에 대해 높음; 인프라/운영은 낮음 | Infrastructure-as-code, CI/CD 파이프라인, 모니터링 설정 |
| **Policy** | `policy_docs` 필드, PCP (PCP.1-PCP.5) | 부분적 — 명시적 정책 문서가 필요함 | 문서화되지 않은 암묵적 정책, 교차 규제 상호작용 |
| **Experience** | Prototype (preview/), key-flows.md, Figma (MCP) | UI 기반 시스템에 대해 높음 | 비시각적 사용자 유형(API 소비자, 데이터 파이프라인)은 Prototype 충실도가 낮음 |

### Source Role과 Projection의 대응

brief-template.md 프론트매터에 선언된 source role은 projection에 직접 대응한다:

| Source Role | 주 Projection | 부 Projection |
|---|---|---|
| `backend` | Code | — |
| `client` | Code + Experience | — |
| `code` | Code + Experience | — |
| `ontology` | Code (L1 용어) | Experience (UI 레이블) |
| `design-system` | Experience (UI 패턴) | Code (컴포넌트 구조) |
| `policy` | Policy | — |
| `svc-map` | Experience (흐름) | Code (서비스 경계) |
| `figma` | Experience (디자인) | — |

---

## 8. 기존 문서와의 관계

| 문서 | 역할 | 다루는 내용 |
|---|---|---|
| **이 문서** | 개념적 기반 | Sprint Kit가 서비스를 모델링하는 방식: canonical definition, 3 projections, Convergence |
| [`delta-driven-design.md`](delta-driven-design.md) | 설계 이론 | Translation 규칙, delta 유형, carry-forward 생명주기, FP/DJ 원칙, 방법론 비교 |
| [`judgment-driven-development.md`](judgment-driven-development.md) | 설계 철학 | 인간 판단이 중요한 이유, JP 설계, 산출물 매개체론, 재생성 원칙 |
| [`translation-ontology.md`](translation-ontology.md) | 가설 체계 | 모델이 의존하는 가정, 도출 경로, 반증 가능성 조건 |
| [`blueprint.md`](blueprint.md) | 제품 명세 | 사용자를 위한 전체 제품 기술: 섹션, 흐름, 설정 |
| [`terminology-map.md`](terminology-map.md) | 용어 참조 | 한영 정규 용어 대응 |

이 문서는 Translation 규칙, delta 유형, carry-forward 생명주기를 재정의하지 **않는다** — 그것들은 DDD에 속한다. 이 문서는 이러한 메커니즘이 임의적이 아니라 구조적으로 동기부여된 것임을 보여주는 개념적 프레임을 제공한다.
