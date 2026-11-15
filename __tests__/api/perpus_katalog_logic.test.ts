// @vitest-environment node
// Katalog Perpustakaan Digital publik (fungsi murni): slug kategori (termasuk tautan lama), pil, saring, cari,
// urut, URL daftar/detail, dan rel "Buku lain di kategori ini".
import { describe, expect, it } from 'vitest';
import { BUKU_LAIN_MAX } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/perpus.meta';
import {
  SEMUA_SLUG,
  bukuHref,
  bukuLainnya,
  cariBuku,
  daftarBuku,
  kategoriDenganBuku,
  kategoriSlug,
  namaKategori,
  normalizeSlug,
  parseUrut,
  perpusListHref,
  perpusTabs,
  urutkanBuku,
} from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/perpus-katalog.logic';
import type { Buku } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/perpus.types';

const BASE = '/pendidikan/perpustakaan-digital';

// test-only: bentuk hasil adapter.
const kat = (nama: string) => ({ id: `k-${nama}`, nama, slug: kategoriSlug(nama) });
const buku = (id: string, over: Partial<Buku> = {}): Buku => ({
  id,
  judul: `Buku ${id}`,
  deskripsiHtml: '',
  ringkasan: '',
  kategori: kat('Anak Dan Remaja'),
  sampul: null,
  dibuat: 0,
  ...over,
});

const DATA: Buku[] = [
  buku('a', { judul: 'Seni Berpikir Kritis', ringkasan: 'Logika sehari-hari', kategori: kat('Pengembangan Diri'), dibuat: 3 }),
  buku('b', { judul: 'Dongeng Bali', kategori: kat('Anak Dan Remaja'), dibuat: 5 }),
  buku('c', { judul: 'Atlas Dunia', kategori: kat('Anak Dan Remaja'), dibuat: 1 }),
  buku('d', { judul: 'Tanpa Kategori', kategori: null, dibuat: 9 }),
];

describe('slug kategori', () => {
  it('nama → huruf kecil, spasi jadi "-" (sama dengan tautan lama)', () => {
    expect(kategoriSlug(' Anak  Dan Remaja ')).toBe('anak-dan-remaja');
  });

  it('normalizeSlug menerima slug baru, bentuk lama ter-encode, dan "%" rusak', () => {
    expect(normalizeSlug('anak-dan-remaja')).toBe('anak-dan-remaja');
    expect(normalizeSlug('Anak%20Dan%20Remaja')).toBe('anak-dan-remaja');
    expect(normalizeSlug('%E0%A4%A')).toBe('%e0%a4%a');
    expect(normalizeSlug('')).toBe(SEMUA_SLUG);
    expect(normalizeSlug(undefined)).toBe(SEMUA_SLUG);
  });
});

