---
description: "단일 Brief에서 명세 + 풀스택 산출물을 자동 생성 (Auto Sprint)"
---

<!-- Quick Map
  목적: Brief → Auto Sprint 풀스택 생성
  디스패치: @auto-sprint (Phase 1-2)
  입력: $ARGUMENTS (Brief 텍스트 또는 feature-name)
  주요 단계: 파싱 → 위치 확인 → 등급 판정 → 인과 사슬 → 목표 → Brownfield → 생성 → 확인 → @auto-sprint
-->

# /sprint — Auto Sprint

> **디스패치 대상**: `@auto-sprint` (Phase 1-2 위임; Phase 0은 직접 실행)

## 목적

단일 사용자 Brief에서 명세 + 풀스택 산출물을 자동 생성합니다. 사람은 2개의 판단 시점에서 검토합니다.

## 사용 시점

전체 Sprint 파이프라인을 자동으로 실행하고 싶을 때 사용합니다. 단일 Brief로 시작합니다.

## 입력

`$ARGUMENTS` — 2가지 진입점:
- Case 1 (인라인 Brief): `/sprint "원하는 기능을 설명하세요"` — 참고 자료 없이 즉시 시작
- Case 2 (Feature Name): `/sprint feature-name` — `specs/{feature-name}/inputs/` 사전 준비 필요
- 비어 있음: 사용법 안내(in {communication_language}) 표시 후 종료

사전 요구사항:
- `preview-template/` 디렉토리 존재

## 절차

jdd-sprint-guide.md의 Language Protocol에 따라 config를 로드합니다.

### Phase 0: Smart Launcher (메인 세션에서 실행)

`$ARGUMENTS`를 분석하고, sprint-input.md를 생성한 뒤, @auto-sprint에 핸드오프합니다.

#### Step 0a: 진입 분기

**사전 검증**: `$ARGUMENTS`가 비어 있거나 공백만 있으면 사용법(in {communication_language})을 표시하고 종료합니다:
```
Usage:
  /sprint "Brief text"     — 빠른 시작 (즉시 시작)
  /sprint feature-name     — Full (inputs/ 폴더 준비 필요)

빠른 시작: Brief 텍스트를 따옴표로 감싸세요.
Full: 먼저 specs/{feature-name}/inputs/brief.md를 작성하세요.
```

`$ARGUMENTS` 파싱 — 2가지 진입점, 1개의 파이프라인:

**Case 1: 인라인 Brief** (`/sprint "Build a tutor exclusion feature"`)
1. feature_name 자동 생성:
   - Brief가 영어 이외의 언어인 경우: 핵심 용어를 영어 kebab-case로 번역
   - Brief가 영어인 경우: 핵심 용어를 kebab-case로 추출
   - 예시: "Build tutor exclusion" → `tutor-exclusion`, "Add rating popup" → `rating-popup`
2. feature_name 검증: `/^[a-z0-9][a-z0-9-]*$/` — 실패 시 재시도 (최대 3회)
3. 기존 산출물 충돌 감지:
   - `specs/{feature_name}/`이 존재 + `inputs/`가 있음 → Case 2로 전환 (기존 brief.md 사용 여부 확인)
   - `specs/{feature_name}/`이 존재 + `inputs/`가 없음 → feature_name에 `-v2` 접미사 추가
4. `specs/{feature_name}/inputs/` 디렉토리 생성
5. Brief 텍스트를 `specs/{feature_name}/inputs/brief.md`에 저장
6. 빠른 시작 경로 → 참고 자료 없이 Step 0c로 진행

**Case 2: Feature Name** (`/sprint tutor-exclusion`)
1. feature_name 검증: `/^[a-z0-9][a-z0-9-]*$/`
   - 실패 시: 에러(in {communication_language}): "feature_name에는 소문자, 숫자, 하이픈만 사용할 수 있습니다."

2. **specs/ 기본 구조 확인**:
   - `specs/` 폴더가 없으면 → 생성 + `specs/README.md` 배치 + 알림(in {communication_language})
   - `specs/README.md`가 없으면 → 생성
   - README 내용: Sprint 사용법 + 폴더 구조 안내

3. **specs/{feature_name}/ 존재 확인**:
   없으면 → 자동 생성 + 안내:
   a. `specs/{feature_name}/inputs/` 생성
   b. `specs/{feature_name}/inputs/brief.md` 템플릿 생성(in {document_output_language}):
      섹션 제목과 플레이스홀더 텍스트는 {document_output_language}로 작성해야 합니다.
      HTML 주석(사용자 안내)은 {communication_language}로 작성합니다.
      `## Reference Sources` 섹션 제목과 하위 섹션 제목은 항상 영어(기계 파싱 가능)입니다.

      예시 (document_output_language=Korean, communication_language=Korean인 경우):
      ```markdown
      # {feature_name}

      ## 배경
      (이 기능이 필요한 이유를 작성하세요)

      ## 만들어야 할 기능
      (구체적인 기능을 설명하세요)

      ## Reference Sources

      ### GitHub
      <!-- 기존 서비스 코드가 있으면 URL과 탐색 힌트를 작성하세요 -->
      <!-- - https://github.com/{owner}/{repo} -->
      <!--   탐색 힌트: 관련 모듈 경로, 주의사항 등 -->

      ### Figma
      <!-- Figma 디자인 URL이 있으면 작성하세요 -->
      <!-- - https://figma.com/design/{fileKey}/... -->

      ### Policy Docs
      <!-- Scanner가 우선 탐색할 정책/도메인 문서명 -->
      <!-- - document-name.md -->

      ### Scan Notes
      <!-- Brownfield 탐색 시 참고할 자유 형식 메모 -->
      ```
   c. 메시지(in {communication_language}):
      ```
      Sprint 프로젝트 생성 완료: {feature_name}

      specs/{feature_name}/inputs/brief.md

      brief.md를 작성한 후 다시 실행하세요:
        /sprint {feature_name}

      참조 문서(회의록, 기획서 등)가 있으면 inputs/에 함께 넣어주세요.
      brief.md 하단의 '참고 소스' 섹션에 GitHub repo URL, Figma URL을 선언하면
      Sprint이 기존 시스템을 자동으로 분석합니다.
      ```
   d. 종료 (brief.md 작성 대기)

