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
    
    console.log(`[table.cjs] Looking for model: ${modelPath}`);
    console.log(`[table.cjs] Current dir: ${__dirname}`);
    console.log(`[table.cjs] isBuiltApp: ${isBuiltApp}`);
    console.log(`[table.cjs] Dev path: ${devPath}`);
    console.log(`[table.cjs] Built path: ${builtPath}`);
    
    if (isBuiltApp && process.resourcesPath && fs.existsSync(builtPath)) {
      console.log(`✅ [table.cjs] Found model at built path: ${builtPath}`);
      return require(builtPath);
    } else if (fs.existsSync(devPath)) {
      console.log(`✅ [table.cjs] Found model at dev path: ${devPath}`);
      return require(devPath);
    } else {
      console.log(`❌ [table.cjs] Model not found, trying dev path: ${devPath}`);
      return require(devPath);
    }
  } catch (error) {
    console.error(`[table.cjs] Failed to load model: ${modelPath}`, error);
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