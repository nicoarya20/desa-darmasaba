// @vitest-environment node
// Fungsi murni (tanpa DOM/prisma) — node env.
import { describe, it, expect } from 'vitest';
import {
  buildUserWhere,
  ADMIN_ROLE_IDS,
  WARGA_ROLE_IDS,
} from '@/app/api/[[...slugs]]/_lib/user/user_where';

describe('buildUserWhere - roleGroup', () => {
  it('admin group filters to role 0-4', () => {
    const where = buildUserWhere('admin', '');
    expect(where.roleId).toEqual({ in: ADMIN_ROLE_IDS });
    expect(where.roleId?.in).toEqual(['0', '1', '2', '3', '4']);
  });

  it('warga group filters to role 5 only', () => {
    const where = buildUserWhere('warga', '');
    expect(where.roleId).toEqual({ in: WARGA_ROLE_IDS });
    expect(where.roleId?.in).toEqual(['5']);
  });

  it('empty group applies no role filter (all users)', () => {
    const where = buildUserWhere('', '');
    expect(where.roleId).toBeUndefined();
  });
});

describe('buildUserWhere - search', () => {
  it('searches username and email case-insensitively', () => {
    const where = buildUserWhere('warga', 'nico');
    expect(where.OR).toEqual([
      { username: { contains: 'nico', mode: 'insensitive' } },
      { email: { contains: 'nico', mode: 'insensitive' } },
    ]);
  });

  it('trims whitespace and ignores blank search', () => {
    expect(buildUserWhere('admin', '   ').OR).toBeUndefined();
    expect(buildUserWhere('admin', '').OR).toBeUndefined();
  });

  it('combines roleGroup and search filters', () => {
    const where = buildUserWhere('admin', ' budi ');
    expect(where.roleId).toEqual({ in: ADMIN_ROLE_IDS });
    expect(where.OR?.[0]).toEqual({ username: { contains: 'budi', mode: 'insensitive' } });
  });
});
