import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../services/data'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [unverified, setUnverified] = useState(null)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setUnverified(null)

    if (!email || !password) {
      setError('Please fill in both fields.')
      return
    }

    const result = loginUser(email, password)
    if (result.error) {
      setError(result.error)
      if (result.unverified) {
        setUnverified(result.userNumber)
      }
      return
    }

    onLogin(result.session)
    navigate('/')
  }

  return (
    <div className="auth-page">
      <h1 className="page-title">Log in</h1>

      {error && (
        <div className="form-message error">
          {error}
          {unverified && (
            <> <Link to={`/verify-email/${unverified}`}>Verify your email</Link></>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <div className="form-actions">
          <button type="submit">Log in</button>
        </div>
      </form>

      <p className="auth-switch">
        No account yet? <Link to="/register">Create one</Link>
      </p>
    </div>
  )
}
