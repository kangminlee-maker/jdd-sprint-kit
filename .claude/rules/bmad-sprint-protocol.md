# Sprint 실행 프로토콜

## BMad 산출물 작성 규칙

- **PRD 작성 시 반드시 `_bmad/docs/prd-format-guide.md`를 읽고 해당 포맷을 따른다.** YAML frontmatter, 섹션 구조, FR/NFR 품질 기준, Brownfield 표기법 등 모든 규칙을 준수한다.

## Brownfield 데이터 플로우 (Sprint x MCP)

Sprint의 모든 단계에서 brownfield 데이터를 활용한다. 소스는 document-project, MCP, 로컬 코드베이스 3가지를 누적 수집한다:

| 단계 | Brownfield 활용 |
|------|----------------|
| **Phase 0 Step 0f** (Sprint 시작 전) | document-project 감지 + MCP 감지 + 빌드 도구 감지 → 토폴로지 판정 + brownfield_status 결정 |
| **Pass 1: Broad Scan** (Sprint 시작) | Stage 0: document-project 소비 → Stage 1~4: MCP + 로컬 스캔 → brownfield-context.md **L1 + L2** |
| **BMad Phase 1-3** | brownfield-context.md L1+L2 참조 |
| **Pass 2: Targeted Scan** (Epics 완료 후) | Stage 0 데이터 참조 + backend-docs/client-docs MCP + 로컬 스캔 → brownfield-context.md **L3 + L4** |
| **Specs 생성** (`/specs`) | Frozen snapshot 복사 (@deliverable-generator Stage 2) |
| **Parallel** (`/parallel`) | Worker reads frozen snapshot |
| **Validate** (`/validate`) | Judges verify against brownfield-context.md |

## Sprint Phase별 Causal Chain 전파 플로우 (선택적)

Causal Chain은 선택 사항이다. Phase 0에서 사용자가 opt-in한 경우에만 전파된다.

| 단계 | Causal Chain 활용 |
|------|------------------|
| **Phase 0** (sprint.md) | Brief + Reference에서 인과 사슬 추출 (opt-in) → sprint-input.md에 기록 |
| **Product Brief** (Mary) | Layer 1+2 기반 문제 정의 (causal_chain 제공 시) |
| **PRD** (John) | FR을 core/enabling/supporting으로 분류 (causal_chain 제공 시), core FR이 root_cause에 연결 |
| **Scope Gate** | causal_alignment 체크 (sprint_input_path 제공 시): FR 분류 검증 + unlinked FR 경고 |
| **JP1** | Advanced(Layer 3)에서 Causal Chain Alignment + FR Linkage 시각화 (feature_only 아닌 경우에만) |
| **Validate** (@judge-business) | core FR 구현이 root_cause를 실제로 해결하는가 검증 (causal_chain 제공 시) |

## Sprint Phase별 Brief 추적 플로우

| 단계 | Brief 추적 활용 |
|------|----------------|
| **Phase 0** (sprint.md) | Brief 문장 분해 + BRIEF-N ID 부여 → sprint-input.md `brief_sentences`에 기록 |
| **PRD** (John) | 각 FR에 `(source: BRIEF-N / DISC-N / AI-inferred)` 태깅 |
| **JP1** | Section 1: Brief 문장 ↔ FR 매핑 테이블. 빠진 문장 경고 |
| **JP1** | Section 2: Brief 외 추가 항목 (참고 자료 발견 vs AI 추론 분리) |

### Brief 추적 소스 결정

추적 소스는 sprint-input.md의 `brief_sentences` 필드로 자동 결정된다:

| 조건 | 추적 소스 | 경로 |
|------|----------|------|
| `brief_sentences`가 존재하고 비어있지 않음 | BRIEF-N 기반 추적 | Sprint 경로 |
| `brief_sentences`가 없거나 빈 배열 | PRD Success Criteria > Measurable Outcomes | Guided / Direct 경로 |

어느 경우든:
- PRD의 각 FR이 추적 소스에 매핑되는지 확인한다
- JP1에서 "원래 의도 ↔ FR 매핑 테이블"을 제시한다
- 매핑되지 않은 추적 소스 항목은 경고로 표시한다

## specs 파일 패턴

```
specs/{feature}/
├── inputs/                     # Phase 0 (사용자 원본 + Sprint Input SSOT, 읽기 전용)
│   ├── brief.md                # 사용자 Brief (참고자료만 있으면 AI 자동 생성)
│   ├── *.md / *.pdf / ...      # 참고 자료 (선택)
│   └── sprint-input.md         # Phase 0 자동 생성 SSOT (Causal Chain 포함)
│
├── planning-artifacts/         # BMad Phase 1-3 산출물 (프로젝트별 보관)
│   ├── product-brief.md        # Product Brief
│   ├── prd.md                  # PRD
│   ├── architecture.md         # Architecture + ADR
│   ├── epics-and-stories.md    # Epics & Stories
│   └── brownfield-context.md   # L1~L4 수집 원본 (작업 중 append)
│
├── sprint-log.md               # Sprint 실행 로그 (timeline + decisions + issues)
├── brownfield-context.md       # Frozen snapshot (L1~L4, Workers 참조용)
├── entity-dictionary.md        # Entity Dictionary
├── requirements.md             # PRD → 요구사항
├── design.md                   # Architecture → 설계
├── tasks.md                    # Epics → 병렬 태스크 + Entropy + File Ownership
│
├── api-spec.yaml               # OpenAPI 3.1 (API 계약 — MSW Mock + Specmatic 공용)
├── api-sequences.md            # Mermaid sequence diagrams
├── schema.dbml                 # Database schema (DBML)
├── bdd-scenarios/              # Gherkin acceptance tests
├── state-machines/             # XState definitions (해당 시에만)
├── decision-log.md             # ADRs + AI reasoning trace
├── traceability-matrix.md      # FR → Design → Task → BDD → API 매핑
├── key-flows.md                # 핵심 사용자 플로우 Step-by-Step (JP2 검증용)
├── readiness.md                # JP1/JP2 Readiness 데이터 (Layer 0 자동 승인 판정용)
└── preview/                    # React + MSW 프로토타입 (npm run dev)
```

