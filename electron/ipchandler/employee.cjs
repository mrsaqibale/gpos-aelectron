const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Use dynamic path resolution for both development and production

const getModelPath = (modelPath) => {
  try {
    // Check if we're in development by looking for src/database
    const devPath = path.join(__dirname, '../../src/database/models', modelPath);
    const prodPath = path.join(__dirname, '../../database/models', modelPath);
    
    if (fs.existsSync(devPath)) {
      return require(devPath);
    } else if (fs.existsSync(prodPath)) {
      return require(prodPath);
    } else {
      throw new Error(`Model not found at either ${devPath} or ${prodPath}`);
    }
  } catch (error) {
    console.error(`Failed to load model: ${modelPath}`, error);
    throw error;
  }
};

const { 
  createEmployee, 
  updateEmployee, 
  getAllEmployees, 
  loginEmployee, 
  getEmployeeById, 
  deleteEmployeeImage,
  checkEmailUnique,
  checkPhoneUnique,
  checkPinUnique,
  validateEmployeeData
} = getModelPath('employee/employee.js');
const { 
  createRegister, 
  getRegisterById, 
  getAllRegisters, 
  getRegistersByEmployeeId, 
  getOpenRegisterByEmployeeId, 
  closeRegister, 
  updateRegister, 
  deleteRegister, 
  getRegisterStatistics 
} = getModelPath('employee/register.js');
const { 
  createEmployeeLogin, 
  updateEmployeeLogout, 
  getEmployeeLoginSessions, 
  getCurrentEmployeeSession, 
  getAllLoginSessions 
} = getModelPath('employee/employeeLogin.js');

function registerEmployeeIpcHandlers() {
  // Employee handlers
  ipcMain.handle('employee:create', async (event, data) => {
    try {
      console.log('Creating employee with data:', data);
      const result = createEmployee(data);
      console.log('Employee creation result:', result);
      return result;
    } catch (error) {
      console.error('Error in employee:create handler:', error);
      return { success: false, message: error.message };
    }
  });
  
  ipcMain.handle('employee:update', async (event, id, updates, originalFilename) => {
    try {
      console.log('Updating employee with ID:', id, 'updates:', updates);
      const result = updateEmployee(id, updates, originalFilename);
      console.log('Employee update result:', result);
      return result;
    } catch (error) {
      console.error('Error in employee:update handler:', error);
      return { success: false, message: error.message };
    }
  });
  
  ipcMain.handle('employee:getAll', async (event, excludeEmployeeId) => getAllEmployees(excludeEmployeeId));
  ipcMain.handle('employee:getById', async (event, id) => getEmployeeById(id));
  ipcMain.handle('employee:login', async (event, code, roll) => loginEmployee(code, roll));
  ipcMain.handle('employee:deleteImage', async (event, employeeId) => deleteEmployeeImage(employeeId));
  
  // Validation handlers
  ipcMain.handle('employee:checkEmailUnique', async (event, email, excludeId) => checkEmailUnique(email, excludeId));
  ipcMain.handle('employee:checkPhoneUnique', async (event, phone, excludeId) => checkPhoneUnique(phone, excludeId));
  ipcMain.handle('employee:checkPinUnique', async (event, pin, excludeId) => checkPinUnique(pin, excludeId));
  ipcMain.handle('employee:validateData', async (event, data, excludeId) => validateEmployeeData(data, excludeId));
  
  // Get employee image data
  ipcMain.handle('employee:getImage', async (event, imagePath) => {
    try {
      if (!imagePath || !imagePath.startsWith('uploads/')) {
        return { success: false, message: 'Invalid image path' };
      }
      
      const fullPath = path.resolve(__dirname, '../../src/database', imagePath);
      
      // Security check
      const uploadsDir = path.resolve(__dirname, '../../src/database/uploads');
      if (!fullPath.startsWith(uploadsDir)) {
        return { success: false, message: 'Access denied' };
      }
      
      if (fs.existsSync(fullPath)) {
        const imageBuffer = fs.readFileSync(fullPath);
        const base64Data = imageBuffer.toString('base64');
        const mimeType = getMimeType(fullPath);
        return { 
          success: true, 
          data: `data:${mimeType};base64,${base64Data}` 
        };
      } else {
        return { success: false, message: 'Image not found' };
      }
    } catch (error) {
      console.error('Error getting employee image:', error);
      return { success: false, message: error.message };
    }
  });
  
  // Helper function to get MIME type
  function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  // Register handlers
  ipcMain.handle('register:create', async (event, data) => createRegister(data));
  ipcMain.handle('register:getById', async (event, id) => getRegisterById(id));
  ipcMain.handle('register:getAll', async () => getAllRegisters());
  ipcMain.handle('register:getByEmployeeId', async (event, employeeId) => getRegistersByEmployeeId(employeeId));
  ipcMain.handle('register:getOpenRegisterByEmployeeId', async (event, employeeId) => getOpenRegisterByEmployeeId(employeeId));
  ipcMain.handle('register:closeRegister', async (event, id, endamount) => closeRegister(id, endamount));
  ipcMain.handle('register:update', async (event, id, updates) => updateRegister(id, updates));
  ipcMain.handle('register:delete', async (event, id) => deleteRegister(id));
  ipcMain.handle('register:getStatistics', async (event, employeeId, startDate, endDate) => getRegisterStatistics(employeeId, startDate, endDate));

  // Employee Login handlers
  ipcMain.handle('employeeLogin:create', async (event, employeeId) => createEmployeeLogin(employeeId));
  ipcMain.handle('employeeLogin:logout', async (event, employeeId) => updateEmployeeLogout(employeeId));
  ipcMain.handle('employeeLogin:getSessions', async (event, employeeId, limit, offset) => getEmployeeLoginSessions(employeeId, limit, offset));
  ipcMain.handle('employeeLogin:getCurrentSession', async (event, employeeId) => getCurrentEmployeeSession(employeeId));
  ipcMain.handle('employeeLogin:getAllSessions', async (event, limit, offset) => getAllLoginSessions(limit, offset));
}

module.exports = { registerEmployeeIpcHandlers }; 