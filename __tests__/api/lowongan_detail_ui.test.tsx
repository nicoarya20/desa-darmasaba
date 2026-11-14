// @vitest-environment node
// Halaman detail lowongan kerja publik (gaya Welcome to the Jungle): kepala + pil, section teks kaya, Tempat kerja,
// aksi kontak (WhatsApp/Telepon), penutup, bilah melayang, dan keadaan memuat/tidak ditemukan/galat.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup (efek & observer tidak jalan).
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes, ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  LowonganDetail as Detail,
  LowonganDetailState,
} from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/detail/lowongan-detail.types';

const h = vi.hoisted(() => ({ state: { status: 'loading' } as LowonganDetailState }));

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn() }),
}));
vi.mock('@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/detail/use-lowongan-detail', () => ({
  useLowonganDetail: () => ({ state: h.state, reload: () => undefined }),
}));

import { BACK_BUTTON_LABEL } from '@/app/(public)/(pages)/pemerintahan/layanan/_com/BackButto';
import { DetailStatus } from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/detail/DetailStatus';
import {
  LowonganDetail,
  LowonganDetailBody,
} from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/detail/LowonganDetail';
import k from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/detail/kontak-aksi.module.css';
import {
  isBarVisible,
  letakDari,
} from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/detail/kontak-bar.logic';
import { LOWONGAN_DETAIL_TEXT as T } from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/detail/lowongan-detail.text';
import c from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/lowongan-card.module.css';
import { LOWONGAN_CARD_TEXT as C } from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/lowongan-card.text';

