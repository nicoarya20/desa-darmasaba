// @vitest-environment node
// audit(): insert AuditLog best-effort (tidak pernah melempar), retry actorId:null saat FK P2003, meta disanitasi.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: { auditLog: { create: vi.fn() } },
}));

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import { AUDIT_ACTIONS, audit, sanitizeAuditMeta } from '@/lib/audit';

const input = {
  actor: { id: 'u1', email: 'admin@desa.id', roleId: 1 },
  action: AUDIT_ACTIONS.ROLE_CREATE,
  targetType: 'role',
  targetId: 'r1',
  summary: 'Membuat role Operator',
  meta: { name: 'Operator' },
};

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.auditLog.create.mockResolvedValue({ id: 'a1' });
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  warn.mockRestore();
});

describe('audit()', () => {
  it('insert AuditLog dengan bentuk benar (roleId jadi string)', async () => {
    await audit(input);
    expect(prismaMock.auditLog.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        actorId: 'u1',
        actorEmail: 'admin@desa.id',
        actorRoleId: '1',
        action: 'role.create',
        targetType: 'role',
        targetId: 'r1',
        summary: 'Membuat role Operator',
        meta: { name: 'Operator' },
      },
    });
    expect(warn).not.toHaveBeenCalled();
  });

  it('aktor null & tanpa meta/targetId → kolom null, meta undefined', async () => {
    await audit({ actor: null, action: AUDIT_ACTIONS.USER_UPDATE, targetType: 'user', summary: 'x' });
    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: {
        actorId: null,
        actorEmail: null,
        actorRoleId: null,
        action: 'user.update',
        targetType: 'user',
        targetId: null,
        summary: 'x',
        meta: undefined,
      },
    });
  });

  it('insert gagal → tidak melempar, console.warn dengan konteks', async () => {
    const err = new Error('db down');
    prismaMock.auditLog.create.mockRejectedValue(err);
    await expect(audit(input)).resolves.toBeUndefined();
    expect(prismaMock.auditLog.create).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith('[audit] gagal mencatat role.create', err);
  });

  it('FK P2003 → retry sekali dengan actorId:null (snapshot email/role tetap)', async () => {
    prismaMock.auditLog.create.mockRejectedValueOnce(Object.assign(new Error('fk'), { code: 'P2003' }));
    await audit(input);
    expect(prismaMock.auditLog.create).toHaveBeenCalledTimes(2);
    expect(prismaMock.auditLog.create.mock.calls[1][0].data).toMatchObject({
      actorId: null,
      actorEmail: 'admin@desa.id',
      actorRoleId: '1',
    });
    expect(warn).not.toHaveBeenCalled();
  });

  it('retry P2003 juga gagal → console.warn, tidak melempar', async () => {
    const retryErr = new Error('still failing');
    prismaMock.auditLog.create
      .mockRejectedValueOnce(Object.assign(new Error('fk'), { code: 'P2003' }))
      .mockRejectedValueOnce(retryErr);
    await expect(audit(input)).resolves.toBeUndefined();
    expect(prismaMock.auditLog.create).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledWith('[audit] gagal mencatat role.create', retryErr);
  });

  it('P2003 tanpa aktor → tidak retry', async () => {
    prismaMock.auditLog.create.mockRejectedValue(Object.assign(new Error('fk'), { code: 'P2003' }));
    await audit({ ...input, actor: null });
    expect(prismaMock.auditLog.create).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe('sanitizeAuditMeta()', () => {
  it('undefined → undefined', () => {
    expect(sanitizeAuditMeta(undefined)).toBeUndefined();
  });

  it('string > 500 karakter dipotong', () => {
    const out = sanitizeAuditMeta({ note: 'a'.repeat(800) }) as { note: string };
    expect(out.note).toHaveLength(500);
  });

  it('primitif, array, objek kecil dipertahankan; Date jadi ISO; fungsi/undefined/NaN dibuang atau null', () => {
    const at = new Date('2026-11-16T10:00:00.000Z');
    expect(
      sanitizeAuditMeta({
        fromRoleId: '5',
        count: 2,
        ok: true,
        none: null,
        ids: ['a', 'b'],
        nested: { name: 'X' },
        at,
        fn: () => 1,
        missing: undefined,
        nan: Number.NaN,
      }),
    ).toEqual({
      fromRoleId: '5',
      count: 2,
      ok: true,
      none: null,
      ids: ['a', 'b'],
      nested: { name: 'X' },
      at: '2026-11-16T10:00:00.000Z',
      nan: null,
    });
  });

  it('array dan jumlah key dibatasi 20, kedalaman dibatasi', () => {
    const big = Object.fromEntries(Array.from({ length: 30 }, (_, i) => [`k${i}`, i]));
    const out = sanitizeAuditMeta({ list: Array.from({ length: 50 }, (_, i) => i), big, deep: { a: { b: { c: 1 } } } }) as {
      list: number[];
      big: Record<string, number>;
      deep: { a: Record<string, unknown> };
    };
    expect(out.list).toHaveLength(20);
    expect(Object.keys(out.big)).toHaveLength(20);
    expect(out.deep.a).toEqual({});
  });
});
