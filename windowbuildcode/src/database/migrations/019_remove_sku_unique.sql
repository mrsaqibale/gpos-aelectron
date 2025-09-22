-- Remove UNIQUE constraint from sku column in food table
-- SQLite doesn't support DROP CONSTRAINT directly, so we need to recreate the table

-- Create a new table without the UNIQUE constraint
CREATE TABLE food_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    category_id INTEGER NOT NULL,
    subcategory_id INTEGER,
    price NUMERIC NOT NULL,
    tax NUMERIC,
    tax_type TEXT,
    discount NUMERIC,
    discount_type TEXT,
    available_time_starts TEXT,
    available_time_ends TEXT,
    veg BOOLEAN,
    status INTEGER,
    restaurant_id INTEGER NOT NULL,
    position INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    order_count INTEGER,
    avg_rating REAL,
    rating_count INTEGER,
    rating REAL,
    recommended BOOLEAN,
    slug TEXT,
    maximum_cart_quantity INTEGER,
    is_halal BOOLEAN,
    item_stock INTEGER,
    sell_count INTEGER,
    stock_type TEXT,
    issynctonized BOOLEAN DEFAULT 0,
    isdeleted BOOLEAN DEFAULT 0,
    sku TEXT,
    barcode TEXT,
    track_inventory BOOLEAN DEFAULT 0,
    inventory_enable BOOLEAN DEFAULT 0,
    quantity INTEGER,
    low_inventory_threshold INTEGER,
    product_note_enabled BOOLEAN DEFAULT 0,
    product_note TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id),
    FOREIGN KEY (restaurant_id) REFERENCES hotel(id)
);

-- Copy data from old table to new table
INSERT INTO food_new SELECT * FROM food;

-- Drop the old table
DROP TABLE food;

-- Rename new table to original name
ALTER TABLE food_new RENAME TO food; 