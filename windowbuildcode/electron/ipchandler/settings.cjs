const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Dynamic model loader (mirrors hotel.cjs approach)
const getModelPath = (modelPath) => {
  try {
    const devPath = path.join(__dirname, '../../src/database/models', modelPath);
    const prodPath = path.join(__dirname, '../../database/models', modelPath);
    const builtPath = path.join(process.resourcesPath || '', 'database/models', modelPath);

    if (fs.existsSync(devPath)) {
      return require(devPath);
    } else if (fs.existsSync(prodPath)) {
      return require(prodPath);
    } else if (builtPath && fs.existsSync(builtPath)) {
      return require(builtPath);
    } else {
      throw new Error(`Model not found at ${devPath}, ${prodPath}, or ${builtPath}`);
    }
  } catch (error) {
    console.error(`Failed to load model: ${modelPath}`, error);
    throw error;
  }
};

const { getSettings, upsertSettings, checkSettingsTable } = getModelPath('settings/settings.js');

function registerSettingsIpcHandlers() {
  ipcMain.handle('settings:get', async () => {
    try {
      return getSettings();
    } catch (error) {
      console.error('Error in settings:get:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('settings:upsert', async (event, data) => {
    try {
      return upsertSettings(data);
    } catch (error) {
      console.error('Error in settings:upsert:', error);
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('settings:checkTable', async () => {
    try {
      return checkSettingsTable();
    } catch (error) {
      console.error('Error in settings:checkTable:', error);
      return { success: false, message: error.message };
    }
  });
}

module.exports = { registerSettingsIpcHandlers };


