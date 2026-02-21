---
description: "확정된 프로토타입으로부터 모든 산출물을 조정(reconcile)"
---

<!-- Quick Map
  목적: 확정된 프로토타입 → reconciled/ 산출물 세트
  디스패치: 직접 실행 (BMad 에이전트 + @deliverable-generator 조율)
  입력: $ARGUMENTS (feature-name)
  주요 단계: 사전조건 → 의사결정 컨텍스트 → 분석 → 기획 산출물 조정 → 명세 생성 → 인도물 조정 → 검증 → 요약
  경로: 모든 경로 (Sprint, Guided, Direct)
-->

# /crystallize — 프로토타입 우선 산출물 조정

> **디스패치**: 직접 실행 (서브 에이전트를 순차적으로 조율)
> **경로**: 모든 경로 (Sprint, Guided, Direct)

## 목적

JP2에서 승인된 프로토타입을 개발 문법으로 번역하고, 목표 상태와 Brownfield 기준선 간의 델타를 산출합니다. 실행을 위한 확정 산출물 세트 + 델타 매니페스트가 담긴 `reconciled/` 디렉토리를 생성합니다.

이 단계는 /parallel 이전의 **필수 단계**입니다 — 번역 없이는 Worker가 승인된 프로토타입의 델타 대신 JP2 이전 명세를 구현하게 됩니다. 프로토타입은 제품 동작의 진실 공급원(Source of Truth)입니다. 기존 산출물은 그대로 보존됩니다.

## 사용 시점

- **자동**: 모든 경로에서 JP2 승인 후 실행 — Sprint ([A] Approve & Build), Guided/Direct (`/preview` 3단계에서 [A] Approve & Build)
- **단독 실행**: `/crystallize feature-name` — 번역을 독립적으로 재실행할 때

**Crystallize 실패 시**: 게이트(S2-G, S3-G, S5)가 실패하고 자동 수정이 불가능한 경우, 사용자에게 복구 옵션을 제공합니다:
- **[R] Return to JP2**: Crystallize를 중단하고 부분 완성된 reconciled/를 정리한 뒤, 추가 반복을 위해 JP2 메뉴로 복귀
- **[S] Skip Crystallize**: 원본 명세로 /parallel 진행 (specs_root=specs/{feature}/). 델타 매니페스트는 제공되지 않으며 경고가 표시됩니다.
- **[X] Exit**: Sprint 전체 중단. 모든 산출물은 보존됩니다.

## 입력

`$ARGUMENTS`: feature-name (필수)
- `/crystallize feature-name` — 대상 기능 지정

## 사전조건 검증

파이프라인 시작 전 다음을 확인합니다:

1. `specs/{feature}/preview/`가 존재하고 `src/`에 `.tsx` 파일이 최소 하나 이상 있는지 확인 (Glob: `specs/{feature}/preview/src/**/*.tsx`)
2. `specs/{feature}/planning-artifacts/`가 `prd.md`, `architecture.md`, `epics-and-stories.md`와 함께 존재하는지 확인 (3개 모두 필수)
3. 의사결정 기록 존재 여부 확인 (선택 사항 — 존재할 경우 S0 컨텍스트 강화):
   - `specs/{feature}/decision-diary.md` 또는 `specs/{feature}/jp2-review-log.md` 또는 `specs/{feature}/sprint-log.md`
   - 아무것도 없으면 S0을 건너뛰고 의사결정 컨텍스트 없이 S1 실행
   - 기록은 있으나 Decisions 테이블의 행이 0개인 경우(JP2가 Comment 없이 승인됨), S0도 건너뜀
4. `specs/{feature}/reconciled/`가 이미 존재하는 경우: 덮어쓰기 또는 중단 여부를 사용자에게 확인

검증 실패 시: 누락된 항목을 ({communication_language}로) 보고하고 중단합니다.

## 절차

jdd-sprint-guide.md의 언어 프로토콜에 따라 설정을 로드합니다.

### 단계 S0: 의사결정 컨텍스트 분석

