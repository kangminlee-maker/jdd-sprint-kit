---
description: "Native Teams + Git Worktree로 태스크 병렬 실행"
---

# /parallel — Multi-Agent Parallel Execution

> **Dispatch Target**: Native Teams `@worker` agents

## Purpose

태스크를 병렬로 실행한다. Native Teams + Git Worktree + gh CLI를 활용한다.

## When to Use

Specs + Deliverables 생성 완료 후. CP2 승인 후 실행.

## Inputs

`$ARGUMENTS`: 사용하지 않음

선행 조건:
- `specs/{feature}/tasks.md` 존재
- `specs/{feature}/brownfield-context.md` 존재
- 파일 소유권 배정 완료
- 인터페이스 계약 (공유 타입) 정의 완료

## Procedure

### Step 1: 인터페이스 계약 생성
공유 타입/인터페이스를 먼저 생성한다 (모든 Worker가 참조):
- tasks.md에서 인터페이스 계약 추출
- 공유 타입 파일 생성 (예: `src/types.ts`)
- 이 단계는 병렬화하지 않는다

### Step 2: GitHub Issues 생성 (gh CLI)
gh CLI를 통해 (`gh issue create`) 각 태스크를 Issue로 생성한다:
```
각 Task → GitHub Issue
- Title: Task 설명
- Body: 소유 파일, 인터페이스, 의존성, Entropy 레벨
- Labels: entropy-high / entropy-medium / entropy-low
```

### Step 3: Git Worktree 설정
태스크별 Git Worktree를 생성하여 파일 충돌을 원천 차단한다:
```bash
# 태스크별 독립 worktree 생성
git worktree add ../worktree-{task-id} -b task/{task-id}
```
- 각 Worker에 독립된 worktree 할당
- 메인 브랜치에서 분기

### Step 4: Native Teams Worker 생성
Claude Code Native Teams로 Worker 에이전트를 생성한다:
1. TeamCreate로 팀 생성
2. 각 Worker를 Task tool로 생성 (`subagent_type: "worker"`, `model: "sonnet"`)
3. TaskCreate로 태스크 생성 후 TaskUpdate로 할당
4. 각 Worker에 `specs/{feature}/brownfield-context.md` 참조 지시:
   - 기존 코드 패턴/컨벤션 준수 (configured client-docs MCP 기반)
   - 기존 API 확장 시 호환성 유지 (configured backend-docs MCP 기반)
   - 기존 고객 여정 플로우와의 정합성 확인 (configured svc-map MCP 기반)

### Step 5: 병렬 실행 모니터링
- 각 Worker가 태스크를 실행한다
- API 태스크는 Worker가 Specmatic 자체 검증 후 완료 처리
- Worker 완료 시 → SendMessage로 핸드오프
- `gh issue close`로 Issue 닫기

#### Worker Failure Protocol
- **Worker crash/timeout**: 해당 Worker의 태스크를 FAILED 상태로 표시.
  독립 태스크를 가진 다른 Worker는 계속 진행.
  FAILED Worker에 의존하는 Worker는 대기.
- **2회 재시도 후 실패 지속**: 사용자에게 보고 + 나머지 Worker 결과로 부분 merge 옵션 제시.
- **Blocker 보고**: Worker가 SendMessage로 blocker 보고 시, 팀 리더가 다른 Worker에게 재배정 또는 사용자에게 에스컬레이션.

### Step 6: Merge & Integration
모든 Worker 완료 후:
1. 의존성 순서대로 각 worktree의 변경사항을 메인 브랜치에 merge
2. 통합 테스트 실행
3. 충돌 발생 시 → Merge Conflict Resolution Protocol 적용
4. 사용자에게 merge 결과 보고 + `/validate` 자동 실행 여부 확인
   - **자동 진행** → `/validate` 실행
   - **수동** → 사용자가 직접 `/validate` 실행

### Merge Conflict Resolution Protocol
1. **공유 타입 파일 충돌**: Step 1에서 pre-created 했으므로 발생하면 안 됨.
   발생 시 → Worker들의 변경 중 api-spec.yaml에 부합하는 쪽을 채택.
2. **package.json 충돌**: 양쪽의 dependency를 합집합으로 merge.
3. **비즈니스 로직 파일 충돌**: File Ownership 위반. 해당 Worker에게 수정 요청.
4. **해결 불가 충돌**: 사용자에게 보고 + 관련 diff 제시.

## Constraints
Worker 간 인수인계 시 다음 형식을 사용한다:
```markdown
## Handoff: Worker-N → Worker-M

### Goal
[달성한 목표]

### Changes
- [파일]: [변경 내용]

### Open Questions
- [미해결 이슈]

### Next Owner
Worker-M — [다음 작업 설명]
```
