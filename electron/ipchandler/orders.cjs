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
  createOrder, 
  updateOrder, 
  getOrderById, 
  getAllOrders, 
  getOrdersByCustomer, 
  getOrdersByStatus, 
  updateOrderStatus, 
  cancelOrder, 
  deleteOrder, 
  getOrderStatistics,
  getOrdersByDateRange
} = getModelPath('orders/orders.js');

function registerOrdersIpcHandlers() {
  // Handle create order
  ipcMain.handle('order:create', async (event, orderData) => {
    try {
      const result = createOrder(orderData);
      return result;
    } catch (error) {
      console.error('Error in order:create handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle update order
  ipcMain.handle('order:update', async (event, id, updates) => {
    try {
      const result = updateOrder(id, updates);
      return result;
    } catch (error) {
      console.error('Error in order:update handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle get order by id
  ipcMain.handle('order:getById', async (event, id) => {
    try {
      const result = getOrderById(id);
      return result;
    } catch (error) {
      console.error('Error in order:getById handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle get all orders
  ipcMain.handle('order:getAll', async (event, limit, offset) => {
    try {
      const result = getAllOrders(limit, offset);
      return result;
    } catch (error) {
      console.error('Error in order:getAll handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle get orders by customer
  ipcMain.handle('order:getByCustomer', async (event, customerId, limit, offset) => {
    try {
      const result = getOrdersByCustomer(customerId, limit, offset);
      return result;
    } catch (error) {
      console.error('Error in order:getByCustomer handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle get orders by status
  ipcMain.handle('order:getByStatus', async (event, status, limit, offset) => {
    try {
      const result = getOrdersByStatus(status, limit, offset);
      return result;
    } catch (error) {
      console.error('Error in order:getByStatus handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle get orders by date range
  ipcMain.handle('order:getByDateRange', async (event, startDate, endDate, limit, offset) => {
    try {
      const result = getOrdersByDateRange(startDate, endDate, limit, offset);
      return result;
    } catch (error) {
      console.error('Error in order:getByDateRange handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle update order status
  ipcMain.handle('order:updateStatus', async (event, id, status, updatedBy) => {
    try {
      const result = updateOrderStatus(id, status, updatedBy);
      return result;
    } catch (error) {
      console.error('Error in order:updateStatus handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle cancel order
  ipcMain.handle('order:cancel', async (event, id, reason, canceledBy, note) => {
    try {
      const result = cancelOrder(id, reason, canceledBy, note);
      return result;
    } catch (error) {
      console.error('Error in order:cancel handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle delete order
  ipcMain.handle('order:delete', async (event, id) => {
    try {
      const result = deleteOrder(id);
      return result;
    } catch (error) {
      console.error('Error in order:delete handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle get order statistics
  ipcMain.handle('order:getStatistics', async (event, startDate, endDate) => {
    try {
      const result = getOrderStatistics(startDate, endDate);
      return result;
    } catch (error) {
      console.error('Error in order:getStatistics handler:', error);
      return { success: false, message: error.message };
    }
  });
}

module.exports = { registerOrdersIpcHandlers }; 