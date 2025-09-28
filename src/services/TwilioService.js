import twilio from 'twilio';

class TwilioService {
  constructor() {
    // Twilio credentials - these should be set as environment variables
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || 'your_account_sid_here';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token_here';
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || 'your_twilio_phone_number_here';
    
    // Don't initialize Twilio client at startup - only when needed
    this.client = null;
    this.initialized = false;
  }

  /**
   * Initialize Twilio client only when needed
   * @returns {boolean} - True if initialized successfully
   */
  initializeTwilio() {
    if (this.initialized) {
      return !!this.client;
    }

    this.initialized = true;

    // Check if credentials are properly configured
    if (this.isConfigured()) {
      try {
        this.client = twilio(this.accountSid, this.authToken);
        console.log('[TwilioService] Twilio client initialized successfully.');
        return true;
      } catch (error) {
        console.warn('[TwilioService] Failed to initialize Twilio client:', error.message);
        this.client = null;
        return false;
      }
    } else {
      console.warn('[TwilioService] Twilio credentials not configured. SMS functionality will be limited.');
      console.warn('[TwilioService] Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in your .env file');
      this.client = null;
      return false;
    }
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
      
      // Initialize Twilio only when needed
      const twilioReady = this.initializeTwilio();
      
      if (!twilioReady) {
        console.warn('[TwilioService] Twilio not configured, returning mock success for development');
        return {
          success: true,
          message: 'OTP sent successfully (mock - Twilio not configured)',
          messageSid: 'mock_sid_' + Date.now(),
          status: 'sent'
        };
      }
      
      // Validate phone number format (should include country code)
      if (!toPhoneNumber || !toPhoneNumber.startsWith('+')) {
        throw new Error('Phone number must include country code (e.g., +1234567890)');
      }

      // Create the message
      const message = `your otp is ${otp}`;
      
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
      
      // Initialize Twilio only when needed
      const twilioReady = this.initializeTwilio();
      
      if (!twilioReady) {
        console.warn('[TwilioService] Twilio not configured, returning mock success for development');
        return {
          success: true,
          message: 'SMS sent successfully (mock - Twilio not configured)',
          messageSid: 'mock_sid_' + Date.now()
        };
      }
      
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
    return !!(
      this.accountSid && 
      this.authToken && 
      this.phoneNumber &&
      this.accountSid !== 'your_account_sid_here' &&
      this.authToken !== 'your_auth_token_here' &&
      this.phoneNumber !== 'your_twilio_phone_number_here' &&
      this.accountSid.startsWith('AC')
    );
  }

  /**
   * Get account information (for testing connection)
   * @returns {Promise<Object>} - Account information or error
   */
  async getAccountInfo() {
    try {
      // Initialize Twilio only when needed
      const twilioReady = this.initializeTwilio();
      
      if (!twilioReady) {
        return {
          success: false,
          message: 'Twilio not configured'
        };
      }
      
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
