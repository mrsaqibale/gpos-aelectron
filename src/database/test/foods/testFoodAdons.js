import { getAdonsByHotelId } from '../../models/foods/adons.js';
import { getFoodById } from '../../models/foods/food.js';
import { getFoodAdons, getAllFoodAdons } from '../../models/foods/food_adons.js';

async function testFoodAdons() {
  console.log('=== Testing Food-Adons Functionality ===\n');

  // Test 1: Get adons for hotel
  console.log('1. Testing getAdonsByHotelId...');
  const adonsResult = getAdonsByHotelId(1);
  console.log('Adons for hotel 1:', adonsResult);
  console.log('');

  // Test 2: Get food by ID (should include adons)
  console.log('2. Testing getFoodById with adons...');
  const foodResult = getFoodById(1); // Assuming food with ID 1 exists
  if (foodResult.success) {
    console.log('Food found:', foodResult.data.name);
    console.log('Adons count:', foodResult.data.adons?.length || 0);
    console.log('Adons:', foodResult.data.adons);
  } else {
    console.log('Food not found or error:', foodResult.message);
  }
  console.log('');

  // Test 3: Get food adons directly
  console.log('3. Testing getFoodAdons...');
  const foodAdonsResult = getFoodAdons(1); // Assuming food with ID 1 exists
  console.log('Food adons result:', foodAdonsResult);
  console.log('');

  // Test 4: Get all food-adon relationships
  console.log('4. Testing getAllFoodAdons...');
  const allFoodAdonsResult = getAllFoodAdons();
  console.log('All food-adon relationships:', allFoodAdonsResult);
  console.log('');

  console.log('=== Test Complete ===');
}

testFoodAdons(); 