import { useState } from 'react'
import toast from 'react-hot-toast'
import RatingStars from './RatingStars'
import { useApp } from '../context/AppContext'

export default function ReviewForm({ gameId }) {
  const { addReview } = useApp()
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Please select a rating before submitting.')
      return
    }
    if (content.trim().length < 10) {
      toast.error('Your review must be at least 10 characters.')
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      addReview(gameId, { rating, content: content.trim() })
      toast.success('Your transmission has been logged.')
      setRating(0)
      setContent('')
      setSubmitting(false)
    }, 600)
  }

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1rem',
        padding: '1.5rem',
      }}
    >
      <h2
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 700,
          fontSize: '1.3rem',
          color: '#fff',
          marginBottom: '1.25rem',
          borderLeft: '3px solid #D67BFF',
          paddingLeft: '12px',
        }}
      >
        Leave Your Mark
      </h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            Your Rating
          </p>
          <RatingStars value={rating} onChange={setRating} size="lg" />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your transmission..."
            rows={5}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              padding: '12px 14px',
              resize: 'vertical',
              fontFamily: 'Inter, sans-serif',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(214,123,255,0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            background: submitting ? 'rgba(214,123,255,0.15)' : 'rgba(214,123,255,0.85)',
            border: 'none',
            color: submitting ? '#D67BFF' : '#fff',
            fontSize: '0.875rem',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            letterSpacing: '0.06em',
            transition: 'all 0.25s',
            boxShadow: submitting ? 'none' : '0 0 20px rgba(214,123,255,0.3)',
          }}
          onMouseEnter={e => {
            if (!submitting) {
              e.currentTarget.style.background = '#D67BFF'
              e.currentTarget.style.boxShadow = '0 0 28px rgba(214,123,255,0.5)'
            }
          }}
          onMouseLeave={e => {
            if (!submitting) {
              e.currentTarget.style.background = 'rgba(214,123,255,0.85)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(214,123,255,0.3)'
            }
          }}
        >
          {submitting ? 'Transmitting...' : 'Submit Log'}
        </button>
      </form>
    </div>
  )
}
