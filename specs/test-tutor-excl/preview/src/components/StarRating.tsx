import { useState } from 'react'

interface StarRatingProps {
  value: number
  onChange: (rating: number) => void
}

export default function StarRating({ value, onChange }: StarRatingProps) {
  const [hover, setHover] = useState(0)

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '40px',
            color: star <= (hover || value) ? '#FFD700' : '#D4D4D4',
            transition: 'color 0.15s',
            padding: '4px',
          }}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
