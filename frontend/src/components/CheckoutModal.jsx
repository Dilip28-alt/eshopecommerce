import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Lock, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { apiUrl } from '../config';

const RAZORPAY_TEST_KEY = "rzp_test_TmeuG15LU8aWlE";

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  appliedCoupon,
  currentUser,
  onOrderSuccess,
  onShowToast
}) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Rahul Sharma',
    email: currentUser?.email || 'rahul.sharma@example.com',
    phone: currentUser?.phone || '9876543210',
    address: 'Flat 402, Green Meadows, MG Road',
    city: 'Bengaluru',
    pincode: '560001'
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Price calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const shippingFee = subtotal >= 500 || subtotal === 0 ? 0 : 70;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.address.trim() || !formData.city.trim() || !formData.pincode.trim()) {
      onShowToast('Please fill all delivery address fields.', 'error');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // 1. Create order on Flask backend
      const orderResp = await fetch(apiUrl('/api/create-razorpay-order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grandTotal })
      });

      if (!orderResp.ok) {
        throw new Error('Failed to reach backend server at ' + apiUrl('/api/create-razorpay-order'));
      }

      const orderData = await orderResp.json();

      // 2. Open Razorpay Checkout modal
      // IMPORTANT: In client-side test mode without a real Razorpay server secret,
      // omitting order_id allows Razorpay Checkout JS to open directly in standard
      // client-mode without returning "Uh! oh! Something went wrong" (order_id 404).
      if (typeof window.Razorpay === 'function') {
        const options = {
          key: RAZORPAY_TEST_KEY,
          amount: orderData.amount, // in paise
          currency: 'INR',
          name: 'EShop Hub',
          description: `Order Payment for ${cartItems.length} item(s)`,
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone
          },
          notes: {
            address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
            local_order_id: orderData.order_id
          },
          theme: {
            color: '#4f46e5'
          },
          handler: async function (response) {
            // Payment completed successfully in Razorpay modal
            await verifyAndSaveOrder({
              razorpay_order_id: orderData.order_id,
              razorpay_payment_id: response.razorpay_payment_id || `pay_test_${Date.now()}`
            });
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              onShowToast('Razorpay checkout window closed.', 'info');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setIsProcessing(false);
          onShowToast(`Payment Failed: ${response.error.description}`, 'error');
        });
        rzp.open();
      } else {
        // Fallback simulation if razorpay script couldn't load
        onShowToast('Connecting... Simulating test payment approval.', 'info');
        await verifyAndSaveOrder({
          razorpay_order_id: orderData.order_id,
          razorpay_payment_id: `pay_test_${Date.now()}`
        });
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      onShowToast(err.message || 'Error processing payment.', 'error');
    }
  };

  // Direct 1-Click Test Payment
  const handleDirectTestPayment = async () => {
    if (!validateForm()) return;
    setIsProcessing(true);
    try {
      const orderResp = await fetch(apiUrl('/api/create-razorpay-order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grandTotal })
      });
      const orderData = await orderResp.json();
      await verifyAndSaveOrder({
        razorpay_order_id: orderData.order_id,
        razorpay_payment_id: `pay_direct_test_${Date.now()}`
      });
    } catch (err) {
      setIsProcessing(false);
      onShowToast('Backend connection failed: ' + err.message, 'error');
    }
  };

  // Verify and finalize order on backend
  const verifyAndSaveOrder = async ({ razorpay_order_id, razorpay_payment_id }) => {
    try {
      const resp = await fetch(apiUrl('/api/verify-payment'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id,
          razorpay_payment_id,
          customer_name: formData.name,
          customer_email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          items: cartItems,
          amount: grandTotal,
          discount: discountAmount
        })
      });

      const data = await resp.json();
      if (resp.ok && data.success) {
        setIsProcessing(false);
        onOrderSuccess(data.order);
      } else {
        throw new Error(data.message || 'Verification failed.');
      }
    } catch (err) {
      setIsProcessing(false);
      onShowToast('Failed to finalize order on server: ' + err.message, 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 640 }}
      >
        <button 
          className="close-btn" 
          onClick={onClose} 
          style={{ position: 'absolute', top: 18, right: 18 }}
        >
          <X size={20} />
        </button>

        <div className="checkout-form">
          <div className="checkout-header">
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
              Secure Checkout
            </span>
            <h2>Shipping & Payment Details</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Complete your order using Razorpay Test Gateway.
            </p>
          </div>

          {/* Razorpay Test Alert Box */}
          <div className="razorpay-badge-box">
            <div className="razorpay-logo-badge">Razorpay</div>
            <div style={{ flex: 1, fontSize: '0.85rem' }}>
              <strong>Test Mode Enabled</strong> (Key: <code>{RAZORPAY_TEST_KEY}</code>)
              <p style={{ color: '#166534', fontSize: '0.8rem', margin: 0 }}>
                Test cards, UPI simulation, and netbanking test modes are supported.
              </p>
            </div>
            <Lock size={18} color="#16a34a" />
          </div>

          {/* Shipping Form */}
          <div className="form-grid">
            <div className="form-field">
              <label>Full Name *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
              />
            </div>

            <div className="form-field">
              <label>Email Address *</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                required 
              />
            </div>

            <div className="form-field">
              <label>Phone Number *</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                required 
              />
            </div>

            <div className="form-field">
              <label>PIN Code *</label>
              <input 
                type="text" 
                name="pincode" 
                value={formData.pincode} 
                onChange={handleInputChange} 
                required 
              />
            </div>

            <div className="form-field form-full">
              <label>Street Address *</label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleInputChange} 
                required 
              />
            </div>

            <div className="form-field form-full">
              <label>City & State *</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleInputChange} 
                required 
              />
            </div>
          </div>

          {/* Order Summary Summary Box */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.88rem' }}>
              <span>Items Total ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
              <span>₹{Number(subtotal).toLocaleString('en-IN')}</span>
            </div>
            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.88rem', color: 'var(--success)', fontWeight: 600 }}>
                <span>Discount Applied</span>
                <span>-₹{Number(discountAmount).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem' }}>
              <span>Shipping</span>
              <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
              <span>Total Payable</span>
              <span style={{ color: 'var(--primary)' }}>₹{Number(grandTotal).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              className="checkout-btn" 
              style={{ width: '100%', padding: '0.95rem' }}
              onClick={handlePayment}
              disabled={isProcessing}
            >
              <CreditCard size={20} />
              <span>
                {isProcessing ? 'Connecting...' : `Pay ₹${Number(grandTotal).toLocaleString('en-IN')} via Razorpay Test Modal`}
              </span>
            </button>

            <button 
              type="button"
              onClick={handleDirectTestPayment}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 10,
                border: '1.5px dashed #059669',
                background: '#ecfdf5',
                color: '#065f46',
                fontWeight: 700,
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer'
              }}
            >
              <Zap size={18} color="#059669" />
              <span>⚡ 1-Click Instant Test Checkout</span>
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.75rem' }}>
            🔒 256-bit SSL encrypted. Test transactions use Razorpay Test credentials (Key: rzp_test_TmeuG15LU8aWlE).
          </p>
        </div>
      </div>
    </div>
  );
}
