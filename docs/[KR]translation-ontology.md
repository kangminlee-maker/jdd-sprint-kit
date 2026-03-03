# Translation Ontology (번역 존재론)

> **문서 유형**: Unified framing — Sprint Kit 핵심 문서의 철학적 기반
> **Version**: 1.0
> **Date**: 2026-02-22
> **관련 문서**: [`judgment-driven-development.md`](judgment-driven-development.md) (설계 철학), [`delta-driven-design.md`](delta-driven-design.md) (설계 이론), [`blueprint.md`](blueprint.md) (제품 명세), [`terminology-map.md`](terminology-map.md) (용어 참조)
> **향후 로드맵**: [`reviews/translation-ontology-roadmap.md`](reviews/translation-ontology-roadmap.md)

---

## 1. Foundational Perspective (기초 관점)

**"Sprint Kit의 핵심 작동(Crystallize)은 user grammar(사용자 문법)에서 development grammar(개발 문법)로의 번역이다. 번역의 방향은 오직 인간만이 설정할 수 있다."**

이 선언은 두 부분으로 분해된다:

| 부분 | 성격 | 본질 |
|------|------|------|
| **A1 — Ontological(존재론적)**: "핵심 작동은 번역이다" | Sprint Kit이 *하는 것* | user grammar와 development grammar 사이에 규칙 기반 매핑이 존재하며, Crystallize가 이 매핑을 실행한다 |
| **A2 — Axiological(가치론적)**: "방향은 오직 인간만이 설정할 수 있다" | Sprint Kit이 *인간을 필요로 하는 이유* | 무엇을 번역할 것인가(대상이 무엇이어야 하는가)라는 결정은 기계적으로 도출될 수 없다 |

A1으로부터 Delta-Driven Design이 도출된다 — 번역이 핵심 작동이라면, delta(델타)는 번역의 자연스러운 출력물이다.
A2로부터 Judgment-Driven Development가 도출된다 — 인간이 방향을 설정한다면, JP(Judgment Point, 판단 지점)는 필수적이다.

### Scope Delimitation (범위 한정)

"번역" 프레이밍이 가장 직접적으로 적용되는 것은 Crystallize이다. Sprint Kit의 전체 파이프라인에는 번역이 아닌 활동이 포함된다:

| 단계 | 활동 | 번역과의 관계 |
|------|------|---------------|
| Phase 1 (Answer Discovery) | 솔루션 공간 탐색, PRD 생성, Architecture 결정 | 번역이 아니다 — **무엇을 번역할지 탐색하는 과정** |
| Phase 2 (Crystallize) | user grammar → development grammar 변환, delta 추출 | **번역 그 자체** |
| Phase 3 (Execution) | Delta 구현, 코드 생성 | 번역이 아니다 — **번역 결과의 실현** |

따라서, "소프트웨어는 번역이다"라는 주장이 아니라 — **"Sprint Kit의 핵심 작동은 번역이다"**가 정확한 선언이다. Phase 1(탐색)과 Phase 3(실행)은 번역을 둘러싼 맥락이지, 번역 자체가 아니다.

---

## 2. Hypothesis System (가설 체계)

기초 관점은 공리가 아니다. 여러 숨겨진 가설 위에 서 있으며, 이 가설이 깨지면 기초 관점의 타당성이 변한다. 이를 명시적으로 드러낸다.

### 2.1 Foundational Perspective (A1 + A2)

| ID | 선언 | 성격 |
|----|------|------|
| **A1** | Sprint Kit의 핵심 작동은 user grammar에서 development grammar로의 번역이다 | 존재론적 |
| **A2** | 번역의 방향(무엇을 번역할 것인가)은 오직 인간만이 설정할 수 있다 | 가치론적 |

### 2.2 Auxiliary Hypotheses (보조 가설, H1-H4)

A1과 A2가 성립하기 위해 필요한 구조적 가설이다. Sprint Kit의 설계가 올바르게 기능하기 위한 조건이다.

