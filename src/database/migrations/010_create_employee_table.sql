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
    isActive BOOLEAN DEFAULT 1,
    isDeleted BOOLEAN DEFAULT 0,
    isSyncronized BOOLEAN DEFAULT 0
);
