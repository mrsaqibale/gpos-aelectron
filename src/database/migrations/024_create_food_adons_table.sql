CREATE TABLE IF NOT EXISTS food_adons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    food_id INTEGER NOT NULL,
    adon_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    issyncronized BOOLEAN DEFAULT 0,
    isdeleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (food_id) REFERENCES food(id),
    FOREIGN KEY (adon_id) REFERENCES adons(id),
    UNIQUE(food_id, adon_id)
); 