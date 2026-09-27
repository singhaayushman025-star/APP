import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { reportItem, getCategories, compressImage } from '../services/data'
import './ReportItem.css'

const PRESET_SAMPLE_PHOTOS = [
  { label: 'Leather Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=700&auto=format&fit=crop&q=80' },
  { label: 'AirPods / Earbuds', url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=700&auto=format&fit=crop&q=80' },
  { label: 'Keys & Lanyard', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=700&auto=format&fit=crop&q=80' },
  { label: 'Water Bottle / Flask', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=700&auto=format&fit=crop&q=80' },
  { label: 'Wristwatch', url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=700&auto=format&fit=crop&q=80' },
  { label: 'Backpack / Bag', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&auto=format&fit=crop&q=80' },
  { label: 'Laptop Charger', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=80' },
  { label: 'Sunglasses', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700&auto=format&fit=crop&q=80' },
]

export default function ReportItem({ session }) {
  const [itemName, setItemName] = useState('')
  const [category, setCategory] = useState('')
  const [color, setColor] = useState('')
  const [description, setDescription] = useState('')
  const [foundLocation, setFoundLocation] = useState('')
  const [dateFound, setDateFound] = useState(new Date().toISOString().split('T')[0])
  const [photos, setPhotos] = useState([])
  const [customPhotoUrl, setCustomPhotoUrl] = useState('')
  const [isCompressing, setIsCompressing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const categories = getCategories()

  async function handlePhotoUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return

    setIsCompressing(true)
    setError('')

    try {
      const processed = []
      for (const file of files) {
        // Compress using HTML5 Canvas to prevent localStorage quota exhaustion
        const dataUrl = await compressImage(file, 800, 800, 0.75)
        if (dataUrl) {
          processed.push(dataUrl)
        }
      }
      setPhotos((prev) => [...prev, ...processed].slice(0, 5))
    } catch (err) {
      console.error('Photo processing error:', err)
      setError('Could not process some uploaded images. Please try smaller photos.')
    } finally {
      setIsCompressing(false)
      // Reset the file input value so user can re-select same file if desired
      e.target.value = ''
    }
  }

  function handleAddPresetPhoto(url) {
    if (photos.includes(url)) return
    if (photos.length >= 5) {
      setError('Maximum 5 photos allowed per item report.')
      return
    }
    setPhotos((prev) => [...prev, url])
  }

  function handleAddUrlPhoto() {
    if (!customPhotoUrl.trim()) return
    if (photos.length >= 5) {
      setError('Maximum 5 photos allowed per item report.')
      return
    }
    setPhotos((prev) => [...prev, customPhotoUrl.trim()])
    setCustomPhotoUrl('')
  }

  function removePhoto(index) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!itemName.trim()) {
      setError('Item name is required.')
      return
    }
    if (!category) {
      setError('Please select an item category.')
      return
    }
    if (!foundLocation.trim()) {
      setError('Please specify where the item was found.')
      return
    }
    if (!description.trim()) {
      setError('Please enter a description for the item.')
      return
    }
    if (!dateFound) {
      setError('Please provide the date when the item was found.')
      return
    }

    setIsSubmitting(true)

    const userNumber = session ? session.userNumber : 'GUEST'

    const result = reportItem({
      itemName: itemName.trim(),
      category: category.trim(),
      color: color.trim(),
      description: description.trim(),
      foundLocation: foundLocation.trim(),
      dateFound,
      photos,
      reportedByUserNumber: userNumber,
    })

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    // Success: navigate to the item's details page
    navigate(`/item/${result.item.id}`)
  }

  return (
    <div className="report-page">
      <div className="report-header">
        <span className="report-badge">NEW ENTRY · LOST QUEUE</span>
        <h1 className="page-title">Report a Found Item</h1>
        <p className="page-subtitle">
          Found something on campus? Register the details here so the verified owner can identify and claim it.
        </p>
      </div>

      {error && <div className="form-message error">{error}</div>}

      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="report-name">Item Name *</label>
            <input
              id="report-name"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Black Leather Wallet, Apple AirPods Pro"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="report-category">Category *</label>
            <select
              id="report-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="report-color">Primary Color</label>
            <input
              id="report-color"
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Matte Black, Silver, Navy Blue"
            />
          </div>
          <div className="form-group">
            <label htmlFor="report-date">Date Found *</label>
            <input
              id="report-date"
              type="date"
              value={dateFound}
              onChange={(e) => setDateFound(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="report-location">Where was it found? (Specific Location) *</label>
          <input
            id="report-location"
            type="text"
            value={foundLocation}
            onChange={(e) => setFoundLocation(e.target.value)}
            placeholder="e.g. Central Library 2nd Floor, Table #14"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="report-description">Description &amp; Key Details *</label>
          <textarea
            id="report-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe condition, brand, visible features, key marks. Note: Keep sensitive hidden details (e.g. exact cash amount or lock combination) for ownership verification."
            required
          />
        </div>

        <div className="form-group report-photo-section">
          <label htmlFor="report-photos">Item Photos (Upload or Pick Standard Asset)</label>
          
          <div className="photo-upload-controls">
            <label className="custom-file-upload">
              <input
                id="report-photos"
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                disabled={isCompressing || photos.length >= 5}
              />
              {isCompressing ? '⚡ Compressing Photos...' : '📁 Choose Image Files from Device'}
            </label>
            <span className="photo-count-indicator">({photos.length}/5 photos attached)</span>
          </div>

          <div className="preset-photos-container">
            <span className="preset-photos-label">Or quick attach a sample photo:</span>
            <div className="preset-pills">
              {PRESET_SAMPLE_PHOTOS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="preset-pill-btn"
                  onClick={() => handleAddPresetPhoto(preset.url)}
                >
                  + {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="photo-url-row">
            <input
              type="url"
              placeholder="Or paste an image URL here..."
              value={customPhotoUrl}
              onChange={(e) => setCustomPhotoUrl(e.target.value)}
            />
            <button type="button" className="secondary url-add-btn" onClick={handleAddUrlPhoto}>
              Add URL
            </button>
          </div>

          {photos.length > 0 && (
            <div className="photo-previews-grid">
              {photos.map((src, i) => (
                <div key={i} className="photo-preview-item">
                  <img src={src} alt={`Item Preview ${i + 1}`} />
                  <button
                    type="button"
                    className="photo-remove-btn"
                    onClick={() => removePhoto(i)}
                    title="Remove this photo"
                  >
                    ✕
                  </button>
                  <span className="photo-index-tag">Photo #{i + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting || isCompressing}>
            {isSubmitting ? 'Publishing Report to Queue...' : 'Submit Report to Lost Queue'}
          </button>
          <button type="button" className="secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
