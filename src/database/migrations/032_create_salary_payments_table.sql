CREATE TABLE IF NOT EXISTS salary_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT DEFAULT 'cash',
    payment_note TEXT,
    period_start DATE, -- optional salary period start
    period_end DATE, -- optional salary period end
    hours_paid REAL DEFAULT 0, -- for hourly payroll
    overtime_hours_paid REAL DEFAULT 0, -- overtime paid
    reference_type TEXT, -- e.g., 'monthly', 'adjustment', 'bonus', 'advance', 'deduction'
    reference_id INTEGER, -- optional link to another table like leave_deduction, adjustments
    paid_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    issyncronized BOOLEAN DEFAULT 0,
    isdeleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (employee_id) REFERENCES employee(id),
    FOREIGN KEY (paid_by) REFERENCES employee(id)
);
