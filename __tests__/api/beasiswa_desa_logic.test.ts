// @vitest-environment node
// Beasiswa Desa: validasi formulir, payload kiriman, pemetaan data API, dan jalur galat kiriman (tanpa POST nyata).
import { afterEach, describe, expect, it, vi } from 'vitest';

const post = vi.fn();
const getKeunggulan = vi.fn();
vi.mock('@/lib/api-fetch', () => ({
  default: {
    api: {
      pendidikan: {
        beasiswa: {
          beasiswapendaftar: { create: { post: (...a: unknown[]) => post(...a) } },
          keunggulanprogram: { findMany: { get: (...a: unknown[]) => getKeunggulan(...a) } },
        },
      },
    },
  },
}));

import {
  BEASISWA_ERROR, EMPTY_BEASISWA_FORM, beasiswaFieldError, beasiswaFormErrors, isBeasiswaFormValid,
  toBeasiswaPayload, toDateInputValue, type BeasiswaForm,
} from '@/app/(public)/(pages)/pendidikan/beasiswa-desa/_lib/beasiswaForm';
import {
  SUBMIT_ERROR, submitErrorMessage, toKeunggulan, toRingkasan,
} from '@/app/(public)/(pages)/pendidikan/beasiswa-desa/_com/beasiswa.logic';
import { kirimPendaftaran, loadKeunggulan } from '@/app/(public)/(pages)/pendidikan/beasiswa-desa/_com/beasiswa.source';

// test-only: isian lengkap & valid.
const valid: BeasiswaForm = {
  namaLengkap: '  Ni Luh Ayu  ', nis: '12345', kelas: '8B', jenisKelamin: 'PEREMPUAN',
  alamatDomisili: 'Banjar Umahanyar', tempatLahir: 'Badung', tanggalLahir: '2012-05-01',
  namaOrtu: 'I Wayan Sudi', nik: '5103011234567890', pekerjaanOrtu: 'Petani', penghasilan: 'Rp 2.000.000',
  noHp: '081234567890',
};
const today = new Date(2026, 10, 15); // 15 Nov 2026 lokal

afterEach(() => {
  vi.restoreAllMocks();
  post.mockReset();
  getKeunggulan.mockReset();
});

describe('validasi formulir beasiswa', () => {
  it('isian lengkap valid; formulir kosong menandai semua 12 field', () => {
    expect(isBeasiswaFormValid(valid, today)).toBe(true);
    expect(Object.keys(beasiswaFormErrors(EMPTY_BEASISWA_FORM, today))).toHaveLength(12);
  });

  it('tanggal lahir tidak boleh melewati hari ini; hari ini sendiri boleh', () => {
    expect(beasiswaFieldError('tanggalLahir', { ...valid, tanggalLahir: '2026-11-16' }, today)).toBe(BEASISWA_ERROR.tanggalFuture);
    expect(beasiswaFieldError('tanggalLahir', { ...valid, tanggalLahir: '2026-11-15' }, today)).toBeNull();
    expect(beasiswaFieldError('tanggalLahir', { ...valid, tanggalLahir: '' }, today)).toBe(BEASISWA_ERROR.tanggalEmpty);
    expect(toDateInputValue(today)).toBe('2026-11-15');
  });

  it('NIK wajib tepat 16 digit', () => {
    expect(beasiswaFieldError('nik', { ...valid, nik: '' })).toBe(BEASISWA_ERROR.nikEmpty);
    expect(beasiswaFieldError('nik', { ...valid, nik: '510301' })).toBe(BEASISWA_ERROR.nik);
  });

  it('nomor HP diawali 08/62 dan 10–13 digit', () => {
    expect(beasiswaFieldError('noHp', { ...valid, noHp: '' })).toBe(BEASISWA_ERROR.noHpEmpty);
    expect(beasiswaFieldError('noHp', { ...valid, noHp: '0361123456' })).toBe(BEASISWA_ERROR.noHpPrefix);
    expect(beasiswaFieldError('noHp', { ...valid, noHp: '08123' })).toBe(BEASISWA_ERROR.noHpLength);
    expect(beasiswaFieldError('noHp', { ...valid, noHp: '6281234567890' })).toBeNull();
  });

  it('jenis kelamin hanya nilai enum API', () => {
    expect(beasiswaFieldError('jenisKelamin', { ...valid, jenisKelamin: 'L' })).toBe(BEASISWA_ERROR.jenisKelamin);
  });

  it('payload: teks di-trim, NIS/NIK/HP hanya digit, 12 field kontrak API', () => {
    const payload = toBeasiswaPayload({ ...valid, noHp: '0812-3456-7890' });
    expect(payload.namaLengkap).toBe('Ni Luh Ayu');
    expect(payload.noHp).toBe('081234567890');
    expect(Object.keys(payload).sort()).toEqual(Object.keys(EMPTY_BEASISWA_FORM).sort());
  });
});

