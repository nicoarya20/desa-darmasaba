/**
 * WhatsApp Service - Send OTP via WhatsApp using otp.wibudev.com API
 * Uses API Key authentication for secure access
 */

interface SendWaOtpParams {
  nomor: string;
  message: string;
}

interface SendWaOtpResponse {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * Send WhatsApp message using wibudev.com API with authentication
 * @param params - { nomor: string, message: string }
 * @returns Promise<SendWaOtpResponse>
 */
export async function sendWhatsAppOtp({
  nomor,
  message,
}: SendWaOtpParams): Promise<SendWaOtpResponse> {
  const apiKey = process.env.WIBU_WA_API_KEY;
  const waApiUrl = process.env.WIBU_WA_API_URL || 'https://wa.wibudev.com';

  if (!apiKey) {
    console.error('❌ WIBU_WA_API_KEY is not configured');
    return {
      success: false,
      message: 'WhatsApp API key not configured',
    };
  }

  try {
    // Using the API endpoint with authentication
    // Format: GET https://wa.wibudev.com/code?nom=...&text=...
    // With Authorization header for API key
    const url = `${waApiUrl}/code?nom=${encodeURIComponent(nomor)}&text=${encodeURIComponent(message)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Key': apiKey,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ WA API Error:', result);
      return {
        success: false,
        message: result.message || 'Failed to send WhatsApp message',
        data: result,
      };
    }

    // Check if response has success status
    if (result.status !== 'success') {
      console.error('❌ WA API Status Error:', result);
      return {
        success: false,
        message: result.message || 'Failed to send WhatsApp message',
        data: result,
      };
    }

    console.log('✅ WA Response:', result);
    return {
      success: true,
      message: 'WhatsApp sent successfully',
      data: result,
    };
  } catch (error) {
    console.error('❌ Fetch WA API Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Legacy function for backward compatibility (deprecated)
 * @deprecated Use sendWhatsAppOtp instead
 */
export async function sendWhatsAppOtpLegacy({
  nomor,
  message,
}: SendWaOtpParams): Promise<SendWaOtpResponse> {
  const waUrl = `https://wa.wibudev.com/code?nom=${encodeURIComponent(nomor)}&text=${encodeURIComponent(message)}`;

  try {
    const res = await fetch(waUrl);
    const result = await res.json();

    if (result.status !== 'success') {
      console.error('❌ WA Legacy Error:', result);
      return {
        success: false,
        message: result.message || 'Failed to send WhatsApp message',
        data: result,
      };
    }

    return {
      success: true,
      message: 'WhatsApp sent successfully',
      data: result,
    };
  } catch (error) {
    console.error('❌ Fetch WA Legacy Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
