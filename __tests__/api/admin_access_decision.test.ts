// @vitest-environment node
// Guard akses /admin di proxy (src/proxy.ts) — fungsi murni decideAdminAccess.
// Fokus: regresi "tiba-tiba logout" saat cookie cache (60 dtk) expired tapi
// session_token (7 hari) masih ada.
import { describe, it, expect } from 'vitest';
import { decideAdminAccess } from '@/lib/auth-policy';

describe('decideAdminAccess — cache MISS (user null)', () => {
  it('token 7-hari masih ada → allow (tidak dipaksa logout)', () => {
    // Ini skenario bug: cache 60 dtk expired, tapi sesi sebenarnya masih valid.
    expect(decideAdminAccess(null, true)).toBe('allow');
  });

  it('tanpa token → login (benar-benar tidak ada sesi)', () => {
    expect(decideAdminAccess(null, false)).toBe('login');
  });
});

describe('decideAdminAccess — cache ADA (fresh isActive/roleId)', () => {
  it('admin aktif (roleId 1) → allow', () => {
    expect(decideAdminAccess({ roleId: '1', isActive: true }, true)).toBe('allow');
  });

  it('admin batas (roleId 4) → allow', () => {
    expect(decideAdminAccess({ roleId: '4', isActive: true }, true)).toBe('allow');
  });

  it('user biasa (roleId 5) → profile', () => {
    expect(decideAdminAccess({ roleId: '5', isActive: true }, true)).toBe('profile');
  });

  it('akun nonaktif → login walau role admin', () => {
    expect(decideAdminAccess({ roleId: '1', isActive: false }, true)).toBe('login');
  });

  it('nonaktif diprioritaskan sebelum cek role', () => {
    expect(decideAdminAccess({ roleId: '5', isActive: false }, true)).toBe('login');
  });

  it('isActive undefined dianggap aktif (default true)', () => {
    expect(decideAdminAccess({ roleId: '2' }, false)).toBe('allow');
  });

  it('roleId undefined → default USER → profile', () => {
    expect(decideAdminAccess({ isActive: true }, true)).toBe('profile');
  });
});
