// @vitest-environment node
// Bagan bertingkat Struktur Perangkat Desa (StrukturChart layout="tiers"): markup band/klaster, kartu ringkas,
// dan bagan pohon tetap untuk pemakai lain (PPID, BUMDes) maupun bentuk pohon yang tidak cocok.
// jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup.
import type { AnchorHTMLAttributes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

import { StrukturChart } from '@/app/(public)/_com/struktur-organisasi/StrukturChart';
import type { OrgNode } from '@/app/(public)/_com/struktur-organisasi/struktur.logic';

const render = (ui: React.ReactElement) => renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>);
const hrefFor = (id: string) => `/pemerintahan/profil/struktur-perangkat-desa/${id}`; // test-only
const LABEL = 'Bagan struktur perangkat desa';

// test-only: Perbekel → Sekdes (→ 2 Kaur) + 3 Kasi (hierarki 4).
const node = (id: string, title: string, hierarki: number, children: OrgNode[] = []): OrgNode => ({
  posisiId: id,
  title,
  hierarki,
  people: [{ id: `p-${id}`, name: `Nama ${title}`, image: null }],
  children,
});
const TREE: OrgNode[] = [
  node('per', 'Perbekel', 1, [
    node('sek', 'Sekretaris Desa', 2, [node('kaur1', 'Kaur Keuangan', 3), node('kaur2', 'Kaur Perencanaan', 3)]),
    node('kasi1', 'Kasi Pemerintahan', 4),
    node('kasi2', 'Kasi Kesejahteraan', 4),
    node('kasi3', 'Kasi Pelayanan', 4),
  ]),
];
const count = (source: string, needle: string | RegExp) => source.split(needle).length - 1;

describe('StrukturChart layout="tiers"', () => {
  const html = render(<StrukturChart roots={TREE} label={LABEL} hrefFor={hrefFor} layout="tiers" />);

  it('satu daftar akar berlabel, satu band per baris berisi klaster bersisi', () => {
    expect(count(html, `aria-label="${LABEL}"`)).toBe(1);
    expect(html).toMatch(/data-side="right"[^>]*data-head="true"/);
    expect(html).toMatch(/data-side="left" data-lower="true"/);
    expect(count(html, 'data-side=')).toBe(2);
  });

  it('akar kartu besar bernama utuh; bawahan kartu ringkas xs (kepala tone 1, bawahan kepala tone 2)', () => {
    expect(html).toMatch(/data-tone="0" data-size="lg" data-full-name="true"[^>]*aria-label="Nama Perbekel/);
    expect(html).toMatch(/data-tone="1" data-size="xs"[^>]*aria-label="Nama Sekretaris Desa/);
    expect(html).toMatch(/data-tone="2" data-size="xs"[^>]*aria-label="Nama Kaur Keuangan/);
    expect(html).toMatch(/data-tone="1" data-size="xs"[^>]*aria-label="Nama Kasi Pelayanan/);
    expect(count(html, '<a ')).toBe(7);
    expect(html).toContain(`href="${hrefFor('p-kasi3')}"`);
  });

  it('urutan DOM = urut pangkat (Sekdes & Kaur sebelum Kasi) untuk pembaca layar', () => {
    expect(html.indexOf('Nama Kaur Perencanaan')).toBeLessThan(html.indexOf('Nama Kasi Pemerintahan'));
  });

  it('hanya akar tersisa (hasil cari) → tanpa band', () => {
    const solo = render(<StrukturChart roots={[{ ...TREE[0], children: [] }]} label={LABEL} hrefFor={hrefFor} layout="tiers" />);
    expect(count(solo, 'data-side=')).toBe(0);
    expect(count(solo, '<a ')).toBe(1);
  });

  it('lebih dari satu akar → bagan pohon biasa', () => {
    const two = render(<StrukturChart roots={[TREE[0], node('lain', 'Lain', 1)]} label={LABEL} hrefFor={hrefFor} layout="tiers" />);
    expect(count(two, 'data-side=')).toBe(0);
    expect(two).not.toContain('data-size="xs"');
  });
});

describe('StrukturChart bawaan (PPID, BUMDes) tidak berubah', () => {
  it('tanpa layout → bagan pohon, tanpa kartu ringkas maupun band', () => {
    const html = render(<StrukturChart roots={TREE} label={LABEL} hrefFor={hrefFor} />);
    expect(count(html, 'data-side=')).toBe(0);
    expect(html).not.toContain('data-size="xs"');
    expect(html).not.toContain('data-full-name');
    expect(html).toMatch(/data-tone="0" data-size="lg"[^>]*aria-label="Nama Perbekel/);
  });
});
