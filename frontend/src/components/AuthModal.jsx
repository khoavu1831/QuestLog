import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function AuthModal() {
  const { authModalOpen, authModalMode, closeAuthModal, login, register } = useApp()
  const [mode, setMode] = useState(authModalMode)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!authModalOpen) return null

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('Enter your mobile number or email address.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      if (mode === 'register') {
        const result = register(username, password)
        if (!result.success) setError(result.error)
        else closeAuthModal()
      } else {
        const result = login(username, password)
        if (!result.success) setError(result.error)
        else closeAuthModal()
      }
      setLoading(false)
    }, 400)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'white', // Full page white for login feel
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <div style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' }} onClick={closeAuthModal}>
        amazon<span style={{ color: '#ff9900', fontSize: '14px' }}>.fake</span>
      </div>

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px 25px',
          width: '100%',
          maxWidth: '350px',
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: '400', marginBottom: '15px' }}>
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </h1>

        {error && (
          <div style={{ color: '#B12704', fontSize: '13px', marginBottom: '15px', display: 'flex', gap: '5px' }}>
            <span style={{ fontWeight: 'bold' }}>!</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>
              Username or mobile phone number
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                border: '1px solid #a6a6a6',
                borderTopColor: '#949494',
                borderRadius: '3px',
                boxShadow: '0 1px 0 rgba(255,255,255,.5), 0 1px 0 rgba(0,0,0,.07) inset',
                outline: 'none',
                fontSize: '14px'
              }}
              onFocus={e => { e.target.style.border = '1px solid #e77600'; e.target.style.boxShadow = '0 0 3px 2px rgba(228,121,17,.5) inset'; }}
              onBlur={e => { e.target.style.border = '1px solid #a6a6a6'; e.target.style.boxShadow = '0 1px 0 rgba(255,255,255,.5), 0 1px 0 rgba(0,0,0,.07) inset'; }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                border: '1px solid #a6a6a6',
                borderTopColor: '#949494',
                borderRadius: '3px',
                boxShadow: '0 1px 0 rgba(255,255,255,.5), 0 1px 0 rgba(0,0,0,.07) inset',
                outline: 'none',
                fontSize: '14px'
              }}
              onFocus={e => { e.target.style.border = '1px solid #e77600'; e.target.style.boxShadow = '0 0 3px 2px rgba(228,121,17,.5) inset'; }}
              onBlur={e => { e.target.style.border = '1px solid #a6a6a6'; e.target.style.boxShadow = '0 1px 0 rgba(255,255,255,.5), 0 1px 0 rgba(0,0,0,.07) inset'; }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="a-button-primary"
            style={{ width: '100%', padding: '6px', fontSize: '13px', marginBottom: '15px' }}
          >
            {loading ? 'Moving...' : 'Continue'}
          </button>
        </form>

        <p style={{ fontSize: '12px', lineHeight: '1.5', marginTop: '15px' }}>
          By continuing, you agree to Amazon.fake's <a href="#" className="a-link-normal">Conditions of Use</a> and <a href="#" className="a-link-normal">Privacy Notice</a>.
        </p>

        {mode === 'login' && (
          <div style={{ marginTop: '20px', fontSize: '13px' }}>
            <a href="#" className="a-link-normal">Need help?</a>
          </div>
        )}
      </div>

      <div style={{ width: '100%', maxWidth: '350px', marginTop: '15px' }}>
        {mode === 'login' ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <hr style={{ flex: 1, borderTop: '1px solid #e7e7e7', borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }} />
              <div style={{ color: '#767676', fontSize: '12px', padding: '0 10px' }}>New to Amazon.fake?</div>
              <hr style={{ flex: 1, borderTop: '1px solid #e7e7e7', borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }} />
            </div>
            <button 
              className="a-button-base" 
              style={{ width: '100%', padding: '6px', fontSize: '13px' }}
              onClick={() => setMode('register')}
            >
              Create your Amazon.fake account
            </button>
          </div>
        ) : (
          <div style={{ fontSize: '13px' }}>
            Already have an account? <a href="#" className="a-link-normal" onClick={(e) => { e.preventDefault(); setMode('login'); }}>Sign in</a>
          </div>
        )}
      </div>
      
      {/* Cancel button since it's a modal taking over */}
      <div style={{ marginTop: '30px' }}>
        <button onClick={closeAuthModal} style={{ background: 'none', border: 'none', color: '#007185', cursor: 'pointer', fontSize: '13px' }}>
          Cancel / Back to Store
        </button>
      </div>

    </div>
  )
}