코드를 분석하기 전에, JP2 의사결정 기록을 분석하여 프로토타입 수정 의도와 맥락을 파악합니다. 이를 통해 S1과 S2가 의도적인 비즈니스 결정과 구현 세부사항을 구분할 수 있습니다.

**진행 메시지**: `"[S0/8] JP2 의사결정 컨텍스트 분석 중..."`

1. `specs/{feature}/reconciled/` 디렉토리와 `reconciled/planning-artifacts/` 생성
2. 변경 불가 파일 복사:
   - `specs/{feature}/planning-artifacts/brownfield-context.md` → `reconciled/planning-artifacts/brownfield-context.md`
3. 의사결정 기록을 reconciled/에 복사 (존재하는 경우):
   - `specs/{feature}/decision-diary.md` → `reconciled/decision-diary.md`
   - 또는 `specs/{feature}/jp2-review-log.md` → `reconciled/jp2-review-log.md` (대체, 동등한 역할)
4. JP2 의사결정 기록 읽기:
   - 우선: `specs/{feature}/decision-diary.md` (존재하는 경우)
   - 대체: `specs/{feature}/jp2-review-log.md` (존재하는 경우, 동등한 역할)
   - 추가: `specs/{feature}/sprint-log.md`의 "JP Interactions" 섹션 (존재하는 경우)
5. 의사결정 컨텍스트 요약 작성 (Conductor가 직접 작성 — Task 없이 경량 합성):

`specs/{feature}/reconciled/decision-context.md`에 작성:

```markdown
# Decision Context: {feature_name}

## Route
{sprint / guided / direct} — {rich context / limited context}

## JP2 Modification Intent Summary
| # | Change | Intent | Business Decision | Affected Area |
|---|--------|--------|-------------------|---------------|

## Key Business Decisions
| ID | Decision | Rationale |
|----|----------|-----------|

## Context for Prototype Analysis
(자유 텍스트 요약: 코드에서 무엇을 살펴봐야 하는지, 어떤 변경이 의도적인 비즈니스 결정인지 vs 구현 조정인지)
```

의사결정 기록이 없으면 이 단계를 건너뛰고 의사결정 컨텍스트 없이 S1로 진행합니다. 기록이 최소한인 경우(Guided/Direct 경로), S0은 더 가벼운 컨텍스트 문서를 생성하며, 이 경우 프로토타입 분석(S1)의 비중이 더 높아집니다.

### 단계 S1: 프로토타입 분석

확정된 프로토타입 코드를 분석하여 구조화된 분석 문서를 작성합니다.

**진행 메시지**: `"[S1/8] 프로토타입 구조 분석 중..."`

프로토타입 분석기를 호출합니다:

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "Analyze the prototype at specs/{feature}/preview/src/.
    Use Glob to discover all .tsx and .ts files dynamically.
    Do NOT assume fixed file paths — discover them.

    Read every discovered file and extract a structured analysis.

    IMPORTANT: Write ALL output in {document_output_language}.

    {if decision-context.md exists}
    Decision context (read this FIRST to understand WHY changes were made):
      specs/{feature}/reconciled/decision-context.md
    Use this context to annotate business rules with their decision origin
    (e.g., 'Business Rule: 용어 변경 → D2 결정에 의한 의도적 선택').
    {end if}

    Output format — write to specs/{feature}/reconciled/prototype-analysis.md:

    # Prototype Analysis: {feature_name}

    ## Screen Inventory
    | Page | Route | Key Interactions | Data Dependencies |

    ## Component Inventory
    | Component | Props | Behavior | Used By |

    ## API Endpoint Inventory (from MSW handlers)
    | Method | Path | Request Schema | Response Schema | Business Rule |

    ## Data Model (from store + types)
    | Entity | Fields | Relationships | Constraints |

    ## User Flows (from navigation + page logic)
    1. {Flow Name}: step1 → step2 → ... → end_state

    Be exhaustive — every page, component, endpoint, entity, and flow must be captured."
