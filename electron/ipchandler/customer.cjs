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
  getCustomerOrderCount
} = getModelPath('customer/customer.js');

function registerCustomerIpcHandlers() {
  ipcMain.handle('customer:create', async (event, data) => createCustomer(data));
  ipcMain.handle('customer:update', async (event, id, updates) => updateCustomer(id, updates));
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
}

module.exports = { registerCustomerIpcHandlers }; 