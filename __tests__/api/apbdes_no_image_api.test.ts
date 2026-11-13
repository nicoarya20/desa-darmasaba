// @vitest-environment node
// APBDes tidak lagi memakai gambar: handler create/update tidak boleh menulis
// `imageId` ke Prisma — walau klien lama masih mengirimnya. Pada update, kolom
// imageId dibiarkan apa adanya (tidak di-null-kan) supaya data lama tak rusak.
// Dokumen (`fileId`) tetap ditulis seperti biasa.
import { describe, it, expect, vi, beforeEach } from "vitest";

const prismaMock = vi.hoisted(() => ({
  aPBDes: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  aPBDesItem: { create: vi.fn(), update: vi.fn(), createMany: vi.fn(), updateMany: vi.fn(), findMany: vi.fn() },
  $transaction: vi.fn(async (cb: (tx: typeof prismaMock) => unknown) => cb(prismaMock)),
}));

vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import apbdesCreate from "@/app/api/[[...slugs]]/_lib/landing_page/apbdes/create";
import apbdesUpdate from "@/app/api/[[...slugs]]/_lib/landing_page/apbdes/updt";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx = (body: any, id?: string) => ({ params: { id }, body, set: {} }) as any;

const item = { kode: "4", uraian: "Pendapatan", anggaran: 1000, level: 1, tipe: null };

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => undefined);
  prismaMock.aPBDes.findFirst.mockResolvedValue(null);
  prismaMock.aPBDes.create.mockResolvedValue({ id: "apbdes1", tahun: 2025 });
  prismaMock.aPBDesItem.create.mockResolvedValue({ id: "item1", kode: "4" });
  prismaMock.aPBDesItem.findMany.mockResolvedValue([{ id: "item1", kode: "4" }]);
});

describe("apbdesCreate — tanpa gambar", () => {
  it("mengabaikan imageId dari body, tetap menulis fileId", async () => {
    // Respons akhir kini ikut membawa relasi folder & dokumen (APBDES_DOKUMEN_INCLUDE).
    prismaMock.aPBDes.findUnique.mockResolvedValue({ id: "apbdes1", tahun: 2025, items: [], folders: [], dokumen: [] });

    const res = await apbdesCreate(ctx({ tahun: 2025, imageId: "img-lama", fileId: "doc1", items: [item] }));

    expect(res.success).toBe(true);
    const data = prismaMock.aPBDes.create.mock.calls[0][0].data;
    expect(data).not.toHaveProperty("imageId");
    expect(data.fileId).toBe("doc1");
  });
});

describe("apbdesUpdate — tanpa gambar", () => {
  it("tidak menyentuh kolom imageId (tidak ditulis, tidak di-null-kan), fileId tetap ditulis", async () => {
    prismaMock.aPBDes.findUnique
      .mockResolvedValueOnce({ id: "apbdes1", tahun: 2025, items: [] })
      .mockResolvedValueOnce({ id: "apbdes1", tahun: 2025, items: [], folders: [], dokumen: [] });

    const res = await apbdesUpdate(
      ctx({ tahun: 2025, imageId: "", fileId: "doc2", items: [item] }, "apbdes1")
    );

    expect(res.success).toBe(true);
    const data = prismaMock.aPBDes.update.mock.calls[0][0].data;
    expect(data).not.toHaveProperty("imageId");
    expect(data.fileId).toBe("doc2");
  });
});
