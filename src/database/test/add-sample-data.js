import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../pos.db');

export function addSampleFloorAndTableData() {
  try {
    console.log('Adding sample floor and table data...');
    const db = new Database(dbPath);
    
    // Check if floors exist
    const floorCount = db.prepare('SELECT COUNT(*) as count FROM floor WHERE isdeleted = 0').get();
    console.log('Current floor count:', floorCount.count);
    
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
    
    db.close();
    return { success: true, message: 'Sample data added successfully' };
  } catch (error) {
    console.error('Error adding sample data:', error);
    return { success: false, error: error.message };
  }
}

// Export for use in Electron
export default addSampleFloorAndTableData;
