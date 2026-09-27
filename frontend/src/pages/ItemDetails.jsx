import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getItemById, getUser, getDisputesByItemId } from '../services/data'
import DisputeModal from '../components/DisputeModal'
import './ItemDetails.css'

export default function ItemDetails({ session }) {
  const { id } = useParams()
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0)
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [feedbackMsg, setFeedbackMsg] = useState('')

  const item = getItemById(id)
  const disputes = item ? getDisputesByItemId(item.id) : []

  if (!item) {
    return (
      <div className="detail-page">
        <h1 className="page-title">Item Not Found</h1>
        <p className="page-subtitle">This item does not exist in the record system or has expired.</p>
        <Link to="/" className="link-button" style={{ marginTop: 'var(--spacing-22)' }}>
          Back to Lost Queue
        </Link>
      </div>
    )
  }

  const reporter = getUser(item.reportedByUserNumber)
  const isReporter = session && session.userNumber === item.reportedByUserNumber
  const canClaim = session && item.status === 'Lost' && !isReporter
  const hasPhotos = item.photos && item.photos.length > 0
  const activePhoto = hasPhotos ? item.photos[selectedPhotoIdx] || item.photos[0] : null

  function handleDisputeSubmitted(dispute) {
    setRefreshKey((prev) => prev + 1)
    setFeedbackMsg(`Dispute report ${dispute.reportId} successfully lodged.`)
  }

  function getDaysRemaining(expiryDate) {
    if (!expiryDate) return null
    const diff = new Date(expiryDate).getTime() - Date.now()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  const daysRemaining = item.expiryDate ? getDaysRemaining(item.expiryDate) : null

  return (
    <div className="detail-page" key={refreshKey}>
      <div className="detail-nav-bar">
        <Link to="/" className="detail-back">← Back to Search</Link>
        <div className="detail-status-pill-group">
          {item.isDisputed && <span className="status-badge disputed">DISPUTED / UNDER AUDIT</span>}
          <span className={`status-badge ${item.status.toLowerCase()}`}>{item.status} QUEUE</span>
        </div>
      </div>

      {feedbackMsg && (
        <div className="form-message" style={{ background: 'var(--color-ink-black)', color: 'var(--color-parchment)' }}>
          ✓ {feedbackMsg}
        </div>
      )}

      <div className="detail-layout">
        <div className="detail-gallery">
          {hasPhotos ? (
            <>
              <div className="detail-main-photo">
                <img src={activePhoto} alt={item.itemName} />
              </div>
              {item.photos.length > 1 && (
                <div className="detail-thumbs">
                  {item.photos.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`detail-thumb-btn ${i === selectedPhotoIdx ? 'active' : ''}`}
                      onClick={() => setSelectedPhotoIdx(i)}
                    >
                      <img src={src} alt={`${item.itemName} thumbnail ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="detail-no-photo">
              <span>No Photo Uploaded</span>
            </div>
          )}

          <div className="detail-audit-box">
            <h4>System Traceability Record</h4>
            <div><strong>Item ID:</strong> #{item.id}</div>
            <div><strong>Reported By:</strong> User {item.reportedByUserNumber || 'Anonymous'}</div>
            <div><strong>Reported Date:</strong> {new Date(item.createdAt).toLocaleDateString()}</div>
            {item.claimedByUserNumber && (
              <div><strong>Claimant Account:</strong> User {item.claimedByUserNumber}</div>
            )}
            {item.foundAt && (
              <div><strong>Claim Accepted:</strong> {new Date(item.foundAt).toLocaleString()}</div>
            )}
          </div>
        </div>

        <div className="detail-info">
          <div className="detail-title-row">
            <h1 className="detail-title">{item.itemName}</h1>
          </div>

          <dl className="detail-fields">
            <div className="detail-field">
              <dt>Category</dt>
              <dd>{item.category}</dd>
            </div>
            {item.color && (
              <div className="detail-field">
                <dt>Color</dt>
                <dd>{item.color}</dd>
              </div>
            )}
            <div className="detail-field">
              <dt>Found Location</dt>
              <dd>{item.foundLocation}</dd>
            </div>
            <div className="detail-field">
              <dt>Date Found</dt>
              <dd>{item.dateFound}</dd>
            </div>
          </dl>

          <div className="detail-description">
            <h3>Item Description</h3>
            <p>{item.description}</p>
          </div>

          {reporter && (
            <div className="detail-reporter">
              Reported by {reporter.name} (Verified Finder)
            </div>
          )}

          {/* If item is currently in Found Queue */}
          {item.status === 'Found' && (
            <div className="detail-found-notice">
              <div className="found-notice-title">Status: Claimed &amp; In Found Queue</div>
              <p>
                This item was claimed and moved to the temporary 30-day Found Queue.
                {daysRemaining !== null && ` (${daysRemaining} days remaining before automatic removal)`}
              </p>
              <div className="detail-actions">
                <button
                  type="button"
                  className="dispute-trigger-btn"
                  onClick={() => setIsDisputeModalOpen(true)}
                >
                  🚩 Raise Ownership Dispute on this Claim
                </button>
              </div>
            </div>
          )}

          {/* Active disputes listing if any */}
          {disputes.length > 0 && (
            <div className="disputes-summary-box">
              <h4>Active Dispute Inquiries ({disputes.length})</h4>
              {disputes.map((d) => (
                <div key={d.reportId} className="dispute-entry-mini">
                  <div><strong>Case {d.reportId}:</strong> {d.reason}</div>
                  <div className="dispute-meta-mini">Filed by {d.reporterName} · Status: {d.status}</div>
                </div>
              ))}
            </div>
          )}

          {/* Action to Claim if item is Lost */}
          {canClaim && (
            <div className="detail-actions">
              <Link to={`/item/${item.id}/claim`} className="link-button">
                Claim this item
              </Link>
            </div>
          )}

          {isReporter && item.status === 'Lost' && (
            <div className="detail-reporter-own">
              You reported this item. When an owner submits a claim, you will be notified in the system audit trail.
            </div>
          )}

          {!session && item.status === 'Lost' && (
            <div className="detail-actions">
              <Link to="/login" className="link-button secondary">
                Log in to claim this item
              </Link>
            </div>
          )}
        </div>
      </div>

      <DisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        item={item}
        session={session}
        onDisputeSubmitted={handleDisputeSubmitted}
      />
    </div>
  )
}
