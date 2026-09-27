import { useState, useEffect } from 'react'
import { raiseClaimDispute, compressImage } from '../services/data'
import './DisputeModal.css'

export default function DisputeModal({ isOpen, onClose, item, session, onDisputeSubmitted }) {
  const [reason, setReason] = useState('I am the rightful owner (False Claim / Wrong Person)')
  const [evidenceDescription, setEvidenceDescription] = useState('')
  const [reporterName, setReporterName] = useState('')
  const [reporterContact, setReporterContact] = useState('')
  const [proofPhotos, setProofPhotos] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submittedCase, setSubmittedCase] = useState(null)

  useEffect(() => {
    if (session) {
      setReporterName(session.name || '')
      setReporterContact(session.email || '')
    } else {
      setReporterName('')
      setReporterContact('')
    }
    setError('')
    setSubmittedCase(null)
  }, [session, isOpen])

  if (!isOpen || !item) return null

  async function handlePhotoUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const compressed = []
    for (const f of files) {
      try {
        const dataUrl = await compressImage(f, 600, 600, 0.7)
        if (dataUrl) compressed.push(dataUrl)
      } catch (err) {
        console.warn('Error compressing photo:', err)
      }
    }
    setProofPhotos((prev) => [...prev, ...compressed].slice(0, 3))
  }

  function removePhoto(idx) {
    setProofPhotos((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!evidenceDescription.trim()) {
      setError('Please provide details explaining why you are disputing this claim and how you can prove ownership.')
      return
    }

    if (!reporterName.trim() || !reporterContact.trim()) {
      setError('Please provide your name and contact information for verification.')
      return
    }

    setSubmitting(true)

    const result = raiseClaimDispute({
      itemId: item.id,
      claimId: item.claimedByUserNumber ? `CLAIM_${item.claimedByUserNumber}` : '',
      userNumber: session ? session.userNumber : 'GUEST',
      reporterName,
      reporterContact,
      reason,
      evidenceDescription,
      proofFiles: proofPhotos,
    })

    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setSubmittedCase(result.dispute)
    if (onDisputeSubmitted) {
      onDisputeSubmitted(result.dispute)
    }
  }

  return (
    <div className="dispute-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="dispute-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="dispute-modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {submittedCase ? (
          <div className="dispute-success-box">
            <div className="dispute-success-badge">DISPUTE LODGED IN AUDIT SYSTEM</div>
            <h2 className="dispute-success-title">Report Case: {submittedCase.reportId}</h2>
            <p className="dispute-success-text">
              Your dispute report for <strong>{item.itemName} (Item #{item.id})</strong> has been recorded in the permanent audit trail.
            </p>
            <div className="dispute-meta-card">
              <div><strong>Case ID:</strong> {submittedCase.reportId}</div>
              <div><strong>Status:</strong> {submittedCase.status}</div>
              <div><strong>Item:</strong> {item.itemName} (#{item.id})</div>
              <div><strong>Claimed User:</strong> {item.claimedByUserNumber || 'Recorded in Claim Log'}</div>
              <div><strong>Timestamp:</strong> {new Date(submittedCase.createdAt).toLocaleString()}</div>
            </div>
            <p className="dispute-followup-text">
              The campus administration and security desk will review the ownership proof and audit records against the claimant’s record.
            </p>
            <div className="dispute-actions">
              <button onClick={onClose} className="dispute-primary-btn">
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="dispute-header-badge">DISPUTE &amp; CLAIM AUDIT</div>
            <h2 className="dispute-title">Report / Dispute Claim</h2>
            <p className="dispute-subtitle">
              Item <strong>{item.itemName}</strong> (#{item.id}) is currently recorded as claimed in the Found Queue.
              Submit a formal dispute if you are the rightful owner or notice suspicious activity.
            </p>

            {error && <div className="form-message error">{error}</div>}

            <form onSubmit={handleSubmit} className="dispute-form">
              <div className="form-group">
                <label htmlFor="dispute-reason">Reason for Dispute *</label>
                <select
                  id="dispute-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="I am the rightful owner (False Claim / Wrong Person)">I am the rightful owner (False Claim / Wrong Person)</option>
                  <option value="Fraudulent / suspicious ownership proof provided">Fraudulent / suspicious ownership proof provided</option>
                  <option value="Found location or item description discrepancy">Found location or item description discrepancy</option>
                  <option value="Item was never actually received / returned">Item was never actually received / returned</option>
                  <option value="Other ownership dispute">Other ownership dispute</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dispute-name">Your Full Name *</label>
                  <input
                    id="dispute-name"
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="dispute-contact">Your Email or Phone *</label>
                  <input
                    id="dispute-contact"
                    type="text"
                    value={reporterContact}
                    onChange={(e) => setReporterContact(e.target.value)}
                    placeholder="e.g. user@campus.edu or +91..."
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="dispute-evidence">Counter-Evidence &amp; Ownership Proof *</label>
                <textarea
                  id="dispute-evidence"
                  rows={4}
                  value={evidenceDescription}
                  onChange={(e) => setEvidenceDescription(e.target.value)}
                  placeholder="Provide concrete evidence that only the true owner would know: serial number, hidden markings, contents, exact time/place lost, purchase receipt details..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dispute-photos">Attach Proof Document / Photos (Optional, max 3)</label>
                <input
                  id="dispute-photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="file-input"
                />
                {proofPhotos.length > 0 && (
                  <div className="dispute-proof-previews">
                    {proofPhotos.map((src, idx) => (
                      <div key={idx} className="dispute-thumb-container">
                        <img src={src} alt={`Proof ${idx + 1}`} />
                        <button
                          type="button"
                          className="thumb-remove-btn"
                          onClick={() => removePhoto(idx)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="dispute-actions">
                <button type="submit" disabled={submitting} className="dispute-primary-btn">
                  {submitting ? 'Submitting Report...' : 'Submit Dispute Report'}
                </button>
                <button type="button" onClick={onClose} className="secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
