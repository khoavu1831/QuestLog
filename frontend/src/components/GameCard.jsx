import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function GameCard({ game }) {
  const navigate = useNavigate()

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={() => navigate(`/game/${game.id}`)}
      style={{
        borderRadius: '1rem',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
        <img
          src={game.thumbnail}
          alt={game.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(13,13,13,0.85) 0%, transparent 50%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(13,13,13,0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '999px',
            padding: '3px 10px',
            fontSize: '0.8rem',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            color: game.rating >= 9 ? '#D67BFF' : game.rating >= 8 ? '#00E5FF' : 'rgba(255,255,255,0.85)',
          }}
        >
          {game.rating}
        </div>

        {game.featured && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'rgba(214,123,255,0.2)',
              border: '1px solid rgba(214,123,255,0.4)',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#D67BFF',
              textTransform: 'uppercase',
            }}
          >
            Editor's Choice
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '12px',
          }}
        >
          <p
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '2px',
            }}
          >
            {game.genre}
          </p>
          <h3
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              color: '#fff',
              lineHeight: 1.2,
            }}
          >
            {game.title}
          </h3>
        </div>
      </div>

      <div style={{ padding: '12px 14px' }}>
        <p
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.78rem',
            lineHeight: 1.5,
            marginBottom: '12px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {game.description}
        </p>

        <button
          onClick={e => { e.stopPropagation(); navigate(`/game/${game.id}`) }}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '8px',
            background: 'rgba(214,123,255,0.12)',
            border: '1px solid rgba(214,123,255,0.25)',
            color: '#D67BFF',
            fontSize: '0.8rem',
            fontWeight: 600,
            fontFamily: 'Space Grotesk, sans-serif',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(214,123,255,0.22)'
            e.currentTarget.style.boxShadow = '0 0 16px rgba(214,123,255,0.25)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(214,123,255,0.12)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          View Details
        </button>
      </div>
    </motion.div>
  )
}
