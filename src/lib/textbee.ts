interface TextBeeConfig {
  apiKey: string;
  deviceId: string;
  baseUrl?: string;
}

interface SendSMSResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class TextBeeService {
  private apiKey: string;
  private deviceId: string;
  private baseUrl: string;

  constructor(config: TextBeeConfig) {
    this.apiKey = config.apiKey;
    this.deviceId = config.deviceId;
    this.baseUrl = config.baseUrl || 'https://api.textbee.dev';
  }

  async sendSMS(phoneNumber: string, message: string): Promise<SendSMSResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/gateway/devices/${this.deviceId}/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify({
          recipients: [phoneNumber],
          message: message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        message: 'SMS sent successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async sendOTP(phoneNumber: string, code: string): Promise<SendSMSResponse> {
    const message = `Your verification code is: ${code}. This code will expire in 5 minutes.`;
    return this.sendSMS(phoneNumber, message);
  }
}

// Create a singleton instance
export const textbeeService = new TextBeeService({
  apiKey: process.env.SMS_API_KEY || '',
  deviceId: process.env.DEVICE_ID || '',
});
