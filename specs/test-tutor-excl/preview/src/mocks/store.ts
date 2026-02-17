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

function deepCopyCount() {
  return {
    EN: { ...seedData.count.EN },
    JP: { ...seedData.count.JP },
  }
}

export const store: Store = {
  blocks: [...seedData.blocks],
  count: deepCopyCount(),
  ratings: new Map(),
  nextBlockId: seedData.nextBlockId,
  nextRatingId: seedData.nextRatingId,
}

export function resetStore() {
  store.blocks = [...seedData.blocks]
  store.count = deepCopyCount()
  store.ratings = new Map()
  store.nextBlockId = seedData.nextBlockId
  store.nextRatingId = seedData.nextRatingId
}
