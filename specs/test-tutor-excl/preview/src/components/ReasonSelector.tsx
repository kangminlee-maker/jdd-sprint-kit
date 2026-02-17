import type { PositiveReason, NegativeReason } from '../api/types'
import { POSITIVE_REASON_LABELS, NEGATIVE_REASON_LABELS } from '../api/types'

interface ReasonSelectorProps {
  type: 'positive' | 'negative'
  selected: string[]
  onChange: (reasons: string[]) => void
}

export default function ReasonSelector({ type, selected, onChange }: ReasonSelectorProps) {
  const labels = type === 'positive'
    ? (POSITIVE_REASON_LABELS as Record<string, string>)
    : (NEGATIVE_REASON_LABELS as Record<string, string>)

  const title = type === 'positive' ? '좋았던 점을 선택해주세요' : '아쉬운 점을 선택해주세요'

  const toggle = (reason: string) => {
    if (selected.includes(reason)) {
      onChange(selected.filter((r) => r !== reason))
    } else {
      onChange([...selected, reason])
    }
  }

  return (
    <div>
      <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', textAlign: 'center' }}>
        {title}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
        {(Object.keys(labels) as (PositiveReason | NegativeReason)[]).map((reason) => (
          <button
            key={reason}
            type="button"
            onClick={() => toggle(reason)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: selected.includes(reason) ? '2px solid #4F46E5' : '2px solid #E5E7EB',
              background: selected.includes(reason) ? '#EEF2FF' : '#FFFFFF',
              color: selected.includes(reason) ? '#4F46E5' : '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.15s',
            }}
          >
            {labels[reason]}
          </button>
        ))}
      </div>
    </div>
  )
}
