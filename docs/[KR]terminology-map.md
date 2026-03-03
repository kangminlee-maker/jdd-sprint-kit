# Terminology Map (용어 대조표)

JDD Sprint Kit의 한국어-영어 표준 용어 대조표이다. 모든 파일은 **English (Canonical)** 열을 단일 원본(SSOT)으로 사용한다.

## Core Terms (핵심 용어)

| Korean | English (Canonical) | Context |
|--------|-------------------|---------|
| 산출물 | artifacts | 일반 |
| 기획 산출물 | planning artifacts | BMad 산출물 (Product Brief, PRD, Architecture, Epics) |
| 인과 사슬 | causal chain | sprint-input 인과 분석 |
| 참고 자료 | reference materials | sprint-input 사용자 제공 문서 |
| 복잡도 분류 | complexity classification | (v0.7.0에서 제거됨 — sprint-input 필드에서 삭제) |
| 수용 기준 | acceptance criteria | PRD / BDD 시나리오 |
| 방어 제한 | defense limits | sprint-input 검증 범위 |
| 품질 등급 | brief grade | Phase 0 브리프 등급 (A/B/C) |
| 수정반영 | apply fix | JP 코멘트 피드백 흐름 |
| 재생성 | regenerate | JP 코멘트 피드백 흐름 |
| 방향 전환 | course correction | circuit-breaker |
| 파일 소유권 | file ownership | tasks.md 워커 할당 |
| 병렬 실행 | parallel execution | `/parallel` 다중 에이전트 |
| 기존 시스템 | existing system | brownfield 컨텍스트 |
| 기존 확장 | existing-extension | epics 태깅 (`new`의 반대) |
| 신규 | new | epics 태깅 (`existing-extension`의 반대) |
| 설계 판단 | design judgment | JDD 핵심 개념 |
| 판단 시점 | judgment point | JP1, JP2 |
| 고객 관점 판단 | customer-lens judgment | JP 평가 관점 |
| 소모품 | disposable artifact | JDD — AI 산출물은 소모품이다 |
| 영속 자산 | lasting asset | JDD — 인간의 판단은 영속한다 |
| 요구사항 | requirements | specs/requirements.md |
| 설계 | design | specs/design.md |
| 태스크 | tasks | specs/tasks.md |
| 명세 | specs / specification | 일반 |
| 경로 선택 | route selection | Sprint / Guided / Direct |
| 자료 | input materials | 사용자 제공 참고 자료 |
| 회의록 | meeting notes | 입력 유형 |
| 프로토타입 | prototype | preview/ React+MSW 앱 |
| 검증 | validation | `/validate` 파이프라인 |
| 수집 | collection / scan | brownfield 데이터 수집 |
| 도구 스택 | tool stack | 시스템 구성 요소 |
| 핸드오프 | handoff | 페이즈 전환 규칙 |
| 전파 | propagation | 편집 후 하류 업데이트 |
| 프로덕트 전문가 | product expert | 대상 사용자 — 산출물을 판단하는 고객 전문가 |
| 갭 분류 | gap classification | brownfield scanner: `new-feature` / `data-absent` / `mcp-failure` |
| 자기완결 | self-containment | Blueprint 원칙 — 외부 파일 참조 없이 자체 완결 |
| 정보 밀도 | information density | 작성 규칙 — 모든 문장이 의미를 담는다 |
| 추적성 체인 | traceability chain | PRD: Vision → Success Criteria → Journeys → FR |
| 영향 분석 | impact analysis | JP Comment: 시스템이 피드백 범위를 분석한다 |
| 비용 투명성 | cost transparency | JP Comment: 사용자가 선택 전에 비용을 확인한다 |
| 고객 여정 서사 | customer journey narrative | JP1 프레젠테이션 형식 |

## Delta-Driven Design Terms (델타 주도 설계 용어)

| Korean | English (Canonical) | Context |
|--------|-------------------|---------|
| 사용자 문법 | user grammar | 시스템의 실제 사용자가 쓰는 언어. 사용자 유형에 따라 형태가 달라진다 |
| 개발 문법 | development grammar | 구현의 언어 (API, DB, 상태 머신, 알고리즘) |
| 번역 | translation | 사용자 문법에서 개발 문법으로의 규칙 기반 변환 |
| 번역 규칙 | translation rules | 매핑 테이블: 사용자 문법 요소 → 개발 문법 대응물 |
| 델타 | delta | 목표 상태(번역된 프로토타입)와 brownfield 간의 차이 |
| 양성 델타 | positive delta | 델타 유형: 새로 생성하거나 추가해야 하는 것 (신규 요소) |
| 수정 델타 | modification delta | 델타 유형: 기존 요소를 변경해야 하는 것 |
| 음성 델타 | negative delta | 델타 유형: 기존 요소를 제거하거나 폐기해야 하는 것 |
| 영 델타 | zero delta | 델타 유형: 변경 불필요 (회귀 테스트 대상) |
| 델타 매니페스트 | delta manifest | Crystallize 산출물: 유형별로 분류된 전체 델타 항목 목록 |
| 캐리포워드 | carry-forward | 사용자 문법 대응물이 없는 개발 문법 요소 (NFR, 보안, 마이그레이션) |
| 캐리포워드 생명주기 | carry-forward lifecycle | 탄생 → 등록 → 생존 → 주입 → 검증 → 델타 분류 |
| 왕복 검증 | round-trip verification | 번역 정확도 확인: 명세 → 구조 재도출 → 프로토타입과 비교 |
| 3패스 패턴 | 3-pass pattern | Answer Discovery → Translation & Delta Extraction → Delta Execution |
| 사영 | projection | 수학적 프레이밍: 이해관계자 관점에서 시스템을 바라보는 것 |
| 제약 최적화 | constrained optimization | 수학적 프레이밍: 고객 만족(목적 함수) + 제약 조건 |
| 목적 함수 | objective function | 수학적 프레이밍: 고객(주 사용자) 사영 |
| 제약 조건 | constraints | 수학적 프레이밍: 서비스 제공자 사영 (NFR 등) |
| 경계 조건 | boundary conditions | 수학적 프레이밍: 적분 상수를 결정하는 조건 |
| 실현 가능 영역 | feasible region | 수학적 프레이밍: 모든 제약을 만족하는 해 집합 |
| 미적분의 기본 정리 | fundamental theorem of calculus | 수학적 프레이밍: 왕복 검증의 수학적 대응물 |

