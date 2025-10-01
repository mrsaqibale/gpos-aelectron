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
    
    // For built app: inside app.asar
    const builtPath = path.join(__dirname, '../src/database/models', modelPath);
    
    console.log(`[floor.cjs] Looking for model: ${modelPath}`);
    console.log(`[floor.cjs] Current dir: ${__dirname}`);
    console.log(`[floor.cjs] isBuiltApp: ${isBuiltApp}`);
    console.log(`[floor.cjs] Dev path: ${devPath}`);
    console.log(`[floor.cjs] Built path: ${builtPath}`);
    
    if (isBuiltApp && process.resourcesPath && fs.existsSync(builtPath)) {
      console.log(`✅ [floor.cjs] Found model at built path: ${builtPath}`);
      return require(builtPath);
    } else if (fs.existsSync(devPath)) {
      console.log(`✅ [floor.cjs] Found model at dev path: ${devPath}`);
      return require(devPath);
    } else {
      console.log(`❌ [floor.cjs] Model not found, trying dev path: ${devPath}`);
      return require(devPath);
    }
  } catch (error) {
    console.error(`[floor.cjs] Failed to load model: ${modelPath}`, error);
    throw error;
  }
};

const { createFloor, updateFloor, getFloorById, getAllFloors } = getModelPath('tables/floor.js');

// Import the sample data function
let addSampleFloorAndTableData;
try {
  // Check if we're in a built app (app.asar) or have resourcesPath
  const isBuiltApp = __dirname.includes('app.asar') || process.resourcesPath;
  
  // Try multiple paths for sample data
  const devSamplePath = path.join(__dirname, '../../src/database/test/add-sample-data.js');
  const builtSamplePath = path.join(process.resourcesPath || '', 'database/test/add-sample-data.js');
  
  console.log(`[floor.cjs] Looking for sample data module`);
  console.log(`[floor.cjs] isBuiltApp: ${isBuiltApp}`);
  console.log(`[floor.cjs] Dev sample path: ${devSamplePath}`);
  console.log(`[floor.cjs] Built sample path: ${builtSamplePath}`);
  
  let sampleDataModule;
  if (isBuiltApp && process.resourcesPath && fs.existsSync(builtSamplePath)) {
    console.log(`✅ [floor.cjs] Found sample data at built path: ${builtSamplePath}`);
    sampleDataModule = require(builtSamplePath);
  } else if (fs.existsSync(devSamplePath)) {
    console.log(`✅ [floor.cjs] Found sample data at dev path: ${devSamplePath}`);
    sampleDataModule = require(devSamplePath);
  } else {
    console.log(`❌ [floor.cjs] Sample data not found, trying dev path: ${devSamplePath}`);
    sampleDataModule = require(devSamplePath);
  }
  addSampleFloorAndTableData = sampleDataModule.addSampleFloorAndTableData;
} catch (error) {
  console.error('Failed to load sample data module:', error);
  addSampleFloorAndTableData = () => ({ success: false, error: 'Sample data module not available' });
}

function registerFloorIpcHandlers() {
  ipcMain.handle('floor:create', async (event, data) => createFloor(data));
  ipcMain.handle('floor:update', async (event, id, updates) => updateFloor(id, updates));
  ipcMain.handle('floor:getById', async (event, id) => getFloorById(id));
  ipcMain.handle('floor:getAll', async () => getAllFloors());
  ipcMain.handle('floor:addSampleData', async () => addSampleFloorAndTableData());
}

module.exports = { registerFloorIpcHandlers }; 