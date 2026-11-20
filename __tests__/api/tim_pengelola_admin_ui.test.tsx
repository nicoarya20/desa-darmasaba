// @vitest-environment node
// Tim Pengelola Website: UI admin (SSR) — form (nomor/tanggal SK, unggah PDF, daftar anggota dinamis dengan batas jumlah),
// halaman (loader dulu, bukan form kosong yang bisa menimpa anggota tersimpan), tab "Tim Redaksi" di layout Profil Desa, dan
// cakupan menu Profil (tanpa ID akses baru). Klik tidak teruji (jsdom rusak); yang diuji markup untuk tiap keadaan.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { pathname } = vi.hoisted(() => ({ pathname: { current: '/admin/pemerintahan/profil/tim-redaksi' } }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => pathname.current,
}));

import state from '@/app/admin/(dashboard)/_state/desa/timPengelola';
import { TIM_REDAKSI_ADMIN_TEXT as T } from '@/app/admin/(dashboard)/pemerintahan/profil/tim-redaksi/_com/tim-redaksi.text';
import TimRedaksiForm from '@/app/admin/(dashboard)/pemerintahan/profil/tim-redaksi/_com/TimRedaksiForm';
import Page from '@/app/admin/(dashboard)/pemerintahan/profil/tim-redaksi/page';
import LayoutTabsDetail from '@/app/admin/(dashboard)/pemerintahan/profil/_lib/layoutTabsDetail';
import { desaMenu } from '@/app/admin/_com/nav/domains';
import { isPathAllowed } from '@/app/admin/_com/nav/menu-access.logic';
import { ANGGOTA_TIM_MAX, JABATAN_ANGGOTA_MAX_LENGTH, NAMA_ANGGOTA_MAX_LENGTH, NOMOR_SK_MAX_LENGTH } from '@/lib/tim-pengelola';