4. **전체 스캔** — `specs/{feature_name}/` 내용을 한 번에 스캔:

   a. **inputs/ 스캔**:
      - 파일 목록 수집 (brief.md 존재 여부 구분)
      - 파일 0개 또는 inputs/ 없음 → `input_status: empty`
      - brief.md만 있음 → `input_status: brief-only`
      - brief.md + 참고 자료 → `input_status: full`
      - 참고 자료만 있음 (brief.md 없음) → `input_status: references-only`

   b. **brownfield-context.md 감지**:
      - `specs/{feature_name}/brownfield-context.md` 또는 `specs/{feature_name}/planning-artifacts/brownfield-context.md` 확인
      - 발견 시 → `## L1`, `## L2` 헤딩 기반으로 레벨(L1~L4) 추정

   c. **planning-artifacts/ 감지**:
      - prd.md, architecture.md, epics-and-stories.md 확인
      - 3개 모두 있음 → `artifacts_status: complete`
      - 일부 있음 → `artifacts_status: partial`
      - 없음 → `artifacts_status: none`

   d. **BMad 산출물 감지** (`_bmad-output/planning-artifacts/`):
      - prd.md + architecture.md + (epics.md 또는 epics-and-stories.md) 모두 있음 → `bmad_output: found`

5. **스캔 결과 요약** (in {communication_language}):
   ```
   specs/{feature_name}/ scan complete

   inputs/ ({N} files):
     - {filename1}
     - {filename2}
     ...

   brief.md: {found / not found → generating from references}
   brownfield-context.md: {found ({levels}, reusing existing) / not found → will scan}
   planning-artifacts/: {complete ({N} files) / partial ({N} files) / none}
   ```

6. **입력 상태 결정 + 경로 분기**:

   **우선 확인** — 기획 산출물이 완전한 경우:
   `artifacts_status: complete` 또는 `bmad_output: found`인 경우:
   옵션 표시(in {communication_language}):
   ```
   기획 산출물이 발견되었습니다.
   위치: {path}

   [1] /specs {feature_name}으로 진행 (권장)
   [2] Sprint Auto Pipeline을 처음부터 실행
   ```
   [1] 선택: `/specs {feature_name}`으로 안내 후 종료
   [2] 선택: 아래 input_status 분기로 계속

   **input_status 분기**:

   | input_status | 경로 |
   |---|---|
   | full / brief-only | **일반 Sprint** → Step 0b |
   | references-only | **AI Brief 생성** (Step 0a-brief) → Step 0b |
   | empty | **에러** (아래 참조) |

   빈 입력 에러(in {communication_language}):
   ```
   inputs/에서 자료를 찾을 수 없습니다.

   Sprint를 시작하려면 inputs/에 자료를 추가하고 다시 실행하세요:
   - Brief, 회의록, 참고 자료 — 어떤 형식이든 가능
   - 참고 자료만으로도 충분합니다 (Brief 없이도 가능)
   ```

#### Step 0a-brief: AI Brief 생성

`input_status: references-only`인 경우 (brief.md는 없지만 참고 자료가 있을 때):

1. inputs/의 모든 참고 자료 읽기
2. 참고 자료로부터 Brief 구성:
   - 배경 / 문제 맥락
   - 구축할 핵심 기능
   - 사용자 시나리오 (참고 자료에서 발견된 경우)
   - 제약 조건 (참고 자료에서 발견된 경우)
3. `specs/{feature_name}/inputs/brief.md`에 저장
4. Brief 생성 원칙:
   - 참고 자료에 명시적으로 언급된 내용을 충실히 반영
   - AI가 추론한 항목은 `(AI-inferred)` 표시
   - 참고 자료에 없는 내용은 만들어내지 않음
5. Step 0b로 진행 (품질 등급은 Step 0c에서 결정)

#### Step 0b: inputs/ 스캔 + 방어 제한

`specs/{feature_name}/inputs/`의 파일을 스캔합니다.

**방어 제한**:
- 최대 파일 수: 20
- 최대 총 크기: 50MB (개별 파일 제한도 50MB; 초과 시 — PDF: 첫 100페이지, 기타: 첫 50,000줄)
- PDF 최대 페이지: 100 (초과 시 잘림)
- 지원 형식: `*.md`, `*.txt`, `*.pdf`, `*.png`, `*.jpg`, `*.jpeg`, `*.yaml`, `*.json`, `*.csv`
- 미지원 형식: 경고 + 건너뛰기

**초과 우선순위**:
1. `brief.md`는 **항상 포함** (제외 불가)
2. 나머지 파일은 최근 수정 순으로 정렬
3. 상위 19개 선택 (brief.md + 19 = 20)
4. 제외된 파일에 대해 경고

**참고 자료 0개 (brief.md만)**: 정상 경로. Step 0d에서 참고 자료 섹션 생략. Fallback Tier 1.

#### Step 0c: 품질 등급 판정

brief.md를 읽고 품질을 평가합니다.

**기능 수 기준**: Brief에서 동사+목적어 조합으로 표현된 독립적인 사용자 액션 수를 카운트합니다. 예: "차단", "차단 해제", "차단 목록 조회" = 3개 기능. 하위 옵션(사유 선택 등)은 기능으로 카운트하지 않습니다.

