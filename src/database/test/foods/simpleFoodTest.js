import { createFood, getAllFoods } from '../../models/foods/food.js';

console.log('🧪 SIMPLE FOOD TEST\n');

// Simple test data without variations first
const simpleTestData = {
  foodData: {
    name: 'Test Pizza Simple',
    description: 'A simple test pizza',
    image: 'test-pizza.jpg',
    category_id: 1,
    subcategory_id: null,
    price: 15.99,
    tax: 8.5,
    tax_type: 'percentage',
    discount: 0,
    discount_type: 'percentage',
    available_time_starts: '11:00',
    available_time_ends: '23:00',
    veg: 0,
    status: 'active',
    restaurant_id: 1,
    position: 1,
    sku: 'TPS001',
    barcode: '1234567890137',
    stock_type: 'limited',
    item_stock: 20,
    sell_count: 0
  },
  variations: [] // No variations for now
};

console.log('📋 Test Data:');
console.log(`   Food: ${simpleTestData.foodData.name}`);
console.log(`   Price: $${simpleTestData.foodData.price}`);
console.log(`   SKU: ${simpleTestData.foodData.sku}`);
console.log(`   Variations: ${simpleTestData.variations.length}\n`);

console.log('🍽️ Creating simple food...');
try {
  const result = createFood(simpleTestData);
  console.log('Result:', result);
  
  if (result.success) {
    console.log(`✅ Food created successfully!`);
    console.log(`   Food ID: ${result.food_id}`);
  } else {
    console.log(`❌ Failed: ${result.message}`);
  }
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
  console.log('Stack:', error.stack);
}

console.log('\n📊 Current foods:');
const foods = getAllFoods();
if (foods.success) {
  console.log(`   Total: ${foods.data.length}`);
  foods.data.slice(-3).forEach(food => {
    console.log(`   - ${food.name} (ID: ${food.id})`);
  });
} 