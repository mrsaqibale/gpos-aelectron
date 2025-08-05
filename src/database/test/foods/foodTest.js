import { createFood, getAllFoods, getFoodById } from '../../models/foods/food.js';

class FoodTest {
  constructor() {
    this.testResults = [];
  }

  // Test data with food, variations, and variation options
  getTestFoodData() {
    return {
      foodData: {
        name: 'Supreme Pizza',
        description: 'Delicious pizza loaded with pepperoni, sausage, mushrooms, bell peppers, onions, and extra cheese',
        image: 'supreme-pizza.jpg',
        category_id: 1,
        subcategory_id: null,
        price: 24.99,
        tax: 8.5,
        tax_type: 'percentage',
        discount: 0,
        discount_type: 'percentage',
        available_time_starts: '11:00',
        available_time_ends: '23:00',
        veg: false,
        status: 'active',
        restaurant_id: 1,
        position: 1,
        sku: 'SP002',
        barcode: '1234567890136',
        stock_type: 'limited',
        item_stock: 30,
        sell_count: 0
      },
      variations: [
        {
          name: 'Size Selection',
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
            },
            {
              option_name: 'Extra Large (16")',
              option_price: 9.00,
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
          max: 5,
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
              option_name: 'Bacon',
              option_price: 3.00,
              total_stock: 100,
              stock_type: 'limited',
              sell_count: 0
            },
            {
              option_name: 'Ham',
              option_price: 2.75,
              total_stock: 100,
              stock_type: 'limited',
              sell_count: 0
            },
            {
              option_name: 'Pineapple',
              option_price: 1.50,
              total_stock: 100,
              stock_type: 'limited',
              sell_count: 0
            },
            {
              option_name: 'Jalapeños',
              option_price: 1.00,
              total_stock: 100,
              stock_type: 'limited',
              sell_count: 0
            }
          ]
        },
        {
          name: 'Crust Type',
          type: 'single',
          min: 1,
          max: 1,
          is_required: 1,
          options: [
            {
              option_name: 'Regular Crust',
              option_price: 0,
              total_stock: 100,
              stock_type: 'limited',
              sell_count: 0
            },
            {
              option_name: 'Thin Crust',
              option_price: 0,
              total_stock: 100,
              stock_type: 'limited',
              sell_count: 0
            },
            {
              option_name: 'Stuffed Crust',
              option_price: 2.00,
              total_stock: 100,
              stock_type: 'limited',
              sell_count: 0
            },
            {
              option_name: 'Gluten-Free Crust',
              option_price: 3.50,
              total_stock: 50,
              stock_type: 'limited',
              sell_count: 0
            }
          ]
        }
      ]
    };
  }

  // Test the createFood function
  async testCreateFood() {
    console.log('🚀 Starting Food Creation Test...\n');
    
    try {
      // Get test data
      const testData = this.getTestFoodData();
      
      console.log('📋 Test Data:');
      console.log(`   Food: ${testData.foodData.name}`);
      console.log(`   Price: $${testData.foodData.price}`);
      console.log(`   SKU: ${testData.foodData.sku}`);
      console.log(`   Variations: ${testData.variations.length}`);
      
      // Count total options
      const totalOptions = testData.variations.reduce((sum, variation) => {
        return sum + (variation.options ? variation.options.length : 0);
      }, 0);
      console.log(`   Total Options: ${totalOptions}\n`);

      // Call createFood function
      console.log('🍽️ Creating food with variations and options...');
      const result = createFood(testData);
      
      if (result.success) {
        console.log(`✅ Food created successfully!`);
        console.log(`   Food ID: ${result.food_id}`);
        console.log(`   Created Variations: ${result.createdVariations.length}`);
        
        // Log variation details
        result.createdVariations.forEach((variation, index) => {
          console.log(`   Variation ${index + 1}: ${testData.variations[index].name}`);
          console.log(`     └─ Options created: ${variation.optionIds.length}`);
        });
        
        this.testResults.push({
          test: 'createFood',
          success: true,
          foodId: result.food_id,
          variations: result.createdVariations
        });
        
        return result.food_id;
      } else {
        console.log(`❌ Failed to create food: ${result.message}`);
        this.testResults.push({
          test: 'createFood',
          success: false,
          error: result.message
        });
        return null;
      }
      
    } catch (error) {
      console.log(`❌ Error in createFood test: ${error.message}`);
      this.testResults.push({
        test: 'createFood',
        success: false,
        error: error.message
      });
      return null;
    }
  }

  // Verify the created food
  async verifyCreatedFood(foodId) {
    console.log('\n🔍 Verifying created food...');
    
    if (!foodId) {
      console.log('❌ No food ID to verify');
      return;
    }
    
    try {
      const food = getFoodById(foodId);
      
      if (food.success) {
        console.log(`✅ Food verification successful!`);
        console.log(`   Name: ${food.data.name}`);
        console.log(`   Description: ${food.data.description}`);
        console.log(`   Price: $${food.data.price}`);
        console.log(`   SKU: ${food.data.sku}`);
        console.log(`   Category: ${food.data.category?.name || 'N/A'}`);
        console.log(`   Subcategory: ${food.data.subcategory?.name || 'N/A'}`);
        console.log(`   Stock: ${food.data.item_stock}`);
        console.log(`   Position: ${food.data.position}`);
        console.log(`   Variations: ${food.data.variations?.length || 0}`);
        
        // Show variation details
        if (food.data.variations && food.data.variations.length > 0) {
          console.log('\n   📋 Variation Details:');
          food.data.variations.forEach((variation, index) => {
            console.log(`   ${index + 1}. ${variation.name}`);
            console.log(`      Type: ${variation.type}`);
            console.log(`      Min: ${variation.min}, Max: ${variation.max}`);
            console.log(`      Required: ${variation.is_required}`);
            console.log(`      Options: ${variation.options?.length || 0}`);
            
            if (variation.options && variation.options.length > 0) {
              variation.options.forEach(option => {
                console.log(`        └─ ${option.option_name} (+$${option.option_price})`);
              });
            }
          });
        }
        
        this.testResults.push({
          test: 'verifyFood',
          success: true,
          foodData: food.data
        });
        
      } else {
        console.log(`❌ Failed to verify food: ${food.message}`);
        this.testResults.push({
          test: 'verifyFood',
          success: false,
          error: food.message
        });
      }
      
    } catch (error) {
      console.log(`❌ Error in verification: ${error.message}`);
      this.testResults.push({
        test: 'verifyFood',
        success: false,
        error: error.message
      });
    }
  }

  // Show all foods in database
  showAllFoods() {
    console.log('\n📊 All foods in database:');
    
    try {
      const foods = getAllFoods();
      
      if (foods.success) {
        console.log(`   Total foods: ${foods.data.length}`);
        foods.data.forEach((food, index) => {
          console.log(`   ${index + 1}. ${food.name} (ID: ${food.id}, Price: $${food.price || 'N/A'})`);
        });
      } else {
        console.log(`   ❌ Failed to get foods: ${foods.message}`);
      }
      
    } catch (error) {
      console.log(`❌ Error getting foods: ${error.message}`);
    }
  }

  // Print test summary
  printTestSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 TEST SUMMARY');
    console.log('='.repeat(60));
    
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${index + 1}. ${result.test}: ${status}`);
      
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    const passedTests = this.testResults.filter(r => r.success).length;
    const totalTests = this.testResults.length;
    
    console.log(`\n📊 Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed successfully!');
    } else {
      console.log('⚠️  Some tests failed. Check the errors above.');
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🧪 FOOD TEST CLASS - COMPREHENSIVE TEST\n');
    
    // Test 1: Create food with variations and options
    const foodId = await this.testCreateFood();
    
    // Test 2: Verify the created food
    await this.verifyCreatedFood(foodId);
    
    // Test 3: Show all foods
    this.showAllFoods();
    
    // Print summary
    this.printTestSummary();
  }
}

// Create and run the test
const foodTest = new FoodTest();
foodTest.runAllTests(); 