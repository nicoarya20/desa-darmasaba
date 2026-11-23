// @vitest-environment node
// CCTV publik saat deskripsi (nama) dan aktif terakhir diaktifkan kembali: hanya tampil bila terisi, kolom kosong tidak
// menampilkan apa pun (tanpa "-", tanpa pengganti). Konstanta penyembunyi dipaksa true lewat mock.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/app/(public)/(pages)/keamanan/cctv/_com/cctv.meta', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/app/(public)/(pages)/keamanan/cctv/_com/cctv.meta')>()),
  CCTV_TAMPIL_DESKRIPSI: true,
  CCTV_TAMPIL_AKTIF_TERAKHIR: true,
}));

import { CctvRow } from '@/app/(public)/(pages)/keamanan/cctv/_com/CctvList';
import { filterCctv } from '@/app/(public)/(pages)/keamanan/cctv/_com/cctv.logic';
import type { CctvItem } from '@/app/(public)/(pages)/keamanan/cctv/_com/cctv.source';
import { CCTV_TEXT as T } from '@/app/(public)/(pages)/keamanan/cctv/_com/cctv.text';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

// test-only: titik berbentuk hasil normalisasi.
const item = (extra: Partial<CctvItem> = {}): CctvItem => ({
  id: '1',
  kode: 'CCTV-1',
  nama: 'Balai Desa',
  lokasi: 'Jalan Raya',
  latitude: -8.57,
  longitude: 115.19,
  status: 'online',
  lastActive: '2026-02-12T14:30:00.000Z',
  ...extra,
});
const now = new Date('2026-02-12T16:30:00.000Z');
const row = (i: CctvItem) => render(<CctvRow item={i} now={now} selected={false} onPick={() => {}} />);

describe('CCTV publik, deskripsi dan aktif terakhir diaktifkan', () => {
  it('terisi: nama dan aktif terakhir tampil', () => {
    const html = row(item());
    expect(text(html)).toContain('Balai Desa');
    expect(text(html)).toContain(`${T.lastActive} 2 jam yang lalu`);
    expect(html).toContain('<time');
  });

  it('kosong: tidak ada nama, tidak ada "aktif terakhir", dan tidak ada pengganti seperti "-"', () => {
    const html = row(item({ nama: '', lastActive: null }));
    const out = text(html);
    expect(out).not.toContain('Balai Desa');
    expect(out).not.toContain(T.lastActive);
    expect(html).not.toContain('<time');
    expect(out).toContain('CCTV-1');
    expect(out).toContain(T.onlineLabel);
  });

  it('nama ikut dicari dan placeholder menyebut nama', () => {
    expect(filterCctv([item()], 'balai')).toHaveLength(1);
    expect(T.searchPlaceholder).toBe('Cari kode, nama, atau lokasi');
  });
});
