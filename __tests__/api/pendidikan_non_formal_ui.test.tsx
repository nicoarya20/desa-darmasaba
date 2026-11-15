// @vitest-environment node
// Daftar Jenis Program (Pendidikan Non Formal): markup via renderToStaticMarkup (jsdom rusak di repo ini).
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({ useTransitionRouter: () => ({ back: vi.fn() }) }));
// DOMPurify tanpa DOM tidak punya `sanitize`; stub identitas cukup untuk bagian yang jatuh ke prosa.
vi.mock('dompurify', () => ({ default: { sanitize: (html: string) => html } }));
vi.mock('@/lib/api-fetch', () => ({ default: { api: { pendidikan: { pendidikannonformal: {} } } } }));

import { JenisProgramList } from '@/app/(public)/(pages)/pendidikan/pendidikan-non-formal/_com/JenisProgramList';
import { ProgramInfoPage } from '@/app/(public)/(pages)/pendidikan/_com/program-info/ProgramInfoPage';
import { toSectionView } from '@/app/(public)/(pages)/pendidikan/pendidikan-non-formal/_com/PendidikanNonFormalPage';

// test-only
const SEED_HTML =
  '<p>Program uji meliputi:</p><p>1) Keaksaraan Uji</p><ul><li><p>Untuk warga uji</p></li></ul>' +
  '<p>2) Kesetaraan Uji</p><ul><li><p>Setara SD</p></li></ul>';

describe('JenisProgramList', () => {
  it('merender pengantar lalu <ol> berisi nama + keterangan, tanpa nomor ketikan admin', () => {
    const html = renderToStaticMarkup(
      <JenisProgramList data={{ pengantar: ['Pengantar uji'], items: [{ nama: 'A & B', keterangan: ['k1', 'k2'] }] }} />,
    );
    expect(html).toMatch(/<p class="[^"]*pengantar[^"]*">Pengantar uji<\/p>/);
    expect(html).toContain('<ol');
    expect(html).toMatch(/nama[^"]*">A &amp; B<\/span>/);
    expect(html.match(/keterangan[^"]*">k\d<\/span>/g)).toHaveLength(2);
  });
});

describe('toSectionView', () => {
  const entry = (over: Partial<{ key: string; html: string | null; failed: boolean }>) => ({
    key: 'jenis-program',
    title: 'Jenis Program',
    html: SEED_HTML,
    failed: false,
    ...over,
  });

  it('Jenis Program berpola → content daftar bernomor tanpa nomor ketikan admin', () => {
    const view = toSectionView(entry({}));
    const html = renderToStaticMarkup(<>{view.content}</>);
    expect(html).toContain('<ol');
    expect(html.match(/<li/g)).toHaveLength(2);
    expect(html).toContain('Keaksaraan Uji');
    expect(html).not.toContain('1) ');
  });

  it('Jenis Program tak berpola, gagal, atau bagian lain → content undefined (ditangani modul program-info)', () => {
    expect(toSectionView(entry({ html: '<h2>Lain</h2>' })).content).toBeUndefined();
    expect(toSectionView(entry({ html: null, failed: true })).content).toBeUndefined();
    expect(toSectionView(entry({ key: 'tujuan' })).content).toBeUndefined();
  });
});

describe('halaman dengan kerangka program-info', () => {
  it('h1 nama menu, tiga bagian berurutan dengan judul CMS, Jenis Program sebagai daftar bernomor', () => {
    const entries = [
      { key: 'tujuan', title: 'Tujuan Program', html: '<ul><li><p>Tujuan uji</p></li></ul>', failed: false },
      { key: 'jenis-program', title: 'Jenis Program', html: SEED_HTML, failed: false },
      { key: 'tempat', title: 'Tempat Kegiatan', html: '<ul><li><p>Balai uji</p></li></ul>', failed: false },
    ];
    const html = renderToStaticMarkup(
      <MantineProvider>
        <ProgramInfoPage title="Pendidikan Non Formal" lead="Pengantar uji." sections={entries.map(toSectionView)} />
      </MantineProvider>,
    );
    expect(html).toMatch(/<h1[^>]*>Pendidikan Non Formal<\/h1>/);
    const h2 = [...html.matchAll(/<h2[^>]*>([^<]*)<\/h2>/g)].map((m) => m[1]);
    expect(h2).toEqual(['Tujuan Program', 'Jenis Program', 'Tempat Kegiatan']);
    expect(html.match(/<ol/g)).toHaveLength(1);
    expect(html).toContain('Kesetaraan Uji');
  });
});
