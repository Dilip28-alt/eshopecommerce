import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import FilterSidebar from './components/FilterSidebar';
import ProductGrid from './components/ProductGrid';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderSuccessModal from './components/OrderSuccessModal';
import OrderHistoryModal from './components/OrderHistoryModal';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import { ShoppingBag, Heart, ShieldCheck, Headphones, Truck, RotateCcw } from 'lucide-react';
import { apiUrl } from './config';

export default function App() {
  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('eshop_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Catalog State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  // Cart & Wishlist State (persisted in localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('eshop_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('eshop_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('eshop_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('eshop_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('eshop_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('eshop_user');
      }
    } catch (e) {}
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('You have been signed out.', 'info');
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const resp = await fetch(apiUrl('/api/categories'));
      const data = await resp.json();
      if (resp.ok && data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch Products whenever search, category, or filter parameters change
  useEffect(() => {
    fetchProducts();
  }, [debouncedQuery, selectedCategory, minPrice, maxPrice, minRating, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.append('q', debouncedQuery);
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (minRating) params.append('min_rating', minRating);
      if (sortBy) params.append('sort_by', sortBy);

      const resp = await fetch(apiUrl(`/api/products?${params.toString()}`));
      const data = await resp.json();
      if (resp.ok) {
        setProducts(data.products || []);
        // Refresh categories count in case dynamic items were ingested
        fetchCategories();
      } else {
        showToast('Failed to load products.', 'error');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      showToast('Error connecting to backend API.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cart operations
  const handleAddToCart = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: qty }];
      }
    });
    showToast(`Added "${product.title}" to cart!`, 'success');
  };

  const handleUpdateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    showToast('Item removed from cart.', 'info');
  };

  // Wishlist operations
  const handleToggleWishlist = (product) => {
    const isPresent = wishlist.some((item) => item.id === product.id);
    if (isPresent) {
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      showToast(`Removed "${product.title}" from wishlist.`, 'info');
    } else {
      setWishlist((prev) => [...prev, product]);
      showToast(`Added "${product.title}" to wishlist!`, 'success');
    }
  };

  const handleMoveWishlistToCart = (product) => {
    handleAddToCart(product, 1);
    setWishlist((prev) => prev.filter((item) => item.id !== product.id));
  };

  // Direct "Buy Now"
  const handleBuyNow = (product, qty = 1) => {
    handleAddToCart(product, qty);
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Reset Filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSortBy('popular');
    showToast('Filters cleared.', 'info');
  };

  // Apply Coupon from Hero banner chip
  const handleHeroCouponClick = (code) => {
    setIsCartOpen(true);
    showToast(`Click Apply with "${code}" in your cart!`, 'info');
  };

  // Order Success callback
  const handleOrderSuccess = (order) => {
    setCart([]);
    setAppliedCoupon(null);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setCompletedOrder(order);
    showToast('🎉 Order placed successfully with Razorpay!', 'success');
  };

  const cartTotalItems = cart.reduce((acc, i) => acc + i.quantity, 0);
  const wishlistIds = wishlist.map((w) => w.id);

  return (
    <div className="app">
      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Navigation */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        cartCount={cartTotalItems}
        wishlistCount={wishlist.length}
        currentUser={currentUser}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      <div className="container">
        {/* Promotional Hero Banner */}
        <HeroBanner onApplyCouponCode={handleHeroCouponClick} />

        {/* Main Catalog View */}
        <div className="main-layout">
          {/* Filter Sidebar */}
          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            minRating={minRating}
            setMinRating={setMinRating}
            onReset={handleClearFilters}
          />

          {/* Product Catalog Grid */}
          <ProductGrid
            products={products}
            loading={loading}
            searchQuery={debouncedQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onQuickView={(p) => setSelectedProduct(p)}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onOpenCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        appliedCoupon={appliedCoupon}
        setAppliedCoupon={setAppliedCoupon}
        onShowToast={showToast}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlist}
        onRemoveWishlist={(id) => setWishlist((prev) => prev.filter((i) => i.id !== id))}
        onMoveToCart={handleMoveWishlistToCart}
      />

      {/* Product Quick View / Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      )}

      {/* Razorpay Test Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        appliedCoupon={appliedCoupon}
        currentUser={currentUser}
        onOrderSuccess={handleOrderSuccess}
        onShowToast={showToast}
      />

      {/* Order Confirmation Receipt Modal */}
      {completedOrder && (
        <OrderSuccessModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
        />
      )}

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        currentUser={currentUser}
      />

      {/* Authentication Modal (Login & Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onShowToast={showToast}
      />

      {/* EShop Hub Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">EShop Hub</div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Your destination for cutting-edge electronics, fashion, home essentials, and lifestyle accessories with dynamic discovery and seamless test checkout.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span style={{ background: '#1e293b', padding: '6px 12px', borderRadius: 6, fontSize: '0.8rem', color: '#38bdf8' }}>
                  ⚡ Razorpay Test Key: rzp_test_TmeuG15LU8aWlE
                </span>
              </div>
            </div>

            <div>
              <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '1rem' }}>Shop Categories</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.88rem' }}>
                <li style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory('Smartphones')}>Smartphones</li>
                <li style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory('Laptops')}>Laptops & Computers</li>
                <li style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory('Audio')}>Headphones & Audio</li>
                <li style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory('Fashion')}>Fashion & Apparel</li>
                <li style={{ cursor: 'pointer' }} onClick={() => setSelectedCategory('Fragrances')}>Fragrances & Beauty</li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '1rem' }}>Customer Care</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.88rem' }}>
                <li style={{ cursor: 'pointer' }} onClick={() => setIsOrdersOpen(true)}>Track My Orders</li>
                <li style={{ cursor: 'pointer' }} onClick={() => showToast('Free shipping across India on orders ₹500+.', 'info')}>Shipping Policy</li>
                <li style={{ cursor: 'pointer' }} onClick={() => showToast('7 days hassle-free replacement guaranteed.', 'info')}>Returns & Refunds</li>
                <li style={{ cursor: 'pointer' }} onClick={() => showToast('24/7 Support: support@eshophub.com', 'info')}>Help & Support</li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: 'white', marginBottom: '1rem', fontSize: '1rem' }}>Test Mode Assurances</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={18} color="#34d399" />
                  <span>Razorpay Standard Test Environment</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Truck size={18} color="#fbbf24" />
                  <span>Dynamic Real-time Product Engine</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RotateCcw size={18} color="#818cf8" />
                  <span>Instant Order Receipts & Storage</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            © {new Date().getFullYear()} EShop Hub Inc. Built with HTML5, CSS3, JavaScript, React & Flask REST API.
          </div>
        </div>
      </footer>
    </div>
  );
}
