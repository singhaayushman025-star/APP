import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getSession, clearSession, hasDismissedGuestPrompt, setDismissedGuestPrompt } from './services/data'
import Header from './components/Header'
import AuthModal from './components/AuthModal'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import ReportItem from './pages/ReportItem'
import ItemDetails from './pages/ItemDetails'
import MyClaims from './pages/MyClaims'
import MyReports from './pages/MyReports'
import FoundQueue from './pages/FoundQueue'
import ClaimItem from './pages/ClaimItem'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import './App.css'

function ProtectedRoute({ session, children }) {
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [session, setSession] = useState(getSession)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Show Auth Modal on initial visit if user is not logged in and hasn't dismissed it yet
  useEffect(() => {
    const currentSession = getSession()
    if (!currentSession && !hasDismissedGuestPrompt()) {
      // Slight delay for smooth visual transition
      const timer = setTimeout(() => {
        setIsAuthModalOpen(true)
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const onStorage = () => setSession(getSession())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function handleLogout() {
    clearSession()
    setSession(null)
  }

  function handleLogin(s) {
    setSession(s)
    setIsAuthModalOpen(false)
  }

  function handleCloseAuthModal() {
    setIsAuthModalOpen(false)
    setDismissedGuestPrompt(true)
  }

  function handleOpenAuthModal() {
    setIsAuthModalOpen(true)
  }

  return (
    <div className="app">
      <Header
        session={session}
        onLogout={handleLogout}
        onOpenAuthModal={handleOpenAuthModal}
      />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home session={session} onOpenAuthModal={handleOpenAuthModal} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:userNumber" element={<VerifyEmail onLogin={handleLogin} />} />
          <Route path="/report" element={<ReportItem session={session} />} />
          <Route path="/item/:id" element={<ItemDetails session={session} />} />
          <Route path="/item/:id/claim" element={
            <ProtectedRoute session={session}>
              <ClaimItem session={session} />
            </ProtectedRoute>
          } />
          <Route path="/my-claims" element={
            <ProtectedRoute session={session}>
              <MyClaims session={session} />
            </ProtectedRoute>
          } />
          <Route path="/my-reports" element={
            <ProtectedRoute session={session}>
              <MyReports session={session} />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute session={session}>
              <Profile session={session} onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          <Route path="/found" element={<FoundQueue session={session} />} />
          <Route path="/admin" element={<AdminDashboard session={session} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Guest / Welcome popup modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
      />
    </div>
  )
}
