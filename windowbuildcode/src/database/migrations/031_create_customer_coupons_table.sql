CREATE TABLE IF NOT EXISTS customer_coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    coupon_id INTEGER NOT NULL,
    status INTEGER DEFAULT 1,
    issyncronized BOOLEAN DEFAULT 0,
    isdeleted BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (customer_id) REFERENCES customer(id),
    FOREIGN KEY (coupon_id) REFERENCES coupon(id),
    UNIQUE(customer_id, coupon_id)
); 