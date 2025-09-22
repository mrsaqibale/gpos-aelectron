-- Add seat_capacity column
ALTER TABLE restaurant_table ADD COLUMN seat_capacity INTEGER DEFAULT 4;

-- Add status column
ALTER TABLE restaurant_table ADD COLUMN status TEXT DEFAULT 'Free'; 