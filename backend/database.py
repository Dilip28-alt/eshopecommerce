import sqlite3
import json
import os
import requests
import uuid
import hashlib
import secrets
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'eshop.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Products table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        discount_percentage REAL DEFAULT 0,
        rating REAL DEFAULT 4.5,
        stock INTEGER DEFAULT 20,
        brand TEXT,
        category TEXT,
        thumbnail TEXT,
        images TEXT,
        tags TEXT
    )
    ''')

    # Orders table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS orders (
        order_id TEXT PRIMARY KEY,
        razorpay_order_id TEXT,
        razorpay_payment_id TEXT,
        customer_name TEXT,
        customer_email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        pincode TEXT,
        items TEXT,
        amount REAL,
        discount REAL,
        status TEXT,
        created_at TEXT
    )
    ''')

    # Coupons table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS coupons (
        code TEXT PRIMARY KEY,
        discount_percent REAL,
        max_discount REAL,
        min_amount REAL,
        active INTEGER DEFAULT 1
    )
    ''')

    # Users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone TEXT DEFAULT '',
        role TEXT DEFAULT 'customer',
        created_at TEXT
    )
    ''')

    conn.commit()

    # Seed demo user
    cursor.execute('SELECT COUNT(*) FROM users')
    if cursor.fetchone()[0] == 0:
        demo_salt = "demo_salt_hash"
        demo_key = hashlib.sha256(("password123" + demo_salt).encode('utf-8')).hexdigest()
        cursor.execute('''
        INSERT INTO users (name, email, password_hash, phone, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            "Demo Shopper",
            "demo@eshophub.com",
            f"{demo_salt}${demo_key}",
            "9876543210",
            "customer",
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))
        conn.commit()

    # Seed coupons
    cursor.execute('SELECT COUNT(*) FROM coupons')
    if cursor.fetchone()[0] == 0:
        default_coupons = [
            ('ESHOP20', 20, 1000, 500, 1),
            ('WELCOME10', 10, 500, 200, 1),
            ('FESTIVE50', 50, 2500, 1500, 1),
            ('SAVE15', 15, 800, 400, 1)
        ]
        cursor.executemany(
            'INSERT INTO coupons (code, discount_percent, max_discount, min_amount, active) VALUES (?, ?, ?, ?, ?)',
            default_coupons
        )
        conn.commit()

    # Seed products if empty
    cursor.execute('SELECT COUNT(*) FROM products')
    if cursor.fetchone()[0] == 0:
        seed_products(conn)

    conn.close()

def seed_products(conn):
    cursor = conn.cursor()
    products_data = [
        # Electronics & Mobiles
        {
            "title": "Apple iPhone 15 Pro Max",
            "description": "Titanium design with A17 Pro chip, 48MP main camera system, 5x Telephoto, and USB-C high-speed connectivity.",
            "price": 134900,
            "discount_percentage": 8.5,
            "rating": 4.9,
            "stock": 35,
            "brand": "Apple",
            "category": "Smartphones",
            "thumbnail": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
            "images": [
                "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80"
            ],
            "tags": ["smartphone", "apple", "iphone", "5g", "mobile", "ios"]
        },
        {
            "title": "Samsung Galaxy S24 Ultra",
            "description": "Galaxy AI powered flagship phone with 200MP camera, built-in S Pen, and Snapdragon 8 Gen 3 for Galaxy.",
            "price": 129999,
            "discount_percentage": 10.0,
            "rating": 4.8,
            "stock": 28,
            "brand": "Samsung",
            "category": "Smartphones",
            "thumbnail": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80",
            "images": [
                "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80"
            ],
            "tags": ["smartphone", "samsung", "galaxy", "android", "5g", "ai"]
        },
        {
            "title": "Google Pixel 8 Pro",
            "description": "Google Tensor G3 chip, best-in-class computational photography, 120Hz Super Actua display, and 7 years of OS updates.",
            "price": 89999,
            "discount_percentage": 12.0,
            "rating": 4.7,
            "stock": 20,
            "brand": "Google",
            "category": "Smartphones",
            "thumbnail": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80"],
            "tags": ["pixel", "google", "android", "camera", "mobile"]
        },
        # Laptops & Computing
        {
            "title": "Apple MacBook Pro 16\" M3 Max",
            "description": "Liquid Retina XDR display, up to 22 hours battery life, 16-core CPU, 40-core GPU, designed for extreme workflows.",
            "price": 319900,
            "discount_percentage": 5.0,
            "rating": 4.95,
            "stock": 15,
            "brand": "Apple",
            "category": "Laptops",
            "thumbnail": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
            "images": [
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80"
            ],
            "tags": ["laptop", "macbook", "apple", "m3", "computer", "notebook"]
        },
        {
            "title": "Dell XPS 15 OLED",
            "description": "Intel Core i9 13th Gen, 3.5K OLED touchscreen, NVIDIA GeForce RTX 4070, CNC aluminum chassis.",
            "price": 215000,
            "discount_percentage": 14.0,
            "rating": 4.6,
            "stock": 18,
            "brand": "Dell",
            "category": "Laptops",
            "thumbnail": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80"],
            "tags": ["dell", "xps", "laptop", "oled", "windows", "gaming"]
        },
        {
            "title": "ASUS ROG Zephyrus G14 Gaming Laptop",
            "description": "AMD Ryzen 9, RTX 4080, 165Hz ROG Nebula HDR Mini LED display, ultraportable gaming powerhouse.",
            "price": 174990,
            "discount_percentage": 11.5,
            "rating": 4.8,
            "stock": 12,
            "brand": "ASUS",
            "category": "Laptops",
            "thumbnail": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80"],
            "tags": ["gaming", "asus", "rog", "rtx", "laptop"]
        },
        # Audio & Headphones
        {
            "title": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
            "description": "Industry-leading noise cancellation with two processors and 8 microphones, 30 hours battery, ultra-clear hands-free calling.",
            "price": 29990,
            "discount_percentage": 18.0,
            "rating": 4.85,
            "stock": 45,
            "brand": "Sony",
            "category": "Audio",
            "thumbnail": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
            "images": [
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80"
            ],
            "tags": ["headphones", "sony", "audio", "noise cancelling", "bluetooth", "music"]
        },
        {
            "title": "Apple AirPods Pro (2nd Generation) USB-C",
            "description": "Active Noise Cancellation, Adaptive Audio, Transparency mode, Personalized Spatial Audio with dynamic head tracking.",
            "price": 24900,
            "discount_percentage": 10.0,
            "rating": 4.8,
            "stock": 60,
            "brand": "Apple",
            "category": "Audio",
            "thumbnail": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80"],
            "tags": ["earbuds", "airpods", "apple", "audio", "wireless"]
        },
        {
            "title": "Bose SoundLink Revolve+ II Bluetooth Speaker",
            "description": "360-degree deep, jaw-dropping sound, durable and water-resistant (IP55), up to 17-hour battery per charge.",
            "price": 27900,
            "discount_percentage": 12.0,
            "rating": 4.7,
            "stock": 25,
            "brand": "Bose",
            "category": "Audio",
            "thumbnail": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80"],
            "tags": ["speaker", "bose", "bluetooth", "audio", "sound"]
        },
        # Smartwatches & Wearables
        {
            "title": "Apple Watch Ultra 2 Titanium",
            "description": "The most rugged and capable Apple Watch. 49mm aerospace titanium case, precision dual-frequency GPS, 3000 nits display.",
            "price": 89900,
            "discount_percentage": 6.0,
            "rating": 4.9,
            "stock": 22,
            "brand": "Apple",
            "category": "Wearables",
            "thumbnail": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"],
            "tags": ["watch", "smartwatch", "apple", "wearable", "fitness"]
        },
        {
            "title": "Samsung Galaxy Watch6 Classic",
            "description": "Rotating physical bezel, advanced sleep coaching, ECG & blood pressure monitoring, Sapphire crystal glass.",
            "price": 36999,
            "discount_percentage": 15.0,
            "rating": 4.6,
            "stock": 30,
            "brand": "Samsung",
            "category": "Wearables",
            "thumbnail": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80"],
            "tags": ["watch", "samsung", "smartwatch", "fitness", "wearable"]
        },
        # Cameras & Photography
        {
            "title": "Sony Alpha 7 IV Full-frame Mirrorless Camera",
            "description": "33MP Exmor R CMOS sensor, 4K 60p 10-bit video, real-time Eye AF for humans, animals, and birds.",
            "price": 224990,
            "discount_percentage": 8.0,
            "rating": 4.9,
            "stock": 14,
            "brand": "Sony",
            "category": "Cameras",
            "thumbnail": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"],
            "tags": ["camera", "sony", "mirrorless", "photography", "video", "4k"]
        },
        {
            "title": "DJI Mini 4 Pro Drone Fly More Combo",
            "description": "Sub-249g ultra-light foldable drone, 4K/60fps HDR true vertical shooting, omnidirectional obstacle sensing, 20km transmission.",
            "price": 109990,
            "discount_percentage": 10.0,
            "rating": 4.88,
            "stock": 18,
            "brand": "DJI",
            "category": "Cameras",
            "thumbnail": "https://images.unsplash.com/photo-1507582020432-2a3bc4ff723c?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1507582020432-2a3bc4ff723c?w=800&auto=format&fit=crop&q=80"],
            "tags": ["drone", "dji", "camera", "aerial", "gadget"]
        },
        # Fashion & Apparel
        {
            "title": "Nike Air Jordan 1 Retro High OG",
            "description": "Iconic high-top silhouette, premium leather upper, Air-Sole unit in heel for cushioning, timeless streetwear classic.",
            "price": 16995,
            "discount_percentage": 12.0,
            "rating": 4.8,
            "stock": 50,
            "brand": "Nike",
            "category": "Fashion",
            "thumbnail": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80"],
            "tags": ["shoes", "nike", "sneakers", "jordan", "fashion", "footwear"]
        },
        {
            "title": "Adidas Ultraboost Light Running Shoes",
            "description": "Lightest Boost cushioning ever, Continental Rubber outsole for superior grip, engineered mesh upper.",
            "price": 18999,
            "discount_percentage": 20.0,
            "rating": 4.75,
            "stock": 42,
            "brand": "Adidas",
            "category": "Fashion",
            "thumbnail": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80"],
            "tags": ["shoes", "adidas", "running", "sneakers", "sports", "fashion"]
        },
        {
            "title": "Levi's Original 501 Straight Fit Denim Jeans",
            "description": "The blueprint for every pair of modern jeans. Classic straight leg, signature button fly, 100% durable cotton denim.",
            "price": 4599,
            "discount_percentage": 25.0,
            "rating": 4.6,
            "stock": 80,
            "brand": "Levi's",
            "category": "Fashion",
            "thumbnail": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80"],
            "tags": ["jeans", "denim", "levis", "clothes", "clothing", "pants", "fashion"]
        },
        {
            "title": "Ray-Ban Aviator Classic Polarized Sunglasses",
            "description": "Originally created for U.S. aviators in 1937. Crystal polarized lenses, gold metal frame, 100% UV protection.",
            "price": 11590,
            "discount_percentage": 15.0,
            "rating": 4.7,
            "stock": 35,
            "brand": "Ray-Ban",
            "category": "Fashion",
            "thumbnail": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80"],
            "tags": ["sunglasses", "glasses", "ray-ban", "eyewear", "fashion", "accessories"]
        },
        # Fragrances & Beauty
        {
            "title": "Dior Sauvage Eau de Parfum (100ml)",
            "description": "A sensual and mysterious composition featuring Calabria bergamot, Sichuan pepper, and vanilla amber woody notes.",
            "price": 13500,
            "discount_percentage": 10.0,
            "rating": 4.9,
            "stock": 40,
            "brand": "Dior",
            "category": "Fragrances",
            "thumbnail": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=80"],
            "tags": ["perfume", "dior", "fragrance", "scent", "cologne", "beauty"]
        },
        {
            "title": "Chanel Coco Mademoiselle Intense",
            "description": "An intense, woody oriental ambery fragrance with a strong personality. Fresh citrus with patchouli and tonka bean.",
            "price": 15800,
            "discount_percentage": 5.0,
            "rating": 4.88,
            "stock": 30,
            "brand": "Chanel",
            "category": "Fragrances",
            "thumbnail": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80"],
            "tags": ["perfume", "chanel", "fragrance", "scent", "beauty"]
        },
        {
            "title": "Estée Lauder Advanced Night Repair Serum (50ml)",
            "description": "Synchronized Multi-Recovery Complex reduces the look of multiple signs of aging caused by environmental assaults of modern life.",
            "price": 8900,
            "discount_percentage": 18.0,
            "rating": 4.8,
            "stock": 55,
            "brand": "Estée Lauder",
            "category": "Skincare",
            "thumbnail": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80"],
            "tags": ["skincare", "serum", "beauty", "cosmetics", "face"]
        },
        # Home & Kitchen
        {
            "title": "Dyson V15 Detect Cordless Vacuum Cleaner",
            "description": "Laser reveals microscopic dust. Intelligently adapts suction power based on floor type and dust volume. Up to 60 min runtime.",
            "price": 62900,
            "discount_percentage": 15.0,
            "rating": 4.78,
            "stock": 20,
            "brand": "Dyson",
            "category": "Home & Kitchen",
            "thumbnail": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80"],
            "tags": ["dyson", "vacuum", "home", "cleaning", "appliances"]
        },
        {
            "title": "Nespresso VertuoPlus Coffee & Espresso Machine",
            "description": "Centrifusion technology brews delicious crema-topped coffee in 5 cup sizes at the touch of a single button.",
            "price": 19999,
            "discount_percentage": 22.0,
            "rating": 4.7,
            "stock": 35,
            "brand": "Nespresso",
            "category": "Home & Kitchen",
            "thumbnail": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80"],
            "tags": ["coffee", "espresso", "nespresso", "kitchen", "machine"]
        },
        {
            "title": "Philips Airfryer XXL Smart Sensing",
            "description": "Fat Removal technology reduces fat up to 90%. Smart chef programs automatically adjust time and temperature.",
            "price": 18495,
            "discount_percentage": 17.0,
            "rating": 4.65,
            "stock": 40,
            "brand": "Philips",
            "category": "Home & Kitchen",
            "thumbnail": "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format&fit=crop&q=80"],
            "tags": ["airfryer", "philips", "kitchen", "cooking", "appliances"]
        },
        # Gaming & Entertainment
        {
            "title": "Sony PlayStation 5 Slim Console",
            "description": "Ultra-High Speed SSD, Integrated I/O, Ray Tracing, 4K-TV Gaming, up to 120fps with 120Hz output, and Tempest 3D AudioTech.",
            "price": 54990,
            "discount_percentage": 9.0,
            "rating": 4.92,
            "stock": 25,
            "brand": "Sony",
            "category": "Gaming",
            "thumbnail": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80"],
            "tags": ["ps5", "playstation", "sony", "gaming", "console"]
        },
        {
            "title": "Nintendo Switch OLED Model",
            "description": "Vibrant 7-inch OLED screen, wide adjustable stand, wired LAN port dock, 64 GB internal storage, enhanced audio.",
            "price": 31999,
            "discount_percentage": 12.0,
            "rating": 4.8,
            "stock": 30,
            "brand": "Nintendo",
            "category": "Gaming",
            "thumbnail": "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&auto=format&fit=crop&q=80",
            "images": ["https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop&q=80"],
            "tags": ["nintendo", "switch", "gaming", "console", "portable"]
        }
    ]

    for p in products_data:
        cursor.execute('''
        INSERT INTO products (title, description, price, discount_percentage, rating, stock, brand, category, thumbnail, images, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            p['title'],
            p['description'],
            p['price'],
            p['discount_percentage'],
            p['rating'],
            p['stock'],
            p['brand'],
            p['category'],
            p['thumbnail'],
            json.dumps(p['images']),
            json.dumps(p['tags'])
        ))
    conn.commit()

