import React from 'react';
import ProductCard from './ProductCard';
import { ArrowDownUp, PackageOpen } from 'lucide-react';

export default function ProductGrid({
  products,
  loading,
  searchQuery,
  sortBy,
  setSortBy,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
  onClearFilters
}) {
  return (
    <section style={{ flex: 1 }}>
      <div className="catalog-header">
        <div className="results-count">
          Showing <strong>{products.length}</strong> {products.length === 1 ? 'item' : 'items'}
          {searchQuery && (
            <span> for "<strong>{searchQuery}</strong>"</span>
          )}
        </div>

        <div className="sort-select-box">
          <ArrowDownUp size={16} color="var(--text-muted)" />
          <span>Sort by:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="popular">Popularity & Rating</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="discount">Biggest Discount</option>
            <option value="newest">New Arrivals</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ display: 'inline-block', width: 40, height: 40, border: '4px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Searching & loading catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <PackageOpen size={64} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No products found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto 1.5rem' }}>
            We couldn't find matching products for your criteria. Try searching for other items or resetting filters.
          </p>
          <button 
            className="add-cart-btn" 
            style={{ display: 'inline-flex', padding: '0.65rem 1.4rem' }}
            onClick={onClearFilters}
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              onAddToCart={onAddToCart}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      )}
    </section>
  );
}
