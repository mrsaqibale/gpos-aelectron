CREATE TABLE IF NOT EXISTS delivery_rider_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rider_employee_id INTEGER NOT NULL, -- FK to employee acting as delivery rider
    order_id INTEGER NOT NULL, -- FK to orders delivered
    ride_date DATE NOT NULL, -- date of the ride/delivery
    distance_km REAL DEFAULT 0, -- distance for the delivery
    base_fare REAL DEFAULT 0, -- base amount per ride
    per_km_rate REAL DEFAULT 0, -- per km rate used
    fare_amount REAL DEFAULT 0, -- computed gross fare for the ride
    tips_amount REAL DEFAULT 0, -- tips from customer
    deduction_amount REAL DEFAULT 0, -- penalties or adjustments
    net_amount REAL DEFAULT 0, -- net payable to rider (fare + tips - deductions)
    paid_status TEXT DEFAULT 'unpaid', -- 'unpaid' | 'paid' | 'partial'
    paid_at DATETIME, -- when marked paid
    paid_by INTEGER, -- employee who marked as paid
    payment_reference_id INTEGER, -- optional link to salary_payments.id when settled in bulk
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    issyncronized BOOLEAN DEFAULT 0,
    isdeleted BOOLEAN DEFAULT 0,
    UNIQUE(order_id),
    FOREIGN KEY (rider_employee_id) REFERENCES employee(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (paid_by) REFERENCES employee(id),
    FOREIGN KEY (payment_reference_id) REFERENCES salary_payments(id)
);