```

### 단계 S2: 기획 산출물 조정

프로토타입 분석을 주요 입력으로, 기존 문서를 참고 자료로 삼아 PRD, 아키텍처, 에픽을 조정합니다.

**Product Brief는 제외** — 문제 공간을 정의하며, 프로토타입으로부터 도출할 수 없습니다.

**진행 메시지**: `"[S2/8] PRD 조정 중..."` → `"...아키텍처..."` → `"...에픽..."` → `"...교차 산출물 검증..."`

#### 조정 원칙

- **프로토타입에서 도출**: 화면, 기능, API 엔드포인트, 데이터 모델, 사용자 플로우 → FR, 컴포넌트 구조, API 설계
- **기존 문서에서 캐리포워드**: 시장 컨텍스트, 경쟁 분석, NFR, 보안 아키텍처, 배포 전략, 확장성, 모니터링, ADR
- **태깅**: 프로토타입에서 도출할 수 없는 항목에는 분류된 캐리포워드 태그 사용:
  - `[carry-forward:defined]` — 원본 문서에 완전히 명시되어 있으며 여전히 적용 가능한 것으로 확인됨
  - `[carry-forward:deferred]` — 언급되었으나 명시적으로 MVP 이후로 연기됨
  - `[carry-forward:new]` — 식별된 갭을 채우기 위해 조정 과정에서 추가됨
  - `[carry-forward]` — 분류가 불명확한 경우 (기본적으로 `defined`로 처리)

#### 출처 표기 태그

| 태그 | 의미 |
|-----|---------|
| `(source: PROTO, origin: BRIEF-N)` | 프로토타입에서 확인됨, 원래 Brief 문장 N에서 유래 |
| `(source: PROTO, origin: DD-N)` | 프로토타입에서 확인됨, decision-diary 항목 N에서 유래 |
| `(source: carry-forward, origin: BRIEF-N)` | 프로토타입에 없음, 기존 문서에서 캐리포워드, 원래 Brief에서 유래 |
| `(source: carry-forward)` | 프로토타입에 없음, 기존 문서에서 캐리포워드 (NFR, 보안 등) |

#### S2a: PRD 조정 (John)

```
Task(subagent_type: "general-purpose", model: "opus")
  prompt: "You are John, Product Manager. Read your persona at _bmad/bmm/agents/pm.md.
    Read the PRD format guide at _bmad/docs/prd-format-guide.md.

    IMPORTANT: Write ALL output in {document_output_language}.

    MODE: CRYSTALLIZE — reconcile PRD with finalized prototype.

    Primary input (what the product actually does):
      specs/{feature}/reconciled/prototype-analysis.md

    Decision context (understand WHY changes were made):
      specs/{feature}/reconciled/decision-context.md (if exists)

    Context reference (for content the prototype cannot supply):
      specs/{feature}/planning-artifacts/prd.md
      specs/{feature}/inputs/sprint-input.md (for brief_sentences, if exists)

    Output: Write to specs/{feature}/reconciled/planning-artifacts/prd.md

    Reconciliation rules:
    - Every capability visible in prototype → document as FR with source tag
    - Map each FR to brief_sentences where possible: (source: PROTO, origin: BRIEF-N)
    - Features from JP2 iteration: (source: PROTO, origin: DD-N) referencing decision-diary/decision-context entry
    - NFRs, success criteria, constraints → carry forward: (source: carry-forward)
    - Classify carry-forward items: [carry-forward:defined] for confirmed applicable items, [carry-forward:deferred] for explicitly post-MVP items, [carry-forward:new] for gap-filling additions
    - User journeys: reconstruct from prototype User Flows section
    - Detail level: MAXIMUM — this is the definitive PRD
    - Follow PRD format guide strictly (YAML frontmatter, section structure, FR quality criteria)"
