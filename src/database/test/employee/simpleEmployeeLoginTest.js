import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Starting Simple Employee Login Test...\n');

// Test data - using an existing employee ID (you may need to adjust this)
const testEmployeeId = 1; // Change this to an existing employee ID in your database

async function simpleTest() {
  try {
    // Import the functions
    const { 
      createEmployeeLogin, 
      updateEmployeeLogout, 
      getCurrentEmployeeSession 
    } = await import('../../models/employee/employeeLogin.js');

    console.log(`📋 Testing with Employee ID: ${testEmployeeId}\n`);

    // Test 1: Create login session
    console.log('1️⃣ Creating login session...');
    const loginResult = createEmployeeLogin(testEmployeeId);
    console.log('Login Result:', loginResult);

    // Test 2: Check current session
    console.log('\n2️⃣ Checking current session...');
    const currentSession = getCurrentEmployeeSession(testEmployeeId);
    console.log('Current Session:', currentSession);

    // Test 3: Update logout time
    console.log('\n3️⃣ Updating logout time...');
    const logoutResult = updateEmployeeLogout(testEmployeeId);
    console.log('Logout Result:', logoutResult);

    // Test 4: Check session after logout
    console.log('\n4️⃣ Checking session after logout...');
    const afterLogoutSession = getCurrentEmployeeSession(testEmployeeId);
    console.log('Session After Logout:', afterLogoutSession);

    console.log('\n✅ Simple test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the simple test
simpleTest(); 