CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image TEXT,
    parent_id INTEGER,
    position INTEGER,
    status INTEGER,
    priority INTEGER,
    slug TEXT,
    description TEXT,
    hotel_id INTEGER NOT NULL,
    isDelete BOOLEAN DEFAULT 0,
    isSyncronized BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (parent_id) REFERENCES categories(id),
    FOREIGN KEY (hotel_id) REFERENCES hotel(id)
);