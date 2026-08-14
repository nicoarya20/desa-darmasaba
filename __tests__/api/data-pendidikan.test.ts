// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Context } from 'elysia';

const findFirstMock = vi.fn();
const createMock = vi.fn();
const findUniqueMock = vi.fn();
const updateMock = vi.fn();

vi.mock('@/lib/prisma', () => ({
  default: {
    dataPendidikan: {
      findFirst: (...args: unknown[]) => findFirstMock(...args),
      create: (...args: unknown[]) => createMock(...args),
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
      update: (...args: unknown[]) => updateMock(...args),
    },
  },
}));

import dataPendidikanCreate from '@/app/api/[[...slugs]]/_lib/pendidikan/data-pendidikan/create';
import dataPendidikanUpdate from '@/app/api/[[...slugs]]/_lib/pendidikan/data-pendidikan/updt';

describe('DataPendidikan create', () => {
  beforeEach(() => {
    findFirstMock.mockReset();
    createMock.mockReset();
  });

  it('rejects a duplicate name (case-insensitive) before creating', async () => {
    findFirstMock.mockResolvedValue({ id: 'existing-id', name: 'SD', jumlah: '10' });

    const context = { body: { name: 'sd', jumlah: '5' } } as unknown as Context;
    const result = await dataPendidikanCreate(context);

    expect(findFirstMock).toHaveBeenCalledWith({
      where: { name: { equals: 'sd', mode: 'insensitive' }, isActive: true },
    });
    expect(createMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      message: 'Data pendidikan "sd" sudah ada.',
    });
  });

  it('creates when the name is not a duplicate', async () => {
    findFirstMock.mockResolvedValue(null);
    createMock.mockResolvedValue({ id: 'new-id', name: 'SMP', jumlah: '20' });

    const context = { body: { name: 'SMP', jumlah: '20' } } as unknown as Context;
    const result = await dataPendidikanCreate(context);

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });
});

describe('DataPendidikan update', () => {
  beforeEach(() => {
    findFirstMock.mockReset();
    findUniqueMock.mockReset();
    updateMock.mockReset();
  });

  it('rejects a duplicate name excluding the current record', async () => {
    findUniqueMock.mockResolvedValue({ id: 'id-1', name: 'SD', jumlah: '10' });
    findFirstMock.mockResolvedValue({ id: 'id-2', name: 'SD', jumlah: '15' });

    const context = {
      params: { id: 'id-1' },
      body: { name: 'sd', jumlah: '10' },
    } as unknown as Context;
    const result = await dataPendidikanUpdate(context);

    expect(findFirstMock).toHaveBeenCalledWith({
      where: {
        name: { equals: 'sd', mode: 'insensitive' },
        isActive: true,
        NOT: { id: 'id-1' },
      },
    });
    expect(updateMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      message: 'Data pendidikan "sd" sudah ada.',
    });
  });

  it('updates when no other record has the same name', async () => {
    findUniqueMock.mockResolvedValue({ id: 'id-1', name: 'SD', jumlah: '10' });
    findFirstMock.mockResolvedValue(null);
    updateMock.mockResolvedValue({ id: 'id-1', name: 'SMA', jumlah: '30' });

    const context = {
      params: { id: 'id-1' },
      body: { name: 'SMA', jumlah: '30' },
    } as unknown as Context;
    const result = await dataPendidikanUpdate(context);

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });
});
