import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic path resolution for both development and production
const getDynamicPath = (relativePath) => {
  try {
    // Check if we're in a built app (app.asar) or have resourcesPath
    const isBuiltApp = __dirname.includes('app.asar') || process.resourcesPath;
    
    // Current location: src/database/models/tables/
    // Target: src/database/ (go up 2 levels)
    const devPath = path.join(__dirname, '../../', relativePath);
    
    // For built app: resources/database/models/tables -> resources/database
    const builtPath = path.join(process.resourcesPath || '', 'database', relativePath);
    
    console.log(`[floor.js] Looking for: ${relativePath}`);
    console.log(`[floor.js] Current dir: ${__dirname}`);
    console.log(`[floor.js] isBuiltApp: ${isBuiltApp}`);
    console.log(`[floor.js] Dev path: ${devPath}`);
    console.log(`[floor.js] Built path: ${builtPath}`);
    
    if (isBuiltApp && process.resourcesPath && fs.existsSync(builtPath)) {
      console.log(`✅ [floor.js] Found at built path: ${builtPath}`);
      return builtPath;
    } else if (fs.existsSync(devPath)) {
      console.log(`✅ [floor.js] Found at dev path: ${devPath}`);
      return devPath;
    } else {
      console.log(`❌ [floor.js] Not found, using dev path: ${devPath}`);
      return devPath;
    }
  } catch (error) {
    console.error(`[floor.js] Failed to resolve path: ${relativePath}`, error);
    return path.join(__dirname, '../../', relativePath);
  }
};

const dbPath = getDynamicPath('pos.db');
const db = new Database(dbPath);

// Universal error response
export function errorResponse(message) {
  return { success: false, message };
}

// Create a new floor
export function createFloor({ name, type, addedby }) {
  try {
    const stmt = db.prepare(`
      INSERT INTO floor (name, type, addedby)
      VALUES (?, ?, ?)
    `);
    const info = stmt.run(name, type, addedby);
    return { success: true, id: info.lastInsertRowid };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Update a floor by id
export function updateFloor(id, updates) {
  try {
    const fields = [];
    const values = [];
    for (const key in updates) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    const sql = `UPDATE floor SET ${fields.join(', ')} WHERE id = ? AND isdeleted = 0`;
    values.push(id);
    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    if (result.changes === 0) return errorResponse('No floor updated.');
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get floor by id
export function getFloorById(id) {
  try {
    const stmt = db.prepare('SELECT * FROM floor WHERE id = ? AND isdeleted = 0');
    const floor = stmt.get(id);
    if (!floor) return errorResponse('Floor not found.');
    return { success: true, data: floor };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get all floors with table count
export function getAllFloors() {
  try {
    const stmt = db.prepare(`
      SELECT 
        f.*,
        COUNT(rt.id) as table_count
      FROM floor f
      LEFT JOIN restaurant_table rt ON f.id = rt.floor_id AND rt.isdeleted = 0
      WHERE f.isdeleted = 0
      GROUP BY f.id
    `);
    const floors = stmt.all();
    return { success: true, data: floors };
  } catch (err) {
    return errorResponse(err.message);
  }
} 