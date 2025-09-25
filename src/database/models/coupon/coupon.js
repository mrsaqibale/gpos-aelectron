import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic path resolution for both development and production
const getDynamicPath = (relativePath) => {
  try {
    // Check if we're in a built app (app.asar) or have resourcesPath
    const isBuiltApp = __dirname.includes('app.asar') || process.resourcesPath;
    
    // Current location: src/database/models/coupon/
    // Target: src/database/ (go up 2 levels)
    const devPath = path.join(__dirname, '../../', relativePath);
    
    // For built app: resources/database/models/coupon -> resources/database
    const builtPath = path.join(process.resourcesPath || '', 'database', relativePath);
    
    console.log(`[coupon.js] Looking for: ${relativePath}`);
    console.log(`[coupon.js] Current dir: ${__dirname}`);
    console.log(`[coupon.js] isBuiltApp: ${isBuiltApp}`);
    console.log(`[coupon.js] Dev path: ${devPath}`);
    console.log(`[coupon.js] Built path: ${builtPath}`);
    
    if (isBuiltApp && process.resourcesPath && fs.existsSync(builtPath)) {
      console.log(`✅ [coupon.js] Found at built path: ${builtPath}`);
      return builtPath;
    } else if (fs.existsSync(devPath)) {
      console.log(`✅ [coupon.js] Found at dev path: ${devPath}`);
      return devPath;
    } else {
      console.log(`❌ [coupon.js] Not found, using dev path: ${devPath}`);
      return devPath;
    }
  } catch (error) {
    console.error(`[coupon.js] Failed to resolve path: ${relativePath}`, error);
    return path.join(__dirname, '../../', relativePath);
  }
};

// Get the database path
const dbPath = getDynamicPath('pos.db');
const db = new Database(dbPath);

// Universal error response
function errorResponse(message) {
  return { success: false, message };
}

// Create a new coupon
export function createCoupon(data) {
  try {
    const { 
      title, 
      type, 
      code, 
      usage_limit = 0, 
      start_date, 
      end_date, 
      discount_type, 
      amount, 
      max_discount = 0, 
      min_purchase = 0, 
      added_by, 
      customer_id = null 
    } = data;
    
    if (!title || !type || !code || !discount_type || !amount || !added_by) {
      return errorResponse('Title, type, code, discount_type, amount, and added_by are required');
    }

    const stmt = db.prepare(`
      INSERT INTO coupon (
        title, type, code, usage_limit, start_date, end_date, discount_type, 
        amount, max_discount, min_purchase, added_by, customer_id, 
        status, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      title, type, code, usage_limit, start_date, end_date, discount_type,
      amount, max_discount, min_purchase, added_by, customer_id
    );
    
    return {
      success: true,
      data: {
        id: result.lastInsertRowid,
        title,
        type,
        code,
        usage_limit,
        start_date,
        end_date,
        discount_type,
        amount,
        max_discount,
        min_purchase,
        added_by,
        customer_id,
        status: 1
      },
      message: 'Coupon created successfully'
    };
  } catch (error) {
    console.error('Error creating coupon:', error);
    return errorResponse('Failed to create coupon');
  }
}

// Update coupon
export function updateCoupon(id, updates) {
  try {
    const allowedFields = [
      'title', 'type', 'code', 'usage_limit', 'start_date', 'end_date', 
      'discount_type', 'amount', 'max_discount', 'min_purchase', 
      'issyncronized', 'status', 'customer_id'
    ];
    const updateFields = [];
    const updateValues = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }

    if (updateFields.length === 0) {
      return errorResponse('No valid fields to update');
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    const stmt = db.prepare(`
      UPDATE coupon 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND isdeleted = 0
    `);

    const result = stmt.run(...updateValues);
    
    if (result.changes === 0) {
      return errorResponse('Coupon not found');
    }

    return {
      success: true,
      message: 'Coupon updated successfully'
    };
  } catch (error) {
    console.error('Error updating coupon:', error);
    return errorResponse('Failed to update coupon');
  }
}

// Get all coupons (only non-deleted)
export function getAllCoupons() {
  try {
    const stmt = db.prepare(`
      SELECT c.*, e.fname as added_by_name, e.lname as added_by_lname,
             cust.name as customer_name, cust.phone as customer_phone
      FROM coupon c
      LEFT JOIN employee e ON c.added_by = e.id
      LEFT JOIN customer cust ON c.customer_id = cust.id
      WHERE c.isdeleted = 0
      ORDER BY c.created_at DESC
    `);
    
    const coupons = stmt.all();
    
    return {
      success: true,
      data: coupons
    };
  } catch (error) {
    console.error('Error getting all coupons:', error);
    return errorResponse('Failed to get coupons');
  }
}

// Get coupon by ID
export function getCouponById(id) {
  try {
    const stmt = db.prepare(`
      SELECT c.*, e.fname as added_by_name, e.lname as added_by_lname,
             cust.name as customer_name, cust.phone as customer_phone
      FROM coupon c
      LEFT JOIN employee e ON c.added_by = e.id
      LEFT JOIN customer cust ON c.customer_id = cust.id
      WHERE c.id = ? AND c.isdeleted = 0
    `);
    
    const coupon = stmt.get(id);
    
    if (!coupon) {
      return errorResponse('Coupon not found');
    }

    return {
      success: true,
      data: coupon
    };
  } catch (error) {
    console.error('Error getting coupon by ID:', error);
    return errorResponse('Failed to get coupon');
  }
}

// Get coupons by customer ID
export function getCouponsByCustomerId(customerId) {
  try {
    const stmt = db.prepare(`
      SELECT c.*, e.fname as added_by_name, e.lname as added_by_lname
      FROM coupon c
      LEFT JOIN employee e ON c.added_by = e.id
      WHERE c.customer_id = ? AND c.isdeleted = 0
      ORDER BY c.created_at DESC
    `);
    
    const coupons = stmt.all(customerId);
    
    return {
      success: true,
      data: coupons
    };
  } catch (error) {
    console.error('Error getting coupons by customer ID:', error);
    return errorResponse('Failed to get customer coupons');
  }
}

// Soft delete coupon
export function deleteCoupon(id) {
  try {
    const stmt = db.prepare(`
      UPDATE coupon 
      SET isdeleted = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return errorResponse('Coupon not found');
    }

    return {
      success: true,
      message: 'Coupon deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return errorResponse('Failed to delete coupon');
  }
}

// Search coupons by code
export function searchCouponByCode(code) {
  try {
    const stmt = db.prepare(`
      SELECT c.*, e.fname as added_by_name, e.lname as added_by_lname,
             cust.name as customer_name, cust.phone as customer_phone
      FROM coupon c
      LEFT JOIN employee e ON c.added_by = e.id
      LEFT JOIN customer cust ON c.customer_id = cust.id
      WHERE c.code = ? AND c.isdeleted = 0 AND c.status = 1
    `);
    
    const coupon = stmt.get(code);
    
    return {
      success: true,
      data: coupon || null
    };
  } catch (error) {
    console.error('Error searching coupon by code:', error);
    return errorResponse('Failed to search coupon');
  }
} 