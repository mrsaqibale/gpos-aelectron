import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic path resolution for both development and production
const getDynamicPath = (relativePath) => {
  try {
    // Check if we're in development by looking for src/database
    const devPath = path.join(__dirname, '../../', relativePath);
    const prodPath = path.join(__dirname, '../../../', relativePath);
    // For built app, check in the resources directory
    const builtPath = path.join(process.resourcesPath || '', 'database', relativePath);
    
    if (fs.existsSync(devPath)) {
      return devPath;
    } else if (fs.existsSync(prodPath)) {
      return prodPath;
    } else if (fs.existsSync(builtPath)) {
      return builtPath;
    } else {
      // Fallback to development path
      return devPath;
    }
  } catch (error) {
    console.error(`Failed to resolve path: ${relativePath}`, error);
    // Fallback to development path
    return path.join(__dirname, '../../', relativePath);
  }
};

const dbPath = getDynamicPath('pos.db');
const uploadsDir = getDynamicPath('uploads');
const foodImagesDir = path.join(uploadsDir, 'food');

// Create uploads directories if they don't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(foodImagesDir)) {
  fs.mkdirSync(foodImagesDir, { recursive: true });
}

const db = new Database(dbPath);

// Universal error response
export function errorResponse(message) {
  return { success: false, message };
}

// Helper function to normalize status values
function normalizeStatus(status) {
  if (status === 'active' || status === true || status === 'true') {
    return 1;
  }
  if (status === 'inactive' || status === false || status === 'false') {
    return 0;
  }
  // If it's already an integer, return as is
  return status === 1 ? 1 : 0;
}

// Helper function to save image file
function saveImageFile(imageData, foodId, originalFilename) {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(originalFilename || 'image.jpg');
    const filename = `food_${foodId}_${timestamp}${fileExtension}`;
    const filePath = path.join(foodImagesDir, filename);
    
    // If imageData is base64, decode and save
    if (imageData && imageData.startsWith('data:image')) {
      const base64Data = imageData.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);
    } else if (imageData && typeof imageData === 'string') {
      // If it's already a file path, copy to our directory
      if (fs.existsSync(imageData)) {
        fs.copyFileSync(imageData, filePath);
      } else {
        // Assume it's base64 without data URL prefix
        const buffer = Buffer.from(imageData, 'base64');
        fs.writeFileSync(filePath, buffer);
      }
    }
    
    // Return relative path for database storage
    return `uploads/food/${filename}`;
  } catch (error) {
    console.error('Error saving image file:', error);
    throw new Error('Failed to save image file');
  }
}

