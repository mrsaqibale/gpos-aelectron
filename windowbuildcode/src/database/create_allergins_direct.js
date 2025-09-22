import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'pos.db');
const db = new Database(dbPath);

console.log('🍽️ CREATING ALLERGINS TABLES DIRECTLY\n');

try {
  // Create allergins table
  console.log('📋 Creating allergins table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS allergins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME,
        issyncronized BOOLEAN DEFAULT 0,
        isdeleted BOOLEAN DEFAULT 0
    )
  `);
  console.log('✅ Allergins table created');
  
  // Create food_allergins table
  console.log('📋 Creating food_allergins table...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS food_allergins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        food_id INTEGER NOT NULL,
        allergin_id INTEGER NOT NULL,
        issyncronized BOOLEAN DEFAULT 0,
        isdeleted BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME,
        FOREIGN KEY (food_id) REFERENCES food(id),
        FOREIGN KEY (allergin_id) REFERENCES allergins(id)
    )
  `);
  console.log('✅ Food_allergins table created');
  
  // Verify tables were created
  console.log('\n📊 Verifying tables:');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('allergins', 'food_allergins')").all();
  tables.forEach(table => {
    console.log(`   ✅ ${table.name} table exists`);
  });
  
  console.log('\n✅ Allergins tables created successfully!');
  
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}

db.close(); 