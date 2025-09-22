import { 
  createOrderDetail,
  updateOrderDetail,
  getOrderDetailById,
  getOrderDetailsByOrderId,
  getOrderDetailsByFoodId,
  deleteOrderDetail,
  getAllOrderDetails,
  getOrderDetailsStatistics,
  createMultipleOrderDetails
} from '../models/orders/orderDetails.js';

async function testOrderDetails() {
  try {
    console.log('Testing Order Details functionality...\n');

    // Test 1: Create a single order detail
    console.log('1. Creating order detail...');
    const orderDetailData = {
      food_id: 1,
      order_id: 1,
      price: 15.99,
      food_details: JSON.stringify({ size: 'Large', spice_level: 'Medium' }),
      item_note: 'Extra crispy please',
      variation: JSON.stringify({ size: 'Large', price: 2.00 }),
      add_ons: JSON.stringify([{ name: 'Extra cheese', price: 1.50 }]),
      discount_on_food: 2.00,
      discount_type: 'percentage',
      quantity: 2,
      tax_amount: 1.60,
      total_add_on_price: 3.00
    };

    const createdOrderDetail = createOrderDetail(orderDetailData);
    console.log('Created order detail:', createdOrderDetail);

    // Test 2: Get order detail by ID
    console.log('\n2. Getting order detail by ID...');
    const retrievedOrderDetail = getOrderDetailById(createdOrderDetail.id);
    console.log('Retrieved order detail:', retrievedOrderDetail);

    // Test 3: Update order detail
    console.log('\n3. Updating order detail...');
    const updateResult = updateOrderDetail(createdOrderDetail.id, {
      quantity: 3,
      item_note: 'Updated note: Extra crispy and well done'
    });
    console.log('Update result:', updateResult);

    // Test 4: Get order details by order ID
    console.log('\n4. Getting order details by order ID...');
    const orderDetails = getOrderDetailsByOrderId(1);
    console.log('Order details for order 1:', orderDetails);

    // Test 5: Get order details by food ID
    console.log('\n5. Getting order details by food ID...');
    const foodOrderDetails = getOrderDetailsByFoodId(1);
    console.log('Order details for food 1:', foodOrderDetails);

    // Test 6: Get all order details
    console.log('\n6. Getting all order details...');
    const allOrderDetails = getAllOrderDetails(10, 0);
    console.log('All order details:', allOrderDetails);

    // Test 7: Get statistics
    console.log('\n7. Getting order details statistics...');
    const stats = getOrderDetailsStatistics('2024-01-01', '2024-12-31');
    console.log('Statistics:', stats);

    // Test 8: Create multiple order details
    console.log('\n8. Creating multiple order details...');
    const multipleOrderDetails = [
      {
        food_id: 2,
        order_id: 1,
        price: 12.99,
        quantity: 1,
        tax_amount: 1.30
      },
      {
        food_id: 3,
        order_id: 1,
        price: 8.99,
        quantity: 2,
        tax_amount: 1.80
      }
    ];

    const createdMultiple = createMultipleOrderDetails(multipleOrderDetails);
    console.log('Created multiple order details:', createdMultiple);

    // Test 9: Delete order detail (soft delete)
    console.log('\n9. Deleting order detail...');
    const deleteResult = deleteOrderDetail(createdOrderDetail.id);
    console.log('Delete result:', deleteResult);

    console.log('\n✅ All order details tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing order details:', error);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testOrderDetails();
}

export { testOrderDetails }; 