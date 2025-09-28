const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Use dynamic path resolution for both development and production
const getModelPath = (modelPath) => {
  try {
    // Check if we're in a built app (app.asar) or have resourcesPath
    const isBuiltApp = __dirname.includes('app.asar') || process.resourcesPath;
    
    // Current location: electron/ipchandler/
    // Target: src/database/models/ (go up 2 levels, then into src/database/models)
    const devPath = path.join(__dirname, '../../src/database/models', modelPath);
    
    // For built app: resources/database/models
    const builtPath = path.join(process.resourcesPath || '', 'database/models', modelPath);
    
    console.log(`[employee.cjs] Looking for model: ${modelPath}`);
    console.log(`[employee.cjs] Current dir: ${__dirname}`);
    console.log(`[employee.cjs] isBuiltApp: ${isBuiltApp}`);
    console.log(`[employee.cjs] Dev path: ${devPath}`);
    console.log(`[employee.cjs] Built path: ${builtPath}`);
    
    // Check if we're in a built app by looking for process.resourcesPath
    if (isBuiltApp && process.resourcesPath && fs.existsSync(builtPath)) {
      console.log(`✅ [employee.cjs] Found model at built path: ${builtPath}`);
      return require(builtPath);
    } else if (fs.existsSync(devPath)) {
      console.log(`✅ [employee.cjs] Found model at dev path: ${devPath}`);
      return require(devPath);
    } else {
      console.log(`❌ [employee.cjs] Model not found, trying dev path: ${devPath}`);
      return require(devPath);
    }
  } catch (error) {
    console.error(`[employee.cjs] Failed to load model: ${modelPath}`, error);
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
  getEmployeeImage,
  checkEmailUnique,
  checkPhoneUnique,
  checkPinUnique,
  validateEmployeeData,
  changeEmployeePassword,
  verifyEmployeeByPhoneAndRole,
  sendPasswordResetOTP,
  verifyPasswordResetOTP,
  resetEmployeePIN
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
  getRegisterStatistics,
  getLastRegister
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
  ipcMain.handle('employee:getImage', async (event, imagePath) => getEmployeeImage(imagePath));

  // Change employee password (PIN)
  ipcMain.handle('employee:changePassword', async (event, employeeId, oldPin, newPin) => {
    try {
      return changeEmployeePassword(employeeId, oldPin, newPin);
    } catch (error) {
      console.error('Error in employee:changePassword handler:', error);
      return { success: false, message: error.message };
    }
  });

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
  ipcMain.handle('register:getLast', async () => getLastRegister());

  // Employee Login handlers
  ipcMain.handle('employeeLogin:create', async (event, employeeId) => createEmployeeLogin(employeeId));
  ipcMain.handle('employeeLogin:logout', async (event, employeeId) => updateEmployeeLogout(employeeId));
  ipcMain.handle('employeeLogin:getSessions', async (event, employeeId, limit, offset) => getEmployeeLoginSessions(employeeId, limit, offset));
  ipcMain.handle('employeeLogin:getCurrentSession', async (event, employeeId) => getCurrentEmployeeSession(employeeId));
  ipcMain.handle('employeeLogin:getAllSessions', async (event, limit, offset) => getAllLoginSessions(limit, offset));
}

module.exports = { registerEmployeeIpcHandlers }; 