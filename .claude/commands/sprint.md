---
description: "Brief 하나로 Specs + Full-stack Deliverables 자동 생성 (Auto Sprint)"
---

<!-- Quick Map
  Purpose: Brief → Auto Sprint Full-stack 생성
  Dispatch: @auto-sprint (Phase 1-2)
  Inputs: $ARGUMENTS (Brief text 또는 feature-name)
  Key Steps: Parse → Locate → Grade → Causal → Goals → Brownfield → Generate → Confirm → @auto-sprint
-->

# /sprint — Auto Sprint

> **Dispatch Target**: `@auto-sprint` (Phase 1-2 위임, Phase 0은 직접 실행)

## Purpose

사용자 Brief 하나로 Specs + Full-stack Deliverables를 자동 생성한다. 2개의 Judgment Point에서 사람이 확인.

## When to Use

Sprint 전체 파이프라인을 자동으로 실행하려 할 때. Brief 하나로 시작.

## Inputs

`$ARGUMENTS` — 2가지 진입점:
- Case 1 (Inline Brief): `/sprint "만들고 싶은 기능 설명"` — 참고 자료 없이 즉시 시작
- Case 2 (Feature Name): `/sprint feature-name` — `specs/{feature-name}/inputs/` 사전 준비 필요
- 빈 값: 사용법 안내 후 종료

선행 조건:
- `preview-template/` 디렉토리 존재

## Procedure

### Phase 0: Smart Launcher (메인 세션에서 실행)

`$ARGUMENTS`를 분석하여 sprint-input.md를 생성하고, @auto-sprint에 전달한다.

#### Step 0a: 진입 분기

**사전 검증**: `$ARGUMENTS`가 비어 있거나 공백만이면 사용법 안내 후 종료:
```
사용법:
  /sprint "Brief 텍스트"     — Quick Start (즉시 시작)
  /sprint feature-name      — Full (inputs/ 폴더 사전 준비 필요)

Quick Start: Brief 텍스트를 따옴표로 감싸세요.
Full: specs/{feature-name}/inputs/brief.md를 먼저 작성하세요.
```

`$ARGUMENTS` 해석 — 2가지 진입점, 1개 파이프라인:

**Case 1: Inline Brief** (`/sprint "튜터 차단 기능을 만들어줘"`)
1. feature_name 자동 생성:
   - Brief가 한글인 경우: 핵심 키워드를 영어로 번역하여 kebab-case 생성
   - Brief가 영어인 경우: 핵심 키워드 추출하여 kebab-case 생성
   - 예: "튜터 차단 기능" → `tutor-exclusion`, "Add rating popup" → `rating-popup`
2. feature_name 검증: `/^[a-z0-9][a-z0-9-]*$/` — 검증 실패 시 재생성 (최대 3회)
3. 기존 산출물 충돌 감지:
   - `specs/{feature_name}/` 이미 존재 + `inputs/` 있으면 → Case 2로 전환 (기존 brief.md 사용 여부 확인)
   - `specs/{feature_name}/` 이미 존재 + `inputs/` 없으면 → feature_name에 `-v2` suffix 추가
4. `specs/{feature_name}/inputs/` 디렉토리 생성
5. `specs/{feature_name}/inputs/brief.md`에 Brief 텍스트 저장
6. Quick Start 경로 → 참고 자료 없이 Step 0c로 진행

**Case 2: Feature Name** (`/sprint tutor-exclusion`)
1. feature_name 검증: `/^[a-z0-9][a-z0-9-]*$/`
   - 검증 실패 시 에러: "feature_name은 영문 소문자, 숫자, 하이픈만 사용 가능합니다."

2. **specs/ 기본 구조 확인**:
   - `specs/` 폴더 미존재 시 → 자동 생성 + `specs/README.md` 배치 + "specs/ 폴더를 생성했습니다." 안내
   - `specs/README.md` 미존재 시 → 자동 생성
   - README.md 내용: Sprint 사용법 + 폴더 구조 안내 (`specs/README.md` 참조)

3. **specs/{feature_name}/ 존재 확인**:
   미존재 시 에러:
   ```
   specs/{feature_name}/ 폴더가 없습니다.

   Sprint을 시작하려면:
   1. 폴더 생성: mkdir -p specs/{feature_name}/inputs/
   2. 자료 배치: 회의록, Brief, 참고자료 등을 inputs/에 넣으세요
   3. 다시 실행: /sprint {feature_name}
   ```

