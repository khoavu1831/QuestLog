import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useApp()
  const [searchValue, setSearchValue] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/?search=${encodeURIComponent(searchValue.trim())}`)
      setSearchOpen(false)
    }
  }

  return (
    <nav
      style={{
        background: 'rgba(13,13,13,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link
            to="/"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#fff', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}
          >
            QuestLog
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/">Games</NavLink>
            <NavLink to="/?sort=rating">Top Rated</NavLink>
            <NavLink to="/?tab=news">News</NavLink>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                autoFocus
                type="text"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder="Search archives..."
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontSize: '0.875rem',
                  borderRadius: '999px',
                  padding: '0.4rem 1rem',
                  width: '220px',
                }}
                onBlur={() => { if (!searchValue) setSearchOpen(false) }}
              />
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)',
                borderRadius: '999px',
                padding: '0.4rem 1.2rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              Search archives...
            </button>
          )}

          <button
            onClick={toggleDarkMode}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: darkMode ? '#D67BFF' : '#FACC15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              transition: 'all 0.2s',
            }}
          >
            {darkMode ? '●' : '○'}
          </button>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        color: 'rgba(255,255,255,0.6)',
        fontSize: '0.875rem',
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'color 0.2s',
        letterSpacing: '0.01em',
      }}
      onMouseEnter={e => e.target.style.color = '#fff'}
      onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
    >
      {children}
    </Link>
  )
}
