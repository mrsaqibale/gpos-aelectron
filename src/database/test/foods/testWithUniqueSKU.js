import { createFood, getAllFoods } from '../../models/foods/food.js';

console.log('🔧 TESTING WITH UNIQUE SKU\n');

// Generate a unique SKU using timestamp
const timestamp = Date.now();
const uniqueSKU = `TEST${timestamp}`;

// Simple test data with unique SKU
const testData = {
  foodData: {
    name: `Test Pizza ${timestamp}`,
    description: 'Testing with unique SKU',
    image: 'test-pizza.jpg',
    category_id: 1,
    subcategory_id: null,
    price: 19.99,
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
    sku: uniqueSKU, // Using unique SKU
    barcode: `1234567890${timestamp}`,
    stock_type: 'limited',
    item_stock: 20,
    sell_count: 0
  },
  variations: [
    {
      name: 'Size',
      type: 'single',
      min: 1,
      max: 1,
      is_required: 1,
      options: [
        {
          option_name: 'Small',
          option_price: 0,
          total_stock: 30,
          stock_type: 'limited',
          sell_count: 0
        },
        {
          option_name: 'Large',
          option_price: 2.00,
          total_stock: 30,
          stock_type: 'limited',
          sell_count: 0
        }
      ]
    }
  ]
};

console.log('📋 Test Data:');
console.log(`   Food: ${testData.foodData.name}`);
console.log(`   SKU: ${testData.foodData.sku}`);
console.log(`   Variations: ${testData.variations.length}`);
console.log(`   Options: ${testData.variations[0].options.length}\n`);

console.log('🍽️ Creating food with variations...');
try {
  const result = createFood(testData);
  console.log('Final Result:', result);
  
  if (result.success) {
    console.log(`✅ SUCCESS! Food created with variations!`);
    console.log(`   Food ID: ${result.food_id}`);
    console.log(`   Variations created: ${result.createdVariations.length}`);
    
    if (result.createdVariations.length > 0) {
      console.log('\n📋 Created variations:');
      result.createdVariations.forEach((variation, index) => {
        console.log(`   ${index + 1}. Variation ID: ${variation.variationId}`);
        console.log(`      Options created: ${variation.optionIds.length}`);
      });
    }
    
  } else {
    console.log(`❌ Failed: ${result.message}`);
  }
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}

console.log('\n📊 Current foods count:');
const foods = getAllFoods();
if (foods.success) {
  console.log(`   Total: ${foods.data.length}`);
}

console.log('\n�� Test completed!'); 