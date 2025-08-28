CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    date DATE NOT NULL,
    checkin DATETIME,
    checkout DATETIME,
    status TEXT NOT NULL, -- 'present', 'leave', 'absent'
    added_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    issyncronized BOOLEAN DEFAULT 0,
    isdeleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (employee_id) REFERENCES employee(id),
    FOREIGN KEY (added_by) REFERENCES employee(id)
); 