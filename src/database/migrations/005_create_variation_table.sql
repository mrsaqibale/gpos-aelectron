CREATE TABLE IF NOT EXISTS variation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    food_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    min INTEGER,
    max INTEGER,
    is_required BOOLEAN,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    issyncronized BOOLEAN DEFAULT 0,
    isdeleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (food_id) REFERENCES food(id)
);
