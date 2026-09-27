import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getItemById, submitClaim } from '../services/data'

export default function ClaimItem({ session }) {
  const { id } = useParams()
  const item = getItemById(id)
  const navigate = useNavigate()

  const [proofDescription, setProofDescription] = useState('')
  const [error, setError] = useState('')

  if (!item) {
    return (
      <div className="auth-page">
        <h1 className="page-title">Item not found</h1>
        <Link to="/" className="link-button">Back to search</Link>
      </div>
    )
  }

  if (item.status !== 'Lost') {
    return (
      <div className="auth-page">
        <h1 className="page-title">Item unavailable</h1>
        <p>This item has already been claimed or is no longer available.</p>
        <Link to={`/item/${id}`} className="link-button" style={{ marginTop: 'var(--spacing-22)', display: 'inline-block' }}>View item</Link>
      </div>
    )
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!proofDescription.trim()) {
      setError('Please describe how you can prove ownership.')
      return
    }

    const result = submitClaim({
      itemId: item.id,
      userNumber: session.userNumber,
      proofDescription,
      proofFiles: [],
    })

    if (result.error) {
      setError(result.error)
      return
    }

    navigate('/my-claims')
  }

  return (
    <div className="auth-page">
      <Link to={`/item/${id}`} className="detail-back" style={{ display: 'inline-block', marginBottom: 'var(--spacing-22)', fontSize: 'var(--text-caption)', color: 'var(--color-charcoal)' }}>Back to item</Link>

      <h1 className="page-title">Claim: {item.itemName}</h1>
      <p className="page-subtitle">
        Provide information that proves this item belongs to you.
        Only the real owner should know certain details about the item.
      </p>

      {error && <div className="form-message error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="claim-proof">Ownership proof *</label>
          <textarea
            id="claim-proof"
            value={proofDescription}
            onChange={(e) => setProofDescription(e.target.value)}
            rows={5}
            placeholder="Describe identifying details only the owner would know: serial number, hidden markings, specific contents, purchase receipt details, unique stickers or damage, etc."
            style={{ resize: 'vertical', minHeight: '120px' }}
          />
        </div>

        <div className="form-actions">
          <button type="submit">Submit claim</button>
          <button type="button" className="secondary" onClick={() => navigate(`/item/${id}`)}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
