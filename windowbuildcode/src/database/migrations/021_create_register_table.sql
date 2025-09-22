CREATE TABLE IF NOT EXISTS register (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    startamount INTEGER NOT NULL DEFAULT 0,
    endamount INTEGER DEFAULT 0,
    employee_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    issyncronized BOOLEAN DEFAULT 0,
    isdeleted BOOLEAN DEFAULT 0,
    isopen BOOLEAN DEFAULT 0,
    openat DATETIME,
    closeat DATETIME,
    FOREIGN KEY (employee_id) REFERENCES employee(id)
); 