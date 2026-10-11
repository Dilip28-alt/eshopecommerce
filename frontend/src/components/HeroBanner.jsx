import React from 'react';
import { Tag, Sparkles, ShieldCheck, Truck, CreditCard } from 'lucide-react';

export default function HeroBanner({ onApplyCouponCode }) {
  return (
    <div className="hero-banner">
      <div className="hero-content">
        <div className="hero-badge">
          <Sparkles size={14} /> Mega Savings Festival
        </div>
        <h1 className="hero-title">
          Explore Curated Tech, Fashion & Lifestyle Essentials
        </h1>
        <p className="hero-desc">
          Search anything in our dynamic store catalog. Enjoy instant test checkout powered by Razorpay Gateway.
        </p>

        {/* Promo Coupons Bar */}
        <div className="hero-coupons">
          <span style={{ fontSize: '0.85rem', color: '#e0e7ff', fontWeight: 600 }}>Active Coupons:</span>
          
          <button 
            className="coupon-chip"
            onClick={() => onApplyCouponCode('ESHOP20')}
            title="Click to use ESHOP20"
          >
            <Tag size={13} color="var(--primary)" /> ESHOP20 (20% OFF)
          </button>

          <button 
            className="coupon-chip"
            onClick={() => onApplyCouponCode('FESTIVE50')}
            title="Click to use FESTIVE50"
          >
            <Tag size={13} color="var(--primary)" /> FESTIVE50 (50% OFF)
          </button>

          <button 
            className="coupon-chip"
            onClick={() => onApplyCouponCode('WELCOME10')}
            title="Click to use WELCOME10"
          >
            <Tag size={13} color="var(--primary)" /> WELCOME10 (10% OFF)
          </button>
        </div>
      </div>

      {/* Feature Highlights on right side */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', zIndex: 1 }} className="hide-mobile">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'rgba(255,255,255,0.08)', padding: '0.6rem 1rem', borderRadius: '10px' }}>
          <ShieldCheck size={20} color="#34d399" />
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>100% Genuine Brands</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'rgba(255,255,255,0.08)', padding: '0.6rem 1rem', borderRadius: '10px' }}>
          <CreditCard size={20} color="#38bdf8" />
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Razorpay Test Gateway</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'rgba(255,255,255,0.08)', padding: '0.6rem 1rem', borderRadius: '10px' }}>
          <Truck size={20} color="#fbbf24" />
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Lightning Express Shipping</span>
        </div>
      </div>
    </div>
  );
}