```

#### S2b: 아키텍처 조정 (Winston)

```
Task(subagent_type: "general-purpose", model: "opus")
  prompt: "You are Winston, Architect. Read your persona at _bmad/bmm/agents/architect.md.

    IMPORTANT: Write ALL output in {document_output_language}.

    MODE: CRYSTALLIZE — reconcile Architecture with finalized prototype.

    Primary input:
      specs/{feature}/reconciled/prototype-analysis.md
      specs/{feature}/reconciled/planning-artifacts/prd.md (just written by S2a)

    Decision context (understand WHY design decisions were made):
      specs/{feature}/reconciled/decision-context.md (if exists)

    Context reference:
      specs/{feature}/planning-artifacts/architecture.md
      specs/{feature}/planning-artifacts/brownfield-context.md
      specs/{feature}/decision-log.md (if exists)

    Output: Write to specs/{feature}/reconciled/planning-artifacts/architecture.md

    Reconciliation rules:
    - Component architecture: derive from actual prototype component structure
    - API design: derive from actual MSW handlers in prototype analysis
    - Data model: derive from actual store/types in prototype analysis
    - Security, deployment, scaling, monitoring, infrastructure → classify as [carry-forward:defined], [carry-forward:deferred], or [carry-forward:new]
    - ADRs: preserve still-applicable originals, mark superseded ones, add new decisions from prototype
    - Detail level: MAXIMUM"
```

#### S2c: 에픽 조정 (John)

```
Task(subagent_type: "general-purpose", model: "opus")
  prompt: "You are John, Product Manager. Read your persona at _bmad/bmm/agents/pm.md.

    IMPORTANT: Write ALL output in {document_output_language}.

    MODE: CRYSTALLIZE — reconcile Epics with finalized prototype.

    Primary input:
      specs/{feature}/reconciled/planning-artifacts/prd.md
      specs/{feature}/reconciled/planning-artifacts/architecture.md
      specs/{feature}/reconciled/prototype-analysis.md (cross-reference)

    Context reference:
      specs/{feature}/planning-artifacts/epics-and-stories.md

    Output: Write to specs/{feature}/reconciled/planning-artifacts/epics-and-stories.md

    Reconciliation rules:
    - Stories should reflect actual prototype pages and features
    - AC should reference actual prototype component behavior
    - Maintain Epic → Story → AC hierarchy
    - Tag stories as new/existing-extension per brownfield context
    - Stories not visible in prototype (e.g., Growth Phase, security, monitoring): classify as [carry-forward:defined], [carry-forward:deferred], or [carry-forward:new]
    - Detail level: MAXIMUM"
```

#### S2-G: 교차 산출물 일관성 게이트

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "You are @scope-gate. Read your agent definition at .claude/agents/scope-gate.md.

    IMPORTANT: Write ALL output in {document_output_language}.

    Validate cross-artifact consistency of 3 reconciled planning artifacts:
    - specs/{feature}/reconciled/planning-artifacts/prd.md
    - specs/{feature}/reconciled/planning-artifacts/architecture.md
    - specs/{feature}/reconciled/planning-artifacts/epics-and-stories.md

    Cross-artifact checks:
    1. Every PRD FR maps to at least one Architecture component
    2. Every Architecture component maps to at least one Epic story
    3. Every PRD FR maps to at least one Epic story
    4. No orphan stories (stories without FR linkage)

    Output: PASS with summary, or FAIL with gap list."
```

**S2-G FAIL 시**: 갭 보고서를 재시도 프롬프트에 포함 → 갭에 책임 있는 에이전트를 재호출 ("Fix these specific inconsistencies: {gap_list}") → 1회 재시도 → 2차 실패: 사용자에게 갭 목록과 함께 수동 검토 권고.

### 단계 S3: 실행 명세 생성

조정된 기획 산출물로부터 Specs 4-파일을 생성합니다.

