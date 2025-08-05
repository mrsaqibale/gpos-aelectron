import { getAllFoods } from '../../models/foods/food.js';

console.log('🔍 Verifying Food Database...\n');

try {
  const foods = getAllFoods();
  
  if (foods.success) {
    console.log(`✅ Database connection successful`);
    console.log(`📊 Total foods in database: ${foods.data.length}\n`);
    
    if (foods.data.length > 0) {
      console.log('🍽️ Current foods:');
      foods.data.forEach((food, index) => {
        console.log(`   ${index + 1}. ${food.name}`);
        console.log(`      ID: ${food.id}`);
        console.log(`      Price: $${food.price || 'N/A'}`);
        console.log(`      SKU: ${food.sku || 'N/A'}`);
        console.log(`      Position: ${food.position || 'N/A'}`);
        console.log(`      Stock: ${food.item_stock || 'N/A'}`);
        console.log(`      Category: ${food.category_name || 'N/A'}`);
        console.log(`      Subcategory: ${food.subcategory_name || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('📭 No foods found in database');
    }
  } else {
    console.log(`❌ Failed to get foods: ${foods.message}`);
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
}

console.log('🏁 Verification completed!'); 