// @vitest-environment node
// Program Inovasi publik (Inovasi › Program Inovasi): URL, ubin, deskripsi meta, data + metadata SEO detail,
// sanitasi isi di server, submenu navbar + visibilitas menu, dan redirect rute lama.
import { describe, expect, it, vi } from 'vitest';

const redirect = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ redirect, notFound: vi.fn() }));
vi.mock('@/lib/prisma', () => ({ default: {} }));

import {
  programInovasiDetailHref,
  programInovasiListHref,
  programInovasiMetaDescription,
  toProgramInovasiTile,
} from '@/app/(public)/(pages)/inovasi/program-inovasi/_com/program-inovasi.logic';
import {
  programInovasiMetadata,
  toProgramInovasiDetailView,
} from '@/app/(public)/(pages)/inovasi/program-inovasi/_com/detail/program-inovasi-detail.logic';
import OldRoute from '@/app/(public)/(tambahan)/program-inovasi/[id]/page';
import { isKnownMenuKey, menuVisibilityGroups } from '@/app/(public)/_com/menu-visibility.logic';
import navbarListMenu from '@/con/navbar-list-menu';
import type { ProgramInovasiPublik } from '@/lib/program-inovasi.server';
import { sanitizeArticleHtml } from '@/lib/rich-text-server';

// test-only: berkas & program fiktif berbentuk hasil prisma (include image + images).
const file = (id: string, link: string) => ({
  id, name: id, realName: id, path: id, mimeType: 'image/png', size: 1, category: 'image',
  createdAt: new Date(0), updatedAt: new Date(0), deletedAt: null, isActive: true, link,
});
const program = (over: Partial<ProgramInovasiPublik> = {}): ProgramInovasiPublik => ({
  id: 'davest', name: 'Davest', description: '<p>Darmasaba Village Festival hadir sejak 2022.</p>',
  imageId: 'logo', link: null, urutan: 1, createdAt: new Date(0), updatedAt: new Date(0), deletedAt: null,
  isActive: true, image: file('logo', '/api/img/logo'), images: [file('a', '/api/img/a'), file('b', ' ')],
  ...over,
});

describe('URL', () => {
  it('detail di bawah /inovasi/program-inovasi dengan id ter-encode; daftar tanpa query default', () => {
    expect(programInovasiDetailHref('a b')).toBe('/inovasi/program-inovasi/a%20b');
    expect(programInovasiListHref()).toBe('/inovasi/program-inovasi');
    expect(programInovasiListHref({ search: 'dav', page: 2 })).toContain('search=dav');
  });
});

describe('toProgramInovasiTile', () => {
  it('judul dirapikan, ringkasan teks polos dari HTML, logo, tautan detail', () => {
    expect(
      toProgramInovasiTile({ id: 'p1', name: ' Davest ', description: '<p>Festival <strong>desa</strong></p>', image: { link: '/api/img/l' } }),
    ).toEqual({ id: 'p1', title: 'Davest', summary: 'Festival desa', logo: '/api/img/l', href: '/inovasi/program-inovasi/p1' });
  });

  it('tanpa logo / logo kosong → logo undefined; deskripsi null → ringkasan kosong', () => {
    const tile = toProgramInovasiTile({ id: 'p2', name: 'GM', description: null, image: { link: '  ' } });
    expect(tile.logo).toBeUndefined();
    expect(tile.summary).toBe('');
  });
});

describe('programInovasiMetaDescription', () => {
  it('teks pendek apa adanya; kosong → undefined', () => {
    expect(programInovasiMetaDescription('<p>Singkat.</p>')).toBe('Singkat.');
    expect(programInovasiMetaDescription('<p></p>')).toBeUndefined();
  });

  it('teks panjang dipotong di batas kata dengan elipsis, tidak melebihi batas', () => {
    const hasil = programInovasiMetaDescription(`<p>${'kata '.repeat(60)}</p>`, 40) ?? '';
    expect(hasil.length).toBeLessThanOrEqual(40);
    expect(hasil.endsWith('kata…')).toBe(true);
  });
});

describe('detail: tampilan & metadata', () => {
  it('foto tanpa tautan dibuang; logo dari image', () => {
    const view = toProgramInovasiDetailView(program(), '<p>x</p>');
    expect(view.logo).toBe('/api/img/logo');
    expect(view.photos.map((p) => p.id)).toEqual(['a']);
    expect(view.html).toBe('<p>x</p>');
  });

  it('metadata: judul nama, deskripsi cuplikan, kanonik, og:image logo', () => {
    const meta = programInovasiMetadata(program());
    expect(meta.title).toBe('Davest');
    expect(meta.description).toBe('Darmasaba Village Festival hadir sejak 2022.');
    expect(meta.alternates?.canonical).toBe('/inovasi/program-inovasi/davest');
    expect(meta.openGraph?.images).toEqual([{ url: '/api/img/logo', alt: 'Davest' }]);
  });

  it('tanpa logo → tanpa og:image', () => {
    expect(programInovasiMetadata(program({ image: null })).openGraph?.images).toBeUndefined();
  });
});

describe('sanitizeArticleHtml', () => {
  it('mempertahankan judul bagian, garis, dan daftar dari editor admin', () => {
    const html = '<p>A</p><hr><h3>Tujuan</h3><ul><li><p>Satu</p></li></ul>';
    expect(sanitizeArticleHtml(html)).toBe('<p>A</p><hr /><h3>Tujuan</h3><ul><li><p>Satu</p></li></ul>');
  });

  it('membuang script, atribut, dan skema berbahaya; tautan dibuka aman di tab baru', () => {
    const out = sanitizeArticleHtml('<p style="color:red" onclick="x()">A<script>alert(1)</script></p><a href="javascript:alert(1)">j</a><a href="https://darmasaba.id">d</a>');
    expect(out).not.toContain('script');
    expect(out).not.toContain('style=');
    expect(out).not.toContain('onclick');
    expect(out).not.toContain('javascript:');
    expect(sanitizeArticleHtml('<a href="/x" target="_self" rel="opener">x</a>')).toBe('<a href="/x" target="_blank" rel="noopener noreferrer">x</a>');
    expect(out).toContain('<a href="https://darmasaba.id" target="_blank" rel="noopener noreferrer">d</a>');
  });

  it('isian kosong editor → string kosong', () => {
    expect(sanitizeArticleHtml('<p></p>')).toBe('');
    expect(sanitizeArticleHtml(null)).toBe('');
  });
});

describe('submenu navbar & visibilitas', () => {
  it('Inovasi memuat "Program Inovasi" sebagai submenu pertama', () => {
    const inovasi = navbarListMenu.find((m) => m.name === 'Inovasi');
    expect(inovasi?.children?.[0]).toMatchObject({ name: 'Program Inovasi', href: '/inovasi/program-inovasi' });
    expect(inovasi?.children?.[0].hidden).toBeFalsy();
  });

  it('terdaftar di Pengaturan › Visibilitas Menu (menuKey = href)', () => {
    expect(isKnownMenuKey('/inovasi/program-inovasi')).toBe(true);
    const grup = menuVisibilityGroups({}).find((g) => g.name === 'Inovasi');
    expect(grup?.items.map((i) => i.menuKey)).toContain('/inovasi/program-inovasi');
  });
});

describe('rute lama /program-inovasi/[id]', () => {
  it('dialihkan ke halaman detail baru, bukan overlay beranda', async () => {
    await OldRoute({ params: Promise.resolve({ id: 'davest' }) });
    expect(redirect).toHaveBeenCalledWith('/inovasi/program-inovasi/davest');
  });
});
