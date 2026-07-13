// @vitest-environment node
// Kontrak delete handler info-sekolah-paud (jenjang + lembaga).
//
// Akar bug (STG): hard delete prisma.delete() melempar P2003 (FK) yang
// diserialisasi Elysia jadi 500 plaintext -> frontend .json() meledak
// SyntaxError. Fix meniru desa/banjar/del.ts: soft-delete (isActive:false) +
// FK precheck + SELALU return Response.json (tak pernah throw telanjang).
//
// Test menjamin 3 properti: (1) soft-delete via update, bukan delete;
// (2) precheck memblokir bila ada anak aktif; (3) semua jalur mengembalikan
// body JSON-serializable (bukan plaintext) — inti perisai SyntaxError.
import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted agar prismaMock tersedia saat vi.mock factory dievaluasi (hoisted).
const prismaMock = vi.hoisted(() => ({
  jenjangPendidikan: { update: vi.fn(), delete: vi.fn() },
  lembaga: { update: vi.fn(), delete: vi.fn(), count: vi.fn() },
  siswa: { count: vi.fn() },
  pengajar: { count: vi.fn() },
}));

vi.mock('@/lib/prisma', () => ({ default: prismaMock }));

import jenjangPendidikanDelete from '@/app/api/[[...slugs]]/_lib/pendidikan/info-sekolah-paud/jenjang-pendidikan/del';
import lembagaPendidikanDelete from '@/app/api/[[...slugs]]/_lib/pendidikan/info-sekolah-paud/lembaga/del';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx = (id?: string) => ({ params: id === undefined ? {} : { id } }) as any;

// Handler kadang return Response (jalur error/precheck) kadang plain object
// (jalur sukses). Normalisasi keduanya jadi { status, body } untuk assertion —
// sekaligus membuktikan tak ada jalur yang mengembalikan plaintext non-JSON.
async function unwrap(result: unknown): Promise<{ status: number; body: any }> {
  if (result instanceof Response) {
    return { status: result.status, body: await result.json() };
  }
  return { status: 200, body: result };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('jenjangPendidikanDelete', () => {
  it('id kosong → 400 success:false, tak sentuh DB', async () => {
    const { status, body } = await unwrap(await jenjangPendidikanDelete(ctx()));
    expect(status).toBe(400);
    expect(body.success).toBe(false);
    expect(prismaMock.jenjangPendidikan.update).not.toHaveBeenCalled();
  });

  it('masih dipakai lembaga aktif → 400 dgn pesan jumlah, tak soft-delete', async () => {
    prismaMock.lembaga.count.mockResolvedValue(3);
    const { status, body } = await unwrap(await jenjangPendidikanDelete(ctx('j1')));
    expect(status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toContain('3 lembaga');
    expect(prismaMock.jenjangPendidikan.update).not.toHaveBeenCalled();
  });

  it('tanpa anak aktif → soft-delete (update isActive:false), BUKAN hard delete', async () => {
    prismaMock.lembaga.count.mockResolvedValue(0);
    prismaMock.jenjangPendidikan.update.mockResolvedValue({ id: 'j1' });
    const { body } = await unwrap(await jenjangPendidikanDelete(ctx('j1')));
    expect(body.success).toBe(true);
    expect(prismaMock.jenjangPendidikan.update).toHaveBeenCalledWith({
      where: { id: 'j1' },
      data: { isActive: false },
    });
    expect(prismaMock.jenjangPendidikan.delete).not.toHaveBeenCalled();
  });

  it('prisma throw → 500 tapi tetap JSON (perisai SyntaxError)', async () => {
    prismaMock.lembaga.count.mockResolvedValue(0);
    prismaMock.jenjangPendidikan.update.mockRejectedValue(new Error('boom'));
    const { status, body } = await unwrap(await jenjangPendidikanDelete(ctx('j1')));
    expect(status).toBe(500);
    expect(body.success).toBe(false); // body valid JSON, bukan plaintext
  });
});

describe('lembagaPendidikanDelete', () => {
  it('id kosong → 400 success:false', async () => {
    const { status, body } = await unwrap(await lembagaPendidikanDelete(ctx()));
    expect(status).toBe(400);
    expect(body.success).toBe(false);
    expect(prismaMock.lembaga.update).not.toHaveBeenCalled();
  });

  it('masih dipakai siswa aktif → 400, tak soft-delete', async () => {
    prismaMock.siswa.count.mockResolvedValue(5);
    prismaMock.pengajar.count.mockResolvedValue(0);
    const { status, body } = await unwrap(await lembagaPendidikanDelete(ctx('l1')));
    expect(status).toBe(400);
    expect(body.message).toContain('5 siswa');
    expect(prismaMock.lembaga.update).not.toHaveBeenCalled();
  });

  it('dipakai siswa DAN pengajar → pesan gabungkan keduanya', async () => {
    prismaMock.siswa.count.mockResolvedValue(2);
    prismaMock.pengajar.count.mockResolvedValue(4);
    const { body } = await unwrap(await lembagaPendidikanDelete(ctx('l1')));
    expect(body.message).toContain('2 siswa');
    expect(body.message).toContain('4 pengajar');
  });

  it('tanpa anak aktif → soft-delete update isActive:false, bukan delete', async () => {
    prismaMock.siswa.count.mockResolvedValue(0);
    prismaMock.pengajar.count.mockResolvedValue(0);
    prismaMock.lembaga.update.mockResolvedValue({ id: 'l1' });
    const { body } = await unwrap(await lembagaPendidikanDelete(ctx('l1')));
    expect(body.success).toBe(true);
    expect(prismaMock.lembaga.update).toHaveBeenCalledWith({
      where: { id: 'l1' },
      data: { isActive: false },
    });
    expect(prismaMock.lembaga.delete).not.toHaveBeenCalled();
  });

  it('prisma throw → 500 tetap JSON (perisai SyntaxError)', async () => {
    prismaMock.siswa.count.mockResolvedValue(0);
    prismaMock.pengajar.count.mockResolvedValue(0);
    prismaMock.lembaga.update.mockRejectedValue(new Error('boom'));
    const { status, body } = await unwrap(await lembagaPendidikanDelete(ctx('l1')));
    expect(status).toBe(500);
    expect(body.success).toBe(false);
  });
});
