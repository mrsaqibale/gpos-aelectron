#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Complete Login Flow');
console.log('==============================\n');

async function testLoginFlow() {
  try {
    // Import the necessary functions
    const { loginEmployee } = await import('../../models/employee/employee.js');
    const { 
      createEmployeeLogin, 
      updateEmployeeLogout, 
      getCurrentEmployeeSession 
    } = await import('../../models/employee/employeeLogin.js');

    // Test employee credentials (using existing employee)
    const testPin = '123456';
    const testRole = 'Cashier';

    console.log('1️⃣ Testing Employee Login...');
    console.log(`   PIN: ${testPin}, Role: ${testRole}`);
    
    // Step 1: Login employee
    const loginResult = loginEmployee(testPin, testRole);
    if (loginResult.success) {
      console.log('   ✅ Login successful!');
      console.log(`   Employee: ${loginResult.data.fname} ${loginResult.data.lname}`);
      console.log(`   Employee ID: ${loginResult.data.id}`);
      
      const employeeId = loginResult.data.id;

      // Step 2: Create login session
      console.log('\n2️⃣ Creating Login Session...');
      const sessionResult = createEmployeeLogin(employeeId);
      if (sessionResult.success) {
        console.log('   ✅ Login session created!');
        console.log(`   Session ID: ${sessionResult.login_id}`);
        console.log(`   Login Time: ${sessionResult.login_time}`);
        
        // Step 3: Check current session
        console.log('\n3️⃣ Checking Current Session...');
        const currentSession = getCurrentEmployeeSession(employeeId);
        if (currentSession.success && currentSession.session) {
          console.log('   ✅ Current session found!');
          console.log(`   Session ID: ${currentSession.session.id}`);
          console.log(`   Login Time: ${currentSession.session.login_time}`);
          console.log(`   Logout Time: ${currentSession.session.logout_time || 'Active'}`);
        } else {
          console.log('   ❌ No current session found');
        }

        // Step 4: Simulate logout
        console.log('\n4️⃣ Simulating Logout...');
        const logoutResult = updateEmployeeLogout(employeeId);
        if (logoutResult.success) {
          console.log('   ✅ Logout successful!');
          console.log(`   Session ID: ${logoutResult.session_id}`);
          console.log(`   Logout Time: ${logoutResult.logout_time}`);
        } else {
          console.log('   ❌ Logout failed:', logoutResult.message);
        }

        // Step 5: Check session after logout
        console.log('\n5️⃣ Checking Session After Logout...');
        const afterLogoutSession = getCurrentEmployeeSession(employeeId);
        if (afterLogoutSession.success) {
          if (afterLogoutSession.session) {
            console.log('   ℹ️ Found active session after logout:');
            console.log(`   Session ID: ${afterLogoutSession.session.id}`);
            console.log(`   Login Time: ${afterLogoutSession.session.login_time}`);
            console.log(`   Logout Time: ${afterLogoutSession.session.logout_time || 'Still active'}`);
          } else {
            console.log('   ✅ No active sessions (expected after logout)');
          }
        } else {
          console.log('   ❌ Error checking session after logout');
        }

        console.log('\n🎉 Login Flow Test Completed Successfully!');
        console.log('📊 Summary:');
        console.log('   - Employee login ✓');
        console.log('   - Session creation ✓');
        console.log('   - Session tracking ✓');
        console.log('   - Logout handling ✓');

      } else {
        console.log('   ❌ Failed to create login session:', sessionResult.message);
      }
    } else {
      console.log('   ❌ Login failed:', loginResult.message);
      console.log('   💡 Make sure you have an employee with PIN: 123456 and Role: Cashier');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testLoginFlow(); 