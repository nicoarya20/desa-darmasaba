/**
 * Validation Schemas with Zod
 * 
 * Centralized validation schemas for all API endpoints
 * Used for input validation and sanitization
 */

import { z } from 'zod';

/**
 * Berita (News) Validation Schemas
 */
export const createBeritaSchema = z.object({
  judul: z
    .string()
    .min(5, 'Judul minimal 5 karakter')
    .max(255, 'Judul maksimal 255 karakter'),
  deskripsi: z
    .string()
    .min(10, 'Deskripsi minimal 10 karakter')
    .max(500, 'Deskripsi maksimal 500 karakter'),
  content: z
    .string()
    .min(50, 'Konten minimal 50 karakter'),
  kategoriBeritaId: z
    .string()
    .cuid('Kategori berita ID tidak valid'),
  imageId: z
    .string()
    .cuid('Image ID tidak valid'),
  imageIds: z
    .array(z.string().cuid())
    .optional(),
  linkVideo: z
    .string()
    .url('Format URL YouTube tidak valid')
    .optional()
    .or(z.literal('')),
});

export const updateBeritaSchema = createBeritaSchema.partial();

/**
 * OTP/Login Validation Schemas
 */
export const loginRequestSchema = z.object({
  nomor: z
    .string()
    .min(10, 'Nomor telepon minimal 10 digit')
    .max(15, 'Nomor telepon maksimal 15 digit')
    .regex(/^[0-9]+$/, 'Nomor telepon harus berupa angka'),
});

export const otpVerificationSchema = z.object({
  nomor: z
    .string()
    .min(10, 'Nomor telepon minimal 10 digit')
    .max(15, 'Nomor telepon maksimal 15 digit'),
  kodeId: z
    .string()
    .cuid('Kode ID tidak valid'),
  otp: z
    .string()
    .length(6, 'OTP harus 6 digit')
    .regex(/^[0-9]+$/, 'OTP harus berupa angka'),
});

/**
 * File Upload Validation Schemas
 */
export const uploadFileSchema = z.object({
  name: z.string().min(1, 'Nama file wajib diisi'),
  type: z.string().refine(
    (type) => {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      return allowedTypes.includes(type);
    },
    'Tipe file tidak diizinkan'
  ),
  size: z.number().max(5 * 1024 * 1024, 'Ukuran file maksimal 5MB'), // 5MB
});

/**
 * User Registration Validation Schemas
 */
export const registerUserSchema = z.object({
  name: z
    .string()
    .min(3, 'Nama minimal 3 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  nomor: z
    .string()
    .min(10, 'Nomor telepon minimal 10 digit')
    .max(15, 'Nomor telepon maksimal 15 digit')
    .regex(/^[0-9]+$/, 'Nomor telepon harus berupa angka'),
  email: z
    .string()
    .email('Format email tidak valid')
    .optional()
    .or(z.literal('')),
  roleId: z
    .number()
    .int('Role ID harus berupa angka bulat')
    .positive('Role ID harus lebih dari 0'),
});

/**
 * Generic Pagination Schema
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => !isNaN(val) && val > 0, 'Page harus lebih dari 0'),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine(
      (val) => !isNaN(val) && val > 0 && val <= 100,
      'Limit harus antara 1-100'
    ),
  search: z.string().optional(),
});

/**
 * Export type inference
 */
export type CreateBeritaInput = z.infer<typeof createBeritaSchema>;
export type UpdateBeritaInput = z.infer<typeof updateBeritaSchema>;
export type LoginRequestInput = z.infer<typeof loginRequestSchema>;
export type OtpVerificationInput = z.infer<typeof otpVerificationSchema>;
export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