**참고 자료 보완 기준**: 2개 이상의 참고 자료 파일이 있고 최소 1개의 relevance=high이면 "보완됨"으로 처리합니다.

| 등급 | 조건 | 조치 |
|-------|-----------|--------|
| **A** (충분) | 3개 이상 기능 언급, 1개 이상 시나리오 언급, 또는 참고 자료 보완 | 정상 진행 |
| **B** (보통) | 1~2개 기능 언급, 시나리오 없음 | Step 0h 확인 시 경고 표시 |
| **C** (불충분) | 기능 0개, 키워드만 있음 | Sprint 비권장 옵션 표시 |

**Grade C 처리**:
- AskUserQuestion으로 옵션 표시(in {communication_language}):
  - [1] 그대로 진행 → `force_jp1_review: true` 플래그 설정
  - [2] Brief 보완 → 5가지 관점에서 질문 생성:
    1. 핵심 기능과 배경 (어떤 문제가 있나요? 어떤 기능을 만드나요?)
    2. 사용자 시나리오 (어떤 상황에서 사용되나요?)
    3. 제약 조건 (기존 시스템과의 연동이 필요한가요?)
    4. 우선순위 (필수 기능 vs 있으면 좋은 기능)
    5. 엣지 케이스 (실패/에러 시 예상 동작)
    답변을 brief.md의 `## Supplementary Answers` 섹션에 추가 → 재등급 판정
- **재등급 제한**: 최대 2회 보완. 2회 후에도 Grade C이면 `force_jp1_review: true`로 자동 진행.

#### Step 0d: 참고 자료 분석 + sprint-input.md 생성

참고 자료 분석 형식은 `_bmad/docs/sprint-input-format.md`를 참조하세요.

1. **brief.md 전체 읽기** — 원본 보존 (Core Brief 섹션에 원문 그대로 포함)
2. **Brief 문장 분해 + ID 할당**:
   Brief의 각 의미 단위(문장 또는 절)를 분해하고 고유 ID를 할당합니다.
   - 기능/액션을 설명하는 문장만 분해 (배경, 인사 등은 제외)
   - ID 형식: `BRIEF-{N}` (1부터 순차)
   - sprint-input.md `brief_sentences` 필드에 기록:
     ```yaml
     brief_sentences:
       - id: BRIEF-1
         text: "Allow students to block specific tutors"
       - id: BRIEF-2
         text: "Blocked tutors are excluded from matching"
       - id: BRIEF-3
         text: "Students can manage their block list"
     ```
   - 이 ID는 PRD Agent가 FR에 `(source: BRIEF-N)` 태깅할 때 사용됩니다
3. **참고 자료 읽기 + 요약**:
   - 200줄 이하: 전문 포함
   - 200줄 초과: 핵심 포인트, 제약 조건, 결정사항을 요약으로 추출
   - 이미지: 파일명 + 설명 텍스트만
   - PDF: Read 도구로 읽기 (100페이지 제한)
3. **발견된 요구사항 추출**:
   - 참고 자료에서 발견되었지만 Brief에는 없는 요구사항
   - 5개 이하: 전부 포함 (기본값: Sprint 범위에 포함)
   - 5개 초과: 상위 3개 포함, 나머지는 "다음 Sprint 후보"
4. **모순 감지**: Brief와 참고 자료 간 모순을 감지된 모순 항목에 기록 (자동 해결 없음)
5. **brief.md에서 Reference Sources 섹션 파싱** (있는 경우):
   - 헤딩 감지 (정규 → 대체): `## Reference Sources` / `## 참고 소스` / `## References`
   - 하위 섹션 파싱 (정규 → 대체):
     - `### GitHub` / `### GitHub`: URL + URL별 메모(URL 아래 들여쓴 텍스트) 추출
       - URL 패턴: `https://github.com/{owner}/{repo}` (`.git` 접미사 자동 제거)
       - 메모: 각 URL 아래의 비-URL 들여쓴 줄
     - `### Figma` / `### Figma`: URL + 메모 추출
       - URL 패턴: `https://figma.com/design/{fileKey}/...` 또는 `.../file/{fileKey}/...`
     - `### Policy Docs` / `### 정책 문서`: 문서명 수집 (줄 항목)
     - `### Scan Notes` / `### 탐색 메모`: 자유 텍스트로 수집
   - 참고 소스 섹션의 GitHub repos는 사용자 명시 의도 → AskUserQuestion 없이 다운로드 대상 확정
   - 섹션이 없거나 비어있으면 → skip (기존 auto-detect만 사용)
   - HTML 주석으로 감싸인 라인 (`<!-- ... -->`)은 skip (템플릿 상태 그대로)
6. **Figma URL 자동 감지 + 병합**:
   inputs/ 파일을 읽는 동안(위의 1-3단계), 모든 파일 내용에서 Figma URL 패턴을 감지합니다:
   - 패턴: `https://figma.com/design/{fileKey}/...` 또는 `https://figma.com/file/{fileKey}/...`
   - 매칭된 각 URL에서 `fileKey` 추출
   - 5단계의 Figma URL과 병합 → `fileKey` 기준 중복 제거
   - 참고 소스 섹션 출처: `source_file: "brief.md#참고-소스"`, 자동 감지 출처: 감지된 파일명
   - Figma URL을 찾지 못한 경우 (참고 소스, 자동 감지 모두): `external_resources.figma` 생략
