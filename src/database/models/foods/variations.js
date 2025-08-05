import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../pos.db');
const db = new Database(dbPath);

// Universal error response
export function errorResponse(message) {
  return { success: false, message };
}

// Create a new variation
export function createVariation({ food_id, name, type, min, max, is_required }) {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO variation (food_id, name, type, min, max, is_required, created_at, updated_at, issyncronized, isdeleted)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
  `);
  const info = stmt.run(food_id, name, type, min, max, is_required, now, now);
  return info.lastInsertRowid;
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
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO variation_options (food_id, variation_id, option_name, option_price, total_stock, stock_type, sell_count, created_at, updated_at, issyncronized, isdeleted)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
  `);
  const info = stmt.run(food_id, variation_id, option_name, option_price, total_stock, stock_type, sell_count, now, now);
  return info.lastInsertRowid;
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