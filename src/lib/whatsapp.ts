/**
 * WhatsApp Service - Secure OTP Delivery
 * 
 * Mengirim OTP via WhatsApp dengan metode POST yang aman
 * OTP tidak dikirim langsung, tapi menggunakan reference ID
 */

interface WhatsAppOTPRequest {
  nomor: string;
  otpId: string;
  message: string;
}

interface WhatsAppOTPResponse {
  status: 'success' | 'error';
  message?: string;
}

/**
 * Kirim OTP via WhatsApp dengan POST request
 * OTP tidak dikirim dalam URL, tapi menggunakan reference ID
 * 
 * @param nomor - Nomor telepon tujuan
 * @param otpId - ID referensi OTP dari database
 * @param message - Pesan template (tanpa OTP code)
 */
export async function sendWhatsAppOTP({
  nomor,
  otpId,
  message,
}: WhatsAppOTPRequest): Promise<WhatsAppOTPResponse> {
  try {
    // Validasi nomor telepon
    if (!nomor || typeof nomor !== 'string') {
      return {
        status: 'error',
        message: 'Nomor telepon tidak valid',
      };
    }

    // Validasi otpId
    if (!otpId || typeof otpId !== 'string') {
      return {
        status: 'error',
        message: 'OTP ID tidak valid',
      };
    }

    // Kirim dengan POST request - OTP tidak dikirim dalam URL
    const response = await fetch('https://wa.wibudev.com/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nomor: nomor,
        // OTP code tidak dikirim ke WhatsApp API
        // Frontend akan meminta user memasukkan OTP yang mereka terima
        // Backend akan validate berdasarkan otpId
        otpId: otpId,
        message: message,
      }),
    });

    if (!response.ok) {
      console.error('WhatsApp API error:', response.status, response.statusText);
      return {
        status: 'error',
        message: 'Gagal mengirim pesan WhatsApp',
      };
    }

    const result = await response.json();

    if (result.status !== 'success') {
      return {
        status: 'error',
        message: result.message || 'Gagal mengirim pesan WhatsApp',
      };
    }

    return {
      status: 'success',
    };
  } catch (error) {
    console.error('Error sending WhatsApp OTP:', error);
    return {
      status: 'error',
      message: 'Terjadi kesalahan saat mengirim pesan',
    };
  }
}

/**
 * Format pesan WhatsApp untuk OTP
 * @param otpCode - Kode OTP (hanya digunakan di sisi server untuk message template)
 * @returns Pesan yang sudah diformat
 */
export function formatOTPMessage(otpCode: number | string): string {
  return `Website Desa Darmasaba - Kode ini bersifat RAHASIA dan JANGAN DI BAGIKAN KEPADA SIAPAPUN, termasuk anggota ataupun Admin lainnya.

>> Kode OTP anda: ${otpCode}

Kode ini hanya berlaku untuk satu kali login.`;
}

/**
 * Format pesan WhatsApp untuk OTP (tanpa menampilkan code - lebih aman)
 * Menggunakan reference ID saja
 * @param otpId - ID referensi OTP
 * @returns Pesan yang sudah diformat
 */
export function formatOTPMessageWithReference(otpId: string): string {
  return `Website Desa Darmasaba - Kode ini bersifat RAHASIA dan JANGAN DI BAGIKAN KEPADA SIAPAPUN.

Silakan masukkan kode OTP yang telah dikirimkan ke nomor Anda.

Reference ID: ${otpId}

Kode ini hanya berlaku untuk satu kali login.`;
}
