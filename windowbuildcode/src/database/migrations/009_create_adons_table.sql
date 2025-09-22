CREATE TABLE IF NOT EXISTS adons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price NUMERIC,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    restaurant_id INTEGER NOT NULL,
    status INTEGER,
    stock_type TEXT,
    addon_stock INTEGER,
    sell_count INTEGER,
    issyncronized BOOLEAN DEFAULT 0,
    isdeleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (restaurant_id) REFERENCES hotel(id)
); 

