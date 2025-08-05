import { createFood } from '../../models/foods/food.js';

console.log('🧪 SIMPLE TEST - CREATE FOOD WITH VARIATIONS\n');

// Generate unique identifiers
const timestamp = Date.now();
const uniqueSKU = `UNIQUE${timestamp}`;

const testData = {
  foodData: {
    name: `Test Food ${timestamp}`,
    description: 'Simple test food',
    category_id: 1,
    price: 15.99,
    restaurant_id: 1,
    position: 1,
    sku: uniqueSKU,
    veg: 0,
    status: 'active'
  },
  variations: [
    {
      name: 'Test Variation',
      type: 'single',
      min: 1,
      max: 1,
      is_required: 1,
      options: [
        {
          option_name: 'Option 1',
          option_price: 0
        },
        {
          option_name: 'Option 2',
          option_price: 1.50
        }
      ]
    }
  ]
};

console.log('Creating food with SKU:', uniqueSKU);

try {
  const result = createFood(testData);
  
  console.log('Result:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('✅ SUCCESS!');
    console.log('Food ID:', result.food_id);
    console.log('Variations created:', result.createdVariations.length);
  } else {
    console.log('❌ FAILED:', result.message);
  }
} catch (error) {
  console.log('❌ ERROR:', error.message);
}

console.log('Test completed!'); 