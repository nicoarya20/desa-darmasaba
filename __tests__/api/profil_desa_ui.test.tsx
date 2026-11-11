// @vitest-environment node
// Halaman Profil Desa (Pemerintahan): kartu section, Moto SIGAP, Profil Perbekel 2 kolom, peta cadangan,
// galeri maskot, riwayat perbekel, dan bagan Struktur Perangkat Desa (bagan baru, tautan ke rute perangkat).
// jsdom gagal start di repo ini → markup diuji via renderToStaticMarkup (effect tidak jalan; useLoadOnce di-mock).
import type { AnchorHTMLAttributes, ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => {
  const unique = () => ({ data: null as unknown, error: null as unknown, load: () => Promise.resolve() });
  return {
    loaded: false,
    profile: {
      sejarahDesa: { findUnique: unique() },
      visiMisiDesa: { findUnique: unique() },
      wilayahDesa: { findUnique: unique() },
      lambangDesa: { findUnique: unique() },
      maskotDesa: { findUnique: unique() },
      profilPerbekel: { findUnique: unique() },
      mantanPerbekel: { findMany: unique() },
    },
  };
});

vi.mock('next-view-transitions', () => ({
  Link: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
  useTransitionRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));
vi.mock('valtio/utils', () => ({ useProxy: <T,>(x: T) => x }));
vi.mock('@/app/admin/(dashboard)/_state/desa/profile', () => ({ default: h.profile }));
vi.mock('@/app/admin/(dashboard)/_state/ppid/struktur_ppid/struktur_PPID', () => ({
  default: {
    pegawai: { findMany: { data: null, load: vi.fn() } },
    posisiOrganisasi: { findManyAll: { data: [], load: vi.fn() } },
  },
}));
vi.mock('@/app/(public)/(pages)/pemerintahan/profil/_com/use-load-once', () => ({ useLoadOnce: () => h.loaded }));

import Page from '@/app/(public)/(pages)/pemerintahan/profil/page';
import StrukturPerangkatPage from '@/app/(public)/(pages)/pemerintahan/profil/struktur-perangkat-desa/page';
import { KANTOR_MAP_EMBED_URL, PERBEKEL_NAME, strukturPerangkatHref } from '@/app/(public)/(pages)/pemerintahan/profil/_com/profil.meta';
import MaskotDesa from '@/app/(public)/(pages)/pemerintahan/profil/ui/maskotDesa';
import MotoDesa from '@/app/(public)/(pages)/pemerintahan/profil/ui/motoDesa';
import ProfilPerbekel from '@/app/(public)/(pages)/pemerintahan/profil/ui/profilPerbekel';
import SemuaPerbekel from '@/app/(public)/(pages)/pemerintahan/profil/ui/semuaPerbekel';
import VisiMisiDesa from '@/app/(public)/(pages)/pemerintahan/profil/ui/visimisiDesa';
import WilayahDesa from '@/app/(public)/(pages)/pemerintahan/profil/ui/wilayahDesa';
import { StrukturBody } from '@/app/(public)/(pages)/ppid/struktur-ppid/_com/StrukturBody';
import type { OrgNode } from '@/app/(public)/(pages)/ppid/struktur-ppid/_com/struktur.logic';
import type { StrukturData } from '@/app/(public)/(pages)/ppid/struktur-ppid/_com/use-struktur-data';

const render = (ui: ReactElement) => renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>);
const count = (source: string, needle: string | RegExp) => source.split(needle).length - 1;
const set = (key: keyof typeof h.profile, data: unknown) => {
  const slot = h.profile[key] as { findUnique?: { data: unknown }; findMany?: { data: unknown } };
  (slot.findUnique ?? slot.findMany)!.data = data;
};

beforeEach(() => {
  h.loaded = false;
  for (const key of Object.keys(h.profile) as (keyof typeof h.profile)[]) set(key, null);
});

