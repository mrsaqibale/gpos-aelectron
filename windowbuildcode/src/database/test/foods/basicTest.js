console.log('🔍 BASIC DATABASE TEST\n');

try {
  // Test basic import
  console.log('1. Testing import...');
  const { createFood } = await import('../../models/foods/food.js');
  console.log('✅ Import successful');
  
  // Test with minimal data
  console.log('\n2. Testing with minimal data...');
  const timestamp = Date.now();
  const testData = {
    foodData: {
      name: `Basic Test ${timestamp}`,
      category_id: 1,
      price: 10.00,
      restaurant_id: 1,
      sku: `BASIC${timestamp}`
    },
    variations: []
  };
  
  console.log('Test data:', testData);
  const result = createFood(testData);
  console.log('Result:', result);
  
  if (result.success) {
    console.log('✅ SUCCESS! Food created without variations');
  } else {
    console.log('❌ FAILED:', result.message);
  }
  
} catch (error) {
  console.log('❌ ERROR:', error.message);
  console.log('Stack:', error.stack);
}

console.log('\n🏁 Basic test completed!'); 