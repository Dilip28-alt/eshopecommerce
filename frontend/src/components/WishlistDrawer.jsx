import React from 'react';
import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlistItems,
  onRemoveWishlist,
  onMoveToCart
}) {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title">
            <Heart size={20} color="var(--danger)" fill="var(--danger)" />
            <span>My Wishlist ({wishlistItems.length})</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {wishlistItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <Heart size={56} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Your wishlist is empty</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Tap the heart on any product to save it here for later.
              </p>
              <button 
                className="add-cart-btn" 
                style={{ display: 'inline-flex', padding: '0.65rem 1.25rem' }}
                onClick={onClose}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {wishlistItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img 
                    src={item.thumbnail || (item.images && item.images[0]) || ''} 
                    alt={item.title} 
                    className="cart-item-thumb" 
                  />
                  <div>
                    <h4 className="cart-item-title">{item.title}</h4>
                    <div className="cart-item-price">
                      ₹{Number(item.price).toLocaleString('en-IN')}
                    </div>
                    <button 
                      className="add-cart-btn"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', marginTop: '0.5rem', width: 'auto' }}
                      onClick={() => onMoveToCart(item)}
                    >
                      <ShoppingCart size={14} />
                      <span>Move to Cart</span>
                    </button>
                  </div>
                  <button 
                    className="cart-item-remove"
                    onClick={() => onRemoveWishlist(item.id)}
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
