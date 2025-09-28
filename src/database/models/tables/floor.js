import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic path resolution for both development and production
const getDynamicPath = (relativePath) => {
  try {
    // Check if we're in development mode
    const isDev = !__dirname.includes('app.asar') && fs.existsSync(path.join(__dirname, '../../', relativePath));
    if (isDev) {
      return path.join(__dirname, '../../', relativePath);
    }

    // For production builds, try multiple possible paths
    const possiblePaths = [
      path.join(process.resourcesPath || '', 'database', relativePath),
      path.join(process.resourcesPath || '', 'app.asar.unpacked', 'database', relativePath),
      path.join(__dirname, '..', '..', 'resources', 'database', relativePath),
      path.join(__dirname, '..', '..', 'resources', 'app.asar.unpacked', 'database', relativePath),
      path.join(process.cwd(), 'database', relativePath),
      path.join(process.cwd(), 'resources', 'database', relativePath),
      path.join(__dirname, '../../', relativePath) // Fallback to relative path
    ];

    console.log(`[${path.basename(__filename)}] Looking for: ${relativePath}`);
    console.log(`[${path.basename(__filename)}] Current dir: ${__dirname}`);
    console.log(`[${path.basename(__filename)}] isDev: ${isDev}`);

    for (const candidate of possiblePaths) {
      try {
        if (candidate && fs.existsSync(candidate)) {
          console.log(`✅ [${path.basename(__filename)}] Found at: ${candidate}`);
          return candidate;
        }
      } catch (_) {}
    }

    // If not found, create in user's app data directory
    const appDataBaseDir = path.join(process.env.APPDATA || process.env.HOME || '', 'GPOS System', 'database');
    if (!fs.existsSync(appDataBaseDir)) {
      fs.mkdirSync(appDataBaseDir, { recursive: true });
    }
    const finalPath = path.join(appDataBaseDir, relativePath);

    // Try to copy from any of the possible paths
    for (const candidate of possiblePaths) {
      try {
        if (candidate && fs.existsSync(candidate)) {
          fs.copyFileSync(candidate, finalPath);
          console.log(`✅ [${path.basename(__filename)}] Copied to: ${finalPath}`);
          break;
        }
      } catch (_) {}
    }

    // If still not found, create empty file
    if (!fs.existsSync(finalPath)) {
      if (relativePath.endsWith('.db')) {
        fs.writeFileSync(finalPath, '');
      } else {
        fs.mkdirSync(finalPath, { recursive: true });
      }
    }

    console.log(`✅ [${path.basename(__filename)}] Using final path: ${finalPath}`);
    return finalPath;
  } catch (error) {
    console.error(`[${path.basename(__filename)}] Failed to resolve path: ${relativePath}`, error);
    // Ultimate fallback
    const fallback = path.join(process.env.APPDATA || process.env.HOME || '', 'GPOS System', 'database', relativePath);
    const dir = path.dirname(fallback);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return fallback;
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