import React from 'react';
import { Filter, RotateCcw, Star } from 'lucide-react';

export default function FilterSidebar({
  categories,
  selectedCategory,
  setSelectedCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  onReset
}) {
  return (
    <aside className="filter-card">
      <div className="filter-header">
        <div className="filter-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={18} color="var(--primary)" /> Filters
        </div>
        <button className="filter-reset" onClick={onReset} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Category Filter */}
      <div className="filter-group">
        <label className="filter-group-label">Category</label>
        <div className="filter-categories-list">
          <button 
            className={`cat-item-btn ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            <span>All Categories</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.name}
              className={`cat-item-btn ${selectedCategory === c.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(c.name)}
            >
              <span>{c.name}</span>
              <span className="cat-item-count">{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="filter-group">
        <label className="filter-group-label">Price Range (₹)</label>
        <div className="price-inputs">
          <input 
            type="number" 
            placeholder="Min" 
            value={minPrice} 
            onChange={(e) => setMinPrice(e.target.value)} 
          />
          <span style={{ color: 'var(--text-light)' }}>-</span>
          <input 
            type="number" 
            placeholder="Max" 
            value={maxPrice} 
            onChange={(e) => setMaxPrice(e.target.value)} 
          />
        </div>
      </div>

      {/* Customer Rating Filter */}
      <div className="filter-group" style={{ marginBottom: 0 }}>
        <label className="filter-group-label">Customer Rating</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { label: 'All Ratings', value: '' },
            { label: '4.5 ★ and above', value: '4.5' },
            { label: '4.0 ★ and above', value: '4.0' },
            { label: '3.5 ★ and above', value: '3.5' }
          ].map((r) => (
            <label 
              key={r.label} 
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <input 
                type="radio" 
                name="ratingFilter" 
                checked={minRating === r.value}
                onChange={() => setMinRating(r.value)}
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
