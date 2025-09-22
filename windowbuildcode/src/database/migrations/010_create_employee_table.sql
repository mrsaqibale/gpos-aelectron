-- create the employee table code fname id (auto increment), lname imgurl, s3url , created_at, updated_at phone, roll , -- email, address, pin , code , isActive , isDeleted, isSyncronized, 
CREATE TABLE IF NOT EXISTS employee (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fname TEXT NOT NULL,
    lname TEXT NOT NULL,
    imgurl TEXT,
    s3url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    phone TEXT,
    roll TEXT,
    email TEXT,
    address TEXT,
    pin TEXT,
    code TEXT,
    salary NUMERIC DEFAULT 0,
    salary_per_hour NUMERIC DEFAULT 0, -- hourly pay rate for time-based salary calculations
    vnumber TEXT, -- vehicle number (for delivery staff)
    vtype TEXT, -- vehicle type (bike, car, scooter, etc.)
    isActive BOOLEAN DEFAULT 1,
    isDeleted BOOLEAN DEFAULT 0,
    isSyncronized BOOLEAN DEFAULT 0
);
