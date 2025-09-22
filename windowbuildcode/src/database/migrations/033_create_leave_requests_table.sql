CREATE TABLE IF NOT EXISTS leave_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    leave_type TEXT NOT NULL, -- 'sick', 'annual', 'personal', 'other'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    approved_by INTEGER,
    approved_at DATETIME,
    rejection_reason TEXT,
    is_paid_leave BOOLEAN DEFAULT 0, -- influences payroll
    attachment_url TEXT, -- optional medical cert, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    issyncronized BOOLEAN DEFAULT 0,
    isdeleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (employee_id) REFERENCES employee(id),
    FOREIGN KEY (approved_by) REFERENCES employee(id)
);
