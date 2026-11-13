// @vitest-environment node
// Kontak Darurat Keamanan (call-first): kategori → kelompok, kategori kosong disembunyikan, nomor tel:,
// blok darurat nasional 112/110/113/115, tanpa paginasi. jsdom rusak di repo ini → renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn() }),
}));

import { KontakKeamananView } from '@/app/(public)/(pages)/keamanan/kontak-darurat/_com/KontakKeamananList';
import {
  countItems,
  filterGroups,
  toGroups,
  type KategoriKontak,
} from '@/app/(public)/(pages)/keamanan/kontak-darurat/_com/kontak-keamanan.logic';
import { KEAMANAN_NATIONAL_ENTRIES } from '@/app/(public)/(pages)/keamanan/kontak-darurat/_com/kontak-keamanan.meta';
import { KEAMANAN_TEXT as T } from '@/app/(public)/(pages)/keamanan/kontak-darurat/_com/kontak-keamanan.text';
import type { KontakKeamananState } from '@/app/(public)/(pages)/keamanan/kontak-darurat/_com/use-kontak-keamanan';
import { KONTAK_SEARCH_THRESHOLD } from '@/app/(public)/_com/kontak-darurat/kontak-darurat.meta';
import { NATIONAL_BASE_TEXT as N } from '@/app/(public)/_com/kontak-darurat/kontak-darurat.text';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const count = (html: string, needle: string) => html.split(needle).length - 1;
const noop = () => {};

const item = (id: string, nama: string, nomorTelepon: string, icon = 'bangunan') => ({ id, nama, nomorTelepon, icon });

// test-only: bentuk respons stg (kategori SAR tanpa kontak; Polres ada di 2 kategori).
const kategori: KategoriKontak[] = [
  { id: 'sar', nama: 'SAR & Evakuasi', icon: 'sar', kontakItems: [] },
  {
    id: 'damkar',
    nama: 'Pemadam Kebakaran',
    icon: 'pemadam',
    kontakItems: [{ id: 'm1', kontakItem: item('i1', 'Damkar Kabupaten Badung', '0361900113', 'pemadam') }],
  },
  {
    id: 'polisi',
    nama: 'Kepolisian',
    icon: 'keamanan',
    kontakItems: [
      { id: 'm2', kontakItem: item('i2', 'Polsek Darmasaba', '0361123456') },
      { id: 'm3', kontakItem: item('i3', 'Polres Badung', '0361123999') },
      { id: 'm4', kontakItem: item('i4', 'Bhabinkamtibmas', '081234567890') },
      { id: 'm5', kontakItem: null },
    ],
  },
  { id: 'lain', nama: 'Lainnya', icon: 'darurat', kontakItems: [{ id: 'm6', kontakItem: item('i3', 'Polres Badung', '0361123999') }] },
];
const groups = toGroups(kategori);

describe('toGroups / filterGroups', () => {
  it('kategori tanpa kontak dibuang, urutan API tetap, relasi kosong diabaikan', () => {
    expect(groups.map((g) => g.id)).toEqual(['damkar', 'polisi', 'lain']);
    expect(groups[1].items.map((i) => i.nama)).toEqual(['Polsek Darmasaba', 'Polres Badung', 'Bhabinkamtibmas']);
    expect(countItems(groups)).toBe(5);
  });

  it('key baris = id relasi, sehingga kontak di 2 kategori tetap unik', () => {
    expect(groups.flatMap((g) => g.items.map((i) => i.key))).toEqual(['m1', 'm2', 'm3', 'm4', 'm6']);
  });

  it('nama kategori cocok → semua kontaknya; nama kontak cocok → hanya kontak itu', () => {
    expect(filterGroups(groups, '  KEPOLISIAN ')[0].items).toHaveLength(3);
    const polres = filterGroups(groups, 'polres');
    expect(polres.map((g) => g.id)).toEqual(['polisi', 'lain']);
    expect(polres[0].items.map((i) => i.nama)).toEqual(['Polres Badung']);
  });

  it('cari digit (≥ 3, boleh berspasi/kurung) mencocokkan nomor; kosong → semua', () => {
    expect(filterGroups(groups, '(0361) 900')[0].items[0].nama).toBe('Damkar Kabupaten Badung');
    expect(filterGroups(groups, '12')).toEqual([]);
    expect(filterGroups(groups, '')).toHaveLength(3);
  });
});

