-- Create OTP table for password reset functionality
CREATE TABLE IF NOT EXISTS otp_verification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    phone_number TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    purpose TEXT NOT NULL DEFAULT 'password_reset', -- 'password_reset', 'login_verification', etc.
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (employee_id) REFERENCES employee (id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_employee_phone ON otp_verification(employee_id, phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_code ON otp_verification(otp_code);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verification(expires_at);
