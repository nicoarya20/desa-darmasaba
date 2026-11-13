// @vitest-environment node
// Laporan Publik (Keamanan): baris daftar (status teks + warna, tanggal Indonesia), paginasi, kosong/galat,
// detail 860px dengan linimasa Kronologi → Penanganan → Status, dan modal formulir Tambah Laporan.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup; DOMPurify diganti stub yang mencatat panggilan.
import { MantineProvider, Modal } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const sanitize = vi.hoisted(() => vi.fn((html: string) => html.replace(/<script[\s\S]*?<\/script>/g, '')));
vi.mock('dompurify', () => ({ default: { sanitize } }));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn(), warn: vi.fn() } }));
vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));
// Editor tiptap tidak bisa dirender tanpa DOM; cukup pastikan dipakai dengan toolbar dasar.
vi.mock('@/app/admin/(dashboard)/ppid/_com/PPIDTextEditor', () => ({
  PPIDTextEditor: (props: { toolbar?: string; showSubmit?: boolean }) => (
    <div data-editor={props.toolbar} data-submit={String(props.showSubmit)} />
  ),
}));

import { LaporanDetailView } from '@/app/(public)/(pages)/keamanan/laporan-publik/_com/detail/LaporanDetail';
import { LaporanForm } from '@/app/(public)/(pages)/keamanan/laporan-publik/_com/LaporanForm';
import { LaporanListBody } from '@/app/(public)/(pages)/keamanan/laporan-publik/_com/LaporanPublikPage';
import st from '@/app/(public)/(pages)/keamanan/laporan-publik/_com/laporan-status.module.css';
import d from '@/app/(public)/_com/kabar-list/kabar-detail.module.css';
import l from '@/app/(public)/_com/kabar-list/kabar-list.module.css';
import kabar from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';

// Modal di portal tidak dirender di server; matikan portal agar isi formulir bisa diperiksa.
const theme = { components: { Modal: Modal.extend({ defaultProps: { withinPortal: false } }) } };
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider theme={theme}>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: entri stg 2026-11-12 (dipangkas).
const pohon = {
  id: 'cmra8yx1d000kmr0sc3k5xfpt',
  judul: 'Pohon Tumbang Menutupi Akses Jalan Desa',
  lokasi: 'Jl. Melati no.5, Banjar Teba',
  tanggalWaktu: '2026-07-07T06:05:55.128Z',
  status: 'Selesai',
  kronologi: '<p>Pohon menutup seluruh badan jalan.</p><script>alert(1)</script>',
  isActive: true,
  penanganan: [{ id: 'p1', deskripsi: '<p>Tim kebersihan bersama BPBD memotong pohon.</p>' }],
};
// test-only
const sampah = { ...pohon, id: 'cmw3b4l9', judul: 'Sampah berserakan', lokasi: '', status: 'Proses', penanganan: [] };

const list = (over: Partial<Parameters<typeof LaporanListBody>[0]['state']> = {}, search = '') =>
  render(
    <LaporanListBody
      state={{ items: [pohon, sampah], totalPages: 1, loading: false, failed: false, ...over }}
      search={search}
      page={1}
      onAdd={() => {}}
      onPage={() => {}}
    />,
  );

describe('LaporanListBody', () => {
  it('baris = tautan detail berisi judul, lokasi, tanggal Indonesia WITA, dan status teks', () => {
    const html = list();
    expect(html).toContain('href="/keamanan/laporan-publik/cmra8yx1d000kmr0sc3k5xfpt"');
    expect(html).toContain('Pohon Tumbang Menutupi Akses Jalan Desa');
    expect(html).toContain('Jl. Melati no.5, Banjar Teba');
    expect(html).toContain('<time dateTime="2026-07-07T06:05:55.128Z">Selasa, 7 Juli 2026, 14.05</time>');
    expect(html).toContain(`class="${st.status} ${st.selesai}`);
    expect(html).toMatch(/data-status="selesai"><span[^>]*><\/span>Selesai</);
    expect(html).toMatch(/data-status="proses"><span[^>]*><\/span>Dalam proses</);
    expect(html).not.toContain('Lihat Detail Kronologi');
  });

  it('status Gagal tampil "Tidak terselesaikan" (bukan "Gagal") dengan nada merah', () => {
    const html = list({ items: [{ ...pohon, status: 'Gagal' }] });
    expect(html).toMatch(/data-status="gagal"><span[^>]*><\/span>Tidak terselesaikan</);
    expect(html).toContain(`class="${st.status} ${st.gagal}`);
    expect(html).not.toMatch(/>Gagal</);
  });

  it('lokasi kosong → "Lokasi belum diisi"; daftar tidak merender HTML kronologi', () => {
    const html = list();
    expect(html).toContain('Lokasi belum diisi');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('Pohon menutup seluruh badan jalan');
  });

  it('judul bagian + tombol Tambah Laporan di bawah kepala', () => {
    const html = list();
    expect(html).toContain('<h2 id="laporan-list-title"');
    expect(html).toContain('Laporan terbaru');
    expect(html).toMatch(/<button type="button"[^>]*>.*Tambah Laporan<\/button>/);
  });

  it('paginasi hanya bila > 1 halaman', () => {
    expect(list()).not.toContain(l.pagination);
    expect(list({ totalPages: 2 })).toContain(`class="${l.pagination}"`);
  });

  it('memuat → kerangka aria-busy; kosong / cari kosong / galat → kotak pesan', () => {
    expect(list({ loading: true, items: [] })).toContain('aria-busy="true"');
    expect(list({ items: [] })).toContain(`<p class="${kabar.empty}">Belum ada laporan publik.</p>`);
    expect(list({ items: [] }, 'banjir')).toContain('Tidak ada laporan yang cocok dengan “banjir”.');
    expect(list({ items: [], failed: true })).toContain('Laporan publik gagal dimuat. Coba muat ulang halaman.');
  });
});

