import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../pos.db');
const db = new Database(dbPath);

// Create a new category-ingredient relationship
export function createCategoryIngredient(data) {
  try {
    const { category_id, ingredient_id, status = 1 } = data;
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO category_ingredients (category_id, ingredient_id, status, isdeleted, issyncronized, created_at, updated_at)
      VALUES (?, ?, ?, 0, 0, ?, ?)
    `);
    
    const result = stmt.run(category_id, ingredient_id, status, now, now);
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    console.error('Error creating category ingredient:', error);
    return { success: false, message: error.message };
  }
}

// Get ingredients by category
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

// Check if ingredient already exists in category
export function checkIngredientInCategory(categoryId, ingredientId) {
  try {
    const stmt = db.prepare(`
      SELECT id FROM category_ingredients 
      WHERE category_id = ? AND ingredient_id = ? AND isdeleted = 0
    `);
    
    const result = stmt.get(categoryId, ingredientId);
    return { success: true, exists: !!result };
  } catch (error) {
    console.error('Error checking ingredient in category:', error);
    return { success: false, message: error.message };
  }
}

// Update category ingredient relationship
export function updateCategoryIngredient(id, updates) {
  try {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id') {
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
    
    const sql = `UPDATE category_ingredients SET ${fields.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    
    if (result.changes > 0) {
      return { success: true, message: 'Category ingredient updated successfully' };
    } else {
      return { success: false, message: 'Category ingredient not found or no changes made' };
    }
  } catch (error) {
    console.error('Error updating category ingredient:', error);
    return { success: false, message: error.message };
  }
}

// Delete category ingredient relationship (soft delete)
export function deleteCategoryIngredient(id) {
  try {
    const stmt = db.prepare(`
      UPDATE category_ingredients 
      SET isdeleted = 1, updated_at = ? 
      WHERE id = ?
    `);
    
    const result = stmt.run(new Date().toISOString(), id);
    
    if (result.changes > 0) {
      return { success: true, message: 'Category ingredient deleted successfully' };
    } else {
      return { success: false, message: 'Category ingredient not found' };
    }
  } catch (error) {
    console.error('Error deleting category ingredient:', error);
    return { success: false, message: error.message };
  }
}

// Get all category ingredients
export function getAllCategoryIngredients() {
  try {
    const stmt = db.prepare(`
      SELECT ci.id, ci.category_id, ci.ingredient_id, ci.status, ci.created_at, ci.updated_at,
             c.name as category_name, i.name as ingredient_name
      FROM category_ingredients ci
      INNER JOIN categories c ON ci.category_id = c.id
      INNER JOIN ingredients i ON ci.ingredient_id = i.id
      WHERE ci.isdeleted = 0 AND c.isDelete = 0 AND i.isdeleted = 0
      ORDER BY c.name ASC, i.name ASC
    `);
    
    const categoryIngredients = stmt.all();
    return { success: true, data: categoryIngredients };
  } catch (error) {
    console.error('Error getting all category ingredients:', error);
    return { success: false, message: error.message };
  }
} 