const render = (node: ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const count = (html: string, needle: string) => html.split(needle).length - 1;

const WA = 'https://wa.me/6281234567890?text=Halo';
const TEL = 'tel:+6281234567890';

// test-only: bentuk hasil adapter Sesi B (toLowonganDetail).
const detail = (over: Partial<Detail> = {}): Detail => ({
  id: 'l1',
  posisi: 'Barista',
  pemberiKerja: 'Warung Sari',
  tipe: 'Full Time',
  tipeKey: 'full time',
  lokasi: 'Jl. Raya Darmasaba No. 1',
  diDesa: true,
  gaji: 2500000,
  ringkasan: 'Meracik kopi.',
  tayangMs: Date.parse('2026-11-03T02:00:00.000Z'),
  deskripsi: { kind: 'html', html: '<p>Meracik <strong>kopi</strong>.</p>' },
  kualifikasi: { kind: 'html', html: '<ul><li><p>Jujur</p></li><li><p>Ramah</p></li></ul>' },
  kontak: { display: '0812-3456-7890', telHref: TEL, waHref: WA },
  petaHref: 'https://www.google.com/maps/search/?api=1&query=Jl.%20Raya%20Darmasaba%20No.%201',
  ...over,
});

beforeEach(() => {
  h.state = { status: 'loading' };
});

describe('LowonganDetailBody: kepala', () => {
  it('h1 posisi, pemberi kerja, inisial tersembunyi, pil tipe · gaji · lokasi kerja, tanggal tayang', () => {
    const html = render(<LowonganDetailBody data={detail()} />);
    expect(count(html, '<h1')).toBe(1);
    expect(html).toMatch(/<h1[^>]*>Barista<\/h1>/);
    expect(html).toContain('>Warung Sari</p>');
    expect(html).toMatch(/aria-hidden="true">WS<\/div>/);
    expect(count(html, `class="${c.pill}"`)).toBe(3);
    expect(html).toContain(`<span>${C.gajiPerBulan('Rp2.500.000')}</span>`);
    expect(html).toContain('<span>Full Time</span>');
    expect(html).toContain('<span>Di dalam desa</span>');
    expect(html).toContain('<time dateTime="2026-11-03T02:00:00.000Z">3 November 2026</time>');
    expect(html).not.toContain('NaN');
  });

  it('gaji tak terbaca → pil redup "Gaji tidak dicantumkan"; luar desa; tanpa tipe → pil tipe hilang', () => {
    const html = render(<LowonganDetailBody data={detail({ gaji: null, diDesa: false, tipe: null, tipeKey: null })} />);
    expect(html).toMatch(new RegExp(`class="${c.pill}" data-muted="true"><svg[\\s\\S]*?<span>${C.gajiKosong}</span>`));
    expect(html).toContain('<span>Di luar desa</span>');
    expect(count(html, `class="${c.pill}"`)).toBe(2);
  });

  it('tanpa alamat → pil lokasi kerja, alamat, dan tautan peta tidak tampil', () => {
    const html = render(<LowonganDetailBody data={detail({ lokasi: null, diDesa: false, petaHref: null })} />);
    expect(html).not.toContain('desa</span>');
    expect(html).not.toContain(T.bukaPeta);
    expect(html).toContain(`>${T.tempatKerja}</h2>`);
  });
});

describe('LowonganDetailBody: isi', () => {
  it('section Deskripsi & Kualifikasi berjudul h2; HTML tersanitasi dari adapter dirender apa adanya', () => {
    const html = render(<LowonganDetailBody data={detail()} />);
    expect(text(html)).toContain(`${T.deskripsi} Meracik kopi .`);
    expect(html).toContain('<p>Meracik <strong>kopi</strong>.</p>');
    expect(html).toContain('<ul><li><p>Jujur</p></li><li><p>Ramah</p></li></ul>');
    expect(html).toMatch(new RegExp(`<h2[^>]*><span[^>]*aria-hidden="true"><svg[\\s\\S]*?</span>${T.kualifikasi}</h2>`));
  });

  it('RichText null → section tidak dirender', () => {
    const html = render(<LowonganDetailBody data={detail({ deskripsi: null })} />);
    expect(html).not.toContain(T.deskripsi);
    expect(html).toContain(T.kualifikasi);
    const none = render(<LowonganDetailBody data={detail({ deskripsi: null, kualifikasi: null })} />);
    expect(none).not.toContain(T.kualifikasi);
  });

  it('teks polos → satu <p> per paragraf, markup di dalamnya di-escape (tanpa innerHTML)', () => {
    const html = render(
      <LowonganDetailBody data={detail({ deskripsi: { kind: 'text', paragraphs: ['Baris satu', '<b>dua</b>'] } })} />,
    );
    expect(html).toContain('<p>Baris satu</p><p>&lt;b&gt;dua&lt;/b&gt;</p>');
    expect(html).not.toContain('<b>dua</b>');
  });

  it('Tempat kerja: pemberi kerja, alamat, Google Maps di tab baru, nomor tampilan', () => {
    const html = render(<LowonganDetailBody data={detail()} />);
    expect(text(html)).toContain(`${T.tempatKerja} Warung Sari Jl. Raya Darmasaba No. 1 ${T.bukaPeta}`);
    expect(html).toMatch(
      /<a [^>]*href="https:\/\/www\.google\.com\/maps\/search\/\?api=1&amp;query=[^"]+" target="_blank" rel="noopener noreferrer">/,
    );
    expect(html).toContain('0812-3456-7890');
  });
});

