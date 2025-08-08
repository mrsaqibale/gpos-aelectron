import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../pos.db');
const db = new Database(dbPath);

console.log('=== Checking Floor Data ===');

try {
  // Check if floor table exists
  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='floor'
  `).get();
  
  console.log('Floor table exists:', !!tableExists);
  
  if (tableExists) {
    // Check floor data
    const floors = db.prepare('SELECT * FROM floor WHERE isdeleted = 0').all();
    console.log('Floors found:', floors.length);
    
    if (floors.length > 0) {
      floors.forEach(floor => {
        console.log(`- Floor ID: ${floor.id}, Name: ${floor.name}, Type: ${floor.type}`);
      });
    } else {
      console.log('No floors found in database');
      
      // Insert sample floors if none exist
      console.log('Inserting sample floors...');
      const insertFloor = db.prepare('INSERT INTO floor (name, type, addedby) VALUES (?, ?, ?)');
      
      const floor1 = insertFloor.run('1st Floor', 'Dining', 1);
      const floor2 = insertFloor.run('2nd Floor', 'Dining', 1);
      const floor3 = insertFloor.run('3rd Floor', 'VIP', 1);
      
      console.log('Sample floors inserted successfully');
      
      // Check again
      const newFloors = db.prepare('SELECT * FROM floor WHERE isdeleted = 0').all();
      console.log('Floors after insertion:', newFloors.length);
      newFloors.forEach(floor => {
        console.log(`- Floor ID: ${floor.id}, Name: ${floor.name}, Type: ${floor.type}`);
      });
    }
  }
  
  // Check restaurant_table data
  const tableTableExists = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='restaurant_table'
  `).get();
  
  console.log('\nRestaurant table exists:', !!tableTableExists);
  
  if (tableTableExists) {
    const tables = db.prepare(`
      SELECT rt.*, f.name as floor_name
      FROM restaurant_table rt
      LEFT JOIN floor f ON rt.floor_id = f.id
      WHERE rt.isdeleted = 0
    `).all();
    
    console.log('Tables found:', tables.length);
    tables.forEach(table => {
      console.log(`- Table ID: ${table.id}, Table No: ${table.table_no}, Floor: ${table.floor_name}, Seats: ${table.seat_capacity || 4}, Status: ${table.status || 'Free'}`);
    });
  }
  
} catch (error) {
  console.error('Error checking floor data:', error);
} finally {
  db.close();
}

console.log('=== Check Complete ===');
