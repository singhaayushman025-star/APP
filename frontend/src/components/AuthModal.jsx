import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './AuthModal.css'

export default function AuthModal({ isOpen, onClose }) {
  const navigate = useNavigate()

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleNavigate(path) {
    onClose()
    navigate(path)
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="auth-modal-close"
          onClick={onClose}
          aria-label="Close dialog"
          title="Close and continue as guest"
        >
          ✕
        </button>

        <div className="auth-modal-badge">CAMPUS NOTICE · PUBLIC REPOSITORY</div>

        <h2 className="auth-modal-title">LOST &amp; FOUND SYSTEM</h2>

        <p className="auth-modal-intro">
          Join our verified network to report found belongings, submit ownership claims with proof,
          and track recovery in real-time.
        </p>

        <div className="auth-modal-features">
          <div className="auth-modal-feature-item">
            <span className="feature-icon">✦</span>
            <span><strong>Report Found Items:</strong> Upload photos &amp; enter items into the public Lost Queue.</span>
          </div>
          <div className="auth-modal-feature-item">
            <span className="feature-icon">✦</span>
            <span><strong>Claim Belongings:</strong> Verified owners submit ownership proof for immediate claim review.</span>
          </div>
          <div className="auth-modal-feature-item">
            <span className="feature-icon">✦</span>
            <span><strong>Audit &amp; Traceability:</strong> Every action is linked to a verified user number for safety.</span>
          </div>
        </div>

        <div className="auth-modal-actions">
          <button
            className="auth-modal-primary-btn"
            onClick={() => handleNavigate('/login')}
          >
            Log In to Account
          </button>
          
          <button
            className="auth-modal-secondary-btn"
            onClick={() => handleNavigate('/register')}
          >
            Create New Account
          </button>
        </div>

        <div className="auth-modal-guest-option">
          <button
            type="button"
            className="auth-modal-guest-btn"
            onClick={onClose}
          >
            Continue as Guest (Browse Only) →
          </button>
        </div>

        <div className="auth-modal-footer-note">
          Note: You can explore and search items as a guest. Logging in is only required when submitting reports, claims, or disputes.
        </div>
      </div>
    </div>
  )
}