describe('LowonganDetailBody: kontak', () => {
  it('nomor seluler → WhatsApp (isi, tab baru) + Telepon (garis) di kepala, penutup, dan bilah', () => {
    const html = render(<LowonganDetailBody data={detail()} />);
    expect(count(html, `href="${WA}"`)).toBe(3);
    expect(count(html, `href="${TEL}"`)).toBe(3);
    expect(html).toContain(`data-tone="fill" href="${WA}" target="_blank" rel="noopener noreferrer"`);
    expect(html).toContain(`data-tone="line" href="${TEL}"`);
    expect(text(html)).toContain(T.penutupJudul);
    expect(text(html)).toContain(T.penutupAjak('Warung Sari', true));
  });

  it('nomor rumah/kantor (waHref null) → hanya Telepon, tombol isi; ajakan tanpa WhatsApp', () => {
    const kontak = { display: '(0361) 123456', telHref: 'tel:+62361123456', waHref: null };
    const html = render(<LowonganDetailBody data={detail({ kontak })} />);
    expect(html).not.toContain('wa.me');
    expect(html).not.toContain(`>${T.whatsapp}<`);
    expect(count(html, 'data-tone="fill" href="tel:+62361123456"')).toBe(3);
    expect(html).not.toContain('data-tone="line"');
    expect(text(html)).toContain(T.penutupAjak('Warung Sari', false));
  });

  it('tanpa kontak → "Kontak belum dicantumkan", tanpa tombol, penutup, maupun bilah melayang', () => {
    const html = render(<LowonganDetailBody data={detail({ kontak: null })} />);
    expect(text(html)).toContain(T.kontakKosong);
    expect(html).not.toContain('href="tel:');
    expect(html).not.toContain('wa.me');
    expect(html).not.toContain(T.penutupJudul);
    expect(html).not.toContain(`class="${k.bar}"`);
  });

  it('bilah melayang dirender tersembunyi (inert) sampai observer menyatakan aksi kepala lewat', () => {
    const html = render(<LowonganDetailBody data={detail()} />);
    expect(html).toMatch(new RegExp(`<div class="${k.bar}" data-visible="false" aria-hidden="true" inert="">`));
    expect(html).toContain(`<p class="${k.barPosisi}">Barista</p>`);
  });

  it('tanpa tombol Simpan', () => {
    const html = render(<LowonganDetailBody data={detail()} />);
    expect(html).not.toMatch(/Simpan|Save/);
  });
});

describe('kontak-bar.logic', () => {
  const entry = (isIntersecting: boolean, top: number) => ({ isIntersecting, boundingClientRect: { top } });

  it('letakDari: terlihat → inside; tak terlihat di atas / di bawah', () => {
    expect(letakDari(entry(true, -10))).toBe('inside');
    expect(letakDari(entry(false, -200))).toBe('above');
    expect(letakDari(entry(false, 900))).toBe('below');
  });

  it('isBarVisible hanya bila kepala sudah lewat dan penutup belum tercapai', () => {
    expect(isBarVisible('above', 'below')).toBe(true);
    expect(isBarVisible('inside', 'below')).toBe(false);
    expect(isBarVisible('above', 'inside')).toBe(false);
    expect(isBarVisible('above', 'above')).toBe(false);
  });
});

describe('LowonganDetail: status', () => {
  it('memuat → tombol kembali + kerangka role=status, aria-busy', () => {
    const html = render(<LowonganDetail id="l1" />);
    expect(html).toContain(`aria-label="${BACK_BUTTON_LABEL}"`);
    expect(html).toContain(`role="status" aria-label="${T.memuat}"`);
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain('<h1');
  });

  it('siap → kartu detail', () => {
    h.state = { status: 'ready', data: detail() };
    const html = render(<LowonganDetail id="l1" />);
    expect(html).toMatch(/<h1[^>]*>Barista<\/h1>/);
    expect(html).not.toContain('aria-busy');
  });

  it('tidak ditemukan (termasuk nonaktif/terhapus) → pesan + tautan ke daftar, tanpa Coba lagi', () => {
    const html = render(<DetailStatus status="notFound" onRetry={() => undefined} />);
    expect(text(html)).toContain(`${T.notFoundTitle} ${T.notFoundDesc}`);
    expect(html).toMatch(new RegExp(`href="/ekonomi/lowongan-kerja-lokal"[^>]*>${T.lihatSemua}`));
    expect(html).not.toContain('<button');
    expect(html).not.toContain('role="alert"');
  });

  it('galat → role=alert + tombol Coba lagi + tautan ke daftar', () => {
    const html = render(<DetailStatus status="error" onRetry={() => undefined} />);
    expect(html).toContain('role="alert"');
    expect(html).toMatch(new RegExp(`<button[^>]*>${T.retry}</button>`));
    expect(html).toContain(T.lihatSemua);
  });
});
