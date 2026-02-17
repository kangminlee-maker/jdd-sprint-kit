# MSW Mock Layer Design — Sprint Kit Prototype Stateful API

> Party Mode 합의 (2026-02-17): Option C 채택. Prism 역할 분리 + MSW 도입.
> Party Mode 검증 (2026-02-17): 7개 이슈 발견 → 전부 반영.
> Party Mode 합의 (2026-02-17): Prism 완전 제거. OpenAPI lint + tsc로 대체.
> Party Mode 검증 (2026-02-17): Prism 제거 반영 10건 검토 → 6건 반영, 4건 유지.

## 1. Problem Statement

### 증상
Sprint Kit 프로토타입에서 CRUD 플로우 간 상태가 유지되지 않는다.
- 예: 평가 팝업에서 튜터 차단 (POST) → 차단 관리 페이지 (GET) → 차단 목록에 해당 튜터 없음
- 원인: Prism은 stateless mock server — 매 요청마다 OpenAPI example을 독립 반환

### 영향 범위
- **모든 Sprint**에서 CRUD가 포함된 플로우에 반복 발생
- JP2 판단 품질 저하: "고객이 원하는 경험인가?"를 평가할 때, 프로토타입 결함이 판단 대상을 오염시킴

### 근본 원인
Prism이 두 가지 역할을 동시에 수행하고 있다:

| 역할 | 필요한 성격 | Prism 적합도 |
|------|-----------|-------------|
| API 계약 검증 (Smoke Test) | Stateless, 스펙 준수 판정 | **적합** |
| 프로토타입 mock API (JP2 체험) | Stateful, 플로우 간 상태 유지 | **부적합** |

> 이 두 역할은 현재 MSW(프로토타입) + redocly lint + tsc(spec 검증)로 대체되었다. Section 7 참조.

## 2. Solution: MSW + Static Validation

### 설계 원칙
- **MSW** = 프로토타입 상호작용 (Dev Server: `npm run dev`)
- **OpenAPI lint + tsc** = spec 검증 (`npm run lint:api` + `npx tsc --noEmit`)
- **Prism 완전 제거** — Smoke Test 역할을 lint + tsc가 대체
- React 앱 코드(client.ts, 컴포넌트)는 **수정 불필요** — MSW가 네트워크 레벨에서 인터셉트

### 아키텍처 변경

**Before**:
```
React App → fetch() → Vite Proxy → Prism (stateless) → OpenAPI examples
```

**After**:
```
[Dev Mode]
  React App → fetch() → MSW Service Worker (stateful) → in-memory store

[Spec Validation]
  npx @redocly/cli lint api/openapi.yaml   → OpenAPI 스펙 문법/구조 검증
  npx tsc --noEmit                          → handler ↔ types.ts 스키마 정합성 검증
```

### 핵심 설계 결정

1. **client.ts 무수정**: MSW가 Service Worker 레벨에서 fetch를 인터셉트하므로, 기존 `apiGet`, `apiPost` 등은 그대로 실제 URL로 요청. 프로토타입 코드와 실제 서비스 코드의 거리가 최소화됨.

2. **Vite Proxy 제거**: MSW가 요청을 가로채므로 `/api/v1` → `localhost:4010` 프록시가 불필요.

3. **Handler는 Sprint별 생성**: deliverable-generator가 OpenAPI spec + examples를 기반으로 MSW handler를 자동 생성. 도메인별 상태 로직 포함.

4. **OpenAPI examples → Seed Data**: GET 엔드포인트의 OpenAPI example이 초기 store 데이터로 사용됨.

5. **onComplete 콜백 = 선택적 최적화**: MSW가 상태를 관리하므로, POST 후 GET 재호출만으로도 정확한 결과를 받을 수 있다. onComplete 콜백을 통한 낙관적 업데이트는 UX 최적화로서 **권장하지만 필수는 아니다**. deliverable-generator가 onComplete 패턴을 생성하면 더 빠른 피드백을 제공하지만, 없어도 CRUD 연속성은 보장된다.

## 3. File Changes

### 3.1 preview-template/ 변경 (모든 Sprint에 적용)

