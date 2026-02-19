# Brownfield Scanner 개선 계획 — 최종 확정본

> **문서 유형**: Party Mode 3회 검토 결과 + 확정 계획
> **일자**: 2026-02-19
> **참여 에이전트**: Winston (Architect), Amelia (Dev), Mary (Analyst), Murat (Test Architect), Bob (SM), John (PM), Sally (UX Designer), Paige (Tech Writer)
> **선행 문서**: `brownfield-topology-aware-scan-review.md`

---

## 이 개선이 해결하려는 문제

Sprint Kit의 Brownfield Scanner는 새 기능을 만들기 전에 기존 시스템이 어떻게 되어있는지를 자동으로 조사하는 컴포넌트다. 조사 결과는 이후 PRD, 아키텍처, 태스크 등 모든 산출물의 기초 데이터가 된다.

프로젝트마다 구조가 다르다:

- **Co-located**: 프론트엔드와 백엔드가 같은 코드베이스에 있는 프로젝트
- **Monorepo**: 여러 패키지/서비스가 하나의 저장소 안에 폴더로 나뉘어 있는 프로젝트
- **MSA (Microservice Architecture)**: 서비스들이 각각 별도 저장소에 분리되어 있는 프로젝트
- **Standalone**: 외부 서비스 연동만 있고 로컬 코드가 없는 프로젝트

현재 Scanner는 프로젝트가 어떤 구조인지를 정확하게 감지한다. 그런데 감지한 후에 그 정보를 사용하지 않는다. 어떤 구조든 동일한 방식으로 조사한다. 이로 인해:

- Co-located에서는 이미 로컬에 있는 정보를 외부 서버에서도 중복으로 가져와 시간과 비용을 낭비한다
- Monorepo에서는 관련 없는 패키지까지 전부 뒤져서 노이즈가 생긴다
- MSA에서는 다른 서비스의 정보가 외부 서버에만 있는데, 그 서버가 실패해도 심각하게 취급하지 않는다

---

## 조사 데이터의 출처 3가지

Scanner가 기존 시스템 정보를 가져오는 경로:

1. **Local (로컬 코드베이스)**: 현재 프로젝트 폴더 안의 소스 코드를 직접 탐색
2. **MCP 서버**: 외부에 설정된 정보 저장소 (API 문서, 화면 플로우, 디자인 데이터 등)
3. **Document-project**: BMad가 이전에 코드베이스를 분석해서 만든 구조화된 문서

프로젝트 구조에 따라 이 3가지 중 어떤 것이 주(primary) 소스이고 어떤 것이 보조인지가 달라져야 하는데, 현재는 그 구분이 없다.

---

## 핵심 설계 결정 (3회 검토를 거쳐 확정)

### MCP 서버 처리 방식

- MCP 서버에 역할 분류를 두지 않는다 (backend-docs, client-docs 같은 분류 제거)
- MCP는 범용으로 취급하며, 설정된 서버는 모두 조사에 활용한다
- 프로젝트 구조(topology)는 Local 조사 전략에만 영향을 준다
- MCP 조사의 실행 여부와 범위는 topology에 따라 조절한다:
  - Co-located/Monorepo: MCP가 설정되어 있으면 시도하되, Local과 중복이면 Local 우선
  - MSA/Standalone: 모든 MCP 필수 시도

### Document-project의 역할

- Document-project는 조사를 빠르게 하는 가속기(accelerator)가 아니다
- 조사가 끝난 후, 결과가 맞는지 확인하는 **Ontology 검증 레이어**로 사용한다
- Document-project에 기록된 엔티티 목록과 조사 결과를 대조하여 누락/불일치를 감지한다

### 프로덕션 반영 시점

- Phase 4까지 전부 완료된 후에 프로덕션에 반영한다
- 하위 호환성을 고려할 필요 없이, 완성도와 속도만 최적화한다

---

## 확정된 Phase 구조

### Sprint 0: 사전 준비

구현 시작 전에 확정해야 할 항목들. 이것 없이 Phase 1에 들어가면 구현 중간에 설계 결정이 발생하여 일정이 지연된다.

| 항목 | 내용 | 이유 |
|------|------|------|
| Figma MCP 호출 경로 | fileKey/nodeId를 어디서 가져오는지 정의 | 정의 없으면 Phase 1에서 Figma MCP 실행이 불가 |
| Entity Index 최소 구조 | name + source + layer 3개 필드 확정 | Phase 3에서 사용할 구조를 Phase 1에서 미리 확정해야 파일 구조 반복 수정 방지 |
| Shadow Run 통과 기준 | 무엇이 PASS이고 무엇이 FAIL인지 명시 | 기준 없는 검증은 형식적 절차 |
| 엣지 시나리오 목록 | Phase 1-B에서 테스트할 경계 케이스 사전 정의 | LLM이 스스로 만들고 스스로 검증하면 신뢰성 없음 |
| Scanner 프롬프트 분리 구조 | 단일 파일을 역할별 4개 파일로 나누는 방식 결정 | 긴 프롬프트에서 LLM의 지시 수행 품질이 저하됨 |

