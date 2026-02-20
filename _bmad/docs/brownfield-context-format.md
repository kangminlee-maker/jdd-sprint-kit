# Brownfield Context 파일 포맷 가이드

## YAML Frontmatter 구조

```yaml
---
feature: {feature_name}
scan_metadata:
  topology: co-located | monorepo | msa | standalone
  merge_priority: local | external   # local for co-located/monorepo, external for msa/standalone
  local_stages_executed: [1, 2, 3, 4]  # which local stages ran (empty for standalone)
  external_sources:
    attempted: ["backend-docs", "client-docs"]
    succeeded: ["backend-docs"]
layers:
  - name: L1
    source_step: create-product-brief/step-01-init
    created_at: 2026-01-15
    search_keywords:
      - keyword1
      - keyword2
    sources:
      - type: external
        name: svc-map
      - type: figma
        name: abc123def456  # fileKey from external_resources
    discovered:
      domain_concepts: 5
      user_flows: 3
      screen_ids: ['screen-123', 'screen-456']
    notes: "Optional notes about search limitations"

  - name: L2
    sub_phase: complete  # 'preliminary' | 'complete'
    source_step: prd/step-02-discovery (L2a) + prd/step-08-scoping (L2b)
    created_at: 2026-01-16
    search_keywords:
      # L2a (preliminary) - Input Documents 키워드
      - api_keyword1
      # L2b (refinement) - Scoping/FR 키워드
      - fr_keyword1
    sources:
      - type: mcp
        name: backend-docs
      - type: mcp
        name: client-docs
    discovered:
      existing_apis: 8
      existing_components: 3
      domain_rules: 4
    notes: "L2a: step-02, L2b: step-08"

  - name: L3
    source_step: create-architecture/step-02-context
    created_at: 2026-01-17
    search_keywords:
      - ServiceName
      - ComponentName
    sources:
      - type: mcp
        name: backend-docs
      - type: mcp
        name: client-docs
    discovered:
      service_integrations: 6
      code_patterns: 5
      data_adjacencies: 3

  - name: L4
    source_step: specs-generation
    created_at: 2026-01-18
    search_keywords:
      - exact/file/path.java
      - FunctionName
    sources:
      - type: mcp
        name: backend-docs
      - type: mcp
        name: client-docs
    discovered:
      file_paths: 12
      function_signatures: 8
---
```

## 레이어별 본문 구조

### L1: Domain Concept Layer
```markdown
## L1: Domain Concept Layer

### Customer Journey Position
- Flow: {flow_name}
- Screen IDs: {screen_id_list}

### Domain Concepts Found
| Concept | Source | Reference |
|---------|--------|-----------|
| 튜터 | svc-map | screen-123 |

### Existing User Flows
{flow descriptions}
```

### L2: Behavior Layer
```markdown
## L2: Behavior Layer

### Existing APIs
| API | Method | Relevance | Source |
|-----|--------|-----------|--------|
| /api/v2/schedule | POST | 매칭 대상 | backend-docs |

### Existing UI Components
| Component | Path | Relevance | Source |
|-----------|------|-----------|--------|
| LessonCard | features/lesson/ | 평가 진입점 | client-docs |

### Domain Rules Discovered
{business rules}
```

### L3: Component Layer
```markdown
## L3: Component Layer

### Service Integration Points
| Service | Existing? | Integration | Source |
|---------|-----------|-------------|--------|
| PodoScheduleServiceImplV2 | Yes | DI inject ExclusionFilter | backend-docs |

### Existing Code Patterns to Follow
| Pattern | Example Location | Source |
|---------|-----------------|--------|
| DslRepository | TutorDslRepository.java | backend-docs |

### Data Model Adjacencies
{adjacent tables and relationships}
```

