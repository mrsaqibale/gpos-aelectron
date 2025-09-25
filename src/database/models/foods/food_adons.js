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
    
    console.log(`[food_adons.js] Looking for: ${relativePath}`);
    console.log(`[food_adons.js] Current dir: ${__dirname}`);
    console.log(`[food_adons.js] isBuiltApp: ${isBuiltApp}`);
    console.log(`[food_adons.js] Dev path: ${devPath}`);
    console.log(`[food_adons.js] Built path: ${builtPath}`);
    
    if (isBuiltApp && process.resourcesPath && fs.existsSync(builtPath)) {
      console.log(`✅ [food_adons.js] Found at built path: ${builtPath}`);
      return builtPath;
    } else if (fs.existsSync(devPath)) {
      console.log(`✅ [food_adons.js] Found at dev path: ${devPath}`);
      return devPath;
    } else {
      console.log(`❌ [food_adons.js] Not found, using dev path: ${devPath}`);
      return devPath;
    }
  } catch (error) {
    console.error(`[food_adons.js] Failed to resolve path: ${relativePath}`, error);
    return path.join(__dirname, '../../', relativePath);
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