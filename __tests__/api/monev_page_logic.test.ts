// @vitest-environment node
// Halaman Monev & Pembangunan (gaya APBDes): aturan tampilan murni — keadaan kosong, sebaran status,
// status/progres per kegiatan, baris meta, dan parameter filter.
import { describe, expect, it } from 'vitest';
import {
  FILTER_ALL,
  FILTER_OPTIONS,
  isMonevEmpty,
  kegiatanMeta,
  kegiatanProgres,
  kegiatanStatus,
  statusQuery,
  statusSegments,
} from '@/app/(public)/(pages)/pemerintahan/monev-pembangunan/_com/monev.logic';
import type { MonevSummary } from '@/lib/kegiatan-pembangunan';

// test-only: ringkasan berbentuk respons GET /kegiatandesa/monev.
const summary = (perStatus: Partial<MonevSummary['perStatus']>, extra: Partial<MonevSummary> = {}): MonevSummary => {
  const ps = { rencana: 0, berjalan: 0, selesai: 0, belumDiisi: 0, ...perStatus };
  return {
    totalKegiatan: ps.rencana + ps.berjalan + ps.selesai + ps.belumDiisi,
    perStatus: ps,
    totalAnggaran: 0,
    rataRataProgres: 0,
    ...extra,
  };
};

describe('isMonevEmpty', () => {
  it('kosong bila belum ada kegiatan sama sekali (data stg: semua 0)', () => {
    expect(isMonevEmpty(summary({}))).toBe(true);
  });

  it('tidak kosong bila ada satu kegiatan walau anggaran & progres 0', () => {
    expect(isMonevEmpty(summary({ rencana: 1 }))).toBe(false);
  });
});

describe('statusSegments', () => {
  it('lebar potongan = porsi tiap status dari total kegiatan', () => {
    const segs = statusSegments(summary({ rencana: 1, berjalan: 2, selesai: 1 }));
    expect(segs.map((g) => [g.key, g.count, g.width])).toEqual([
      ['rencana', 1, 25],
      ['berjalan', 2, 50],
      ['selesai', 1, 25],
    ]);
  });

  it('"belum diisi" hanya muncul bila ada kegiatan tanpa status', () => {
    expect(statusSegments(summary({ selesai: 3 })).map((g) => g.key)).not.toContain('belumDiisi');
    const segs = statusSegments(summary({ selesai: 3, belumDiisi: 1 }));
    expect(segs.at(-1)).toMatchObject({ key: 'belumDiisi', count: 1, width: 25 });
  });

  it('total 0 tidak membagi dengan nol', () => {
    expect(statusSegments(summary({})).every((g) => g.width === 0)).toBe(true);
  });
});

describe('kegiatan per baris', () => {
  it('status tak dikenal / kosong → null', () => {
    expect(kegiatanStatus('berjalan')).toBe('berjalan');
    expect(kegiatanStatus(null)).toBeNull();
    expect(kegiatanStatus('batal')).toBeNull();
  });

  it('progres null tetap null (bukan 0%), nilai di luar 0–100 dijepit', () => {
    expect(kegiatanProgres(null)).toBeNull();
    expect(kegiatanProgres(undefined)).toBeNull();
    expect(kegiatanProgres(0)).toBe(0);
    expect(kegiatanProgres(130)).toBe(100);
    expect(kegiatanProgres(-5)).toBe(0);
  });

  it('meta = lokasi · sumber dana, bagian kosong dilewati', () => {
    expect(kegiatanMeta({ lokasi: 'Banjar Tengah', sumberDana: 'Dana Desa' })).toBe('Banjar Tengah · Sumber dana: Dana Desa');
    expect(kegiatanMeta({ lokasi: '  ', sumberDana: null })).toBe('');
    expect(kegiatanMeta({ lokasi: '', sumberDana: 'ADD' })).toBe('Sumber dana: ADD');
  });
});

describe('filter status', () => {
  it('opsi = Semua + Rencana/Berjalan/Selesai', () => {
    expect(FILTER_OPTIONS.map((o) => o.label)).toEqual(['Semua', 'Rencana', 'Berjalan', 'Selesai']);
  });

  it('"semua" atau nilai asing → query kosong; status valid diteruskan', () => {
    expect(statusQuery(FILTER_ALL)).toBe('');
    expect(statusQuery('xx')).toBe('');
    expect(statusQuery('selesai')).toBe('selesai');
  });
});
