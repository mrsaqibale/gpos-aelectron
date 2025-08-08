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

const { createFloor, updateFloor, getFloorById, getAllFloors } = getModelPath('tables/floor.js');

// Import the sample data function
const addSampleDataPath = path.join(__dirname, '../../src/database/test/add-sample-data.js');
let addSampleFloorAndTableData;
try {
  const sampleDataModule = require(addSampleDataPath);
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