describe('pemetaan data API', () => {
  it('keunggulan: HTML jadi teks polos (tag skrip tidak dirender), tanpa judul dibuang', () => {
    const items = toKeunggulan([
      { id: 'a', judul: ' Bimbingan ', deskripsi: '<p>Gratis &amp; rutin</p><script>alert(1)</script>' },
      { id: 'b', judul: '  ', deskripsi: 'x' },
    ]);
    expect(items).toEqual([{ id: 'a', judul: 'Bimbingan', deskripsi: 'Gratis & rutin alert(1)' }]);
  });

  it('ringkasan: dana BigInt-string → Rp ringkas + penuh; "-" & 0 → null', () => {
    expect(toRingkasan({ jumlahPenerima: 45, danaTersalurkan: '1200000000', tahunAjaran: '2025/2026' })).toEqual({
      pendaftar: 45, danaRingkas: 'Rp 1,2 M', danaPenuh: 'Rp 1.200.000.000', tahunAjaran: '2025/2026',
    });
    expect(toRingkasan({ jumlahPenerima: 0, danaTersalurkan: '0', tahunAjaran: '-' })).toMatchObject({
      danaRingkas: null, danaPenuh: null, tahunAjaran: null,
    });
  });

  it('loadKeunggulan memuat sekaligus (limit 100) dan memperingatkan bila data terpotong', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    getKeunggulan.mockResolvedValue({ status: 200, data: { success: true, total: 120, data: [{ id: 'a', judul: 'A', deskripsi: '' }] } });
    await expect(loadKeunggulan()).resolves.toHaveLength(1);
    expect(getKeunggulan).toHaveBeenCalledWith({ query: { page: 1, limit: 100 } });
    expect(warn).toHaveBeenCalledOnce();
  });

  it('loadKeunggulan gagal → Error berkonteks', async () => {
    getKeunggulan.mockResolvedValue({ status: 500, data: { success: false, message: 'db down' } });
    await expect(loadKeunggulan()).rejects.toThrow(/keunggulan program beasiswa gagal \(HTTP 500\): db down/);
  });
});

describe('kiriman pendaftaran', () => {
  it('pesan galat per status: 401 belum menerima kiriman, 409 NIK dipakai, 429, 400, lainnya jaringan', () => {
    expect(submitErrorMessage(401)).toBe(SUBMIT_ERROR.unauthorized);
    expect(submitErrorMessage(409)).toBe(SUBMIT_ERROR.duplicate);
    expect(submitErrorMessage(429)).toBe(SUBMIT_ERROR.rateLimit);
    expect(submitErrorMessage(422)).toBe(SUBMIT_ERROR.invalid);
    expect(submitErrorMessage(500)).toBe(SUBMIT_ERROR.network);
  });

  it('401 anonim → nilai galat manusiawi, bukan lemparan; payload dikirim apa adanya', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    post.mockResolvedValue({ status: 401, data: null, error: { value: { message: 'Unauthorized - Silakan login terlebih dahulu' } } });
    const payload = toBeasiswaPayload(valid);
    await expect(kirimPendaftaran(payload)).resolves.toEqual({ ok: false, status: 401, message: SUBMIT_ERROR.unauthorized });
    expect(post).toHaveBeenCalledWith(payload);
  });

  it('gagal jaringan (lemparan) → status 0 + pesan jaringan', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    post.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(kirimPendaftaran(toBeasiswaPayload(valid))).resolves.toMatchObject({ ok: false, status: 0, message: SUBMIT_ERROR.network });
  });

  it('200 success → ok', async () => {
    post.mockResolvedValue({ status: 200, data: { success: true } });
    await expect(kirimPendaftaran(toBeasiswaPayload(valid))).resolves.toEqual({ ok: true });
  });
});
