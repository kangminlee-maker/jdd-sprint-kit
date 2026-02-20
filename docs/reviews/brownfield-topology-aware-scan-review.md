# Brownfield Scanner 토폴로지별 스캔 전략 리뷰

> **문서 유형**: Party Mode 논의 기록 + 개선 제안
> **일자**: 2026-02-19
> **참여 에이전트**: Winston (Architect), Mary (Analyst), Murat (Test Architect), John (PM)
> **논의 주제**: Brownfield 2-Pass 프로세스의 효율성, 효과성, 안정성

---

## 1. 논의 배경

Sprint Kit의 Brownfield Scanner는 기존 시스템 지식을 수집하여 L1~L4 4계층 표준 포맷으로 정규화하는 핵심 컴포넌트이다.
수집 소스는 3가지(Document-Project, MCP Servers, Local Codebase), 실행은 2-Pass(Broad Scan → Targeted Scan) 구조로 설계되어 있다.

본 논의는 이 프로세스가 **다양한 프로젝트 토폴로지**(co-located, monorepo, MSA, standalone)에서 적절히 동작하는지 검토하기 위해 시작되었다.

### 핵심 문제 제기

> 토폴로지에 따라 primary 소스가 완전히 달라야 하는데, 현재 설계는 이를 고려하지 않는다.

- **Monorepo/Co-located**: Local이 필수이고 MCP는 불필요
- **MSA**: MCP가 필수이고 Local은 자기 서비스 범위로 제한되어야 함
- **Document-Project**: 있다면 Local 스캔의 가속기 역할을 해야 하지만, 현재는 단순 중복 방지 수준

---

## 2. 현재 설계 분석

### 2.1 토폴로지 감지 (Phase 0f)

`sprint.md`의 Step 0f-3에서 토폴로지를 정확히 감지한다:

| document-project | MCP | Build Tools | Monorepo | topology | brownfield_status |
|-----------------|-----|-------------|----------|----------|-------------------|
| any | any | any | yes | `monorepo` | `configured` / `local-only` |
| yes | yes | yes | no | `msa` | `configured` |
| yes | no | yes | no | `co-located` | `configured` |
| no | yes | yes | no | `msa` | `configured` |
| no | no | yes | no | `co-located` | `local-only` |
| no | yes | no | no | `standalone` | `configured` |
| no | no | no | no | `standalone` | `greenfield` |

### 2.2 감지 결과의 활용 (문제 지점)

감지된 `brownfield_topology`가 Brownfield Scanner에 전달되는 방식:

```
# auto-sprint.md:132, 344
local_codebase_root: {if brownfield_topology is co-located/msa/monorepo then '.' else null}
```

**co-located, msa, monorepo 세 가지 토폴로지가 모두 동일한 `'.'` 값으로 처리된다.**

Scanner 입력 파라미터(`brownfield-scanner.md:17-24`)에 `topology` 필드가 없으므로, Scanner는 자신이 어떤 토폴로지에서 실행되는지 알 수 없다.

### 2.3 현재 스캔 흐름

```
Pass 1 (Broad Scan) → L1 + L2
├── Stage 0: Document-Project 소비 (optional)
├── Stage 1~4: MCP 서버 스캔 (brownfield_sources에 설정된 MCP 있으면 항상 실행)
└── Stage 1~4 Local: 로컬 코드베이스 스캔 (local_codebase_root != null이면 항상 실행)

Pass 2 (Targeted Scan) → L3 + L4
├── Stage 1~4: MCP 스캔
└── Stage 1~4 Local: 로컬 코드베이스 스캔
```

MCP와 Local이 **항상 병렬로 실행**되며, 토폴로지에 따른 분기가 없다.

---

## 3. 토폴로지별 결함 분석

### 3.1 Co-located / Monorepo

| 결함 | Severity | 설명 |
|------|----------|------|
| MCP 이중 실행 | Medium | 모든 정보가 Local에 있는데 MCP도 병렬 실행. local 우선 규칙에 의해 MCP 결과는 대부분 폐기됨. 토큰 + 시간 낭비 |
| Document-Project 미활용 | Medium | `source-tree-analysis.md`가 있어도 Local Stage 1(Directory Structure)을 Glob으로 중복 실행. 가속기가 아닌 단순 중복 방지 수준 |
| Monorepo 전체 스캔 | High | `local_codebase_root = '.'`이면 monorepo 루트에서 Glob depth 4 실행. 관련 없는 패키지까지 포함된 노이즈 발생. 수천 개 파일 탐색 가능 |

### 3.2 MSA

| 결함 | Severity | 설명 |
|------|----------|------|
| Local 스캔 경계 미인식 | High | Local에서 보이는 건 자기 서비스 코드뿐인데, 크로스-서비스 키워드 미발견 원인을 식별 불가 ("keyword not found locally" vs "keyword belongs to another service" 구분 없음) |
| MCP 장애 가중치 부재 | Critical | `backend-docs` 1개 실패 = 전체 서비스 연동 정보 유실인데, MCP 실패 수로만 severity 판단 (1개 실패 = 속행). MSA에서 backend-docs 실패는 co-located에서의 실패와 임팩트가 완전히 다름 |
| Local 스캔 과잉 | Medium | 자기 서비스에 대해 Full 4-Stage 실행. Stage 3(Import 추적)과 Stage 4(키워드 검색)에서 다른 서비스 관련 키워드는 당연히 미발견. 불필요한 gap 기록 |

### 3.3 공통

