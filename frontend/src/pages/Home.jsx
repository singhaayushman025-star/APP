import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getLostItems, searchItems, filterItems, getCategories } from '../services/data'
import SearchBar from '../components/SearchBar'
import ItemCard from '../components/ItemCard'
import './Home.css'

export default function Home({ session, onOpenAuthModal }) {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [searched, setSearched] = useState(false)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('')

  useEffect(() => {
    setItems(getLostItems())
    setCategories(getCategories())
  }, [])

  function handleSearch(query) {
    setActiveCategoryFilter('')
    if (!query.trim()) {
      setItems(getLostItems())
      setSearched(false)
      return
    }
    setItems(searchItems(query))
    setSearched(true)
  }

  function handleFilter({ category, color, location }) {
    setActiveCategoryFilter(category || '')
    if (!category && !color && !location) {
      setItems(getLostItems())
      setSearched(false)
      return
    }
    setItems(filterItems({ category, color, location }))
    setSearched(true)
  }

  function handleCategoryClick(cat) {
    if (activeCategoryFilter === cat) {
      setActiveCategoryFilter('')
      setItems(getLostItems())
      setSearched(false)
    } else {
      setActiveCategoryFilter(cat)
      setItems(filterItems({ category: cat }))
      setSearched(true)
    }
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Spotlight items for the 3-column header strip
  const spotlightLeft = items[0] || {
    id: 101,
    itemName: 'Vintage Leather Notebook',
    photos: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=700&auto=format&fit=crop&q=80'],
    foundLocation: 'Library 2nd Floor',
    dateFound: 'Recent intake'
  }

  const spotlightRight = items[1] || {
    id: 102,
    itemName: 'Apple AirPods Pro In Case',
    photos: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=700&auto=format&fit=crop&q=80'],
    foundLocation: 'Cafeteria Booth #6',
    dateFound: 'Recent intake'
  }

  return (
    <div className="home-page">
      {/* 1. Vintage Broadsheet Masthead / Dateline Strip */}
      <div className="broadsheet-masthead">
        <div className="masthead-top-row">
          <span className="masthead-tag">CAMPUS ARCHIVES &amp; DISPATCH</span>
          <span className="masthead-vol">VOL. CXIV — NO. 42</span>
          <span className="masthead-edition">DAILY PUBLIC REGISTER</span>
          <span className="masthead-date">{currentDate}</span>
        </div>
        <div className="masthead-double-rule"></div>
      </div>

      {/* 2. Three-Column Section Header (Image — Type — Image) */}
      <section className="broadsheet-three-col-hero">
        {/* Left Spotlight Image Card */}
        <div className="hero-spotlight-card left">
          <div className="hero-spotlight-image-box">
            <img
              src={spotlightLeft.photos?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=700&auto=format&fit=crop&q=80'}
              alt={spotlightLeft.itemName}
              className="hero-spotlight-img"
            />
          </div>
          <div className="hero-spotlight-caption">
            <span className="spotlight-tag">ARCHIVAL SPOTLIGHT</span>
            <h4 className="spotlight-title">{spotlightLeft.itemName}</h4>
            <span className="spotlight-loc">{spotlightLeft.foundLocation}</span>
          </div>
        </div>

        {/* Center Type Showcase & Stamp Seal Accent */}
        <div className="hero-center-column">
          <div className="center-seal-wrapper">
            {/* Stamp Seal Illustration per DESIGN.md */}
            <div className="stamp-seal-badge">
              <div className="stamp-perforation-border">
                <div className="stamp-inner">
                  <div className="stamp-sunburst-icon">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="4" fill="var(--color-ember-orange)" stroke="var(--color-ink-black)"/>
                      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke="var(--color-ember-orange)"/>
                    </svg>
                  </div>
                  <div className="stamp-text-meta">
                    <span className="stamp-series">SERIES 2026</span>
                    <span className="stamp-title">OFFICIAL ARCHIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h1 className="hero-center-heading">ALL ARTICLES!</h1>
          <p className="hero-center-subhead">
            A centralized broadsheet ledger for all misplaced and discovered possessions across university grounds.
          </p>

          <div className="hero-cta-buttons">
            <Link to="/report" className="link-button hero-report-btn">
              + Report Found Item
            </Link>
            <Link to="/found" className="link-button secondary">
              30-Day Vault Queue &rarr;
            </Link>
          </div>
        </div>

        {/* Right Spotlight Image Card */}
        <div className="hero-spotlight-card right">
          <div className="hero-spotlight-image-box">
            <img
              src={spotlightRight.photos?.[0] || 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=700&auto=format&fit=crop&q=80'}
              alt={spotlightRight.itemName}
              className="hero-spotlight-img"
            />
          </div>
          <div className="hero-spotlight-caption">
            <span className="spotlight-tag">ARCHIVAL SPOTLIGHT</span>
            <h4 className="spotlight-title">{spotlightRight.itemName}</h4>
            <span className="spotlight-loc">{spotlightRight.foundLocation}</span>
          </div>
        </div>
      </section>

      {/* 3. Full-Width Display Banner Block (Canopee oversized display) */}
      <section className="broadsheet-display-banner">
        <div className="display-banner-inner">
          <span className="display-banner-title">LOST &amp; FOUND</span>
        </div>
      </section>

      {/* 4. Drop Cap Bio / Institutional Intro Block */}
      <section className="broadsheet-dropcap-block">
        <div className="dropcap-col-left">
          <p className="dropcap-paragraph">
            <span className="dropcap-letter">E</span>very article discovered across lecture theatres, study halls, laboratories, and grounds is immediately recorded into the permanent campus ledger. Unclaimed property is retained in our active Lost Queue under rigorous chain-of-custody protocols before migrating into the secure 30-day vault.
          </p>
          <p className="dropcap-sub-paragraph">
            Owners may inspect active postings, submit verified claims with distinguishing proof, or track resolution status through our central audit registry.
          </p>
        </div>

        <div className="dropcap-col-right">
          <h2 className="dropcap-headline">
            CENTRALIZED REPOSITORY FOR CAMPUS POSSESSIONS &amp; LOST ARTICLES.
          </h2>
          <div className="dropcap-signature-row">
            <span className="signature-mark">— The Custody Office &amp; Verification Desk</span>
            <span className="signature-loc">Amsterdam / Central Custody Division</span>
          </div>
        </div>
      </section>

      {/* Guest Notice Strip */}
      {!session && (
        <div className="home-guest-banner">
          <div className="guest-banner-left">
            <span className="guest-badge">GUEST MODE</span>
            <span className="guest-text">Browsing public repository. You may search and filter freely.</span>
          </div>
          <button type="button" className="guest-login-link-btn" onClick={onOpenAuthModal}>
            Log In / Register for Claims &amp; Disputes &rarr;
          </button>
        </div>
      )}

      {/* 5. Category Filter Strip */}
      <section className="broadsheet-filter-section">
        <div className="category-strip-header">
          <span className="category-strip-label">Filter Registry by Category:</span>
        </div>
        <div className="category-pills">
          <button
            type="button"
            className={`category-pill-btn ${!activeCategoryFilter ? 'active' : ''}`}
            onClick={() => handleCategoryClick('')}
          >
            All Categories ({items.length})
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`category-pill-btn ${activeCategoryFilter === c ? 'active' : ''}`}
              onClick={() => handleCategoryClick(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* 6. Search Bar */}
      <SearchBar onSearch={handleSearch} categories={categories} onFilter={handleFilter} />

      {/* 7. Active Lost Queue Section Header */}
      <div className="home-section-header">
        <div className="header-titles">
          <h2 className="section-main-heading">
            {searched
              ? (activeCategoryFilter ? `${activeCategoryFilter.toUpperCase()} ARCHIVES` : 'SEARCH RESULTS')
              : 'ACTIVE LOST QUEUE'}
          </h2>
          <span className="queue-subtext">Verified articles awaiting owner claims &amp; identification</span>
        </div>
        <div className="header-meta-count">
          <span className="count-number">{items.length}</span>
          <span className="count-label">{items.length === 1 ? 'ARTICLE RECORDED' : 'ARTICLES RECORDED'}</span>
        </div>
      </div>

      {/* 8. 3-Column Item Grid */}
      {items.length > 0 ? (
        <div className="item-grid broadsheet-grid">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="empty-state broadsheet-empty">
          <div className="empty-seal">∅</div>
          <p className="empty-title">
            {searched
              ? 'No archival records match your filter criteria.'
              : 'The Lost Queue is currently clear. No pending articles.'}
          </p>
          <div className="empty-actions">
            <Link to="/report" className="link-button hero-report-btn">
              + Report a Found Article
            </Link>
            {searched && (
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setItems(getLostItems())
                  setSearched(false)
                  setActiveCategoryFilter('')
                }}
              >
                Reset Broad Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* 9. Second Typographic Display Banner Block */}
      <section className="broadsheet-secondary-banner">
        <div className="secondary-banner-inner">
          <span className="secondary-banner-title">30-DAY CUSTODY VAULT</span>
        </div>
      </section>

      {/* 10. Broadsheet Gazette Notice Columns (3-Column Explainer) */}
      <section className="broadsheet-notice-columns">
        <div className="notice-column">
          <div className="notice-num">I</div>
          <h3 className="notice-title">INTAKE &amp; LOGGING</h3>
          <p className="notice-body">
            Every discovered possession reported via our digital desk is immediately assigned a verifiable transaction ID, cryptographic timestamp, and location tag.
          </p>
        </div>

        <div className="notice-column">
          <div className="notice-num">II</div>
          <h3 className="notice-title">OWNERSHIP PROOF</h3>
          <p className="notice-body">
            Claimants provide distinguishing characteristics, passcode unlock confirmation, or purchase serials to ensure safe handover to the rightful owner.
          </p>
        </div>

        <div className="notice-column">
          <div className="notice-num">III</div>
          <h3 className="notice-title">30-DAY EXPIRY VAULT</h3>
          <p className="notice-body">
            Items remaining unclaimed past the 30-day statutory duration automatically graduate to the public disposal and university donation queue.
          </p>
        </div>
      </section>

      {/* 11. Broadsheet Footer Block */}
      <footer className="broadsheet-footer">
        <div className="footer-col left">
          <span className="footer-brand">THE CENTRAL CAMPUS REPOSITORY</span>
          <p className="footer-text">
            Operating in accordance with Academic Custody Regulations. Open Monday through Friday, 08:00 – 18:00 for item collections and physical verifications.
          </p>
        </div>
        <div className="footer-col right">
          <span className="footer-meta-label">DESK LOCATION &amp; AUDIT</span>
          <p className="footer-text">
            Central Administrative Building, Ground Floor West Wing · Central Custody Desk · All transactions recorded in immutable audit logs.
          </p>
        </div>
      </footer>
    </div>
  )
}
