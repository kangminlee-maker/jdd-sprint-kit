# Phase C 구현 명세 — 파이프라인 연결

> **상태**: 설계 완료, 구현 대기
> **대상 파일**: `.claude/commands/specs.md`, `.claude/commands/sprint.md` + 크로스 파일 3개
> **상위 문서**: `docs/design/jdd-implementation/scope.md`, `docs/judgment-driven-development.md`
> **선행**: Phase A 완료, Phase B 완료

---

## 확정된 설계 결정

### 1. `tracking_source` 명시적 필드 — 값 결정

Phase B에서 에이전트가 `tracking_source` 필드를 읽어 분기하도록 구현했다. Phase C에서 이 필드의 **값 결정 위치**를 확정한다.

| 진입 커맨드 | tracking_source 값 | 결정 위치 | 근거 |
|------------|-------------------|----------|------|
| `/sprint` | `brief` | sprint.md Step 0d | Sprint은 항상 BRIEF-N 분해를 수행 |
| `/specs` (sprint-input.md 없음) | `success-criteria` | specs.md Step 0에서 생성 | Guided/Direct는 Brief 분해 없음 |
| `/specs` (sprint-input.md 있음) | 기존 값 유지 | — | Sprint 경유 후 /specs 재실행 케이스 |

하류 에이전트(deliverable-generator, scope-gate)는 `sprint_input_path`를 인자로 받지 않고, `planning_artifacts` 경로에서 `../inputs/sprint-input.md`를 **자체 추론**한다. specs.md가 명시적으로 경로를 전달할 필요 없음.

### 2. `force_cp1_review` → `force_jp1_review` 일괄 변경

Phase B에서 유보했던 필드명 변경을 Phase C에서 실행한다.

**변경 대상**:
- `.claude/commands/sprint.md` — 필드 정의 (3곳)
- `.claude/agents/auto-sprint.md` — 필드 소비 (4곳, Phase C 주석 이미 삽입)
- `.claude/commands/parallel.md` — CP2 참조 (1곳)
- `.claude/hooks/desktop-notify.sh` — 주석 (1곳)

**변경하지 않는 것**:
- `_bmad/docs/sprint-input-format.md` — BMad 불변 제약. Phase D에서 Sprint Kit 리포 업데이트 시 반영
- `force_cp1_causal_review` — 이미 deprecated. 이름 변경 없이 유지

> **Phase D 마이그레이션 메모**: Sprint Kit 리포 업데이트 시, (1) `_bmad/docs/sprint-input-format.md`의 `force_cp1_review` → `force_jp1_review` 반영, (2) 기존 sprint-input.md 보유 사용자를 위한 `tracking_source` 필드 추가 가이드 포함.

### 3. BMad 산출물 경로 해소

`/specs`가 `_bmad-output/planning-artifacts/`를 자동 탐색하여 Sprint Kit 경로로 배치한다.
**복사** 방식 사용 (원본 보존). 심링크 사용 안 함.

파일 이름 매핑:

| BMad 원본 | Sprint Kit 대상 | 처리 |
|-----------|----------------|------|
| `prd.md` | `prd.md` | 그대로 복사 |
| `architecture.md` | `architecture.md` | 그대로 복사 |
| `epics.md` | `epics-and-stories.md` | 이름 변환 |
| `product-brief.md` | `product-brief.md` | 그대로 복사 (있을 때만) |
| `ux-design-specification.md` | `ux-design-specification.md` | 그대로 복사 (있을 때만) |

### 4. `/sprint`의 BMad 산출물 감지

`/sprint` 실행 시 **Case 2(feature-name)에서만** `_bmad-output/planning-artifacts/`를 확인한다.
Case 1(Inline Brief)에서는 스킵 — 새 Sprint을 시작하려는 의도가 명확하므로 이전 BMad 잔여물에 반응하지 않는다.

### 5. Brownfield 초기화 통합

현재 specs.md는 brownfield-context.md가 없을 때 "사용자에게 안내"만 한다.
Phase C에서 Brownfield Broad Scan을 `/specs` 내에서 자동 제안하도록 변경한다.
**Brownfield 스캔 완료 후 sprint-input.md의 `brownfield_status`, `brownfield_topology` 필드를 갱신한다.**

### 6. `/specs` feature-name 자동 추출

`/specs` 인자 없이 실행 시, `_bmad-output/planning-artifacts/`에 산출물이 있으면 PRD에서 feature-name을 추출하여 제안한다.
JDD 원칙 6 "Auto-Context, Human-Judgment" — 이름 추출은 자동, 확인은 사용자.

---

## 파일 1: `.claude/commands/specs.md`

### 변경 개요

