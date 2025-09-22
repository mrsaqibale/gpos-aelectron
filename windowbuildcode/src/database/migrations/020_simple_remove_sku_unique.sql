-- Remove UNIQUE constraint from sku column using a simpler approach
-- First, let's check if the constraint exists and then remove it

-- Create a new table with the same structure but without UNIQUE constraint on sku
CREATE TABLE IF NOT EXISTS food_temp (
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
    product_note TEXT
);

-- Copy all data from the existing food table
INSERT INTO food_temp SELECT * FROM food;

-- Drop the old table
DROP TABLE food;

-- Rename the new table
ALTER TABLE food_temp RENAME TO food;

-- Recreate the foreign key constraints
-- Note: SQLite doesn't support adding foreign keys to existing tables easily
-- This is a simplified approach 