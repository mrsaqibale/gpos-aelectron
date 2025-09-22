console.log('🧪 TESTING WITH VARIATIONS\n');

try {
  const { createFood } = await import('../../models/foods/food.js');
  
  const timestamp = Date.now();
  const testData = {
    foodData: {
      name: `Variation Test ${timestamp}`,
      category_id: 1,
      price: 20.00,
      restaurant_id: 1,
      sku: `VAR${timestamp}`,
      position: 1
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
            option_price: 0
          },
          {
            option_name: 'Large',
            option_price: 3.00
          }
        ]
      }
    ]
  };
  
  console.log('Creating food with variations...');
  console.log('Variations count:', testData.variations.length);
  console.log('Options count:', testData.variations[0].options.length);
  
  const result = createFood(testData);
  console.log('Result:', JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('✅ SUCCESS!');
    console.log('Food ID:', result.food_id);
    console.log('Variations created:', result.createdVariations.length);
    
    if (result.createdVariations.length > 0) {
      console.log('\n📋 Created variations:');
      result.createdVariations.forEach((variation, index) => {
        console.log(`   ${index + 1}. Variation ID: ${variation.variationId}`);
        console.log(`      Options created: ${variation.optionIds.length}`);
      });
    } else {
      console.log('⚠️  No variations were created!');
    }
  } else {
    console.log('❌ FAILED:', result.message);
  }
  
} catch (error) {
  console.log('❌ ERROR:', error.message);
  console.log('Stack:', error.stack);
}

console.log('\n�� Test completed!'); 