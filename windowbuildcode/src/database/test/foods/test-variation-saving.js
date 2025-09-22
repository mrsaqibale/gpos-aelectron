import { createFood } from '../../models/foods/food.js';
import { createVariation, createVariationOption } from '../../models/foods/variations.js';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic path resolution for both development and production
const getDynamicPath = (relativePath) => {
  try {
    // Check if we're in development by looking for src/database
    const devPath = path.join(__dirname, '../../', relativePath);
    const prodPath = path.join(__dirname, '../../../', relativePath);
    
    if (fs.existsSync(devPath)) {
      return devPath;
    } else if (fs.existsSync(prodPath)) {
      return devPath;
    } else {
      // Fallback to development path
      return devPath;
    }
  } catch (error) {
    console.error(`Failed to resolve path: ${relativePath}`, error);
    // Fallback to development path
    return path.join(__dirname, '../../', relativePath);
  }
};

const dbPath = getDynamicPath('pos.db');
const db = new Database(dbPath);

console.log('🧪 TESTING VARIATION SAVING FUNCTIONALITY\n');

// Check current database state
console.log('📊 Current database state:');
const foodCount = db.prepare('SELECT COUNT(*) as count FROM food WHERE isdeleted = 0').get();
const variationCount = db.prepare('SELECT COUNT(*) as count FROM variation WHERE isdeleted = 0').get();
const optionCount = db.prepare('SELECT COUNT(*) as count FROM variation_options WHERE isdeleted = 0').get();

console.log(`   Foods: ${foodCount.count}`);
console.log(`   Variations: ${variationCount.count}`);
console.log(`   Options: ${optionCount.count}\n`);

// Test data
const testFoodData = {
  name: 'Test Pizza with Variations',
  description: 'A test pizza to verify variation saving',
  category_id: 1,
  price: 25.99,
  restaurant_id: 1,
  sku: `TEST${Date.now()}`,
  position: 1
};

const testVariations = [
  {
    name: 'Size',
    type: 'single',
    min: 1,
    max: 1,
    is_required: true,
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
    is_required: false,
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
      },
      {
        option_name: 'Mushrooms',
        option_price: 1.50,
        total_stock: 100,
        stock_type: 'limited',
        sell_count: 0
      }
    ]
  }
];

console.log('🍽️ Creating test food...');
try {
  // Step 1: Create the food
  const foodResult = createFood(testFoodData);
  
  if (foodResult.success) {
    console.log(`✅ Food created successfully!`);
    console.log(`   Food ID: ${foodResult.food_id}`);
    
    // Step 2: Create variations
    console.log('\n📋 Creating variations...');
    const createdVariations = [];
    
    for (const variation of testVariations) {
      const variationData = {
        food_id: foodResult.food_id,
        name: variation.name,
        type: variation.type,
        min: variation.min,
        max: variation.max,
        is_required: variation.is_required
      };
      
      console.log(`   Creating variation "${variation.name}" with data:`, variationData);
      const variationId = createVariation(variationData);
      console.log(`   Variation creation result:`, variationId);
      
      if (variationId) {
        console.log(`   ✅ Variation "${variation.name}" created with ID: ${variationId}`);
        createdVariations.push({ variationId, options: variation.options });
        
        // Step 3: Create variation options
        console.log(`      Creating options for "${variation.name}"...`);
        const createdOptions = [];
        
        for (const option of variation.options) {
          const optionData = {
            food_id: foodResult.food_id,
            variation_id: variationId,
            option_name: option.option_name,
            option_price: option.option_price,
            total_stock: option.total_stock,
            stock_type: option.stock_type,
            sell_count: option.sell_count
          };
          
          const optionId = createVariationOption(optionData);
          
          if (optionId) {
            console.log(`         ✅ Option "${option.option_name}" created with ID: ${optionId}`);
            createdOptions.push(optionId);
          } else {
            console.log(`         ❌ Failed to create option "${option.option_name}"`);
          }
        }
        
        console.log(`      Total options created: ${createdOptions.length}/${variation.options.length}`);
      } else {
        console.log(`   ❌ Failed to create variation "${variation.name}"`);
      }
    }
    
    // Step 4: Verify database state
    console.log('\n📊 Database state after creation:');
    const newFoodCount = db.prepare('SELECT COUNT(*) as count FROM food WHERE isdeleted = 0').get();
    const newVariationCount = db.prepare('SELECT COUNT(*) as count FROM variation WHERE isdeleted = 0').get();
    const newOptionCount = db.prepare('SELECT COUNT(*) as count FROM variation_options WHERE isdeleted = 0').get();
    
    console.log(`   Foods: ${newFoodCount.count} (was ${foodCount.count})`);
    console.log(`   Variations: ${newVariationCount.count} (was ${variationCount.count})`);
    console.log(`   Options: ${newOptionCount.count} (was ${optionCount.count})`);
    
    // Show the created variations
    console.log('\n📋 Created variations:');
    const createdVariationsFromDB = db.prepare('SELECT * FROM variation WHERE food_id = ? AND isdeleted = 0').all(foodResult.food_id);
    console.log(`   Found ${createdVariationsFromDB.length} variations for food ID ${foodResult.food_id}`);
    
    createdVariationsFromDB.forEach((variation, index) => {
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
    
    console.log('\n🎉 TEST COMPLETED SUCCESSFULLY!');
    
  } else {
    console.log(`❌ Failed to create food: ${foodResult.message}`);
  }
  
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
  console.log('Stack:', error.stack);
}

db.close(); 