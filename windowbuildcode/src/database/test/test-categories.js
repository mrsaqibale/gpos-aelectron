import { getAllIngredientsWithCategories } from '../models/foods/ingredients.js';

async function testCategories() {
  console.log('Testing getAllIngredientsWithCategories...');
  
  try {
    const result = await getAllIngredientsWithCategories();
    console.log('Result:', result);
    
    if (result.success) {
      console.log('Ingredients with categories:');
      result.data.forEach(ingredient => {
        console.log(`- ${ingredient.name} (Category: ${ingredient.category_name || 'No Category'})`);
      });
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCategories(); 