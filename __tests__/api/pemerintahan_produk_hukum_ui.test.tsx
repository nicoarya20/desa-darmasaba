// @vitest-environment node
// Produk Hukum (Pemerintahan) publik: logika URL/tabel, pemuat data, dan markup SSR untuk tiap keadaan (baris dengan
// Lihat + Unduh, tanpa berkas tanpa tombol, kosong per filter, gagal, memuat, kepala dengan pil kategori). jsdom
// gagal start di repo ini → renderToStaticMarkup; klik/ketik tidak teruji.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { api, searchParams } = vi.hoisted(() => ({ api: { findMany: vi.fn() }, searchParams: { value: '' } }));
vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(searchParams.value),
  useRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
  // KabarListHeader: pil ?kategori= di path yang sama → next/link tanpa transisi.
  usePathname: () => '/pemerintahan/produk-hukum',
}));
vi.mock('@/lib/api-fetch', () => ({
  default: { api: { desa: { produkhukum: { 'find-many': { get: api.findMany } } } } },
}));

import { ProdukHukumBody } from '@/app/(public)/(pages)/pemerintahan/produk-hukum/_com/ProdukHukumBody';
import { ProdukHukumPage } from '@/app/(public)/(pages)/pemerintahan/produk-hukum/_com/ProdukHukumPage';
import {
  formatTahun,
  parseKategoriParam,
  produkHukumEmptyMessage,
  produkHukumHref,
  produkHukumTabs,
  rowNumber,
} from '@/app/(public)/(pages)/pemerintahan/produk-hukum/_com/produk-hukum.logic';
import { loadProdukHukum } from '@/app/(public)/(pages)/pemerintahan/produk-hukum/_com/produk-hukum.source';
import { PRODUK_HUKUM_TEXT as T } from '@/app/(public)/(pages)/pemerintahan/produk-hukum/_com/produk-hukum.text';
import type { ProdukHukumListState } from '@/app/(public)/(pages)/pemerintahan/produk-hukum/_com/use-produk-hukum';
import type { ProdukHukumRecord } from '@/lib/produk-hukum';

