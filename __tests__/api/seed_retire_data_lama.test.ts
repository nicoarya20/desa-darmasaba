// @vitest-environment node
// Seeder hanya upsert, jadi baris dari JSON versi lama tertinggal dan tampil dobel.
// Test ini menjaga daftar *.retired.json dan urutan penghapusan agar data admin tidak ikut terhapus.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";
import { loadJsonData } from "../../prisma/load-json";
import { loadRetiredSeed, retireSeedRows } from "../../prisma/retire-seed-rows";

const prismaMock = vi.hoisted(() => {
  const model = () => ({
    upsert: vi.fn().mockResolvedValue({ id: "x" }),
    deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(null),
  });
  return {
    berita: model(),
    kategoriBerita: model(),
    fileStorage: model(),
    posisiOrganisasiBumDes: model(),
    pegawaiBumDes: model(),
    kategoriKegiatan: model(),
    kegiatanDesa: model(),
    dataPerpustakaan: model(),
    kategoriBuku: model(),
  };
});
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import { seedStrukturBumdes } from "../../prisma/_seeder_list/ekonomi/seed_struktur_bumdes";
import { seedKegiatanDesa } from "../../prisma/_seeder_list/desa/seed_kegiatan_desa";
import { seedBerita } from "../../prisma/_seeder_list/desa/berita/seed_berita";
import { seedDataPerpustakaan } from "../../prisma/_seeder_list/pendidikan/seed_data_perpustakaan";

type Row = { id: string; [k: string]: unknown };
const ids = (rows: Row[]) => new Set(rows.map((r) => r.id));

// [file pensiun, file JSON aktif, field penanda yang dicocokkan saat hapus]
// Kategori Kegiatan hanya nama (tabelnya tidak punya deskripsi); Pegawai BUMDes nama + posisi.
const RETIRED: [string, string, string[]][] = [
  ["desa/berita/berita.retired.json", "desa/berita/berita.json", ["judul", "deskripsi"]],
  ["ekonomi/struktur-organisasi/pegawai-bumdes.retired.json", "ekonomi/struktur-organisasi/pegawai-bumdes.json", ["namaLengkap", "posisiId"]],
  ["ekonomi/struktur-organisasi/posisi-organisasi-bumdes.retired.json", "ekonomi/struktur-organisasi/posisi-organisasi-bumdes.json", ["nama", "deskripsi"]],
  ["desa/kegiatan-desa/kategori-kegiatan.retired.json", "desa/kegiatan-desa/kategori-kegiatan.json", ["nama"]],
  ["pendidikan/perpustakaan-digital/perpustakaan-digital.retired.json", "pendidikan/perpustakaan-digital/perpustakaan-digital.json", ["judul", "deskripsi"]],
];

describe("retireSeedRows", () => {
  it("menghitung baris terhapus dan yang sudah tidak ada/diedit admin", async () => {
    const deleteRow = vi.fn().mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
    const result = await retireSeedRows("Uji", [{ id: "a" }, { id: "b" }], deleteRow);
    expect(result).toEqual({ deleted: 1, skipped: 1, referenced: [] });
    expect(deleteRow).toHaveBeenNthCalledWith(2, { id: "b" });
  });

  it("melewati baris yang masih dirujuk FK lalu tetap memproses baris berikutnya", async () => {
    const fkError = new Prisma.PrismaClientKnownRequestError("FK", { code: "P2003", clientVersion: "test" });
    const deleteRow = vi.fn().mockRejectedValueOnce(fkError).mockResolvedValueOnce({ count: 1 });
    const result = await retireSeedRows("Uji", [{ id: "dipakai" }, { id: "bebas" }], deleteRow);
    expect(result).toEqual({ deleted: 1, skipped: 0, referenced: ["dipakai"] });
  });

  it("melempar error lain dengan konteks id", async () => {
    const deleteRow = vi.fn().mockRejectedValue(new Error("koneksi putus"));
    await expect(retireSeedRows("Uji", [{ id: "a" }], deleteRow)).rejects.toThrow(
      "Gagal menghapus Uji pensiun a: koneksi putus",
    );
  });
});

describe("daftar *.retired.json", () => {
  it.each(RETIRED)("%s tidak berisi id yang masih dipakai JSON aktif dan punya penanda", (retiredPath, activePath, fields) => {
    const retired = loadRetiredSeed<Row>(retiredPath);
    const active = loadJsonData<Row[] | Row[][]>(activePath).flat() as Row[];
    expect(retired.length).toBeGreaterThan(0);
    const activeIds = ids(active);
    for (const r of retired) {
      expect(activeIds.has(r.id)).toBe(false);
      for (const field of fields) {
        expect(typeof r[field]).toBe("string");
        expect((r[field] as string).length).toBeGreaterThan(0);
      }
    }
    expect(ids(retired).size).toBe(retired.length);
  });
});

