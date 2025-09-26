import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
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
    
    console.log(`[employee.js] Looking for: ${relativePath}`);
    console.log(`[employee.js] Current dir: ${__dirname}`);
    console.log(`[employee.js] isBuiltApp: ${isBuiltApp}`);
    console.log(`[employee.js] Dev path: ${devPath}`);
    console.log(`[employee.js] Built path: ${builtPath}`);
    
    // Check if we're in a built app by looking for process.resourcesPath
    if (isBuiltApp && process.resourcesPath && fs.existsSync(builtPath)) {
      console.log(`✅ [employee.js] Found at built path: ${builtPath}`);
      return builtPath;
    } else if (fs.existsSync(devPath)) {
      console.log(`✅ [employee.js] Found at dev path: ${devPath}`);
      return devPath;
    } else {
      console.log(`❌ [employee.js] Not found, using dev path: ${devPath}`);
      return devPath;
    }
  } catch (error) {
    console.error(`[employee.js] Failed to resolve path: ${relativePath}`, error);
    return path.join(__dirname, '../../', relativePath);
  }
};

const dbPath = getDynamicPath('pos.db');
const uploadsDir = getDynamicPath('uploads');
const employeeImagesDir = path.join(uploadsDir, 'employees');

// Create uploads directories if they don't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(employeeImagesDir)) {
  fs.mkdirSync(employeeImagesDir, { recursive: true });
}

const db = new Database(dbPath);

// Universal error response
export function errorResponse(message) {
  return { success: false, message };
}

// Helper function to save image file
function saveImageFile(imageData, employeeId, originalFilename) {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(originalFilename || 'image.jpg');
    const filename = `employee_${employeeId}_${timestamp}${fileExtension}`;
    const filePath = path.join(employeeImagesDir, filename);
    
    // If imageData is base64, decode and save
    if (imageData && imageData.startsWith('data:image')) {
      const base64Data = imageData.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);
    } else if (imageData && typeof imageData === 'string') {
      // If it's already a file path, copy to our directory
      if (fs.existsSync(imageData)) {
        fs.copyFileSync(imageData, filePath);
      } else {
        // Assume it's base64 without data URL prefix
        const buffer = Buffer.from(imageData, 'base64');
        fs.writeFileSync(filePath, buffer);
      }
    }
    
    // Return relative path for database storage
    return `uploads/employees/${filename}`;
  } catch (error) {
    console.error('Error saving image file:', error);
    throw new Error('Failed to save image file');
  }
}

