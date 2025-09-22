CREATE TABLE IF NOT EXISTS food_allergins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    food_id INTEGER NOT NULL,
    allergin_id INTEGER NOT NULL,
    issyncronized BOOLEAN DEFAULT 0,
    isdeleted BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (food_id) REFERENCES food(id),
    FOREIGN KEY (allergin_id) REFERENCES allergins(id)
); 