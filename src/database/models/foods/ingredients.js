import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../pos.db');
const db = new Database(dbPath);

// Create a new ingredient
export function createIngredient(data) {
  try {
    const { name, status = 1 } = data;
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO ingredients (name, status, isdeleted, issyncronized, created_at, updated_at)
      VALUES (?, ?, 0, 0, ?, ?)
    `);
    
    const result = stmt.run(name, status, now, now);
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    console.error('Error creating ingredient:', error);
    return { success: false, message: error.message };
  }
}

// Get all ingredients
export function getAllIngredients() {
  try {
    const stmt = db.prepare(`
      SELECT id, name, status, created_at, updated_at 
      FROM ingredients 
      WHERE isdeleted = 0
      ORDER BY name ASC
    `);
    
    const ingredients = stmt.all();
    return { success: true, data: ingredients };
  } catch (error) {
    console.error('Error getting all ingredients:', error);
    return { success: false, message: error.message };
  }
}

// Get ingredient by ID
export function getIngredientById(id) {
  try {
    const stmt = db.prepare(`
      SELECT id, name, status, created_at, updated_at 
      FROM ingredients 
      WHERE id = ? AND isdeleted = 0
    `);
    
    const ingredient = stmt.get(id);
    if (ingredient) {
      return { success: true, data: ingredient };
    } else {
      return { success: false, message: 'Ingredient not found' };
    }
  } catch (error) {
    console.error('Error getting ingredient by ID:', error);
    return { success: false, message: error.message };
  }
}

// Get ingredients by category (through category_ingredients table)
export function getIngredientsByCategory(categoryId) {
  try {
    const stmt = db.prepare(`
      SELECT i.id, i.name, i.status, ci.status as relationship_status
      FROM ingredients i
      INNER JOIN category_ingredients ci ON i.id = ci.ingredient_id
      WHERE ci.category_id = ? AND ci.isdeleted = 0 AND i.isdeleted = 0
      ORDER BY i.name ASC
    `);
    
    const ingredients = stmt.all(categoryId);
    return { success: true, data: ingredients };
  } catch (error) {
    console.error('Error getting ingredients by category:', error);
    return { success: false, message: error.message };
  }
}

// Update ingredient
export function updateIngredient(id, updates) {
  try {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id') { // Don't allow updating the ID
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) {
      return { success: false, message: 'No valid fields to update' };
    }
    
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);
    
    const sql = `UPDATE ingredients SET ${fields.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    
    if (result.changes > 0) {
      return { success: true, message: 'Ingredient updated successfully' };
    } else {
      return { success: false, message: 'Ingredient not found or no changes made' };
    }
  } catch (error) {
    console.error('Error updating ingredient:', error);
    return { success: false, message: error.message };
  }
}

// Delete ingredient (soft delete)
export function deleteIngredient(id) {
  try {
    const stmt = db.prepare(`
      UPDATE ingredients 
      SET isdeleted = 1, updated_at = ? 
      WHERE id = ?
    `);
    
    const result = stmt.run(new Date().toISOString(), id);
    
    if (result.changes > 0) {
      return { success: true, message: 'Ingredient deleted successfully' };
    } else {
      return { success: false, message: 'Ingredient not found' };
    }
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    return { success: false, message: error.message };
  }
}

// Search ingredients by name
export function searchIngredientsByName(name) {
  try {
    const stmt = db.prepare(`
      SELECT id, name, status, created_at, updated_at 
      FROM ingredients 
      WHERE name LIKE ? AND isdeleted = 0
      ORDER BY name ASC
    `);
    
    const ingredients = stmt.all(`%${name}%`);
    return { success: true, data: ingredients };
  } catch (error) {
    console.error('Error searching ingredients:', error);
    return { success: false, message: error.message };
  }
} 