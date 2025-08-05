import { createFood, getAllFoods, getFoodById, getAllAllergins } from '../../models/foods/food.js';

console.log('🎯 FINAL FOOD TEST - CREATE FOOD WITH VARIATIONS AND ALLERGINS\n');

// First, let's get available allergins
console.log('📋 Getting available allergins...');
const allerginsResult = getAllAllergins();
if (allerginsResult.success) {
  console.log(`   Found ${allerginsResult.data.length} allergins:`);
  allerginsResult.data.forEach(allergin => {
    console.log(`   - ID: ${allergin.id}, Name: ${allergin.name}`);
  });
} else {
  console.log('   No allergins found, will create food without allergins');
}

// Test data with allergins
const testData = {
  foodData: {
    name: 'Deluxe Burger with Allergins',
    description: 'Premium beef burger with all the fixings',
    image: 'deluxe-burger.jpg',
    category_id: 1,
    subcategory_id: null,
    price: 16.99,
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
    sku: 'DB001',
    barcode: '1234567890139',
    stock_type: 'limited',
    item_stock: 30,
    sell_count: 0
  },
  variations: [
    {
      name: 'Cheese Type',
      type: 'single',
      min: 1,
      max: 1,
      is_required: 1,
      options: [
        {
          option_name: 'Cheddar',
          option_price: 0,
          total_stock: 100,
          stock_type: 'limited',
          sell_count: 0
        },
        {
          option_name: 'Swiss',
          option_price: 1.00,
          total_stock: 100,
          stock_type: 'limited',
          sell_count: 0
        }
      ]
    }
  ],
  allergins: allerginsResult.success ? [1, 2, 3] : [] // Use first 3 allergins if available
};

console.log('📋 Test Data:');
console.log(`   Food: ${testData.foodData.name}`);
console.log(`   Price: $${testData.foodData.price}`);
console.log(`   SKU: ${testData.foodData.sku}`);
console.log(`   Variations: ${testData.variations.length}`);
console.log(`   Total Options: ${testData.variations[0].options.length}`);
console.log(`   Allergins: ${testData.allergins.length}\n`);

console.log('🍽️ Creating food with variations and allergins...');
try {
  const result = createFood(testData);
  console.log('Result:', result);
  
  if (result.success) {
    console.log(`✅ SUCCESS! Food created with variations and allergins!`);
    console.log(`   Food ID: ${result.food_id}`);
    console.log(`   Variations created: ${result.createdVariations.length}`);
    console.log(`   Allergins created: ${result.createdAllergins.length}`);
    
    // Verify the created food
    console.log('\n🔍 Verifying created food...');
    const food = getFoodById(result.food_id);
    
    if (food.success) {
      console.log(`   Name: ${food.data.name}`);
      console.log(`   Price: $${food.data.price}`);
      console.log(`   SKU: ${food.data.sku}`);
      console.log(`   Variations: ${food.data.variations?.length || 0}`);
      console.log(`   Allergins: ${food.data.allergins?.length || 0}`);
      
      if (food.data.variations && food.data.variations.length > 0) {
        console.log('\n   📋 Variation Details:');
        food.data.variations.forEach((variation, index) => {
          console.log(`   ${index + 1}. ${variation.name}`);
          console.log(`      Type: ${variation.type}`);
          console.log(`      Required: ${variation.is_required}`);
          console.log(`      Options: ${variation.options?.length || 0}`);
          
          if (variation.options && variation.options.length > 0) {
            variation.options.forEach(option => {
              console.log(`        └─ ${option.option_name} (+$${option.option_price})`);
            });
          }
        });
      }
      
      if (food.data.allergins && food.data.allergins.length > 0) {
        console.log('\n   ⚠️ Allergin Details:');
        food.data.allergins.forEach((allergin, index) => {
          console.log(`   ${index + 1}. ${allergin.name} (ID: ${allergin.id})`);
        });
      }
    }
    
    console.log('\n🎉 TEST COMPLETED SUCCESSFULLY!');
    console.log('✅ Food created with variations, options, and allergins!');
    
  } else {
    console.log(`❌ Failed: ${result.message}`);
  }
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
  console.log('Stack:', error.stack);
}

console.log('\n📊 Current foods in database:');
const foods = getAllFoods();
if (foods.success) {
  console.log(`   Total foods: ${foods.data.length}`);
  foods.data.slice(-5).forEach(food => {
    console.log(`   - ${food.name} (ID: ${food.id}, Price: $${food.price || 'N/A'})`);
  });
} 