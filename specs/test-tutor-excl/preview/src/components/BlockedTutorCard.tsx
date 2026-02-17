import type { BlockedTutor } from '../api/types'

interface BlockedTutorCardProps {
  tutor: BlockedTutor
  onUnblock: (blockId: number) => void
}

export default function BlockedTutorCard({ tutor, onUnblock }: BlockedTutorCardProps) {
  const formatDate = (iso: string) => {
    const date = new Date(iso)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
      }}
    >
      <img
        src={tutor.tutor_photo}
        alt={tutor.tutor_name}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          objectFit: 'cover',
          background: '#F3F4F6',
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="%23E5E7EB"/><text x="24" y="28" text-anchor="middle" font-size="18" fill="%239CA3AF">?</text></svg>'
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>{tutor.tutor_name}</span>
          {!tutor.tutor_is_active && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '4px',
                background: '#FEF3C7',
                color: '#92400E',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              비활성
            </span>
          )}
        </div>
        <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
          차단일: {formatDate(tutor.blocked_at)} | 마지막 수업: {formatDate(tutor.last_lesson_at)}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onUnblock(tutor.id)}
        style={{
          padding: '6px 16px',
          borderRadius: '6px',
          border: '1px solid #D1D5DB',
          background: '#FFFFFF',
          color: '#374151',
          cursor: 'pointer',
          fontSize: '13px',
          whiteSpace: 'nowrap',
        }}
      >
        해제
      </button>
    </div>
  )
}
