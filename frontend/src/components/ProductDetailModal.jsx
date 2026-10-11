import React, { useState } from 'react';
import { X, Star, ShoppingCart, Zap, Check, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onBuyNow
}) {
  if (!product) return null;

  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.thumbnail];

  const [activeImage, setActiveImage] = useState(images[0]);
  const [quantity, setQuantity] = useState(1);

  const originalPrice = product.discount_percentage > 0
    ? Math.round(product.price / (1 - product.discount_percentage / 100))
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 840, padding: 0 }}
      >
        <button 
          className="close-btn" 
          onClick={onClose} 
          style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, background: '#f1f5f9' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '2rem' }}>
          {/* Left: Gallery */}
          <div>
            <div style={{ width: '100%', height: 320, borderRadius: 12, overflow: 'hidden', background: '#f8fafc', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
              <img 
                src={activeImage} 
                alt={product.title} 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 8,
                      overflow: 'hidden',
                      border: activeImage === img ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      padding: 2
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 4 }}>
              {product.brand} • {product.category}
            </div>

            <h2 style={{ fontSize: '1.45rem', lineHeight: 1.3, marginBottom: '0.75rem' }}>
              {product.title}
            </h2>

            {/* Rating & Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: 6, fontWeight: 700, fontSize: '0.85rem' }}>
                <Star size={14} fill="#b45309" stroke="#b45309" />
                <span>{product.rating ? Number(product.rating).toFixed(1) : '4.5'}</span>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {product.stock > 0 ? (
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>• In Stock ({product.stock} available)</span>
                ) : (
                  <span style={{ color: 'var(--danger)', fontWeight: 600 }}>• Out of Stock</span>
                )}
              </span>
            </div>

            {/* Price Box */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              {originalPrice && (
                <span style={{ fontSize: '1.1rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                  ₹{Number(originalPrice).toLocaleString('en-IN')}
                </span>
              )}
              {product.discount_percentage > 0 && (
                <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '0.9rem' }}>
                  {Math.round(product.discount_percentage)}% OFF
                </span>
              )}
            </div>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {product.description}
            </p>

            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Quantity:</span>
              <div className="cart-qty-ctrl" style={{ padding: '4px 8px' }}>
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span style={{ fontWeight: 700, padding: '0 8px' }}>{quantity}</span>
                <button 
                  className="qty-btn"
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: 'auto', marginBottom: '1.5rem' }}>
              <button 
                className="add-cart-btn"
                style={{ padding: '0.75rem' }}
                onClick={() => {
                  onAddToCart(product, quantity);
                }}
              >
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </button>

              <button 
                style={{
                  background: '#10b981',
                  color: 'white',
                  fontWeight: 700,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '0.75rem'
                }}
                onClick={() => {
                  onBuyNow(product, quantity);
                }}
              >
                <Zap size={18} />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Guarantees */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={16} color="var(--primary)" /> 1 Year Warranty
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <RotateCcw size={16} color="var(--primary)" /> 7 Days Replacement
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Truck size={16} color="var(--primary)" /> Fast Shipping
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
