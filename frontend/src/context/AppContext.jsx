import { createContext, useContext, useState } from 'react'
import gamesData from '../data/games.json'
import usersData from '../data/users.json'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true)
  const [games, setGames] = useState(gamesData)
  const [users, setUsers] = useState(usersData)
  const [currentUser, setCurrentUser] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login')

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

  function login(username, password) {
    const user = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    )
    if (!user) return { success: false, error: 'Invalid username or password.' }
    setCurrentUser(user)
    setAuthModalOpen(false)
    return { success: true }
  }

  function register(username, password) {
    const exists = users.find(u => u.username.toLowerCase() === username.toLowerCase())
    if (exists) return { success: false, error: 'Username already taken.' }
    if (username.trim().length < 3) return { success: false, error: 'Username must be at least 3 characters.' }
    if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' }
    const newUser = {
      id: `u${Date.now()}`,
      username: username.trim(),
      password,
    }
    setUsers(prev => [...prev, newUser])
    setCurrentUser(newUser)
    setAuthModalOpen(false)
    return { success: true }
  }

  function logout() {
    setCurrentUser(null)
  }

  function addReview(gameId, review) {
    if (!currentUser) return
    setGames(prev =>
      prev.map(game => {
        if (game.id !== gameId) return game
        const newReview = {
          id: `r${Date.now()}`,
          username: currentUser.username,
          level: 'New Contributor',
          rating: review.rating,
          content: review.content,
          helpful: 0,
          date: new Date().toISOString().split('T')[0],
        }
        const allReviews = [newReview, ...game.reviews]
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        return {
          ...game,
          reviews: allReviews,
          rating: Math.round(avgRating * 10) / 10,
        }
      })
    )
  }

  function markHelpful(gameId, reviewId) {
    setGames(prev =>
      prev.map(game => {
        if (game.id !== gameId) return game
        return {
          ...game,
          reviews: game.reviews.map(r =>
            r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
          ),
        }
      })
    )
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
