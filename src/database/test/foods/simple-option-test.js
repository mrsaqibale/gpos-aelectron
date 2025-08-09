import { createVariationOption } from '../../models/foods/variations.js';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic path resolution for both development and production
const getDynamicPath = (relativePath) => {
  try {
    const devPath = path.join(__dirname, '../../', relativePath);
    const prodPath = path.join(__dirname, '../../../', relativePath);
    
    if (fs.existsSync(devPath)) {
      return devPath;
    } else if (fs.existsSync(prodPath)) {
      return devPath;
    } else {
      return devPath;
    }
  } catch (error) {
    console.error(`Failed to resolve path: ${relativePath}`, error);
    return devPath;
  }
};

const dbPath = getDynamicPath('pos.db');
const db = new Database(dbPath);

console.log('🧪 SIMPLE VARIATION OPTION TEST\n');

// Check current database state
console.log('📊 Current database state:');
const optionCount = db.prepare('SELECT COUNT(*) as count FROM variation_options WHERE isdeleted = 0').get();
console.log(`   Options: ${optionCount.count}\n`);

// Test data - simple variation option
const testOptionData = {
  food_id: 38, // Use the food ID from previous test
  variation_id: 24, // Use the variation ID from previous test
  option_name: 'Test Option',
  option_price: 2.50,
  total_stock: 100,
  stock_type: 'limited',
  sell_count: 0
};

console.log('📋 Testing variation option creation...');
console.log('Option data:', testOptionData);

try {
  const optionId = createVariationOption(testOptionData);
  console.log('Option creation result:', optionId);
  
  if (optionId) {
    console.log(`✅ Variation option created successfully with ID: ${optionId}`);
    
    // Verify in database
    const newOptionCount = db.prepare('SELECT COUNT(*) as count FROM variation_options WHERE isdeleted = 0').get();
    console.log(`📊 New option count: ${newOptionCount.count}`);
    
    // Show the created option
    const option = db.prepare('SELECT * FROM variation_options WHERE id = ?').get(optionId);
    console.log('Created option details:', option);
    
  } else {
    console.log('❌ Failed to create variation option');
  }
  
} catch (error) {
  console.error('❌ Error during option creation:', error);
  console.error('Stack:', error.stack);
}

db.close();
console.log('\n�� TEST COMPLETED!'); 