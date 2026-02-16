# BMAD Sprint Kit 안내

## 도구 스택

| 도구 | 역할 |
|------|------|
| **Claude Code Native Teams** | 에이전트 조율, 태스크 의존성 추적 |
| **gh CLI** | GitHub Issue/PR 관리 |
| **BMad Method** | 요구 정의 에이전트, 워크플로우 (`_bmad/`) |
| **Sprint Engine** | 병렬 실행 전략, 다차원 검증 |

## 워크플로우

Sprint Kit은 하나의 파이프라인에 하나의 진입점(`/sprint`)을 가진다:

```
[Brownfield + BMad] → [Specs] → CP1 → [Deliverables] → CP2 → [Execute]
```

### /sprint — Auto Sprint (권장 — Brief 하나로 Full-stack 생성)
```
/sprint "{Brief}" 또는 /sprint {feature-name}
  Phase 0: Smart Launcher — Brief 분석 + sprint-input.md 생성 (메인 세션)
  → @auto-sprint (자동 실행)
  Phase 1: Brownfield 2-Pass → BMad Auto-Pipeline → Specs 4-file 생성
  → Checkpoint 1: Specs 리뷰 (태스크 구조, Entropy, File Ownership)
  Phase 2: Deliverables 생성 (OpenAPI + DBML + BDD + Prototype)
  → Checkpoint 2: Sprint Output 리뷰 (프로토타입 + 명세)
  → 승인 시: /parallel → /validate
```

### 사용 패턴 (Usage Patterns)

같은 파이프라인을 단계별로 실행하는 방법:

**Guided** (대화형 설계 → 자동 구현)
```
BMad Phase 1~3 (사람-AI 대화로 Planning Artifacts 생성)
    → /specs (Specs 생성) → Checkpoint 1
    → /preview (Deliverables 생성) → Checkpoint 2
    → /parallel → /validate
```

**Direct** (Specs 확정 → 바로 구현)
```
/specs → Checkpoint 1 → /preview → Checkpoint 2
    → /parallel → /validate
```

> 소규모 작업은 BMad 독립 워크플로우를 사용하세요: `/bmad/bmm/workflows/quick-spec` → `/bmad/bmm/workflows/dev-story` → `/bmad/bmm/workflows/code-review`

## BMad 에이전트 (슬래시 커맨드)

- `/bmad/bmm/agents/analyst` - Mary: 브레인스토밍, 리서치, Product Brief
- `/bmad/bmm/agents/pm` - John: PRD, Epics & Stories
- `/bmad/bmm/agents/architect` - Winston: Architecture, ADR
- `/bmad/bmm/agents/dev` - Amelia: Story 구현
- `/bmad/bmm/agents/sm` - Bob: Sprint Planning, Story 준비
- `/bmad/bmm/agents/ux-designer` - Sally: UX Design
- `/bmad/bmm/agents/quick-flow-solo-dev` - Barry: Quick Spec → Dev → Review
- `/bmad/bmm/agents/tea` - Murat: Master Test Architect
- `/bmad/bmm/agents/tech-writer` - Paige: Technical Documentation Specialist

## Sprint 에이전트 (네이티브)

### Auto Sprint 에이전트
- `@auto-sprint` - Auto Sprint 오케스트레이션 + Conductor 4역할 (Goal Tracking, Scope Gate, Budget, Redirect)
- `@scope-gate` - 3단계 Scope Gate 검증 (Structured Probe + Checklist + Holistic Review)
- `@brownfield-scanner` - 4단계 MCP Brownfield 수집 (Index Reading → Deep Reading → Traversal → Search)
- `@deliverable-generator` - Full-stack 산출물 일괄 생성 (specs + OpenAPI + DBML + BDD + React prototype)

### Execute 에이전트
- `@worker` - 독립 워크트리에서 태스크 구현 + Specmatic API 계약 자체 검증
- `@judge-quality` - 코드 구조, 패턴, 중복, 컨벤션 검증 + Specmatic 계약 준수
- `@judge-security` - OWASP Top 10 취약점, 인젝션, 인증 우회 검증
- `@judge-business` - BMad PRD 수용 기준 대비 구현 검증

## Sprint 커맨드

- `/sprint` - **Auto Sprint**: Brief → 자동 Full-stack Specs + Deliverables + Prototype 생성 (Checkpoint 2개)
- `/specs` - **Specs 생성**: Planning Artifacts → Specs 4-file (`@brownfield-scanner` L4 + `@deliverable-generator` specs-only)
- `/preview` - **Deliverables 생성**: Specs → Full-stack Deliverables (`@deliverable-generator` deliverables-only: OpenAPI + DBML + BDD + Prototype)
- `/parallel` - 멀티에이전트 병렬 실행
- `/validate` - 3-Phase 검증 파이프라인
- `/circuit-breaker` - 방향 전환
- `/summarize-prd` - PRD 요약/분석 + 피드백 반영

## 프로젝트 구조

```
{project-root}/
├── CLAUDE.md                        # 사용자 프로젝트 규칙 (Sprint Kit 미수정)
├── .mcp.json                        # MCP 서버 설정 (.mcp.json.example 참조하여 생성)
├── .claude/
│   ├── rules/                       # Sprint Kit 규칙 (bmad-*.md)
│   ├── agents/                      # Sprint 에이전트
│   └── commands/                    # BMad 슬래시 커맨드 + Sprint 커맨드
│       └── bmad/                    # BMad 에이전트/워크플로우
├── _bmad/                           # BMad 워크플로우 (런타임 참조)
│   └── docs/                        # 방법론 레퍼런스
├── specs/                           # 프로젝트별 산출물 (feature 단위)
│   └── {feature}/
│       ├── inputs/                  # Phase 0 (사용자 원본 + sprint-input.md SSOT)
│       ├── planning-artifacts/      # BMad 산출물 (PRD, Architecture, Epics)
│       ├── brownfield-context.md    # Frozen snapshot
│       ├── requirements.md
│       ├── design.md
│       ├── tasks.md
│       └── preview/                 # React + Prism 프로토타입
└── src/                             # 소스 코드
```