describe('Profil Desa — halaman', () => {
  it('h1 "Profil Desa" (bukan "Profile"), tiap section berupa kerangka selama memuat', () => {
    const html = render(<Page />);
    expect(html).toMatch(/<h1[^>]*>Profil Desa<\/h1>/);
    for (const label of ['Memuat sejarah desa…', 'Memuat visi dan misi…', 'Memuat profil perbekel…', 'Memuat daftar perbekel…']) {
      expect(html).toContain(`aria-label="${label}"`);
    }
  });

  it('hanya satu tombol kembali dan bagan struktur tanpa kontrol zoom/fullscreen lama', () => {
    const html = render(<Page />);
    expect(count(html, 'aria-label="Kembali')).toBe(1);
    expect(html).not.toMatch(/Zoom|Fullscreen/);
    expect(html).toMatch(/<h2[^>]*>Struktur Perangkat Desa<\/h2>/);
    expect(html).toContain('aria-label="Cari nama atau jabatan"');
  });
});

describe('Profil Desa — Moto SIGAP', () => {
  const html = render(<MotoDesa />);

  it('lima nilai berurutan S-I-G-A-P dalam satu daftar bernomor', () => {
    expect(count(html, '<ol')).toBe(1);
    expect(count(html, '<li')).toBe(5);
    const titles = [...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map((m) => m[1]);
    expect(titles).toEqual(['Santun', 'Inovatif', 'Gesit', 'Adaptif', 'Profesional']);
  });

  it('huruf akronim disembunyikan dari pembaca layar; kalimat komitmen menonjolkan SIGAP', () => {
    expect(count(html, /aria-hidden="true">[SIGAP]</)).toBe(5);
    expect(html).toContain('<strong>SIGAP</strong>');
  });
});

describe('Profil Desa — Visi Misi', () => {
  it('memakai kartu Visi Misi PPID tanpa moto: lambang lalu Visi Desa, misi polos jadi butir bernomor', () => {
    set('visiMisiDesa', { visi: '<p>Visi uji</p>', misi: '<ol><li>Misi satu</li><li>Misi dua</li></ol>' });
    const html = render(<VisiMisiDesa />);
    expect(html).toMatch(/<h2[^>]*>Visi Desa<\/h2>/);
    expect(html).toMatch(/<h2[^>]*>Misi Desa<\/h2>/);
    expect(html).not.toContain('Moto');
    expect(html.indexOf('alt="Lambang Desa Darmasaba"')).toBeLessThan(html.indexOf('>Visi Desa<'));
    expect(html).toContain('Misi dua');
  });

  it('data kosong setelah dimuat → pesan kosong, bukan kerangka', () => {
    h.loaded = true;
    const html = render(<VisiMisiDesa />);
    expect(html).toContain('Visi dan misi desa belum tersedia.');
    expect(html).not.toContain('role="status"');
  });
});

describe('Profil Desa — Letak & Batas Wilayah', () => {
  it('tanpa peta CMS → peta Kantor Perbekel berjudul + keterangan', () => {
    h.loaded = true;
    const html = render(<WilayahDesa />);
    expect(html).toContain('Data batas wilayah belum tersedia.');
    expect(html).toContain(`src="${KANTOR_MAP_EMBED_URL.replace(/&/g, '&amp;')}"`);
    expect(html).toContain('title="Peta lokasi Kantor Perbekel Darmasaba"');
    expect(html).toContain('<figcaption');
  });

  it('batas terisi → daftar 4 arah + luas; peta CMS dipakai tanpa keterangan kantor', () => {
    set('wilayahDesa', {
      batasUtara: 'Desa A', batasSelatan: 'Desa B', batasTimur: '', batasBarat: 'Desa D',
      luasWilayah: 1234.5, keterangan: null, petaEmbedUrl: 'https://maps.example.test/embed', // test-only
    });
    const html = render(<WilayahDesa />);
    expect(count(html, '<dt')).toBe(4);
    expect(html).toContain('Sebelah Timur');
    expect(html).toMatch(/<dd[^>]*>–<\/dd>/);
    expect(html).toContain('1.234,5 ha');
    expect(html).toContain('title="Peta wilayah Desa Darmasaba"');
    expect(html).not.toContain('<figcaption');
  });
});

describe('Profil Desa — Maskot', () => {
  it('galeri hanya gambar bertautan, tiap gambar berlabel', () => {
    set('maskotDesa', {
      deskripsi: '<p>Sekar Pudak</p>',
      images: [
        { id: 'a', label: 'Pudak', image: { link: '/api/img/a.webp' } },
        { id: 'b', label: 'Tanpa file', image: null },
        { id: 'c', label: 'Logo', image: { link: '/api/img/c.webp' } },
      ],
    });
    const html = render(<MaskotDesa />);
    expect(count(html, '<figure')).toBe(2);
    expect(html).toContain('<figcaption class="');
    expect(html).not.toContain('Tanpa file');
    expect(html).toContain('alt="Lambang maskot Sekar Pudak"');
  });

  it('tanpa gambar → pesan galeri kosong', () => {
    set('maskotDesa', { deskripsi: '<p>Sekar Pudak</p>', images: [] });
    expect(render(<MaskotDesa />)).toContain('Belum ada gambar maskot yang ditambahkan.');
  });
});

describe('Profil Desa — Profil Perbekel', () => {
  it('kartu foto bernama + blok riwayat yang terisi saja (blok kosong disembunyikan)', () => {
    set('profilPerbekel', {
      image: null, biodata: '<p>Bio</p>', pengalaman: '<p>Kerja</p>', pengalamanOrganisasi: '', programUnggulan: '<p>Program</p>',
    });
    const html = render(<ProfilPerbekel />);
    expect(html).toContain(`alt="Foto ${PERBEKEL_NAME}"`);
    const blocks = [...html.matchAll(/<h3[^>]*>(?:<svg[\s\S]*?<\/svg>)?([^<]+)<\/h3>/g)].map((m) => m[1]);
    expect(blocks).toEqual(['Biodata', 'Pengalaman', 'Program Kerja Unggulan']);
  });
});

describe('Profil Desa — Perbekel dari Masa ke Masa', () => {
  it('kartu potret: foto atau siluet, nama, wilayah, periode', () => {
    set('mantanPerbekel', [
      { id: '1', nama: 'Si Gede Kania', daerah: 'Perbekel Tegal', periode: 'Tahun 1943 - 1946', image: { link: '/api/img/1.webp' } },
      { id: '2', nama: 'I Made Uji', daerah: 'Perbekel Uji', periode: 'Tahun 1950', image: null },
    ]);
    const html = render(<SemuaPerbekel />);
    expect(count(html, '<li')).toBe(2);
    expect(html).toContain('alt="Si Gede Kania"');
    expect(count(html, 'tabler-icon-user-filled')).toBe(1);
    expect(html).toContain('Tahun 1943 - 1946');
  });

  it('kosong setelah dimuat → pesan kosong', () => {
    h.loaded = true;
    set('mantanPerbekel', []);
    expect(render(<SemuaPerbekel />)).toContain('Data perbekel dari masa ke masa belum tersedia.');
  });
});

describe('Struktur Perangkat Desa — bagan baru', () => {
  // test-only: Kepala Desa dengan dua bawahan (salah satunya kosong) — bagan lama hanya menggambar satu akar.
  const tree: OrgNode[] = [
    {
      posisiId: 'kades', title: 'Kepala Desa', hierarki: 1, people: [{ id: 'p1', name: 'Ida Bagus', image: null }],
      children: [
        { posisiId: 'kaur', title: 'Kaur Umum & TU', hierarki: 2, people: [], children: [] },
        { posisiId: 'sek', title: 'Sekretaris Desa', hierarki: 2, people: [{ id: 'p2', name: 'I Ketut', image: null }], children: [] },
      ],
    },
  ];
  const data = { loading: false, tree, visible: tree, search: '', setSearch: vi.fn(), query: '', reload: vi.fn() } as StrukturData;

  it('kartu menaut ke profil perangkat desa, bukan ke rute PPID', () => {
    const html = render(<StrukturBody data={data} label="Bagan struktur perangkat desa" emptyHint="-" hrefFor={strukturPerangkatHref} />);
    expect(html).toContain('href="/pemerintahan/profil/struktur-perangkat-desa/p1"');
    expect(html).toContain('href="/pemerintahan/profil/struktur-perangkat-desa/p2"');
    expect(html).not.toContain('/ppid/struktur-ppid/');
    expect(html).toContain('aria-label="Bagan struktur perangkat desa"');
    expect(html).toContain('Belum ditugaskan');
  });

  it('halaman mandiri: h1, kotak cari, kerangka saat memuat, tanpa zoom/fullscreen', () => {
    const html = render(<StrukturPerangkatPage />);
    expect(html).toMatch(/<h1[^>]*>Struktur Perangkat Desa<\/h1>/);
    expect(html).toContain('aria-label="Cari nama atau jabatan"');
    expect(html).toContain('role="status"');
    expect(html).not.toMatch(/Zoom|Fullscreen/);
  });
});
