import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../../pos.db');

console.log('🔍 TESTING DATABASE CONNECTION\n');
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  console.log('✅ Database connected successfully');
  
  // Check if allergins table exists
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('\n📋 All tables:');
  tables.forEach(table => {
    console.log(`   - ${table.name}`);
  });
  
  // Check allergins table specifically
  const allerginsExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='allergins'").get();
  if (allerginsExists) {
    console.log('\n✅ Allergins table exists');
    
    // Try to insert a test allergin
    const stmt = db.prepare(`
      INSERT INTO allergins (name, description, created_at, updated_at, issyncronized, isdeleted)
      VALUES (?, ?, ?, ?, 0, 0)
    `);
    
    const now = new Date().toISOString();
    const result = stmt.run('Test Allergin', 'Test description', now, now);
    console.log('✅ Test allergin inserted with ID:', result.lastInsertRowid);
    
  } else {
    console.log('\n❌ Allergins table does not exist');
  }
  
  db.close();
  
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
} 