### Phase 1: 기반 — "프로젝트 구조에 따라 다르게 조사하라"

Scanner에 `topology` 파라미터를 추가하고, 프로젝트 구조에 따라 조사 전략을 분기한다.

| 프로젝트 구조 | Local 조사 | MCP 조사 |
|--------------|-----------|----------|
| Co-located | 전체 4단계 수행 (주 소스) | 설정되어 있으면 시도, Local 중복이면 Local 우선 |
| Monorepo | 관련 패키지만 4단계 수행 (주 소스) | 동일 |
| MSA | 자기 서비스 범위만 1~2단계 (보조) | 전부 시도 (주 소스) |
| Standalone | 수행 안 함 | 전부 시도 (유일한 소스) |

**Checkpoint A**: 핵심 스캔 로직 + 결과 파일 포맷 확정 → Shadow Run으로 검증
**Checkpoint B**: 오감지 방어 로직 (topology 감지 결과는 sprint-log에 기록, 사용자 인터럽트 없음)

수정 대상 파일: `brownfield-scanner.md`, `auto-sprint.md`, `sprint.md`, `specs.md`

### Phase 2: MCP 실패 대응 — "어떤 정보가 빠졌는지를 판단하라"

현재 MCP 서버 실패 처리: 실패 개수만 센다 (1개 실패 = 계속, 3개 이상 = 중단).

변경: "몇 개 실패했는가"가 아니라 **"이 프로젝트 구조에서, 이 MCP가 유일한 정보 경로였는가"**를 기준으로 심각도를 판단한다.

추가 항목:
- MCP 빈 결과 감지: 연결은 성공했지만 실질적 데이터가 없는 경우 (인증 만료 등)
- Freshness 판단: Document-project 데이터가 오래된 것인지 확인

검증: Delta Shadow Run (MCP 실패 경로 + freshness만 검증, 전체 재검증 아님)

수정 대상 파일: `brownfield-scanner.md` (Fallback Strategy 섹션)

### Phase 3: Ontology 검증 + Entity Index — "찾은 것이 맞는지 확인하라"

**3a: Ontology 검증**

Document-project에 기록된 엔티티 목록과 Scanner 조사 결과를 대조한다.
- Document-project에 있는데 조사 결과에 없다 → 조사 불완전 신호
- 조사 결과에 있는데 Document-project에 없다 → 새로 추가된 기능 또는 Document-project 노후화 신호

**3b: Entity Index + Self-Validation**

Entity Index: brownfield-context.md 말미에 "엔티티별로 어떤 정보가 어디서 발견되었는지" 요약 표를 생성한다. 현재는 조사 단계(L1~L4)별로만 정리되어 있어 하나의 엔티티 정보를 보려면 4개 섹션을 모두 훑어야 하는 문제를 해결한다.

Self-Validation: Scanner가 자기 조사 결과의 품질을 자체 점검하는 핵심 3개 항목.

수정 대상 파일: `brownfield-scanner.md` (Self-Validation), `brownfield-context-format.md`

### Phase 4: Monorepo 스코핑 — "관련 패키지만 골라서 조사하라"

일정 압박 시 백로그 이동 가능. Phase 1~3이 안정화되면 Monorepo 스코핑은 선택적이다.

- 워크스페이스 설정 파일 파싱 → 패키지 목록 추출
- AI가 관련 패키지를 추천하고, 사용자는 제외할 것만 지정하는 방식 (목록 나열이 아닌 AI 추천 + 거부권 모델)
- 스코핑 정확도 측정

수정 대상 파일: `brownfield-scanner.md`, `sprint.md`

### JP1 개선

JP1 프레젠테이션에 brownfield 스캔 품질 한줄 요약을 추가한다.
예: "L1~L4 수집 완료 / L3 일부 누락(MCP 미연결)"

제품 전문가가 JP1에서 판단할 때, 기초 데이터가 완전한지 불완전한지 알아야 판단의 정확도가 올라간다.

---

## 백로그 (Phase 4 이후)

| 항목 | 복귀 조건 |
|------|----------|
| Self-Validation 고도화 (신뢰도 점수 산출 공식 등) | Phase 3 Self-Validation 핵심 3개 항목이 안정화된 후 |
| Semantic Matching (MCP 결과와 Local 결과 간 동일 엔티티 자동 판별) | 임베딩 기반 도구 연동이 가능해진 시점 |
| Brief 빈약 시 조사 범위 보완 메커니즘 | Ontology 검증 피드백 루프 안정화 후 |
| 반복 Sprint (2회차+) 시 Entity Index 누적/충돌 처리 | Entity Index 포맷이 확정된 후 |

