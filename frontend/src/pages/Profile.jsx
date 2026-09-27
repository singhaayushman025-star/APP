import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUser, getUserAuditLogs, getUserReports, getUserClaims } from '../services/data'
import './Profile.css'

export default function Profile({ session, onLogout }) {
  const [user, setUser] = useState(null)
  const [logs, setLogs] = useState([])
  const [reportsCount, setReportsCount] = useState(0)
  const [claimsCount, setClaimsCount] = useState(0)

  useEffect(() => {
    if (session) {
      const u = getUser(session.userNumber)
      setUser(u)
      setLogs(getUserAuditLogs(session.userNumber))
      setReportsCount(getUserReports(session.userNumber).length)
      setClaimsCount(getUserClaims(session.userNumber).length)
    }
  }, [session])

  if (!session || !user) {
    return (
      <div className="auth-page">
        <h1 className="page-title">User Profile</h1>
        <p>Please log in to view your profile and system activity.</p>
        <Link to="/login" className="link-button" style={{ marginTop: 'var(--spacing-22)' }}>
          Log In
        </Link>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <span className="profile-badge">VERIFIED CAMPUS ACCOUNT</span>
        <h1 className="page-title">{user.name}</h1>
        <p className="page-subtitle">Unique User Identifier: <code className="code-pill">{user.userNumber}</code></p>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <h3>Account Information</h3>
          <dl className="profile-dl">
            <div>
              <dt>Full Name</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>User Number</dt>
              <dd><code className="code-pill">{user.userNumber}</code></dd>
            </div>
            <div>
              <dt>Email Address</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Phone Number</dt>
              <dd>{user.phone || 'Not provided'}</dd>
            </div>
            <div>
              <dt>Verification Status</dt>
              <dd>
                {user.emailVerified ? (
                  <span className="status-badge found">✓ EMAIL VERIFIED</span>
                ) : (
                  <span className="status-badge expired">UNVERIFIED</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Account Created</dt>
              <dd>{new Date(user.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>

          <div className="profile-actions">
            <button type="button" className="secondary" onClick={onLogout}>
              Log Out
            </button>
          </div>
        </div>

        <div className="profile-card">
          <h3>Activity Summary</h3>
          <div className="profile-metrics">
            <Link to="/my-reports" className="metric-box">
              <div className="metric-num">{reportsCount}</div>
              <div className="metric-name">Items Reported →</div>
            </Link>
            <Link to="/my-claims" className="metric-box">
              <div className="metric-num">{claimsCount}</div>
              <div className="metric-name">Claims Submitted →</div>
            </Link>
          </div>

          <h3 style={{ marginTop: 'var(--spacing-22)' }}>Personal Audit Trail</h3>
          <p className="profile-audit-desc">Actions performed under your User Number:</p>
          
          {logs.length === 0 ? (
            <p className="no-logs">No logged actions recorded yet.</p>
          ) : (
            <div className="profile-log-list">
              {logs.map((log) => (
                <div key={log.logId} className="profile-log-item">
                  <div className="log-top">
                    <span className="log-action-tag">{log.action}</span>
                    <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="log-detail-text">{log.details || log.targetId}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
