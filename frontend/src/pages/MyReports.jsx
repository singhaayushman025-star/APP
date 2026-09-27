import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUserReports } from '../services/data'
import ItemCard from '../components/ItemCard'

export default function MyReports({ session }) {
  const [reports, setReports] = useState([])

  useEffect(() => {
    setReports(getUserReports(session.userNumber))
  }, [session.userNumber])

  return (
    <div>
      <h1 className="page-title">My reports</h1>

      {reports.length === 0 ? (
        <div className="empty-state">
          <p>You have not reported any items yet.</p>
          <Link to="/report" className="link-button">Report a found item</Link>
        </div>
      ) : (
        <div className="item-grid">
          {reports.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