const render = (ui: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: isian rekaan (nama fiktif).
const ANGGOTA = [
  { nama: 'Anggota Uji Satu', jabatan: 'Ketua' },
  { nama: 'Anggota Uji Dua', jabatan: 'Administrator Website' },
];
const TIM_PATH = '/admin/pemerintahan/profil/tim-redaksi';

beforeEach(() => {
  pathname.current = TIM_PATH;
  state.fillForm(null);
  Object.assign(state.findAdmin, { data: null, loading: false, error: null });
});

describe('TimRedaksiForm', () => {
  const form = (props: Partial<React.ComponentProps<typeof TimRedaksiForm>> = {}) =>
    render(<TimRedaksiForm form={state.form} currentFile={null} loading={false} onSubmit={async () => true} {...props} />);

  it('field berlabel (nomor SK, tanggal SK, PDF, anggota), petunjuk, batas panjang, dan tombol simpan', () => {
    const html = form();
    for (const label of [T.title, T.nomorSk, T.tanggalSk, T.pdfSk, T.anggotaTitle, T.anggotaTambah, T.submit]) {
      expect(html).toContain(label);
    }
    expect(html).toContain(T.nomorSkHint);
    expect(html).toContain(T.pdfSkHint);
    expect(html).toContain(`maxLength="${NOMOR_SK_MAX_LENGTH}"`);
    expect(html).toContain('type="date"');
    expect(html).toContain('Seret PDF atau klik untuk memilih');
  });

  it('nomor SK required, tanggal SK opsional (tanpa required)', () => {
    const html = form();
    const inputOf = (label: string) => {
      const id = html.match(new RegExp(`<label[^>]*for="([^"]+)"[^>]*>${label.replace(/[()]/g, '\\$&')}`))?.[1];
      return html.match(new RegExp(`<input[^>]*id="${id}"[^>]*>`))?.[0] ?? '';
    };
    expect(inputOf(T.nomorSk)).toContain('required');
    expect(inputOf(T.tanggalSk)).not.toBe('');
    expect(inputOf(T.tanggalSk)).not.toContain('required');
    expect(T.tanggalSk).toContain('opsional');
  });

  it('nilai terkontrol dari proxy form, termasuk baris anggota dengan batas panjang', () => {
    Object.assign(state.form, { nomorSk: '99 Tahun 2026', tanggalSk: '2026-01-12', anggota: ANGGOTA });
    const html = form();
    expect(html).toContain('value="99 Tahun 2026"');
    expect(html).toContain('value="2026-01-12"');
    for (const a of ANGGOTA) {
      expect(html).toContain(`value="${a.nama}"`);
      expect(html).toContain(`value="${a.jabatan}"`);
    }
    expect(html).toContain(`maxLength="${NAMA_ANGGOTA_MAX_LENGTH}"`);
    expect(html).toContain(`maxLength="${JABATAN_ANGGOTA_MAX_LENGTH}"`);
    expect(html).not.toContain(T.anggotaKosong);
  });

  it('daftar kosong menampilkan petunjuk "belum ada anggota"; tombol tambah aktif', () => {
    const html = form();
    expect(html).toContain(T.anggotaKosong);
    const tambah = html.match(/<button[^>]*>(?:(?!<\/button>)[\s\S])*Tambah anggota<\/span><\/span><\/button>/)?.[0] ?? '';
    expect(tambah).not.toBe('');
    expect(tambah).not.toContain('disabled');
  });

  it('tiap baris punya tombol naik/turun/hapus berlabel; baris pertama tak bisa naik, terakhir tak bisa turun', () => {
    Object.assign(state.form, { anggota: ANGGOTA });
    const html = form();
    const tombol = (label: string) => html.match(new RegExp(`<button[^>]*aria-label="${label}"[^>]*>`))?.[0] ?? '';
    expect(tombol('Hapus anggota 1')).not.toBe('');
    expect(tombol('Hapus anggota 2')).not.toBe('');
    expect(tombol('Naikkan anggota 1')).toContain('disabled');
    expect(tombol('Naikkan anggota 2')).not.toContain('disabled');
    expect(tombol('Turunkan anggota 1')).not.toContain('disabled');
    expect(tombol('Turunkan anggota 2')).toContain('disabled');
  });

  it(`tombol tambah anggota nonaktif saat jumlah mencapai batas ${ANGGOTA_TIM_MAX}`, () => {
    Object.assign(state.form, { anggota: Array.from({ length: ANGGOTA_TIM_MAX }, (_, i) => ({ nama: `Anggota Uji ${i + 1}`, jabatan: 'Anggota' })) });
    const html = form();
    const tambah = html.match(/<button[^>]*>(?:(?!<\/button>)[\s\S])*Tambah anggota<\/span><\/span><\/button>/)?.[0] ?? '';
    expect(tambah).toContain('disabled');
  });

  it('PDF SK tersimpan tampil sebagai tautan berkas saat ini', () => {
    const html = form({ currentFile: { link: '/api/img/sk-uji.pdf', realName: 'sk-uji.pdf' } });
    expect(html).toContain('Berkas saat ini');
    expect(html).toContain('href="/api/img/sk-uji.pdf"');
    expect(html).toContain('sk-uji.pdf');
  });
});

describe('Page (admin)', () => {
  it('render pertama menampilkan pemuat, bukan form kosong (form kosong bisa menimpa anggota tersimpan)', () => {
    const html = render(<Page />);
    expect(html).not.toContain(T.nomorSk);
    expect(html).not.toContain(T.submit);
  });

  it('galat muat (mis. 403): pesan galat tampil dan form tidak ditampilkan', () => {
    state.findAdmin.error = 'Hanya admin yang boleh mengelola tim pengelola website';
    const html = render(<Page />);
    expect(html).toContain(T.loadError);
    expect(html).toContain('Hanya admin yang boleh mengelola tim pengelola website');
    expect(html).toContain(T.retry);
    expect(html).not.toContain(T.submit);
  });
});

describe('tab Tim Redaksi di layout Profil Desa', () => {
  const layout = () => render(<LayoutTabsDetail><div>isi-halaman</div></LayoutTabsDetail>);

  it('tab tampil di varian desktop dan mobile (dua daftar tab), sejajar tab Kontak Desa', () => {
    const html = layout();
    expect(html.match(/>Tim Redaksi</g)).toHaveLength(2);
    expect(html.match(/<button[^>]*-tab-timredaksi"/g)).toHaveLength(2);
    expect(html.indexOf('>Kontak Desa<')).toBeLessThan(html.indexOf('>Tim Redaksi<'));
  });

  it('di /tim-redaksi tab Tim Redaksi aktif dan konten halaman dirender', () => {
    const html = layout();
    expect(html.match(/<button[^>]*-tab-timredaksi"[^>]*>/)?.[0]).toContain('aria-selected="true"');
    expect(html).toContain('isi-halaman');
  });

  it('di tab lain, tab Tim Redaksi tidak aktif; tab lama tetap ada', () => {
    pathname.current = '/admin/pemerintahan/profil/kontak-desa';
    const html = layout();
    expect(html.match(/<button[^>]*-tab-timredaksi"[^>]*>/)?.[0]).toContain('aria-selected="false"');
    for (const label of ['Profil Desa', 'Profil Perbekel', 'Letak &amp; Batas Wilayah', 'Kontak Desa']) {
      expect(html).toContain(`>${label}<`);
    }
  });
});

describe('akses menu', () => {
  it('rute tim-redaksi tercakup submenu Profil yang sudah ada (tanpa ID akses menu baru)', () => {
    const profil = desaMenu.children?.find((c) => c.id === 'desa.profil');
    expect(profil).toBeDefined();
    const hanyaProfil = { ...desaMenu, children: profil ? [profil] : [] };
    expect(isPathAllowed(TIM_PATH, [hanyaProfil])).toBe(true);
    expect(isPathAllowed('/admin/pemerintahan/berita', [hanyaProfil])).toBe(false);
  });
});
