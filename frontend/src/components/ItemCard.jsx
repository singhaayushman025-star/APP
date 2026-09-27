import { Link } from 'react-router-dom'
import './ItemCard.css'

export default function ItemCard({ item }) {
  const hasPhoto = item.photos && item.photos.length > 0
  const statusLower = (item.status || '').toLowerCase()
  const isLost = statusLower === 'lost' || !item.status
  const isFound = statusLower === 'found'

  return (
    <Link to={`/item/${item.id}`} className="item-card">
      <div className="item-card-image-wrapper">
        {hasPhoto ? (
          <img src={item.photos[0]} alt={item.itemName} className="item-card-img" />
        ) : (
          <div className="item-card-no-image">
            <span className="no-img-text">ARCHIVAL RECORD — NO PHOTOGRAPH</span>
          </div>
        )}
      </div>

      <div className="item-card-body">
        <div className="item-card-title-row">
          <h3 className="item-card-title">{item.itemName}</h3>
          {isLost ? (
            <span className="item-card-new-badge">NEW</span>
          ) : isFound ? (
            <span className="item-card-found-badge">FOUND</span>
          ) : (
            <span className="item-card-status-badge">{item.status}</span>
          )}
        </div>

        <p className="item-card-description">{item.description}</p>

        <div className="item-card-meta-row">
          <span className="meta-location">{item.foundLocation || 'Campus Central'}</span>
          <span className="meta-sep">·</span>
          <span className="meta-date">{item.dateFound}</span>
          {item.category && (
            <>
              <span className="meta-sep">·</span>
              <span className="meta-category">{item.category}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}