// Create a new employee
export function createEmployee({ fname, lname, imgurl, s3url, phone, roll, email, address, pin, code, salary = 0, salary_per_hour = 0, vnumber = null, vtype = null, license_number = null, license_expiry = null, isActive = true, isDeleted = false, isSyncronized = false, originalFilename }) {
  try {
    console.log('Creating employee with data:', {
      fname, lname, phone, roll, email, pin, code, salary, salary_per_hour, vnumber, vtype, license_number, license_expiry,
      imgurl: imgurl ? `image_data_provided` : null,
      isActive, isDeleted, isSyncronized
    });
    
    // Validate employee data before creating
    const validation = validateEmployeeData({ email, phone, pin });
    if (!validation.success) {
      return errorResponse('Validation failed');
    }
    
    if (!validation.isValid) {
      return errorResponse(validation.errors.join(', '));
    }
    
    // First insert employee to get the ID
    const stmt = db.prepare(`
      INSERT INTO employee (
        fname, lname, imgurl, s3url, phone, roll, email, address, pin, code,
        salary, salary_per_hour, vnumber, vtype, license_number, license_expiry,
        isActive, isDeleted, isSyncronized
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Convert boolean values to integers for SQLite
    const isActiveInt = isActive ? 1 : 0;
    const isDeletedInt = isDeleted ? 1 : 0;
    const isSyncronizedInt = isSyncronized ? 1 : 0;
    
    // Initially save without image path
    const info = stmt.run(
      fname,
      lname,
      null,
      s3url,
      phone,
      roll,
      email,
      address,
      pin,
      code,
      salary,
      salary_per_hour,
      vnumber,
      vtype,
      license_number,
      license_expiry,
      isActiveInt,
      isDeletedInt,
      isSyncronizedInt
    );
    const employeeId = info.lastInsertRowid;
    
    // If image is provided, save it and update the record
    let imagePath = null;
    if (imgurl) {
      try {
        imagePath = saveImageFile(imgurl, employeeId, originalFilename);
        
        // Update the employee record with the image path
        const updateStmt = db.prepare(`
          UPDATE employee SET imgurl = ? WHERE id = ?
        `);
        updateStmt.run(imagePath, employeeId);
        
        console.log('Employee image saved to:', imagePath);
      } catch (imageError) {
        console.error('Error saving employee image:', imageError);
        // Continue without image if saving fails
      }
    }
    
    console.log('Employee created successfully with ID:', employeeId);
    return { 
      success: true, 
      id: employeeId,
      imagePath: imagePath
    };
  } catch (err) {
    console.error('Error creating employee:', err.message);
    return errorResponse(err.message);
  }
}

// Update an employee by id
export function updateEmployee(id, updates, originalFilename) {
  try {
    const fields = [];
    const values = [];
    
    // Handle image update separately
    let imagePath = null;
    if (updates.imgurl) {
      try {
        // Delete old image if exists
        const oldEmployee = getEmployeeById(id);
        if (oldEmployee.success && oldEmployee.data.imgurl) {
          const oldImagePath = getDynamicPath(oldEmployee.data.imgurl);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log('Deleted old image:', oldImagePath);
          }
        }
        
        // Save new image
        imagePath = saveImageFile(updates.imgurl, id, originalFilename);
        updates.imgurl = imagePath; // Replace with file path
        console.log('New image saved to:', imagePath);
      } catch (imageError) {
        console.error('Error updating employee image:', imageError);
        // Continue without image if saving fails
        delete updates.imgurl;
      }
    } else {
      // If no new image is provided, preserve the existing image path
      const oldEmployee = getEmployeeById(id);
      if (oldEmployee.success && oldEmployee.data.imgurl) {
        imagePath = oldEmployee.data.imgurl;
        console.log('Preserving existing image path:', imagePath);
      }
    }
    
    // Remove originalFilename from updates as it's not a database column
    delete updates.originalFilename;
    
    // Validate employee data before updating (only check fields that are being updated)
    const fieldsToValidate = {};
    if (updates.email) fieldsToValidate.email = updates.email;
    if (updates.phone) fieldsToValidate.phone = updates.phone;
    if (updates.pin) fieldsToValidate.pin = updates.pin;
    
    if (Object.keys(fieldsToValidate).length > 0) {
      const validation = validateEmployeeData(fieldsToValidate, id);
      if (!validation.success) {
        return errorResponse('Validation failed');
      }
      
      if (!validation.isValid) {
        return errorResponse(validation.errors.join(', '));
      }
    }
    
    // Process other fields
    for (const key in updates) {
      fields.push(`${key} = ?`);
      // Convert boolean values to integers for SQLite
      let value = updates[key];
      if (typeof value === 'boolean') {
        value = value ? 1 : 0;
      }
      values.push(value);
    }
    
    if (fields.length === 0) {
      return errorResponse('No valid fields to update.');
    }
    
    fields.push('updated_at = CURRENT_TIMESTAMP');
    const sql = `UPDATE employee SET ${fields.join(', ')} WHERE id = ? AND isDeleted = 0`;
    values.push(id);
    const stmt = db.prepare(sql);
    const result = stmt.run(...values);
    
    if (result.changes === 0) return errorResponse('No employee updated.');
    
    return { 
      success: true, 
      imagePath: imagePath 
    };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Login function: get employee by pin and roll
export function loginEmployee(pin, roll) {
  try {
    console.log('[loginEmployee] called with', { pin, roll });
    const stmt = db.prepare('SELECT * FROM employee WHERE pin = ? AND roll = ? AND isDeleted = 0 AND isActive = 1');
    const employee = stmt.get(pin, roll);
    if (!employee) {
      console.warn('[loginEmployee] employee not found with pin and roll');
      return errorResponse('Invalid PIN or roll.');
    }
    
    // Check if employee is active
    if (employee.isActive !== 1) {
      console.warn('[loginEmployee] employee account deactivated');
      return errorResponse('Your account is deactivated. Please contact administrator.');
    }
    
    // Check if employee is not deleted
    if (employee.isDeleted === 1) {
      console.warn('[loginEmployee] employee account deleted');
      return errorResponse('Your account has been deleted. Please contact administrator.');
    }
    
    console.log('[loginEmployee] login successful for employee', employee.id);
    return { success: true, data: employee };
  } catch (err) {
    console.error('[loginEmployee] error', err);
    return errorResponse(err.message);
  }
}

// Get all employees
export function getAllEmployees(excludeEmployeeId = null) {
  try {
    let sql = 'SELECT * FROM employee WHERE isDeleted = 0';
    let params = [];
    
    // Exclude current logged-in employee if provided
    if (excludeEmployeeId) {
      sql += ' AND id != ?';
      params.push(excludeEmployeeId);
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const stmt = db.prepare(sql);
    const employees = stmt.all(...params);
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
    
    // Add full image path if image exists
    if (employee.imgurl) {
      const fullImagePath = getDynamicPath(employee.imgurl);
      employee.fullImagePath = fullImagePath;
      employee.imageExists = fs.existsSync(fullImagePath);
    }
    
    return { success: true, data: employee };
  } catch (err) {
    return errorResponse(err.message);
  }
}

// Check if email is unique
export function checkEmailUnique(email, excludeId = null) {
  try {
    let sql = 'SELECT id FROM employee WHERE email = ? AND isDeleted = 0';
    let params = [email];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    
    const stmt = db.prepare(sql);
    const result = stmt.get(...params);
    
    return { 
      success: true, 
      isUnique: !result,
      message: result ? 'Email already exists' : 'Email is available'
    };
  } catch (err) {
    console.error('Error checking email uniqueness:', err);
    return errorResponse('Failed to check email uniqueness');
  }
}

// Check if phone is unique
export function checkPhoneUnique(phone, excludeId = null) {
  try {
    let sql = 'SELECT id FROM employee WHERE phone = ? AND isDeleted = 0';
    let params = [phone];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    
    const stmt = db.prepare(sql);
    const result = stmt.get(...params);
    
    return { 
      success: true, 
      isUnique: !result,
      message: result ? 'Phone number already exists' : 'Phone number is available'
    };
  } catch (err) {
    console.error('Error checking phone uniqueness:', err);
    return errorResponse('Failed to check phone uniqueness');
  }
}

// Check if PIN is unique
export function checkPinUnique(pin, excludeId = null) {
  try {
    let sql = 'SELECT id FROM employee WHERE pin = ? AND isDeleted = 0';
    let params = [pin];
    
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    
    const stmt = db.prepare(sql);
    const result = stmt.get(...params);
    
    return { 
      success: true, 
      isUnique: !result,
      message: result ? 'PIN code already exists' : 'PIN code is available'
    };
  } catch (err) {
    console.error('Error checking PIN uniqueness:', err);
    return errorResponse('Failed to check PIN uniqueness');
  }
}

// Validate employee data before create/update
export function validateEmployeeData(data, excludeId = null) {
  try {
    const errors = [];
    
    // Check email uniqueness
    if (data.email) {
      const emailCheck = checkEmailUnique(data.email, excludeId);
      if (emailCheck.success && !emailCheck.isUnique) {
        errors.push(emailCheck.message);
      }
    }
    
    // Check phone uniqueness
    if (data.phone) {
      const phoneCheck = checkPhoneUnique(data.phone, excludeId);
      if (phoneCheck.success && !phoneCheck.isUnique) {
        errors.push(phoneCheck.message);
      }
    }
    
    // Check PIN uniqueness
    if (data.pin) {
      const pinCheck = checkPinUnique(data.pin, excludeId);
      if (pinCheck.success && !pinCheck.isUnique) {
        errors.push(pinCheck.message);
      }
    }
    
    return {
      success: true,
      isValid: errors.length === 0,
      errors: errors
    };
  } catch (err) {
    console.error('Error validating employee data:', err);
    return errorResponse('Failed to validate employee data');
  }
}

// Delete employee image file
export function deleteEmployeeImage(employeeId) {
  try {
    const employee = getEmployeeById(employeeId);
    if (employee.success && employee.data.imgurl) {
      const imagePath = getDynamicPath(employee.data.imgurl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Deleted employee image:', imagePath);
        return { success: true, message: 'Image deleted successfully' };
      }
    }
    return { success: true, message: 'No image to delete' };
  } catch (err) {
    console.error('Error deleting employee image:', err);
    return errorResponse('Failed to delete image');
  }
}

// Get employee image
export function getEmployeeImage(imagePath) {
  try {
    if (!imagePath || !imagePath.startsWith('uploads/')) {
      return { success: false, message: 'Invalid image path' };
    }
    
    const fullPath = getDynamicPath(imagePath);
    
    // Security check
    const uploadsDir = getDynamicPath('uploads');
    if (!fullPath.startsWith(uploadsDir)) {
      return { success: false, message: 'Access denied' };
    }
    
    if (fs.existsSync(fullPath)) {
      const imageBuffer = fs.readFileSync(fullPath);
      const base64Data = imageBuffer.toString('base64');
      const ext = path.extname(fullPath).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
      return { 
        success: true,
        data: `data:${mimeType};base64,${base64Data}`,
        mimeType: mimeType
      };
    } else {
      return { success: false, message: 'Image not found' };
    }
  } catch (err) {
    console.error('Error loading employee image:', err);
    return { success: false, message: 'Failed to load image' };
  }
} 

// Change employee 4-digit numeric PIN with validation
export function changeEmployeePassword(employeeId, oldPin, newPin) {
  try {
    console.log('[changeEmployeePassword] called with', { employeeId, oldPin, newPin });
    // Basic validations
    const isFourDigit = (v) => typeof v === 'string' && /^\d{4}$/.test(v);
    if (!isFourDigit(oldPin) || !isFourDigit(newPin)) {
      console.warn('[changeEmployeePassword] validation failed: non 4-digit input');
      return errorResponse('PIN must be exactly 4 numeric digits');
    }
    if (oldPin === newPin) {
      console.warn('[changeEmployeePassword] validation failed: new pin equals old pin');
      return errorResponse('New PIN must be different from old PIN');
    }

    // Load employee
    const getStmt = db.prepare('SELECT id, pin FROM employee WHERE id = ? AND isDeleted = 0');
    const employee = getStmt.get(employeeId);
    if (!employee) {
      console.warn('[changeEmployeePassword] employee not found', { employeeId });
      return errorResponse('Employee not found');
    }

    // Verify old pin
    if (String(employee.pin) !== String(oldPin)) {
      console.warn('[changeEmployeePassword] old pin mismatch');
      return errorResponse('Old PIN is incorrect');
    }

    // Update pin
    const upd = db.prepare('UPDATE employee SET pin = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND isDeleted = 0');
    const res = upd.run(newPin, employeeId);
    console.log('[changeEmployeePassword] update result', { changes: res.changes });
    if (res.changes === 0) {
      console.error('[changeEmployeePassword] update reported 0 changes');
      return errorResponse('Failed to update PIN');
    }

    console.log('[changeEmployeePassword] success');
    return { success: true, message: 'PIN updated successfully' };
  } catch (err) {
    console.error('[changeEmployeePassword] error', err);
    return errorResponse(err.message);
  }
}