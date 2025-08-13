import { 
  createIngredient, 
  getAllIngredients, 
  getActiveCategories,
  createCategoryIngredient,
  checkCategoryIngredientExists 
} from '../models/foods/ingredients.js';

// Test the ingredients functionality
async function testIngredients() {
  console.log('Testing ingredients functionality...');
  
  try {
    // Test 1: Get active categories
    console.log('\n1. Testing getActiveCategories...');
    const categoriesResult = await getActiveCategories();
    console.log('Categories result:', categoriesResult);
    
    // Test 2: Get all ingredients
    console.log('\n2. Testing getAllIngredients...');
    const ingredientsResult = await getAllIngredients();
    console.log('Ingredients result:', ingredientsResult);
    
    // Test 3: Create a new ingredient
    console.log('\n3. Testing createIngredient...');
    const createResult = await createIngredient({ name: 'Test Ingredient', status: 1 });
    console.log('Create ingredient result:', createResult);
    
    if (createResult.success && categoriesResult.success && categoriesResult.data.length > 0) {
      // Test 4: Create category-ingredient relationship
      console.log('\n4. Testing createCategoryIngredient...');
      const categoryId = categoriesResult.data[0].id;
      const ingredientId = createResult.id;
      
      const relationshipResult = await createCategoryIngredient(categoryId, ingredientId);
      console.log('Category-ingredient relationship result:', relationshipResult);
      
      // Test 5: Check if relationship exists
      console.log('\n5. Testing checkCategoryIngredientExists...');
      const existsResult = await checkCategoryIngredientExists(categoryId, ingredientId);
      console.log('Exists check result:', existsResult);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testIngredients(); 