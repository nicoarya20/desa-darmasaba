// @vitest-environment node
// Info Wabah & Penanganan Darurat tidak berkedip saat cari/paging: kerangka penuh hanya pada muatan pertama
// (data null); saat memuat ulang kepala + kolom cari + daftar lama tetap dirender dengan aria-busy.
// jsdom rusak di repo ini → markup via renderToStaticMarkup (efek muat tidak berjalan di SSR).
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const stores = vi.hoisted(() => ({ wabah: null as unknown, darurat: null as unknown }));

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));
vi.mock('@/app/admin/(dashboard)/_state/kesehatan/info-wabah-penyakit/infoWabahPenyakit', () => ({
  get default() {
    return stores.wabah;
  },
}));
vi.mock('@/app/admin/(dashboard)/_state/kesehatan/penanganan-darurat/penangananDarurat', () => ({
  get default() {
    return stores.darurat;
  },
}));

import { proxy } from 'valtio';
import { daftarMuat } from '@/app/(public)/(pages)/kesehatan/_com/daftar-muat.logic';
import InfoWabahPage from '@/app/(public)/(pages)/kesehatan/info-wabah-penyakit/page';
import PenangananDaruratPage from '@/app/(public)/(pages)/kesehatan/penanganan-darurat/page';

type Item = { id: string; name: string; deskripsi: string; deskripsiSingkat: string; createdAt: string; image: null };

// test-only: entri minimal yang dibaca kedua halaman.
const item = (id: string, name: string): Item => ({
  id,
  name,
  deskripsi: '<p>Isi</p>',
  deskripsiSingkat: '<p>Ringkas</p>',
  createdAt: '2026-11-20T00:00:00.000Z',
  image: null,
});

const store = (data: Item[] | null, loading: boolean) =>
  proxy({ findMany: { data, loading, page: 1, totalPages: 2, search: '', load: vi.fn() } });

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

describe('daftarMuat', () => {
  it('data null → kerangka (memuat atau belum mulai), tanpa busy', () => {
    expect(daftarMuat(null, true)).toEqual({ skeleton: true, busy: false });
    expect(daftarMuat(null, false)).toEqual({ skeleton: true, busy: false });
  });

  it('data ada + loading → daftar lama ditahan dengan busy; selesai → tanpa busy', () => {
    expect(daftarMuat([item('a', 'A')], true)).toEqual({ skeleton: false, busy: true });
    expect(daftarMuat([], true)).toEqual({ skeleton: false, busy: true });
    expect(daftarMuat([item('a', 'A')], false)).toEqual({ skeleton: false, busy: false });
  });
});

describe.each([
  { name: 'Info Wabah', key: 'wabah' as const, Page: InfoWabahPage, empty: 'Tidak ada data yang cocok dengan pencarian Anda.' },
  { name: 'Penanganan Darurat', key: 'darurat' as const, Page: PenangananDaruratPage, empty: 'Tidak ada data ditemukan' },
])('$name: muat ulang tidak mengganti halaman dengan kerangka', ({ key, Page, empty }) => {
  beforeEach(() => {
    stores.wabah = null;
    stores.darurat = null;
  });

  it('data ada + loading → kolom cari & daftar lama tetap dirender, wadah daftar aria-busy=true', () => {
    stores[key] = store([item('w1', 'Demam Berdarah'), item('w2', 'Campak')], true);
    const html = render(<Page />);
    expect(html).toContain('role="search"');
    expect(html).toContain('type="search"');
    expect(html).toContain('Demam Berdarah');
    expect(html).toContain('Campak');
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain('mantine-Skeleton');
  });

  it('data null + loading → hanya kerangka (tanpa kolom cari)', () => {
    stores[key] = store(null, true);
    const html = render(<Page />);
    expect(html).toContain('mantine-Skeleton');
    expect(html).not.toContain('role="search"');
  });

  it('hasil kosong (kata kunci tanpa hasil) → pesan kosong, kolom cari tetap ada, tanpa busy', () => {
    stores[key] = store([], false);
    const html = render(<Page />);
    expect(html).toContain(empty);
    expect(html).toContain('role="search"');
    expect(html).toContain('aria-busy="false"');
  });
});