```
preview-template/
├── package.json              # [MODIFY] msw 추가, dev script 변경
├── .redocly.yaml             # [NEW] OpenAPI lint 설정 (example 검증 규칙 포함)
├── vite.config.ts            # [MODIFY] Prism proxy 제거
├── src/
│   ├── main.tsx              # [MODIFY] MSW 초기화 + DevPanel 렌더링
│   ├── api/
│   │   └── client.ts         # [NO CHANGE]
│   ├── mocks/
│   │   ├── browser.ts        # [NEW] MSW browser worker 설정
│   │   └── handlers.ts       # [NEW] 빈 placeholder (deliverable-generator가 덮어씀)
│   └── components/
│       └── DevPanel.tsx       # [NEW] Dev 모드 상태 리셋 + 디버깅 패널
└── public/
    └── mockServiceWorker.js  # [NEW] MSW Service Worker (버전 고정, 커밋됨)
```

### 3.2 Sprint별 생성물 (deliverable-generator Stage 10)

```
specs/{feature}/preview/
└── src/
    └── mocks/
        ├── browser.ts        # preview-template에서 복사됨
        ├── handlers.ts       # [OVERWRITE] Sprint별 MSW handler (자동 생성)
        ├── store.ts          # [NEW] Sprint별 in-memory store (자동 생성)
        └── seed.ts           # [NEW] OpenAPI examples에서 추출한 초기 데이터
```

### 3.3 deliverable-generator.md 변경

Stage 10 (React Prototype) 섹션에 MSW handler 생성 로직 추가.

## 4. Detailed Design

### 4.1 preview-template/package.json

```jsonc
{
  "scripts": {
    "dev": "vite",
    "lint:api": "redocly lint api/openapi.yaml",
    "build": "tsc -b && vite build",
    "msw:init": "msw init public/"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0"
  },
  "devDependencies": {
    "@redocly/cli": "^1.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "msw": "2.7.0",
    "openapi-typescript": "^7.0.0",
    "typescript": "~5.7.0",
    "vite": "^6.0.0"
  }
}
```

**변경 사항**:
- `msw` devDependency 추가 (**버전 고정**, caret 없음 — mockServiceWorker.js와 동기화)
- `@redocly/cli` devDependency 추가 (OpenAPI lint 검증)
- `@stoplight/prism-cli` 제거 (Prism 완전 제거)
- `concurrently` 제거 (Prism 동시 기동 불필요)
- `dev` script: `"vite"` (MSW만 사용)
- `lint:api` script: OpenAPI spec 문법/구조 + example 검증 (규칙은 `.redocly.yaml`에서 관리)
- `msw:init` script: Service Worker 파일 재생성 (MSW 버전 업그레이드 시 사용)

### 4.2 preview-template/.redocly.yaml

```yaml
extends:
  - recommended

rules:
  no-unused-components: off        # Sprint별 미사용 schema 허용
  no-invalid-schema-examples: error # example ↔ schema 일치 검증 (Prism Smoke Test 대체 핵심)
```

**핵심**: `no-invalid-schema-examples` 규칙이 OpenAPI spec 내 example 데이터가 해당 schema와 일치하는지 정적으로 검증한다. 이전 Prism Smoke Test가 런타임에 하던 "example이 schema에 맞는가" 검증을 정적 분석으로 대체하는 핵심 규칙이다. 이 설정 파일이 있으므로 `npx redocly lint api/openapi.yaml`만으로 동작하며, CLI 플래그를 기억할 필요가 없다.

### 4.3 preview-template/vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // proxy 설정 제거 — MSW가 fetch를 인터셉트
})
```

### 4.4 preview-template/src/mocks/browser.ts

```typescript
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

### 4.5 preview-template/src/mocks/handlers.ts (placeholder)

```typescript
// Placeholder — deliverable-generator가 Sprint별 handler로 덮어쓴다.
// 빈 배열이면 MSW가 시작되지만 아무 요청도 인터셉트하지 않는다.
export const handlers = []
```

preview-template 단독으로도 `npm run dev`가 실행 가능하다. handler가 비어있으면 fetch가 그대로 네트워크로 전달되어 외부 API 사용이 가능하다.

### 4.6 preview-template/src/components/DevPanel.tsx

