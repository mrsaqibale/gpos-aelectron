const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { getDatabasePath } = require('../database-service.cjs');

// Dynamic path resolution for both development and production
const getDbPath = () => {
  try {
    return getDatabasePath();
  } catch (error) {
    console.error('Failed to resolve database path:', error);
    throw error;
  }
};

  // Create new leave request
  ipcMain.handle('leave-request-create', async (event, leaveData) => {
    try {
      const dbPath = getDbPath();
      const db = new Database(dbPath);
      
      const {
        employee_id,
        leave_type,
        start_date,
        end_date,
        total_days,
        reason
      } = leaveData;

      const query = `
        INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, total_days, reason, created_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      const stmt = db.prepare(query);
      const result = stmt.run(employee_id, leave_type, start_date, end_date, total_days, reason);
      db.close();
      
      return { success: true, id: result.lastID };
    } catch (error) {
      console.error('Error creating leave request:', error);
      return { success: false, error: error.message };
    }
  });

// Get leave requests by employee ID
ipcMain.handle('leave-request-get-by-employee', async (event, { employeeId, status }) => {
  try {
    const db = new Database(getDbPath());
    
    let query = `
      SELECT lr.*, e.fname, e.lname, e.roll, e.employee_id
      FROM leave_requests lr
      JOIN employee e ON lr.employee_id = e.id
      WHERE lr.employee_id = ? AND lr.isdeleted = 0
    `;
    
    const params = [employeeId];
    
    if (status) {
      query += ' AND lr.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY lr.created_at DESC';
    
    const stmt = db.prepare(query);
    const result = stmt.all(...params);
    db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting leave requests by employee:', error);
    return { success: false, error: error.message };
  }
});

// Get leave request by ID
ipcMain.handle('leave-request-get-by-id', async (event, id) => {
  try {
    const db = new Database(getDbPath());
    
    const query = `
      SELECT lr.*, e.fname, e.lname, e.roll, e.employee_id
      FROM leave_requests lr
      JOIN employee e ON lr.employee_id = e.id
      WHERE lr.id = ? AND lr.isdeleted = 0
    `;
    
    const stmt = db.prepare(query);
    const result = stmt.get(id);
    db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting leave request by ID:', error);
    return { success: false, error: error.message };
  }
});

// Get all leave requests with filters
ipcMain.handle('leave-request-get-all', async (event, filters = {}) => {
  try {
    const db = new Database(getDbPath());
    
    let query = `
      SELECT lr.*, e.fname, e.lname, e.roll, e.employee_id
      FROM leave_requests lr
      JOIN employee e ON lr.employee_id = e.id
      WHERE lr.isdeleted = 0
    `;
    
    const params = [];
    
    if (filters.status) {
      query += ' AND lr.status = ?';
      params.push(filters.status);
    }
    
    if (filters.leave_type) {
      query += ' AND lr.leave_type = ?';
      params.push(filters.leave_type);
    }
    
    if (filters.start_date && filters.end_date) {
      query += ' AND lr.start_date BETWEEN ? AND ?';
      params.push(filters.start_date, filters.end_date);
    }
    
    query += ' ORDER BY lr.created_at DESC';
    
    const stmt = db.prepare(query);
    const result = stmt.all(...params);
    db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting all leave requests:', error);
    return { success: false, error: error.message };
  }
});

// Get pending leave requests
ipcMain.handle('leave-request-get-pending', async (event) => {
  try {
    const db = new Database(getDbPath());
    
    const query = `
      SELECT lr.*, e.fname, e.lname, e.roll, e.employee_id
      FROM leave_requests lr
      JOIN employee e ON lr.employee_id = e.id
      WHERE lr.status = 'pending' AND lr.isdeleted = 0
      ORDER BY lr.created_at ASC
    `;
    
    const stmt = db.prepare(query);
    const result = stmt.all();
    db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting pending leave requests:', error);
    return { success: false, error: error.message };
  }
});

// Get approved leave requests
ipcMain.handle('leave-request-get-approved', async (event, { startDate, endDate }) => {
  try {
    const db = new Database(getDbPath());
    
    let query = `
      SELECT lr.*, e.fname, e.lname, e.roll, e.employee_id
      FROM leave_requests lr
      JOIN employee e ON lr.employee_id = e.id
      WHERE lr.status = 'approved' AND lr.isdeleted = 0
    `;
    
    const params = [];
    if (startDate && endDate) {
      query += ' AND lr.start_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY lr.start_date ASC';
    
    const stmt = db.prepare(query);
    const result = stmt.all(...params);
    db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting approved leave requests:', error);
    return { success: false, error: error.message };
  }
});

// Get rejected leave requests
ipcMain.handle('leave-request-get-rejected', async (event) => {
  try {
    const db = new Database(getDbPath());
    
    const query = `
      SELECT lr.*, e.fname, e.lname, e.roll, e.employee_id
      FROM leave_requests lr
      JOIN employee e ON lr.employee_id = e.id
      WHERE lr.status = 'rejected' AND lr.isdeleted = 0
      ORDER BY lr.created_at DESC
    `;
    
    const stmt = db.prepare(query);
    const result = stmt.all();
    db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting rejected leave requests:', error);
    return { success: false, error: error.message };
  }
});

// Update leave request
ipcMain.handle('leave-request-update', async (event, { id, updateData }) => {
  try {
    const db = new Database(getDbPath());
    
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(new Date().toISOString(), id);
    
    const query = `
      UPDATE leave_requests 
      SET ${fields}, updated_at = ?
      WHERE id = ?
    `;
    
    const stmt = db.prepare(query);
    const result = stmt.run(...values);
    db.close();
    
    return { success: true, changes: result.changes };
  } catch (error) {
    console.error('Error updating leave request:', error);
    return { success: false, error: error.message };
  }
});

// Approve leave request
ipcMain.handle('leave-request-approve', async (event, { id, approvedBy, approvedAt }) => {
  try {
    const db = new Database(getDbPath());
    
    const query = `
      UPDATE leave_requests 
      SET status = 'approved', approved_by = ?, approved_at = ?, updated_at = ?
      WHERE id = ?
    `;
    
    const stmt = db.prepare(query);
    const result = stmt.run(approvedBy, approvedAt, new Date().toISOString(), id);
    db.close();
    
    return { success: true, changes: result.changes };
  } catch (error) {
    console.error('Error approving leave request:', error);
    return { success: false, error: error.message };
  }
});

// Reject leave request
ipcMain.handle('leave-request-reject', async (event, { id, rejectedBy, rejectionReason, rejectedAt }) => {
  try {
    const db = new Database(getDbPath());
    
    const query = `
      UPDATE leave_requests 
      SET status = 'rejected', approved_by = ?, rejection_reason = ?, updated_at = ?
      WHERE id = ?
    `;
    
    const stmt = db.prepare(query);
    const result = stmt.run(rejectedBy, rejectionReason, new Date().toISOString(), id);
    db.close();
    
    return { success: true, changes: result.changes };
  } catch (error) {
    console.error('Error rejecting leave request:', error);
    return { success: false, error: error.message };
  }
});

// Delete leave request (soft delete)
ipcMain.handle('leave-request-delete', async (event, id) => {
  try {
    const db = new Database(getDbPath());
    
    const query = `
      UPDATE leave_requests 
      SET isdeleted = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const stmt = db.prepare(query);
    const result = stmt.run(id);
    db.close();
    
    return { success: true, changes: result.changes };
  } catch (error) {
    console.error('Error deleting leave request:', error);
    return { success: false, error: error.message };
  }
});

