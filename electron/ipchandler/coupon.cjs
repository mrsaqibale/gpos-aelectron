const { ipcMain } = require('electron');
const { 
  createCoupon, 
  updateCoupon, 
  getAllCoupons, 
  getCouponById, 
  getCouponsByCustomerId, 
  deleteCoupon, 
  searchCouponByCode 
} = require('../../src/database/models/coupon/coupon.js');

function registerCouponIpcHandlers() {
  // Create coupon
  ipcMain.handle('coupon:create', async (event, data) => {
    try {
      console.log('Creating coupon with data:', data);
      const result = createCoupon(data);
      console.log('Coupon creation result:', result);
      return result;
    } catch (error) {
      console.error('Error in coupon:create handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Update coupon
  ipcMain.handle('coupon:update', async (event, id, updates) => {
    try {
      console.log('Updating coupon with ID:', id, 'updates:', updates);
      const result = updateCoupon(id, updates);
      console.log('Coupon update result:', result);
      return result;
    } catch (error) {
      console.error('Error in coupon:update handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Get all coupons
  ipcMain.handle('coupon:getAll', async (event) => {
    try {
      console.log('Getting all coupons');
      const result = getAllCoupons();
      console.log('Get all coupons result:', result);
      return result;
    } catch (error) {
      console.error('Error in coupon:getAll handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Get coupon by ID
  ipcMain.handle('coupon:getById', async (event, id) => {
    try {
      console.log('Getting coupon by ID:', id);
      const result = getCouponById(id);
      console.log('Get coupon by ID result:', result);
      return result;
    } catch (error) {
      console.error('Error in coupon:getById handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Get coupons by customer ID
  ipcMain.handle('coupon:getByCustomerId', async (event, customerId) => {
    try {
      console.log('Getting coupons by customer ID:', customerId);
      const result = getCouponsByCustomerId(customerId);
      console.log('Get coupons by customer ID result:', result);
      return result;
    } catch (error) {
      console.error('Error in coupon:getByCustomerId handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Delete coupon
  ipcMain.handle('coupon:delete', async (event, id) => {
    try {
      console.log('Deleting coupon with ID:', id);
      const result = deleteCoupon(id);
      console.log('Delete coupon result:', result);
      return result;
    } catch (error) {
      console.error('Error in coupon:delete handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Search coupon by code
  ipcMain.handle('coupon:searchByCode', async (event, code) => {
    try {
      console.log('Searching coupon by code:', code);
      const result = searchCouponByCode(code);
      console.log('Search coupon by code result:', result);
      return result;
    } catch (error) {
      console.error('Error in coupon:searchByCode handler:', error);
      return { success: false, message: error.message };
    }
  });
}

module.exports = { registerCouponIpcHandlers }; 