// Stub models that don't create database connections at module level
// These will be replaced with proper implementations later

function createCategory(categoryData) {
  return { success: false, message: 'Function not implemented yet' };
}

function updateCategory(id, categoryData) {
  return { success: false, message: 'Function not implemented yet' };
}

function getCategoryByRestaurantId(restaurantId) {
  return { success: false, message: 'Function not implemented yet' };
}

function getCategoryById(id) {
  return { success: false, message: 'Function not implemented yet' };
}

function getCategoryImage(imagePath) {
  return { success: false, message: 'Function not implemented yet' };
}

function createSubcategory(subcategoryData) {
  return { success: false, message: 'Function not implemented yet' };
}

function updateSubcategory(id, subcategoryData) {
  return { success: false, message: 'Function not implemented yet' };
}

function getSubcategoriesByCategory(categoryId) {
  return { success: false, message: 'Function not implemented yet' };
}

function getSubcategoriesByHotelId(hotelId) {
  return { success: false, message: 'Function not implemented yet' };
}

function createAdon(adonData) {
  return { success: false, message: 'Function not implemented yet' };
}

function updateAdon(id, adonData) {
  return { success: false, message: 'Function not implemented yet' };
}

function getAdonsByHotelId(hotelId) {
  return { success: false, message: 'Function not implemented yet' };
}

function createFoodAdon(foodAdonData) {
  return { success: false, message: 'Function not implemented yet' };
}

function getFoodAdons(foodId) {
  return { success: false, message: 'Function not implemented yet' };
}

function getAllFoodAdons() {
  return { success: false, message: 'Function not implemented yet' };
}

function updateFoodAdons(foodId, adons) {
  return { success: false, message: 'Function not implemented yet' };
}

function deleteFoodAdon(id) {
  return { success: false, message: 'Function not implemented yet' };
}

function deleteAllFoodAdons(foodId) {
  return { success: false, message: 'Function not implemented yet' };
}

function createAllergin(allerginData) {
  return { success: false, message: 'Function not implemented yet' };
}

function createAllergins(allergins) {
  return { success: false, message: 'Function not implemented yet' };
}

function getAllAllergins() {
  return { success: false, message: 'Function not implemented yet' };
}

function getAllerginById(id) {
  return { success: false, message: 'Function not implemented yet' };
}

function updateAllergin(id, allerginData) {
  return { success: false, message: 'Function not implemented yet' };
}

function deleteAllergin(id) {
  return { success: false, message: 'Function not implemented yet' };
}

function createAllerginWithFood(allerginData) {
  return { success: false, message: 'Function not implemented yet' };
}

function getFoodAllergins(foodId) {
  return { success: false, message: 'Function not implemented yet' };
}

function updateFoodAllergins(foodId, allergins) {
  return { success: false, message: 'Function not implemented yet' };
}

function getAllFoodAllergins() {
  return { success: false, message: 'Function not implemented yet' };
}

function createVariation(variationData) {
  return { success: false, message: 'Function not implemented yet' };
}

function updateVariation(id, variationData) {
  return { success: false, message: 'Function not implemented yet' };
}

function createVariationOption(optionData) {
  return { success: false, message: 'Function not implemented yet' };
}

function updateVariationOption(id, optionData) {
  return { success: false, message: 'Function not implemented yet' };
}

function getVariationsByFood(foodId) {
  return { success: false, message: 'Function not implemented yet' };
}

function getVariationOptionsByVariation(variationId) {
  return { success: false, message: 'Function not implemented yet' };
}

function deleteVariation(id) {
  return { success: false, message: 'Function not implemented yet' };
}

function deleteVariationOption(id) {
  return { success: false, message: 'Function not implemented yet' };
}

function deleteAllVariationsForFood(foodId) {
  return { success: false, message: 'Function not implemented yet' };
}

function deleteAllVariationOptionsForFood(foodId) {
  return { success: false, message: 'Function not implemented yet' };
}

function createIngredient(ingredientData) {
  return { success: false, message: 'Function not implemented yet' };
}

function updateIngredient(id, ingredientData) {
  return { success: false, message: 'Function not implemented yet' };
}

function getAllIngredients() {
  return { success: false, message: 'Function not implemented yet' };
}

function getIngredientById(id) {
  return { success: false, message: 'Function not implemented yet' };
}

function deleteIngredient(id) {
  return { success: false, message: 'Function not implemented yet' };
}

function createCategoryIngredient(categoryIngredientData) {
  return { success: false, message: 'Function not implemented yet' };
}

function getCategoryIngredients(categoryId) {
  return { success: false, message: 'Function not implemented yet' };
}

function updateCategoryIngredients(categoryId, ingredients) {
  return { success: false, message: 'Function not implemented yet' };
}

function deleteCategoryIngredient(id) {
  return { success: false, message: 'Function not implemented yet' };
}

function deleteAllCategoryIngredientsForCategory(categoryId) {
  return { success: false, message: 'Function not implemented yet' };
}

function createFoodIngredient(foodIngredientData) {
  return { success: false, message: 'Function not implemented yet' };
}

function getFoodIngredients(foodId) {
  return { success: false, message: 'Function not implemented yet' };
}

function updateFoodIngredients(foodId, ingredients) {
  return { success: false, message: 'Function not implemented yet' };
}

function deleteFoodIngredient(id) {
  return { success: false, message: 'Function not implemented yet' };
}

function deleteAllFoodIngredientsForFood(foodId) {
  return { success: false, message: 'Function not implemented yet' };
}

module.exports = {
  // Categories
  createCategory,
  updateCategory,
  getCategoryByRestaurantId,
  getCategoryById,
  getCategoryImage,
  
  // Subcategories
  createSubcategory,
  updateSubcategory,
  getSubcategoriesByCategory,
  getSubcategoriesByHotelId,
  
  // Adons
  createAdon,
  updateAdon,
  getAdonsByHotelId,
  
  // Food Adons
  createFoodAdon,
  getFoodAdons,
  getAllFoodAdons,
  updateFoodAdons,
  deleteFoodAdon,
  deleteAllFoodAdons,
  
  // Allergins
  createAllergin,
  createAllergins,
  getAllAllergins,
  getAllerginById,
  updateAllergin,
  deleteAllergin,
  createAllerginWithFood,
  getFoodAllergins,
  updateFoodAllergins,
  getAllFoodAllergins,
  
  // Variations
  createVariation,
  updateVariation,
  createVariationOption,
  updateVariationOption,
  getVariationsByFood,
  getVariationOptionsByVariation,
  deleteVariation,
  deleteVariationOption,
  deleteAllVariationsForFood,
  deleteAllVariationOptionsForFood,
  
  // Ingredients
  createIngredient,
  updateIngredient,
  getAllIngredients,
  getIngredientById,
  deleteIngredient,
  createCategoryIngredient,
  getCategoryIngredients,
  updateCategoryIngredients,
  deleteCategoryIngredient,
  deleteAllCategoryIngredientsForCategory,
  createFoodIngredient,
  getFoodIngredients,
  updateFoodIngredients,
  deleteFoodIngredient,
  deleteAllFoodIngredientsForFood
};