// Create food with basic data only (no variations)
export function createFood(foodData) {
  try {
    console.log('Creating food with basic data:', foodData.name);
    
    // First insert food to get the ID
    const now = new Date().toISOString();
    const foodStmt = db.prepare(`
      INSERT INTO food (
        name, description, image, category_id, subcategory_id, price, 
        tax, tax_type, discount, discount_type, available_time_starts, 
        available_time_ends, veg, status, restaurant_id, position, created_at, 
        updated_at, order_count, avg_rating, rating_count, rating, recommended, 
        slug, maximum_cart_quantity, is_halal, item_stock, sell_count, stock_type, 
        issynctonized, isdeleted, sku, barcode, track_inventory, inventory_enable, 
        quantity, low_inventory_threshold, product_note_enabled, product_note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Initially save without image path
    const foodInfo = foodStmt.run(
      foodData.name,
      foodData.description || null,
      null, // Initially null, will update after saving image
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
      normalizeStatus(foodData.status),
      foodData.restaurant_id || 1,
      foodData.position || 0,
      now,
      now,
      0, // order_count
      0.0, // avg_rating
      0, // rating_count
      0.0, // rating
      0, // recommended
      null, // slug
      foodData.maximum_cart_quantity || null,
      0, // is_halal
      foodData.item_stock || 0,
      foodData.sell_count || 0,
      foodData.stock_type || 'unlimited',
      0, // issynctonized
      0, // isdeleted
      foodData.sku || null,
      foodData.barcode || null,
      foodData.track_inventory || 0,
      0, // inventory_enable
      0, // quantity
      foodData.low_inventory_threshold || null,
      foodData.product_note_enabled || 0,
      foodData.product_note || null
    );
    
    const food_id = foodInfo.lastInsertRowid;
    console.log('Food created with ID:', food_id);
    
    // If image is provided, save it and update the record
    let imagePath = null;
    if (foodData.image) {
      try {
        imagePath = saveImageFile(foodData.image, food_id, foodData.originalFilename);
        
        // Update the food record with the image path
        const updateStmt = db.prepare(`
          UPDATE food SET image = ? WHERE id = ?
        `);
        updateStmt.run(imagePath, food_id);
        
        console.log('Food image saved to:', imagePath);
      } catch (imageError) {
        console.error('Error saving food image:', imageError);
        // Continue without image if saving fails
      }
    }
    
    return { 
      success: true, 
      food_id: food_id,
      imagePath: imagePath
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

    // Get adons for this food
    const adonsStmt = db.prepare(`
      SELECT a.* 
      FROM adons a
      INNER JOIN food_adons fa ON a.id = fa.adon_id
      WHERE fa.food_id = ? AND a.isdeleted = 0 AND fa.isdeleted = 0
    `);
    const adons = adonsStmt.all(id);

    // Get ingredients for this food
    const ingredientsStmt = db.prepare(`
      SELECT i.* 
      FROM ingredients i
      INNER JOIN food_ingredients fi ON i.id = fi.ingredient_id
      WHERE fi.food_id = ? AND i.isdeleted = 0 AND fi.isdeleted = 0
    `);
    const ingredients = ingredientsStmt.all(id);

    return {
      success: true,
      data: {
        ...food,
        category,
        subcategory,
        variations,
        allergins,
        adons,
        ingredients
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
      // Handle image update separately
      let imagePath = null;
      if (foodData.image) {
        try {
          // Delete old image if exists
          const oldFood = getFoodById(id);
          if (oldFood.success && oldFood.data.image) {
            const oldImagePath = getDynamicPath(oldFood.data.image);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
              console.log('Deleted old image:', oldImagePath);
            }
          }
          
          // Save new image
          imagePath = saveImageFile(foodData.image, id, foodData.originalFilename);
          foodData.image = imagePath; // Replace with file path
          console.log('New image saved to:', imagePath);
        } catch (imageError) {
          console.error('Error updating food image:', imageError);
          // Continue without image if saving fails
          delete foodData.image;
        }
      } else {
        // If no new image is provided, preserve the existing image path
        const oldFood = getFoodById(id);
        if (oldFood.success && oldFood.data.image) {
          imagePath = oldFood.data.image;
          console.log('Preserving existing image path:', imagePath);
        }
      }
      
      // Remove originalFilename from foodData as it's not a database column
      delete foodData.originalFilename;
      
      // 1. Update the food
      const fields = [];
      const values = [];
      for (const key in foodData) {
        if (foodData[key] !== undefined) { // Only include defined values
          fields.push(`${key} = ?`);
          // Convert values to proper types for SQLite
          let value = foodData[key];
          if (value === null || value === '') {
            value = null;
          } else if (typeof value === 'boolean') {
            value = value ? 1 : 0;
          } else if (key === 'status') {
            // Normalize status to integer
            value = normalizeStatus(value);
          } else if (typeof value === 'object') {
            // Skip complex objects - they should be handled separately
            continue;
          }
          values.push(value);
        }
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
              variation.is_required || false,
              new Date().toISOString(),
              new Date().toISOString()
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
      
      return { 
        success: true,
        imagePath: imagePath 
      };
    });
    
    return transaction();
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Delete food image file
export function deleteFoodImage(foodId) {
  try {
    const food = getFoodById(foodId);
    if (food.success && food.data.image) {
      const imagePath = getDynamicPath(food.data.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Deleted food image:', imagePath);
        return { success: true, message: 'Image deleted successfully' };
      }
    }
    return { success: true, message: 'No image to delete' };
  } catch (err) {
    console.error('Error deleting food image:', err);
    return errorResponse('Failed to delete image');
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

// Get food image
export function getFoodImage(imagePath) {
  try {
    if (!imagePath || !imagePath.startsWith('uploads/')) {
      return { success: false, message: 'Invalid image path' };
    }
    
    const fullPath = getDynamicPath(imagePath);
    
    // Security check
    const uploadsDir = getDynamicPath('uploads');
    if (!fullPath.startsWith(uploadsDir)) {
      return { success: false, message: 'Access denied' };
    }
    
    if (fs.existsSync(fullPath)) {
      const imageBuffer = fs.readFileSync(fullPath);
      const base64Data = imageBuffer.toString('base64');
      const ext = path.extname(fullPath).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
      return { 
        success: true,
        data: `data:${mimeType};base64,${base64Data}`,
        mimeType: mimeType
      };
    } else {
      return { success: false, message: 'Image not found' };
    }
  } catch (err) {
    console.error('Error loading food image:', err);
    return { success: false, message: 'Failed to load image' };
  }
} 

// Get all foods with isPizza = 1
export function getPizzaFoods() {
  try {
    const stmt = db.prepare(`
      SELECT * FROM food 
      WHERE isPizza = 1 AND status = 1 AND isdeleted = 0
      ORDER BY position ASC, name ASC
    `);
    
    const foods = stmt.all();
    
    return {
      success: true,
      data: foods
    };
  } catch (err) {
    return errorResponse(err.message);
  }
}

