# 용어 맵 (Terminology Map)

JDD Sprint Kit의 한국어-영어 정식 용어 참조 문서입니다. 모든 파일은 **영어 (정식 명칭)** 열을 단일 정보 원천(SSOT)으로 사용합니다.

## 핵심 용어

| 한국어 | 영어 (정식 명칭) | 맥락 |
|--------|-------------------|---------|
| 산출물 | artifacts | 일반 |
| 기획 산출물 | planning artifacts | BMad 출력물 (Product Brief, PRD, Architecture, Epics) |
| 인과 사슬 | causal chain | sprint-input 인과 분석 |
| 참고 자료 | reference materials | sprint-input 사용자 제공 문서 |
| 복잡도 분류 | complexity classification | sprint-input `complexity` 필드 |
| 수용 기준 | acceptance criteria | PRD / BDD 시나리오 |
| 방어 제한 | defense limits | sprint-input 유효성 검사 범위 |
| 품질 등급 | brief grade | Phase 0 Brief 등급 매기기 (A/B/C) |
| 수정반영 | apply fix | JP Comment 피드백 흐름 |
| 재생성 | regenerate | JP Comment 피드백 흐름 |
| 방향 전환 | course correction | Circuit Breaker |
| 파일 소유권 | file ownership | tasks.md Worker 배정 |
| 병렬 실행 | parallel execution | /parallel 멀티 에이전트 |
| 기존 시스템 | existing system | Brownfield 맥락 |
| 기존 확장 | existing-extension | Epics 태깅 (`new`의 반대) |
| 신규 | new | Epics 태깅 (`existing-extension`의 반대) |
| 설계 판단 | design judgment | JDD 핵심 개념 |
| 판단 시점 | judgment point | JP1, JP2 |
| 고객 관점 판단 | customer-lens judgment | JP 평가 관점 |
| 소모품 | disposable artifact | JDD — AI 출력은 소모품 |
| 영속 자산 | lasting asset | JDD — 사람의 판단은 영속 |
| 요구사항 | requirements | specs/requirements.md |
| 설계 | design | specs/design.md |
| 태스크 | tasks | specs/tasks.md |
| 명세 | specs / specification | 일반 |
| 경로 선택 | route selection | Sprint / Guided / Direct |
| 자료 | input materials | 사용자 제공 참고 자료 |
| 회의록 | meeting notes | 입력 유형 |
| 프로토타입 | prototype | preview/ React+MSW 앱 |
| 검증 | validation | /validate 파이프라인 |
| 수집 | collection / scan | Brownfield 데이터 수집 |
| 도구 스택 | tool stack | 시스템 구성요소 |
| 핸드오프 | handoff | 단계 전환 규칙 |
| 전파 | propagation | 수정 후 하위 산출물 업데이트 |
| 프로덕트 전문가 | product expert | 대상 사용자 — 산출물을 판단하는 고객 전문가 |
| 갭 분류 | gap classification | Brownfield Scanner: `new-feature` / `data-absent` / `mcp-failure` |
| 자기완결 | self-containment | Blueprint 원칙 — 외부 파일 참조 없음 |
| 정보 밀도 | information density | 작성 규칙 — 모든 문장이 무게를 가짐 |
| 추적성 체인 | traceability chain | PRD: Vision → Success Criteria → Journeys → FR |
| 영향 분석 | impact analysis | JP Comment: 시스템이 피드백 범위 분석 |
| 비용 투명성 | cost transparency | JP Comment: 사용자가 비용을 보고 선택 |
| 고객 여정 서사 | customer journey narrative | JP1 제시 형식 |

## Delta-Driven Design 용어

