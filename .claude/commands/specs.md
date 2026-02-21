---
description: "BMad 산출물에서 명세 4파일을 생성합니다 (Brownfield L4 + Entity Dictionary)"
---

# /specs — 명세 생성

> **디스패치 대상**: `@brownfield-scanner` (L4) + `@deliverable-generator` (specs-only)

## 목적

BMad 산출물에서 명세 4파일을 생성합니다.

## 사용 시점

BMad Phase 3 산출물이 준비되고 Implementation Readiness를 통과한 후 사용합니다.

## 입력

`$ARGUMENTS`: feature-name (kebab-case, 선택사항)
- `/specs feature-name` — 피처 이름을 직접 지정
- `/specs` (인수 없음) — BMad 산출물 자동 감지 + feature-name 제안

## 절차

jdd-sprint-guide.md의 Language Protocol에 따라 설정을 로드합니다.

### Step 0: 피처 디렉토리 + 산출물 탐색

#### Step 0a: 피처 이름 결정

1. `$ARGUMENTS` 파싱:
   - **feature-name 제공됨** → `feature = $ARGUMENTS`, 유효성 검사 후 Step 0b로 진행
   - **인수 없음** → 자동 감지 (아래 참조)

2. **자동 감지** (인수 없을 때):
   a. `_bmad-output/planning-artifacts/prd.md` 확인
   b. 발견되면: PRD 제목(frontmatter `title` 또는 첫 번째 H1)에서 feature-name 추출 (kebab-case로 변환)
   c. 사용자에게 확인 ({communication_language}로):
      ```
      BMad 기획 산출물을 찾았습니다.
      PRD: "{PRD 제목}" → feature-name: {추출된 이름}

      [1] {추출된 이름}으로 진행 (권장)
      [2] 다른 이름 입력
      ```
   d. 발견되지 않으면: 사용법 출력 ({communication_language}로) 후 종료:
      ```
      사용법: /specs feature-name

      예시:
        /specs tutor-exclusion     — specs/tutor-exclusion/ 에서 작업
        /specs rating-popup        — specs/rating-popup/ 에서 작업

      BMad 12단계 완료 후: /specs {feature-name}
      참고 자료에서 시작: /sprint {feature-name}
      ```

3. feature-name 유효성 검사: `/^[a-z0-9][a-z0-9-]*$/`

#### Step 0b: 기획 산출물 탐색

다음 순서로 산출물을 탐색합니다:

**Path 1**: `specs/{feature}/planning-artifacts/` (Sprint Kit 기본값)
- prd.md, architecture.md, epics*.md 확인

**Path 2**: `_bmad-output/planning-artifacts/` (BMad Guided 출력)
- Path 1에서 아무것도 없을 때만 탐색
- 발견되면: `specs/{feature}/planning-artifacts/` 디렉토리 생성 + 파일 복사
- 파일명 매핑: `epics.md` → `epics-and-stories.md`
- 선택적 파일: `product-brief.md`, `ux-design-specification.md` (있으면 복사)

**탐색 실패**: 두 경로 모두 산출물이 없는 경우, 오류 출력 ({communication_language}로):
```
기획 산출물을 찾을 수 없습니다.

확인한 위치:
  1. specs/{feature}/planning-artifacts/  (Sprint 경로)
  2. _bmad-output/planning-artifacts/     (BMad Guided 경로)

BMad 12단계: /create-product-brief → /create-prd → /create-architecture → /create-epics
Sprint 경로: /sprint {feature-name}
```

#### Step 0c: 산출물 완전성 검사

| 존재하는 산출물 | 상태 | 안내 |
|---|---|---|
| PRD + Architecture + Epics | **완전** — Step 0d로 진행 | — |
| PRD + Architecture (Epics 없음) | **부분적** | "Epics가 필요합니다. `/create-epics`로 생성하세요." |
| PRD만 있음 (Architecture 없음) | **부분적** | "Architecture와 Epics가 필요합니다. `/create-architecture` → `/create-epics` 순서로 생성하세요." |
| PRD 없음 | **불완전** | "PRD가 필요합니다. `/create-prd`로 시작하세요." |

부분적/불완전 상태인 경우: 오류 메시지 출력 ({communication_language}로) 후 종료.

#### Step 0d: sprint-input.md 확인 + 생성

> **순서 의존성**: 이 단계는 Step 1 (Brownfield) 전에 반드시 실행되어야 합니다. Brownfield Scanner (Broad Scan)는 sprint-input.md를 입력으로 참조합니다.

1. `specs/{feature}/inputs/sprint-input.md` 확인
2. **존재하는 경우**: `tracking_source` 필드 확인.
   - `tracking_source` 있음 → 기존 값 사용 (파일 수정하지 않음)
   - `tracking_source` 없음 → frontmatter에 `tracking_source: success-criteria` 추가
