// @vitest-environment node
// Kontak Desa: UI admin (SSR) — form (field terkontrol + batas panjang), halaman (loader dulu, bukan form kosong yang
// bisa menimpa data), tab baru di layout Profil Desa (aktif saat di /kontak-desa), dan cakupan menu Profil (tanpa ID
// akses baru). Klik tidak teruji (jsdom rusak); yang diuji markup untuk tiap keadaan.
import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { pathname } = vi.hoisted(() => ({ pathname: { current: '/admin/pemerintahan/profil/kontak-desa' } }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => pathname.current,
}));

import state from '@/app/admin/(dashboard)/_state/desa/kontakDesa';
import KontakDesaForm from '@/app/admin/(dashboard)/pemerintahan/profil/kontak-desa/_com/KontakDesaForm';
import { KONTAK_DESA_ADMIN_TEXT as T } from '@/app/admin/(dashboard)/pemerintahan/profil/kontak-desa/_com/kontak-desa.text';
import Page from '@/app/admin/(dashboard)/pemerintahan/profil/kontak-desa/page';
import LayoutTabsDetail from '@/app/admin/(dashboard)/pemerintahan/profil/_lib/layoutTabsDetail';
import { desaMenu } from '@/app/admin/_com/nav/domains';
import { isPathAllowed } from '@/app/admin/_com/nav/menu-access.logic';
import { ALAMAT_MAX_LENGTH, EMAIL_MAX_LENGTH, NAMA_KANTOR_MAX_LENGTH, TELEPON_MAX_LENGTH } from '@/lib/kontak-desa';

const render = (ui: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{ui}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

// test-only: isian rekaan.
const FORM = { namaKantor: 'Kantor Uji', alamat: 'Jl. Uji No. 1', telepon: '(0361) 8441518', email: 'uji@example.com' };
const KONTAK_PATH = '/admin/pemerintahan/profil/kontak-desa';

beforeEach(() => {
  pathname.current = KONTAK_PATH;
  state.fillForm(null);
  Object.assign(state.findUnique, { data: null, loaded: false, loading: false, error: null });
});

describe('KontakDesaForm', () => {
  const form = (props: Partial<React.ComponentProps<typeof KontakDesaForm>> = {}) =>
    render(<KontakDesaForm form={state.form} loading={false} onSubmit={() => {}} {...props} />);

  it('empat field berlabel, petunjuk telepon, batas panjang, dan tombol simpan', () => {
    const html = form();
    for (const label of [T.namaKantor, T.alamat, T.telepon, T.email, T.submit]) expect(html).toContain(label);
    expect(html).toContain(T.teleponHint);
    for (const max of [NAMA_KANTOR_MAX_LENGTH, ALAMAT_MAX_LENGTH, TELEPON_MAX_LENGTH, EMAIL_MAX_LENGTH]) {
      expect(html).toContain(`maxLength="${max}"`);
    }
    expect(html).toContain('type="email"');
  });

  it('nilai terkontrol dari proxy form', () => {
    Object.assign(state.form, FORM);
    const html = form();
    expect(html).toContain('value="Kantor Uji"');
    expect(html).toContain('value="(0361) 8441518"');
    expect(html).toContain('value="uji@example.com"');
    expect(html).toMatch(/<textarea[^>]*>Jl\. Uji No\. 1<\/textarea>/);
  });

  it('tanpa nomor/nilai contoh karangan: form kosong tidak memuat placeholder nomor', () => {
    const html = form();
    expect(html).not.toMatch(/placeholder="[^"]*\d/);
  });
});

describe('Page (admin)', () => {
  it('render pertama menampilkan pemuat, bukan form kosong (form kosong bisa menimpa kontak tersimpan)', () => {
    const html = render(<Page />);
    expect(html).not.toContain(T.namaKantor);
    expect(html).not.toContain(T.submit);
  });

  it('galat muat: pesan galat tampil dan form tidak ditampilkan', () => {
    state.findUnique.error = 'HTTP error! status: 500';
    const html = render(<Page />);
    expect(html).toContain(T.loadError);
    expect(html).toContain('HTTP error! status: 500');
    expect(html).toContain(T.retry);
    expect(html).not.toContain(T.submit);
  });
});

describe('tab Kontak Desa di layout Profil Desa', () => {
  const layout = () => render(<LayoutTabsDetail><div>isi-halaman</div></LayoutTabsDetail>);

  it('tab tampil di varian desktop dan mobile (dua daftar tab)', () => {
    const html = layout();
    expect(html.match(/>Kontak Desa</g)).toHaveLength(2);
    expect(html.match(/<button[^>]*-tab-kontakdesa"/g)).toHaveLength(2);
  });

  it('di /kontak-desa tab Kontak Desa aktif dan konten halaman dirender', () => {
    const html = layout();
    const tab = html.match(/<button[^>]*-tab-kontakdesa"[^>]*>/)?.[0] ?? '';
    expect(tab).toContain('aria-selected="true"');
    expect(html).toContain('isi-halaman');
  });

  it('di tab lain, tab Kontak Desa tidak aktif; tab lama tetap ada', () => {
    pathname.current = '/admin/pemerintahan/profil/wilayah-desa';
    const html = layout();
    expect(html.match(/<button[^>]*-tab-kontakdesa"[^>]*>/)?.[0]).toContain('aria-selected="false"');
    for (const label of ['Profil Desa', 'Profil Perbekel', 'Profil Perbekel Dari Masa Ke Masa', 'Letak &amp; Batas Wilayah']) {
      expect(html).toContain(`>${label}<`);
    }
  });
});

describe('akses menu', () => {
  it('rute kontak-desa tercakup submenu Profil yang sudah ada (tanpa ID akses menu baru)', () => {
    const profil = desaMenu.children?.find((c) => c.id === 'desa.profil');
    expect(profil).toBeDefined();
    const hanyaProfil = { ...desaMenu, children: profil ? [profil] : [] };
    expect(isPathAllowed(KONTAK_PATH, [hanyaProfil])).toBe(true);
    expect(isPathAllowed('/admin/pemerintahan/berita', [hanyaProfil])).toBe(false);
  });
});
