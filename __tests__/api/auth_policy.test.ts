// @vitest-environment node
// Kebijakan role/akses Better Auth — fungsi murni, tanpa DB.
import { describe, it, expect } from 'vitest';
import {
  ROLE_SUPER_ADMIN,
  ROLE_USER,
  resolveRoleForNewUser,
  isAdminRole,
  isAccountActive,
  publicOriginFromHeaders,
  isPublicPostPath,
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

describe('publicOriginFromHeaders', () => {
  const mk = (h: Record<string, string>) => (n: string) => h[n.toLowerCase()] ?? null;

  it('pakai X-Forwarded-* dari proxy (bukan localhost internal)', () => {
    expect(
      publicOriginFromHeaders(
        mk({ 'x-forwarded-proto': 'https', 'x-forwarded-host': 'desa-darmasaba-stg.wibudev.com' }),
      ),
    ).toBe('https://desa-darmasaba-stg.wibudev.com');
  });

  it('ambil entri pertama saat header berupa rantai proxy "a, b"', () => {
    expect(
      publicOriginFromHeaders(
        mk({ 'x-forwarded-proto': 'https, http', 'x-forwarded-host': 'public.com, localhost:3000' }),
      ),
    ).toBe('https://public.com');
  });

  it('fallback ke host header bila forwarded-host absen', () => {
    expect(publicOriginFromHeaders(mk({ host: 'example.com' }))).toBe('https://example.com');
  });

  it('default proto https bila hanya host tersedia', () => {
    expect(publicOriginFromHeaders(mk({ 'x-forwarded-host': 'a.com' }))).toBe('https://a.com');
  });
});

describe('isPublicPostPath', () => {
  it('3 form publik Inovasi + upload pengaduan → boleh POST tanpa login', () => {
    expect(isPublicPostPath('/api/inovasi/ajukanideinovatif/create')).toBe(true);
    expect(isPublicPostPath('/api/inovasi/layananonlinedesa/administrasionline/create')).toBe(true);
    expect(isPublicPostPath('/api/inovasi/layananonlinedesa/pengaduanmasyarakat/create')).toBe(true);
    expect(isPublicPostPath('/api/inovasi/layananonlinedesa/pengaduanmasyarakat/upload')).toBe(true);
  });

  it('master data (jenislayanan/jenispengaduan) TETAP admin → tidak bocor', () => {
    // Bertingkat di bawah path publik; exact-match mencegah kebocoran.
    expect(isPublicPostPath('/api/inovasi/layananonlinedesa/administrasionline/jenislayanan/create')).toBe(false);
    expect(isPublicPostPath('/api/inovasi/layananonlinedesa/pengaduanmasyarakat/jenispengaduan/create')).toBe(false);
  });

  it('endpoint admin lain → tidak publik', () => {
    expect(isPublicPostPath('/api/fileStorage/create')).toBe(false);
    expect(isPublicPostPath('/api/user/delete/x')).toBe(false);
    expect(isPublicPostPath('/api/role/create')).toBe(false);
  });

  it('prefix parsial / trailing slash / query → bukan match (exact only)', () => {
    expect(isPublicPostPath('/api/inovasi/ajukanideinovatif')).toBe(false);
    expect(isPublicPostPath('/api/inovasi/ajukanideinovatif/create/')).toBe(false);
    expect(isPublicPostPath('/api/inovasi/ajukanideinovatif/create/extra')).toBe(false);
    expect(isPublicPostPath('')).toBe(false);
  });
});
