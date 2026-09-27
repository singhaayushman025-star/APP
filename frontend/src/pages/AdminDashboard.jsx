import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  getAdminStats,
  getAuditLogs,
  getDisputes,
  getAllUsers,
  getAllClaims,
  getLostItems,
  getFoundItems,
  resolveDispute,
  runExpiry
} from '../services/data'
import './AdminDashboard.css'

export default function AdminDashboard({ session }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(getAdminStats)
  const [auditLogs, setAuditLogs] = useState(getAuditLogs)
  const [disputes, setDisputes] = useState(getDisputes)
  const [users, setUsers] = useState(getAllUsers)
  const [claims, setClaims] = useState(getAllClaims)
  const [lostItems, setLostItems] = useState(getLostItems)
  const [foundItems, setFoundItems] = useState(getFoundItems)
  
  const [auditFilter, setAuditFilter] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [cleanupMessage, setCleanupMessage] = useState('')

  useEffect(() => {
    refreshAllData()
  }, [])

  function refreshAllData() {
    setStats(getAdminStats())
    setAuditLogs(getAuditLogs())
    setDisputes(getDisputes())
    setUsers(getAllUsers())
    setClaims(getAllClaims())
    setLostItems(getLostItems())
    setFoundItems(getFoundItems())
  }

  function handleTriggerCleanup() {
    runExpiry()
    refreshAllData()
    setCleanupMessage('30-Day Expiry cleanup executed: checked front of Found Queue.')
    setTimeout(() => setCleanupMessage(''), 5000)
  }

  function handleResolveDispute(reportId, newStatus) {
    const notes = prompt(`Enter resolution notes for ${reportId} (Status: ${newStatus}):`, `Resolved by campus administration on ${new Date().toLocaleDateString()}`)
    if (notes !== null) {
      resolveDispute(reportId, newStatus, notes)
      refreshAllData()
    }
  }

  const filteredLogs = auditLogs.filter((log) => {
    if (!auditFilter.trim()) return true
    const q = auditFilter.toLowerCase()
    return (
      log.logId.toLowerCase().includes(q) ||
      (log.userNumber && log.userNumber.toLowerCase().includes(q)) ||
      (log.action && log.action.toLowerCase().includes(q)) ||
      (log.targetId && log.targetId.toLowerCase().includes(q)) ||
      (log.details && log.details.toLowerCase().includes(q))
    )
  })

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true
    const q = userSearch.toLowerCase()
    return (
      u.userNumber.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.toLowerCase().includes(q))
    )
  })

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <span className="admin-badge">ADMINISTRATION &amp; TRACEABILITY PORTAL</span>
          <h1 className="page-title">Campus Record Management</h1>
          <p className="page-subtitle">
            C++ DSA Queue Monitoring, Claim Verifications, Dispute Resolutions, and Complete Audit Trail.
          </p>
        </div>

        <div className="admin-quick-actions">
          <button type="button" onClick={handleTriggerCleanup} className="cleanup-btn">
            ⚡ Run 30-Day Expiry Check
          </button>
        </div>
      </div>

      {cleanupMessage && (
        <div className="form-message" style={{ background: 'var(--color-ink-black)', color: 'var(--color-parchment)' }}>
          ✓ {cleanupMessage}
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="admin-stat-grid">
        <div className="stat-card" onClick={() => setActiveTab('lost')}>
          <div className="stat-label">LOST QUEUE (ACTIVE)</div>
          <div className="stat-value">{stats.lostCount}</div>
          <div className="stat-sub">Awaiting Owner Claims</div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('found')}>
          <div className="stat-label">FOUND QUEUE (30-DAY)</div>
          <div className="stat-value">{stats.foundCount}</div>
          <div className="stat-sub">Claimed &amp; Holding</div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('disputes')}>
          <div className="stat-label">DISPUTE REPORTS</div>
          <div className="stat-value" style={{ color: stats.disputesCount > 0 ? 'var(--color-ember-orange)' : 'inherit' }}>
            {stats.disputesCount}
          </div>
          <div className="stat-sub">Ownership Inquiries</div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('users')}>
          <div className="stat-label">VERIFIED USERS</div>
          <div className="stat-value">{stats.usersCount}</div>
          <div className="stat-sub">Registered Campus Accounts</div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('claims')}>
          <div className="stat-label">TOTAL CLAIMS</div>
          <div className="stat-value">{stats.claimsCount}</div>
          <div className="stat-sub">Submitted Proofs</div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('audit')}>
          <div className="stat-label">AUDIT LOG TRAIL</div>
          <div className="stat-value">{stats.auditLogsCount}</div>
          <div className="stat-sub">Traceable Events</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview &amp; Queues
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'disputes' ? 'active' : ''}`}
          onClick={() => setActiveTab('disputes')}
        >
          Disputes ({disputes.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          Audit Trail ({auditLogs.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users Directory ({users.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('claims')}
        >
          Claims Log ({claims.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="admin-tab-pane">
          <div className="overview-queues-grid">
            <div className="queue-box">
              <div className="queue-box-header">
                <h3>Lost Queue ({lostItems.length})</h3>
                <Link to="/" className="queue-link">View Public Lost Queue →</Link>
              </div>
              <p className="queue-box-desc">
                Items reported by finders currently active in memory (<code className="code-pill">std::queue&lt;int&gt; lostQueue</code>).
              </p>
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Reported By</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lostItems.map((item) => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td>
                          <Link to={`/item/${item.id}`} className="table-item-link">
                            {item.itemName}
                          </Link>
                        </td>
                        <td>{item.category}</td>
                        <td>{item.foundLocation}</td>
                        <td>User {item.reportedByUserNumber}</td>
                        <td>{item.dateFound}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="queue-box">
              <div className="queue-box-header">
                <h3>Found Queue - 30 Days Retention ({foundItems.length})</h3>
                <Link to="/found" className="queue-link">View Public Found Queue →</Link>
              </div>
              <p className="queue-box-desc">
                Claimed items under temporary 30-day retention (<code className="code-pill">std::queue&lt;int&gt; foundQueue</code>).
              </p>
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Item Name</th>
                      <th>Claimed By</th>
                      <th>Claim Date</th>
                      <th>Expiry</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foundItems.map((item) => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td>
                          <Link to={`/item/${item.id}`} className="table-item-link">
                            {item.itemName}
                          </Link>
                        </td>
                        <td>User {item.claimedByUserNumber}</td>
                        <td>{item.foundAt ? new Date(item.foundAt).toLocaleDateString() : '—'}</td>
                        <td>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '30 Days'}</td>
                        <td>
                          {item.isDisputed ? (
                            <span className="status-badge disputed">DISPUTED</span>
                          ) : (
                            <span className="status-badge found">FOUND</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DISPUTES */}
      {activeTab === 'disputes' && (
        <div className="admin-tab-pane">
          <div className="pane-header">
            <div>
              <h3>Ownership Dispute Inquiries</h3>
              <p className="pane-desc">
                Reports submitted by users who dispute an item's claim in the Found Queue.
              </p>
            </div>
          </div>

          {disputes.length === 0 ? (
            <div className="empty-state">
              <p>No active disputes have been submitted.</p>
            </div>
          ) : (
            <div className="disputes-table-list">
              {disputes.map((d) => (
                <div key={d.reportId} className="dispute-card-admin">
                  <div className="dispute-card-header">
                    <div>
                      <span className="dispute-id-tag">{d.reportId}</span>
                      <h4 className="dispute-card-title">
                        Dispute for Item #{d.itemId} · {d.reason}
                      </h4>
                    </div>
                    <span className={`status-badge ${d.status === 'Resolved' ? 'found' : 'disputed'}`}>
                      {d.status}
                    </span>
                  </div>

                  <div className="dispute-card-meta">
                    <div><strong>Reporter:</strong> {d.reporterName} ({d.reportedByUserNumber})</div>
                    <div><strong>Contact:</strong> {d.reporterContact}</div>
                    <div><strong>Submitted:</strong> {new Date(d.createdAt).toLocaleString()}</div>
                    {d.resolvedAt && (
                      <div><strong>Resolved At:</strong> {new Date(d.resolvedAt).toLocaleString()}</div>
                    )}
                  </div>

                  <div className="dispute-evidence-box">
                    <strong>Evidence Provided:</strong>
                    <p>{d.evidenceDescription}</p>
                  </div>

                  {d.resolutionNotes && (
                    <div className="dispute-resolution-notes">
                      <strong>Resolution Notes:</strong> {d.resolutionNotes}
                    </div>
                  )}

                  <div className="dispute-admin-actions">
                    <Link to={`/item/${d.itemId}`} className="link-button secondary">
                      View Item Details
                    </Link>
                    {d.status !== 'Resolved' && (
                      <>
                        <button
                          type="button"
                          className="action-btn-green"
                          onClick={() => handleResolveDispute(d.reportId, 'Resolved - Transferred to Disputer')}
                        >
                          ✓ Approve Owner &amp; Resolve
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => handleResolveDispute(d.reportId, 'Dismissed - Insufficient Proof')}
                        >
                          Dismiss Dispute
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="admin-tab-pane">
          <div className="pane-header">
            <div>
              <h3>System Audit Trail (JSON &amp; Memory Stream)</h3>
              <p className="pane-desc">
                Chronological record of every registration, report, claim, and dispute event.
              </p>
            </div>
            <div className="audit-search">
              <input
                type="text"
                placeholder="Search audit trail by User #, Action, or Item..."
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Timestamp</th>
                  <th>User #</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.logId}>
                    <td><code className="code-pill">{log.logId}</code></td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td><strong>{log.userNumber}</strong></td>
                    <td><span className="log-action-tag">{log.action}</span></td>
                    <td>{log.targetId}</td>
                    <td className="log-details-cell">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="admin-tab-pane">
          <div className="pane-header">
            <div>
              <h3>Campus Users Directory</h3>
              <p className="pane-desc">
                Traceable user accounts generated with unique User Numbers (<code className="code-pill">std::unordered_map&lt;string, User&gt;</code>).
              </p>
            </div>
            <div className="audit-search">
              <input
                type="text"
                placeholder="Search by User #, Name, or Email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User #</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Email Verified</th>
                  <th>Registered Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.userNumber}>
                    <td><code className="code-pill">{u.userNumber}</code></td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      {u.emailVerified ? (
                        <span className="status-badge found">VERIFIED</span>
                      ) : (
                        <span className="status-badge expired">UNVERIFIED</span>
                      )}
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CLAIMS LOG */}
      {activeTab === 'claims' && (
        <div className="admin-tab-pane">
          <div className="pane-header">
            <div>
              <h3>All Submitted Claims</h3>
              <p className="pane-desc">
                Full list of ownership claims, associated claimant user numbers, and proof descriptions.
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Item ID</th>
                  <th>Claimant User #</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                  <th>Ownership Proof Description</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.claimId}>
                    <td><code className="code-pill">{c.claimId}</code></td>
                    <td>
                      <Link to={`/item/${c.itemId}`} className="table-item-link">
                        Item #{c.itemId}
                      </Link>
                    </td>
                    <td><strong>{c.userNumber}</strong></td>
                    <td>{new Date(c.submittedAt).toLocaleString()}</td>
                    <td><span className="status-badge found">{c.status}</span></td>
                    <td className="log-details-cell">{c.proofDescription || 'No description entered'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
