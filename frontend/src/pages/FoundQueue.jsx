import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getFoundItems } from '../services/data'
import DisputeModal from '../components/DisputeModal'
import './FoundQueue.css'

export default function FoundQueue({ session }) {
  const [items, setItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItemForDispute, setSelectedItemForDispute] = useState(null)
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  useEffect(() => {
    refreshItems()
  }, [])

  function refreshItems() {
    setItems(getFoundItems())
  }

  function handleOpenDispute(item, e) {
    if (e) e.stopPropagation()
    setSelectedItemForDispute(item)
    setIsDisputeModalOpen(true)
  }

  function handleDisputeSubmitted(dispute) {
    refreshItems()
    setAlertMessage(`Dispute ${dispute.reportId} successfully recorded for ${dispute.reporterName}. Campus audit team notified.`)
    setTimeout(() => setAlertMessage(''), 8000)
  }

  function getRemainingDays(expiryDate) {
    if (!expiryDate) return '30 days'
    const diffMs = new Date(expiryDate).getTime() - Date.now()
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    if (days <= 0) return 'Expiring today'
    if (days === 1) return '1 day remaining'
    return `${days} days remaining`
  }

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      item.itemName.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.foundLocation && item.foundLocation.toLowerCase().includes(q)) ||
      (item.claimedByUserNumber && item.claimedByUserNumber.toLowerCase().includes(q))
    )
  })

  return (
    <div className="found-queue-page">
      <div className="found-header">
        <span className="found-badge">30-DAY RETENTION QUEUE · AUDIT VERIFIED</span>
        <h1 className="page-title">Found Queue</h1>
        <p className="page-subtitle">
          These items have been claimed by verified users. Each record is retained for exactly 30 days
          for traceability and ownership dispute verification before automatic removal.
        </p>
      </div>

      {alertMessage && (
        <div className="found-alert-banner">
          <span className="alert-icon">✓</span>
          <span>{alertMessage}</span>
        </div>
      )}

      <div className="found-info-box">
        <div className="info-icon">⚖</div>
        <div className="info-content">
          <h4>Was your lost item claimed by the wrong person?</h4>
          <p>
            You can raise an <strong>Ownership Dispute Report</strong> on any item listed below.
            Every claim is permanently connected to the claimant’s verified user number for investigation.
          </p>
        </div>
      </div>

      <div className="found-search-bar">
        <input
          type="text"
          placeholder="Filter claimed items by name, category, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button type="button" className="secondary" onClick={() => setSearchQuery('')}>
            Clear
          </button>
        )}
      </div>

      <div className="found-meta-bar">
        <span className="found-count-tag">
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} in 30-Day Queue
        </span>
        <span className="found-fifo-note">FIFO Queue order: Earliest claimed to latest</span>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <p>{searchQuery ? 'No claimed items match your search filter.' : 'The Found Queue is currently empty.'}</p>
          <Link to="/" className="link-button">Search Lost Queue</Link>
        </div>
      ) : (
        <div className="found-items-list">
          {filteredItems.map((item) => {
            const hasPhoto = item.photos && item.photos.length > 0
            const daysLeft = getRemainingDays(item.expiryDate)

            return (
              <div key={item.id} className="found-item-card">
                <div className="found-card-media">
                  {hasPhoto ? (
                    <img src={item.photos[0]} alt={item.itemName} />
                  ) : (
                    <div className="found-no-media">No Photo</div>
                  )}
                  <span className="retention-pill">⏱ {daysLeft}</span>
                </div>

                <div className="found-card-body">
                  <div className="found-card-top">
                    <div>
                      <Link to={`/item/${item.id}`} className="found-item-name">
                        {item.itemName}
                      </Link>
                      <span className="found-item-id">Item #{item.id}</span>
                    </div>

                    <div className="found-badges-group">
                      {item.isDisputed && (
                        <span className="status-badge disputed">DISPUTED</span>
                      )}
                      <span className="status-badge found">CLAIMED</span>
                    </div>
                  </div>

                  <p className="found-card-desc">{item.description}</p>

                  <div className="found-card-details-grid">
                    <div><strong>Category:</strong> {item.category}</div>
                    <div><strong>Location:</strong> {item.foundLocation}</div>
                    <div><strong>Date Found:</strong> {item.dateFound}</div>
                    <div><strong>Claimed By:</strong> User {item.claimedByUserNumber || 'Verified Account'}</div>
                    <div><strong>Claim Date:</strong> {item.foundAt ? new Date(item.foundAt).toLocaleDateString() : 'Recorded'}</div>
                    <div><strong>Expiry Date:</strong> {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '30 Days'}</div>
                  </div>

                  <div className="found-card-actions">
                    <Link to={`/item/${item.id}`} className="link-button secondary">
                      View Full Details
                    </Link>
                    
                    <button
                      type="button"
                      className="dispute-trigger-btn"
                      onClick={(e) => handleOpenDispute(item, e)}
                    >
                      🚩 Report Claim / Dispute Ownership
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Dispute Modal */}
      <DisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        item={selectedItemForDispute}
        session={session}
        onDisputeSubmitted={handleDisputeSubmitted}
      />
    </div>
  )
}