| ID | 가설 | 근거 | 파괴 조건 |
|----|------|------|-----------|
| **H1** | user grammar와 development grammar는 분리 가능하다 | 시스템의 사용자와 구현자가 서로 다른 표현 체계를 사용한다 | 사용자가 곧 개발자인 경우 (개발자 도구, CLI 등) |
| **H2** | 두 문법 사이에 결정론적 매핑 규칙이 존재한다 | Translation Rules 테이블은 유한하고 열거 가능하다 | 매핑이 본질적으로 창발적이어서 규칙화할 수 없는 경우 |
| **H3** | 사용자는 자신의 문법으로만 정확성을 검증할 수 있다 | 제품 전문가는 스펙이 아닌 프로토타입을 통해 판단한다 | 사용자가 development grammar를 구사할 수 있는 경우 |
| **H4** | 번역 과정에서 손실된 정보(carry-forward)는 별도 소스에서 복구할 수 있다 | NFR, 보안, 마이그레이션 등은 PRD, Architecture, Brownfield에서 주입된다 | carry-forward 소스 자체가 불완전하거나 접근 불가능한 경우 |

### 2.3 Empirical Hypotheses (경험적 가설, H5-H7)

Sprint Kit의 경제 원리가 성립하기 위해 필요한 경험적 조건이다. 현재 기술 수준에서 관찰된 사실이며, 기술 발전에 따라 변할 수 있다.

| ID | 가설 | 현재 상태 | 변동성 |
|----|------|-----------|--------|
| **H5** | AI 생성 품질이 "검토할 가치가 있는" 수준이다 | 참 (2024-2026 LLM 기준) | AI가 퇴보하면 깨진다 |
| **H6** | 사전 입력이 실제로 생성 품질을 개선한다 | 관찰됨 (Grade A vs C Brief 차이) | 입력 무관 모델이 등장하면 약화된다 |
| **H7** | AI 재생성 비용이 "감당 가능한" 수준이다 (5-15분/사이클) | 참 (현재 기준) | 비용이 급등하면 깨진다; 비용이 ~0으로 하락하면 JP1이 불필요해진다 |

H7은 특히 중요하다. 재생성 비용이 충분히 하락하면(≈ 0), JP1의 존재 이유가 사라진다 — Brief에서 곧바로 JP2로 갈 수 있다. 반대로 비용이 급등하면, "일회용 처리"가 불가능해지고 시스템이 패치 기반 수정으로 퇴행한다.

### Significance of Hypothesis Categorization (가설 범주화의 의의)

| 범주 | 가설 | 의존하는 원칙 |
|------|------|---------------|
| **논리적 필연** | A1, A2, H1, H2, H3, H4 | DDD, JDD, FP1-FP6 |
| **기술 의존** | H5, H6, H7 | 비용 공식, JP1 존재, 재생성 기본 원칙 |

기술 의존 가설이 깨지더라도, 논리적 구조(두 문법, 번역, 판단의 필요성)는 유효하다. 실현 방법만 변한다.

---

## 3. Derivation Structure (도출 구조, 5-Layer)

기초 관점에서 Sprint Kit의 원칙, 설계 판단, 구현에 이르는 도출 경로를 5개 층위로 정리한다.

| 층위 | 이름 | 내용 | 예시 |
|------|------|------|------|
| **L1** | Foundational Perspective | A1 + A2 | "핵심 작동은 번역이다. 인간이 방향을 설정한다." |
| **L2** | Hypotheses | H1-H7 | "두 문법은 분리 가능하다", "AI 생성은 검토할 가치가 있다" |
| **L3** | Core Principles | FP1-FP6 | "인간의 판단이 유일하게 지속되는 자산이다", "번역은 규칙 기반이다" |
| **L4** | Design Judgments | DJ1-DJ10, JDD 설계 판단 | "design.md 확장", "carry-forward 수명 주기 관리" |
| **L5** | Implementation Re-description | 파이프라인, 산출물, 도구 | Crystallize, Delta Manifest, Translation Rules |

### L5에 대한 참고

