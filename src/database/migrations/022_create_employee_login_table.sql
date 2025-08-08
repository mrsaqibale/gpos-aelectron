-- Create the employee_login table for tracking employee login/logout sessions
-- This table has a 1-to-many relationship with the employee table
CREATE TABLE IF NOT EXISTS employee_login (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    login_time DATETIME NOT NULL,
    logout_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    isSyncronized BOOLEAN DEFAULT 0,
    isDeleted BOOLEAN DEFAULT 0,
    FOREIGN KEY (employee_id) REFERENCES employee(id)
); 