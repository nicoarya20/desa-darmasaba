// @vitest-environment node
// Kartu baris lowongan kerja (gaya Welcome to the Jungle) + daftar dan kerangka memuat.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup.
import type { AnchorHTMLAttributes, ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

import { LowonganCard } from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/LowonganCard';
import { LowonganList } from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/LowonganList';
import { LOWONGAN_CARD_TEXT as T } from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/lowongan-card.text';
import type { Lowongan } from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/lowongan.types';
import c from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/lowongan-card.module.css';
import l from '@/app/(public)/(pages)/ekonomi/lowongan-kerja-lokal/_com/lowongan-list.module.css';

const render = (node: ReactElement) => renderToStaticMarkup(node);
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const count = (html: string, needle: string) => html.split(needle).length - 1;

// test-only: bentuk hasil adapter.
const lowongan = (over: Partial<Lowongan> = {}): Lowongan => ({
  id: 'l1',
  posisi: 'Barista',
  pemberiKerja: 'Warung Sari',
  tipe: 'Full Time',
  tipeKey: 'full time',
  lokasi: 'Jl. Raya Darmasaba No. 1',
  diDesa: true,
  gaji: 2500000,
  ringkasan: 'Meracik kopi untuk pelanggan.',
  tayangMs: Date.parse('2026-11-03T02:00:00.000Z'),
  ...over,
});

describe('LowonganCard', () => {
  it('seluruh kartu satu tautan di judul h3 ke halaman detail', () => {
    const html = render(<LowonganCard lowongan={lowongan()} />);
    expect(html.startsWith('<article')).toBe(true);
    expect(count(html, '<a ')).toBe(1);
    expect(count(html, '<button')).toBe(0);
    expect(html).toMatch(/<h3 [^>]*><a [^>]*href="\/ekonomi\/lowongan-kerja-lokal\/l1"[^>]*>Barista<\/a><\/h3>/);
    expect(html).not.toContain('<h2');
  });

  it('isi lengkap: inisial, posisi, pemberi kerja, ringkasan, tiga pil, penanda, tanggal', () => {
    const html = render(<LowonganCard lowongan={lowongan()} />);
    expect(text(html)).toBe(
      `WS Barista Warung Sari Meracik kopi untuk pelanggan. Full Time Rp2.500.000 / bulan Jl. Raya Darmasaba No. 1 ${T.lihatDetail} 3 November 2026`,
    );
    expect(count(html, `class="${c.pill}"`)).toBe(3);
    expect(html).toContain('<time dateTime="2026-11-03T02:00:00.000Z">3 November 2026</time>');
  });

  it('inisial dan penanda "Lihat detail" tersembunyi dari pembaca layar; penanda bukan tautan kedua', () => {
    const html = render(<LowonganCard lowongan={lowongan()} />);
    expect(html).toContain(`<div class="${c.logo}" aria-hidden="true">WS</div>`);
    expect(html).toMatch(new RegExp(`<span class="${c.cta}" aria-hidden="true">${T.lihatDetail}<svg`));
  });

  it('tipe dibaca dari data: lowongan Freelance tidak menulis "Full Time"', () => {
    const html = render(<LowonganCard lowongan={lowongan({ tipe: 'Freelance', tipeKey: 'freelance' })} />);
    expect(text(html)).toContain('Freelance');
    expect(text(html)).not.toContain('Full Time');
  });

  it('tanpa tipe → pil tipe tidak dirender', () => {
    const html = render(<LowonganCard lowongan={lowongan({ tipe: null, tipeKey: null })} />);
    expect(count(html, `class="${c.pill}"`)).toBe(2);
    expect(text(html)).not.toContain('Full Time');
  });

  it('gaji null → "Gaji tidak dicantumkan" bernada redup, tanpa Rp', () => {
    const html = render(<LowonganCard lowongan={lowongan({ gaji: null })} />);
    expect(html).toContain(`<li class="${c.pill}" data-muted="true">`);
    expect(text(html)).toContain(T.gajiKosong);
    expect(text(html)).not.toContain('Rp');
    expect(text(html)).not.toContain('/ bulan');
    expect(render(<LowonganCard lowongan={lowongan()} />)).not.toContain('data-muted');
  });

  it('ringkasan kosong → paragraf ringkasan tidak dirender', () => {
    expect(render(<LowonganCard lowongan={lowongan()} />)).toContain(`class="${c.summary}"`);
    const html = render(<LowonganCard lowongan={lowongan({ ringkasan: '' })} />);
    expect(html).not.toContain(`class="${c.summary}"`);
    expect(text(html)).toBe(
      `WS Barista Warung Sari Full Time Rp2.500.000 / bulan Jl. Raya Darmasaba No. 1 ${T.lihatDetail} 3 November 2026`,
    );
  });

  it('lokasi: teks lengkap di title; tanpa lokasi → pil lokasi tidak dirender', () => {
    const withLokasi = render(<LowonganCard lowongan={lowongan()} />);
    expect(withLokasi).toContain('data-clip="true" title="Jl. Raya Darmasaba No. 1"');
    const html = render(<LowonganCard lowongan={lowongan({ lokasi: null })} />);
    expect(html).not.toContain('title=');
    expect(html).not.toContain('data-clip');
    expect(count(html, `class="${c.pill}"`)).toBe(2);
    expect(text(html)).not.toContain('Darmasaba');
  });

  it('waktu tayang tak terbaca → tanpa tanggal', () => {
    const html = render(<LowonganCard lowongan={lowongan({ tayangMs: 0 })} />);
    expect(html).not.toContain('<time');
    expect(html).not.toContain(`class="${c.date}"`);
    expect(text(html).endsWith(T.lihatDetail)).toBe(true);
  });

  it('pemberi kerja tanpa huruf → ikon gedung di ubin; kosong → baris pemberi kerja tidak dirender', () => {
    const angka = render(<LowonganCard lowongan={lowongan({ pemberiKerja: '123' })} />);
    expect(angka).toMatch(new RegExp(`<div class="${c.logo}" aria-hidden="true"><svg`));
    expect(angka).toContain(`class="${c.employer}"`);

    const kosong = render(<LowonganCard lowongan={lowongan({ pemberiKerja: '' })} />);
    expect(kosong).toMatch(new RegExp(`<div class="${c.logo}" aria-hidden="true"><svg`));
    expect(kosong).not.toContain(`class="${c.employer}"`);
  });

  it('teks dari data di-escape, bukan disisipkan sebagai HTML', () => {
    const html = render(<LowonganCard lowongan={lowongan({ posisi: '<b>Kasir</b>', ringkasan: '<script>x</script>' })} />);
    expect(html).not.toContain('<b>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;b&gt;Kasir&lt;/b&gt;');
  });
});

describe('LowonganList', () => {
  it('memuat → kerangka bawaan 4 kartu (ubin + 2 garis + 3 pil) dengan aria-busy, bukan kartu', () => {
    const html = render(
      <LowonganList loading>
        <LowonganCard lowongan={lowongan()} />
      </LowonganList>,
    );
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain(`aria-label="${T.memuat}"`);
    expect(count(html, `class="${l.skeleton}"`)).toBe(4);
    expect(count(html, `class="${l.skeletonLogo}"`)).toBe(4);
    expect(count(html, `class="${l.skeletonLine}"`)).toBe(8);
    expect(count(html, `class="${l.skeletonPill}"`)).toBe(12);
    expect(html).not.toContain('<a ');
    expect(html).not.toContain('<ul');
  });

  it('skeletonCount mengatur jumlah kerangka', () => {
    expect(count(render(<LowonganList loading skeletonCount={2} />), `class="${l.skeleton}"`)).toBe(2);
  });

  it('ada kartu → <ul> dengan satu <li> per kartu, urutan terjaga', () => {
    const html = render(
      <LowonganList empty={<p>kosong</p>}>
        {[lowongan({ id: 'a', posisi: 'Kasir' }), lowongan({ id: 'b', posisi: 'Koki' })].map((item) => (
          <LowonganCard key={item.id} lowongan={item} />
        ))}
      </LowonganList>,
    );
    expect(html.startsWith('<ul')).toBe(true);
    expect(count(html, '<li class="' + l.item + '"')).toBe(2);
    expect(count(html, '<article')).toBe(2);
    expect(html.indexOf('Kasir')).toBeLessThan(html.indexOf('Koki'));
    expect(html).not.toContain('kosong');
    expect(html).not.toContain('aria-busy');
  });

  it('tanpa kartu (termasuk anak null/false) → slot kosong, tanpa <ul>', () => {
    expect(render(<LowonganList empty={<p>Belum ada lowongan</p>} />)).toBe('<p>Belum ada lowongan</p>');
    const html = render(<LowonganList empty={<p>Belum ada lowongan</p>}>{[null, false]}</LowonganList>);
    expect(html).toBe('<p>Belum ada lowongan</p>');
    expect(render(<LowonganList />)).toBe('');
  });
});