describe('kategori & saring', () => {
  it('kategoriDenganBuku: unik per slug, berjumlah, urut nama; tanpa kategori diabaikan', () => {
    expect(kategoriDenganBuku(DATA).map((k) => [k.nama, k.jumlah])).toEqual([
      ['Anak Dan Remaja', 2],
      ['Pengembangan Diri', 1],
    ]);
  });

  it('namaKategori: nama asli, atau slug dibaca ulang bila tak dikenal', () => {
    expect(namaKategori('anak-dan-remaja', DATA)).toBe('Anak Dan Remaja');
    expect(namaKategori('sejarah-bali', DATA)).toBe('sejarah bali');
  });

  it('cariBuku: semua kata kunci di judul, deskripsi, atau nama kategori', () => {
    expect(cariBuku(DATA, 'kritis').map((b) => b.id)).toEqual(['a']);
    expect(cariBuku(DATA, 'logika').map((b) => b.id)).toEqual(['a']);
    expect(cariBuku(DATA, 'remaja dongeng').map((b) => b.id)).toEqual(['b']);
    expect(cariBuku(DATA, '').map((b) => b.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('urutkanBuku: Terbaru menurun, Judul A–Z; data asli tidak diubah', () => {
    expect(urutkanBuku(DATA, 'terbaru').map((b) => b.id)).toEqual(['d', 'b', 'a', 'c']);
    expect(urutkanBuku(DATA, 'judul').map((b) => b.id)).toEqual(['c', 'b', 'a', 'd']);
    expect(DATA.map((b) => b.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('parseUrut: nilai sah atau bawaan Terbaru', () => {
    expect(parseUrut('judul')).toBe('judul');
    expect(parseUrut('harga')).toBe('terbaru');
    expect(parseUrut(null)).toBe('terbaru');
  });

  it('daftarBuku: kategori → cari → urut, plus jumlah di kategori sebelum dicari', () => {
    expect(daftarBuku(DATA, 'anak-dan-remaja', '', 'judul')).toEqual({ items: [DATA[2], DATA[1]], diKategori: 2 });
    expect(daftarBuku(DATA, 'anak-dan-remaja', 'atlas', 'terbaru')).toEqual({ items: [DATA[2]], diKategori: 2 });
    expect(daftarBuku(DATA, SEMUA_SLUG, '', 'terbaru').diKategori).toBe(4);
    expect(daftarBuku(DATA, 'sejarah-bali', '', 'terbaru')).toEqual({ items: [], diKategori: 0 });
  });
});

describe('URL', () => {
  it('perpusListHref: cari ditulis, urut bawaan tidak', () => {
    expect(perpusListHref(SEMUA_SLUG)).toBe(`${BASE}/semua`);
    expect(perpusListHref('anak-dan-remaja', { search: '  bali ', urut: 'terbaru' })).toBe(
      `${BASE}/anak-dan-remaja?search=bali`,
    );
    expect(perpusListHref(SEMUA_SLUG, { search: 'a&b', urut: 'judul' })).toBe(`${BASE}/semua?search=a%26b&urut=judul`);
  });

  it('bukuHref: segmen kategori (atau semua) + id', () => {
    expect(bukuHref(DATA[1])).toBe(`${BASE}/anak-dan-remaja/b`);
    expect(bukuHref(DATA[3])).toBe(`${BASE}/semua/d`);
  });
});

describe('perpusTabs', () => {
  it('Semua + kategori berbuku; pil aktif sesuai slug; cari & urut dipertahankan', () => {
    const tabs = perpusTabs(DATA, 'anak-dan-remaja', { search: 'bali', urut: 'judul', semuaLabel: 'Semua' });
    expect(tabs.map((t) => [t.label, t.active])).toEqual([
      ['Semua', false],
      ['Anak Dan Remaja', true],
      ['Pengembangan Diri', false],
    ]);
    expect(tabs[0].href).toBe(`${BASE}/semua?search=bali&urut=judul`);
  });

  it('slug tak dikenal (tautan lama/kategori kosong) tetap jadi pil aktif terakhir', () => {
    const tabs = perpusTabs(DATA, 'sejarah-bali', { semuaLabel: 'Semua' });
    expect(tabs.at(-1)).toEqual({ key: 'sejarah-bali', label: 'sejarah bali', href: `${BASE}/sejarah-bali`, active: true });
    expect(tabs.filter((t) => t.active)).toHaveLength(1);
  });

  it('data belum ada: hanya Semua', () => {
    expect(perpusTabs([], SEMUA_SLUG, { semuaLabel: 'Semua' }).map((t) => t.key)).toEqual([SEMUA_SLUG]);
  });
});

describe('bukuLainnya', () => {
  it('kategori sama, tanpa buku ini, terbaru dulu', () => {
    expect(bukuLainnya(DATA, DATA[2]).map((b) => b.id)).toEqual(['b']);
    expect(bukuLainnya(DATA, DATA[0])).toEqual([]);
  });

  it('tanpa kategori → kosong', () => {
    expect(bukuLainnya(DATA, DATA[3])).toEqual([]);
  });

  it(`maksimal ${BUKU_LAIN_MAX}`, () => {
    const banyak = Array.from({ length: BUKU_LAIN_MAX + 5 }, (_, i) => buku(`x${i}`, { dibuat: i }));
    const hasil = bukuLainnya(banyak, banyak[0]);
    expect(hasil).toHaveLength(BUKU_LAIN_MAX);
    expect(hasil[0].id).toBe(`x${BUKU_LAIN_MAX + 4}`);
  });
});
