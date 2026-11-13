// @vitest-environment node
// Halaman publik CCTV Keamanan Desa: ubin status gaya APBDes, panel peta + daftar baris, keadaan kosong/memuat.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup (efek, fetch, dan peta Leaflet tidak jalan di server).
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({ useTransitionRouter: () => ({ back: vi.fn() }) }));
// Peta Leaflet butuh window; dynamic() diganti penanda agar markup panel tetap bisa diperiksa.
vi.mock('next/dynamic', () => ({ default: () => () => <div data-testid="peta" /> }));

import { CctvContent, CctvPage } from '@/app/(public)/(pages)/keamanan/cctv/_com/CctvPage';
import { CctvRow } from '@/app/(public)/(pages)/keamanan/cctv/_com/CctvList';
import type { CctvItem } from '@/app/(public)/(pages)/keamanan/cctv/_com/cctv.source';
import { CCTV_TEXT as T } from '@/app/(public)/(pages)/keamanan/cctv/_com/cctv.text';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/\s+/g, ' ');

// test-only: titik berbentuk hasil normalisasi.
const item = (id: string, extra: Partial<CctvItem> = {}): CctvItem => ({
  id,
  kode: `CCTV-${id}`,
  nama: `Titik ${id}`,
  lokasi: `Jalan ${id}`,
  latitude: -8.57,
  longitude: 115.19,
  status: 'online',
  lastActive: '2026-02-12T14:30:00.000Z',
  ...extra,
});
const many = (n: number) => Array.from({ length: n }, (_, i) => item(String(i + 1), { status: i % 4 === 0 ? 'offline' : 'online' }));

describe('Halaman', () => {
  it('sebelum data siap menampilkan kerangka, bukan angka 0 atau paginasi', () => {
    const html = render(<CctvPage />);
    expect(html).toContain('aria-busy="true"');
    expect(text(html)).toContain(T.pageTitle);
    expect(html).not.toContain('mantine-Pagination');
  });

  it('tanpa titik sama sekali → satu ubin kosong tanpa ubin angka dan peta', () => {
    const out = text(render(<CctvContent items={[]} />));
    expect(out).toContain(T.emptyTitle);
    expect(out).not.toContain(T.onlineLabel);
    expect(out).not.toContain(T.panelTitle);
  });
});

describe('Ringkasan', () => {
  it('ubin total/online/offline berisi jumlah saja, tanpa persen maupun bar', () => {
    const html = render(<CctvContent items={many(8)} />);
    const out = text(html);
    expect(out).toContain(`${T.totalLabel} 8 ${T.totalUnit}`);
    expect(out).toContain(`${T.onlineLabel} 6 ${T.cameraUnit}`);
    expect(out).toContain(`${T.offlineLabel} 2 ${T.cameraUnit}`);
    expect(out).not.toMatch(/\d+(,\d+)?%/);
    expect(out).not.toContain('dari seluruh titik');
    expect(html).not.toContain('role="img"');
    expect(out).toContain(T.allMapped);
  });

  it('titik tanpa koordinat dan status kosong disebut jujur', () => {
    const out = text(render(<CctvContent items={[item('1'), item('2', { latitude: null, longitude: null, status: 'unknown' })]} />));
    expect(out).toContain(T.partlyMapped(1, 1));
    expect(out).toContain(T.unknownCount(1));
    expect(out).toContain(T.unknownLabel);
  });
});

describe('Panel peta + daftar', () => {
  it('semua titik tampil sebagai baris tombol tanpa paginasi; cari muncul bila > 6 titik', () => {
    const html = render(<CctvContent items={many(9)} />);
    expect(html.match(/data-cctv-id=/g)).toHaveLength(9);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(9);
    expect(html).toContain('data-testid="peta"');
    expect(html).toContain('role="search"');
    expect(html).not.toContain('mantine-Pagination');
  });

  it('daftar pendek tanpa kolom cari', () => {
    expect(render(<CctvContent items={many(3)} />)).not.toContain('role="search"');
  });

  it('tanpa koordinat sama sekali → pesan peta, bukan komponen peta', () => {
    const html = render(<CctvContent items={[item('1', { latitude: null, longitude: null })]} />);
    expect(html).not.toContain('data-testid="peta"');
    expect(text(html)).toContain(T.mapEmpty);
  });
});

describe('Baris CCTV', () => {
  const now = new Date('2026-02-12T16:30:00.000Z');

  it('nama, status, lokasi, kode, dan aktif terakhir relatif dengan tanggal lengkap di <time>', () => {
    const html = render(<CctvRow item={item('7', { status: 'offline' })} now={now} selected onPick={() => {}} />);
    const out = text(html);
    expect(html).toContain('aria-pressed="true"');
    expect(out).toContain('Titik 7');
    expect(out).toContain(T.offlineLabel);
    expect(out).toContain('Jalan 7');
    expect(out).toContain('CCTV-7');
    expect(out).toContain(`${T.lastActive} 2 jam yang lalu`);
    expect(html).toContain('dateTime="2026-02-12T14:30:00.000Z"');
  });

  it('kolom kosong ditulis "belum diisi"; tanpa koordinat bukan tombol', () => {
    const html = render(<CctvRow item={item('8', { lokasi: '', lastActive: null, latitude: null, longitude: null })} now={now} selected={false} onPick={() => {}} />);
    const out = text(html);
    expect(html).not.toContain('<button');
    expect(out).toContain(T.lokasiKosong);
    expect(out).toContain(T.lastActiveKosong);
    expect(out).toContain(T.notOnMap);
  });
});
