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

const { createCategory, updateCategory, getCategoryByRestaurantId, getCategoryById } = getModelPath('foods/categories.js');
const { createSubcategory, updateSubcategory, getSubcategoriesByCategory, getSubcategoriesByHotelId } = getModelPath('foods/subcategories.js');
const { createAdon, updateAdon, getAdonsByHotelId } = getModelPath('foods/adons.js');
const { 
  createAllergin, 
  createAllergins, 
  getAllAllergins, 
  getAllerginById, 
  updateAllergin, 
  deleteAllergin,
  createAllerginWithFood,
  getFoodAllergins,
  updateFoodAllergins,
  getAllFoodAllergins
} = getModelPath('foods/allergins.js');
const { 
  createFood, 
  updateFood, 
  getFoodByCategory, 
  getFoodById, 
  getFoodBySubcategory, 
  getAllFoods,
  deleteFood,
  updateFoodPosition,
  searchFoodsByName
} = getModelPath('foods/food.js');

// Category IPC
ipcMain.handle('category:create', (event, data) => createCategory(data));
ipcMain.handle('category:update', (event, id, updates) => updateCategory(id, updates));
ipcMain.handle('category:getByHotel', (event, hotelId) => getCategoryByRestaurantId(hotelId));
ipcMain.handle('category:getById', (event, id) => getCategoryById(id));

// Subcategory IPC
ipcMain.handle('subcategory:create', (event, data) => createSubcategory(data));
ipcMain.handle('subcategory:update', (event, id, updates) => updateSubcategory(id, updates));
ipcMain.handle('subcategory:getByCategory', (event, categoryId) => getSubcategoriesByCategory(categoryId));
ipcMain.handle('subcategory:getByHotel', (event, hotelId) => getSubcategoriesByHotelId(hotelId));

// Adon IPC
ipcMain.handle('adon:create', (event, data) => createAdon(data));
ipcMain.handle('adon:update', (event, id, updates) => updateAdon(id, updates));
ipcMain.handle('adon:getByHotel', (event, hotelId) => getAdonsByHotelId(hotelId));

// Allergin IPC
ipcMain.handle('allergin:create', (event, data) => createAllergin(data));
ipcMain.handle('allergin:createMultiple', (event, data) => createAllergins(data));
ipcMain.handle('allergin:getAll', (event) => getAllAllergins());
ipcMain.handle('allergin:getById', (event, id) => getAllerginById(id));
ipcMain.handle('allergin:update', (event, id, updates) => updateAllergin(id, updates));
ipcMain.handle('allergin:delete', (event, id) => deleteAllergin(id));

// Food-Allergin relationship IPC
ipcMain.handle('foodAllergin:create', (event, data) => createAllerginWithFood(data));
ipcMain.handle('foodAllergin:getByFood', (event, foodId) => getFoodAllergins(foodId));
ipcMain.handle('foodAllergin:update', (event, foodId, allerginIds) => updateFoodAllergins(foodId, allerginIds));
ipcMain.handle('foodAllergin:getAll', (event) => getAllFoodAllergins());

// Food IPC
ipcMain.handle('food:create', (event, foodData) => createFood(foodData));
ipcMain.handle('food:update', (event, id, data) => updateFood(id, data));
ipcMain.handle('food:getByCategory', (event, categoryId) => getFoodByCategory(categoryId));
ipcMain.handle('food:getById', (event, id) => getFoodById(id));
ipcMain.handle('food:getBySubcategory', (event, subcategoryId) => getFoodBySubcategory(subcategoryId)); 
ipcMain.handle('food:getAll', (event) => getAllFoods());
ipcMain.handle('food:delete', (event, id) => deleteFood(id));
ipcMain.handle('food:updatePosition', (event, id, position) => updateFoodPosition(id, position));
ipcMain.handle('food:searchByName', (event, name, restaurantId) => searchFoodsByName(name, restaurantId));

// Export registration function for consistency
function registerFoodIpcHandlers() {
  console.log('Food IPC handlers registered');
}

module.exports = { registerFoodIpcHandlers };
