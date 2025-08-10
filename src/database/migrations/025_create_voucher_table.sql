-- create the voucher table with all required columns
CREATE TABLE IF NOT EXISTS voucher (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    start_date DATE,
    end_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    isSyncronized BOOLEAN DEFAULT 0,
    isDeleted BOOLEAN DEFAULT 0,
    voucher_code TEXT UNIQUE,
    amount DECIMAL(10,2),
    event TEXT,
    email TEXT,
    phone_no TEXT,
    name TEXT,
    status TEXT DEFAULT 'active',
    added_by INTEGER,
    FOREIGN KEY (added_by) REFERENCES employee(id)
); 