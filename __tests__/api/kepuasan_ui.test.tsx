// @vitest-environment node
// UI section Indeks Kepuasan: keadaan kosong (tanpa grafik) dan keadaan berisi (panel + legenda).
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { KepuasanEmpty } from '@/app/darmasaba/_com/main-page/kepuasan/components/KepuasanEmpty';
import { KepuasanCharts } from '@/app/darmasaba/_com/main-page/kepuasan/components/KepuasanCharts';
import { KepuasanDonutCard } from '@/app/darmasaba/_com/main-page/kepuasan/components/KepuasanDonutCard';
import { summarizeKepuasan } from '@/app/darmasaba/_com/main-page/kepuasan/kepuasan.logic';
import { KEPUASAN_TEXT } from '@/app/darmasaba/_com/main-page/kepuasan/kepuasan.text';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>)
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/ /g, ' ');

describe('KepuasanEmpty', () => {
  it('satu kartu: pesan + tombol "Ajukan Responden", tanpa grafik atau "Belum ada data" berulang', () => {
    const html = render(<KepuasanEmpty onCta={() => {}} />);
    expect(html).toContain(KEPUASAN_TEXT.emptyTitle);
    expect(html).toContain(KEPUASAN_TEXT.emptyBody);
    expect(html.match(/<button/g)).toHaveLength(1);
    expect(html).toContain(KEPUASAN_TEXT.cta);
    expect(html).not.toContain('recharts');
    expect(html).not.toContain(KEPUASAN_TEXT.chartEmpty);
  });
});

describe('KepuasanCharts', () => {
  // test-only: 3 responden fiktif untuk memeriksa markup.
  const summary = summarizeKepuasan([
    { tanggal: '2026-03-15T00:00:00.000Z', jenisKelamin: { name: 'Laki-laki' }, rating: { name: 'Baik' }, kelompokUmur: { name: 'Muda' } },
    { tanggal: '2026-03-16T00:00:00.000Z', jenisKelamin: { name: 'Perempuan' }, rating: { name: 'Baik' }, kelompokUmur: { name: 'Muda' } },
    { tanggal: '2026-04-15T00:00:00.000Z', jenisKelamin: { name: 'Perempuan' }, rating: { name: 'Sangat Baik' }, kelompokUmur: { name: 'Lansia' } },
  ]);

  it('panel bulanan dengan total server (format id-ID) dan judul h3', () => {
    const html = render(<KepuasanCharts summary={summary} total={1234} />);
    expect(html).toContain(`<h3`);
    expect(html).toContain(KEPUASAN_TEXT.monthlyTitle);
    expect(html).toContain(KEPUASAN_TEXT.total);
    expect(html).toContain('1.234');
  });

  it('tiga kartu komposisi dengan legenda jumlah + persen', () => {
    const html = render(<KepuasanCharts summary={summary} total={3} />);
    for (const t of [KEPUASAN_TEXT.jenisKelaminTitle, KEPUASAN_TEXT.ratingTitle, KEPUASAN_TEXT.kelompokUmurTitle]) {
      expect(html).toContain(t);
    }
    expect(html).toContain('Perempuan');
    expect(html).toMatch(/66,7 ?%/);
    expect(html).toMatch(/33,3 ?%/);
    expect(html.match(/<li/g)).toHaveLength(2 + 4 + 3);
  });
});

describe('KepuasanDonutCard', () => {
  it('kategori 0 tetap tampil di legenda dengan 0 dan 0%', () => {
    const html = render(
      <KepuasanDonutCard
        title="Jenis kelamin"
        slices={[
          { name: 'Laki-laki', value: 2, color: '#0A4E78' },
          { name: 'Perempuan', value: 0, color: '#8AC1E3' },
        ]}
      />,
    );
    expect(html.match(/<li/g)).toHaveLength(2);
    expect(html).toContain('Perempuan');
    expect(html).toMatch(/>0 ?%</);
  });

  it('semua kategori 0 → catatan singkat, tanpa legenda', () => {
    const html = render(<KepuasanDonutCard title="Umur" slices={[{ name: 'Muda', value: 0, color: '#000' }]} />);
    expect(html).toContain(KEPUASAN_TEXT.chartEmpty);
    expect(html).not.toContain('<li');
  });
});
