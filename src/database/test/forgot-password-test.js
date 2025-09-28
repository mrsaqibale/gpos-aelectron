// Test file for forgot password functionality
// This file demonstrates how to use the new forgot password methods

import { 
  verifyEmployeeByPhoneAndRole,
  sendPasswordResetOTP,
  verifyPasswordResetOTP,
  resetEmployeePIN,
  cleanupExpiredOTPs
} from '../models/employee/employee.js';

// Example usage of the forgot password functionality
async function testForgotPasswordFlow() {
  console.log('=== Testing Forgot Password Flow ===\n');
  
  // Test data (replace with actual employee data)
  const testPhone = '+1234567890'; // Replace with actual phone number
  const testRole = 'Cashier'; // Replace with actual role
  const testOTP = '123456'; // This will be sent via SMS
  const newPIN = '5678'; // New PIN to set
  
  try {
    // Step 1: Verify employee exists
    console.log('1. Verifying employee by phone and role...');
    const employeeCheck = verifyEmployeeByPhoneAndRole(testPhone, testRole);
    if (employeeCheck.success) {
      console.log('✅ Employee found:', employeeCheck.data);
    } else {
      console.log('❌ Employee not found:', employeeCheck.message);
      return;
    }
    
    // Step 2: Send OTP
    console.log('\n2. Sending OTP...');
    const otpResult = await sendPasswordResetOTP(testPhone, testRole);
    if (otpResult.success) {
      console.log('✅ OTP sent successfully:', otpResult.message);
      console.log('   Expires in:', otpResult.expiresIn, 'minutes');
    } else {
      console.log('❌ Failed to send OTP:', otpResult.message);
      return;
    }
    
    // Step 3: Verify OTP (in real usage, user would enter the OTP they received)
    console.log('\n3. Verifying OTP...');
    const verifyResult = verifyPasswordResetOTP(testPhone, testRole, testOTP);
    if (verifyResult.success) {
      console.log('✅ OTP verified successfully:', verifyResult.message);
    } else {
      console.log('❌ OTP verification failed:', verifyResult.message);
      return;
    }
    
    // Step 4: Reset PIN
    console.log('\n4. Resetting PIN...');
    const resetResult = resetEmployeePIN(testPhone, testRole, testOTP, newPIN);
    if (resetResult.success) {
      console.log('✅ PIN reset successfully:', resetResult.message);
    } else {
      console.log('❌ PIN reset failed:', resetResult.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Test cleanup function
function testCleanup() {
  console.log('\n=== Testing OTP Cleanup ===');
  const cleanupResult = cleanupExpiredOTPs();
  if (cleanupResult.success) {
    console.log('✅ Cleanup completed:', cleanupResult.message);
  } else {
    console.log('❌ Cleanup failed:', cleanupResult.message);
  }
}

// Export functions for use in other files
export {
  testForgotPasswordFlow,
  testCleanup
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Running forgot password tests...\n');
  testForgotPasswordFlow();
  testCleanup();
}
