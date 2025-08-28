import { checkHotelStatus, getHotelInfo, createOrUpdateHotel, updateHotelStatus, checkHotelTable } from '../models/hotel/hotel.js';

async function testHotelStatus() {
  console.log('=== Testing Hotel Status Functionality ===\n');

  try {
    // Test 1: Check if hotel table exists
    console.log('1. Checking hotel table...');
    const tableCheck = checkHotelTable();
    console.log('Table check result:', tableCheck);

    if (!tableCheck.tableExists) {
      console.log('Hotel table does not exist. Creating test hotel record...');
      
      // Create a test hotel record
      const hotelData = {
        name: 'Test GPOS Restaurant',
        status: 0, // Not licensed
        active: true,
        isDelete: false,
        isSyncronized: false
      };

      const createResult = createOrUpdateHotel(hotelData);
      console.log('Create result:', createResult);
    }

    // Test 2: Check hotel status
    console.log('\n2. Checking hotel status...');
    const statusResult = checkHotelStatus();
    console.log('Status check result:', statusResult);

    // Test 3: Get hotel info
    console.log('\n3. Getting hotel info...');
    const hotelInfo = getHotelInfo();
    console.log('Hotel info:', hotelInfo);

    // Test 4: Update hotel status to licensed
    console.log('\n4. Updating hotel status to licensed (90500)...');
    const updateResult = updateHotelStatus(90500);
    console.log('Update result:', updateResult);

    // Test 5: Check status again
    console.log('\n5. Checking hotel status again...');
    const newStatusResult = checkHotelStatus();
    console.log('New status check result:', newStatusResult);

    // Test 6: Update hotel status to not licensed
    console.log('\n6. Updating hotel status to not licensed (0)...');
    const unlicenseResult = updateHotelStatus(0);
    console.log('Unlicense result:', unlicenseResult);

    // Test 7: Final status check
    console.log('\n7. Final status check...');
    const finalStatusResult = checkHotelStatus();
    console.log('Final status check result:', finalStatusResult);

    console.log('\n=== Test completed successfully ===');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testHotelStatus();
