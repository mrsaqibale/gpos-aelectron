import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../../pos.db');
const db = new Database(dbPath);

console.log('🔍 CHECKING DATABASE STATE\n');

try {
  // Check table counts
  console.log('📊 Table counts:');
  const foodCount = db.prepare('SELECT COUNT(*) as count FROM food WHERE isdeleted = 0').get();
  const variationCount = db.prepare('SELECT COUNT(*) as count FROM variation WHERE isdeleted = 0').get();
  const optionCount = db.prepare('SELECT COUNT(*) as count FROM variation_options WHERE isdeleted = 0').get();
  
  console.log(`   Foods: ${foodCount.count}`);
  console.log(`   Variations: ${variationCount.count}`);
  console.log(`   Options: ${optionCount.count}\n`);
  
  // Show table schemas
  console.log('📋 Table schemas:');
  
  console.log('\n🍽️ Food table schema:');
  const foodSchema = db.prepare("PRAGMA table_info(food)").all();
  foodSchema.forEach(column => {
    console.log(`   ${column.name} (${column.type})`);
  });
  
  console.log('\n📋 Variation table schema:');
  const variationSchema = db.prepare("PRAGMA table_info(variation)").all();
  variationSchema.forEach(column => {
    console.log(`   ${column.name} (${column.type})`);
  });
  
  console.log('\n⚙️ Variation_options table schema:');
  const optionSchema = db.prepare("PRAGMA table_info(variation_options)").all();
  optionSchema.forEach(column => {
    console.log(`   ${column.name} (${column.type})`);
  });
  
  // Show recent foods
  console.log('\n🍽️ Recent foods:');
  const foods = db.prepare('SELECT id, name, sku, position FROM food WHERE isdeleted = 0 ORDER BY id DESC LIMIT 5').all();
  foods.forEach(food => {
    console.log(`   ID: ${food.id}, Name: ${food.name}, SKU: ${food.sku || 'N/A'}, Position: ${food.position}`);
  });
  
  // Show variations if any
  if (variationCount.count > 0) {
    console.log('\n📋 Variations:');
    const variations = db.prepare('SELECT id, name, food_id, type FROM variation WHERE isdeleted = 0').all();
    variations.forEach(variation => {
      console.log(`   ID: ${variation.id}, Name: ${variation.name}, Food ID: ${variation.food_id}, Type: ${variation.type}`);
    });
  }
  
  // Show options if any
  if (optionCount.count > 0) {
    console.log('\n⚙️ Options:');
    const options = db.prepare('SELECT id, option_name, variation_id, option_price FROM variation_options WHERE isdeleted = 0').all();
    options.forEach(option => {
      console.log(`   ID: ${option.id}, Name: ${option.option_name}, Variation ID: ${option.variation_id}, Price: $${option.option_price}`);
    });
  }
  
  console.log('\n✅ Database check completed!');
  
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}

db.close(); 