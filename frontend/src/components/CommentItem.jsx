import { useState } from 'react'
import { useApp } from '../context/AppContext'
import RatingStars from './RatingStars'

export default function CommentItem({ review, gameId }) {
  const { markHelpful } = useApp()
  const [marked, setMarked] = useState(false)

  function handleHelpful() {
    if (!marked) {
      markHelpful(gameId, review.id)
      setMarked(true)
    }
  }

  const initials = review.username.slice(0, 2).toUpperCase()

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(214,123,255,0.3), rgba(0,229,255,0.2))',
              border: '1px solid rgba(214,123,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: '#D67BFF',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <p
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 600,
                fontSize: '0.9rem',
                color: '#fff',
                marginBottom: '2px',
              }}
            >
              {review.username}
            </p>
            <p
              style={{
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.35)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {review.level}
            </p>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(214,123,255,0.1)',
            border: '1px solid rgba(214,123,255,0.2)',
            borderRadius: '6px',
            padding: '3px 10px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: '0.85rem',
            color: '#D67BFF',
          }}
        >
          {review.rating}.0
        </div>
      </div>

      <RatingStars value={review.rating} size="sm" />

      <p
        style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: '0.875rem',
          lineHeight: 1.7,
          margin: '12px 0',
        }}
      >
        {review.content}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p
          style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.75rem',
          }}
        >
          {marked ? review.helpful + 1 : review.helpful} people found this useful
        </p>

        <button
          onClick={handleHelpful}
          disabled={marked}
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: marked ? 'rgba(214,123,255,0.5)' : 'rgba(255,255,255,0.5)',
            background: 'none',
            border: 'none',
            cursor: marked ? 'default' : 'pointer',
            transition: 'color 0.2s',
            padding: 0,
          }}
          onMouseEnter={e => { if (!marked) e.target.style.color = '#D67BFF' }}
          onMouseLeave={e => { if (!marked) e.target.style.color = 'rgba(255,255,255,0.5)' }}
        >
          {marked ? 'Marked Helpful' : 'Mark Helpful'}
        </button>
      </div>
    </div>
  )
}
