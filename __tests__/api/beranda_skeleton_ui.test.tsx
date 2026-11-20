// @vitest-environment node
// Kerangka (loading) section beranda meniru struktur isi asli: section kini baru fetch saat dekat layar, jadi kerangka
// yang lebih pendek/tinggi dari isi menggeser section di bawahnya (CLS) tepat saat data tiba. Diuji: jumlah & kelas
// elemen kerangka = isi asli, dan teks contoh hanya ada di atribut data-sample (bukan text node yang terindeks/dibaca).
// jsdom rusak di repo ini → markup diuji via renderToStaticMarkup; tinggi px diukur manual di browser (390 & 1440).
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));
vi.mock('@/app/admin/(dashboard)/_state/desa/layananDesa', async () => {
  const { proxy } = await import('valtio');
  return { default: proxy({ suratKeterangan: { findMany: { data: null as unknown[] | null, load: vi.fn() } } }) };
});
vi.mock('@/app/admin/(dashboard)/_state/desa/potensi', async () => {
  const { proxy } = await import('valtio');
  return { default: proxy({ potensiDesa: { findMany: { data: null as unknown[] | null, load: vi.fn() } } }) };
});

import { skeletonSample } from '@/app/(public)/_com/skeleton-text/skeleton-text.logic';
import { SkeletonText } from '@/app/(public)/_com/skeleton-text/SkeletonText';
import { AntiKorupsiGroups } from '@/app/(public)/_com/main-page/desaantikorupsi/AntiKorupsiGroups';
import {
  ANTIKORUPSI_LIMIT,
  ANTIKORUPSI_SKELETON_GROUPS,
} from '@/app/(public)/_com/main-page/desaantikorupsi/desaantikorupsi.meta';
import ak from '@/app/(public)/_com/main-page/desaantikorupsi/desaantikorupsi.module.css';
import { SdgsCardsSkeleton } from '@/app/(public)/_com/main-page/sdgs/SdgsCards';
import { SDGS_SKELETON_NAME_CHARS, SDGS_TOP_LIMIT } from '@/app/(public)/_com/main-page/sdgs/sdgs.meta';
import sd from '@/app/(public)/_com/main-page/sdgs/sdgs.module.css';
import { KabarBerita } from '@/app/(public)/_com/main-page/kabar-desa/KabarBerita';
import { KabarPengumuman } from '@/app/(public)/_com/main-page/kabar-desa/KabarPengumuman';
import {
  KABAR_BERITA_LIMIT,
  KABAR_PENGUMUMAN_LIMIT,
  KABAR_SKELETON_CHARS,
} from '@/app/(public)/_com/main-page/kabar-desa/kabar.meta';
import kb from '@/app/(public)/_com/main-page/kabar-desa/kabar.module.css';
import kp from '@/app/(public)/_com/main-page/kabar-desa/kabar.pengumuman.module.css';
import LayananPotensi from '@/app/(public)/_com/main-page/layanan-potensi';
import gl from '@/app/(public)/_com/main-page/layanan-potensi/gallery.module.css';
import layananState from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import potensiState from '@/app/admin/(dashboard)/_state/desa/potensi';

// MantineProvider menyisipkan <style> global; dibuang agar tersisa markup komponen saja.
const render = (node: ReactNode) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');
const count = (html: string, needle: string) => html.split(needle).length - 1;
/** Teks yang benar-benar jadi text node (atribut, termasuk data-sample, ikut terbuang bersama tag). */
const textNodes = (html: string) => html.replace(/<[^>]*>/g, '').trim();

describe('skeletonSample', () => {
  it('panjang tepat sesuai permintaan, termasuk saat potongan jatuh di spasi', () => {
    for (let n = 1; n <= 200; n++) expect(skeletonSample(n)).toHaveLength(n);
  });

  it('minimal 1 karakter dan pecahan dibulatkan ke bawah', () => {
    expect(skeletonSample(0)).toHaveLength(1);
    expect(skeletonSample(-5)).toHaveLength(1);
    expect(skeletonSample(3.9)).toHaveLength(3);
  });

  it('berisi kata dipisah spasi (bisa membungkus seperti teks asli), bukan satu kata panjang', () => {
    expect(skeletonSample(60).trim().split(' ').length).toBeGreaterThan(3);
  });
});

describe('SkeletonText', () => {
  it('teks contoh hanya di data-sample, tersembunyi dari pembaca layar, tanpa text node', () => {
    const html = render(<SkeletonText chars={30} />);
    expect(html).toContain(`data-sample="${skeletonSample(30)}"`);
    expect(html).toContain('aria-hidden="true"');
    expect(textNodes(html)).toBe('');
  });
});

