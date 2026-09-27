import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { verifyEmail, getUser, setSession } from '../services/data'

export default function VerifyEmail({ onLogin }) {
  const { userNumber } = useParams()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  const user = getUser(userNumber)

  // Show the code in the UI for the mock (since there is no real email)
  const mockCode = user ? user.verificationCode : null

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const result = verifyEmail(userNumber, code)
    if (result.error) {
      setError(result.error)
      return
    }

    setDone(true)
    const session = { userNumber: result.user.userNumber, name: result.user.name, email: result.user.email }
    setSession(session)
    onLogin(session)
  }

  if (!user) {
    return (
      <div className="auth-page">
        <h1 className="page-title">Verify email</h1>
        <div className="form-message error">User not found.</div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="auth-page">
        <h1 className="page-title">Email verified</h1>
        <p>Your email has been verified. Your account is now active.</p>
        <div className="form-actions">
          <button onClick={() => navigate('/')}>Go to home</button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <h1 className="page-title">Verify email</h1>
      <p>A verification code was sent to <strong>{user.email}</strong>.</p>

      {mockCode && (
        <div className="form-message">
          Since this is a local demo, your code is: <strong>{mockCode}</strong>
        </div>
      )}

      {error && <div className="form-message error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="verify-code">Verification code</label>
          <input
            id="verify-code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
          />
        </div>
        <div className="form-actions">
          <button type="submit">Verify</button>
        </div>
      </form>
    </div>
  )
}
