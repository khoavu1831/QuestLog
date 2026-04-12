import { useState, useMemo } from 'react'
import CommentItem from './CommentItem'

export default function CommentList({ reviews, gameId }) {
  const [filterMode, setFilterMode] = useState('all') // all, ai_helpful

  const filteredAndSorted = useMemo(() => {
    let result = [...reviews]
    
    if (filterMode === 'recent') {
      // Sort by newest date
      result.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    } else {
      // Default: Top reviews (sort by helpfulness)
      result.sort((a, b) => b.helpful - a.helpful)
    }

    // Filter by AI Helpful prediction
    if (filterMode === 'ai_helpful') {
      result = result.filter(r => r.aiLabel === 'HELPFUL')
    }

    return result
  }, [reviews, filterMode])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Top reviews from the United States</h3>
        
        {/* Amazon style filter dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#565959' }}>Sort by:</span>
          <select 
            style={{ background: '#f0f2f2', border: '1px solid #d5d9d9', borderRadius: '8px', padding: '5px', fontSize: '13px', outline: 'none', cursor: 'pointer', boxShadow: '0 2px 5px rgba(15,17,17,.15)' }}
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
          >
            <option value="all">Top reviews</option>
            <option value="recent">Most recent</option>
            <option value="ai_helpful">Top AI Helpful Reviews</option>
          </select>
        </div>
      </div>

      {filteredAndSorted.length === 0 ? (
        <div style={{ padding: '20px 0', color: '#565959', fontSize: '14px' }}>
          No reviews matched your filters.
        </div>
      ) : (
        filteredAndSorted.map(review => (
          <CommentItem key={review.id} review={review} gameId={gameId} />
        ))
      )}
    </div>
  )
}
