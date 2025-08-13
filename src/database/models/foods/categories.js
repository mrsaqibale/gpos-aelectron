import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../pos.db');
const db = new Database(dbPath);

// Get categories by restaurant (hotel) id
export function getCategoryByRestaurantId(hotel_id) {
  const stmt = db.prepare('SELECT * FROM categories WHERE hotel_id = ? AND isDelete = 0');
  const categories = stmt.all(hotel_id);
  return { success: true, data: categories };
}

// Get active categories by restaurant (hotel) id
export function getActiveCategoriesByRestaurantId(hotel_id) {
  const stmt = db.prepare('SELECT * FROM categories WHERE hotel_id = ? AND status = 1 AND isDelete = 0 ORDER BY name ASC');
  const categories = stmt.all(hotel_id);
  return { success: true, data: categories };
}

// Create a new category
export function createCategory({ name, image, parent_id, position, status, priority, slug, description, hotel_id }) {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO categories (name, image, parent_id, position, status, priority, slug, description, hotel_id, issyncronized, isDelete, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
  `);
  const info = stmt.run(name, image, parent_id, position, status, priority, slug, description, hotel_id, now, now);
  return info.lastInsertRowid;
}

// Update a category
export function updateCategory(id, updates) {
  const fields = [];
  const values = [];
  for (const key in updates) {
    fields.push(`${key} = ?`);
    values.push(updates[key]);
  }
  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  const sql = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);
  const stmt = db.prepare(sql);
  return stmt.run(...values);
}

// Get category by id
export function getCategoryById(id) {
  const stmt = db.prepare('SELECT * FROM categories WHERE id = ? AND isDelete = 0');
  return stmt.get(id);
}