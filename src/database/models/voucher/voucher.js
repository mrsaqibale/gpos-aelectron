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
    
    // Current location: src/database/models/voucher/
    // Target: src/database/ (go up 2 levels)
    const devPath = path.join(__dirname, '../../', relativePath);
    
    // For built app: resources/database/models/voucher -> resources/database
    const builtPath = path.join(process.resourcesPath || '', 'database', relativePath);
    
    console.log(`[voucher.js] Looking for: ${relativePath}`);
    console.log(`[voucher.js] Current dir: ${__dirname}`);
    console.log(`[voucher.js] isBuiltApp: ${isBuiltApp}`);
    console.log(`[voucher.js] Dev path: ${devPath}`);
    console.log(`[voucher.js] Built path: ${builtPath}`);
    
    if (isBuiltApp && process.resourcesPath && fs.existsSync(builtPath)) {
      console.log(`✅ [voucher.js] Found at built path: ${builtPath}`);
      return builtPath;
    } else if (fs.existsSync(devPath)) {
      console.log(`✅ [voucher.js] Found at dev path: ${devPath}`);
      return devPath;
    } else {
      console.log(`❌ [voucher.js] Not found, using dev path: ${devPath}`);
      return devPath;
    }
  } catch (error) {
    console.error(`[voucher.js] Failed to resolve path: ${relativePath}`, error);
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

// Create voucher
export function createVoucher(data) {
  try {
    const {
      title = null,
      start_date = null,
      end_date = null,
      voucher_code = null,
      amount = null,
      event = null,
      email = null,
      phone_no = null,
      name = null,
      status = 1,
      added_by = null
    } = data;

    const stmt = db.prepare(`
      INSERT INTO voucher (
        title, start_date, end_date, voucher_code, amount, 
        event, email, phone_no, name, status, added_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title, start_date, end_date, voucher_code, amount,
      event, email, phone_no, name, status, added_by
    );

    return {
      success: true,
      id: result.lastInsertRowid,
      message: 'Voucher created successfully'
    };
  } catch (error) {
    console.error('Error creating voucher:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// Update voucher
export function updateVoucher(id, updates) {
  try {
    const allowedFields = [
      'title', 'start_date', 'end_date', 'voucher_code', 'amount',
      'event', 'email', 'phone_no', 'name', 'status', 'updated_at'
    ];

    const updateFields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      return {
        success: false,
        message: 'No valid fields to update'
      };
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = ?');
    values.push(new Date().toISOString());

    // Add id for WHERE clause
    values.push(id);

    const stmt = db.prepare(`
      UPDATE voucher 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND isDeleted = 0
    `);

    const result = stmt.run(...values);

    if (result.changes === 0) {
      return {
        success: false,
        message: 'Voucher not found or already deleted'
      };
    }

    return {
      success: true,
      message: 'Voucher updated successfully'
    };
  } catch (error) {
    console.error('Error updating voucher:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// Get all vouchers (excluding deleted ones)
export function getAllVouchers() {
  try {
    const stmt = db.prepare(`
      SELECT v.*, e.fname as employee_fname, e.lname as employee_lname
      FROM voucher v
      LEFT JOIN employee e ON v.added_by = e.id
      WHERE v.isDeleted = 0
      ORDER BY v.created_at DESC
    `);

    const vouchers = stmt.all();
    return {
      success: true,
      data: vouchers
    };
  } catch (error) {
    console.error('Error getting all vouchers:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// Get voucher by ID
export function getVoucherById(id) {
  try {
    const stmt = db.prepare(`
      SELECT v.*, e.fname as employee_fname, e.lname as employee_lname
      FROM voucher v
      LEFT JOIN employee e ON v.added_by = e.id
      WHERE v.id = ? AND v.isDeleted = 0
    `);

    const voucher = stmt.get(id);
    
    if (!voucher) {
      return {
        success: false,
        message: 'Voucher not found'
      };
    }

    return {
      success: true,
      data: voucher
    };
  } catch (error) {
    console.error('Error getting voucher by ID:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// Delete voucher (soft delete)
export function deleteVoucher(id) {
  try {
    const stmt = db.prepare(`
      UPDATE voucher 
      SET isDeleted = 1, updated_at = ?
      WHERE id = ? AND isDeleted = 0
    `);

    const result = stmt.run(new Date().toISOString(), id);

    if (result.changes === 0) {
      return {
        success: false,
        message: 'Voucher not found or already deleted'
      };
    }

    return {
      success: true,
      message: 'Voucher deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting voucher:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// Search voucher by code
export function searchVoucherByCode(code) {
  try {
    const stmt = db.prepare(`
      SELECT v.*, e.fname as employee_fname, e.lname as employee_lname
      FROM voucher v
      LEFT JOIN employee e ON v.added_by = e.id
      WHERE v.voucher_code = ? AND v.isDeleted = 0
    `);

    const voucher = stmt.get(code);
    
    if (!voucher) {
      return {
        success: false,
        message: 'Voucher not found'
      };
    }

    return {
      success: true,
      data: voucher
    };
  } catch (error) {
    console.error('Error searching voucher by code:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

 