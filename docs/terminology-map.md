# Terminology Map

Korean-English canonical term reference for JDD Sprint Kit. All files use the **English (Canonical)** column as the single source of truth.

## Core Terms

| Korean | English (Canonical) | Context |
|--------|-------------------|---------|
| 산출물 | artifacts | general |
| 기획 산출물 | planning artifacts | BMad outputs (Product Brief, PRD, Architecture, Epics) |
| 인과 사슬 | causal chain | sprint-input causal analysis |
| 참고 자료 | reference materials | sprint-input user-provided docs |
| 복잡도 분류 | complexity classification | sprint-input `complexity` field |
| 수용 기준 | acceptance criteria | PRD / BDD scenarios |
| 방어 제한 | defense limits | sprint-input validation bounds |
| 품질 등급 | brief grade | Phase 0 brief grading (A/B/C) |
| 수정반영 | apply fix | JP comment feedback flow |
| 재생성 | regenerate | JP comment feedback flow |
| 방향 전환 | course correction | circuit-breaker |
| 파일 소유권 | file ownership | tasks.md worker assignment |
| 병렬 실행 | parallel execution | /parallel multi-agent |
| 기존 시스템 | existing system | brownfield context |
| 기존 확장 | existing-extension | epics tagging (vs `new`) |
| 신규 | new | epics tagging (vs `existing-extension`) |
| 설계 판단 | design judgment | JDD core concept |
| 판단 시점 | judgment point | JP1, JP2 |
| 고객 관점 판단 | customer-lens judgment | JP evaluation perspective |
| 소모품 | disposable artifact | JDD — AI output is disposable |
| 영속 자산 | lasting asset | JDD — human judgment persists |
| 요구사항 | requirements | specs/requirements.md |
| 설계 | design | specs/design.md |
| 태스크 | tasks | specs/tasks.md |
| 명세 | specs / specification | general |
| 경로 선택 | route selection | Sprint / Guided / Direct |
| 자료 | input materials | user-provided references |
| 회의록 | meeting notes | input type |
| 프로토타입 | prototype | preview/ React+MSW app |
| 검증 | validation | /validate pipeline |
| 수집 | collection / scan | brownfield data gathering |
| 도구 스택 | tool stack | system components |
| 핸드오프 | handoff | phase transition rules |
| 전파 | propagation | downstream update after edit |
| 프로덕트 전문가 | product expert | target user — customer expert who judges deliverables |
| 갭 분류 | gap classification | brownfield scanner: `new-feature` / `data-absent` / `mcp-failure` |
| 자기완결 | self-containment | Blueprint principle — no external file references |
| 정보 밀도 | information density | writing rule — every sentence carries weight |
| 추적성 체인 | traceability chain | PRD: Vision → Success Criteria → Journeys → FR |
| 영향 분석 | impact analysis | JP Comment: system analyzes feedback scope |
| 비용 투명성 | cost transparency | JP Comment: user sees cost before choosing |
| 고객 여정 서사 | customer journey narrative | JP1 presentation format |

## Delta-Driven Design Terms

| Korean | English (Canonical) | Context |
|--------|-------------------|---------|
| 사용자 문법 | user grammar | language the system's actual users speak; form adapts to user type |
| 개발 문법 | development grammar | language of implementation (API, DB, state machines, algorithms) |
| 번역 | translation | rule-based conversion from user grammar to development grammar |
| 번역 규칙 | translation rules | mapping table: user grammar element → development grammar equivalent |
| 델타 | delta | difference between target state (translated prototype) and brownfield |
| 양성 델타 | positive delta | delta type: must create or add (new element) |
| 수정 델타 | modification delta | delta type: must change existing element |
| 음성 델타 | negative delta | delta type: must remove or deprecate existing element |
| 영 델타 | zero delta | delta type: no change needed (regression test target) |
| 델타 매니페스트 | delta manifest | Crystallize output: classified list of all delta items by type |
| 캐리포워드 | carry-forward | development grammar elements with no user grammar counterpart (NFR, security, migration) |
| 캐리포워드 생명주기 | carry-forward lifecycle | birth → registration → survival → injection → verification → delta classification |
| 왕복 검증 | round-trip verification | translation accuracy check: specs → re-derive structure → compare with prototype |
| 3패스 패턴 | 3-pass pattern | Answer Discovery → Translation & Delta Extraction → Delta Execution |

## Sprint Flow Terms

| Korean | English (Canonical) | Context |
|--------|-------------------|---------|
| 전체 흐름 | overall flow | README top-level diagram |
| 빠른 시작 | quick start | README getting started |
| 사전 요구사항 | prerequisites | README setup |
| 첫 Sprint 실행 | first sprint run | README tutorial |
| 무엇이 만들어지는가 | what gets generated | README output description |
| 설계 문서 3종 | 3 spec documents | requirements + design + tasks |
| 사용자 원본 | user originals | specs/inputs/ contents |
| 검색 전략 | search strategy | MCP search protocol |
| 검색 순서 | search order | MCP search priority |
| 통합 요약 | integrated summary | MCP response format |

## Never-Translate List

The following identifiers MUST remain in English regardless of `communication_language`:

### YAML Field Names
`brownfield_status`, `brownfield_topology`, `tracking_source`, `feature_only`, `brief_grade`, `causal_chain`, `chain_status`, `brief_sentences`, `complexity`, `time_estimate`, `input_files`, `pre_existing_brownfield`, `fallback_tier`, `validation`, `flags`, `force_jp1_review`, `document_project_path`, `document_project_status`, `communication_language`, `document_output_language`

### Enum Values
`greenfield`, `co-located`, `standalone`, `msa`, `monorepo`, `configured`, `partial-failure`, `local-only`, `complete`, `pending`, `in_progress`, `completed`, `core`, `enabling`, `supporting`, `new`, `existing-extension`, `A`, `B`, `C`

### File Paths and Directory Names
`specs/{feature}/`, `planning-artifacts/`, `inputs/`, `preview/`, `bdd-scenarios/`, `state-machines/`, `_bmad/`, `_bmad-output/`, `.claude/agents/`, `.claude/commands/`, `.claude/rules/`, `docs/`

### File Names
`sprint-input.md`, `brownfield-context.md`, `requirements.md`, `design.md`, `tasks.md`, `api-spec.yaml`, `schema.dbml`, `readiness.md`, `traceability-matrix.md`, `key-flows.md`, `decision-log.md`, `api-sequences.md`, `entity-dictionary.md`, `sprint-log.md`, `prd.md`, `product-brief.md`, `architecture.md`, `epics-and-stories.md`

### BMad Agent Persona Names
Mary (Analyst), John (PM), Winston (Architect), Amelia (Dev), Bob (SM), Sally (UX Designer), Barry (Quick Flow Solo Dev), Murat (Test Architect), Paige (Tech Writer)

### Status Values and Labels
`PASS`, `FAIL`, `SKIP`, `DONE`, `PENDING`, `APPROVED`, `JP1`, `JP2`, `L1`, `L2`, `L3`, `L4`, `FR`, `NFR`, `ADR`, `BRIEF-N`, `DISC-N`

### Command Names
`/sprint`, `/specs`, `/preview`, `/parallel`, `/validate`, `/circuit-breaker`, `/summarize-prd`

### Technical Terms (already English)
Entropy Tolerance, File Ownership, DAG, SSOT, Scope Gate, Circuit Breaker, Brownfield, Greenfield, Conductor, Worker, Judge, MSW, Specmatic, OpenAPI, DBML, BDD, Gherkin, User Grammar, Development Grammar, Delta Manifest, Translation Rules, Carry-Forward, Round-Trip Verification
