// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  detailHref,
  filterByKategori,
  resolveInitialKategori,
} from '@/app/darmasaba/(tambahan)/desa-anti-korupsi/_lib/kategori-tab';

const DAK_DIR = path.resolve(__dirname, '../../src/app/darmasaba/(tambahan)/desa-anti-korupsi');
// Source-check (bukan import): page.tsx menarik BackButton (next-view-transitions) yang tak bisa dimuat di env node.
const CARD_PAGE_SRC = readFileSync(path.join(DAK_DIR, 'page.tsx'), 'utf8');
const DETAIL_PAGE_SRC = readFileSync(path.join(DAK_DIR, 'detail/page.tsx'), 'utf8');

const CATEGORIES = ['PENGUATAN TATA LAKSANA', 'PENGUATAN PENGAWASAN', 'KEARIFAN LOKAL'];

describe('detailHref', () => {
  it('membuat URL detail dengan query kategori ter-encode', () => {
    expect(detailHref('PENGUATAN PENGAWASAN')).toBe(
      '/darmasaba/desa-anti-korupsi/detail?kategori=PENGUATAN%20PENGAWASAN',
    );
  });

  it('round-trip: query terbaca kembali sebagai nama kategori asli', () => {
    const url = new URL(detailHref('PENGUATAN KUALITAS PELAYANAN PUBLIK'), 'http://localhost');
    expect(url.searchParams.get('kategori')).toBe('PENGUATAN KUALITAS PELAYANAN PUBLIK');
  });
});

describe('resolveInitialKategori', () => {
  it('param cocok walau beda kapital & spasi → kategori itu', () => {
    expect(resolveInitialKategori('  penguatan pengawasan ', CATEGORIES)).toBe('PENGUATAN PENGAWASAN');
  });

  it('param kosong/asing → PENGUATAN TATA LAKSANA bila ada', () => {
    expect(resolveInitialKategori(null, CATEGORIES)).toBe('PENGUATAN TATA LAKSANA');
    expect(resolveInitialKategori('', CATEGORIES)).toBe('PENGUATAN TATA LAKSANA');
    expect(resolveInitialKategori('TIDAK ADA', CATEGORIES)).toBe('PENGUATAN TATA LAKSANA');
  });

  it('tanpa Tata Laksana → kategori pertama, tanpa kategori → string kosong', () => {
    expect(resolveInitialKategori('asing', ['KEARIFAN LOKAL', 'PENGUATAN PENGAWASAN'])).toBe('KEARIFAN LOKAL');
    expect(resolveInitialKategori('asing', [])).toBe('');
  });
});

describe('filterByKategori', () => {
  const data = [
    { id: '1', kategori: { name: 'PENGUATAN TATA LAKSANA' } },
    { id: '2', kategori: { name: 'PENGUATAN PENGAWASAN' } },
    { id: '3', kategori: { name: 'KEARIFAN LOKAL' } },
    { id: '4', kategori: null },
  ];

  it('tab Tata Laksana hanya berisi item kategorinya sendiri (regresi: dulu tampil semua)', () => {
    expect(filterByKategori(data, 'PENGUATAN TATA LAKSANA').map(i => i.id)).toEqual(['1']);
  });

  it('tab lain juga hanya item kategorinya', () => {
    expect(filterByKategori(data, 'KEARIFAN LOKAL').map(i => i.id)).toEqual(['3']);
    expect(filterByKategori(data, '')).toEqual([]);
  });
});

describe('halaman kartu Desa Anti Korupsi', () => {
  const judul = [...CARD_PAGE_SRC.matchAll(/judul: "([^"]+)"/g)].map(m => m[1]);

  it('kelima kartu menautkan ke detailHref dengan judulnya sendiri', () => {
    expect(judul).toHaveLength(5);
    // Potong per kartu supaya link dicocokkan dengan judul kartu yang sama, bukan kartu tetangga.
    const cards = CARD_PAGE_SRC.split('judul: ').slice(1);
    cards.forEach((card, idx) => {
      expect(card).toContain(`link: detailHref("${judul[idx]}")`);
    });
  });

  it('tombol Detail memakai link kartu, bukan URL hardcode', () => {
    expect(CARD_PAGE_SRC).toContain('router.push(v.link)');
    expect(CARD_PAGE_SRC).not.toContain('router.push("/darmasaba/desa-anti-korupsi/detail")');
  });
});

describe('halaman detail Desa Anti Korupsi', () => {
  it('memakai helper bersama dan membungkus useSearchParams dalam Suspense', () => {
    expect(DETAIL_PAGE_SRC).toContain("resolveInitialKategori(searchParams.get('kategori'), categories)");
    expect(DETAIL_PAGE_SRC).toContain('filterByKategori(items, selectedKategori)');
    expect(DETAIL_PAGE_SRC).toContain('router.replace(detailHref(kategori), { scroll: false })');
    expect(DETAIL_PAGE_SRC).toMatch(/<Suspense[\s\S]*<AntiKorupsiDetailContent \/>[\s\S]*<\/Suspense>/);
  });
});
