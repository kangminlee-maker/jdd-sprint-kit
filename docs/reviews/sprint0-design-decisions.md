# Sprint 0: 사전 준비 — 5개 설계 결정

> **문서 유형**: 구현 전 설계 결정 기록
> **일자**: 2026-02-19
> **선행 문서**: `brownfield-scanner-improvement-plan.md` (Party Mode 3회 검토 확정본)

---

## 결정 1: 외부 리소스 키 전달 방식 (Figma 포함)

### 문제

`brownfield-scanner.md` Stage 1에서 Figma MCP를 `get_figjam`으로 호출하도록 되어있으나:
- Figma MCP의 모든 도구는 `fileKey` + `nodeId`가 필수 파라미터
- Scanner에 이 값을 전달하는 경로가 정의되어 있지 않음
- `get_figjam`은 FigJam 전용이라 일반 디자인 파일에서 동작하지 않음

### 결정

brief.md에 Figma URL을 자연스럽게 포함하면 Phase 0가 자동 감지한다.

사용자는 brief.md를 쓰면서 Figma URL을 그냥 붙여넣는다:
```markdown
현재 디자인(https://figma.com/design/abc123def456/MyProject)을 참고해서
온보딩 화면을 개선해야 합니다.
```

Phase 0가 이 URL을 자동 감지하고, fileKey(`abc123def456`)를 추출하여 sprint-input.md에 기록한다.

### 설계

inputs 폴더 구조는 변경 없음:
```
specs/{feature}/inputs/
├── brief.md              # 기존 (필수) — Figma URL을 자연스럽게 포함
├── *.md / *.pdf / ...    # 기존 참고자료 (선택적)
└── sprint-input.md       # Phase 0 자동 생성 (기존)
```

처리 흐름:
1. Phase 0 Step 0d에서 inputs/ 폴더의 모든 파일을 읽을 때 (기존 로직)
2. Figma URL 패턴 감지: `https://figma.com/design/{fileKey}/...` 또는 `https://figma.com/file/{fileKey}/...`
3. fileKey 자동 추출
4. sprint-input.md의 `external_resources` 섹션에 기록 (SSOT 유지)
5. Brownfield Scanner는 sprint-input.md만 읽음

sprint-input.md 추가 필드:
```yaml
external_resources:
  figma:
    - file_key: "abc123def456"
      source_file: "brief.md"
    status: configured | not-configured
```

Scanner의 Figma 처리 변경:
- `get_figjam` → `get_metadata(fileKey, nodeId="0:1")` + `get_design_context`로 교체
- `external_resources.figma.status`가 `not-configured`이면 Figma Stage를 건너뜀

Figma URL이 여러 개 감지될 경우:
- 모두 수집하여 sprint-input.md에 배열로 기록
- Scanner는 각각에 대해 순차 조사

Figma OAuth 미설정 시:
- Phase 0 Step 0f에서 Figma URL 감지 + Figma MCP 미연결 확인 (`whoami` 실패)
- 사용자에게 선택지 제시: [1] 지금 OAuth 인증하기 [2] Figma 없이 계속
- 1회성 설정이므로 다음 Sprint부터는 묻지 않음

에러 처리:
| 상황 | 동작 |
|------|------|
| URL 없음 | Figma 스캔 skip (정상, Sprint 계속) |
| fileKey 잘못됨 | Figma MCP 호출 실패 → 에러 기록, Sprint 계속 |
| Figma MCP 미연결 + URL 있음 | OAuth 인증 요청 |
| Figma MCP 미연결 + URL 없음 | 조용히 skip |

### 수정 대상 파일
- `_bmad/docs/sprint-input-format.md`: `external_resources` 필드 추가
- `.claude/agents/brownfield-scanner.md`: sprint-input.md의 external_resources 참조, Stage 1 figma 수정
- `.claude/commands/sprint.md`: Step 0d에서 Figma URL 자동 감지 로직 추가

---

## 결정 2: Entity Index 최소 구조

### 결정

brownfield-context.md 본문 말미에 다음 구조로 추가한다.

```markdown
## Entity Index

| Entity | L1 | L2 | L3 | L4 | Primary Source |
|--------|----|----|----|----|----------------|
| User   | domain concept | GET /api/users | UserService | src/services/user.ts | local-codebase |
```

- Phase 1 (Pass 1)에서는 섹션 헤더만 예약하고 빈 테이블로 둔다
- Phase 3 (Pass 2 완료 후)에서 채운다
- 각 셀에는 해당 레이어에서 발견된 핵심 정보 1줄 또는 `-` (미발견)

### 수정 대상
- `_bmad/docs/brownfield-context-format.md`: Entity Index 포맷 정의
- `.claude/agents/brownfield-scanner.md`: Entity Index 생성 규칙

---

## 결정 3: Shadow Run 통과 기준

### 결정

`specs/test-tutor-excl/` 예제로 검증한다.

| 검증 항목 | PASS 조건 | FAIL 조건 |
|-----------|----------|----------|
| Topology 감지 | co-located으로 감지 | 다른 값 |
| Local 전략 | Full 4-stage 실행 | Stage 3-4 skip |
| MCP 전략 | 설정된 MCP 시도 (실패 OK) | MCP 미시도 |
| 출력 포맷 | L1+L2가 올바른 YAML frontmatter + scan_metadata와 함께 생성 | frontmatter 누락 또는 구조 깨짐 |
| topology 전달 | Scanner에 topology 값 전달되어 sprint-log에 기록 | topology 누락 |

### 수정 대상
없음 (이 문서에 기록)

---

## 결정 4: 엣지 시나리오 목록

| # | 시나리오 | 예상 동작 | 검증 방법 |
|---|---------|----------|----------|
| E1 | Co-located + MCP 있음 | Local full + MCP 시도 + Local 우선 merge | test-tutor-excl + .mcp.json |
| E2 | Standalone (빌드도구 없음, MCP 없음) | greenfield 감지, scan skip | 빈 디렉토리 + brief.md만 |
| E3 | Monorepo (pnpm-workspace.yaml) | monorepo 감지 + Local 전체 | 임시 워크스페이스 파일 생성 |
| E4 | MSA (MCP만, 빌드도구 없음) | MCP 주 소스, Local Stage 1-2만 | .mcp.json만 설정 |

### 수정 대상
없음 (이 문서에 기록)

---

## 결정 5: Scanner 프롬프트 구조

### 결정

단일 파일을 유지하되, 내부 구조를 개선한다.

### 이유
- 에이전트 호출 구조가 단일 파일 참조 방식 (`Task(prompt: "Read .claude/agents/brownfield-scanner.md")`)
- 340줄은 LLM 프롬프트로 관리 가능한 범위
- 다중 파일 참조는 현재 아키텍처에서 지원하지 않음

### 구조 원칙
1. **Input 섹션** → 파일 최상단 (LLM이 가장 먼저 읽음)
2. **Topology Strategy 섹션** → Input 바로 아래 (조기 전략 확정)
3. **Stage 1~4**에서 MCP 서버 역할 분류 제거 → 범용 처리
4. **Self-Validation + Rules** → 하단

### 수정 대상
- `.claude/agents/brownfield-scanner.md` (Phase 1에서 실행)
