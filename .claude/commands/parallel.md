---
description: "Native Teams + Git Worktree를 활용한 멀티 에이전트 병렬 실행"
---

# /parallel — 멀티 에이전트 병렬 실행

> **디스패치 대상**: Native Teams `@worker` 에이전트

## 목적

Native Teams + Git Worktree + gh CLI를 사용하여 태스크를 병렬로 실행합니다.

## 사용 시점

명세 + 산출물 생성이 완료된 후. JP2 승인 이후에 실행합니다.

## 입력값

`$ARGUMENTS`: 사용하지 않음

auto-sprint에서 호출될 때의 파라미터:
- `specs_root`: 명세 파일의 기본 디렉터리. 기본값: `specs/{feature}/`. Crystallize 이후: `specs/{feature}/reconciled/`.

사전 조건:
- `{specs_root}/tasks.md` 존재
- `{specs_root}/brownfield-context.md` 존재 (reconciled/ 경우 `{specs_root}/planning-artifacts/brownfield-context.md`)
- File Ownership 할당 완료
- 인터페이스 계약(공유 타입) 정의 완료

**경로 해석**: 이 커맨드에서 참조하는 모든 명세 파일은 `{specs_root}`를 기준 경로로 사용합니다. `specs_root`가 제공되지 않으면 `specs/{feature}/`를 기본값으로 사용합니다.

## 절차

jdd-sprint-guide.md의 Language Protocol에 따라 설정을 불러옵니다.

### Step 1: 인터페이스 계약 생성
모든 Worker가 참조하는 공유 타입/인터페이스를 먼저 생성합니다:
- tasks.md에서 인터페이스 계약 추출
- 공유 타입 파일 생성 (예: `src/types.ts`)
- 이 단계는 병렬화하지 않음

### Step 2: GitHub Issues 생성 (gh CLI)
gh CLI(`gh issue create`)를 통해 각 태스크를 GitHub Issue로 생성합니다:
```
각 태스크 → GitHub Issue
- 제목: 태스크 설명
- 본문: 소유 파일, 인터페이스, 의존성, Entropy 레벨
- 라벨: entropy-high / entropy-medium / entropy-low
```

### Step 3: Git Worktree 설정
파일 충돌을 소스 단계에서 방지하기 위해 태스크별 Git Worktree를 생성합니다:
```bash
# 태스크별 독립 worktree 생성
git worktree add ../worktree-{task-id} -b task/{task-id}
```
- 각 Worker에 독립된 worktree 할당
- 메인 브랜치에서 분기

### Step 4: Native Teams Worker 생성
Claude Code Native Teams를 통해 Worker 에이전트를 생성합니다:
1. TeamCreate로 팀 생성
2. Task 도구로 각 Worker 생성 (`subagent_type: "worker"`, `model: "sonnet"`)
3. TaskCreate로 태스크 생성, TaskUpdate로 할당
4. 각 Worker가 `{specs_root}/brownfield-context.md` (reconciled/ 경우 `{specs_root}/planning-artifacts/brownfield-context.md`)를 참조하도록 지시:
   - 기존 시스템 코드 패턴/컨벤션 준수 (설정된 client-docs MCP 기반)
   - 기존 시스템 API 확장 시 호환성 유지 (설정된 backend-docs MCP 기반)
   - 기존 시스템 고객 여정 흐름과의 정합성 검증 (설정된 svc-map MCP 기반)

### Step 5: 병렬 실행 모니터링
- 각 Worker가 할당된 태스크 실행
- API 태스크: Worker가 완료 전 Specmatic으로 자체 검증
- Worker 완료 시 → SendMessage로 핸드오프
- `gh issue close`로 Issue 종료

#### Worker 실패 프로토콜
- **Worker 크래시/타임아웃**: 해당 태스크를 FAILED로 표시.
  독립 태스크를 가진 다른 Worker는 계속 진행.
  FAILED Worker에 의존하는 Worker는 대기.
- **2회 재시도 후에도 실패 지속**: 사용자에게 보고 + 나머지 Worker 결과로 부분 Merge 옵션 제시.
- **블로커 보고**: Worker가 SendMessage로 블로커를 보고하면 팀 리드가 다른 Worker에 재할당하거나 사용자에게 에스컬레이션.

### Step 6: Merge & 통합
모든 Worker 완료 후:
1. 각 worktree의 변경사항을 의존성 순서대로 메인 브랜치에 Merge
2. 통합 테스트 실행
3. 충돌 발생 시 → Merge Conflict Resolution Protocol 적용
4. 사용자에게 Merge 결과 보고 + `/validate` 자동 실행 여부 확인 ({communication_language}로)
   - **자동 진행** → `/validate` 실행
   - **수동** → 사용자가 직접 `/validate` 실행

### Merge Conflict Resolution Protocol
1. **공유 타입 파일 충돌**: Step 1에서 사전 생성했으므로 발생하지 않아야 합니다.
   발생하는 경우 → api-spec.yaml과 일치하는 버전을 채택.
2. **package.json 충돌**: 의존성을 합집합으로 Merge.
3. **비즈니스 로직 파일 충돌**: File Ownership 위반. 해당 Worker에게 수정 요청.
4. **해결 불가 충돌**: 사용자에게 보고 + 관련 diff 제시.

## 제약사항
Worker 핸드오프 시 다음 형식을 사용합니다:
```markdown
## Handoff: Worker-N → Worker-M

### Goal
[달성한 내용]

### Changes
- [파일]: [변경 설명]

### Open Questions
- [미해결 사항]

### Next Owner
Worker-M — [다음 태스크 설명]
```
