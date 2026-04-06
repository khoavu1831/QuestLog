import { createContext, useContext, useState } from 'react'
import gamesData from '../data/games.json'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true)
  const [games, setGames] = useState(gamesData)

  function toggleDarkMode() {
    setDarkMode(prev => !prev)
  }

  function addReview(gameId, review) {
    setGames(prev =>
      prev.map(game => {
        if (game.id !== gameId) return game
        const newReview = {
          id: `r${Date.now()}`,
          username: 'You',
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
    <AppContext.Provider value={{ darkMode, toggleDarkMode, games, addReview, markHelpful }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
