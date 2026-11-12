// @vitest-environment node
// Halaman Pengaturan → Menu Access: form per user untuk role 0/1, ditolak untuk role lain.
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import MenuAccessPage from '@/app/admin/(dashboard)/pengaturan/menu-access/page';
import { getNavbar } from '@/app/admin/(dashboard)/user&role/_com/dynamicNavbar';
import type { NavItem } from '@/app/admin/_com/nav/domains';
import { authStore } from '@/store/authStore';

const render = (roleId: number) => {
  authStore.setUser({ id: 'u1', name: 'Admin', roleId, menuIds: null, isActive: true });
  return renderToStaticMarkup(
    <MantineProvider env="test">
      <MenuAccessPage />
    </MantineProvider>,
  );
};

const childIds = (nav: NavItem[], sectionId: string) =>
  (nav.find((s) => s.id === sectionId)?.children ?? []).map((c) => c.id);

describe('halaman Menu Access (Pengaturan)', () => {
  it('role 1: tampil form pilih user, tanpa tab', () => {
    const html = render(1);
    expect(html).toContain('Menu Access');
    expect(html).toContain('Pilih User');
    expect(html).not.toContain('role="tablist"');
    expect(html).not.toContain('Akses ditolak');
  });

  it('role 3: akses ditolak, form tidak dirender', () => {
    const html = render(3);
    expect(html).toContain('Akses ditolak');
    expect(html).not.toContain('Pilih User');
  });

  it('sidebar role 1: Menu Access di bawah Pengaturan, User & Role tinggal User dan Role', () => {
    const nav = getNavbar({ roleId: 1 });
    expect(childIds(nav, 'Pengaturan')).toEqual(['pengaturan.visibilitas-menu', 'pengaturan.menu-access', 'pengaturan.sampah']);
    expect(childIds(nav, 'User & Role')).toEqual(['user-role.user', 'user-role.role']);
  });
});
