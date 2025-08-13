CREATE TABLE IF NOT EXISTS food_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    food_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    status INTEGER DEFAULT 1,
    isdeleted BOOLEAN DEFAULT 0,
    issyncronized BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (food_id) REFERENCES food(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
    UNIQUE(food_id, ingredient_id)
); 