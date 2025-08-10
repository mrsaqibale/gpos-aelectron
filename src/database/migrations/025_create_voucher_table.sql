-- create the voucher table with all required columns
CREATE TABLE IF NOT EXISTS voucher (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    isSyncronized BOOLEAN DEFAULT 0,
    isDeleted BOOLEAN DEFAULT 0,
    voucher_code TEXT NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    event TEXT,
    email TEXT,
    phone_no TEXT,
    name TEXT,
    status TEXT DEFAULT 'active',
    added_by INTEGER,
    FOREIGN KEY (added_by) REFERENCES employee(id)
); 