CREATE TABLE IF NOT EXISTS subcategories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image TEXT,
    parent_id INTEGER,
    category_id INTEGER NOT NULL,
    position INTEGER,
    status INTEGER,
    priority INTEGER,
    slug TEXT,
    description TEXT,
    isDelete BOOLEAN DEFAULT 0,
    isSyncronized BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (parent_id) REFERENCES subcategories(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
