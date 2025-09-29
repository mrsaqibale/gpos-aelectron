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

// Create a new register entry
export function createRegister(data) {
  try {
    const { startamount, employee_id } = data;
    
    if (startamount === undefined || startamount === null || startamount === '' || !employee_id) {
      return errorResponse('Start amount and employee ID are required');
    }

    const stmt = db.prepare(`
      INSERT INTO register (startamount, employee_id, isopen, isclosed, openat, created_at)
      VALUES (?, ?, 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(startamount, employee_id);
    
    return {
      success: true,
      data: {
        id: result.lastInsertRowid,
        startamount,
        employee_id,
        isopen: 1,
        isclosed: 0,
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
      SET endamount = ?, isopen = 0, isclosed = 1, closeat = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
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
    const allowedFields = ['startamount', 'endamount', 'issyncronized', 'isopen', 'isclosed', 'openat', 'closeat'];
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

// Check register status (isopen or isclosed)
export function checkRegisterStatus(id) {
  try {
    const stmt = db.prepare(`
      SELECT r.id, r.isopen, r.isclosed, e.fname, e.lname, e.roll as employee_role
      FROM register r
      LEFT JOIN employee e ON r.employee_id = e.id
      WHERE r.id = ? AND r.isdeleted = 0
    `);
    
    const register = stmt.get(id);
    
    if (!register) {
      return errorResponse('Register not found');
    }

    // Determine status
    let status = 'unknown';
    if (register.isopen === 1 && register.isclosed === 0) {
      status = 'open';
    } else if (register.isopen === 0 && register.isclosed === 1) {
      status = 'closed';
    } else if (register.isopen === 0 && register.isclosed === 0) {
      status = 'inactive';
    }

    return {
      success: true,
      data: {
        id: register.id,
        status: status,
        isopen: register.isopen === 1,
        isclosed: register.isclosed === 1,
        employee_name: `${register.fname} ${register.lname}`,
        employee_role: register.employee_role
      }
    };
  } catch (error) {
    console.error('Error checking register status:', error);
    return errorResponse('Failed to check register status');
  }
}

// Get the last register entry
export function getLastRegister() {
  try {
    const stmt = db.prepare(`
      SELECT r.*, e.fname, e.lname, e.roll as employee_role
      FROM register r
      LEFT JOIN employee e ON r.employee_id = e.id
      WHERE r.isdeleted = 0
      ORDER BY r.created_at DESC
      LIMIT 1
    `);
    
    const register = stmt.get();
    
    return {
      success: true,
      data: register || null
    };
  } catch (error) {
    console.error('Error getting last register:', error);
    return errorResponse('Failed to get last register');
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