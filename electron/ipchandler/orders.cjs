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

const { 
  createOrder,
  updateOrder,
  updateOrderStatus,
  getOrderById,
  getOrdersByRestaurant,
  getOrdersByStatus,
  getOrdersByCustomer,
  cancelOrder,
  requestRefund,
  processRefund,
  getOrderStatistics,
  deleteOrder
} = getModelPath('orders/orders.js');

function registerOrdersIpcHandlers() {
  // Basic CRUD operations
  ipcMain.handle('order:create', async (event, data) => createOrder(data));
  ipcMain.handle('order:update', async (event, id, updates) => updateOrder(id, updates));
  ipcMain.handle('order:getById', async (event, id) => getOrderById(id));
  ipcMain.handle('order:delete', async (event, id) => deleteOrder(id));
  
  // Order status management
  ipcMain.handle('order:updateStatus', async (event, id, status, updatedBy) => updateOrderStatus(id, status, updatedBy));
  
  // Order queries
  ipcMain.handle('order:getByRestaurant', async (event, restaurantId, limit, offset) => getOrdersByRestaurant(restaurantId, limit, offset));
  ipcMain.handle('order:getByStatus', async (event, restaurantId, status, limit, offset) => getOrdersByStatus(restaurantId, status, limit, offset));
  ipcMain.handle('order:getByCustomer', async (event, customerId, limit, offset) => getOrdersByCustomer(customerId, limit, offset));
  
  // Order actions
  ipcMain.handle('order:cancel', async (event, id, reason, canceledBy, note) => cancelOrder(id, reason, canceledBy, note));
  ipcMain.handle('order:requestRefund', async (event, id, reason) => requestRefund(id, reason));
  ipcMain.handle('order:processRefund', async (event, id, processedBy) => processRefund(id, processedBy));
  
  // Statistics
  ipcMain.handle('order:getStatistics', async (event, restaurantId, startDate, endDate) => getOrderStatistics(restaurantId, startDate, endDate));
}

module.exports = { registerOrdersIpcHandlers }; 