// Simple test to verify IPC communication
console.log('=== Testing IPC Communication ===');

// Mock the window.myAPI object to test the frontend logic
const mockMyAPI = {
  floorGetAll: async () => {
    console.log('Mock floorGetAll called');
    return {
      success: true,
      data: [
        { id: 1, name: '1st Floor', type: 'Dining' },
        { id: 2, name: '2nd Floor', type: 'Dining' },
        { id: 3, name: '3rd Floor', type: 'VIP' }
      ]
    };
  },
  
  floorGetById: async (id) => {
    console.log('Mock floorGetById called with id:', id);
    const floors = [
      { id: 1, name: '1st Floor', type: 'Dining' },
      { id: 2, name: '2nd Floor', type: 'Dining' },
      { id: 3, name: '3rd Floor', type: 'VIP' }
    ];
    const floor = floors.find(f => f.id === id);
    return {
      success: !!floor,
      data: floor
    };
  },
  
  tableGetByFloorWithStatus: async (floorId, status) => {
    console.log('Mock tableGetByFloorWithStatus called with floorId:', floorId, 'status:', status);
    const tables = [
      { id: 1, table_no: '1', floor_id: 1, seat_capacity: 4, status: 'Free' },
      { id: 2, table_no: '2', floor_id: 1, seat_capacity: 6, status: 'Free' },
      { id: 3, table_no: '3', floor_id: 1, seat_capacity: 2, status: 'Occupied' },
      { id: 4, table_no: '4', floor_id: 2, seat_capacity: 4, status: 'Free' },
      { id: 5, table_no: '5', floor_id: 2, seat_capacity: 8, status: 'Free' },
      { id: 6, table_no: '6', floor_id: 3, seat_capacity: 6, status: 'Free' }
    ];
    
    const filteredTables = tables.filter(t => t.floor_id === floorId && t.status === status);
    return {
      success: true,
      data: filteredTables
    };
  }
};

// Test the logic
async function testFloorAndTableLogic() {
  console.log('\n1. Testing floor fetching...');
  const floorsResult = await mockMyAPI.floorGetAll();
  console.log('Floors result:', floorsResult);
  
  if (floorsResult.success && floorsResult.data.length > 0) {
    const firstFloor = floorsResult.data[0];
    console.log('\n2. Testing floor selection with:', firstFloor);
    
    console.log('\n3. Testing floor details...');
    const floorDetails = await mockMyAPI.floorGetById(firstFloor.id);
    console.log('Floor details:', floorDetails);
    
    console.log('\n4. Testing table fetching for floor:', firstFloor.id);
    const tablesResult = await mockMyAPI.tableGetByFloorWithStatus(firstFloor.id, 'Free');
    console.log('Tables result:', tablesResult);
    
    if (tablesResult.success && tablesResult.data.length > 0) {
      console.log('\n5. Testing seat capacity logic...');
      const firstTable = tablesResult.data[0];
      const seatCapacity = firstTable.seat_capacity || 4;
      const seatOptions = Array.from({ length: seatCapacity }, (_, i) => i + 1);
      console.log(`Table ${firstTable.table_no} has ${seatCapacity} seats. Options:`, seatOptions);
    }
  }
}

// Run the test
testFloorAndTableLogic().then(() => {
  console.log('\n=== Test Complete ===');
}).catch(error => {
  console.error('Test failed:', error);
});
