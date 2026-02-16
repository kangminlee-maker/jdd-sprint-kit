# JDD Implementation Scope — Sprint Kit 설계 철학 적용

> 이 문서는 context window를 넘어가는 장기 작업의 **SSOT**이다.
> 새 세션에서 이 작업을 이어받을 때 이 문서부터 읽는다.

---

## 1. 배경과 맥락

### 왜 이 작업이 필요한가

Sprint Kit(kangminlee-maker/bmad-sprint-kit)은 BMad Method 위에서 동작하는 실행 확장팩으로 포지셔닝이 확정되었다. 기존에 계획했던 `/bridge` 커맨드는 불필요하다고 판단되어 폐기되었으며, 대신 Sprint Kit의 설계 철학 자체를 재정립하고 기존 파일들에 반영하는 작업이 필요하다.

새로운 설계 철학 **"Judgment-Driven Development (JDD)"**는 `docs/judgment-driven-development.md`에 정리되어 있다. 6원칙 요약:

| # | 원칙 | 핵심 |
|---|------|------|
| 1 | Artifacts as Medium | 구체적 결과물이 대화의 매체 |
| 2 | Input Reduces Cycles | 사전 입력이 재생성 횟수를 줄임 |
| 3 | Regeneration Over Modification | 수정이 아니라 재생성이 기본 |
| 4 | Customer-Lens Judgment Points | 고객 관점의 판단 시점 (CP → JP로 리프레이밍) |
| 5 | Knowledge Shape Determines Route | 지식 형태에 따라 Top-down/Bottom-up 경로 선택 |
| 6 | Auto-Context, Human-Judgment | 맥락은 자동 수집, 사람에게는 판단만 요청 |

### 핵심 설계 결정 (확정됨)

1. **Bridge 커맨드 불필요** — 파일 포맷 계약(planning-artifacts/)으로 연결
2. **Sprint Kit = BMad 전용 확장팩** — BMad 위에서만 동작
3. **CP → JP 리프레이밍** — 기술적 품질 게이트에서 고객 관점 판단 시점으로
4. **BMad 불변** — BMad 코드/파일 수정 금지
5. **CLAUDE.md 불침습** — 사용자 환경이므로 건드리지 않음

### 현재 상태

- BMad Method: `/Users/kangmin/cowork/bmad/` (원본)
- Sprint Kit: `npx bmad-sprint-kit init --yes`로 설치 완료 (2026-02-16)
- 설치된 Sprint Kit 파일:
  - `.claude/agents/` — 8개 (auto-sprint, scope-gate, deliverable-generator, brownfield-scanner, worker, judge-quality, judge-security, judge-business)
  - `.claude/commands/` — 7개 (sprint, specs, preview, parallel, validate, circuit-breaker, summarize-prd)
  - `.claude/rules/` — 3개 (bmad-sprint-guide, bmad-sprint-protocol, bmad-mcp-search)
  - `.claude/hooks/` — 4개
  - `_bmad/docs/` — 4개 (format guides)
- 설계 철학 문서: `docs/judgment-driven-development.md` (완성)

---

## 2. Phase 구조

### Phase A: 프로토콜 + 가이드 반영

**목표**: Sprint Kit의 규칙 문서(rules/)에 JDD 설계 철학을 반영한다.

**대상 파일**:
- `.claude/rules/bmad-sprint-guide.md` — 사용 패턴, 워크플로우 설명, 확장팩 포지셔닝
- `.claude/rules/bmad-sprint-protocol.md` — JP 기반 프로토콜, Brief 추적 면제 조건

**변경 방향**:
- 기존 "CP1/CP2" 용어를 "JP1/JP2"로 전환
- "Auto Sprint 권장" 프레이밍에서 "Knowledge Shape에 따른 경로 선택"으로
- BMad 확장팩으로서의 포지셔닝 명시
- Guided 패턴 설명에 BMad 산출물 경로 해소 언급
- JP에서 고객 관점 판단의 의미 서술
- `generated_by: bridge-from-bmad` 관련 내용 → 불필요 (bridge 폐기됨)
- Brief 추적(BRIEF-N) 관련: BMad 경로에서는 면제 조건 추가

**변경하지 않는 것**:
- Brownfield 데이터 플로우 (기존 유지)
- 파일 소유권 규칙 (기존 유지)
- specs 파일 패턴 (기존 유지)
- bmad-mcp-search.md (변경 없음)

---

### Phase B: Judgment Point 리프레이밍

**목표**: Sprint Kit의 에이전트 정의에서 CP1/CP2를 JP1/JP2로 전환하고, 프로덕트 전문가 관점의 판단 시점으로 재설계한다.

**대상 파일**:
- `.claude/agents/auto-sprint.md` — CP1/CP2 → JP1/JP2. Visual Summary를 고객 관점으로 재설계. Layer 0 자동 승인 조건 재검토
- `.claude/agents/scope-gate.md` — goals 빈 배열 시 PRD fallback. 보고 형식을 고객 영향 중심으로 보완
- `.claude/agents/deliverable-generator.md` — BMad 산출물 직접 입력 시의 분기. Source 열 처리

