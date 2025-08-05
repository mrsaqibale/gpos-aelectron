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

const { createTable, updateTable, getTableById, getAllTables, getTablesByFloor } = getModelPath('tables/tables.js');

function registerTableIpcHandlers() {
  ipcMain.handle('table:create', async (event, data) => createTable(data));
  ipcMain.handle('table:update', async (event, id, updates) => updateTable(id, updates));
  ipcMain.handle('table:getById', async (event, id) => getTableById(id));
  ipcMain.handle('table:getAll', async () => getAllTables());
  ipcMain.handle('table:getByFloor', async (event, floorId) => getTablesByFloor(floorId));
}

module.exports = { registerTableIpcHandlers }; 