**진행 메시지**: `"[S3/8] 실행 명세 생성 중 (요구사항 + 설계 + 태스크)..."`

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "You are @deliverable-generator. Read and follow your agent definition at .claude/agents/deliverable-generator.md.

    IMPORTANT: Write ALL output in {document_output_language}.

    Generate specs in specs-only mode.
    planning_artifacts: specs/{feature}/reconciled/planning-artifacts/
    prototype_analysis_path: specs/{feature}/reconciled/prototype-analysis.md
    feature_name: reconciled
    output_base: specs/{feature}/
    mode: specs-only

    NOTE: output_base is specs/{feature}/ and feature_name is 'reconciled',
    so output files will be written to specs/{feature}/reconciled/ directory."
```

**S3 이후: Entropy/파일 소유권 재주석**

명세 생성 후:
1. 기존 `specs/{feature}/tasks.md`에서 Entropy Tolerance + 파일 소유권 패턴 읽기
2. 새로운 `reconciled/tasks.md` 태스크에 매핑:
   - Story ID (E{N}-S{M}) 기준으로 우선 매칭
   - 그 다음 파일 경로 중복으로 매칭
   - 매핑되지 않은 새 태스크: 기본값 Entropy "Medium", 파일 소유권 미할당
3. 매핑되지 않은 태스크가 있으면 사용자에게 보고 ({communication_language}로)

**Scope Gate**: reconciled/ 명세에 대해 `stage=spec`으로 @scope-gate 호출.

### 단계 S4: 인도물 조정

기존 인도물을 프로토타입과 대조하여 검증합니다. 필요한 경우 재생성합니다.

**진행 메시지**: `"[S4/8] API 명세 검증 중..."` → `"...BDD 시나리오 재생성 중..."` → ...

인도물 조정기를 호출합니다:

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "Reconcile deliverables for specs/{feature}/reconciled/.

    IMPORTANT: Write ALL output in {document_output_language}.

    ## Verify Phase
    Compare existing deliverables against prototype and reconciled PRD:

    1. api-spec.yaml: Read specs/{feature}/api-spec.yaml. Compare endpoints against
       specs/{feature}/reconciled/prototype-analysis.md 'API Endpoint Inventory'.
       If endpoints match (count + paths): copy to reconciled/.
       If mismatch: regenerate from prototype-analysis + reconciled PRD.

    2. schema.dbml: Read specs/{feature}/schema.dbml. Compare against
       prototype-analysis.md 'Data Model'. Copy or regenerate.

    3. api-sequences.md: Read specs/{feature}/api-sequences.md. Compare against
       reconciled api-spec. Copy or regenerate.

    ## Regenerate Phase (always regenerate — source documents changed)

    4. bdd-scenarios/: Regenerate from specs/{feature}/reconciled/planning-artifacts/prd.md
       acceptance criteria. Write to reconciled/bdd-scenarios/.

    5. key-flows.md: Regenerate from prototype-analysis User Flows +
       reconciled PRD user journeys. Write to reconciled/key-flows.md.

    6. traceability-matrix.md: Rebuild FR → Design → Task → BDD → API from
       ALL reconciled/ artifacts. Target: 0 gaps. Use canonical task IDs from
       reconciled/tasks.md (T-01, T-02, etc.). Write to reconciled/traceability-matrix.md.

    7. decision-log.md: Read specs/{feature}/decision-log.md (original ADRs).
       Merge with JP decisions from reconciled/decision-context.md.
       Mark superseded ADRs. Write to reconciled/decision-log.md."
```

8. adversarial-scenarios.md: `specs/{feature}/adversarial-scenarios.md`가 존재하면 `reconciled/adversarial-scenarios.md`로 복사합니다. `bdd-scenarios/adversarial-*.feature`의 적대적 BDD 기능 파일은 위의 항목 4(BDD 재생성)에 포함됩니다.

**Scope Gate**: reconciled/ 인도물에 대해 `stage=deliverables`로 @scope-gate 호출.

### 단계 S5: 교차 산출물 일관성 검사

전체 reconciled/ 산출물 세트에 걸쳐 상호 일관성을 검증합니다.

