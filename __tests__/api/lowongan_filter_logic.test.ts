// @vitest-environment node
// Daftar lowongan publik: params URL (bolak-balik, nilai tak dikenal), facet, saring, urut, chip, tampilan gabungan.
import { describe, expect, it } from 'vitest';

import {
  activeChips,
  filterLowongan,
  gajiMinLabel,
  lowonganFacets,
  resolveParams,
  sortLowongan,
  tayangSinceMs,
  urutOptions,
  visibleFixed,
} from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/lowongan-filter.logic';
import {
  GAJI_MIN_OPTIONS,
  LOWONGAN_LIST_LIMIT,
  LOWONGAN_URUT,
  TAYANG_HARI_OPTIONS,
} from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/lowongan-filter.meta';
import {
  clearAll,
  clearFilters,
  countActiveFilters,
  emptyParams,
  lowonganListHref,
  parseLowonganParams,
  toggleKey,
  toggleSingle,
  type LowonganParams,
} from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/lowongan-params.logic';
import { buildLowonganView } from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/lowongan-view.logic';
import type { Lowongan } from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/lowongan.types';

const BASE = '/ekonomi/lowongan-kerja-lokal';
const DAY = 86_400_000;
// test-only: waktu acuan tetap, 14 November 2026 12.00 WITA.
const NOW = Date.UTC(2026, 10, 14, 4, 0, 0);

const job = (id: string, over: Partial<Lowongan> = {}): Lowongan => ({
  id,
  posisi: `Posisi ${id}`,
  pemberiKerja: 'Warung Bu Made',
  pemberiKey: 'warung bu made',
  tipe: 'Full Time',
  tipeKey: 'full time',
  lokasi: 'Jl. Raya Darmasaba',
  gaji: 2_500_000,
  ringkasan: '',
  tayangMs: NOW - DAY,
  ...over,
});

// test-only: 7 lowongan meniru data stg (Full Time ×5, Freelance, Menjaga Toko; gaji campur; tanggal lama dan baru).
const data: Lowongan[] = [
  job('a', { posisi: 'Barista', gaji: 2_500_000, tayangMs: NOW - 1 * DAY }),
  job('b', { posisi: 'Kasir', gaji: 2_000_000, tayangMs: NOW - 3 * DAY, pemberiKerja: 'Toko Sari', pemberiKey: 'toko sari' }),
  job('c', { posisi: 'Admin', gaji: null, tayangMs: NOW - 10 * DAY, tipe: 'full time', pemberiKerja: 'CV. Maju, Jaya', pemberiKey: 'cv. maju, jaya' }),
  job('d', { posisi: 'Desainer', gaji: 5_000_000, tayangMs: NOW - 40 * DAY, tipe: 'Freelance', tipeKey: 'freelance' }),
  job('e', { posisi: 'Penjaga', gaji: 1_500_000, tayangMs: NOW - 120 * DAY, tipe: 'Menjaga Toko', tipeKey: 'menjaga toko', pemberiKerja: 'Toko Sari', pemberiKey: 'toko sari' }),
  job('f', { posisi: 'Koki', gaji: 2_500_000, tayangMs: NOW - 2 * DAY, lokasi: null }),
  job('g', { posisi: 'Pramusaji', gaji: 2_000_000, tayangMs: 0, tipe: null, tipeKey: null }),
];
const ids = (items: readonly Lowongan[]) => items.map((l) => l.id).join('');
const params = (over: Partial<LowonganParams> = {}): LowonganParams => ({ ...emptyParams(), ...over });
const read = (href: string) => parseLowonganParams(new URLSearchParams(href.split('?')[1] ?? ''));

