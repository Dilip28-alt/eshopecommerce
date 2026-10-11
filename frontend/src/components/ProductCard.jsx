import React from 'react';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';

export default function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onQuickView
}) {
  const originalPrice = product.discount_percentage > 0
    ? Math.round(product.price / (1 - product.discount_percentage / 100))
    : null;

  return (
    <div className="product-card fade-in">
      <div className="product-image-container">
        <img 
          src={product.thumbnail || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'} 
          alt={product.title}
          className="product-image"
          loading="lazy"
        />

        {product.discount_percentage > 0 && (
          <div className="discount-badge">
            {Math.round(product.discount_percentage)}% OFF
          </div>
        )}

        <button 
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={18} fill={isWishlisted ? "var(--danger)" : "none"} />
        </button>
      </div>

      <div className="product-body">
        <div className="product-meta">
          <span className="product-brand">{product.brand || product.category}</span>
          <div className="product-rating">
            <Star size={13} fill="#b45309" stroke="#b45309" />
            <span>{product.rating ? Number(product.rating).toFixed(1) : '4.5'}</span>
          </div>
        </div>

        <h3 
          className="product-title"
          onClick={() => onQuickView(product)}
          title={product.title}
        >
          {product.title}
        </h3>

        <p className="product-description">
          {product.description}
        </p>

        <div className="product-price-row">
          <span className="current-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
          {originalPrice && (
            <span className="original-price">₹{Number(originalPrice).toLocaleString('en-IN')}</span>
          )}
        </div>

        <div className="product-actions">
          <button 
            className="add-cart-btn"
            onClick={() => onAddToCart(product)}
          >
            <ShoppingCart size={16} />
            <span>Add to Cart</span>
          </button>

          <button 
            className="quick-view-btn"
            onClick={() => onQuickView(product)}
            title="Quick view product specs"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
