import { createFood } from '../../models/foods/food.js';

console.log('🧪 TESTING CREATE FOOD WITH ALLERGINS\n');

// Generate unique identifiers
const timestamp = Date.now();
const uniqueSKU = `ALLER${timestamp}`;

const testData = {
  foodData: {
    name: `Allergin Test Pizza ${timestamp}`,
    description: 'Testing food creation with allergins',
    image: 'allergin-pizza.jpg',
    category_id: 1,
    subcategory_id: null,
    price: 22.99,
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
    sku: uniqueSKU,
    barcode: `1234567890${timestamp}`,
    stock_type: 'limited',
    item_stock: 35,
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
          total_stock: 40,
          stock_type: 'limited',
          sell_count: 0
        },
        {
          option_name: 'Large',
          option_price: 3.00,
          total_stock: 40,
          stock_type: 'limited',
          sell_count: 0
        }
      ]
    }
  ],
  allergins: [1, 2, 3] // Assuming these allergin IDs exist in the allergins table
};

console.log('📋 Test Data:');
console.log(`   Food: ${testData.foodData.name}`);
console.log(`   SKU: ${testData.foodData.sku}`);
console.log(`   Variations: ${testData.variations.length}`);
console.log(`   Allergins: ${testData.allergins.length}\n`);

console.log('🍽️ Creating food with variations and allergins...');
try {
  const result = createFood(testData);
  
  console.log('Result:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('✅ SUCCESS! Food created with variations and allergins!');
    console.log('Food ID:', result.food_id);
    console.log('Variations created:', result.createdVariations.length);
    console.log('Allergins created:', result.createdAllergins.length);
    
    if (result.createdVariations.length > 0) {
      console.log('\n📋 Created variations:');
      result.createdVariations.forEach((variation, index) => {
        console.log(`   ${index + 1}. Variation ID: ${variation.variationId}`);
        console.log(`      Options created: ${variation.optionIds.length}`);
      });
    }
    
    if (result.createdAllergins.length > 0) {
      console.log('\n⚠️ Created allergin associations:');
      result.createdAllergins.forEach((allerginId, index) => {
        console.log(`   ${index + 1}. Allergin association ID: ${allerginId}`);
      });
    }
    
  } else {
    console.log('❌ FAILED:', result.message);
  }
} catch (error) {
  console.log('❌ ERROR:', error.message);
}

console.log('\n�� Test completed!'); 