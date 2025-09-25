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
    
    // Current location: src/database/models/foods/
    // Target: src/database/ (go up 2 levels)
    const devPath = path.join(__dirname, '../../', relativePath);
    
    // For built app: resources/database/models/foods -> resources/database
    const builtPath = path.join(process.resourcesPath || '', 'database', relativePath);
    
    console.log(`[adons.js] Looking for: ${relativePath}`);
    console.log(`[adons.js] Current dir: ${__dirname}`);
    console.log(`[adons.js] isBuiltApp: ${isBuiltApp}`);
    console.log(`[adons.js] Dev path: ${devPath}`);
    console.log(`[adons.js] Built path: ${builtPath}`);
    
    if (isBuiltApp && process.resourcesPath && fs.existsSync(builtPath)) {
      console.log(`✅ [adons.js] Found at built path: ${builtPath}`);
      return builtPath;
    } else if (fs.existsSync(devPath)) {
      console.log(`✅ [adons.js] Found at dev path: ${devPath}`);
      return devPath;
    } else {
      console.log(`❌ [adons.js] Not found, using dev path: ${devPath}`);
      return devPath;
    }
  } catch (error) {
    console.error(`[adons.js] Failed to resolve path: ${relativePath}`, error);
    return path.join(__dirname, '../../', relativePath);
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


