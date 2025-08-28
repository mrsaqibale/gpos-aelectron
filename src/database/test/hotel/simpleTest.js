import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic path resolution for both development and production
const getDynamicPath = (relativePath) => {
  try {
    // Check if we're in development by looking for src/database
    const devPath = path.join(__dirname, '../../', relativePath);
    const prodPath = path.join(__dirname, '../../../', relativePath);
    
    if (fs.existsSync(devPath)) {
      return devPath;
    } else if (fs.existsSync(prodPath)) {
      return prodPath;
    } else {
      // Fallback to development path
      return devPath;
    }
  } catch (error) {
    console.error(`Failed to resolve path: ${relativePath}`, error);
    // Fallback to development path
    return path.join(__dirname, '../../', relativePath);
  }
};

const dbPath = getDynamicPath('pos.db');
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  console.log('Database connected successfully');

  // Check if hotel table exists
  const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='hotel'");
  const tableExists = stmt.get();
  console.log('Hotel table exists:', !!tableExists);

  if (tableExists) {
    // Check if hotel table has data
    const dataStmt = db.prepare('SELECT COUNT(*) as count FROM hotel WHERE isDelete = 0');
    const dataResult = dataStmt.get();
    console.log('Hotel records count:', dataResult.count);

    // Get hotel status
    const statusStmt = db.prepare('SELECT status FROM hotel WHERE isDelete = 0 LIMIT 1');
    const statusResult = statusStmt.get();
    console.log('Hotel status:', statusResult ? statusResult.status : 'No record found');
  }

  db.close();
  console.log('Database connection closed');
} catch (error) {
  console.error('Error:', error);
}
