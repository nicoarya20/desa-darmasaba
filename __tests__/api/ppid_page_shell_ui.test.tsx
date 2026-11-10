// @vitest-environment node
// Kerangka bersama halaman PPID: tombol kembali, kepala rata kiri (h1 + pengantar), slot kanan opsional.
// jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({ useTransitionRouter: () => ({ back: vi.fn() }) }));

import { PpidHeader } from '@/app/darmasaba/(pages)/ppid/_com/PpidHeader';
import { PpidPage } from '@/app/darmasaba/(pages)/ppid/_com/PpidPage';
import { BACK_BUTTON_LABEL } from '@/app/darmasaba/(pages)/pemerintahan/layanan/_com/BackButto';

const render = (ui: React.ReactElement) => renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>);
const css = readFileSync(
  path.join(process.cwd(), 'src/app/darmasaba/(pages)/ppid/_com/ppid-header.module.css'),
  'utf8',
);

describe('PpidHeader', () => {
  it('menulis judul sebagai h1 dan pengantar sebagai paragraf', () => {
    const html = render(<PpidHeader title="Judul Uji" lead="Pengantar uji." />);
    expect(html).toMatch(/<h1 class="[^"]*_title_[^"]*">Judul Uji<\/h1>/);
    expect(html).toMatch(/<p class="[^"]*_lead_[^"]*">Pengantar uji\.<\/p>/);
  });

  it('tanpa aside tidak menggambar slot kanan', () => {
    expect(render(<PpidHeader title="Judul" lead="Pengantar" />)).not.toMatch(/_aside_/);
  });

  it('aside dirender di dalam slot kanan setelah judul', () => {
    const html = render(<PpidHeader title="Judul" lead="Pengantar" aside={<input aria-label="Cari uji" />} />);
    expect(html).toMatch(/<div class="[^"]*_aside_[^"]*"><input aria-label="Cari uji"\/><\/div>/);
    expect(html.indexOf('_aside_')).toBeGreaterThan(html.indexOf('</h1>'));
  });

  it('judul memakai warna brand dan slot kanan turun ke bawah di layar sempit', () => {
    expect(css).toMatch(/\.title\s*\{[^}]*color:\s*var\(--brand\)/);
    expect(css).toMatch(/@media \(max-width: 1068px\)\s*\{\s*\.header\s*\{[^}]*flex-direction:\s*column/);
    expect(css).not.toMatch(/text-align:\s*(center|justify)/);
  });
});

describe('PpidPage', () => {
  const html = render(
    <PpidPage title="Halaman Uji" lead="Pengantar halaman." style={{ '--uji': 'red' } as React.CSSProperties}>
      <p>Isi halaman</p>
    </PpidPage>,
  );

  it('urutan: tombol kembali → kepala halaman → isi', () => {
    const back = html.indexOf(`aria-label="${BACK_BUTTON_LABEL}"`);
    const title = html.indexOf('>Halaman Uji</h1>');
    const body = html.indexOf('<p>Isi halaman</p>');
    expect(back).toBeGreaterThan(-1);
    expect(title).toBeGreaterThan(back);
    expect(body).toBeGreaterThan(title);
  });

  it('menyediakan --brand dan meneruskan variabel CSS milik halaman', () => {
    expect(html).toMatch(/style="[^"]*--brand:[^;"]+/);
    expect(html).toMatch(/style="[^"]*--uji:red/);
  });

  it('memasang lebar baca --ppid-measure 75rem untuk isi teks dan formulir', () => {
    expect(html).toMatch(/style="[^"]*--ppid-measure:75rem/);
  });

  it('hanya satu h1 per halaman', () => {
    expect(html.split('<h1').length - 1).toBe(1);
  });
});
