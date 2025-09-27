import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
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

const dbPath = getDynamicPath('pos.db');
const db = new Database(dbPath);

// Universal error response
export function errorResponse(message) {
  return { success: false, message };
}

// Create employee login session
export function createEmployeeLogin(employeeId) {
  try {
    console.log('Creating employee login session for employee_id:', employeeId);
    
    const now = new Date().toISOString();
    const loginStmt = db.prepare(`
      INSERT INTO employee_login (
        employee_id, login_time, logout_time, created_at, updated_at, 
        isSyncronized, isDeleted
      ) VALUES (?, ?, ?, ?, ?, 0, 0)
    `);
    
    const loginInfo = loginStmt.run(
      employeeId,
      now,  // login_time
      null, // logout_time
      now,  // created_at
      now   // updated_at
    );
    
    const loginId = loginInfo.lastInsertRowid;
    console.log('Employee login session created with ID:', loginId);
    
    return { 
      success: true, 
      login_id: loginId,
      login_time: now
    };
  } catch (err) {
    console.error('Error in createEmployeeLogin:', err.message);
    return errorResponse(err.message);
  }
}

// Update employee logout time
export function updateEmployeeLogout(employeeId) {
  try {
    console.log('Updating employee logout time for employee_id:', employeeId);
    
    const now = new Date().toISOString();
    
    // Find the most recent open login session for this employee
    const findOpenSessionStmt = db.prepare(`
      SELECT id FROM employee_login 
      WHERE employee_id = ? AND logout_time IS NULL AND isDeleted = 0
      ORDER BY login_time DESC 
      LIMIT 1
    `);
    
    const openSession = findOpenSessionStmt.get(employeeId);
    
    if (!openSession) {
      return errorResponse('No open login session found for this employee');
    }
    
    // Update the logout time
    const updateStmt = db.prepare(`
      UPDATE employee_login 
      SET logout_time = ?, updated_at = ?
      WHERE id = ?
    `);
    
    const updateInfo = updateStmt.run(now, now, openSession.id);
    
    console.log('Employee logout time updated for session ID:', openSession.id);
    
    return { 
      success: true, 
      session_id: openSession.id,
      logout_time: now
    };
  } catch (err) {
    console.error('Error in updateEmployeeLogout:', err.message);
    return errorResponse(err.message);
  }
}

// Get employee login sessions
export function getEmployeeLoginSessions(employeeId, limit = 50, offset = 0) {
  try {
    console.log('Getting login sessions for employee_id:', employeeId);
    
    const sessionsStmt = db.prepare(`
      SELECT * FROM employee_login 
      WHERE employee_id = ? AND isDeleted = 0
      ORDER BY login_time DESC 
      LIMIT ? OFFSET ?
    `);
    
    const sessions = sessionsStmt.all(employeeId, limit, offset);
    
    return { 
      success: true, 
      sessions: sessions
    };
  } catch (err) {
    console.error('Error in getEmployeeLoginSessions:', err.message);
    return errorResponse(err.message);
  }
}

// Get current open session for employee
export function getCurrentEmployeeSession(employeeId) {
  try {
    console.log('Getting current session for employee_id:', employeeId);
    
    const sessionStmt = db.prepare(`
      SELECT * FROM employee_login 
      WHERE employee_id = ? AND logout_time IS NULL AND isDeleted = 0
      ORDER BY login_time DESC 
      LIMIT 1
    `);
    
    const session = sessionStmt.get(employeeId);
    
    return { 
      success: true, 
      session: session
    };
  } catch (err) {
    console.error('Error in getCurrentEmployeeSession:', err.message);
    return errorResponse(err.message);
  }
}

// Get all login sessions (for admin purposes)
export function getAllLoginSessions(limit = 100, offset = 0) {
  try {
    console.log('Getting all login sessions');
    
    const sessionsStmt = db.prepare(`
      SELECT el.*, e.fname, e.lname, e.roll 
      FROM employee_login el
      JOIN employee e ON el.employee_id = e.id
      WHERE el.isDeleted = 0
      ORDER BY el.login_time DESC 
      LIMIT ? OFFSET ?
    `);
    
    const sessions = sessionsStmt.all(limit, offset);
    
    return { 
      success: true, 
      sessions: sessions
    };
  } catch (err) {
    console.error('Error in getAllLoginSessions:', err.message);
    return errorResponse(err.message);
  }
} 