| 영역 | 변경 성격 | 분량 |
|------|----------|------|
| $ARGUMENTS + Step 0 산출물 탐색 | 새 섹션 작성 | ~50줄 |
| sprint-input.md 최소 생성 | Step 0 내 삽입 | ~15줄 |
| Brownfield 초기화 개선 + sprint-input.md 갱신 | Step 1 테이블 수정 + 갱신 단계 | ~15줄 |

### 수정 1: `$ARGUMENTS` 변경 + Step 0 확장

현재:
```markdown
## Inputs
$ARGUMENTS: 사용하지 않음
```

변경:
```markdown
## Inputs

`$ARGUMENTS`: feature-name (kebab-case, 선택)
- `/specs feature-name` — feature 이름 지정
- `/specs` (인자 없음) — BMad 산출물 자동 탐색 + feature-name 제안
```

현재 Step 0 전체를 다음으로 교체:

```markdown
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
   - `tracking_source` 미존재 → frontmatter에 `tracking_source: success-criteria` 필드 추가 (파일 편집)
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
> `complexity` 필드 생략 — specs-direct 경로에서 하류 에이전트가 소비하지 않는 필드. Entropy 할당은 Architecture + brownfield 기반 (tracking_source: success-criteria 분기).
```

### 수정 2: Brownfield 초기화 개선 + sprint-input.md 갱신

Step 1 테이블의 "없음" 행을 변경:

현재:
```markdown
| 없음 | 사용자에게 안내: Pass 1 (Broad Scan) 필요 |
```

변경:
```markdown
| 없음 | Brownfield 스캔 제안 (아래 참조) |
```

테이블 뒤에 삽입:

```markdown
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
```

---

## 파일 2: `.claude/commands/sprint.md`

### 변경 개요

| 영역 | 변경 성격 | 분량 |
|------|----------|------|
| CP→JP 용어 전환 (5곳) | 기계적 치환 | ~5줄 |
| force_cp1_review → force_jp1_review (3곳) | 기계적 치환 | ~3줄 |
| tracking_source 필드 추가 (Step 0d) | 삽입 | ~3줄 |
| BMad 산출물 감지 (Step 0a, Case 2만) | 삽입 | ~15줄 |

### 수정 1: CP→JP 용어 전환

| 위치 | 현재 | 변경 |
|------|------|------|
| L18 | `2개의 Checkpoint에서 사람이 확인` | `2개의 Judgment Point에서 사람이 확인` |
| L364 | `CP1에서 강제 리뷰가 예정되어 있습니다` | `JP1에서 강제 리뷰가 예정되어 있습니다` |
| L368 | `CP1에서 반드시 확인이 필요합니다` | `JP1에서 반드시 확인이 필요합니다` |
| L427 | `→ **Checkpoint 1**: Specs 리뷰` | `→ **Judgment Point 1**: Specs 리뷰` |
| L436 | `→ **Checkpoint 2**: Sprint Output 리뷰` | `→ **Judgment Point 2**: Sprint Output 리뷰` |

### 수정 2: force_cp1_review → force_jp1_review

| 위치 | 현재 | 변경 |
|------|------|------|
| L119 | `force_cp1_review: true` | `force_jp1_review: true` |
| L127 | `force_cp1_review: true` | `force_jp1_review: true` |
| L412 | `flags: { force_cp1_review: {true/false} }` | `flags: { force_jp1_review: {true/false} }` |

### 수정 3: tracking_source 필드 추가

Step 0d (L129) 참고 자료 분석 + sprint-input.md 생성 섹션에서, sprint-input.md frontmatter 필드에 `tracking_source: brief`를 추가한다.

L159 (`sprint-input.md 작성` 항목) 뒤에 삽입:

```markdown
7. **tracking_source 설정**: `tracking_source: brief` — Sprint 경로는 항상 BRIEF-N 기반 추적
```

### 수정 4: BMad 산출물 감지

Step 0a (L40) 진입 분기 섹션의 **Case 2 (Feature Name) 시작 부분** (L67)에 삽입.
**Case 1 (Inline Brief)에서는 실행하지 않는다** — 새 Sprint을 시작하려는 의도가 명확하므로.

