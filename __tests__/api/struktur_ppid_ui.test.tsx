// @vitest-environment node
// Halaman Struktur PPID: kartu bagan (tautan profil, kotak kosong, foto) dan susunan baris/grid daun.
// jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));
vi.mock('valtio/utils', () => ({ useProxy: <T,>(x: T) => x }));
vi.mock('@/app/admin/(dashboard)/_state/ppid/struktur_ppid/struktur_PPID', () => ({
  default: {
    pegawai: { findMany: { data: null, load: vi.fn() } },
    posisiOrganisasi: { findManyAll: { data: [], load: vi.fn() } },
  },
}));

import Page from '@/app/darmasaba/(pages)/ppid/struktur-ppid/page';
import { StrukturChart } from '@/app/darmasaba/(pages)/ppid/struktur-ppid/_com/StrukturChart';
import type { OrgNode } from '@/app/darmasaba/(pages)/ppid/struktur-ppid/_com/struktur.logic';

const render = (ui: React.ReactElement) => renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>);

// test-only: pohon kecil — Kepala Desa → [Kaur Umum (kosong) → Kaur Keuangan, Sekretaris → 2 Kadus].
const node = (posisiId: string, title: string, person: OrgNode['person'], children: OrgNode[] = []): OrgNode => ({
  posisiId,
  title,
  hierarki: 1,
  person,
  children,
});
const TREE: OrgNode[] = [
  node('kepala_desa', 'Kepala Desa', { id: 'p1', name: 'Ida Bagus', image: '/api/img/kades.webp' }, [
    node('kaur_umum', 'Kaur Umum & TU', null, [
      node('kaur_keuangan', 'Kaur Keuangan', { id: 'p3', name: 'Ni Wayan', image: null }),
    ]),
    node('sekretaris_desa', 'Sekretaris Desa', { id: 'p2', name: 'I Ketut', image: null }, [
      node('kadus_bucu', 'Kepala Dusun Bucu', { id: 'p4', name: 'Si Gede', image: null }),
      node('kadus_taman', 'Kepala Dusun Taman', { id: 'p5', name: 'I Gede', image: null }),
    ]),
  ]),
];

const html = render(<StrukturChart roots={TREE} />);
const count = (source: string, needle: string | RegExp) => source.split(needle).length - 1;

describe('Struktur PPID — kartu bagan', () => {
  it('kartu berpegawai = tautan ke profil dengan label jabatan', () => {
    expect(html).toContain('href="/darmasaba/ppid/struktur-ppid/p1"');
    expect(html).toContain('aria-label="Ida Bagus, Kepala Desa — lihat profil"');
    expect(count(html, '<a ')).toBe(5);
  });

  it('jabatan tanpa pegawai tampil "Belum ditugaskan" tanpa tautan', () => {
    expect(html).toContain('Kaur Umum &amp; TU');
    expect(html).toContain('Belum ditugaskan');
    expect(html).toMatch(/<div[^>]*data-vacant="true"[^>]*>/);
  });

  it('foto dari link pegawai; tanpa foto → siluet ikon', () => {
    expect(html).toContain('src="/api/img/kades.webp"');
    expect(count(html, 'tabler-icon-user-filled')).toBe(5);
  });

  it('warna & ukuran per tingkat: akar lg/tone 0, bawahan langsung md/tone 1, daun di grid sm/tone 2', () => {
    expect(html).toMatch(/data-tone="0" data-size="lg"[^>]*aria-label="Ida Bagus/);
    expect(html).toMatch(/data-tone="1" data-size="md"[^>]*aria-label="I Ketut/);
    expect(html).toMatch(/data-tone="2" data-size="sm"[^>]*aria-label="Si Gede/);
  });

  it('bawahan bercabang → baris; bawahan daun semua → grid dengan jumlah kolom per batas layar', () => {
    expect(count(html, /class="[^"]*_row_/)).toBe(1);
    expect(count(html, /class="[^"]*_leaves_/)).toBe(2);
    expect(html).toMatch(/class="[^"]*_leaves_[^"]*" style="--c2:2;--c4:2"/);
    expect(html).toMatch(/class="[^"]*_leaves_[^"]*" style="--c2:1;--c4:1"/);
    expect(html).toContain('aria-label="Bagan struktur organisasi PPID"');
  });

  it('kotak daun membawa geser palang (--o) dan geser baris (--s) dari leafSlot', () => {
    expect(html).toContain('style="--o2:0.5;--a2:0.5;--s2:0;--o4:0.5;--a4:0.5;--s4:0"');
    expect(html).toContain('style="--o2:-0.5;--a2:0.5;--s2:0;--o4:-0.5;--a4:0.5;--s4:0"');
  });
});

describe('Struktur PPID — halaman', () => {
  const page = render(<Page />);

  it('kepala halaman: h1, kotak cari berlabel, tanpa kontrol zoom/fullscreen lama', () => {
    expect(page).toMatch(/<h1[^>]*>Struktur Organisasi PPID<\/h1>/);
    expect(page).toContain('aria-label="Cari nama atau jabatan"');
    expect(page).not.toMatch(/Zoom|Fullscreen/);
  });

  it('selama memuat menampilkan kerangka', () => {
    expect(page).toContain('role="status" aria-label="Memuat struktur organisasi…"');
  });

  it('memuat pegawai dengan limit 100 + daftar jabatan (dipanggil di effect, dicek dari sumber)', () => {
    const src = readFileSync(
      path.join(process.cwd(), 'src/app/darmasaba/(pages)/ppid/struktur-ppid/page.tsx'),
      'utf8',
    );
    expect(src).toContain('findMany.load(1, STRUKTUR_PEGAWAI_LIMIT)');
    expect(src).toContain('findManyAll.load()');
  });
});
