// @vitest-environment node
// Lembaga & Komunitas publik: kerangka Kabar, kelompok per jenis, kartu (foto responsif, ketua, deskripsi ringkas, kontak
// tel:/mailto:), keadaan memuat/kosong/galat, dan jaminan tidak ada HTML mentah. jsdom rusak di repo ini → markup diuji
// via renderToStaticMarkup (klik "Selengkapnya" tidak teruji; yang diuji keadaan awal dan fungsi pemotong).
import { MantineProvider } from '@mantine/core';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  useTransitionRouter: () => ({ back: vi.fn(), replace: vi.fn(), push: vi.fn() }),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

import { LembagaKomunitasContent, LembagaKomunitasPage } from '@/app/(public)/(pages)/pemerintahan/lembaga-komunitas/_com/LembagaKomunitasPage';
import {
  DESKRIPSI_RINGKAS_MAX,
  kelompokkanPerJenis,
  kontakHref,
  potongDeskripsi,
} from '@/app/(public)/(pages)/pemerintahan/lembaga-komunitas/_com/lembaga-komunitas.logic';
import { LEMBAGA_KOMUNITAS_TEXT as T } from '@/app/(public)/(pages)/pemerintahan/lembaga-komunitas/_com/lembaga-komunitas.text';
import type { LembagaKomunitasRecord } from '@/lib/lembaga-komunitas';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

// test-only: data rekaan untuk menguji tampilan, bukan lembaga nyata Desa Darmasaba.
const item = (over: Partial<LembagaKomunitasRecord> & { id: string; nama: string; jenis: string }): LembagaKomunitasRecord => ({
  deskripsi: null,
  ketua: null,
  kontak: null,
  urutan: 0,
  foto: null,
  ...over,
});
const PKK_B = item({ id: 'p2', nama: 'PKK Banjar B', jenis: 'PKK', urutan: 2 });
const PKK_A = item({
  id: 'p1',
  nama: 'PKK Banjar A',
  jenis: 'PKK',
  urutan: 1,
  ketua: 'Ni Contoh',
  deskripsi: 'Kegiatan rutin bulanan.',
  kontak: '0361-123456',
  foto: { id: 'f1', link: '/api/img/contoh.webp' },
});
const STT = item({ id: 's1', nama: 'STT Contoh', jenis: 'STT', kontak: 'stt@contoh.example' });

describe('logic: kelompokkanPerJenis', () => {
  it('kelompok urut A-Z; dalam kelompok urut urutan lalu nama, tidak bergantung urutan respons', () => {
    const grups = kelompokkanPerJenis([STT, PKK_B, PKK_A]);
    expect(grups.map((g) => g.jenis)).toEqual(['PKK', 'STT']);
    expect(grups[0].items.map((i) => i.id)).toEqual(['p1', 'p2']);
    const sama = kelompokkanPerJenis([item({ id: 'z', nama: 'Zeta', jenis: 'PPL' }), item({ id: 'a', nama: 'Alfa', jenis: 'PPL' })]);
    expect(sama[0].items.map((i) => i.id)).toEqual(['a', 'z']);
  });

  it('ejaan huruf besar-kecil yang berbeda menyatu dalam satu kelompok (label = ejaan pertama)', () => {
    const grups = kelompokkanPerJenis([item({ id: '1', nama: 'A', jenis: 'PKK' }), item({ id: '2', nama: 'B', jenis: ' pkk ' })]);
    expect(grups).toHaveLength(1);
    expect(grups[0]).toMatchObject({ jenis: 'PKK', kunci: 'pkk' });
    expect(grups[0].items).toHaveLength(2);
  });

  it('daftar kosong → tanpa kelompok', () => {
    expect(kelompokkanPerJenis([])).toEqual([]);
  });
});

describe('logic: kontakHref', () => {
  it('telepon → tel: hanya angka dan +; email → mailto:; bentuk lain → null', () => {
    expect(kontakHref('0361-123 456')).toBe('tel:0361123456');
    expect(kontakHref('+62 361 (123) 456')).toBe('tel:+62361123456');
    expect(kontakHref('stt@contoh.example')).toBe('mailto:stt@contoh.example');
    expect(kontakHref('hubungi balai banjar')).toBeNull();
    expect(kontakHref('javascript:alert(1)')).toBeNull();
  });
});

describe('logic: potongDeskripsi', () => {
  it('deskripsi pendek utuh dan tidak terpotong; spasi dirapatkan', () => {
    expect(potongDeskripsi('Satu  dua\n\ntiga')).toEqual({ ringkas: 'Satu dua tiga', terpotong: false });
    expect(potongDeskripsi('a'.repeat(DESKRIPSI_RINGKAS_MAX)).terpotong).toBe(false);
  });

  it('deskripsi panjang dipotong di batas kata dan diakhiri elipsis; ringkasan tidak melewati batas', () => {
    const panjang = 'kata '.repeat(100).trim();
    const { ringkas, terpotong } = potongDeskripsi(panjang);
    expect(terpotong).toBe(true);
    expect(ringkas.endsWith('kata…')).toBe(true);
    expect(ringkas.length).toBeLessThanOrEqual(DESKRIPSI_RINGKAS_MAX + 1);
  });

  it('tanpa spasi (satu kata panjang) dipotong keras pada batas', () => {
    const { ringkas } = potongDeskripsi('x'.repeat(500), 50);
    expect(ringkas).toBe(`${'x'.repeat(50)}…`);
  });
});

