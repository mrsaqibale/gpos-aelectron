import twilio from 'twilio';

class TwilioService {
  constructor() {
    // Twilio credentials - these should be set as environment variables
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || 'your_account_sid_here';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token_here';
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || 'your_twilio_phone_number_here';
    
    // Initialize Twilio client
    this.client = twilio(this.accountSid, this.authToken);
  }

  /**
   * Send OTP SMS to a phone number
   * @param {string} toPhoneNumber - The recipient's phone number (with country code)
   * @param {string} otp - The OTP code to send
   * @param {string} employeeName - Name of the employee (optional)
   * @returns {Promise<Object>} - Result object with success status and message
   */
  async sendOTP(toPhoneNumber, otp, employeeName = 'User') {
    try {
      console.log(`[TwilioService] Sending OTP to ${toPhoneNumber}`);
      
      // Validate phone number format (should include country code)
      if (!toPhoneNumber || !toPhoneNumber.startsWith('+')) {
        throw new Error('Phone number must include country code (e.g., +1234567890)');
      }

      // Create the message
      const message = `Hello ${employeeName}, your GPOS System OTP code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
      
      // Send the SMS
      const result = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: toPhoneNumber
      });

      console.log(`[TwilioService] OTP sent successfully. Message SID: ${result.sid}`);
      
      return {
        success: true,
        message: 'OTP sent successfully',
        messageSid: result.sid,
        status: result.status
      };
    } catch (error) {
      console.error('[TwilioService] Error sending OTP:', error);
      
      // Handle specific Twilio errors
      if (error.code) {
        switch (error.code) {
          case 21211:
            return {
              success: false,
              message: 'Invalid phone number format'
            };
          case 21408:
            return {
              success: false,
              message: 'Permission to send SMS to this number is denied'
            };
          case 21610:
            return {
              success: false,
              message: 'Message cannot be sent to this number'
            };
          default:
            return {
              success: false,
              message: `Twilio error: ${error.message}`
            };
        }
      }
      
      return {
        success: false,
        message: error.message || 'Failed to send OTP'
      };
    }
  }

  /**
   * Send a custom SMS message
   * @param {string} toPhoneNumber - The recipient's phone number
   * @param {string} message - The message to send
   * @returns {Promise<Object>} - Result object with success status
   */
  async sendSMS(toPhoneNumber, message) {
    try {
      console.log(`[TwilioService] Sending SMS to ${toPhoneNumber}`);
      
      if (!toPhoneNumber || !toPhoneNumber.startsWith('+')) {
        throw new Error('Phone number must include country code');
      }

      const result = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: toPhoneNumber
      });

      console.log(`[TwilioService] SMS sent successfully. Message SID: ${result.sid}`);
      
      return {
        success: true,
        message: 'SMS sent successfully',
        messageSid: result.sid
      };
    } catch (error) {
      console.error('[TwilioService] Error sending SMS:', error);
      return {
        success: false,
        message: error.message || 'Failed to send SMS'
      };
    }
  }

  /**
   * Verify if Twilio credentials are properly configured
   * @returns {boolean} - True if credentials are configured
   */
  isConfigured() {
    return !(
      this.accountSid === 'your_account_sid_here' ||
      this.authToken === 'your_auth_token_here' ||
      this.phoneNumber === 'your_twilio_phone_number_here'
    );
  }

  /**
   * Get account information (for testing connection)
   * @returns {Promise<Object>} - Account information or error
   */
  async getAccountInfo() {
    try {
      const account = await this.client.api.accounts(this.accountSid).fetch();
      return {
        success: true,
        data: {
          friendlyName: account.friendlyName,
          status: account.status,
          type: account.type
        }
      };
    } catch (error) {
      console.error('[TwilioService] Error getting account info:', error);
      return {
        success: false,
        message: error.message || 'Failed to get account information'
      };
    }
  }
}

// Create and export a singleton instance
const twilioService = new TwilioService();
export default twilioService;
