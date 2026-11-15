// @vitest-environment node
// Halaman Program Pendidikan Anak + kerangka bersama ProgramInfoPage: kepala, bagian berlabel, butir + istilah tebal,
// prosa CMS tersaring, slot `before`, render kustom `content`, dan keadaan memuat/kosong/gagal.
// jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup (effect tidak jalan; useProgramInfo di-mock).
import { MantineProvider } from '@mantine/core';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProgramInfoState } from '@/app/(public)/(pages)/pendidikan/_com/program-info/use-program-info';

const h = vi.hoisted(() => ({ state: { status: 'loading' } as unknown }));

vi.mock('next-view-transitions', () => ({ useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn() }) }));
// DOMPurify butuh DOM; di node cukup tandai bahwa HTML lewat sanitizer.
vi.mock('dompurify', () => ({ default: { sanitize: (html: string) => `<!--clean-->${html}` } }));
vi.mock('@/lib/api-fetch', () => ({ default: { api: { pendidikan: { programpendidikananak: {} } } } }));
vi.mock('@/app/(public)/(pages)/pendidikan/_com/program-info/use-program-info', () => ({
  useProgramInfo: () => h.state,
}));

import Page from '@/app/(public)/(pages)/pendidikan/program-pendidikan-anak/page';
import { ProgramInfoPage } from '@/app/(public)/(pages)/pendidikan/_com/program-info/ProgramInfoPage';
import type { ProgramInfoEntry } from '@/app/(public)/(pages)/pendidikan/_com/program-info/program-info.logic';
import { PROGRAM_PENDIDIKAN_ANAK_TEXT as T } from '@/app/(public)/(pages)/pendidikan/program-pendidikan-anak/_com/program-pendidikan-anak.text';

const render = (ui: ReactElement) => renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>);
const count = (source: string, needle: string | RegExp) => source.split(needle).length - 1;
const setState = (state: ProgramInfoState) => {
  h.state = state;
};

const TUJUAN: ProgramInfoEntry = {
  key: 'tujuan',
  title: 'Tujuan Program',
  html: '<ul><li><p>Meningkatkan akses pendidikan</p></li><li><p>Menumbuhkan semangat belajar</p></li></ul>',
  failed: false,
};
const UNGGULAN: ProgramInfoEntry = {
  key: 'unggulan',
  title: 'Program Unggulan',
  html: '<ul><li><p>Bimbingan Belajar Gratis: Untuk siswa kurang mampu</p></li><li><p>Pelatihan Digital</p></li></ul>',
  failed: false,
};

describe('Program Pendidikan Anak', () => {
  beforeEach(() => setState({ status: 'loading' }));

  it('kepala: tombol kembali, h1 nama menu, satu kalimat pengantar', () => {
    setState({ status: 'ready', entries: [TUJUAN, UNGGULAN] });
    const html = render(<Page />);
    expect(html).toContain('aria-label="Kembali ke halaman sebelumnya"');
    expect(count(html, '<h1')).toBe(1);
    expect(html).toContain(`>${T.title}</h1>`);
    expect(html).toContain(T.lead);
  });

  it('dua bagian berlabel (h2 judul CMS) berisi butir; istilah "X:" ditebalkan', () => {
    setState({ status: 'ready', entries: [TUJUAN, UNGGULAN] });
    const html = render(<Page />);
    expect(count(html, '<section')).toBe(2);
    expect(html).toMatch(/<section[^>]*aria-labelledby="program-info-tujuan"/);
    expect(html).toMatch(/<h2 id="program-info-tujuan"[^>]*>Tujuan Program<\/h2>/);
    expect(html).toMatch(/<h2 id="program-info-unggulan"[^>]*>Program Unggulan<\/h2>/);
    expect(html.indexOf('Tujuan Program')).toBeLessThan(html.indexOf('Program Unggulan</h2>'));
    expect(count(html, '<li')).toBe(4);
    expect(html).toMatch(/<strong[^>]*>Bimbingan Belajar Gratis:<\/strong> Untuk siswa kurang mampu/);
    expect(html).not.toContain('<p>Meningkatkan');
  });

  it('tanpa ikon, tooltip, maupun kartu Paper lama', () => {
    setState({ status: 'ready', entries: [TUJUAN, UNGGULAN] });
    const html = render(<Page />);
    expect(html).not.toContain('tabler-icon-target-arrow');
    expect(html).not.toContain('mantine-Paper-root');
    expect(html).not.toContain('Detail tujuan program');
  });

  it('memuat → kerangka role=status, tanpa bagian', () => {
    const html = render(<Page />);
    expect(html).toMatch(/role="status"[^>]*aria-label="Memuat informasi Program Pendidikan Anak"/);
    expect(html).not.toContain('<section');
    expect(html).toContain(`>${T.title}</h1>`);
  });

  it('satu bagian gagal & satu kosong → pesan per bagian, judul cadangan tetap tampil', () => {
    setState({
      status: 'ready',
      entries: [
        { ...TUJUAN, html: null, failed: true },
        { ...UNGGULAN, html: '<p></p>' },
      ],
    });
    const html = render(<Page />);
    expect(count(html, '<section')).toBe(2);
    expect(html).toContain('Informasi Tujuan Program gagal dimuat. Coba muat ulang halaman.');
    expect(html).toContain('Belum ada informasi Program Unggulan.');
  });

  it('semua kosong → satu kalimat halaman; semua gagal → satu kalimat galat', () => {
    setState({ status: 'ready', entries: [{ ...TUJUAN, html: null }, { ...UNGGULAN, html: null }] });
    let html = render(<Page />);
    expect(html).toContain('Informasi Program Pendidikan Anak belum tersedia.');
    expect(html).not.toContain('<section');

    setState({ status: 'ready', entries: [{ ...TUJUAN, failed: true }, { ...UNGGULAN, failed: true }] });
    html = render(<Page />);
    expect(html).toContain('Informasi Program Pendidikan Anak gagal dimuat. Coba muat ulang halaman.');
    expect(html).not.toContain('<section');
  });
});

