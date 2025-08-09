import { createVariation } from '../../models/foods/variations.js';
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
    return path.join(__dirname, '../../', relativePath);
  }
};

const dbPath = getDynamicPath('pos.db');
const db = new Database(dbPath);

console.log('🧪 SIMPLE VARIATION TEST\n');

// Check current database state
console.log('📊 Current database state:');
const variationCount = db.prepare('SELECT COUNT(*) as count FROM variation WHERE isdeleted = 0').get();
console.log(`   Variations: ${variationCount.count}\n`);

// Test data - simple variation
const testVariationData = {
  food_id: 38, // Use the food ID from previous test
  name: 'Simple Test Variation',
  type: 'single',
  min: 1,
  max: 1,
  is_required: true
};

console.log('📋 Testing variation creation...');
console.log('Variation data:', testVariationData);

try {
  const variationId = createVariation(testVariationData);
  console.log('Variation creation result:', variationId);
  
  if (variationId) {
    console.log(`✅ Variation created successfully with ID: ${variationId}`);
    
    // Verify in database
    const newVariationCount = db.prepare('SELECT COUNT(*) as count FROM variation WHERE isdeleted = 0').get();
    console.log(`📊 New variation count: ${newVariationCount.count}`);
    
    // Show the created variation
    const variation = db.prepare('SELECT * FROM variation WHERE id = ?').get(variationId);
    console.log('Created variation details:', variation);
    
  } else {
    console.log('❌ Failed to create variation');
  }
  
} catch (error) {
  console.error('❌ Error during variation creation:', error);
  console.error('Stack:', error.stack);
}

db.close();
console.log('\n�� TEST COMPLETED!'); 