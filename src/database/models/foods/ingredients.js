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

// Get active categories (status = 1)
export function getActiveCategories(hotelId = null) {
  try {
    let sql = `
      SELECT id, name, status 
      FROM categories 
      WHERE status = 1 AND isDelete = 0
    `;
    
    let params = [];
    
    if (hotelId) {
      sql += ` AND hotel_id = ?`;
      params.push(hotelId);
    }
    
    sql += ` ORDER BY name ASC`;
    
    const stmt = db.prepare(sql);
    const categories = stmt.all(...params);
    return { success: true, data: categories };
  } catch (error) {
    console.error('Error getting active categories:', error);
    return { success: false, message: error.message };
  }
}

// Create category-ingredient relationship
export function createCategoryIngredient(categoryId, ingredientId) {
  try {
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO category_ingredients (category_id, ingredient_id, status, isdeleted, issyncronized, created_at, updated_at)
      VALUES (?, ?, 1, 0, 0, ?, ?)
    `);
    
    const result = stmt.run(categoryId, ingredientId, now, now);
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    console.error('Error creating category-ingredient relationship:', error);
    return { success: false, message: error.message };
  }
}

// Check if category-ingredient relationship exists
export function checkCategoryIngredientExists(categoryId, ingredientId) {
  try {
    const stmt = db.prepare(`
      SELECT id FROM category_ingredients 
      WHERE category_id = ? AND ingredient_id = ? AND isdeleted = 0
    `);
    
    const result = stmt.get(categoryId, ingredientId);
    return { success: true, exists: !!result };
  } catch (error) {
    console.error('Error checking category-ingredient relationship:', error);
    return { success: false, message: error.message };
  }
}

// Get ingredients by category with pagination
export function getIngredientsByCategoryPaginated(categoryId, limit = 50, offset = 0) {
  try {
    const stmt = db.prepare(`
      SELECT i.id, i.name, i.status, ci.status as relationship_status
      FROM ingredients i
      INNER JOIN category_ingredients ci ON i.id = ci.ingredient_id
      WHERE ci.category_id = ? AND ci.isdeleted = 0 AND i.isdeleted = 0
      ORDER BY i.name ASC
      LIMIT ? OFFSET ?
    `);
    
    const ingredients = stmt.all(categoryId, limit, offset);
    return { success: true, data: ingredients };
  } catch (error) {
    console.error('Error getting ingredients by category:', error);
    return { success: false, message: error.message };
  }
}

// Remove category-ingredient relationship (soft delete)
export function removeCategoryIngredient(categoryId, ingredientId) {
  try {
    const stmt = db.prepare(`
      UPDATE category_ingredients 
      SET isdeleted = 1, updated_at = ? 
      WHERE category_id = ? AND ingredient_id = ? AND isdeleted = 0
    `);
    
    const result = stmt.run(new Date().toISOString(), categoryId, ingredientId);
    
    if (result.changes > 0) {
      return { success: true, message: 'Category-ingredient relationship removed successfully' };
    } else {
      return { success: false, message: 'Category-ingredient relationship not found' };
    }
  } catch (error) {
    console.error('Error removing category-ingredient relationship:', error);
    return { success: false, message: error.message };
  }
}

// Get all ingredients with their category information
export function getAllIngredientsWithCategories() {
  try {
    const stmt = db.prepare(`
      SELECT 
        i.id, 
        i.name, 
        i.status, 
        i.created_at, 
        i.updated_at,
        c.id as category_id,
        c.name as category_name
      FROM ingredients i
      LEFT JOIN category_ingredients ci ON i.id = ci.ingredient_id AND ci.isdeleted = 0
      LEFT JOIN categories c ON ci.category_id = c.id AND c.isDelete = 0
      WHERE i.isdeleted = 0
      ORDER BY i.name ASC
    `);
    
    const ingredients = stmt.all();
    return { success: true, data: ingredients };
  } catch (error) {
    console.error('Error getting all ingredients with categories:', error);
    return { success: false, message: error.message };
  }
} 