3. **없는 경우**: `specs/{feature}/inputs/` 디렉토리 생성 + 최소 sprint-input.md 생성:

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
specs-direct: Specs generated directly from BMad planning artifacts (Sprint Phase 0 bypassed)
```

> `goals: []`는 Scope Gate의 Goals Fallback이 처리합니다 (PRD Success Criteria에서 추출).
> `brief_grade: A`는 BMad/수동 산출물이 사용자에 의해 검증되었다고 가정합니다.
> `complexity` 필드는 생략 — specs-direct 경로의 다운스트림 에이전트가 사용하지 않습니다.

### Step 1: Brownfield L4 추가

`@brownfield-scanner`를 targeted 모드로 실행하여 L4 (코드 레이어)를 추가합니다:

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "You are @brownfield-scanner. Read and follow your agent definition at .claude/agents/brownfield-scanner.md.
    Execute Targeted Scan (mode='targeted').
    Input files:
    - Architecture: specs/{feature}/planning-artifacts/architecture.md
    - Epics: specs/{feature}/planning-artifacts/epics-and-stories.md
    - sprint_input_path: specs/{feature}/inputs/sprint-input.md
    - topology: {brownfield_topology from sprint-input.md frontmatter, default: 'standalone'}
    brownfield_path: specs/{feature}/planning-artifacts/brownfield-context.md
    Append L3 + L4 layers to existing file. After L3+L4 complete, populate the Entity Index table.
    Note: Scanner reads external_resources.external_repos from sprint-input.md to discover external data sources."
```

> Frozen snapshot 복사는 `@deliverable-generator` Stage 2에서 처리합니다.

**기존 Brownfield 상태에 따른 동작**:

| 기존 상태 | 동작 |
|----------------|--------|
| 없음 | Brownfield 수집 제안 (아래 참조) |
| L1+L2만 있음 | L3+L4 추가를 위한 Targeted Scan 실행 |
| L1~L3 있음 | L4만 추가를 위한 Targeted Scan 실행 |
| L1~L4 있음 | Frozen snapshot 복사만 수행 (Targeted Scan 생략) |

**Brownfield가 없을 때**:

먼저 빠른 토폴로지 감지를 수행합니다 (sprint.md Step 0f-3과 동일한 로직):
- 빌드 도구 파일 + .mcp.json 감지

| 감지 결과 | 동작 |
|------------------|--------|
| greenfield (빌드 도구 없음, MCP 없음) | brownfield-context.md 없이 Step 2로 진행 |
| 빌드 도구 또는 MCP 존재 | AskUserQuestion ({communication_language}로): "기존 시스템이 감지되었습니다. Brownfield 수집을 실행하면 더 정확한 명세를 생성할 수 있습니다." [1] 실행 (Broad + Targeted) [2] 건너뛰기 |

[1] 선택 시:
1. sprint.md Step 0f-3 로직으로 토폴로지 결정 (빌드 도구 + .mcp.json + 모노레포 파일)
2. sprint.md Step 0f-2A 로직으로 `--add-dir` 외부 레포 경로 감지 → sprint-input.md `external_resources.external_repos`에 기록
3. @brownfield-scanner broad 모드 실행 → L1+L2 생성
   - `sprint_input_path: specs/{feature}/inputs/sprint-input.md` (Step 0d에서 생성, external_repos 기록됨)
   - `topology: {감지된 토폴로지}`
   - `local_codebase_root: {토폴로지가 co-located/msa/monorepo인 경우 '.' 아니면 null}`
4. Targeted Scan 실행 (L3+L4, 동일한 토폴로지 전달) → brownfield-context.md에 추가
5. **sprint-input.md frontmatter 업데이트**:
   - `brownfield_status` → 수집 결과에 따라 `configured` / `local-only`
   - `brownfield_topology` → 감지 결과 (`standalone` / `co-located` / `msa` / `monorepo`)

[2] 선택 시: 수집 없이 Step 2로 진행 (sprint-input.md는 기본값 `greenfield` 유지)

### Step 2: 명세 생성

`@deliverable-generator`를 specs-only 모드로 실행합니다:

```
Task(subagent_type: "general-purpose", model: "sonnet")
  prompt: "You are @deliverable-generator. Read and follow your agent definition at .claude/agents/deliverable-generator.md.
    Generate specs in specs-only mode.
    planning_artifacts: specs/{feature}/planning-artifacts/
    feature_name: {feature-name}
    output_base: specs/
    mode: specs-only"
```

이 모드는 Entity Dictionary (Stage 1) + 명세 4파일 (Stage 2)만 생성합니다:
- 명명 일관성을 위한 Entity Dictionary
- requirements.md (PRD → 요구사항)
- design.md (Architecture → 설계)
- tasks.md (Epics → 병렬 태스크 + Entropy + File Ownership)

### Step 3: 결과물 출력

생성된 `tasks.md`를 사용자에게 제시하여 승인을 받습니다.
승인 후 `/preview` (Deliverables 생성)로 진행합니다.

## 출력물
- `specs/{feature-name}/brownfield-context.md`
- `specs/{feature-name}/requirements.md`
- `specs/{feature-name}/design.md`
- `specs/{feature-name}/tasks.md`
