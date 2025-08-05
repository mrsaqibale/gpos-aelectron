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

// Create a new employee
export function createEmployee({ fname, lname, imgurl, s3url, phone, roll, email, address, pin, code, isActive = true, isDeleted = false, isSyncronized = false }) {
  try {
    console.log('Creating employee with data:', {
      fname, lname, phone, roll, email, pin, code,
      imgurl: imgurl ? `base64_data_${imgurl.length}_chars` : null,
      isActive, isDeleted, isSyncronized
    });
    
    const stmt = db.prepare(`
      INSERT INTO employee (fname, lname, imgurl, s3url, phone, roll, email, address, pin, code, isActive, isDeleted, isSyncronized)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    // Convert boolean values to integers for SQLite
    const isActiveInt = isActive ? 1 : 0;
    const isDeletedInt = isDeleted ? 1 : 0;
    const isSyncronizedInt = isSyncronized ? 1 : 0;
    
    const info = stmt.run(fname, lname, imgurl, s3url, phone, roll, email, address, pin, code, isActiveInt, isDeletedInt, isSyncronizedInt);
    console.log('Employee created successfully with ID:', info.lastInsertRowid);
    return { success: true, id: info.lastInsertRowid };
  } catch (err) {
    console.error('Error creating employee:', err.message);
    return errorResponse(err.message);
  }
}

// Update an employee by id
export function updateEmployee(id, updates) {
  try {
    const fields = [];
    const values = [];
    for (const key in updates) {
      fields.push(`${key} = ?`);
      // Convert boolean values to integers for SQLite
      let value = updates[key];
      if (typeof value === 'boolean') {
        value = value ? 1 : 0;
      }
      values.push(value);
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    const sql = `UPDATE employee SET ${fields.join(', ')} WHERE id = ? AND isDeleted = 0`;
    values.push(id);
    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    if (result.changes === 0) return errorResponse('No employee updated.');
    return { success: true };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Login function: get employee by code and roll
export function loginEmployee(code, roll) {
  try {
    const stmt = db.prepare('SELECT * FROM employee WHERE code = ? AND roll = ? AND isDeleted = 0');
    const employee = stmt.get(code, roll);
    if (!employee) return errorResponse('Invalid code or roll.');
    return { success: true, data: employee };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get all employees
export function getAllEmployees() {
  try {
    const stmt = db.prepare('SELECT * FROM employee WHERE isDeleted = 0 ORDER BY created_at DESC');
    const employees = stmt.all();
    return { success: true, data: employees };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Get employee by id
export function getEmployeeById(id) {
  try {
    const stmt = db.prepare('SELECT * FROM employee WHERE id = ? AND isDeleted = 0');
    const employee = stmt.get(id);
    if (!employee) return errorResponse('Employee not found.');
    return { success: true, data: employee };
  } catch (err) {
    return errorResponse(err.message);
  }
} 