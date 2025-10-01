const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Use dynamic path resolution for both development and production
const getModelPath = (modelPath) => {
  try {
    // Check if we're in a built app (app.asar) or have resourcesPath
    const isBuiltApp = __dirname.includes('app.asar') || process.resourcesPath;
    
    // Current location: electron/ipchandler/
    // Target: src/database/models/ (go up 2 levels, then into src/database/models)
    const devPath = path.join(__dirname, '../../src/database/models', modelPath);
    
    // For built app: inside app.asar
    const builtPath = path.join(__dirname, '../src/database/models', modelPath);
    
    console.log(`[foodipc.cjs] Looking for model: ${modelPath}`);
    console.log(`[foodipc.cjs] Current dir: ${__dirname}`);
    console.log(`[foodipc.cjs] isBuiltApp: ${isBuiltApp}`);
    console.log(`[foodipc.cjs] Dev path: ${devPath}`);
    console.log(`[foodipc.cjs] Built path: ${builtPath}`);
    
    if (isBuiltApp && process.resourcesPath && fs.existsSync(builtPath)) {
      console.log(`✅ [foodipc.cjs] Found model at built path: ${builtPath}`);
      return require(builtPath);
    } else if (fs.existsSync(devPath)) {
      console.log(`✅ [foodipc.cjs] Found model at dev path: ${devPath}`);
      return require(devPath);
    } else {
      console.log(`❌ [foodipc.cjs] Model not found, trying dev path: ${devPath}`);
      return require(devPath);
    }
  } catch (error) {
    console.error(`[foodipc.cjs] Failed to load model: ${modelPath}`, error);
    throw error;
  }
};

const { createCategory, updateCategory, getCategoryByRestaurantId, getCategoryById, getCategoryImage } = getModelPath('foods/categories.js');
const { createSubcategory, updateSubcategory, getSubcategoriesByCategory, getSubcategoriesByHotelId } = getModelPath('foods/subcategories.js');
const { createAdon, updateAdon, getAdonsByHotelId } = getModelPath('foods/adons.js');
const { 
  createFoodAdon, 
  getFoodAdons, 
  getAllFoodAdons, 
  updateFoodAdons, 
  deleteFoodAdon, 
  deleteAllFoodAdons 
} = getModelPath('foods/food_adons.js');
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
  updateFoodBasic,
  getFoodByCategory, 
  getFoodById, 
  getFoodBySubcategory, 
  getAllFoods,
  deleteFood,
  updateFoodPosition,
  searchFoodsByName,
  deleteFoodImage,
  getFoodImage,
  getPizzaFoods
} = getModelPath('foods/food.js');

const { 
  createVariation,
  updateVariation,
  createVariationOption,
  updateVariationOption
} = getModelPath('foods/variations.js');

const { 
  createIngredient,
  getAllIngredients,
  getIngredientById,
  getIngredientsByCategory,
  updateIngredient,
  deleteIngredient,
  searchIngredientsByName,
  getActiveCategories,
  createCategoryIngredient,
  checkCategoryIngredientExists,
  getIngredientsByCategoryPaginated,
  removeCategoryIngredient,
  getAllIngredientsWithCategories,
  createFoodIngredient,
  getFoodIngredients,
  updateFoodIngredients,
  processFoodIngredients,
  removeFoodIngredient
} = getModelPath('foods/ingredients.js');

// Category IPC
ipcMain.handle('category:create', (event, data) => createCategory(data));
ipcMain.handle('category:update', (event, id, updates, originalFilename) => updateCategory(id, updates, originalFilename));
ipcMain.handle('category:getByHotel', (event, hotelId) => getCategoryByRestaurantId(hotelId));
ipcMain.handle('category:getById', (event, id) => getCategoryById(id));
ipcMain.handle('category:getImage', (event, imagePath) => getCategoryImage(imagePath));

// Subcategory IPC
ipcMain.handle('subcategory:create', (event, data) => createSubcategory(data));
ipcMain.handle('subcategory:update', (event, id, updates) => updateSubcategory(id, updates));
ipcMain.handle('subcategory:getByCategory', (event, categoryId) => getSubcategoriesByCategory(categoryId));
ipcMain.handle('subcategory:getByHotel', (event, hotelId) => getSubcategoriesByHotelId(hotelId));

// Adon IPC
ipcMain.handle('adon:create', (event, data) => createAdon(data));
ipcMain.handle('adon:update', (event, id, updates) => updateAdon(id, updates));
ipcMain.handle('adon:getByHotel', (event, hotelId) => getAdonsByHotelId(hotelId));

