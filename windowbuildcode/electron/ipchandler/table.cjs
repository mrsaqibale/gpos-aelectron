const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Use dynamic path resolution for both development and production

const getModelPath = (modelPath) => {
  try {
    // Check if we're in development by looking for src/database
    const devPath = path.join(__dirname, '../../src/database/models', modelPath);
    const prodPath = path.join(__dirname, '../../database/models', modelPath);
    // For built app, check in the unpacked directory
    const builtPath = path.join(process.resourcesPath, 'database/models', modelPath);
    
    if (fs.existsSync(devPath)) {
      return require(devPath);
    } else if (fs.existsSync(prodPath)) {
      return require(prodPath);
    } else if (fs.existsSync(builtPath)) {
      return require(builtPath);
    } else {
      throw new Error(`Model not found at ${devPath}, ${prodPath}, or ${builtPath}`);
    }
  } catch (error) {
    console.error(`Failed to load model: ${modelPath}`, error);
    throw error;
  }
};

const { createTable, updateTable, getTableById, getAllTables, getTablesByFloor, getTablesByFloorWithStatus, updateTableStatus, updateMultipleTableStatuses } = getModelPath('tables/tables.js');

function registerTableIpcHandlers() {
  ipcMain.handle('table:create', async (event, data) => createTable(data));
  ipcMain.handle('table:update', async (event, id, updates) => updateTable(id, updates));
  ipcMain.handle('table:getById', async (event, id) => getTableById(id));
  ipcMain.handle('table:getAll', async () => getAllTables());
  ipcMain.handle('table:getByFloor', async (event, floorId) => getTablesByFloor(floorId));
  ipcMain.handle('table:getByFloorWithStatus', async (event, floorId, status) => getTablesByFloorWithStatus(floorId, status));
  ipcMain.handle('table:updateStatus', async (event, tableId, status) => updateTableStatus(tableId, status));
  ipcMain.handle('table:updateMultipleStatuses', async (event, tableIds, status) => updateMultipleTableStatuses(tableIds, status));
}

module.exports = { registerTableIpcHandlers }; 