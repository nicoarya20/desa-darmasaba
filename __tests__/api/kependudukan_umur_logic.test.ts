// @vitest-environment node
// Dashboard Kependudukan #umur: parser rentang, urutan umur, deteksi tumpang tindih, angka turunan bersyarat.
import { describe, expect, it } from 'vitest';
import {
  findUmurIssue,
  formatDesimal,
  parseRentang,
  parseUmurRows,
  rentangLabel,
  summarizeUmur,
  umurTurunan,
} from '@/app/(public)/(pages)/kependudukan/_com/umur/umur.logic';

const row = (id: string, rentangUmur: string, jumlah: unknown, extra: Record<string, unknown> = {}) => ({
  id,
  rentangUmur,
  jumlah,
  tahun: 2026,
  updatedAt: '2026-11-03T06:45:42.000Z',
  ...extra,
});

// test-only: isian seed / stg 2026-11-17 (skema BPS, saling lepas).
const BPS = [row('a', '25-54', 1680), row('b', '0-14', 820), row('c', '65+', 545), row('d', '15-24', 650), row('e', '55-64', 520)];
// test-only: stg 2026 sebenarnya, + "6-12" isian admin yang tumpang tindih dengan "0-14".
const STG_2026 = [...BPS, row('f', '6-12', 90)];

describe('parseRentang', () => {
  it.each([
    ['0-14', { lo: 0, hi: 14 }],
    [' 0 – 14 tahun ', { lo: 0, hi: 14 }],
    ['15 s.d. 24', { lo: 15, hi: 24 }],
    ['65+', { lo: 65, hi: null }],
    ['65+ tahun', { lo: 65, hi: null }],
    ['65 tahun ke atas', { lo: 65, hi: null }],
  ])('%s', (input, expected) => {
    expect(parseRentang(input)).toEqual(expected);
  });

  it.each(['', 'balita', '<1', '14-0', '65-'])('tak terbaca: %j → null', (input) => {
    expect(parseRentang(input)).toBeNull();
  });
});

describe('rentangLabel', () => {
  it('rentang tertutup pakai en dash + "tahun", terbuka "ke atas", tak terbaca apa adanya', () => {
    expect(rentangLabel('0-14', { lo: 0, hi: 14 })).toBe('0–14 tahun');
    expect(rentangLabel('65+', { lo: 65, hi: null })).toBe('65 tahun ke atas');
    expect(rentangLabel(' Balita ', null)).toBe('Balita');
  });
});

describe('parseUmurRows', () => {
  it('urut umur (bukan urutan API), label manusiawi', () => {
    expect(parseUmurRows(BPS).map((r) => r.label)).toEqual([
      '0–14 tahun',
      '15–24 tahun',
      '25–54 tahun',
      '55–64 tahun',
      '65 tahun ke atas',
    ]);
  });

  it('kelompok berbatas bawah sama: yang lebih sempit dulu; tak terbaca di akhir', () => {
    const out = parseUmurRows([row('x', 'Lansia', 5), row('o', '0-14', 1), row('p', '0-5', 2), row('q', '6-12', 3)]);
    expect(out.map((r) => r.id)).toEqual(['p', 'o', 'q', 'x']);
  });

  it('buang baris tanpa id/rentang atau bukan objek; jumlah tak terbaca → null, bukan 0', () => {
    const out = parseUmurRows([null, 'x', { id: 1, rentangUmur: '0-14', jumlah: 3 }, row('k', '  ', 4), row('n', '0-14', 'banyak')]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ id: 'n', value: null });
  });

  it('updatedAt string (fetch) maupun Date (ApiFetch/Eden) dipertahankan', () => {
    const d = new Date('2026-11-03T06:45:42.000Z');
    expect(parseUmurRows([row('s', '0-14', 1)])[0].updatedAt).toBe('2026-11-03T06:45:42.000Z');
    expect(parseUmurRows([row('t', '0-14', 1, { updatedAt: d })])[0].updatedAt).toBe(d);
    expect(parseUmurRows([row('u', '0-14', 1, { updatedAt: 123 })])[0].updatedAt).toBeNull();
  });

  it('jumlah string bertitik ribuan dibaca', () => {
    expect(parseUmurRows([row('s', '25-54', '1.680')])[0].value).toBe(1680);
  });
});

