// API Types for test-tutor-excl
// Derived from OpenAPI spec (api-spec.yaml)

export type LanguageType = 'EN' | 'JP'

export type PositiveReason =
  | 'CLEAR_EXPLANATION'
  | 'GOOD_PRONUNCIATION'
  | 'FRIENDLY_ATMOSPHERE'
  | 'HELPFUL_CORRECTION'
  | 'GOOD_PACE'

export type NegativeReason =
  | 'ONE_SIDED_TALK'
  | 'POOR_PRONUNCIATION'
  | 'NO_CORRECTION'
  | 'UNCOMFORTABLE'
  | 'SLOW_PACE'
  | 'FAST_PACE'

export type BlockSource = 'RATING_POPUP' | 'LESSON_DETAIL' | 'MANAGEMENT_PAGE'

export interface LessonSummary {
  id: number
  tutor_name: string
  tutor_photo: string
  language_type: LanguageType
  scheduled_at: string
}

export interface UnratedLessonResponse {
  lesson: LessonSummary
  popup_eligible: boolean
}

export interface SubmitRatingRequest {
  star_rating: number
  positive_reasons?: PositiveReason[]
  negative_reasons?: NegativeReason[]
  block_tutor?: boolean
}

export interface RatingResponse {
  id: number
  lesson_id: number
  star_rating: number
  block_created?: boolean
  block_id?: number
  created_at: string
}

export interface BlockTutorRequest {
  tutor_id: number
  language_type: LanguageType
  block_source: BlockSource
  lesson_id?: number
}

export interface BlockResponse {
  id: number
  tutor_id: number
  language_type: LanguageType
  blocked_at: string
}

export interface BlockedTutor {
  id: number
  tutor_id: number
  tutor_name: string
  tutor_photo: string
  language_type: LanguageType
  blocked_at: string
  last_lesson_at: string
  tutor_is_active: boolean
}

export interface BlockCount {
  current: number
  max: number
}

export interface BlockListResponse {
  blocks: BlockedTutor[]
  count: {
    EN: BlockCount
    JP: BlockCount
  }
}

export interface UnblockResponse {
  id: number
  released_at: string
}

export interface ErrorResponse {
  error: string
  message: string
  details?: {
    current?: number
    max?: number
    management_url?: string
  }
}

// Display labels
export const POSITIVE_REASON_LABELS: Record<PositiveReason, string> = {
  CLEAR_EXPLANATION: '설명이 명확했어요',
  GOOD_PRONUNCIATION: '발음 교정이 도움됐어요',
  FRIENDLY_ATMOSPHERE: '분위기가 편안했어요',
  HELPFUL_CORRECTION: '틀린 표현을 잘 고쳐줬어요',
  GOOD_PACE: '수업 속도가 적당했어요',
}

export const NEGATIVE_REASON_LABELS: Record<NegativeReason, string> = {
  ONE_SIDED_TALK: '튜터가 일방적으로 대화를 이끌었어요',
  POOR_PRONUNCIATION: '발음이 부정확했어요',
  NO_CORRECTION: '틀린 표현을 교정해주지 않았어요',
  UNCOMFORTABLE: '수업 분위기가 불편했어요',
  SLOW_PACE: '수업 진행이 너무 느렸어요',
  FAST_PACE: '수업 진행이 너무 빨랐어요',
}
