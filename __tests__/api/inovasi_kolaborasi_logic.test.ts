// @vitest-environment node
// Kolaborasi Inovasi: pemetaan data API, saring tahun/kata kunci di klien, kelompok tahun, pil tahun, URL, pesan kosong.
import { describe, expect, it } from 'vitest';
import {
  emptyMessage,
  filterKolaborasi,
  groupByYear,
  isSlugLike,
  kolaborasiListHref,
  kolaborasiSearchable,
  parseTahun,
  sortKolaborasi,
  tahunTabs,
  toKolaborasi,
  type KolaborasiApiItem,
} from '@/app/(public)/(pages)/inovasi/kolaborasi-inovasi/_com/kolaborasi.logic';
import { toMitra } from '@/app/(public)/(pages)/inovasi/kolaborasi-inovasi/_com/mitra.logic';

const clean = (html: string) => `<!--clean-->${html}`; // test-only: penanda bahwa HTML lewat sanitize

// test-only: bentuk entri stg 2026-11-16 (dipangkas).
const api = (id: string, tahun: number | string | null, extra: Partial<KolaborasiApiItem> = {}): KolaborasiApiItem => ({
  id,
  name: ` Kolaborasi ${id} `,
  tahun,
  slug: 'Kolaborasi inovasi ekonomi & lingkungan',
  deskripsi: '<p>Program kerja sama dengan <strong>BUMDes</strong>.</p>',
  kolaborator: 'Universitas Warmadewa, Pengurus BUMDes Darmasaba',
  ...extra,
});
const item = (id: string, tahun: number | string | null, extra: Partial<KolaborasiApiItem> = {}) =>
  toKolaborasi(api(id, tahun, extra), clean);

describe('toKolaborasi', () => {
  it('memetakan judul, tahun, ringkasan, deskripsi tersaring, kolaborator', () => {
    const k = item('a', 2025);
    expect(k).toMatchObject({
      id: 'a',
      title: 'Kolaborasi a',
      year: 2025,
      summary: 'Kolaborasi inovasi ekonomi & lingkungan',
      html: '<!--clean--><p>Program kerja sama dengan <strong>BUMDes</strong>.</p>',
      partners: 'Universitas Warmadewa, Pengurus BUMDes Darmasaba',
    });
    expect(k.textLength).toBe('Program kerja sama dengan BUMDes.'.length);
  });

  it('ringkasan berpola slug URL disembunyikan (mitigasi sementara data stg "forum-inovasi-desa-tes")', () => {
    expect(item('a', 2026, { slug: 'forum-inovasi-desa-tes' }).summary).toBeUndefined();
    expect(item('a', 2026, { slug: 'Program kolaborasi penanggulangan rabies' }).summary).toBe(
      'Program kolaborasi penanggulangan rabies',
    );
  });

  it('field kosong → tidak ada (tanpa placeholder); deskripsi tersaring habis → tanpa html', () => {
    const k = toKolaborasi(api('a', null, { slug: '  ', deskripsi: '<p></p>', kolaborator: null }), () => '');
    expect(k.summary).toBeUndefined();
    expect(k.html).toBeUndefined();
    expect(k.partners).toBeUndefined();
    expect(k.year).toBeNull();
    expect(k.textLength).toBe(0);
  });

  it('tahun string dari API tetap terbaca', () => {
    expect(item('a', '2024').year).toBe(2024);
  });
});

describe('isSlugLike / parseTahun', () => {
  it('kebab-case huruf kecil dengan ≥ 1 tanda hubung = slug; kalimat atau satu kata bukan', () => {
    expect(isSlugLike('forum-inovasi-desa-tes')).toBe(true);
    expect(isSlugLike('eco-enzyme')).toBe(true);
    expect(isSlugLike('Eco-Enzyme untuk desa')).toBe(false);
    expect(isSlugLike('Kolaborasi')).toBe(false);
  });

  it('hanya bilangan bulat 4 digit', () => {
    expect(parseTahun('2025')).toBe(2025);
    expect(parseTahun(2026)).toBe(2026);
    for (const raw of [null, undefined, '', 'year:2025', '25', '2025.5', 'abc']) expect(parseTahun(raw)).toBeNull();
  });
});

