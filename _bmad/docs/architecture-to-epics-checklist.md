# Architecture → Epics 변환 체크리스트

Architecture 문서에서 Epics & Stories로 변환할 때 누락되기 쉬운 항목을 점검합니다.
이 체크리스트는 create-epics-and-stories 워크플로우의 Step 1 (Validate Prerequisites)에서 참조합니다.

## 1. FR → Story 매핑 완전성

- [ ] 모든 FR이 최소 1개 Story에 매핑되었는가?
- [ ] FR Coverage Map에 누락된 FR이 없는가?
- [ ] Phase별 FR이 올바른 Epic에 배치되었는가? (Phase 1a FR이 Phase 1b Epic에 있지 않은가?)

## 2. BROWNFIELD 태그 전파

- [ ] PRD의 `[BROWNFIELD]` 태그가 Story에 전파되었는가?
- [ ] Story의 Tags에 `(기존 확장)` vs `(신규)` 구분이 정확한가?
- [ ] brownfield-context.md의 L2/L3 발견 사항이 관련 Story의 Brownfield 필드에 반영되었는가?
- [ ] 기존 확장 Story에 확장 대상 서비스/컴포넌트명이 명시되었는가?

## 3. Architecture 결정 → Story AC 반영

| Architecture 결정 | Story에 반영되어야 할 항목 |
|-------------------|--------------------------|
| DDD 패키지 구조 | Story AC에 패키지 경로 명시 |
| 캐시 전략 (Redis Set) | 캐시 관련 Story에 구체적 Redis 명령어 |
| 레이스 컨디션 방지 (Redis Lock) | API Story AC에 Lock 사양 명시 |
| AOP 감사 로깅 | 감사 로깅 Story에 @BizLog 활용 명시 |
| 피처 플래그 | 각 Phase Story에 Flagsmith 플래그명 |
| 크로스 프레임워크 브릿지 | Vue↔React 전환 Story에 bridge 함수명 |
| DB 테이블 네이밍 | 엔티티 Story에 le_ prefix 준수 명시 |

## 4. NFR → Story 반영

- [ ] 성능 NFR이 관련 Story의 AC에 수치로 반영되었는가? (예: NFR1 → Story 2.6 AC "< 1초")
- [ ] 보안 NFR이 인증/권한 Story의 AC에 반영되었는가?
- [ ] 접근성 NFR이 UI Story의 AC에 반영되었는가? (WCAG, 터치 타겟)
- [ ] 신뢰성 NFR이 교차 검증 Story의 AC에 반영되었는가?

## 5. Story 크기 & 의존성

- [ ] 모든 Story가 단일 개발자 세션에 완료 가능한 크기인가?
- [ ] 3개 이상의 독립적 관심사를 포함하는 Story가 없는가? (Entity + Cache + Logging → 분할 필요)
- [ ] Dependencies/Enables 필드가 모든 Story에 존재하는가?
- [ ] 순환 의존성이 없는가?
- [ ] 전방 의존성(미래 Story에 의존)이 없는가?

## 6. Phase 독립성

- [ ] Phase 1a Epic은 Phase 1b 없이 독립 배포 가능한가?
- [ ] Phase 1b Epic은 Phase 1a 위에서 독립 배포 가능한가?
- [ ] Growth Epic은 Phase 1a+1b 위에서 독립 배포 가능한가?
- [ ] 각 Phase 내 Epic 간 순환 의존이 없는가?

## 사용법

Epic 워크플로우의 Step 1 또는 Step 4 (Final Validation)에서:
```
이 체크리스트를 로드하여 누락 항목을 점검한다:
_bmad/docs/architecture-to-epics-checklist.md
```