L5는 기존 구현의 **재기술**이다. Translation Ontology는 새로운 구현을 추가하지 않는다 — 기존 파이프라인이 이미 수행하고 있는 작동을 번역 프레이밍을 통해 재해석한다. 이 재해석은 "구조적 유사성"이다. 수학적 대응(미적분, 투영)은 동형이 아닌 유사성으로서 유효하다 — 완전한 수학적 동치를 주장하지 않으면서 동일한 작동을 다른 언어로 기술하는 것이다.

---

## 4. Derivation Paths (도출 경로)

### 4.1 JDD Derivation (A2 → FP1 → Medium(H7) → JP)

```
A2: 방향은 오직 인간만이 설정할 수 있다
  → FP1: 인간의 판단이 유일하게 지속되는 자산이다
    → H7: 재생성 비용이 감당 가능하다
      → 설계 판단: 산출물은 일회용이며 재생성 가능하다
        → H3: 사용자는 자신의 문법으로만 정확성을 검증할 수 있다
          → 매체로서의 산출물: 구체적 결과물 위에서 판단한다
            → JP1 (방향 검증) + JP2 (대상 검증)
```

**JP1의 고유 기능 — 방향 검증**:

JP1은 단순히 "AI가 느리니까 중간에 확인하자"가 아니다. JP1은 JP2가 대체할 수 없는 고유한 기능을 가진다:

| 검증 유형 | JP1 (Direction Validation) | JP2 (Target Validation) |
|-----------|---------------------------|------------------------|
| "빠진 시나리오가 있는가?" | **필수** — 프로토타입에 없는 것은 보이지 않는다 | 부분적 — 존재하는 것만 검증할 수 있다 |
| "우선순위가 맞는가?" | **필수** — 요구사항 수준에서만 판단 가능하다 | 불가능 — 프로토타입은 우선순위를 표현하지 않는다 |
| "이 시나리오가 실제 고객과 맞는가?" | **필수** — 고객 여정 내러티브로 제시된다 | 부분적 — 구현된 것만 경험할 수 있다 |
| "화면 레이아웃이 자연스러운가?" | 불가능 — 텍스트 수준에 머문다 | **필수** — 직접 경험으로 판단한다 |
| "기능이 기대대로 작동하는가?" | 불가능 — 기술 스펙 수준이다 | **필수** — 직접 조작으로 판단한다 |

따라서, AI 속도가 무한히 빨라지더라도 JP1이 완전히 사라지지는 않을 수 있다. 형태가 변할 수는 있다 — 예를 들어, 프로토타입과 함께 요구사항 체크리스트를 제시하는 방식으로.

### 4.2 DDD Derivation (A1+H1+H2 → 2-Grammar → FP6(H4) → FP4)

```
A1: 핵심 작동은 번역이다
  + H1: 두 문법은 분리 가능하다
  + H2: 결정론적 매핑 규칙이 존재한다
    → 2-Grammar Model: User Grammar ↔ Development Grammar
      + H4: 손실된 정보는 별도 소스에서 복구 가능하다
        → FP6: 번역은 규칙 기반이다
          → Complete Specs = translate(Prototype) + carry-forward
            → FP4: Delta 정의가 주된 목표이다
              → Delta = Complete Specs - Brownfield
```

**FP6 Multi-Input Structure (다중 입력 구조)**:

번역 입력은 프로토타입만이 아니다. 완전한 번역은 세 가지 입력을 결합한다:

| 입력 | 역할 | 출처 |
|------|------|------|
| **Prototype** | user grammar로 표현된 목표 상태 | JP2 승인 |
| **Carry-forward sources** | 비가시적 요구사항 (NFR, 보안, 마이그레이션) | PRD, Architecture, Brownfield |
| **Brownfield baseline** | 현재 시스템 상태 | brownfield-context.md L1-L4 |

```
translate(Prototype, CarryForwardSources, Brownfield)
  = translate(Prototype) + carry-forward(PRD, Architecture, Brownfield) - Brownfield
  = Delta
```

세 가지 입력 중 하나라도 누락되면 번역은 불완전하다:
- Prototype 없이: 번역 대상이 없다
- carry-forward 없이: 적분 상수가 누락된다 (비가시적 요구사항이 손실된다)
- Brownfield 없이: delta를 계산할 수 없다 (Greenfield의 경우 ∅로 퇴화한다)

