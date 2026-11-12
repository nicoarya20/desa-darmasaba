// @vitest-environment node
// Daftar & detail Kontak Darurat Kesehatan (call-first): nomor tampil di daftar, tel: tanpa tab baru,
// WhatsApp hanya untuk seluler, tanpa paginasi. jsdom rusak di repo ini → markup via renderToStaticMarkup.
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn() }),
}));

import { KontakDaruratView } from '@/app/(public)/(pages)/kesehatan/kontak-darurat/_com/KontakDaruratList';
import { KontakDaruratDetailView } from '@/app/(public)/(pages)/kesehatan/kontak-darurat/_com/detail/KontakDaruratDetail';
import type { KontakDarurat } from '@/app/(public)/(pages)/kesehatan/kontak-darurat/_com/kontak-darurat.logic';
import type { KontakListState } from '@/app/(public)/(pages)/kesehatan/kontak-darurat/_com/use-kontak-darurat';
import { NATIONAL_EMERGENCY_NUMBERS } from '@/app/(public)/(pages)/kesehatan/kontak-darurat/_com/kontak-darurat.meta';
import { KONTAK_SEARCH_THRESHOLD } from '@/app/(public)/_com/kontak-darurat/kontak-darurat.meta';
import {
  NATIONAL_TEXT as N,
  KONTAK_TEXT as T,
} from '@/app/(public)/(pages)/kesehatan/kontak-darurat/_com/kontak-darurat.text';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const count = (html: string, needle: string) => html.split(needle).length - 1;
const noop = () => {};

// test-only: mirip data stg (4 kontak, satu telepon tetap 0361).
const items: KontakDarurat[] = [
  {
    id: 'k1',
    name: 'Kantor Desa Darmasaba',
    deskripsi: '<p>Kontak awal rujukan layanan kesehatan.</p>',
    whatsapp: '081239580000',
    image: { link: '/api/img/kantor.webp' },
  },
  { id: 'k2', name: 'UPTD Puskesmas Abiansemal III', deskripsi: '<p>Layanan 24 jam.</p>', whatsapp: '03618463263' },
  { id: 'k3', name: 'Puskesmas Pembantu Darmasaba', deskripsi: '', whatsapp: '089647037430', image: null },
  { id: 'k4', name: 'Posko Tanpa Nomor', deskripsi: '<p>Belum lengkap</p>', whatsapp: '' },
];

describe('KontakDaruratView (daftar)', () => {
  const html = render(<KontakDaruratView state={{ status: 'ready', items }} onRetry={noop} />);

  it('judul h1 dan semua kontak tampil sekaligus, tanpa paginasi', () => {
    expect(html).toMatch(new RegExp(`<h1[^>]*>${T.title}</h1>`));
    expect(count(html, '<h3')).toBe(4 + NATIONAL_EMERGENCY_NUMBERS.length);
    expect(html).toContain(T.listTitle);
    expect(html).not.toContain('mantine-Pagination');
  });

  it('nomor besar tampil di daftar dalam format terbaca', () => {
    expect(html).toContain('0812 3958 0000');
    expect(html).toContain('(0361) 846 3263');
    expect(html).toContain('0896 4703 7430');
  });

  it('Telepon untuk tiap nomor (tel: tanpa target), WhatsApp hanya untuk 2 nomor seluler', () => {
    expect(html).toContain('href="tel:+6281239580000"');
    expect(html).toContain('href="tel:+623618463263"');
    expect(count(html, 'href="tel:')).toBe(3 + 2);
    expect(html).not.toMatch(/href="tel:[^"]*"[^>]*target=/);
    expect(count(html, 'href="https://wa.me/')).toBe(2);
    expect(html).not.toContain('wa.me/623618463263');
    expect(html).toContain('href="https://wa.me/6281239580000" target="_blank" rel="noopener noreferrer"');
  });

  it('nomor kosong ditulis jujur tanpa tombol; catatan WhatsApp tampil karena ada telepon tetap', () => {
    expect(html).toContain(T.noNumber);
    expect(html).toContain(T.waNote);
  });

  it('nama = tautan detail; deskripsi diratakan jadi teks; foto hanya bila ada', () => {
    expect(html).toContain('href="/kesehatan/kontak-darurat/k1"');
    expect(html).toContain('Kontak awal rujukan layanan kesehatan.');
    expect(html).not.toContain('<p>Kontak awal');
    expect(count(html, 'src="/api/img/')).toBe(1);
    expect(html).not.toContain('no-image');
  });

  it(`kolom cari tersembunyi untuk ≤ ${KONTAK_SEARCH_THRESHOLD} kontak, tampil bila lebih`, () => {
    expect(html).not.toContain('role="search"');
    const many = Array.from({ length: KONTAK_SEARCH_THRESHOLD + 1 }, (_, i) => ({ ...items[0], id: `m${i}` }));
    const withSearch = render(<KontakDaruratView state={{ status: 'ready', items: many }} onRetry={noop} />);
    expect(withSearch).toContain('role="search"');
    expect(withSearch).not.toContain(T.waNote);
  });

  it('memuat → kerangka aria-busy; kosong → pesan; galat → pesan + Coba lagi', () => {
    expect(render(<KontakDaruratView state={{ status: 'loading' }} onRetry={noop} />)).toContain('aria-busy="true"');
    expect(render(<KontakDaruratView state={{ status: 'ready', items: [] }} onRetry={noop} />)).toContain(T.empty);
    const error = render(<KontakDaruratView state={{ status: 'error' }} onRetry={noop} />);
    expect(error).toContain(T.error);
    expect(error).toContain(`>${T.retry}</button>`);
  });

  it('tanpa em dash di teks UI', () => {
    expect(JSON.stringify(T)).not.toContain('—');
  });
});

