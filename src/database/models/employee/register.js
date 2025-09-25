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
    
    // Current location: src/database/models/employee/
    // Target: src/database/ (go up 2 levels)
    const devPath = path.join(__dirname, '../../', relativePath);
    
    // For built app: resources/database/models/employee -> resources/database
    const builtPath = path.join(process.resourcesPath || '', 'database', relativePath);
    
    console.log(`[register.js] Looking for: ${relativePath}`);
    console.log(`[register.js] Current dir: ${__dirname}`);
    console.log(`[register.js] isBuiltApp: ${isBuiltApp}`);
    console.log(`[register.js] Dev path: ${devPath}`);
    console.log(`[register.js] Built path: ${builtPath}`);
    
    if (isBuiltApp && process.resourcesPath && fs.existsSync(builtPath)) {
      console.log(`✅ [register.js] Found at built path: ${builtPath}`);
      return builtPath;
    } else if (fs.existsSync(devPath)) {
      console.log(`✅ [register.js] Found at dev path: ${devPath}`);
      return devPath;
    } else {
      console.log(`❌ [register.js] Not found, using dev path: ${devPath}`);
      return devPath;
    }
  } catch (error) {
    console.error(`[register.js] Failed to resolve path: ${relativePath}`, error);
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

// Create a new register entry
export function createRegister(data) {
  try {
    const { startamount, employee_id } = data;
    
    if (startamount === undefined || startamount === null || startamount === '' || !employee_id) {
      return errorResponse('Start amount and employee ID are required');
    }

    const stmt = db.prepare(`
      INSERT INTO register (startamount, employee_id, isopen, openat, created_at)
      VALUES (?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(startamount, employee_id);
    
    return {
      success: true,
      data: {
        id: result.lastInsertRowid,
        startamount,
        employee_id,
        isopen: 1,
        openat: new Date().toISOString()
      },
      message: 'Register opened successfully'
    };
  } catch (error) {
    console.error('Error creating register:', error);
    return errorResponse('Failed to create register entry');
  }
}

// Get register by ID
export function getRegisterById(id) {
  try {
    const stmt = db.prepare(`
      SELECT r.*, e.fname, e.lname, e.roll as employee_role
      FROM register r
      LEFT JOIN employee e ON r.employee_id = e.id
      WHERE r.id = ? AND r.isdeleted = 0
    `);
    
    const register = stmt.get(id);
    
    if (!register) {
      return errorResponse('Register not found');
    }

    return {
      success: true,
      data: register
    };
  } catch (error) {
    console.error('Error getting register by ID:', error);
    return errorResponse('Failed to get register');
  }
}

// Get all registers
export function getAllRegisters() {
  try {
    const stmt = db.prepare(`
      SELECT r.*, e.fname, e.lname, e.roll as employee_role
      FROM register r
      LEFT JOIN employee e ON r.employee_id = e.id
      WHERE r.isdeleted = 0
      ORDER BY r.created_at DESC
    `);
    
    const registers = stmt.all();
    
    return {
      success: true,
      data: registers
    };
  } catch (error) {
    console.error('Error getting all registers:', error);
    return errorResponse('Failed to get registers');
  }
}

// Get registers by employee ID
export function getRegistersByEmployeeId(employeeId) {
  try {
    const stmt = db.prepare(`
      SELECT r.*, e.fname, e.lname, e.roll as employee_role
      FROM register r
      LEFT JOIN employee e ON r.employee_id = e.id
      WHERE r.employee_id = ? AND r.isdeleted = 0
      ORDER BY r.created_at DESC
    `);
    
    const registers = stmt.all(employeeId);
    
    return {
      success: true,
      data: registers
    };
  } catch (error) {
    console.error('Error getting registers by employee ID:', error);
    return errorResponse('Failed to get employee registers');
  }
}

// Get currently open register for an employee
export function getOpenRegisterByEmployeeId(employeeId) {
  try {
    const stmt = db.prepare(`
      SELECT r.*, e.fname, e.lname, e.roll as employee_role
      FROM register r
      LEFT JOIN employee e ON r.employee_id = e.id
      WHERE r.employee_id = ? AND r.isopen = 1 AND r.isdeleted = 0
      ORDER BY r.created_at DESC
      LIMIT 1
    `);
    
    const register = stmt.get(employeeId);
    
    return {
      success: true,
      data: register || null
    };
  } catch (error) {
    console.error('Error getting open register:', error);
    return errorResponse('Failed to get open register');
  }
}

// Close register (update end amount and close time)
export function closeRegister(id, endamount) {
  try {
    if (!endamount) {
      return errorResponse('End amount is required to close register');
    }

    const stmt = db.prepare(`
      UPDATE register 
      SET endamount = ?, isopen = 0, closeat = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND isdeleted = 0
    `);

    const result = stmt.run(endamount, id);
    
    if (result.changes === 0) {
      return errorResponse('Register not found or already closed');
    }

    return {
      success: true,
      message: 'Register closed successfully'
    };
  } catch (error) {
    console.error('Error closing register:', error);
    return errorResponse('Failed to close register');
  }
}

// Update register
export function updateRegister(id, updates) {
  try {
    const allowedFields = ['startamount', 'endamount', 'issyncronized', 'isopen', 'openat', 'closeat'];
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
      UPDATE register 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND isdeleted = 0
    `);

    const result = stmt.run(...updateValues);
    
    if (result.changes === 0) {
      return errorResponse('Register not found');
    }

    return {
      success: true,
      message: 'Register updated successfully'
    };
  } catch (error) {
    console.error('Error updating register:', error);
    return errorResponse('Failed to update register');
  }
}

// Soft delete register
export function deleteRegister(id) {
  try {
    const stmt = db.prepare(`
      UPDATE register 
      SET isdeleted = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return errorResponse('Register not found');
    }

    return {
      success: true,
      message: 'Register deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting register:', error);
    return errorResponse('Failed to delete register');
  }
}

// Get register statistics
export function getRegisterStatistics(employeeId = null, startDate = null, endDate = null) {
  try {
    let query = `
      SELECT 
        COUNT(*) as total_registers,
        SUM(CASE WHEN isopen = 1 THEN 1 ELSE 0 END) as open_registers,
        SUM(CASE WHEN isopen = 0 THEN 1 ELSE 0 END) as closed_registers,
        SUM(startamount) as total_start_amount,
        SUM(endamount) as total_end_amount,
        AVG(startamount) as avg_start_amount,
        AVG(endamount) as avg_end_amount
      FROM register 
      WHERE isdeleted = 0
    `;
    
    const params = [];
    
    if (employeeId) {
      query += ' AND employee_id = ?';
      params.push(employeeId);
    }
    
    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    const stmt = db.prepare(query);
    const stats = stmt.get(...params);
    
    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('Error getting register statistics:', error);
    return errorResponse('Failed to get register statistics');
  }
} 