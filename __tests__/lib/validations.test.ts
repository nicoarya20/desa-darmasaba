/**
 * Validation Schemas Unit Tests
 * 
 * Tests for Zod validation schemas in lib/validations
 */

import { describe, it, expect } from 'vitest';
import {
  createBeritaSchema,
  updateBeritaSchema,
  loginRequestSchema,
  otpVerificationSchema,
  uploadFileSchema,
  registerUserSchema,
  paginationSchema,
} from '@/lib/validations';

// ============================================================================
// Berita Validation Tests
// ============================================================================

describe('createBeritaSchema', () => {
  const validData = {
    judul: 'Judul Berita Valid',
    deskripsi: 'Deskripsi yang cukup panjang untuk berita',
    content: 'Konten berita yang lengkap dengan minimal 50 karakter',
    kategoriBeritaId: 'clm5z8z8z000008l4f3qz8z8z',
    imageId: 'clm5z8z8z000008l4f3qz8z8z',
  };

  it('should accept valid berita data', () => {
    const result = createBeritaSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject short titles (less than 5 characters)', () => {
    const result = createBeritaSchema.safeParse({
      ...validData,
      judul: 'abc',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('judul');
      expect(result.error.errors[0].message).toContain('minimal 5 karakter');
    }
  });

  it('should reject long titles (more than 255 characters)', () => {
    const result = createBeritaSchema.safeParse({
      ...validData,
      judul: 'a'.repeat(256),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('judul');
      expect(result.error.errors[0].message).toContain('maksimal 255 karakter');
    }
  });

  it('should reject short descriptions (less than 10 characters)', () => {
    const result = createBeritaSchema.safeParse({
      ...validData,
      deskripsi: 'short',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('deskripsi');
      expect(result.error.errors[0].message).toContain('minimal 10 karakter');
    }
  });

  it('should reject long descriptions (more than 500 characters)', () => {
    const result = createBeritaSchema.safeParse({
      ...validData,
      deskripsi: 'a'.repeat(501),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('deskripsi');
      expect(result.error.errors[0].message).toContain('maksimal 500 karakter');
    }
  });

  it('should reject short content (less than 50 characters)', () => {
    const result = createBeritaSchema.safeParse({
      ...validData,
      content: 'short',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('content');
      expect(result.error.errors[0].message).toContain('minimal 50 karakter');
    }
  });

  it('should reject invalid cuid for kategoriBeritaId', () => {
    const result = createBeritaSchema.safeParse({
      ...validData,
      kategoriBeritaId: 'invalid-id',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('kategoriBeritaId');
      expect(result.error.errors[0].message).toContain('tidak valid');
    }
  });

  it('should reject invalid cuid for imageId', () => {
    const result = createBeritaSchema.safeParse({
      ...validData,
      imageId: 'invalid-id',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('imageId');
      expect(result.error.errors[0].message).toContain('tidak valid');
    }
  });

  it('should accept valid YouTube URL for linkVideo', () => {
    const result = createBeritaSchema.safeParse({
      ...validData,
      linkVideo: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid URL for linkVideo', () => {
    const result = createBeritaSchema.safeParse({
      ...validData,
      linkVideo: 'not-a-url',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('linkVideo');
      expect(result.error.errors[0].message).toContain('tidak valid');
    }
  });

  it('should accept empty string for linkVideo', () => {
    const result = createBeritaSchema.safeParse({
      ...validData,
      linkVideo: '',
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional imageIds array with valid cuids', () => {
    const result = createBeritaSchema.safeParse({
      ...validData,
      imageIds: ['clm5z8z8z000008l4f3qz8z8z', 'clm5z8z8z000008l4f3qz8z8y'],
    });
    expect(result.success).toBe(true);
  });

  it('should reject imageIds array with invalid cuid', () => {
    const result = createBeritaSchema.safeParse({
      ...validData,
      imageIds: ['invalid-id'],
    });
    expect(result.success).toBe(false);
  });
});

describe('updateBeritaSchema', () => {
  it('should accept partial data for updates', () => {
    const result = updateBeritaSchema.safeParse({
      judul: 'Updated Title',
    });
    expect(result.success).toBe(true);
  });

  it('should accept empty object', () => {
    const result = updateBeritaSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should still validate provided fields', () => {
    const result = updateBeritaSchema.safeParse({
      judul: 'abc', // too short
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// OTP/Login Validation Tests
// ============================================================================

describe('loginRequestSchema', () => {
  it('should accept valid phone number', () => {
    const result = loginRequestSchema.safeParse({
      nomor: '08123456789',
    });
    expect(result.success).toBe(true);
  });

  it('should reject phone number with less than 10 digits', () => {
    const result = loginRequestSchema.safeParse({
      nomor: '08123456',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('minimal 10 digit');
    }
  });

  it('should reject phone number with more than 15 digits', () => {
    const result = loginRequestSchema.safeParse({
      nomor: '081234567890123456',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('maksimal 15 digit');
    }
  });

  it('should reject phone number with non-numeric characters', () => {
    const result = loginRequestSchema.safeParse({
      nomor: '0812-3456-789',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('harus berupa angka');
    }
  });

  it('should reject empty phone number', () => {
    const result = loginRequestSchema.safeParse({
      nomor: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('otpVerificationSchema', () => {
  it('should accept valid OTP verification data', () => {
    const result = otpVerificationSchema.safeParse({
      nomor: '08123456789',
      kodeId: 'clm5z8z8z000008l4f3qz8z8z',
      otp: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('should reject OTP with wrong length', () => {
    const result = otpVerificationSchema.safeParse({
      nomor: '08123456789',
      kodeId: 'clm5z8z8z000008l4f3qz8z8z',
      otp: '12345',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('harus 6 digit');
    }
  });

  it('should reject OTP with non-numeric characters', () => {
    const result = otpVerificationSchema.safeParse({
      nomor: '08123456789',
      kodeId: 'clm5z8z8z000008l4f3qz8z8z',
      otp: '12345a',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('harus berupa angka');
    }
  });

  it('should reject invalid kodeId', () => {
    const result = otpVerificationSchema.safeParse({
      nomor: '08123456789',
      kodeId: 'invalid-id',
      otp: '123456',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('tidak valid');
    }
  });
});

// ============================================================================
// File Upload Validation Tests
// ============================================================================

describe('uploadFileSchema', () => {
  it('should accept valid file upload data', () => {
    const result = uploadFileSchema.safeParse({
      name: 'document.pdf',
      type: 'application/pdf',
      size: 1024 * 1024, // 1MB
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty file name', () => {
    const result = uploadFileSchema.safeParse({
      name: '',
      type: 'application/pdf',
      size: 1024 * 1024,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('wajib diisi');
    }
  });

  it('should accept allowed image types', () => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    allowedTypes.forEach((type) => {
      const result = uploadFileSchema.safeParse({
        name: 'file.jpg',
        type,
        size: 1024 * 1024,
      });
      expect(result.success).toBe(true);
    });
  });

  it('should accept allowed document types', () => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    allowedTypes.forEach((type) => {
      const result = uploadFileSchema.safeParse({
        name: 'document.doc',
        type,
        size: 1024 * 1024,
      });
      expect(result.success).toBe(true);
    });
  });

  it('should reject disallowed file types', () => {
    const result = uploadFileSchema.safeParse({
      name: 'file.exe',
      type: 'application/x-executable',
      size: 1024 * 1024,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('tidak diizinkan');
    }
  });

  it('should reject files larger than 5MB', () => {
    const result = uploadFileSchema.safeParse({
      name: 'largefile.pdf',
      type: 'application/pdf',
      size: 6 * 1024 * 1024, // 6MB
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('maksimal 5MB');
    }
  });

  it('should accept files exactly 5MB', () => {
    const result = uploadFileSchema.safeParse({
      name: 'file.pdf',
      type: 'application/pdf',
      size: 5 * 1024 * 1024, // 5MB
    });
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// User Registration Validation Tests
// ============================================================================

describe('registerUserSchema', () => {
  it('should accept valid user registration data', () => {
    const result = registerUserSchema.safeParse({
      name: 'John Doe',
      nomor: '08123456789',
      email: 'john@example.com',
      roleId: 1,
    });
    expect(result.success).toBe(true);
  });

  it('should reject short names (less than 3 characters)', () => {
    const result = registerUserSchema.safeParse({
      name: 'Jo',
      nomor: '08123456789',
      roleId: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('minimal 3 karakter');
    }
  });

  it('should reject long names (more than 100 characters)', () => {
    const result = registerUserSchema.safeParse({
      name: 'a'.repeat(101),
      nomor: '08123456789',
      roleId: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('maksimal 100 karakter');
    }
  });

  it('should reject invalid phone numbers', () => {
    const result = registerUserSchema.safeParse({
      name: 'John Doe',
      nomor: 'invalid',
      roleId: 1,
    });
    expect(result.success).toBe(false);
  });

  it('should accept empty email', () => {
    const result = registerUserSchema.safeParse({
      name: 'John Doe',
      nomor: '08123456789',
      email: '',
      roleId: 1,
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email format', () => {
    const result = registerUserSchema.safeParse({
      name: 'John Doe',
      nomor: '08123456789',
      email: 'not-an-email',
      roleId: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('tidak valid');
    }
  });

  it('should reject non-integer roleId', () => {
    const result = registerUserSchema.safeParse({
      name: 'John Doe',
      nomor: '08123456789',
      email: 'john@example.com',
      roleId: 1.5,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('angka bulat');
    }
  });

  it('should reject non-positive roleId', () => {
    const result = registerUserSchema.safeParse({
      name: 'John Doe',
      nomor: '08123456789',
      email: 'john@example.com',
      roleId: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('lebih dari 0');
    }
  });
});

// ============================================================================
// Pagination Validation Tests
// ============================================================================

describe('paginationSchema', () => {
  it('should accept default pagination values', () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
    }
  });

  it('should accept custom page and limit', () => {
    const result = paginationSchema.safeParse({
      page: '5',
      limit: '25',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(5);
      expect(result.data.limit).toBe(25);
    }
  });

  it('should reject page less than 1', () => {
    const result = paginationSchema.safeParse({
      page: '0',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('lebih dari 0');
    }
  });

  it('should reject limit less than 1', () => {
    const result = paginationSchema.safeParse({
      limit: '0',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('antara 1-100');
    }
  });

  it('should reject limit greater than 100', () => {
    const result = paginationSchema.safeParse({
      limit: '101',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('antara 1-100');
    }
  });

  it('should accept limit exactly 100', () => {
    const result = paginationSchema.safeParse({
      limit: '100',
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional search parameter', () => {
    const result = paginationSchema.safeParse({
      search: 'test query',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.search).toBe('test query');
    }
  });

  it('should handle invalid page numbers gracefully', () => {
    const result = paginationSchema.safeParse({
      page: 'abc',
    });
    expect(result.success).toBe(false);
  });
});