```markdown
**Case 2: Feature Name** (`/sprint tutor-exclusion`)
1. feature_name 검증: `/^[a-z0-9][a-z0-9-]*$/`
   - 검증 실패 시 에러: "feature_name은 영문 소문자, 숫자, 하이픈만 사용 가능합니다."

2. **BMad 산출물 감지** (Case 2에서만):
   `_bmad-output/planning-artifacts/` 디렉토리를 확인한다.
   다음 3개 파일이 **모두** 존재하면 BMad 산출물로 판정:
   - `prd.md`
   - `architecture.md`
   - `epics.md` 또는 `epics-and-stories.md`

   BMad 산출물 발견 시:
   ```
   BMad planning artifacts가 발견되었습니다 (_bmad-output/planning-artifacts/).
   이미 기획이 완료된 상태입니다.

   [1] /specs {feature_name}으로 바로 진행 (권장)
   [2] Sprint Auto Pipeline로 처음부터 실행
   ```

   [1] 선택 시: `/specs {feature_name}` 안내 후 종료 (사용자가 직접 실행)
   [2] 선택 시: 정상 진행 (기존 Case 2 로직)

3. `specs/{feature_name}/inputs/` 존재 확인
   ...
```

---

## 파일 3~5: 크로스 파일 변경

### `.claude/agents/auto-sprint.md` — force_cp1_review → force_jp1_review

Phase B에서 이미 "Phase C에서 변경 예정" 주석이 삽입되어 있다. 해당 주석을 제거하고 필드명을 변경한다.

| 위치 | 현재 | 변경 |
|------|------|------|
| L25 | `force_cp1_review: bool` (JP1 C등급 Brief 경고 배너. 필드명은 Phase C에서 변경 예정) | `force_jp1_review: bool` (JP1 C등급 Brief 경고 배너) |
| L66 | `force_cp1_review: bool` | `force_jp1_review: bool` |
| L69 | `If \`force_cp1_review\` flag` | `If \`force_jp1_review\` flag` |
| L421 | `\`force_cp1_review: true\`인 경우 추가 경고:` | `\`force_jp1_review: true\`인 경우 추가 경고:` |

### `.claude/commands/parallel.md` — CP2 → JP2

| 위치 | 현재 | 변경 |
|------|------|------|
| L15 | `CP2 승인 후 실행` | `JP2 승인 후 실행` |

### `.claude/hooks/desktop-notify.sh` — 주석 업데이트

| 위치 | 현재 | 변경 |
|------|------|------|
| L3 | `# macOS only — CP1/CP2 대기 시 사용자에게 알림` | `# macOS only — JP1/JP2 대기 시 사용자에게 알림` |

---

## 변경하지 않는 부분

| 영역 | 파일 | 이유 |
|------|------|------|
| Format Guide | `_bmad/docs/sprint-input-format.md` | BMad 불변 제약. Phase D에서 반영 |
| Brownfield Scanner | `brownfield-scanner.md` | Phase C 대상 아님 |
| Worker / Judge 에이전트 | `worker.md`, `judge-*.md` | Phase C 대상 아님 |
| preview / validate / circuit-breaker | `.claude/commands/` | CP/JP 참조 없음, 변경 불필요 |
| Rules 파일 3개 | `.claude/rules/` | Phase A에서 완료 |
| deliverable-generator / scope-gate | `.claude/agents/` | Phase B에서 완료 |
| `force_cp1_causal_review` | sprint.md L199 | 이미 deprecated. 이름 변경 불필요 |

---

## 구현 순서

```
1. specs.md $ARGUMENTS 변경 + Step 0 전체 교체 (auto-detect + 탐색 + 완전성 + sprint-input.md)
2. specs.md Step 1 Brownfield 개선 + sprint-input.md 갱신 단계
3. sprint.md CP→JP 용어 전환 (5곳, 기계적)
4. sprint.md force_cp1_review → force_jp1_review (3곳)
5. sprint.md tracking_source 필드 추가
6. sprint.md BMad 산출물 감지 (Case 2 내 삽입)
7. auto-sprint.md force_cp1_review → force_jp1_review (4곳 + Phase C 주석 제거)
8. parallel.md CP2 → JP2
9. desktop-notify.sh 주석 업데이트
10. 전체 파일 CP/force_cp1 잔여 검색 (force_cp1_causal_review 제외)
```

---

## 검증 방법

### specs.md 검증
- `/specs` 인자 없이 실행 시 BMad auto-detect 로직이 있는지 확인
- Step 0b에 2가지 탐색 경로가 명시되었는지 확인
- Step 0c에 부분 산출물 처리 테이블이 있는지 확인
- Step 0d에 sprint-input.md 최소 생성 로직이 있는지 확인
- 최소 sprint-input.md에 `complexity` 필드가 **없는지** 확인
- 최소 sprint-input.md에 `tracking_source: success-criteria`와 `force_jp1_review` 포함 확인
- Step 0d → Step 1 순서 의존성이 명시되었는지 확인
- Step 1 Brownfield 완료 후 sprint-input.md `brownfield_status`/`brownfield_topology` 갱신이 명시되었는지 확인

