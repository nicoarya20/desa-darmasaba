// @vitest-environment node
// Halaman penghubung Perpustakaan Digital: kepala (nama platform, deskripsi admin, tombol ke website di tab baru,
// "Cara membaca"), bagian fitur & langkah, penutup bergradasi, keadaan muat/galat/kosong tanpa tombol, serta pembaca
// respons API. jsdom rusak di repo ini → renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
import { PerpusPenghubungBody } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/PerpusPenghubung';
import { readPerpusWebsite, websiteHost, type PerpusWebsiteState } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/perpus-website.logic';
import { PERPUS_CARA_ID } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/perpus.meta';
import { PERPUS_TEXT as T } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/perpus.text';

const render = (state: PerpusWebsiteState) =>
  renderToStaticMarkup(
    <MantineProvider>
      <PerpusPenghubungBody state={state} />
    </MantineProvider>,
  ).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: pengaturan rekaan.
const DATA = {
  namaPlatform: 'Pustaka Ananta Loka',
  deskripsi: 'Perpustakaan digital resmi Desa Darmasaba.',
  websiteUrl: 'https://anantaloka.perpustakaan.co.id',
};
const ready = render({ status: 'ready', data: DATA });
const anchors = (html: string) => [...html.matchAll(/<a [^>]*>/g)].map((m) => m[0]);
const external = (html: string) => anchors(html).filter((a) => a.includes('target="_blank"'));

describe('keadaan siap', () => {
  it('kepala: satu h1, nama platform, dan deskripsi admin sebagai pengantar', () => {
    expect(ready.match(/<h1/g)).toHaveLength(1);
    expect(ready).toContain(T.title);
    expect(ready).toContain(DATA.namaPlatform);
    expect(ready).toContain(DATA.deskripsi);
    expect(ready).not.toContain(T.lead);
  });

  it('tombol ke website: kepala + penutup, tab baru, rel aman, keterangan tab baru untuk pembaca layar', () => {
    const links = external(ready);
    expect(links).toHaveLength(2);
    for (const a of links) {
      expect(a).toContain(`href="${DATA.websiteUrl}"`);
      expect(a).toContain('rel="noopener noreferrer"');
    }
    expect(ready.split(T.cta).length - 1).toBe(2);
    expect(ready.split(T.newTabSr).length - 1).toBe(2);
    expect(ready).toContain(T.opensNewTab('anantaloka.perpustakaan.co.id'));
  });

  it('"Cara membaca" menaut ke bagian langkah yang punya id sama', () => {
    expect(ready).toContain(`href="#${PERPUS_CARA_ID}"`);
    expect(ready).toContain(`id="${PERPUS_CARA_ID}"`);
  });

  it('bagian fitur (3 ubin) dan langkah (3 langkah bernomor 01–03) tampil lengkap', () => {
    for (const item of [...T.fitur, ...T.langkah]) {
      expect(ready).toContain(item.title);
      expect(ready).toContain(item.desc);
    }
    expect(ready).toContain(T.fiturTitle);
    expect(ready).toContain(T.langkahTitle);
    for (const n of ['01', '02', '03']) expect(ready).toContain(`>${n}</span>`);
  });

  it('penutup: judul, teks, dan bagian punya label sendiri', () => {
    expect(ready).toContain(T.penutupTitle);
    expect(ready).toContain(T.penutupText);
    expect(ready).toContain('aria-labelledby="perpus-penutup"');
  });

  it('ilustrasi dekoratif disembunyikan dari pembaca layar dan memuat host asli', () => {
    const art = ready.match(/<div class="[^"]*art[^"]*" aria-hidden="true">[\s\S]*?<\/div><\/div><\/div><\/div>/)?.[0];
    expect(art).toBeTruthy();
    expect(art).toContain('anantaloka.perpustakaan.co.id');
  });
});

describe('keadaan tanpa tautan', () => {
  it('memuat: status sibuk berlabel, tanpa tombol dan tanpa penutup, bagian statis tetap tampil', () => {
    const html = render({ status: 'loading' });
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain(`aria-label="${T.loading}"`);
    expect(external(html)).toHaveLength(0);
    expect(html).not.toContain(T.penutupTitle);
    expect(html).toContain(T.lead);
    expect(html).toContain(T.langkahTitle);
  });

  it('galat: pesan alert, tanpa tombol dan penutup', () => {
    const html = render({ status: 'error' });
    expect(html).toContain('role="alert"');
    expect(html).toContain(T.error);
    expect(external(html)).toHaveLength(0);
    expect(html).not.toContain(T.penutupTitle);
  });

  it('belum diatur: pesan kosong, tanpa tombol dan penutup', () => {
    const html = render({ status: 'ready', data: null });
    expect(html).toContain(T.empty);
    expect(external(html)).toHaveLength(0);
    expect(html).not.toContain(T.penutupTitle);
  });
});

describe('readPerpusWebsite', () => {
  it('200 + success → data (null bila belum diatur)', () => {
    expect(readPerpusWebsite(200, { success: true, data: DATA })).toEqual(DATA);
    expect(readPerpusWebsite(200, { success: true, data: null })).toBeNull();
  });

  it('HTTP gagal atau success false → Error berkonteks', () => {
    expect(() => readPerpusWebsite(500, { success: false, message: 'db mati' })).toThrow(/HTTP 500.*db mati/);
    expect(() => readPerpusWebsite(200, { success: false })).toThrow(/gagal dimuat/);
  });
});

describe('websiteHost', () => {
  it('ambil host, URL rusak dikembalikan apa adanya', () => {
    expect(websiteHost('https://anantaloka.perpustakaan.co.id/home.ks')).toBe('anantaloka.perpustakaan.co.id');
    expect(websiteHost('bukan url')).toBe('bukan url');
  });
});
