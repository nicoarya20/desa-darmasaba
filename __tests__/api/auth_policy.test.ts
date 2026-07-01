// @vitest-environment node
// Kebijakan role/akses Better Auth — fungsi murni, tanpa DB.
import { describe, it, expect } from 'vitest';
import {
  ROLE_SUPER_ADMIN,
  ROLE_USER,
  resolveRoleForNewUser,
  isAdminRole,
  isAccountActive,
} from '@/lib/auth-policy';

describe('resolveRoleForNewUser', () => {
  const supers = ['boss@desa.id', 'dev@desa.id'];

  it('user Google baru default roleId "5" (USER)', () => {
    expect(resolveRoleForNewUser('warga@gmail.com', supers)).toBe(ROLE_USER);
  });

  it('email di SUPER_ADMIN_EMAILS → roleId "1" (SUPER ADMIN)', () => {
    expect(resolveRoleForNewUser('boss@desa.id', supers)).toBe(ROLE_SUPER_ADMIN);
  });

  it('email null/kosong → USER', () => {
    expect(resolveRoleForNewUser(null, supers)).toBe(ROLE_USER);
    expect(resolveRoleForNewUser(undefined, supers)).toBe(ROLE_USER);
    expect(resolveRoleForNewUser('', supers)).toBe(ROLE_USER);
  });

  it('list super admin kosong → selalu USER', () => {
    expect(resolveRoleForNewUser('boss@desa.id', [])).toBe(ROLE_USER);
  });
});

describe('isAdminRole', () => {
  it('roleId 0-4 = admin (boleh /admin)', () => {
    for (const r of ['0', '1', '2', '3', '4']) {
      expect(isAdminRole(r)).toBe(true);
    }
  });

  it('roleId 5+ = bukan admin (login Google) → tidak boleh /admin', () => {
    expect(isAdminRole('5')).toBe(false);
    expect(isAdminRole(5)).toBe(false);
    expect(isAdminRole('9')).toBe(false);
  });

  it('roleId null/undefined default ke USER (bukan admin)', () => {
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
  });

  it('roleId non-numerik → bukan admin (fail-safe)', () => {
    expect(isAdminRole('abc')).toBe(false);
  });
});

describe('isAccountActive', () => {
  it('isActive true → aktif', () => {
    expect(isAccountActive(true)).toBe(true);
  });

  it('isActive false → nonaktif (ditolak)', () => {
    expect(isAccountActive(false)).toBe(false);
  });

  it('isActive null/undefined → dianggap aktif (default Google user aktif)', () => {
    expect(isAccountActive(null)).toBe(true);
    expect(isAccountActive(undefined)).toBe(true);
  });
});
