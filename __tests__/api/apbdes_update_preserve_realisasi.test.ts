// @vitest-environment node
// Regresi kritikal: Edit APBDes TIDAK BOLEH menghilangkan riwayat realisasi.
//
// Bug lama (updt.ts): delete-all-then-recreate semua item + mencocokkan
// realisasi yang di-preserve lewat string `kode` yang mutable, tanpa transaksi.
// Akibatnya:
//   (a) admin ubah kode item "4.1" -> "4.1a"  => link realisasi putus, hilang.
//   (b) admin hapus baris item                 => cascade delete realisasi fisik.
//
// Fix: cocokkan item lewat id yang STABIL, update in-place (realisasi tak
// disentuh), dan item yang dihapus admin di-SOFT-delete (isActive=false) —
// bukan hard delete — sehingga cascade tak pernah kebakar & riwayat aman.
//
// Test ini mengunci: item yang tetap ada di-update in-place (kode boleh
// berubah, id sama), item yang dihapus admin di-soft-delete, dan TIDAK ADA
// satu pun panggilan delete/deleteMany ke item maupun realisasi.
import { describe, it, expect, vi, beforeEach } from "vitest";

const prismaMock = vi.hoisted(() => ({
  aPBDes: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
  aPBDesItem: {
    update: vi.fn(),
    createMany: vi.fn(),
    updateMany: vi.fn(),
    findMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  realisasiItem: { delete: vi.fn(), deleteMany: vi.fn() },
  // $transaction memakai callback interaktif: teruskan prismaMock sebagai tx
  // agar semua mutasi terekam pada spy yang sama.
  $transaction: vi.fn(async (cb: (tx: typeof prismaMock) => unknown) => cb(prismaMock)),
}));

vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import apbdesUpdate from "@/app/api/[[...slugs]]/_lib/landing_page/apbdes/updt";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx = (id: string, body: any) => ({ params: { id }, body, set: {} }) as any;

// APBDes berisi 2 item; item A punya realisasi (total 500), item B kosong.
function seedExisting() {
  prismaMock.aPBDes.findUnique.mockReset();
  prismaMock.aPBDes.findFirst.mockReset();
  prismaMock.aPBDesItem.findMany.mockReset();

  // Panggilan pertama findUnique: existing (dengan item aktif + realisasi aktif)
  prismaMock.aPBDes.findUnique.mockResolvedValueOnce({
    id: "apbdes1",
    tahun: 2025,
    items: [
      {
        id: "itemA",
        kode: "4.1",
        uraian: "Pendapatan Asli",
        anggaran: 1000,
        level: 2,
        tipe: "pendapatan",
        realisasiItems: [{ jumlah: 300 }, { jumlah: 200 }], // total 500
      },
      {
        id: "itemB",
        kode: "5.1",
        uraian: "Belanja Modal",
        anggaran: 800,
        level: 2,
        tipe: "belanja",
        realisasiItems: [],
      },
    ],
  });
  // Duplikat tahun: tak ada bentrok
  prismaMock.aPBDes.findFirst.mockResolvedValue(null);
  // activeItems untuk assignParentIds (dipanggil setelah transaksi)
  prismaMock.aPBDesItem.findMany.mockResolvedValue([{ id: "itemA", kode: "4.1a" }]);
  // Panggilan kedua findUnique: hasil akhir untuk response
  // (respons akhir kini ikut membawa relasi folder & dokumen — APBDES_DOKUMEN_INCLUDE)
  prismaMock.aPBDes.findUnique.mockResolvedValueOnce({ id: "apbdes1", tahun: 2025, items: [], folders: [], dokumen: [] });
}

beforeEach(() => {
  vi.clearAllMocks();
  seedExisting();
});

describe("apbdesUpdate — preservasi realisasi saat edit", () => {
  it("item yang diubah kode-nya di-update IN-PLACE (id sama), realisasi direkalkulasi dari data lama", async () => {
    // Form: item A dipertahankan tapi kode diubah 4.1 -> 4.1a; item B dihapus.
    const body = {
      tahun: 2025,
      items: [
        { id: "itemA", kode: "4.1a", uraian: "Pendapatan Asli", anggaran: 1000, level: 2, tipe: "pendapatan" },
      ],
    };

    const res = await apbdesUpdate(ctx("apbdes1", body));
    expect(res.success).toBe(true);

    // itemA di-update in-place via id (bukan kode), total dari realisasi lama (500).
    const inPlace = prismaMock.aPBDesItem.update.mock.calls.find(
      ([arg]) => arg?.where?.id === "itemA" && arg?.data?.kode === "4.1a"
    );
    expect(inPlace).toBeTruthy();
    const data = inPlace![0].data;
    expect(data.totalRealisasi).toBe(500);
    expect(data.selisih).toBe(500); // 1000 - 500
    expect(data.persentase).toBe(50); // 500/1000*100
  });

  it("item yang dihapus admin di-SOFT-delete (isActive=false), BUKAN hard delete", async () => {
    const body = {
      tahun: 2025,
      items: [
        { id: "itemA", kode: "4.1", uraian: "Pendapatan Asli", anggaran: 1000, level: 2, tipe: "pendapatan" },
      ],
    };

    await apbdesUpdate(ctx("apbdes1", body));

    // itemB tidak ada di form => soft-delete via updateMany.
    const softDelete = prismaMock.aPBDesItem.updateMany.mock.calls.find(
      ([arg]) => Array.isArray(arg?.where?.id?.in) && arg.where.id.in.includes("itemB")
    );
    expect(softDelete).toBeTruthy();
    expect(softDelete![0].data.isActive).toBe(false);
    expect(softDelete![0].data.deletedAt).toBeInstanceOf(Date);
  });

  it("TIDAK ADA hard delete item maupun realisasi di sepanjang alur edit", async () => {
    const body = {
      tahun: 2025,
      items: [
        { id: "itemA", kode: "4.1", uraian: "Pendapatan Asli", anggaran: 1000, level: 2, tipe: "pendapatan" },
      ],
    };

    await apbdesUpdate(ctx("apbdes1", body));

    expect(prismaMock.aPBDesItem.delete).not.toHaveBeenCalled();
    expect(prismaMock.aPBDesItem.deleteMany).not.toHaveBeenCalled();
    expect(prismaMock.realisasiItem.delete).not.toHaveBeenCalled();
    expect(prismaMock.realisasiItem.deleteMany).not.toHaveBeenCalled();
  });

  it("item tanpa id (klien lama) tetap cocok lewat kode — backward compatible", async () => {
    // Body tanpa id sama sekali: fallback ke pencocokan by kode.
    const body = {
      tahun: 2025,
      items: [
        { kode: "4.1", uraian: "Pendapatan Asli", anggaran: 1000, level: 2, tipe: "pendapatan" },
        { kode: "5.1", uraian: "Belanja Modal", anggaran: 800, level: 2, tipe: "belanja" },
      ],
    };

    await apbdesUpdate(ctx("apbdes1", body));

    // Kedua item lama tercocok & di-update in-place; tak ada yang di-soft-delete.
    expect(prismaMock.aPBDesItem.update.mock.calls.some(([a]) => a?.where?.id === "itemA")).toBe(true);
    expect(prismaMock.aPBDesItem.update.mock.calls.some(([a]) => a?.where?.id === "itemB")).toBe(true);
    expect(prismaMock.aPBDesItem.updateMany).not.toHaveBeenCalled();
  });
});