4. **전체 스캔** — `specs/{feature_name}/` 내부를 한 번에 스캔:

   a. **inputs/ 스캔**:
      - 파일 목록 수집 (brief.md 존재 여부 구분)
      - 파일 0개 또는 inputs/ 없음 → `input_status: empty`
      - brief.md만 → `input_status: brief-only`
      - brief.md + 참고자료 → `input_status: full`
      - 참고자료만 (brief.md 없음) → `input_status: references-only`

   b. **brownfield-context.md 감지**:
      - `specs/{feature_name}/brownfield-context.md` 또는 `specs/{feature_name}/planning-artifacts/brownfield-context.md` 존재 여부
      - 발견 시 → 레벨(L1~L4) 추정 (파일 내 `## L1`, `## L2` 등 헤딩 기반)

   c. **planning-artifacts/ 감지**:
      - prd.md, architecture.md, epics-and-stories.md 존재 여부
      - 3개 모두 존재 → `artifacts_status: complete`
      - 일부 존재 → `artifacts_status: partial`
      - 없음 → `artifacts_status: none`

   d. **BMad 산출물 감지** (`_bmad-output/planning-artifacts/`):
      - prd.md + architecture.md + (epics.md 또는 epics-and-stories.md) 모두 존재 → `bmad_output: found`

5. **스캔 결과 요약 보고**:
   ```
   specs/{feature_name}/ 스캔 완료

   inputs/ ({N}개 파일):
     - {filename1}
     - {filename2}
     ...

   brief.md: {존재 / 미존재 → 참고자료에서 생성}
   brownfield-context.md: {발견 ({레벨}, 기존 파일 활용) / 미발견 → 새로 스캔}
   planning-artifacts/: {complete ({N}개) / partial ({N}개) / 없음}
   ```

6. **입력 상태 판정 + 경로 분기**:

   **우선 검사** — 기획 산출물 완비 시:
   `artifacts_status: complete` 또는 `bmad_output: found`이면:
   ```
   기획 산출물이 발견되었습니다.
   위치: {경로}

   [1] /specs {feature_name}으로 바로 진행 (권장)
   [2] Sprint Auto Pipeline로 처음부터 실행
   ```
   [1] 선택 시: `/specs {feature_name}` 안내 후 종료
   [2] 선택 시: 아래 input_status 분기로 계속

   **input_status 분기**:

   | input_status | 경로 |
   |---|---|
   | full / brief-only | **정상 Sprint** → Step 0b |
   | references-only | **AI Brief 생성** (Step 0a-brief) → Step 0b |
   | empty | **에러** (아래 참조) |

   empty 에러:
   ```
   inputs/에 자료가 없습니다.

   Sprint을 시작하려면 inputs/에 자료를 넣은 후 다시 실행하세요:
   - Brief, 회의록, 참고자료 등 어떤 형식이든 가능합니다
   - Brief가 없어도 참고자료만으로 시작할 수 있습니다
   ```

#### Step 0a-brief: AI Brief 생성

`input_status: references-only`인 경우 (brief.md 없지만 참고자료 있음):

1. inputs/ 내 모든 참고자료를 읽는다
2. 참고자료에서 Brief를 구성한다:
   - 배경/문제 상황
   - 만들어야 할 핵심 기능
   - 사용자 시나리오 (참고자료에 있는 경우)
   - 제약 조건 (참고자료에 있는 경우)
3. `specs/{feature_name}/inputs/brief.md`에 저장한다
4. Brief 생성 원칙:
   - 참고자료에서 명시적으로 언급된 내용을 충실하게 반영
   - AI가 문맥에서 추론한 항목은 `(AI-inferred)` 표시
   - 참고자료에 없는 내용을 창작하지 않음
5. Step 0b로 진행 (Brief 품질 등급은 Step 0c에서 판정)

#### Step 0b: inputs/ 스캔 + 방어 제한

`specs/{feature_name}/inputs/` 디렉토리의 파일을 스캔한다.

