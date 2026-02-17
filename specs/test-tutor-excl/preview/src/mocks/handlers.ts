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