def fetch_external_products_if_needed(query):
    """
    If a query has few or no local matches, fetch dynamically from DummyJSON
    and insert into SQLite so the catalog expands dynamically to match ANY search term!
    """
    if not query or len(query.strip()) < 2:
        return
    
    clean_q = query.strip().lower()
    try:
        url = f"https://dummyjson.com/products/search?q={clean_q}"
        resp = requests.get(url, timeout=3.5)
        if resp.status_code == 200:
            data = resp.json()
            products = data.get('products', [])
            if products:
                conn = get_db_connection()
                cursor = conn.cursor()
                for item in products:
                    # check if product with same title already exists
                    cursor.execute("SELECT id FROM products WHERE LOWER(title) = ?", (item['title'].lower(),))
                    if not cursor.fetchone():
                        # Convert USD price to approximate INR for uniform currency
                        price_inr = round(item.get('price', 50) * 83.0, -1)
                        if price_inr < 99:
                            price_inr = 499.0
                        
                        tags = [clean_q, item.get('category', '').lower(), item.get('brand', '').lower()]
                        if 'tags' in item and isinstance(item['tags'], list):
                            tags.extend([t.lower() for t in item['tags']])

                        images = item.get('images', [item.get('thumbnail')])
                        cursor.execute('''
                        INSERT INTO products (title, description, price, discount_percentage, rating, stock, brand, category, thumbnail, images, tags)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ''', (
                            item['title'],
                            item.get('description', ''),
                            price_inr,
                            item.get('discountPercentage', 10.0),
                            item.get('rating', 4.5),
                            item.get('stock', 25),
                            item.get('brand', 'Premium Brand'),
                            item.get('category', 'General').title(),
                            item.get('thumbnail', ''),
                            json.dumps(images),
                            json.dumps(tags)
                        ))
                conn.commit()
                conn.close()
                return

    except Exception as e:
        pass

    # If still no items, generate 2-3 realistic dynamic products for the search query
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT COUNT(*) FROM products 
            WHERE title LIKE ? OR description LIKE ? OR category LIKE ? OR tags LIKE ?
        ''', (f"%{clean_q}%", f"%{clean_q}%", f"%{clean_q}%", f"%{clean_q}%"))
        if cursor.fetchone()[0] == 0:
            capitalized = clean_q.title()
            synthetic_items = [
                {
                    "title": f"Pro Edition {capitalized}",
                    "description": f"High performance {clean_q} built with premium grade materials, modern ergonomic styling, and superior reliability.",
                    "price": 2499.0,
                    "discount_percentage": 15.0,
                    "rating": 4.8,
                    "stock": 18,
                    "brand": "Apex Series",
                    "category": "Accessories",
                    "thumbnail": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80",
                    "images": ["https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80"],
                    "tags": [clean_q, "premium", "top-rated"]
                },
                {
                    "title": f"Classic {capitalized} Ultra",
                    "description": f"Best-in-class everyday {clean_q} featuring intuitive usability, lightweight construction, and trusted durability.",
                    "price": 1499.0,
                    "discount_percentage": 20.0,
                    "rating": 4.6,
                    "stock": 35,
                    "brand": "UrbanCraft",
                    "category": "Lifestyle",
                    "thumbnail": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
                    "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"],
                    "tags": [clean_q, "classic", "bestseller"]
                }
            ]
            for s in synthetic_items:
                cursor.execute('''
                INSERT INTO products (title, description, price, discount_percentage, rating, stock, brand, category, thumbnail, images, tags)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    s['title'], s['description'], s['price'], s['discount_percentage'],
                    s['rating'], s['stock'], s['brand'], s['category'],
                    s['thumbnail'], json.dumps(s['images']), json.dumps(s['tags'])
                ))
            conn.commit()
        conn.close()
    except Exception:
        pass

