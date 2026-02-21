# Phase A 구현 명세 — 프로토콜 + 가이드 반영

> **상태**: 완료 (2026-02-16)
> **대상 파일**: `.claude/rules/jdd-sprint-guide.md`, `.claude/rules/jdd-sprint-protocol.md`
> **상위 문서**: `docs/design/jdd-implementation/scope.md`, `docs/judgment-driven-development.md`

---

## 확정된 설계 결정

### 네이밍
- 사용자 대면 문서에서는 **Sprint / Guided / Direct** 사용 (기존 용어 유지)
- Bottom-up / Top-down은 설계 철학 문서(`judgment-driven-development.md`)에서만 사용
- CP1/CP2 → **JP1/JP2** (Judgment Point)로 전환

### 3경로 MECE 설계
- 분류 기준: **입력 상태** (사용자가 가진 것)
- 구조화된 산출물 있음 → Direct
- 비정형 자료 있음 → Sprint
- 탐색 필요 → Guided
- 크로스오버 노트로 유연성 제공

### Brief 추적
- 면제가 아니라 **소스 적응**
- `brief_sentences` 있으면 → BRIEF-N 기반 추적 (Sprint 경로)
- `brief_sentences` 없으면 → PRD Success Criteria 기반 추적 (Guided/Direct 경로)
- 어느 경로든 JP1에서 "원래 의도 ↔ FR 매핑 테이블" 제시

---

## 파일 1: `.claude/rules/jdd-sprint-guide.md`

### 전체 교체 (112줄 → ~130줄)

현재 파일을 아래 내용으로 전체 교체한다.

```markdown
# Sprint Kit — BMad Method 실행 확장팩

> AI가 만들고, 사람이 판단한다. 사람의 입력이 만들기의 품질을 높이고, 사람의 판단이 방향을 결정한다.
> — Judgment-Driven Development (`docs/judgment-driven-development.md`)

## 도구 스택

| 도구 | 역할 |
|------|------|
| **BMad Method** | 기반 플랫폼: 에이전트, 워크플로우 엔진, 퍼실리테이션 (`_bmad/`) |
| **Sprint Kit** | BMad 실행 확장팩: 자동 파이프라인, Specs, Deliverables, Prototype |
| **Claude Code Native Teams** | 에이전트 조율, 태스크 의존성 추적 |
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

> 소규모 작업은 BMad Quick Flow를 사용: `/quick-spec` → `/dev-story` → `/code-review`

## BMad 에이전트

- Mary (Analyst): 브레인스토밍, 리서치, Product Brief
- John (PM): PRD, Epics & Stories
- Winston (Architect): Architecture, ADR
- Amelia (Dev): Story 구현
- Bob (SM): Sprint 계획, Story 준비
- Sally (UX Designer): UX 설계
- Barry (Quick Flow Solo Dev): Quick Spec → 개발 → 리뷰
- Murat (Test Architect): 마스터 테스트 아키텍트
- Paige (Tech Writer): 기술 문서 작성

## Sprint 에이전트

### Auto Sprint
- `@auto-sprint` — Sprint 오케스트레이션 + Conductor 4역할 (목표 추적, Scope Gate, 예산, 방향 전환)
- `@scope-gate` — 3단계 검증 (구조적 탐침 + 체크리스트 + 종합 리뷰)
- `@brownfield-scanner` — MCP Brownfield 수집 (L1~L4)
- `@deliverable-generator` — 풀스택 산출물 생성 (Specs + OpenAPI + DBML + BDD + Prototype)

### Execute
- `@worker` — 독립 워크트리에서 태스크 구현 + Specmatic API 계약 자체 검증
- `@judge-quality` — 코드 구조, 패턴, 중복, 컨벤션 검증 + Specmatic 계약 준수
- `@judge-security` — OWASP Top 10 취약점, 인젝션, 인증 우회 검증
- `@judge-business` — BMad PRD 수용 기준 대비 구현 검증

## Sprint 커맨드

- `/sprint` — **Sprint 경로**: Brief/자료 → 자동 Specs + Deliverables + Prototype (JP 2개)
- `/specs` — **Specs 생성**: 기획 산출물 → Specs 4-file
- `/preview` — **Deliverables 생성**: Specs → OpenAPI + DBML + BDD + Prototype
- `/parallel` — 멀티에이전트 병렬 실행
- `/validate` — 3단계 검증 파이프라인
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
│   └── docs/                           # 방법론 레퍼런스
├── _bmad-output/                       # BMad 산출물 출력 (Guided 경로)
│   └── planning-artifacts/             # Product Brief, PRD, Architecture, Epics
├── specs/                              # Sprint 산출물 (feature 단위)
│   └── {feature}/
│       ├── inputs/                     # 사용자 원본 + sprint-input.md
│       ├── planning-artifacts/         # BMad 산출물 (Sprint/Direct 경로)
│       ├── brownfield-context.md       # Frozen snapshot
│       ├── requirements.md
│       ├── design.md
│       ├── tasks.md
│       └── preview/                    # React + Prism 프로토타입
└── src/                                # 소스 코드
```
```

---

## 파일 2: `.claude/rules/jdd-sprint-protocol.md`

### 부분 수정 (107줄 → ~140줄)

#### 수정 1: CP→JP 용어 전환 (5곳)

| 줄 | 현재 | 변경 |
|---|------|------|
| L17 | 변경 없음 | 변경 없음 |
| L31 | `**CP1**` | `**JP1**` |
| L40 | `**CP1**` | `**JP1**` |
| L41 | `**CP1**` | `**JP1**` |
| L73 | `CP1/CP2 Readiness` | `JP1/JP2 Readiness` |
| L74 | `Layer 0 자동 승인 판정용` | `Layer 0 자동 승인 판정용` (변경 없음) |

#### 수정 2: Brief 추적 플로우 — 소스 적응 로직 추가 (L41 뒤에 삽입)

```markdown
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
```

#### 수정 3: 핸드오프 규칙 보완 (L86 뒤에 삽입)

```markdown
### BMad Guided 경로 → Sprint 실행

