import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'pos.db');
const db = new Database(dbPath);

console.log('🔧 FIXING SKU UNIQUE CONSTRAINT\n');

try {
  // Disable foreign key constraints temporarily
  console.log('🔓 Disabling foreign key constraints...');
  db.exec('PRAGMA foreign_keys = OFF');
  
  // Check current table structure
  console.log('📋 Current food table structure:');
  const schema = db.prepare("PRAGMA table_info(food)").all();
  schema.forEach(column => {
    console.log(`   ${column.name} (${column.type}) ${column.notnull ? 'NOT NULL' : ''} ${column.pk ? 'PRIMARY KEY' : ''}`);
  });
  
  // Check if SKU has UNIQUE constraint
  const skuColumn = schema.find(col => col.name === 'sku');
  console.log('\n🔍 SKU column info:', skuColumn);
  
  // Get table creation SQL to see constraints
  const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='food'").get();
  console.log('\n📋 Current table creation SQL:');
  console.log(tableInfo.sql);
  
  // Check if food_new table exists and drop it
  const foodNewExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='food_new'").get();
  if (foodNewExists) {
    console.log('🗑️ Dropping existing food_new table...');
    db.exec('DROP TABLE food_new');
    console.log('✅ Existing food_new table dropped');
  }
  
  // Create new table without UNIQUE constraint
  console.log('\n🔧 Creating new table without UNIQUE constraint...');
  
  const createNewTableSQL = `
    CREATE TABLE food_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        image TEXT,
        category_id INTEGER NOT NULL,
        subcategory_id INTEGER,
        price NUMERIC NOT NULL,
        tax NUMERIC,
        tax_type TEXT,
        discount NUMERIC,
        discount_type TEXT,
        available_time_starts TEXT,
        available_time_ends TEXT,
        veg BOOLEAN,
        status INTEGER,
        restaurant_id INTEGER NOT NULL,
        position INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME,
        order_count INTEGER,
        avg_rating REAL,
        rating_count INTEGER,
        rating REAL,
        recommended BOOLEAN,
        slug TEXT,
        maximum_cart_quantity INTEGER,
        is_halal BOOLEAN,
        item_stock INTEGER,
        sell_count INTEGER,
        stock_type TEXT,
        issynctonized BOOLEAN DEFAULT 0,
        isdeleted BOOLEAN DEFAULT 0,
        sku TEXT,
        barcode TEXT,
        track_inventory BOOLEAN DEFAULT 0,
        inventory_enable BOOLEAN DEFAULT 0,
        quantity INTEGER,
        low_inventory_threshold INTEGER,
        product_note_enabled BOOLEAN DEFAULT 0,
        product_note TEXT
    )
  `;
  
  db.exec(createNewTableSQL);
  console.log('✅ New table created');
  
  // Copy all data from old table to new table
  console.log('📋 Copying data...');
  const copyDataSQL = 'INSERT INTO food_new SELECT * FROM food';
  db.exec(copyDataSQL);
  console.log('✅ Data copied');
  
  // Drop the old table
  console.log('🗑️ Dropping old table...');
  db.exec('DROP TABLE food');
  console.log('✅ Old table dropped');
  
  // Rename new table to original name
  console.log('🔄 Renaming table...');
  db.exec('ALTER TABLE food_new RENAME TO food');
  console.log('✅ Table renamed');
  
  // Re-enable foreign key constraints
  console.log('🔒 Re-enabling foreign key constraints...');
  db.exec('PRAGMA foreign_keys = ON');
  
  // Verify the change
  console.log('\n📋 New table structure:');
  const newSchema = db.prepare("PRAGMA table_info(food)").all();
  newSchema.forEach(column => {
    console.log(`   ${column.name} (${column.type}) ${column.notnull ? 'NOT NULL' : ''} ${column.pk ? 'PRIMARY KEY' : ''}`);
  });
  
  // Check new table creation SQL
  const newTableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='food'").get();
  console.log('\n📋 New table creation SQL:');
  console.log(newTableInfo.sql);
  
  console.log('\n✅ SKU UNIQUE constraint removed successfully!');
  
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
  console.log('Stack:', error.stack);
  
  // Re-enable foreign key constraints in case of error
  try {
    db.exec('PRAGMA foreign_keys = ON');
    console.log('🔒 Foreign key constraints re-enabled');
  } catch (e) {
    console.log('⚠️ Could not re-enable foreign key constraints');
  }
}

db.close(); 