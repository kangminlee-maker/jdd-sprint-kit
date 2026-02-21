# 리뷰: Tarball Snapshot를 Lazy Clone MCP 서버로 대체하는 방안

## Status: FINAL — Party Mode 14개 발견 사항 + 프로덕트 오너 입력 반영 완료

## 1. 현재 상태: Tarball Snapshot 메커니즘

### 동작 방식

1. Sprint Phase 0 (sprint.md Step 0d)이 brief.md의 `## Reference Sources`를 파싱합니다
2. GitHub URL을 추출하며, 명시적으로 나열된 저장소는 확인 없이 다운로드합니다
3. Sub-step 0f-2C에서 각 저장소를 다운로드합니다: `gh api repos/{owner_repo}/tarball/HEAD | tar xz -C /tmp/sprint-{feature}-{name} --strip-components=1`
4. 로컬 경로를 `sprint-input.md` → `external_resources.external_repos[]`에 기록합니다
5. Brownfield Scanner가 sprint-input.md를 읽고 Glob/Grep/Read를 통해 파일에 접근합니다

### 알려진 제한 사항

| # | 제한 사항 | 영향 | 관찰 여부 |
|---|----------|------|----------|
| T1 | 증분 업데이트 없음 — 매번 전체 tarball을 재다운로드 | 이론적: 대규모 저장소에서 대역폭 낭비 | **미관찰** — Sprint은 피처당 한 번 실행되며, tarball은 Phase 0에서 한 번 다운로드됩니다. 동일 세션 내 재다운로드 사례는 알려진 바 없습니다. |
| T2 | GitHub API 속도 제한 | `gh api`는 `gh auth` 토큰을 통한 인증된 호출을 사용하며, 대규모 저장소에서 보조 속도 제한의 대상이 됩니다 | 이론적 — 실제로 아직 발생하지 않음 |
| T3 | GitHub 전용 — GitLab/Bitbucket 미지원 | GitHub 이외의 저장소 사용자는 --add-dir를 사용해야 합니다 | 설계 의도 — 문서화된 제한 사항 |
| T4 | git 히스토리 없음 — 파일만 제공 | Scanner가 변경 빈도 분석을 위한 blame/log를 사용할 수 없습니다 | 낮은 영향 — Scanner는 blame을 사용하지 않음 |
| T5 | /tmp/ 지속성 — 정리 없음, OS 삭제 시 복구 불가 | Scanner가 누락된 디렉토리 발견 → 재시도 없는 실패 | 장시간 세션에서 실제 위험 존재 |
| T6 | 단일 재시도 | 1회 재시도 후 사용자는 --add-dir로 폴백해야 합니다 | 수용 가능 — --add-dir가 신뢰할 수 있는 폴백 |
| T7 | **버전 추적 없음** — 커밋 SHA, 브랜치, 타임스탬프 미기록 | Sprint 완료 후 "이 분석이 저장소의 어느 버전을 기반으로 했는가?"에 답할 수 없습니다. brownfield-context.md에 외부 저장소에 대한 출처 데이터가 없습니다. | **실제 격차** — 추적성과 디버깅에 영향 |
| T8 | **저장소 크기 확인 없음** — 크기와 무관하게 전체 저장소를 다운로드 | 1GB 이상의 모노레포 tarball은 수 분이 걸리고, 상당한 디스크를 소비하거나, 타임아웃될 수 있습니다. 경고가 표시되지 않습니다. tarball API로는 부분 다운로드(하위 디렉토리만)가 불가능합니다. | **실제 격차** — 1GB 이상 저장소는 명시적 처리가 필요 |

### Tarball의 강점 (종종 간과됨)

이러한 속성은 대체 시 쉽게 잃어버릴 수 있으며 반드시 보존해야 합니다:

