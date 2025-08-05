import { getCategoryByRestaurantId } from '../../models/foods/categories.js';
import { getSubcategoriesByCategory } from '../../models/foods/subcategories.js';

console.log('🧪 Testing Categories API...\n');

async function testCategoriesAPI() {
  try {
    console.log('1. Testing getCategoryByRestaurantId...');
    const categoriesResult = await getCategoryByRestaurantId(1);
    console.log('Categories result:', categoriesResult);
    
    if (categoriesResult.success && categoriesResult.data.length > 0) {
      console.log(`✅ Found ${categoriesResult.data.length} categories`);
      categoriesResult.data.forEach(cat => {
        console.log(`   - ID: ${cat.id}, Name: ${cat.name}`);
      });
      
      // Test subcategories for first category
      const firstCategory = categoriesResult.data[0];
      console.log(`\n2. Testing getSubcategoriesByCategory for category ${firstCategory.id}...`);
      const subcategoriesResult = await getSubcategoriesByCategory(firstCategory.id);
      console.log('Subcategories result:', subcategoriesResult);
      
      if (subcategoriesResult.success) {
        console.log(`✅ Found ${subcategoriesResult.data.length} subcategories for category ${firstCategory.name}`);
        subcategoriesResult.data.forEach(sub => {
          console.log(`   - ID: ${sub.id}, Name: ${sub.name}`);
        });
      } else {
        console.log('❌ Failed to get subcategories:', subcategoriesResult.message);
      }
    } else {
      console.log('❌ No categories found or error:', categoriesResult);
    }
    
  } catch (error) {
    console.error('❌ Error testing categories API:', error);
  }
}

testCategoriesAPI(); 