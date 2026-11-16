// @vitest-environment node
// Demografi Pekerjaan publik: kerangka Kabar, panel batang bersegmen laki-laki | perempuan, keadaan memuat/kosong/galat.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup (efek & fetch tidak jalan di server).
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  useTransitionRouter: () => ({ back: vi.fn(), replace: vi.fn(), push: vi.fn() }),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

import {
  DemografiPekerjaanContent,
  DemografiPekerjaanPage,
} from '@/app/(public)/(pages)/ekonomi/demografi-pekerjaan/_com/DemografiPekerjaanPage';
import { toDemografiPekerjaanItem } from '@/app/(public)/(pages)/ekonomi/demografi-pekerjaan/_com/demografi-pekerjaan.logic';
import { DEMOGRAFI_PEKERJAAN_TEXT as T } from '@/app/(public)/(pages)/ekonomi/demografi-pekerjaan/_com/demografi-pekerjaan.text';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

// test-only: tiga baris data stg 2026-11-16.
const STG = [
  toDemografiPekerjaanItem({ id: 't', pekerjaan: 'Test QA Pekerjaan', lakiLaki: 10, perempuan: 8, updatedAt: '2026-09-22T11:57:48.763Z' }),
  toDemografiPekerjaanItem({ id: 'k', pekerjaan: 'Karyawan Swasta', lakiLaki: 260, perempuan: 310, updatedAt: '2026-11-02T06:30:14.481Z' }),
  toDemografiPekerjaanItem({ id: 'p', pekerjaan: 'Petani/Pekebun', lakiLaki: 180, perempuan: 120, updatedAt: '2026-11-02T06:30:14.454Z' }),
];

describe('Halaman', () => {
  it('sebelum data siap: judul h1 + kerangka aria-busy, tanpa angka', () => {
    const html = render(<DemografiPekerjaanPage />);
    expect(html).toContain('<h1');
    expect(text(html)).toContain(T.title);
    expect(html).toContain('aria-busy="true"');
    expect(text(html)).not.toContain(T.totalLabel);
  });

  it('kosong → satu ubin "tempat disediakan", tanpa daftar/legenda', () => {
    const html = render(<DemografiPekerjaanContent state={{ status: 'ready', data: [] }} />);
    expect(text(html)).toContain(T.emptyBody);
    expect(html).not.toContain('<ol');
    expect(text(html)).not.toContain(T.laki);
  });

  it('galat ≠ kosong: role alert + pesan galat', () => {
    const html = render(<DemografiPekerjaanContent state={{ status: 'error' }} />);
    expect(html).toContain('role="alert"');
    expect(text(html)).toContain(T.failed);
    expect(text(html)).not.toContain(T.emptyBody);
  });
});

describe('Panel', () => {
  const html = render(<DemografiPekerjaanContent state={{ status: 'ready', data: STG }} />);
  const out = text(html);

  it('total, legenda laki-laki/perempuan dengan jumlah & porsi, tanggal pembaruan', () => {
    expect(out).toContain(`${T.totalLabel} 888 ${T.unit}`);
    expect(out).toContain('Laki-laki 450 50,7%');
    expect(out).toContain('Perempuan 438 49,3%');
    expect(out).toContain('Data diperbarui 2 November 2026');
  });

  it('peringkat terbanyak dulu, angka tercetak langsung dengan rincian segmen', () => {
    const names = [...html.matchAll(/<li[^>]*>\s*<span[^>]*>([^<]+)<\/span>/g)].map((m) => m[1]);
    expect(names).toEqual(['Karyawan Swasta', 'Petani/Pekebun', 'Test QA Pekerjaan']);
    expect(out).toContain('Karyawan Swasta 570 orang 64,2% Laki-laki 260 Perempuan 310');
  });

  it('tanpa kunci mentah "laki"/"perempuan" dan tanpa recharts', () => {
    expect(out).not.toMatch(/(^|\s)(laki|perempuan)\s/);
    expect(html).not.toContain('recharts');
  });
});