| 한국어 | 영어 (정식 명칭) | 맥락 |
|--------|-------------------|---------|
| 사용자 문법 | user grammar | 시스템의 실제 사용자가 말하는 언어; 사용자 유형에 따라 형태 변화 |
| 개발 문법 | development grammar | 구현의 언어 (API, DB, 상태 머신, 알고리즘) |
| 번역 | translation | 사용자 문법에서 개발 문법으로의 규칙 기반 변환 |
| 번역 규칙 | translation rules | 매핑 테이블: 사용자 문법 요소 → 개발 문법 대응물 |
| 델타 | delta | 목표 상태(번역된 프로토타입)와 Brownfield 간의 차이 |
| 양성 델타 | positive delta | 델타 유형: 생성 또는 추가 필요 (신규 요소) |
| 수정 델타 | modification delta | 델타 유형: 기존 요소 변경 필요 |
| 음성 델타 | negative delta | 델타 유형: 기존 요소 제거 또는 폐기 필요 |
| 영 델타 | zero delta | 델타 유형: 변경 불필요 (회귀 테스트 대상) |
| 델타 매니페스트 | delta manifest | Crystallize 출력: 모든 델타 항목을 유형별로 분류한 목록 |
| 캐리포워드 | carry-forward | 사용자 문법에 대응물이 없는 개발 문법 요소 (NFR, 보안, 마이그레이션) |
| 캐리포워드 생명주기 | carry-forward lifecycle | 탄생 → 등록 → 생존 → 주입 → 검증 → 델타 분류 |
| 왕복 검증 | round-trip verification | 번역 정확성 확인: 명세 → 구조 재도출 → 프로토타입과 비교 |
| 3패스 패턴 | 3-pass pattern | Answer Discovery → Translation & Delta Extraction → Delta Execution |

## Sprint 흐름 용어

| 한국어 | 영어 (정식 명칭) | 맥락 |
|--------|-------------------|---------|
| 전체 흐름 | overall flow | README 최상위 다이어그램 |
| 빠른 시작 | quick start | README 시작하기 |
| 사전 요구사항 | prerequisites | README 설정 |
| 첫 Sprint 실행 | first sprint run | README 튜토리얼 |
| 무엇이 만들어지는가 | what gets generated | README 출력 설명 |
| 설계 문서 3종 | 3 spec documents | requirements + design + tasks |
| 사용자 원본 | user originals | specs/inputs/ 내용물 |
| 검색 전략 | search strategy | MCP 검색 프로토콜 |
| 검색 순서 | search order | MCP 검색 우선순위 |
| 통합 요약 | integrated summary | MCP 응답 형식 |

## 번역 금지 목록 (Never-Translate List)

다음 식별자들은 `communication_language` 설정과 무관하게 반드시 영어로 유지해야 합니다:

### YAML 필드명
`brownfield_status`, `brownfield_topology`, `tracking_source`, `feature_only`, `brief_grade`, `causal_chain`, `chain_status`, `brief_sentences`, `complexity`, `time_estimate`, `input_files`, `pre_existing_brownfield`, `fallback_tier`, `validation`, `flags`, `force_jp1_review`, `document_project_path`, `document_project_status`, `communication_language`, `document_output_language`

### 열거형 값
`greenfield`, `co-located`, `standalone`, `msa`, `monorepo`, `configured`, `partial-failure`, `local-only`, `complete`, `pending`, `in_progress`, `completed`, `core`, `enabling`, `supporting`, `new`, `existing-extension`, `A`, `B`, `C`

### 파일 경로 및 디렉토리명
`specs/{feature}/`, `planning-artifacts/`, `inputs/`, `preview/`, `bdd-scenarios/`, `state-machines/`, `_bmad/`, `_bmad-output/`, `.claude/agents/`, `.claude/commands/`, `.claude/rules/`, `docs/`

### 파일명
`sprint-input.md`, `brownfield-context.md`, `requirements.md`, `design.md`, `tasks.md`, `api-spec.yaml`, `schema.dbml`, `readiness.md`, `traceability-matrix.md`, `key-flows.md`, `decision-log.md`, `api-sequences.md`, `entity-dictionary.md`, `sprint-log.md`, `prd.md`, `product-brief.md`, `architecture.md`, `epics-and-stories.md`

### BMad 에이전트 페르소나 이름
Mary (Analyst), John (PM), Winston (Architect), Amelia (Dev), Bob (SM), Sally (UX Designer), Barry (Quick Flow Solo Dev), Murat (Test Architect), Paige (Tech Writer)

### 상태 값 및 라벨
`PASS`, `FAIL`, `SKIP`, `DONE`, `PENDING`, `APPROVED`, `JP1`, `JP2`, `L1`, `L2`, `L3`, `L4`, `FR`, `NFR`, `ADR`, `BRIEF-N`, `DISC-N`

### 커맨드명
`/sprint`, `/specs`, `/preview`, `/parallel`, `/validate`, `/circuit-breaker`, `/summarize-prd`

### 기술 용어 (원래 영어)
Entropy Tolerance, File Ownership, DAG, SSOT, Scope Gate, Circuit Breaker, Brownfield, Greenfield, Conductor, Worker, Judge, MSW, Specmatic, OpenAPI, DBML, BDD, Gherkin, User Grammar, Development Grammar, Delta Manifest, Translation Rules, Carry-Forward, Round-Trip Verification