**변경 방향**:

auto-sprint.md:
- "Checkpoint 1/2" → "Judgment Point 1/2" 용어 전환
- JP1 Visual Summary: 기존 4섹션(Brief mapping, Discovered items, Brownfield impact, Readiness)을 고객 관점으로 재구성
  - "핵심 요구사항 반영 현황" (고객 여정 서사 기반)
  - "추가 발견된 요구사항" (참고 자료 + brownfield에서 발견)
  - "확인 필요 사항" (Scope Gate gap을 비기술적 언어로)
  - "기존 시스템 영향" (brownfield side-effect를 고객 영향으로)
- JP2 Visual Summary: 프로토타입 중심 + 핵심 시나리오 가이드
- Layer 0 자동 승인 조건: BMad 경로 분기 추가
- JP1 → JP2 → JP1 역방향 루프 가능성 명시
- A/P/C 메뉴에 "Redirect to JP1" 옵션 추가 (JP2에서)

scope-gate.md:
- goals 빈 배열 시 PRD Success Criteria에서 직접 추출하는 fallback
- 보고 형식에 "고객 영향" 열 추가 (기존 기술적 보고와 병행)

deliverable-generator.md:
- BMad 경로(stepsCompleted frontmatter) 감지 시:
  - requirements.md Source 열: BRIEF-N 대신 FR# 직접 사용
  - brief_sentences 비어있을 때 BRIEF-N 매핑 스킵
  - Entropy 할당: Architecture + brownfield 기반

---

### Phase C: 파이프라인 연결 (경로 해소)

**목표**: BMad 산출물 경로(`_bmad-output/planning-artifacts/`)와 Sprint Kit 경로(`specs/{feature}/planning-artifacts/`)를 연결한다.

**대상 파일**:
- `.claude/commands/specs.md` — BMad 산출물 경로 해소 로직 추가
- `.claude/commands/sprint.md` — 기존 BMad 산출물 감지 시 동작 정의

**변경 방향**:

specs.md:
- Step 0에서 planning-artifacts 탐색 순서 확장:
  1. `specs/{feature}/planning-artifacts/` (기본 — Sprint Kit 경로)
  2. `_bmad-output/planning-artifacts/` (BMad 기본 출력 경로)
  3. `$ARGUMENTS`로 직접 경로 지정
- BMad 산출물 발견 시: 자동 복사 또는 심링크로 Sprint Kit 경로에 배치
- 부분 산출물 처리: PRD만 있을 때, PRD+Architecture만 있을 때 안내

sprint.md:
- Phase 0에서 기존 BMad 산출물 감지 로직 추가:
  - `_bmad-output/planning-artifacts/`에 BMad 산출물(stepsCompleted frontmatter)이 있으면
  - "BMad 산출물이 발견되었습니다. /specs로 바로 진행하시겠어요?" 안내
- 기존 Auto Sprint 파이프라인은 변경 없음

---

### Phase D: 설치 구조 개선

**목표**: Sprint Kit 설치 시 BMad 전용 확장팩으로서의 구조를 반영한다.

**대상 파일 (Sprint Kit 리포: kangminlee-maker/bmad-sprint-kit)**:
- `src/commands/init.js` — BMad 의존성 강화, 설치 메시지 개선
- `src/lib/manifest.js` — 필요 시 파일 목록 조정
- `README.md` — 확장팩 포지셔닝 반영
- `docs/blueprint.md` — JDD 철학 반영

**변경 방향**:
- init.js: BMad 미감지 시 에러 메시지를 "BMad Method가 필요합니다"로 명확화
- README: "BMad Method 기반 실행 확장팩" 포지셔닝 전면 반영
- blueprint.md: Part 1 설계 철학을 JDD 6원칙으로 교체/보완

**비고**: Phase D는 Sprint Kit 리포(kangminlee-maker/bmad-sprint-kit)에서 작업하고 별도 PR로 관리한다. 현재 BMad 프로젝트에서 설치된 파일로는 검증이 어려우므로, Phase A~C 완료 후 별도 진행한다.

---

## 3. 작업 순서와 의존성

```
Phase A (rules/)
  │   독립 작업. 다른 Phase에 선행 의존 없음.
  │   다만 A의 용어 정의(JP1/JP2)가 B에서 사용됨.
  ▼
Phase B (agents/)
  │   Phase A의 JP 정의를 전제로 에이전트 수정.
  │   가장 큰 작업량 (auto-sprint.md가 핵심).
  ▼
Phase C (commands/)
  │   Phase A+B 완료 후 E2E 검증 가능.
  │   경로 해소는 독립적이지만 검증이 A+B에 의존.
  ▼
Phase D (Sprint Kit 리포)
     Phase A+B+C 완료 후 별도 진행.
     Sprint Kit 리포에서 작업, PR로 관리.
```

---

## 4. 제약 조건

