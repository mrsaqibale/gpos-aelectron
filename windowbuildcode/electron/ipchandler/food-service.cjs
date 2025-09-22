const { ipcMain } = require('electron');
const { createFood, getFoodById, getAllFoods, deleteFood } = require('../../src/database/models/foods/food-service.cjs');

// Food IPC handlers using the database service
ipcMain.handle('food:create', async (event, data) => {
  try {
    return createFood(data);
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('food:getById', async (event, id) => {
  try {
    return getFoodById(id);
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('food:getAll', async (event, restaurantId) => {
  try {
    return getAllFoods(restaurantId);
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('food:delete', async (event, id) => {
  try {
    return deleteFood(id);
  } catch (error) {
    return { success: false, message: error.message };
  }
});

console.log('Food service IPC handlers registered');
