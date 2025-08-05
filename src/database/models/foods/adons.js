import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../pos.db');
const db = new Database(dbPath);

// Get adons by hotel (restaurant) id only name, price stock type ,stock and status
export function getAdonsByHotelId(hotel_id) 
{
  const stmt = db.prepare(`
    SELECT id, name, price, stock_type, addon_stock, status 
    FROM adons 
    WHERE restaurant_id = ? AND isdeleted = 0
  `);
  // const stmt = db.prepare('SELECT * FROM adons WHERE restaurant_id = ? AND isdeleted = 0');
  return stmt.all(hotel_id);
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


