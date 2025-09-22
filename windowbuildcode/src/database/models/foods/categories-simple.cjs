const dbWrapper = require('../../simple-db-wrapper.cjs');
const path = require('path');
const fs = require('fs');

// Universal error response
function errorResponse(message) {
  return { success: false, message };
}

// Create category
function createCategory(categoryData) {
  try {
    const db = dbWrapper.getDB();
    
    const stmt = db.prepare(`
      INSERT INTO categories (name, image, position, status, hotel_id, created_at, updated_at, isSyncronized, isDelete)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)
    `);
    
    const now = new Date().toISOString();
    const result = stmt.run(
      categoryData.name,
      categoryData.image || null,
      categoryData.position || 0,
      categoryData.status || 1,
      categoryData.hotel_id || 1,
      now,
      now
    );
    
    return { success: true, category_id: result.lastInsertRowid };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Update category
function updateCategory(id, categoryData) {
  try {
    const db = dbWrapper.getDB();
    
    const fields = [];
    const values = [];
    
    for (const key in categoryData) {
      if (categoryData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(categoryData[key]);
      }
    }
    
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);
    
    const sql = `UPDATE categories SET ${fields.join(', ')} WHERE id = ? AND isDelete = 0`;
    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    
    if (result.changes === 0) {
      return errorResponse('No category updated.');
    }
    
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get category by hotel ID
function getCategoryByRestaurantId(hotelId) {
  try {
    const db = dbWrapper.getDB();
    
    const stmt = db.prepare(`
      SELECT * FROM categories 
      WHERE hotel_id = ? AND isDelete = 0 
      ORDER BY position ASC, created_at DESC
    `);
    
    const categories = stmt.all(hotelId);
    return { success: true, data: categories };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get category by ID
function getCategoryById(id) {
  try {
    const db = dbWrapper.getDB();
    
    const stmt = db.prepare('SELECT * FROM categories WHERE id = ? AND isDelete = 0');
    const category = stmt.get(id);
    
    if (!category) {
      return errorResponse('Category not found.');
    }
    
    return { success: true, data: category };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get category image
function getCategoryImage(imagePath) {
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
  createCategory,
  updateCategory,
  getCategoryByRestaurantId,
  getCategoryById,
  getCategoryImage
};
