const { ipcMain } = require('electron');
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
  getOrderStatistics 
} = require('../../src/database/models/orders/orders.js');

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