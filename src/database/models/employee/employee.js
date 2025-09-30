import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import fs from 'fs';
import twilioService from '../../services/TwilioService.js';

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
export function createEmployee({ fname, lname, imgurl, s3url, phone, roll, email, address, pin, code, salary = 0, salary_per_hour = 0, vnumber = null, vtype = null, license_number = null, license_expiry = null, isavailable = true, isActive = true, isDeleted = false, isSyncronized = false, originalFilename }) {
  try {
    console.log('Creating employee with data:', {
      fname, lname, phone, roll, email, pin, code, salary, salary_per_hour, vnumber, vtype, license_number, license_expiry,
      imgurl: imgurl ? `image_data_provided` : null,
      isavailable, isActive, isDeleted, isSyncronized
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
        isavailable, isActive, isDeleted, isSyncronized
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Convert boolean values to integers for SQLite
    const isAvailableInt = isavailable ? 1 : 0;
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
      isAvailableInt,
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

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Check if phone number and role match an employee
export function verifyEmployeeByPhoneAndRole(phone, role) {
  try {
    console.log('[verifyEmployeeByPhoneAndRole] called with', { phone, role });
    
    // Validate inputs
    if (!phone || !role) {
      return errorResponse('Phone number and role are required');
    }
    
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // First check if phone number exists with any role
    const phoneCheckStmt = db.prepare(`
      SELECT id, fname, lname, phone, roll, isActive, isDeleted 
      FROM employee 
      WHERE phone = ? AND isDeleted = 0 AND isActive = 1
    `);
    
    const phoneEmployee = phoneCheckStmt.get(cleanPhone);
    
    if (!phoneEmployee) {
      console.warn('[verifyEmployeeByPhoneAndRole] phone number not found');
      return errorResponse('Phone number not found in our records');
    }
    
    // Check if the phone number exists with the specified role
    const roleCheckStmt = db.prepare(`
      SELECT id, fname, lname, phone, roll, isActive, isDeleted 
      FROM employee 
      WHERE phone = ? AND roll = ? AND isDeleted = 0 AND isActive = 1
    `);
    
    const employee = roleCheckStmt.get(cleanPhone, role);
    
    if (!employee) {
      console.warn('[verifyEmployeeByPhoneAndRole] phone number found but role does not match');
      return errorResponse(`This phone number is registered as ${phoneEmployee.roll}, not ${role}`);
    }
    
    console.log('[verifyEmployeeByPhoneAndRole] employee found:', employee.id);
    return { 
      success: true, 
      data: {
        id: employee.id,
        fname: employee.fname,
        lname: employee.lname,
        phone: employee.phone,
        roll: employee.roll
      }
    };
  } catch (err) {
    console.error('[verifyEmployeeByPhoneAndRole] error', err);
    return errorResponse(err.message);
  }
}

// Send OTP for password reset
export async function sendPasswordResetOTP(phone, role) {
  try {
    console.log('[sendPasswordResetOTP] called with', { phone, role });
    
    // First verify the employee exists
    const employeeCheck = verifyEmployeeByPhoneAndRole(phone, role);
    if (!employeeCheck.success) {
      return employeeCheck;
    }
    
    const employee = employeeCheck.data;
    
    // Check if Twilio is configured
    if (!twilioService.isConfigured()) {
      console.warn('[sendPasswordResetOTP] Twilio not configured');
      return errorResponse('SMS service is not configured. Please contact administrator.');
    }
    
    // Generate 6-digit OTP
    const otp = generateOTP();
    
    // Clean phone number for international format
    let formattedPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (!formattedPhone.startsWith('+')) {
      // Assume it's a local number, you might want to add country code logic here
      formattedPhone = '+1' + formattedPhone; // Default to US, adjust as needed
    }
    
    // Update employee's code field with the OTP
    const updateStmt = db.prepare(`
      UPDATE employee 
      SET code = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND isDeleted = 0
    `);
    
    const updateResult = updateStmt.run(otp, employee.id);
    
    if (updateResult.changes === 0) {
      console.error('[sendPasswordResetOTP] failed to update employee code');
      return errorResponse('Failed to generate OTP');
    }
    
    // Send OTP via SMS
    const smsResult = await twilioService.sendOTP(
      formattedPhone, 
      otp, 
      `${employee.fname} ${employee.lname}`
    );
    
    if (!smsResult.success) {
      console.error('[sendPasswordResetOTP] SMS failed:', smsResult.message);
      return errorResponse(`Failed to send OTP: ${smsResult.message}`);
    }
    
    console.log('[sendPasswordResetOTP] OTP sent successfully');
    return { 
      success: true, 
      message: 'OTP sent successfully to your registered phone number'
    };
  } catch (err) {
    console.error('[sendPasswordResetOTP] error', err);
    return errorResponse(err.message);
  }
}

// Verify OTP for password reset
export function verifyPasswordResetOTP(phone, role, otp) {
  try {
    console.log('[verifyPasswordResetOTP] called with', { phone, role, otp });
    
    // Validate inputs
    if (!phone || !role || !otp) {
      return errorResponse('Phone number, role, and OTP are required');
    }
    
    // First verify the employee exists and get their current code
    const employeeCheck = verifyEmployeeByPhoneAndRole(phone, role);
    if (!employeeCheck.success) {
      return employeeCheck;
    }
    
    const employee = employeeCheck.data;
    
    // Get employee's current code from database
    const stmt = db.prepare(`
      SELECT id, code, updated_at
      FROM employee 
      WHERE id = ? AND isDeleted = 0
    `);
    
    const employeeRecord = stmt.get(employee.id);
    
    if (!employeeRecord) {
      console.warn('[verifyPasswordResetOTP] employee record not found');
      return errorResponse('Employee record not found');
    }
    
    if (!employeeRecord.code) {
      console.warn('[verifyPasswordResetOTP] no OTP code found');
      return errorResponse('No OTP found. Please request a new OTP.');
    }
    
    // Check if OTP is expired (10 minutes from updated_at)
    const now = new Date();
    const updatedAt = new Date(employeeRecord.updated_at);
    const expiresAt = new Date(updatedAt.getTime() + 10 * 60 * 1000); // 10 minutes
    
    if (now > expiresAt) {
      console.warn('[verifyPasswordResetOTP] OTP expired');
      return errorResponse('OTP has expired. Please request a new OTP.');
    }
    
    // Verify OTP
    if (employeeRecord.code !== otp) {
      console.warn('[verifyPasswordResetOTP] invalid OTP');
      return errorResponse('Invalid OTP. Please try again.');
    }
    
    console.log('[verifyPasswordResetOTP] OTP verified successfully');
    return { 
      success: true, 
      message: 'OTP verified successfully',
      employeeId: employee.id
    };
  } catch (err) {
    console.error('[verifyPasswordResetOTP] error', err);
    return errorResponse(err.message);
  }
}

// Reset employee PIN using OTP verification
export function resetEmployeePIN(phone, role, otp, newPin) {
  try {
    console.log('[resetEmployeePIN] called with', { phone, role, otp, newPin });
    
    // Validate new PIN
    const isFourDigit = (v) => typeof v === 'string' && /^\d{4}$/.test(v);
    if (!isFourDigit(newPin)) {
      return errorResponse('New PIN must be exactly 4 numeric digits');
    }
    
    // First verify the OTP
    const otpVerification = verifyPasswordResetOTP(phone, role, otp);
    if (!otpVerification.success) {
      return otpVerification;
    }
    
    const employeeId = otpVerification.employeeId;
    
    // Check if new PIN is unique
    const pinCheck = checkPinUnique(newPin, employeeId);
    if (!pinCheck.success) {
      return errorResponse('Failed to check PIN uniqueness');
    }
    
    if (!pinCheck.isUnique) {
      return errorResponse('This PIN is already in use. Please choose a different PIN.');
    }
    
    // Update the PIN and clear the OTP code
    const updateStmt = db.prepare(`
      UPDATE employee 
      SET pin = ?, code = NULL, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND isDeleted = 0
    `);
    
    const result = updateStmt.run(newPin, employeeId);
    
    if (result.changes === 0) {
      console.error('[resetEmployeePIN] no changes made');
      return errorResponse('Failed to update PIN');
    }
    
    console.log('[resetEmployeePIN] PIN reset successfully');
    return { 
      success: true, 
      message: 'PIN reset successfully. You can now login with your new PIN.'
    };
  } catch (err) {
    console.error('[resetEmployeePIN] error', err);
    return errorResponse(err.message);
  }
}
