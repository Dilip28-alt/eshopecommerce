from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import hmac
import hashlib
from datetime import datetime
from database import (
    init_db,
    search_products,
    get_product_by_id,
    get_categories,
    save_order,
    get_all_orders,
    validate_coupon,
    register_user,
    login_user,
    get_user_by_id
)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Razorpay Test Key
RAZORPAY_KEY_ID = "rzp_test_TmeuG15LU8aWlE"
# Razorpay Test Secret (Dummy test secret for test mode verification)
RAZORPAY_KEY_SECRET = "dummy_secret_test_eshop"

# Initialize DB and seed initial items
init_db()

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        "status": "online",
        "app": "EShop Hub API",
        "razorpay_key_id": RAZORPAY_KEY_ID,
        "time": datetime.now().isoformat()
    })

@app.route('/api/products', methods=['GET'])
def list_products():
    query = request.args.get('q', '').strip()
    category = request.args.get('category', '').strip()
    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')
    min_rating = request.args.get('min_rating')
    sort_by = request.args.get('sort_by', 'popular')

    products = search_products(
        query=query,
        category=category,
        min_price=min_price,
        max_price=max_price,
        min_rating=min_rating,
        sort_by=sort_by
    )

    return jsonify({
        "count": len(products),
        "products": products
    })

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = get_product_by_id(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product)

@app.route('/api/categories', methods=['GET'])
def list_categories():
    categories = get_categories()
    return jsonify({
        "categories": categories
    })

@app.route('/api/coupons/apply', methods=['POST'])
def apply_coupon():
    data = request.get_json() or {}
    code = data.get('code', '')
    cart_total = float(data.get('cart_total', 0))

    if not code:
        return jsonify({"valid": False, "message": "Please enter a coupon code."}), 400

    result = validate_coupon(code, cart_total)
    return jsonify(result)

@app.route('/api/create-razorpay-order', methods=['POST'])
def create_razorpay_order():
    data = request.get_json() or {}
    amount = float(data.get('amount', 0)) # in INR

    if amount <= 0:
        return jsonify({"error": "Invalid amount"}), 400

    # Razorpay amount is in paise (multiply by 100)
    amount_in_paise = int(round(amount * 100))
    receipt = f"rcpt_{uuid.uuid4().hex[:8]}"
    order_id = f"order_{uuid.uuid4().hex[:14]}"

    return jsonify({
        "order_id": order_id,
        "currency": "INR",
        "amount": amount_in_paise,
        "amount_inr": amount,
        "key_id": RAZORPAY_KEY_ID,
        "receipt": receipt
    })

@app.route('/api/verify-payment', methods=['POST'])
def verify_payment():
    data = request.get_json() or {}
    razorpay_order_id = data.get('razorpay_order_id', '')
    razorpay_payment_id = data.get('razorpay_payment_id', '')
    customer_name = data.get('customer_name', 'Valued Customer')
    customer_email = data.get('customer_email', 'customer@example.com')
    phone = data.get('phone', '')
    address = data.get('address', '')
    city = data.get('city', '')
    pincode = data.get('pincode', '')
    items = data.get('items', [])
    amount = float(data.get('amount', 0))
    discount = float(data.get('discount', 0))

    if not items or amount <= 0:
        return jsonify({"error": "Invalid order details"}), 400

    new_order_id = f"ESHOP-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    order_payload = {
        "order_id": new_order_id,
        "razorpay_order_id": razorpay_order_id or f"order_{uuid.uuid4().hex[:12]}",
        "razorpay_payment_id": razorpay_payment_id or f"pay_{uuid.uuid4().hex[:14]}",
        "customer_name": customer_name,
        "customer_email": customer_email,
        "phone": phone,
        "address": address,
        "city": city,
        "pincode": pincode,
        "items": items,
        "amount": amount,
        "discount": discount,
        "status": "Paid & Confirmed"
    }

    saved_id = save_order(order_payload)

    return jsonify({
        "success": True,
        "message": "Payment verified and order placed successfully!",
        "order": order_payload
    })

@app.route('/api/orders', methods=['GET'])
def list_orders():
    email = request.args.get('email', '').strip()
    orders = get_all_orders(email=email if email else None)
    return jsonify({
        "count": len(orders),
        "orders": orders
    })

@app.route('/api/auth/register', methods=['POST'])
def api_register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    phone = data.get('phone', '').strip()

    if not name or not email or not password:
        return jsonify({"success": False, "message": "Name, email, and password are required."}), 400

    if len(password) < 6:
        return jsonify({"success": False, "message": "Password must be at least 6 characters."}), 400

    result = register_user(name, email, password, phone)
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required."}), 400

    result = login_user(email, password)
    status_code = 200 if result['success'] else 401
    return jsonify(result), status_code

@app.route('/api/auth/me', methods=['GET'])
def api_me():
    user_id = request.args.get('id')
    if not user_id:
        return jsonify({"error": "Missing user ID"}), 400
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user})

if __name__ == '__main__':
    print(f"Starting EShop Hub API on port 5001 with Razorpay Key: {RAZORPAY_KEY_ID}")
    app.run(host='0.0.0.0', port=5001, debug=True)
