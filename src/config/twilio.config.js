// Twilio Configuration
// Set these environment variables or update the values below

export const twilioConfig = {
  // Get these from your Twilio Console: https://console.twilio.com/
  accountSid: process.env.TWILIO_ACCOUNT_SID || 'your_account_sid_here',
  authToken: process.env.TWILIO_AUTH_TOKEN || 'your_auth_token_here',
  
  // Your Twilio phone number (must be purchased from Twilio)
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || 'your_twilio_phone_number_here',
  
  // Default country code for phone numbers (if not provided)
  defaultCountryCode: process.env.DEFAULT_COUNTRY_CODE || '+1',
  
  // OTP settings
  otpSettings: {
    length: 6,
    expiryMinutes: 10,
    maxAttempts: 3
  }
};

// Instructions for setting up Twilio:
/*
1. Sign up for a Twilio account at https://www.twilio.com/
2. Get your Account SID and Auth Token from the Twilio Console
3. Purchase a phone number from Twilio (required for sending SMS)
4. Set the environment variables:
   - TWILIO_ACCOUNT_SID=your_account_sid
   - TWILIO_AUTH_TOKEN=your_auth_token
   - TWILIO_PHONE_NUMBER=your_twilio_phone_number
   - DEFAULT_COUNTRY_CODE=+1 (or your country code)

5. For production, set these as environment variables in your system
6. For development, you can create a .env file in your project root:
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   DEFAULT_COUNTRY_CODE=+1
*/