const render = (ui: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const anchors = (html: string) => [...html.matchAll(/<a [^>]*>/g)].map((m) => m[0]);

// test-only: baris dan berkas rekaan.
const FILE = { id: 'f-1', link: '/api/fileStorage/findUnique/perdes-9.pdf', realName: 'perdes-9-asli.pdf' };
const ROWS: ProdukHukumRecord[] = [
  { id: 'a', judul: 'Perdes Uji tentang APBDes', nomor: 'Nomor 9 Tahun 2021', tahun: 2021, kategori: 'PERDES', file: FILE },
  { id: 'b', judul: 'SK Perbekel Uji', nomor: null, tahun: null, kategori: 'SK_PERBEKEL', file: null },
];
const ready = (
  items: ProdukHukumRecord[],
  extra: Partial<{ total: number; totalPages: number; page: number; refreshing: boolean }> = {},
): ProdukHukumListState => ({
  status: 'ready',
  items,
  total: items.length,
  totalPages: 1,
  page: 1,
  refreshing: false,
  ...extra,
});
const NO_FILTER = { kategori: '', search: '', page: 1 } as const;
const body = (state: ProdukHukumListState, filter: Parameters<typeof ProdukHukumBody>[0]['filter'] = NO_FILTER) =>
  render(<ProdukHukumBody state={state} filter={filter} limit={10} onPage={() => {}} />);

beforeEach(() => {
  vi.resetAllMocks();
  searchParams.value = '';
});

describe('logika URL dan tabel', () => {
  it('parseKategoriParam hanya menerima kategori sah, selain itu semua', () => {
    expect(parseKategoriParam('SK_PERBEKEL')).toBe('SK_PERBEKEL');
    for (const raw of ['sk_perbekel', 'UU', '', null, undefined]) expect(parseKategoriParam(raw)).toBe('');
  });

  it('produkHukumHref menulis hanya nilai bukan bawaan', () => {
    expect(produkHukumHref()).toBe('/pemerintahan/produk-hukum');
    expect(produkHukumHref({ kategori: 'PERDES', search: ' apbdes ', page: 2 })).toBe(
      '/pemerintahan/produk-hukum?kategori=PERDES&search=apbdes&page=2',
    );
    expect(produkHukumHref({ kategori: '', search: '', page: 1 })).toBe('/pemerintahan/produk-hukum');
  });

  it('produkHukumTabs: Semua + 4 kategori, satu aktif, kata kunci terbawa, halaman kembali ke 1', () => {
    const tabs = produkHukumTabs('PERDES', 'apbdes');
    expect(tabs.map((t) => t.label)).toEqual(['Semua', 'Peraturan Desa (Perdes)', 'Peraturan Perbekel', 'SK Perbekel', 'Lainnya']);
    expect(tabs.filter((t) => t.active).map((t) => t.key)).toEqual(['PERDES']);
    expect(tabs[0].href).toBe('/pemerintahan/produk-hukum?search=apbdes');
    expect(tabs[3].href).toBe('/pemerintahan/produk-hukum?kategori=SK_PERBEKEL&search=apbdes');
    expect(produkHukumTabs('', '').find((t) => t.active)?.label).toBe('Semua');
  });

  it('nomor urut menyambung antarhalaman; tahun kosong jadi tanda "-"', () => {
    expect([0, 1, 9].map((i) => rowNumber(1, 10, i))).toEqual([1, 2, 10]);
    expect(rowNumber(3, 10, 0)).toBe(21);
    expect(formatTahun(2021)).toBe('2021');
    expect(formatTahun(null)).toBe('-');
  });

  it('pesan kosong menurut filter: kata kunci > kategori > tanpa filter', () => {
    expect(produkHukumEmptyMessage({ kategori: 'PERDES', search: 'abc' })).toBe(T.emptySearch('abc'));
    expect(produkHukumEmptyMessage({ kategori: 'SK_PERBEKEL', search: '' })).toBe('Belum ada produk hukum di kategori SK Perbekel.');
    expect(produkHukumEmptyMessage({ kategori: '', search: '' })).toBe('Belum ada produk hukum.');
  });
});

describe('loadProdukHukum', () => {
  it('mengirim page/limit, kategori dan q hanya bila terisi, lalu mengembalikan baris + total', async () => {
    api.findMany.mockResolvedValue({ status: 200, data: { success: true, data: ROWS, total: 12, totalPages: 2 } });
    const hasil = await loadProdukHukum({ page: 2, limit: 10, kategori: 'PERDES', search: 'apbdes' });
    expect(api.findMany).toHaveBeenCalledWith({ query: { page: 2, limit: 10, kategori: 'PERDES', q: 'apbdes' } });
    expect(hasil).toEqual({ items: ROWS, total: 12, totalPages: 2 });
    await loadProdukHukum({ page: 1, limit: 10, kategori: '', search: '' });
    expect(api.findMany).toHaveBeenLastCalledWith({ query: { page: 1, limit: 10 } });
  });

  it('respons gagal → Error berkonteks (status + pesan API)', async () => {
    api.findMany.mockResolvedValue({ status: 500, data: { success: false, message: 'db down' } });
    await expect(loadProdukHukum({ page: 1, limit: 10, kategori: '', search: '' })).rejects.toThrow(
      'find-many produk hukum gagal (HTTP 500): db down',
    );
  });
});

describe('ProdukHukumBody', () => {
  it('baris: No, judul + nomor, tahun, label kategori, dan kolom File', () => {
    const html = body(ready(ROWS));
    for (const head of [T.colNo, T.colNama, T.colTahun, T.colKategori, T.colFile]) expect(html).toContain(`>${head}</th>`);
    expect(html).toContain('Perdes Uji tentang APBDes');
    expect(html).toContain('Nomor 9 Tahun 2021');
    expect(html).toContain('>2021<');
    expect(html).toContain('Peraturan Desa (Perdes)');
    expect(html).toContain('SK Perbekel');
    expect(html.indexOf('Perdes Uji')).toBeLessThan(html.indexOf('SK Perbekel Uji'));
  });

  it('Lihat membuka tab baru, Unduh memakai atribut download; tiap tautan punya aria-label berjudul', () => {
    const html = body(ready([ROWS[0]]));
    const [lihat, unduh] = anchors(html);
    expect(anchors(html)).toHaveLength(2);
    expect(lihat).toContain(`href="${FILE.link}"`);
    expect(lihat).toContain('target="_blank"');
    expect(lihat).toContain('rel="noopener noreferrer"');
    expect(lihat).toContain(`aria-label="${T.lihatLabel(ROWS[0].judul)}"`);
    expect(unduh).toContain(`href="${FILE.link}"`);
    expect(unduh).toContain(`download="${FILE.realName}"`);
    expect(unduh).not.toContain('target=');
    expect(html).toContain('>Lihat<');
    expect(html).toContain('>Unduh<');
  });

  it('tanpa berkas: tidak ada tombol Lihat/Unduh, tahun kosong "-"; baris lain tetap punya tombol', () => {
    const tanpa = body(ready([ROWS[1]]));
    expect(anchors(tanpa)).toHaveLength(0);
    expect(tanpa).not.toContain('>Lihat<');
    expect(tanpa).not.toContain('>Unduh<');
    expect(tanpa).toContain(T.fileKosong);
    expect(tanpa).toContain('data-label="Tahun">-<');
    expect(anchors(body(ready(ROWS)))).toHaveLength(2);
  });

  it('nomor urut ikut halaman: halaman 3 dimulai dari 21', () => {
    const html = body(ready([ROWS[0]], { total: 25, totalPages: 3, page: 3 }), { kategori: '', search: '', page: 3 });
    expect(html).toContain('>21<');
  });

  it('pindah halaman sedang dimuat → baris lama tetap tampil (aria-busy) dengan nomor urut halaman asalnya', () => {
    const html = body(ready([ROWS[0]], { total: 25, totalPages: 3, page: 1, refreshing: true }), { kategori: '', search: '', page: 3 });
    expect(html).toMatch(/<div class="[^"]+" aria-busy="true">/);
    expect(html).toContain('Perdes Uji tentang APBDes');
    expect(html).toContain('>1<');
    expect(html).not.toContain('>21<');
    expect(html).not.toContain(T.loading);
  });

  it('paginasi hanya muncul bila lebih dari satu halaman', () => {
    expect(body(ready(ROWS))).not.toContain(T.paginationLabel);
    expect(body(ready(ROWS, { total: 25, totalPages: 3 }))).toContain(`aria-label="${T.paginationLabel}"`);
  });

  it('kosong tanpa filter, per kategori, dan per kata kunci memakai kalimat berbeda', () => {
    expect(body(ready([]))).toContain('Belum ada produk hukum.');
    expect(body(ready([]), { kategori: 'LAINNYA', search: '', page: 1 })).toContain('Belum ada produk hukum di kategori Lainnya.');
    expect(body(ready([]), { kategori: '', search: 'zzz', page: 1 })).toContain('Tidak ada produk hukum yang cocok dengan');
    expect(anchors(body(ready([])))).toHaveLength(0);
  });

  it('gagal: kalimat berbeda dengan role="alert", tanpa tabel', () => {
    const html = body({ status: 'error' });
    expect(html).toContain('role="alert"');
    expect(html).toContain(T.failed);
    expect(html).not.toContain('<table');
  });

  it('memuat: kerangka aria-busy, tanpa tabel dan tanpa pesan kosong', () => {
    const html = body({ status: 'loading' });
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain('<table');
    expect(html).not.toContain('Belum ada produk hukum');
  });
});

describe('ProdukHukumPage (render awal)', () => {
  it('kepala: judul, pil kategori dengan tautan ?kategori=, pil dari URL aktif; kolom cari tersembunyi saat belum ada data', () => {
    searchParams.value = 'kategori=SK_PERBEKEL';
    const html = render(<ProdukHukumPage />);
    expect(html).toContain('>Produk Hukum</h1>');
    expect(html).toContain('href="/pemerintahan/produk-hukum?kategori=PERDES"');
    // Urutan atribut tidak dikunci: pil query-saja dirender next/link (aria-current sebelum href).
    expect(html.match(/<a[^>]*href="\/pemerintahan\/produk-hukum\?kategori=SK_PERBEKEL"[^>]*>/)?.[0]).toContain('aria-current="page"');
    expect(html).not.toContain('role="search"');
    expect(html).toContain('aria-busy="true"');
  });

  it('kata kunci di URL menampilkan kolom cari terisi dan terbawa ke pil', () => {
    searchParams.value = 'search=apbdes';
    const html = render(<ProdukHukumPage />);
    expect(html).toContain('role="search"');
    expect(html).toContain('value="apbdes"');
    expect(html).toContain('href="/pemerintahan/produk-hukum?kategori=PERDES&amp;search=apbdes"');
  });
});
