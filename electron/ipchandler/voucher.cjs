const { ipcMain } = require('electron');
const { 
  createVoucher, 
  updateVoucher, 
  getAllVouchers, 
  getVoucherById, 
  deleteVoucher, 
  searchVoucherByCode 
} = require('../../src/database/models/voucher/voucher.cjs');

function registerVoucherIpcHandlers() {
  // Create voucher
  ipcMain.handle('voucher:create', async (event, data) => {
    try {
      console.log('Creating voucher with data:', data);
      const result = createVoucher(data);
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
      const result = updateVoucher(id, updates);
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
      const result = getAllVouchers();
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
      const result = getVoucherById(id);
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
      const result = deleteVoucher(id);
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
      const result = searchVoucherByCode(code);
      console.log('Search voucher by code result:', result);
      return result;
    } catch (error) {
      console.error('Error in voucher:searchByCode handler:', error);
      return { success: false, message: error.message };
    }
  });
}

module.exports = { registerVoucherIpcHandlers }; 