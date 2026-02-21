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

## Constraint Profile

Constraint Profile (CP) captures implementation-level constraints from the existing codebase. It is separate from L1-L4 layers — L1-L4 describe "what exists," while CP describes "what rules the existing code enforces."

**When generated**: During Pass 2 Stage 3 (3-hop Structural Traversal). Constraints are extracted simultaneously while reading files for L3/L4 data. No additional pass is needed.

**When skipped**: `complexity=simple` projects skip CP extraction entirely (cost > benefit for simple changes).

**Crystallize integration**: Crystallize S2 performs incremental CP — scanning files referenced by the prototype but missing from the existing CP. Crystallize S4 uses CP data as brownfield parameters for translation rules.

### CP YAML Frontmatter Extension

Add to the existing `scan_metadata` section:

```yaml
scan_metadata:
  # ... existing fields ...
  constraint_profile:
    status: collected | skipped | partial
    collected_at: {date}
    file_count: {N}           # number of files scanned for constraints
    concept_coverage: [{list}] # domain concepts covered
    skip_reason: "complexity=simple" | null
```

### CP.1 Entity Constraints

Captures JPA/ORM annotations, column definitions, and foreign key relationships.

```markdown
### CP.1 Entity Constraints

| Entity | File | Field | Annotation | DB Column | Nullable | Type |
|--------|------|-------|------------|-----------|----------|------|
| Ticket | Ticket.java | ticketStartDate | @Column(nullable=false) | TICKET_START_DATE | false | LocalDate |
| Ticket | Ticket.java | subscribeMappId | @JoinColumn(name="SUBSCRIBE_MAPP_ID") | SUBSCRIBE_MAPP_ID | false | Long |
```

**Extraction rules**:
- Parse `@Column`, `@JoinColumn`, `@ManyToOne`, `@OneToMany` annotations
- When `@MappedSuperclass` is found, follow up to 2-hops through parent class chain and extract all inherited fields (covers BaseEntity → AuditableEntity → ConcreteEntity patterns)
- Record actual DB column names (not Java field names)

### CP.2 Naming Conventions

Captures consistent naming patterns across the codebase.

```markdown
### CP.2 Naming Conventions

| Category | Pattern | Example Count | Confidence |
|----------|---------|---------------|------------|
| Table prefix | le_{entity} | 12 | HIGH |
| Controller | {Domain}ControllerV{N} | 8 | HIGH |
| Service | {Domain}ServiceImplV{N} | 6 | HIGH |
| DTO suffix | {Entity}Dto / {Entity}ResponseDto | 10 | HIGH |
| Error code | DUPLICATE_{ENTITY} / NOT_FOUND_{ENTITY} | 5 | MEDIUM |
| Package | com.{org}.{domain}.{layer} | 15 | HIGH |
```

**Confidence levels**:
- HIGH: 3+ consistent examples found
- MEDIUM: 2 consistent examples found
- LOW: 1 example only (recorded but not used in translation)

### CP.3 Transaction Patterns

Captures transaction manager configuration and propagation patterns.

```markdown
### CP.3 Transaction Patterns

| Service | Transaction Manager | Propagation | Isolation | Source File |
|---------|-------------------|-------------|-----------|-------------|
| TicketServiceImpl | legacyTransactionManager | REQUIRED | DEFAULT | TicketServiceImpl.java |
| PaymentGateway | (none — delegates to services) | — | — | PaymentGateway.java |
```

**Extraction rules**:
- Parse `@Transactional(value=..., propagation=..., isolation=...)`
- Record when no `@Transactional` is present (indicates delegation pattern)

### CP.4 Lock Patterns

Captures distributed lock and database lock patterns.

```markdown
### CP.4 Lock Patterns

| Resource | Lock Type | Implementation | Key Pattern | Source File |
|----------|-----------|----------------|-------------|-------------|
| ticket_purchase | Redis distributed lock | RedisLockTemplate | ticket:{ticketId}:purchase | TicketPurchaseService.java |
| payment_process | DB pessimistic lock | @Lock(PESSIMISTIC_WRITE) | — | PaymentRepository.java |
```

### CP.5 API Patterns

Captures API versioning, path naming, response envelope, and pagination patterns.

```markdown
### CP.5 API Patterns

| Pattern | Value | Example Count | Source |
|---------|-------|---------------|--------|
| Versioning | /api/v{N}/ | 24 | Route definitions |
| Response envelope | { data: T, message: string } | 18 | Controller responses |
| Pagination | { content: T[], totalPages, totalElements, pageable } | 8 | List endpoints |
| Error response | { code: string, message: string } | 12 | ExceptionHandler |
| Auth header | Authorization: Bearer {token} | — | SecurityConfig |
```

### CP.6 Enum/State Values

Captures actual enum values stored in the database (not display labels).

```markdown
### CP.6 Enum/State Values

| Enum | Values (DB stored) | Storage Type | Source File |
|------|-------------------|--------------|-------------|
| EventType | UNLIMIT, COUNT, PODO_TRIAL | String (constructor param) | EventType.java |
| LangType | EN, JP, ENJP | String (simpleCode field) | LangType.java |
| TicketStatus | ACTIVE, EXPIRED, HELD | String (name()) | TicketStatus.java |
```

**Extraction rules**:
- For enums with constructor parameters: parse constructor to find DB-stored value
- For simple enums: DB value = `name()` (enum constant name)
- For enums with `@JsonValue` or custom serializer: use the annotated field as DB value
- Record storage type: `String (name())`, `String (constructor param)`, `String (simpleCode field)`, `Integer (ordinal)`

### CP.7 Domain Boundaries

Captures package structure and gateway dependency patterns.

```markdown
### CP.7 Domain Boundaries

| Domain | Package | Gateway Class | Dependencies |
|--------|---------|---------------|-------------|
| ticket | com.podo.ticket | TicketGateway | subscribe, payment |
| subscribe | com.podo.subscribe | SubscribeGateway | — |
| payment | com.podo.payment | PaymentGateway | subscribe |
```

**Extraction rules**:
- Identify Gateway/Facade classes that mediate cross-domain access
- Map package-level dependencies via import analysis
- Record direct dependencies only (not transitive)

### Constraint Profile Confidence Usage

| Confidence | Condition | Translation (S4) Usage | Worker Usage |
|------------|-----------|----------------------|-------------|
| HIGH | 3+ examples | **Apply**: Used as brownfield parameter in translation rules | Must follow |
| MEDIUM | 2 examples | **Reference**: Tagged `[CP-MEDIUM: {pattern}]`, Worker decides | Should follow |
| LOW | 1 example | **Ignore**: Not used in S4. Recorded in constraint-report.md only | Informational |

## Key Principles

1. **Progressive refinement**: L1 (where) → L2 (what) → L3 (how) → L4 (exactly where) + CP (what rules)
2. **No duplication**: Check each layer's search_keywords to exclude keywords already searched in previous layers
3. **Traceability**: source_step tracks which workflow step generated the data
4. **Discovery count**: discovered field quantifies each layer's search effectiveness
5. **Constraint extraction**: CP is extracted during Pass 2 Stage 3 traversal (no separate pass needed)