describe('LaporanDetailView', () => {
  const detail = (state: Parameters<typeof LaporanDetailView>[0]['state']) =>
    render(<LaporanDetailView state={state} onRetry={() => {}} />);

  it('kepala: kategori → daftar, status, judul h1 di kolom 860px', () => {
    const html = detail({ status: 'ready', data: pohon });
    expect(html).toContain(`class="${d.wrap}"`);
    expect(html).toContain(`<a href="/keamanan/laporan-publik" class="${d.kategori}">Laporan Publik</a>`);
    expect(html).toContain(`<h1 class="${d.title}">Pohon Tumbang Menutupi Akses Jalan Desa</h1>`);
    expect(html).toContain('Selasa, 7 Juli 2026, 14.05');
    expect(html).toContain('Jl. Melati no.5, Banjar Teba');
  });

  it('linimasa urut Kronologi → Penanganan → Status saat ini; HTML disanitasi', () => {
    sanitize.mockClear();
    const html = detail({ status: 'ready', data: pohon });
    const order = ['>Kronologi<', '>Penanganan<', '>Status saat ini<'].map((t) => html.indexOf(t));
    expect(order.every((i) => i > 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(sanitize).toHaveBeenCalledTimes(2);
    expect(html).toContain('Pohon menutup seluruh badan jalan.');
    expect(html).not.toContain('<script>');
    expect(html).toContain('Laporan sudah selesai ditangani.');
  });

  it('beberapa penanganan bernomor; tanpa penanganan → pesan kosong', () => {
    const dua = { ...pohon, penanganan: [pohon.penanganan[0], { id: 'p2', deskripsi: '<p>Jalan dibersihkan.</p>' }] };
    const html = detail({ status: 'ready', data: dua });
    expect(html).toContain('>Penanganan 1<');
    expect(html).toContain('>Penanganan 2<');
    expect(detail({ status: 'ready', data: sampah })).toContain('Belum ada penanganan dari pemerintah desa.');
  });

  it('status Gagal: pil "Tidak terselesaikan" + kalimat penutup di linimasa', () => {
    const html = detail({ status: 'ready', data: { ...pohon, status: 'Gagal' } });
    expect(html).toContain('Tidak terselesaikan');
    expect(html).toContain('Laporan ditutup tanpa penyelesaian.');
    expect(html).not.toMatch(/>Gagal</);
  });

  it('tidak ditemukan → pesan + tautan daftar; galat → tombol Coba lagi; memuat → aria-busy', () => {
    const nf = detail({ status: 'notfound' });
    expect(nf).toContain('Laporan tidak ditemukan atau sudah tidak ditampilkan.');
    expect(nf).toContain('Lihat semua laporan');
    expect(detail({ status: 'error' })).toMatch(/<button type="button"[^>]*>Coba lagi<\/button>/);
    expect(detail({ status: 'loading' })).toContain('aria-busy="true"');
  });
});

describe('LaporanForm', () => {
  it('modal berisi 4 isian, catatan privasi, editor toolbar dasar, tombol Batal & Kirim Laporan', () => {
    const html = render(<LaporanForm opened onClose={() => {}} onSubmitted={() => {}} />);
    expect(html).toContain('Tambah Laporan Publik');
    for (const label of ['Judul laporan', 'Lokasi kejadian', 'Tanggal dan waktu kejadian', 'Kronologi']) {
      expect(html).toContain(label);
    }
    expect(html).toContain('Jangan cantumkan data pribadi');
    expect(html).toContain('data-editor="basic" data-submit="false"');
    expect(html).toContain('Batal');
    expect(html).toContain('Kirim Laporan');
  });

  it('tertutup → tidak merender isian', () => {
    const html = render(<LaporanForm opened={false} onClose={() => {}} onSubmitted={() => {}} />);
    expect(html).not.toContain('Judul laporan');
  });
});
