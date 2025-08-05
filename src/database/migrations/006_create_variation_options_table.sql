CREATE TABLE IF NOT EXISTS variation_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    food_id INTEGER NOT NULL,
    variation_id INTEGER NOT NULL,
    option_name TEXT NOT NULL,
    option_price NUMERIC,
    total_stock INTEGER,
    stock_type TEXT,
    sell_count INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    issyncronized BOOLEAN DEFAULT 0,
    isdeleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (food_id) REFERENCES food(id),
    FOREIGN KEY (variation_id) REFERENCES variation(id)
); 