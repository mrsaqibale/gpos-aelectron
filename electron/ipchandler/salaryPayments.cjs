const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Dynamic path resolution for both development and production
const getDbPath = () => {
  try {
    // Check if we're in development by looking for src/database
    const devPath = path.join(__dirname, '../../src/database/pos.db');
    const prodPath = path.join(__dirname, '../../database/pos.db');
    
    if (fs.existsSync(devPath)) {
      return devPath;
    } else if (fs.existsSync(prodPath)) {
      return prodPath;
    } else {
      throw new Error(`Database not found at either ${devPath} or ${prodPath}`);
    }
  } catch (error) {
    console.error('Failed to resolve database path:', error);
    throw error;
  }
};

  // Create new salary payment record
  ipcMain.handle('salary-payment-create', async (event, paymentData) => {
    try {
      const dbPath = getDbPath();
      const db = new Database(dbPath);
      
      const {
        employee_id,
        payment_date,
        amount,
        payment_method,
        payment_note,
        paid_by
      } = paymentData;

      const query = `
        INSERT INTO salary_payments (employee_id, payment_date, amount, payment_method, payment_note, paid_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      const stmt = db.prepare(query);
      const result = stmt.run(employee_id, payment_date, amount, payment_method, payment_note, paid_by);
      db.close();
      
      return { success: true, id: result.lastID };
    } catch (error) {
      console.error('Error creating salary payment record:', error);
      return { success: false, error: error.message };
    }
  });

  // Get salary payments by employee ID
  ipcMain.handle('salary-payment-get-by-employee', async (event, { employeeId, startDate, endDate }) => {
    try {
      const dbPath = getDbPath();
      const db = new Database(dbPath);
      
      let query = `
        SELECT sp.*, e.fname, e.lname, e.roll, e.employee_id
        FROM salary_payments sp
        JOIN employee e ON sp.employee_id = e.id
        WHERE sp.employee_id = ? AND sp.isdeleted = 0
      `;
      
      const params = [employeeId];
      
      if (startDate && endDate) {
        query += ' AND sp.payment_date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }
      
      query += ' ORDER BY sp.payment_date DESC';
      
      const stmt = db.prepare(query);
      const result = stmt.all(...params);
      db.close();
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Error getting salary payments by employee:', error);
      return { success: false, error: error.message };
    }
  });

// Get salary payments by date range
ipcMain.handle('salary-payment-get-by-date-range', async (event, { startDate, endDate }) => {
  try {
    const db = new Database();
    await db.connect();
    
    const query = `
      SELECT sp.*, e.fname, e.lname, e.roll, e.employee_id
      FROM salary_payments sp
      JOIN employee e ON sp.employee_id = e.id
      WHERE sp.payment_date BETWEEN ? AND ? AND sp.isdeleted = 0
      ORDER BY sp.payment_date DESC, e.fname
    `;
    
    const result = await db.all(query, [startDate, endDate]);
    await db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting salary payments by date range:', error);
    return { success: false, error: error.message };
  }
});

// Get salary payment by ID
ipcMain.handle('salary-payment-get-by-id', async (event, id) => {
  try {
    const db = new Database();
    await db.connect();
    
    const query = `
      SELECT sp.*, e.fname, e.lname, e.roll, e.employee_id
      FROM salary_payments sp
      JOIN employee e ON sp.employee_id = e.id
      WHERE sp.id = ? AND sp.isdeleted = 0
    `;
    
    const result = await db.get(query, [id]);
    await db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting salary payment by ID:', error);
    return { success: false, error: error.message };
  }
});

// Update salary payment record
ipcMain.handle('salary-payment-update', async (event, { id, updateData }) => {
  try {
    const db = new Database();
    await db.connect();
    
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(new Date().toISOString(), id);
    
    const query = `
      UPDATE salary_payments 
      SET ${fields}, updated_at = ?
      WHERE id = ?
    `;
    
    const result = await db.run(query, values);
    await db.close();
    
    return { success: true, changes: result.changes };
  } catch (error) {
    console.error('Error updating salary payment record:', error);
    return { success: false, error: error.message };
  }
});

// Delete salary payment record (soft delete)
ipcMain.handle('salary-payment-delete', async (event, id) => {
  try {
    const db = new Database();
    await db.connect();
    
    const query = `
      UPDATE salary_payments 
      SET isdeleted = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const result = await db.run(query, [id]);
    await db.close();
    
    return { success: true, changes: result.changes };
  } catch (error) {
    console.error('Error deleting salary payment record:', error);
    return { success: false, error: error.message };
  }
});

