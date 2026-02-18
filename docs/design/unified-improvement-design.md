# 통합 개선 설계서 — Sprint Kit × BMad Alignment (v2)

> **목표**: JP 산출물 정합성 보장 + BMad Method 포맷 호환으로 경로 간 자유 전환 가능
>
> **배경**: test-tutor-excl JP2 리뷰에서 발견된 C-1(tutor_id 누락, 5파일 전파),
> C-2(architecture.md partial unique 미반영)의 프로세스 원인 분석 →
> JP2 변경 가시성 부재 + BMad ↔ Sprint Kit 상호운용 설계 부재
>
> **리뷰**: Party Mode 2회 (전체 에이전트 참여). 14건 → 장애물 분석 → 최종 합의.

---

## 0. Phase 재구조화 설계서 폐기

`phase-restructuring-design.md`는 **폐기**한다.

**폐기 이유**:
- 원래 문제 제기: "JP1 산출물만으로 독립 구현이 어렵다" → api-spec.yaml + key-flows.md를 Phase 1로 이동
- **사용자 리프레이밍 후 결론**: JP1에는 이미 `architecture.md`가 포함되어 있고, 이 파일에 상세 API 설계(엔드포인트, 요청/응답 스키마, 데이터 모델)가 있다. api-spec.yaml은 "더 나은 포맷"이지 "필수"가 아니다.
- JP1 = BMad Implementation Readiness Check 수준 → architecture.md + design.md로 이미 충족
- Phase 경계 이동은 불필요. 실제 문제는 JP2에서의 **변경 가시성**이다.

> 파일 삭제는 구현 단계에서 수행. 이 설계서가 대체한다.

---

## 1. 설계 범위

### JP 모델 확정

| JP | 수준 | 의미 | 산출물 |
|----|------|------|--------|
| **JP1** | Implementation Readiness | "고객에게 필요한 제품인가?" — 문서 기반 확신 | planning-artifacts/ + Specs 4-file + brownfield-context + entity-dictionary + readiness.md |
| **JP2** | Experience Confirmation SSOT | "내가 상상한게 맞는지 눈으로 확인" — 경험 기반 확신 | JP1 산출물 + api-spec + key-flows + DBML + BDD + Prototype + traceability |

- **Q2 = 가**: JP2는 JP1을 포함한다. JP2 확정 시 전체 산출물이 하나의 정합적 SSOT.
- JP2에서 auto-수정된 JP1 산출물은 사용자에게 가시적이어야 한다.

### 트랙 구성

| 트랙 | 항목 | 범위 | 상태 |
|------|------|------|------|
| **A** | JP2 변경 가시성 | Stage 4b 변경 로그 + 보강 범위 제한 + JP2 Section 0 | **구현** |
| **B** | BMad 포맷 정합 | planning-artifacts 포맷 확인 + 크로스오버 문서화 | **구현** (축소) |
| **C** | Phase 4 크로스오버 | tasks.md ↔ BMad story file | **연기** |

### 시스템 특성 (장애물이 아닌 전제 조건)

Party Mode 장애물 분석에서 확인된 시스템 내재 특성:

| 특성 | 설명 | 관리 방법 |
|------|------|----------|
| **다중 표현의 동기화 비용** | 같은 정보가 여러 파일에 다른 포맷으로 존재 | SSOT Reference Priority 계층이 "어느 파일이 최종 진실인지" 정의. 동기화 실패는 Scope Gate + Smoke Test로 감지. |
| **포맷 호환 ≠ 의미 호환** | 파일 구조가 같아도 내용 깊이가 다를 수 있음 | 크로스오버는 "이어서 심화"이지 "동일 품질 기대"가 아님. 기대 관리 문서화. |
| **Sprint Kit 고유 개념 비대칭** | Entropy, File Ownership, DAG 등은 BMad에 없음 | Sprint Kit → BMad 방향에서만 정보 손실. 단방향 문제. |

---

## 2. Track A: JP2 변경 가시성

### 2.1 문제

