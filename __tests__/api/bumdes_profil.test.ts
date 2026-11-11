// @vitest-environment node
// Profil BUMDes (singleton): validasi input, shape output, upsert, error mapping.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";

const prismaMock = vi.hoisted(() => ({
  profilBumDes: { findFirst: vi.fn(), upsert: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import profilBumDesFind from "@/app/api/[[...slugs]]/_lib/ekonomi/bumdes/profil/find";
import profilBumDesUpsert from "@/app/api/[[...slugs]]/_lib/ekonomi/bumdes/profil/upsert";
import {
  PROFIL_BUMDES_ID,
  TAHUN_BERDIRI_MIN,
  profilBumDesSchema,
} from "@/app/api/[[...slugs]]/_lib/ekonomi/bumdes/profil/validation";

// Context Elysia minimal: body + set.status.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context test
const ctx = (body: unknown): any => ({ body, set: { status: 200 } });

const validBody = { nama: "BUMDes Contoh", deskripsi: "Deskripsi contoh" };

function prismaError(code: string, meta?: Record<string, unknown>) {
  return new Prisma.PrismaClientKnownRequestError("err", { code, clientVersion: "6.3.1", meta });
}

beforeEach(() => vi.clearAllMocks());

describe("profilBumDesSchema", () => {
  it("menerima body minimal (nama + deskripsi)", () => {
    expect(profilBumDesSchema.safeParse(validBody).success).toBe(true);
  });

  it("nama kosong/spasi ditolak dengan pesan jelas", () => {
    const res = profilBumDesSchema.safeParse({ ...validBody, nama: "   " });
    expect(res.success).toBe(false);
    expect(res.error?.issues[0].message).toBe("Nama BUMDes wajib diisi");
  });

  it("deskripsi wajib", () => {
    const res = profilBumDesSchema.safeParse({ nama: "X" });
    expect(res.success).toBe(false);
    expect(res.error?.issues[0].message).toBe("Deskripsi wajib diisi");
  });

  it("tahunBerdiri: menolak desimal, < batas bawah, dan masa depan", () => {
    const tahun = (v: number) => profilBumDesSchema.safeParse({ ...validBody, tahunBerdiri: v });
    expect(tahun(2015.5).success).toBe(false);
    expect(tahun(TAHUN_BERDIRI_MIN - 1).success).toBe(false);
    expect(tahun(new Date().getFullYear() + 1).success).toBe(false);
    expect(tahun(2015).success).toBe(true);
  });

  it("string opsional kosong → null (menghapus), tidak dikirim → undefined (tidak diubah)", () => {
    const res = profilBumDesSchema.parse({ ...validBody, alamat: "  ", kontak: "" });
    expect(res.alamat).toBeNull();
    expect(res.kontak).toBeNull();
    expect(res.imageId).toBeUndefined();
  });

  it("kontak lebih dari 255 karakter ditolak", () => {
    const res = profilBumDesSchema.safeParse({ ...validBody, kontak: "x".repeat(256) });
    expect(res.success).toBe(false);
  });
});

describe("GET profil BUMDes", () => {
  it("belum diisi → success:true, data:null", async () => {
    prismaMock.profilBumDes.findFirst.mockResolvedValueOnce(null);
    const res = await profilBumDesFind();
    expect(res).toEqual({ success: true, message: "Profil BUMDes belum diisi", data: null });
  });

  it("hanya baca baris singleton yang aktif & belum dihapus, sertakan gambar", async () => {
    prismaMock.profilBumDes.findFirst.mockResolvedValueOnce({ id: PROFIL_BUMDES_ID, nama: "B" });
    const res = await profilBumDesFind();
    const args = prismaMock.profilBumDes.findFirst.mock.calls[0][0];
    expect(args.where).toEqual({ id: PROFIL_BUMDES_ID, isActive: true, deletedAt: null });
    expect(args.include.image.select).toEqual({ id: true, name: true, link: true });
    expect(res.data).toMatchObject({ nama: "B" });
  });
});

describe("PUT profil BUMDes", () => {
  it("body tidak valid → 400, tidak menyentuh DB", async () => {
    const c = ctx({ nama: "", deskripsi: "x" });
    const res = (await profilBumDesUpsert(c)) as { success: boolean; message: string };
    expect(c.set.status).toBe(400);
    expect(res.success).toBe(false);
    expect(res.message).toContain("Nama BUMDes wajib diisi");
    expect(prismaMock.profilBumDes.upsert).not.toHaveBeenCalled();
  });

  it("selalu upsert ke id tetap & mengaktifkan kembali profil yang pernah dihapus", async () => {
    prismaMock.profilBumDes.upsert.mockResolvedValueOnce({ id: PROFIL_BUMDES_ID });
    const res = (await profilBumDesUpsert(ctx({ ...validBody, alamat: "" }))) as { success: boolean };
    const args = prismaMock.profilBumDes.upsert.mock.calls[0][0];
    expect(args.where).toEqual({ id: PROFIL_BUMDES_ID });
    expect(args.create.id).toBe(PROFIL_BUMDES_ID);
    expect(args.update).toMatchObject({ nama: "BUMDes Contoh", alamat: null, isActive: true, deletedAt: null });
    expect(res.success).toBe(true);
  });

  it("imageId tidak ada (P2003) → 422 pesan referensi", async () => {
    prismaMock.profilBumDes.upsert.mockRejectedValueOnce(
      prismaError("P2003", { field_name: "ProfilBumDes_imageId_fkey" }),
    );
    const c = ctx({ ...validBody, imageId: "tidak-ada" });
    const res = (await profilBumDesUpsert(c)) as { success: boolean; message: string };
    expect(c.set.status).toBe(422);
    expect(res.success).toBe(false);
    expect(res.message).toContain("tidak ditemukan");
  });

  it("error DB lain dilempar ulang (tidak ditelan)", async () => {
    prismaMock.profilBumDes.upsert.mockRejectedValueOnce(new Error("koneksi putus"));
    await expect(profilBumDesUpsert(ctx(validBody))).rejects.toThrow("koneksi putus");
  });
});
