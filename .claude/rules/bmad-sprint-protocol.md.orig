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
| **CP1** | Advanced(Layer 3)에서 Causal Chain Alignment + FR Linkage 시각화 (feature_only 아닌 경우에만) |
| **Validate** (@judge-business) | core FR 구현이 root_cause를 실제로 해결하는가 검증 (causal_chain 제공 시) |

## Sprint Phase별 Brief 추적 플로우

| 단계 | Brief 추적 활용 |
|------|----------------|
| **Phase 0** (sprint.md) | Brief 문장 분해 + BRIEF-N ID 부여 → sprint-input.md `brief_sentences`에 기록 |
| **PRD** (John) | 각 FR에 `(source: BRIEF-N / DISC-N / AI-inferred)` 태깅 |
| **CP1** | Section 1: Brief 문장 ↔ FR 매핑 테이블. 빠진 문장 경고 |
| **CP1** | Section 2: Brief 외 추가 항목 (참고 자료 발견 vs AI 추론 분리) |

## specs 파일 패턴

```
specs/{feature}/
├── inputs/                     # Phase 0 (사용자 원본 + Sprint Input SSOT, 읽기 전용)
│   ├── brief.md                # 사용자 Brief (필수)
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
├── api-spec.yaml               # OpenAPI 3.1 (API 계약 — Prism + Specmatic 공용)
├── api-sequences.md            # Mermaid sequence diagrams
├── schema.dbml                 # Database schema (DBML)
├── bdd-scenarios/              # Gherkin acceptance tests
├── state-machines/             # XState definitions (해당 시에만)
├── decision-log.md             # ADRs + AI reasoning trace
├── traceability-matrix.md      # FR → Design → Task → BDD → API 매핑
├── key-flows.md                # 핵심 사용자 플로우 Step-by-Step (CP2 검증용)
├── readiness.md                # CP1/CP2 Readiness 데이터 (Layer 0 자동 승인 판정용)
└── preview/                    # React + Prism 프로토타입 (npm run dev)
```

## 핸드오프 규칙

### BMad → Execute (Phase 3 완료 시)

BMad Phase 3에서 Implementation Readiness를 통과하면:
1. `specs/{feature}/planning-artifacts/` 산출물 확인 (PRD, Architecture, Epics)
2. `/specs` 실행하여 Specs 4-file 생성
3. Entropy Tolerance 태깅 + 파일 소유권 배정

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