Phase 2 (deliverables-only)에서 Stage 4b "API Data Flow Verification"이 api-spec.yaml을 자동 보정할 수 있다. 이 보정은 JP1에서 사용자가 확인한 architecture.md의 API 설계와 다를 수 있지만, 현재 JP2 Visual Summary에 이 변경이 표시되지 않는다.

**Stage 4b는 파이프라인에서 유일한 "무인지 자동 수정" 지점이다** [John 전수 조사]:

| 수정 지점 | JP1 이전/이후 | 사용자 인지 | 무인지 변경 |
|----------|-------------|-----------|-----------|
| BMad Auto-Pipeline (Step 2a-d) | JP1 이전 | 미확인 상태 | ❌ |
| Scope Gate FAIL → 재생성 | JP1 이전 | 미확인 상태 | ❌ |
| JP1 Comment [M] 수정반영 | JP1 중 | 사용자 요청 | ❌ |
| JP1 Party Mode → 수용 | JP1 중 | 사용자 수용 | ❌ |
| **Stage 4b (Phase 2)** | **JP1 이후** | **사용자 모름** | **✅ 유일** |
| JP2 Comment [M] 수정반영 | JP2 중 | 사용자 요청 | ❌ |

> 향후 파이프라인에 새 자동 수정 지점이 추가되면, 이 테이블을 재점검해야 한다.

### 2.2 해결

#### 2.2.1 Stage 4b 보강 범위 제한 [Amelia 발견]

현재 Stage 4b의 "보강"이 어디까지인지 불명확하다. 자동 보강의 범위를 명시한다:

**deliverable-generator.md Stage 4b에 추가**:

```
**보강 범위 제한**:

| 변경 유형 | 처리 |
|----------|------|
| 기존 엔드포인트에 응답 필드 추가 | 자동 보강 + 변경 로그 기록 |
| 기존 필드의 타입 변경 | 자동 보강 + 변경 로그 기록 |
| 쿼리 파라미터 추가 | 자동 보강 + 변경 로그 기록 |
| 응답 구조 변경 (flat → nested 등) | **중단** — Output Summary에 WARN 표시: "구조 변경이 필요합니다. JP2에서 확인하세요." |
| 새 엔드포인트 추가 필요 | **중단** — Output Summary에 WARN 표시: "새 엔드포인트가 필요합니다. Phase 1 설계 재검토를 권장합니다." |

자동 보강은 "필드 수준"까지만. "구조 수준" 이상의 변경은 사용자 판단 영역이다.
```

#### 2.2.2 Stage 4b 변경 로그

Stage 4b에 변경 로그 메커니즘을 추가한다:

**현재** (line 155-164):
```
부족한 필드 발견 시: 해당 API 응답 스키마에 필드를 추가하고,
관련 파일(design.md, api-spec.yaml, types.ts 등)에 일관되게 반영한다
```

**변경 후**:
```
부족한 필드 발견 시:
1. 보강 범위 제한 테이블에 따라 자동 보강 가능 여부를 판정한다.
2. 자동 보강 가능하면:
   a. 해당 API 응답 스키마에 필드를 추가하고,
      관련 파일(design.md, api-spec.yaml, types.ts 등)에 일관되게 반영한다
   b. 변경 내역을 readiness.md의 JP1→JP2 Changes 섹션에 기록한다:
      ```yaml
      jp1_to_jp2_changes:
        - change: "{endpoint} 응답에 {field_name}: {type} 추가"
          flow: "{flow_name}"
          reason: "후행 API {method} {path}의 요청 필드 {field}가 선행 응답에 부재"
          files_modified: [api-spec.yaml, design.md, preview/src/api/types.ts]
      ```
3. 자동 보강 불가(구조/엔드포인트 수준)면:
   - 변경하지 않고 Output Summary에 WARN으로 기록
   - JP2 Section 0에서 사용자에게 표시
```

> 변경 로그의 `change` 필드는 자유 텍스트. 변경 유형을 열거형으로 제한하지 않는다 [J-1].
> `jp1_to_jp2_changes`는 readiness.md의 YAML frontmatter에 기록한다 [J-1 최종 PM].

