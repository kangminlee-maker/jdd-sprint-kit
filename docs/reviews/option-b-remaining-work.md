# Delta-Driven Design: 남은 작업

> **날짜**: 2026-02-21
> **상태**: Phase 0-3 + Adversarial Layer 완료. Backlog + Phase 3-3 (실제 Sprint 측정) 남음.
> **완료된 커밋**:
> - `da1118a` Phase 0: 문서화 (delta-driven-design.md, 용어, JDD, blueprint)
> - `3d419ae` Phase 1: LLD 기반 (PRD 포맷, Scope Gate, deliverable-generator, auto-sprint, crystallize, protocol)
> - `ce43767` Option B 남은 작업 추적
> - `64d7899` Phase 2: Crystallize 필수화 + Delta Manifest + JP2 메뉴 구조 변경
> - `a73e198` Phase 3: 델타 타입 검증 (judge-business §7 + crystallize S5b 검증)
> - `14e7d0f` Adversarial Layer: Devil's Advocate 에이전트 + BDD + MSW + 파이프라인 통합
> **관련 문서**: [`delta-driven-design.md`](../delta-driven-design.md), [`lld-gap-analysis-and-implementation-plan.md`](lld-gap-analysis-and-implementation-plan.md)

---

## 완료됨

### Phase 0: 문서화 ✅

| 작업 | 파일 | 상태 |
|---|---|---|
| delta-driven-design.md 핵심 문서 작성 | `docs/delta-driven-design.md` | 완료 |
| 14개 델타 용어 terminology-map 등록 | `docs/terminology-map.md` | 완료 |
| JDD 참조 섹션 추가 | `docs/judgment-driven-development.md` | 완료 |
| Blueprint 참조 링크 + Crystallize 설명 추가 | `docs/blueprint.md` | 완료 |

### Phase 1: LLD 기반 ✅

| 작업 | 파일 | 상태 |
|---|---|---|
| FR-NFR 모순 검사 | `scope-gate.md` | 완료 |
| 동시성 + 관측성 NFR 카테고리 | `prd-format-guide.md` | 완료 |
| 복합 FR 보충 구조 | `prd-format-guide.md` | 완료 |
| 체크리스트 추가 (5개 항목) | `prd-format-guide.md` | 완료 |
| Carry-forward 분류 (defined/deferred/new) | `jdd-sprint-protocol.md` + `crystallize.md` | 완료 |
| design.md LLD 7개 조건부 섹션 | `deliverable-generator.md` | 완료 |
| Stage 7 입력 소스 수정 (Architecture → design.md) | `deliverable-generator.md` | 완료 |
| Architecture 상태 다이어그램 프롬프트 | `auto-sprint.md` | 완료 |
| Scope Gate spec LLD 매핑 검사 (5개 항목) | `scope-gate.md` | 완료 |
| PRD 단계의 State Transition/Algorithmic FR 구조 검사 | `scope-gate.md` | 완료 |
| complexity 값 수정 + 명시적 획득 경로 | `prd-format-guide.md` + `deliverable-generator.md` + `scope-gate.md` | 완료 |

### Phase 2: 델타 통합 + Crystallize 필수화 ✅

| 작업 | 파일 | 상태 |
|---|---|---|
| Crystallize 필수화 (Purpose + When to Use 재작성) | `crystallize.md` | 완료 |
| S0 스킵 조건 확장 (0 Comments → 스킵) | `crystallize.md` | 완료 |
| S5b Delta Manifest (7개 필드 스키마, 4값 origin) | `crystallize.md` | 완료 |
| Crystallize FAIL 복구 ([R]/[S]/[X]) | `crystallize.md` | 완료 |
| S6 Delta Summary 테이블 | `crystallize.md` | 완료 |
| 예산 + 진행 카운터 업데이트 (/7→/8) | `crystallize.md` | 완료 |
| JP2 메뉴: [A]→[E] Elicitation + [A] Approve & Build | `auto-sprint.md` | 완료 |
| JP2 Section 1.5: 사용자에게 달라지는 점 | `auto-sprint.md` | 완료 |
| [A] Approve & Build 시 Crystallize 자동 실행 | `auto-sprint.md` | 완료 |
| design.md 내 Carry-forward 레지스트리 | `deliverable-generator.md` | 완료 |
| Worker Brownfield 동적 경로 + Greenfield 스킵 | `worker.md` | 완료 |
| validate.md Judge {specs_root} 파라미터화 | `validate.md` | 완료 |
| JP2 응답 + Crystallize Flow 필수화 | `jdd-sprint-protocol.md` | 완료 |
| 3가지 경로: Crystallize (자동) | `jdd-sprint-guide.md` | 완료 |
| preview.md: [A] Approve & Build + Crystallize 자동 | `preview.md` | 완료 |
| Blueprint: Mermaid + Crystallize 섹션 + JP2 테이블 + 경로 + 용어집 | `blueprint.md` | 완료 |
| README: Mermaid + 파이프라인 + 설명 | `README.md` | 완료 |
| delta-driven-design.md §11 업데이트 | `delta-driven-design.md` | 완료 |

