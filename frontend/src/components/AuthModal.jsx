import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function AuthModal() {
  const { authModalOpen, authModalMode, closeAuthModal, login, register, openAuthModal } = useApp()
  const [mode, setMode] = useState(authModalMode)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!authModalOpen) return null

  function switchMode(newMode) {
    setMode(newMode)
    setError('')
    setUsername('')
    setPassword('')
    setConfirm('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('All fields are required.')
      return
    }

    if (mode === 'register') {
      if (password !== confirm) {
        setError('Passwords do not match.')
        return
      }
      setLoading(true)
      setTimeout(() => {
        const result = register(username, password)
        if (!result.success) setError(result.error)
        setLoading(false)
      }, 400)
    } else {
      setLoading(true)
      setTimeout(() => {
        const result = login(username, password)
        if (!result.success) setError(result.error)
        setLoading(false)
      }, 400)
    }
  }

  return (
    <div
      onClick={closeAuthModal}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#141414',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1.25rem',
          padding: '2rem',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 0 40px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <h2
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: '1.25rem',
              color: '#fff',
            }}
          >
            {mode === 'login' ? 'Access Archive' : 'Create Account'}
          </h2>
          <button
            onClick={closeAuthModal}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '1.2rem',
              lineHeight: 1,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
          >
            x
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '8px',
            padding: '4px',
            marginBottom: '1.5rem',
            gap: '4px',
          }}
        >
          <TabButton active={mode === 'login'} onClick={() => switchMode('login')}>
            Login
          </TabButton>
          <TabButton active={mode === 'register'} onClick={() => switchMode('register')}>
            Register
          </TabButton>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1rem' }}>
            <AuthInput
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <AuthInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {mode === 'register' && (
              <AuthInput
                type="password"
                placeholder="Confirm Password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
            )}
          </div>

          {error && (
            <p
              style={{
                color: '#FF6B6B',
                fontSize: '0.8rem',
                marginBottom: '12px',
                padding: '8px 12px',
                background: 'rgba(255,107,107,0.08)',
                borderRadius: '6px',
                border: '1px solid rgba(255,107,107,0.2)',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '10px',
              background: loading ? 'rgba(214,123,255,0.15)' : 'rgba(214,123,255,0.85)',
              border: 'none',
              color: loading ? '#D67BFF' : '#fff',
              fontSize: '0.9rem',
              fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif',
              letterSpacing: '0.04em',
              cursor: loading ? 'default' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 0 18px rgba(214,123,255,0.28)',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#D67BFF'; e.currentTarget.style.boxShadow = '0 0 26px rgba(214,123,255,0.45)' } }}
            onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = 'rgba(214,123,255,0.85)'; e.currentTarget.style.boxShadow = '0 0 18px rgba(214,123,255,0.28)' } }}
          >
            {loading ? '...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#D67BFF',
              fontSize: '0.8rem',
              cursor: 'pointer',
              padding: 0,
              fontWeight: 600,
            }}
          >
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '7px',
        borderRadius: '6px',
        border: 'none',
        background: active ? 'rgba(214,123,255,0.15)' : 'transparent',
        color: active ? '#D67BFF' : 'rgba(255,255,255,0.4)',
        fontSize: '0.85rem',
        fontWeight: 600,
        fontFamily: 'Space Grotesk, sans-serif',
        cursor: 'pointer',
        transition: 'all 0.2s',
        borderBottom: active ? '1px solid rgba(214,123,255,0.4)' : '1px solid transparent',
      }}
    >
      {children}
    </button>
  )
}

function AuthInput({ type, placeholder, value, onChange }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${focused ? 'rgba(214,123,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '8px',
        color: '#fff',
        fontSize: '0.875rem',
        padding: '11px 14px',
        fontFamily: 'Inter, sans-serif',
        width: '100%',
        transition: 'border-color 0.2s',
        outline: 'none',
      }}
    />
  )
}
