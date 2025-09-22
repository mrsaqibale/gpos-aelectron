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
const db = new Database(dbPath);

// Ensure uploads directory exists
const uploadsDir = getDynamicPath('uploads');
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
      const fullPath = getDynamicPath(imagePath);
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

// Get category image
export function getCategoryImage(imagePath) {
  try {
    if (!imagePath || !imagePath.startsWith('uploads/')) {
      return { success: false, message: 'Invalid image path' };
    }
    
    // Use dynamic path resolution
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
        data: `data:${mimeType};base64,${base64Data}` 
      };
    } else {
      return { success: false, message: 'Image not found' };
    }
  } catch (error) {
    console.error('Error getting category image:', error);
    return { success: false, message: error.message };
  }
}