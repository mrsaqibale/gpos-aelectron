import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../pos.db');
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