## 핸드오프 규칙

### BMad → Execute (Phase 3 완료 시)

BMad Phase 3에서 Implementation Readiness를 통과하면:
1. `specs/{feature}/planning-artifacts/` 산출물 확인 (PRD, Architecture, Epics)
2. `/specs` 실행하여 Specs 4-file 생성
3. Entropy Tolerance 태깅 + 파일 소유권 배정

### BMad Guided 경로 → Sprint 실행

BMad 12단계 산출물이 `_bmad-output/planning-artifacts/`에 있는 경우:
1. `/specs` 실행 시 해당 경로를 자동 탐색하여 `specs/{feature}/planning-artifacts/`로 배치
2. `sprint-input.md`가 없어도 `/specs` 실행 가능
3. goals는 PRD의 Success Criteria > Measurable Outcomes에서 추출
4. Brownfield 스캔은 `/specs` 내에서 정상 실행

### Worker 완료 시

Worker가 태스크를 완료하면:
1. TaskUpdate로 태스크를 completed 상태로 변경
2. `gh issue close`로 GitHub Issue 닫기
3. 의존 태스크의 Worker에게 SendMessage로 알림

### Circuit Breaker 발동 시

- 동일 카테고리 3회 연속 또는 5회 누적 VALIDATE 실패 → `/circuit-breaker` 자동 발동
- 경미 → Spec 수정 → Execute 재실행
- 중대 → Auto Sprint Phase 1 재실행 (non-Auto Sprint: BMad `/bmad/bmm/workflows/correct-course` 연동)

## 파일 소유권 규칙

PARALLEL 단계에서 파일 충돌을 방지하기 위한 규칙:
1. `specs/{feature}/tasks.md`에 각 태스크의 소유 파일을 명시한다
2. Worker는 자신에게 배정된 파일만 수정할 수 있다
3. 공유 타입/인터페이스 파일은 PARALLEL 시작 전에 생성한다
4. 공유 파일 수정이 필요하면 팀 리더에게 SendMessage로 요청한다

## Judgment Point 판단 기준

JP는 기술적 품질 게이트가 아니라 프로덕트 전문가의 고객 관점 판단 시점이다.
`docs/judgment-driven-development.md` 원칙 4 (Customer-Lens Judgment Points) 참조.

### JP1: "고객에게 필요한 제품인가?"

- **판단 대상**: 요구사항, 사용자 시나리오, 기능 범위, 우선순위
- **제시 형식**: 고객 여정 서사 + 원래 의도 ↔ FR 매핑 + 구조적 체크리스트
- **응답**: Confirm / Comment

### JP2: "고객이 원하는 경험인가?"

- **판단 대상**: 프로토타입, 화면 흐름, 인터랙션
- **제시 형식**: 동작하는 프로토타입 + 핵심 시나리오 가이드
- **응답**: Confirm / Comment

### Comment 처리 플로우

JP에서 Comment를 선택하면 다음 플로우로 처리한다.
이 플로우는 Party Mode 발견, Advanced Elicitation 결과, 직접 피드백 모두에 동일하게 적용된다.
발견 수단과 무관하게 처리 메커니즘은 하나다.

1. **피드백 입력**: 사용자가 수정할 내용을 자유 텍스트로 입력한다
2. **영향 분석**: 시스템이 피드백의 영향 범위를 분석하여 다음을 산출한다
   - 수정반영 시: 수정 대상 파일 목록 (upstream + downstream) + 예상 소요 시간
   - 재생성 시: 재실행 시작 Phase + 예상 소요 시간
3. **처리 옵션 제시**: cost와 함께 두 가지 옵션을 제시한다
   - **수정반영+전파**: 기존 산출물 내 직접 수정 + 의존 파일 양방향 전파 (N개 파일, ~M분)
   - **재생성**: 해당 Phase부터 재실행 (~M분)
4. **사용자 선택**: cost를 보고 사용자가 선택한다
5. **실행 + 검증**:
   - 수정반영 선택 시: 전체 파일 수정 → Scope Gate 검증 필수 → PASS 시 JP 복귀
   - 재생성 선택 시: 해당 Phase부터 파이프라인 재실행 → Scope Gate 포함

### 재생성 범위 참조 테이블

피드백 규모에 따른 재생성 시작 지점 가이드:

| 피드백 규모 | JP1 재생성 범위 | JP2 재생성 범위 |
|------------|----------------|----------------|
| 방향 전환 (만들려는 것 자체 변경) | Sprint 중단 → brief.md 수정 후 재시작 | Phase 1 처음 (PRD부터, JP1 재통과) |
| 스코프/UX 변경 | PRD부터 (Step 2b) | PRD부터 (Step 2b, JP1 재통과) |
| 기술/설계 변경 | Architecture부터 (Step 2c) | 해당 BMad 단계부터 (JP1 재통과) |
| 태스크 구조 변경 | Specs 재생성 (Step 3) | Deliverables만 재생성 (Step 5) |
| 명세/프로토타입 조정 | N/A | Deliverables만 재생성 (Step 5) |

이 테이블은 시스템이 영향 분석 시 재생성 범위를 산출하는 참조용이다.
사용자에게는 산출된 cost와 함께 옵션이 제시된다.
