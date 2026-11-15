// @vitest-environment node
// Detail buku Perpustakaan Digital publik: status (memuat/tidak ditemukan/galat), isi (sampul, kategori, h1,
// deskripsi aman, tombol pinjam, cara meminjam), rel buku lain, dan modal pinjam (formulir + layar terkirim).
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup; tidak ada POST (sumber kiriman di-mock).
import { createTheme, MantineProvider, Modal } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LoadState } from '@/app/(public)/_com/lazy-load/use-lazy-load';
import type { Buku } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/perpus.types';

const h = vi.hoisted(() => ({
  katalog: { status: 'loading' } as LoadState<Buku[]>,
  kirim: vi.fn(),
}));

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
vi.mock('@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/PerpusDataProvider', () => ({
  usePerpusData: () => ({ state: h.katalog, retry: () => undefined }),
}));
vi.mock('@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_lib/peminjaman.source', () => ({
  kirimPeminjaman: h.kirim,
}));

import { BukuDetailBody } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/detail/BukuDetailBody';
import { BukuDetailStatus } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/detail/BukuDetailStatus';
import { BukuLainnya } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/detail/BukuLainnya';
import { BUKU_DETAIL_TEXT as T } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_com/perpus.text';
import ModalPeminjaman from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_lib/modalPeminjaman';
import { PINJAM_TEXT as P } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_lib/peminjaman.text';
import { PinjamSukses } from '@/app/(public)/(pages)/pendidikan/perpustakaan-digital/_lib/PinjamSukses';

// Modal di portal tidak dirender di server; matikan portal agar isinya bisa diperiksa.
const theme = createTheme({ components: { Modal: Modal.extend({ defaultProps: { withinPortal: false } }) } });
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider theme={theme}>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const count = (html: string, needle: string) => html.split(needle).length - 1;
const noop = () => {};

const KAT = { id: 'k1', nama: 'Anak Dan Remaja', slug: 'anak-dan-remaja' };
// test-only: bentuk hasil adapter (deskripsi sudah disanitasi adapter).
const buku = (id: string, over: Partial<Buku> = {}): Buku => ({
  id,
  judul: `Buku ${id}`,
  deskripsiHtml: '<p>Kisah <strong>rakyat</strong> Bali.</p>',
  ringkasan: 'Kisah rakyat Bali.',
  kategori: KAT,
  sampul: null,
  dibuat: 0,
  ...over,
});

beforeEach(() => {
  h.katalog = { status: 'loading' };
  h.kirim.mockReset();
});

describe('BukuDetailStatus', () => {
  it('memuat → kerangka role=status berlabel', () => {
    const html = render(<BukuDetailStatus status="loading" onRetry={noop} />);
    expect(html).toContain(`role="status" aria-label="${T.memuat}"`);
  });

  it('tidak ditemukan → pesan tanpa tombol; galat → alert + Coba lagi', () => {
    const nf = render(<BukuDetailStatus status="notFound" onRetry={noop} />);
    expect(text(nf)).toBe(`${T.notFoundTitle} ${T.notFoundDesc}`);
    expect(nf).not.toContain('<button');
    const err = render(<BukuDetailStatus status="error" onRetry={noop} />);
    expect(err).toContain('role="alert"');
    expect(text(err)).toBe(`${T.errorTitle} ${T.errorDesc} ${T.cobaLagi}`);
  });
});

describe('BukuDetailBody', () => {
  it('kategori (tautan daftar) → h1 → deskripsi HTML → tombol Pinjam → Cara meminjam 3 langkah (4 hari)', () => {
    const html = render(<BukuDetailBody buku={buku('a', { judul: 'Dongeng Bali' })} />);
    expect(count(html, '<h1')).toBe(1);
    expect(html).toContain('>Dongeng Bali</h1>');
    expect(html).toContain('href="/pendidikan/perpustakaan-digital/anak-dan-remaja"');
    expect(html).toContain('<p>Kisah <strong>rakyat</strong> Bali.</p>');
    expect(html).toMatch(new RegExp(`<button type="button"[^>]*>.*${T.pinjam}</button>`));
    expect(text(html)).toContain(`${T.caraTitle} ${T.caraLangkah(4).join(' ')}`);
    expect(T.caraLangkah(4)[2]).toContain('4 hari');
    const t = text(html);
    expect(t.indexOf('Anak Dan Remaja')).toBeLessThan(t.indexOf('Dongeng Bali'));
    expect(t.indexOf('Kisah rakyat')).toBeLessThan(t.indexOf(T.pinjam));
  });

  it('deskripsi kosong → teks "belum ada"; modal tertutup tidak merender formulir', () => {
    const html = render(<BukuDetailBody buku={buku('a', { deskripsiHtml: '' })} />);
    expect(text(html)).toContain(T.deskripsiKosong);
    expect(html).not.toContain('<form');
  });
});

