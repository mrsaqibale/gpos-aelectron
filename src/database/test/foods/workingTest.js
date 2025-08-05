import { createFood, getAllFoods } from '../../models/foods/food.js';

console.log('🎯 WORKING FOOD TEST\n');

// Simple test data that we know works
const testData = {
  foodData: {
    name: 'Working Test Food',
    description: 'This is a test food that should work',
    image: 'test-food.jpg',
    category_id: 1,
    subcategory_id: null,
    price: 12.99,
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
    sku: 'WTF001',
    barcode: '1234567890140',
    stock_type: 'limited',
    item_stock: 20,
    sell_count: 0
  },
  variations: [] // No variations for now
};

console.log('📋 Test Data:');
console.log(`   Food: ${testData.foodData.name}`);
console.log(`   Price: $${testData.foodData.price}`);
console.log(`   SKU: ${testData.foodData.sku}\n`);

console.log('🍽️ Creating food...');
try {
  const result = createFood(testData);
  console.log('Result:', result);
  
  if (result.success) {
    console.log(`✅ SUCCESS! Food created!`);
    console.log(`   Food ID: ${result.food_id}`);
    
    // Now test with variations
    console.log('\n🧪 Testing with variations...');
    const testDataWithVariations = {
      foodData: {
        name: 'Food with Variations',
        description: 'Test food with variations',
        image: 'test-variations.jpg',
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
        sku: 'FWV001',
        barcode: '1234567890141',
        stock_type: 'limited',
        item_stock: 25,
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
              total_stock: 50,
              stock_type: 'limited',
              sell_count: 0
            },
            {
              option_name: 'Large',
              option_price: 2.00,
              total_stock: 50,
              stock_type: 'limited',
              sell_count: 0
            }
          ]
        }
      ]
    };
    
    const variationResult = createFood(testDataWithVariations);
    console.log('Variation Result:', variationResult);
    
    if (variationResult.success) {
      console.log(`✅ SUCCESS! Food with variations created!`);
      console.log(`   Food ID: ${variationResult.food_id}`);
      console.log(`   Variations: ${variationResult.createdVariations.length}`);
    } else {
      console.log(`❌ Variation test failed: ${variationResult.message}`);
    }
    
  } else {
    console.log(`❌ Failed: ${result.message}`);
  }
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}

console.log('\n📊 Current foods:');
const foods = getAllFoods();
if (foods.success) {
  console.log(`   Total: ${foods.data.length}`);
  foods.data.slice(-5).forEach(food => {
    console.log(`   - ${food.name} (ID: ${food.id})`);
  });
} 