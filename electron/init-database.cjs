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
    
    // Execute the table creation
    db.exec(createVariationTable);
    console.log('Variation table created/verified');
    
    db.exec(createVariationOptionsTable);
    console.log('Variation options table created/verified');
    
    db.close();
    console.log('Database initialization completed');
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

module.exports = { initDatabase }; 