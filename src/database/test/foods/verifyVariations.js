import { createFood, getAllFoods } from '../../models/foods/food.js';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../../pos.db');
const db = new Database(dbPath);

console.log('🔍 VERIFYING VARIATIONS AND OPTIONS CREATION\n');

// Check current database state
console.log('📊 Current database state:');
const foodCount = db.prepare('SELECT COUNT(*) as count FROM food WHERE isdeleted = 0').get();
const variationCount = db.prepare('SELECT COUNT(*) as count FROM variation WHERE isdeleted = 0').get();
const optionCount = db.prepare('SELECT COUNT(*) as count FROM variation_options WHERE isdeleted = 0').get();

console.log(`   Foods: ${foodCount.count}`);
console.log(`   Variations: ${variationCount.count}`);
console.log(`   Options: ${optionCount.count}\n`);

// Show existing variations if any
if (variationCount.count > 0) {
  console.log('📋 Existing variations:');
  const variations = db.prepare('SELECT * FROM variation WHERE isdeleted = 0').all();
  variations.forEach((variation, index) => {
    console.log(`   ${index + 1}. ${variation.name} (ID: ${variation.id}, Food ID: ${variation.food_id})`);
    
    const options = db.prepare('SELECT * FROM variation_options WHERE variation_id = ? AND isdeleted = 0').all(variation.id);
    console.log(`      Options: ${options.length}`);
    options.forEach(option => {
      console.log(`        └─ ${option.option_name} (+$${option.option_price})`);
    });
  });
}

// Test data with unique SKU
const testData = {
  foodData: {
    name: 'Verification Test Pizza',
    description: 'Testing if variations and options are created',
    image: 'verify-pizza.jpg',
    category_id: 1,
    subcategory_id: null,
    price: 20.99,
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
    sku: 'VTP001',
    barcode: '1234567890145',
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
        }
      ]
    }
  ]
};

console.log('\n📋 Test Data:');
console.log(`   Food: ${testData.foodData.name}`);
console.log(`   SKU: ${testData.foodData.sku}`);
console.log(`   Variations: ${testData.variations.length}`);
console.log(`   Total Options: ${testData.variations.reduce((sum, v) => sum + v.options.length, 0)}\n`);

console.log('🍽️ Creating food with variations...');
try {
  const result = createFood(testData);
  console.log('Result:', result);
  
  if (result.success) {
    console.log(`✅ Food created successfully!`);
    console.log(`   Food ID: ${result.food_id}`);
    console.log(`   Variations created: ${result.createdVariations.length}`);
    
    // Check database state after creation
    console.log('\n📊 Database state after creation:');
    const newFoodCount = db.prepare('SELECT COUNT(*) as count FROM food WHERE isdeleted = 0').get();
    const newVariationCount = db.prepare('SELECT COUNT(*) as count FROM variation WHERE isdeleted = 0').get();
    const newOptionCount = db.prepare('SELECT COUNT(*) as count FROM variation_options WHERE isdeleted = 0').get();
    
    console.log(`   Foods: ${newFoodCount.count} (was ${foodCount.count})`);
    console.log(`   Variations: ${newVariationCount.count} (was ${variationCount.count})`);
    console.log(`   Options: ${newOptionCount.count} (was ${optionCount.count})`);
    
    // Show the created food
    console.log('\n🍽️ Created food:');
    const createdFood = db.prepare('SELECT * FROM food WHERE id = ?').get(result.food_id);
    console.log(`   Name: ${createdFood.name}`);
    console.log(`   ID: ${createdFood.id}`);
    console.log(`   SKU: ${createdFood.sku}`);
    console.log(`   Position: ${createdFood.position}`);
    
    // Show the created variations
    console.log('\n📋 Created variations:');
    const createdVariations = db.prepare('SELECT * FROM variation WHERE food_id = ? AND isdeleted = 0').all(result.food_id);
    console.log(`   Found ${createdVariations.length} variations for food ID ${result.food_id}`);
    
    createdVariations.forEach((variation, index) => {
      console.log(`   ${index + 1}. ${variation.name} (ID: ${variation.id})`);
      console.log(`      Type: ${variation.type}`);
      console.log(`      Min: ${variation.min}, Max: ${variation.max}`);
      console.log(`      Required: ${variation.is_required}`);
      
      // Show options for this variation
      const options = db.prepare('SELECT * FROM variation_options WHERE variation_id = ? AND isdeleted = 0').all(variation.id);
      console.log(`      Options: ${options.length}`);
      options.forEach(option => {
        console.log(`        └─ ${option.option_name} (+$${option.option_price})`);
      });
    });
    
    if (createdVariations.length === 0) {
      console.log('   ❌ NO VARIATIONS FOUND! This indicates a problem.');
    }
    
    console.log('\n🎉 VERIFICATION COMPLETED!');
    
  } else {
    console.log(`❌ Failed to create food: ${result.message}`);
  }
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
  console.log('Stack:', error.stack);
}

db.close(); 