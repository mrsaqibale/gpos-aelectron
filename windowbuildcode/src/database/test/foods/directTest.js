import { createFood, getAllFoods } from '../../models/foods/food.js';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../../pos.db');
const db = new Database(dbPath);

console.log('🎯 DIRECT DATABASE TEST\n');

// Test data
const testData = {
  foodData: {
    name: 'Direct Test Pizza',
    description: 'Testing direct database operations',
    image: 'direct-test.jpg',
    category_id: 1,
    subcategory_id: null,
    price: 17.99,
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
    sku: 'DTP001',
    barcode: '1234567890143',
    stock_type: 'limited',
    item_stock: 25,
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
          total_stock: 50,
          stock_type: 'limited',
          sell_count: 0
        },
        {
          option_name: 'Large',
          option_price: 2.00,
          total_stock: 50,
          stock_type: 'limited',
          sell_count: 0
        }
      ]
    }
  ]
};

console.log('📋 Test Data:');
console.log(`   Food: ${testData.foodData.name}`);
console.log(`   SKU: ${testData.foodData.sku}`);
console.log(`   Variations: ${testData.variations.length}`);
console.log(`   Options: ${testData.variations[0].options.length}\n`);

// Check current state
console.log('📊 Current database state:');
const foodCount = db.prepare('SELECT COUNT(*) as count FROM food WHERE isdeleted = 0').get();
const variationCount = db.prepare('SELECT COUNT(*) as count FROM variation WHERE isdeleted = 0').get();
const optionCount = db.prepare('SELECT COUNT(*) as count FROM variation_options WHERE isdeleted = 0').get();

console.log(`   Foods: ${foodCount.count}`);
console.log(`   Variations: ${variationCount.count}`);
console.log(`   Options: ${optionCount.count}\n`);

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
    
    // Show the created variations and options
    console.log('\n🔍 Created variations:');
    const variations = db.prepare('SELECT * FROM variation WHERE food_id = ? AND isdeleted = 0').all(result.food_id);
    variations.forEach((variation, index) => {
      console.log(`   ${index + 1}. ${variation.name} (ID: ${variation.id})`);
      
      const options = db.prepare('SELECT * FROM variation_options WHERE variation_id = ? AND isdeleted = 0').all(variation.id);
      console.log(`      Options: ${options.length}`);
      options.forEach(option => {
        console.log(`        └─ ${option.option_name} (+$${option.option_price})`);
      });
    });
    
    console.log('\n🎉 TEST COMPLETED SUCCESSFULLY!');
    
  } else {
    console.log(`❌ Failed: ${result.message}`);
  }
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
  console.log('Stack:', error.stack);
}

db.close(); 