// Get total salary paid to employee
ipcMain.handle('salary-payment-get-total-paid', async (event, { employeeId, startDate, endDate }) => {
  try {
    const db = new Database();
    await db.connect();
    
    let query = `
      SELECT SUM(amount) as total_paid, COUNT(*) as payment_count
      FROM salary_payments 
      WHERE employee_id = ? AND isdeleted = 0
    `;
    
    const params = [employeeId];
    
    if (startDate && endDate) {
      query += ' AND payment_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    const result = await db.get(query, params);
    await db.close();
    
    return { 
      success: true, 
      data: {
        totalPaid: result.total_paid || 0,
        paymentCount: result.payment_count || 0
      }
    };
  } catch (error) {
    console.error('Error getting total salary paid:', error);
    return { success: false, error: error.message };
  }
});

// Get salary payment statistics
ipcMain.handle('salary-payment-get-statistics', async (event, { startDate, endDate }) => {
  try {
    const db = new Database();
    await db.connect();
    
    let query = `
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount,
        COUNT(DISTINCT employee_id) as employees_paid
      FROM salary_payments 
      WHERE isdeleted = 0
    `;
    
    const params = [];
    if (startDate && endDate) {
      query += ' AND payment_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    const result = await db.get(query, params);
    await db.close();
    
    return {
      success: true,
      data: {
        totalPayments: result.total_payments || 0,
        totalAmount: result.total_amount || 0,
        averageAmount: result.average_amount || 0,
        employeesPaid: result.employees_paid || 0
      }
    };
  } catch (error) {
    console.error('Error getting salary payment statistics:', error);
    return { success: false, error: error.message };
  }
});

// Get pending salary payments
ipcMain.handle('salary-payment-get-pending', async (event) => {
  try {
    const db = new Database();
    await db.connect();
    
    // Get employees with pending salary
    const query = `
      SELECT 
        e.id, e.fname, e.lname, e.roll, e.employee_id, e.salary,
        COALESCE(SUM(sp.amount), 0) as total_paid,
        (e.salary - COALESCE(SUM(sp.amount), 0)) as remaining
      FROM employee e
      LEFT JOIN salary_payments sp ON e.id = sp.employee_id AND sp.isdeleted = 0
      WHERE e.isActive = 1 AND e.isDeleted = 0
      GROUP BY e.id
      HAVING remaining > 0
      ORDER BY remaining DESC
    `;
    
    const result = await db.all(query);
    await db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting pending salary payments:', error);
    return { success: false, error: error.message };
  }
});

// Get salary payment history for employee
ipcMain.handle('salary-payment-get-history', async (event, { employeeId, limit }) => {
  try {
    const db = new Database();
    await db.connect();
    
    const query = `
      SELECT sp.*, e.fname, e.lname, e.roll, e.employee_id
      FROM salary_payments sp
      JOIN employee e ON sp.employee_id = e.id
      WHERE sp.employee_id = ? AND sp.isdeleted = 0
      ORDER BY sp.payment_date DESC
      LIMIT ?
    `;
    
    const result = await db.all(query, [employeeId, limit || 50]);
    await db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting salary payment history:', error);
    return { success: false, error: error.message };
  }
});

// Get salary payments by payment method
ipcMain.handle('salary-payment-get-by-method', async (event, { method, startDate, endDate }) => {
  try {
    const db = new Database();
    await db.connect();
    
    let query = `
      SELECT sp.*, e.fname, e.lname, e.roll, e.employee_id
      FROM salary_payments sp
      JOIN employee e ON sp.employee_id = e.id
      WHERE sp.payment_method = ? AND sp.isdeleted = 0
    `;
    
    const params = [method];
    
    if (startDate && endDate) {
      query += ' AND sp.payment_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY sp.payment_date DESC';
    
    const result = await db.all(query, params);
    await db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting salary payments by method:', error);
    return { success: false, error: error.message };
  }
});

// Get monthly salary summary
ipcMain.handle('salary-payment-get-monthly-summary', async (event, { month, year }) => {
  try {
    const db = new Database();
    await db.connect();
    
    const query = `
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount) as total_amount,
        COUNT(DISTINCT employee_id) as employees_paid,
        payment_method,
        COUNT(*) as method_count
      FROM salary_payments 
      WHERE strftime("%Y-%m", payment_date) = ? AND isdeleted = 0
      GROUP BY payment_method
      ORDER BY method_count DESC
    `;
    
    const monthYear = `${year}-${month.toString().padStart(2, '0')}`;
    const result = await db.all(query, [monthYear]);
    await db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting monthly salary summary:', error);
    return { success: false, error: error.message };
  }
});

// Get yearly salary summary
ipcMain.handle('salary-payment-get-yearly-summary', async (event, year) => {
  try {
    const db = new Database();
    await db.connect();
    
    const query = `
      SELECT 
        strftime("%m", payment_date) as month,
        COUNT(*) as total_payments,
        SUM(amount) as total_amount,
        COUNT(DISTINCT employee_id) as employees_paid
      FROM salary_payments 
      WHERE strftime("%Y", payment_date) = ? AND isdeleted = 0
      GROUP BY month
      ORDER BY month
    `;
    
    const result = await db.all(query, [year.toString()]);
    await db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting yearly salary summary:', error);
    return { success: false, error: error.message };
  }
});

// Check if employee has pending salary
ipcMain.handle('salary-payment-check-pending', async (event, employeeId) => {
  try {
    const db = new Database();
    await db.connect();
    
    // Get employee salary
    const employeeQuery = 'SELECT salary FROM employee WHERE id = ? AND isActive = 1 AND isDeleted = 0';
    const employee = await db.get(employeeQuery, [employeeId]);
    
    if (!employee) {
      await db.close();
      return { success: true, data: { hasPending: false } };
    }
    
    // Get total paid
    const paymentQuery = 'SELECT SUM(amount) as total_paid FROM salary_payments WHERE employee_id = ? AND isdeleted = 0';
    const payment = await db.get(paymentQuery, [employeeId]);
    
    const totalPaid = payment.total_paid || 0;
    const remaining = Math.max(0, employee.salary - totalPaid);
    
    await db.close();
    
    return { 
      success: true, 
      data: { 
        hasPending: remaining > 0,
        remaining,
        totalPaid,
        monthlySalary: employee.salary
      }
    };
  } catch (error) {
    console.error('Error checking pending salary:', error);
    return { success: false, error: error.message };
  }
});

// Get salary payment methods summary
ipcMain.handle('salary-payment-get-methods-summary', async (event, { startDate, endDate }) => {
  try {
    const db = new Database();
    await db.connect();
    
    let query = `
      SELECT 
        payment_method,
        COUNT(*) as payment_count,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount
      FROM salary_payments 
      WHERE isdeleted = 0
    `;
    
    const params = [];
    if (startDate && endDate) {
      query += ' AND payment_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += ' GROUP BY payment_method ORDER BY total_amount DESC';
    
    const result = await db.all(query, params);
    await db.close();
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting payment methods summary:', error);
    return { success: false, error: error.message };
  }
});
