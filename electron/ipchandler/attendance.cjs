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

  // Create new attendance record
  ipcMain.handle('attendance-create', async (event, attendanceData) => {
    try {
      const dbPath = getDbPath();
      const db = new Database(dbPath);
      
      const {
        employee_id,
        date,
        checkin,
        checkout,
        status,
        added_by
      } = attendanceData;

      // Get employee's hourly salary rate
      const empStmt = db.prepare('SELECT salary_per_hour, salary FROM employee WHERE id = ?');
      const emp = empStmt.get(employee_id);
      let hourlyRate = 0;
      
      if (emp) {
        // If salary_per_hour is set, use it directly
        if (emp.salary_per_hour && Number(emp.salary_per_hour) > 0) {
          hourlyRate = Number(emp.salary_per_hour);
        } 
        // Otherwise, use salary (which is already hourly rate)
        else if (emp.salary && Number(emp.salary) > 0) {
          hourlyRate = Number(emp.salary);
        }
      }
      
      // Round to 2 decimal places
      hourlyRate = Math.round(hourlyRate * 100) / 100;

      const query = `
        INSERT INTO attendance (employee_id, date, checkin, checkout, status, added_by, pay_rate, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      const stmt = db.prepare(query);
      const result = stmt.run(employee_id, date, checkin, checkout, status, added_by, hourlyRate);
      db.close();
      
      return { success: true, id: result.lastID };
    } catch (error) {
      console.error('Error creating attendance record:', error);
      return { success: false, error: error.message };
    }
  });

  // Get attendance by employee ID
  ipcMain.handle('attendance-get-by-employee', async (event, { employeeId, startDate, endDate }) => {
    try {
      const dbPath = getDbPath();
      const db = new Database(dbPath);
      
      let query = `
        SELECT a.*, e.fname, e.lname, e.roll
        FROM attendance a
        JOIN employee e ON a.employee_id = e.id
        WHERE a.employee_id = ? AND a.isdeleted = 0
      `;
      
      const params = [employeeId];
      
      if (startDate && endDate) {
        query += ' AND a.date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }
      
      query += ' ORDER BY a.date DESC';
      
      const stmt = db.prepare(query);
      const result = stmt.all(...params);
      db.close();
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting attendance by employee:', error);
      return { success: false, error: error.message };
    }
  });

  // Get attendance by date range
  ipcMain.handle('attendance-get-by-date-range', async (event, { startDate, endDate }) => {
    try {
      const dbPath = getDbPath();
      const db = new Database(dbPath);
      
      const query = `
        SELECT a.*, e.fname, e.lname, e.roll, e.id AS employee_id
        FROM attendance a
        JOIN employee e ON a.employee_id = e.id
        WHERE a.date BETWEEN ? AND ? AND a.isdeleted = 0
        ORDER BY a.date DESC, e.fname
      `;
      
      const stmt = db.prepare(query);
      const result = stmt.all(startDate, endDate);
      db.close();
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting attendance by date range:', error);
      return { success: false, error: error.message };
    }
  });

  // Get attendance by specific date
  ipcMain.handle('attendance-get-by-date', async (event, date) => {
    try {
      const dbPath = getDbPath();
      const db = new Database(dbPath);
      
      const query = `
        SELECT a.*, e.fname, e.lname, e.roll, e.id AS employee_id
        FROM attendance a
        JOIN employee e ON a.employee_id = e.id
        WHERE a.date = ? AND a.isdeleted = 0
        ORDER BY e.fname
      `;
      
      const stmt = db.prepare(query);
      const result = stmt.all(date);
      db.close();
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting attendance by date:', error);
      return { success: false, error: error.message };
    }
  });

  // Update attendance record
  ipcMain.handle('attendance-update', async (event, { id, updateData }) => {
    try {
      const dbPath = getDbPath();
      const db = new Database(dbPath);
      
      // If checkout is being set, compute worked hours and estimated pay
      let computedHours = null;
      let computedPay = null;

      if (Object.prototype.hasOwnProperty.call(updateData, 'checkout') && updateData.checkout) {
        // Load existing record to get checkin and employee_id
        const getStmt = db.prepare('SELECT employee_id, date, checkin, checkout, pay_rate FROM attendance WHERE id = ?');
        const existing = getStmt.get(id);
        if (existing && existing.checkin) {
          const checkinTime = new Date(existing.checkin);
          const checkoutTime = new Date(updateData.checkout);
          // Calculate total hours in decimal (rounded to 2 decimals)
          const diffMs = Math.max(0, checkoutTime - checkinTime);
          const hours = diffMs / (1000 * 60 * 60);
          computedHours = Math.round(hours * 100) / 100;

          // Get the pay_rate that was saved during check-in
          const payRate = existing.pay_rate || 0;
          
          // Calculate earned amount: total_hours × pay_rate
          const earnedAmount = Math.round((computedHours * payRate) * 100) / 100;

          // Persist computed hours and earned amount
          updateData.total_hours = computedHours;
          updateData.earned_amount = earnedAmount;
          
          // Store computed pay for return value
          computedPay = earnedAmount;
        }
      }

      const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updateData);
      values.push(new Date().toISOString(), id);
      
      const query = `
        UPDATE attendance 
        SET ${fields}, updated_at = ?
        WHERE id = ?
      `;
      
      const stmt = db.prepare(query);
      const result = stmt.run(...values);
      db.close();
      
      return { success: true, changes: result.changes, computedHours, computedPay };
    } catch (error) {
      console.error('Error updating attendance record:', error);
      return { success: false, error: error.message };
    }
  });

  // Delete attendance record (soft delete)
  ipcMain.handle('attendance-delete', async (event, id) => {
    try {
      const dbPath = getDbPath();
      const db = new Database(dbPath);
      
      const query = `
        UPDATE attendance 
        SET isdeleted = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const stmt = db.prepare(query);
      const result = stmt.run(id);
      db.close();
      
      return { success: true, changes: result.changes };
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      return { success: false, error: error.message };
    }
  });

  // Get attendance statistics
  ipcMain.handle('attendance-get-statistics', async (event, { startDate, endDate }) => {
    try {
      const dbPath = getDbPath();
      const db = new Database(dbPath);
      
      let query = `
        SELECT 
          COUNT(*) as total_records,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
          SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count
        FROM attendance 
        WHERE isdeleted = 0
      `;
      
      const params = [];
      if (startDate && endDate) {
        query += ' AND date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }
      
      const stmt = db.prepare(query);
      const result = stmt.get(...params);
      db.close();
      
      const total = result.total_records || 0;
      const present = result.present_count || 0;
      const absent = result.absent_count || 0;
      const late = result.late_count || 0;
      
      return {
        success: true,
        data: {
          total,
          present,
          absent,
          late,
          attendanceRate: total > 0 ? (present / total) * 100 : 0
        }
      };
    } catch (error) {
      console.error('Error getting attendance statistics:', error);
      return { success: false, error: error.message };
    }
  });

  // Check today's attendance status for employee
  ipcMain.handle('attendance-check-today-status', async (event, { employeeId, date }) => {
    try {
      const dbPath = getDbPath();
      const db = new Database(dbPath);
      
      const query = `
        SELECT * FROM attendance 
        WHERE employee_id = ? AND date = ? AND isdeleted = 0
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      const stmt = db.prepare(query);
      const result = stmt.get(employeeId, date);
      db.close();
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error checking today\'s status:', error);
      return { success: false, error: error.message };
    }
  });

  // Get employee attendance summary
  ipcMain.handle('attendance-get-employee-summary', async (event, { employeeId, month, year }) => {
    try {
      const dbPath = getDbPath();
      const db = new Database(dbPath);
      
      let query = `
        SELECT 
          COUNT(*) as total_days,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
          SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days
        FROM attendance 
        WHERE employee_id = ? AND isdeleted = 0
      `;
      
      const params = [employeeId];
      
      if (month && year) {
        query += ' AND strftime("%Y-%m", date) = ?';
        params.push(`${year}-${month.toString().padStart(2, '0')}`);
      }
      
      const stmt = db.prepare(query);
      const result = stmt.get(...params);
      db.close();
      
      const total = result.total_days || 0;
      const present = result.present_days || 0;
      const absent = result.absent_days || 0;
      const late = result.late_days || 0;
      
      return {
        success: true,
        data: {
          total,
          present,
          absent,
          late,
          attendanceRate: total > 0 ? (present / total) * 100 : 0
        }
      };
    } catch (error) {
      console.error('Error getting employee attendance summary:', error);
      return { success: false, error: error.message };
    }
  });

  // Get late employees for a specific date
  ipcMain.handle('attendance-get-late-employees', async (event, date) => {
    try {
      const dbPath = getDbPath();
      const db = new Database(dbPath);
      
      const query = `
        SELECT a.*, e.fname, e.lname, e.roll, e.id AS employee_id
        FROM attendance a
        JOIN employee e ON a.employee_id = e.id
        WHERE a.date = ? AND a.status = 'late' AND a.isdeleted = 0
        ORDER BY e.fname
      `;
      
      const stmt = db.prepare(query);
      const result = stmt.all(date);
      db.close();
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting late employees:', error);
      return { success: false, error: error.message };
    }
  });

  // Get absent employees for a specific date
  ipcMain.handle('attendance-get-absent-employees', async (event, date) => {
    try {
      const dbPath = getDbPath();
      const db = new Database(dbPath);
      
      // Get all employees
      const allEmployeesStmt = db.prepare('SELECT id, fname, lname, roll, id AS employee_id FROM employee WHERE isActive = 1 AND isDeleted = 0');
      const allEmployees = allEmployeesStmt.all();
      
      // Get present employees for the date
      const presentEmployeesStmt = db.prepare(`
        SELECT employee_id FROM attendance 
        WHERE date = ? AND status IN ('present', 'late') AND isdeleted = 0
      `);
      const presentEmployees = presentEmployeesStmt.all(date);
      
      const presentIds = presentEmployees.map(emp => emp.employee_id);
      
      // Filter out present employees to get absent ones
      const absentEmployees = allEmployees.filter(emp => !presentIds.includes(emp.id));
      
      db.close();
      
      return { success: true, data: absentEmployees };
    } catch (error) {
      console.error('Error getting absent employees:', error);
      return { success: false, error: error.message };
    }
  });

  // Bulk create attendance records
  ipcMain.handle('attendance-bulk-create', async (event, attendanceRecords) => {
    try {
      const dbPath = getDbPath();
      const db = new Database(dbPath);
      
      const query = `
        INSERT INTO attendance (employee_id, date, checkin, checkout, status, added_by, pay_rate, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      const stmt = db.prepare(query);
      const results = [];
      
      for (const record of attendanceRecords) {
        // Get employee's hourly salary rate for each record
        const empStmt = db.prepare('SELECT salary_per_hour, salary FROM employee WHERE id = ?');
        const emp = empStmt.get(record.employee_id);
        let hourlyRate = 0;
        
        if (emp) {
          // If salary_per_hour is set, use it directly
          if (emp.salary_per_hour && Number(emp.salary_per_hour) > 0) {
            hourlyRate = Number(emp.salary_per_hour);
          } 
          // Otherwise, use salary (which is already hourly rate)
          else if (emp.salary && Number(emp.salary) > 0) {
            hourlyRate = Number(emp.salary);
          }
        }
        
        // Round to 2 decimal places
        hourlyRate = Math.round(hourlyRate * 100) / 100;
        
        const result = stmt.run(
          record.employee_id,
          record.date,
          record.checkin,
          record.checkout,
          record.status,
          record.added_by,
          hourlyRate
        );
        results.push({ id: result.lastID, success: true });
      }
      
      db.close();
      
      return { success: true, data: results };
    } catch (error) {
      console.error('Error bulk creating attendance records:', error);
      return { success: false, error: error.message };
    }
  });
