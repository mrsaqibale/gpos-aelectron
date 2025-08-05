import { createFood, getAllFoods, getFoodById } from '../../models/foods/food.js';

console.log('🚀 Testing Food Creation Function...\n');

// Test food data with variations
const testFoods = [
  {
    foodData: {
      name: 'Chicken test ',
      description: 'Aromatic basmati rice cooked with tender chicken and aromatic spices',
      image: 'chicken-biryani.jpg',
      category_id: 1, // Main Course
      subcategory_id: null,
      price: 18.99,
      tax: 8.5,
      tax_type: 'percentage',
      discount: 0,
      discount_type: 'percentage',
      available_time_starts: '11:00',
      available_time_ends: '23:00',
      veg: 0, // Non-veg
      status: 'active',
      restaurant_id: 1,
      position: 1,
      sku: 'CB001',
      barcode: '1234567890001',
      stock_type: 'limited',
      item_stock: 50,
      sell_count: 0
    },
    variations: [
      {
        name: 'Spice Level',
        type: 'single',
        min: 1,
        max: 1,
        is_required: 1,
        options: [
          {
            option_name: 'Mild',
            option_price: 0,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'Medium',
            option_price: 0,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'Hot',
            option_price: 0,
            total_stock: 100,
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
            option_name: 'Extra Chicken',
            option_price: 3.99,
            total_stock: 50,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'Extra Rice',
            option_price: 2.99,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'Raita',
            option_price: 1.99,
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
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato sauce, mozzarella cheese, and fresh basil',
      image: 'margherita-pizza.jpg',
      category_id: 1, // Main Course
      subcategory_id: null,
      price: 16.99,
      tax: 8.5,
      tax_type: 'percentage',
      discount: 0,
      discount_type: 'percentage',
      available_time_starts: '11:00',
      available_time_ends: '23:00',
      veg: 1, // Veg
      status: 'active',
      restaurant_id: 1,
      position: 2,
      sku: 'MP001',
      barcode: '1234567890002',
      stock_type: 'limited',
      item_stock: 30,
      sell_count: 0
    },
    variations: [
      {
        name: 'Size',
        type: 'single',
        min: 1,
        max: 1,
        is_required: true,
        options: [
          {
            option_name: 'Small (10")',
            option_price: -2.00,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'Medium (12")',
            option_price: 0,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'Large (14")',
            option_price: 3.00,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          }
        ]
      },
      {
        name: 'Extra Toppings',
        type: 'multiple',
        min: 0,
        max: 5,
        is_required: 0,
        options: [
          {
            option_name: 'Mushrooms',
            option_price: 2.50,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'Pepperoni',
            option_price: 3.50,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'Extra Cheese',
            option_price: 2.00,
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
      name: 'Cold Coffee',
      description: 'Refreshing cold coffee with cream and ice',
      image: 'cold-coffee.jpg',
      category_id: 2, // Beverages
      subcategory_id: null,
      price: 4.99,
      tax: 8.5,
      tax_type: 'percentage',
      discount: 0,
      discount_type: 'percentage',
      available_time_starts: '08:00',
      available_time_ends: '22:00',
      veg: 1, // Veg
      status: 'active',
      restaurant_id: 1,
      position: 3,
      sku: 'CC001',
      barcode: '1234567890003',
      stock_type: 'unlimited',
      item_stock: 0,
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
            option_price: -1.00,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'Medium',
            option_price: 0,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'Large',
            option_price: 1.50,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          }
        ]
      }
    ]
  }
];

// Function to create a single food item
async function createSingleFood(foodItem, index) {
  console.log(`🍽️ Creating food ${index + 1}: ${foodItem.foodData.name}`);
  
  try {
    const result = await createFood(foodItem);
    
    if (result.success) {
      console.log(`✅ Successfully created food with ID: ${result.food_id}`);
      console.log(`   Variations created: ${result.createdVariations.length}`);
      
      // Show variation details
      result.createdVariations.forEach((variation, vIndex) => {
        console.log(`   Variation ${vIndex + 1}: ${variation.variationId} (${variation.optionIds.length} options)`);
      });
      
      return result;
    } else {
      console.log(`❌ Failed to create food: ${result.message}`);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error creating food: ${error.message}`);
    return null;
  }
}

// Function to create all test foods
async function createAllTestFoods() {
  console.log('🚀 Starting to create all test foods...\n');
  
  const results = [];
  
  for (let i = 0; i < testFoods.length; i++) {
    const result = await createSingleFood(testFoods[i], i);
    results.push(result);
    console.log(''); // Empty line for readability
  }
  
  return results;
}

// Function to display all foods after creation
async function displayAllFoods() {
  console.log('📋 Displaying all foods in database...\n');
  
  try {
    const result = await getAllFoods();
    
    if (result.success) {
      console.log(`Total foods found: ${result.data.length}\n`);
      
      result.data.forEach((food, index) => {
        console.log(`${index + 1}. ${food.name}`);
        console.log(`   ID: ${food.id}`);
        console.log(`   Price: $${food.price}`);
        console.log(`   Category: ${food.category_name || 'Uncategorized'}`);
        console.log(`   Type: ${food.veg === 1 ? 'Veg' : 'Non-Veg'}`);
        console.log(`   Status: ${food.status}`);
        console.log(`   Stock: ${food.stock_type}`);
        console.log(`   Position: ${food.position}`);
        console.log('');
      });
    } else {
      console.log(`❌ Failed to get foods: ${result.message}`);
    }
  } catch (error) {
    console.log(`❌ Error getting foods: ${error.message}`);
  }
}

// Function to show detailed food information
async function showDetailedFoodInfo(foodId) {
  console.log(`🔍 Showing detailed info for food ID: ${foodId}\n`);
  
  try {
    const result = await getFoodById(foodId);
    
    if (result.success) {
      const food = result.data;
      console.log('🍽️ Food Details:');
      console.log(`   Name: ${food.name}`);
      console.log(`   Description: ${food.description || 'No description'}`);
      console.log(`   Price: $${food.price}`);
      console.log(`   Category: ${food.category?.name || 'Uncategorized'}`);
      console.log(`   Subcategory: ${food.subcategory?.name || 'None'}`);
      console.log(`   Type: ${food.veg === 1 ? 'Veg' : 'Non-Veg'}`);
      console.log(`   Status: ${food.status}`);
      console.log(`   Stock Type: ${food.stock_type}`);
      console.log(`   Item Stock: ${food.item_stock}`);
      console.log(`   Position: ${food.position}`);
      console.log(`   SKU: ${food.sku || 'N/A'}`);
      console.log(`   Barcode: ${food.barcode || 'N/A'}`);
      
      if (food.variations && food.variations.length > 0) {
        console.log('\n📋 Variations:');
        food.variations.forEach((variation, index) => {
          console.log(`   ${index + 1}. ${variation.name} (${variation.type})`);
          console.log(`      Min: ${variation.min}, Max: ${variation.max}, Required: ${variation.is_required ? 'Yes' : 'No'}`);
          
          if (variation.options && variation.options.length > 0) {
            console.log(`      Options:`);
            variation.options.forEach((option, optIndex) => {
              console.log(`         ${optIndex + 1}. ${option.option_name} (+$${option.option_price})`);
            });
          }
        });
      } else {
        console.log('\n📋 No variations found');
      }
      
      if (food.allergins && food.allergins.length > 0) {
        console.log('\n⚠️ Allergins:');
        food.allergins.forEach((allergin, index) => {
          console.log(`   ${index + 1}. ${allergin.name}`);
        });
      }
    } else {
      console.log(`❌ Failed to get food details: ${result.message}`);
    }
  } catch (error) {
    console.log(`❌ Error getting food details: ${error.message}`);
  }
}

// Main test function
async function runTest() {
  console.log('🧪 Running Food Creation Test...\n');
  
  try {
    // Step 1: Create all test foods
    console.log('Step 1: Creating test foods...\n');
    const creationResults = await createAllTestFoods();
    
    // Step 2: Display all foods
    console.log('Step 2: Displaying all foods...\n');
    await displayAllFoods();
    
    // Step 3: Show detailed info for first created food
    console.log('Step 3: Showing detailed info for first food...\n');
    if (creationResults[0] && creationResults[0].success) {
      await showDetailedFoodInfo(creationResults[0].food_id);
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

// Run the test
runTest(); 