| # | 강점 | 세부 사항 |
|---|------|----------|
| S1 | **항상 현재 HEAD를 가져옴** | 오래된 데이터 위험 없음 — 매번 최신 상태를 다운로드합니다 |
| S2 | **`.git/` 디렉토리 없음** | 추출된 파일은 순수 콘텐츠이며, `.git/`이 Glob/Grep 결과에 유출될 위험이 없습니다 |
| S3 | **`gh api`를 통한 원활한 인증** | `gh auth` OAuth 토큰을 활용하며, 추가 자격 증명 설정 없이 공개 및 비공개 저장소 모두에서 동작합니다 |
| S4 | **영속적 상태 없음** | 오래되는 캐시 없음, 디스크 누적 없음, 정리 불필요 |
| S5 | **단일 다운로드 메커니즘** | sprint.md의 단일 코드 경로, 분기 로직 없음 |

## 2. 제안된 대체안: Lazy Clone MCP 서버

### 개요

커스텀 MCP 서버(`docs-mcp-server`)로서:
- GitHub 저장소에 처음 접근할 때 `git clone --depth 1`을 수행합니다
- `~/docs-cache/{org}/{repo}/`에 클론을 캐싱합니다
- 만료 기간(기본값 1시간) 내 재접근 시: 로컬 캐시에서 읽기 (네트워크 0ms)
- 만료 기간 이후 재접근 시: `git fetch --depth 1 + reset --hard` (증분, diff만 전송)
- 6개의 MCP 도구를 노출합니다: `read_doc`, `list_docs`, `search_docs`, `read_multiple_docs`, `refresh_cache`, `list_cache`

### 해결하는 MCP Roots 문제

`@modelcontextprotocol/server-filesystem` v2025.7.1+은 클라이언트가 MCP Roots를 보낼 때 허용된 디렉토리를 대체합니다. 이 커스텀 서버는 roots 기능을 선언하지 않으므로 문제가 완전히 우회됩니다.

## 3. 실현 가능성 분석

### 3.1 Lazy Clone MCP가 실제로 해결하는 것

| 제한 사항 | Tarball | Lazy Clone MCP | 실질적 개선? |
|----------|---------|----------------|-------------|
| T1: 증분 업데이트 | 전체 재다운로드 | `git fetch` (diff만) | **미미함** — T1은 실제로 관찰되지 않습니다. Sprint은 피처당 한 번 다운로드합니다. |
| T2: API 속도 제한 | GitHub REST API (인증됨) | HTTPS git 프로토콜 (역시 GitHub에 의해 속도 제한) | **없음** — HTTPS 클론도 GitHub 속도 제한의 대상입니다. 비인증 클론은 적극적으로 제한됩니다. "API 없음"이 아니라 다른 프로토콜 엔드포인트일 뿐이며, 여전히 GitHub이 제어합니다. |
| T3: GitHub 전용 | GitHub 전용 | GitHub 전용 (HTTPS 클론) | 없음 — 여전히 GitHub 전용 |
| T4: git 히스토리 없음 | 파일만 | `--depth 1` (최신 커밋만) | 미미함 — 1개 커밋으로는 blame에 유용하지 않음 |
| T5: /tmp/ 지속성 | /tmp/ (OS가 삭제할 수 있음) | ~/docs-cache/ (영속적) | 예 — 세션 간 유지 |
| T6: 단일 재시도 | 1회 재시도 | 만료 확인을 통한 자동 재시도 | 예 — 투명한 재가져오기 |

**솔직한 평가**: T5와 T6만이 진정한 개선입니다. 주요 동기로 제시된 T1과 T2는 처음 제시된 것보다 약합니다.

### 3.2 전면 MCP 대체로 인해 발생하는 새로운 문제