7. **GitHub repo URL 자동 감지 + 병합**:
   inputs/ 파일을 읽는 동안(위의 1-3단계), 모든 파일 내용에서 GitHub repo URL 패턴을 감지합니다:
   - 패턴: `https://github.com/{owner}/{repo}` (repo 이름 뒤의 path, query, fragment는 무시)
   - 각 매칭된 URL에서 `owner/repo` 추출. 고유한 쌍을 수집.
   - 5단계의 GitHub repos와 중복 제거 (`owner/repo` 단위)
   - **참고 소스 섹션에 없는 자동 감지 repos** → AskUserQuestion으로 표시(in {communication_language}):
     ```
     GitHub 리포지토리 URL이 감지되었습니다: {owner}/{repo}
     이 리포지토리의 코드를 Sprint에 반영하면 기존 시스템 분석 정확도가 향상됩니다.
     (읽기 전용 스냅샷 다운로드, clone이 아닙니다)

     [1] 다운로드하여 반영 (Recommended)
     [2] URL만 참고 정보로 기록
     [3] 무시
     ```
     - [1] 선택 → 다운로드 대상으로 표시
     - [2] 선택 → `reference-only`로 표시 (다운로드 없음)
     - [3] 선택 → 기록하지 않음
   - **이미 참고 소스 섹션에 있는 repos** → AskUserQuestion 건너뛰기 (사용자가 이미 확인)
   - GitHub 이외의 URL (GitLab, Bitbucket 등) 감지 시 → 안내(in {communication_language}):
     "현재 GitHub URL만 자동 감지됩니다. GitLab/Bitbucket은 git clone + claude --add-dir로 추가하세요."
   - GitHub URL을 찾지 못한 경우 (참고 소스, 자동 감지 모두): `external_resources.github_repos` 생략
8. **tracking_source 설정**: `tracking_source: brief` — Sprint 경로는 항상 BRIEF-N 기반 추적 사용
9. **인과 사슬 추출**:
   Core Brief + 참고 자료에서 기능 요청의 배경을 구조화합니다.

   **레이어 구조**:
   - Layer 4 (기능 요청): 항상 Brief에서 확인됨
   - Layer 1 (현상): Brief + 참고 자료 탐색
   - Layer 2 (근본 원인): Brief + 참고 자료 탐색
   - Layer 3 (해결 근거): Brief + 참고 자료 탐색

   **판정 기준**:
   - "confirmed": 문서에서 직접 발견된 내용. `_evidence`에 해당 구절/위치 기록.
   - "inferred": AI가 맥락에서 추론. `_evidence`에 추론 근거 기록.
   - "unclear": 단서 없음.

   **chain_status 결정**:
   | chain_status | 조건 | 처리 |
   |--------------|-----------|----------|
   | **complete** | Layer 1~3 모두 "confirmed" | 질문 없이 진행 |
   | **partial** | 일부가 "inferred" | 추론된 Layer만 사용자에게 확인 |
   | **feature_only** | Layer 1~3 모두 "unclear" | 사용자에게 Layer 1~3 질문 |

   **partial인 경우** — Layer별 확인:
   "inferred" Layer만 AskUserQuestion으로 표시(in {communication_language}). 각 Layer는 독립적으로 확인/수정 가능합니다.
   ```
   다음 항목은 AI 추론입니다. 확인해 주세요:

   근본 원인: "매칭 시스템이 부정적 경험을 반영하지 않음" ← AI 추론
     [맞습니다] / [수정 필요]
   ```
   수정 시, `_source`를 `user_confirmed`로 업데이트.

   **feature_only인 경우** — 선택적 질문:
   AskUserQuestion opt-in(in {communication_language}):
   "인과 사슬(이 기능이 필요한 이유)을 추가하면 더 정확한 Sprint이 가능합니다. 추가하시겠습니까?"
   - **예** → 3가지 질문:
     1. 어떤 문제가 발생하고 있나요? (현상)
     2. 원인이 무엇이라고 생각하시나요? (근본 원인)
     3. 이 기능이 그 원인을 어떻게 해결하나요? (해결 근거)
     결과를 causal_chain + `chain_status: "complete"` 또는 `"partial"`에 기록
   - **아니요** → `chain_status: "feature_only"`, `force_cp1_causal_review: false`, 정상 진행

   결과를 sprint-input.md frontmatter `causal_chain`에 기록.

#### Step 0e: 목표 추출 + 복잡도 분류

sprint-input.md Core Brief + 발견된 요구사항에서:
- **3~5개 목표 추출** (구체적이고 검증 가능한 목적)
- **복잡도 분류**:
  - `simple`: 단일 도메인, API 3개 이하
  - `medium`: 2~3개 도메인, API 4~10개
  - `complex`: 다수 도메인, API 10개 이상 또는 복잡한 상태 관리

목표와 복잡도를 sprint-input.md frontmatter에 기록합니다.

**시간 추정 생성**:
복잡도에 따른 초기 시간 범위를 sprint-input.md frontmatter에 기록:
- simple: 30~60분
- medium: 60~120분
- complex: 120~240분

> 이는 초기 추정치이며 Sprint 실행 데이터가 축적됨에 따라 자동으로 보정됩니다.

#### Step 0f: Brownfield 소스 상태 확인 + 토폴로지 결정

##### Sub-step 0f-0: 기존 brownfield-context.md 재사용 결정

Step 0a 스캔에서 brownfield-context.md가 발견된 경우:
1. 파일 내용을 읽고 포함된 레벨(L1~L4) 확인
2. sprint-input.md frontmatter에 기록:
   ```yaml
   pre_existing_brownfield:
     path: specs/{feature_name}/brownfield-context.md
     levels: [L1, L2]  # detected levels
   ```
3. 토폴로지 결정(Sub-steps 0f-1 ~ 0f-3)은 정상 진행
4. Auto Sprint Step 1은 기존 파일 기반으로 누락된 레벨만 스캔

기존 brownfield-context.md가 없으면 → 아래 소스 감지로 진행.

**누적(AND)** 접근법으로 현재 프로젝트의 Brownfield 소스를 감지합니다. 모든 소스를 수집한 후 brownfield-context.md로 병합합니다.