describe('ProgramInfoPage (pemakai lain)', () => {
  it('isi bukan satu daftar → prosa lewat sanitizer', () => {
    const html = render(
      <ProgramInfoPage title="Uji" lead="Pengantar" sections={[{ ...TUJUAN, html: '<p>Pengantar</p><ul><li><p>a</p></li></ul>' }]} />,
    );
    expect(html).toContain('<!--clean--><p>Pengantar</p>');
  });

  it('slot before tampil di antara kepala dan bagian; tidak dirender saat memuat', () => {
    const before = <aside data-testid="panel">Panel lokasi</aside>;
    const html = render(<ProgramInfoPage title="Uji" lead="Pengantar" sections={[TUJUAN]} before={before} />);
    expect(html.indexOf('Pengantar</p>')).toBeLessThan(html.indexOf('Panel lokasi'));
    expect(html.indexOf('Panel lokasi')).toBeLessThan(html.indexOf('<section'));
    expect(render(<ProgramInfoPage title="Uji" lead="Pengantar" sections={null} before={before} />)).not.toContain('Panel lokasi');
  });

  it('ada slot before + semua bagian kosong/gagal → pesan per bagian, bukan satu kalimat halaman', () => {
    const before = <aside>Panel lokasi</aside>;
    let html = render(
      <ProgramInfoPage title="Uji" lead="Pengantar" before={before} sections={[{ ...TUJUAN, html: null }, { ...UNGGULAN, html: null }]} />,
    );
    expect(html).toContain('Panel lokasi');
    expect(count(html, '<section')).toBe(2);
    expect(html).toContain('Belum ada informasi Tujuan Program.');
    expect(html).not.toContain('Informasi Uji belum tersedia.');

    html = render(
      <ProgramInfoPage title="Uji" lead="Pengantar" before={before} sections={[{ ...TUJUAN, failed: true }, { ...UNGGULAN, failed: true }]} />,
    );
    expect(count(html, '<section')).toBe(2);
    expect(html).toContain('Informasi Program Unggulan gagal dimuat.');
    expect(html).not.toContain('Informasi Uji gagal dimuat.');

    html = render(<ProgramInfoPage title="Uji" lead="Pengantar" before={before} sections={[]} />);
    expect(html).toContain('Panel lokasi');
    expect(html).not.toContain('<section');
    expect(html).not.toContain('Informasi Uji');
  });

  it('content menggantikan isi bawaan di kerangka bagian yang sama; failed tetap pesan galat', () => {
    const html = render(
      <ProgramInfoPage
        title="Uji"
        lead="Pengantar"
        sections={[
          { ...TUJUAN, content: <ol data-custom>Jenis kustom</ol> },
          { ...UNGGULAN, failed: true, content: <ol>tidak tampil</ol> },
        ]}
      />,
    );
    expect(html).toMatch(/<h2 id="program-info-tujuan"[^>]*>Tujuan Program<\/h2><div[^>]*><ol data-custom="true">Jenis kustom<\/ol>/);
    expect(html).not.toContain('Meningkatkan akses');
    expect(html).not.toContain('tidak tampil');
    expect(html).toContain('Informasi Program Unggulan gagal dimuat.');
  });
});
