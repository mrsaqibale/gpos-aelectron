import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../pos.db');
const db = new Database(dbPath);

// Test function to check floor and table data
export function testFloorAndTableData() {
  try {
    console.log('Testing Floor and Table Data...');
    
    // Check floors
    const floors = db.prepare('SELECT * FROM floor WHERE isdeleted = 0').all();
    console.log('Floors found:', floors.length);
    floors.forEach(floor => {
      console.log(`- Floor ID: ${floor.id}, Name: ${floor.name}, Type: ${floor.type}`);
    });
    
    // Check tables
    const tables = db.prepare(`
      SELECT 
        rt.*,
        f.name as floor_name
      FROM restaurant_table rt
      LEFT JOIN floor f ON rt.floor_id = f.id
      WHERE rt.isdeleted = 0
    `).all();
    
    console.log('Tables found:', tables.length);
    tables.forEach(table => {
      console.log(`- Table ID: ${table.id}, Table No: ${table.table_no}, Floor: ${table.floor_name}, Seats: ${table.seat_capacity || 4}, Status: ${table.status || 'Free'}`);
    });
    
    // Check tables with status filter
    const freeTables = db.prepare(`
      SELECT 
        rt.*,
        f.name as floor_name
      FROM restaurant_table rt
      LEFT JOIN floor f ON rt.floor_id = f.id
      WHERE rt.status = 'Free' AND rt.isdeleted = 0
    `).all();
    
    console.log('Free tables found:', freeTables.length);
    freeTables.forEach(table => {
      console.log(`- Free Table: ${table.table_no} on ${table.floor_name} (${table.seat_capacity || 4} seats)`);
    });
    
    return { success: true, floors, tables, freeTables };
  } catch (error) {
    console.error('Error testing floor and table data:', error);
    return { success: false, error: error.message };
  }
}

// Function to insert sample data if none exists
export function insertSampleData() {
  try {
    console.log('Inserting sample floor and table data...');
    
    // Check if floors exist
    const floorCount = db.prepare('SELECT COUNT(*) as count FROM floor WHERE isdeleted = 0').get();
    
    if (floorCount.count === 0) {
      // Insert sample floors
      const insertFloor = db.prepare('INSERT INTO floor (name, type, addedby) VALUES (?, ?, ?)');
      
      const floor1 = insertFloor.run('1st Floor', 'Dining', 1);
      const floor2 = insertFloor.run('2nd Floor', 'Dining', 1);
      const floor3 = insertFloor.run('3rd Floor', 'VIP', 1);
      
      console.log('Sample floors inserted');
      
      // Insert sample tables
      const insertTable = db.prepare('INSERT INTO restaurant_table (table_no, floor_id, seat_capacity, status, addedby) VALUES (?, ?, ?, ?, ?)');
      
      // Tables for 1st Floor
      insertTable.run('1', floor1.lastInsertRowid, 4, 'Free', 1);
      insertTable.run('2', floor1.lastInsertRowid, 6, 'Free', 1);
      insertTable.run('3', floor1.lastInsertRowid, 2, 'Free', 1);
      insertTable.run('4', floor1.lastInsertRowid, 8, 'Free', 1);
      insertTable.run('5', floor1.lastInsertRowid, 4, 'Occupied', 1);
      
      // Tables for 2nd Floor
      insertTable.run('6', floor2.lastInsertRowid, 4, 'Free', 1);
      insertTable.run('7', floor2.lastInsertRowid, 6, 'Free', 1);
      insertTable.run('8', floor2.lastInsertRowid, 8, 'Free', 1);
      insertTable.run('9', floor2.lastInsertRowid, 2, 'Reserved', 1);
      
      // Tables for 3rd Floor
      insertTable.run('10', floor3.lastInsertRowid, 4, 'Free', 1);
      insertTable.run('11', floor3.lastInsertRowid, 6, 'Free', 1);
      insertTable.run('12', floor3.lastInsertRowid, 8, 'Free', 1);
      
      console.log('Sample tables inserted');
    } else {
      console.log('Sample data already exists');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error inserting sample data:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  insertSampleData();
  testFloorAndTableData();
}
