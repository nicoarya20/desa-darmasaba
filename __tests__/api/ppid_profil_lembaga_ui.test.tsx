// @vitest-environment node
// Lomba 2.5: halaman publik Profil PPID menampilkan profil lembaga (deskripsi, tujuan, tugas dan fungsi, gambar alur)
// sebagai bagian utama bila datanya ada, profil perorangan lama tetap tampil di bawahnya, dan tanpa profil lembaga
// halaman sama seperti semula. DOMPurify butuh DOM (jsdom tak bisa dimuat) → diganti stub yang mencatat input/opsi;
// allowlist-nya sendiri dikunci di rich_text.test.ts. Markup diuji lewat renderToStaticMarkup.
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RICH_TEXT_TAGS } from '@/lib/rich-text';

const { sanitize, profilePPID, lembaga } = vi.hoisted(() => ({
  // Stub: buang <script> beserta isinya dan atribut on*, seperti DOMPurify dengan allowlist teks dasar.
  sanitize: vi.fn((html: string) => html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/ on\w+="[^"]*"/g, '')),
  profilePPID: { loading: false, error: null as string | null, load: vi.fn(), data: null as unknown },
  lembaga: { loading: false, error: null as string | null, load: vi.fn(), data: null as unknown },
}));

vi.mock('dompurify', () => ({ default: { sanitize } }));
vi.mock('valtio/utils', () => ({ useProxy: <T,>(x: T) => x }));
vi.mock('@/app/context/MusicContext', () => ({ useMusic: () => ({ currentSong: null }) })); // test-only: ScrollToTopButton membaca useMusic, provider hanya ada di root layout
vi.mock('next-view-transitions', () => ({ useTransitionRouter: () => ({ back: vi.fn() }) }));
vi.mock('@/app/admin/(dashboard)/_state/ppid/profile_ppid/profile_PPID', () => ({ default: { profile: profilePPID } }));
vi.mock('@/app/admin/(dashboard)/_state/ppid/profil_lembaga/profilLembaga', () => ({ default: { find: lembaga } }));

import Page from '@/app/(public)/(pages)/ppid/profil-ppid/page';

