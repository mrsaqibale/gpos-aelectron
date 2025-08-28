const path = require('path');
const Database = require('better-sqlite3');

function initDatabase() {
  try {
    const dbPath = path.join(__dirname, '../src/database/pos.db');
    const db = new Database(dbPath);
    
    console.log('Initializing database...');
    
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
    
    db.close();
    console.log('Database initialization completed');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

module.exports = { initDatabase }; 