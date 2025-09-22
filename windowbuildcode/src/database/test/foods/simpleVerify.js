import { getAllFoods } from '../../models/foods/food.js';

console.log('🔍 SIMPLE VERIFICATION\n');

try {
  console.log('📊 Getting all foods...');
  const foods = getAllFoods();
  
  if (foods.success) {
    console.log(`✅ Found ${foods.data.length} foods`);
    
    // Show the most recent foods
    console.log('\n🍽️ Recent foods:');
    foods.data.slice(-5).forEach(food => {
      console.log(`   ID: ${food.id}, Name: ${food.name}, Price: $${food.price || 'N/A'}, Position: ${food.position || 'N/A'}`);
    });
    
    // Check if we have any foods with proper data
    const foodsWithData = foods.data.filter(food => food.price && food.price !== '');
    console.log(`\n📊 Foods with complete data: ${foodsWithData.length}`);
    
    if (foodsWithData.length > 0) {
      console.log('✅ Database is working and has food data');
    } else {
      console.log('⚠️  Database has foods but they lack complete data');
    }
    
  } else {
    console.log(`❌ Failed to get foods: ${foods.message}`);
  }
  
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}

console.log('\n🏁 Verification completed!'); 