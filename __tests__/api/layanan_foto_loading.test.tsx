// @vitest-environment node
// Juknis lomba 5.4: foto kartu Layanan di atas lipatan = kandidat LCP, jadi dimuat langsung (eager + prioritas tinggi),
// bukan lazy. Audit Lighthouse stg: "LCP resources shouldn't use loading=lazy" gagal di /pemerintahan/layanan.
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup (efek fetch tidak jalan; data diisi ke state valtio).
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn() }),
}));

import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import { SuratKeteranganCard } from '@/app/(public)/(pages)/pemerintahan/layanan/_com/SuratKeteranganCard';
import PelayananSuratKeterangan from '@/app/(public)/(pages)/pemerintahan/layanan/_com/pelayananSuratKeterangan';
import { LAYANAN_ABOVE_FOLD_COUNT } from '@/app/(public)/(pages)/pemerintahan/layanan/_com/layanan.meta';

const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const imgs = (html: string) => html.match(/<img[^>]*>/g) ?? [];
const preloads = (html: string) => html.match(/<link rel="preload" as="image"[^>]*>/g) ?? [];

// test-only: layanan berbentuk respons find-many.
const surat = (id: string, name: string) => ({
  id,
  name,
  image: { link: `https://example.test/${id}.jpg` },
  estimasiWaktu: null,
  biaya: null,
});

beforeEach(() => {
  stateLayananDesa.suratKeterangan.findMany.data = null;
  stateLayananDesa.suratKeterangan.findMany.loading = false;
});

describe('SuratKeteranganCard: pemuatan foto', () => {
  it('di atas lipatan: eager + fetchPriority high (React juga menambah preload gambar)', () => {
    const html = render(<SuratKeteranganCard item={surat('a', 'A')} aboveFold />);
    const [img] = imgs(html);
    expect(img).toContain('loading="eager"');
    expect(img).toContain('fetchPriority="high"');
    expect(img).not.toContain('loading="lazy"');
    expect(preloads(html)).toHaveLength(1);
  });

  it('bawaan (tanpa aboveFold): tetap lazy, tanpa prioritas tinggi dan tanpa preload', () => {
    const html = render(<SuratKeteranganCard item={surat('a', 'A')} />);
    const [img] = imgs(html);
    expect(img).toContain('loading="lazy"');
    expect(img).not.toContain('fetchPriority');
    expect(img).not.toContain('loading="eager"');
    expect(preloads(html)).toHaveLength(0);
  });
});

describe('PelayananSuratKeterangan: kartu awal dimuat langsung, sisanya lazy', () => {
  it(`hanya ${LAYANAN_ABOVE_FOLD_COUNT} kartu pertama yang eager + prioritas tinggi`, () => {
    const total = LAYANAN_ABOVE_FOLD_COUNT + 4;
    stateLayananDesa.suratKeterangan.findMany.data = Array.from({ length: total }, (_, i) => surat(`s${i}`, `Surat ${i}`));
    const html = render(<PelayananSuratKeterangan />);
    const tags = imgs(html);
    expect(tags).toHaveLength(total);
    expect(tags.filter((t) => t.includes('loading="eager"') && t.includes('fetchPriority="high"'))).toHaveLength(LAYANAN_ABOVE_FOLD_COUNT);
    expect(tags.filter((t) => t.includes('loading="lazy"'))).toHaveLength(total - LAYANAN_ABOVE_FOLD_COUNT);
    expect(preloads(html)).toHaveLength(LAYANAN_ABOVE_FOLD_COUNT);
  });

  it('urutan: kartu pertama eager, kartu terakhir lazy', () => {
    stateLayananDesa.suratKeterangan.findMany.data = Array.from({ length: 8 }, (_, i) => surat(`s${i}`, `Surat ${i}`));
    const html = render(<PelayananSuratKeterangan />);
    const imgTag = (id: string) => html.match(new RegExp(`<img[^>]*src="https://example\\.test/${id}\\.jpg"[^>]*>`))?.[0] ?? '';
    expect(imgTag('s0')).toContain('loading="eager"');
    expect(imgTag('s7')).toContain('loading="lazy"');
  });
});
