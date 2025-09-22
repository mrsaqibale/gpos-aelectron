const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Use dynamic path resolution for both development and production
const getModelPath = async (modelPath) => {
  try {
    // Check if we're in development by looking for src/database
    const devPath = path.join(__dirname, '../../src/database/models', modelPath);
    const prodPath = path.join(__dirname, '../../database/models', modelPath);
    // For built app, check in the unpacked directory
    const builtPath = path.join(process.resourcesPath, 'database/models', modelPath);
    
    let modulePath;
    if (fs.existsSync(devPath)) {
      modulePath = devPath;
    } else if (fs.existsSync(prodPath)) {
      modulePath = prodPath;
    } else if (fs.existsSync(builtPath)) {
      modulePath = builtPath;
    } else {
      throw new Error(`Model not found at ${devPath}, ${prodPath}, or ${builtPath}`);
    }
    
    // Convert to file:// URL for ES module import
    const fileUrl = `file://${modulePath}`;
    return await import(fileUrl);
  } catch (error) {
    console.error(`Failed to load model: ${modelPath}`, error);
    throw error;
  }
};

// Load the reservation module dynamically
let reservationModule;
const loadReservationModule = async () => {
  if (!reservationModule) {
    reservationModule = await getModelPath('reservation/reservation.js');
  }
  return reservationModule;
};

function registerReservationIpcHandlers() {
  // Create a new reservation
  ipcMain.handle('reservation:create', async (event, data) => {
    const module = await loadReservationModule();
    return module.createReservation(data);
  });
  
  // Update an existing reservation
  ipcMain.handle('reservation:update', async (event, id, updates) => {
    const module = await loadReservationModule();
    return module.updateReservation(id, updates);
  });
  
  // Get reservation by ID
  ipcMain.handle('reservation:getById', async (event, id) => {
    const module = await loadReservationModule();
    return module.getReservationById(id);
  });
  
  // Get all reservations by hotel ID
  ipcMain.handle('reservation:getByHotelId', async (event, hotelId, limit, offset) => {
    const module = await loadReservationModule();
    return module.getReservationsByHotelId(hotelId, limit, offset);
  });
  
  // Get reservations by status
  ipcMain.handle('reservation:getByStatus', async (event, status, hotelId, limit, offset) => {
    const module = await loadReservationModule();
    return module.getReservationsByStatus(status, hotelId, limit, offset);
  });
  
  // Get reservations by date range
  ipcMain.handle('reservation:getByDateRange', async (event, startDate, endDate, hotelId) => {
    const module = await loadReservationModule();
    return module.getReservationsByDateRange(startDate, endDate, hotelId);
  });
  
  // Get reservations by customer ID
  ipcMain.handle('reservation:getByCustomerId', async (event, customerId, limit, offset) => {
    const module = await loadReservationModule();
    return module.getReservationsByCustomerId(customerId, limit, offset);
  });
  
  // Soft delete reservation
  ipcMain.handle('reservation:delete', async (event, id) => {
    const module = await loadReservationModule();
    return module.deleteReservation(id);
  });
  
  // Get reservations count for pagination
  ipcMain.handle('reservation:getCount', async (event, hotelId, status) => {
    const module = await loadReservationModule();
    return module.getReservationsCount(hotelId, status);
  });
}

module.exports = { registerReservationIpcHandlers };
