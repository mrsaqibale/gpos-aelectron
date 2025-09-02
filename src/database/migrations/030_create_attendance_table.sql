CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    date DATE NOT NULL,
    checkin DATETIME,
    checkout DATETIME,
    status TEXT NOT NULL, -- 'present', 'leave', 'absent'
    scheduled_start DATETIME, -- optional rostered start
    scheduled_end DATETIME, -- optional rostered end
    total_hours REAL DEFAULT 0, -- computed actual hours worked
    overtime_hours REAL DEFAULT 0, -- computed overtime hours
    late_minutes INTEGER DEFAULT 0, -- minutes late vs scheduled_start
    remarks TEXT,
    added_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    issyncronized BOOLEAN DEFAULT 0,
    isdeleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (employee_id) REFERENCES employee(id),
    FOREIGN KEY (added_by) REFERENCES employee(id)
); 