## Translation Ontology Terms (번역 존재론 용어)

| Korean | English (Canonical) | Context |
|--------|-------------------|---------|
| 번역 존재론 | translation ontology | 통합 프레이밍 — 4개 핵심 문서의 철학적 기반 |
| 근본 관점 | foundational perspective | 공리가 아닌 — 명시적 가설 위에 서 있는 핵심 선언 |
| 방향 검증 | direction validation | JP1의 고유 기능 — 프로토타입에 없는 누락 시나리오 감지 |
| 목표 검증 | target validation | JP2의 고유 기능 — 사용자 문법으로 목표 상태 확인 |
| 출처 | provenance | 재생성 범위 판단 기준 — 피드백이 어디에서 비롯되었는가 |
| 보조 전제 | auxiliary hypothesis (H1-H4) | 근본 관점이 성립하기 위한 구조적 가설 |
| 경험적 전제 | empirical hypothesis (H5-H7) | 기술 의존적 경험적 조건 |
| 구조적 유비 | structural analogy | 수학적 프레이밍의 정확한 위상 — 동형 사상이 아니다 |
| QUERY-N | QUERY-N | **설계 제안이며, 미구현** — Crystallize 중 번역 불가능한 비즈니스 결정에 대한 일괄 질의 |
| TECH-N | TECH-N | **설계 제안이며, 미구현** — AI 기본 기술 결정 목록 |

## Sprint Flow Terms (스프린트 흐름 용어)

| Korean | English (Canonical) | Context |
|--------|-------------------|---------|
| 전체 흐름 | overall flow | README 최상위 다이어그램 |
| 빠른 시작 | quick start | README 시작하기 |
| 사전 요구사항 | prerequisites | README 설정 |
| 첫 Sprint 실행 | first sprint run | README 튜토리얼 |
| 무엇이 만들어지는가 | what gets generated | README 산출물 설명 |
| 설계 문서 3종 | 3 spec documents | requirements + design + tasks |
| 사용자 원본 | user originals | specs/inputs/ 내용물 |
| 검색 전략 | search strategy | MCP 검색 프로토콜 |
| 검색 순서 | search order | MCP 검색 우선순위 |
| 통합 요약 | integrated summary | MCP 응답 형식 |

## Never-Translate List (번역 금지 목록)

아래 식별자는 `communication_language` 설정과 무관하게 반드시 영어를 유지한다.

### YAML Field Names
`brownfield_status`, `brownfield_topology`, `tracking_source`, `feature_only`, `brief_grade`, `causal_chain`, `chain_status`, `brief_sentences`, `time_estimate`, `input_files`, `pre_existing_brownfield`, `fallback_tier`, `validation`, `flags`, `force_jp1_review`, `document_project_path`, `document_project_status`, `communication_language`, `document_output_language`

### Enum Values
`greenfield`, `co-located`, `standalone`, `msa`, `monorepo`, `configured`, `partial-failure`, `local-only`, `complete`, `pending`, `in_progress`, `completed`, `core`, `enabling`, `supporting`, `new`, `existing-extension`, `A`, `B`, `C`

### File Paths and Directory Names
`specs/{feature}/`, `planning-artifacts/`, `inputs/`, `preview/`, `bdd-scenarios/`, `state-machines/`, `_bmad/`, `_bmad-output/`, `.claude/agents/`, `.claude/commands/`, `.claude/rules/`, `docs/`

### File Names
`sprint-input.md`, `brownfield-context.md`, `requirements.md`, `design.md`, `tasks.md`, `api-spec.yaml`, `schema.dbml`, `readiness.md`, `traceability-matrix.md`, `key-flows.md`, `decision-log.md`, `api-sequences.md`, `entity-dictionary.md`, `sprint-log.md`, `prd.md`, `product-brief.md`, `architecture.md`, `epics-and-stories.md`

### BMad Agent Persona Names
Mary (Analyst), John (PM), Winston (Architect), Amelia (Dev), Bob (SM), Sally (UX Designer), Barry (Quick Flow Solo Dev), Murat (Test Architect), Paige (Tech Writer)

### Status Values and Labels
`PASS`, `FAIL`, `SKIP`, `DONE`, `PENDING`, `APPROVED`, `JP1`, `JP2`, `L1`, `L2`, `L3`, `L4`, `FR`, `NFR`, `ADR`, `BRIEF-N`, `DISC-N`, `QUERY-N`, `TECH-N`

### Command Names
`/sprint`, `/specs`, `/preview`, `/parallel`, `/validate`, `/circuit-breaker`, `/summarize-prd`

### Technical Terms (원래 영어 용어)
Entropy Tolerance, File Ownership, DAG, SSOT, Scope Gate, Circuit Breaker, Brownfield, Greenfield, Conductor, Worker, Judge, MSW, Specmatic, OpenAPI, DBML, BDD, Gherkin, User Grammar, Development Grammar, Delta Manifest, Translation Rules, Carry-Forward, Round-Trip Verification
