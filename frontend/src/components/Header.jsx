import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import './Header.css'

export default function Header({ session, onLogout, onOpenAuthModal }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  function isActive(path) {
    return location.pathname === path
  }

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <span className="location-label">Amsterdam, NL — Central Desk</span>
        </div>

        <div className="header-center">
          <Link to="/" className="header-brand">The Lost &amp; Found Archive</Link>
        </div>

        <div className="header-right">
          <div className="desktop-quick-nav">
            <Link to="/" className={isActive('/') ? 'active-link' : ''}>Lost Queue</Link>
            <Link to="/found" className={isActive('/found') ? 'active-link' : ''}>Found Queue</Link>
            <Link to="/admin" className={isActive('/admin') ? 'active-link' : ''}>Admin &amp; Audit</Link>
          </div>

          <button
            className={`header-menu-toggle ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
      
      {/* Off-canvas dropdown nav */}
      <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
        <div className="nav-links">
          <Link to="/" className={isActive('/') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
            1. Search Lost Queue
          </Link>
          <Link to="/found" className={isActive('/found') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
            2. 30-Day Found Queue
          </Link>
          <Link to="/report" className={isActive('/report') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
            3. Report Found Item
          </Link>

          {session ? (
            <>
              <Link to="/my-reports" className={isActive('/my-reports') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                4. My Reported Items
              </Link>
              <Link to="/my-claims" className={isActive('/my-claims') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                5. My Submitted Claims
              </Link>
              <Link to="/profile" className={isActive('/profile') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
                6. My Account &amp; Audit ({session.userNumber})
              </Link>
            </>
          ) : (
            <button
              type="button"
              className="nav-link-btn"
              onClick={() => {
                setMenuOpen(false)
                if (onOpenAuthModal) onOpenAuthModal()
              }}
            >
              4. Log In or Sign Up
            </button>
          )}

          <Link to="/admin" className={isActive('/admin') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
            7. Admin Management &amp; Audit Trail
          </Link>
        </div>

        <div className="nav-user">
          {session ? (
            <div className="user-profile-strip">
              <div className="user-info-text">
                <span className="nav-user-name">{session.name}</span>
                <span className="nav-user-num">{session.userNumber}</span>
              </div>
              <div className="user-nav-actions">
                <Link to="/profile" className="link-button secondary" onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>
                <button
                  className="secondary nav-auth-btn"
                  onClick={() => {
                    onLogout()
                    setMenuOpen(false)
                  }}
                >
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <div className="guest-nav-strip">
              <span className="guest-label">Browsing as Guest</span>
              <div className="guest-actions">
                <Link to="/login" className="link-button nav-auth-btn" onClick={() => setMenuOpen(false)}>
                  Log In
                </Link>
                <Link to="/register" className="link-button secondary nav-auth-btn" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
