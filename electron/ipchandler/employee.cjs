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

const { createEmployee, updateEmployee, getAllEmployees, loginEmployee, getEmployeeById } = getModelPath('employee/employee.js');
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
  ipcMain.handle('employee:create', async (event, data) => createEmployee(data));
  ipcMain.handle('employee:update', async (event, id, updates) => updateEmployee(id, updates));
  ipcMain.handle('employee:getAll', async () => getAllEmployees());
  ipcMain.handle('employee:getById', async (event, id) => getEmployeeById(id));
  ipcMain.handle('employee:login', async (event, code, roll) => loginEmployee(code, roll));

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