```typescript
import { useState } from 'react'

export default function DevPanel() {
  const [open, setOpen] = useState(false)
  const [storeJson, setStoreJson] = useState<string | null>(null)

  const handleReset = async () => {
    await fetch('/api/v1/__reset', { method: 'POST' })
    window.location.reload()
  }

  const handleShowStore = async () => {
    try {
      // store를 직접 import하면 순환 참조 가능 — __store endpoint로 조회
      const res = await fetch('/api/v1/__store')
      if (res.ok) {
        const data = await res.json()
        setStoreJson(JSON.stringify(data, null, 2))
      } else {
        setStoreJson('(__store endpoint not available)')
      }
    } catch {
      setStoreJson('(__store endpoint not available)')
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: '16px', right: '16px', zIndex: 9999 }}>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            padding: '8px 12px', borderRadius: '20px', border: 'none',
            background: '#374151', color: '#F9FAFB', fontSize: '12px',
            cursor: 'pointer', opacity: 0.7,
          }}
        >
          Dev
        </button>
      ) : (
        <div style={{
          background: '#1F2937', color: '#F9FAFB', borderRadius: '12px',
          padding: '16px', minWidth: '200px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontWeight: 600, fontSize: '13px' }}>Dev Tools</span>
            <button type="button" onClick={() => { setOpen(false); setStoreJson(null) }}
              style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>x</button>
          </div>
          <button type="button" onClick={handleReset}
            style={{
              width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #4B5563',
              background: '#374151', color: '#F9FAFB', cursor: 'pointer', fontSize: '13px', marginBottom: '8px',
            }}>
            Reset State
          </button>
          <button type="button" onClick={handleShowStore}
            style={{
              width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #4B5563',
              background: '#374151', color: '#F9FAFB', cursor: 'pointer', fontSize: '13px',
            }}>
            Show Store
          </button>
          {storeJson && (
            <pre style={{
              marginTop: '8px', padding: '8px', background: '#111827', borderRadius: '6px',
              fontSize: '11px', maxHeight: '200px', overflow: 'auto', whiteSpace: 'pre-wrap',
            }}>
              {storeJson}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
```

### 4.7 preview-template/src/main.tsx

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

async function boot() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
        {import.meta.env.DEV && <DevPanel />}
      </BrowserRouter>
    </StrictMode>,
  )
}

// Lazy import DevPanel to avoid production bundle inclusion
let DevPanel: React.ComponentType = () => null
if (import.meta.env.DEV) {
  import('./components/DevPanel').then(m => { DevPanel = m.default })
}

boot()
```

**핵심**:
- DEV 모드에서만 MSW를 동적 import + start. 프로덕션 빌드에 MSW 코드가 포함되지 않음.
- `onUnhandledRequest: 'bypass'`로 handler가 없는 요청은 네트워크로 통과 (이미지, 폰트 등).
- DevPanel은 DEV 모드에서만 렌더링. JP2 리뷰어가 "Reset State"로 store를 초기화하고 플로우를 반복 테스트 가능.

### 4.8 Sprint별 생성물: store.ts (예시 — test-tutor-excl)

```typescript
// In-memory store — Sprint별 도메인 상태
import { seedData } from './seed'
import type { BlockedTutor, BlockCount } from '../api/types'

interface Store {
  blocks: BlockedTutor[]
  count: { EN: BlockCount; JP: BlockCount }
  ratings: Map<number, { star_rating: number; created_at: string }>
  nextBlockId: number
  nextRatingId: number
}

export const store: Store = {
  blocks: [...seedData.blocks],
  count: { ...seedData.count },
  ratings: new Map(),
  nextBlockId: seedData.nextBlockId,
  nextRatingId: seedData.nextRatingId,
}

export function resetStore() {
  store.blocks = [...seedData.blocks]
  store.count = { ...seedData.count }
  store.ratings = new Map()
  store.nextBlockId = seedData.nextBlockId
  store.nextRatingId = seedData.nextRatingId
}
```

### 4.9 Sprint별 생성물: seed.ts (예시 — test-tutor-excl)

```typescript
// OpenAPI examples에서 추출한 초기 데이터
export const seedData = {
  blocks: [
    {
      id: 501,
      tutor_id: 201,
      tutor_name: 'James Miller',
      tutor_photo: 'https://cdn.edutalk.com/tutors/james.jpg',
      language_type: 'EN' as const,
      blocked_at: '2026-02-10T14:00:00+09:00',
      last_lesson_at: '2026-02-10T10:00:00+09:00',
      tutor_is_active: true,
    },
    {
      id: 502,
      tutor_id: 202,
      tutor_name: 'Emily Davis',
      tutor_photo: 'https://cdn.edutalk.com/tutors/emily.jpg',
      language_type: 'EN' as const,
      blocked_at: '2026-02-05T09:00:00+09:00',
      last_lesson_at: '2026-01-28T10:00:00+09:00',
      tutor_is_active: false,
    },
    // ... (OpenAPI GET /tutor-blocks example에서 추출)
  ],
  count: { EN: { current: 3, max: 5 }, JP: { current: 0, max: 5 } },
  nextBlockId: 510,
  nextRatingId: 1010,
  unratedLesson: {
    lesson: {
      id: 12345,
      tutor_name: 'Sarah Johnson',
      tutor_photo: 'https://cdn.edutalk.com/tutors/sarah.jpg',
      language_type: 'EN' as const,
      scheduled_at: '2026-02-17T10:00:00+09:00',
    },
    popup_eligible: true,
  },
}
```

### 4.10 Sprint별 생성물: handlers.ts (예시 — test-tutor-excl)

```typescript
import { http, HttpResponse } from 'msw'
import { store, resetStore } from './store'
import type { RatingResponse, BlockResponse, BlockListResponse, UnblockResponse } from '../api/types'

