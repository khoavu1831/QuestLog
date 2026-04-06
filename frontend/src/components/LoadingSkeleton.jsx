export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            borderRadius: '1rem',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            className="skeleton"
            style={{ aspectRatio: '16/10', width: '100%' }}
          />
          <div style={{ padding: '12px 14px' }}>
            <div
              className="skeleton"
              style={{ height: '12px', borderRadius: '6px', marginBottom: '8px', width: '40%' }}
            />
            <div
              className="skeleton"
              style={{ height: '18px', borderRadius: '6px', marginBottom: '8px', width: '80%' }}
            />
            <div
              className="skeleton"
              style={{ height: '12px', borderRadius: '6px', marginBottom: '4px', width: '100%' }}
            />
            <div
              className="skeleton"
              style={{ height: '12px', borderRadius: '6px', marginBottom: '16px', width: '70%' }}
            />
            <div
              className="skeleton"
              style={{ height: '34px', borderRadius: '8px', width: '100%' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
