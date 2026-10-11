import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, CheckCircle } from 'lucide-react';
import { apiUrl } from '../config';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
  appliedCoupon,
  setAppliedCoupon,
  onShowToast
}) {
  if (!isOpen) return null;

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const shippingFee = subtotal >= 500 || subtotal === 0 ? 0 : 70;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponCodeInput).trim().toUpperCase();
    if (!code) {
      onShowToast('Please enter a coupon code.', 'error');
      return;
    }
    if (subtotal === 0) {
      onShowToast('Add items to cart before applying coupon.', 'error');
      return;
    }

    setApplyingCoupon(true);
    try {
      const resp = await fetch(apiUrl('/api/coupons/apply'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cart_total: subtotal })
      });
      const data = await resp.json();
      if (resp.ok && data.valid) {
        setAppliedCoupon(data);
        onShowToast(data.message, 'success');
        setCouponCodeInput('');
      } else {
        onShowToast(data.message || 'Invalid coupon code', 'error');
      }
    } catch (err) {
      onShowToast('Failed to validate coupon code.', 'error');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    onShowToast('Coupon removed.', 'info');
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title">
            <ShoppingBag size={20} color="var(--primary)" />
            <span>Shopping Cart ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Items Body */}
        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <ShoppingBag size={56} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Your cart is empty</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Looks like you haven't added anything yet. Discover our trending products!
              </p>
              <button 
                className="add-cart-btn" 
                style={{ display: 'inline-flex', padding: '0.65rem 1.25rem' }}
                onClick={onClose}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => (
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
                    <div className="cart-qty-ctrl">
                      <button 
                        className="qty-btn"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0 6px' }}>
                        {item.quantity}
                      </span>
                      <button 
                        className="qty-btn"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button 
                    className="cart-item-remove"
                    onClick={() => onRemoveItem(item.id)}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Pricing and Checkout */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            {/* Coupon Application */}
            {appliedCoupon ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.6rem 0.85rem', borderRadius: 8, marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={16} color="var(--success)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#065f46' }}>
                    {appliedCoupon.code} applied (-₹{appliedCoupon.discount_amount})
                  </span>
                </div>
                <button 
                  onClick={handleRemoveCoupon}
                  style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="coupon-section">
                <input 
                  type="text" 
                  placeholder="Enter Coupon (e.g. ESHOP20)" 
                  className="coupon-input"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                />
                <button 
                  className="apply-coupon-btn"
                  onClick={() => handleApplyCoupon()}
                  disabled={applyingCoupon}
                >
                  {applyingCoupon ? '...' : 'Apply'}
                </button>
              </div>
            )}

            {/* Price breakdown */}
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{Number(subtotal).toLocaleString('en-IN')}</span>
            </div>

            {appliedCoupon && (
              <div className="summary-row" style={{ color: 'var(--success)', fontWeight: 600 }}>
                <span>Discount ({appliedCoupon.code})</span>
                <span>-₹{Number(discountAmount).toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Delivery Charges</span>
              <span>{shippingFee === 0 ? <strong style={{ color: 'var(--success)' }}>FREE</strong> : `₹${shippingFee}`}</span>
            </div>

            <div className="summary-row total">
              <span>Grand Total</span>
              <span>₹{Number(finalTotal).toLocaleString('en-IN')}</span>
            </div>

            <button 
              className="checkout-btn"
              onClick={onOpenCheckout}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