| # | 문제 | 심각도 | 세부 사항 |
|---|------|--------|----------|
| P1 | **MCP 도구 간접 참조** | 높음 | Scanner는 Glob (glob 패턴), Grep (정규식, 컨텍스트 라인, 파일 유형 필터), Read (라인 오프셋)를 사용합니다. MCP `search_docs`는 `toLowerCase().includes()`를 사용하는 참조 구현이지만, ripgrep으로 개선하더라도 MCP 도구는 직접 파일 시스템 접근 대비 호출당 네트워크/IPC 오버헤드를 추가합니다. 아키텍처 비용은 여전히 남습니다. |
| P2 | **이중 검색 경로** | 높음 | 현재: 모든 소스가 Glob/Grep/Read를 사용합니다. MCP 도입은 도구 경로를 분할하여 스캐너의 모든 검색 작업에 조건부 로직을 요구합니다. |
| P3 | **MCP 서버 라이프사이클** | 중간 | Sprint 시작 전에 실행 중이어야 하며, 충돌 시 재시작이 필요합니다. Tarball에는 영속적 프로세스가 없습니다. |
| P4 | **--add-dir와 중복** | 낮음 | 로컬 클론이 없을 때만 유용 — tarball과 동일한 니치입니다. |
| P5 | **보안 모델 변경** | 중간 | DOCS_ALLOWED_ORGS가 비어 있는 MCP 서버는 모든 저장소 클론을 허용합니다. Tarball은 저장소별 사용자 확인을 요구합니다. |

**P1에 대한 참고**: 원래 리뷰는 `search_docs`를 "단순 문자열 매칭"이라고 비판했습니다. Party Mode는 이것이 MCP 아키텍처가 아닌 참조 구현을 대상으로 한다고 올바르게 지적했습니다. 그러나 ripgrep을 통합하더라도 MCP 도구는 IPC 오버헤드를 추가하며, Claude Code에서 인프로세스로 실행되는 Glob/Grep/Read의 제로 오버헤드 통합에 필적할 수 없습니다. 아키텍처 비용(P2: 이중 검색 경로)이 더 강력한 논거입니다.

### 3.3 아키텍처 적합성 평가

현재 Sprint Kit 아키텍처 원칙: **모든 외부 파일 접근은 Glob/Grep/Read를 사용합니다**.

이 원칙은 파일 시스템 MCP가 `--add-dir`로 대체되었을 때(Phase A, 2026-02-20) 확립되었습니다. 전체 스캐너, 4개 스테이지 전부, 그리고 jdd-mcp-search.md의 모든 규칙이 이 가정 위에 구축되어 있습니다.

Lazy Clone MCP 서버를 도입하면 **이 아키텍처 결정을 뒤집는 것이 됩니다**:

```
현재 (통합):
  로컬 코드베이스 ──→ Glob/Grep/Read
  --add-dir 저장소 ──→ Glob/Grep/Read
  tarball 저장소   ──→ Glob/Grep/Read
  Figma           ──→ MCP (예외: 라이브 API 데이터만)

전면 MCP 대체 (분할):
  로컬 코드베이스  ──→ Glob/Grep/Read
  --add-dir 저장소 ──→ Glob/Grep/Read
  Lazy Clone 저장소──→ MCP 도구 (read_doc, search_docs 등)  ← 새로운 경로
  Figma           ──→ MCP
```

**전면 MCP 대체에 대한 결론: 거부.** 아키텍처 비용(이중 검색 경로)이 이점을 초과합니다.

## 4. 대안: 하이브리드 접근법 — Shallow Clone을 다운로드 백엔드로만 사용

파일 접근을 위한 MCP 도구 대신, shallow clone을 **다운로드/캐시 단계에만** 사용한 후 캐시된 디렉토리를 기존 경로를 통해 Glob/Grep/Read에 노출합니다.

### 동작 방식

1. Sprint Phase 0이 GitHub URL을 감지합니다 (현재와 동일)
2. `gh api tarball/HEAD | tar xz` 대신 캐시 디렉토리에 `git clone --depth 1` 실행
3. 캐시가 존재하고 최신이면 클론 건너뛰기
4. 캐시 경로를 `sprint-input.md` → `external_resources.external_repos[]`에 기록
5. Scanner가 캐시된 경로에서 Glob/Grep/Read를 사용 (현재 tarball과 동일)