| 결함 | Severity | 설명 |
|------|----------|------|
| Semantic matching 부재 | Medium | MCP의 `/api/v2/users`와 Local의 `userRouter.ts`가 동일 엔티티인지 판별하는 로직 없음. merge 시 중복 또는 누락 가능 |
| Pass 1 ↔ Pass 2 일관성 검증 없음 | Medium | Pass 1(L1+L2)과 Pass 2(L3+L4) 사이 시간 갭 동안 코드베이스 변경 시, append되는 L3+L4와 기존 L1+L2의 정합성 검증 메커니즘 부재 |
| Brief 품질 의존 | Medium | Stage 1~4의 키워드 탐색이 Brief 텍스트에 의존. Brief에 없는 인접 도메인(예: "결제" Brief에서 "정산", "환불")은 Stage 3 Structural Traversal의 3홉 제한 내에서 발견 보장 없음 |
| Self-Validation 양적 지표 | Low | "10/12 키워드 매칭"이 핵심 도메인 키워드 누락을 감추는 구조. 가중 키워드 커버리지 필요 |

---

## 4. 개선 제안

### 4.1 토폴로지별 스캔 프로파일 도입

Scanner 입력에 `topology` 파라미터를 추가하고, 토폴로지별 스캔 전략을 분기한다:

```yaml
co-located:
  primary: local (full 4-stage)
  mcp: skip
  accelerator: document-project → Local Stage 1 범위 축소

monorepo:
  primary: local (관련 패키지로 scope 제한)
  mcp: skip
  accelerator: document-project
  package_scope: [자동 감지 or sprint-input에서 지정]

msa:
  primary: mcp (full 4-stage, 크로스-서비스 탐색)
  secondary: local (자기 서비스만, Stage 1-2로 제한)
  accelerator: document-project (자기 서비스 local 스캔 가속)
  cross_service: mcp only

standalone:
  primary: mcp (full 4-stage)
  secondary: null
  accelerator: document-project
```

### 4.2 Document-Project를 진정한 가속기로 활용

현재: Stage 0에서 seed data로 소비 → "이미 covered된 키워드 skip" (중복 방지)

제안:
- `source-tree-analysis.md` → Local Stage 1(Directory Structure) **대체**
- `api-contracts.md` → Local Stage 2에서 읽어야 할 핵심 파일 목록 직접 제공
- `component-inventory.md` → Client 측 탐색 범위 사전 확정

### 4.3 MCP 장애 가중치

MCP 실패 severity를 토폴로지와 MCP 역할에 따라 차등 적용:

| 토폴로지 | backend-docs 실패 | client-docs 실패 | svc-map 실패 |
|----------|-------------------|-------------------|--------------|
| MSA | **Critical** (크로스-서비스 정보 유일 경로) | **Critical** | Medium |
| Co-located | N/A (MCP 미사용) | N/A | N/A |
| Standalone | High | High | Medium |

### 4.4 Monorepo 패키지 스코핑

`local_codebase_root = '.'` 대신, monorepo 감지 시:
1. 워크스페이스 설정 파일(`pnpm-workspace.yaml`, `nx.json` 등)을 읽어 패키지 목록 추출
2. Brief 키워드와 패키지 이름/경로 매칭
3. 매칭된 패키지 경로들만 `local_codebase_roots: [...]`로 전달

### 4.5 MSA Local 스캔 역할 명확화

MSA에서 Local 스캔의 목적을 "자기 서비스 경계 확인"으로 제한:
- Stage 1-2: 자기 서비스의 API 경계, 모델, 라우트 확인
- Stage 3-4: **Skip** (크로스-서비스 키워드는 MCP 전용)
- Gap 분류 시 "local not found" → "cross-service (MCP required)" 자동 태깅

---

## 5. 영향 범위

### 수정 대상 파일

| 파일 | 변경 내용 |
|------|-----------|
| `.claude/agents/brownfield-scanner.md` | `topology` 입력 파라미터 추가 + 토폴로지별 실행 분기 로직 |
| `.claude/agents/auto-sprint.md` | Scanner 호출 시 `brownfield_topology` 전달 |
| `.claude/commands/sprint.md` | Step 0f 결과를 Scanner 파라미터로 연결하는 부분 보강 |
| `.claude/commands/specs.md` | 동일 (specs에서도 brownfield scan 실행) |
| `.claude/rules/jdd-sprint-protocol.md` | Brownfield Data Flow 테이블에 토폴로지별 분기 명시 |

### 하위 호환성

- 기존 동작(모든 소스 병렬 실행)은 `topology` 파라미터 미전달 시 fallback으로 유지 가능
- Scanner 출력 포맷(brownfield-context.md)은 변경 없음 — 내부 실행 전략만 변경

---

## 6. 결론

현재 Brownfield Scanner는 **"토폴로지를 감지하지만 활용하지 않는"** 상태이다.
Phase 0f에서 정확하게 감지한 토폴로지 정보가 Scanner의 실행 전략에 반영되지 않아, 모든 토폴로지에서 동일한 "MCP + Local 병렬 실행" 패턴이 적용된다.

이는:
- **Co-located/Monorepo**에서 불필요한 MCP 이중 실행과 과도한 스캔 범위
- **MSA**에서 크로스-서비스 경계 미인식과 MCP 장애 시 치명적 정보 유실
- **전체적으로** document-project의 가속기 잠재력 미활용

을 초래한다.

토폴로지별 스캔 프로파일 도입을 통해 각 환경에 최적화된 스캔 전략을 적용하는 것이 효율성, 효과성, 안정성 모두를 개선하는 핵심 방안이다.
