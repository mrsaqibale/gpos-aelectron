const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Dynamic model loader (mirrors hotel.cjs approach)
const getModelPath = (modelPath) => {
  try {
    // Check if we're in a built app (app.asar) or have resourcesPath
    const isBuiltApp = __dirname.includes('app.asar') || process.resourcesPath;
    
    // Current location: electron/ipchandler/
    // Target: src/database/models/ (go up 2 levels, then into src/database/models)
    const devPath = path.join(__dirname, '../../src/database/models', modelPath);
    
    // For built app: resources/database/models
    const builtPath = path.join(process.resourcesPath || '', 'database/models', modelPath);
    
    console.log(`[settings.cjs] Looking for model: ${modelPath}`);
    console.log(`[settings.cjs] Current dir: ${__dirname}`);
    console.log(`[settings.cjs] isBuiltApp: ${isBuiltApp}`);
    console.log(`[settings.cjs] Dev path: ${devPath}`);
    console.log(`[settings.cjs] Built path: ${builtPath}`);
    
    if (isBuiltApp && process.resourcesPath && fs.existsSync(builtPath)) {
      console.log(`✅ [settings.cjs] Found model at built path: ${builtPath}`);
      return require(builtPath);
    } else if (fs.existsSync(devPath)) {
      console.log(`✅ [settings.cjs] Found model at dev path: ${devPath}`);
      return require(devPath);
    } else {
      console.log(`❌ [settings.cjs] Model not found, trying dev path: ${devPath}`);
      return require(devPath);
    }
  } catch (error) {
    console.error(`[settings.cjs] Failed to load model: ${modelPath}`, error);
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


