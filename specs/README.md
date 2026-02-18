# Specs

Sprint 산출물이 feature 단위로 저장됩니다.

## 시작하기

1. Feature 폴더 생성: `mkdir -p specs/{feature-name}/inputs/`
2. 자료 배치: Brief, 회의록, 참고자료 등을 `inputs/`에 넣으세요
3. Sprint 실행: `/sprint {feature-name}`

Brief가 없어도 참고자료만으로 시작할 수 있습니다.
AI가 참고자료에서 Brief를 자동 생성합니다.

## 폴더 구조

```
specs/
└── {feature-name}/
    ├── inputs/                   # 사용자 입력 (Brief, 회의록, 참고자료)
    │   ├── brief.md              # Brief (자동 생성 가능)
    │   ├── sprint-input.md       # Phase 0 자동 생성 SSOT
    │   └── *.md / *.pdf / ...    # 참고 자료
    ├── planning-artifacts/       # BMad 산출물 (자동 생성)
    │   ├── product-brief.md
    │   ├── prd.md
    │   ├── architecture.md
    │   ├── epics-and-stories.md
    │   └── brownfield-context.md
    ├── brownfield-context.md     # Frozen snapshot (Workers 참조용)
    ├── requirements.md           # Specs: 요구사항
    ├── design.md                 # Specs: 설계
    ├── tasks.md                  # Specs: 태스크
    ├── entity-dictionary.md      # Specs: 엔티티 사전
    └── preview/                  # React + MSW 프로토타입
```

## 경로별 사용법

| 경로 | 시작점 | 커맨드 |
|------|--------|--------|
| **Sprint** | Brief 또는 참고자료 | `/sprint {feature-name}` |
| **Guided** | BMad 12단계 대화 | `/create-product-brief` → ... → `/specs` |
| **Direct** | 완성된 PRD+Arch+Epics | `/specs {feature-name}` |