#### 2.2.3 readiness.md 쓰기 순서 [W-1]

readiness.md는 여러 단계에서 쓰여진다. JP1 데이터를 보존하면서 JP2 데이터를 추가하는 규칙을 명시한다:

**deliverable-generator.md에 추가**:

```
**readiness.md 쓰기 규칙**:
- specs-only 모드: readiness.md를 **생성** (JP1 Data 섹션 작성)
- deliverables-only 모드 Stage 4b: readiness.md가 없으면 **생성**, 있으면 **읽기** → JP1→JP2 Changes 섹션 **append** [W-1 최종 PM]
- deliverables-only 모드 Self-Validation: 기존 readiness.md를 **읽기** → JP2 Data 섹션 **append**
- JP1 Data는 절대 덮어쓰지 않는다.
```

#### 2.2.4 readiness.md 포맷 원칙 [W-2]

```
readiness.md 포맷:
- YAML frontmatter: 머신이 파싱하는 데이터 (auto-sprint Visual Summary 소스)
- Markdown 본문: 사람이 읽는 설명 (선택적)

이 원칙은 sprint-input.md의 기존 패턴(YAML frontmatter + markdown 본문)과 동일하다.
```

#### 2.2.5 JP2 Visual Summary Section 0

Step 6a Visual Summary에 "Section 0: JP1 이후 변경 사항"을 추가한다.

**auto-sprint.md 데이터 소스** (line 606-611)에 추가:
```
- readiness.md: Readiness 데이터 + jp1_to_jp2_changes
```

**출력 형식**:

```markdown
## Judgment Point 2: Sprint Complete — {feature_name}

### Section 0: JP1 이후 변경 사항

{jp1_to_jp2_changes가 비어 있으면}
JP1 산출물에 변경이 없습니다.

{jp1_to_jp2_changes가 있으면}
Phase 2 데이터 흐름 검증에서 보완한 항목입니다:

| 변경 | 이유 | 수정 파일 |
|------|------|----------|
| {change} | {reason} | {files} |
| ... | ... | ... |

상세: architecture.md 원본 설계와 비교 가능합니다.
변경 사항에 동의하지 않으면 [F] Comment를 선택하세요.

{자동 보강 불가 WARN이 있으면}
⚠ 자동 보강 범위를 초과하는 항목이 있습니다:
- {WARN 내용}
→ Phase 1 설계 재검토가 필요할 수 있습니다. [F] Comment를 선택하세요.

### Section 1: 주요 동작 플로우
{기존과 동일}
```

> 톤: "자동 보정"은 정상적인 프로세스다. 경고가 아닌 "보완 보고" 프레이밍 [S-1].
> 거부 흐름: [F] Comment로 유도. Stage 4b 보정 되돌리기는 Comment 처리 플로우의 [M] 수정반영으로 처리 [M-1].

#### 2.2.6 Comment 처리 플로우 Scope Gate stage 명시

**auto-sprint.md Comment 처리 플로우** (line 561):

```
현재:
  [M] 수정반영+전파: ... → Scope Gate 검증 → PASS 시 JP 복귀

변경 후:
  [M] 수정반영+전파: ... → Scope Gate 검증 → PASS 시 JP 복귀
  - JP1 시점: stage=spec
  - JP2 시점: stage=spec + deliverables (양쪽 모두)
```

#### 2.2.7 안전망 구조 [Murat]

Stage 4b 변경의 정합성은 다층 안전망으로 검증된다:

| 계층 | 메커니즘 | 감지 대상 |
|------|---------|----------|
| 1차 | Stage 4b 변경 로그 | 변경 발생 여부 (가시성) |
| 2차 | Step 5-G Scope Gate | API Data Sufficiency (로직 검증) |
| 3차 | JP2 MSW Prototype 검증 | 실제 API 호출 성공 여부 (실행 검증) |
| 4차 | JP2 Section 0 → 사용자 | 의도 부합 여부 (판단) |

