import { useState, useEffect } from 'react'
import RatingPopup from '../components/RatingPopup'
import Toast from '../components/Toast'
import type { UnratedLessonResponse, RatingResponse } from '../api/types'
import { apiGet } from '../api/client'

export default function ReservationPage() {
  const [unratedLesson, setUnratedLesson] = useState<UnratedLessonResponse | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [ratingCompleted, setRatingCompleted] = useState(false)

  useEffect(() => {
    const fetchUnrated = async () => {
      try {
        const data = await apiGet<UnratedLessonResponse>('/lessons/unrated?limit=1')
        if (data.lesson && data.popup_eligible) {
          setUnratedLesson(data)
          setShowPopup(true)
        }
      } catch {
        // No unrated lessons or error
      }
    }
    fetchUnrated()
  }, [])

  const handleToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }

  const handleComplete = (_result: RatingResponse) => {
    setRatingCompleted(true)
  }

  return (
    <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>예약</h1>

      {/* Reservation tab content */}
      <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>다음 수업</h2>
        <div style={{ background: '#FFFFFF', borderRadius: '8px', padding: '16px', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 600 }}>영어 회화</p>
              <p style={{ color: '#6B7280', fontSize: '14px' }}>2026.02.18 (화) 19:00</p>
            </div>
            <span style={{ color: '#4F46E5', fontWeight: 600, fontSize: '14px' }}>예약됨</span>
          </div>
        </div>
      </div>

      <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>지난 레슨</h2>
        <a href="/lesson/12345" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '8px', padding: '16px', border: '1px solid #E5E7EB', marginBottom: '8px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600 }}>영어 회화 - Sarah Johnson</p>
                <p style={{ color: '#6B7280', fontSize: '14px' }}>2026.02.17 (월) 10:00</p>
              </div>
              <span style={{ color: ratingCompleted ? '#10B981' : '#9CA3AF', fontSize: '13px' }}>
                {ratingCompleted ? '평가 완료' : '완료'}
              </span>
            </div>
          </div>
        </a>
        <a href="/lesson/12344" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '8px', padding: '16px', border: '1px solid #E5E7EB', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 600 }}>일본어 회화 - Tanaka Yuki</p>
                <p style={{ color: '#6B7280', fontSize: '14px' }}>2026.02.16 (일) 15:00</p>
              </div>
              <span style={{ color: '#10B981', fontSize: '13px' }}>평가 완료</span>
            </div>
          </div>
        </a>
      </div>

      {/* Rating Popup */}
      {showPopup && unratedLesson && (
        <RatingPopup
          lesson={unratedLesson.lesson}
          onClose={() => setShowPopup(false)}
          onComplete={handleComplete}
          onToast={handleToast}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
