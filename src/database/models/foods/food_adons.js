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

// Helper function for error responses
function errorResponse(message) {
  return { success: false, message };
}

// Create food-adon relationship
export function createFoodAdon(foodId, adonId) {
  try {
    const stmt = db.prepare(`
      INSERT INTO food_adons (food_id, adon_id, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `);
    const result = stmt.run(foodId, adonId);
    return { success: true, id: result.lastInsertRowid };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get adons for a specific food
export function getFoodAdons(foodId) {
  try {
    const stmt = db.prepare(`
      SELECT 
        a.id, a.name, a.price, a.stock_type, a.addon_stock, a.status,
        fa.created_at as added_at
      FROM food_adons fa
      JOIN adons a ON fa.adon_id = a.id
      WHERE fa.food_id = ? AND fa.isdeleted = 0 AND a.isdeleted = 0
      ORDER BY fa.created_at ASC
    `);
    const adons = stmt.all(foodId);
    return { success: true, data: adons };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get all food-adon relationships
export function getAllFoodAdons() {
  try {
    const stmt = db.prepare(`
      SELECT 
        fa.id, fa.food_id, fa.adon_id, fa.created_at,
        f.name as food_name,
        a.name as adon_name, a.price as adon_price
      FROM food_adons fa
      JOIN food f ON fa.food_id = f.id
      JOIN adons a ON fa.adon_id = a.id
      WHERE fa.isdeleted = 0 AND f.isdeleted = 0 AND a.isdeleted = 0
      ORDER BY fa.created_at DESC
    `);
    const relationships = stmt.all();
    return { success: true, data: relationships };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Update food-adon relationships (replace all adons for a food)
export function updateFoodAdons(foodId, adonIds) {
  try {
    // Start transaction
    const transaction = db.transaction(() => {
      // First, mark all existing relationships as deleted
      const deleteStmt = db.prepare(`
        UPDATE food_adons 
        SET isdeleted = 1, updated_at = datetime('now')
        WHERE food_id = ? AND isdeleted = 0
      `);
      deleteStmt.run(foodId);

      // Then, create new relationships for the provided adon IDs
      const insertStmt = db.prepare(`
        INSERT INTO food_adons (food_id, adon_id, created_at, updated_at)
        VALUES (?, ?, datetime('now'), datetime('now'))
      `);

      for (const adonId of adonIds) {
        insertStmt.run(foodId, adonId);
      }
    });

    transaction();
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Delete a specific food-adon relationship
export function deleteFoodAdon(foodId, adonId) {
  try {
    const stmt = db.prepare(`
      UPDATE food_adons 
      SET isdeleted = 1, updated_at = datetime('now')
      WHERE food_id = ? AND adon_id = ? AND isdeleted = 0
    `);
    const result = stmt.run(foodId, adonId);
    return { success: true, changes: result.changes };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Delete all adons for a food
export function deleteAllFoodAdons(foodId) {
  try {
    const stmt = db.prepare(`
      UPDATE food_adons 
      SET isdeleted = 1, updated_at = datetime('now')
      WHERE food_id = ? AND isdeleted = 0
    `);
    const result = stmt.run(foodId);
    return { success: true, changes: result.changes };
  } catch (err) {
    return errorResponse(err.message);
  }
} 