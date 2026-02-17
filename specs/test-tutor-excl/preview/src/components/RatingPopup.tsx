import { useState } from 'react'
import StarRating from './StarRating'
import ReasonSelector from './ReasonSelector'
import ConfirmDialog from './ConfirmDialog'
import type { LessonSummary, SubmitRatingRequest, RatingResponse } from '../api/types'
import { apiPost } from '../api/client'

type PopupStep = 'star' | 'reasons' | 'done'

interface RatingPopupProps {
  lesson: LessonSummary
  onClose: () => void
  onComplete: (result: RatingResponse) => void
  onToast: (message: string, type: 'success' | 'error') => void
}

export default function RatingPopup({ lesson, onClose, onComplete, onToast }: RatingPopupProps) {
  const [step, setStep] = useState<PopupStep>('star')
  const [starRating, setStarRating] = useState(0)
  const [reasons, setReasons] = useState<string[]>([])
  const [blockTutor, setBlockTutor] = useState(false)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const isNegative = starRating >= 1 && starRating <= 2

  const handleStarSelect = (rating: number) => {
    setStarRating(rating)
    setReasons([])
    setBlockTutor(false)
  }

  const handleNext = async () => {
    if (starRating === 0) return
    // Save star only (FR5-1)
    try {
      await apiPost<RatingResponse>(`/lessons/${lesson.id}/ratings`, {
        star_rating: starRating,
      })
    } catch {
      // Ignore — star saved attempt
    }
    setStep('reasons')
  }

  const handleSubmit = async () => {
    if (blockTutor) {
      setShowBlockConfirm(true)
      return
    }
    await doSubmit(false)
  }

  const doSubmit = async (withBlock: boolean) => {
    setSubmitting(true)
    try {
      const body: SubmitRatingRequest = {
        star_rating: starRating,
        ...(isNegative
          ? { negative_reasons: reasons as SubmitRatingRequest['negative_reasons'] }
          : { positive_reasons: reasons as SubmitRatingRequest['positive_reasons'] }),
        ...(withBlock ? { block_tutor: true } : {}),
      }
      const result = await apiPost<RatingResponse>(`/lessons/${lesson.id}/ratings`, body)
      if (result.block_created) {
        onToast('차단 완료! 앞으로 이 튜터와 매칭되지 않습니다.', 'success')
      } else {
        onToast('평가가 저장되었습니다.', 'success')
      }
      onComplete(result)
      onClose()
    } catch (err) {
      const error = err as Error & { status?: number; body?: { error?: string; details?: { management_url?: string } } }
      if (error.status === 422 && error.body?.error === 'BLOCK_LIMIT_EXCEEDED') {
        onToast('차단 한도(5명)에 도달했습니다. 차단 관리에서 해제 후 다시 시도하세요.', 'error')
        // Rating was saved, but block was not
        onClose()
      } else if (error.status === 409) {
        onToast('이미 평가된 수업입니다.', 'error')
        onClose()
      } else {
        onToast('저장 실패. 다시 시도해주세요.', 'error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleBlockConfirm = async () => {
    setShowBlockConfirm(false)
    await doSubmit(true)
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 900,
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '32px 24px',
            maxWidth: '420px',
            width: '90%',
            position: 'relative',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* X close button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'none',
              border: 'none',
              fontSize: '20px',
              color: '#9CA3AF',
              cursor: 'pointer',
            }}
          >
            x
          </button>

          {step === 'star' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '16px', color: '#6B7280', marginBottom: '4px' }}>
                {lesson.tutor_name} 튜터와의 수업
              </p>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
                오늘 수업은 어떠셨나요?
              </h2>
              <StarRating value={starRating} onChange={handleStarSelect} />
              <div style={{ marginTop: '24px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={starRating === 0}
                  style={{
                    padding: '10px 32px',
                    borderRadius: '8px',
                    border: 'none',
                    background: starRating > 0 ? '#4F46E5' : '#D1D5DB',
                    color: '#FFFFFF',
                    cursor: starRating > 0 ? 'pointer' : 'not-allowed',
                    fontSize: '15px',
                    fontWeight: 600,
                  }}
                >
                  다음
                </button>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  marginTop: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textDecoration: 'underline',
                }}
              >
                건너뛰기
              </button>
            </div>
          )}

          {step === 'reasons' && (
            <div>
              <ReasonSelector
                type={isNegative ? 'negative' : 'positive'}
                selected={reasons}
                onChange={setReasons}
              />

              {isNegative && (
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={blockTutor}
                      onChange={(e) => setBlockTutor(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#EF4444' }}
                    />
                    <span style={{ fontSize: '14px', color: '#374151' }}>
                      이 튜터를 다시 만나지 않을래요
                    </span>
                  </label>
                </div>
              )}

              <div style={{ marginTop: '24px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    padding: '10px 32px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#4F46E5',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 600,
                    opacity: submitting ? 0.6 : 1,
                  }}
                >
                  {submitting ? '저장 중...' : '제출'}
                </button>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  display: 'block',
                  margin: '12px auto 0',
                  background: 'none',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textDecoration: 'underline',
                }}
              >
                건너뛰기
              </button>
            </div>
          )}
        </div>
      </div>

      {showBlockConfirm && (
        <ConfirmDialog
          title="이 튜터를 차단하시겠습니까?"
          message="차단하면 앞으로 이 튜터와 매칭되지 않습니다. 차단 관리 페이지에서 해제할 수 있습니다."
          confirmLabel="차단"
          cancelLabel="취소"
          onConfirm={handleBlockConfirm}
          onCancel={() => {
            setShowBlockConfirm(false)
            doSubmit(false)
          }}
        />
      )}
    </>
  )
}
