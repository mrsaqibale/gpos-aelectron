CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Business Information
    business_name TEXT,
    phone_number TEXT,
    country TEXT,
    description TEXT,
    logo_file TEXT,
    logo_preview TEXT,
    address TEXT,
    latitude REAL,
    longitude REAL,

    -- Finance & Tax (Business Settings)
    currency TEXT,
    currency_symbol_position TEXT,
    digit_after_decimal_point INTEGER,
    tax_rate NUMERIC,
    standard_tax NUMERIC,
    food_tax NUMERIC,
    time_zone TEXT,
    time_format TEXT,

    -- Order Configuration
    minimum_order_amount NUMERIC,
    order_place_setting TEXT,
    delivery_min_time INTEGER,
    delivery_max_time INTEGER,
    delivery_unit TEXT,
    dine_in_time INTEGER,
    dine_in_unit TEXT,
    dine_in_orders BOOLEAN,
    in_store_orders BOOLEAN,
    takeaway_orders BOOLEAN,
    delivery_orders BOOLEAN,
    cashier_can_cancel_order TEXT,

    -- Delivery Management
    free_delivery_in NUMERIC,
    delivery_fee_per_km NUMERIC,
    maximum_delivery_range NUMERIC,
    minimum_delivery_order_amount NUMERIC,

    -- Schedule (per day open/close)
    monday_open TEXT,
    monday_close TEXT,
    tuesday_open TEXT,
    tuesday_close TEXT,
    wednesday_open TEXT,
    wednesday_close TEXT,
    thursday_open TEXT,
    thursday_close TEXT,
    friday_open TEXT,
    friday_close TEXT,
    saturday_open TEXT,
    saturday_close TEXT,
    sunday_open TEXT,
    sunday_close TEXT,

    -- Appearance & Preferences
    default_theme TEXT,
    select_keyboard TEXT,
    select_order_bell TEXT,
    auto_save_interval INTEGER,
    sound_alert BOOLEAN,
    notifications BOOLEAN,
    isSyncronized BOOLEAN DEFAULT 0,

    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);