**방어 제한**:
- 최대 파일 수: 20개
- 최대 총 크기: 50MB (개별 파일도 50MB 제한, 초과 시 PDF는 앞 100페이지, 기타는 앞 50,000줄만 처리)
- PDF 최대 페이지: 100 (초과분은 앞 100페이지만)
- 지원 형식: `*.md`, `*.txt`, `*.pdf`, `*.png`, `*.jpg`, `*.jpeg`, `*.yaml`, `*.json`, `*.csv`
- 미지원 형식: 경고 + 스킵

**제한 초과 처리 우선순위**:
1. `brief.md`는 **항상 포함** (제외 불가)
2. 나머지 파일을 최근 수정 순으로 정렬
3. 상위 19개 선택 (brief.md + 19개 = 20개)
4. 제외된 파일 목록을 경고로 표시

**참고 자료 0개 (brief.md만)**: 정상 경로. Step 0d에서 Reference Materials 섹션 생략. Fallback Tier 1.

#### Step 0c: Brief 품질 등급 판정

brief.md를 읽고 품질을 판정한다.

**기능 카운트 기준**: Brief에서 동사+목적어 조합으로 표현된 독립적 사용자 행위를 1개 기능으로 카운트한다. 예: "차단한다", "차단 해제한다", "차단 목록을 본다" = 3개 기능. 하위 옵션(사유 선택 등)은 기능으로 카운트하지 않는다.

**참고 자료 보완 기준**: 참고 자료가 2개 이상이고 relevance=high가 1개 이상이면 "보완"으로 간주.

| 등급 | 조건 | 행동 |
|------|------|------|
| **A** (충분) | 기능 3+ 언급, 시나리오 1+ 언급, 또는 참고 자료가 보완 | 정상 진행 |
| **B** (보통) | 기능 1~2 언급, 시나리오 없음 | Step 0h 확인 시 경고 표시 |
| **C** (불충분) | 기능 0, 단순 키워드만 | Sprint 비권장 옵션 제시 |

**C등급 처리**:
- AskUserQuestion으로 옵션 제시:
  - [1] 그래도 진행 → `force_jp1_review: true` 플래그 설정
  - [2] Brief 보완 → 다음 5가지 관점에서 질문 생성:
    1. 핵심 기능과 배경 (어떤 문제가 있어서, 어떤 기능을 만들려 하는가?)
    2. 사용자 시나리오 (어떤 상황에서 사용하는가?)
    3. 제약 조건 (기존 시스템과 연동이 필요한가?)
    4. 우선순위 (꼭 필요한 것 vs 있으면 좋은 것)
    5. 예외 상황 (실패/에러 시 기대 동작)
    답변을 brief.md 하단에 `## 보완 답변` 섹션으로 추가 → 재판정
- **재판정 제한**: 보완 질문은 최대 2회까지. 2회 후에도 C등급이면 `force_jp1_review: true`로 자동 진행.

#### Step 0d: 참고 자료 분석 + sprint-input.md 생성

참고 자료 분석 포맷은 `_bmad/docs/sprint-input-format.md` 참조.

1. **brief.md 전문 읽기** — 원문 보존 (Core Brief 섹션에 그대로 포함)
2. **Brief 문장 분해 + ID 부여**:
   Brief의 각 의미 단위(문장 또는 절)를 분해하고 고유 ID를 부여한다.
   - 기능/행위를 기술하는 문장만 분해 대상 (배경 설명, 인사말 등 제외)
   - ID 형식: `BRIEF-{N}` (1부터 순번)
   - sprint-input.md의 `brief_sentences` 필드에 기록:
     ```yaml
     brief_sentences:
       - id: BRIEF-1
         text: "학생이 특정 튜터를 차단할 수 있게"
       - id: BRIEF-2
         text: "차단된 튜터는 매칭에서 제외"
       - id: BRIEF-3
         text: "차단 목록을 관리할 수 있게"
     ```
   - 이 ID는 이후 PRD Agent가 FR 생성 시 `(source: BRIEF-N)` 태깅에 사용됨
3. **참고 자료 읽기 + 요약**:
   - 200줄 이하: 전문 포함
   - 200줄 초과: Key Points, Constraints, Decisions 추출하여 요약
   - 이미지: 파일명 + 설명 텍스트만
   - PDF: Read tool로 읽기 (100페이지 제한)
