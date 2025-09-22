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

// Create a new allergen
export function createAllergin({ name }) {
  try {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO allergins (name, created_at, updated_at, issyncronized, isdeleted)
      VALUES (?, ?, ?, 0, 0)
    `);
    const info = stmt.run(name, now, now);
    return { success: true, id: info.lastInsertRowid };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Create multiple allergens
export function createAllergins(allerginsData) {
  try {
    const now = new Date().toISOString();
    const createdIds = [];
    
    const transaction = db.transaction(() => {
      for (const allerginData of allerginsData) {
        const stmt = db.prepare(`
          INSERT INTO allergins (name, created_at, updated_at, issyncronized, isdeleted)
          VALUES (?, ?, ?, 0, 0)
        `);
        const info = stmt.run(allerginData.name, now, now);
        createdIds.push(info.lastInsertRowid);
      }
    });
    
    transaction();
    return { success: true, ids: createdIds };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get all allergens that are not deleted
export function getAllAllergins() {
  try {
    const stmt = db.prepare(`
      SELECT id, name, created_at, updated_at
      FROM allergins 
      WHERE isdeleted = 0
      ORDER BY name ASC
    `);
    const allergins = stmt.all();
    return { success: true, data: allergins };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get allergen by id
export function getAllerginById(id) {
  try {
    const stmt = db.prepare('SELECT * FROM allergins WHERE id = ? AND isdeleted = 0');
    const allergin = stmt.get(id);
    if (!allergin) return errorResponse('Allergin not found.');
    return { success: true, data: allergin };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Update an allergen
export function updateAllergin(id, updates) {
  try {
    const fields = [];
    const values = [];
    for (const key in updates) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);
    
    const sql = `UPDATE allergins SET ${fields.join(', ')} WHERE id = ? AND isdeleted = 0`;
    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    
    if (result.changes === 0) return errorResponse('No allergin updated.');
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Delete an allergen (soft delete)
export function deleteAllergin(id) {
  try {
    const stmt = db.prepare('UPDATE allergins SET isdeleted = 1, updated_at = ? WHERE id = ?');
    const result = stmt.run(new Date().toISOString(), id);
    if (result.changes === 0) return errorResponse('No allergin deleted.');
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Create allergen relationships with food
export function createAllerginWithFood({ foodIds, allerginIds }) {
  try {
    const now = new Date().toISOString();
    const createdRelationships = [];
    
    const transaction = db.transaction(() => {
      for (const foodId of foodIds) {
        for (const allerginId of allerginIds) {
          const stmt = db.prepare(`
            INSERT INTO food_allergins (food_id, allergin_id, created_at, updated_at, issyncronized, isdeleted)
            VALUES (?, ?, ?, ?, 0, 0)
          `);
          const info = stmt.run(foodId, allerginId, now, now);
          createdRelationships.push({
            id: info.lastInsertRowid,
            food_id: foodId,
            allergin_id: allerginId
          });
        }
      }
    });
    
    transaction();
    return { success: true, relationships: createdRelationships };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get allergens for a specific food
export function getFoodAllergins(foodId) {
  try {
    const stmt = db.prepare(`
      SELECT a.id, a.name, fa.id as relationship_id
      FROM allergins a
      INNER JOIN food_allergins fa ON a.id = fa.allergin_id
      WHERE fa.food_id = ? AND fa.isdeleted = 0 AND a.isdeleted = 0
      ORDER BY a.name ASC
    `);
    const allergins = stmt.all(foodId);
    return { success: true, data: allergins };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Update food allergens (remove old ones and add new ones)
export function updateFoodAllergins(foodId, allerginIds) {
  try {
    const now = new Date().toISOString();
    
    const transaction = db.transaction(() => {
      // First, soft delete all existing relationships for this food
      const deleteStmt = db.prepare(`
        UPDATE food_allergins 
        SET isdeleted = 1, updated_at = ? 
        WHERE food_id = ? AND isdeleted = 0
      `);
      deleteStmt.run(now, foodId);
      
      // Then, create new relationships
      for (const allerginId of allerginIds) {
        const insertStmt = db.prepare(`
          INSERT INTO food_allergins (food_id, allergin_id, created_at, updated_at, issyncronized, isdeleted)
          VALUES (?, ?, ?, ?, 0, 0)
        `);
        insertStmt.run(foodId, allerginId, now, now);
      }
    });
    
    transaction();
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get all food-allergin relationships
export function getAllFoodAllergins() {
  try {
    const stmt = db.prepare(`
      SELECT fa.id, fa.food_id, fa.allergin_id, 
             f.name as food_name, a.name as allergin_name
      FROM food_allergins fa
      INNER JOIN food f ON fa.food_id = f.id
      INNER JOIN allergins a ON fa.allergin_id = a.id
      WHERE fa.isdeleted = 0 AND f.isdeleted = 0 AND a.isdeleted = 0
      ORDER BY f.name ASC, a.name ASC
    `);
    const relationships = stmt.all();
    return { success: true, data: relationships };
  } catch (err) {
    return errorResponse(err.message);
  }
} 