> 변경 로그(1차)는 가시성 도구이지 정합성 보장 도구가 아니다.
> 진정한 정합성 검증은 MSW Prototype 검증(3차)다. 변경 로그가 누락되어도 Prototype 검증이 잡아줄 수 있다.

### 2.3 Self-Validation 추가

**deliverable-generator.md Self-Validation** (line 309-338)에 추가:

```
10. **JP1→JP2 변경 기록**: Stage 4b에서 자동 보정한 항목 수.
    readiness.md의 jp1_to_jp2_changes 배열 길이와 실제 보정 횟수가 일치하는지 확인.
    자동 보강 불가 WARN 건수도 Output Summary에 포함.
```

### 2.4 Track A 변경 매트릭스

| 파일 | 변경 유형 | 핵심 변경 |
|------|----------|----------|
| `deliverable-generator.md` | Minor | Stage 4b 보강 범위 제한 + 변경 로그 + readiness.md 쓰기 규칙 + Self-Validation 10번 |
| `auto-sprint.md` | Minor | JP2 Section 0 + 데이터 소스 갱신 + Comment Scope Gate stage 명시 |

---

## 3. Track B: BMad 포맷 정합

### 3.1 planning-artifacts 포맷 실증 검사

#### 3.1.1 검사 결과

| 파일 | BMad 기대 포맷 | Auto Sprint 현황 | 정합성 |
|------|--------------|-----------------|--------|
| **prd.md** | YAML: `stepsCompleted` (string[]), `documentStatus`, `workflowType: 'prd'`, `classification`, `partyModeInsights`, `inputDocuments` | ✅ 동일 구조 (test-tutor-excl 실증) | **PASS** |
| **architecture.md** | YAML: `stepsCompleted` (int[]), `workflowType: 'architecture'`, `inputDocuments` | ✅ 동일 구조 (test-tutor-excl 실증) | **PASS** |
| **epics-and-stories.md** | YAML: `stepsCompleted` (int[]), `workflowType: 'epics'`, E{N}-S{M} 명명 | ✅ 동일 구조 (test-tutor-excl 실증) | **PASS** |
| **product-brief.md** | 비정형 (BMad Mary 생성) | ✅ Auto Sprint에서 Mary가 직접 생성 | **PASS** |

**정합적인 이유**: Auto Sprint Phase 1은 BMad 에이전트(Mary, John, Winston)를 AUTO mode로 호출한다. 에이전트들이 BMad 워크플로우를 직접 따르므로 산출물 포맷이 BMad와 동일하다.

**결론**: planning-artifacts 포맷 정합 문제는 **없다**. 코드 변경 불필요.

#### 3.1.2 크로스오버 시나리오

| 시나리오 | 경로 | 지원 |
|---------|------|------|
| **Guided → Sprint Kit** | BMad 12단계 → `/specs` → JP1 → `/preview` → JP2 | ✅ `/specs` Step 0b가 `_bmad-output/` 자동 감지 |
| **Sprint Kit → BMad validate** | Auto Sprint → BMad `check-implementation-readiness` | ✅ planning-artifacts/ 직접 사용 가능 |
| **Sprint Kit → BMad Phase 4** | Auto Sprint JP2 → BMad `create-story` | ⚠ 현재 자동 미지원 (Track C 연기) |

### 3.2 readiness.md — BMad Readiness와의 관계

Party Mode 합의에 따라 readiness.md에 BMad Implementation Readiness 호환 데이터를 **추가하지 않는다**.

**근거**: Sprint Kit의 Scope Gate(매 단계 PASS/FAIL) + JP1 정보 배너(4조건)가 BMad Implementation Readiness의 역할을 이미 대체한다. 동일한 검증을 두 가지 포맷으로 중복 기록하는 것은 유지 비용만 추가한다.

BMad `check-implementation-readiness`를 Sprint Kit 산출물에 대해 실행하려면, `specs/{feature}/planning-artifacts/`를 직접 참조하면 된다. 별도 어댑터 불필요.

### 3.3 크로스오버 문서화

**bmad-sprint-guide.md 크로스오버 섹션** (line 59-65) 보강:

