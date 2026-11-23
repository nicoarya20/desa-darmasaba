// @vitest-environment node
// Teks panjang Profil Desa (Maskot, Sejarah, Lambang): akordion per <h3>, potong + "Baca selengkapnya" bila tanpa
// sub-judul, dan tampil utuh bila pendek. Markup diuji via renderToStaticMarkup (jsdom tidak dipakai di repo ini).
import { MantineProvider } from '@mantine/core';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProfilProseAuto } from '@/app/(public)/(pages)/pemerintahan/profil/_com/ProfilProseAuto';
import {
  CLAMP_MIN_CHARS,
  isLongProse,
  plainText,
  splitByHeading,
} from '@/app/(public)/(pages)/pemerintahan/profil/_com/prose-split';

const render = (ui: ReactElement) => renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>);
const count = (source: string, needle: string | RegExp) => source.split(needle).length - 1;

const MASKOT_HTML =
  '<p>Pengantar maskot.</p>' +
  '<h3>A. Latar Belakang &amp; Sejarah</h3><p>Isi A.</p>' +
  '<h3><strong>B. Tujuan</strong></h3><ol><li>Satu</li><li>Dua</li></ol>' +
  '<h3>C. Simpulan</h3><p>Isi C.</p>';
const LONG_PLAIN = `<p>${'Kalimat sejarah desa yang panjang. '.repeat(60)}</p>`;

describe('plainText & isLongProse', () => {
  it('membuang tag, mendekode entitas umum, merapikan spasi', () => {
    expect(plainText('<strong>A. Latar &amp; Sejarah</strong>&nbsp;&#8211;  <em>x</em>')).toBe('A. Latar & Sejarah – x');
  });

  it('panjang dihitung dari teks tanpa tag, bukan dari HTML', () => {
    expect(isLongProse(`<p>${'a'.repeat(CLAMP_MIN_CHARS)}</p>`)).toBe(false);
    expect(isLongProse(`<p>${'a'.repeat(CLAMP_MIN_CHARS + 1)}</p>`)).toBe(true);
    expect(isLongProse(`<p class="${'x'.repeat(2000)}">pendek</p>`)).toBe(false);
  });
});

describe('splitByHeading', () => {
  it('memisahkan pengantar dan tiap <h3> beserta isinya, judul berupa teks polos', () => {
    const split = splitByHeading(MASKOT_HTML)!;
    expect(split.intro).toBe('<p>Pengantar maskot.</p>');
    expect(split.sections.map((s) => s.title)).toEqual(['A. Latar Belakang & Sejarah', 'B. Tujuan', 'C. Simpulan']);
    expect(split.sections[1].html).toBe('<ol><li>Satu</li><li>Dua</li></ol>');
  });

  it('teks yang diawali <h3> punya pengantar kosong', () => {
    expect(splitByHeading('<h3>A</h3><p>1</p><h3>B</h3><p>2</p>')!.intro).toBe('');
  });

  it.each([
    ['tanpa sub-judul', '<p>Satu</p><p>Dua</p>'],
    ['hanya satu sub-judul', '<p>x</p><h3>A</h3><p>1</p>'],
    ['judul kosong', '<h3> </h3><p>1</p><h3>B</h3><p>2</p>'],
    ['<h3> di dalam elemen bersarang (potongan memutus <blockquote>)', '<blockquote><h3>A</h3><p>1</p><h3>B</h3></blockquote>'],
  ])('null untuk %s', (_label, html) => {
    expect(splitByHeading(html)).toBeNull();
  });
});

describe('ProfilProseAuto', () => {
  it('dua sub-judul atau lebih → satu <details> per pembahasan, hanya yang pertama terbuka', () => {
    const html = render(<ProfilProseAuto html={MASKOT_HTML} />);
    expect(count(html, '<details')).toBe(3);
    expect(count(html, /<details[^>]*\bopen=""/g)).toBe(1);
    expect(html).toMatch(/<details[^>]*open=""[\s\S]*?<span>A\. Latar Belakang &amp; Sejarah<\/span>/);
    expect(html).toContain('<p>Pengantar maskot.</p>');
    expect(html).not.toContain('Baca selengkapnya');
  });

  it('judul <h3> tidak ikut dirender ulang sebagai heading di isi akordion', () => {
    expect(render(<ProfilProseAuto html={MASKOT_HTML} />)).not.toContain('<h3');
  });

  it('teks panjang tanpa sub-judul → terpotong dengan tombol "Baca selengkapnya" (aria-expanded=false)', () => {
    const html = render(<ProfilProseAuto html={LONG_PLAIN} />);
    expect(html).not.toContain('<details');
    expect(html).toMatch(/<button[^>]*aria-expanded="false"[^>]*>Baca selengkapnya/);
    const controls = html.match(/aria-controls="([^"]+)"/)![1];
    expect(html).toContain(`id="${controls}"`);
  });

  it('teks panjang dengan sub-judul memakai akordion, bukan potongan', () => {
    const html = render(<ProfilProseAuto html={`${LONG_PLAIN}${MASKOT_HTML}`} />);
    expect(count(html, '<details')).toBe(3);
    expect(html).not.toContain('Baca selengkapnya');
  });

  it('teks pendek tanpa sub-judul tampil utuh tanpa tombol apa pun', () => {
    const html = render(<ProfilProseAuto html="<p>Sejarah singkat.</p>" />);
    expect(html).toContain('<p>Sejarah singkat.</p>');
    expect(html).not.toMatch(/<button|<details/);
  });
});
