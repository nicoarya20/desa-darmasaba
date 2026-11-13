// @vitest-environment node
// Sidebar admin: section "Developer" hanya untuk role 0 (DEVELOPER); Pengaturan tetap role 0/1.
import { describe, expect, it } from 'vitest';
import { getNavbar } from '@/app/admin/(dashboard)/user&role/_com/dynamicNavbar';

const hasSection = (id: string, roleId: number, menuIds?: string[] | null) =>
  getNavbar({ roleId, menuIds }).some((s) => s.id === id);

describe('sidebar admin: Developer', () => {
  it('role 0 melihat Developer (tanpa Menu Access dan saat Menu Access terisi)', () => {
    expect(hasSection('Developer', 0)).toBe(true);
    expect(hasSection('Developer', 0, null)).toBe(true);
    expect(hasSection('Developer', 0, ['Landing Page'])).toBe(true);
  });

  it('section Developer berisi Ringkasan Sistem & Pengaturan Jenna', () => {
    const dev = getNavbar({ roleId: 0 }).find((s) => s.id === 'Developer');
    expect(dev?.children?.map((c) => c.path)).toEqual([
      '/admin/developer/ringkasan',
      '/admin/developer/jenna',
    ]);
  });

  it.each([1, 2, 3, 4, 5])('role %i tidak melihat Developer, walau Menu Access memuatnya', (roleId) => {
    expect(hasSection('Developer', roleId)).toBe(false);
    expect(hasSection('Developer', roleId, ['Developer', 'Landing Page'])).toBe(false);
  });

  it('Developer tidak bisa diberikan lewat Menu Access (tidak ada di daftar section role 1)', () => {
    expect(getNavbar({ roleId: 1 }).some((s) => s.id === 'Developer')).toBe(false);
  });
});

describe('sidebar admin: Pengaturan tetap role 0 & 1', () => {
  it.each([0, 1])('role %i melihat Pengaturan (dengan/tanpa Menu Access)', (roleId) => {
    expect(hasSection('Pengaturan', roleId)).toBe(true);
    expect(hasSection('Pengaturan', roleId, ['Landing Page'])).toBe(true);
  });

  it.each([2, 3, 4, 5])('role %i tidak melihat Pengaturan', (roleId) => {
    expect(hasSection('Pengaturan', roleId)).toBe(false);
  });

  it('role 0: Developer tampil setelah Pengaturan, masing-masing sekali', () => {
    const ids = getNavbar({ roleId: 0, menuIds: ['Landing Page'] }).map((s) => s.id);
    expect(ids.filter((id) => id === 'Developer')).toHaveLength(1);
    expect(ids.filter((id) => id === 'Pengaturan')).toHaveLength(1);
    expect(ids.indexOf('Developer')).toBeGreaterThan(ids.indexOf('Pengaturan'));
  });
});
