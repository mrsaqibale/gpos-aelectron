import { insertSampleData, testFloorAndTableData } from './table-test.js';

console.log('=== Floor and Table Integration Test ===\n');

// Insert sample data
console.log('1. Inserting sample data...');
const insertResult = insertSampleData();
if (insertResult.success) {
  console.log('✅ Sample data inserted successfully\n');
} else {
  console.log('❌ Failed to insert sample data:', insertResult.error, '\n');
}

// Test the data
console.log('2. Testing floor and table data...');
const testResult = testFloorAndTableData();
if (testResult.success) {
  console.log('✅ Floor and table data test completed successfully\n');
  console.log('Summary:');
  console.log(`- Total floors: ${testResult.floors.length}`);
  console.log(`- Total tables: ${testResult.tables.length}`);
  console.log(`- Free tables: ${testResult.freeTables.length}`);
} else {
  console.log('❌ Floor and table data test failed:', testResult.error, '\n');
}

console.log('=== Test Complete ===');
