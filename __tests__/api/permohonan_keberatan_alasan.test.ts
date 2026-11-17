// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const createMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/prisma', () => ({
  default: { formulirPermohonanKeberatan: { create: createMock } },
}));

import permohonanKeberatanCreate from '@/app/api/[[...slugs]]/_lib/ppid/permohonan_keberatan_informasi_publik/create';
import {
  ALASAN_KEBERATAN_MAX_HTML_LENGTH,
  ALASAN_KEBERATAN_MAX_LENGTH,
  ALASAN_KEBERATAN_TOO_LONG_MESSAGE,
  richTextLength,
  validateAlasanKeberatanLength,
} from '@/lib/permohonan-keberatan';

const paragraph = (text: string) => `<p>${text}</p>`;

describe('richTextLength', () => {
  it('menghitung teks tanpa tag, dipangkas', () => {
    expect(richTextLength('<p> Halo <strong>desa</strong> </p>')).toBe(9);
    expect(richTextLength(undefined)).toBe(0);
  });
});

describe('validateAlasanKeberatanLength', () => {
  it('accepts alasan exactly at the limit (tags are not counted)', () => {
    const alasan = paragraph('a'.repeat(ALASAN_KEBERATAN_MAX_LENGTH));
    expect(validateAlasanKeberatanLength(alasan)).toBeNull();
  });

  it('rejects alasan one character over the limit', () => {
    const alasan = paragraph('a'.repeat(ALASAN_KEBERATAN_MAX_LENGTH + 1));
    expect(validateAlasanKeberatanLength(alasan)).toBe(
      ALASAN_KEBERATAN_TOO_LONG_MESSAGE
    );
  });

  it('rejects markup bloat even when plain text is short', () => {
    const alasan = '<p><strong></strong></p>'.repeat(
      ALASAN_KEBERATAN_MAX_HTML_LENGTH
    );
    expect(validateAlasanKeberatanLength(alasan)).not.toBeNull();
  });
});

describe('permohonanKeberatanInformasiPublikCreate', () => {
  beforeEach(() => createMock.mockReset());

  const buildContext = (alasan: string) => ({
    body: {
      name: 'Budi Santoso',
      email: 'budi@example.com',
      notelp: '081234567890',
      alasan,
    },
    set: {} as { status?: number },
  });

  it('returns 400 with a clear message and does not save when alasan is too long', async () => {
    const context = buildContext(
      paragraph('a'.repeat(ALASAN_KEBERATAN_MAX_LENGTH + 1))
    );

    const res = await permohonanKeberatanCreate(context as never);

    expect(context.set.status).toBe(400);
    expect(res).toMatchObject({
      success: false,
      message: ALASAN_KEBERATAN_TOO_LONG_MESSAGE,
    });
    expect(createMock).not.toHaveBeenCalled();
  });

  it('saves the permohonan when alasan is within the limit', async () => {
    const context = buildContext(paragraph('Permohonan saya ditolak tanpa alasan'));
    createMock.mockResolvedValue({ id: 'keberatan-1' }); // test-only

    const res = await permohonanKeberatanCreate(context as never);

    expect(context.set.status).toBeUndefined();
    // Respons hanya id: tidak menggemakan nama/email/telepon pemohon.
    expect(res).toEqual({ success: true, message: 'Permohonan Keberatan Informasi Publik Berhasil Dibuat', data: { id: 'keberatan-1' } });
    expect(createMock).toHaveBeenCalledTimes(1);
  });
});