### L4: Code Layer
```markdown
## L4: Code Layer

### File Paths
| File | Modification Type | Owner Task |
|------|-------------------|------------|
| src/main/.../PodoScheduleServiceImplV2.java | Extend | task-2.6 |

### Function Signatures
| Function | File | Change Required |
|----------|------|-----------------|
| matchTutor() | PodoScheduleServiceImplV2.java | Add exclusion filter param |
```

## data_sources 구조

`data_sources`는 동적으로 구성된다. 하드코딩된 서버명이 아니라 실제 감지/설정된 소스를 기록한다.

```yaml
data_sources:
  document-project: ok | not-configured | parse-error
  local-codebase: ok | not-configured | scan-error
  # External sources — dynamically listed from sprint-input.md external_resources
  # (source names come from external_resources.external_repos or MCP servers)
  # For tarball-snapshot sources, include provenance from sprint-input.md:
  #   snapshot_commit, snapshot_branch, snapshot_at
  {source_name_1}:
    status: ok | timeout | error | empty-result | scan-error
    snapshot_commit: "a1b2c3d"  # (tarball-snapshot only) commit SHA at download time
    snapshot_branch: "main"     # (tarball-snapshot only) branch or "HEAD"
    snapshot_at: "2026-02-20T14:30:00Z"  # (tarball-snapshot only) commit timestamp
  {source_name_2}:
    status: ok | timeout | error | empty-result | scan-error
  figma: ok | timeout | error | not-configured  # only when external_resources.figma exists
```

When writing `data_sources` for tarball-snapshot repos, read `snapshot_commit`, `snapshot_branch`, and `snapshot_at` from `sprint-input.md` `external_resources.external_repos[]` and include them. For `add-dir` repos, omit snapshot fields (not applicable).

## Source Types

`sources` 배열의 각 항목은 `type`과 `name`으로 구성된다:

| type | 설명 | name 예시 |
|------|------|----------|
| `external` | 외부 데이터 소스에서 수집한 데이터 (--add-dir repos, MCP servers) | 동적 — sprint-input.md `external_resources`에서 소스명 사용 |
| `document-project` | BMad document-project 워크플로우 산출물 | `project-overview.md`, `api-contracts.md`, `data-models.md` |
| `local-codebase` | 로컬 코드베이스 직접 스캔 결과 | `src/`, `lib/`, `app/` |
| `figma` | Figma 디자인 데이터 (external_resources 경유) | `figma` |

- 하나의 레이어에 여러 타입의 소스가 혼합될 수 있다
- 동일 정보가 여러 소스에서 발견되면 양쪽 모두 기록하고 우선순위를 명시한다

## Entity Index

Pass 2 완료 후 brownfield-context.md 본문 말미에 생성한다. Pass 1 완료 시에는 섹션 헤더 + 빈 테이블만 예약한다.

```markdown
## Entity Index

| Entity | L1 | L2 | L3 | L4 | Primary Source |
|--------|----|----|----|----|----------------|
| User   | domain concept | GET /api/users | UserService | src/services/user.ts | local-codebase |
| Lesson | flow: lesson-booking | POST /api/lessons | LessonController | src/controllers/lesson.ts | mcp:backend-docs |
| Tutor  | domain concept | - | - | - | document-project |
```

규칙:
- 각 셀에는 해당 레이어에서 발견된 핵심 정보 1줄, 미발견 시 `-`
- Primary Source: 해당 엔티티의 가장 상세한 정보를 제공한 소스
- Pass 2 완료 후 자동 생성 (brownfield-scanner Rules 참조)

## 키 원칙

1. **점진적 구체화**: L1(어디) → L2(무엇을) → L3(어떻게) → L4(정확히 어디에)
2. **중복 방지**: 각 레이어의 search_keywords를 확인하여 이전 레이어에서 이미 검색한 키워드 제외
3. **추적 가능성**: source_step으로 어느 워크플로우 단계에서 생성되었는지 추적
4. **발견 수량 기록**: discovered 필드로 각 레이어의 검색 효과를 정량화