const BASE = '/api/v1'

export const handlers = [
  // GET /lessons/unrated
  http.get(`${BASE}/lessons/unrated`, () => {
    if (store.ratings.has(12345)) {
      return new HttpResponse(null, { status: 204 })
    }
    return HttpResponse.json({
      lesson: { id: 12345, tutor_name: 'Sarah Johnson', tutor_photo: 'https://cdn.edutalk.com/tutors/sarah.jpg', language_type: 'EN', scheduled_at: '2026-02-17T10:00:00+09:00' },
      popup_eligible: true,
    })
  }),

  // POST /lessons/:lessonId/ratings
  http.post(`${BASE}/lessons/:lessonId/ratings`, async ({ params, request }) => {
    const lessonId = Number(params.lessonId)
    const body = await request.json() as { star_rating: number; block_tutor?: boolean; negative_reasons?: string[]; positive_reasons?: string[] }

    if (store.ratings.has(lessonId)) {
      return HttpResponse.json({ error: 'ALREADY_RATED', message: 'This lesson already has a rating' }, { status: 409 })
    }

    const ratingId = store.nextRatingId++
    store.ratings.set(lessonId, { star_rating: body.star_rating, created_at: new Date().toISOString() })

    let block_created = false
    let block_id: number | undefined

    if (body.block_tutor) {
      const lang = 'EN' // simplified — derive from lesson in real handler
      if (store.count[lang].current >= store.count[lang].max) {
        return HttpResponse.json({
          error: 'BLOCK_LIMIT_EXCEEDED',
          message: 'Maximum block limit reached for this language',
          details: { current: store.count[lang].current, max: store.count[lang].max, management_url: '/my/tutor-management' },
        }, { status: 422 })
      }
      block_id = store.nextBlockId++
      store.blocks.push({
        id: block_id, tutor_id: 201, tutor_name: 'Sarah Johnson', tutor_photo: 'https://cdn.edutalk.com/tutors/sarah.jpg',
        language_type: lang, blocked_at: new Date().toISOString(),
        last_lesson_at: '2026-02-17T10:00:00+09:00', tutor_is_active: true,
      })
      store.count[lang].current++
      block_created = true
    }

    // 타입 명시적 응답 구성 — tsc가 스키마 불일치를 잡을 수 있도록
    const response: RatingResponse = {
      id: ratingId, lesson_id: lessonId, star_rating: body.star_rating,
      block_created, block_id, created_at: new Date().toISOString(),
    }
    return HttpResponse.json(response, { status: 201 })
  }),

  // GET /tutor-blocks
  http.get(`${BASE}/tutor-blocks`, ({ request }) => {
    const url = new URL(request.url)
    const langFilter = url.searchParams.get('language_type')
    const filtered = langFilter ? store.blocks.filter(b => b.language_type === langFilter) : store.blocks
    const response: BlockListResponse = { blocks: filtered, count: store.count }
    return HttpResponse.json(response)
  }),

  // POST /tutor-blocks
  http.post(`${BASE}/tutor-blocks`, async ({ request }) => {
    const body = await request.json() as { tutor_id: number; language_type: 'EN' | 'JP'; block_source: string; lesson_id?: number }
    const existing = store.blocks.find(b => b.tutor_id === body.tutor_id && b.language_type === body.language_type)
    if (existing) {
      return HttpResponse.json({ error: 'ALREADY_BLOCKED', message: 'This tutor is already blocked' }, { status: 409 })
    }
    if (store.count[body.language_type].current >= store.count[body.language_type].max) {
      return HttpResponse.json({
        error: 'BLOCK_LIMIT_EXCEEDED', message: 'Maximum block limit reached for this language',
        details: { current: store.count[body.language_type].current, max: store.count[body.language_type].max, management_url: '/my/tutor-management' },
      }, { status: 422 })
    }
    const id = store.nextBlockId++
    const newBlock = {
      id, tutor_id: body.tutor_id, tutor_name: `Tutor ${body.tutor_id}`, tutor_photo: '',
      language_type: body.language_type, blocked_at: new Date().toISOString(),
      last_lesson_at: new Date().toISOString(), tutor_is_active: true,
    }
    store.blocks.push(newBlock)
    store.count[body.language_type].current++
    const response: BlockResponse = { id, tutor_id: body.tutor_id, language_type: body.language_type, blocked_at: newBlock.blocked_at }
    return HttpResponse.json(response, { status: 201 })
  }),

  // DELETE /tutor-blocks/:blockId
  http.delete(`${BASE}/tutor-blocks/:blockId`, ({ params }) => {
    const blockId = Number(params.blockId)
    const idx = store.blocks.findIndex(b => b.id === blockId)
    if (idx === -1) {
      return HttpResponse.json({ error: 'BLOCK_NOT_FOUND', message: 'Block record not found or already released' }, { status: 404 })
    }
    const [removed] = store.blocks.splice(idx, 1)
    store.count[removed.language_type].current--
    const response: UnblockResponse = { id: blockId, released_at: new Date().toISOString() }
    return HttpResponse.json(response)
  }),

  // Dev utility: Reset store
  http.post(`${BASE}/__reset`, () => {
    resetStore()
    return HttpResponse.json({ ok: true })
  }),

  // Dev utility: Dump store (DevPanel용)
  http.get(`${BASE}/__store`, () => {
    return HttpResponse.json({
      blocks: store.blocks,
      count: store.count,
      ratings: Object.fromEntries(store.ratings),
      nextBlockId: store.nextBlockId,
      nextRatingId: store.nextRatingId,
    })
  }),
]
```

**handler 타입 안전성**: 모든 응답 데이터를 `const response: RatingResponse = { ... }` 형태로 타입을 명시적으로 지정한다. `tsc --noEmit`이 api/types.ts와 handler 응답 간 스키마 불일치를 컴파일 타임에 잡을 수 있다.

## 5. deliverable-generator 변경 사항

### Stage 10 수정 내용

#### 5.1 복사 단계 변경
```
기존: preview-template/ → preview/
추가: preview-template/.redocly.yaml → preview/.redocly.yaml
추가: preview-template/src/mocks/browser.ts → preview/src/mocks/browser.ts
추가: preview-template/src/mocks/handlers.ts → preview/src/mocks/handlers.ts (placeholder, 이후 덮어씀)
추가: preview-template/src/components/DevPanel.tsx → preview/src/components/DevPanel.tsx
추가: preview-template/public/mockServiceWorker.js → preview/public/mockServiceWorker.js
```

#### 5.2 Handler 생성 단계 (NEW)

Stage 10에서 React 컴포넌트 생성 **직후**, 다음 3파일을 자동 생성 (preview-template의 placeholder handlers.ts를 덮어씀):

1. **seed.ts**: api-spec.yaml의 각 GET 엔드포인트 example에서 초기 데이터 추출
2. **store.ts**: seed.ts를 import하여 in-memory store 구성. 각 리소스별 배열 + counter.
3. **handlers.ts**: api-spec.yaml의 각 path + method 조합에 대해 MSW handler 생성:

| OpenAPI method | MSW handler 패턴 |
|---------------|-----------------|
| GET (list) | store에서 필터링하여 반환 |
| GET (detail) | store에서 ID로 조회, 404 처리 |
| POST (create) | store에 추가, 409/422 에러 처리 |
| PUT/PATCH | store에서 업데이트 |
| DELETE | store에서 제거, 404 처리 |

**handler 생성 규칙**:
- 응답 스키마는 api-spec.yaml의 `components/schemas`를 따른다
- **응답 데이터를 타입 명시적으로 구성**: `const response: SchemaType = { ... }` 형태로 타입 어노테이션 사용. tsc가 스키마 불일치를 잡을 수 있도록 한다.
- 에러 응답은 api-spec.yaml의 4xx/5xx response examples를 그대로 사용
- `resetStore()` + `POST /__reset` + `GET /__store` 엔드포인트를 항상 포함
- BASE path는 client.ts의 `BASE_URL + VERSION`과 동일하게 설정

#### 5.3 Smoke Test 변경 → Spec Validation

Prism 기반 Smoke Test를 제거하고, 다음 2단계로 대체:

```bash
# Step 1: OpenAPI spec 문법/구조 + example 검증 (.redocly.yaml 규칙 적용)
npx @redocly/cli lint api/openapi.yaml

