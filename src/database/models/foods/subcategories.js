import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../pos.db');
const db = new Database(dbPath);

// Get subcategories by category id
export function getSubcategoriesByCategory(category_id) {
  const stmt = db.prepare('SELECT * FROM subcategories WHERE category_id = ? AND isDelete = 0');
  const subcategories = stmt.all(category_id);
  return { success: true, data: subcategories };
}

// Create a new subcategory
export function createSubcategory({ name, image, parent_id, category_id, position, status, priority, slug, description }) {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO subcategories (name, image, parent_id, category_id, position, status, priority, slug, description, isSyncronized, isDelete, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
  `);
  const info = stmt.run(name, image, parent_id, category_id, position, status, priority, slug, description, now, now);
  return info.lastInsertRowid;
}
// Update a subcategory
export function updateSubcategory(id, updates) {
  const fields = [];
  const values = [];
  for (const key in updates) {
    fields.push(`${key} = ?`);
    values.push(updates[key]);
  }
  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  const sql = `UPDATE subcategories SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);
  const stmt = db.prepare(sql);
  return stmt.run(...values);
}

// Get subcategories by hotel id only
export function getSubcategoriesByHotelId(hotel_id) {
  const stmt = db.prepare(`
    SELECT s.*, c.name as category_name 
    FROM subcategories s 
    JOIN categories c ON s.category_id = c.id 
    WHERE c.hotel_id = ? AND s.isDelete = 0 AND c.isDelete = 0
    ORDER BY s.position ASC
  `);
  const subcategories = stmt.all(hotel_id);
  return { success: true, data: subcategories };
}

// Get subcategory by id
export function getSubcategoryById(id) {
  const stmt = db.prepare('SELECT * FROM subcategories WHERE id = ? AND isDelete = 0');
  return stmt.get(id);
}