describe('kerangka Anti Korupsi', () => {
  const html = render(<AntiKorupsiGroups groups={[]} loading />);

  it('meniru 2 grup / 6 butir dengan kelas isi asli', () => {
    expect(ANTIKORUPSI_SKELETON_GROUPS.flat()).toHaveLength(ANTIKORUPSI_LIMIT);
    expect(count(html, `class="${ak.group}"`)).toBe(2);
    expect(count(html, `class="${ak.groupTitle}"`)).toBe(2);
    expect(count(html, `class="${ak.item}"`)).toBe(6);
    expect(count(html, `class="${ak.itemText}"`)).toBe(6);
    expect(html).toContain(`data-sample="${skeletonSample(ANTIKORUPSI_SKELETON_GROUPS[0][0])}"`);
  });

  it('tanpa text node dan tersembunyi dari pembaca layar', () => {
    expect(textNodes(html)).toBe('');
    expect(html).toContain(`class="${ak.panel}" aria-hidden="true"`);
  });
});

describe('kerangka SDGs', () => {
  const html = render(<SdgsCardsSkeleton />);

  it('4 kartu kelas asli (ikon, nama, skor) sebanyak SDGS_TOP_LIMIT', () => {
    expect(SDGS_SKELETON_NAME_CHARS).toHaveLength(SDGS_TOP_LIMIT);
    expect(count(html, `class="${sd.card}"`)).toBe(4);
    expect(count(html, `class="${sd.iconEmpty}"`)).toBe(4);
    expect(count(html, `class="${sd.name}"`)).toBe(4);
    expect(count(html, `class="${sd.score}"`)).toBe(4);
  });

  it('role status berlabel, tanpa text node', () => {
    expect(html).toContain('role="status"');
    expect(textNodes(html)).toBe('');
  });
});

describe('kerangka Kabar Desa', () => {
  it('berita: 1 kartu utama + kartu kecil sebanyak KABAR_BERITA_LIMIT - 1, tanpa text node', () => {
    const html = render(<KabarBerita items={[]} loading />);
    expect(html).toContain('aria-busy="true"');
    expect(count(html, `class="${kb.featured}"`)).toBe(1);
    expect(count(html, `class="${kb.featuredTitle}"`)).toBe(1);
    expect(count(html, `class="${kb.card}"`)).toBe(KABAR_BERITA_LIMIT - 1);
    expect(count(html, `class="${kb.cardTitle}"`)).toBe(KABAR_BERITA_LIMIT - 1);
    expect(html).toContain(`data-sample="${skeletonSample(KABAR_SKELETON_CHARS.beritaTitle)}"`);
    expect(textNodes(html)).toBe('');
  });

  it('pengumuman: 3 baris kelas asli (judul, tanggal), judul section tetap tampil', () => {
    const html = render(<KabarPengumuman items={[]} loading />);
    expect(KABAR_PENGUMUMAN_LIMIT).toBe(3);
    expect(count(html, `class="${kp.row}"`)).toBe(3);
    expect(count(html, `class="${kp.rowTitle}"`)).toBe(3);
    expect(count(html, `class="${kp.rowDate}"`)).toBe(3);
    expect(html).toContain(`data-sample="${skeletonSample(KABAR_SKELETON_CHARS.date)}"`);
  });
});

describe('Layanan & Potensi: baris titik dicadangkan selama memuat', () => {
  // test-only: item galeri berbentuk respons findMany.
  const api = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `i${i}`, name: `item ${i}`, image: null }));
  const placeholder = `<div class="${gl.controls}" aria-hidden="true"></div>`;
  const set = (layanan: unknown[] | null, potensi: unknown[] | null) => {
    // Tipe `data` diambil dari modul state asli (Prisma); mock cukup bentuk { id, name, image }.
    (layananState.suratKeterangan.findMany as { data: unknown }).data = layanan;
    (potensiState.potensiDesa.findMany as { data: unknown }).data = potensi;
    return render(<LayananPotensi />);
  };

  it('keduanya memuat → wadah titik kosong (tinggi sama dengan titik asli)', () => {
    expect(set(null, null)).toContain(placeholder);
  });

  it('Layanan 1 item dan Potensi masih memuat → tetap dicadangkan (titik bisa mengikuti Potensi)', () => {
    expect(set(api(1), null)).toContain(placeholder);
  });

  it('Layanan ≥ 2 item → titik asli, bukan wadah kosong', () => {
    const html = set(api(3), null);
    expect(html).not.toContain(placeholder);
    expect(html).toContain(`class="${gl.controls}"`);
  });

  it('data tiba dan tak ada yang bisa diputar → tanpa baris titik', () => {
    expect(set(api(1), api(1))).not.toContain(`class="${gl.controls}"`);
  });
});
