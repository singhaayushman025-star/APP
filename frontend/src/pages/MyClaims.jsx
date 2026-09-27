import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUserClaims, getItemById } from '../services/data'

export default function MyClaims({ session }) {
  const [claims, setClaims] = useState([])

  useEffect(() => {
    setClaims(getUserClaims(session.userNumber))
  }, [session.userNumber])

  return (
    <div>
      <h1 className="page-title">My claims</h1>

      {claims.length === 0 ? (
        <div className="empty-state">
          <p>You have not submitted any claims yet.</p>
          <Link to="/" className="link-button">Search for your item</Link>
        </div>
      ) : (
        <div className="claims-list">
          {claims.map((claim) => {
            const item = getItemById(claim.itemId)
            return (
              <div key={claim.claimId} className="claim-row">
                <div className="claim-row-main">
                  <div>
                    <Link to={`/item/${claim.itemId}`} className="claim-item-name">
                      {item ? item.itemName : `Item #${claim.itemId}`}
                    </Link>
                    <div className="claim-meta">
                      Claim {claim.claimId} · Submitted {new Date(claim.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`status-badge ${claim.status.toLowerCase()}`}>{claim.status}</span>
                </div>
                {claim.proofDescription && (
                  <div className="claim-proof">
                    <strong>Your proof:</strong> {claim.proofDescription}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