def search_products(query="", category="", min_price=None, max_price=None, min_rating=None, sort_by="popular"):
    conn = get_db_connection()
    cursor = conn.cursor()

    conditions = []
    params = []

    if query:
        # First check local matches count
        q_like = f"%{query.strip()}%"
        count_cursor = conn.cursor()
        count_cursor.execute('''
            SELECT COUNT(*) FROM products 
            WHERE title LIKE ? OR description LIKE ? OR category LIKE ? OR brand LIKE ? OR tags LIKE ?
        ''', (q_like, q_like, q_like, q_like, q_like))
        local_count = count_cursor.fetchone()[0]

        # If sparse or empty, dynamically fetch external products to satisfy the user's search
        if local_count < 3:
            fetch_external_products_if_needed(query)

        conditions.append("(title LIKE ? OR description LIKE ? OR category LIKE ? OR brand LIKE ? OR tags LIKE ?)")
        params.extend([q_like, q_like, q_like, q_like, q_like])

    if category and category.lower() != "all":
        conditions.append("LOWER(category) = ?")
        params.append(category.strip().lower())

    if min_price is not None:
        conditions.append("price >= ?")
        params.append(float(min_price))

    if max_price is not None:
        conditions.append("price <= ?")
        params.append(float(max_price))

    if min_rating is not None:
        conditions.append("rating >= ?")
        params.append(float(min_rating))

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    order_clause = "ORDER BY rating DESC, id DESC"
    if sort_by == "price-asc":
        order_clause = "ORDER BY price ASC"
    elif sort_by == "price-desc":
        order_clause = "ORDER BY price DESC"
    elif sort_by == "rating":
        order_clause = "ORDER BY rating DESC"
    elif sort_by == "discount":
        order_clause = "ORDER BY discount_percentage DESC"
    elif sort_by == "newest":
        order_clause = "ORDER BY id DESC"

    query_str = f"SELECT * FROM products {where_clause} {order_clause}"
    cursor.execute(query_str, params)
    rows = cursor.fetchall()

    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "title": r["title"],
            "description": r["description"],
            "price": r["price"],
            "discount_percentage": r["discount_percentage"],
            "rating": r["rating"],
            "stock": r["stock"],
            "brand": r["brand"],
            "category": r["category"],
            "thumbnail": r["thumbnail"],
            "images": json.loads(r["images"]) if r["images"] else [],
            "tags": json.loads(r["tags"]) if r["tags"] else []
        })

    conn.close()
    return results