### 보존되는 것

- 단일 접근 경로 (모든 것에 Glob/Grep/Read)
- MCP 서버 라이프사이클 관리 불필요
- Scanner 코드 변경 없음
- jdd-mcp-search.md 규칙 변경 없음

### 얻는 것

| 이점 | 세부 사항 |
|------|----------|
| 영속적 캐시 | `~/docs-cache/`가 세션 간 유지 (/tmp/가 아님) |
| 더 빠른 재실행 | 캐시가 최신이면 Phase 0에서 다운로드를 완전히 건너뜀 |
| 증분 가져오기 | `git fetch --depth 1`이 diff만 전송 (만료 시) |

### 하이브리드 접근법이 도입하는 새로운 문제

**tarball에는 없는** 문제들 — 하이브리드가 해결해야 하는 회귀:

| # | 문제 | 심각도 | 세부 사항 |
|---|------|--------|----------|
| H1 | **만료된 캐시가 오래된 데이터를 무음으로 제공** | 높음 | Tarball은 항상 현재 HEAD를 가져옵니다. 1시간 만료 창을 가진 하이브리드는 59분 된 데이터를 "최신"으로 취급합니다. Feature-A가 저장소 X를 캐시한 후 변경되면, 50분 후 시작하는 Feature-B는 이전 버전을 무음으로 받습니다. 이는 tarball의 동작보다 나쁩니다. |
| H2 | **`.git/` 디렉토리가 Scanner 결과에 유출** | 높음 | Tarball 추출에는 `.git/`이 없습니다. Shallow clone에는 있습니다. Scanner의 Glob 패턴(예: `**/*.md`)은 모든 Glob/Grep 호출에서 명시적으로 제외하지 않으면 `.git/` 내용과 매칭됩니다. 현재 Scanner는 캐시된 저장소의 `.git/`을 고려하여 설계되지 않았습니다. |
| H3 | **공유 캐시의 경쟁 조건** | 중간 | 다른 Sprint 세션이 캐시 디렉토리에서 읽는 동안 `git fetch + git reset --hard`를 실행하면 부분적으로 작성된 파일이 발생할 수 있습니다. Tarball은 Sprint당 고유한 `/tmp/sprint-{feature}-{name}/`에 작성하므로 공유가 없습니다. |
| H4 | **캐시 경로의 브랜치 충돌** | 높음 | 캐시 경로 `~/docs-cache/{owner}/{repo}`에는 브랜치 구성 요소가 없습니다. Feature-A는 `org/repo@main`이 필요하고, Feature-B는 `org/repo@develop`이 필요하면 서로 덮어씁니다. |
| H5 | **비공개 저장소 인증 격차** | 높음 | Tarball은 `gh auth` OAuth 토큰을 원활하게 활용하는 `gh api`를 사용합니다. `git clone https://...`는 별도의 git 자격 증명 저장소를 사용합니다. `gh auth`가 구성된 많은 사용자가 HTTPS git 자격 증명은 구성하지 않았습니다. tarball로 동작하는 비공개 저장소가 shallow clone으로는 실패합니다. 공개 저장소도 비인증 속도 제한이 더 낮을 수 있습니다. |
| H6 | **무제한 디스크 증가** | 중간 | `/tmp/`는 OS가 관리하며 자동 정리됩니다. `~/docs-cache/`는 정리 없이 무한정 증가합니다. 수개월간 Sprint 사용 후 수십 개의 저장소가 누적됩니다. |
| H7 | **자연어 지시문의 복잡성** | 중간 | sprint.md는 실행 가능한 코드가 아닌 프롬프트입니다. 캐시 최신성 검사, git 오류 분류, 브랜치 라우팅, 경쟁 조건 회피 — LLM이 따라야 하는 자연어 지시문으로 표현하면 TypeScript보다 결정적으로 만들기 어렵습니다. 구현은 "~60줄의 셸 스크립트"가 아니라 "엣지 케이스를 안정적으로 처리해야 하는 ~60줄의 LLM 지시문"입니다. |

