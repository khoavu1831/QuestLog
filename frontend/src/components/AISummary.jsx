export default function AISummary({ aiSummary }) {
  if (!aiSummary) return null

  const sentimentColor =
    aiSummary.sentimentScore >= 80 ? '#D67BFF' :
    aiSummary.sentimentScore >= 60 ? '#00E5FF' : '#FF6B6B'

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1rem',
        padding: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#D67BFF',
            boxShadow: '0 0 8px rgba(214,123,255,0.6)',
          }}
        />
        <p
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.6)',
            textTransform: 'uppercase',
          }}
        >
          AI Archive Summary
        </p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
            Sentiment
          </p>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: sentimentColor }}>
            {aiSummary.sentiment}
          </p>
        </div>
        <div
          style={{
            height: '4px',
            borderRadius: '2px',
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${aiSummary.sentimentScore}%`,
              background: `linear-gradient(90deg, ${sentimentColor}, rgba(0,229,255,0.7))`,
              borderRadius: '2px',
              transition: 'width 1s ease',
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p
          style={{
            fontSize: '0.72rem',
            letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          The Highlights
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {aiSummary.pros.map((pro, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#D67BFF',
                  marginTop: '6px',
                  flexShrink: 0,
                }}
              />
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                {pro}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p
          style={{
            fontSize: '0.72rem',
            letterSpacing: '0.08em',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          Critical Flaws
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {aiSummary.cons.map((con, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#FF6B6B',
                  marginTop: '6px',
                  flexShrink: 0,
                }}
              />
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                {con}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
