import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../pos.db');
const db = new Database(dbPath);

console.log('🍽️ CREATING TEST ALLERGINS\n');

try {
  // Test allergins data
  const testAllergins = [
    { name: 'Gluten' },
    { name: 'Dairy' },
    { name: 'Nuts' },
    { name: 'Eggs' },
    { name: 'Shellfish' },
    { name: 'Soy' },
    { name: 'Wheat' },
    { name: 'Fish' }
  ];
  
  console.log('📋 Adding test allergins:');
  
  for (const allergin of testAllergins) {
    const stmt = db.prepare(`
      INSERT INTO allergins (name, created_at, updated_at, issyncronized, isdeleted)
      VALUES (?, ?, ?, 0, 0)
    `);
    
    const now = new Date().toISOString();
    const result = stmt.run(allergin.name, now, now);
    
    console.log(`   ✅ Added: ${allergin.name} (ID: ${result.lastInsertRowid})`);
  }
  
  // Verify allergins were created
  console.log('\n📊 Current allergins:');
  const allergins = db.prepare('SELECT * FROM allergins WHERE isdeleted = 0').all();
  allergins.forEach((allergin, index) => {
    console.log(`   ${index + 1}. ID: ${allergin.id}, Name: ${allergin.name}`);
  });
  
  console.log('\n✅ Test allergins created successfully!');
  
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}

db.close(); 