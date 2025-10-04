CREATE TABLE IF NOT EXISTS loyalty_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Loyalty Program Settings
    enable BOOLEAN DEFAULT 0,
    type TEXT CHECK(type IN ('both', 'order', 'amount')) DEFAULT 'both',
    orders INTEGER DEFAULT 0,
    amount NUMERIC DEFAULT 0,
    
    -- Sync and Status Fields
    isSyncronized BOOLEAN DEFAULT 0,
    isDeleted BOOLEAN DEFAULT 0,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);


