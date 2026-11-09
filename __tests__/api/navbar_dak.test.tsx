// @vitest-environment node
// Menu top-level "DAK" berpola seperti "Musik": dropdown/flyout berlabel kecil "DAK"
// dengan satu submenu "Desa Anti Korupsi" di navbar publik desktop & mobile.
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import type { AnchorHTMLAttributes } from 'react';

vi.mock('next/navigation', () => ({ usePathname: () => '/darmasaba' }));
vi.mock('next-view-transitions', () => ({
  Link: ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
// Panel pencarian (GlobalSearch + fetch) tidak relevan untuk menu bar; diganti stub.
vi.mock('@/app/darmasaba/_com/NavBarSearch', () => ({ NavbarSearch: () => null }));

import navbarListMenu from '@/con/navbar-list-menu';
import { NavbarMainMenu } from '@/app/darmasaba/_com/NavbarMainMenu';
import { NavbarMobile } from '@/app/darmasaba/_com/NavbarMobile';
import { visibleMenu } from '@/app/darmasaba/_com/navbar-menu.logic';
import { DEFAULT_SEARCH_MENUS } from '@/app/darmasaba/_com/searchMenu';
import type { MenuItem } from '../../types/menu-item';

const DAK_HREF = '/darmasaba/desa-anti-korupsi';

// MantineProvider menyisipkan <style> global; dibuang agar tersisa markup komponen saja.
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

describe('menu DAK di config navbar', () => {
  const dak: MenuItem | undefined = navbarListMenu.find((m) => m.name === 'DAK');

  it('punya satu submenu "Desa Anti Korupsi" ke halaman DAK, tanpa href sendiri (seperti Musik)', () => {
    expect(dak?.href).toBeUndefined();
    expect(dak?.children).toEqual([{ id: '11.1', name: 'Desa Anti Korupsi', href: DAK_HREF }]);
  });

  it('diletakkan paling akhir, setelah menu "Musik"', () => {
    const names = navbarListMenu.map((m) => m.name);
    expect(names.indexOf('DAK')).toBe(names.length - 1);
    expect(names.indexOf('DAK')).toBe(names.indexOf('Musik') + 1);
  });

  it('tetap terlihat setelah filter visibilitas, lengkap dengan submenunya', () => {
    const dakVisible = visibleMenu(navbarListMenu).find((m) => m.name === 'DAK');
    expect(dakVisible?.children?.map((c) => c.name)).toEqual(['Desa Anti Korupsi']);
  });

  it('submenu Desa Anti Korupsi ikut jadi sumber pencarian menu', () => {
    const dakSearch = DEFAULT_SEARCH_MENUS.find((m) => m.name === 'DAK');
    expect(dakSearch?.children?.[0]?.href).toBe(DAK_HREF);
  });
});

describe('render navbar publik', () => {
  it('desktop: DAK dirender sebagai tombol dropdown seperti Musik, bukan link langsung', () => {
    const html = render(<NavbarMainMenu listNavbar={navbarListMenu} />);
    expect(html).toMatch(/<button[^>]*>DAK<\/button>/);
    expect(html).toMatch(/<button[^>]*>Musik<\/button>/);
    expect(html).not.toMatch(new RegExp(`<a[^>]*href="${DAK_HREF}"[^>]*>DAK</a>`));
  });

  it('mobile: DAK dirender sebagai tombol yang membuka level submenu', () => {
    const html = render(<NavbarMobile listNavbar={navbarListMenu} />);
    expect(html).toMatch(/<button[^>]*>[\s\S]*?DAK[\s\S]*?<\/button>/);
    expect(html).not.toMatch(new RegExp(`<a[^>]*href="${DAK_HREF}"[^>]*>DAK</a>`));
  });
});
