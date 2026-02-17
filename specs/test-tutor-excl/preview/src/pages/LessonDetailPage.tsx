import { useState } from 'react'
import { useParams } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import type { BlockResponse } from '../api/types'
import { apiPost } from '../api/client'

export default function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const [blocked, setBlocked] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Mock lesson data (Prism would provide this in a real scenario)
  const lesson = {
    id: Number(lessonId) || 12345,
    tutor_name: 'Sarah Johnson',
    tutor_photo: 'https://cdn.edutalk.com/tutors/sarah.jpg',
    language_type: 'EN' as const,
    scheduled_at: '2026-02-17T10:00:00+09:00',
    status: 'FINISH',
    duration: 25,
  }

  const handleBlock = async () => {
    setShowConfirm(false)
    try {
      await apiPost<BlockResponse>('/tutor-blocks', {
        tutor_id: 201, // Mock tutor ID
        language_type: lesson.language_type,
        block_source: 'LESSON_DETAIL',
        lesson_id: lesson.id,
      })
      setBlocked(true)
      setToast({ message: '차단 완료! 앞으로 이 튜터와 매칭되지 않습니다.', type: 'success' })
    } catch (err) {
      const error = err as Error & { status?: number; body?: { error?: string } }
      if (error.status === 422) {
        setToast({ message: '차단 한도(5명)에 도달했습니다. 차단 관리에서 해제 후 다시 시도하세요.', type: 'error' })
      } else if (error.status === 409) {
        setBlocked(true)
        setToast({ message: '이미 차단된 튜터입니다.', type: 'error' })
      } else {
        setToast({ message: '차단 실패. 다시 시도해주세요.', type: 'error' })
      }
    }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto' }}>
      <a href="/reservation" style={{ color: '#6B7280', textDecoration: 'none', fontSize: '14px' }}>
        &larr; 예약 탭으로 돌아가기
      </a>

      <div style={{ marginTop: '16px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {/* Tutor info header */}
        <div style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid #F3F4F6' }}>
          <img
            src={lesson.tutor_photo}
            alt={lesson.tutor_name}
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', background: '#F3F4F6' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><circle cx="40" cy="40" r="40" fill="%23E5E7EB"/><text x="40" y="46" text-anchor="middle" font-size="28" fill="%239CA3AF">?</text></svg>'
            }}
          />
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '12px' }}>{lesson.tutor_name}</h2>
          <span style={{ color: '#6B7280', fontSize: '14px' }}>
            {lesson.language_type === 'EN' ? '영어' : '일본어'} 회화
          </span>
        </div>

        {/* Lesson details */}
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#6B7280', fontSize: '14px' }}>수업 일시</span>
            <span style={{ fontSize: '14px' }}>{formatDate(lesson.scheduled_at)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#6B7280', fontSize: '14px' }}>수업 시간</span>
            <span style={{ fontSize: '14px' }}>{lesson.duration}분</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#6B7280', fontSize: '14px' }}>상태</span>
            <span style={{ color: '#10B981', fontSize: '14px', fontWeight: 600 }}>완료</span>
          </div>
        </div>

        {/* Block button */}
        <div style={{ padding: '0 20px 20px' }}>
          <button
            type="button"
            onClick={() => !blocked && setShowConfirm(true)}
            disabled={blocked}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: blocked ? '1px solid #E5E7EB' : '1px solid #EF4444',
              background: blocked ? '#F9FAFB' : '#FFFFFF',
              color: blocked ? '#9CA3AF' : '#EF4444',
              cursor: blocked ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            {blocked ? '차단됨' : '이 튜터 차단하기'}
          </button>
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="이 튜터를 차단하시겠습니까?"
          message="차단하면 앞으로 이 튜터와 매칭되지 않습니다. 차단 관리 페이지에서 해제할 수 있습니다."
          confirmLabel="차단"
          cancelLabel="취소"
          onConfirm={handleBlock}
          onCancel={() => setShowConfirm(false)}
        />
      )}

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