```markdown
### 크로스오버

경로는 고정이 아니다. 상황에 따라:
- 자료가 있지만 깊은 탐색이 필요하면 → **Guided** 경로에서 자료를 참고 입력으로 활용
- 아무 자료 없이 빠른 프로토타입만 원하면 → **Sprint**에 한 줄 Brief로 시작
- BMad 12단계 완료 후 실행 → **Direct**와 동일 (`/specs`가 BMad 산출물을 자동 인식)

**포맷 호환**: 모든 경로의 planning-artifacts는 동일한 BMad 포맷(YAML frontmatter + 워크플로우 섹션)을
사용한다. Sprint Kit이 생성한 산출물은 BMad 워크플로우에서 직접 인식되며, 그 역도 성립한다.

**크로스오버 지원 현황**:

| 전환 | 지원 | 설명 |
|------|------|------|
| Guided → Sprint Kit | ✅ | `/specs`가 `_bmad-output/` 자동 감지. "이어서 빠르게" |
| Sprint Kit → Guided 심화 | ✅ | planning-artifacts를 Guided 에이전트가 읽고 심화. "빠르게 시작, 깊게 탐색" |
| Sprint Kit → BMad validate | ✅ | planning-artifacts/ 직접 사용 가능 |
| Sprint Kit → BMad Phase 4 | ⚠ | 자동 변환 미지원. planning-artifacts는 호환되나, tasks.md 고유 정보(DAG, Entropy, File Ownership)는 수동 전달 필요. BMad `create-story`를 실행하면 story를 새로 생성할 수 있으나, Sprint Kit의 작업 분해와 다를 수 있음. |

**Sprint Kit 고유 개념**: Sprint Kit은 BMad에 없는 개념(Entropy Tolerance, File Ownership, DAG 기반 병렬
실행, SSOT Reference Priority)을 추가한다. 이 개념들은 Sprint Kit `/parallel` 실행에 최적화되어 있으며,
BMad Phase 4로 전환 시 이 정보는 활용되지 않는다.

**Scope Gate ↔ Implementation Readiness**: Sprint Kit의 매 단계 Scope Gate는 BMad Implementation
Readiness보다 촘촘한 검증이다. Scope Gate 전원 PASS이면 BMad Implementation Readiness도 통과할
가능성이 높다. BMad `check-implementation-readiness`를 별도 실행하려면 planning-artifacts/를 직접 참조.
```

### 3.4 Track B 변경 매트릭스

| 파일 | 변경 유형 | 핵심 변경 |
|------|----------|----------|
| `bmad-sprint-guide.md` | Minor | 크로스오버 섹션 보강 (포맷 호환 + 전환 지원 + 제약 사항 + 고유 개념 설명) |

---

## 4. Track C: Phase 4 크로스오버 (연기)

### 4.1 연기 결정

Party Mode 합의에 따라 `/story-export` 커맨드 구현을 **연기**한다.

**연기 근거**:
1. **수요 미확인**: Sprint Kit JP2 → BMad Phase 4 전환을 실제로 시도한 사용자가 없다
2. **실행 모델 차이**: Sprint Kit(분산 참조, 병렬)과 BMad Phase 4(집중 임베드, 순차)는 포맷이 아닌 패러다임 차이. 변환기로 포맷을 맞춰도 실행 모델의 장점이 전환되지 않는다
3. **BMad 불변 원칙**: BMad create-story가 Sprint Kit 고유 데이터(DAG, Entropy, File Ownership)를 활용하도록 수정할 수 없다
4. **검증 비용**: E2E 검증(Sprint Kit 전체 → 변환 → BMad Phase 4)이 비용 대비 효과 불확실

### 4.2 향후 구현 조건

다음 조건 중 하나가 충족되면 Track C를 재설계한다:

1. Sprint Kit JP2 후 BMad Phase 4로 전환하려는 **실제 수요 발생**
2. BMad Phase 4가 외부 입력(tasks.md 등)을 받을 수 있도록 **BMad 측 확장이 가능**해진 경우

### 4.3 현재 가능한 대안