def get_product_by_id(product_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "price": row["price"],
        "discount_percentage": row["discount_percentage"],
        "rating": row["rating"],
        "stock": row["stock"],
        "brand": row["brand"],
        "category": row["category"],
        "thumbnail": row["thumbnail"],
        "images": json.loads(row["images"]) if row["images"] else [],
        "tags": json.loads(row["tags"]) if row["tags"] else []
    }

def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC")
    rows = cursor.fetchall()
    conn.close()
    return [{"name": r["category"], "count": r["count"]} for r in rows if r["category"]]

def save_order(order_data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO orders (order_id, razorpay_order_id, razorpay_payment_id, customer_name, customer_email, phone, address, city, pincode, items, amount, discount, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        order_data['order_id'],
        order_data.get('razorpay_order_id', ''),
        order_data.get('razorpay_payment_id', ''),
        order_data['customer_name'],
        order_data['customer_email'],
        order_data.get('phone', ''),
        order_data['address'],
        order_data['city'],
        order_data['pincode'],
        json.dumps(order_data['items']),
        order_data['amount'],
        order_data.get('discount', 0),
        order_data.get('status', 'Confirmed'),
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))
    conn.commit()
    conn.close()
    return order_data['order_id']

def get_all_orders(email=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if email:
        cursor.execute("SELECT * FROM orders WHERE LOWER(customer_email) = ? ORDER BY created_at DESC", (email.strip().lower(),))
    else:
        cursor.execute("SELECT * FROM orders ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    orders = []
    for r in rows:
        orders.append({
            "order_id": r["order_id"],
            "razorpay_order_id": r["razorpay_order_id"],
            "razorpay_payment_id": r["razorpay_payment_id"],
            "customer_name": r["customer_name"],
            "customer_email": r["customer_email"],
            "phone": r["phone"],
            "address": r["address"],
            "city": r["city"],
            "pincode": r["pincode"],
            "items": json.loads(r["items"]) if r["items"] else [],
            "amount": r["amount"],
            "discount": r["discount"],
            "status": r["status"],
            "created_at": r["created_at"]
        })
    return orders

def validate_coupon(code, cart_total):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM coupons WHERE UPPER(code) = ? AND active = 1", (code.strip().upper(),))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return {"valid": False, "message": "Invalid or expired coupon code."}

    if cart_total < row["min_amount"]:
        return {
            "valid": False,
            "message": f"Coupon valid on minimum orders of ₹{row['min_amount']:.2f}."
        }

    raw_discount = (cart_total * row["discount_percent"]) / 100.0
    discount = min(raw_discount, row["max_discount"])

    return {
        "valid": True,
        "code": row["code"],
        "discount_percent": row["discount_percent"],
        "discount_amount": round(discount, 2),
        "message": f"Coupon '{row['code']}' applied! Saved ₹{round(discount, 2)}"
    }

def hash_user_password(password, salt=None):
    if not salt:
        salt = secrets.token_hex(16)
    key = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
    return f"{salt}${key}"

def verify_user_password(stored_password, provided_password):
    if '$' not in stored_password:
        return False
    salt, key = stored_password.split('$', 1)
    test_key = hashlib.sha256((provided_password + salt).encode('utf-8')).hexdigest()
    return test_key == key

def register_user(name, email, password, phone=""):
    clean_email = email.strip().lower()
    clean_name = name.strip()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (clean_email,))
    if cursor.fetchone():
        conn.close()
        return {"success": False, "message": "An account with this email already exists."}

    password_hash = hash_user_password(password)
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute('''
    INSERT INTO users (name, email, password_hash, phone, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', (clean_name, clean_email, password_hash, phone, "customer", created_at))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": "Registration successful! Welcome to EShop Hub.",
        "user": {
            "id": user_id,
            "name": clean_name,
            "email": clean_email,
            "phone": phone,
            "role": "customer"
        }
    }

def login_user(email, password):
    clean_email = email.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE LOWER(email) = ?", (clean_email,))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return {"success": False, "message": "No account found with this email."}

    if not verify_user_password(user["password_hash"], password):
        return {"success": False, "message": "Incorrect password. Please try again."}

    return {
        "success": True,
        "message": f"Welcome back, {user['name']}!",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "phone": user["phone"],
            "role": user["role"]
        }
    }

def get_user_by_id(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    if not user:
        return None
    return dict(user)

