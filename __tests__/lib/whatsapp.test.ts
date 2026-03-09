/**
 * WhatsApp Service Unit Tests
 * 
 * Tests for WhatsApp OTP service in lib/whatsapp
 * Note: These tests use direct fetch mocking, not MSW
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  sendWhatsAppOTP,
  formatOTPMessage,
  formatOTPMessageWithReference,
} from '@/lib/whatsapp';

describe('WhatsApp Service', () => {
  // Store original fetch
  const originalFetch = global.fetch;
  let mockFetch: any;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  // ============================================================================
  // formatOTPMessage Tests
  // ============================================================================

  describe('formatOTPMessage', () => {
    it('should format OTP message with numeric code', () => {
      const otpCode = 123456;
      const message = formatOTPMessage(otpCode);

      expect(message).toContain('Website Desa Darmasaba');
      expect(message).toContain('RAHASIA');
      expect(message).toContain('JANGAN DI BAGIKAN');
      expect(message).toContain('123456');
      expect(message).toContain('satu kali login');
    });

    it('should format OTP message with string code', () => {
      const otpCode = '654321';
      const message = formatOTPMessage(otpCode);

      expect(message).toContain('654321');
    });

    it('should include security warning', () => {
      const message = formatOTPMessage(123456);

      expect(message).toMatch(/RAHASIA/);
      expect(message).toMatch(/JANGAN DI BAGIKAN KEPADA SIAPAPUN/);
    });

    it('should mention code validity', () => {
      const message = formatOTPMessage(123456);

      expect(message).toMatch(/hanya berlaku untuk satu kali login/);
    });
  });

  // ============================================================================
  // formatOTPMessageWithReference Tests
  // ============================================================================

  describe('formatOTPMessageWithReference', () => {
    it('should format message with reference ID', () => {
      const otpId = 'clm5z8z8z000008l4f3qz8z8z';
      const message = formatOTPMessageWithReference(otpId);

      expect(message).toContain('Website Desa Darmasaba');
      expect(message).toContain('RAHASIA');
      expect(message).toContain('JANGAN DI BAGIKAN');
      expect(message).toContain(otpId);
      expect(message).toContain('Reference ID');
    });

    it('should NOT include actual OTP code', () => {
      const message = formatOTPMessageWithReference('test-id');

      expect(message).not.toMatch(/\d{6}/);
    });

    it('should instruct user to enter received OTP', () => {
      const message = formatOTPMessageWithReference('test-id');

      expect(message).toMatch(/masukkan kode OTP/);
    });

    it('should include security warning', () => {
      const message = formatOTPMessageWithReference('test-id');

      expect(message).toMatch(/RAHASIA/);
      expect(message).toMatch(/JANGAN DI BAGIKAN KEPADA SIAPAPUN/);
    });
  });

  // ============================================================================
  // sendWhatsAppOTP Tests
  // ============================================================================

  describe('sendWhatsAppOTP', () => {
    it('should send OTP successfully with valid parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'success' }),
        clone: function() { return this; }
      } as any);

      const result = await sendWhatsAppOTP({
        nomor: '08123456789',
        otpId: 'clm5z8z8z000008l4f3qz8z8z',
        message: 'Test message',
      });

      expect(result.status).toBe('success');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://wa.wibudev.com/send',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should use POST method (not GET) for security', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'success' }),
        clone: function() { return this; }
      } as any);

      await sendWhatsAppOTP({
        nomor: '08123456789',
        otpId: 'test-otp-id',
        message: 'Test',
      });

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe('https://wa.wibudev.com/send');
      expect(callArgs[1]?.method).toBe('POST');
    });

    it('should send otpId reference, not actual OTP code', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'success' }),
        clone: function() { return this; }
      } as any);

      await sendWhatsAppOTP({
        nomor: '08123456789',
        otpId: 'test-otp-id-123',
        message: 'Test message',
      });

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);

      expect(body.otpId).toBe('test-otp-id-123');
      expect(body.nomor).toBe('08123456789');
    });

    it('should return error for invalid phone number (empty)', async () => {
      const result = await sendWhatsAppOTP({
        nomor: '',
        otpId: 'test-id',
        message: 'Test',
      });

      expect(result.status).toBe('error');
      expect(result.message).toBe('Nomor telepon tidak valid');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return error for invalid phone number (null)', async () => {
      const result = await sendWhatsAppOTP({
        nomor: null as any,
        otpId: 'test-id',
        message: 'Test',
      });

      expect(result.status).toBe('error');
      expect(result.message).toBe('Nomor telepon tidak valid');
    });

    it('should return error for invalid otpId', async () => {
      const result = await sendWhatsAppOTP({
        nomor: '08123456789',
        otpId: '',
        message: 'Test',
      });

      expect(result.status).toBe('error');
      expect(result.message).toBe('OTP ID tidak valid');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return error for null otpId', async () => {
      const result = await sendWhatsAppOTP({
        nomor: '08123456789',
        otpId: null as any,
        message: 'Test',
      });

      expect(result.status).toBe('error');
      expect(result.message).toBe('OTP ID tidak valid');
    });

    it('should handle WhatsApp API error response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          status: 'error',
          message: 'Invalid phone number',
        }),
        clone: function() { return this; }
      } as any);

      const result = await sendWhatsAppOTP({
        nomor: '08123456789',
        otpId: 'test-id',
        message: 'Test',
      });

      expect(result.status).toBe('error');
      expect(result.message).toBe('Invalid phone number');
    });

    it('should handle HTTP error response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        clone: function() { return this; }
      } as any);

      const result = await sendWhatsAppOTP({
        nomor: '08123456789',
        otpId: 'test-id',
        message: 'Test',
      });

      expect(result.status).toBe('error');
      expect(result.message).toBe('Gagal mengirim pesan WhatsApp');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await sendWhatsAppOTP({
        nomor: '08123456789',
        otpId: 'test-id',
        message: 'Test',
      });

      expect(result.status).toBe('error');
      expect(result.message).toBe('Terjadi kesalahan saat mengirim pesan');
    });

    it('should handle JSON parse errors', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
        clone: function() { return this; }
      } as any);

      const result = await sendWhatsAppOTP({
        nomor: '08123456789',
        otpId: 'test-id',
        message: 'Test',
      });

      expect(result.status).toBe('error');
      expect(result.message).toBe('Terjadi kesalahan saat mengirim pesan');
    });

    it('should send correct request body structure', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'success' }),
        clone: function() { return this; }
      } as any);

      await sendWhatsAppOTP({
        nomor: '081234567890',
        otpId: 'unique-otp-id',
        message: 'Custom message',
      });

      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);

      expect(body).toEqual({
        nomor: '081234567890',
        otpId: 'unique-otp-id',
        message: 'Custom message',
      });
    });
  });

  // ============================================================================
  // Security Tests
  // ============================================================================

  describe('Security - OTP not exposed in URL', () => {
    it('should NOT include OTP code in URL query string', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'success' }),
        clone: function() { return this; }
      } as any);

      await sendWhatsAppOTP({
        nomor: '08123456789',
        otpId: 'test-id',
        message: 'Your OTP is 123456',
      });

      const callArgs = mockFetch.mock.calls[0];
      const url = callArgs[0];

      // URL should be the endpoint, not containing OTP
      expect(url).toBe('https://wa.wibudev.com/send');
      expect(url).not.toContain('123456');
      expect(url).not.toContain('?');
    });

    it('should send OTP in request body (POST), not URL', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'success' }),
        clone: function() { return this; }
      } as any);

      await sendWhatsAppOTP({
        nomor: '08123456789',
        otpId: 'test-id',
        message: 'Test',
      });

      const callArgs = mockFetch.mock.calls[0];

      // Should use POST with body
      expect(callArgs[1]?.method).toBe('POST');
      expect(callArgs[1]?.body).toBeDefined();

      // OTP reference should be in body, not URL
      const body = JSON.parse(callArgs[1]?.body as string);
      expect(body.otpId).toBe('test-id');
    });
  });
});
