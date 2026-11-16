// @vitest-environment node
// Partisipan Kegiatan Desa opsional: form admin menerima kosong (disimpan 0, tanpa ubah kolom),
// 0/null disembunyikan di publik dan tampil "-" di detail admin.
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api-fetch', () => ({ default: {} }));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { templateForm } from '@/app/admin/(dashboard)/_state/desa/kegiatanDesa';
import {
  formatPartisipanAdmin,
  hasPartisipan,
  partisipanInputValue,
  partisipanSchema,
  toPartisipan,
} from '@/lib/kegiatan-partisipan';

// test-only: isi form admin rekaan.
const form = (partisipan: unknown) => ({
  judul: 'Kerja Bakti Banjar',
  deskripsiSingkat: 'Bersih-bersih saluran',
  deskripsiLengkap: '<p>Kerja bakti</p>',
  tanggal: '2026-01-10',
  lokasi: 'Banjar Contoh',
  partisipan,
  kategoriKegiatanId: 'katgotongroyong01',
});

describe('validasi form Kegiatan Desa — partisipan opsional', () => {
  it('kosong ("", null, undefined) dan 0 diterima dan dinormalkan ke 0', () => {
    for (const partisipan of ['', null, undefined, 0]) {
      const r = templateForm.safeParse(form(partisipan));
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.partisipan).toBe(0);
    }
  });

  it('angka positif bulat diterima apa adanya', () => {
    const r = templateForm.safeParse(form(25));
    expect(r.success && r.data.partisipan).toBe(25);
  });

  it('negatif atau pecahan ditolak dengan path partisipan', () => {
    for (const partisipan of [-1, 2.5]) {
      const r = partisipanSchema.safeParse(partisipan);
      expect(r.success).toBe(false);
    }
    const r = templateForm.safeParse(form(-3));
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.map((i) => i.path.join('.'))).toEqual(['partisipan']);
  });
});

describe('helper partisipan', () => {
  it('toPartisipan: nilai NumberInput kosong → 0, angka/string angka dipertahankan', () => {
    expect(toPartisipan('')).toBe(0);
    expect(toPartisipan(undefined)).toBe(0);
    expect(toPartisipan('abc')).toBe(0);
    expect(toPartisipan(12)).toBe(12);
    expect(toPartisipan('7')).toBe(7);
  });

  it('hasPartisipan hanya untuk > 0; input admin menampilkan 0 sebagai kosong', () => {
    expect([0, null, undefined, -1].some((v) => hasPartisipan(v))).toBe(false);
    expect(hasPartisipan(1)).toBe(true);
    expect(partisipanInputValue(0)).toBe('');
    expect(partisipanInputValue(30)).toBe(30);
  });

  it('detail admin: 0/null → "-", selain itu "{n} orang"', () => {
    expect(formatPartisipanAdmin(0)).toBe('-');
    expect(formatPartisipanAdmin(null)).toBe('-');
    expect(formatPartisipanAdmin(30)).toBe('30 orang');
  });
});
