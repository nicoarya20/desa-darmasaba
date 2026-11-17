// @vitest-environment node
// Halaman penghubung Perpustakaan Digital: tombol keluar ke website perpustakaan (tab baru, rel aman, keterangan
// host), keadaan muat/galat/kosong tanpa tombol, dan pembaca respons API. jsdom rusak di repo ini → renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
import { PerpusPenghubungPanel } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/PerpusPenghubung';
import { readPerpusWebsite, websiteHost } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/perpus-website.logic';
import { PERPUS_TEXT as T } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/perpus.text';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: pengaturan rekaan.
const DATA = {
  namaPlatform: 'Pustaka Ananta Loka',
  deskripsi: 'Perpustakaan digital resmi Desa Darmasaba.',
  websiteUrl: 'https://anantaloka.perpustakaan.co.id',
};

describe('PerpusPenghubungPanel', () => {
  it('siap: nama, deskripsi, dan tombol ke website di tab baru dengan rel aman', () => {
    const html = render(<PerpusPenghubungPanel state={{ status: 'ready', data: DATA }} />);
    expect(html).toContain('<h2');
    expect(html).toContain(DATA.namaPlatform);
    expect(html).toContain(DATA.deskripsi);
    expect(html).toMatch(/<a [^>]*href="https:\/\/anantaloka\.perpustakaan\.co\.id"/);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain(T.cta);
    expect(html).toContain(T.opensNewTab('anantaloka.perpustakaan.co.id'));
  });

  it('keterangan tab baru terhubung ke tombol lewat aria-describedby', () => {
    const html = render(<PerpusPenghubungPanel state={{ status: 'ready', data: DATA }} />);
    const describedBy = html.match(/aria-describedby="([^"]+)"/)?.[1];
    expect(describedBy).toBeTruthy();
    expect(html).toContain(`id="${describedBy}"`);
  });

  it('memuat: status sibuk dengan label, tanpa tombol', () => {
    const html = render(<PerpusPenghubungPanel state={{ status: 'loading' }} />);
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain(T.loading);
    expect(html).not.toContain('<a ');
  });

  it('galat: pesan alert, tanpa tombol', () => {
    const html = render(<PerpusPenghubungPanel state={{ status: 'error' }} />);
    expect(html).toContain('role="alert"');
    expect(html).toContain(T.error);
    expect(html).not.toContain('<a ');
  });

  it('belum diatur: pesan kosong, tanpa tombol', () => {
    const html = render(<PerpusPenghubungPanel state={{ status: 'ready', data: null }} />);
    expect(html).toContain(T.empty);
    expect(html).not.toContain('<a ');
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
