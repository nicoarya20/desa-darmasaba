// @vitest-environment node
// Menu top-level "DAK" (link langsung, tanpa dropdown) di navbar publik desktop & mobile.
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

const DAK_HREF = '/darmasaba/desa-anti-korupsi';

// MantineProvider menyisipkan <style> global; dibuang agar tersisa markup komponen saja.
const render = (node: React.ReactElement) =>
  renderToStaticMarkup(<MantineProvider>{node}</MantineProvider>).replace(/<style[\s\S]*?<\/style>/g, '');

describe('menu DAK di config navbar', () => {
  const dak = navbarListMenu.find((m) => m.name === 'DAK');

  it('berupa link langsung ke halaman Desa Anti Korupsi, tanpa submenu', () => {
    expect(dak?.href).toBe(DAK_HREF);
    expect(dak?.children).toBeUndefined();
  });

  it('diletakkan paling akhir, setelah menu "Musik"', () => {
    const names = navbarListMenu.map((m) => m.name);
    expect(names.indexOf('DAK')).toBe(names.length - 1);
    expect(names.indexOf('DAK')).toBe(names.indexOf('Musik') + 1);
  });
});

describe('render navbar publik', () => {
  it('desktop: DAK dirender sebagai <a> ke halaman DAK, bukan tombol dropdown', () => {
    const html = render(<NavbarMainMenu listNavbar={navbarListMenu} />);
    expect(html).toMatch(new RegExp(`<a[^>]*href="${DAK_HREF}"[^>]*>DAK</a>`));
    expect(html).not.toMatch(/<button[^>]*>DAK<\/button>/);
  });

  it('mobile: DAK dirender sebagai <a> ke halaman DAK di level menu utama', () => {
    const html = render(<NavbarMobile listNavbar={navbarListMenu} />);
    expect(html).toMatch(new RegExp(`<a[^>]*href="${DAK_HREF}"[^>]*>DAK</a>`));
  });
});
