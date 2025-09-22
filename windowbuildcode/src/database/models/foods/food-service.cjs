const path = require('path');
const fs = require('fs');
const { getDatabase, getUploadsPath } = require('../../database-service.cjs');

// Create food item
function createFood(foodData) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      INSERT INTO food (name, description, price, category_id, image, status, restaurant_id, created_at, updated_at, issyncronized, isdeleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
    `);
    
    const now = new Date().toISOString();
    const result = stmt.run(
      foodData.name,
      foodData.description || '',
      foodData.price || 0,
      foodData.category_id || 1,
      foodData.image || null,
      foodData.status || 1,
      foodData.restaurant_id || 1,
      now,
      now
    );
    
    return { success: true, food_id: result.lastInsertRowid };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// Get food by ID
function getFoodById(id) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare('SELECT * FROM food WHERE id = ? AND isdeleted = 0');
    const food = stmt.get(id);
    
    if (!food) {
      return { success: false, message: 'Food not found.' };
    }
    
    return { success: true, data: food };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// Get all foods
function getAllFoods(restaurantId = 1) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT f.*, c.name as category_name 
      FROM food f 
      LEFT JOIN categories c ON f.category_id = c.id 
      WHERE f.restaurant_id = ? AND f.isdeleted = 0 
      ORDER BY f.created_at DESC
    `);
    
    const foods = stmt.all(restaurantId);
    return { success: true, data: foods };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// Delete food
function deleteFood(id) {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare('UPDATE food SET isdeleted = 1, updated_at = ? WHERE id = ?');
    const result = stmt.run(new Date().toISOString(), id);
    
    if (result.changes === 0) {
      return { success: false, message: 'No food deleted.' };
    }
    
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// Save image file
function saveImageFile(fileBuffer, filename) {
  try {
    const uploadsDir = getUploadsPath('food');
    const filePath = path.join(uploadsDir, filename);
    
    fs.writeFileSync(filePath, fileBuffer);
    return { success: true, path: `uploads/food/${filename}` };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// Delete food image
function deleteFoodImage(imagePath) {
  try {
    if (!imagePath || !imagePath.startsWith('uploads/')) {
      return { success: false, message: 'Invalid image path' };
    }
    
    const uploadsDir = getUploadsPath();
    const fullPath = path.join(uploadsDir, imagePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return { success: true };
    } else {
      return { success: false, message: 'Image file not found' };
    }
  } catch (err) {
    return { success: false, message: err.message };
  }
}

module.exports = {
  createFood,
  getFoodById,
  getAllFoods,
  deleteFood,
  saveImageFile,
  deleteFoodImage
};