**진행 메시지**: `"[S5/8] 교차 산출물 일관성 검사 중..."`

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "Perform cross-artifact consistency verification on specs/{feature}/reconciled/.

    IMPORTANT: Write ALL output in {document_output_language}.

    Read ALL files in reconciled/ directory.
    Also read prototype MSW handlers (Glob: specs/{feature}/preview/src/mocks/**/*.ts).

    Verify:
    1. Every screen/component/API in prototype-analysis.md → has matching FR in prd.md
    2. Every FR in prd.md → reflected in requirements.md
    3. Every requirement in requirements.md → assigned in tasks.md
    4. traceability-matrix.md has 0 gaps
    5. api-spec.yaml endpoints match MSW handler endpoints (count + paths)
    6. bdd-scenarios/ cover all prd.md acceptance criteria

    Output: PASS (gap=0) or FAIL with gap list and count."
```

**FAIL 시**:
- 갭 <= 3개: 자동 수정 (영향받은 파일 편집) → 재검증
- 갭 > 3개: 사용자에게 갭 목록 제시 → 사용자가 선택: 수정 / 건너뜀 / 중단

### 단계 S5b: 델타 매니페스트 생성

reconciled/ 산출물과 Brownfield 기준선을 비교하여 모든 변경사항을 분류합니다.

**진행 메시지**: `"[S5b/8] 델타 매니페스트 생성 중..."`

**사전조건**: S5 완료 (PASS 또는 사용자 건너뜀). S5를 사용자가 건너뛴 경우, 매니페스트 헤더에 `consistency_verified: false` 포함.

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "Generate Delta Manifest comparing reconciled/ against brownfield baseline.

    IMPORTANT: Write ALL output in {document_output_language}.

    Input:
    - specs/{feature}/reconciled/requirements.md
    - specs/{feature}/reconciled/design.md
    - specs/{feature}/reconciled/api-spec.yaml
    - specs/{feature}/reconciled/schema.dbml
    - specs/{feature}/reconciled/tasks.md
    - specs/{feature}/planning-artifacts/brownfield-context.md (baseline)

    For each element (API endpoint, DB table/column, FR, state transition, scheduler):
    Compare target (reconciled/) vs baseline (brownfield). Classify:

    | delta_id | type | origin | source_fr | scope | resource | task_id |
    |----------|------|--------|-----------|-------|----------|---------|
    | DM-001 | positive | proto | FR-3 | api_endpoint | POST /api/v2/blocks | T-2 |
    | DM-002 | modification | proto | FR-1 | api_endpoint | GET /api/tutors (+block_count) | T-1 |
    | DM-003 | zero | — | — | api_endpoint | GET /api/lessons | — |
    | DM-004 | negative | proto | — | api_endpoint | DELETE /api/v1/block | T-8 |
    | DM-005 | positive | carry-forward:defined | NFR-1 | config | p95 < 500ms monitoring | — |

    Fields:
    - type: positive (new) | modification (changed) | zero (unchanged) | negative (removed)
    - origin: proto | carry-forward:defined | carry-forward:deferred | carry-forward:new
    - task_id: tasks.md reference (NULL for zero/carry-forward items)

    Greenfield (no brownfield data): classify all items as positive.

    Also scan brownfield-context.md for items NOT in reconciled/ → classify as zero delta.

    Summary:
    | Type | Count |
    |------|-------|
    | Positive | {N} |
    | Modification | {N} |
    | Negative | {N} |
    | Zero | {N} |
    | Carry-Forward ratio | {carry-forward count}/{total} ({%}) |

    Verify delta completeness before writing:
    - Every positive/modification item must have a non-null task_id referencing tasks.md
    - Every negative item must have task_id or explicit justification in resource column
    - Zero delta items must NOT have task_id (no unintended work on unchanged items)
    - carry-forward:deferred items must NOT have task_id (deferred = not this Sprint)
    If violations found, append WARN section to delta-manifest.md with violation list.

    Output: Write to specs/{feature}/reconciled/delta-manifest.md"
```

### 단계 S6: 요약 + 확인

조정 결과를 사용자에게 제시합니다 ({communication_language}로).