### 4.3 Economic Principles Derivation (H5+H6 → 입력 품질, 재생성, 비용)

```
H5: AI 생성은 검토할 가치가 있다
  + H6: 사전 입력이 품질을 개선한다
    → 입력이 사이클을 줄인다
      + H7: 재생성 비용이 감당 가능하다
        → 수정보다 재생성이 우선이다 (FP5)
          → 비용 공식: C_total = C_input + C_gen × N_gen + C_judge × N_judge + C_carry + C_brownfield
```

경제 원리는 전적으로 경험적 가설(H5-H7)에 의존한다. 이것이 변하면:
- H5가 깨지면 → 산출물이 검토할 가치가 없다 → 전체 시스템이 기능하지 못한다
- H6가 깨지면 → inputs/가 무의미해진다 → 순수 반복 모델로 전환된다
- H7이 급락하면 → 재생성 비용 ≈ 0 → JP1 불필요, Brief → JP2 직행

---

## 5. Document Relationships and Structural Positions (문서 관계와 구조적 위치)

### 4-Document Responsibility Matrix (4문서 책임 매트릭스)

| 관심사 | JDD | DDD | Blueprint | Translation Ontology |
|--------|-----|-----|-----------|---------------------|
| **왜 인간의 판단이 필요한가** | 주 담당 | - | 요약 | 도출 경로 |
| **두 문법과 번역이란 무엇인가** | 참조 | 주 담당 | 요약 | 가설 구조 |
| **파이프라인은 어떻게 작동하는가** | - | 주 담당 | 주 담당 | 재기술 |
| **사용자는 무엇을 하는가** | 요약 | - | 주 담당 | - |
| **원칙은 어디서 오는가** | 선언 | 선언 | 선언 | **도출 경로** |
| **가설이 깨지면 무엇이 변하는가** | - | - | 리스크 모델 | **가설 체계** |

Translation Ontology는 다른 문서의 내용을 **반복하지 않는다**. 이 문서의 역할은 각 문서가 선언하는 원칙이 어디서 도출되는지, 그리고 그 원칙이 어떤 가설 위에 서 있는지를 드러내는 것이다.

### Sprint Kit과 BMad의 관계

**현재 상태**: Sprint Kit은 BMad Method를 활용하며 현재 BMad에 의존하고 있다.

구체적 의존 지점:
- `auto-sprint.md`: BMad 에이전트 경로 하드코딩 (Mary, John, Winston)
- `crystallize.md`: BMad 에이전트 경로 하드코딩 (John, Winston)
- `jdd-sprint-protocol.md`: `_bmad/docs/prd-format-guide.md` 필수 참조
- 포맷 가이드: BMad 내부에 위치 (`_bmad/docs/`)

**이론적 구조**: Sprint Kit의 논리적 핵심(번역, delta, 판단)은 BMad에 의존하지 않는다. BMad가 담당하는 것은 "Answer Discovery" 단계(Phase 1)의 탐색 품질이며, 이는 다른 프레임워크(GSD 등)로 대체 가능하다. 접점은 산출물 포맷 계약(`planning-artifacts/` 디렉토리)이다.

**분리 로드맵**: [`reviews/translation-ontology-roadmap.md`](reviews/translation-ontology-roadmap.md) §1 참조.

---

## 6. Corrections (교정 사항)

Translation Ontology 논의 과정에서, 기존 문서에 교정이 필요한 항목이 발견되었다.

### 6.1 JP1: 고유 기능으로서의 방향 검증

**기존 기술**: "JP2가 본질적 판단 지점이며; JP1은 현재 기술적 한계를 위한 실용적 보충이다."

**교정**: JP1은 JP2가 대체할 수 없는 고유한 **방향 검증** 기능을 가진다. 프로토타입에 존재하지 않는 누락 시나리오를 감지하는 것, 요구사항 수준에서 우선순위를 판단하는 것, 고객 여정과의 정합성을 확인하는 것은 JP2에서 수행할 수 없다. JP1은 실용적 보충인 동시에 방향 검증이라는 고유한 역할을 가진다.

