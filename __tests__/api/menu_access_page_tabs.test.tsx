// @vitest-environment node
// Halaman Pengaturan → Menu Access: tab Per User & Publik untuk role 0/1, ditolak untuk role lain.
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import MenuAccessPage from '@/app/admin/(dashboard)/pengaturan/menu-access/page';
import { authStore } from '@/store/authStore';

const render = (roleId: number) => {
  authStore.setUser({ id: 'u1', name: 'Admin', roleId, menuIds: null, isActive: true });
  return renderToStaticMarkup(
    <MantineProvider env="test">
      <MenuAccessPage />
    </MantineProvider>,
  );
};

describe('halaman Menu Access (Pengaturan)', () => {
  it('role 1: tampil tab Per User dan Publik', () => {
    const html = render(1);
    expect(html).toContain('Per User');
    expect(html).toContain('Publik');
    expect(html).not.toContain('Akses ditolak');
  });

  it('role 3: akses ditolak, tab tidak dirender', () => {
    const html = render(3);
    expect(html).toContain('Akses ditolak');
    expect(html).not.toContain('Per User');
  });
});
