import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../pos.db');
const db = new Database(dbPath);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
const categoryUploadsDir = path.join(uploadsDir, 'category');

// Create directories if they don't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(categoryUploadsDir)) {
  fs.mkdirSync(categoryUploadsDir, { recursive: true });
}

// Helper function to save image file
function saveImageFile(base64Data, originalFilename) {
  try {
    // Remove data URL prefix if present
    const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(originalFilename) || '.png';
    const filename = `category_${timestamp}${fileExtension}`;
    const filePath = path.join(categoryUploadsDir, filename);
    
    // Save file
    fs.writeFileSync(filePath, base64Image, 'base64');
    
    // Return relative path for database storage
    return `uploads/category/${filename}`;
  } catch (error) {
    console.error('Error saving image file:', error);
    throw error;
  }
}

// Helper function to delete old image file
function deleteImageFile(imagePath) {
  try {
    if (imagePath && imagePath.startsWith('uploads/')) {
      const fullPath = path.join(__dirname, '../../', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  } catch (error) {
    console.error('Error deleting image file:', error);
  }
}

// Get categories by restaurant (hotel) id
export function getCategoryByRestaurantId(hotel_id) {
  const stmt = db.prepare('SELECT * FROM categories WHERE hotel_id = ? AND isDelete = 0');
  const categories = stmt.all(hotel_id);
  return { success: true, data: categories };
}

// Create a new category
export function createCategory({ name, image, parent_id, position, status, priority, slug, description, hotel_id, originalFilename }) {
  try {
    let imagePath = null;
    
    // Save image file if provided
    if (image && originalFilename) {
      imagePath = saveImageFile(image, originalFilename);
    }
    
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO categories (name, image, parent_id, position, status, priority, slug, description, hotel_id, issyncronized, isDelete, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
    `);
    const info = stmt.run(name, imagePath, parent_id, position, status, priority, slug, description, hotel_id, now, now);
    return { success: true, id: info.lastInsertRowid };
  } catch (error) {
    console.error('Error creating category:', error);
    return { success: false, message: error.message };
  }
}

// Update a category
export function updateCategory(id, updates, originalFilename = null) {
  try {
    // Get current category to check if image needs to be updated
    const currentCategory = getCategoryById(id);
    if (!currentCategory) {
      return { success: false, message: 'Category not found' };
    }
    
    // Handle image update
    if (updates.image && originalFilename) {
      // Delete old image file if it exists
      if (currentCategory.image) {
        deleteImageFile(currentCategory.image);
      }
      
      // Save new image file
      updates.image = saveImageFile(updates.image, originalFilename);
    }
    
    const fields = [];
    const values = [];
    for (const key in updates) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    const sql = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    
    return { success: true, changes: result.changes };
  } catch (error) {
    console.error('Error updating category:', error);
    return { success: false, message: error.message };
  }
}

// Get category by id
export function getCategoryById(id) {
  const stmt = db.prepare('SELECT * FROM categories WHERE id = ? AND isDelete = 0');
  return stmt.get(id);
}