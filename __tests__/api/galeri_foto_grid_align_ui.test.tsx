// @vitest-environment node
// Grid galeri foto bersama (PUSTU, Posyandu, Lembaga info-sekolah, Bank Sampah): foto sebaris harus rata atas walau
// sebagian foto berketerangan. Akar: sel grid meregangkan <button> setinggi baris lalu isinya ditengahkan vertikal.
// Posisi piksel diverifikasi manual (QA ego-browser); di sini dijaga kelas item + aturan CSS-nya.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider, Modal } from '@mantine/core';
import { describe, expect, it } from 'vitest';
import GaleriFoto from '@/app/(public)/_com/konten-bersama/galeri-foto.grid';
import s from '@/app/(public)/_com/konten-bersama/galeri-foto.module.css';
import type { FotoGaleriItem } from '@/lib/konten-bersama/konten-bersama.types';

// test-only: campuran foto berketerangan panjang, pendek, dan tanpa keterangan.
const KETERANGAN = ['Pemeriksaan kesehatan rutin warga lansia di PUSTU', null, 'Vaksinasi', null];
const foto: FotoGaleriItem[] = KETERANGAN.map((keterangan, i) => ({
  id: `f${i + 1}`,
  imageId: `i${i + 1}`,
  keterangan,
  urutan: i + 1,
  image: { id: `i${i + 1}`, link: `/foto-${i + 1}.jpg` },
}));

const theme = { components: { Modal: Modal.extend({ defaultProps: { withinPortal: false } }) } };
const html = renderToStaticMarkup(
  <MantineProvider theme={theme}>
    <GaleriFoto foto={foto} namaPemilik="PUSTU" judul={null} ariaLabel="Galeri PUSTU" />
  </MantineProvider>,
).replace(/<style[\s\S]*?<\/style>/g, '');
const items = html.match(/<button[^>]*data-testid="galeri-foto-item"[^>]*>/g) ?? [];
const css = readFileSync(path.resolve(__dirname, '../../src/app/(public)/_com/konten-bersama/galeri-foto.module.css'), 'utf8');

describe('GaleriFoto: foto sebaris rata atas', () => {
  it('setiap tombol foto, berketerangan atau tidak, membawa kelas item', () => {
    expect(s.item).toBeTruthy();
    expect(items).toHaveLength(4);
    for (const tombol of items) expect(tombol).toMatch(new RegExp(`class="[^"]*\\b${s.item}\\b`));
  });

  it('kelas item merapatkan tombol ke atas sel (tidak diregangkan setinggi baris)', () => {
    expect(css).toMatch(/\.item\s*\{[^}]*align-self:\s*start;/);
  });

  it('tanpa placeholder keterangan palsu: teks hanya untuk foto yang berketerangan', () => {
    expect(html.match(/<p[\s>]/g) ?? []).toHaveLength(2);
    expect(html).toContain('Vaksinasi');
  });
});