Track C 미구현 상태에서 Sprint Kit → BMad Phase 4가 필요한 경우:

1. `specs/{feature}/planning-artifacts/`를 BMad가 인식하는 경로에 배치 (이미 호환 포맷)
2. BMad `create-story` 워크플로우 실행 — PRD + Architecture + Epics에서 story 직접 생성
3. tasks.md는 참고 자료로 활용 (DAG/File Ownership 정보를 수동으로 story에 반영)

> 이 방식은 Sprint Kit의 작업 분해(18 Tasks)와 BMad의 story 생성 결과가 다를 수 있다.
> tasks.md의 고유 정보(DAG, Entropy, File Ownership)는 자동 전달되지 않는다.

---

## 5. 전체 변경 매트릭스

| # | 파일 | Track | 변경 유형 | 핵심 변경 |
|---|------|-------|----------|----------|
| 1 | `deliverable-generator.md` | A | Minor | Stage 4b 보강 범위 제한 + 변경 로그 + readiness.md 쓰기 규칙 + Self-Validation 10번 |
| 2 | `auto-sprint.md` | A | Minor | JP2 Section 0 + 데이터 소스 갱신 + Comment Scope Gate stage 명시 |
| 3 | `bmad-sprint-guide.md` | B | Minor | 크로스오버 섹션 보강 |
| 4 | `phase-restructuring-design.md` | — | **Delete** | 폐기 (이 설계서로 대체) |

**변경하지 않는 것**:

| 항목 | 이유 |
|------|------|
| `scope-gate.md` | stage 정의 변경 없음 |
| `worker.md` | SSOT Reference Priority 이미 반영 |
| `sprint.md` (command) | Phase 0 변경 없음 |
| `specs.md` (command) | Specs 4-file 범위 변경 없음 |
| `preview.md` (command) | Deliverables 범위 변경 없음 |
| `brownfield-scanner.md` | 스캔 범위/시점 변경 없음 |
| `judgment-driven-development.md` | 원칙 변경 없음 |
| `bmad-sprint-protocol.md` | Track C 연기로 stories/ 패턴 추가 불필요 |
| readiness.md (BMad 확장) | Scope Gate + JP1 배너가 이미 대체. 중복 불필요 |

---

## 6. 구현 순서

### Phase 1: Track A + B 통합 (하나의 커밋) [B-1]

1. `deliverable-generator.md` — Stage 4b 보강 범위 제한 + 변경 로그 + readiness.md 쓰기 규칙 + Self-Validation
2. `auto-sprint.md` — JP2 Section 0 + Comment Scope Gate stage 명시
3. `bmad-sprint-guide.md` — 크로스오버 섹션 보강

> 3개 파일을 하나의 커밋으로. Track A와 B가 readiness.md를 공유하므로 분리하면 중간 상태가 불완전.

### Phase 2: 정리

4. `phase-restructuring-design.md` — 삭제

---

## 7. 검증 계획

### Track A 검증

> 검증 시점: 다음 Sprint의 Phase 2 실행 시 자연 검증. 또는 test-tutor-excl C-1/C-2 수정 후 deliverables 재생성 시 검증 가능. [MU-1 최종 PM]

- [ ] Stage 4b가 자동 보강할 때, readiness.md에 jp1_to_jp2_changes가 기록되는지 확인
- [ ] Stage 4b가 자동 보강하지 않을 때, jp1_to_jp2_changes가 빈 배열이고 Section 0에 "변경이 없습니다"가 표시되는지 확인 [MU-2]
- [ ] Stage 4b가 구조 수준 변경을 감지했을 때, 자동 보강하지 않고 WARN을 표시하는지 확인
- [ ] JP2 Visual Summary에 Section 0이 표시되는지 확인 (톤: "보완 보고", 경고 아님)
- [ ] JP2 Section 0에서 [F] Comment → [M] 수정반영 시 Stage 4b 보정이 되돌려지는지 확인
- [ ] JP2 Comment → [M] 수정반영 시 spec + deliverables 양쪽 Scope Gate 실행 확인
- [ ] readiness.md 쓰기 순서: deliverables-only 실행 후 JP1 데이터가 보존되어 있는지 확인

