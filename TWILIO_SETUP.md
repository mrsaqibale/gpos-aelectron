# Twilio SMS Setup for Forgot Password Feature

## Overview
The forgot password feature uses Twilio to send OTP (One-Time Password) SMS messages to users' phone numbers.

## Setup Instructions

### 1. Create a Twilio Account
1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account
3. Verify your phone number

### 2. Get Your Credentials
1. In the Twilio Console, go to **Account** → **API keys & tokens**
2. Copy your **Account SID** (starts with `AC`)
3. Copy your **Auth Token**
4. Go to **Phone Numbers** → **Manage** → **Active numbers**
5. Copy your **Twilio Phone Number** (format: `+1234567890`)

### 3. Configure Environment Variables
Create a `.env` file in your project root with:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
DEFAULT_COUNTRY_CODE=+353
```

### 4. Development Mode
If you don't configure Twilio credentials, the app will:
- Start normally without any Twilio initialization errors
- Only initialize Twilio when user actually tries to send OTP
- Show mock success messages for OTP sending
- Allow you to test the forgot password flow
- Display warning messages only when OTP is attempted

## Testing the Feature

### Without Twilio (Development)
1. Start the app: `npm run electron`
2. Go to login page
3. Select a role
4. Click "Forgot PIN?"
5. Enter a phone number
6. Click "Send OTP" - will show mock success
7. Enter any 6-digit OTP
8. Set new PIN

### With Twilio (Production)
1. Configure your `.env` file with real Twilio credentials
2. Restart the app
3. Follow the same steps as above
4. You'll receive actual SMS with OTP

## Troubleshooting

### App Won't Start
- **Error**: `accountSid must start with AC`
- **Solution**: Make sure your `TWILIO_ACCOUNT_SID` starts with `AC` or remove the credentials to use mock mode

### SMS Not Sending
- Check your Twilio account balance
- Verify phone number format includes country code
- Check Twilio console for error logs

### Phone Number Validation
- The app uses `libphonenumber-js` for validation
- Phone numbers must be in international format (e.g., `+353123456789`)
- Country codes are automatically added based on selected country

## Cost Information
- Twilio free tier: $15 credit
- SMS cost: ~$0.0075 per message
- Free tier allows ~2000 SMS messages

## Security Notes
- Never commit your `.env` file to version control
- Use environment variables in production
- Consider rate limiting for OTP requests
- OTP expires after 10 minutes