// Get leave requests by date range
ipcMain.handle('leave-request-get-by-date-range', async (event, { startDate, endDate, status }) => {
  try {
    const db = new Database(getDbPath());
    
    let query = `
      SELECT lr.*, e.fname, e.lname, e.roll, e.employee_id
      FROM leave_requests lr
      JOIN employee e ON lr.employee_id = e.id
      WHERE lr.start_date BETWEEN ? AND ? AND lr.isdeleted = 0
    `;
    
    const params = [startDate, endDate];
    
    if (status) {
      query += ' AND lr.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY lr.start_date ASC';
    
    const stmt = db.prepare(query);
    const result = stmt.all(...params);
    db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting leave requests by date range:', error);
    return { success: false, error: error.message };
  }
});

// Get leave requests by type
ipcMain.handle('leave-request-get-by-type', async (event, { leaveType, startDate, endDate }) => {
  try {
    const db = new Database(getDbPath());
    
    let query = `
      SELECT lr.*, e.fname, e.lname, e.roll, e.employee_id
      FROM leave_requests lr
      JOIN employee e ON lr.employee_id = e.id
      WHERE lr.leave_type = ? AND lr.isdeleted = 0
    `;
    
    const params = [leaveType];
    
    if (startDate && endDate) {
      query += ' AND lr.start_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY lr.start_date ASC';
    
    const stmt = db.prepare(query);
    const result = stmt.all(...params);
    db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting leave requests by type:', error);
    return { success: false, error: error.message };
  }
});

// Get leave statistics
ipcMain.handle('leave-request-get-statistics', async (event, { startDate, endDate }) => {
  try {
    const db = new Database(getDbPath());
    
    let query = `
      SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        SUM(total_days) as total_days,
        leave_type,
        COUNT(*) as type_count
      FROM leave_requests 
      WHERE isdeleted = 0
    `;
    
    const params = [];
    if (startDate && endDate) {
      query += ' AND start_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += ' GROUP BY leave_type ORDER BY type_count DESC';
    
    const stmt = db.prepare(query);
    const result = stmt.all(...params);
    db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting leave request statistics:', error);
    return { success: false, error: error.message };
  }
});

// Get employee leave balance
ipcMain.handle('leave-request-get-employee-balance', async (event, { employeeId, year }) => {
  try {
    const db = new Database(getDbPath());
    
    const targetYear = year || new Date().getFullYear();
    
    const query = `
      SELECT 
        leave_type,
        SUM(CASE WHEN status = 'approved' THEN total_days ELSE 0 END) as approved_days,
        SUM(CASE WHEN status = 'pending' THEN total_days ELSE 0 END) as pending_days,
        SUM(CASE WHEN status = 'rejected' THEN total_days ELSE 0 END) as rejected_days
      FROM leave_requests 
      WHERE employee_id = ? AND strftime("%Y", start_date) = ? AND isdeleted = 0
      GROUP BY leave_type
    `;
    
    const stmt = db.prepare(query);
    const result = stmt.all(employeeId, targetYear.toString());
    db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting employee leave balance:', error);
    return { success: false, error: error.message };
  }
});

// Check if employee has overlapping leave requests
ipcMain.handle('leave-request-check-overlapping', async (event, { employeeId, startDate, endDate, excludeId }) => {
  try {
    const db = new Database(getDbPath());
    
    let query = `
      SELECT COUNT(*) as count
      FROM leave_requests 
      WHERE employee_id = ? AND isdeleted = 0
      AND (
        (start_date BETWEEN ? AND ?) OR
        (end_date BETWEEN ? AND ?) OR
        (start_date <= ? AND end_date >= ?)
      )
    `;
    
    const params = [employeeId, startDate, endDate, startDate, endDate, startDate, endDate];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const stmt = db.prepare(query);
    const result = stmt.get(...params);
    db.close();
    
    return { 
      success: true, 
      data: { 
        hasOverlapping: (result.count || 0) > 0,
        overlappingCount: result.count || 0
      }
    };
  } catch (error) {
    console.error('Error checking overlapping leave:', error);
    return { success: false, error: error.message };
  }
});

// Get leave requests summary by month
ipcMain.handle('leave-request-get-monthly-summary', async (event, { month, year }) => {
  try {
    const db = new Database(getDbPath());
    
    const monthYear = `${year}-${month.toString().padStart(2, '0')}`;
    
    const query = `
      SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        SUM(total_days) as total_days
      FROM leave_requests 
      WHERE strftime("%Y-%m", start_date) = ? AND isdeleted = 0
    `;
    
    const stmt = db.prepare(query);
    const result = stmt.get(monthYear);
    db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting monthly leave summary:', error);
    return { success: false, error: error.message };
  }
});

// Get leave requests summary by year
ipcMain.handle('leave-request-get-yearly-summary', async (event, year) => {
  try {
    const db = new Database();
    await db.connect();
    
    const query = `
      SELECT 
        strftime("%m", start_date) as month,
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        SUM(total_days) as total_days
      FROM leave_requests 
      WHERE strftime("%Y", start_date) = ? AND isdeleted = 0
      GROUP BY month
      ORDER BY month
    `;
    
    const result = await db.all(query, [year.toString()]);
    await db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting yearly leave summary:', error);
    return { success: false, error: error.message };
  }
});

// Get leave requests by status count
ipcMain.handle('leave-request-get-status-counts', async (event) => {
  try {
    const db = new Database();
    await db.connect();
    
    const query = `
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total_days) as total_days
      FROM leave_requests 
      WHERE isdeleted = 0
      GROUP BY status
      ORDER BY count DESC
    `;
    
    const result = await db.all(query);
    await db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting leave request status counts:', error);
    return { success: false, error: error.message };
  }
});

// Get leave requests that need approval
ipcMain.handle('leave-request-get-needing-approval', async (event) => {
  try {
    const db = new Database();
    await db.connect();
    
    const query = `
      SELECT lr.*, e.fname, e.lname, e.roll, e.employee_id
      FROM leave_requests lr
      JOIN employee e ON lr.employee_id = e.id
      WHERE lr.status = 'pending' AND lr.isdeleted = 0
      ORDER BY lr.created_at ASC
    `;
    
    const result = await db.all(query);
    await db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting leave requests needing approval:', error);
    return { success: false, error: error.message };
  }
});
