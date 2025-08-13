CREATE TABLE IF NOT EXISTS category_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    status INTEGER DEFAULT 1,
    isdeleted BOOLEAN DEFAULT 0,
    issyncronized BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
    UNIQUE(category_id, ingredient_id)
); 