# Changelog

All notable changes to JDD Sprint Kit will be documented in this file.

---

## [0.4.1] - 2026-02-20

### Fixed
- **brief.md 템플릿 언어** — 섹션 제목/placeholder는 `document_output_language`, HTML 코멘트(사용자 안내)는 `communication_language` 사용. Reference Sources 섹션 제목은 항상 영문(machine-parseable)

---

## [0.4.0] - 2026-02-20

### Added
- **English Pack** — 전체 에이전트(8), 커맨드(7), 룰(3), 포맷 가이드(3), Blueprint, JDD 문서를 영문 기반으로 재작성 (Phase 0~5, 6단계)
- **Language Protocol** — `config.yaml` 기반 다국어 출력 지원
  - `communication_language`: 시스템 메시지 언어 (진행 상황, 에러, JP 요약)
  - `document_output_language`: 생성 문서 언어 (sprint-input.md, 산출물)
  - YAML 키/enum/파일경로는 항상 영문 (machine-parseable)
- **Brownfield Scanner Improvement** — topology-aware scan 도입
  - 프로젝트 배포 구조(co-located/monorepo/msa/standalone) 자동 감지 후 스캔 전략 선택
  - MCP Fallback 4분류 재설계 (topology 기반 심각도)
  - Figma MCP 통합 (`get_metadata`/`get_design_context`)
  - scan_metadata, 동적 data_sources, Entity Index, Ontology Coverage, Self-Validation 핵심 3항목
  - monorepo 패키지 스코핑, MSA/monorepo 혼동방지 엣지가드
- **`--add-dir` 외부 데이터 접근** — filesystem MCP 서버를 `--add-dir` 방식으로 대체
  - Claude Code의 MCP 보안이 프로젝트 루트 외부 경로를 차단하므로, 외부 repo 접근에 `--add-dir` 사용
  - `--add-dir`로 추가된 디렉토리는 Glob/Grep/Read로 직접 접근 (MCP 불필요)
  - Figma는 라이브 데이터여서 파일 다운로드 불가 → MCP 유지
- **Tarball Snapshot** — brief.md에 GitHub repo URL 선언 시 `gh api tarball/HEAD`로 읽기전용 스냅샷 자동 다운로드
  - clone이 아닌 현재 파일만 다운로드 (git history 없음)
  - 참고 소스 섹션의 repo는 AskUserQuestion 없이 바로 다운로드 (사용자 명시 의도)
  - auto-detect repos (참고 소스 미선언)는 AskUserQuestion으로 확인
- **brief.md Reference Sources 섹션** — `## Reference Sources`에 4개 하위 섹션 구조화
  - GitHub: 기존 서비스 repo URL + 탐색 힌트
  - Figma: 디자인 파일 URL
  - Policy Docs: Scanner 우선 탐색 대상 문서명
  - Scan Notes: Brownfield 탐색 방향 자유 형식 메모
- **/sprint 자동 폴더 생성** — `/sprint feature-name` 실행 시 폴더 미존재 → `specs/{feature}/inputs/` + brief.md 템플릿 자동 생성 후 안내 + 종료
- **Phase 0 write-once** — sprint-input.md를 Step 0g에서 1회 Write (중간 Edit 없음, hook 충돌 해소)
- **terminology-map.md** — 한영 용어 대조표 (`docs/terminology-map.md`)
- **CONTRIBUTING.md** + GitHub issue/PR 템플릿

### Changed
- **BMAD Sprint Kit → JDD Sprint Kit** — BMad TRADEMARK.md 준수를 위한 제품명 변경 (14파일, 47곳)
- **dead parameter 정리** — `brownfield_sources` 파라미터를 sprint-input.md 기반 self-serve 패턴으로 교체
  - 이전: 호출자(auto-sprint, specs)가 brownfield_sources를 전달해야 했으나 실제로 전달하지 않음 (dead parameter)
  - 이후: Scanner가 sprint-input.md의 `external_resources`를 직접 읽어 외부 소스 발견
- **용어 정리** — `mcp_servers` → `external_sources`, `brownfield_sources` → `external_resources`, source type `mcp` → `external` (7곳 일괄)
- **Blueprint 구조 개선** — Tool Selection Rationale(도구 선택 근거), 섹션간 cross-reference, Appendix D: Blueprint Sync Criteria 추가
- **npm 의존성 업데이트** — commander ^14.0.3, @clack/prompts ^1.0.1, fs-extra ^11.3.3

### Migration from 0.3.1

`npx jdd-sprint-kit update`로 파일을 업데이트한다. 수동 마이그레이션이 필요한 항목:

