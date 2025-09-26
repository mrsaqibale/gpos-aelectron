CREATE TABLE IF NOT EXISTS delivery_man_report (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    register_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    order_id INTEGER NOT NULL,
    address_id INTEGER,
    distance REAL DEFAULT 0,
    amount REAL DEFAULT 0,
    status TEXT,
    available BOOLEAN DEFAULT 1,
    amount_per_km REAL DEFAULT 0,
    tax_amount REAL DEFAULT 0,
    tip REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    issyncronized BOOLEAN DEFAULT 0,
    isdeleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (register_id) REFERENCES register(id),
    FOREIGN KEY (employee_id) REFERENCES employee(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (address_id) REFERENCES addresses(id)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_delivery_man_report_register_id ON delivery_man_report(register_id);
CREATE INDEX IF NOT EXISTS idx_delivery_man_report_employee_id ON delivery_man_report(employee_id);
CREATE INDEX IF NOT EXISTS idx_delivery_man_report_order_id ON delivery_man_report(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_man_report_address_id ON delivery_man_report(address_id);

