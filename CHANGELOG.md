# Changelog

All notable changes to BMAD Sprint Kit will be documented in this file.

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
- **역방향 루프** — JP2에서 JP1으로 돌아가는 "Redirect to JP1" 옵션
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

`npx bmad-sprint-kit update`로 파일을 업데이트한다. 수동 마이그레이션이 필요한 항목:

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
- `npx bmad-sprint-kit init/update/compat-check` CLI
- 튜토리얼 프로젝트 (test-tutor-excl)
