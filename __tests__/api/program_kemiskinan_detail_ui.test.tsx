// @vitest-environment node
// Detail publik Program Kemiskinan (SSR via renderToStaticMarkup, jsdom rusak di repo ini): status awal
// memuat, keadaan kosong tanpa data penerima, jumlah per tahun, rekap per alamat (+ Lainnya), daftar
// nama + alamat berpaginasi, dan meta robots noindex. Tidak ada fetch (efek tidak jalan di SSR).
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes, ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
vi.mock('@/lib/api-fetch', () => ({ default: {} }));

import { metadata } from '@/app/(public)/(pages)/ekonomi/program-kemiskinan/[slug]/page';
import { DaftarPenerimaView } from '@/app/(public)/(pages)/ekonomi/program-kemiskinan/_com/detail/DaftarPenerimaView';
import { ProgramDetailBody } from '@/app/(public)/(pages)/ekonomi/program-kemiskinan/_com/detail/ProgramDetailBody';
import { ProgramKemiskinanDetail } from '@/app/(public)/(pages)/ekonomi/program-kemiskinan/_com/detail/ProgramKemiskinanDetail';
import { RekapAlamatView } from '@/app/(public)/(pages)/ekonomi/program-kemiskinan/_com/detail/RekapAlamatView';
import { programHref } from '@/app/(public)/(pages)/ekonomi/program-kemiskinan/_com/program-kemiskinan.source';
import { PROGRAM_DETAIL_TEXT as T } from '@/app/(public)/(pages)/ekonomi/program-kemiskinan/_com/program-kemiskinan.text';
import type { ProgramPublik } from '@/app/(public)/(pages)/ekonomi/program-kemiskinan/_com/program-kemiskinan.types';

const render = (node: ReactElement) =>
  renderToStaticMarkup(<MantineProvider env="test">{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const noop = () => {};

// test-only: program rekaan
const program = (over: Partial<ProgramPublik> = {}): ProgramPublik => ({
  id: 'prog-1',
  slug: 'pkh',
  nama: 'PKH (Program Keluarga Harapan)',
  deskripsi: '<p>Bantuan sosial bersyarat.</p>',
  icon: 'bantuan',
  tahun: [],
  ...over,
});

describe('halaman detail', () => {
  it('render awal (SSR) = kerangka memuat berlabel + tautan kembali, tanpa tabel', () => {
    const html = render(<ProgramKemiskinanDetail programKey="pkh" />);
    expect(html).toContain(`role="status" aria-label="${T.memuat}"`);
    expect(html).toContain('href="/ekonomi/program-kemiskinan"');
    expect(html).not.toContain('<table');
  });

  it('meta robots noindex (data warga tidak diindeks), follow tetap', () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });

  it('URL detail memakai slug, atau id bila slug kosong', () => {
    expect(programHref({ id: 'abc', slug: 'pkh' })).toBe('/ekonomi/program-kemiskinan/pkh');
    expect(programHref({ id: 'abc', slug: null })).toBe('/ekonomi/program-kemiskinan/abc');
  });
});

describe('ProgramDetailBody', () => {
  it('tanpa data penerima → keadaan kosong, tanpa pilihan tahun maupun daftar', () => {
    const html = render(<ProgramDetailBody program={program()} tahun={null} onPilihTahun={noop} />);
    expect(html.match(/<h1/g)?.length).toBe(1);
    expect(text(html)).toContain('PKH (Program Keluarga Harapan)');
    expect(text(html)).toContain(T.kosongJudul);
    expect(text(html)).toContain(T.privasi);
    expect(html).not.toContain('role="radiogroup"');
    expect(html).not.toContain('<table');
  });

  it('ada data → pilihan tahun (terbaru default) + jumlah penerima tahun terpilih', () => {
    const p = program({ tahun: [{ tahun: 2026, jumlah: 1234 }, { tahun: 2025, jumlah: 7 }] });
    const html = render(<ProgramDetailBody program={p} tahun={null} onPilihTahun={noop} />);
    expect(text(html)).toContain(T.jumlahPenerima(2026, 1234));
    expect(html).toContain('2025');
    expect(text(html)).not.toContain(T.kosongJudul);
    const dipilih = render(<ProgramDetailBody program={p} tahun={2025} onPilihTahun={noop} />);
    expect(text(dipilih)).toContain(T.jumlahPenerima(2025, 7));
  });
});

describe('rekap & daftar', () => {
  it('rekap per alamat menampilkan jumlah tiap alamat dan baris Lainnya', () => {
    const html = render(
      <RekapAlamatView rekap={{ tahun: 2025, total: 9, lainnya: 2, data: [{ alamat: 'Br. Satu', jumlah: 7 }] }} />,
    );
    expect(text(html)).toContain(`Br. Satu ${T.orang(7)}`);
    expect(text(html)).toContain(`${T.lainnya} ${T.orang(2)}`);
  });

  it('daftar halaman 2: nomor lanjut dari 21, hanya kolom No/Nama/Alamat, pagination tampil', () => {
    // test-only: penerima rekaan
    const state = {
      status: 'ready' as const,
      data: { page: 2, totalPages: 3, total: 45, data: [{ nama: 'Warga A', alamat: 'Br. Satu', tahun: 2025 }] },
    };
    const html = render(<DaftarPenerimaView state={state} cari="" onCari={noop} onHalaman={noop} onRetry={noop} />);
    expect(text(html)).toContain(`${T.kolomNo} ${T.kolomNama} ${T.kolomAlamat} 21 Warga A Br. Satu`);
    expect(html.match(/<th[\s>]/g)?.length).toBe(3);
    expect(html).toContain('mantine-Pagination-root');
  });

  it('daftar kosong (hasil cari) → pesan, tanpa tabel; galat → alert Coba lagi', () => {
    const kosong = { status: 'ready' as const, data: { page: 1, totalPages: 1, total: 0, data: [] } };
    const html = render(<DaftarPenerimaView state={kosong} cari="zzz" onCari={noop} onHalaman={noop} onRetry={noop} />);
    expect(text(html)).toContain(T.daftarKosong);
    expect(html).not.toContain('<table');
    const err = render(<DaftarPenerimaView state={{ status: 'error' }} cari="" onCari={noop} onHalaman={noop} onRetry={noop} />);
    expect(err).toContain('role="alert"');
    expect(text(err)).toContain(T.cobaLagi);
  });
});
