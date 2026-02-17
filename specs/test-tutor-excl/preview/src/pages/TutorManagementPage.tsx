import { useState, useEffect } from 'react'
import BlockedTutorCard from '../components/BlockedTutorCard'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import type { BlockListResponse, BlockedTutor, UnblockResponse, LanguageType } from '../api/types'
import { apiGet, apiDelete } from '../api/client'

export default function TutorManagementPage() {
  const [blocks, setBlocks] = useState<BlockedTutor[]>([])
  const [count, setCount] = useState<BlockListResponse['count']>({ EN: { current: 0, max: 5 }, JP: { current: 0, max: 5 } })
  const [selectedLang, setSelectedLang] = useState<LanguageType>('EN')
  const [unblockTarget, setUnblockTarget] = useState<number | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const data = await apiGet<BlockListResponse>('/tutor-blocks')
        setBlocks(data.blocks)
        setCount(data.count)
      } catch {
        setToast({ message: '차단 목록을 불러올 수 없습니다.', type: 'error' })
      } finally {
        setLoading(false)
      }
    }
    fetchBlocks()
  }, [])

  const filteredBlocks = blocks.filter((b) => b.language_type === selectedLang)
  const currentCount = count[selectedLang]

  const handleUnblock = async () => {
    if (unblockTarget === null) return
    const blockId = unblockTarget
    setUnblockTarget(null)

    try {
      await apiDelete<UnblockResponse>(`/tutor-blocks/${blockId}`)
      // Optimistic: remove from local state
      setBlocks((prev) => prev.filter((b) => b.id !== blockId))
      setCount((prev) => ({
        ...prev,
        [selectedLang]: { ...prev[selectedLang], current: prev[selectedLang].current - 1 },
      }))
      setToast({ message: '차단 해제 완료. 이 튜터와 다시 매칭될 수 있습니다.', type: 'success' })
    } catch {
      setToast({ message: '차단 해제 실패. 다시 시도해주세요.', type: 'error' })
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto', textAlign: 'center', marginTop: '40px' }}>
        <p style={{ color: '#6B7280' }}>로딩 중...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>튜터 관리</h1>
      <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>
        차단한 튜터와는 매칭되지 않습니다.
      </p>

      {/* Language tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '20px', borderBottom: '2px solid #E5E7EB' }}>
        {(['EN', 'JP'] as LanguageType[]).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setSelectedLang(lang)}
            style={{
              padding: '8px 24px',
              background: 'none',
              border: 'none',
              borderBottom: selectedLang === lang ? '2px solid #4F46E5' : '2px solid transparent',
              color: selectedLang === lang ? '#4F46E5' : '#6B7280',
              fontWeight: selectedLang === lang ? 600 : 400,
              cursor: 'pointer',
              fontSize: '15px',
              marginBottom: '-2px',
            }}
          >
            {lang === 'EN' ? '영어' : '일본어'} ({count[lang].current}/{count[lang].max})
          </button>
        ))}
      </div>

      {/* Block count indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '12px 16px',
        background: currentCount.current >= currentCount.max ? '#FEF2F2' : '#F9FAFB',
        borderRadius: '8px',
      }}>
        <span style={{ fontSize: '14px', color: '#374151' }}>차단 현황</span>
        <span style={{
          fontSize: '16px',
          fontWeight: 700,
          color: currentCount.current >= currentCount.max ? '#EF4444' : '#4F46E5',
        }}>
          {currentCount.current} / {currentCount.max}
        </span>
      </div>

      {/* Blocked tutor list */}
      {filteredBlocks.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 16px',
          color: '#9CA3AF',
        }}>
          <p style={{ fontSize: '48px', marginBottom: '8px' }}>-</p>
          <p>차단한 튜터가 없습니다.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredBlocks.map((tutor) => (
            <BlockedTutorCard
              key={tutor.id}
              tutor={tutor}
              onUnblock={(id) => setUnblockTarget(id)}
            />
          ))}
        </div>
      )}

      {/* Unblock confirmation */}
      {unblockTarget !== null && (
        <ConfirmDialog
          title="차단을 해제하시겠습니까?"
          message="해제하면 이 튜터와 다시 매칭될 수 있습니다."
          confirmLabel="해제"
          cancelLabel="취소"
          onConfirm={handleUnblock}
          onCancel={() => setUnblockTarget(null)}
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
