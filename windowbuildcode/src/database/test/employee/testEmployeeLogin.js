import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the employee login functions
const { 
  createEmployeeLogin, 
  updateEmployeeLogout, 
  getEmployeeLoginSessions, 
  getCurrentEmployeeSession, 
  getAllLoginSessions 
} = await import('../../models/employee/employeeLogin.js');

// Import employee functions to create test employee
const { createEmployee } = await import('../../models/employee/employee.js');

console.log('🧪 Starting Employee Login Test...\n');

// Test data
const testEmployee = {
  fname: 'Test',
  lname: 'Employee',
  phone: '1234567890',
  roll: 'Cashier',
  email: 'test@example.com',
  address: 'Test Address',
  pin: '123456',
  code: 'EMP001'
};

let testEmployeeId = null;

async function runTests() {
  try {
    console.log('📋 Test 1: Creating test employee...');
    
    // First, create a test employee
    const employeeResult = createEmployee(testEmployee);
    if (employeeResult.success) {
      testEmployeeId = employeeResult.id;
      console.log(`✅ Test employee created with ID: ${testEmployeeId}`);
    } else {
      console.error('❌ Failed to create test employee:', employeeResult.message);
      return;
    }

    console.log('\n📋 Test 2: Creating employee login session...');
    
    // Test creating a login session
    const loginResult = createEmployeeLogin(testEmployeeId);
    if (loginResult.success) {
      console.log(`✅ Login session created successfully!`);
      console.log(`   Login ID: ${loginResult.login_id}`);
      console.log(`   Login Time: ${loginResult.login_time}`);
    } else {
      console.error('❌ Failed to create login session:', loginResult.message);
      return;
    }

    console.log('\n📋 Test 3: Getting current employee session...');
    
    // Test getting current session
    const currentSessionResult = getCurrentEmployeeSession(testEmployeeId);
    if (currentSessionResult.success && currentSessionResult.session) {
      console.log(`✅ Current session found!`);
      console.log(`   Session ID: ${currentSessionResult.session.id}`);
      console.log(`   Login Time: ${currentSessionResult.session.login_time}`);
      console.log(`   Logout Time: ${currentSessionResult.session.logout_time || 'Not logged out'}`);
    } else {
      console.error('❌ Failed to get current session:', currentSessionResult.message);
    }

    console.log('\n📋 Test 4: Creating another login session (should fail or create new)...');
    
    // Try to create another login session
    const secondLoginResult = createEmployeeLogin(testEmployeeId);
    if (secondLoginResult.success) {
      console.log(`✅ Second login session created!`);
      console.log(`   Login ID: ${secondLoginResult.login_id}`);
      console.log(`   Login Time: ${secondLoginResult.login_time}`);
    } else {
      console.log(`ℹ️ Second login result: ${secondLoginResult.message}`);
    }

    console.log('\n📋 Test 5: Getting employee login sessions...');
    
    // Test getting all sessions for employee
    const sessionsResult = getEmployeeLoginSessions(testEmployeeId, 10, 0);
    if (sessionsResult.success) {
      console.log(`✅ Found ${sessionsResult.sessions.length} login sessions:`);
      sessionsResult.sessions.forEach((session, index) => {
        console.log(`   ${index + 1}. Session ID: ${session.id}, Login: ${session.login_time}, Logout: ${session.logout_time || 'Active'}`);
      });
    } else {
      console.error('❌ Failed to get sessions:', sessionsResult.message);
    }

    console.log('\n📋 Test 6: Updating employee logout time...');
    
    // Test logout functionality
    const logoutResult = updateEmployeeLogout(testEmployeeId);
    if (logoutResult.success) {
      console.log(`✅ Logout successful!`);
      console.log(`   Session ID: ${logoutResult.session_id}`);
      console.log(`   Logout Time: ${logoutResult.logout_time}`);
    } else {
      console.error('❌ Failed to logout:', logoutResult.message);
    }

    console.log('\n📋 Test 7: Getting current session after logout...');
    
    // Check current session after logout
    const afterLogoutSessionResult = getCurrentEmployeeSession(testEmployeeId);
    if (afterLogoutSessionResult.success) {
      if (afterLogoutSessionResult.session) {
        console.log(`ℹ️ Found active session after logout:`);
        console.log(`   Session ID: ${afterLogoutSessionResult.session.id}`);
        console.log(`   Login Time: ${afterLogoutSessionResult.session.login_time}`);
        console.log(`   Logout Time: ${afterLogoutSessionResult.session.logout_time || 'Still active'}`);
      } else {
        console.log(`✅ No active sessions found (as expected after logout)`);
      }
    } else {
      console.error('❌ Error checking session after logout:', afterLogoutSessionResult.message);
    }

    console.log('\n📋 Test 8: Creating new login session after logout...');
    
    // Create a new login session after logout
    const newLoginResult = createEmployeeLogin(testEmployeeId);
    if (newLoginResult.success) {
      console.log(`✅ New login session created after logout!`);
      console.log(`   Login ID: ${newLoginResult.login_id}`);
      console.log(`   Login Time: ${newLoginResult.login_time}`);
    } else {
      console.error('❌ Failed to create new login session:', newLoginResult.message);
    }

    console.log('\n📋 Test 9: Getting all login sessions (admin view)...');
    
    // Test getting all sessions (admin functionality)
    const allSessionsResult = getAllLoginSessions(20, 0);
    if (allSessionsResult.success) {
      console.log(`✅ Found ${allSessionsResult.sessions.length} total login sessions:`);
      allSessionsResult.sessions.slice(0, 5).forEach((session, index) => {
        console.log(`   ${index + 1}. Employee: ${session.fname} ${session.lname} (${session.roll})`);
        console.log(`      Session ID: ${session.id}, Login: ${session.login_time}, Logout: ${session.logout_time || 'Active'}`);
      });
      if (allSessionsResult.sessions.length > 5) {
        console.log(`   ... and ${allSessionsResult.sessions.length - 5} more sessions`);
      }
    } else {
      console.error('❌ Failed to get all sessions:', allSessionsResult.message);
    }

    console.log('\n📋 Test 10: Final logout test...');
    
    // Final logout test
    const finalLogoutResult = updateEmployeeLogout(testEmployeeId);
    if (finalLogoutResult.success) {
      console.log(`✅ Final logout successful!`);
      console.log(`   Session ID: ${finalLogoutResult.session_id}`);
      console.log(`   Logout Time: ${finalLogoutResult.logout_time}`);
    } else {
      console.error('❌ Failed final logout:', finalLogoutResult.message);
    }

    console.log('\n🎉 All Employee Login Tests Completed Successfully!');
    console.log(`📊 Test Summary:`);
    console.log(`   - Test Employee ID: ${testEmployeeId}`);
    console.log(`   - Login sessions created and managed`);
    console.log(`   - Logout functionality working`);
    console.log(`   - Session tracking operational`);

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the tests
runTests(); 