describe("kategori kegiatan & perpustakaan tidak dobel", () => {
  const kategori = loadJsonData<Row[]>("desa/kegiatan-desa/kategori-kegiatan.json");
  const kategoriGotongRoyong = loadJsonData<Row[]>("lingkungan/gotong-royong/kategori-gotong-royong.json");
  const pensiun = loadRetiredSeed<{ id: string; replacedBy: string }>("desa/kegiatan-desa/kategori-kegiatan.retired.json");

  it("nama kategori unik di kedua file yang mengisi tabel KategoriKegiatan", () => {
    const nama = [...kategori, ...kategoriGotongRoyong].map((k) => k.nama);
    expect(new Set(nama).size).toBe(nama.length);
  });

  it("kategori pengganti ada dan tidak ada kegiatan seed yang memakai kategori pensiun", () => {
    const aktif = ids(kategori);
    const kegiatan = [
      ...loadJsonData<Row[]>("desa/kegiatan-desa/kegiatan-desa.json"),
      ...loadJsonData<Row[]>("lingkungan/gotong-royong/gotong-royong.json"),
    ];
    for (const p of pensiun) {
      expect(aktif.has(p.replacedBy)).toBe(true);
      expect(kegiatan.some((k) => k.kategoriKegiatanId === p.id)).toBe(false);
    }
  });

  it("judul buku perpustakaan unik", () => {
    const judul = loadJsonData<Row[]>("pendidikan/perpustakaan-digital/perpustakaan-digital.json").map((b) => b.judul);
    expect(new Set(judul).size).toBe(judul.length);
  });
});

describe("seeder menghapus data pensiun dengan urutan aman", () => {
  beforeEach(() => vi.clearAllMocks());

  it("struktur BUMDes: pegawai pensiun dihapus sebelum posisi, dicocokkan id + nama + posisi/deskripsi", async () => {
    await seedStrukturBumdes();
    const pegawai = prismaMock.pegawaiBumDes.deleteMany;
    const posisi = prismaMock.posisiOrganisasiBumDes.deleteMany;
    const [pg] = loadRetiredSeed<{ id: string; namaLengkap: string; posisiId: string }>(RETIRED[1][0]);
    const [ps] = loadRetiredSeed<{ id: string; nama: string; deskripsi: string }>(RETIRED[2][0]);
    expect(pegawai).toHaveBeenCalledTimes(loadRetiredSeed(RETIRED[1][0]).length);
    expect(pegawai).toHaveBeenCalledWith({ where: { id: pg.id, namaLengkap: pg.namaLengkap, posisiId: pg.posisiId } });
    expect(posisi).toHaveBeenCalledWith({ where: { id: ps.id, nama: ps.nama, deskripsi: ps.deskripsi } });
    expect(Math.max(...pegawai.mock.invocationCallOrder)).toBeLessThan(Math.min(...posisi.mock.invocationCallOrder));
  });

  it("kategori kegiatan: upsert kategori pengganti → pindahkan kegiatan → hapus kategori lama", async () => {
    await seedKegiatanDesa();
    const [p] = kategoriPensiun();
    const upsertPengganti = prismaMock.kategoriKegiatan.upsert.mock.calls.findIndex(([a]) => a.where.id === p.replacedBy);
    const upsertOrder = prismaMock.kategoriKegiatan.upsert.mock.invocationCallOrder[upsertPengganti];
    const [moveOrder] = prismaMock.kegiatanDesa.updateMany.mock.invocationCallOrder;
    const [deleteOrder] = prismaMock.kategoriKegiatan.deleteMany.mock.invocationCallOrder;
    expect(prismaMock.kegiatanDesa.updateMany).toHaveBeenCalledWith({
      where: { kategoriKegiatanId: p.id },
      data: { kategoriKegiatanId: p.replacedBy },
    });
    expect(prismaMock.kategoriKegiatan.deleteMany).toHaveBeenCalledWith({ where: { id: p.id, nama: p.nama } });
    expect(upsertOrder).toBeLessThan(moveOrder);
    expect(moveOrder).toBeLessThan(deleteOrder);
  });

  it("berita & buku pensiun dihapus berdasarkan id + judul + deskripsi", async () => {
    await seedBerita();
    await seedDataPerpustakaan();
    type Konten = { id: string; judul: string; deskripsi: string };
    const berita = loadRetiredSeed<Konten>(RETIRED[0][0]);
    const [buku] = loadRetiredSeed<Konten>(RETIRED[4][0]);
    expect(prismaMock.berita.deleteMany).toHaveBeenCalledTimes(berita.length);
    expect(prismaMock.berita.deleteMany).toHaveBeenCalledWith({
      where: { id: berita[0].id, judul: berita[0].judul, deskripsi: berita[0].deskripsi },
    });
    expect(prismaMock.dataPerpustakaan.deleteMany).toHaveBeenCalledWith({
      where: { id: buku.id, judul: buku.judul, deskripsi: buku.deskripsi },
    });
  });
});

function kategoriPensiun() {
  return loadRetiredSeed<{ id: string; nama: string; replacedBy: string }>(RETIRED[3][0]);
}
