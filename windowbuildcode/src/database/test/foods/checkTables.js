import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../../pos.db');
const db = new Database(dbPath);

console.log('🔍 CHECKING DATABASE TABLES\n');

try {
  // Get all table names
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  
  console.log('📋 Available tables:');
  tables.forEach((table, index) => {
    console.log(`   ${index + 1}. ${table.name}`);
  });
  
  // Check if allergins table exists
  const allerginsTable = tables.find(t => t.name === 'allergins');
  if (allerginsTable) {
    console.log('\n✅ Allergins table exists');
    
    // Check allergins data
    const allergins = db.prepare('SELECT * FROM allergins WHERE isdeleted = 0').all();
    console.log(`   Found ${allergins.length} allergins`);
    allergins.forEach((allergin, index) => {
      console.log(`   ${index + 1}. ID: ${allergin.id}, Name: ${allergin.name}`);
    });
  } else {
    console.log('\n❌ Allergins table does not exist');
  }
  
  // Check if food_allergins table exists
  const foodAllerginsTable = tables.find(t => t.name === 'food_allergins');
  if (foodAllerginsTable) {
    console.log('\n✅ Food_allergins table exists');
    
    // Check food_allergins data
    const foodAllergins = db.prepare('SELECT * FROM food_allergins WHERE isdeleted = 0').all();
    console.log(`   Found ${foodAllergins.length} food-allergin associations`);
  } else {
    console.log('\n❌ Food_allergins table does not exist');
  }
  
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}

db.close(); 