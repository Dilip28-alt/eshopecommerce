import React, { useEffect, useState } from 'react';
import { X, Package, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { apiUrl } from '../config';

export default function OrderHistoryModal({
  isOpen,
  onClose,
  currentUser
}) {
  if (!isOpen) return null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterByUser, setFilterByUser] = useState(Boolean(currentUser));

  useEffect(() => {
    fetchOrders();
  }, [filterByUser, currentUser]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const path = (filterByUser && currentUser?.email)
        ? `/api/orders?email=${encodeURIComponent(currentUser.email)}`
        : '/api/orders';
      const resp = await fetch(apiUrl(path));
      const data = await resp.json();
      if (resp.ok) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 700 }}
      >
        <button 
          className="close-btn" 
          onClick={onClose} 
          style={{ position: 'absolute', top: 18, right: 18 }}
        >
          <X size={20} />
        </button>

        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <Package size={24} color="var(--primary)" />
            <h2 style={{ fontSize: '1.4rem' }}>My Order History</h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              Loading order history...
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: 12 }}>
              <Package size={48} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>No orders placed yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                When you place orders, they will appear here with full invoice details.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '55vh', overflowY: 'auto' }}>
              {orders.map((ord) => (
                <div 
                  key={ord.order_id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 10,
                    padding: '1.15rem',
                    background: '#ffffff',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                    <div>
                      <strong style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{ord.order_id}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
                        <Clock size={12} /> {ord.created_at}
                      </div>
                    </div>
                    <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>
                      {ord.status || 'Paid & Confirmed'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Payment ID: <code style={{ color: 'var(--primary)' }}>{ord.razorpay_payment_id}</code>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: 6, fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                    {ord.items && ord.items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{it.quantity}x {it.title}</span>
                        <span>₹{Number(it.price * it.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Shipping to: <strong>{ord.customer_name}</strong> ({ord.city})
                    </span>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
                      ₹{Number(ord.amount).toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
