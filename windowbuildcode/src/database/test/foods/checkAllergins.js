import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../../pos.db');
const db = new Database(dbPath);

console.log('🔍 CHECKING EXISTING ALLERGINS\n');

try {
  // Check allergins table
  console.log('📋 Allergins table:');
  const allergins = db.prepare('SELECT * FROM allergins WHERE isdeleted = 0').all();
  
  if (allergins.length > 0) {
    allergins.forEach((allergin, index) => {
      console.log(`   ${index + 1}. ID: ${allergin.id}, Name: ${allergin.name}`);
    });
  } else {
    console.log('   No allergins found in database');
  }
  
  // Check food_allergins table
  console.log('\n🍽️ Food-Allergins associations:');
  const foodAllergins = db.prepare('SELECT * FROM food_allergins WHERE isdeleted = 0').all();
  
  if (foodAllergins.length > 0) {
    foodAllergins.forEach((association, index) => {
      console.log(`   ${index + 1}. Food ID: ${association.food_id}, Allergin ID: ${association.allergin_id}`);
    });
  } else {
    console.log('   No food-allergin associations found');
  }
  
  // Show table schemas
  console.log('\n📋 Allergins table schema:');
  const allerginSchema = db.prepare("PRAGMA table_info(allergins)").all();
  allerginSchema.forEach(column => {
    console.log(`   ${column.name} (${column.type})`);
  });
  
  console.log('\n📋 Food_allergins table schema:');
  const foodAllerginSchema = db.prepare("PRAGMA table_info(food_allergins)").all();
  foodAllerginSchema.forEach(column => {
    console.log(`   ${column.name} (${column.type})`);
  });
  
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}

db.close(); 