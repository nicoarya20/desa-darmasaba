// @vitest-environment node
// Halaman daftar Layanan: saring nama surat keterangan, tautan eksternal Telunjuk Sakti, langkah OSS.
import { describe, expect, it } from 'vitest';
import {
  OSS_STEPS,
  externalHref,
  filterByName,
  stepNumber,
} from '@/app/(public)/(pages)/pemerintahan/layanan/_com/layanan.logic';
import { LAYANAN_LIST_LIMIT, layananDetailHref } from '@/app/(public)/(pages)/pemerintahan/layanan/_com/layanan.meta';

// test-only: nama layanan berbentuk respons find-many.
const items = [
  { id: 'a', name: 'Surat Keterangan Kematian' },
  { id: 'b', name: 'Surat Keterangan  Usaha' },
  { id: 'c', name: 'Surat Keterangan Tempat Usaha' },
];

describe('filterByName', () => {
  it('kata kunci kosong / spasi saja → semua item (salinan baru)', () => {
    expect(filterByName(items, '')).toEqual(items);
    expect(filterByName(items, '   ')).toHaveLength(3);
    expect(filterByName(items, '')).not.toBe(items);
  });

  it('tanpa beda huruf besar/kecil dan spasi ganda', () => {
    expect(filterByName(items, '  KEMATIAN ').map((i) => i.id)).toEqual(['a']);
    expect(filterByName(items, 'keterangan usaha').map((i) => i.id)).toEqual(['b']);
    expect(filterByName(items, 'usaha').map((i) => i.id)).toEqual(['b', 'c']);
  });

  it('tidak cocok → daftar kosong', () => {
    expect(filterByName(items, 'xyz')).toEqual([]);
  });
});

describe('externalHref', () => {
  it('tautan berskema dibiarkan', () => {
    expect(externalHref('https://darmasaba.desa.id/a.pdf')).toBe('https://darmasaba.desa.id/a.pdf');
    expect(externalHref('mailto:desa@example.test')).toBe('mailto:desa@example.test');
  });

  it('tanpa skema → https:// (bukan rute relatif di situs ini)', () => {
    expect(externalHref('www.test.com')).toBe('https://www.test.com');
    expect(externalHref(' //cdn.example.test/x ')).toBe('https://cdn.example.test/x');
  });

  it('kosong → string kosong', () => {
    expect(externalHref('  ')).toBe('');
  });
});

describe('OSS & meta', () => {
  it('6 langkah berurutan, bernomor dua digit', () => {
    expect(OSS_STEPS.map((s) => s.title)).toEqual([
      'Daftar akun',
      'Isi data perusahaan',
      'Pilih KBLI',
      'Unggah dokumen',
      'Verifikasi instansi',
      'Terbit NIB',
    ]);
    expect(stepNumber(0)).toBe('01');
    expect(stepNumber(5)).toBe('06');
  });

  it('limit muat cukup untuk semua layanan (data ±11) dan rute detail', () => {
    expect(LAYANAN_LIST_LIMIT).toBeGreaterThanOrEqual(11);
    expect(layananDetailHref('x1')).toBe('/pemerintahan/layanan/x1');
  });
});
