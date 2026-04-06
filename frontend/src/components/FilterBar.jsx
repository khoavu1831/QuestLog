const GENRES = ['All', 'Action RPG', 'Strategy', 'Simulation', 'RPG', 'Shooter', 'Racing', 'Puzzle', 'Survival']
const SORTS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Rating', value: 'rating' },
  { label: 'Title A-Z', value: 'title' },
]

export default function FilterBar({ genre, sort, onGenreChange, onSortChange, total }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '2rem',
      }}
    >
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <SelectDropdown
          label="Genre"
          value={genre}
          options={GENRES.map(g => ({ label: g, value: g }))}
          onChange={onGenreChange}
        />
        <SelectDropdown
          label="Sort"
          value={sort}
          options={SORTS}
          onChange={onSortChange}
        />
      </div>

      <p
        style={{
          color: 'rgba(255,255,255,0.25)',
          fontSize: '0.72rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        — Displaying {total} artifacts
      </p>
    </div>
  )
}

function SelectDropdown({ label, value, options, onChange }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '999px',
          color: 'rgba(255,255,255,0.75)',
          fontSize: '0.8rem',
          padding: '6px 16px 6px 12px',
          appearance: 'none',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(214,123,255,0.5)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      >
        {options.map(opt => (
          <option
            key={opt.value}
            value={opt.value}
            style={{ background: '#1a1a1a', color: '#fff' }}
          >
            {label}: {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