describe('BukuLainnya', () => {
  it('katalog belum siap → tidak dirender', () => {
    expect(render(<BukuLainnya current={buku('a')} />)).toBe('');
  });

  it('tidak ada buku lain di kategori → tidak dirender', () => {
    h.katalog = { status: 'ready', data: [buku('a'), buku('z', { kategori: { id: 'k9', nama: 'Sains', slug: 'sains' } })] };
    expect(render(<BukuLainnya current={buku('a')} />)).toBe('');
  });

  it('ada → judul h2 + jumlah + kartu kategori sama tanpa buku ini, terbaru dulu', () => {
    h.katalog = {
      status: 'ready',
      data: [buku('a'), buku('b', { dibuat: 1 }), buku('c', { dibuat: 5 }), buku('z', { kategori: null })],
    };
    const html = render(<BukuLainnya current={buku('a')} />);
    expect(html).toContain(`>${T.lainTitle}</h2>`);
    expect(text(html)).toContain(T.lainJumlah(2));
    expect(count(html, '<a ')).toBe(2);
    expect(html.indexOf('/anak-dan-remaja/c')).toBeLessThan(html.indexOf('/anak-dan-remaja/b'));
    expect(html).not.toContain('/anak-dan-remaja/a"');
  });
});

describe('ModalPeminjaman', () => {
  const pinjam = { id: 'a', judul: 'Dongeng Bali', sampul: null, kategoriNama: 'Anak Dan Remaja' };

  it('terbuka → kepala buku + formulir (5 isian, privasi, Batal/Kirim); belum ada POST', () => {
    const html = render(<ModalPeminjaman opened onClose={noop} buku={pinjam} />);
    expect(text(html)).toContain(P.title);
    expect(text(html)).toContain('Anak Dan Remaja Dongeng Bali');
    for (const label of [P.nama, P.telp, P.alamat, P.tanggal, P.catatan]) expect(text(html)).toContain(label);
    expect(count(html, '<input')).toBeGreaterThanOrEqual(3);
    expect(count(html, '<textarea')).toBeGreaterThanOrEqual(1);
    expect(html).toContain('type="tel"');
    expect(text(html)).toContain('+62');
    expect(text(html)).toContain(P.hitung(0, 500));
    expect(text(html)).toContain(P.privasi);
    expect(html).toMatch(new RegExp(`type="submit"[\\s\\S]*${P.kirim}`));
    expect(text(html)).toContain(P.batal);
    expect(html).not.toContain('role="alert"');
    expect(h.kirim).not.toHaveBeenCalled();
  });

  it('buku null atau tertutup → tidak ada isi', () => {
    expect(render(<ModalPeminjaman opened onClose={noop} buku={null} />)).not.toContain('<form');
    expect(render(<ModalPeminjaman opened={false} onClose={noop} buku={pinjam} />)).not.toContain('<form');
  });
});

describe('PinjamSukses', () => {
  it('layar terkirim: judul, nomor +62, tanggal ambil & batas kembali (+4 hari), tombol Selesai', () => {
    const html = render(<PinjamSukses tanggalAmbil="2026-11-16" telp="81234567890" onClose={noop} />);
    expect(html).toContain('role="status"');
    expect(text(html)).toBe(
      `${P.suksesTitle} ${P.suksesDesc} (+6281234567890) ${P.suksesAmbil} Senin, 16 November 2026 ${P.suksesBatas} Jumat, 20 November 2026 ${P.selesai}`,
    );
  });
});
