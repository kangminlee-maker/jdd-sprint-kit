---
description: "BMad 산출물에서 Specs 4-file 생성 (Brownfield L4 + Entity Dictionary)"
---

# /specs — Specs Generation

> **Dispatch Target**: `@brownfield-scanner` (L4) + `@deliverable-generator` (specs-only)

## Purpose

BMad 산출물에서 Specs 4-file을 생성한다.

## When to Use

BMad Phase 3 산출물이 준비되어 Implementation Readiness를 통과한 후.

## Inputs

`$ARGUMENTS`: feature-name (kebab-case, 선택)
- `/specs feature-name` — feature 이름 지정
- `/specs` (인자 없음) — BMad 산출물 자동 탐색 + feature-name 제안

## Procedure

### Step 0: Feature 디렉토리 + 산출물 탐색

#### Step 0a: Feature Name 결정

1. `$ARGUMENTS` 파싱:
   - **feature-name 제공됨** → `feature = $ARGUMENTS`, 검증 후 Step 0b로
   - **인자 없음** → Auto-detect (아래)

2. **Auto-detect** (인자 없음 시):
   a. `_bmad-output/planning-artifacts/prd.md` 존재 확인
   b. 발견 시: PRD의 title(frontmatter `title` 또는 첫 번째 H1)에서 feature-name 추출 (kebab-case 변환)
   c. 사용자 확인:
      ```
      BMad planning artifacts를 발견했습니다.
      PRD: "{PRD 제목}" → feature-name: {추출된 이름}

      [1] {추출된 이름}으로 진행 (권장)
      [2] 다른 이름 입력
      ```
   d. 미발견 시: 사용법 안내 후 종료:
      ```
      사용법: /specs feature-name

      예시:
        /specs tutor-exclusion     — specs/tutor-exclusion/ 에서 작업
        /specs rating-popup        — specs/rating-popup/ 에서 작업

      BMad 12단계 완료 후라면: /specs {기능명}
      참고 자료로 시작하려면: /sprint {기능명}
      ```

3. feature-name 검증: `/^[a-z0-9][a-z0-9-]*$/`

#### Step 0b: Planning Artifacts 탐색

다음 순서로 산출물을 탐색한다:

**경로 1**: `specs/{feature}/planning-artifacts/` (Sprint Kit 기본)
- prd.md, architecture.md, epics*.md 존재 확인

**경로 2**: `_bmad-output/planning-artifacts/` (BMad Guided 출력)
- 경로 1에서 미발견 시 탐색
- 발견 시: `specs/{feature}/planning-artifacts/` 디렉토리 생성 + 파일 복사
- 파일 이름 매핑: `epics.md` → `epics-and-stories.md`
- 선택 파일: `product-brief.md`, `ux-design-specification.md` (있으면 함께 복사)

**탐색 실패**: 두 경로 모두 미발견 시 에러:
```
Planning artifacts를 찾을 수 없습니다.

확인할 위치:
  1. specs/{feature}/planning-artifacts/  (Sprint 경로)
  2. _bmad-output/planning-artifacts/     (BMad Guided 경로)

BMad 12단계: /create-product-brief → /create-prd → /create-architecture → /create-epics
Sprint 경로: /sprint {feature-name}
```

#### Step 0c: 산출물 완전성 확인

| 보유 산출물 | 상태 | 안내 |
|---|---|---|
| PRD + Architecture + Epics | **완전** — Step 0d로 진행 | — |
| PRD + Architecture (Epics 없음) | **부분** | "Epics가 필요합니다. `/create-epics`로 생성하세요." |
| PRD만 (Architecture 없음) | **부분** | "Architecture와 Epics가 필요합니다. `/create-architecture` → `/create-epics`로 생성하세요." |
| PRD 없음 | **불완전** | "PRD가 필요합니다. `/create-prd`부터 시작하세요." |

부분/불완전 상태에서는 에러 메시지 출력 후 종료.

#### Step 0d: sprint-input.md 확인 + 생성

> **순서 의존성**: 이 단계는 Step 1 (Brownfield) 이전에 실행되어야 한다. Brownfield Scanner(Broad Scan)가 sprint-input.md를 입력으로 참조하기 때문.

1. `specs/{feature}/inputs/sprint-input.md` 존재 확인
2. **존재 시**: `tracking_source` 필드 확인.
   - `tracking_source` 존재 → 기존 값 사용 (파일 편집 안 함)
   - `tracking_source` 미존재 → frontmatter에 `tracking_source: success-criteria` 필드 추가