**진행 메시지**: `"[S6/8] 요약 생성 중..."`

**출력 형식**:

```
## Crystallize 완료

### 프로토타입의 주요 플로우
(prototype-analysis.md User Flows에서)
1. {플로우 1}: 단계 → 단계 → 종료
2. {플로우 2}: ...

### 플로우-산출물 매핑
| 주요 플로우 | PRD FR | 설계 섹션 | 태스크 | BDD 커버리지 | 상태 |
|----------|--------|-----------|------|------------|------|
| 플로우 1  | FR1,2  | 설계 §A   | T-1  | 시나리오 3개 | ✅  |

### 원본과의 변경 사항
- 프로토타입에서 확인된 기능: {N}개 (source: PROTO, origin: BRIEF-N)
- JP2 반복에서 추가된 기능: {N}개 (source: PROTO, origin: DD-N)
- 원본에서 캐리포워드: {N}개 (source: carry-forward)

### 델타 요약 (delta-manifest.md에서)
| 유형 | 개수 |
|------|-----|
| 양성 델타 (신규) | {N} |
| 수정 델타 (변경) | {N} |
| 음성 델타 (제거) | {N} |
| 영 델타 (미변경) | {N} |
| Carry-Forward 비율 | {carry-forward}/{total} ({%}) |

### 검증
- 교차 산출물 일관성: PASS (갭 0)
- 추적성 커버리지: {N}/{M} FR 완전 추적

### reconciled/ 생성됨 ({N}개 파일)

선택: [C] /parallel로 계속 | [R] reconciled/ 검토 | [X] 종료
```

**[C]**: `specs_root=specs/{feature}/reconciled/`로 `/parallel` 진행
**[R]**: reconciled/ 파일 목록 표시, 특정 파일 열람 허용 후 메뉴로 복귀
**[X]**: 종료 (reconciled/ 보존)

## 예산

10개의 Task 호출에 걸쳐 약 90~133턴. S0은 인라인으로 실행 (Task 호출 없음).

| 단계 | 모델 | 예상 턴 수 |
|------|-------|-----------|
| S0 의사결정 컨텍스트 | Conductor (인라인) | 0 (Task 없음) |
| S1 프로토타입 분석 | sonnet | 5-8 |
| S2a PRD | opus | 15-20 |
| S2b 아키텍처 | opus | 15-20 |
| S2c 에픽 | opus | 10-15 |
| S2-G 교차 산출물 | sonnet | 5-8 |
| S3 명세 + S3-G | sonnet | 18-25 |
| S4 인도물 | sonnet | 10-15 |
| S5 일관성 | sonnet | 5-8 |
| S5b 델타 매니페스트 | sonnet | 5-8 |

## 출력물

```
specs/{feature}/reconciled/
├── decision-context.md             # S0 (의사결정 기록이 있는 경우)
├── prototype-analysis.md           # S1
├── planning-artifacts/
│   ├── prd.md
│   ├── architecture.md
│   ├── epics-and-stories.md
│   └── brownfield-context.md
├── entity-dictionary.md            # S3
├── requirements.md
├── design.md
├── tasks.md
├── api-spec.yaml                   # S4
├── api-sequences.md
├── schema.dbml
├── bdd-scenarios/
├── key-flows.md
├── traceability-matrix.md
├── decision-log.md
└── decision-diary.md               # (상위 디렉토리에 존재하는 경우)
```

## 제약 사항

1. **프로토타입은 변경 불가**: Crystallize 중에는 preview/를 수정하지 않습니다
2. **원본 산출물은 변경 불가**: specs/{feature}/ 파일(reconciled/ 외부)은 수정하지 않습니다
3. **Product Brief 제외**: Product Brief는 문제 공간을 정의하며 프로토타입으로부터 조정할 수 없습니다
4. **Brownfield 재수집 안 함**: brownfield-context.md는 그대로 복사됩니다 (JP2 반복은 제품 설계를 변경하지, 기존 시스템 현황을 변경하지 않습니다)
