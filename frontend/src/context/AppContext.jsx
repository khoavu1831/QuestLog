import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true)
  const [games, setGames] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login')

  useEffect(() => {
    fetch('/api/games')
      .then(res => res.json())
      .then(data => setGames(data))
      .catch(console.error)
  }, [])

  function toggleDarkMode() {
    setDarkMode(prev => !prev)
  }

  function openAuthModal(mode = 'login') {
    setAuthModalMode(mode)
    setAuthModalOpen(true)
  }

  function closeAuthModal() {
    setAuthModalOpen(false)
  }

  async function login(username, password) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.error || 'Login failed' }
      setCurrentUser(data)
      setAuthModalOpen(false)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  async function register(username, password) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.error || 'Registration failed' }
      setCurrentUser(data)
      setAuthModalOpen(false)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  function logout() {
    setCurrentUser(null)
  }

  async function addReview(gameId, review) {
    if (!currentUser) return null
    try {
      const res = await fetch(`/api/games/${gameId}/reviews`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id,
          'X-Username': currentUser.username
        },
        body: JSON.stringify(review)
      })
      if (!res.ok) throw new Error('Failed to add review')
      return await res.json()
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async function markHelpful(gameId, reviewId) {
    try {
      await fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' })
    } catch (e) { console.error(e) }
  }

  return (
    <AppContext.Provider value={{
      darkMode, toggleDarkMode,
      games, addReview, markHelpful,
      currentUser, login, register, logout,
      authModalOpen, authModalMode, openAuthModal, closeAuthModal,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
