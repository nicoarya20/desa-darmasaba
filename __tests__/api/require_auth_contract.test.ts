// @vitest-environment node
// Contract test (AI-CONTRACT §10): bentuk return requireAuth WAJIB stabil
// { authenticated, user:{id,roleId,isActive} | response } — konsumer Elysia
// (route.ts onBeforeHandle) bergantung padanya. Jangan ubah tanpa bump versi.
import { describe, it, expect, vi, beforeEach } from 'vitest';

const getSessionMock = vi.fn();

vi.mock('next/headers', () => ({
  headers: async () => new Headers(),
}));

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: (...a: unknown[]) => getSessionMock(...a) } },
}));

import { requireAuth } from '@/lib/api-auth';

beforeEach(() => getSessionMock.mockReset());

describe('requireAuth contract', () => {
  it('tanpa sesi → { authenticated:false, response 401 }', async () => {
    getSessionMock.mockResolvedValue(null);
    const res = await requireAuth();
    expect(res.authenticated).toBe(false);
    if (!res.authenticated) {
      expect(res.response).toBeInstanceOf(Response);
      expect(res.response.status).toBe(401);
    }
  });

  it('sesi valid + aktif → { authenticated:true, user:{id,roleId,isActive} }', async () => {
    getSessionMock.mockResolvedValue({
      user: { id: 'u1', roleId: '2', isActive: true },
    });
    const res = await requireAuth();
    expect(res.authenticated).toBe(true);
    if (res.authenticated) {
      expect(res.user).toEqual({ id: 'u1', roleId: '2', isActive: true });
    }
  });

  it('user nonaktif → { authenticated:false, response 403 }', async () => {
    getSessionMock.mockResolvedValue({
      user: { id: 'u2', roleId: '2', isActive: false },
    });
    const res = await requireAuth();
    expect(res.authenticated).toBe(false);
    if (!res.authenticated) expect(res.response.status).toBe(403);
  });

  it('roleId absent → default USER "5", tetap authenticated', async () => {
    getSessionMock.mockResolvedValue({ user: { id: 'u3' } });
    const res = await requireAuth();
    expect(res.authenticated).toBe(true);
    if (res.authenticated) {
      expect(res.user.id).toBe('u3');
      expect(res.user.roleId).toBe('5');
      expect(res.user.isActive).toBe(true);
    }
  });

  it('error saat baca sesi → { authenticated:false, response 401 }', async () => {
    // Sesi rusak: akses field melempar → requireAuth harus tangkap & 401.
    getSessionMock.mockResolvedValue({
      user: {
        get id(): string {
          throw new Error('boom');
        },
      },
    });
    const res = await requireAuth();
    expect(res.authenticated).toBe(false);
    if (!res.authenticated) expect(res.response.status).toBe(401);
  });
});