# Step 2: handler ↔ types.ts 스키마 정합성 검증
npx tsc --noEmit
```

**근거**: Prism Smoke Test는 "OpenAPI spec이 유효한가" + "example이 schema와 일치하는가"를 검증했다. 이 두 가지를:
- **redocly lint**: spec 구조 + `no-invalid-schema-examples` 규칙으로 example ↔ schema 일치 정적 검증
- **tsc**: handler 응답이 types.ts와 일치하는지 컴파일 타임 검증 (Prism이 커버하지 못하는 영역)

두 도구의 조합이 Prism보다 넓은 범위를 더 정확하게 커버한다.

#### 5.4 Self-Validation 변경 사항

기존 항목 7 ("Prototype 인터랙션")을 다음 3개 항목으로 교체:

**항목 7a — MSW handler 엔드포인트 커버리지**:
MSW handler가 api-spec.yaml의 모든 path × method 조합을 커버하는지 확인. handlers.ts에 누락된 endpoint가 있으면 Output Summary에 WARN.

**항목 7b — BASE 경로 정합성**:
handlers.ts의 `BASE` 상수가 client.ts의 `BASE_URL + VERSION`과 동일한지 확인. 불일치 시 MSW가 요청을 인터셉트하지 못하는 사일런트 실패가 발생하므로, 불일치 발견 시 **자동 수정** (handlers.ts의 BASE를 client.ts 기준으로 갱신) + Output Summary에 FIX 기록.

**항목 7c — handler 응답 타입 안전성**:
handlers.ts 내 모든 `HttpResponse.json()` 호출에서 응답 데이터가 api/types.ts의 타입으로 명시적 어노테이션되어 있는지 확인. `tsc --noEmit`이 스키마 불일치를 잡을 수 있도록 보장.

### 5.5 "Prism Stateless 프로토타입 패턴" 섹션 교체

기존 deliverable-generator.md의 "Prism Stateless 프로토타입 패턴" 섹션 전체를 다음으로 교체:

```markdown
**MSW Stateful 프로토타입 패턴**:

