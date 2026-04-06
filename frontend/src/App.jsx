import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import GameListPage from './pages/GameListPage'
import GameDetailPage from './pages/GameDetailPage'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Navbar />
        <AuthModal />
        <main>
          <Routes>
            <Route path="/" element={<GameListPage />} />
            <Route path="/game/:id" element={<GameDetailPage />} />
          </Routes>
        </main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'rgba(20, 20, 20, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(214, 123, 255, 0.25)',
              color: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              borderRadius: '10px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#D67BFF',
                secondary: 'rgba(20,20,20,0.95)',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF6B6B',
                secondary: 'rgba(20,20,20,0.95)',
              },
            },
          }}
        />
      </BrowserRouter>
    </AppProvider>
  )
}
