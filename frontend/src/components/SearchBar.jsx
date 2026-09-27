import { useState } from 'react'
import './SearchBar.css'

export default function SearchBar({ onSearch, categories, onFilter }) {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [category, setCategory] = useState('')
  const [color, setColor] = useState('')
  const [location, setLocation] = useState('')

  function handleSearch(e) {
    e.preventDefault()
    onSearch(query)
  }

  function handleFilter() {
    onFilter({ category, color, location })
  }

  function handleClear() {
    setQuery('')
    setCategory('')
    setColor('')
    setLocation('')
    onSearch('')
  }

  return (
    <div className="search-bar">
      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, category, color, location..."
        />
        <button type="submit">Search</button>
      </form>

      <div className="search-controls">
        <button
          className="secondary filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
          type="button"
        >
          {showFilters ? 'Hide filters' : 'Filters'}
        </button>
        {(query || category || color || location) && (
          <button className="secondary" onClick={handleClear} type="button">Clear</button>
        )}
      </div>

      {showFilters && (
        <div className="search-filters">
          <div className="filter-field">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label>Color</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Black"
            />
          </div>
          <div className="filter-field">
            <label>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Library"
            />
          </div>
          <button onClick={handleFilter}>Apply filters</button>
        </div>
      )}
    </div>
  )
}