describe('Halaman', () => {
  it('sebelum data siap: satu h1 judul + kerangka aria-busy, tanpa kartu', () => {
    const html = render(<LembagaKomunitasPage />);
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(text(html)).toContain(T.title);
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain('<li');
  });

  it('kosong → ubin "belum ada", tanpa kelompok atau kartu', () => {
    const html = render(<LembagaKomunitasContent state={{ status: 'ready', data: [] }} />);
    expect(text(html)).toContain(T.emptyTitle);
    expect(text(html)).toContain(T.emptyBody);
    expect(html).not.toContain('<ul');
    expect(html).not.toContain('<h3');
  });

  it('galat ≠ kosong: role alert + pesan galat', () => {
    const html = render(<LembagaKomunitasContent state={{ status: 'error' }} />);
    expect(html).toContain('role="alert"');
    expect(text(html)).toContain(T.failed);
    expect(text(html)).not.toContain(T.emptyTitle);
  });

  it('terisi: satu h2 per jenis (A-Z), kartu h3 per lembaga, ketua, deskripsi, dan kontak', () => {
    const html = render(<LembagaKomunitasContent state={{ status: 'ready', data: [STT, PKK_B, PKK_A] }} />);
    expect([...html.matchAll(/<h2[^>]*>([^<]*)<\/h2>/g)].map((m) => m[1])).toEqual(['PKK', 'STT']);
    expect([...html.matchAll(/<h3[^>]*>([^<]*)<\/h3>/g)].map((m) => m[1])).toEqual(['PKK Banjar A', 'PKK Banjar B', 'STT Contoh']);
    expect(html.match(/<section/g)).toHaveLength(2);
    expect(html.match(/aria-labelledby="lk-grup-\d"/g)).toHaveLength(2);
    expect(text(html)).toContain(`${T.ketuaLabel} Ni Contoh`);
    expect(text(html)).toContain('Kegiatan rutin bulanan.');
    expect(html).toContain('href="tel:0361123456"');
    expect(html).toContain('href="mailto:stt@contoh.example"');
  });

  it('foto: lazy, ukuran jelas (width/height), srcSet + sizes dari /api/img, alt berisi nama; tanpa foto → tanpa <img>', () => {
    const html = render(<LembagaKomunitasContent state={{ status: 'ready', data: [PKK_A, STT] }} />);
    expect(html.match(/<img/g)).toHaveLength(1);
    const img = html.match(/<img[^>]*>/)?.[0] ?? '';
    expect(img).toContain('src="/api/img/contoh.webp"');
    expect(img).toContain('srcSet="/api/img/contoh.webp?size=480 480w');
    expect(img).toContain('sizes="');
    expect(img).toContain('loading="lazy"');
    expect(img).toContain('width="480"');
    expect(img).toContain('height="360"');
    expect(img).toContain(`alt="${T.fotoAlt('PKK Banjar A')}"`);
  });

  it('deskripsi panjang: awalnya ringkas dengan tombol "Selengkapnya" (aria-expanded=false); pendek: tanpa tombol', () => {
    const panjang = item({ id: 'l', nama: 'Panjang', jenis: 'PKK', deskripsi: 'kata '.repeat(100).trim() });
    const html = render(<LembagaKomunitasContent state={{ status: 'ready', data: [panjang, PKK_A] }} />);
    expect(html.match(/<button/g)).toHaveLength(1);
    expect(html).toContain('aria-expanded="false"');
    expect(text(html)).toContain(T.selengkapnya);
    expect(text(html)).toContain('…');
  });

  it('kontak yang bukan telepon/email (data lama) tampil sebagai teks tanpa tautan', () => {
    const lama = item({ id: 'x', nama: 'Lama', jenis: 'PKK', kontak: 'tanya balai banjar' });
    const html = render(<LembagaKomunitasContent state={{ status: 'ready', data: [lama] }} />);
    expect(text(html)).toContain('tanya balai banjar');
    expect(html).not.toContain('href=');
  });

  it('HTML di data tidak dieksekusi: nama, ketua, deskripsi di-escape dan tidak ada dangerouslySetInnerHTML', () => {
    const jahat = item({
      id: 'j',
      nama: '<script>alert(1)</script>',
      jenis: 'PKK',
      ketua: '<img src=x onerror=alert(1)>',
      deskripsi: '<b onmouseover=alert(1)>tebal</b>',
    });
    const html = render(<LembagaKomunitasContent state={{ status: 'ready', data: [jahat] }} />);
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<b ');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;');
    const dir = path.resolve(__dirname, '../../src/app/(public)/(pages)/pemerintahan/lembaga-komunitas/_com');
    for (const file of ['LembagaKomunitasPage.tsx', 'LembagaKomunitasKartu.tsx', 'LembagaDeskripsi.tsx']) {
      expect(readFileSync(path.join(dir, file), 'utf8'), file).not.toContain('dangerouslySetInnerHTML');
    }
  });
});