### sprint.md 검증
- Checkpoint 문자열 0건 확인
- force_cp1_review 문자열 0건 확인 (force_cp1_causal_review 제외)
- `tracking_source: brief` 설정 위치 확인
- BMad 산출물 감지가 **Case 2에서만** 발동하는지 확인 (Case 1 Inline Brief에서 스킵)

### 크로스 파일 검증
- `.claude/` 전체에서 `force_cp1_review` 검색 → 0건 (force_cp1_causal_review 제외)
- `.claude/` 전체에서 `CP1|CP2|Checkpoint` 검색 → 0건
- `tracking_source` 값이 sprint.md(brief)와 specs.md(success-criteria)에서 일관되는지 확인
- auto-sprint.md에서 "Phase C" 주석이 모두 제거되었는지 확인

### E2E 시나리오 (수동 확인)

**시나리오 1: Guided 경로 (인자 있음)**
1. BMad 12단계 → `_bmad-output/planning-artifacts/`에 PRD + Architecture + Epics
2. `/specs tutor-exclusion` 실행
3. 확인: `specs/tutor-exclusion/planning-artifacts/`에 파일 복사됨
4. 확인: `specs/tutor-exclusion/inputs/sprint-input.md` 생성 (`tracking_source: success-criteria`, `complexity` 없음)
5. 확인: Brownfield 스캔 제안 표시
6. Brownfield 실행 시: sprint-input.md에 `brownfield_status: configured` 갱신 확인

**시나리오 2: Guided 경로 (인자 없음 — auto-detect)**
1. BMad 12단계 → `_bmad-output/planning-artifacts/`에 PRD("Tutor Exclusion") + Architecture + Epics
2. `/specs` 실행 (인자 없음)
3. 확인: "BMad planning artifacts를 발견했습니다. PRD: 'Tutor Exclusion' → feature-name: tutor-exclusion" 제안
4. 확인 후: 시나리오 1과 동일 흐름

**시나리오 3: Sprint 경로**
1. `/sprint "튜터 차단 기능"` 실행
2. 확인: sprint-input.md에 `tracking_source: brief` 포함
3. 확인: `force_jp1_review` 필드명 사용
4. 확인: BMad 산출물 감지 **스킵** (Inline Brief = Case 1)

**시나리오 4: Sprint에서 BMad 산출물 감지 (Case 2)**
1. `_bmad-output/planning-artifacts/`에 BMad 산출물 존재
2. `/sprint tutor-exclusion` 실행 (Case 2: Feature Name)
3. 확인: "BMad planning artifacts가 발견되었습니다. /specs로 바로 진행하시겠어요?" 안내 표시

**시나리오 5: Sprint Inline Brief + BMad 잔여물 (Case 1)**
1. `_bmad-output/planning-artifacts/`에 **이전 프로젝트의** BMad 산출물 존재
2. `/sprint "새로운 기능 설명"` 실행 (Case 1: Inline Brief)
3. 확인: BMad 감지 **스킵** → 정상적으로 새 Sprint 시작

**시나리오 6: 기존 파이프라인 회귀**
1. `/sprint "새 기능"` — BMad 산출물 없는 환경에서 정상 동작 확인
2. `generated_by: sprint-onboarding-phase-0`인 기존 sprint-input.md에서 auto-sprint 정상 동작 확인

---

## Party Mode 리뷰 반영 기록

| # | 이슈 | 제기자 | 결론 | 반영 위치 |
|---|------|--------|------|----------|
| 1 | feature-name 자동 추출 | Mary | **반영**: auto-detect + 사용자 확인 | specs.md Step 0a |
| 2 | 부분 산출물 경로 힌트 | John | **불필요**: Guided/Direct 경로만 안내 | — |
| 3 | complexity 하드코딩 | Winston | **필드 생략**: 하류 미소비 | specs.md Step 0d |
| 4 | Brownfield→sprint-input.md 갱신 | Winston | **반영 (블로커)**: Step 1 후 갱신 | specs.md Step 1 |
| 5 | Pre-check 오발동 | Bob | **반영 (블로커)**: Case 2에서만 발동 | sprint.md 수정 4 |
| 6 | sprint_input_path 전달 | Scope Gate | **불필요**: 에이전트 자체 추론 | 설계 결정 1에 메모 |
| 7 | tracking_source 추가 방식 | DG | **불필요**: 기존 파일 없는 환경 | Phase D 마이그레이션 메모 |
| 8 | Broad Scan 순서 의존성 | Brownfield | **반영 (블로커)**: Step 0d→Step 1 명시 | specs.md Step 0d, Step 1 |
| 9 | 에러 메시지 UX | Sally | **"planning artifacts" 유지**: BMad 확립 용어 | — |
