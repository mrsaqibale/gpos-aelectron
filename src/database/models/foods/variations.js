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
    
    console.log(`[variations.js] Looking for: ${relativePath}`);
    console.log(`[variations.js] Current dir: ${__dirname}`);
    console.log(`[variations.js] isBuiltApp: ${isBuiltApp}`);
    console.log(`[variations.js] Dev path: ${devPath}`);
    console.log(`[variations.js] Built path: ${builtPath}`);
    
    if (isBuiltApp && process.resourcesPath && fs.existsSync(builtPath)) {
      console.log(`✅ [variations.js] Found at built path: ${builtPath}`);
      return builtPath;
    } else if (fs.existsSync(devPath)) {
      console.log(`✅ [variations.js] Found at dev path: ${devPath}`);
      return devPath;
    } else {
      console.log(`❌ [variations.js] Not found, using dev path: ${devPath}`);
      return devPath;
    }
  } catch (error) {
    console.error(`[variations.js] Failed to resolve path: ${relativePath}`, error);
    // Fallback to development path
    return path.join(__dirname, '../../', relativePath);
  }
};

const dbPath = getDynamicPath('pos.db');
const db = new Database(dbPath);

// Universal error response
function errorResponse(message) {
  return { success: false, message };
}

// Create a new variation
export function createVariation({ food_id, name, type, min, max, is_required }) {
  try {
    const now = new Date().toISOString();
    // Convert boolean to integer for SQLite compatibility
    const isRequiredInt = is_required ? 1 : 0;
    const stmt = db.prepare(`
      INSERT INTO variation (food_id, name, type, min, max, is_required, created_at, updated_at, issyncronized, isdeleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
    `);
    const info = stmt.run(food_id, name, type, min, max, isRequiredInt, now, now);
    return info.lastInsertRowid;
  } catch (err) {
    console.error('Error creating variation:', err.message);
    return null;
  }
}

// Update a variation
export function updateVariation(id, updates) {
  try {
    const fields = [];
    const values = [];
    for (const key in updates) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    const sql = `UPDATE variation SET ${fields.join(', ')} WHERE id = ? AND isdeleted = 0`;
    values.push(id);
    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    if (result.changes === 0) return errorResponse('No variation updated.');
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Create a new variation option
export function createVariationOption({ food_id, variation_id, option_name, option_price, total_stock, stock_type, sell_count }) {
  try {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO variation_options (food_id, variation_id, option_name, option_price, total_stock, stock_type, sell_count, created_at, updated_at, issyncronized, isdeleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
    `);
    const info = stmt.run(food_id, variation_id, option_name, option_price, total_stock, stock_type, sell_count, now, now);
    return info.lastInsertRowid;
  } catch (err) {
    console.error('Error creating variation option:', err.message);
    return null;
  }
}

// Update a variation option
export function updateVariationOption(id, updates) {
  try {
    const fields = [];
    const values = [];
    for (const key in updates) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    const sql = `UPDATE variation_options SET ${fields.join(', ')} WHERE id = ? AND isdeleted = 0`;
    values.push(id);
    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    if (result.changes === 0) return errorResponse('No variation option updated.');
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
} 