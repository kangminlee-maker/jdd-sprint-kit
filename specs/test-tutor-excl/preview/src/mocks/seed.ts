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
    {
      id: 503,
      tutor_id: 203,
      tutor_name: 'Michael Chen',
      tutor_photo: 'https://cdn.edutalk.com/tutors/michael.jpg',
      language_type: 'EN' as const,
      blocked_at: '2026-01-20T11:00:00+09:00',
      last_lesson_at: '2026-01-20T10:00:00+09:00',
      tutor_is_active: true,
    },
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