##### Sub-step 0f-1: 로컬 document-project 감지

1. `_bmad/bmm/config.yaml` 읽기 → `project_knowledge` 값 추출
   - 없으면 대체 경로 탐색: `docs/`, `global/` 순서
2. `{project_knowledge}/project-scan-report.json` 확인
3. 발견 시 → 유효성 검사 (`timestamps.last_updated` 기준, 경과일 = 오늘 - last_updated):
   - **<= 30일** → `document_project_status: fresh`, 정상 사용
   - **> 30일 AND <= 90일** → `document_project_status: stale` + 갱신 제안(in {communication_language}):
     "코드베이스 분석 문서가 {N}일 전에 생성되었습니다. 갱신하시겠습니까? [1] 갱신 후 시작 [2] 현재 문서로 진행"
   - **> 90일** → `document_project_status: expired` + 경고(in {communication_language}):
     "코드베이스 분석 문서가 오래되었습니다 ({N}일). 사용하지 않습니다."
     document-project 데이터를 사용하지 않음 (document_project_path: null)
4. `document_project_path` 설정: `project_knowledge` 값 (만료 시 null)
5. 미발견 + BMad 설치됨 (`_bmad/bmm/` 존재) + 빌드 도구 있음 (Sub-step 0f-3 참조) → 자동 생성 제안(in {communication_language}):
   ```
   이 프로젝트의 첫 코드베이스 분석입니다.
   기존 API, DB, 서비스 구조를 파악하면 더 정확한 Sprint이 가능합니다.
   [1] 분석 후 시작 (~15분)
   [2] 즉시 시작
   ```
   [1] 선택: `Skill("bmad:bmm:workflows:document-project")` 실행 → 완료 후 Sub-step 0f-1 재실행
   [2] 선택: `document_project_path: null`로 진행

##### Sub-step 0f-2: 외부 데이터 소스 감지

접근 가능한 외부 데이터 소스를 감지하고 sprint-input.md에 기록합니다.

**A. `--add-dir` 디렉토리 (로컬 클론에 권장)**

1. Glob으로 알려진 경로를 시도하여 접근 가능한 `--add-dir` 디렉토리 확인
   - 각 역할(backend-docs, client-docs, svc-map): `Glob("**/*.md", path={dir})` 등 시도
   - 파일 발견 시 → 접근 가능한 외부 소스로 기록
2. 알려진 외부 repo 경로에 접근 불가한 경우:
   ```
   외부 repo 경로 '{path}'에 접근할 수 없습니다.
   Claude Code 실행 시 --add-dir 플래그로 추가하세요:
     claude --add-dir {path}
   ```
   - [1] --add-dir로 Claude Code 재시작 후 재확인
   - [2] `specs/{feature}/inputs/`에 수동으로 데이터 추가 후 재확인
   - [3] 이 외부 데이터 없이 진행 (정확도 감소)

   [1] 또는 [2] 선택: 사용자 조치 후 Sub-step 0f-2를 한 번 재실행.
   [3] 선택: 소스를 사용 불가로 기록하고 진행.

3. **감지된 repos를 sprint-input.md** `external_resources.external_repos`에 기록:
   접근 가능한 각 `--add-dir` 디렉토리에 대해 항목 추가:
   ```yaml
   external_resources:
     external_repos:
       - name: "{directory-name}"  # derived from path basename
         path: "{full accessible path}"
         access_method: "add-dir"
   ```
   Scanner는 sprint-input.md에서 이 필드를 읽어 외부 소스를 검색합니다 (`external_resources.figma`와 동일한 패턴).

**B. MCP 서버 (파일시스템이 아닌 소스용)**

1. `.mcp.json` 읽기 → 등록된 MCP 서버 목록 추출
2. 파일시스템이 아닌 MCP 서버(예: Figma): 연결 확인
3. `.mcp.json`의 파일시스템 MCP 서버 → 경고 후 `--add-dir` 권장:
   ```
   파일시스템 MCP 서버 '{server_name}'이 .mcp.json에서 감지되었습니다.
   파일시스템 MCP 서버는 Claude Code 보안에 의해 프로젝트 루트로 제한됩니다.
   외부 repo 접근에는 --add-dir를 대신 사용하세요:
     claude --add-dir {path}
   ```

##### Sub-step 0f-2b: Figma MCP 확인 (external_resources.figma가 있을 때)

Step 0d에서 Figma URL을 감지하고 sprint-input.md `external_resources.figma`에 기록한 경우:

1. Figma MCP 연결 시도: Figma MCP를 통해 `whoami` 호출
2. **성공** → sprint-input.md `external_resources.figma.status: configured` 업데이트
3. **실패** (MCP 미연결) → AskUserQuestion으로 옵션 표시(in {communication_language}):
   ```
   Figma 디자인 URL이 감지되었지만 Figma MCP가 연결되지 않았습니다.
   연결하면 Sprint이 기존 디자인 데이터를 분석할 수 있습니다.

   [1] 지금 연결 (브라우저에서 OAuth 열림)
   [2] Figma 없이 계속
   ```
   - [1] 선택: `claude mcp add --transport http figma https://mcp.figma.com/mcp` 안내 → 인증 후 `whoami` 재확인 → 상태를 `configured`로 업데이트
   - [2] 선택: 상태를 `not-configured`로 업데이트, Sprint은 Figma 데이터 없이 계속

Step 0d에서 Figma URL이 감지되지 않은 경우 → 이 서브스텝 전체 건너뛰기 (프롬프트 없음).

##### Sub-step 0f-2C: GitHub Repo 스냅샷 (external_resources.github_repos에 status: pending 항목이 있을 때)

Step 0d에서 GitHub repo URL을 감지하고 사용자가 [1] (다운로드)을 선택한 경우:

