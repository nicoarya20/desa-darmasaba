// @vitest-environment node
// Halaman detail /prestasi-desa/[id] menampilkan juara (eks-penghargaan) bila ada.
import { MantineProvider } from '@mantine/core';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PrestasiJuara } from '@/app/(public)/_com/main-page/prestasi/PrestasiJuara';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

describe('PrestasiJuara', () => {
  it('juara ada → teks capaian dirender (di-trim)', () => {
    const html = render(<PrestasiJuara juara="  Juara 1 Lomba Desa Provinsi Bali 2025 " />);
    expect(html).toContain('>Juara 1 Lomba Desa Provinsi Bali 2025<');
  });

  it.each([null, undefined, '', '   '])('juara %j → tidak merender apa pun', (juara) => {
    expect(render(<PrestasiJuara juara={juara} />)).toBe('');
  });

  it('dipakai halaman detail prestasi dengan data findUnique', () => {
    const page = readFileSync(
      path.resolve(__dirname, '../../src/app/(public)/(tambahan)/prestasi-desa/[id]/page.tsx'),
      'utf8',
    );
    expect(page).toContain('<PrestasiJuara juara={state.findUnique.data.juara} />');
  });
});