---

## 검토 과정에서 발견된 것 — 놓친 것과 과도한 것

### 놓친 것 (Critical)

| # | 항목 | 제기자 | 내용 |
|---|------|--------|------|
| 1 | Figma MCP 호출 경로 미정의 | Amelia | fileKey/nodeId를 어디서 가져오는지 구현 경로가 없음. Phase 1에서 즉시 막힘 |
| 2 | Shadow Run 통과 기준 미정의 | John | 무엇이 PASS인지 명시 필요. 기준 없는 검증은 형식적 체크박스 |
| 3 | entity_bucket 스키마가 Phase 1-A 완료 기준에 없음 | Murat, Bob | Phase 3이 이 스키마에 의존하는데 암묵적으로만 존재 |

### 놓친 것 (High)

| # | 항목 | 제기자 |
|---|------|--------|
| 4 | MCP 유일 소스 판별 기준 | Murat |
| 5 | MCP 연결 성공 vs 실질 데이터 확보 구분 | Mary |
| 6 | JP1에서 brownfield 품질 가시성 | Sally |
| 7 | Phase 1→2 핸드오프 문서 갭 | Bob |
| 8 | Sprint 0 (사전 준비) 부재 | Bob |

### 놓친 것 (Medium)

| # | 항목 | 제기자 |
|---|------|--------|
| 9 | 반복 Sprint 시 Entity Index 누적/충돌 | Mary |
| 10 | 백로그 항목의 복귀 조건 미정의 | Murat, Bob |
| 11 | Entity Index 독자 미정의 | Sally |
| 12 | 산출물 위치 확정 | Paige |

### 과도한 것 — 제거/축소

| # | 항목 | 제기자 | 조치 |
|---|------|--------|------|
| 1 | Phase 1 topology 사용자 확인 인터럽트 | Sally | sprint-log 기록으로 대체, JP1에서 확인 |
| 2 | Phase 2 후 전체 Shadow Run | Bob | Delta Shadow Run으로 축소 |
| 3 | YAML frontmatter의 discovered 카운트 필드 | Amelia, Winston | 필수에서 선택으로 |
| 4 | Phase 4 패키지 목록 나열 방식 | Sally | AI 추천 + 거부권 모델로 전환 |
| 5 | brownfield-scanner.md 단일 프롬프트 유지 | Paige | 역할별 분리 프롬프트 |

### 과도할 수 있음 — 재검토

| # | 항목 | 제기자 | 판단 |
|---|------|--------|------|
| 6 | Mary D (Pass delta) | Mary | Entity Index가 있으면 delta가 자연스럽게 드러남. 별도 단계 가치 재검토 |
| 7 | Phase 4 전체 | Mary | Phase 1~3 안정화 후 선택적. 일정 압박 시 백로그 가능 |
| 8 | entity_bucket Phase 1 예약 스키마 | Winston, Amelia | 최소 스키마(name + source + layer)만 예약 |

---

## 스프린트 플래닝 (Bob 제안)

| Sprint | Phase | 완료 기준 |
|--------|-------|----------|
| Sprint 0 | 사전 준비 | 5개 사전 확정 항목 완료 |
| Sprint 1 | Phase 1-A + 1-B | Shadow Run PASS + 엣지 시나리오 통과 |
| Sprint 2 | Phase 2 | MCP 실패 심각도 반영 + Delta Shadow Run PASS |
| Sprint 3 | Phase 3a | Entity Index 생성 + ontology 검증 동작 |
| Sprint 4 | Phase 3b + Phase 4 | Self-Validation + Monorepo 스코핑 동작 |

---

## 8명의 최종 판정 요약

| 에이전트 | 판정 |
|----------|------|
| **Winston** (Architect) | 포맷 예약은 최소 필수만. merge_priority만 추가하면 충분 |
| **Amelia** (Dev) | Figma MCP 경로부터 해결하라. LLM 분기 지시보다 파라미터 null 전달이 안정적 |
| **Mary** (Analyst) | Entity Index가 유일한 사용자 체감 개선. 나머지는 내부 최적화. Phase 4는 선택적 |
| **Murat** (Test Architect) | entity_bucket 스키마와 MCP 유일 소스 판별 — 이 2개가 미확정이면 Phase 2~3 진입 불가 |
| **Bob** (SM) | Sprint 0 없이 시작하면 Phase 1 중간에 설계 결정이 발생. 사전 준비 필수 |
| **John** (PM) | 항목은 줄지 않았다, 재구조화됐다. Shadow Run 기준과 3a/3b 경계를 확정하라 |
| **Sally** (UX) | 확인 인터럽트는 JP1/JP2의 2회를 초과하지 마라 |
| **Paige** (Tech Writer) | 프롬프트 분리가 가장 실용적인 개선. 문서는 포맷 가이드 + Shadow Run 프로토콜만 즉시 필요 |
