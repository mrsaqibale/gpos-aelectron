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

// Get adons by hotel (restaurant) id only name, price stock type ,stock and status
export function getAdonsByHotelId(hotel_id) 
{
  try {
    const stmt = db.prepare(`
      SELECT id, name, price, stock_type, addon_stock, status 
      FROM adons 
      WHERE restaurant_id = ? AND isdeleted = 0
    `);
    const adons = stmt.all(hotel_id);
    return { success: true, data: adons };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// Create a new adon
export function createAdon({ name, price, restaurant_id, stock_type, addon_stock }) {
  const now = new Date().toISOString();
  const sell_count = 0; // default value
  const stmt = db.prepare(`
    INSERT INTO adons (name, price, restaurant_id, status, stock_type, addon_stock, sell_count, issyncronized, isdeleted, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
  `);
  const info = stmt.run(name, price, restaurant_id, 1, stock_type, addon_stock, sell_count, now, now);
  return info.lastInsertRowid;
}

// Update an adon
export function updateAdon(id, updates) {
  const fields = [];
  const values = [];
  for (const key in updates) {
    fields.push(`${key} = ?`);
    values.push(updates[key]);
  }
  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  const sql = `UPDATE adons SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);
  const stmt = db.prepare(sql);
  return stmt.run(...values);
} 


