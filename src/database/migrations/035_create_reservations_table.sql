CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT,
    reservation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    duration DECIMAL(3,1),
    party_size INTEGER,
    table_id INTEGER,
    table_preference TEXT DEFAULT 'any', -- 'any' or 'customerrequired'
    is_table_preferred BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
    special_notes TEXT,
    hotel_id INTEGER NOT NULL,
    added_by INTEGER,
    is_synchronized BOOLEAN DEFAULT 0,
    is_deleted BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (customer_id) REFERENCES customer(id),
    FOREIGN KEY (table_id) REFERENCES restaurant_table(id),
    FOREIGN KEY (hotel_id) REFERENCES hotel(id),
    FOREIGN KEY (added_by) REFERENCES employee(id)
);