## 5. 비교 평가

### Tarball vs 하이브리드: 솔직한 트레이드오프

| 차원 | Tarball (현재) | 하이브리드 (shallow clone) | 승자 |
|------|---------------|--------------------------|------|
| 데이터 최신성 | 항상 현재 HEAD | 만료 창 내 오래된 데이터 | **Tarball** |
| 인증 간편성 | `gh auth` 토큰, 설정 불필요 | `gh auth setup-git` 또는 git 자격 증명 필요 | **Tarball** |
| `.git/` 오염 없음 | 보장됨 (`.git/` 없음) | 명시적 제외 필요 | **Tarball** |
| 동시성 안전성 | Sprint당 고유한 /tmp/ | 공유 캐시, 경쟁 조건 | **Tarball** |
| 단일 다운로드 메커니즘 | 예 | 예 (폴백 없는 경우) | 동점 |
| 캐시 지속성 | /tmp/ (OS가 삭제할 수 있음) | ~/docs-cache/ (영속적) | **하이브리드** |
| 재실행 속도 | 전체 재다운로드 | 최신이면 건너뛰기 | **하이브리드** |
| 디스크 관리 | OS가 /tmp/ 처리 | 수동 정리 필요 | **Tarball** |
| 브랜치 지원 | N/A (캐시 없음) | 경로에 브랜치 필요 | **Tarball** (더 간단) |

**점수: Tarball 6, 하이브리드 2, 동점 1.**

하이브리드 접근법은 해결하는 것보다 더 많은 문제를 도입합니다. 두 가지 진정한 이점(영속적 캐시, 더 빠른 재실행)이 7개의 새로운 문제를 정당화하지 못합니다.

## 6. 권장 사항

### 주요: Tarball 유지, 세 가지 격차 수정 (T5 + T7 + T8)

현재 tarball 메커니즘에 세 가지 실제 격차가 존재합니다. 모두 다운로드 메커니즘을 변경하지 않고 수정 가능합니다.

#### 수정 1: 영속적 추출 경로 (T5)

**tarball 추출을 `/tmp/`에서 `~/docs-cache/`로 이동합니다.**

```
현재:    /tmp/sprint-{feature}-{owner}-{repo}/
제안:    ~/docs-cache/{feature}/{owner}-{repo}/
```

이렇게 하면 H1-H7을 전혀 도입하지 않으면서 영속적 캐시 이점을 확보합니다:

| 속성 | 결과 |
|------|------|
| 데이터 최신성 | 항상 현재 HEAD (tarball은 매 Sprint마다 재다운로드) |
| 인증 | `gh auth` 토큰 (변경 없음) |
| `.git/` 오염 | 없음 (tarball에는 `.git/`이 없음) |
| 동시성 안전성 | 피처당 고유 디렉토리 (공유 없음) |
| 다운로드 메커니즘 | 단일 경로 (`gh api tarball`) |
| 지속성 | `~/docs-cache/`가 세션 간 유지 |
| 디스크 관리 | 피처별 디렉토리; 정리 추가 가능 |

#### 수정 2: 버전 추적 (T7)

tarball 다운로드 후 커밋 SHA를 조회하여 sprint-input.md에 기록합니다:

```
gh api repos/{owner_repo}/commits/{ref} --jq '.sha + " " + .commit.committer.date'
```

여기서 `{ref}`는 URL에서 추출한 브랜치입니다 (기본값: `HEAD`).

`external_resources.external_repos[]`에 기록:

```yaml
- name: "org-backend-api"
  path: "~/docs-cache/{feature}/org-backend-api/"
  access_method: "tarball-snapshot"
  source_url: "https://github.com/org/backend-api"
  snapshot_commit: "a1b2c3d"          # 신규 — 다운로드 시점의 커밋 SHA
  snapshot_branch: "main"              # 신규 — 브랜치 (URL 또는 기본값에서)
  snapshot_at: "2026-02-20T14:30:00Z"  # 신규 — 커밋 타임스탬프
```

이 데이터는 brownfield-context.md의 `data_sources` 섹션으로 전파되어 추적성을 가능하게 합니다: "이 Brownfield 분석은 `org/backend-api`의 커밋 `a1b2c3d` (main 브랜치, 2026-02-20T14:30Z)를 기반으로 했습니다."

**비용**: 저장소당 1회 추가 `gh api` 호출 (1초 미만). 동작 변경 없음.

#### 수정 3: 저장소 크기 확인 + 대규모 저장소 경고 (T8)

tarball 다운로드 전에 저장소 크기를 조회합니다:

```
gh api repos/{owner_repo} --jq '.size'
```

GitHub API `.size`는 KB 단위를 반환합니다. 다음 로직을 적용합니다:

| 크기 | 조치 |
|------|------|
| < 1GB | 중단 없이 다운로드 |
| >= 1GB | **경고 + 계속**: 저장소 크기를 표시하고, 다운로드에 시간이 걸릴 수 있음을 알린 후 진행합니다. 차단 확인 없음. 모노레포 부분 접근의 경우, 대안으로 `--add-dir`를 안내합니다. |

경고 메시지 (`{communication_language}`로):

```
⚠ {owner_repo}: 약 {size_mb}MB. 다운로드에 수 분이 소요될 수 있습니다.
  부분 접근(특정 디렉토리만)이 필요하면: git clone + claude --add-dir 사용
  다운로드 중...
```

**설계 결정**: 경고 후 계속 진행, 경고 후 확인 아님. 근거:
- 사용자가 이미 `## Reference Sources`에 이 저장소를 선언했습니다 (명시적 의도).
- 확인 차단은 자동화된 Phase 0 흐름을 방해합니다.
- 경고가 사용자가 중단하고 수동으로 재시도하려는 경우 `--add-dir` 대안을 제공합니다.
- Tarball API는 부분 다운로드(하위 디렉토리만)를 지원하지 않으므로, 크기가 진정으로 비현실적인 저장소의 경우 로컬 sparse checkout과 함께 `--add-dir`가 유일한 대안입니다.

### 보조: 향후 Cross-Sprint 캐시 재사용이 필요한 경우

여러 피처에서 재다운로드 없이 저장소를 재사용해야 하는 미래의 필요가 발생하면:

1. 최신성 확인 추가: `~/docs-cache/{owner}-{repo}/`가 존재하고 N분 이내에 수정되었으면 다운로드 건너뛰기
2. 재다운로드에 계속 `gh api tarball` 사용 (git clone 아님) — 인증 간편성과 `.git/` 없음 보존
3. 브랜치 지원이 필요하면 캐시 키에 브랜치 포함: `~/docs-cache/{owner}-{repo}@{branch}/`

이것은 다운로드 메커니즘의 대체가 아닌 점진적 개선입니다.

### 하지 말아야 할 것

1. **tarball을 `git clone --depth 1`로 대체하지 마십시오** — 비례적 이점 없이 H1-H7을 도입합니다
2. **Lazy Clone MCP 서버를 도입하지 마십시오** — Phase A 아키텍처 결정(모든 것에 Glob/Grep/Read)을 뒤집습니다
3. **두 가지 다운로드 메커니즘을 유지하지 마십시오** (shallow clone + tarball 폴백) — 코드 경로와 지시문 복잡성이 두 배가 됩니다

### MCP 서버 가이드를 어떻게 할 것인가

