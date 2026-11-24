// @vitest-environment node
// Profil perorangan PPID disembunyikan sementara (src/con/profil-ppid.ts): halaman publik /ppid/profil-ppid hanya
// menampilkan profil lembaga dan tidak memuat data perorangan; admin /admin/ppid/profil-ppid tanpa tab "Profil
// Perorangan". Kode & data tetap ada: dengan konstanta true, perilaku lama kembali. Markup via renderToStaticMarkup.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { flag, profilePPID, lembaga } = vi.hoisted(() => ({
  flag: { tampil: false },
  profilePPID: { loading: false, error: null as string | null, load: vi.fn(), data: null as unknown },
  lembaga: { loading: false, error: null as string | null, load: vi.fn(), data: null as unknown },
}));

vi.mock('@/con/profil-ppid', () => ({
  get PROFIL_PERORANGAN_PPID_TAMPIL() {
    return flag.tampil;
  },
}));
vi.mock('dompurify', () => ({ default: { sanitize: (html: string) => html } })); // test-only: DOMPurify butuh DOM
vi.mock('valtio/utils', () => ({ useProxy: <T,>(x: T) => x }));
vi.mock('@/app/context/MusicContext', () => ({ useMusic: () => ({ currentSong: null }) })); // test-only: provider hanya ada di root layout
vi.mock('next-view-transitions', () => ({ useTransitionRouter: () => ({ back: vi.fn() }) }));
vi.mock('@/app/admin/(dashboard)/_state/ppid/profile_ppid/profile_PPID', () => ({ default: { profile: profilePPID } }));
vi.mock('@/app/admin/(dashboard)/_state/ppid/profil_lembaga/profilLembaga', () => ({ default: { find: lembaga } }));
vi.mock('@/app/admin/(dashboard)/ppid/profil-ppid/_com/lembaga/ProfilLembagaTab', () => ({
  default: () => <div>[tab profil lembaga]</div>,
}));
vi.mock('@/app/admin/(dashboard)/ppid/profil-ppid/_com/ProfilPeroranganPreview', () => ({
  default: () => <div>[preview profil perorangan]</div>,
}));

import AdminPage from '@/app/admin/(dashboard)/ppid/profil-ppid/page';
import PublicPage from '@/app/(public)/(pages)/ppid/profil-ppid/page';

const render = (ui: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: data fiktif.
const PERORANGAN = {
  id: 'ppid-1', name: 'Nama Pejabat Uji', biodata: '<p>Isi biografi.</p>', riwayat: '<ul><li>Jabatan uji</li></ul>',
  pengalaman: '<ul><li>Organisasi uji</li></ul>', unggulan: '<ul><li>Program uji</li></ul>', image: null,
};
const LEMBAGA = {
  id: 'pl-1', deskripsi: '<p>Deskripsi lembaga uji.</p>', tujuan: null, tugasFungsi: null, gambarAlurId: null, gambarAlur: null,
};

beforeEach(() => {
  flag.tampil = false;
  profilePPID.loading = false;
  profilePPID.error = null;
  profilePPID.data = PERORANGAN;
  lembaga.loading = false;
  lembaga.error = null;
  lembaga.data = LEMBAGA;
});

describe('konstanta PROFIL_PERORANGAN_PPID_TAMPIL', () => {
  it('bawaan di kode false (disembunyikan sementara)', () => {
    const source = readFileSync(path.resolve(__dirname, '../../src/con/profil-ppid.ts'), 'utf8');
    expect(source).toContain('export const PROFIL_PERORANGAN_PPID_TAMPIL = false;');
  });
});

describe('halaman publik /ppid/profil-ppid saat perorangan disembunyikan', () => {
  it('hanya profil lembaga; tidak ada profil perorangan walau datanya tersedia', () => {
    const html = render(<PublicPage />);
    expect(html).toContain('>Profil Lembaga</h2>');
    expect(html).toContain('Deskripsi lembaga uji.');
    for (const text of ['Pejabat Pengelola Informasi dan Dokumentasi', 'Nama Pejabat Uji', 'Isi biografi.', 'Foto Pimpinan']) {
      expect(html).not.toContain(text);
    }
  });

  it('status pemuatan dan galat perorangan tidak memengaruhi halaman', () => {
    profilePPID.loading = true;
    profilePPID.error = 'HTTP 500';
    const html = render(<PublicPage />);
    expect(html).toContain('>Profil Lembaga</h2>');
    expect(html).not.toContain('Gagal Memuat Data Profile');
  });

  it('profil lembaga belum diisi: kartu "belum tersedia", bukan profil perorangan atau kartu galat', () => {
    lembaga.data = null;
    profilePPID.error = 'HTTP 500';
    const html = render(<PublicPage />);
    expect(html).toContain('Data Profile PPID Belum Tersedia');
    expect(html).not.toContain('Gagal Memuat Data Profile');
    expect(html).not.toContain('Nama Pejabat Uji');
  });

  it('masih memuat profil lembaga: kerangka pemuatan', () => {
    lembaga.loading = true;
    expect(render(<PublicPage />)).not.toContain('Profil Lembaga');
  });
});

describe('halaman publik saat konstanta true (tampilan lama kembali)', () => {
  it('profil perorangan tampil di bawah profil lembaga', () => {
    flag.tampil = true;
    const html = render(<PublicPage />);
    expect(html.indexOf('Nama Pejabat Uji')).toBeGreaterThan(html.indexOf('>Profil Lembaga</h2>'));
  });
});

describe('admin /admin/ppid/profil-ppid', () => {
  it('disembunyikan: profil lembaga langsung tampil, tanpa tab "Profil Perorangan"', () => {
    const html = render(<AdminPage />);
    expect(html).toContain('[tab profil lembaga]');
    expect(html).not.toMatch(/Profil Perorangan|\[preview profil perorangan\]|role="tablist"/);
  });

  it('konstanta true: dua tab kembali (Profil Lembaga dan Profil Perorangan)', () => {
    flag.tampil = true;
    const html = render(<AdminPage />);
    expect(html).toContain('role="tablist"');
    expect(html).toContain('>Profil Lembaga<');
    expect(html).toContain('>Profil Perorangan<');
  });
});
