import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { darkMode, toggleDarkMode, currentUser, logout, openAuthModal } = useApp()
  const [searchValue, setSearchValue] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/?search=${encodeURIComponent(searchValue.trim())}`)
      setSearchOpen(false)
      setSearchValue('')
    }
  }

  const initials = currentUser ? currentUser.username.slice(0, 2).toUpperCase() : ''

  return (
    <nav
      style={{
        background: 'rgba(13,13,13,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        height: '60px',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <Link
            to="/"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1.1rem',
              letterSpacing: '-0.02em',
              textDecoration: 'none',
            }}
          >
            QuestLog
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <NavLink to="/">Games</NavLink>
            <NavLink to="/?sort=rating">Top Rated</NavLink>
            <NavLink to="/?tab=news">News</NavLink>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {searchOpen ? (
            <form onSubmit={handleSearch}>
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
                  padding: '6px 16px',
                  width: '200px',
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                }}
                onBlur={() => { if (!searchValue) setSearchOpen(false) }}
              />
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                color: 'rgba(255,255,255,0.55)',
                borderRadius: '999px',
                padding: '6px 16px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(214,123,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'}
            >
              Search archives...
            </button>
          )}

          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(prev => !prev)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(214,123,255,0.35), rgba(0,229,255,0.2))',
                  border: '1px solid rgba(214,123,255,0.4)',
                  color: '#D67BFF',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                  boxShadow: userMenuOpen ? '0 0 14px rgba(214,123,255,0.35)' : 'none',
                }}
              >
                {initials}
              </button>

              {userMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    background: '#181818',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    minWidth: '160px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    zIndex: 300,
                  }}
                >
                  <div
                    style={{
                      padding: '12px 14px',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>
                      {currentUser.username}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                      Contributor
                    </p>
                  </div>
                  <button
                    onClick={() => { logout(); setUserMenuOpen(false) }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'none',
                      border: 'none',
                      color: '#FF6B6B',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      fontFamily: 'Inter, sans-serif',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(214,123,255,0.4)'
                e.currentTarget.style.color = '#D67BFF'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
              }}
            >
              Login
            </button>
          )}

          <button
            onClick={toggleDarkMode}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: darkMode ? '#D67BFF' : '#FACC15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              flexShrink: 0,
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
        color: 'rgba(255,255,255,0.55)',
        fontSize: '0.875rem',
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'color 0.2s',
        letterSpacing: '0.01em',
      }}
      onMouseEnter={e => e.target.style.color = '#fff'}
      onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
    >
      {children}
    </Link>
  )
}