Lazy Clone MCP 서버 가이드(`docs-mcp-server-guide.md`)는 잘 설계된 작업물입니다. 실제 문제인 MCP Roots 프로토콜 디렉토리 대체 이슈를 해결하지만, 이 문제는 Sprint Kit의 현재 아키텍처에는 존재하지 않습니다 (Sprint Kit은 외부 저장소에 파일 시스템 MCP 서버를 사용하지 않습니다).

**가이드를 참고 자료로 보존하십시오** — MCP 기반의 외부 저장소 접근이 필요한 시나리오(예: 미래의 MCP 클라이언트가 roots 인식 서버를 요구하는 경우)를 위해. 현재 tarball-to-cache 마이그레이션에는 필요하지 않습니다.

## 7. 설계 결정 (해결됨)

Party Mode가 5개의 보류된 질문을 식별했습니다. 모두 여기서 해결합니다:

| # | 질문 | 결정 | 근거 |
|---|------|------|------|
| Q1 | `~/docs-cache/`를 설정 가능하게 해야 하는가? | **고정 경로, 환경 변수 없음.** | Sprint Kit은 환경 변수를 설정 인터페이스로 노출하지 않습니다. `~/docs-cache/`는 예측 가능하고 문서화되어 있습니다. 다른 경로가 필요하면 심볼릭 링크를 사용할 수 있습니다. |
| Q2 | 만료 임계값을 설정 가능하게? | **해당 없음.** | 주요 권장 사항은 tarball을 사용합니다 (항상 최신). 보조 개선을 채택하면 고정된 1시간 임계값 사용 — 설정 가능한 임계값은 최소한의 이점에 비해 복잡성을 추가합니다. |
| Q3 | 오래된 캐시를 위한 정리 명령? | **예 — 백로그에 추가.** | `~/docs-cache/`에는 정리 메커니즘이 필요합니다. 가장 간단: 피처당 수동 `rm -rf ~/docs-cache/{feature}/`를 문서화합니다. 디스크 증가가 실제 문제가 되면 자동화(예: TTL 기반)가 따를 수 있습니다. |
| Q4 | 클론 실패 시 Tarball 폴백? | **폴백 없음 — 주요 권장 사항은 tarball을 유일한 메커니즘으로 유지합니다.** | 두 가지 다운로드 경로를 유지하면 복잡성이 두 배가 됩니다. |
| Q5 | GitHub URL에서 브랜치 감지? | **예 — URL 경로에 있을 때 브랜치를 추출합니다.** | URL 패턴 `github.com/org/repo/tree/{branch}`에서 `{branch}`를 추출해야 합니다. 기본값은 `HEAD` (`gh api tarball/HEAD`가 이미 처리). 피처별 디렉토리를 사용하므로 캐시 경로 충돌이 없습니다. |
| Q6 | tarball 스냅샷의 버전 추적을 어떻게 처리할 것인가? | **다운로드 후 `gh api commits/{ref}`를 통해 커밋 SHA + 브랜치 + 타임스탬프를 기록합니다.** | 저장소당 1회 추가 API 호출 (1초 미만). brownfield-context.md에서 추적성을 가능하게 합니다. |
| Q7 | 대규모 저장소(1GB+)를 어떻게 처리할 것인가? | **경고 후 계속 진행: 크기 표시, --add-dir 대안 안내, 다운로드 진행.** | 사용자가 Reference Sources에 저장소를 명시적으로 선언했습니다. 차단 확인은 자동화된 흐름을 방해합니다. Tarball API는 부분 다운로드를 지원하지 않습니다. |

## 8. 구현 범위

### 최소 (주요 권장 사항 — T5 + T7 + T8)

