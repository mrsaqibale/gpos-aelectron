import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../../pos.db');
const db = new Database(dbPath);

console.log('🔍 CHECKING CATEGORIES AND SUBCATEGORIES\n');

try {
  // Check if categories table exists
  console.log('📋 Checking categories table...');
  const categoriesExist = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='categories'").get();
  console.log('Categories table exists:', !!categoriesExist);
  
  if (categoriesExist) {
    const categories = db.prepare('SELECT * FROM categories WHERE isDelete = 0').all();
    console.log(`Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`   ID: ${cat.id}, Name: ${cat.name}, Hotel ID: ${cat.hotel_id}`);
    });
  }

  // Check if subcategories table exists
  console.log('\n📋 Checking subcategories table...');
  const subcategoriesExist = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='subcategories'").get();
  console.log('Subcategories table exists:', !!subcategoriesExist);
  
  if (subcategoriesExist) {
    const subcategories = db.prepare('SELECT * FROM subcategories WHERE isDelete = 0').all();
    console.log(`Found ${subcategories.length} subcategories:`);
    subcategories.forEach(sub => {
      console.log(`   ID: ${sub.id}, Name: ${sub.name}, Category ID: ${sub.category_id}`);
    });
  }

  // Check table schemas
  if (categoriesExist) {
    console.log('\n📋 Categories table schema:');
    const catSchema = db.prepare("PRAGMA table_info(categories)").all();
    catSchema.forEach(column => {
      console.log(`   ${column.name} (${column.type})`);
    });
  }

  if (subcategoriesExist) {
    console.log('\n📋 Subcategories table schema:');
    const subSchema = db.prepare("PRAGMA table_info(subcategories)").all();
    subSchema.forEach(column => {
      console.log(`   ${column.name} (${column.type})`);
    });
  }

  console.log('\n✅ Categories check completed!');
  
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}

db.close(); 