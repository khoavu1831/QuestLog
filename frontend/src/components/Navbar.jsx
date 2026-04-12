import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { currentUser, logout, openAuthModal } = useApp()
  const [searchValue, setSearchValue] = useState('')
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/?search=${encodeURIComponent(searchValue.trim())}`)
    }
  }

  return (
    <nav style={{ background: 'var(--amz-dark)', color: 'white', fontSize: '14px' }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', gap: '20px' }}>
        {/* Logo */}
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', alignItems: 'flex-start' }}>
          questlog<span style={{ color: '#ff9900', fontSize: '1rem', marginLeft: '2px' }}>.archive</span>
        </Link>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', borderRadius: '4px', overflow: 'hidden', marginLeft: '10px' }}>
          <input
            type="text"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder="Search games..."
            style={{ flex: 1, border: 'none', padding: '10px', fontSize: '15px', outline: 'none' }}
          />
          <button type="submit" style={{ backgroundColor: 'var(--amz-yellow)', border: 'none', padding: '0 20px', cursor: 'pointer' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>

        {/* Account & Lists */}
        <div style={{ position: 'relative', cursor: 'pointer', padding: '5px' }} className="account-dropdown">
          {currentUser ? (
            <div onClick={() => logout()}>
              <div style={{ fontSize: '12px' }}>Hello, {currentUser.username}</div>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Account & Lists ▾</div>
              <div style={{ fontSize: '10px', color: '#ff9900' }}>Click to Sign Out</div>
            </div>
          ) : (
            <div onClick={() => openAuthModal('login')}>
              <div style={{ fontSize: '12px' }}>Hello, sign in</div>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Account & Lists ▾</div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