| 파일 | 변경 사항 |
|------|----------|
| `.claude/commands/sprint.md` | Sub-step 0f-2C: (1) `mkdir` 대상을 `/tmp/`에서 `~/docs-cache/{feature}/{name}`으로 변경. (2) `gh api repos/{owner_repo} --jq '.size'` 사전 확인 + 1GB 경고 추가. (3) 버전 추적을 위해 다운로드 후 `gh api repos/{owner_repo}/commits/{ref}` 추가. (4) GitHub URL에서 브랜치 추출 추가. |
| `_bmad/docs/sprint-input-format.md` | `external_repos[]`에 `snapshot_commit`, `snapshot_branch`, `snapshot_at` 필드 추가. 추출 경로로 `~/docs-cache/` 문서화. |
| `.claude/rules/jdd-mcp-search.md` | Method 3: 경로 설명 업데이트 (tarball → 영속적 캐시) |
| `_bmad/docs/brownfield-context-format.md` | `data_sources` 섹션: 스냅샷 출처 필드 문서화 |
| `CHANGELOG.md` | 변경 사항 기록 |

**예상: 5개 파일, ~40줄 변경. Scanner 또는 에이전트 변경 없음.**

## 부록: Party Mode 발견 사항 로그 + 프로덕트 오너 입력

적대적 리뷰의 14개 발견 사항 + 2개 프로덕트 오너 우려 사항, 모두 반영됨:

| # | 발견 사항 | 처리 |
|---|----------|------|
| 1 | T1 (증분 업데이트)은 유령 문제 | T1을 \u00a71에서 하향 조정; \u00a73.1에 솔직한 평가 추가 |
| 2 | `.git/` 디렉토리가 Scanner 결과를 오염시킴 | \u00a74에 H2로 추가; tarball 유지로 해결 (`.git/` 없음) |
| 3 | 만료된 캐시는 tarball보다 나쁨 | \u00a74에 H1으로 추가; 하이브리드 거부의 핵심 요인 |
| 4 | "API 속도 제한 없음"은 거짓 | \u00a73.1에서 수정 — HTTPS 클론도 속도 제한됨 |
| 5 | `git reset --hard` 경쟁 조건 | \u00a74에 H3으로 추가; 피처별 디렉토리로 해결 |
| 6 | 캐시 경로의 브랜치 충돌 | \u00a74에 H4로 추가; 피처별 디렉토리로 해결 |
| 7 | "~60줄" 추정은 프롬프트 지시문에 대해 기만적 | \u00a74에 H7로 추가; 주요 권장 사항은 ~20줄 |
| 8 | search_docs 비판은 아키텍처가 아닌 구현을 대상으로 함 | \u00a73.2 참고에서 재구성 — P2 (이중 검색 경로)가 더 강력한 논거 |
| 9 | Tarball 폴백 = 두 가지 메커니즘 | \u00a76에서 해결: 폴백 없음, tarball이 유일한 메커니즘 |
| 10 | 비공개 저장소 인증 격차 | \u00a74에 H5로 추가; `gh api` 유지로 해결 |
| 11 | 디스크 공간 관리 누락 | Q3 (\u00a77)에서 해결: 정리를 백로그 항목으로 문서화 |
| 12 | Section 7이 중요한 결정을 보류 | 5개 질문 모두 \u00a77에서 해결 |
| 13 | "Lazy loading"은 무관한 트레이드오프 | 문서에서 완전히 제거 |
| 14 | `gh auth` ≠ `git` 자격 증명 | \u00a74에 H5 세부 사항으로 추가; `gh api` 유지로 해결 |

**프로덕트 오너 입력** (Party Mode 이후):

| # | 우려 사항 | 처리 |
|---|----------|------|
| PO-1 | 버전 추적 없음 — 스냅샷이 어느 커밋을 나타내는지 추적 불가 | \u00a71에 T7로 추가; \u00a76 수정 2 (`gh api commits/{ref}`를 통한 커밋 SHA + 브랜치 + 타임스탬프) |
| PO-2 | 대규모 저장소 크기 — 1GB+ 저장소에 대한 처리 없음 | \u00a71에 T8로 추가; \u00a76 수정 3 (크기 사전 확인 + 경고 후 계속 진행 + --add-dir 안내) |