BMad 12단계 산출물이 `_bmad-output/planning-artifacts/`에 있는 경우:
1. `/specs` 실행 시 해당 경로를 자동 탐색하여 `specs/{feature}/planning-artifacts/`로 배치
2. `sprint-input.md`가 없어도 `/specs` 실행 가능
3. goals는 PRD의 Success Criteria > Measurable Outcomes에서 추출
4. Brownfield 스캔은 `/specs` 내에서 정상 실행
```

#### 수정 4: JP 판단 기준 섹션 신규 추가 (문서 끝에 추가)

```markdown
## Judgment Point 판단 기준

JP는 기술적 품질 게이트가 아니라 프로덕트 전문가의 고객 관점 판단 시점이다.
`docs/judgment-driven-development.md` 원칙 4 (Customer-Lens Judgment Points) 참조.

### JP1: "고객에게 필요한 제품인가?"

- **판단 대상**: 요구사항, 사용자 시나리오, 기능 범위, 우선순위
- **제시 형식**: 고객 여정 서사 + 원래 의도 ↔ FR 매핑 + 구조적 체크리스트
- **응답**: Confirm / Comment (→ 재생성) / Redirect (→ 방향 전환)

### JP2: "고객이 원하는 경험인가?"

- **판단 대상**: 프로토타입, 화면 흐름, 인터랙션
- **제시 형식**: 동작하는 프로토타입 + 핵심 시나리오 가이드
- **응답**: Confirm / Comment (→ 재생성) / Redirect to JP1 (→ 요구사항 재검토)

### 역방향 루프

JP2에서 "요구사항 자체가 잘못됐다"고 판단되면 JP1으로 돌아간다.
이는 실패가 아니라, 구체적 결과물이 촉진한 정상적인 발견 프로세스다 (원칙 3: Regeneration Over Modification).
```

---

## 변경하지 않는 부분

| 섹션 | 파일 | 이유 |
|------|------|------|
| Brownfield 데이터 플로우 | protocol L7~19 | 기존 파이프라인 유효 |
| Causal Chain 전파 | protocol L21~32 | JP 용어만 교체, 구조 유지 |
| specs 파일 패턴 | protocol L43~76 | 디렉토리 구조 변경 없음 |
| 파일 소유권 규칙 | protocol L100~107 | 변경 없음 |
| jdd-mcp-search.md | 별도 파일 | Phase A 대상 아님 |

---

## 구현 순서

1. `jdd-sprint-guide.md` 전체 교체
2. `jdd-sprint-protocol.md` 4개 수정 적용
3. 두 파일 간 용어 일관성 확인 (JP1/JP2, Sprint/Guided/Direct)
4. 기존 파이프라인 호환성 확인 (변경하지 않는 부분이 깨지지 않는지)