3. **미존재 시**: `specs/{feature}/inputs/` 디렉토리 생성 + 최소 sprint-input.md 생성:

```yaml
---
feature: {feature_name}
generated_at: {ISO 8601}
generated_by: specs-direct
tracking_source: success-criteria
brief_grade: A
goals: []
brief_sentences: []
brownfield_status: greenfield
brownfield_topology: standalone
document_project_path: null
fallback_tier: 1
flags:
  force_jp1_review: false
---

## Source
specs-direct: BMad planning artifacts에서 직접 Specs 생성 (Sprint Phase 0 미경유)
```

> `goals: []`는 Scope Gate의 Goals Fallback이 처리한다 (PRD Success Criteria에서 추출).
> `brief_grade: A`는 BMad/수동 산출물이 사용자 검증을 거쳤다는 전제.
> `complexity` 필드 생략 — specs-direct 경로에서 하류 에이전트가 소비하지 않는 필드.

### Step 1: Brownfield L4 Append

`@brownfield-scanner`를 targeted 모드로 호출하여 L4 (Code Layer)를 추가한다:

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "You are @brownfield-scanner. Read and follow your agent definition at .claude/agents/brownfield-scanner.md.
    Execute Targeted Scan (mode='targeted').
    Input files:
    - Architecture: specs/{feature}/planning-artifacts/architecture.md
    - Epics: specs/{feature}/planning-artifacts/epics-and-stories.md
    brownfield_path: specs/{feature}/planning-artifacts/brownfield-context.md
    Append L3 + L4 layers to existing file."
```

> Frozen snapshot 복사는 `@deliverable-generator` Stage 2에서 수행한다.

**기존 Brownfield 상태에 따른 동작**:

| 기존 상태 | 동작 |
|-----------|------|
| 없음 | Brownfield 스캔 제안 (아래 참조) |
| L1+L2만 | Targeted Scan으로 L3+L4 추가 |
| L1~L3 | Targeted Scan으로 L4만 추가 |
| L1~L4 | Frozen snapshot만 복사 (Targeted Scan 생략) |

**Brownfield 없음 시 처리**:

먼저 토폴로지를 간이 판정한다 (sprint.md Step 0f-3과 동일 로직):
- 빌드 도구 파일 감지 + .mcp.json 감지

| 감지 결과 | 동작 |
|-----------|------|
| greenfield (빌드 도구 없음, MCP 없음) | brownfield-context.md 생성 없이 Step 2 진행 |
| 빌드 도구 또는 MCP 존재 | AskUserQuestion: "기존 시스템이 감지되었습니다. Brownfield 스캔을 실행하면 더 정확한 Specs를 생성할 수 있습니다." [1] 실행 (Broad + Targeted) [2] 건너뛰기 |

[1] 선택 시:
1. @brownfield-scanner broad 모드 실행 → L1+L2 생성
   - `sprint_input_path: specs/{feature}/inputs/sprint-input.md` (Step 0d에서 생성됨)
2. 이어서 Targeted Scan (L3+L4) → brownfield-context.md에 append
3. **sprint-input.md frontmatter 갱신**:
   - `brownfield_status` → 스캔 결과에 따라 `configured` / `local-only`
   - `brownfield_topology` → 판정 결과 (`standalone` / `co-located` / `msa` / `monorepo`)

[2] 선택 시: 스캔 없이 Step 2 진행 (sprint-input.md는 기본값 `greenfield` 유지)

### Step 2: Specs 생성

`@deliverable-generator`를 specs-only 모드로 호출한다:

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "You are @deliverable-generator. Read and follow your agent definition at .claude/agents/deliverable-generator.md.
    Generate specs in specs-only mode.
    planning_artifacts: specs/{feature}/planning-artifacts/
    feature_name: {feature-name}
    output_base: specs/
    mode: specs-only"
```

이 모드에서는 Entity Dictionary (Stage 1) + Specs 4-file (Stage 2)만 생성:
- Entity Dictionary로 명명 일관성 보장
- requirements.md (PRD → 요구사항)
- design.md (Architecture → 설계)
- tasks.md (Epics → 병렬 태스크 + Entropy + File Ownership)

### Step 3: 계획 출력

생성된 `tasks.md`를 사용자에게 보여주고 승인을 받는다.
승인 후 `/preview` (Deliverables 생성)로 진행한다.

## Outputs
- `specs/{feature-name}/brownfield-context.md`
- `specs/{feature-name}/requirements.md`
- `specs/{feature-name}/design.md`
- `specs/{feature-name}/tasks.md`
