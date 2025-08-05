import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../../pos.db');
const db = new Database(dbPath);

console.log('🔍 CHECKING TABLE NAMES\n');

try {
  // Get all table names
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  
  console.log('📋 All tables:');
  tables.forEach((table, index) => {
    console.log(`   ${index + 1}. ${table.name}`);
  });
  
  // Check for allergin-related tables
  const allerginTables = tables.filter(t => t.name.toLowerCase().includes('allerg'));
  console.log('\n🔍 Allergin-related tables:');
  if (allerginTables.length > 0) {
    allerginTables.forEach(table => {
      console.log(`   ✅ ${table.name}`);
    });
  } else {
    console.log('   ❌ No allergin-related tables found');
  }
  
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}

db.close(); 