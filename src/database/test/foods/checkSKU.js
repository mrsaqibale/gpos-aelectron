import { getAllFoods } from '../../models/foods/food.js';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../../pos.db');
const db = new Database(dbPath);

console.log('🔍 CHECKING EXISTING SKUs IN DATABASE\n');

try {
  // Check all foods with their SKUs
  console.log('📊 All foods with SKUs:');
  const foods = db.prepare('SELECT id, name, sku, position FROM food WHERE isdeleted = 0 ORDER BY id DESC').all();
  
  foods.forEach((food, index) => {
    console.log(`   ${index + 1}. ID: ${food.id}, Name: ${food.name}, SKU: ${food.sku || 'NULL'}, Position: ${food.position || 'NULL'}`);
  });
  
  // Check for duplicate SKUs
  console.log('\n🔍 Checking for duplicate SKUs:');
  const duplicateSKUs = db.prepare(`
    SELECT sku, COUNT(*) as count 
    FROM food 
    WHERE sku IS NOT NULL AND isdeleted = 0 
    GROUP BY sku 
    HAVING COUNT(*) > 1
  `).all();
  
  if (duplicateSKUs.length > 0) {
    console.log('❌ Found duplicate SKUs:');
    duplicateSKUs.forEach(dup => {
      console.log(`   SKU: ${dup.sku} (${dup.count} times)`);
    });
  } else {
    console.log('✅ No duplicate SKUs found');
  }
  
  // Check specific SKUs that might be causing issues
  const testSKUs = ['FTP001', 'VTP001', 'SP001'];
  console.log('\n🔍 Checking specific test SKUs:');
  testSKUs.forEach(sku => {
    const existing = db.prepare('SELECT id, name FROM food WHERE sku = ? AND isdeleted = 0').get(sku);
    if (existing) {
      console.log(`   ❌ SKU "${sku}" already exists: ID ${existing.id}, Name: ${existing.name}`);
    } else {
      console.log(`   ✅ SKU "${sku}" is available`);
    }
  });
  
  // Show table structure
  console.log('\n📋 Food table structure:');
  const schema = db.prepare("PRAGMA table_info(food)").all();
  schema.forEach(column => {
    console.log(`   ${column.name} (${column.type}) ${column.notnull ? 'NOT NULL' : ''} ${column.pk ? 'PRIMARY KEY' : ''}`);
  });
  
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}

db.close(); 