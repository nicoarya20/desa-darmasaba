// @vitest-environment node
// Program Kesehatan publik: kartu gaya Kegiatan Desa (indikator disaring), Manfaat, detail; kepala tanpa pil.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
import { ProgramDetailBody } from '@/app/(public)/(pages)/kesehatan/program-kesehatan/_com/detail/ProgramDetail';
import ds from '@/app/(public)/(pages)/kesehatan/program-kesehatan/_com/detail/program-detail.module.css';
import { ProgramKesehatanBody } from '@/app/(public)/(pages)/kesehatan/program-kesehatan/_com/ProgramKesehatanPage';
import { ProgramManfaat } from '@/app/(public)/(pages)/kesehatan/program-kesehatan/_com/ProgramManfaat';
import { toKegiatanList } from '@/app/(public)/(pages)/kesehatan/program-kesehatan/_com/program.logic';
import { KabarListHeader } from '@/app/(public)/_com/kabar-list/KabarListHeader';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import l from '@/app/(public)/_com/kabar-list/kabar-list.module.css';
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import rt from '@/app/(public)/_com/rich-text/rich-text.module.css';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: entri stg 2026-11-12 (dipangkas).
const kegiatan = (i: number) => ({
  id: `k${i}`,
  name: `Kegiatan ${i}`,
  deskripsiSingkat: `<p>Ringkasan ${i}</p>`,
  deskripsi: '<p>Isi kegiatan</p>',
  persentase: 0,
  createdAt: '2026-04-14T07:38:56.375Z',
  updatedAt: '2026-05-05T09:30:20.570Z',
  image: { link: `/api/img/k${i}.webp` },
});
// test-only
const gizi = {
  id: 'prog_kes_gizi_001',
  name: 'Gizi Baik',
  deskripsiSingkat: '<p>Persentase balita dengan status gizi baik.</p>',
  deskripsi: '<p>Program pemantauan gizi balita dilaksanakan melalui posyandu.</p>',
  persentase: 86,
  createdAt: '2026-05-05T09:30:23.221Z',
  updatedAt: '2026-11-02T06:30:12.846Z',
  image: null,
};

const ready = (items: unknown[]) => ({ status: 'ready' as const, kegiatan: toKegiatanList(items as never), refreshing: false });
const body = (state: Parameters<typeof ProgramKesehatanBody>[0]['state'], search = '', page = 1) =>
  render(<ProgramKesehatanBody state={state} search={search} page={page} onPage={() => {}} />);

describe('ProgramKesehatanBody', () => {
  it('indikator tidak dirender sama sekali (tanpa ubin, tanpa kartu tanpa foto)', () => {
    const html = body(ready([gizi, kegiatan(1)]));
    expect(html).not.toContain('Gizi Baik');
    expect(html).not.toContain('86%');
    expect(html).not.toContain('Capaian kesehatan');
    expect(html).toContain(`<h3 class="${kabar.featuredTitle}"><span class="${r.title}">Kegiatan 1</span></h3>`);
  });

  it('tanpa label penulis palsu, tanpa gradasi/justify lama', () => {
    const html = body(ready([gizi, kegiatan(1), kegiatan(2)]));
    expect(html).not.toContain('Admin Desa');
    expect(html).not.toContain('justify');
    expect(html).not.toContain('Lihat Detail');
  });

  it('7 kegiatan per halaman: halaman 2 dari 9 kegiatan berisi 2 terakhir + paginasi', () => {
    const items = Array.from({ length: 9 }, (_, i) => kegiatan(i + 1));
    const html = body(ready(items), '', 2);
    expect(html).toContain(`<span class="${r.title}">Kegiatan 8</span></h3>`);
    expect(html).toContain(`<span class="${r.title}">Kegiatan 9</span></h3>`);
    expect(html).not.toContain(`<span class="${r.title}">Kegiatan 7</span></h3>`);
    expect(html).toContain('aria-label="Halaman daftar program kesehatan"');
  });

  it('kosong / cari tanpa hasil / galat → kotak pesan jujur', () => {
    expect(body(ready([]))).toContain(`<p class="${kabar.empty}">Belum ada program kesehatan.</p>`);
    expect(body(ready([gizi]), 'gizi')).toContain(`<p class="${kabar.empty}">Tidak ada program atau kegiatan yang cocok dengan “gizi”.</p>`);
    expect(body({ status: 'error' })).toContain('Program kesehatan gagal dimuat. Coba muat ulang halaman.');
  });

  it('memuat → kerangka kartu', () => {
    const html = body({ status: 'loading' });
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('aria-label="Memuat program kesehatan"');
  });

  it('kata kunci baru sedang dimuat → kartu lama tetap tampil di wadah aria-busy, bukan kerangka', () => {
    const html = body({ ...ready([kegiatan(1)]), refreshing: true }, 'posyandu');
    expect(html).toMatch(/<div class="[^"]+" aria-busy="true">/);
    expect(html).toContain('Kegiatan 1');
    expect(html).not.toContain('aria-label="Memuat program kesehatan"');
  });
});

