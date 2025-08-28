const { ipcMain } = require('electron');
const { checkHotelStatus, getHotelInfo, createOrUpdateHotel, updateHotelStatus, checkHotelTable } = require('../../src/database/models/hotel/hotel.js');
const path = require('path');
const fs = require('fs');

function registerHotelIpcHandlers() {
  // Handle hotel status check
  ipcMain.handle('check-hotel-status', async (event) => {
    try {
      const result = checkHotelStatus();
      return result;
    } catch (error) {
      console.error('Error in check-hotel-status handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle get hotel info
  ipcMain.handle('get-hotel-info', async (event) => {
    try {
      const result = getHotelInfo();
      return result;
    } catch (error) {
      console.error('Error in get-hotel-info handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle create or update hotel
  ipcMain.handle('create-or-update-hotel', async (event, hotelData) => {
    try {
      const result = createOrUpdateHotel(hotelData);
      return result;
    } catch (error) {
      console.error('Error in create-or-update-hotel handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle update hotel status
  ipcMain.handle('update-hotel-status', async (event, status) => {
    try {
      const result = updateHotelStatus(status);
      return result;
    } catch (error) {
      console.error('Error in update-hotel-status handler:', error);
      return { success: false, message: error.message };
    }
  });

  // Handle check hotel table
  ipcMain.handle('check-hotel-table', async (event) => {
    try {
      const result = checkHotelTable();
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
          // Check if we're in development by looking for src/database
          const devPath = path.join(__dirname, '../../src/database', relativePath);
          const prodPath = path.join(__dirname, '../../../src/database', relativePath);
          
          if (fs.existsSync(devPath)) {
            return devPath;
          } else if (fs.existsSync(prodPath)) {
            return prodPath;
          } else {
            // Fallback to development path
            return devPath;
          }
        } catch (error) {
          console.error(`Failed to resolve path: ${relativePath}`, error);
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
