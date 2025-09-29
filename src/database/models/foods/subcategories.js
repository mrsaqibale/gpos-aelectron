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