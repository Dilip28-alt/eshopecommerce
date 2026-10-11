import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Heart, 
  ShoppingCart, 
  Package, 
  X,
  Sparkles,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  categories, 
  selectedCategory, 
  setSelectedCategory,
  cartCount,
  wishlistCount,
  currentUser,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  onOpenAuth,
  onLogout
}) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close user dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="navbar">
      <div className="container">
        <div className="nav-container">
          {/* Brand */}
          <div 
            className="brand" 
            onClick={() => { 
              setSelectedCategory('All'); 
              setSearchQuery(''); 
            }}
          >
            <div className="brand-icon">
              <ShoppingBag size={22} />
            </div>
            <div className="brand-name">
              EShop<span>Hub</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-wrapper">
            <div className="search-input-box">
              <Search size={18} color="#64748b" />
              <input 
                type="text" 
                placeholder="Search any products (phones, laptops, shoes, perfumes, watch...)" 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="nav-actions">
            {/* Orders History */}
            <button 
              className="nav-action-btn"
              onClick={onOpenOrders}
              title="View your orders"
            >
              <Package size={20} />
              <span className="hide-mobile">Orders</span>
            </button>

            {/* Wishlist */}
            <button 
              className="nav-action-btn"
              onClick={onOpenWishlist}
              title="Saved Wishlist"
            >
              <Heart size={20} />
              <span className="hide-mobile">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="badge-count">{wishlistCount}</span>
              )}
            </button>

            {/* Cart Button */}
            <button 
              className="nav-action-btn cart-btn-primary"
              onClick={onOpenCart}
              title="Open Shopping Cart"
            >
              <ShoppingCart size={20} />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="badge-count" style={{ position: 'relative', top: 'auto', right: 'auto', background: 'white', color: 'var(--primary)' }}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Auth Section */}
            {currentUser ? (
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button 
                  className="nav-action-btn user-profile-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{ background: '#f1f5f9', border: '1px solid var(--border-color)', borderRadius: 999, padding: '0.35rem 0.75rem 0.35rem 0.5rem', gap: 6 }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.name ? currentUser.name.split(' ')[0] : 'Account'}
                  </span>
                  <ChevronDown size={14} color="#64748b" />
                </button>

                {userDropdownOpen && (
                  <div className="user-dropdown-menu fade-in">
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                      <p style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>{currentUser.name}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{currentUser.email}</p>
                    </div>
                    <button 
                      onClick={() => { setUserDropdownOpen(false); onOpenOrders(); }}
                      className="dropdown-item"
                    >
                      <Package size={15} /> My Orders
                    </button>
                    <button 
                      onClick={() => { setUserDropdownOpen(false); onLogout(); }}
                      className="dropdown-item"
                      style={{ color: 'var(--danger)' }}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                className="nav-action-btn sign-in-btn"
                onClick={onOpenAuth}
                style={{ background: '#1e1b4b', color: 'white', borderRadius: 999, padding: '0.5rem 1rem' }}
              >
                <User size={18} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Category Nav Pills */}
        <div className="quick-categories">
          <button 
            className={`cat-pill ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            <Sparkles size={14} style={{ display: 'inline', marginRight: 4 }} /> All Products
          </button>
          {categories.map((cat) => (
            <button 
              key={cat.name}
              className={`cat-pill ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