1. **gh 인증 확인**: `gh auth status` 실행
   - 실패 → AskUserQuestion으로 표시(in {communication_language}):
     ```
     GitHub 인증이 필요합니다.
     [1] gh auth login 실행 후 재시도
     [2] 해당 repo 없이 계속
     ```
     - [1] 선택: 사용자에게 `gh auth login` 실행 안내, 이후 재확인
     - [2] 선택: github_repos 상태를 `not-configured`로 업데이트, 진행

2. **status: pending인 각 repo에 대해**:
   a. 진행 메시지(in {communication_language}): "원격 리포지토리 스냅샷 다운로드 중... ({N}/{total}: {owner_repo})"
   b. **URL에서 브랜치 추출** (있는 경우):
      - URL 패턴 `https://github.com/{owner}/{repo}/tree/{branch}` → `{branch}` 추출
      - URL 패턴 `https://github.com/{owner}/{repo}` (`/tree/` 없음) → 기본 `{ref}` = `HEAD`
      - `{ref}`를 tarball API 호출 및 커밋 조회에 저장
   c. **Repo 크기 사전 확인**: `gh api repos/{owner_repo} --jq '.size'` (KB 반환)
      - 크기 < 1GB (< 1048576 KB): 조용히 진행
      - 크기 >= 1GB: 경고(in {communication_language}), 차단 없이 진행:
        ```
        ⚠ {owner_repo}: 약 {size_mb}MB. 다운로드에 수 분이 걸릴 수 있습니다.
          부분 접근(특정 디렉토리만)을 원하면: git clone + claude --add-dir 사용
          다운로드 중...
        ```
   d. **캐시 디렉토리 생성**: `mkdir -p ~/docs-cache/{feature}/{name} && chmod 700 ~/docs-cache/{feature}/{name}`
      - `{name}` = `{owner}-{repo}` (슬래시를 하이픈으로 교체)
   e. **다운로드 + 추출**: `gh api repos/{owner_repo}/tarball/{ref} | tar xz -C ~/docs-cache/{feature}/{name} --strip-components=1`
   f. **스냅샷 버전 기록**: `gh api repos/{owner_repo}/commits/{ref} --jq '.sha + " " + .commit.committer.date'`
      - 출력 파싱: `{snapshot_commit}` = 첫 번째 필드(SHA), `{snapshot_at}` = 두 번째 필드(ISO 8601)
      - `{snapshot_branch}` = URL에서 명시적으로 추출한 경우 `{ref}`, 그렇지 않으면 `"HEAD"`
   g. **성공 시** → `external_resources.external_repos`에 추가:
      ```yaml
      - name: "{owner}-{repo}"
        path: "~/docs-cache/{feature}/{name}/"
        access_method: "tarball-snapshot"
        source_url: "https://github.com/{owner_repo}"
        snapshot_commit: "{snapshot_commit}"
        snapshot_branch: "{snapshot_branch}"
        snapshot_at: "{snapshot_at}"
      ```
      github_repos 상태를 `configured`로 업데이트
   h. **실패 시** → 에러를 분류하고 AskUserQuestion으로 표시(in {communication_language}):

      | 에러 패턴 | 메시지 |
      |---------------|---------|
      | HTTP 404 | "리포지토리를 찾을 수 없습니다. URL을 확인하세요." |
      | HTTP 403 | "접근 권한이 없습니다. gh auth login을 확인하세요." |
      | DNS/network | "네트워크 연결을 확인하세요." |
      | 기타 | "다운로드 실패: {error}" |

      옵션:
      - [1] 재시도
      - [2] 해당 repo 없이 계속
      - [3] --add-dir로 수동 접근

      - [1] 선택: 2e 단계 재시도 (최대 1회 재시도)
      - [2] 선택: github_repos 상태를 `not-configured`로 업데이트, 진행
      - [3] 선택: 사용자에게 clone + --add-dir 안내, github_repos 상태를 `not-configured`로 업데이트

      참고: 버전 조회(2f 단계)만 실패한 경우 다운로드 성공으로 진행 — `snapshot_commit: "unknown"` 기록.

   i. 완료 메시지(in {communication_language}): "다운로드 완료 ({total}/{total}, {elapsed}초)"

3. **github_repos 상태 업데이트**: `configured` (모두 성공) / `not-configured` (일부 실패)

status: pending인 github_repos가 없으면 → 이 서브스텝 전체 건너뛰기.

##### Sub-step 0f-3: 토폴로지 결정 + brownfield_status 판정

**빌드 도구 파일 감지**: 다음 파일 중 프로젝트 루트에 존재하는 것이 있으면 → "빌드 도구 있음":
`package.json`, `go.mod`, `pom.xml`, `build.gradle`, `Cargo.toml`, `pyproject.toml`, `Makefile`, `CMakeLists.txt`, `mix.exs`, `Gemfile`, `composer.json`

**모노레포 감지**: 다음 파일 중 프로젝트 루트에 존재하는 것이 있으면 → "monorepo":
`pnpm-workspace.yaml`, `lerna.json`, `nx.json`, `rush.json`, `project-parts.json`, `turbo.json`

**MSA 감지 세분화**: 외부 소스 + 빌드 도구가 항상 MSA를 의미하지는 않습니다. 추가 휴리스틱:
- 빌드 도구 있음 AND 외부 소스 구성됨 AND 로컬 코드베이스의 루트 레벨에 `src/` 또는 `app/`이 있음 → `co-located` 가능성 높음 (MSA 아님)
- MSA 징후: 외부 소스가 로컬 코드베이스에 없는 서비스를 참조하거나, 엔드포인트 URL이 다른 호스트/포트를 가리킬 때
- co-located과 MSA가 모호할 때: `co-located`을 기본값으로 사용 (로컬 우선이 더 안전)