| 제약 | 설명 |
|------|------|
| **BMad 불변** | `_bmad/` 하위 모든 파일, `.claude/commands/bmad-*.md` 파일은 수정 불가 |
| **CLAUDE.md 불침습** | 사용자 환경 파일이므로 생성/수정하지 않음 |
| **파일 포맷 호환** | 수정된 Sprint Kit 파일이 기존 Sprint Kit 파이프라인과 하위 호환 유지 |
| **용어 일관성** | CP→JP 전환 시 모든 파일에서 일관되게 적용 |
| **Sprint Kit 리포 sync** | BMad 프로젝트에서 수정한 내용은 최종적으로 Sprint Kit 리포로 반영해야 함 |

---

## 5. 검증 방법

### Phase A 검증
- rules/ 파일의 용어 일관성 확인 (CP→JP, 확장팩 포지셔닝)
- 기존 Sprint Kit 기능과의 호환성 (기존 워크플로우 설명이 깨지지 않는지)

### Phase B 검증
- auto-sprint.md의 JP1/JP2 Visual Summary가 고객 관점으로 재구성되었는지
- scope-gate.md의 goals fallback이 동작하는지
- deliverable-generator.md의 BMad 경로 분기가 명확한지

### Phase C 검증
- BMad 산출물(`_bmad-output/planning-artifacts/`)로 `/specs` 실행 가능 여부
- `/sprint` 실행 시 기존 BMad 산출물 감지 및 안내 메시지

### Phase D 검증
- `npx bmad-sprint-kit init --yes`로 설치 후 Phase A~C 변경사항이 포함되는지
- README, blueprint의 JDD 철학 반영 확인

---

## 6. 참조 파일

### 설계 철학
- `docs/judgment-driven-development.md` — JDD 6원칙, 배경, 예시

### 수정 대상 (BMad 프로젝트, 설치된 Sprint Kit 파일)
- `.claude/rules/bmad-sprint-guide.md` — Phase A
- `.claude/rules/bmad-sprint-protocol.md` — Phase A
- `.claude/agents/auto-sprint.md` — Phase B
- `.claude/agents/scope-gate.md` — Phase B
- `.claude/agents/deliverable-generator.md` — Phase B
- `.claude/commands/specs.md` — Phase C
- `.claude/commands/sprint.md` — Phase C

### 수정 대상 (Sprint Kit 리포, Phase D)
- `kangminlee-maker/bmad-sprint-kit` — init.js, README.md, blueprint.md

### 참조 전용 (수정하지 않음)
- `.claude/rules/bmad-mcp-search.md` — MCP 검색 규칙 (변경 없음)
- `.claude/agents/brownfield-scanner.md` — Brownfield 스캐너 (변경 없음)
- `.claude/agents/worker.md` — Worker 에이전트 (변경 없음)
- `.claude/agents/judge-*.md` — Judge 에이전트 3개 (변경 없음)
- `_bmad/docs/*.md` — Format guides (변경 없음)

### 원본 참조 (Sprint Kit 리포 클론)
- `/tmp/bmad-sprint-kit/` — 설치 전 원본 (비교 목적)

---

## 7. Phase별 진행 기록

### Phase A: 프로토콜 + 가이드 반영
- **상태**: 완료
- **시작일**: 2026-02-16
- **완료일**: 2026-02-16
- **변경 파일**: bmad-sprint-guide.md, bmad-sprint-protocol.md
- **구현 명세**: `docs/phase-a-spec.md`
- **핵심 결정**:
  - 경로 네이밍: Sprint / Guided / Direct (Bottom-up/Top-down은 철학 문서에서만)
  - MECE 기준: 입력 상태 (비정형 자료 / 탐색 필요 / 구조화된 산출물) + 크로스오버
  - Brief 추적: 면제가 아닌 소스 적응 (brief_sentences 유무에 따라 BRIEF-N 또는 Success Criteria)
  - CP→JP 용어 전환

### Phase B: Judgment Point 리프레이밍
- **상태**: 설계 확정, 구현 대기
- **시작일**: -
- **완료일**: -
- **변경 파일**: auto-sprint.md, scope-gate.md, deliverable-generator.md
- **구현 명세**: `docs/phase-b-spec.md`
- **핵심 결정**:
  - Layer 0 자동 승인 제거 → 정보 배너로 전환 (JP1 의무화)
  - JP1 Visual Summary: 서사 기본 + 상세는 Advanced, 경로 독립 설계
  - 경로 분기: tracking_source 명시적 필드 (값 결정은 Phase C)
  - JP2→JP1 역방향 루프: Redirect 내 "요구사항 재검토" 서브옵션
  - force_cp1_review 필드명 Phase B 유지 (Phase C에서 일괄 변경)

### Phase C: 파이프라인 연결
- **상태**: 대기 (Phase B 의존)
- **시작일**: -
- **완료일**: -
- **변경 파일**: specs.md, sprint.md
- **비고**: -

### Phase D: 설치 구조 개선
- **상태**: 대기 (Phase C 의존)
- **시작일**: -
- **완료일**: -
- **변경 파일**: Sprint Kit 리포 (init.js, README.md, blueprint.md)
- **비고**: 별도 PR
