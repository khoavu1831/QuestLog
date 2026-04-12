import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import ReviewForm from '../components/ReviewForm'
import CommentList from '../components/CommentList'
import LoadingSkeleton from '../components/LoadingSkeleton'

export default function GameDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [game, setGame] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    fetch(`/api/games/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then(data => {
        setGame(data)
        setLoading(false)
      })
      .catch((e) => {
        console.error(e)
        setLoading(false)
      })
  }, [id])

  function handleAddReview(newReview) {
    if (newReview) {
      setGame(prev => {
        const allReviews = [newReview, ...prev.reviews]
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        return {
          ...prev,
          reviews: allReviews,
          rating: Math.round(avgRating * 10) / 10
        }
      })
    }
  }

  if (!game && !loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--amz-bg)' }}>
        <p style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Product not found.</p>
        <button onClick={() => navigate('/')} className="a-button-base">Return to Archive</button>
      </div>
    )
  }

  if (loading || !game) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--amz-bg)', padding: '20px' }}>
        <LoadingSkeleton />
      </div>
    )
  }

  const averageRating = game.reviews.length > 0
    ? (game.reviews.reduce((sum, r) => sum + r.rating, 0) / game.reviews.length).toFixed(1)
    : game.rating

  // Calculate review distribution (1-5 stars)
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  game.reviews.forEach(r => starCounts[Math.round(r.rating)]++)
  const totalReviews = game.reviews.length || 1 // Avoid div by zero

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      
      {/* Category Nav Header */}
      <div style={{ padding: '10px 20px', borderBottom: '1px solid #ddd', fontSize: '13px', color: '#565959' }}>
        <span>Archive</span> › <span>{game.genre}</span> › <span>{game.developer}</span>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
        
        {/* Amazon 3 Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr 300px', gap: '30px' }}>
          
          {/* LEFT: Image */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'sticky', top: '20px' }}>
              <img src={game.thumbnail} alt={game.title} style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }} />
              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '13px', color: '#007185', cursor: 'pointer' }}>Click to open expanded view</div>
            </div>
          </div>

          {/* MIDDLE: Info & Description */}
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'normal', lineHeight: '32px', marginBottom: '5px' }}>{game.title}</h1>
            <div style={{ color: '#007185', fontSize: '14px', marginBottom: '10px' }}>Developer: {game.developer}</div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{averageRating}</span>
                <span style={{ color: '#ffa41c', fontSize: '18px' }}>
                  {averageRating >= 4.5 ? '★★★★★' : averageRating >= 3.5 ? '★★★★☆' : averageRating >= 2.5 ? '★★★☆☆' : '★★☆☆☆'}
                </span>
                <span style={{ color: '#007185', fontSize: '14px' }}>{game.reviews.length} ratings</span>
              </div>
            </div>

            <div style={{ background: '#f3f3f3', padding: '10px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>
              <b>Playtime:</b> {game.playtime} <br/>
              <b>Genre:</b> {game.genre} <br/>
              <b>Release Date:</b> {new Date(game.releaseDate).toLocaleDateString()}
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>About this game</h3>
            <ul style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Officially published by {game.developer}.</li>
              <li>A masterpiece in the {game.genre} genre.</li>
              <li>{game.description.split('.')[0]}.</li>
              <li>{game.description.split('.').slice(1).join('.').trim() || "Experience it today."}</li>
            </ul>

          </div>

          {/* RIGHT: Archive / Community Box */}
          <div>
            <div style={{ border: '1px solid #D5D9D9', borderRadius: '8px', padding: '18px', width: '300px' }}>
              
              <div style={{ fontSize: '18px', color: '#0f1111', fontWeight: 'bold', marginBottom: '15px' }}>
                QuestLog Archive
              </div>
              
              <div style={{ fontSize: '14px', color: '#565959', marginBottom: '15px' }}>
                Track this game in your personal log and share your thoughts with the community.
              </div>

              <div style={{ margin: '15px 0' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>Review this game</div>
                <div style={{ fontSize: '13px', color: '#565959', marginBottom: '10px' }}>Help others by sharing your experience.</div>
                <ReviewForm gameId={game.id} onReviewAdded={handleAddReview} />
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <hr style={{ borderTop: '1px solid #ddd', margin: '40px 0' }} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '40px' }}>
          
          {/* Customer Reviews Breakdown */}
          <div>
            <h2 style={{ fontSize: '21px', fontWeight: 'bold', marginBottom: '10px' }}>Community reviews</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ color: '#ffa41c', fontSize: '20px' }}>
                {averageRating >= 4.5 ? '★★★★★' : averageRating >= 3.5 ? '★★★★☆' : averageRating >= 2.5 ? '★★★☆☆' : '★★☆☆☆'}
              </span>
              <span style={{ fontSize: '18px' }}>{averageRating} out of 5</span>
            </div>
            <div style={{ color: '#565959', fontSize: '14px', marginBottom: '15px' }}>{game.reviews.length} global ratings</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#007185', cursor: 'pointer' }}>
                  <span style={{ width: '40px' }}>{star} star</span>
                  <div style={{ flex: 1, height: '20px', background: '#F0F2F2', border: '1px solid #D5D9D9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(starCounts[star] / totalReviews) * 100}%`, height: '100%', background: '#FFA41C' }}></div>
                  </div>
                  <span style={{ width: '40px', textAlign: 'right' }}>{Math.round((starCounts[star] / totalReviews) * 100)}%</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '30px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Review this game</h3>
              <p style={{ fontSize: '14px', color: '#565959', marginBottom: '15px' }}>Share your thoughts with other community members</p>
              <button 
                className="a-button-base" 
                style={{ width: '100%', padding: '5px 0' }}
                onClick={() => {
                  window.scrollTo({ top: 300, behavior: 'smooth' })
                }}
              >
                Write a community review
              </button>
            </div>
          </div>

          {/* Actual Review List */}
          <div>
            <CommentList reviews={game.reviews} gameId={game.id} />
          </div>

        </div>

      </div>
    </div>
  )
}
