# Phase B 구현 명세 — Judgment Point 리프레이밍

> **상태**: 완료 (2026-02-16)
> **대상 파일**: `.claude/agents/auto-sprint.md`, `.claude/agents/scope-gate.md`, `.claude/agents/deliverable-generator.md`
> **상위 문서**: `docs/design/jdd-implementation/scope.md`, `docs/judgment-driven-development.md`
> **선행**: Phase A 완료 (`docs/design/jdd-implementation/phase-a-spec.md`)

---

## 확정된 설계 결정

### 1. Layer 0 자동 승인 → 정보 배너

- JP1은 **모든 경로에서 의무** (Sprint / Guided / Direct)
- 기존 4조건은 자동 승인 게이트가 아니라 **정보 배너**로 전환
- 사용자가 배너를 보고 검토 깊이를 자연스럽게 조절
- 나중에 "피드백이 별로 없는 경우가 많다"고 판단될 때 재도입 가능

### 2. JP1 Visual Summary — 경로 독립적 설계

- 서사(narrative) 기본 표시, 상세 추적 테이블은 Advanced(Layer 3)로 이동
- 경로별 프레이밍 차이는 있지만, 데이터 구조는 동일
- auto-sprint.md에서 설계 → Phase C에서 specs.md가 재사용 가능하도록

### 3. 경로 분기 — `tracking_source` 명시적 필드

- agents는 `tracking_source` 필드만 읽고 분기
- `sprint-input.md` 없으면 → `success-criteria` 기본값
- 필드 값 결정(자동/사용자 선택)은 Phase C (commands/) 영역

### 4. JP2→JP1 역방향 루프

- 별도 메뉴 옵션이 아닌 R(Redirect) 내 "요구사항 재검토" 서브옵션
- 기존 "설계 수정 필요"와 구분: JP1을 반드시 재통과

### 5. `force_cp1_review` 필드명 유지

- Phase B에서 필드명 변경하지 않음 (Phase C에서 일괄 변경)
- 내부 문서에서 JP 용어로 전환하되, 필드명은 주석으로 설명
- 역할 변경: "자동 승인 비활성화" → "C등급 Brief 경고 배너 표시"

---

## 파일 1: `.claude/agents/auto-sprint.md`

### 변경 개요

| 영역 | 변경 성격 | 난이도 |
|------|----------|--------|
| CP→JP 용어 일괄 전환 (~30곳) | 기계적 치환 | 낮음 |
| Layer 0 자동 승인 블록 제거 → 정보 배너 | 블록 교체 | 중간 |
| JP1 Visual Summary 재설계 | 내용 재구성 | 높음 |
| JP2 역방향 루프 추가 | 테이블 행 추가 | 낮음 |
| force_cp1_review 주석 처리 | 주석 추가 | 낮음 |

### 수정 1: CP→JP 용어 일괄 전환

다음 패턴을 전체 파일에서 치환한다:

| 현재 | 변경 |
|------|------|
| `CP1` / `CP2` | `JP1` / `JP2` |
| `Checkpoint 1` / `Checkpoint 2` | `Judgment Point 1` / `Judgment Point 2` |
| `checkpoint` (소문자) | `judgment point` |
| `cp1` / `cp2` (소문자) | `jp1` / `jp2` |

**주요 위치**:
- L3 frontmatter description
- L9 Role
- L17 Communication Style
- L107 시간 예측
- L382 Step 4 제목
- L423 Visual Summary 제목
- L504~514 A/P/C 메뉴
- L554 Step 6 제목
- L572 Visual Summary 제목
- L625~635 Step 6b 메뉴
- L703~708 Context Passing
- L747, L780 Advanced Elicitation 제목
- L812 Rules #9

