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
  createOrderDetail, 
  createMultipleOrderDetails,
  updateOrderDetail, 
  getOrderDetailById, 
  getOrderDetailsByOrderId, 
  getOrderDetailsByFoodId, 
  getAllOrderDetails, 
  deleteOrderDetail, 
  deleteOrderDetailsByOrderId,
  getOrderDetailsWithFood,
  getOrderDetailsStatistics,
  getTopSellingFoods,
  calculateOrderTotal
} = getModelPath('orders/orderDetails.js');

function registerOrderDetailsIpcHandlers() {
  // Handle create order detail
  ipcMain.handle('orderDetail:create', async (event, orderDetailData) => {
    try {
      const result = createOrderDetail(orderDetailData);
      return result;
    } catch (error) {
      console.error('Error in orderDetail:create handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle create multiple order details
  ipcMain.handle('orderDetail:createMultiple', async (event, orderDetailsArray) => {
    try {
      const result = createMultipleOrderDetails(orderDetailsArray);
      return result;
    } catch (error) {
      console.error('Error in orderDetail:createMultiple handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle update order detail
  ipcMain.handle('orderDetail:update', async (event, id, updates) => {
    try {
      const result = updateOrderDetail(id, updates);
      return result;
    } catch (error) {
      console.error('Error in orderDetail:update handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle get order detail by id
  ipcMain.handle('orderDetail:getById', async (event, id) => {
    try {
      const result = getOrderDetailById(id);
      return result;
    } catch (error) {
      console.error('Error in orderDetail:getById handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle get order details by order id
  ipcMain.handle('orderDetail:getByOrderId', async (event, orderId) => {
    try {
      const result = getOrderDetailsByOrderId(orderId);
      return result;
    } catch (error) {
      console.error('Error in orderDetail:getByOrderId handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle get order details by food id
  ipcMain.handle('orderDetail:getByFoodId', async (event, foodId, limit, offset) => {
    try {
      const result = getOrderDetailsByFoodId(foodId, limit, offset);
      return result;
    } catch (error) {
      console.error('Error in orderDetail:getByFoodId handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle get all order details
  ipcMain.handle('orderDetail:getAll', async (event, limit, offset) => {
    try {
      const result = getAllOrderDetails(limit, offset);
      return result;
    } catch (error) {
      console.error('Error in orderDetail:getAll handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle delete order detail
  ipcMain.handle('orderDetail:delete', async (event, id) => {
    try {
      const result = deleteOrderDetail(id);
      return result;
    } catch (error) {
      console.error('Error in orderDetail:delete handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle delete order details by order ID
  ipcMain.handle('orderDetail:deleteByOrderId', async (event, orderId) => {
    try {
      const result = deleteOrderDetailsByOrderId(orderId);
      return result;
    } catch (error) {
      console.error('Error in orderDetail:deleteByOrderId handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle get order details with food information
  ipcMain.handle('orderDetail:getWithFood', async (event, orderId) => {
    try {
      const result = getOrderDetailsWithFood(orderId);
      return result;
    } catch (error) {
      console.error('Error in orderDetail:getWithFood handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle get order details statistics
  ipcMain.handle('orderDetail:getStatistics', async (event, startDate, endDate) => {
    try {
      const result = getOrderDetailsStatistics(startDate, endDate);
      return result;
    } catch (error) {
      console.error('Error in orderDetail:getStatistics handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle get top selling foods
  ipcMain.handle('orderDetail:getTopSellingFoods', async (event, limit, startDate, endDate) => {
    try {
      const result = getTopSellingFoods(limit, startDate, endDate);
      return result;
    } catch (error) {
      console.error('Error in orderDetail:getTopSellingFoods handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle calculate order total
  ipcMain.handle('orderDetail:calculateOrderTotal', async (event, orderId) => {
    try {
      const result = calculateOrderTotal(orderId);
      return result;
    } catch (error) {
      console.error('Error in orderDetail:calculateOrderTotal handler:', error);
      return { success: false, message: error.message };
    }
  });
}

module.exports = { registerOrderDetailsIpcHandlers };
