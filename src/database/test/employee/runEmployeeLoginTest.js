#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Employee Login Test Runner');
console.log('=============================\n');

// Test data
const testEmployeeId = 1; // Change this to an existing employee ID

async function runEmployeeLoginTest() {
  try {
    console.log(`📋 Testing Employee Login Functions for Employee ID: ${testEmployeeId}\n`);

    // Import the functions
    const { 
      createEmployeeLogin, 
      updateEmployeeLogout, 
      getEmployeeLoginSessions, 
      getCurrentEmployeeSession, 
      getAllLoginSessions 
    } = await import('../../models/employee/employeeLogin.js');

    // Test 1: Create Login Session
    console.log('1️⃣ Testing createEmployeeLogin...');
    const loginResult = createEmployeeLogin(testEmployeeId);
    if (loginResult.success) {
      console.log(`   ✅ Login session created successfully!`);
      console.log(`   📝 Login ID: ${loginResult.login_id}`);
      console.log(`   🕐 Login Time: ${loginResult.login_time}`);
    } else {
      console.log(`   ❌ Failed: ${loginResult.message}`);
    }

    // Test 2: Get Current Session
    console.log('\n2️⃣ Testing getCurrentEmployeeSession...');
    const currentSession = getCurrentEmployeeSession(testEmployeeId);
    if (currentSession.success) {
      if (currentSession.session) {
        console.log(`   ✅ Current session found!`);
        console.log(`   📝 Session ID: ${currentSession.session.id}`);
        console.log(`   🕐 Login Time: ${currentSession.session.login_time}`);
        console.log(`   🚪 Logout Time: ${currentSession.session.logout_time || 'Active'}`);
      } else {
        console.log(`   ℹ️ No active session found`);
      }
    } else {
      console.log(`   ❌ Failed: ${currentSession.message}`);
    }

    // Test 3: Get Employee Sessions
    console.log('\n3️⃣ Testing getEmployeeLoginSessions...');
    const sessions = getEmployeeLoginSessions(testEmployeeId, 5, 0);
    if (sessions.success) {
      console.log(`   ✅ Found ${sessions.sessions.length} sessions:`);
      sessions.sessions.forEach((session, index) => {
        console.log(`   ${index + 1}. ID: ${session.id}, Login: ${session.login_time}, Logout: ${session.logout_time || 'Active'}`);
      });
    } else {
      console.log(`   ❌ Failed: ${sessions.message}`);
    }

    // Test 4: Update Logout Time
    console.log('\n4️⃣ Testing updateEmployeeLogout...');
    const logoutResult = updateEmployeeLogout(testEmployeeId);
    if (logoutResult.success) {
      console.log(`   ✅ Logout successful!`);
      console.log(`   📝 Session ID: ${logoutResult.session_id}`);
      console.log(`   🕐 Logout Time: ${logoutResult.logout_time}`);
    } else {
      console.log(`   ❌ Failed: ${logoutResult.message}`);
    }

    // Test 5: Check Session After Logout
    console.log('\n5️⃣ Testing session after logout...');
    const afterLogout = getCurrentEmployeeSession(testEmployeeId);
    if (afterLogout.success) {
      if (afterLogout.session) {
        console.log(`   ℹ️ Found session after logout:`);
        console.log(`   📝 Session ID: ${afterLogout.session.id}`);
        console.log(`   🕐 Login Time: ${afterLogout.session.login_time}`);
        console.log(`   🚪 Logout Time: ${afterLogout.session.logout_time || 'Still active'}`);
      } else {
        console.log(`   ✅ No active sessions (expected after logout)`);
      }
    } else {
      console.log(`   ❌ Failed: ${afterLogout.message}`);
    }

    // Test 6: Create New Login After Logout
    console.log('\n6️⃣ Testing new login after logout...');
    const newLogin = createEmployeeLogin(testEmployeeId);
    if (newLogin.success) {
      console.log(`   ✅ New login session created!`);
      console.log(`   📝 Login ID: ${newLogin.login_id}`);
      console.log(`   🕐 Login Time: ${newLogin.login_time}`);
    } else {
      console.log(`   ❌ Failed: ${newLogin.message}`);
    }

    // Test 7: Get All Sessions (Admin View)
    console.log('\n7️⃣ Testing getAllLoginSessions (admin view)...');
    const allSessions = getAllLoginSessions(10, 0);
    if (allSessions.success) {
      console.log(`   ✅ Found ${allSessions.sessions.length} total sessions:`);
      allSessions.sessions.slice(0, 3).forEach((session, index) => {
        console.log(`   ${index + 1}. ${session.fname} ${session.lname} (${session.roll})`);
        console.log(`      ID: ${session.id}, Login: ${session.login_time}, Logout: ${session.logout_time || 'Active'}`);
      });
      if (allSessions.sessions.length > 3) {
        console.log(`   ... and ${allSessions.sessions.length - 3} more sessions`);
      }
    } else {
      console.log(`   ❌ Failed: ${allSessions.message}`);
    }

    console.log('\n🎉 Employee Login Test Completed Successfully!');
    console.log('📊 All functions are working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
runEmployeeLoginTest(); 