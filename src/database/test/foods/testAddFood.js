import { createFood, getAllFoods, getFoodById } from '../../models/foods/food.js';

console.log('🚀 Starting Food Test (ES Modules)...\n');

// Simple test food data
const testFoods = [
  {
    foodData: {
      name: 'Pepperoni Pizza',
      description: 'Delicious pizza topped with pepperoni and cheese',
      image: 'pepperoni-pizza.jpg',
      category_id: 1,
      subcategory_id: null,
      price: 18.99,
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
      sku: 'PP001',
      barcode: '1234567890130',
      stock_type: 'limited',
      item_stock: 25,
      sell_count: 0
    },
    variations: []
  },
  {
    foodData: {
      name: 'Greek Salad',
      description: 'Fresh salad with feta cheese, olives, and Mediterranean vegetables',
      image: 'greek-salad.jpg',
      category_id: 1,
      subcategory_id: null,
      price: 13.99,
      tax: 8.5,
      tax_type: 'percentage',
      discount: 0,
      discount_type: 'percentage',
      available_time_starts: '11:00',
      available_time_ends: '22:00',
      veg: 1,
      status: 'active',
      restaurant_id: 1,
      position: 2,
      sku: 'GS001',
      barcode: '1234567890131',
      stock_type: 'limited',
      item_stock: 35,
      sell_count: 0
    },
    variations: []
  },
  {
    foodData: {
      name: 'Chicken Alfredo Pasta',
      description: 'Creamy Alfredo sauce with grilled chicken and fettuccine pasta',
      image: 'chicken-alfredo.jpg',
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
      position: 3,
      sku: 'CAP001',
      barcode: '1234567890132',
      stock_type: 'limited',
      item_stock: 30,
      sell_count: 0
    },
    variations: [
      {
        name: 'Pasta Type',
        type: 'single',
        min: 1,
        max: 1,
        is_required: true,
        options: [
          {
            option_name: 'Fettuccine',
            option_price: 0,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'Spaghetti',
            option_price: 0,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'Penne',
            option_price: 0,
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
function createTestFoods() {
  console.log('🍽️ Creating test foods...');
  const createdFoods = [];
  
  for (const food of testFoods) {
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
function displayAllFoods() {
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
function runFoodTest() {
  try {
    // Step 1: Show current foods
    displayAllFoods();
    
    // Step 2: Create new foods
    createTestFoods();
    
    // Step 3: Show updated foods
    console.log('\n' + '='.repeat(50));
    displayAllFoods();
    
    console.log('\n✅ Food test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
runFoodTest(); 