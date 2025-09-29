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
    
    console.log(`[customer.cjs] Looking for model: ${modelPath}`);
    console.log(`[customer.cjs] Current dir: ${__dirname}`);
    console.log(`[customer.cjs] isBuiltApp: ${isBuiltApp}`);
    console.log(`[customer.cjs] Dev path: ${devPath}`);
    console.log(`[customer.cjs] Built path: ${builtPath}`);
    
    if (isBuiltApp && process.resourcesPath && fs.existsSync(builtPath)) {
      console.log(`✅ [customer.cjs] Found model at built path: ${builtPath}`);
      return require(builtPath);
    } else if (fs.existsSync(devPath)) {
      console.log(`✅ [customer.cjs] Found model at dev path: ${devPath}`);
      return require(devPath);
    } else {
      console.log(`❌ [customer.cjs] Model not found, trying dev path: ${devPath}`);
      return require(devPath);
    }
  } catch (error) {
    console.error(`[customer.cjs] Failed to load model: ${modelPath}`, error);
    throw error;
  }
};

const { 
  createCustomer, 
  updateCustomer, 
  getCustomerById,
  getCustomersByHotelId, 
  searchCustomerByPhone, 
  searchCustomerByName,
  createCustomerWithAddresses,
  createAddress,
  getCustomerAddresses,
  updateAddress,
  deleteAddress,
  getCustomersWithOrderStats,
  getCustomersCount,
  searchCustomersWithOrderStats,
  getCustomerOrders,
  getCustomerOrderCount,
  getCustomersWithOrderStatsAndDateFilter,
  getCustomersCountWithDateFilter,
  getCustomersByOrderDateRange,
  getCustomersCountByOrderDateRange
} = getModelPath('customer/customer.js');

function registerCustomerIpcHandlers() {
  ipcMain.handle('customer:create', async (event, data) => createCustomer(data));
  ipcMain.handle('customer:update', async (event, id, updates) => {
    try {
      console.log('[customer.cjs] Updating customer with ID:', id, 'updates:', updates);
      const result = updateCustomer(id, updates);
      console.log('[customer.cjs] Update result:', result);
      return result;
    } catch (error) {
      console.error('[customer.cjs] Error in customer:update handler:', error);
      return { success: false, message: error.message };
    }
  });
  ipcMain.handle('customer:getById', async (event, id) => getCustomerById(id));
  ipcMain.handle('customer:getByHotelId', async (event, hotelId) => getCustomersByHotelId(hotelId));
  ipcMain.handle('customer:searchByPhone', async (event, phone) => searchCustomerByPhone(phone));
  ipcMain.handle('customer:searchByName', async (event, name) => searchCustomerByName(name));
  
  // New combined customer and address functions use this for createing 
  ipcMain.handle('customer:createWithAddresses', async (event, data) => createCustomerWithAddresses(data));
 
  // Address management functions
  ipcMain.handle('address:create', async (event, data) => createAddress(data));
  ipcMain.handle('address:getByCustomer', async (event, customerId) => getCustomerAddresses(customerId));
  ipcMain.handle('address:update', async (event, id, updates) => updateAddress(id, updates));
  ipcMain.handle('address:delete', async (event, id) => deleteAddress(id));
  
  // Customer management with order statistics
  ipcMain.handle('customer:getWithOrderStats', async (event, hotelId, limit, offset) => getCustomersWithOrderStats(hotelId, limit, offset));
  ipcMain.handle('customer:getCount', async (event, hotelId) => getCustomersCount(hotelId));
  ipcMain.handle('customer:searchWithOrderStats', async (event, searchTerm, hotelId, limit, offset) => searchCustomersWithOrderStats(searchTerm, hotelId, limit, offset));
  ipcMain.handle('customer:getOrders', async (event, customerId, limit, offset) => getCustomerOrders(customerId, limit, offset));
  ipcMain.handle('customer:getOrderCount', async (event, customerId) => getCustomerOrderCount(customerId));
  
  // Customer management with date filtering
  ipcMain.handle('customer:getWithOrderStatsAndDateFilter', async (event, hotelId, orderStartDate, orderEndDate, customerJoiningDate, sortBy, limit, offset) => 
    getCustomersWithOrderStatsAndDateFilter(hotelId, orderStartDate, orderEndDate, customerJoiningDate, sortBy, limit, offset));
  ipcMain.handle('customer:getCountWithDateFilter', async (event, hotelId, orderStartDate, orderEndDate, customerJoiningDate) => 
    getCustomersCountWithDateFilter(hotelId, orderStartDate, orderEndDate, customerJoiningDate));
  
  // Customer management by order date range
  ipcMain.handle('customer:getByOrderDateRange', async (event, hotelId, startDate, endDate, limit, offset) => 
    getCustomersByOrderDateRange(hotelId, startDate, endDate, limit, offset));
  ipcMain.handle('customer:getCountByOrderDateRange', async (event, hotelId, startDate, endDate) => 
    getCustomersCountByOrderDateRange(hotelId, startDate, endDate));
}

module.exports = { registerCustomerIpcHandlers }; 