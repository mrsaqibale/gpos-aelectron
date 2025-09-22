const { initializeDatabase } = require('../src/database/database-service.cjs');

function initDatabase() {
  try {
    // Initialize the database connection
    const db = initializeDatabase();
    
    console.log('Initializing database tables...');
    
    // Create variation table if it doesn't exist
    const createVariationTable = `
      CREATE TABLE IF NOT EXISTS variation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        food_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT,
        min INTEGER,
        max INTEGER,
        is_required BOOLEAN,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME,
        issyncronized BOOLEAN DEFAULT 0,
        isdeleted BOOLEAN DEFAULT 0,
        FOREIGN KEY (food_id) REFERENCES food(id)
      )
    `;
    
    // Create variation_options table if it doesn't exist
    const createVariationOptionsTable = `
      CREATE TABLE IF NOT EXISTS variation_options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        food_id INTEGER NOT NULL,
        variation_id INTEGER NOT NULL,
        option_name TEXT NOT NULL,
        option_price NUMERIC,
        total_stock INTEGER,
        stock_type TEXT,
        sell_count INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME,
        issyncronized BOOLEAN DEFAULT 0,
        isdeleted BOOLEAN DEFAULT 0,
        FOREIGN KEY (food_id) REFERENCES food(id),
        FOREIGN KEY (variation_id) REFERENCES variation(id)
      )
    `;
    
    // Create order_details table if it doesn't exist
    const createOrderDetailsTable = `
      CREATE TABLE IF NOT EXISTS order_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        food_id INTEGER NOT NULL,
        order_id INTEGER NOT NULL,
        price REAL NOT NULL,
        food_details TEXT,
        item_note TEXT,
        variation TEXT,
        add_ons TEXT,
        discount_on_food REAL DEFAULT 0,
        discount_type TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        tax_amount REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME,
        total_add_on_price REAL DEFAULT 0,
        issynicronized BOOLEAN DEFAULT 0,
        isdeleted BOOLEAN DEFAULT 0,
        FOREIGN KEY (food_id) REFERENCES food(id),
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )
    `;
    
    // Execute the table creation
    db.exec(createVariationTable);
    console.log('Variation table created/verified');
    
    db.exec(createVariationOptionsTable);
    console.log('Variation options table created/verified');
    
    db.exec(createOrderDetailsTable);
    console.log('Order details table created/verified');

    // Ensure employee table has salary_per_hour column (forward-compat safety)
    try {
      const pragma = db.prepare('PRAGMA table_info(employee)');
      const cols = pragma.all();
      const hasSalaryPerHour = cols.some(c => c.name === 'salary_per_hour');
      if (!hasSalaryPerHour) {
        db.exec('ALTER TABLE employee ADD COLUMN salary_per_hour NUMERIC DEFAULT 0');
        console.log('Added missing column employee.salary_per_hour');
      }
    } catch (e) {
      console.warn('Could not verify/add employee.salary_per_hour:', e.message);
    }

    // Ensure attendance table has total_hours and related columns
    try {
      const pragmaAtt = db.prepare('PRAGMA table_info(attendance)');
      const attCols = pragmaAtt.all();
      const hasTotalHours = attCols.some(c => c.name === 'total_hours');
      const hasOvertimeHours = attCols.some(c => c.name === 'overtime_hours');
      const hasLateMinutes = attCols.some(c => c.name === 'late_minutes');
      const hasPayRate = attCols.some(c => c.name === 'pay_rate');
      const hasEarnedAmount = attCols.some(c => c.name === 'earned_amount');
      if (!hasTotalHours) {
        db.exec('ALTER TABLE attendance ADD COLUMN total_hours REAL DEFAULT 0');
        console.log('Added missing column attendance.total_hours');
      }
      if (!hasOvertimeHours) {
        db.exec('ALTER TABLE attendance ADD COLUMN overtime_hours REAL DEFAULT 0');
        console.log('Added missing column attendance.overtime_hours');
      }
      if (!hasLateMinutes) {
        db.exec('ALTER TABLE attendance ADD COLUMN late_minutes INTEGER DEFAULT 0');
        console.log('Added missing column attendance.late_minutes');
      }
      if (!hasPayRate) {
        db.exec('ALTER TABLE attendance ADD COLUMN pay_rate NUMERIC DEFAULT 0');
        console.log('Added missing column attendance.pay_rate');
      }
      if (!hasEarnedAmount) {
        db.exec('ALTER TABLE attendance ADD COLUMN earned_amount NUMERIC DEFAULT 0');
        console.log('Added missing column attendance.earned_amount');
      }
    } catch (e) {
      console.warn('Could not verify/add attendance columns:', e.message);
    }

    // Ensure salary_payments has monthly total tracking columns
    try {
      const pragmaPay = db.prepare('PRAGMA table_info(salary_payments)');
      const payCols = pragmaPay.all();
      const hasTotalEarnedToDate = payCols.some(c => c.name === 'total_earned_to_date');
      const hasTotalPaidToDate = payCols.some(c => c.name === 'total_paid_to_date');
      const hasRemainingAfterPayment = payCols.some(c => c.name === 'remaining_after_payment');
      if (!hasTotalEarnedToDate) {
        db.exec('ALTER TABLE salary_payments ADD COLUMN total_earned_to_date NUMERIC DEFAULT 0');
        console.log('Added missing column salary_payments.total_earned_to_date');
      }
      if (!hasTotalPaidToDate) {
        db.exec('ALTER TABLE salary_payments ADD COLUMN total_paid_to_date NUMERIC DEFAULT 0');
        console.log('Added missing column salary_payments.total_paid_to_date');
      }
      if (!hasRemainingAfterPayment) {
        db.exec('ALTER TABLE salary_payments ADD COLUMN remaining_after_payment NUMERIC DEFAULT 0');
        console.log('Added missing column salary_payments.remaining_after_payment');
      }
    } catch (e) {
      console.warn('Could not verify/add salary_payments tracking columns:', e.message);
    }

    // Create reservations table
    try {
      const createReservationsTable = `
        CREATE TABLE IF NOT EXISTS reservations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER NOT NULL,
          customer_name TEXT NOT NULL,
          customer_phone TEXT,
          customer_email TEXT,
          reservation_date DATE NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME,
          duration DECIMAL(3,1),
          party_size INTEGER,
          table_id INTEGER,
          table_preference TEXT DEFAULT 'any',
          is_table_preferred BOOLEAN DEFAULT 0,
          status TEXT DEFAULT 'pending',
          special_notes TEXT,
          hotel_id INTEGER NOT NULL,
          added_by INTEGER,
          is_synchronized BOOLEAN DEFAULT 0,
          is_deleted BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME,
          FOREIGN KEY (customer_id) REFERENCES customer(id),
          FOREIGN KEY (table_id) REFERENCES restaurant_table(id),
          FOREIGN KEY (hotel_id) REFERENCES hotel(id),
          FOREIGN KEY (added_by) REFERENCES employee(id)
        )
      `;
      db.exec(createReservationsTable);
      console.log('Reservations table created/verified successfully');
    } catch (e) {
      console.warn('Could not create reservations table:', e.message);
    }

    // Create settings table for application settings (single-row)
    try {
      const createSettingsTable = `
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          business_name TEXT,
          phone_number TEXT,
          country TEXT,
          description TEXT,
          logo_file TEXT,
          logo_preview TEXT,
          address TEXT,
          latitude REAL,
          longitude REAL,
          currency TEXT,
          currency_symbol_position TEXT,
          digit_after_decimal_point INTEGER,
          tax_rate NUMERIC,
          standard_tax NUMERIC,
          food_tax NUMERIC,
          time_zone TEXT,
          time_format TEXT,
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
          free_delivery_in NUMERIC,
          delivery_fee_per_km NUMERIC,
          maximum_delivery_range NUMERIC,
          minimum_delivery_order_amount NUMERIC,
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
          default_theme TEXT,
          select_keyboard TEXT,
          select_order_bell TEXT,
          auto_save_interval INTEGER,
          sound_alert BOOLEAN,
          notifications BOOLEAN,
          isSyncronized BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME
        )
      `;
      db.exec(createSettingsTable);
      console.log('Settings table created/verified');
    } catch (e) {
      console.warn('Could not create settings table:', e.message);
    }
    
    console.log('Database initialization completed');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

module.exports = { initDatabase }; 