1. **제품명**: BMAD Sprint Kit → JDD Sprint Kit. CLAUDE.md에 이전 이름 참조가 있으면 수동 변경
2. **MCP 설정**: `.mcp.json`에 filesystem MCP 서버가 있으면 `--add-dir`로 전환 권장. Figma MCP는 그대로 유지
3. **config.yaml**: `communication_language`와 `document_output_language`를 설정하면 해당 언어로 출력. 미설정 시 영문 기본값
4. **기존 Sprint 산출물**: brownfield-context.md의 `scan_metadata.mcp_servers` → `scan_metadata.external_sources`로 변경됨. 기존 파일은 하위 호환

---

## [0.3.1] - 2026-02-18

### Changed
- **Blueprint 범용 8-Section 구조 재작성** — Part 1~5 → §1~§8 + Appendix A/B/C
  - §1 Problem, §2 Thesis(핵심 원칙 + 설계 판단), §3 User Model, §4 Value Chain(파이프라인 워크스루 + 경로 + 비용), §5 Judgment & Feedback, §6 Constraints & Trade-offs, §7 Risk Model, §8 Current State
  - 에이전트 I/O 테이블을 §4.1에 통합 (Part 5.2 → §4.1)
  - 파이프라인 각 단계에 "근거 설계 판단" 추가
  - 설치/운영(Appendix A), 파일 구조(Appendix B), 용어집(Appendix C)으로 부록 분리
- **§8 Current State에 파이프라인 검증 상태 테이블 추가** — JP2 이후(Parallel, Validate, Circuit Breaker) "구현 완료, 미검증" 명시

### Added
- **Blueprint Format Guide** — `_bmad/docs/blueprint-format-guide.md` 신규
  - 범용 Product Blueprint 포맷 정의 (8-Section + 자기완결 원칙 + Self-review 체크리스트)

---

## [0.3.0] - 2026-02-18

### Added
- **MSW Mock Layer** — Prism 완전 제거 + stateful 프로토타입 전환
  - Browser Service Worker 기반 네트워크 인터셉트 (Vite proxy 불필요)
  - In-memory store + seed data로 stateful CRUD
  - DevPanel로 상태 리셋/시드 제어
  - `@redocly/cli` lint + `tsc --noEmit`로 Prism Smoke Test 대체
- **Comment 처리 플로우** — JP 피드백의 통합 처리 메커니즘
  - 영향 분석 → [수정반영+전파] / [재생성] cost 제시 → 사용자 선택
  - Party Mode 발견, Advanced Elicitation 결과, 직접 피드백 모두 동일 플로우
  - `feedback-log.md` 산출물 추가 (planning-artifacts/ 하위)
- **API Data Sufficiency 검증** — Scope Gate `deliverables` 단계 신설
  - 모든 API 응답이 의존 엔드포인트에 필요한 필드를 제공하는지 확인
- **SSOT Reference Priority** — 산출물 간 우선순위 규칙 명시
  - `api-spec.yaml` > `design.md` API 섹션
  - `schema.dbml` > `design.md` 데이터 모델 섹션
- **JP2 변경 가시성** — JP1→JP2 자동 보정 추적
  - `readiness.md`에 `jp1_to_jp2_changes` 필드 추가
  - JP2 Section 0에서 변경 사항 자동 표시
- **JDD 원칙 3 실용적 보정** — 수정반영+전파 허용 조건 문서화
  - 소규모 피드백: 수정반영 + Scope Gate 검증 필수
  - `docs/judgment-driven-development.md` 부록 추가
- **BMad 크로스오버 지원 현황** 문서화 (Guided ↔ Sprint Kit ↔ BMad validate)
- `specs/` 폴더 README 추가

### Changed
- **JP 피드백 모델 간소화** — Confirm/Comment/Redirect 3택 → Confirm/Comment 2택
  - 역방향 루프: Comment의 "재생성 옵션" 범위가 JP1 이전 Phase로 자연 확장
- **Phase 0 UX 재설계** — brief 필수 제거 + 전체 스캔 + brownfield 재사용
- **auto-sprint foreground 실행** — background → foreground 전환으로 안정성 향상
- **Scope Gate 반복 제한** — A/P 합산 최대 3회 → A/P/F 합산 최대 5회
- `docs/` 폴더 목적별 재구조화 (`design/`, `reviews/`)
- `blueprint.md` YAML frontmatter에 `synced_to` 추가 (소스 파일 동기화 추적)

