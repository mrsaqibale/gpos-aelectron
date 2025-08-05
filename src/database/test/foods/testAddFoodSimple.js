import { createFood, getAllFoods, getFoodById } from '../../models/foods/food.js';

console.log('🚀 Starting Simple Food Test...\n');

// Simple test food data (using existing category/subcategory IDs if available)
const simpleTestFoods = [
  {
    foodData: {
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
      image: 'margherita-pizza.jpg',
      category_id: 1, // Assuming category 1 exists
      subcategory_id: null,
      price: 14.99,
      tax: 8.5,
      tax_type: 'percentage',
      discount: 0,
      discount_type: 'percentage',
      available_time_starts: '11:00',
      available_time_ends: '23:00',
      veg: 1,
      status: 'active',
      restaurant_id: 1,
      position: 1,
      sku: 'MP001',
      barcode: '1234567890127',
      stock_type: 'limited',
      item_stock: 20,
      sell_count: 0
    },
    variations: []
  },
  {
    foodData: {
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan cheese',
      image: 'caesar-salad.jpg',
      category_id: 1,
      subcategory_id: null,
      price: 12.99,
      tax: 8.5,
      tax_type: 'percentage',
      discount: 0,
      discount_type: 'percentage',
      available_time_starts: '11:00',
      available_time_ends: '22:00',
      veg: 0,
      status: 'active',
      restaurant_id: 1,
      position: 2,
      sku: 'CS001',
      barcode: '1234567890128',
      stock_type: 'limited',
      item_stock: 30,
      sell_count: 0
    },
    variations: [
      {
        name: 'Dressing Choice',
        type: 'single',
        min: 1,
        max: 1,
        is_required: true,
        options: [
          {
            option_name: 'Caesar Dressing',
            option_price: 0,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'Ranch Dressing',
            option_price: 0,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'Balsamic Vinaigrette',
            option_price: 0.50,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          }
        ]
      }
    ]
  },
  {
    foodData: {
      name: 'Chicken Wings',
      description: 'Crispy chicken wings with choice of sauce',
      image: 'chicken-wings.jpg',
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
      position: 3,
      sku: 'CW001',
      barcode: '1234567890129',
      stock_type: 'limited',
      item_stock: 40,
      sell_count: 0
    },
    variations: [
      {
        name: 'Sauce Selection',
        type: 'single',
        min: 1,
        max: 1,
        is_required: true,
        options: [
          {
            option_name: 'Buffalo Sauce',
            option_price: 0,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'BBQ Sauce',
            option_price: 0,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'Honey Mustard',
            option_price: 0,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'Garlic Parmesan',
            option_price: 1.00,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          }
        ]
      }
    ]
  }
];

// Function to create test foods
async function createTestFoods() {
  console.log('🍽️ Creating test foods...');
  const createdFoods = [];
  
  for (const food of simpleTestFoods) {
    try {
      console.log(`   Creating: ${food.foodData.name}...`);
      const result = createFood(food);
      
      if (result.success) {
        createdFoods.push({ ...food.foodData, id: result.food_id, variations: result.createdVariations });
        console.log(`   ✅ Created: ${food.foodData.name} (ID: ${result.food_id})`);
        if (result.createdVariations.length > 0) {
          console.log(`      └─ Created ${result.createdVariations.length} variations`);
        }
      } else {
        console.log(`   ❌ Failed: ${food.foodData.name} - ${result.message}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${food.foodData.name} - ${error.message}`);
    }
  }
  
  return createdFoods;
}

// Function to display all foods
async function displayAllFoods() {
  console.log('\n📊 Current foods in database:');
  const foods = getAllFoods();
  
  if (foods.success) {
    console.log(`   Total foods: ${foods.data.length}`);
    foods.data.forEach(food => {
      console.log(`   - ${food.name} (ID: ${food.id}, Price: $${food.price || 'N/A'})`);
    });
  } else {
    console.log(`   ❌ Failed to get foods: ${foods.message}`);
  }
}

// Main test function
async function runSimpleFoodTest() {
  try {
    // Step 1: Show current foods
    await displayAllFoods();
    
    // Step 2: Create new foods
    await createTestFoods();
    
    // Step 3: Show updated foods
    console.log('\n' + '='.repeat(50));
    await displayAllFoods();
    
    console.log('\n✅ Simple food test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
runSimpleFoodTest(); 