**모노레포 vs co-located 구분**:
- 모노레포는 명시적 워크스페이스 설정 파일(위에 나열)이 필요합니다. 하위 디렉토리의 다수 `package.json`만으로는 해당되지 않습니다.
- 모노레포 파일이 존재하지만 패키지가 1개만 정의된 경우 → `co-located`으로 처리 (사실상 단일 패키지)

**결정 매트릭스**:

감지 우선순위: monorepo → co-located → msa → standalone.

1. 모노레포 설정 파일 감지 AND 2개 이상 패키지 정의 → `monorepo`
2. 빌드 도구 있음 AND 외부 소스 없음 → `co-located`
3. 빌드 도구 있음 AND 외부 소스 있음 → 로컬 코드베이스에서 서비스 코드 확인:
   - 서비스 코드가 로컬에 있음 → `co-located`
   - 로컬에 서비스 코드 없음 (설정/스크립트만) → `msa`
4. 빌드 도구 없음 AND 외부 소스 있음 → `standalone`
5. 아무것도 없음 → `standalone` + `greenfield`

**대체 결정 매트릭스** (위의 휴리스틱이 결론에 이르지 못할 때):

| document-project | 외부 소스 | 빌드 도구 | 모노레포 | topology | brownfield_status |
|-----------------|-----------------|-------------|----------|----------|-------------------|
| any | any | any | yes (2+ pkgs) | `monorepo` | `configured` (doc-project/external 중 하나라도 있으면) 또는 `local-only` |
| any | any | yes | no | `co-located` | `configured` 또는 `local-only` |
| any | yes | no | no | `standalone` | `configured` |
| no | no | yes | no | `co-located` | `local-only` |
| no | no | no | no | `standalone` | `greenfield` |

- 부분적 소스 실패: `partial-failure` (토폴로지는 작동하는 소스로 결정)
- `brownfield_topology`와 `brownfield_status`를 sprint-input.md frontmatter에 기록

결과를 sprint-input.md Brownfield Status 섹션 및 frontmatter에 기록합니다.

##### Sub-step 0f-3b: 모노레포 패키지 스코핑 (topology=monorepo일 때만)

토폴로지가 `monorepo`로 결정된 경우:

1. **워크스페이스 설정 파싱**: 감지된 워크스페이스 설정 파일(pnpm-workspace.yaml, lerna.json 등)을 읽어 패키지 목록 추출
2. **AI가 관련 패키지 추천**: Brief 키워드 + 목표 기반으로 이 Sprint에 관련될 가능성이 높은 패키지 추천
3. **사용자에게 표시** via AskUserQuestion(in {communication_language}):
   ```
   모노레포가 감지되었습니다. {N}개의 패키지를 발견했습니다.

   이 Sprint에 AI가 추천하는 패키지:
   ✓ packages/auth — 관련 가능성 높음 (매칭: "login", "user")
   ✓ apps/web — 관련 가능성 높음 (매칭: "UI", "screen")
   ✓ packages/shared — 공유 유틸리티

   제외됨 (변경 가능):
   ✗ packages/billing — Brief와 무관
   ✗ apps/admin — Brief와 무관

   [1] 추천 수락 (권장)
   [2] 선택 변경
   ```
   - [1] 선택: 추천 패키지 사용
   - [2] 선택: 사용자가 포함/제외할 항목 지정 → 선택 업데이트
4. **sprint-input.md frontmatter에 기록**:
   ```yaml
   monorepo_packages:
     - path: "packages/auth"
       reason: "matches Brief keyword: login"
     - path: "apps/web"
       reason: "matches Brief keyword: UI"
     - path: "packages/shared"
       reason: "shared utilities"
   ```

##### Sub-step 0f-4: 토폴로지 로그 (사용자 인터럽트 없음)

토폴로지 감지 결과를 sprint-log.md에 기록 (없으면 생성):
```markdown
| {timestamp} | Topology Detection | topology={topology}, brownfield_status={status}, sources: document-project={dp_status}, external={N} sources, local={local_status}, figma={figma_status} |
```

이것은 로그 항목일 뿐 — 사용자 확인이나 인터럽트는 불필요합니다. 토폴로지는 사용자가 확인하고 싶을 때 JP1에서 볼 수 있습니다.

#### Step 0g: sprint-input.md 생성 + 검증 체크섬

1. **sprint-input.md 생성**: Steps 0d~0f에서 수집한 모든 데이터를 통합하여 `specs/{feature_name}/inputs/sprint-input.md`에 Write (단일 Write — 사전 Edit 없음).
   - 참고 소스 섹션의 `policy_docs`, `scan_notes` → `external_resources`에 포함
   - `github_repos`에 `notes` 필드 전달 (참고 소스 섹션에서 추출된 per-URL notes)
   - Steps 0d~0f의 모든 "sprint-input.md에 기록" 지시사항은 메모리 내 축적 → 여기서 단일 파일 Write로 구체화

2. **검증 체크섬** — sprint-input.md가 올바르게 생성되었는지 확인:

```
- Brief 원본 포함: Y/N
- 참고 자료 처리: N/M
- 발견된 요구사항: N
- 목표 매핑: N/M 목표가 Brief 키워드에 연결됨
- 모순 감지: N
- input_files ↔ Reference Materials 1:1 매칭: Y/N
```

검증 결과를 sprint-input.md frontmatter `validation`에 기록.

**Fallback Tier 결정 로직**:

| 조건 | Tier |
|-----------|------|
| brief.md 읽기 성공 + 모든 참고 자료 성공 | 1 |
| brief.md 읽기 성공 + 참고 자료 없음 (빠른 시작) | 1 |
| brief.md 읽기 성공 + 일부/전체 참고 자료 실패 | 2 |
| Case 1 진입 + brief.md 저장 실패 | 3 (메모리 내 인라인 Brief만 사용) |
| Case 2 진입 + brief.md 읽기 실패 | 4 (Sprint 중단) |
| Brief 내용에서 특정 기능/서비스를 식별할 수 없음 | 4 (Sprint 중단) |