### Fixed
- preview-template 빌드 시 `node_modules` 제외
- JDD 원칙 4 팩트 오류 수정 (Scope Gate 호출 시점)

### Removed
- **Prism (Mock Server)** — MSW + `@redocly/cli` + `tsc`로 완전 대체
- **JP Redirect 응답** — Comment 처리 플로우로 흡수 (0.2.0에서 추가된 역방향 루프 재설계)

### Migration from 0.2.0

1. **preview-template 업데이트**: `@stoplight/prism-cli`, `concurrently` 제거됨. `msw`, `@redocly/cli` 추가됨. `npx jdd-sprint-kit update`로 반영
2. **기존 Sprint 산출물의 preview/**: Prism 기반으로 생성된 프로토타입은 수동 재생성 필요 (`/preview` 재실행)
3. **JP 피드백**: Redirect 옵션 제거. Comment 선택 시 수정반영/재생성 옵션이 cost와 함께 제시됨
4. **CLAUDE.md**: 사용자 프로젝트 규칙에 Prism 참조가 있으면 MSW로 수동 변경 필요

---

## [0.2.0] - 2026-02-16

### Added
- **Judgment-Driven Development (JDD)** — 설계 철학 6원칙 도입
  - `docs/judgment-driven-development.md` 추가
- **3경로 체계** — Sprint / Guided / Direct 경로 명시화
  - Sprint: 자료 기반 자동 파이프라인 (`/sprint`)
  - Guided: BMad 12단계 대화 후 파이프라인 합류 (`/specs`)
  - Direct: 완성된 planning-artifacts에서 바로 실행 (`/specs`)
- **tracking_source** 필드 — Brief 추적 소스 명시 (`brief` 또는 `success-criteria`)
- **specs-direct 모드** — `/specs` 커맨드의 Direct 경로 지원
- **BMad 산출물 자동 감지** — `_bmad-output/planning-artifacts/` 탐색
- **역방향 루프** — JP2에서 JP1으로 돌아가는 "Redirect to JP1" 옵션 *(0.3.0에서 Comment 처리 플로우로 재설계)*
- Blueprint 제로베이스 재작성 (따라가기 형식 + 외부/내부 병행 서술)
- CHANGELOG.md (이 파일)

### Changed
- **CP → JP 용어 전환** — Checkpoint → Judgment Point
  - CP1 → JP1 ("고객에게 필요한 제품인가?")
  - CP2 → JP2 ("고객이 원하는 경험인가?")
  - `force_cp1_review` → `force_jp1_review`
- **Layer 0 자동 승인 제거** — JP1 의무화, 4조건은 정보 배너로 전환
- **JP1 Visual Summary 재설계** — 고객 여정 서사 + 원래 의도 ↔ FR 매핑
- **경로 네이밍** — Auto Sprint/Guided Sprint/Direct Sprint → Sprint/Guided/Direct
- `package.json` description: `"Judgment-Driven Development toolkit for BMad Method"`
- README.md: JDD 통합, Mermaid JP 다이어그램, 3경로 반영

### Migration from 0.1.0

`npx jdd-sprint-kit update`로 파일을 업데이트한다. 수동 마이그레이션이 필요한 항목:

1. **sprint-input.md**: 기존 `force_cp1_review` 필드는 `force_jp1_review`로 자동 인식됨 (하위 호환)
2. **tracking_source**: 기존 sprint-input.md에 없는 필드. 새로 생성되는 Sprint에서 자동 추가됨
3. **CLAUDE.md**: 사용자 프로젝트 규칙 — Sprint Kit이 수정하지 않음. CP/JP 용어를 사용 중이면 수동 변경 필요

---

## [0.1.0] - 2026-02-15

### Added
- Initial release
- Sprint 자동 파이프라인 (Phase 0 → Brownfield → BMad Auto → Specs → Deliverables → Parallel → Validate)
- 8개 Sprint 에이전트 (auto-sprint, scope-gate, brownfield-scanner, deliverable-generator, worker, judge-quality, judge-security, judge-business)
- 7개 Sprint 커맨드 (sprint, specs, preview, parallel, validate, circuit-breaker, summarize-prd)
- Brownfield Scanner (MCP + document-project + 로컬 코드베이스)
- React + Prism 프로토타입 자동 생성
- Multi-IDE 지원 (Claude Code, Codex CLI, Gemini Code Assist)
- Hook 시스템 (desktop-notify, protect-readonly, pre-compact, session-recovery)
- `npx jdd-sprint-kit init/update/compat-check` CLI
- 튜토리얼 프로젝트 (test-tutor-excl)
