import { useState } from 'react'

export default function RatingStars({ value = 0, onChange = null, size = 'md' }) {
  const [hovered, setHovered] = useState(0)

  const sizeMap = {
    sm: '16px',
    md: '24px',
    lg: '32px',
  }

  const starSize = sizeMap[size] || '24px'

  const displayValue = hovered || value

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= displayValue
        return (
          <span
            key={star}
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => onChange && setHovered(star)}
            onMouseLeave={() => onChange && setHovered(0)}
            style={{
              fontSize: starSize,
              color: filled ? '#D67BFF' : 'rgba(255,255,255,0.15)',
              cursor: onChange ? 'pointer' : 'default',
              transition: 'color 0.15s, transform 0.15s',
              display: 'inline-block',
              transform: onChange && hovered === star ? 'scale(1.2)' : 'scale(1)',
              lineHeight: 1,
            }}
          >
            ★
          </span>
        )
      })}
    </div>
  )
}
