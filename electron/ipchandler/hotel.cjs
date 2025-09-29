const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Use dynamic path resolution for both development and production
const getModelPath = (modelPath) => {
  try {
    // Check if we're in a built app (app.asar) or have resourcesPath
    const isBuiltApp = __dirname.includes('app.asar') || process.resourcesPath;
    
    // Development path: electron/ipchandler -> src/database/models
    const devPath = path.join(__dirname, '../../src/database/models', modelPath);
    
    // Built app path: resources/database/models
    const builtPath = path.join(process.resourcesPath || '', 'database/models', modelPath);
    
    console.log(`[hotel.cjs] Looking for model: ${modelPath}`);
    console.log(`[hotel.cjs] Current dir: ${__dirname}`);
    console.log(`[hotel.cjs] isBuiltApp: ${isBuiltApp}`);
    console.log(`[hotel.cjs] Dev path: ${devPath}`);
    console.log(`[hotel.cjs] Built path: ${builtPath}`);
    
    if (isBuiltApp && process.resourcesPath && fs.existsSync(builtPath)) {
      console.log(`✅ [hotel.cjs] Found model at built path: ${builtPath}`);
      return require(builtPath);
    } else if (fs.existsSync(devPath)) {
      console.log(`✅ [hotel.cjs] Found model at dev path: ${devPath}`);
      return require(devPath);
    } else {
      console.log(`❌ [hotel.cjs] Model not found, trying dev path: ${devPath}`);
      return require(devPath);
    }
  } catch (error) {
    console.error(`[hotel.cjs] Failed to load model: ${modelPath}`, error);
    throw error;
  }
};

// Load hotel model using dynamic import for ES modules
let hotelModel = null;

const loadHotelModel = async () => {
  if (hotelModel) return hotelModel;
  
  try {
    // Check if we're in a built app (app.asar) or have resourcesPath
    const isBuiltApp = __dirname.includes('app.asar') || process.resourcesPath;
    
    // Development path: electron/ipchandler -> src/database/models
    const devPath = path.join(__dirname, '../../src/database/models/hotel/hotel.js');
    
    // Built app path: resources/database/models
    const builtPath = path.join(process.resourcesPath || '', 'database/models/hotel/hotel.js');
    
    console.log(`[hotel.cjs] Loading hotel model...`);
    console.log(`[hotel.cjs] Current dir: ${__dirname}`);
    console.log(`[hotel.cjs] isBuiltApp: ${isBuiltApp}`);
    console.log(`[hotel.cjs] Dev path: ${devPath}`);
    console.log(`[hotel.cjs] Built path: ${builtPath}`);
    
    let modelPath;
    if (isBuiltApp && process.resourcesPath && fs.existsSync(builtPath)) {
      console.log(`✅ [hotel.cjs] Loading from built path: ${builtPath}`);
      modelPath = builtPath;
    } else if (fs.existsSync(devPath)) {
      console.log(`✅ [hotel.cjs] Loading from dev path: ${devPath}`);
      modelPath = devPath;
    } else {
      console.log(`❌ [hotel.cjs] Model not found, trying dev path: ${devPath}`);
      modelPath = devPath;
    }
    
    // Convert to file:// URL for dynamic import
    const fileUrl = `file://${modelPath}`;
    hotelModel = await import(fileUrl);
    console.log(`✅ [hotel.cjs] Hotel model loaded successfully`);
    return hotelModel;
  } catch (error) {
    console.error(`[hotel.cjs] Failed to load hotel model:`, error);
    throw error;
  }
};

function registerHotelIpcHandlers() {
  // Handle hotel status check
  ipcMain.handle('check-hotel-status', async (event) => {
    try {
      const model = await loadHotelModel();
      const result = model.checkHotelStatus();
      return result;
    } catch (error) {
      console.error('Error in check-hotel-status handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle get hotel info
  ipcMain.handle('get-hotel-info', async (event) => {
    try {
      const model = await loadHotelModel();
      const result = model.getHotelInfo();
      return result;
    } catch (error) {
      console.error('Error in get-hotel-info handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle create or update hotel
  ipcMain.handle('create-or-update-hotel', async (event, hotelData) => {
    try {
      const model = await loadHotelModel();
      const result = model.createOrUpdateHotel(hotelData);
      return result;
    } catch (error) {
      console.error('Error in create-or-update-hotel handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle update hotel status
  ipcMain.handle('update-hotel-status', async (event, status) => {
    try {
      const model = await loadHotelModel();
      const result = model.updateHotelStatus(status);
      return result;
    } catch (error) {
      console.error('Error in update-hotel-status handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle check hotel table
  ipcMain.handle('check-hotel-table', async (event) => {
    try {
      const model = await loadHotelModel();
      const result = model.checkHotelTable();
      return result;
    } catch (error) {
      console.error('Error in check-hotel-table handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle get database path
  ipcMain.handle('get-database-path', async (event) => {
    try {
      // Dynamic path resolution for both development and production
      const getDynamicPath = (relativePath) => {
        try {
          // Check if we're in a built app (app.asar) or have resourcesPath
          const isBuiltApp = __dirname.includes('app.asar') || process.resourcesPath;
          
          if (isBuiltApp && process.resourcesPath) {
            // Built app: use resources path
            const builtPath = path.join(process.resourcesPath, 'database', relativePath);
            console.log(`✅ [hotel.cjs] Using built app path: ${builtPath}`);
            return builtPath;
          } else {
            // Development: use relative paths from electron/ipchandler to src/database
            const devPath = path.join(__dirname, '../../src/database', relativePath);
            console.log(`✅ [hotel.cjs] Using dev path: ${devPath}`);
            return devPath;
          }
        } catch (error) {
          console.error(`[hotel.cjs] Failed to resolve path: ${relativePath}`, error);
          // Fallback to development path
          return path.join(__dirname, '../../src/database', relativePath);
        }
      };

      const dbPath = getDynamicPath('pos.db');
      
      if (fs.existsSync(dbPath)) {
        return { 
          success: true, 
          path: dbPath,
          size: fs.statSync(dbPath).size
        };
      } else {
        return { 
          success: false, 
          message: 'Database file not found' 
        };
      }
    } catch (error) {
      console.error('Error in get-database-path handler:', error);
      return { success: false, message: error.message };
    }
  });
}

module.exports = { registerHotelIpcHandlers };