프로토타입은 MSW(Mock Service Worker)를 사용하여 API 상태를 유지한다.
Spec 검증은 OpenAPI lint(`@redocly/cli`) + `tsc --noEmit`이 담당한다.

1. **초기 데이터**: `mocks/seed.ts`에 OpenAPI examples에서 추출한 seed 데이터 정의
2. **상태 관리**: `mocks/store.ts`에 in-memory store. CRUD 연산이 store를 변경
3. **요청 인터셉트**: `mocks/handlers.ts`에 MSW handler. api-spec.yaml의 모든 endpoint를 커버
4. **플로우 간 연속성**: POST로 생성한 데이터가 GET에서 조회됨 (store 공유)
5. **리셋**: DevPanel의 "Reset State" 버튼 또는 `POST /__reset` 호출로 store를 seed 상태로 초기화
6. **디버깅**: DevPanel의 "Show Store" 버튼 또는 `GET /__store`로 현재 store 상태 확인

**API 책임 원칙**:
- React 컴포넌트는 실제 서비스와 동일한 코드로 API를 호출한다 (client.ts 무수정)
- MSW가 네트워크 레벨에서 인터셉트하므로, 컴포넌트는 mock의 존재를 알지 못한다
- 페이지 간 상태는 store를 통해 자동 공유된다 (전역 React state 불필요)
- onComplete 콜백을 통한 낙관적 업데이트는 **권장하지만 필수 아님** — MSW가 상태를 관리하므로 GET 재호출만으로도 정확한 결과를 받을 수 있다

