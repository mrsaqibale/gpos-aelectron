import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'pos.db');
const db = new Database(dbPath);

console.log('🍽️ CREATING ALLERGINS TABLES\n');

try {
  // Read and execute the allergins table migration
  console.log('📋 Creating allergins table...');
  const allerginsSQL = fs.readFileSync(path.join(__dirname, 'migrations/007_create_allergins_table.sql'), 'utf8');
  db.exec(allerginsSQL);
  console.log('✅ Allergins table created');
  
  // Read and execute the food_allergins table migration
  console.log('📋 Creating food_allergins table...');
  const foodAllerginsSQL = fs.readFileSync(path.join(__dirname, 'migrations/008_create_food_allergins_table.sql'), 'utf8');
  db.exec(foodAllerginsSQL);
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