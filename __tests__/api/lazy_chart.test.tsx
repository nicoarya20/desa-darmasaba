// @vitest-environment node
// Juknis lomba 5.4: grafik beranda (recharts lewat @mantine/charts) ada di bawah lipatan, jadi kodenya dimuat tunda
// (saat mendekati layar) agar JavaScript awal lebih ringan (TBT beranda 790 ms di audit Lighthouse stg).
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup; IntersectionObserver tidak ada di server, jadi
// yang teruji adalah keadaan awal (placeholder) dan penjaga impor; perilaku "muncul saat mendekati layar" tidak teruji.
import { MantineProvider } from '@mantine/core';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MountWhenNear } from '@/app/(public)/_com/lazy-chart/MountWhenNear';
import { LazyApbdesChart } from '@/app/(public)/_com/main-page/apbdes/components/ApbdesChart.lazy';
import { LazyKepuasanCharts } from '@/app/(public)/_com/main-page/kepuasan/components/KepuasanCharts.lazy';

const MAIN = join(process.cwd(), 'src/app/(public)/_com/main-page');
const read = (rel: string) => readFileSync(join(MAIN, rel), 'utf8');
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

describe('MountWhenNear: keadaan awal (server)', () => {
  it('menampilkan kotak cadangan setinggi minHeight dan belum memasang isi', () => {
    const html = render(
      <MountWhenNear minHeight={321}>
        <p>ISI-GRAFIK</p>
      </MountWhenNear>,
    );
    expect(html).toContain('min-height:321px');
    expect(html).not.toContain('ISI-GRAFIK');
  });
});

describe('versi tunda grafik beranda', () => {
  it('LazyApbdesChart: hanya kotak cadangan, tanpa judul/SVG grafik', () => {
    const html = render(<LazyApbdesChart categories={[]} tahun={2026} />);
    expect(html).toContain('min-height:360px');
    expect(html).not.toContain('<svg');
    expect(html).not.toContain('recharts');
  });

  it('LazyKepuasanCharts: hanya kotak cadangan, tanpa kartu komposisi', () => {
    const summary = { monthly: [], jenisKelamin: [], rating: [], kelompokUmur: [] } as never;
    const html = render(<LazyKepuasanCharts summary={summary} total={0} />);
    expect(html).toContain('min-height:640px');
    expect(html).not.toContain('<svg');
  });
});

describe('penjaga: beranda tidak mengimpor grafik secara langsung', () => {
  const importsEager = (src: string, spec: string) => new RegExp(`from\\s+["']${spec.replace(/[./]/g, '\\$&')}["']`).test(src);

  it('ApbdesBody memakai ApbdesChart.lazy, bukan ./ApbdesChart', () => {
    const src = read('apbdes/components/ApbdesBody.tsx');
    expect(importsEager(src, './ApbdesChart')).toBe(false);
    expect(importsEager(src, './ApbdesChart.lazy')).toBe(true);
  });

  it('section Kepuasan beranda memakai KepuasanCharts.lazy, bukan ./components/KepuasanCharts', () => {
    const src = read('kepuasan/index.tsx');
    expect(importsEager(src, './components/KepuasanCharts')).toBe(false);
    expect(importsEager(src, './components/KepuasanCharts.lazy')).toBe(true);
  });

  it.each(['apbdes/components/ApbdesChart.lazy.tsx', 'kepuasan/components/KepuasanCharts.lazy.tsx'])(
    '%s memuat grafik lewat dynamic() ssr:false dan MountWhenNear',
    (rel) => {
      const src = read(rel);
      expect(src).toMatch(/dynamic\(\s*\(\)\s*=>\s*import\(/);
      expect(src).toContain('ssr: false');
      expect(src).toContain('MountWhenNear');
    },
  );
});