describe('KontakKeamananView', () => {
  const html = render(<KontakKeamananView state={{ status: 'ready', groups }} onRetry={noop} />);

  it('h1, judul kelompok per kategori, kategori kosong tidak tampil, tanpa paginasi', () => {
    expect(html).toMatch(new RegExp(`<h1[^>]*>${T.title}</h1>`));
    expect(count(html, '<h3')).toBe(KEAMANAN_NATIONAL_ENTRIES.length + groups.length);
    expect(count(html, '<h4')).toBe(5);
    expect(html).toContain('Pemadam Kebakaran');
    expect(html).not.toContain('SAR &amp; Evakuasi');
    expect(html).not.toContain('mantine-Pagination');
  });

  it('nomor terbaca + Telepon tel:+62 tanpa target; WhatsApp hanya untuk seluler 08xx', () => {
    expect(html).toContain('(0361) 900 113');
    expect(html).toContain('href="tel:+62361123456"');
    expect(html).not.toMatch(/href="tel:[^"]*"[^>]*target=/);
    expect(count(html, 'href="https://wa.me/')).toBe(1);
    expect(html).toContain('href="https://wa.me/6281234567890"');
    expect(html).toContain(T.waNote);
  });

  it('blok Darurat nasional 112/110/113/115 di atas daftar wilayah, tel: apa adanya', () => {
    expect(KEAMANAN_NATIONAL_ENTRIES.map((e) => e.number)).toEqual(['112', '110', '113', '115']);
    expect(html.indexOf(N.title)).toBeLessThan(html.indexOf(T.listTitle));
    for (const { number, name } of KEAMANAN_NATIONAL_ENTRIES) {
      expect(html).toContain(`href="tel:${number}"`);
      expect(html).toContain(`aria-label="${N.callLabel(number, name)}"`);
    }
  });

  it('kartu ringkas mobile: tiap kartu memuat nama lengkap dan nama pendek (CSS memilih salah satu)', () => {
    for (const { name, shortName } of KEAMANAN_NATIONAL_ENTRIES) {
      expect(html).toMatch(new RegExp(`<h3[^>]*><span[^>]*>${name.replace(/[()]/g, '\\$&')}</span><span[^>]*>${shortName.replace(/[()]/g, '\\$&')}</span></h3>`));
    }
  });

  it(`kolom cari tersembunyi untuk ≤ ${KONTAK_SEARCH_THRESHOLD} kontak, tampil bila lebih`, () => {
    expect(html).not.toContain('role="search"');
    const many = toGroups([
      {
        id: 'x',
        nama: 'Banyak',
        kontakItems: Array.from({ length: KONTAK_SEARCH_THRESHOLD + 1 }, (_, i) => ({
          id: `r${i}`,
          kontakItem: item(`k${i}`, `Pos ${i}`, '0361123456'),
        })),
      },
    ]);
    expect(render(<KontakKeamananView state={{ status: 'ready', groups: many }} onRetry={noop} />)).toContain(
      'role="search"',
    );
  });

  it('memuat → kerangka aria-busy; semua kategori kosong → pesan; galat → pesan + Coba lagi; 112 selalu ada', () => {
    const states: KontakKeamananState[] = [
      { status: 'loading' },
      { status: 'ready', groups: toGroups([kategori[0]]) },
      { status: 'error' },
    ];
    const [loading, empty, error] = states.map((state) => render(<KontakKeamananView state={state} onRetry={noop} />));
    expect(loading).toContain('aria-busy="true"');
    expect(empty).toContain(T.empty);
    expect(error).toContain(T.error);
    expect(error).toContain(`>${T.retry}</button>`);
    for (const out of [loading, empty, error]) expect(out).toContain('href="tel:112"');
  });

  it('tanpa em dash di teks UI', () => {
    expect(JSON.stringify({ T, KEAMANAN_NATIONAL_ENTRIES })).not.toContain('—');
  });
});
