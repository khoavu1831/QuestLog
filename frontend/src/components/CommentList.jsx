import { useState } from 'react'
import CommentItem from './CommentItem'

export default function CommentList({ reviews, gameId }) {
  const [sortMode, setSortMode] = useState('helpful')

  const sorted = [...reviews].sort((a, b) => {
    if (sortMode === 'helpful') return b.helpful - a.helpful
    return new Date(b.date) - new Date(a.date)
  })

  return (
    <div style={{ marginTop: '2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <h2
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: '1.3rem',
            color: '#fff',
          }}
        >
          Community Transmissions
        </h2>

        <div style={{ display: 'flex', gap: '4px' }}>
          <SortButton
            active={sortMode === 'helpful'}
            onClick={() => setSortMode('helpful')}
          >
            Most Helpful
          </SortButton>
          <SortButton
            active={sortMode === 'newest'}
            onClick={() => setSortMode('newest')}
          >
            Newest
          </SortButton>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.875rem',
          }}
        >
          No transmissions yet. Be the first to log your experience.
        </div>
      ) : (
        sorted.map(review => (
          <CommentItem key={review.id} review={review} gameId={gameId} />
        ))
      )}
    </div>
  )
}

function SortButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px',
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        borderRadius: '6px',
        border: 'none',
        background: active ? 'rgba(214,123,255,0.15)' : 'transparent',
        color: active ? '#D67BFF' : 'rgba(255,255,255,0.4)',
        borderBottom: active ? '1px solid rgba(214,123,255,0.5)' : '1px solid transparent',
        transition: 'all 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
    >
      {children}
    </button>
  )
}
