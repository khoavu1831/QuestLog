export default function Footer() {
  return (
    <footer
      style={{
        background: '#0A0A0A',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '3rem 0 2rem',
        marginTop: '4rem',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                fontSize: '1.1rem',
                color: '#fff',
                marginBottom: '0.75rem',
              }}
            >
              QuestLog
            </h3>
            <p
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: '0.8rem',
                lineHeight: 1.6,
                maxWidth: '240px',
              }}
            >
              The Kinetic Archive is a curated platform dedicated to the preservation and critique of interactive media.
            </p>
          </div>

          <div>
            <p
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '0.7rem',
                letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.35)',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              Navigation
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['About', 'Privacy', 'Terms', 'Contact'].map(item => (
                <a
                  key={item}
                  href="#"
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.color = '#D67BFF'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            {['RSS', 'Share', 'Archive'].map(label => (
              <button
                key={label}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '0.65rem',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(214,123,255,0.12)'
                  e.currentTarget.style.borderColor = 'rgba(214,123,255,0.3)'
                  e.currentTarget.style.color = '#D67BFF'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
                }}
              >
                {label[0]}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '1.5rem',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>
            © 2024 QuestLog. The Kinetic Archive.
          </p>
        </div>
      </div>
    </footer>
  )
}