// Food-Adon relationship IPC
ipcMain.handle('foodAdon:create', (event, foodId, adonId) => createFoodAdon(foodId, adonId));
ipcMain.handle('foodAdon:getByFood', (event, foodId) => getFoodAdons(foodId));
ipcMain.handle('foodAdon:getAll', (event) => getAllFoodAdons());
ipcMain.handle('foodAdon:update', (event, foodId, adonIds) => updateFoodAdons(foodId, adonIds));
ipcMain.handle('foodAdon:delete', (event, foodId, adonId) => deleteFoodAdon(foodId, adonId));
ipcMain.handle('foodAdon:deleteAll', (event, foodId) => deleteAllFoodAdons(foodId));

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
ipcMain.handle('food:updateBasic', (event, id, updates) => updateFoodBasic(id, updates));
ipcMain.handle('food:getByCategory', (event, categoryId) => getFoodByCategory(categoryId));
ipcMain.handle('food:getById', (event, id) => getFoodById(id));
ipcMain.handle('food:getBySubcategory', (event, subcategoryId) => getFoodBySubcategory(subcategoryId)); 
ipcMain.handle('food:getAll', (event) => getAllFoods());
ipcMain.handle('food:delete', (event, id) => deleteFood(id));
ipcMain.handle('food:updatePosition', (event, id, position) => updateFoodPosition(id, position));
ipcMain.handle('food:searchByName', (event, name, restaurantId) => searchFoodsByName(name, restaurantId));
ipcMain.handle('food:deleteImage', (event, foodId) => deleteFoodImage(foodId));
ipcMain.handle('food:getImage', (event, imagePath) => getFoodImage(imagePath));
ipcMain.handle('food:getPizzaFoods', (event) => getPizzaFoods());

// Food-Ingredient relationship IPC
ipcMain.handle('food:getIngredients', (event, foodId) => getFoodIngredients(foodId));
ipcMain.handle('food:updateIngredients', (event, foodId, ingredientIds) => updateFoodIngredients(foodId, ingredientIds));
ipcMain.handle('food:processIngredients', (event, foodId, categoryId, ingredientNames) => processFoodIngredients(foodId, categoryId, ingredientNames));
ipcMain.handle('food:createFoodIngredient', (event, foodId, ingredientId) => createFoodIngredient(foodId, ingredientId));
ipcMain.handle('food:removeIngredient', (event, foodId, ingredientId) => removeFoodIngredient(foodId, ingredientId));

// Variation IPC
ipcMain.handle('variation:create', (event, variationData) => createVariation(variationData));
ipcMain.handle('variation:update', (event, id, updates) => updateVariation(id, updates));
ipcMain.handle('variationOption:create', (event, optionData) => createVariationOption(optionData));
ipcMain.handle('variationOption:update', (event, id, updates) => updateVariationOption(id, updates));

// Ingredient IPC
ipcMain.handle('ingredient:create', (event, data) => createIngredient(data));
ipcMain.handle('ingredient:getAll', (event) => getAllIngredients());
ipcMain.handle('ingredient:getById', (event, id) => getIngredientById(id));
ipcMain.handle('ingredient:getByCategory', (event, categoryId) => getIngredientsByCategory(categoryId));
ipcMain.handle('ingredient:update', (event, id, updates) => updateIngredient(id, updates));
ipcMain.handle('ingredient:delete', (event, id) => deleteIngredient(id));
ipcMain.handle('ingredient:searchByName', (event, name) => searchIngredientsByName(name));
ipcMain.handle('ingredient:getActiveCategories', (event, hotelId) => getActiveCategories(hotelId));
ipcMain.handle('ingredient:createCategoryIngredient', (event, categoryId, ingredientId) => createCategoryIngredient(categoryId, ingredientId));
ipcMain.handle('ingredient:checkCategoryIngredientExists', (event, categoryId, ingredientId) => checkCategoryIngredientExists(categoryId, ingredientId));
ipcMain.handle('ingredient:getByCategoryPaginated', (event, categoryId, limit, offset) => getIngredientsByCategoryPaginated(categoryId, limit, offset));
ipcMain.handle('ingredient:removeCategoryIngredient', (event, categoryId, ingredientId) => removeCategoryIngredient(categoryId, ingredientId));
ipcMain.handle('ingredient:getAllWithCategories', (event, hotelId) => getAllIngredientsWithCategories(hotelId));


// Export registration function for consistency
function registerFoodIpcHandlers() {
  console.log('Food IPC handlers registered');
}

module.exports = { registerFoodIpcHandlers };
