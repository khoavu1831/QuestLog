import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import ReviewForm from '../components/ReviewForm'
import CommentList from '../components/CommentList'
import AISummary from '../components/AISummary'

export default function GameDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { games } = useApp()
  const [loading, setLoading] = useState(true)

  const game = games.find(g => g.id === id)

  useEffect(() => {
    window.scrollTo(0, 0)
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [id])

  if (!game && !loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0D0D0D',
          color: '#fff',
        }}
      >
        <p
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '1rem',
          }}
        >
          Artifact not found.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 24px',
            background: 'rgba(214,123,255,0.15)',
            border: '1px solid rgba(214,123,255,0.3)',
            borderRadius: '8px',
            color: '#D67BFF',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          Return to Archive
        </button>
      </div>
    )
  }

  if (loading || !game) {
    return <DetailSkeleton />
  }

  const averageRating =
    game.reviews.length > 0
      ? (game.reviews.reduce((sum, r) => sum + r.rating, 0) / game.reviews.length).toFixed(1)
      : game.rating

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D' }}>
      <BannerSection game={game} averageRating={averageRating} navigate={navigate} />

      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-1 flex flex-col gap-5">
            <AISummary aiSummary={game.aiSummary} />
            <DevStats game={game} />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <ReviewForm gameId={game.id} />
            <CommentList reviews={game.reviews} gameId={game.id} />
          </div>
        </div>
      </div>
    </div>
  )
}

function BannerSection({ game, averageRating, navigate }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ position: 'relative', minHeight: '420px', overflow: 'hidden' }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${game.banner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px) brightness(0.35)',
          transform: 'scale(1.05)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(13,13,13,0.9) 40%, rgba(13,13,13,0.3) 100%), linear-gradient(to top, rgba(13,13,13,1) 0%, transparent 50%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative" style={{ paddingTop: '8rem', paddingBottom: '3rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-block',
            marginBottom: '1.5rem',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.4)',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.target.style.color = '#D67BFF'}
          onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
        >
          Back to Archive
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <GenreBadge>{game.genre}</GenreBadge>
              <GenreBadge secondary>{game.developer}</GenreBadge>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(2.2rem, 5vw, 4rem)',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: '#fff',
                textTransform: 'uppercase',
                marginBottom: '1rem',
                maxWidth: '600px',
              }}
            >
              {game.title}
            </motion.h1>

            <p
              style={{
                color: 'rgba(255,255,255,0.55)',
                fontSize: '0.9rem',
                lineHeight: 1.65,
                maxWidth: '480px',
              }}
            >
              {game.description}
            </p>
          </div>

          <ScoreRing score={averageRating} />
        </div>
      </div>
    </motion.div>
  )
}

function GenreBadge({ children, secondary }) {
  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: '4px',
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        background: secondary ? 'rgba(255,255,255,0.05)' : 'rgba(214,123,255,0.12)',
        border: `1px solid ${secondary ? 'rgba(255,255,255,0.1)' : 'rgba(214,123,255,0.25)'}`,
        color: secondary ? 'rgba(255,255,255,0.5)' : '#D67BFF',
      }}
    >
      {children}
    </span>
  )
}

function ScoreRing({ score }) {
  const circumference = 2 * Math.PI * 38
  const progress = (score / 10) * circumference

  return (
    <div
      style={{
        position: 'relative',
        width: '110px',
        height: '110px',
        flexShrink: 0,
      }}
    >
      <svg width="110" height="110" viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="44" cy="44" r="38"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="3"
        />
        <circle
          cx="44" cy="44" r="38"
          fill="none"
          stroke="#00E5FF"
          strokeWidth="3"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(0,229,255,0.6))' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 800,
            fontSize: '1.6rem',
            color: '#fff',
            lineHeight: 1,
          }}
        >
          {score}
        </p>
        <p style={{ fontSize: '0.55rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
          Quest Score
        </p>
      </div>
    </div>
  )
}

function DevStats({ game }) {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <div
        style={{
          flex: 1,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '10px',
          padding: '14px',
        }}
      >
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>
          Developer
        </p>
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>
          {game.developer}
        </p>
      </div>
      <div
        style={{
          flex: 1,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '10px',
          padding: '14px',
        }}
      >
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>
          Playtime
        </p>
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>
          {game.playtime}
        </p>
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D' }}>
      <div className="skeleton" style={{ height: '420px', width: '100%' }} />
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex flex-col gap-5">
            <div className="skeleton" style={{ height: '300px', borderRadius: '1rem' }} />
            <div className="skeleton" style={{ height: '100px', borderRadius: '1rem' }} />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="skeleton" style={{ height: '260px', borderRadius: '1rem' }} />
            <div className="skeleton" style={{ height: '180px', borderRadius: '1rem' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
