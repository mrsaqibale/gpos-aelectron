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
  createReservation, 
  updateReservation, 
  getReservationById,
  getReservationsByHotelId,
  getReservationsByStatus,
  getReservationsByDateRange,
  getReservationsByCustomerId,
  deleteReservation,
  getReservationsCount
} = getModelPath('reservation/reservation.js');

function registerReservationIpcHandlers() {
  // Create a new reservation
  ipcMain.handle('reservation:create', async (event, data) => createReservation(data));
  
  // Update an existing reservation
  ipcMain.handle('reservation:update', async (event, id, updates) => updateReservation(id, updates));
  
  // Get reservation by ID
  ipcMain.handle('reservation:getById', async (event, id) => getReservationById(id));
  
  // Get all reservations by hotel ID
  ipcMain.handle('reservation:getByHotelId', async (event, hotelId, limit, offset) => 
    getReservationsByHotelId(hotelId, limit, offset));
  
  // Get reservations by status
  ipcMain.handle('reservation:getByStatus', async (event, status, hotelId, limit, offset) => 
    getReservationsByStatus(status, hotelId, limit, offset));
  
  // Get reservations by date range
  ipcMain.handle('reservation:getByDateRange', async (event, startDate, endDate, hotelId) => 
    getReservationsByDateRange(startDate, endDate, hotelId));
  
  // Get reservations by customer ID
  ipcMain.handle('reservation:getByCustomerId', async (event, customerId, limit, offset) => 
    getReservationsByCustomerId(customerId, limit, offset));
  
  // Soft delete reservation
  ipcMain.handle('reservation:delete', async (event, id) => deleteReservation(id));
  
  // Get reservations count for pagination
  ipcMain.handle('reservation:getCount', async (event, hotelId, status) => 
    getReservationsCount(hotelId, status));
}

module.exports = { registerReservationIpcHandlers };