describe('Blok Darurat nasional', () => {
  const html = render(<KontakDaruratView state={{ status: 'ready', items }} onRetry={noop} />);

  it('112 & 119 tampil di atas daftar desa dengan tombol tel: apa adanya, tanpa WhatsApp', () => {
    expect(html).toMatch(new RegExp(`<h2[^>]*>${N.title}</h2>`));
    expect(html.indexOf(N.title)).toBeLessThan(html.indexOf(T.listTitle));
    for (const number of NATIONAL_EMERGENCY_NUMBERS) {
      expect(html).toContain(`href="tel:${number}"`);
      expect(html).toContain(`aria-label="${N.callLabel(number, N.items[number].name)}"`);
      expect(html).not.toContain(`wa.me/${number}`);
    }
    expect(html).toContain('Satu nomor untuk polisi, ambulans, dan pemadam kebakaran.');
  });

  it('tetap tampil saat daftar desa memuat, gagal, atau kosong', () => {
    const states: KontakListState[] = [{ status: 'loading' }, { status: 'error' }, { status: 'ready', items: [] }];
    for (const state of states) {
      const out = render(<KontakDaruratView state={state} onRetry={noop} />);
      expect(out).toContain('href="tel:112"');
      expect(out).toContain('href="tel:119"');
    }
  });
});

describe('KontakDaruratDetailView', () => {
  it('kategori → daftar, h1 nama, nomor + Telepon + WhatsApp, deskripsi HTML, foto', () => {
    const html = render(<KontakDaruratDetailView state={{ status: 'ready', data: items[0] }} onRetry={noop} />);
    expect(html).toContain('href="/kesehatan/kontak-darurat"');
    expect(html).toMatch(/<h1[^>]*>Kantor Desa Darmasaba<\/h1>/);
    expect(html).toContain('0812 3958 0000');
    expect(html).toContain('href="tel:+6281239580000"');
    expect(html).not.toMatch(/href="tel:[^"]*"[^>]*target=/);
    expect(html).toContain('href="https://wa.me/6281239580000"');
    expect(html).toContain('<p>Kontak awal rujukan layanan kesehatan.</p>');
    expect(html).toContain(`alt="${T.photoAlt('Kantor Desa Darmasaba')}"`);
    expect(html).not.toMatch(/>(Judul|Deskripsi|Gambar)</);
  });

  it('telepon tetap → tanpa WhatsApp; tanpa foto → figure tidak dirender', () => {
    const html = render(<KontakDaruratDetailView state={{ status: 'ready', data: items[1] }} onRetry={noop} />);
    expect(html).toContain('(0361) 846 3263');
    expect(html).not.toContain('wa.me');
    expect(html).not.toContain('<figure');
  });

  it('tidak ditemukan → pesan + tautan daftar; galat → Coba lagi', () => {
    const nf = render(<KontakDaruratDetailView state={{ status: 'notfound' }} onRetry={noop} />);
    expect(nf).toContain(T.notFound);
    expect(nf).toContain(T.backToList);
    const err = render(<KontakDaruratDetailView state={{ status: 'error' }} onRetry={noop} />);
    expect(err).toContain(T.detailError);
    expect(err).toContain(`>${T.retry}</button>`);
  });
});
