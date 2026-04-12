import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function CommentItem({ review, gameId }) {
  const { markHelpful } = useApp()
  const [marked, setMarked] = useState(false)
  const [aiPredicting, setAiPredicting] = useState(false)
  const [aiResult, setAiResult] = useState(review.aiLabel || null)

  function handleHelpful() {
    if (!marked) {
      markHelpful(gameId, review.id)
      setMarked(true)
    }
  }

  // Simulate asking AI if it's helpful
  function handleAskAI() {
    if (aiResult) return
    setAiPredicting(true)
    // Simulate API call to AI Service
    setTimeout(() => {
      setAiResult(Math.random() > 0.3 ? 'HELPFUL' : 'NOT HELPFUL')
      setAiPredicting(false)
    }, 1500)
  }

  const reviewDate = new Date(review.date || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div style={{ marginBottom: '25px' }}>
      
      {/* Profile Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <svg fill="#fff" viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <span style={{ fontSize: '13px' }}>{review.username}</span>
      </div>

      {/* Rating & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
        <span style={{ color: '#ffa41c', fontSize: '16px' }}>
          {review.rating >= 4.5 ? '★★★★★' : review.rating >= 3.5 ? '★★★★☆' : review.rating >= 2.5 ? '★★★☆☆' : review.rating >= 1.5 ? '★★☆☆☆' : '★☆☆☆☆'}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Solid choice for the price</span>
      </div>

      {/* Date & Location */}
      <div style={{ fontSize: '13px', color: '#565959', marginBottom: '5px' }}>
        Reviewed in the United States on {reviewDate}
      </div>

      {/* Verified Purchase */}
      <div style={{ fontSize: '11px', color: '#c45500', fontWeight: 'bold', marginBottom: '10px' }}>
        Verified Purchase
      </div>

      {/* Review Content */}
      <p style={{ fontSize: '14px', lineHeight: '20px', marginBottom: '15px' }}>
        {review.content}
      </p>

      {/* AI & Helpful Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
        
        {/* Amazon Helpful Button */}
        <button 
          onClick={handleHelpful}
          disabled={marked}
          className="a-button-base"
          style={{ padding: '6px 20px', fontSize: '13px', cursor: marked ? 'default' : 'pointer', opacity: marked ? 0.7 : 1 }}
        >
          {marked ? '✓ Helpful' : 'Helpful'}
        </button>

        {/* Fake Amazon divider */}
        <span style={{ color: '#ddd' }}>|</span>

        <span style={{ fontSize: '13px', color: '#565959' }}>
          {marked ? review.helpful + 1 : review.helpful} people found this helpful
        </span>

      </div>

      {/* AI Prediction UI */}
      <div style={{ marginTop: '15px', background: '#f7fafa', border: '1px solid #d5d9d9', borderRadius: '8px', padding: '10px 15px', display: 'inline-block' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#007185' }}>✨ AI Analysis</span>
          
          {aiResult ? (
            <span style={{ 
              fontSize: '12px', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              background: aiResult === 'HELPFUL' ? '#EDFDF2' : '#FEF2F2',
              border: `1px solid ${aiResult === 'HELPFUL' ? '#007600' : '#B12704'}`,
              color: aiResult === 'HELPFUL' ? '#007600' : '#B12704',
              fontWeight: 'bold'
            }}>
              {aiResult === 'HELPFUL' ? '✓ AI: Likely Helpful' : 'AI: Not Helpful'}
            </span>
          ) : (
            <button 
              onClick={handleAskAI}
              disabled={aiPredicting}
              style={{
                fontSize: '11px',
                background: 'white',
                border: '1px solid #d5d9d9',
                borderRadius: '4px',
                padding: '3px 8px',
                cursor: aiPredicting ? 'default' : 'pointer'
              }}
            >
              {aiPredicting ? 'Analyzing...' : 'Predict Helpfulness'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
