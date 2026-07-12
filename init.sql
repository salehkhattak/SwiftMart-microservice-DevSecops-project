-- ===========================
-- USERS
-- ===========================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- CATEGORIES
-- ===========================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- ===========================
-- PRODUCTS
-- ===========================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    image_url TEXT,
    category_id INTEGER REFERENCES categories(id)
);

-- ===========================
-- ORDERS
-- ===========================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- ORDER ITEMS
-- ===========================
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

-- ===========================
-- CART ITEMS
-- ===========================
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL
);

-- ===========================
-- NOTIFICATIONS
-- ===========================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    order_id INTEGER REFERENCES orders(id),
    status VARCHAR(20) DEFAULT 'SENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- SAMPLE CATEGORIES
-- ===========================
INSERT INTO categories (name)
VALUES
('Laptops'),
('Accessories'),
('Storage'),
('Networking'),
('Audio');

-- ===========================
-- SAMPLE PRODUCTS
-- ===========================
INSERT INTO products
(name, description, price, stock_quantity, image_url, category_id)
VALUES
(
'Dell XPS 15',
'15-inch performance laptop',
1999.99,
15,
'https://example.com/dell-xps15.jpg',
1
),

(
'Logitech MX Master 3',
'Wireless productivity mouse',
99.99,
50,
'https://example.com/mx-master3.jpg',
2
),

(
'Samsung T7 SSD',
'Portable SSD 1TB',
129.99,
40,
'https://example.com/samsung-t7.jpg',
3
),

(
'TP-Link Archer AX55',
'Wi-Fi 6 Router',
149.99,
25,
'https://example.com/tplink-ax55.jpg',
4
),

(
'Sony WH-1000XM6',
'Noise cancelling headphones',
399.99,
20,
'https://example.com/sony-wh1000xm6.jpg',
5
);