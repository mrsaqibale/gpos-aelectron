import { createFood, getAllFoods, getFoodById } from '../../models/foods/food.js';

console.log('🚀 Adding New Foods to Database...\n');

// New food data with unique SKUs
const newFoods = [
  {
    foodData: {
      name: 'Beef Burger Deluxe',
      description: 'Juicy beef patty with lettuce, tomato, cheese, and special sauce',
      image: 'beef-burger.jpg',
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
      sku: 'BBD001',
      barcode: '1234567890133',
      stock_type: 'limited',
      item_stock: 40,
      sell_count: 0
    },
    variations: [
      {
        name: 'Cheese Type',
        type: 'single',
        min: 1,
        max: 1,
        is_required: true,
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
          },
          {
            option_name: 'Blue Cheese',
            option_price: 1.50,
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
      name: 'Vegetable Stir Fry',
      description: 'Fresh mixed vegetables stir-fried in savory sauce with rice',
      image: 'veg-stir-fry.jpg',
      category_id: 1,
      subcategory_id: null,
      price: 16.99,
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
      sku: 'VSF001',
      barcode: '1234567890134',
      stock_type: 'limited',
      item_stock: 30,
      sell_count: 0
    },
    variations: [
      {
        name: 'Rice Type',
        type: 'single',
        min: 1,
        max: 1,
        is_required: true,
        options: [
          {
            option_name: 'White Rice',
            option_price: 0,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'Brown Rice',
            option_price: 1.00,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'Fried Rice',
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
      name: 'Chocolate Milkshake',
      description: 'Rich and creamy chocolate milkshake with whipped cream',
      image: 'chocolate-milkshake.jpg',
      category_id: 1,
      subcategory_id: null,
      price: 8.99,
      tax: 8.5,
      tax_type: 'percentage',
      discount: 0,
      discount_type: 'percentage',
      available_time_starts: '10:00',
      available_time_ends: '23:00',
      veg: 1,
      status: 'active',
      restaurant_id: 1,
      position: 3,
      sku: 'CMS001',
      barcode: '1234567890135',
      stock_type: 'limited',
      item_stock: 50,
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
            option_name: 'Small',
            option_price: 0,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'Medium',
            option_price: 1.50,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          },
          {
            option_name: 'Large',
            option_price: 2.50,
            total_stock: 100,
            stock_type: 'limited',
            sell_count: 0
          }
        ]
      }
    ]
  }
];

// Function to create new foods
function createNewFoods() {
  console.log('🍽️ Creating new foods...');
  const createdFoods = [];
  
  for (const food of newFoods) {
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
  console.log('\n📊 All foods in database:');
  const foods = getAllFoods();
  
  if (foods.success) {
    console.log(`   Total foods: ${foods.data.length}`);
    foods.data.forEach(food => {
      console.log(`   - ${food.name} (ID: ${food.id}, Price: $${food.price || 'N/A'}, SKU: ${food.sku || 'N/A'})`);
    });
  } else {
    console.log(`   ❌ Failed to get foods: ${foods.message}`);
  }
}

// Function to show detailed food info
function showDetailedFoodInfo() {
  console.log('\n🔍 Detailed food information:');
  const foods = getAllFoods();
  
  if (foods.success && foods.data.length > 0) {
    // Show details of the most recently added food
    const latestFood = foods.data[foods.data.length - 1];
    const detailedFood = getFoodById(latestFood.id);
    
    if (detailedFood.success) {
      console.log(`   Food: ${detailedFood.data.name}`);
      console.log(`   Description: ${detailedFood.data.description}`);
      console.log(`   Price: $${detailedFood.data.price}`);
      console.log(`   Category: ${detailedFood.data.category?.name || 'N/A'}`);
      console.log(`   Subcategory: ${detailedFood.data.subcategory?.name || 'N/A'}`);
      console.log(`   SKU: ${detailedFood.data.sku}`);
      console.log(`   Stock: ${detailedFood.data.item_stock}`);
      console.log(`   Variations: ${detailedFood.data.variations?.length || 0}`);
      
      if (detailedFood.data.variations?.length > 0) {
        console.log(`   Variation details:`);
        detailedFood.data.variations.forEach(variation => {
          console.log(`     └─ ${variation.name} (${variation.options?.length || 0} options)`);
          if (variation.options?.length > 0) {
            variation.options.forEach(option => {
              console.log(`        └─ ${option.option_name} (+$${option.option_price})`);
            });
          }
        });
      }
    }
  }
}

// Main function
function addNewFoods() {
  try {
    // Step 1: Show current foods
    displayAllFoods();
    
    // Step 2: Create new foods
    createNewFoods();
    
    // Step 3: Show updated foods
    console.log('\n' + '='.repeat(60));
    displayAllFoods();
    
    // Step 4: Show detailed info
    showDetailedFoodInfo();
    
    console.log('\n✅ New foods added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding foods:', error.message);
  }
}

// Run the function
addNewFoods(); 