### Phase 3: 검증 ✅

| 작업 | 파일 | 상태 |
|---|---|---|
| S5b 델타 완전성 자체 검증 | `crystallize.md` | 완료 |
| §7 Delta Verification (델타 타입 검사) | `judge-business.md` | 완료 |
| §7 Carry-forward 검증 (defined/deferred/new) | `judge-business.md` | 완료 |
| Input References {feature_dir}/ 파라미터화 | `judge-business.md` | 완료 |

### Adversarial Layer ✅

| 작업 | 파일 | 상태 |
|---|---|---|
| Devil's Advocate 에이전트 (7 Lenses + 중복 제거 + 조건부) | `devils-advocate.md` (신규) | 완료 |
| Stage 6 adversarial-transitions.feature | `deliverable-generator.md` | 완료 |
| MSW 상태 전환 검증 | `deliverable-generator.md` | 완료 |
| readiness.md endpoint_count | `deliverable-generator.md` | 완료 |
| Step 5-D 파이프라인 통합 | `auto-sprint.md` | 완료 |
| JP2 Section 3 adversarial 결과 | `auto-sprint.md` | 완료 |
| §8 Adversarial Scenario Verification | `judge-business.md` | 완료 |
| Specs File Pattern 업데이트 | `jdd-sprint-protocol.md` | 완료 |
| Crystallize S4 adversarial 복사 | `crystallize.md` | 완료 |

---

## 남은 작업

### Phase 3-3: Carry-Forward 비율 측정 (실제 Sprint 필요)

| # | 작업 | 내용 | 전제 조건 |
|---|---|---|---|
| 3-3 | Carry-forward 비율 측정 | 실제 Sprint에서 delta-manifest.md origin 필드를 통해 `translate(Prototype)` 대 `carry-forward` 비율 측정 | Crystallize를 포함한 실제 Sprint 실행 |

**결정 게이트**: 측정 결과가 Option C (Crystallize T1-T6 전면 재설계) 타당성을 결정합니다.

### Backlog (보류, 트리거 기반)

| 항목 | 트리거 조건 | 범위 |
|---|---|---|
| FR-NFR 모순 Redirect 개선 | Scope Gate에서 모순으로 인한 반복적 FAIL | auto-sprint.md Redirect 로직 |
| S3/S4 Carry-forward 태그 보존 | Crystallize 중 carry-forward 태그 유실 | crystallize.md S3, S4 프롬프트 |
| Worker 통합 테스트 프로토콜 | 병렬 실행 시 Worker 병합 충돌 | parallel.md Step 6 |
| Interface Contract 프로토콜 | Worker 간 타입 불일치 | parallel.md Step 1 |
| GDPR/개인정보 체크리스트 | PII 처리 기능 발생 시 | scope-gate.md 조건부 검사 |
| Crystallize carry-forward 검증 | Crystallize 후 carry-forward 항목 누락 | crystallize.md S5 강화 |
| Scope Gate 산출물 커버리지 확장 | BDD/DBML/프로토타입이 산출물 단계에서 미검증 | scope-gate.md |
| 프로토타입 Lv3 → Lv3.5 (로딩 상태) | 로딩 상태 부재로 인한 번역 정확도 문제 | deliverable-generator.md Stage 10 |
| Translation table 확장 (15 → 25 규칙) | 실제 Sprint에서 미매핑 UX 패턴 발생 | delta-driven-design.md Section 3 |
| 프로토타입 Annotations | 프로토타입으로 표현 불가한 항목(성능 체감, 실시간)이 문제 유발 | 새 파일 포맷 |
| 외부 팀용 핸드오프 문서 | reconciled/ 확인 후 외부 팀 요청 | crystallize.md 또는 새 /handoff 커맨드 |
| Delta Manifest의 regression_bdd 필드 | Phase 3에서 설계된 BDD 태깅 시스템 (@zero-delta) | crystallize.md S5b 스키마 확장 |

---

## 결정 게이트: Option C

Phase 3-3 (실제 Sprint에서의 carry-forward 비율 측정) 완료 후:

| 결과 | 조치 |
|---|---|
| carry-forward < 30% | 프로토타입이 진정한 source of truth입니다. Option C 정당화 — `feature/option-c-crystallize-redesign` 브랜치에서 Crystallize T1-T6 전면 재설계 |
| carry-forward 30-50% | 혼합 상태입니다. 현재 파이프라인에 점진적 개선으로 충분합니다 |
| carry-forward > 50% | 프로토타입은 여러 입력 중 하나이며 유일한 source of truth가 아닙니다. 프레이밍 조정 필요 |

**Option C 브랜치**: `feature/option-c-crystallize-redesign` (ce43767의 main에서 생성, Phase 2 이전)

---

## 다음 단계

```
모든 구현 Phase 완료 (Phase 0-3 + Adversarial Layer).

다음:   실제 Sprint를 실행하여 변경 사항을 전체적으로 검증
이후:   Phase 3-3 — delta-manifest.md에서 carry-forward 비율 측정
게이트: carry-forward 비율 → Option C (Crystallize T1-T6 전면 재설계) 결정
```
