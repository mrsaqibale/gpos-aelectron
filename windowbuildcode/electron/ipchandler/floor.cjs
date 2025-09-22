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

const { createFloor, updateFloor, getFloorById, getAllFloors } = getModelPath('tables/floor.js');

// Import the sample data function
let addSampleFloorAndTableData;
try {
  // Try multiple paths for sample data
  const devSamplePath = path.join(__dirname, '../../src/database/test/add-sample-data.js');
  const prodSamplePath = path.join(__dirname, '../../database/test/add-sample-data.js');
  const builtSamplePath = path.join(process.resourcesPath, 'database/test/add-sample-data.js');
  
  let sampleDataModule;
  if (fs.existsSync(devSamplePath)) {
    sampleDataModule = require(devSamplePath);
  } else if (fs.existsSync(prodSamplePath)) {
    sampleDataModule = require(prodSamplePath);
  } else if (fs.existsSync(builtSamplePath)) {
    sampleDataModule = require(builtSamplePath);
  } else {
    throw new Error(`Sample data module not found at ${devSamplePath}, ${prodSamplePath}, or ${builtSamplePath}`);
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