# Sprint Kit — BMad Method 실행 확장팩

> 유일한 원칙: **사람의 판단만이 축적되는 영속 자산이다. AI 산출물은 전부 재생성 가능한 소모품이다.**
>
> AI가 만들고, 사람이 판단한다. 사람의 입력이 만들기의 품질을 높이고, 사람의 판단이 방향을 결정한다.
> — Judgment-Driven Development (`docs/judgment-driven-development.md`)
>
> 제품 전체 그림: `docs/blueprint.md` (§1 Problem ~ §8 Current State + Appendix)

## 도구 스택

| 도구 | 역할 |
|------|------|
| **BMad Method** | 기반 플랫폼: 에이전트, 워크플로우 엔진, 퍼실리테이션 (`_bmad/`) |
| **Sprint Kit** | BMad 실행 확장팩: 자동 파이프라인, Specs, Deliverables, Prototype |
| **Claude Code** | AI IDE — 에이전트 실행 환경 |
| **Claude Code Native Teams** | 에이전트 조율, 태스크 의존성 추적 (`Task`, `SendMessage`) |
| **gh CLI** | GitHub Issue/PR 관리 |

## 경로 선택

Sprint Kit은 사용자의 입력 상태에 따라 3가지 경로를 제공한다.
모든 경로는 같은 파이프라인으로 합류한다:

```
[Input + Brownfield + BMad] → [Specs] → JP1 → [Deliverables] → JP2 → [Execute]
```

### Sprint — 자료가 있을 때: AI가 구성하고 내가 판단한다

회의록, 참고자료, 간단한 Brief 등 비정형 맥락이 있을 때.
AI가 전체 기획 산출물을 자동 생성하고, 프로덕트 전문가가 JP1/JP2에서 판단한다.

```
specs/{feature}/inputs/에 자료 배치 → /sprint {feature-name}
  Phase 0: Smart Launcher — 자료 분석 + sprint-input.md 생성
  → @auto-sprint (자동 실행)
  Phase 1: Brownfield 2-Pass → BMad Auto-Pipeline → Specs 4-file
  → JP1: "고객에게 필요한 제품인가?" (요구사항 판단)
  Phase 2: Deliverables (OpenAPI + DBML + BDD + Prototype)
  → JP2: "고객이 원하는 경험인가?" (프로토타입 판단)
  → 승인 시: /parallel → /validate
```

### Guided — 탐색이 필요할 때: AI와 함께 발견하고 정의한다

새로운 제품, 새로운 시장, 아이디어 단계 등 체계적 탐색이 필요할 때.
BMad 에이전트와 대화하며 단계별로 기획 산출물을 만든다.

```
BMad 12단계 (사람-AI 대화):
  /create-product-brief → /create-prd → /create-architecture → /create-epics
→ /specs → JP1 → /preview → JP2
→ /parallel → /validate
```

### Direct — 기획이 끝났을 때: 바로 실행한다

완성된 PRD + Architecture + Epics가 이미 있을 때.

```
/specs → JP1 → /preview → JP2
→ /parallel → /validate
```

### 크로스오버

경로는 고정이 아니다. 상황에 따라:
- 자료가 있지만 깊은 탐색이 필요하면 → **Guided** 경로에서 자료를 참고 입력으로 활용
- 아무 자료 없이 빠른 프로토타입만 원하면 → **Sprint**에 한 줄 Brief로 시작
- BMad 12단계 완료 후 실행 → **Direct**와 동일 (`/specs`가 BMad 산출물을 자동 인식)

**포맷 호환**: 모든 경로의 planning-artifacts는 동일한 BMad 포맷(YAML frontmatter + 워크플로우 섹션)을 사용한다. Sprint Kit이 생성한 산출물은 BMad 워크플로우에서 직접 인식되며, 그 역도 성립한다.

**크로스오버 지원 현황**:

| 전환 | 지원 | 설명 |
|------|------|------|
| Guided → Sprint Kit | ✅ | `/specs`가 `_bmad-output/` 자동 감지. "이어서 빠르게" |
| Sprint Kit → Guided 심화 | ✅ | planning-artifacts를 Guided 에이전트가 읽고 심화. "빠르게 시작, 깊게 탐색" |
| Sprint Kit → BMad validate | ✅ | planning-artifacts/ 직접 사용 가능 |
| Sprint Kit → BMad Phase 4 | ⚠ | 자동 변환 미지원. planning-artifacts는 호환되나, tasks.md 고유 정보(DAG, Entropy, File Ownership)는 수동 전달 필요 |