describe('ProgramManfaat', () => {
  it('isi teks lama dipertahankan, tanpa kelas animasi/hover lama', () => {
    const html = render(<ProgramManfaat />);
    expect(html).toContain('Manfaat Program Kesehatan');
    expect(html).toContain('Menjaga Tubuh Bugar');
    expect(html).toContain('Menguatkan Kebersamaan');
    expect(html).toContain('Dukungan untuk Lansia');
    expect(html).toContain('Membantu lansia tetap aktif, sehat, dan bahagia');
    expect(html).not.toContain('pulse-icon');
    expect(html).not.toContain('hover-glow');
  });
});

describe('ProgramDetailBody', () => {
  it('kegiatan: tanggal WITA, judul h1, ringkasan teks, foto ukuran penuh, isi HTML', () => {
    const html = render(<ProgramDetailBody data={kegiatan(3)} />);
    expect(html).toContain('Selasa, 14 April 2026');
    expect(html).toContain(`<h1 class="${d.title}">Kegiatan 3</h1>`);
    expect(html).toContain(`<p class="${ds.lead}">Ringkasan 3</p>`);
    expect(html).toContain('href="/api/img/k3.webp" target="_blank"');
    // Wadah isi HTML: kelas konten + penetral rich text (rt.root, dark theme); toleran kelas tambahan.
    const isiClass = html.match(/class="([^"]+)"><p>Isi kegiatan<\/p>/)?.[1].split(' ');
    expect(isiClass).toEqual(expect.arrayContaining([d.content, rt.root]));
    expect(html).not.toContain('data-program-indikator');
    expect(html).not.toContain('Admin Desa');
  });

  it('indikator: label Indikator kesehatan + angka persen + tanggal pembaruan, tanpa foto', () => {
    const html = render(<ProgramDetailBody data={gizi} />);
    expect(html).toContain(`<span class="${d.kategori}">Indikator kesehatan</span>`);
    expect(html).toContain(`<span class="${ds.figureValue}">86%</span>`);
    expect(html).toContain('Data diperbarui 2 November 2026');
    expect(html).not.toContain(d.photo);
  });
});

describe('KabarListHeader tanpa kategori', () => {
  const header = (tabs: Parameters<typeof KabarListHeader>[0]['tabs']) =>
    render(
      <KabarListHeader
        title="Program Kesehatan Desa"
        lead="Pengantar"
        searchLabel="Cari"
        searchPlaceholder="Cari"
        kategoriLabel="Kategori"
        tabs={tabs}
        search=""
        onSearch={() => {}}
      />,
    );

  it('tabs kosong → tanpa <nav> pil; ada tab → nav pil tetap dirender', () => {
    const empty = header([]);
    expect(empty).toContain('Program Kesehatan Desa');
    expect(empty).not.toContain('<nav');
    const withTabs = header([{ key: 'semua', href: '/x/semua', label: 'Semua', active: true }]);
    expect(withTabs).toContain(`<nav class="${l.pills}" aria-label="Kategori">`);
    expect(withTabs).toContain('aria-current="page"');
  });
});