describe('findUmurIssue', () => {
  it('skema BPS saling lepas → null', () => {
    expect(findUmurIssue(parseUmurRows(BPS))).toBeNull();
  });

  it('stg 2026: 0–14 dan 6–12 tumpang tindih', () => {
    expect(findUmurIssue(parseUmurRows(STG_2026))).toEqual({ kind: 'tumpangTindih', a: '0–14 tahun', b: '6–12 tahun' });
  });

  it('opsi form admin 56-65 dan 65+ bertumpuk di umur 65', () => {
    expect(findUmurIssue(parseUmurRows([row('a', '56-65', 1), row('b', '65+', 2)]))).toMatchObject({ kind: 'tumpangTindih' });
  });

  it('label ganda di tahun sama = tumpang tindih', () => {
    expect(findUmurIssue(parseUmurRows([row('a', '65+', 230), row('b', '65+', 545)]))).toMatchObject({ kind: 'tumpangTindih' });
  });

  it('rentang tak terbaca dilaporkan lebih dulu', () => {
    expect(findUmurIssue(parseUmurRows([row('a', '0-14', 1), row('b', 'Lansia', 2)]))).toEqual({ kind: 'takTerbaca', label: 'Lansia' });
  });
});

describe('summarizeUmur', () => {
  it('BPS: total 4.215, persen asli, urutan umur dipertahankan', () => {
    const { summary, issue } = summarizeUmur(parseUmurRows(BPS));
    expect(issue).toBeNull();
    expect(summary.total).toBe(4215);
    expect(summary.rows[0].label).toBe('0–14 tahun');
    expect(summary.rows[2].share).toBeCloseTo(39.86, 2);
    expect(summary.rows[2].width).toBe(100);
  });
});

describe('umurTurunan', () => {
  it('BPS: produktif 2.850 (67,6%), rasio ketergantungan 47,9', () => {
    const t = umurTurunan(parseUmurRows(BPS))!;
    expect(t).toMatchObject({ anak: 820, produktif: 2850, lansia: 545, total: 4215 });
    expect(t.persenProduktif).toBeCloseTo(67.62, 2);
    expect(formatDesimal(t.rasio)).toBe('47,9');
  });

  it('tumpang tindih → null', () => {
    expect(umurTurunan(parseUmurRows(STG_2026))).toBeNull();
  });

  it('skema form admin (13–17 melintasi 15) → null', () => {
    const admin = ['0-5', '6-12', '13-17', '18-25', '26-35', '36-45', '46-55', '56-64', '65+'].map((r, i) => row(String(i), r, 10));
    expect(umurTurunan(parseUmurRows(admin))).toBeNull();
  });

  it('celah antar kelompok (15–24 hilang) → null', () => {
    expect(umurTurunan(parseUmurRows(BPS.filter((r) => r.id !== 'd')))).toBeNull();
  });

  it('tidak mulai dari 0 atau tanpa kelompok terbuka → null', () => {
    expect(umurTurunan(parseUmurRows(BPS.filter((r) => r.id !== 'b')))).toBeNull();
    expect(umurTurunan(parseUmurRows(BPS.filter((r) => r.id !== 'c')))).toBeNull();
  });

  it('ada kelompok belum diisi → null', () => {
    expect(umurTurunan(parseUmurRows([...BPS.filter((r) => r.id !== 'e'), row('e', '55-64', null)]))).toBeNull();
  });

  it('kelompok lebih rinci tetap boleh selama batas 15 & 65 ada', () => {
    const rinci = ['0-4', '5-14', '15-39', '40-64', '65-74', '75+'].map((r, i) => row(String(i), r, 100));
    expect(umurTurunan(parseUmurRows(rinci))).toMatchObject({ anak: 200, produktif: 200, lansia: 200, rasio: 200 });
  });

  it('usia produktif 0 → null (tak bisa dibagi)', () => {
    expect(umurTurunan(parseUmurRows([row('a', '0-14', 5), row('b', '15-64', 0), row('c', '65+', 1)]))).toBeNull();
  });

  it('kosong → null', () => {
    expect(umurTurunan([])).toBeNull();
  });
});