### Track B 검증

- [ ] bmad-sprint-guide.md 크로스오버 섹션이 정확한 정보를 담고 있는지 확인
- [ ] Guided → Sprint Kit 크로스오버가 실제로 동작하는지 (다음 Sprint에서 검증)

---

## 8. Party Mode 반영 추적

### 1차 Party Mode (원본 설계 검토) — 14건

| ID | 반영 |
|----|------|
| W-1 (readiness.md 쓰기 순서) | ✅ Section 2.2.3에 명시 |
| J-1 (type 열거형 한계) | ✅ change 자유 텍스트로 변경 |
| MU-1 (PASS/WARN/FAIL 기준) | N/A — Track B-4 축소로 해당 없음 |
| W-2 (readiness.md 포맷) | ✅ Section 2.2.4에 포맷 원칙 명시 |
| J-2 (story_quality 리네이밍) | N/A — Track B-4 축소로 해당 없음 |
| W-3 (재번호 불일치) | N/A — Track C 연기 |
| M-1 (Section 0 거부 흐름) | ✅ Section 2.2.5에 [F] Comment 유도 명시 |
| S-1 (경고 톤 과도) | ✅ Section 2.2.5에 "보완 보고" 프레이밍 |
| MU-2 (변경 없음 검증) | ✅ Section 7 검증 계획에 추가 |
| A-1 (Sprint Kit Metadata) | N/A — Track C 연기 |
| B-1 (단일 커밋) | ✅ Section 6에 하나의 커밋 명시 |
| A-2 (design.md 동기화) | ✅ Stage 4b 기존 동작 (관련 파일 일관 반영) 확인, 검증 계획에 포함 |
| P-1 (포맷 일관성) | ✅ W-2로 해결 |
| P-2 (Skills 등록) | N/A — Track C 연기 |

### 2차 Party Mode (장애물 분석 검토) — 3건 신규

| 발견 | 반영 |
|------|------|
| John: Stage 4b가 유일한 무인지 자동 수정 지점 | ✅ Section 2.1에 전수 조사 테이블 |
| Amelia: Stage 4b 보강 범위 미정의 | ✅ Section 2.2.1에 보강 범위 제한 테이블 |
| Murat: Smoke Test가 진정한 안전망 | ✅ Section 2.2.7에 다층 안전망 구조 |

### 장애물 재분류 (2차 Party Mode 합의)

| 원래 | 재분류 | 관리 |
|------|--------|------|
| A-1: Stage 4b만이 아니다 | **해소** | 유일한 지점임을 확인 |
| A-2: 다중 표현 동기화 | **시스템 특성** | SSOT 계층 + Scope Gate + Smoke Test |
| A-3: 검증자=피검증자 | **허용 가능 위험** | 다층 안전망 (Section 2.2.7) |
| B-1: 포맷 ≠ 의미 | **기대 관리** | 크로스오버 문서에 명시 |
| B-2: 고유 개념 비대칭 | **시스템 특성** | 크로스오버 문서에 명시 |
| C-1~3 | **연기** | Track C 전체 연기 |

### 3차 Party Mode (구현 직전 최종 리뷰) — 4건 반영

| ID | 내용 | 반영 |
|----|------|------|
| W-1 (readiness.md 미존재 방어) | `/preview` 단독 실행 시 readiness.md가 없을 수 있음 | ✅ deliverable-generator.md Stage 4b + readiness.md 쓰기 규칙 |
| J-1 (frontmatter 명시) | jp1_to_jp2_changes 위치 모호 | ✅ deliverable-generator.md Stage 4b + 설계서 2.2.2 |
| MU-1 (검증 시점) | Track A 검증 시점 불명확 | ✅ 설계서 Section 7에 검증 시점 명시 |
| A-1 (삽입 순서) | 보강 범위 테이블 위치 모호 | ✅ 구현에서 테이블 → 본문 → 로그 순서 배치 |
