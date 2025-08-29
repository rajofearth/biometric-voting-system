const axios = require('axios');

// Test TextBee SMS integration
async function testTextBeeSMS() {
  try {
    const BASE_URL = 'https://api.textbee.dev/api/v1';
    const API_KEY = process.env.SMS_API_KEY;
    const DEVICE_ID = process.env.DEVICE_ID;

    if (!API_KEY || !DEVICE_ID) {
      console.error('❌ SMS API credentials not configured');
      console.log('Please set SMS_API_KEY and DEVICE_ID environment variables');
      return;
    }

    console.log('🔑 API Key:', API_KEY.substring(0, 10) + '...');
    console.log('📱 Device ID:', DEVICE_ID);

    // Test SMS sending
    const testPhoneNumber = '+1234567890'; // Replace with a real test number
    const testMessage = 'Test OTP: 123456 - Biometric Voting System';

    console.log('📤 Sending test SMS...');
    
    const response = await axios.post(
      `${BASE_URL}/gateway/devices/${DEVICE_ID}/send-sms`,
      {
        recipients: [testPhoneNumber],
        message: testMessage
      },
      { 
        headers: { 
          'x-api-key': API_KEY,
          'Content-Type': 'application/json'
        } 
      }
    );

    console.log('✅ SMS sent successfully!');
    console.log('📊 Response:', response.data);
    
  } catch (error) {
    console.error('❌ Failed to send SMS:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Check your API key and device ID');
    } else if (error.response?.status === 404) {
      console.log('💡 Check your device ID');
    }
  }
}

// Run the test
testTextBeeSMS();