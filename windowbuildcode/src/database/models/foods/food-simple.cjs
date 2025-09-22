const path = require('path');
const fs = require('fs');
const dbWrapper = require('../../simple-db-wrapper.cjs');

// Universal error response
function errorResponse(message) {
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
  return status === 1 ? 1 : 0;
}

// Helper function to save image file
function saveImageFile(imageData, foodId, originalFilename) {
  try {
    const uploadsDir = dbWrapper.getUploadsPath();
    const foodImagesDir = dbWrapper.getUploadsPath('food');
    
    // Ensure directories exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(foodImagesDir)) {
      fs.mkdirSync(foodImagesDir, { recursive: true });
    }
    
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
function createFood(foodData) {
  try {
    console.log('Creating food with basic data:', foodData.name);
    
    // Get database connection
    const db = dbWrapper.getDB();
    
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

// Get food by id
function getFoodById(id) {
  try {
    const db = dbWrapper.getDB();
    
    const foodStmt = db.prepare('SELECT * FROM food WHERE id = ? AND isdeleted = 0');
    const food = foodStmt.get(id);
    if (!food) return errorResponse('Food not found.');

    return {
      success: true,
      data: food
    };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get all foods
function getAllFoods() {
  try {
    const db = dbWrapper.getDB();
    
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
function deleteFood(id) {
  try {
    const db = dbWrapper.getDB();
    
    const stmt = db.prepare('UPDATE food SET isdeleted = 1, updated_at = ? WHERE id = ?');
    const result = stmt.run(new Date().toISOString(), id);
    if (result.changes === 0) return errorResponse('No food deleted.');
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get food image
function getFoodImage(imagePath) {
  try {
    if (!imagePath || !imagePath.startsWith('uploads/')) {
      return { success: false, message: 'Invalid image path' };
    }
    
    const uploadsDir = dbWrapper.getUploadsPath();
    const fullPath = path.join(uploadsDir, imagePath);
    
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
    return errorResponse(err.message);
  }
}

module.exports = {
  createFood,
  getFoodById,
  getAllFoods,
  deleteFood,
  getFoodImage,
  errorResponse
};
