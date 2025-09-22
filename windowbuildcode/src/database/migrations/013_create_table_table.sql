CREATE TABLE IF NOT EXISTS restaurant_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_no TEXT NOT NULL,
    floor_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    issyncronized BOOLEAN DEFAULT 0,
    isdeleted BOOLEAN DEFAULT 0,
    addedby INTEGER,
    FOREIGN KEY (floor_id) REFERENCES floor(id)
); 