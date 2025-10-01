const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Dynamic import for ES module with path resolution
let voucherModule = null;

async function loadVoucherModule() {
  if (!voucherModule) {
    try {
      // Check if we're in a built app (app.asar) or have resourcesPath
      const isBuiltApp = __dirname.includes('app.asar') || process.resourcesPath;
      
      // Current location: electron/ipchandler/
      // Target: src/database/models/ (go up 2 levels, then into src/database/models)
      const devPath = path.join(__dirname, '../../src/database/models/voucher/voucher.js');
      
      // For built app: resources/database/models
      const builtPath = path.join(__dirname, '../src/database/models/voucher/voucher.js');
      
      console.log(`[voucher.cjs] Looking for voucher model`);
      console.log(`[voucher.cjs] Current dir: ${__dirname}`);
      console.log(`[voucher.cjs] isBuiltApp: ${isBuiltApp}`);
      console.log(`[voucher.cjs] Dev path: ${devPath}`);
      console.log(`[voucher.cjs] Built path: ${builtPath}`);
      
      let modulePath;
      if (isBuiltApp && process.resourcesPath && fs.existsSync(builtPath)) {
        console.log(`✅ [voucher.cjs] Found model at built path: ${builtPath}`);
        modulePath = builtPath;
      } else if (fs.existsSync(devPath)) {
        console.log(`✅ [voucher.cjs] Found model at dev path: ${devPath}`);
        modulePath = devPath;
      } else {
        console.log(`❌ [voucher.cjs] Model not found, trying dev path: ${devPath}`);
        modulePath = devPath;
      }
      
      // Convert to file:// URL for ES module import
      const fileUrl = `file://${modulePath}`;
      voucherModule = await import(fileUrl);
    } catch (error) {
      console.error(`[voucher.cjs] Failed to load voucher model:`, error);
      throw error;
    }
  }
  return voucherModule;
}

function registerVoucherIpcHandlers() {
  // Create voucher
  ipcMain.handle('voucher:create', async (event, data) => {
    try {
      console.log('Creating voucher with data:', data);
      const voucherModule = await loadVoucherModule();
      const result = voucherModule.createVoucher(data);
      console.log('Voucher creation result:', result);
      return result;
    } catch (error) {
      console.error('Error in voucher:create handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Update voucher
  ipcMain.handle('voucher:update', async (event, id, updates) => {
    try {
      console.log('Updating voucher with ID:', id, 'updates:', updates);
      const voucherModule = await loadVoucherModule();
      const result = voucherModule.updateVoucher(id, updates);
      console.log('Voucher update result:', result);
      return result;
    } catch (error) {
      console.error('Error in voucher:update handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Get all vouchers
  ipcMain.handle('voucher:getAll', async (event) => {
    try {
      console.log('Getting all vouchers');
      const voucherModule = await loadVoucherModule();
      const result = voucherModule.getAllVouchers();
      console.log('Get all vouchers result:', result);
      return result;
    } catch (error) {
      console.error('Error in voucher:getAll handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Get voucher by ID
  ipcMain.handle('voucher:getById', async (event, id) => {
    try {
      console.log('Getting voucher by ID:', id);
      const voucherModule = await loadVoucherModule();
      const result = voucherModule.getVoucherById(id);
      console.log('Get voucher by ID result:', result);
      return result;
    } catch (error) {
      console.error('Error in voucher:getById handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Delete voucher
  ipcMain.handle('voucher:delete', async (event, id) => {
    try {
      console.log('Deleting voucher with ID:', id);
      const voucherModule = await loadVoucherModule();
      const result = voucherModule.deleteVoucher(id);
      console.log('Delete voucher result:', result);
      return result;
    } catch (error) {
      console.error('Error in voucher:delete handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Search voucher by code
  ipcMain.handle('voucher:searchByCode', async (event, code) => {
    try {
      console.log('Searching voucher by code:', code);
      const voucherModule = await loadVoucherModule();
      const result = voucherModule.searchVoucherByCode(code);
      console.log('Search voucher by code result:', result);
      return result;
    } catch (error) {
      console.error('Error in voucher:searchByCode handler:', error);
      return { success: false, message: error.message };
    }
  });
}

module.exports = { registerVoucherIpcHandlers }; 