**Handler 생성 규칙** (deliverable-generator가 따라야 할 규칙):
- api-spec.yaml의 모든 path × method 조합에 대해 handler를 생성한다
- 응답 구조는 api-spec.yaml components/schemas를 정확히 따른다
- **응답 데이터를 타입 명시적으로 구성한다**: `const response: SchemaType = { ... }` — tsc가 스키마 불일치를 잡을 수 있도록
- 에러 응답(4xx)은 api-spec.yaml의 에러 example을 사용한다
- GET list: 쿼리 파라미터 필터링을 지원한다 (OpenAPI parameters 참조)
- POST create: store에 추가 + ID 자동 채번 + 관련 count 업데이트
- DELETE: store에서 제거 + 관련 count 감소
- 교차 엔드포인트 상태: 하나의 엔드포인트 동작이 다른 엔드포인트 조회 결과에 영향을 미치는 경우 (예: 평가+차단 POST → 차단 목록 GET), handler 내에서 store를 직접 조작하여 연동한다
- `POST /__reset` + `GET /__store` + `resetStore()` 함수를 항상 포함한다
```

## 6. Migration: 기존 프로토타입 영향

### preview-template 변경이 기존 Sprint에 미치는 영향

preview-template은 Sprint 시작 시 복사되므로, 이미 생성된 Sprint의 `specs/{feature}/preview/`에는 영향 없음.

### 기존 deliverable-generator 호환

- `mode: "deliverables-only"`로 재실행하면 새 MSW 패턴이 적용됨
- `mode: "specs-only"`에는 영향 없음 (Stage 1-2만 실행)

## 7. Prism 완전 제거

### 제거 결정 (Party Mode 합의 2026-02-17)

Prism의 유일한 잔여 역할이었던 Smoke Test를 OpenAPI lint + tsc로 대체하고, Prism을 preview-template에서 완전히 제거한다.

**제거 근거**:
- Prism Smoke Test = "OpenAPI spec 유효성" + "example ↔ schema 일치" 검증
- `@redocly/cli lint` = OpenAPI spec 문법/구조 검증 (Prism보다 정확)
- `tsc --noEmit` = handler 응답 ↔ types.ts 스키마 정합성 검증 (Prism이 커버하지 못하는 영역)
- **두 도구의 조합이 Prism보다 넓은 범위를 더 정확하게 검증**

**Specmatic과의 관계**:
Specmatic은 `/parallel` 단계에서 실제 구현체의 API 계약 준수를 검증한다. Specmatic은 Prism과 완전히 독립적이므로 Prism 제거에 영향 없음.

| 용도 | 도구 |
|------|------|
| `npm run dev` (프로토타입) | **MSW** |
| `npm run lint:api` (Spec Validation) | **@redocly/cli** |
| `npx tsc --noEmit` (Type Validation) | **TypeScript** |
| API 계약 준수 (/parallel) | **Specmatic** (변경 없음) |

**제거 대상**:
- `@stoplight/prism-cli` devDependency
- `test:api` script (Prism mock 기동)
- `concurrently` devDependency
- vite.config.ts의 proxy 설정
- deliverable-generator의 Prism Smoke Test 절차

## 8. 구현 순서

| 단계 | 작업 | 영향 파일 |
|------|------|----------|
| 1a | preview-template/ MSW 인프라 설치 + Prism 제거 | package.json, .redocly.yaml, vite.config.ts, main.tsx, mocks/browser.ts, mocks/handlers.ts (placeholder), components/DevPanel.tsx |
| 1b | mockServiceWorker.js 생성: `cd preview-template && npm i && npx msw init public/ --save` | public/mockServiceWorker.js (커밋 대상) |
| 2 | deliverable-generator.md Stage 10 수정 (MSW 패턴 + Prism 제거) | .claude/agents/deliverable-generator.md |
| 3 | test-tutor-excl preview에 MSW 적용 (검증) | specs/test-tutor-excl/preview/ |

## 9. 성공 기준

1. `npm run dev`로 프로토타입 실행 시 MSW만으로 동작 (Prism 의존성 없음)
2. Flow 1 (평가 + 차단) → Flow 3 (차단 관리)에서 차단한 튜터가 목록에 보임
3. Flow 3에서 차단 해제 → 목록에서 사라짐
4. `npm run lint:api`로 OpenAPI spec 검증 통과
5. `npx tsc --noEmit` 통과 (handler ↔ types.ts 스키마 정합성)
6. 다른 Sprint에서 `/preview` 실행 시 동일 패턴으로 MSW handler 생성 확인 (후속 검증)

## Appendix: 검증 이력

### Party Mode 검증 (2026-02-17)

| # | 심각도 | 이슈 | 반영 내용 |
|---|--------|------|----------|
| 1 | Low | mockServiceWorker.js 생성 타이밍 | MSW 버전 고정 (caret 없음) + preview-template에 커밋 (Section 4.1) |
| 2 | Medium | BASE 경로 불일치 사일런트 실패 | Self-Validation 항목 7b 추가 — 자동 수정 + FIX 기록 (Section 5.4) |
| 3 | Medium | 리셋 UI 누락 | DevPanel.tsx 추가 — Reset State + Show Store (Section 4.5) |
| 4 | Low | 성공 기준에 generic 검증 없음 | 성공 기준 6번 추가 (Section 9) |
| 5 | Medium | MSW handler 응답 구조 검증 미비 | 타입 명시적 응답 구성 + Self-Validation 항목 7c 추가 (Section 4.9, 5.4) |
| 6 | Low | onComplete 패턴 폐기 여부 불명확 | "필수(MSW CRUD) vs 선택(onComplete UX 최적화)" 명확화 (Section 2, 5.5) |
| 7 | High | preview-template에 handlers.ts 없으면 빌드 실패 | 빈 handlers.ts placeholder 포함 (Section 4.4) |

### Prism 제거 결정 (Party Mode 합의 2026-02-17)

**참여자**: Winston (Architect), John (PM), Murat (Test Architect), Amelia (Dev), Mary (Analyst), Bob (SM), Sally (UX)

**질문**: MSW 도입 후 Prism이 여전히 필요한가?

**만장일치 결론**: Prism 완전 제거

| 관점 | 판단 |
|------|------|
| Winston (Architect) | Prism의 잔여 역할(Smoke Test)은 redocly lint + tsc로 완전 대체 가능. 의존성 하나 줄이면 인프라가 단순해짐 |
| John (PM) | JP2 리뷰어 관점에서 Prism은 보이지도 않고 사용하지도 않음. 제거해도 프로덕트 판단에 영향 없음 |
| Murat (Test Architect) | redocly lint = OpenAPI 스펙 구조 검증 (Prism보다 정밀), tsc = handler 타입 검증 (Prism이 못 하는 영역). 두 도구 조합 > Prism |
| Amelia (Dev) | Prism 없으면 npm install 빨라지고, 포트 충돌 사라지고, concurrently 제거 가능 |
| Sally (UX) | 프로토타입 실행이 `npm run dev` 한 줄로 단순화 |
| Bob (SM) | Worker 온보딩 시 Prism 설명이 빠져서 진입 장벽 낮아짐 |
| Mary (Analyst) | Specmatic은 Prism과 독립적. /parallel 검증에 영향 없음 확인 |

**대체 매핑**:
| Prism 역할 | 대체 도구 |
|-----------|----------|
| OpenAPI spec 유효성 검증 | `@redocly/cli lint` |
| Example ↔ Schema 일치 | `tsc --noEmit` (handler 타입 어노테이션) |
| Dev 서버 mock API | MSW (이미 대체 완료) |
| Specmatic stub | Specmatic 자체 stub (Prism과 무관) |

### Prism 제거 반영 검증 (Party Mode 2026-02-17)

| # | 심각도 | 발견자 | 이슈 | 반영 |
|---|--------|--------|------|------|
| I-1 | Low | Winston | Section 1 근본 원인 표에 Prism "적합" 잔존 | 표 아래 대체 안내 추가 |
| I-2 | Medium | Winston | Section 2 제목 "Role Separation" — 분리 대상 없음 | `MSW + Static Validation`으로 변경 |
| I-3 | Low | Winston | Section 3.1 "Prism proxy 제거" 주석 | 변경 내역이므로 유지 |
| I-4 | Low | Winston | Section 4.3 vite.config.ts 주석 | 설계 문서 맥락에서 유지 |
| I-5 | Low | Winston | Section 4.5 "기존 Prism 연동" 표현 잔존 | "외부 API 사용이 가능하다"로 단순화 |
| I-6 | Medium | Murat | redocly lint의 example 검증 규칙 활성화 불명확 | `.redocly.yaml` 추가 + `no-invalid-schema-examples: error` |
| I-7 | Low | Murat | seed.ts 타입 검증은 store.ts 경유 간접 검증 | store.ts 타입 지정으로 간접 검증 작동 — 유지 |
| I-8 | Medium | Amelia | `.redocly.yaml` 설정 파일 누락 | Section 4.2에 추가 + 파일 목록/복사 단계 반영 |
| I-9 | Low | Amelia | mockServiceWorker.js 최초 생성 절차 미기재 | 구현 단계 1b에 `msw init` 절차 추가 |
| I-10 | Low | Sally | Section 5.5 제목 "교체" 표현 | 변경 지시이므로 유지 |
