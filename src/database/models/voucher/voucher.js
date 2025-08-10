const db = require('../../init.js');

// Create voucher
function createVoucher(data) {
  try {
    const {
      title,
      start_date,
      end_date,
      voucher_code,
      amount,
      event,
      email,
      phone_no,
      name,
      status = 'active',
      added_by
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
function updateVoucher(id, updates) {
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
function getAllVouchers() {
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
function getVoucherById(id) {
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
function deleteVoucher(id) {
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
function searchVoucherByCode(code) {
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

module.exports = {
  createVoucher,
  updateVoucher,
  getAllVouchers,
  getVoucherById,
  deleteVoucher,
  searchVoucherByCode
}; 