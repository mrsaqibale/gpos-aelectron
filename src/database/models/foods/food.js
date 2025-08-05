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

// Create food with basic data only (no variations)
export function createFood(foodData) {
  try {
    console.log('Creating food with basic data:', foodData.name);
    
    const now = new Date().toISOString();
    const foodStmt = db.prepare(`
      INSERT INTO food (
        name, description, image, category_id, subcategory_id, price, 
        tax, tax_type, discount, discount_type, available_time_starts, 
        available_time_ends, veg, status, restaurant_id, position, created_at, 
        updated_at, sku, barcode, stock_type, item_stock, sell_count, 
        maximum_cart_quantity, track_inventory, low_inventory_threshold, 
        product_note_enabled, product_note, isdeleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);
    
    const foodInfo = foodStmt.run(
      foodData.name,
      foodData.description || null,
      foodData.image || null,
      foodData.category_id,
      foodData.subcategory_id || null,
      foodData.price,
      foodData.tax || 0,
      foodData.tax_type || 'percentage',
      foodData.discount || 0,
      foodData.discount_type || 'percentage',
      foodData.available_time_starts || null,
      foodData.available_time_ends || null,
      foodData.veg || 0,
      foodData.status || 'active',
      foodData.restaurant_id || 1,
      foodData.position || 0,
      now,
      now,
      foodData.sku || null,
      foodData.barcode || null,
      foodData.stock_type || 'unlimited',
      foodData.item_stock || 0,
      foodData.sell_count || 0,
      foodData.maximum_cart_quantity || null,
      foodData.track_inventory || 0,
      foodData.low_inventory_threshold || null,
      foodData.product_note_enabled || 0,
      foodData.product_note || null
    );
    
    const food_id = foodInfo.lastInsertRowid;
    console.log('Food created with ID:', food_id);
    
    return { 
      success: true, 
      food_id: food_id
    };
  } catch (err) {
    console.error('Error in createFood:', err.message);
    return errorResponse(err.message);
  }
}

// Get food by id with category, subcategory, variations, variation options, and allergins
export function getFoodById(id) {
  try {
    // Get the food item
    const foodStmt = db.prepare('SELECT * FROM food WHERE id = ? AND isdeleted = 0');
    const food = foodStmt.get(id);
    if (!food) return errorResponse('Food not found.');

    // Get category
    let category = null;
    if (food.category_id) {
      const catStmt = db.prepare('SELECT * FROM categories WHERE id = ? AND isDelete = 0');
      category = catStmt.get(food.category_id);
    }

    // Get subcategory
    let subcategory = null;
    if (food.subcategory_id) {
      const subcatStmt = db.prepare('SELECT * FROM subcategories WHERE id = ? AND isDelete = 0');
      subcategory = subcatStmt.get(food.subcategory_id);
    }

    // Get variations for this food
    const variationsStmt = db.prepare('SELECT * FROM variation WHERE food_id = ? AND isdeleted = 0');
    const variations = variationsStmt.all(id);

    // For each variation, get its options
    for (const variation of variations) {
      const optionsStmt = db.prepare('SELECT * FROM variation_options WHERE variation_id = ? AND isdeleted = 0');
      variation.options = optionsStmt.all(variation.id);
    }

    // Get allergins for this food
    const allerginsStmt = db.prepare(`
      SELECT a.* 
      FROM allergins a
      INNER JOIN food_allergins fa ON a.id = fa.allergin_id
      WHERE fa.food_id = ? AND a.isdeleted = 0 AND fa.isdeleted = 0
    `);
    const allergins = allerginsStmt.all(id);

    return {
      success: true,
      data: {
        ...food,
        category,
        subcategory,
        variations,
        allergins
      }
    };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get all allergins
export function getAllAllergins() {
  try {
    const stmt = db.prepare(`
      SELECT id, name, description, created_at, updated_at
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

// Update food with variations and variation options
export function updateFood(id, { foodData, variations = [] }) {
  try {
    const transaction = db.transaction(() => {
      // 1. Update the food
      const fields = [];
      const values = [];
      for (const key in foodData) {
        fields.push(`${key} = ?`);
        values.push(foodData[key]);
      }
      fields.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(id);
      
      const sql = `UPDATE food SET ${fields.join(', ')} WHERE id = ? AND isdeleted = 0`;
      const foodStmt = db.prepare(sql);
      const foodResult = foodStmt.run(...values);
      
      if (foodResult.changes === 0) {
        throw new Error('No food updated.');
      }
      
      // 2. Handle variations
      if (variations && variations.length > 0) {
        // First, soft delete existing variations and options
        const deleteVariationsStmt = db.prepare('UPDATE variation SET isdeleted = 1 WHERE food_id = ?');
        deleteVariationsStmt.run(id);
        
        const deleteOptionsStmt = db.prepare('UPDATE variation_options SET isdeleted = 1 WHERE food_id = ?');
        deleteOptionsStmt.run(id);
        
        // Create new variations and options
        for (const variation of variations) {
          let variationId;
          
          if (variation.id) {
            // Update existing variation
            const updateVariationStmt = db.prepare(`
              UPDATE variation 
              SET name = ?, type = ?, min = ?, max = ?, is_required = ?, updated_at = ?, isdeleted = 0
              WHERE id = ?
            `);
            updateVariationStmt.run(
              variation.name,
              variation.type || 'single',
              variation.min || 1,
              variation.max || 1,
              variation.is_required || false,
              new Date().toISOString(),
              variation.id
            );
            variationId = variation.id;
          } else {
            // Create new variation
            const variationStmt = db.prepare(`
              INSERT INTO variation (food_id, name, type, min, max, is_required, created_at, updated_at, issyncronized, isdeleted)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
            `);
            const variationInfo = variationStmt.run(
              id,
              variation.name,
              variation.type || 'single',
              variation.min || 1,
              variation.max || 1,
              variation.is_required || false
            );
            variationId = variationInfo.lastInsertRowid;
          }
          
          // Handle variation options
          if (variation.options && variation.options.length > 0) {
            for (const option of variation.options) {
              if (option.id) {
                // Update existing option
                const updateOptionStmt = db.prepare(`
                  UPDATE variation_options 
                  SET option_name = ?, option_price = ?, total_stock = ?, stock_type = ?, sell_count = ?, updated_at = ?, isdeleted = 0
                  WHERE id = ?
                `);
                updateOptionStmt.run(
                  option.option_name,
                  option.option_price || 0,
                  option.total_stock || 0,
                  option.stock_type || 'unlimited',
                  option.sell_count || 0,
                  new Date().toISOString(),
                  option.id
                );
              } else {
                // Create new option
                const optionStmt = db.prepare(`
                  INSERT INTO variation_options (food_id, variation_id, option_name, option_price, total_stock, stock_type, sell_count, created_at, updated_at, issyncronized, isdeleted)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
                `);
                const optionInfo = optionStmt.run(
                  id,
                  variationId,
                  option.option_name,
                  option.option_price || 0,
                  option.total_stock || 0,
                  option.stock_type || 'unlimited',
                  option.sell_count || 0,
                  new Date().toISOString(),
                  new Date().toISOString()
                );
              }
            }
          }
        }
      }
      
      return { success: true };
    });
    
    return transaction();
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get food by category id
export function getFoodByCategory(category_id) {
  try {
    const stmt = db.prepare(`
      SELECT 
        f.*,
        c.name as category_name,
        sc.name as subcategory_name
      FROM food f
      LEFT JOIN categories c ON f.category_id = c.id
      LEFT JOIN subcategories sc ON f.subcategory_id = sc.id
      WHERE f.category_id = ? AND f.isdeleted = 0
      ORDER BY f.created_at DESC
    `);
    const foods = stmt.all(category_id);
    return { success: true, data: foods };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get food by subcategory id
export function getFoodBySubcategory(subcategory_id) {
  try {
    const stmt = db.prepare(`
      SELECT 
        f.*,
        c.name as category_name,
        sc.name as subcategory_name
      FROM food f
      LEFT JOIN categories c ON f.category_id = c.id
      LEFT JOIN subcategories sc ON f.subcategory_id = sc.id
      WHERE f.subcategory_id = ? AND f.isdeleted = 0
      ORDER BY f.created_at DESC
    `);
    const foods = stmt.all(subcategory_id);
    return { success: true, data: foods };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get all foods with complete data for table display
export function getAllFoods() {
  try {
    const stmt = db.prepare(`
      SELECT 
        f.id,
        f.name,
        f.image,
        f.price,
        f.position,
        f.item_stock,
        f.veg,
        f.status,
        f.stock_type,
        f.sell_count,
        c.name AS category_name,
        sc.name AS subcategory_name
      FROM food f
      LEFT JOIN categories c ON f.category_id = c.id AND c.isDelete = 0
      LEFT JOIN subcategories sc ON f.subcategory_id = sc.id AND sc.isDelete = 0
      WHERE f.isdeleted = 0
      ORDER BY f.position ASC, f.created_at DESC
    `);
    const foods = stmt.all();
    return { success: true, data: foods };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Delete food (soft delete)
export function deleteFood(id) {
  try {
    const stmt = db.prepare('UPDATE food SET isdeleted = 1, updated_at = ? WHERE id = ?');
    const result = stmt.run(new Date().toISOString(), id);
    if (result.changes === 0) return errorResponse('No food deleted.');
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Update food position
export function updateFoodPosition(id, position) {
  try {
    const stmt = db.prepare('UPDATE food SET position = ?, updated_at = ? WHERE id = ? AND isdeleted = 0');
    const result = stmt.run(position, new Date().toISOString(), id);
    if (result.changes === 0) return errorResponse('No food position updated.');
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Search foods by name
export function searchFoodsByName(name, restaurant_id = 1) {
  try {
    const stmt = db.prepare(`
      SELECT 
        f.id,
        f.name,
        f.image,
        f.price,
        f.position,
        f.item_stock,
        c.name AS category_name,
        sc.name AS subcategory_name
      FROM food f
      LEFT JOIN categories c ON f.category_id = c.id AND c.isDelete = 0
      LEFT JOIN subcategories sc ON f.subcategory_id = sc.id AND sc.isDelete = 0
      WHERE f.name LIKE ? AND f.restaurant_id = ? AND f.isdeleted = 0
      ORDER BY f.position ASC, f.created_at DESC
    `);
    const foods = stmt.all(`%${name}%`, restaurant_id);
    return { success: true, data: foods };
  } catch (err) {
    return errorResponse(err.message);
  }
} 





