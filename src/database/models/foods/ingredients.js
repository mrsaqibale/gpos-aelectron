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

// Create a new ingredient
export function createIngredient(data) {
  try {
    const { name, status = 1 } = data;
    
    // First check if ingredient with same name already exists
    const checkStmt = db.prepare(`
      SELECT id FROM ingredients 
      WHERE name = ? AND isdeleted = 0
    `);
    
    const existingIngredient = checkStmt.get(name);
    
    if (existingIngredient) {
      // Return existing ingredient ID if found
      return { success: true, id: existingIngredient.id, message: 'Ingredient already exists' };
    }
    
    // If not exists, create new ingredient
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
      WHERE name LIKE ? AND isdeleted = 0 AND status = 1
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
    // First check if relationship already exists
    const checkStmt = db.prepare(`
      SELECT id FROM category_ingredients 
      WHERE category_id = ? AND ingredient_id = ? AND isdeleted = 0
    `);
    
    const existingRelationship = checkStmt.get(categoryId, ingredientId);
    
    if (existingRelationship) {
      // Return existing relationship ID if found
      return { success: true, id: existingRelationship.id, message: 'Category-ingredient relationship already exists' };
    }
    
    // If not exists, create new relationship
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

// Create food-ingredient relationship
export function createFoodIngredient(foodId, ingredientId) {
  try {
    // First check if relationship already exists
    const checkStmt = db.prepare(`
      SELECT id FROM food_ingredients 
      WHERE food_id = ? AND ingredient_id = ? AND isdeleted = 0
    `);
    
    const existingRelationship = checkStmt.get(foodId, ingredientId);
    
    if (existingRelationship) {
      // Return existing relationship ID if found
      return { success: true, id: existingRelationship.id, message: 'Food-ingredient relationship already exists' };
    }
    
    // If not exists, create new relationship
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO food_ingredients (food_id, ingredient_id, status, isdeleted, issyncronized, created_at, updated_at)
      VALUES (?, ?, 1, 0, 0, ?, ?)
    `);
    
    const result = stmt.run(foodId, ingredientId, now, now);
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    console.error('Error creating food-ingredient relationship:', error);
    return { success: false, message: error.message };
  }
}

// Get food ingredients
export function getFoodIngredients(foodId) {
  try {
    const stmt = db.prepare(`
      SELECT i.* 
      FROM ingredients i
      INNER JOIN food_ingredients fi ON i.id = fi.ingredient_id
      WHERE fi.food_id = ? AND i.isdeleted = 0 AND fi.isdeleted = 0
    `);
    const ingredients = stmt.all(foodId);
    return { success: true, data: ingredients };
  } catch (error) {
    console.error('Error getting food ingredients:', error);
    return { success: false, message: error.message };
  }
}

// Update food ingredients (replace all existing relationships)
export function updateFoodIngredients(foodId, ingredientIds) {
  try {
    const transaction = db.transaction(() => {
      // First, soft delete existing food-ingredient relationships
      const deleteStmt = db.prepare(`
        UPDATE food_ingredients 
        SET isdeleted = 1, updated_at = ? 
        WHERE food_id = ?
      `);
      deleteStmt.run(new Date().toISOString(), foodId);
      
      // Then, create new relationships
      if (ingredientIds && ingredientIds.length > 0) {
        const insertStmt = db.prepare(`
          INSERT INTO food_ingredients (food_id, ingredient_id, status, isdeleted, issyncronized, created_at, updated_at)
          VALUES (?, ?, 1, 0, 0, ?, ?)
        `);
        
        for (const ingredientId of ingredientIds) {
          insertStmt.run(foodId, ingredientId, new Date().toISOString(), new Date().toISOString());
        }
      }
      
      return { success: true };
    });
    
    return transaction();
  } catch (error) {
    console.error('Error updating food ingredients:', error);
    return { success: false, message: error.message };
  }
}

// Complex function to handle ingredient processing for food
export function processFoodIngredients(foodId, categoryId, ingredientNames) {
  try {
    console.log('processFoodIngredients called with:', { foodId, categoryId, ingredientNames });
    
    const transaction = db.transaction(() => {
      const processedIngredients = [];
      
      for (const ingredientName of ingredientNames) {
        console.log('Processing ingredient:', ingredientName);
        let ingredientId = null;
        const now = new Date().toISOString(); // Move now variable to function scope
        
        // 1. Check if ingredient already exists in ingredients table
        const checkIngredientStmt = db.prepare(`
          SELECT id FROM ingredients 
          WHERE name = ? AND isdeleted = 0
        `);
        const existingIngredient = checkIngredientStmt.get(ingredientName);
        
        if (existingIngredient) {
          // Use existing ingredient
          ingredientId = existingIngredient.id;
          console.log('Using existing ingredient:', ingredientName, 'with ID:', ingredientId);
        } else {
          // 2. Create new ingredient in ingredients table
          console.log('Creating new ingredient:', ingredientName);
          const createIngredientStmt = db.prepare(`
            INSERT INTO ingredients (name, status, isdeleted, issyncronized, created_at, updated_at)
            VALUES (?, 1, 0, 0, ?, ?)
          `);
          const ingredientResult = createIngredientStmt.run(ingredientName, now, now);
          ingredientId = ingredientResult.lastInsertRowid;
          console.log('Created ingredient with ID:', ingredientId);
        }
        
        // 3. Create category-ingredient relationship (if not exists)
        const checkCategoryIngredientStmt = db.prepare(`
          SELECT id FROM category_ingredients 
          WHERE category_id = ? AND ingredient_id = ? AND isdeleted = 0
        `);
        const existingCategoryIngredient = checkCategoryIngredientStmt.get(categoryId, ingredientId);
        
        if (!existingCategoryIngredient) {
          console.log('Creating category-ingredient relationship for category:', categoryId, 'ingredient:', ingredientId);
          const createCategoryIngredientStmt = db.prepare(`
            INSERT INTO category_ingredients (category_id, ingredient_id, status, isdeleted, issyncronized, created_at, updated_at)
            VALUES (?, ?, 1, 0, 0, ?, ?)
          `);
          createCategoryIngredientStmt.run(categoryId, ingredientId, now, now);
        } else {
          console.log('Category-ingredient relationship already exists');
        }
        
        // 4. Create food-ingredient relationship (if not exists)
        const checkFoodIngredientStmt = db.prepare(`
          SELECT id FROM food_ingredients 
          WHERE food_id = ? AND ingredient_id = ? AND isdeleted = 0
        `);
        const existingFoodIngredient = checkFoodIngredientStmt.get(foodId, ingredientId);
        
        if (!existingFoodIngredient) {
          console.log('Creating food-ingredient relationship for food:', foodId, 'ingredient:', ingredientId);
          const createFoodIngredientStmt = db.prepare(`
            INSERT INTO food_ingredients (food_id, ingredient_id, status, isdeleted, issyncronized, created_at, updated_at)
            VALUES (?, ?, 1, 0, 0, ?, ?)
          `);
          createFoodIngredientStmt.run(foodId, ingredientId, now, now);
        } else {
          console.log('Food-ingredient relationship already exists');
        }
        
        processedIngredients.push({ id: ingredientId, name: ingredientName });
      }
      
      console.log('Processed ingredients:', processedIngredients);
      return { success: true, data: processedIngredients };
    });
    
    const result = transaction();
    console.log('processFoodIngredients result:', result);
    return result;
  } catch (error) {
    console.error('Error processing food ingredients:', error);
    return { success: false, message: error.message };
  }
}

// Remove food-ingredient relationship (soft delete)
export function removeFoodIngredient(foodId, ingredientId) {
  try {
    const stmt = db.prepare(`
      UPDATE food_ingredients 
      SET isdeleted = 1, updated_at = ? 
      WHERE food_id = ? AND ingredient_id = ? AND isdeleted = 0
    `);
    
    const result = stmt.run(new Date().toISOString(), foodId, ingredientId);
    
    if (result.changes > 0) {
      return { success: true, message: 'Food-ingredient relationship removed successfully' };
    } else {
      return { success: false, message: 'Food-ingredient relationship not found' };
    }
  } catch (error) {
    console.error('Error removing food-ingredient relationship:', error);
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