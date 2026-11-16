// @vitest-environment node
// Detail Kegiatan Desa publik: kepala gaya Berita/Pengumuman, lokasi & partisipan, foto, panel pembangunan.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn() }),
}));
// test-only: keadaan muat detail diatur per test (komponen KegiatanDetail utuh).
const detailState = vi.hoisted(() => ({ current: { status: 'loading' } as KegiatanDetailState }));
vi.mock('@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/detail/use-kegiatan-detail', () => ({
  useKegiatanDetail: () => detailState.current,
}));
import {
  KegiatanDetail as KegiatanDetailPage,
  KegiatanDetailBody,
} from '@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/detail/KegiatanDetail';
import type { KegiatanDetailState } from '@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/detail/use-kegiatan-detail';
import back from '@/app/(public)/(pages)/ekonomi/umkm/_com/detail-umkm/detail-umkm.module.css';
import { BACK_BUTTON_LABEL } from '@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto';
import type { KegiatanDetail } from '@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/detail/kegiatan-detail.source';
import s from '@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/detail/kegiatan-detail.module.css';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import { KATEGORI_PEMBANGUNAN_ID } from '@/lib/kegiatan-pembangunan';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: detail kegiatan stg.
const data = (over: Partial<KegiatanDetail> = {}): KegiatanDetail => ({
  id: 'k1',
  judul: 'Gotong Royong dan Rapat Rutin TP PKK Desa Darmasaba',
  deskripsiSingkat: 'Gotong royong bersama TP PKK di Pura Dalem Kangin.',
  deskripsiLengkap: '<p>Pada tanggal 26 Mei 2022, TP PKK melaksanakan gotong royong.</p>',
  tanggal: '2022-05-26T00:00:00.000Z',
  lokasi: 'Pura Dalem Kangin, Desa Adat Tegal',
  partisipan: 1200,
  image: { link: '/api/img/k1.webp' },
  kategoriKegiatanId: 'cmknan39v000004l8eiql149r',
  kategoriKegiatan: { nama: 'Lingkungan' },
  ...over,
});

describe('KegiatanDetailBody', () => {
  it('kategori (tautan ke daftar kategori) · tanggal WITA, judul h1, ringkasan, lokasi & partisipan', () => {
    const html = render(<KegiatanDetailBody data={data()} />);
    expect(html).toContain(`href="/pemerintahan/kegiatan-desa/lingkungan" class="${d.kategori}">Lingkungan</a>`);
    expect(html).toContain('Kamis, 26 Mei 2022');
    expect(html).toContain(`<h1 class="${d.title}">Gotong Royong dan Rapat Rutin TP PKK Desa Darmasaba</h1>`);
    expect(html).toContain(`class="${s.lead}">Gotong royong bersama TP PKK di Pura Dalem Kangin.</p>`);
    expect(html).toContain('Pura Dalem Kangin, Desa Adat Tegal');
    expect(html).toContain('1.200 partisipan');
  });

  it('foto utama menaut ke ukuran penuh; isi HTML dirender tanpa justify', () => {
    const html = render(<KegiatanDetailBody data={data()} />);
    expect(html).toContain('href="/api/img/k1.webp" target="_blank"');
    expect(html).toContain(`class="${d.content}"><p>Pada tanggal 26 Mei 2022`);
    expect(html).not.toContain('justify');
  });

  it('tanpa foto/lokasi/ringkasan → bagian itu tidak dirender, partisipan kosong = 0', () => {
    const html = render(
      <KegiatanDetailBody data={data({ image: null, lokasi: ' ', deskripsiSingkat: null, partisipan: null })} />,
    );
    expect(html).not.toContain(d.photo);
    expect(html).not.toContain(s.lead);
    expect(html).toContain('0 partisipan');
  });

  it('panel progres pembangunan hanya untuk kategori Pembangunan', () => {
    expect(render(<KegiatanDetailBody data={data()} />)).not.toContain('data-kegiatan-pembangunan');
    const html = render(
      <KegiatanDetailBody
        data={data({
          kategoriKegiatanId: KATEGORI_PEMBANGUNAN_ID,
          kategoriKegiatan: { nama: 'Pembangunan' },
          statusPembangunan: 'berjalan',
          progres: 60,
          anggaran: 150000000,
          sumberDana: 'Dana Desa',
        })}
      />,
    );
    expect(html).toContain('data-kegiatan-pembangunan');
    expect(html).toContain('Progres Pembangunan');
    expect(html).toContain('60%');
    expect(html).toContain('Dana Desa');
  });
});

describe('KegiatanDetail prop list (pemakai lain, mis. Gotong Royong)', () => {
  const list = { label: 'Gotong Royong', href: '/lingkungan/gotong-royong' };

  it('tanpa list: tombol ikon kembali, kategori menaut ke daftar Kegiatan Desa (tampilan Kegiatan Desa)', () => {
    detailState.current = { status: 'ready', data: data() };
    const html = render(<KegiatanDetailPage id="k1" />);
    expect(html).toContain(`aria-label="${BACK_BUTTON_LABEL}"`);
    expect(html).not.toContain(`class="${back.back}"`);
    expect(html).toContain('href="/pemerintahan/kegiatan-desa/lingkungan"');
  });

  it('dengan list: tautan teks "‹ label" ke daftar, tanpa tombol ikon, kategori teks biasa', () => {
    detailState.current = { status: 'ready', data: data() };
    const html = render(<KegiatanDetailPage id="k1" list={list} />);
    expect(html).toMatch(new RegExp(`<a href="/lingkungan/gotong-royong" class="${back.back}"><svg[^]*?</svg>Gotong Royong</a>`));
    expect(html).not.toContain(`aria-label="${BACK_BUTTON_LABEL}"`);
    expect(html).toContain(`<span class="${d.kategori}">Lingkungan</span>`);
    expect(html).not.toContain('/pemerintahan/kegiatan-desa');
  });

  it('tidak ditemukan: "Lihat semua kegiatan" menuju list.href bila ada, daftar Kegiatan Desa bila tidak', () => {
    detailState.current = { status: 'notfound' };
    expect(render(<KegiatanDetailPage id="x" list={list} />)).toContain(`href="/lingkungan/gotong-royong" class="${d.emptyLink}"`);
    expect(render(<KegiatanDetailPage id="x" />)).toContain(`href="/pemerintahan/kegiatan-desa/semua" class="${d.emptyLink}"`);
  });
});