describe('params URL', () => {
  it('bawaan → URL polos; nilai bawaan tidak ditulis', () => {
    expect(lowonganListHref(emptyParams())).toBe(BASE);
    expect(lowonganListHref(params({ urut: 'terbaru' }))).toBe(BASE);
    expect(read(BASE)).toEqual(emptyParams());
  });

  it('semua nilai ditulis berurutan dan terbaca kembali sama persis', () => {
    const p = params({ q: 'kasir toko', tipe: ['full time', 'freelance'], pemberi: ['toko sari'], gaji: 2_000_000, tayang: 30, urut: 'gaji-desc' });
    const href = lowonganListHref(p);
    expect(href).toBe(`${BASE}?q=kasir%20toko&tipe=full%20time,freelance&pemberi=toko%20sari&gaji=2000000&tayang=30&urut=gaji-desc`);
    expect(read(href)).toEqual(p);
  });

  it('kunci yang memuat koma, persen, atau ampersand tetap satu kunci setelah bolak-balik', () => {
    const p = params({ pemberi: ['cv. maju, jaya', 'diskon 50% & co', 'a%2Cb'] });
    const href = lowonganListHref(p);
    expect(href).toContain('pemberi=cv.%20maju%252C%20jaya,');
    expect(read(href)).toEqual(p);
  });

  it('nilai tak dikenal diabaikan; kunci kosong dan ganda dibuang', () => {
    const p = read(`${BASE}?gaji=1234567&tayang=14&urut=nama&tipe=full%20time,,full%20time,%20&q=%20%20barista%20`);
    expect(p).toEqual(params({ q: 'barista', tipe: ['full time'] }));
    expect(read(`${BASE}?gaji=2jt&tayang=-7`)).toEqual(emptyParams());
    expect(read(`${BASE}?gaji=3000000&tayang=90&urut=gaji-asc`)).toEqual(params({ gaji: 3_000_000, tayang: 90, urut: 'gaji-asc' }));
  });

  it('hapus filter mempertahankan kata kunci dan urutan; hapus semua ikut membuang kata kunci', () => {
    const p = params({ q: 'kasir', tipe: ['freelance'], gaji: 2_000_000, urut: 'gaji-asc' });
    expect(clearFilters(p)).toEqual(params({ q: 'kasir', urut: 'gaji-asc' }));
    expect(clearAll(p)).toEqual(params({ urut: 'gaji-asc' }));
  });

  it('hitung filter aktif, pilih/lepas kunci dan pilihan tunggal', () => {
    expect(countActiveFilters(emptyParams())).toBe(0);
    expect(countActiveFilters(params({ q: 'x', tipe: ['a', 'b'], pemberi: ['c'], gaji: 2_000_000, tayang: 7 }))).toBe(5);
    expect(toggleKey(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleKey(['a', 'b'], 'a')).toEqual(['b']);
    expect(toggleSingle(null, 7)).toBe(7);
    expect(toggleSingle(30, 7)).toBe(7);
    expect(toggleSingle(7, 7)).toBeNull();
  });

  it('konstanta: batas muat 100, urutan bawaan terbaru', () => {
    expect(LOWONGAN_LIST_LIMIT).toBe(100);
    expect(LOWONGAN_URUT[0]).toBe('terbaru');
    expect(urutOptions()).toEqual([
      { value: 'terbaru', label: 'Terbaru' },
      { value: 'gaji-desc', label: 'Gaji tertinggi' },
      { value: 'gaji-asc', label: 'Gaji terendah' },
    ]);
  });
});

describe('facet', () => {
  const facets = lowonganFacets(data, NOW);

  it('tipe: dikelompokkan per kunci, label tulisan pertama, urut jumlah terbanyak lalu nama; tipe kosong dilewati', () => {
    expect(facets.tipe).toEqual([
      { key: 'full time', label: 'Full Time', count: 4 },
      { key: 'freelance', label: 'Freelance', count: 1 },
      { key: 'menjaga toko', label: 'Menjaga Toko', count: 1 },
    ]);
  });

  it('pemberi kerja: urut nama, jumlah dari seluruh data', () => {
    expect(facets.pemberi).toEqual([
      { key: 'cv. maju, jaya', label: 'CV. Maju, Jaya', count: 1 },
      { key: 'toko sari', label: 'Toko Sari', count: 2 },
      { key: 'warung bu made', label: 'Warung Bu Made', count: 4 },
    ]);
  });

  it('gaji: jumlah lowongan dengan gaji ≥ ambang (tanpa gaji tidak dihitung) + label juta', () => {
    expect(facets.gaji.map((o) => [o.label, o.count])).toEqual([
      ['Minimal Rp1,5 juta', 6],
      ['Minimal Rp2 juta', 5],
      ['Minimal Rp2,5 juta', 3],
      ['Minimal Rp3 juta', 1],
      ['Minimal Rp4 juta', 1],
      ['Minimal Rp5 juta', 1],
    ]);
    expect(GAJI_MIN_OPTIONS.map(gajiMinLabel)).toContain('Minimal Rp2,5 juta');
  });

  it('waktu tayang: jumlah dalam N hari dari nowMs; tanggal tak terbaca (0) tidak dihitung', () => {
    expect(facets.tayang).toEqual([
      { value: 7, label: '7 hari terakhir', count: 3 },
      { value: 30, label: '30 hari terakhir', count: 4 },
      { value: 90, label: '3 bulan terakhir', count: 5 },
    ]);
    expect(TAYANG_HARI_OPTIONS).toEqual([7, 30, 90]);
  });

  it('batas hari: tepat N hari lalu masih masuk, 1 ms lebih lama tidak', () => {
    expect(tayangSinceMs(7, NOW)).toBe(NOW - 7 * DAY);
    const edge = [job('tepat', { tayangMs: NOW - 7 * DAY }), job('lewat', { tayangMs: NOW - 7 * DAY - 1 })];
    expect(lowonganFacets(edge, NOW).tayang[0].count).toBe(1);
    expect(ids(filterLowongan(edge, params({ tayang: 7 }), NOW))).toBe('tepat');
    expect(ids(filterLowongan(edge, params({ tayang: 7 }), NOW + 1))).toBe('');
  });

  it('pilihan daftar tetap berjumlah 0 disembunyikan kecuali sedang terpilih', () => {
    const murah = lowonganFacets([job('x', { gaji: 2_000_000 })], NOW).gaji;
    expect(visibleFixed(murah, null).map((o) => o.value)).toEqual([1_500_000, 2_000_000]);
    expect(visibleFixed(murah, 4_000_000).map((o) => o.value)).toEqual([1_500_000, 2_000_000, 4_000_000]);
    expect(visibleFixed(lowonganFacets([job('y', { gaji: null })], NOW).gaji, null)).toEqual([]);
  });

  it('kunci URL yang tidak ada di data dibuang', () => {
    const p = resolveParams(params({ tipe: ['freelance', 'magang'], pemberi: ['asing'], gaji: 2_000_000 }), facets);
    expect(p).toEqual(params({ tipe: ['freelance'], pemberi: [], gaji: 2_000_000 }));
  });
});

describe('saring', () => {
  const pick = (over: Partial<LowonganParams>) => ids(filterLowongan(data, params(over), NOW));

  it('tanpa filter → semua', () => {
    expect(pick({})).toBe('abcdefg');
  });

  it('kata kunci: posisi, pemberi kerja, lokasi, tipe; tanpa beda huruf besar', () => {
    expect(pick({ q: 'BARISTA' })).toBe('a');
    expect(pick({ q: 'toko sari' })).toBe('be');
    expect(pick({ q: 'raya darmasaba' })).toBe('abcdeg');
    expect(pick({ q: 'freelance' })).toBe('d');
    expect(pick({ q: 'tidak ada' })).toBe('');
  });

  it('tipe dan pemberi kerja banyak pilihan (ATAU di dalam grup)', () => {
    expect(pick({ tipe: ['freelance', 'menjaga toko'] })).toBe('de');
    expect(pick({ tipe: ['full time'] })).toBe('abcf');
    expect(pick({ pemberi: ['toko sari', 'cv. maju, jaya'] })).toBe('bce');
  });

  it('gaji minimal membuang lowongan tanpa gaji; waktu tayang membuang tanggal tak terbaca', () => {
    expect(pick({ gaji: 2_500_000 })).toBe('adf');
    expect(pick({ gaji: 1_500_000 })).toBe('abdefg');
    expect(pick({ tayang: 7 })).toBe('abf');
    expect(pick({ tayang: 90 })).toBe('abcdf');
  });

  it('gabungan filter (DAN antar grup)', () => {
    expect(pick({ tipe: ['full time'], gaji: 2_000_000, tayang: 7 })).toBe('abf');
    expect(pick({ tipe: ['full time'], pemberi: ['toko sari'], gaji: 2_500_000 })).toBe('');
    expect(pick({ q: 'toko', pemberi: ['toko sari'], gaji: 2_000_000 })).toBe('b');
  });
});

describe('urut', () => {
  it('terbaru: waktu tayang menurun, tanggal tak terbaca di akhir', () => {
    expect(ids(sortLowongan(data, 'terbaru'))).toBe('afbcdeg');
  });

  it('gaji tertinggi: tanpa gaji di akhir, seri → terbaru dulu', () => {
    expect(ids(sortLowongan(data, 'gaji-desc'))).toBe('dafbgec');
  });

  it('gaji terendah: tanpa gaji tetap di akhir, seri → terbaru dulu', () => {
    expect(ids(sortLowongan(data, 'gaji-asc'))).toBe('ebgafdc');
  });

  it('tidak mengubah larik asal', () => {
    const before = ids(data);
    sortLowongan(data, 'gaji-asc');
    expect(ids(data)).toBe(before);
  });
});

describe('chip dan tampilan', () => {
  const facets = lowonganFacets(data, NOW);

  it('chip mengikuti urutan panel, berlabel dari data, dan tahu params setelah dihapus', () => {
    const p = params({ q: 'x', tipe: ['freelance'], pemberi: ['toko sari'], gaji: 2_000_000, tayang: 30 });
    const chips = activeChips(p, facets);
    expect(chips.map((c) => [c.group, c.label])).toEqual([
      ['tipe', 'Freelance'],
      ['gaji', 'Minimal Rp2 juta'],
      ['pemberi', 'Toko Sari'],
      ['tayang', '30 hari terakhir'],
    ]);
    expect(chips[0].next).toEqual({ ...p, tipe: [] });
    expect(chips[1].next).toEqual({ ...p, gaji: null });
    expect(chips[2].next).toEqual({ ...p, pemberi: [] });
    expect(chips[3].next).toEqual({ ...p, tayang: null });
    expect(new Set(chips.map((c) => c.key)).size).toBe(4);
    expect(activeChips(emptyParams('kata kunci'), facets)).toEqual([]);
  });

  it('tampilan: kunci tak dikenal dibuang sebelum menyaring, hasil terurut, jumlah dan chip sesuai', () => {
    const view = buildLowonganView(data, params({ tipe: ['full time', 'magang'], urut: 'gaji-asc' }), NOW);
    expect(view.params.tipe).toEqual(['full time']);
    expect(ids(view.items)).toBe('bafc');
    expect(view.total).toBe(7);
    expect(view.activeCount).toBe(1);
    expect(view.chips.map((c) => c.label)).toEqual(['Full Time']);
  });

  it('tampilan data kosong: tanpa pilihan, tanpa hasil', () => {
    const view = buildLowonganView([], params({ tipe: ['full time'] }), NOW);
    expect(view.items).toEqual([]);
    expect(view.total).toBe(0);
    expect(view.activeCount).toBe(0);
    expect(view.facets.tipe).toEqual([]);
  });
});