**교정 범위**: JDD, Blueprint. (§4.1 JP1 표 참조)

### 6.2 FP6: 다중 입력 번역 규칙

**기존 기술**: 번역 입력이 프로토타입만인 것처럼 기술되었다.

**교정**: 완전한 번역은 세 가지 입력을 결합한다: prototype, carry-forward sources, Brownfield baseline. 프로토타입만으로는 적분 상수(carry-forward)가 누락되어 번역이 불완전하다. (§4.2 FP6 다중 입력 구조 참조)

**교정 범위**: DDD FP6 — 다중 입력 구조 설명 추가.

### 6.3 Regeneration: 출처 기반 기준

**기존 기술**: 재생성 범위가 "피드백 크기"로만 결정되는 것으로 기술되었다.

**교정**: 재생성 범위는 피드백의 **출처**에 의해 더 정밀하게 결정된다:

| 피드백 출처 | 의미 | 재생성 범위 |
|-------------|------|-------------|
| 사용자의 원래 입력에 이미 존재한다 | 번역/생성 오류 | 해당 단계만 재생성 |
| 사용자 입력에는 없으나 추론 가능하다 | AI 추론 누락 | 해당 단계 + 하류 재생성 |
| 사용자 입력에 전혀 없다 — 새로운 요구사항이다 | 새로운 입력 | Brief 편집, 파이프라인 재시작 |

출처 기반 분류는 더 정밀한 재생성 비용 추정을 가능하게 한다.

**교정 범위**: JDD "Regeneration Over Modification" 섹션.

### 6.4 Cost Formula Refinement (비용 공식 정밀화)

**기존 기술**: `Total cost = (사전 입력 비용) + (생성 비용 × 생성 횟수) + (판단 비용 × 판단 횟수)`

**교정**: 3항 공식은 직관적이지만 carry-forward 비용과 Brownfield 수집 비용을 누락한다:

```
C_total = C_input + C_gen × N_gen + C_judge × N_judge + C_carry + C_brownfield
```

| 항 | 의미 | 절감 방법 |
|----|------|-----------|
| C_input | 사전 입력 수집/준비 비용 | 기존 자료 활용 |
| C_gen × N_gen | AI 생성 비용 × 반복 횟수 | C_input ↑ → N_gen ↓ |
| C_judge × N_judge | 판단 비용 × 판단 횟수 | C_input ↑ → N_judge ↓ |
| C_carry | carry-forward 등록/검증 비용 | 구조화된 PRD/Architecture |
| C_brownfield | Brownfield 수집/파싱 비용 | MCP/`--add-dir` 자동 수집 |

3항 공식은 사용자 대상 설명에 충분하다. 5항 공식은 내부 시스템 최적화에 사용한다.

**교정 범위**: Blueprint S4.4 — 5항 공식 병기.

### 6.5 BMad: "Extension Pack" → "Utilizes" (현재 의존성 인정)

**기존 기술**: "Sprint Kit = BMad 실행 확장 팩", "BMad는 기반 플랫폼이다"

**교정**: "확장 팩"은 Sprint Kit이 BMad의 설계에 맞추어 만들어진 것을 암시한다. 실제로는 Sprint Kit이 BMad를 **활용**하면서 논리적 핵심(번역, delta, 판단)은 BMad에 의존하지 않는다. 현재 구현은 BMad에 의존하고 있으며, 이 의존성을 분리하는 것은 향후 과제이다.

- "BMad 실행 확장 팩" → "BMad Method를 활용한다"
- "BMad는 기반 플랫폼이다" → "현재 BMad에 의존; 분리는 로드맵 참조"

**교정 범위**: JDD, Blueprint.

---

## 7. Limitations and Open Questions (한계와 미해결 질문)

### 7.1 "번역"으로 설명되지 않는 활동

Sprint Kit의 파이프라인에는 번역 프레이밍으로 포착되지 않는 활동이 포함된다:

- **탐색 (Phase 1)**: PRD 생성, Architecture 결정은 "무엇을 번역할지 찾는" 활동이지, 번역 자체가 아니다. BMad 에이전트 퍼실리테이션, Party Mode 분석 등은 번역과 무관한 발견 과정이다.
- **구현 (Phase 3)**: Worker가 delta를 코드로 변환하는 것은 번역이라기보다 "실현"이다. 코드 생성은 번역 규칙 너머의 구현 판단(라이브러리 선택, 성능 최적화 등)을 필요로 한다.
- **검증 (Validate)**: Judge 에이전트의 품질/보안/비즈니스 검증은 번역 정확성 검증이 아닌 독립적 품질 보증이다.

### 7.2 "두 문법" 대 "N-Projection"의 존재론적 모호성

DDD §5는 "2-grammar 모델은 계층적 N-projection 모델의 특수한 경우이다"라고 기술한다. 이는 존재론적 질문을 제기한다:

- **실제로 2개인가, N개인가?** 2-grammar 모델이 실용적 단순화인지 본질적 구분인지 불명확하다.
- **계층은 고정되어 있는가?** "고객 투영 = 목적 함수, 나머지 = 제약 조건"이 모든 시스템에 적용되는가? (보안이 목적 함수인 시스템은 어떤가?)
- **투영 간 상호작용**: N-projection 모델에서, 각 투영의 carry-forward를 독립적으로 관리할 수 있는가, 아니면 투영 간 상호작용이 존재하는가?

현재 Sprint Kit은 2-grammar 모델로 충분히 작동한다. N-projection 확장은 이론적 가능성으로 남아 있다.

### 7.3 경험적 가설(H5-H7)의 검증 상태

| 가설 | 검증 방법 | 현재 데이터 |
|------|-----------|-------------|
| H5 (AI 검토 가치) | JP1/JP2 Comment 비율 | 제한적 — Sprint 관찰 사례 적음 |
| H6 (입력이 품질을 개선) | Grade A vs C Brief 비교 | 정성적 관찰만 존재 |
| H7 (재생성 비용 감당 가능) | 사이클 시간 측정 | 5-15분/사이클 (현재 관찰) |

이 가설의 체계적 검증에는 실제 Sprint Kit 사용의 축적이 필요하다.

---

## Appendix: Derivation Process (부록: 도출 과정)

### Discussion History (논의 이력)

Translation Ontology는 DDD 수학적 프레이밍(§5) 논의에서 파생된 메타 분석으로부터 등장했다. 4개 핵심 문서(JDD, DDD, Blueprint, Terminology Map)를 관통하는 통합 프레이밍을 찾는 과정에서 발견되었다.

주요 논의 단계:
1. **통합 시도**: 4개 문서의 원칙을 공통 기반에서 도출할 수 있는가?
2. **"번역" 프레이밍 발견**: Crystallize의 본질이 문법 간 번역임을 인식
3. **공리 체계 시도**: "소프트웨어는 번역이다"를 공리로 설정하려는 시도
4. **Party Mode 삼중 검증**: 논리학자, 편집자, Devil's Advocate에 의한 검증
5. **교정 후 최종화**: 과대 주장 교정 → 기초 관점 + 가설 체계로 재구조화

### Party Mode Verification Results (Party Mode 검증 결과)

세 명의 검토자가 초안을 검토하고 다음과 같은 교정을 수행했다:

| 초기 주장 | 교정 | 검토자 | 이유 |
|-----------|------|--------|------|
| "공리" | "기초 관점" | 논리학자 | 숨겨진 가설 H1-H7이 존재하므로 공리가 아니다 |
| "소프트웨어는 번역이다" | "Crystallize가 번역이다" | Devil's Advocate | Phase 1(탐색)과 Phase 3(실행)은 번역이 아니다 |
| "구조적 동형" | "구조적 유사성" | 논리학자 | 완전한 수학적 동치를 주장할 근거가 불충분하다 |
| QUERY-N/TECH-N 설계 포함 | 로드맵으로 분리 | 편집자 | 미구현 설계를 본문에 포함하면 혼란을 야기한다 |
| BMad 분리 계획 포함 | 로드맵으로 분리 | 편집자 | 현재 상태 기술과 향후 과제를 분리한다 |

이 교정 사항은 이 문서의 §1-§7에 반영되었다.
