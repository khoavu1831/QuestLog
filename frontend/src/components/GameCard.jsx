import { useNavigate } from 'react-router-dom'

export default function GameCard({ game }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/game/${game.id}`)}
      style={{
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ position: 'relative', width: '100%', paddingTop: '100%', background: '#f8f8f8', borderBottom: '1px solid #eee' }}>
        <img
          src={game.thumbnail}
          alt={game.title}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }}
        />
        {game.featured && (
          <div style={{ position: 'absolute', top: '10px', left: '0', background: '#e77600', color: 'white', padding: '4px 8px', fontSize: '11px', fontWeight: 'bold' }}>
            Editor's Choice
          </div>
        )}
      </div>

      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3
          className="a-link-normal"
          style={{
            fontSize: '15px',
            fontWeight: 'normal',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: '4px'
          }}
        >
          {game.title}
        </h3>

        <div style={{ fontSize: '13px', color: '#565959', marginBottom: '4px' }}>
          Developer: {game.developer}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', gap: '5px' }}>
          <div style={{ color: '#ffa41c', fontSize: '16px' }}>
            {game.rating >= 9 ? '★★★★★' : game.rating >= 7 ? '★★★★☆' : game.rating >= 5 ? '★★★☆☆' : '★★☆☆☆'}
          </div>
          <span style={{ fontSize: '13px', color: '#007185' }}>{Math.floor(game.rating * 123)} reviews</span>
        </div>

        <div style={{ fontSize: '12px', color: '#565959', marginTop: 'auto', paddingTop: '10px' }}>
          Genre: <span style={{ color: '#007185' }}>{game.genre}</span>
        </div>
      </div>
    </div>
  )
}
