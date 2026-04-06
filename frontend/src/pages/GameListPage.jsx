import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import GameCard from '../components/GameCard'
import FilterBar from '../components/FilterBar'
import LoadingSkeleton from '../components/LoadingSkeleton'

const PAGE_SIZE = 8

export default function GameListPage() {
  const { games } = useApp()
  const [searchParams] = useSearchParams()
  const [genre, setGenre] = useState('All')
  const [sort, setSort] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const searchQuery = searchParams.get('search') || ''
  const sortParam = searchParams.get('sort')

  useEffect(() => {
    if (sortParam === 'rating') setSort('rating')
  }, [sortParam])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [genre, sort, searchQuery])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900)
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

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D' }}>
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          paddingTop: '120px',
          paddingBottom: '64px',
        }}
      >
        <HeroSection searchQuery={searchQuery} />
        <FilterBar
          genre={genre}
          sort={sort}
          onGenreChange={setGenre}
          onSortChange={setSort}
          total={filtered.length}
        />

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
                <div
                  style={{
                    textAlign: 'center',
                    padding: '4rem',
                    color: 'rgba(255,255,255,0.3)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: '1.2rem',
                      marginBottom: '8px',
                    }}
                  >
                    No artifacts found.
                  </p>
                  <p style={{ fontSize: '0.85rem' }}>Try adjusting your filters.</p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '20px',
                  }}
                >
                  {filtered.slice(0, visibleCount).map((game, i) => (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: Math.min(i, PAGE_SIZE - 1) * 0.06 }}
                    >
                      <GameCard game={game} />
                    </motion.div>
                  ))}
                  {visibleCount < filtered.length && (
                    <UncoverCard
                      remaining={filtered.length - visibleCount}
                      onLoadMore={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                    />
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

function HeroSection({ searchQuery }) {
  return (
    <div style={{ marginBottom: '3rem' }}>
      {searchQuery ? (
        <div>
          <p
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '0.85rem',
              marginBottom: '8px',
            }}
          >
            Search results for
          </p>
          <h1
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.1,
              color: '#fff',
            }}
          >
            "{searchQuery}"
          </h1>
        </div>
      ) : (
        <div>
          <h1
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: '#fff',
              marginBottom: '0',
            }}
          >
            The Kinetic
          </h1>
          <h1
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: '#D67BFF',
              fontStyle: 'italic',
              marginBottom: '1rem',
            }}
          >
            Archive.
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: '0.95rem',
              maxWidth: '380px',
              lineHeight: 1.6,
            }}
          >
            Curated database of digital artifacts. Peer-reviewed critiques for the modern enthusiast.
          </p>
        </div>
      )}
    </div>
  )
}

function UncoverCard({ remaining, onLoadMore }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.3 }}
      onClick={onLoadMore}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '1rem',
        border: `1px solid ${hovered ? 'rgba(214,123,255,0.35)' : 'rgba(255,255,255,0.07)'}`,
        background: hovered ? 'rgba(214,123,255,0.05)' : 'rgba(255,255,255,0.02)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: `1px solid ${hovered ? 'rgba(214,123,255,0.4)' : 'rgba(255,255,255,0.12)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          color: hovered ? '#D67BFF' : 'rgba(255,255,255,0.4)',
          marginBottom: '12px',
          transition: 'all 0.2s',
          boxShadow: hovered ? '0 0 14px rgba(214,123,255,0.25)' : 'none',
        }}
      >
        +
      </div>
      <p
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 600,
          fontSize: '0.95rem',
          color: hovered ? '#D67BFF' : 'rgba(255,255,255,0.6)',
          marginBottom: '4px',
          transition: 'color 0.2s',
        }}
      >
        Uncover More
      </p>
      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)' }}>
        {remaining} item{remaining !== 1 ? 's' : ''} remaining
      </p>
    </motion.div>
  )
}
