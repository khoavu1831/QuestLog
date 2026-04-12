import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import GameCard from '../components/GameCard'
import LoadingSkeleton from '../components/LoadingSkeleton'

const PAGE_SIZE = 12

export default function GameListPage() {
  const { games } = useApp()
  const [searchParams] = useSearchParams()
  const [genre, setGenre] = useState('All')
  const [sort, setSort] = useState('rating')
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const searchQuery = searchParams.get('search') || ''

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [genre, sort, searchQuery])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    let result = [...games]
    if (searchQuery) {
      result = result.filter(g =>
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.genre.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    if (genre !== 'All') {
      result = result.filter(g => g.genre === genre)
    }
    if (sort === 'rating') {
      result.sort((a, b) => b.rating - a.rating)
    } else if (sort === 'newest') {
      result.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
    } else {
      result.sort((a, b) => a.title.localeCompare(b.title))
    }
    return result
  }, [games, genre, sort, searchQuery])

  // Derive genres from current games for the sidebar
  const genres = useMemo(() => ['All', ...new Set(games.map(g => g.genre))].slice(0, 10), [games])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--amz-bg)' }}>
      {/* Search Result Bar */}
      <div style={{ background: 'white', padding: '10px 20px', borderBottom: '1px solid #ddd', fontSize: '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            1-{Math.min(visibleCount, filtered.length)} of over {filtered.length} results for <span style={{ color: '#c45500', fontWeight: 'bold' }}>"{searchQuery || 'All Games'}"</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px' }}>Sort by:</span>
            <select 
              value={sort} 
              onChange={e => setSort(e.target.value)}
              style={{ background: '#f0f2f2', border: '1px solid #d5d9d9', borderRadius: '8px', padding: '5px', fontSize: '13px', outline: 'none', cursor: 'pointer', boxShadow: '0 2px 5px rgba(15,17,17,.15)' }}
            >
              <option value="rating">Avg. Customer Review</option>
              <option value="newest">Featured / Newest</option>
              <option value="az">A to Z</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* Amazon Sidebar - Cleaned */}
        <div style={{ width: '220px', flexShrink: 0, paddingRight: '10px', borderRight: '1px solid #eee' }}>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>Genre</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {genres.map(g => (
                <label key={g} style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={genre === g} 
                    onChange={() => setGenre(g)} 
                  />
                  <span className={genre === g ? 'font-bold' : ''}>{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>Customer Reviews</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ color: '#ffa41c', fontSize: '16px', cursor: 'pointer' }}>★★★★☆ & Up</div>
              <div style={{ color: '#ffa41c', fontSize: '16px', cursor: 'pointer' }}>★★★☆☆ & Up</div>
              <div style={{ color: '#ffa41c', fontSize: '16px', cursor: 'pointer' }}>★★☆☆☆ & Up</div>
              <div style={{ color: '#ffa41c', fontSize: '16px', cursor: 'pointer' }}>★☆☆☆☆ & Up</div>
            </div>
          </div>

        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>RESULTS</h2>
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${genre}-${sort}-${searchQuery}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', color: '#555' }}>
                    <p style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No items found.</p>
                    <p style={{ fontSize: '0.85rem' }}>Try checking your spelling or use more general terms.</p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                      gap: '15px',
                    }}
                  >
                    {filtered.slice(0, visibleCount).map((game, i) => (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: Math.min(i, PAGE_SIZE - 1) * 0.03 }}
                      >
                        <GameCard game={game} />
                      </motion.div>
                    ))}
                    {visibleCount < filtered.length && (
                      <div 
                        onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
                        className="a-button-base"
                      >
                        <b>See more results</b>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

      </div>
    </div>
  )
}
