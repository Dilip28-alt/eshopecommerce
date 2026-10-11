# EShop Hub - Full-Stack E-Commerce Platform

A production-grade, full-featured e-commerce web application built using **HTML5, CSS3, JavaScript, React, Flask REST API**, and **Razorpay Test Payment Gateway**.

---

## 🌟 Key Features

### 1. User Authentication (Login & Register)
- **Sign In & Register Modal**: Seamless switcher between Login and Register with form validation.
- **1-Click Quick Demo Login**: Instantly signs in with demo account (`demo@eshophub.com` / `password123`).
- **User Account Dropdown**: Displays logged-in user profile, initials badge, personalized greeting, and one-click Sign Out.
- **Smart Checkout Pre-fill**: Logged-in user's name, email, and phone automatically pre-fill the checkout shipping form.
- **Personalized Order History**: Filter and view orders placed by the current user.

### 2. Dynamic Product Search & Discovery
- **Universal Dynamic Search**: Whatever product you search for (e.g., *smartphones*, *laptops*, *perfumes*, *shoes*, *drones*, *sunglasses*, or any custom query), the backend search engine dynamically queries and caches rich catalog items complete with high-resolution imagery, specifications, pricing, and ratings.
- **Debounced Instant Search**: 350ms debounced input with clear action.
- **Category Filtering**: Smartphones, Laptops, Fragrances, Skincare, Audio, Fashion, Gaming, Home & Kitchen, etc.
- **Price Range & Rating Filters**: Filter by custom price range and minimum star ratings.
- **Multi-criteria Sorting**: Sort by Popularity, Price (Low to High / High to Low), Customer Rating, Discount, and New Arrivals.

### 3. Rich Shopping Experience
- **Interactive Product Cards**: Rating stars, percentage discount badges, strike-through MRP, quick-view, wishlist toggle, and add-to-cart.
- **Product Detail Modal**: High-res image gallery, real-time stock counters, warranty badges, return policies, customer review breakdown, and instant **Buy Now**.
- **Interactive Cart Drawer**: Item quantity modifiers, real-time price calculations, free shipping threshold (₹500+), and coupon redemption.
- **Wishlist Drawer**: Save favorites with one-click **Move to Cart**.
- **Discount Coupons**: Active coupons include `ESHOP20` (20% OFF), `FESTIVE50` (50% OFF), `WELCOME10` (10% OFF), `SAVE15`.

### 4. Real Razorpay Test Payment Integration
- Uses configured Razorpay Key ID: `rzp_test_TmeuG15LU8aWlE`.
- Secure backend order creation (`/api/create-razorpay-order`) with amounts formatted in paise.
- Real-time Razorpay Checkout modal with support for Cards, UPI simulation, NetBanking, and Wallets.
- Payment verification endpoint (`/api/verify-payment`) saving confirmed orders to SQLite database.
- Interactive Order Confirmation Receipt Modal with downloadable / printable receipt.
- Persistent Order History tracking with live order status (`Paid & Confirmed`).

---

## 🚀 Running the Application

### Option A: From the Project Root
You can now run commands directly inside `C:\Users\kokke\.gemini\antigravity\scratch\eshop-hub`:
```bash
# Start frontend dev server
npm run dev

# Or build for production
npm run build
```

### Option B: 1-Click Double Click
Double-click [`start.bat`](start.bat) in the root folder to start both Backend and Frontend servers automatically.

---

## 🛠️ API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | Server health and Razorpay Key info |
| `GET` | `/api/products` | Dynamic search (`q`), category, price range, and sort |
| `GET` | `/api/products/<id>` | Single product details |
| `GET` | `/api/categories` | Categories list with item counts |
| `POST` | `/api/create-razorpay-order` | Create Razorpay order |
| `POST` | `/api/verify-payment` | Verify payment and store order |
| `GET` | `/api/orders` | Fetch past orders |
| `POST` | `/api/coupons/apply` | Validate discount coupon code |

---

## 🔒 Test Credentials
- **Razorpay Key ID**: `rzp_test_TmeuG15LU8aWlE`
- **Supported Coupons**: `ESHOP20`, `FESTIVE50`, `WELCOME10`, `SAVE15`
