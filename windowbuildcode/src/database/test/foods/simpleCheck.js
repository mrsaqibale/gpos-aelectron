import { createFood, getAllFoods } from '../../models/foods/food.js';

console.log('🔍 SIMPLE DATABASE CHECK\n');

// Check current foods
console.log('📊 Current foods:');
const foods = getAllFoods();
if (foods.success) {
  console.log(`   Total: ${foods.data.length}`);
  foods.data.slice(-3).forEach(food => {
    console.log(`   - ${food.name} (ID: ${food.id})`);
  });
}

// Simple test without variations
const simpleTest = {
  foodData: {
    name: 'Simple Test Food',
    description: 'A simple test',
    image: 'simple.jpg',
    category_id: 1,
    subcategory_id: null,
    price: 10.99,
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
    sku: 'STF001',
    barcode: '1234567890144',
    stock_type: 'limited',
    item_stock: 20,
    sell_count: 0
  },
  variations: []
};

console.log('\n🍽️ Creating simple food...');
try {
  const result = createFood(simpleTest);
  console.log('Result:', result);
  
  if (result.success) {
    console.log(`✅ Simple food created! ID: ${result.food_id}`);
  } else {
    console.log(`❌ Failed: ${result.message}`);
  }
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}

console.log('\n🏁 Check completed!'); 