3. **Discovered Requirements 추출**:
   - Brief에 없지만 참고 자료에서 발견된 요구사항
   - 5개 이하: 전부 포함 (기본값: Sprint 범위에 포함)
   - 5개 초과: 핵심 3개만 포함, 나머지는 "다음 Sprint 후보"
4. **모순 감지**: Brief와 참고 자료 간 모순 발견 시 Detected Contradictions에 기록 (자동 해결 안 함)
5. **sprint-input.md 작성**: `specs/{feature_name}/inputs/sprint-input.md`에 SSOT 생성
6. **tracking_source 설정**: `tracking_source: brief` — Sprint 경로는 항상 BRIEF-N 기반 추적
7. **인과 사슬(Causal Chain) 추출**:
   Core Brief + Reference Materials에서 기능 요청의 배경을 구조화한다.

   **Layer 구조**:
   - Layer 4 (Feature Request): Brief에서 항상 확정
   - Layer 1 (Phenomenon): Brief + 참고 자료에서 탐색
   - Layer 2 (Root Cause): Brief + 참고 자료에서 탐색
   - Layer 3 (Solution Rationale): Brief + 참고 자료에서 탐색

   **판정 기준**:
   - "확인됨": 문서에서 해당 내용을 직접 발견. `_evidence`에 해당 구절/위치 기록.
   - "추론됨": 문맥에서 AI가 추론. `_evidence`에 추론 근거 기록.
   - "불명확": 단서 없음.

   **chain_status 판정**:
   | chain_status | 조건 | 처리 |
   |--------------|------|------|
   | **complete** | Layer 1~3 모두 "확인됨" | 질문 없이 진행 |
   | **partial** | 일부가 "추론됨" | 추론 Layer만 사용자에게 개별 확인 |
   | **feature_only** | Layer 1~3 모두 "불명확" | Layer 1~3을 사용자에게 질문 |

   **partial인 경우** — Layer별 개별 확인:
   AskUserQuestion으로 "추론됨" 상태인 Layer만 제시. 각 Layer를 독립적으로 확인/수정 가능.
   ```
   다음 항목이 AI 추론입니다. 확인해 주세요:

   원인: "매칭 시스템이 부정적 경험을 반영하지 않음" ← AI 추론
     [맞습니다] / [수정이 필요합니다]
   ```
   수정 시 `_source`를 `user_confirmed`으로 갱신.

   **feature_only인 경우** — 선택적 질문:
   AskUserQuestion으로 opt-in 질문:
   "인과 사슬(왜 이 기능이 필요한지)을 추가하면 더 정확한 Sprint이 가능합니다. 추가하시겠습니까?"
   - **Yes** → 3가지 질문:
     1. 어떤 문제가 발생하고 있나요? (Phenomenon)
     2. 그 문제의 원인이 무엇이라고 보시나요? (Root Cause)
     3. 이 기능이 그 원인을 해결하는 방식은? (Solution Rationale)
     결과를 causal_chain에 기록 + `chain_status: "complete"` 또는 `"partial"`
   - **No** → `chain_status: "feature_only"`, `force_cp1_causal_review: false`, 정상 진행

   결과를 sprint-input.md frontmatter의 `causal_chain` 에 기록.

#### Step 0e: Goals 추출 + 복잡도 분류

sprint-input.md의 Core Brief + Discovered Requirements에서:
- **Goals 3~5개** 추출 (구체적, 검증 가능한 목표)
- **복잡도 분류**:
  - `simple`: 단일 도메인, API 3개 이하
  - `medium`: 2~3개 도메인, API 4~10개
  - `complex`: 다중 도메인, API 10개 초과 또는 복잡한 상태 관리

Goals와 complexity를 sprint-input.md frontmatter에 기록.

**시간 예측 생성**:
complexity에 기반한 초기 시간 범위를 sprint-input.md frontmatter에 기록:
- simple: 30~60분
- medium: 60~120분
- complex: 120~240분

> 이 수치는 초기 추정값이며, Sprint 실행 데이터가 축적되면 자동 보정됩니다.

#### Step 0f: Brownfield 소스 상태 확인 + 토폴로지 판정

##### Sub-step 0f-0: 기존 brownfield-context.md 활용 판정