describe('sortKolaborasi / filterKolaborasi / groupByYear', () => {
  const data = sortKolaborasi([item('a', 2025), item('b', 2026), item('c', null), item('d', 2025, { kolaborator: 'Sahabat Anti Rabies' })]);

  it('urut tahun terbaru, tanpa tahun di akhir, urutan API dalam tahun sama dipertahankan', () => {
    expect(data.map((k) => k.id)).toEqual(['b', 'a', 'd', 'c']);
  });

  it('saring tahun dan kata kunci (kolaborator ikut dicari, tidak peka huruf besar, semua kata harus cocok)', () => {
    expect(filterKolaborasi(data, { tahun: 2025, search: '' }).map((k) => k.id)).toEqual(['a', 'd']);
    expect(filterKolaborasi(data, { tahun: null, search: 'RABIES' }).map((k) => k.id)).toEqual(['d']);
    expect(filterKolaborasi(data, { tahun: null, search: 'sahabat bumdes' }).map((k) => k.id)).toEqual(['d']);
    expect(filterKolaborasi(data, { tahun: 2026, search: 'rabies' })).toEqual([]);
  });

  it('kelompok tahun berurutan', () => {
    expect(groupByYear(data).map((g) => [g.year, g.items.map((k) => k.id)])).toEqual([
      [2026, ['b']],
      [2025, ['a', 'd']],
      [null, ['c']],
    ]);
  });
});

describe('kolaborasiListHref / tahunTabs', () => {
  it('query kosong dan halaman 1 tidak ditulis', () => {
    expect(kolaborasiListHref()).toBe('/inovasi/kolaborasi-inovasi');
    expect(kolaborasiListHref({ tahun: 2025, search: ' rabies ', page: 2 })).toBe(
      '/inovasi/kolaborasi-inovasi?tahun=2025&search=rabies&page=2',
    );
    expect(kolaborasiListHref({ tahun: null, page: 1 })).toBe('/inovasi/kolaborasi-inovasi');
  });

  it('≥ 2 tahun → pil "Semua" + tahun terbaru dulu, membawa kata kunci, reset halaman', () => {
    const tabs = tahunTabs([item('a', 2025), item('b', 2026), item('c', 2025)], { tahun: 2025, search: 'desa' });
    expect(tabs).toEqual([
      { key: '', label: 'Semua', href: '/inovasi/kolaborasi-inovasi?search=desa', active: false },
      { key: '2026', label: '2026', href: '/inovasi/kolaborasi-inovasi?tahun=2026&search=desa', active: false },
      { key: '2025', label: '2025', href: '/inovasi/kolaborasi-inovasi?tahun=2025&search=desa', active: true },
    ]);
  });

  it('< 2 tahun tanpa filter → tanpa pil; tahun URL tak dikenal tetap diberi pil aktif', () => {
    expect(tahunTabs([item('a', 2025), item('b', 2025)], { tahun: null, search: '' })).toEqual([]);
    const tabs = tahunTabs([item('a', 2025)], { tahun: 2019, search: '' });
    expect(tabs.map((t) => [t.label, t.active])).toEqual([
      ['Semua', false],
      ['2025', false],
      ['2019', true],
    ]);
  });
});

describe('kolaborasiSearchable / emptyMessage / toMitra', () => {
  it('cari tampil bila > ambang atau kata kunci aktif; jumlah belum diketahui → sembunyi', () => {
    expect(kolaborasiSearchable('', 4, 6)).toBe(false);
    expect(kolaborasiSearchable('', 7, 6)).toBe(true);
    expect(kolaborasiSearchable('bajra', 4, 6)).toBe(true);
    expect(kolaborasiSearchable('', null, 6)).toBe(false);
  });

  it('pesan kosong membedakan galat, data kosong, tahun, dan cari', () => {
    expect(emptyMessage({ tahun: null, search: '' }, true)).toBe('Kolaborasi inovasi gagal dimuat. Coba muat ulang halaman.');
    expect(emptyMessage({ tahun: null, search: '' }, false)).toBe('Belum ada kolaborasi inovasi.');
    expect(emptyMessage({ tahun: 2019, search: '' }, false)).toBe('Belum ada kolaborasi inovasi pada tahun 2019.');
    expect(emptyMessage({ tahun: null, search: 'x' }, false)).toBe('Tidak ada kolaborasi inovasi yang cocok dengan “x”.');
    expect(emptyMessage({ tahun: 2025, search: 'x' }, false)).toBe(
      'Tidak ada kolaborasi inovasi tahun 2025 yang cocok dengan “x”.',
    );
  });

  it('mitra: nama dirapikan, tanpa logo → logoUrl tidak ada', () => {
    expect(toMitra({ id: 'm1', name: ' BRI Peduli ', image: { link: '/api/img/a-mobile.webp' } })).toEqual({
      id: 'm1',
      name: 'BRI Peduli',
      logoUrl: '/api/img/a-mobile.webp',
    });
    expect(toMitra({ id: 'm2', name: 'TP Posyandu', image: null }).logoUrl).toBeUndefined();
  });
});
