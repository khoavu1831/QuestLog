import { useState } from 'react'
import toast from 'react-hot-toast'
import RatingStars from './RatingStars'
import { useApp } from '../context/AppContext'

const MODEL_OPTIONS = [
  { value: 'distilbert', label: 'DistilBERT', badge: 'Best · F1 82.6%', color: '#4a90d9' },
  { value: 'lstm',       label: 'BiLSTM',     badge: 'Deep · F1 81.7%', color: '#7c5cbf' },
  { value: 'lgb',        label: 'LightGBM',   badge: 'Fast · F1 81.6%', color: '#2a9d5c' },
  { value: 'lr',         label: 'TF-IDF + LR', badge: 'Simple · F1 75.6%', color: '#888' },
]

const AI_LABEL_STYLE = {
  HELPFUL: {
    bg: '#EDFDF2', border: '#007600', color: '#007600',
    icon: '✓', text: 'AI: Likely Helpful',
  },
  'NOT HELPFUL': {
    bg: '#FEF2F2', border: '#B12704', color: '#B12704',
    icon: '✗', text: 'AI: Likely Not Helpful',
  },
}

export default function ReviewForm({ gameId, onReviewAdded }) {
  const { addReview, currentUser } = useApp()

  const [rating, setRating]           = useState(0)
  const [content, setContent]         = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [selectedModel, setSelectedModel] = useState('distilbert')
  const [aiResult, setAiResult]       = useState(null)   // { label, score, model_used }
  const [aiLoading, setAiLoading]     = useState(false)

  if (!currentUser) return null

  // ---------- AI Prediction ----------
  async function handlePredict() {
    if (content.trim().length < 10) {
      toast.error('Write at least 10 characters first.')
      return
    }
    setAiLoading(true)
    setAiResult(null)
    try {
      const res = await fetch('http://localhost:5001/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: content.trim(),
          rating: rating || 3,
          model_type: selectedModel,
        }),
      })
      if (!res.ok) throw new Error('AI service error')
      const data = await res.json()
      setAiResult(data)
    } catch (err) {
      toast.error('AI service not reachable. Is it running?')
    }
    setAiLoading(false)
  }

  // ---------- Submit Review ----------
  async function handleSubmit(e) {
    e.preventDefault()
    if (rating === 0) { toast.error('Please select a rating.'); return }
    if (content.trim().length < 10) { toast.error('Review must be at least 10 characters.'); return }

    setSubmitting(true)
    const newReview = await addReview(gameId, { rating, content: content.trim() })
    if (newReview) {
      toast.success('Your review has been submitted.')
      setRating(0); setContent(''); setAiResult(null)
      if (onReviewAdded) onReviewAdded(newReview)
    } else {
      toast.error('Failed to submit. Please try again.')
    }
    setSubmitting(false)
  }

  const aiStyle = aiResult ? AI_LABEL_STYLE[aiResult.label] : null
  const selectedModelInfo = MODEL_OPTIONS.find(m => m.value === selectedModel)

  return (
    <div style={{ marginTop: '10px' }}>
      <form onSubmit={handleSubmit}>

        {/* Rating Stars */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Overall rating</div>
          <RatingStars value={rating} onChange={setRating} size="lg" />
        </div>

        {/* Text Area */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Add a written review</div>
          <textarea
            value={content}
            onChange={e => { setContent(e.target.value); setAiResult(null) }}
            placeholder="What did you like or dislike? Be specific and helpful to other players."
            rows={4}
            style={{
              width: '100%', border: '1px solid #888C8C', borderRadius: '3px',
              padding: '10px', fontSize: '14px',
              boxShadow: '0 1px 2px rgba(15,17,17,.15) inset',
              outline: 'none', resize: 'vertical', fontFamily: 'Arial, sans-serif',
            }}
            onFocus={e => { e.target.style.border = '1px solid #e77600'; e.target.style.boxShadow = '0 0 3px 2px rgba(228,121,17,.5) inset' }}
            onBlur={e => { e.target.style.border = '1px solid #888C8C'; e.target.style.boxShadow = '0 1px 2px rgba(15,17,17,.15) inset' }}
          />
        </div>

        {/* ── AI PREDICTION SECTION ── */}
        <div style={{ border: '1px solid #D5D9D9', borderRadius: '6px', padding: '12px', marginBottom: '15px', background: '#FAFAFA' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#007185', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>✨</span> AI Helpfulness Predictor
            <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#888' }}>— test your review before submitting</span>
          </div>

          {/* Model Selector + Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <select
              value={selectedModel}
              onChange={e => { setSelectedModel(e.target.value); setAiResult(null) }}
              style={{
                background: '#f0f2f2', border: '1px solid #D5D9D9', borderRadius: '6px',
                padding: '5px 8px', fontSize: '13px', outline: 'none', cursor: 'pointer',
              }}
            >
              {MODEL_OPTIONS.map(m => (
                <option key={m.value} value={m.value}>{m.label} ({m.badge})</option>
              ))}
            </select>

            <button
              type="button"
              onClick={handlePredict}
              disabled={aiLoading || content.trim().length < 10}
              style={{
                padding: '5px 14px', fontSize: '13px', cursor: 'pointer',
                background: aiLoading ? '#eee' : '#131921',
                color: aiLoading ? '#888' : 'white',
                border: 'none', borderRadius: '6px',
                transition: 'background 0.2s',
                opacity: content.trim().length < 10 ? 0.5 : 1,
              }}
            >
              {aiLoading ? '⏳ Predicting...' : '🔍 Predict'}
            </button>

            {/* Badge showing selected model */}
            <span style={{
              fontSize: '11px', padding: '3px 8px', borderRadius: '10px',
              background: `${selectedModelInfo.color}18`, border: `1px solid ${selectedModelInfo.color}55`,
              color: selectedModelInfo.color, fontWeight: 'bold',
            }}>
              {selectedModelInfo.label}
            </span>
          </div>

          {/* AI Result */}
          {aiResult && aiStyle && (
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: aiStyle.bg, border: `1px solid ${aiStyle.border}`,
                color: aiStyle.color, padding: '5px 12px', borderRadius: '14px',
                fontSize: '13px', fontWeight: 'bold',
              }}>
                <span style={{ fontSize: '16px' }}>{aiStyle.icon}</span>
                {aiStyle.text}
              </div>
              <div style={{ fontSize: '12px', color: '#565959' }}>
                Confidence: <b>{aiResult.score.toFixed(1)}%</b>
                &nbsp;·&nbsp;
                Model: <b>{MODEL_OPTIONS.find(m => m.value === aiResult.model_used)?.label}</b>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="a-button-secondary"
          style={{ padding: '8px 20px', fontSize: '14px' }}
        >
          {submitting ? 'Submitting...' : 'Submit review'}
        </button>

      </form>
    </div>
  )
}