Step 0a 스캔에서 brownfield-context.md가 발견된 경우:
1. 파일 내용을 읽어 포함된 레벨(L1~L4)을 확인한다
2. sprint-input.md frontmatter에 기록:
   ```yaml
   pre_existing_brownfield:
     path: specs/{feature_name}/brownfield-context.md
     levels: [L1, L2]  # 감지된 레벨
   ```
3. 토폴로지 판정(Sub-step 0f-1 ~ 0f-3)은 정상 실행한다
4. Auto Sprint Step 1에서 기존 파일을 기반으로 부족한 레벨만 추가 스캔한다

기존 brownfield-context.md가 없으면 → 아래 소스 감지부터 정상 진행.

현재 프로젝트의 Brownfield 소스를 **누적(AND)** 방식으로 감지한다. 모든 소스를 수집한 뒤 합쳐서 brownfield-context.md를 생성한다.

##### Sub-step 0f-1: 로컬 document-project 감지

1. `_bmad/bmm/config.yaml` 읽기 → `project_knowledge` 값 추출
   - 미존재 시 fallback 경로 탐색: `docs/`, `global/` 순서로 확인
2. `{project_knowledge}/project-scan-report.json` 존재 확인
3. 존재 시 → Staleness 판정 (`timestamps.last_updated` 기준, 경과 일수 = 오늘 - last_updated):
   - **≤ 30일** → `document_project_status: fresh`, 정상 사용
   - **> 30일 AND ≤ 90일** → `document_project_status: stale` + 재실행 제안:
     "코드베이스 분석 문서가 {N}일 전에 생성되었습니다. 갱신하시겠습니까? [1] 갱신 후 시작 [2] 현재 문서로 진행"
   - **> 90일** → `document_project_status: expired` + 경고:
     "코드베이스 분석 문서가 오래되었습니다 ({N}일 경과). 사용하지 않습니다."
     document-project 데이터 미사용 (document_project_path: null)
4. `document_project_path` 설정: `project_knowledge` 값 (expired면 null)
5. 미발견 + BMad 설치 확인(`_bmad/bmm/` 존재) + 빌드 도구 있음(Sub-step 0f-3 참조) → 자동 생성 제안:
   ```
   이 프로젝트의 코드베이스를 처음 분석합니다.
   기존 API, DB, 서비스 구조를 파악하면 더 정확한 Sprint이 가능합니다.
   [1] 분석 후 시작 (약 15분)
   [2] 바로 시작
   ```
   [1] 선택 시: `Skill("bmad:bmm:workflows:document-project")` 실행 → 완료 후 Sub-step 0f-1 재실행
   [2] 선택 시: `document_project_path: null`로 진행

##### Sub-step 0f-2: MCP 소스 감지

1. `.mcp.json` 읽기 → 등록된 MCP 서버 목록 추출
2. 각 filesystem 서버의 경로에 접근 가능 여부 확인 (Glob으로 파일 1개 이상 존재 확인)
3. 접근 불가 서버가 있으면 AskUserQuestion으로 대안 제시:
   ```
   MCP 서버 '{server_name}'의 경로 '{path}'에 접근할 수 없습니다.
   ```
   - [1] 데이터를 `specs/{feature}/inputs/`에 직접 추가한 뒤 재확인
   - [2] `.mcp.json`의 경로를 수정한 뒤 재확인
   - [3] Brownfield 데이터 없이 진행 (정확도 감소)

   [1] 또는 [2] 선택 시: 사용자 조치 완료 후 Sub-step 0f-2를 1회 재실행.
   [3] 선택 시: 해당 서버를 실패로 기록하고 진행.

##### Sub-step 0f-3: 토폴로지 판정 + brownfield_status 결정

**빌드 도구 파일 감지**: 프로젝트 루트에 다음 파일 중 하나라도 존재하면 "빌드 도구 있음":
`package.json`, `go.mod`, `pom.xml`, `build.gradle`, `Cargo.toml`, `pyproject.toml`, `Makefile`, `CMakeLists.txt`, `mix.exs`, `Gemfile`, `composer.json`

**모노레포 감지**: 프로젝트 루트에 다음 파일 중 하나라도 존재하면 "모노레포":
`pnpm-workspace.yaml`, `lerna.json`, `nx.json`, `rush.json`, `project-parts.json`, `turbo.json`

**판정 매트릭스**:

