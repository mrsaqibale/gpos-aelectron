CREATE TABLE IF NOT EXISTS customer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    hotel_id INTEGER NOT NULL,
    addedBy INTEGER,
    isloyal BOOLEAN DEFAULT 0,
    isDelete BOOLEAN DEFAULT 0,
    isSyncronized BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (hotel_id) REFERENCES hotel(id)
); 