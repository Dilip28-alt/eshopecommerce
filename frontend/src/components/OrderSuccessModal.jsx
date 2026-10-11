import React from 'react';
import { CheckCircle2, PackageCheck, Printer, ArrowRight, MapPin, CreditCard } from 'lucide-react';

export default function OrderSuccessModal({
  order,
  onClose
}) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 600, padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 68, height: 68, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', marginBottom: '1rem' }}>
            <CheckCircle2 size={40} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
            Order Placed Successfully!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Thank you for shopping with EShop Hub. Your payment has been verified.
          </p>
        </div>

        {/* Receipt Box */}
        <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid #e2e8f0', marginBottom: '0.6rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
            <strong style={{ fontFamily: 'monospace' }}>{order.order_id}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid #e2e8f0', marginBottom: '0.6rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Razorpay Payment ID:</span>
            <strong style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{order.razorpay_payment_id}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid #e2e8f0', marginBottom: '0.6rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Deliver To:</span>
            <span>{order.customer_name} ({order.city})</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid #e2e8f0', marginBottom: '0.6rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Shipping Address:</span>
            <span style={{ textAlign: 'right', maxWidth: '60%' }}>{order.address}, {order.pincode}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, paddingTop: '0.4rem' }}>
            <span>Total Paid:</span>
            <span style={{ color: 'var(--success)' }}>₹{Number(order.amount).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Items Summary */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Purchased Items</h4>
          <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {order.items && order.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.86rem', padding: '6px 0', borderBottom: '1px dashed #f1f5f9' }}>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 8 }}>
                  {item.quantity}x {item.title}
                </span>
                <span style={{ fontWeight: 600 }}>₹{Number(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.75rem' }}>
          <button 
            onClick={handlePrint}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}
          >
            <Printer size={16} /> Print Receipt
          </button>

          <button 
            className="add-cart-btn"
            onClick={onClose}
            style={{ padding: '0.75rem', fontSize: '0.95rem' }}
          >
            <span>Continue Shopping</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