**검증 실패 처리**:

| 실패 항목 | 조치 |
|-------------|--------|
| Brief 원본 포함: N | sprint-input.md 재생성 (1회 재시도) |
| 참고 자료 처리: M < N | Tier 2로 다운그레이드 + 경고 |
| 목표 매핑: 0 | Tier 4 (Sprint 중단 — 목표 추출 불가) |

최대 1회 재시도. 재시도 후에도 실패하면 현재 Tier에서 최선을 다해 진행.

**Tier 4 중단 메시지** (in {communication_language}):
```
Brief에서 구축할 기능을 식별할 수 없습니다.
brief.md에 다음 내용을 포함해 주세요:
- 구축할 기능 (예: "튜터 차단 기능")
- 사용자 (예: "학생")
- 예상 동작 (예: "차단된 튜터가 매칭에서 제외됨")
수정 후 다시 실행: /sprint {feature_name}
```

#### Step 0h: "Sprint를 시작할까요?" 확인

AskUserQuestion으로 계층적 확인 화면을 표시합니다.

먼저 분석 결과를 텍스트로 표시(in {communication_language}):

```markdown
## Sprint 시작 확인 — {feature_name}

### 목표 (AI가 이해한 내용)
1. {goal_1}
2. {goal_2}
3. {goal_3}

### 분석 결과
- 복잡도: {simple/medium/complex}
- 품질 등급: {A/B/C}
- 참고 자료: {N}건 분석됨
- Brownfield: {greenfield / configured / local-only / N개 소스, M개 작동 중}
- 토폴로지: {standalone / co-located / msa / monorepo}
- 코드베이스 분석: {fresh / stale / expired / not configured}
- 인과 사슬: {complete / partial / feature_only / not configured}
- 예상 시간: {N}~{M}분

### 경고 (해당 시에만 표시 — 1줄 요약 + 상세는 sprint-input.md 참조)
- 경고: 품질 등급 B — AI가 세부사항을 추론합니다
- 경고: 품질 등급 C — Brief가 불충분합니다. JP1에서 강제 검토가 예정되어 있습니다.
- 경고: 모순 {N}건 감지됨 (sprint-input.md 참조)
- 경고: Brownfield 소스 접근 불가: {source_name}
- 경고: 참고 자료 {N}건 중 {M}건 건너뛰어짐 (제한 초과 또는 미지원 형식)
- 경고: 인과 사슬 미확인 — AI 추론으로 진행합니다. JP1에서 반드시 확인하세요.

### 추가 발견된 요구사항 (해당 시에만 표시)
- [DISC-01] {내용} (출처: {filename}) — Sprint 범위에 포함
- [DISC-02] {내용} (출처: {filename}) — Sprint 범위에 포함
{5개 초과 시}
- ... 외 {N}건은 다음 Sprint 후보입니다 (sprint-input.md 참조)

상세: specs/{feature_name}/inputs/sprint-input.md
```

이후 AskUserQuestion(in {communication_language}):

| 옵션 | 설명 |
|--------|-------------|
| **계속** | Sprint 시작 |
| **조정** | 목표/복잡도/발견된 요구사항 수정 (자유 입력 → sprint-input.md 업데이트 → 재확인) |
| **종료** | 중단 (inputs/ 보존; brief.md 수정 후 `/sprint {feature_name}`으로 재시작) |

**조정 처리**: 사용자 자유 입력 → 메모리에서 목표, 복잡도, discovered_requirements 업데이트 → 기존 sprint-input.md 삭제 → 업데이트된 데이터로 sprint-input.md 재Write (파일이 존재하지 않을 때 Write 허용하는 hook) → Step 0h 확인 재표시.

**종료 처리 메시지** (in {communication_language}):
```
Sprint가 중단되었습니다.

보존된 산출물:
- specs/{feature_name}/inputs/ (원본 Brief + 참고 자료 + sprint-input.md)

재시작: /sprint {feature_name}
Brief 수정 후 재시작: brief.md 수정 → /sprint {feature_name}
```

#### Step 0h → Auto Sprint 시작

계속 선택 시, `@auto-sprint` 에이전트를 호출합니다:

```
Task(subagent_type: "general-purpose")
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

이후 Auto Sprint이 자동 실행됩니다:

### Phase 1: 기획 → 명세
1. Brownfield 2-Pass 수집 (sprint-input.md 참조)
2. BMad Auto-Pipeline (Brief → PRD → Architecture → Epics)
3. 각 단계에서 Scope Gate 검증
4. 설계 문서 3종 + 태스크 생성 (@deliverable-generator specs-only)

→ **판단 시점 1**: 명세 검토 (태스크 구조, Entropy Tolerance, File Ownership)
- **승인** → Phase 2로 진행
- **피드백** → 영향받는 단계부터 재실행
- **중단** → 종료

### Phase 2: 산출물
5. 풀스택 산출물 생성 (@deliverable-generator deliverables-only)
6. Sprint 출력 패키지 조립

→ **판단 시점 2**: Sprint 출력 검토 (프로토타입 + 명세)
- **승인** → `/parallel` 실행 (병렬 실행)
- **피드백** → 산출물 재생성 또는 명세 수정
- **중단** → 종료

## 출력물
- `specs/{feature}/inputs/` — 사용자 원본 + sprint-input.md (SSOT)
- `specs/{feature}/planning-artifacts/` — BMad 산출물 (PRD, Architecture, Epics, Brownfield Context)
- `specs/{feature}/` — 설계 문서 3종 + 산출물
- `specs/{feature}/preview/` — 작동하는 프로토타입