**예외**: `force_cp1_review` 필드명은 유지 (설계 결정 #5).

### 수정 2: force_cp1_review 주석 처리

Step 0 (L66~69)의 `force_cp1_review` 관련 내용을 다음으로 교체:

```markdown
4. If `force_cp1_review` flag → JP1에서 C등급 Brief 경고 배너 표시
   (필드명은 Phase C에서 `force_jp1_review`로 변경 예정)
```

Input 섹션 (L25)에 주석 추가:

```markdown
- `flags`: `{ force_cp1_review: bool }` (JP1 C등급 Brief 경고 배너. 필드명은 Phase C에서 변경 예정)
```

### 수정 3: Layer 0 자동 승인 → 정보 배너

Step 4a (L391~486) 전체를 다음으로 교체:

```markdown
#### Step 4a: 정보 배너 + Visual Summary 생성

산출물에서 **메타데이터만** 추출하여 JP1 시각화를 생성한다. 전문 읽기 금지 — Conductor 원칙 유지.

**데이터 소스**:
- readiness.md: JP1 데이터 (scenario_summaries, tracking_completeness, ai_inferred_count, side_effect_high_count, scope_gate_summary)
- requirements.md: FR 목록 + source 태그
- design.md: Brownfield 통합점
- tasks.md: Task Summary 테이블
- sprint-input.md: tracking_source, brief_sentences (존재 시)

**정보 배너 생성**:

readiness.md에서 다음 데이터를 추출하여 배너를 생성한다:

| 조건 | ✓ 표시 | ⚠ 표시 |
|------|--------|--------|
| 요구사항 추적 완전성 | 추적 소스 항목 100% FR에 매핑 | 미매핑 항목 존재 |
| AI 추론 항목 | 0개 | 1개 이상 |
| 기존 시스템 위험 | Side-effect HIGH 0개 | HIGH 1개 이상 |
| 구조 검증 | Scope Gate 전원 PASS | FAIL 존재 |

배너 출력:

```
## Judgment Point 1: {feature_name}

{4조건 모두 ✓일 때}
✓ 요구사항 추적 완전 ({N}/{N}) | ✓ AI 추론 항목 없음 | ✓ 기존 시스템 위험 없음 | ✓ 구조 검증 통과

{미충족 항목 있을 때}
⚠ 요구사항 추적 {N}/{M} | ⚠ AI 추론 항목 {N}개 | ✓ 기존 시스템 위험 없음 | ✓ 구조 검증 통과
```

`force_cp1_review: true`인 경우 추가 경고:
```
⚠ Brief 등급 C — AI 추론 비율이 높을 수 있습니다. 꼼꼼히 확인하세요.
```

**정보 배너 다음에 항상 풀 Visual Summary를 표시한다.**
```

### 수정 4: JP1 Visual Summary 재설계

기존 4-Section (L420~486)을 다음 3-Section + Advanced 구조로 교체:

```markdown
**Visual Summary 출력 형식**:

```markdown
### Section 1: 고객에게 이런 제품을 만듭니다

**시나리오 1**: {scenario_summary_1}
→ {관련 FR 번호}

**시나리오 2**: {scenario_summary_2}
→ {관련 FR 번호}

**시나리오 3**: {scenario_summary_3}
→ {관련 FR 번호}

{추적 소스 미매핑 항목이 있으면}
⚠ **확인 필요**: 다음 항목이 설계에 반영되지 않았습니다:
→ {미매핑 항목 목록}

### Section 2: 추가 발견 항목

{tracking_source == "brief"인 경우 — Sprint 경로}
#### 참고 자료에서 발견 (근거 있음)
| 항목 | 출처 | 만들 것 |
|------|------|--------|
| {요구사항} | {filename} | {FR/Task 요약} |

#### AI 추론으로 추가 (사용자 확인 필요)
| 항목 | AI 판단 근거 | 만들 것 |
|------|-------------|--------|
| {요구사항} | "{근거}" | {FR/Task 요약} |

{AI 추가 항목 0개면 "AI가 추가한 항목이 없습니다." 한 줄만}

{tracking_source == "success-criteria"인 경우 — Guided/Direct 경로}
#### Specs 변환 확인
| PRD 요구사항 | Specs 반영 | 상태 |
|-------------|-----------|------|
| {Success Criteria 항목} | {requirements.md 매핑} | 반영됨 / 미반영 |

### Section 3: 기존 시스템 영향

**고객에게 보이는 변경:**
{brownfield side-effect를 고객 관점으로 번역}
- "{기존 화면/기능}에서 {변경 내용}"
- ...

{HIGH 위험도 항목이 있으면}
⚠ **확인 필요**: 기존 사용자 경험에 큰 영향이 있는 변경 {N}개

**기술적 영향 (참고용):**
| 영역 | 변경 | 위험도 |
|------|------|--------|
| {API/DB/서비스} | {변경 내용} | LOW/MEDIUM/HIGH |

{brownfield가 없거나 greenfield면 "신규 프로젝트입니다. 기존 시스템 영향이 없습니다."}
```

> 지금까지의 Sprint 과정에서 방향이 다르다고 느껴지는 부분이 있으셨나요?
> 있다면 [R] Redirect를 선택하여 피드백을 남겨주세요.

**IMPORTANT — Section 1~3만 출력한다.** 아래 Advanced 항목은 절대 기본 표시하지 않는다.

**Advanced (Layer 3)**: [A] Advanced Elicitation 선택 시에만 표시:
- 추적 소스 ↔ FR 상세 매핑 테이블
- Epic → Story → Task 계층 (Mermaid graph TD)
- Task DAG 의존성 (Mermaid graph LR)
- Entropy Tolerance 분포
- File Ownership 배정
- Scope Gate 상세 리포트
- API Endpoints 인벤토리
- Data Model 요약
- Causal Chain Alignment + FR Linkage (chain_status가 feature_only가 아닌 경우에만)
```

### 수정 5: JP2 역방향 루프 추가

Step 6 피드백 라우팅 테이블 (L738~743)에 행 추가:

```markdown
### Judgment Point 2 피드백 (Sprint Output 단계)

| 피드백 유형 | 재시작 지점 |
|------------|-----------|
| 요구사항 재검토 | Step 2b (PRD부터, JP1 재통과) — "만들려는 것 자체를 다시 생각해야 합니다" |
| 설계 수정 필요 | Step 2 (해당 BMad 단계부터, JP1 재통과) |
| 명세/API 조정 | Step 5 (Deliverables만 재생성) |
| 프로토타입 조정 | Step 5 (Deliverables만 재생성) |
```

Step 6b A/P/C 메뉴의 R(Redirect) 설명에 추가:

```markdown
| **R** | Redirect | 피드백 라우팅 (Deliverables 재생성 또는 JP1로 돌아가기) |
```

### 수정 6: JP2 Visual Summary CP→JP 전환

Step 6a (L556~620)에서:
- "## Checkpoint 2" → "## Judgment Point 2"
- "CP1 Side-effects" → "JP1 Side-effects" (L597)
- "CP2 검증용" 참조 → "JP2 검증용"

### 수정 7: Context Passing 및 Rules 업데이트

Context Passing (L699~710):
- "CP Summary" → "JP Summary"
- "CP1 Advanced(Layer 3)" → "JP1 Advanced(Layer 3)"
- "CP1/CP2" → "JP1/JP2"
- "CP1 Section 1 Brief 반영 확인용" → "JP1 Section 1 추적 소스 반영 확인용"
- "Readiness 데이터 — readiness.md에서 추출. CP1/CP2 Section 4/3 Readiness 판정용"
  → "Readiness 데이터 — readiness.md에서 추출. JP1 정보 배너 + JP2 Section 3 판정용"

Advanced Elicitation Protocol (L745~801):
- "CP1 질문" → "JP1 질문"
- "CP2 질문" → "JP2 질문"

Rules (L803~812):
- Rule #9: "CP1 Advanced(Layer 3)" → "JP1 Advanced(Layer 3)"

---

## 파일 2: `.claude/agents/scope-gate.md`

### 변경 개요

| 영역 | 변경 | 분량 |
|------|------|------|
| goals 빈 배열 fallback | Stage 1 시작 부분에 삽입 | ~10줄 |
| 고객 영향 열 | Output Format에 추가 | ~8줄 |

### 수정 1: goals 빈 배열 fallback (Stage 1 앞에 삽입)

L26 (Stage 1 제목) 앞에 삽입:

```markdown
### Goals Fallback

goals 배열이 비어있는 경우 (Guided/Direct 경로):

1. `artifact_path`에서 PRD 경로를 추론한다:
   - artifact_path가 `specs/{feature}/planning-artifacts/` 하위 → 같은 디렉토리의 `prd.md`
   - artifact_path가 `specs/{feature}/requirements.md` 등 → `specs/{feature}/planning-artifacts/prd.md`
2. PRD의 **Success Criteria > Measurable Outcomes** 섹션에서 목표 3~5개를 추출한다
3. 추출한 goals를 Stage 1 커버리지 매핑에 사용한다
4. sprint-input.md에 역기록하지 않는다 (Scope Gate 내부에서만 사용)

**적용 범위**: goals fallback은 **prd 이후 단계**(prd, architecture, epics, spec)에서만 적용한다.
product-brief 단계에서 goals가 비어있으면 Stage 1을 SKIP하고 Stage 2-3만 실행한다.
```

### 수정 2: 고객 영향 열 (Output Format 보완)

Stage 1 Structured Probe 테이블 (L30~35)에 열 추가:

```markdown
| Goal | Covered By | Section/Line | Customer Impact | Status |
|------|-----------|--------------|-----------------|--------|
| {goal_1} | {specific item} | {section} | {고객에게 미치는 영향 1줄} | COVERED / UNCOVERED |
```

Stage 3 Holistic Review (L110~117)에 항목 추가:

```markdown
- **Customer-facing gaps**: 고객 관점에서 빠진 시나리오나 사용자 경험 단절
```

Output Format의 Overall Verdict (L152~163) 뒤에 추가:

```markdown
**Customer Impact Summary** (항상 포함):
{Scope Gate 결과를 고객 관점 1~2문장으로 요약}
예: "고객이 튜터를 차단하는 시나리오가 완전히 커버됨. 단, 차단 해제 시나리오가 누락되어 확인 필요."
```

---

## 파일 3: `.claude/agents/deliverable-generator.md`

### 변경 개요

| 영역 | 변경 | 분량 |
|------|------|------|
| tracking_source 기반 분기 | Stage 2 시작에 삽입 | ~20줄 |
| readiness.md JP1 데이터 | Self-Validation 확장 + specs-only 모드 | ~25줄 |
| CP→JP 소수 치환 | L288 등 | ~3곳 |

### 수정 1: tracking_source 기반 분기 (Stage 2 시작에 삽입)

Stage 2 (L50) 시작 부분에 삽입:

```markdown
### tracking_source 분기 (Stage 2 시작 시)

Sprint Input 경로 결정:
1. `{planning_artifacts}/../inputs/sprint-input.md` 존재 확인
2. 존재하면 `tracking_source` 필드를 읽는다
3. 미존재하면 `tracking_source: success-criteria`로 간주한다

| tracking_source | requirements.md Source 열 | BRIEF-N 매핑 | Entropy 할당 기준 |
|----------------|--------------------------|-------------|------------------|
| `brief` | `(source: BRIEF-N / DISC-N / AI-inferred)` 태깅 | 수행 | sprint-input.md complexity + Brief 분석 |
| `success-criteria` | FR# 직접 사용 (Source 열 생략 가능) | 스킵 | Architecture 기술 결정 + brownfield-context |

**success-criteria 경로 Entropy 할당 기준**:
- brownfield-context.md에서 언급된 기존 코드 접점이 있는 태스크 → High
- 다중 조건 AC를 가진 태스크 또는 Architecture에서 복잡한 통합점으로 표시된 태스크 → Medium
- 나머지 → Low
```

### 수정 2: readiness.md JP1 데이터 확장

Self-Validation 섹션 (L278~298)의 항목 8 (readiness.md 생성)을 다음으로 교체:

```markdown
8. **Readiness 데이터 생성**: JP1/JP2 Visual Summary에서 사용할 데이터를 `{output_base}/{feature_name}/readiness.md`에 저장:

   **JP1 데이터** (specs-only 모드에서도 생성):
   - scenario_summaries: PRD User Journey에서 핵심 시나리오 3~5개를 1~2문장으로 축약.
     각 시나리오에 관련 FR 번호를 태깅한다.
     형식: `"고객이 {상황}에서 {행동}하면, 시스템이 {결과}를 제공한다." → FR1, FR3`
   - tracking_completeness: 추적 소스 (brief_sentences 또는 Success Criteria) 중 FR에 매핑되지 않은 항목 수
   - ai_inferred_count: `source: AI-inferred`인 FR 개수
   - scope_gate_summary: 전 단계 PASS/FAIL 상태 (auto-sprint 경유 시에만. /specs 직접 실행 시 spec 단계만 포함)
   - side_effect_high_count: brownfield-context.md Impact Analysis의 HIGH 위험도 항목 수
   - customer_impact_changes: brownfield side-effect를 고객 관점 문장으로 번역한 목록.
     형식: `"기존 '튜터 관리' 화면에서 '차단' 버튼이 추가됩니다"`

   **JP2 데이터** (deliverables-only 모드에서 생성 — 기존과 동일):
   - Smoke Test 결과: N/M endpoints PASS, tsc PASS/FAIL
   - BDD→FR 커버리지: N/M covered
   - Traceability Gap: N개
```

### 수정 3: specs-only 모드에서 JP1 Readiness 생성

L29 뒤에 삽입:

```markdown
> **mode="specs-only"** 인 경우 Stage 1-2 + **JP1 Readiness 생성**을 실행한 뒤 종료한다.
> JP1 Readiness는 Stage 2 완료 직후에 readiness.md의 JP1 데이터 항목을 생성한다.
> (scenario_summaries, tracking_completeness, ai_inferred_count, side_effect_high_count, customer_impact_changes)
> scope_gate_summary는 /specs 호출 시 spec 단계 Scope Gate 결과만 포함한다.
```

기존 L29를 교체:

```markdown
기존:
> **mode="specs-only"** 인 경우 Stage 1-2만 실행하고 Output Summary를 출력한 뒤 종료한다.

변경:
> **mode="specs-only"** 인 경우 Stage 1-2 + JP1 Readiness 생성을 실행한 뒤 종료한다.
```

### 수정 4: CP→JP 소수 치환

| 위치 | 현재 | 변경 |
|------|------|------|
| L288 | `CP1/CP2 Visual Summary` | `JP1/JP2 Visual Summary` |
| L288 | `CP1/CP2 Visual Summary에서 사용할 Readiness 데이터` | `JP1/JP2 Visual Summary에서 사용할 Readiness 데이터` |

---

## 변경하지 않는 부분

| 영역 | 파일 | 이유 |
|------|------|------|
| Brownfield Scanner | brownfield-scanner.md | Phase B 대상 아님 |
| Worker | worker.md | Phase B 대상 아님 |
| Judge 에이전트 3개 | judge-*.md | Phase B 대상 아님 |
| auto-sprint Step 1~3 | auto-sprint.md | BMad Pipeline 구조 변경 없음 |
| auto-sprint Conductor Roles | auto-sprint.md | 구조 변경 없음 (용어만 치환) |
| auto-sprint Feedback Re-execution | auto-sprint.md | 구조 변경 없음 (용어만 치환 + JP2 라우팅 행 추가) |
| deliverable-generator Stage 3~10 | deliverable-generator.md | Deliverables 파이프라인 변경 없음 |
| scope-gate Stage 2~3 체크리스트 | scope-gate.md | 검증 항목 변경 없음 |

---

## 구현 순서

1. **auto-sprint.md** CP→JP 용어 일괄 치환 (기계적)
2. **auto-sprint.md** force_cp1_review 주석 처리
3. **auto-sprint.md** Layer 0 자동 승인 → 정보 배너 교체
4. **auto-sprint.md** JP1 Visual Summary 재설계
5. **auto-sprint.md** JP2 역방향 루프 추가
6. **auto-sprint.md** Context Passing, Advanced Elicitation, Rules 업데이트
7. **scope-gate.md** goals fallback 삽입
8. **scope-gate.md** 고객 영향 열 + Customer Impact Summary 추가
9. **deliverable-generator.md** tracking_source 분기 삽입
10. **deliverable-generator.md** readiness.md JP1 데이터 확장 + specs-only 모드 수정
11. **deliverable-generator.md** CP→JP 소수 치환
12. 3개 파일 간 용어 일관성 확인 (JP1/JP2, tracking_source)

---

## 검증 방법

### auto-sprint.md 검증
- CP/CP1/CP2/Checkpoint 문자열이 0건인지 확인 (force_cp1_review 제외)
- Layer 0 자동 승인 로직이 완전히 제거되었는지 확인
- JP1 Visual Summary가 서사(Section 1) + 추가 항목(Section 2) + 시스템 영향(Section 3) 구조인지 확인
- JP2 피드백 라우팅에 "요구사항 재검토" 행이 있는지 확인
- Advanced에 상세 매핑 테이블이 포함되었는지 확인

### scope-gate.md 검증
- goals 빈 배열 시 PRD Success Criteria fallback 로직이 있는지 확인
- product-brief 단계에서 goals 비어있을 때 Stage 1 SKIP 명시되었는지 확인
- Output Format에 Customer Impact Summary가 포함되었는지 확인

### deliverable-generator.md 검증
- tracking_source 분기 로직이 Stage 2 시작에 있는지 확인
- success-criteria 경로에서 BRIEF-N 매핑이 스킵되는지 확인
- readiness.md에 scenario_summaries, customer_impact_changes 등 JP1 데이터가 포함되었는지 확인
- specs-only 모드에서 JP1 Readiness가 생성되는지 명시되었는지 확인

### 파일 간 일관성 검증
- auto-sprint.md의 JP1 데이터 소스가 deliverable-generator.md의 readiness.md 스키마와 일치하는지
- scope-gate.md의 Customer Impact Summary가 auto-sprint.md JP1 Section 3에서 활용 가능한 형태인지
- tracking_source 필드명이 3개 파일에서 일관되게 사용되는지
