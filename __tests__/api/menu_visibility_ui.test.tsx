// @vitest-environment node
// Wiring UI visibilitas menu: layout publik (server) → provider → guard 404 & menu efektif,
// serta sidebar admin "Pengaturan" yang hanya muncul untuk role 0/1.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const nav = vi.hoisted(() => ({ pathname: '/', overrides: {} as Record<string, boolean> }));

vi.mock('next/navigation', () => ({
  usePathname: () => nav.pathname,
  notFound: () => {
    throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
  },
}));
vi.mock('next/server', () => ({ connection: async () => undefined }));
vi.mock('@/lib/menu-visibility.server', () => ({ getMenuVisibilityOverrides: async () => nav.overrides }));
// Navbar/footer tidak relevan untuk guard; shell diganti pembungkus polos.
vi.mock('@/app/(public)/_com/DarmasabaShell', () => ({
  DarmasabaShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

import Layout from '@/app/(public)/layout';
import { MenuVisibilityProvider, useMenuVisibility } from '@/app/(public)/_com/MenuVisibilityContext';
import { flattenMenu } from '@/app/(public)/_com/searchMenu';
import { getNavbar } from '@/app/admin/(dashboard)/user&role/_com/dynamicNavbar';

const PUSKESMAS = '/kesehatan/puskesmas';
const CCTV = '/keamanan/cctv';
const ROOT = path.resolve(__dirname, '../..');

async function renderLayout(pathname: string, overrides: Record<string, boolean> = {}) {
  nav.pathname = pathname;
  nav.overrides = overrides;
  const el = await Layout({ children: <p>isi halaman</p> });
  return renderToStaticMarkup(el);
}

beforeEach(() => {
  nav.pathname = '/';
  nav.overrides = {};
});

describe('layout publik + guard 404', () => {
  it('halaman yang tampil dirender normal', async () => {
    expect(await renderLayout('/kesehatan/posyandu')).toContain('isi halaman');
  });

  it('submenu default-hidden & sub-path-nya → notFound()', async () => {
    await expect(renderLayout(PUSKESMAS)).rejects.toThrow(/404/);
    await expect(renderLayout(`${PUSKESMAS}/123`)).rejects.toThrow(/404/);
  });

  it('override DB menampilkan kembali → tidak 404; override sembunyi → 404', async () => {
    expect(await renderLayout(`${PUSKESMAS}/123`, { [PUSKESMAS]: true })).toContain('isi halaman');
    await expect(renderLayout(`${CCTV}`, { [CCTV]: false })).rejects.toThrow(/404/);
    expect(await renderLayout('/keamanan/cctv-lain', { [CCTV]: false })).toContain('isi halaman');
  });
});

describe('MenuVisibilityProvider', () => {
  function Probe() {
    const { navbarMenu } = useMenuVisibility();
    return <>{flattenMenu(navbarMenu).map((m) => m.href).join(' ')}</>;
  }

  it('menu efektif mengikuti override dari server', () => {
    const html = renderToStaticMarkup(
      <MenuVisibilityProvider overrides={{ [PUSKESMAS]: true, [CCTV]: false }}>
        <Probe />
      </MenuVisibilityProvider>,
    );
    expect(html).toContain(PUSKESMAS);
    expect(html).not.toContain(CCTV);
  });

  it('di luar provider = default config (tanpa override)', () => {
    const html = renderToStaticMarkup(<Probe />);
    expect(html).toContain(CCTV);
    expect(html).not.toContain(PUSKESMAS);
  });

  it('Navbar, globalSearch & Peta Informasi membaca menu dari useMenuVisibility, bukan konstanta statis', () => {
    const read = (p: string) => readFileSync(path.join(ROOT, p), 'utf8');
    const navbar = read('src/app/(public)/_com/Navbar.tsx');
    expect(navbar).toMatch(/useMenuVisibility\(\)/);
    expect(navbar).not.toMatch(/visibleMenu\(navbarListMenu\)/);
    expect(read('src/app/(public)/_com/globalSearch.tsx')).toMatch(/isSearchResultHidden\(item, hiddenHrefs\)/);
    expect(read('src/app/(public)/(tambahan)/peta-informasi/_com/PetaInformasi.tsx')).toMatch(/useMenuVisibility\(\)/);
  });
});

describe('sidebar admin: Pengaturan › Visibilitas Menu', () => {
  const hasPengaturan = (roleId: number, menuIds?: string[] | null) =>
    getNavbar({ roleId, menuIds }).some((s) => s.id === 'Pengaturan');

  it.each([0, 1])('role %i melihat Pengaturan (dengan/tanpa Menu Access)', (roleId) => {
    expect(hasPengaturan(roleId)).toBe(true);
    expect(hasPengaturan(roleId, ['Landing Page'])).toBe(true);
  });

  it.each([2, 3, 4, 5])('role %i tidak melihat Pengaturan, walau Menu Access memuatnya', (roleId) => {
    expect(hasPengaturan(roleId)).toBe(false);
    expect(hasPengaturan(roleId, ['Pengaturan', 'Kesehatan'])).toBe(false);
  });
});