const render = (ui: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: profil perorangan dan profil lembaga fiktif.
const PERORANGAN = {
  id: 'ppid-1',
  name: 'Nama Pejabat Uji',
  biodata: '<p>Isi biografi.</p>',
  riwayat: '<ul><li>Jabatan uji</li></ul>',
  pengalaman: '<ul><li>Organisasi uji</li></ul>',
  unggulan: '<ul><li>Program uji</li></ul>',
  image: null,
};
const LEMBAGA = {
  id: 'pl-1',
  deskripsi: '<p>Deskripsi lembaga uji.</p>',
  tujuan: '<ul><li>Tujuan satu uji</li></ul>',
  tugasFungsi: '<p>Tugas <strong>dan fungsi</strong> uji.</p>',
  gambarAlurId: 'img-1',
  gambarAlur: { id: 'img-1', link: '/api/img/alur-uji.png', realName: 'alur-uji.png' },
};

beforeEach(() => {
  sanitize.mockClear();
  profilePPID.loading = false;
  profilePPID.error = null;
  profilePPID.data = PERORANGAN;
  lembaga.loading = false;
  lembaga.error = null;
  lembaga.data = LEMBAGA;
});

describe('Profil PPID publik dengan profil lembaga', () => {
  it('menampilkan keempat bagian profil lembaga sebagai bagian utama', () => {
    const html = render(<Page />);
    expect(html).toMatch(/<h2[^>]*>Profil Lembaga<\/h2>/);
    for (const label of ['Deskripsi', 'Tujuan', 'Tugas dan Fungsi', 'Alur Layanan Informasi Publik']) {
      expect(html).toContain(`>${label}</h3>`);
    }
    expect(html).toContain('Deskripsi lembaga uji.');
    expect(html).toContain('<li>Tujuan satu uji</li>');
    expect(html).toContain('<strong>dan fungsi</strong>');
    expect(html).toMatch(/<img[^>]*src="\/api\/img\/alur-uji\.png"[^>]*alt="Bagan alur layanan informasi publik/);
  });

  it('profil lembaga tampil lebih dulu, profil perorangan lama tetap tampil di bawahnya', () => {
    const html = render(<Page />);
    const lembagaAt = html.indexOf('>Profil Lembaga</h2>');
    const peroranganAt = html.indexOf('Pejabat Pengelola Informasi dan Dokumentasi');
    expect(lembagaAt).toBeGreaterThan(-1);
    expect(peroranganAt).toBeGreaterThan(lembagaAt);
    for (const text of ['Nama Pejabat Uji', 'Isi biografi.', 'Jabatan uji', 'Organisasi uji', 'Program uji']) {
      expect(html).toContain(text);
    }
    expect(html).toContain('alt="Foto Pimpinan"');
  });

  it('teks lembaga dirender lewat DOMPurify dengan allowlist teks dasar; skrip dan atribut berbahaya terbuang', () => {
    lembaga.data = { ...LEMBAGA, deskripsi: '<p onclick="x()">Aman</p><script>alert(1)</script>' };
    const html = render(<Page />);
    expect(sanitize).toHaveBeenCalledWith('<p onclick="x()">Aman</p><script>alert(1)</script>', {
      ALLOWED_TAGS: RICH_TEXT_TAGS,
      ALLOWED_ATTR: [],
    });
    expect(html).toContain('<p>Aman</p>');
    expect(html).not.toMatch(/<script|onclick|alert\(1\)/);
  });

  it('bagian teks kosong dilewati; tanpa gambar alur tidak ada bagian alur', () => {
    lembaga.data = { ...LEMBAGA, tujuan: null, tugasFungsi: '<p></p>', gambarAlurId: null, gambarAlur: null };
    const html = render(<Page />);
    expect(html).toContain('>Deskripsi</h3>');
    expect(html).not.toContain('>Tujuan</h3>');
    expect(html).not.toContain('>Tugas dan Fungsi</h3>');
    expect(html).not.toContain('Alur Layanan Informasi Publik');
    expect(html).not.toContain('alt="Bagan alur');
  });

  it('hanya gambar alur yang diisi: profil lembaga tetap tampil', () => {
    lembaga.data = { ...LEMBAGA, deskripsi: null, tujuan: null, tugasFungsi: null };
    const html = render(<Page />);
    expect(html).toContain('>Profil Lembaga</h2>');
    expect(html).toContain('>Alur Layanan Informasi Publik</h3>');
  });

  it('profil perorangan belum ada: profil lembaga tampil tanpa kartu galat', () => {
    profilePPID.data = null;
    profilePPID.error = 'Belum ada data profil PPID yang aktif';
    const html = render(<Page />);
    expect(html).toContain('>Profil Lembaga</h2>');
    expect(html).not.toContain('Data Profile PPID Belum Tersedia');
    expect(html).not.toContain('Gagal Memuat Data Profile');
    expect(html).not.toContain('Pejabat Pengelola Informasi dan Dokumentasi');
  });

  it('masih memuat salah satu data: kerangka pemuatan, bukan isi setengah jadi', () => {
    lembaga.loading = true;
    const html = render(<Page />);
    expect(html).not.toContain('Profil Lembaga');
    expect(html).not.toContain('Nama Pejabat Uji');
  });
});

describe('Profil PPID publik tanpa profil lembaga (tampilan lama)', () => {
  it.each([
    ['belum diisi (null)', null],
    ['semua bagian kosong', { id: 'pl-2', deskripsi: '<p></p>', tujuan: null, tugasFungsi: null, gambarAlurId: null, gambarAlur: null }],
  ])('%s: hanya profil perorangan', (_label, data) => {
    lembaga.data = data;
    const html = render(<Page />);
    expect(html).not.toContain('Profil Lembaga');
    expect(html).toContain('Profil PPID Desa Darmasaba');
    expect(html).toContain('Nama Pejabat Uji');
    expect(html).toContain('>Biografi</h3>');
  });

  it('profil perorangan juga kosong: kartu "belum tersedia" lama tetap muncul', () => {
    lembaga.data = null;
    profilePPID.data = null;
    const html = render(<Page />);
    expect(html).toContain('Data Profile PPID Belum Tersedia');
  });

  it('galat memuat profil perorangan tanpa lembaga: kartu galat lama tetap muncul', () => {
    lembaga.data = null;
    profilePPID.data = null;
    profilePPID.error = 'HTTP 500';
    const html = render(<Page />);
    expect(html).toContain('Gagal Memuat Data Profile');
  });
});