**Sprint Kit 고유 개념**: Entropy Tolerance, File Ownership, DAG 기반 병렬 실행, SSOT Reference Priority는 BMad에 없는 Sprint Kit 전용 개념이다. `/parallel` 실행에 최적화되어 있으며, BMad Phase 4로 전환 시 이 정보는 활용되지 않는다.

**Scope Gate ↔ Implementation Readiness**: Sprint Kit의 매 단계 Scope Gate는 BMad Implementation Readiness보다 촘촘한 검증이다. Scope Gate 전원 PASS이면 BMad Implementation Readiness도 통과할 가능성이 높다. BMad `check-implementation-readiness`를 별도 실행하려면 planning-artifacts/를 직접 참조.

> 소규모 작업은 BMad Quick Flow를 사용: `/quick-spec` → `/dev-story` → `/code-review`

## BMad 에이전트

- Mary (Analyst): 브레인스토밍, 리서치, Product Brief
- John (PM): PRD, Epics & Stories
- Winston (Architect): Architecture, ADR
- Amelia (Dev): Story 구현
- Bob (SM): Sprint Planning, Story 준비
- Sally (UX Designer): UX Design
- Barry (Quick Flow Solo Dev): Quick Spec → Dev → Review
- Murat (Test Architect): Master Test Architect
- Paige (Tech Writer): Technical Documentation

## Sprint 에이전트

### Auto Sprint
- `@auto-sprint` — Sprint 오케스트레이션 + Conductor 4역할 (Goal Tracking, Scope Gate, Budget, Redirect)
- `@scope-gate` — 3단계 검증 (Structured Probe + Checklist + Holistic Review)
- `@brownfield-scanner` — MCP Brownfield 수집 (L1~L4)
- `@deliverable-generator` — Full-stack 산출물 생성 (Specs + OpenAPI + DBML + BDD + Prototype)

### Execute
- `@worker` — 독립 워크트리에서 태스크 구현 + Specmatic API 계약 자체 검증
- `@judge-quality` — 코드 구조, 패턴, 중복, 컨벤션 검증 + Specmatic 계약 준수
- `@judge-security` — OWASP Top 10 취약점, 인젝션, 인증 우회 검증
- `@judge-business` — BMad PRD 수용 기준 대비 구현 검증

## Sprint 커맨드

- `/sprint` — **Sprint 경로**: Brief/자료 → 자동 Specs + Deliverables + Prototype (JP 2개)
- `/specs` — **Specs 생성**: Planning Artifacts → Specs 4-file
- `/preview` — **Deliverables 생성**: Specs → OpenAPI + DBML + BDD + Prototype
- `/parallel` — 멀티에이전트 병렬 실행
- `/validate` — 3-Phase 검증 파이프라인
- `/circuit-breaker` — 방향 전환
- `/summarize-prd` — PRD 요약/분석 + 피드백 반영

## 프로젝트 구조

```
{project-root}/
├── CLAUDE.md                           # 사용자 프로젝트 규칙 (Sprint Kit 미수정)
├── .mcp.json                           # MCP 서버 설정
├── .claude/
│   ├── rules/                          # Sprint Kit 규칙
│   ├── agents/                         # Sprint 에이전트
│   └── commands/                       # BMad + Sprint 커맨드
├── _bmad/                              # BMad Method (기반 플랫폼)
│   ├── bmm/                            # BMad 에이전트, 워크플로우
│   └── docs/                           # 포맷 가이드 (PRD, Blueprint, Sprint Input 등)
├── _bmad-output/                       # BMad 산출물 출력 (Guided 경로)
│   └── planning-artifacts/             # Product Brief, PRD, Architecture, Epics
├── docs/                               # 프레임워크 문서
│   ├── blueprint.md                    # 제품 Blueprint (§1~§8 + Appendix)
│   └── judgment-driven-development.md  # 설계 철학 (JDD)
├── specs/                              # Sprint 산출물 (feature 단위)
│   └── {feature}/
│       ├── inputs/                     # 사용자 원본 + sprint-input.md
│       ├── planning-artifacts/         # BMad 산출물 (Sprint/Direct 경로)
│       ├── brownfield-context.md       # Frozen snapshot
│       ├── requirements.md
│       ├── design.md
│       ├── tasks.md
│       └── preview/                    # React + MSW 프로토타입
└── src/                                # 소스 코드
```
