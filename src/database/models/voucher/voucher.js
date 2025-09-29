import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
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

 