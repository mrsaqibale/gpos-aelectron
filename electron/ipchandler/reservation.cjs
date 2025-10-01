const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Use dynamic path resolution for both development and production
const getModelPath = async (modelPath) => {
  try {
    // Check if we're in a built app (app.asar) or have resourcesPath
    const isBuiltApp = __dirname.includes('app.asar') || process.resourcesPath;
    
    // Current location: electron/ipchandler/
    // Target: src/database/models/ (go up 2 levels, then into src/database/models)
    const devPath = path.join(__dirname, '../../src/database/models', modelPath);
    
    // For built app: inside app.asar
    const builtPath = path.join(__dirname, '../src/database/models', modelPath);
    
    console.log(`[reservation.cjs] Looking for model: ${modelPath}`);
    console.log(`[reservation.cjs] Current dir: ${__dirname}`);
    console.log(`[reservation.cjs] isBuiltApp: ${isBuiltApp}`);
    console.log(`[reservation.cjs] Dev path: ${devPath}`);
    console.log(`[reservation.cjs] Built path: ${builtPath}`);
    
    let modulePath;
    if (isBuiltApp && process.resourcesPath && fs.existsSync(builtPath)) {
      console.log(`✅ [reservation.cjs] Found model at built path: ${builtPath}`);
      modulePath = builtPath;
    } else if (fs.existsSync(devPath)) {
      console.log(`✅ [reservation.cjs] Found model at dev path: ${devPath}`);
      modulePath = devPath;
    } else {
      console.log(`❌ [reservation.cjs] Model not found, trying dev path: ${devPath}`);
      modulePath = devPath;
    }
    
    // Convert to file:// URL for ES module import
    const fileUrl = `file://${modulePath}`;
    return await import(fileUrl);
  } catch (error) {
    console.error(`[reservation.cjs] Failed to load model: ${modelPath}`, error);
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