먼저 모노레포 파일이 감지되면 topology는 `monorepo`로 확정한다. 그 외에는 아래 매트릭스를 따른다:

| document-project | MCP | 빌드 도구 | 모노레포 | topology | brownfield_status |
|-----------------|-----|---------|---------|----------|-------------------|
| any | any | any | ✓ | `monorepo` | `configured` (doc-project/MCP 중 하나 이상 있을 때) 또는 `local-only` |
| ✓ | ✓ | ✓ | ✗ | `msa` | `configured` |
| ✓ | ✗ | ✓ | ✗ | `co-located` | `configured` |
| ✓ | ✓ | ✗ | ✗ | `standalone` | `configured` |
| ✗ | ✓ | ✗ | ✗ | `standalone` | `configured` |
| ✗ | ✓ | ✓ | ✗ | `msa` | `configured` |
| ✗ | ✗ | ✓ | ✗ | `co-located` | `local-only` |
| ✗ | ✗ | ✗ | ✗ | `standalone` | `greenfield` |

- MCP 일부 실패 시: `partial-failure` (topology 판정은 정상 서버 기준으로 결정)
- `brownfield_topology`와 `brownfield_status`를 sprint-input.md frontmatter에 기록

결과를 sprint-input.md의 Brownfield Status 섹션과 frontmatter에 기록.

#### Step 0g: Validation Checksum (자가 점검)

sprint-input.md가 정상 생성되었는지 검증:

```
- Brief 원문 포함: ✓/✗
- 참고 자료 처리: N/M개
- Discovered Requirements: N개
- Goals 매핑: N/M개 목표에 Brief 키워드 연결
- 모순 감지: N건
- input_files ↔ Reference Materials 1:1 매칭: ✓/✗
```

검증 결과를 sprint-input.md frontmatter의 `validation`에 기록.

**Fallback Tier 판정 로직**:

| 조건 | Tier |
|------|------|
| brief.md 읽기 성공 + 참고 자료 전부 성공 | 1 |
| brief.md 읽기 성공 + 참고 자료 없음 (Quick Start) | 1 |
| brief.md 읽기 성공 + 참고 자료 일부/전부 실패 | 2 |
| Case 1 진입 + brief.md 저장 실패 | 3 (메모리의 inline Brief만 사용) |
| Case 2 진입 + brief.md 읽기 실패 | 4 (Sprint 중단) |
| Brief 내용에서 구체적 기능/서비스 식별 불가 | 4 (Sprint 중단) |

**Validation 실패 처리**:

| 항목 실패 | 동작 |
|-----------|------|
| Brief 원문 포함: X | sprint-input.md 재생성 (1회 재시도) |
| 참고 자료 처리: M < N | Tier 2로 downgrade + 경고 |
| Goals 매핑: 0개 | Tier 4 (Sprint 중단 — 목표 추출 불가) |

재시도는 최대 1회. 재시도 후에도 실패 시 현재 Tier에서 가능한 최선으로 진행.

**Tier 4 Sprint 중단 메시지**:
```
Brief에서 구현할 기능을 파악할 수 없습니다.
brief.md에 다음 내용을 포함해 주세요:
- 어떤 기능을 만들려는지 (예: '튜터 차단 기능')
- 누가 사용하는지 (예: '학생이')
- 어떤 동작을 기대하는지 (예: '차단한 튜터가 매칭에서 제외')
작성 후 /sprint {feature_name}으로 재실행하세요.
```

#### Step 0h: "Sprint 시작?" 확인

AskUserQuestion으로 계층화된 확인 화면을 제시한다.

먼저 분석 결과를 텍스트로 표시:

```markdown
## Sprint 시작 확인 — {feature_name}

### AI가 이해한 목표
1. {goal_1}
2. {goal_2}
3. {goal_3}

### 분석 결과
- 복잡도: {simple/medium/complex}
- Brief 등급: {A/B/C}
- 참고 자료: {N}개 분석 완료
- Brownfield: {greenfield / configured / local-only / N개 소스 중 M개 정상}
- 토폴로지: {standalone / co-located / msa / monorepo}
- 코드베이스 분석: {fresh / stale / expired / 미설정}
- 인과 사슬: {complete / partial / feature_only / 미설정}
- 예상 소요 시간: {N}~{M}분

### 주의사항 (해당 시에만, 요약 1줄 + 상세는 sprint-input.md 참조)
- ⚠️ Brief 등급 B: 세부사항을 AI가 추론합니다
- ⚠️ Brief 등급 C: Brief가 불충분합니다. JP1에서 강제 리뷰가 예정되어 있습니다.
- ⚠️ 모순 {N}건 감지 (sprint-input.md 참조)
- ⚠️ Brownfield 소스 접속 불가: {source명}
- ⚠️ 참고 자료 {N}개 중 {M}개 스킵 (제한 초과 또는 미지원 형식)
- ⚠️ 인과 사슬 미확정: AI 추론으로 진행합니다. JP1에서 반드시 확인이 필요합니다.

### 발견된 추가 요구사항 (해당 시에만)
- [DISC-01] {내용} (source: {filename}) — Sprint 범위 포함
- [DISC-02] {내용} (source: {filename}) — Sprint 범위 포함
{5개 초과 시}
- ... 외 {N}건은 다음 Sprint 후보 (sprint-input.md에서 확인 가능)

상세: specs/{feature_name}/inputs/sprint-input.md
```

그 다음 AskUserQuestion:

| 옵션 | 설명 |
|------|------|
| **Continue** | Sprint 시작 |
| **Adjust** | 목표/복잡도/Discovered Requirements 수정 (자유 입력 → sprint-input.md 반영 → 재확인) |
| **Exit** | 중단 (inputs/ 보존, brief.md 수정 후 `/sprint {feature_name}`으로 재시작 가능) |

**Adjust 처리**: 사용자 자유 입력 → sprint-input.md의 goals, complexity, discovered_requirements 수정 → Step 0h 확인 화면 재표시.

**Exit 처리 메시지**:
```
Sprint가 중단되었습니다.

보존된 산출물:
- specs/{feature_name}/inputs/ (원본 Brief + 참고 자료 + sprint-input.md)

재시작: /sprint {feature_name}
Brief 수정 후 재시작: brief.md 수정 → /sprint {feature_name}
```

#### Step 0h → Auto Sprint 런치

Continue 선택 시 `@auto-sprint` 에이전트를 백그라운드로 실행:

```
Task(subagent_type: "general-purpose", run_in_background: true)
  prompt: "You are @auto-sprint. Read and follow your agent definition at .claude/agents/auto-sprint.md.
    Input:
      feature_name: {feature_name}
      sprint_input_path: specs/{feature_name}/inputs/sprint-input.md
      goals: {goals array from sprint-input.md}
      complexity: {complexity from sprint-input.md}
      flags: { force_jp1_review: {true/false} }
      document_project_path: {document_project_path from sprint-input.md, or null}
      brownfield_topology: {brownfield_topology from sprint-input.md}
      pre_existing_brownfield_path: {pre_existing_brownfield.path from sprint-input.md, or null}"
```

---

Auto Sprint이 다음을 자동 수행:

### Phase 1: Planning → Specs
1. Brownfield 2-Pass 스캔 (sprint-input.md 참조)
2. BMad Auto-Pipeline (Brief → PRD → Architecture → Epics)
3. 매 단계 Scope Gate 검증
4. Specs 4-file 생성 (@deliverable-generator specs-only)

→ **Judgment Point 1**: Specs 리뷰 (태스크 구조, Entropy, File Ownership)
- **승인** → Phase 2 진행
- **피드백** → 해당 단계부터 재실행
- **중단** → 종료

### Phase 2: Deliverables
5. Full-stack Deliverables 생성 (@deliverable-generator deliverables-only)
6. Sprint Output Package 조립

→ **Judgment Point 2**: Sprint Output 리뷰 (프로토타입 + 명세)
- **승인** → `/parallel` 실행 (병렬 구현)
- **피드백** → Deliverables 재생성 또는 Specs 수정
- **중단** → 종료

## Outputs
- `specs/{feature}/inputs/` — 사용자 원본 + sprint-input.md (SSOT)
- `specs/{feature}/planning-artifacts/` — BMad 산출물 (PRD, Architecture, Epics, Brownfield Context)
- `specs/{feature}/` — Specs 4-file + Deliverables
- `specs/{feature}/preview/` — 동작하는 프로토타입
