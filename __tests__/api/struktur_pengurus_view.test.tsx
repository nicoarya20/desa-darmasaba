// @vitest-environment node
// Kartu pengurus bersama (PUSTU, lembaga sekolah, Bank Sampah) bergaya kartu ringkas bagan Perangkat Desa:
// jabatan + pil nama, foto hanya bila ada, tanpa lingkaran inisial, bukan tautan.
// jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { describe, expect, it } from 'vitest';
import StrukturPengurusView from '@/app/(public)/_com/konten-bersama/struktur-pengurus.view';
import type { PengurusItem } from '@/lib/konten-bersama/konten-bersama.types';

const render = (ui: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: pengurus fiktif berbentuk respons detail PUSTU.
const pengurus = (id: string, nama: string, jabatan: string, foto: string | null = null): PengurusItem => ({
  id,
  nama,
  jabatan,
  urutan: 0,
  imageId: foto ? `img-${id}` : null,
  image: foto ? { id: `img-${id}`, link: foto } : null,
});
const cards = (html: string) => html.match(/<div[^>]*data-testid="pengurus-card"[^>]*>/g) ?? [];

describe('StrukturPengurusView', () => {
  it('tanpa foto: jabatan + nama tampil, tanpa avatar/inisial/img, kartu bukan tautan', () => {
    const html = render(
      <StrukturPengurusView
        bagan={null}
        namaPemilik="Pustu Banjar Bersih"
        pengurus={[pengurus('a', 'dr. Ayu Lestari', 'Kepala Pustu'), pengurus('b', 'Bagus Wirawan ( NIP. 1987 )', 'Perawat')]}
      />,
    );
    expect(html).toContain('data-testid="struktur-pengurus-view"');
    const tags = cards(html);
    expect(tags).toHaveLength(2);
    for (const tag of tags) {
      expect(tag).toContain('data-size="xs"');
      expect(tag).toContain('data-no-photo="true"');
    }
    expect(html).toContain('Kepala Pustu');
    expect(html).toContain('dr. Ayu Lestari');
    // Nama dengan NIP tidak dipotong/diparsing.
    expect(html).toContain('Bagus Wirawan ( NIP. 1987 )');
    expect(html).not.toContain('mantine-Avatar');
    expect(html).not.toMatch(/>[dB]</);
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<a');
  });

  it('dengan foto: img tampil di kartu itu saja', () => {
    const html = render(
      <StrukturPengurusView
        bagan={null}
        namaPemilik="Bank Sampah Sari"
        pengurus={[pengurus('a', 'Nyoman Sari', 'Ketua', 'https://example.test/sari.jpg'), pengurus('b', 'Made Putra', 'Bendahara')]}
      />,
    );
    const [berfoto, tanpaFoto] = cards(html);
    expect(berfoto).not.toContain('data-no-photo');
    expect(tanpaFoto).toContain('data-no-photo="true"');
    expect(html.match(/<img[^>]*>/g)).toHaveLength(1);
    expect(html).toContain('src="https://example.test/sari.jpg"');
  });

  it('gradasi kartu dari STRUKTUR_VARS (satu sumber dengan bagan)', () => {
    const html = render(<StrukturPengurusView bagan={null} namaPemilik="X" pengurus={[pengurus('a', 'Nama', 'Ketua')]} />);
    expect(html).toMatch(/data-testid="struktur-pengurus-view"/);
    expect(html).toMatch(/--tone-1:linear-gradient/);
  });

  it('bagan + pengurus kosong → state kosong', () => {
    const html = render(<StrukturPengurusView bagan={null} namaPemilik="X" pengurus={[]} />);
    expect(html).toContain('data-testid="konten-kosong"');
    expect(html).not.toContain('struktur-pengurus-view');
  });

  it('bagan saja: foto bagan tampil, tanpa grid kartu', () => {
    const html = render(
      <StrukturPengurusView bagan={{ id: 'g', link: 'https://example.test/bagan.png' }} namaPemilik="SD 1" pengurus={[]} />,
    );
    expect(html).toContain('alt="Bagan struktur organisasi SD 1"');
    expect(cards(html)).toHaveLength(0);
  });

  it('CSS modul tidak menyalin warna/gradasi bagan', () => {
    const css = readFileSync(
      path.resolve(__dirname, '../../src/app/(public)/_com/konten-bersama/struktur-pengurus.module.css'),
      'utf8',
    ).replace(/\/\*[\s\S]*?\*\//g, '');
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(css).not.toContain('gradient');
  });
});
