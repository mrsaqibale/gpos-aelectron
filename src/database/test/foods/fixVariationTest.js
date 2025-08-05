import { createFood, getAllFoods, getFoodById } from '../../models/foods/food.js';

console.log('🔧 FIXING VARIATION AND OPTIONS CREATION\n');

// Test data with unique SKU to avoid conflicts
const testData = {
  foodData: {
    name: 'Fixed Variation Pizza',
    description: 'Pizza with properly created variations and options',
    image: 'fixed-pizza.jpg',
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
    sku: 'FVP001',
    barcode: '1234567890142',
    stock_type: 'limited',
    item_stock: 30,
    sell_count: 0
  },
  variations: [
    {
      name: 'Pizza Size',
      type: 'single',
      min: 1,
      max: 1,
      is_required: 1,
      options: [
        {
          option_name: 'Small (10")',
          option_price: 0,
          total_stock: 50,
          stock_type: 'limited',
          sell_count: 0
        },
        {
          option_name: 'Medium (12")',
          option_price: 3.00,
          total_stock: 50,
          stock_type: 'limited',
          sell_count: 0
        },
        {
          option_name: 'Large (14")',
          option_price: 6.00,
          total_stock: 50,
          stock_type: 'limited',
          sell_count: 0
        }
      ]
    },
    {
      name: 'Extra Toppings',
      type: 'multiple',
      min: 0,
      max: 3,
      is_required: 0,
      options: [
        {
          option_name: 'Extra Cheese',
          option_price: 2.50,
          total_stock: 100,
          stock_type: 'limited',
          sell_count: 0
        },
        {
          option_name: 'Pepperoni',
          option_price: 3.00,
          total_stock: 100,
          stock_type: 'limited',
          sell_count: 0
        },
        {
          option_name: 'Mushrooms',
          option_price: 1.50,
          total_stock: 100,
          stock_type: 'limited',
          sell_count: 0
        }
      ]
    }
  ]
};

console.log('📋 Test Data:');
console.log(`   Food: ${testData.foodData.name}`);
console.log(`   Price: $${testData.foodData.price}`);
console.log(`   SKU: ${testData.foodData.sku}`);
console.log(`   Variations: ${testData.variations.length}`);
console.log(`   Total Options: ${testData.variations.reduce((sum, v) => sum + v.options.length, 0)}\n`);

console.log('🍽️ Creating food with variations and options...');
try {
  const result = createFood(testData);
  console.log('Result:', result);
  
  if (result.success) {
    console.log(`✅ SUCCESS! Food created!`);
    console.log(`   Food ID: ${result.food_id}`);
    console.log(`   Variations created: ${result.createdVariations.length}`);
    
    // Show variation details
    if (result.createdVariations.length > 0) {
      console.log('\n📋 Created Variations:');
      result.createdVariations.forEach((variation, index) => {
        console.log(`   ${index + 1}. ${testData.variations[index].name}`);
        console.log(`      Variation ID: ${variation.variationId}`);
        console.log(`      Options created: ${variation.optionIds.length}`);
      });
    }
    
    // Verify the created food with all details
    console.log('\n🔍 Verifying created food with variations...');
    const food = getFoodById(result.food_id);
    
    if (food.success) {
      console.log(`✅ Food verification successful!`);
      console.log(`   Name: ${food.data.name}`);
      console.log(`   Price: $${food.data.price}`);
      console.log(`   SKU: ${food.data.sku}`);
      console.log(`   Position: ${food.data.position}`);
      console.log(`   Variations found: ${food.data.variations?.length || 0}`);
      
      if (food.data.variations && food.data.variations.length > 0) {
        console.log('\n📋 Variation Details:');
        food.data.variations.forEach((variation, index) => {
          console.log(`   ${index + 1}. ${variation.name}`);
          console.log(`      Type: ${variation.type}`);
          console.log(`      Min: ${variation.min}, Max: ${variation.max}`);
          console.log(`      Required: ${variation.is_required}`);
          console.log(`      Options: ${variation.options?.length || 0}`);
          
          if (variation.options && variation.options.length > 0) {
            console.log(`      Options:`);
            variation.options.forEach(option => {
              console.log(`        └─ ${option.option_name} (+$${option.option_price})`);
            });
          }
        });
      } else {
        console.log(`   ❌ No variations found in database!`);
      }
      
    } else {
      console.log(`❌ Failed to verify food: ${food.message}`);
    }
    
    console.log('\n🎉 TEST COMPLETED!');
    
  } else {
    console.log(`❌ Failed to create food: ${result.message}`);
  }
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
  console.log('Stack:', error.stack);
}

console.log('\n📊 Current foods in database:');
const foods = getAllFoods();
if (foods.success) {
  console.log(`   Total foods: ${foods.data.length}`);
  foods.data.slice(-3).forEach(food => {
    console.log(`   - ${food.name} (ID: ${food.id}, Price: $${food.price || 'N/A'})`);
  });
} 