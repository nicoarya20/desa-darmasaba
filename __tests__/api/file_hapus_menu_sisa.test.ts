// @vitest-environment node
// 8 menu sisa: hapus/ubah record menghapus permanen berkas yang dilepas (termasuk galeri & lampiran) SETELAH operasi
// DB sukses, dengan pemilik yang benar (konteks log); operasi gagal → berkas tidak disentuh.
import { describe, it, expect, vi, beforeEach } from "vitest";

const { prismaMock, removeStoredFileMock } = vi.hoisted(() => {
  const delegate = () => ({ findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), delete: vi.fn(), update: vi.fn() });
  return {
    removeStoredFileMock: vi.fn(),
    prismaMock: {
      pengumuman: delegate(),
      artikelKesehatan: delegate(),
      dataPerpustakaan: delegate(),
      kegiatanDesa: delegate(),
      mediaSosial: delegate(),
      prestasiDesa: delegate(),
      programInovasi: delegate(),
      sdgsDesa: delegate(),
      fileStorage: delegate(),
      introduction: delegate(),
      symptom: delegate(),
      prevention: delegate(),
      firstAid: delegate(),
      mythVsFact: delegate(),
      doctorSign: delegate(),
    },
  };
});
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile", () => ({ default: removeStoredFileMock }));

import removeReleasedFiles, { fileIds } from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles";
import pengumumanDelete from "@/app/api/[[...slugs]]/_lib/desa/pengumuman/del";
import pengumumanUpdate from "@/app/api/[[...slugs]]/_lib/desa/pengumuman/updt";
import artikelKesehatanDelete from "@/app/api/[[...slugs]]/_lib/kesehatan/data_kesehatan_warga/artikel_kesehatan/del";
import artikelKesehatanUpdate from "@/app/api/[[...slugs]]/_lib/kesehatan/data_kesehatan_warga/artikel_kesehatan/updt";
import dataPerpustakaanDelete from "@/app/api/[[...slugs]]/_lib/pendidikan/perpustakaan-digital/data-perpustakaan/del";
import dataPerpustakaanUpdate from "@/app/api/[[...slugs]]/_lib/pendidikan/perpustakaan-digital/data-perpustakaan/updt";
import kegiatanDesaDelete from "@/app/api/[[...slugs]]/_lib/lingkungan/gotong-royong/del";
import kegiatanDesaUpdate from "@/app/api/[[...slugs]]/_lib/lingkungan/gotong-royong/updt";
import mediaSosialDelete from "@/app/api/[[...slugs]]/_lib/landing_page/profile/media-sosial/del";
import mediaSosialUpdate from "@/app/api/[[...slugs]]/_lib/landing_page/profile/media-sosial/updt";
import prestasiDesaDelete from "@/app/api/[[...slugs]]/_lib/landing_page/prestasi-desa/del";
import prestasiDesaUpdate from "@/app/api/[[...slugs]]/_lib/landing_page/prestasi-desa/updt";
import programInovasiDelete from "@/app/api/[[...slugs]]/_lib/landing_page/profile/program-inovasi/del";
import programInovasiUpdate from "@/app/api/[[...slugs]]/_lib/landing_page/profile/program-inovasi/updt";
import sdgsDesaDelete from "@/app/api/[[...slugs]]/_lib/landing_page/sdgs-desa/del";
import sdgsDesaUpdate from "@/app/api/[[...slugs]]/_lib/landing_page/sdgs-desa/updt";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context Elysia minimal
const ctx = (body: unknown = {}): any => ({ params: { id: "r1" }, body, set: {} });
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- handler Elysia beda tipe kembalian per domain
type Handler = (c: any) => Promise<unknown>;
type Delegate = (typeof prismaMock)["pengumuman"];

/** ID berkas yang dikirim ke `removeStoredFile` beserta pemiliknya, urut pemanggilan. */
const dihapus = () => removeStoredFileMock.mock.calls.map(([file, owner]) => [file.id, owner]);
/** Semua penghapusan berkas terjadi setelah operasi DB `fn`. */
const afterDb = (fn: { mock: { invocationCallOrder: number[] } }) =>
  removeStoredFileMock.mock.invocationCallOrder.every((o) => o > fn.mock.invocationCallOrder[0]);

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  removeStoredFileMock.mockResolvedValue(undefined);
});

describe("removeReleasedFiles", () => {
  it("hanya berkas yang dilepas, tanpa duplikat & kosong, urut pertama", async () => {
    await removeReleasedFiles("Pengumuman", ["a", null, "b", "", "a", "c", undefined], ["b", null]);
    expect(dihapus()).toEqual([
      ["a", "Pengumuman"],
      ["c", "Pengumuman"],
    ]);
  });

  it("fileIds meratakan ID tunggal & relasi daftar", () => {
    expect(fileIds("x", [{ id: "y" }, { id: "z" }], null)).toEqual(["x", "y", "z", null]);
  });
});

// Handler hapus dengan satu relasi gambar: `delete` mengembalikan baris (berisi imageId) yang dihapus.
const hapusSederhana: [string, Handler, Delegate][] = [
  ["DataPerpustakaan", dataPerpustakaanDelete, prismaMock.dataPerpustakaan],
  ["KegiatanDesa", kegiatanDesaDelete, prismaMock.kegiatanDesa],
  ["MediaSosial", mediaSosialDelete, prismaMock.mediaSosial],
  ["PrestasiDesa", prestasiDesaDelete, prismaMock.prestasiDesa],
  ["SdgsDesa", sdgsDesaDelete, prismaMock.sdgsDesa],
];

describe("hapus record → berkas dihapus permanen setelah delete sukses", () => {
  it.each(hapusSederhana)("%s: gambar dihapus dengan pemilik yang benar", async (owner, handler, db) => {
    db.delete.mockResolvedValue({ id: "r1", imageId: "img1" });
    await handler(ctx());
    expect(db.delete).toHaveBeenCalledWith({ where: { id: "r1" } });
    expect(dihapus()).toEqual([["img1", owner]]);
    expect(afterDb(db.delete)).toBe(true);
  });

  it.each(hapusSederhana)("%s: tanpa gambar → tidak ada yang dihapus", async (_owner, handler, db) => {
    db.delete.mockResolvedValue({ id: "r1", imageId: null });
    await handler(ctx());
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });

  it.each(hapusSederhana)("%s: delete gagal → berkas tidak disentuh", async (_owner, handler, db) => {
    db.delete.mockRejectedValue(new Error("FK restrict"));
    await expect(handler(ctx())).rejects.toThrow("FK restrict");
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });

  it("Pengumuman: gambar utama + galeri + lampiran dokumen", async () => {
    prismaMock.pengumuman.findUnique.mockResolvedValue({
      id: "r1",
      imageId: "img1",
      images: [{ id: "g1" }, { id: "g2" }],
      dokumen: [{ id: "pdf1" }],
    });
    prismaMock.pengumuman.delete.mockResolvedValue({ id: "r1" });
    expect(await pengumumanDelete(ctx())).toMatchObject({ status: 200, success: true });
    expect(prismaMock.pengumuman.findUnique.mock.calls[0][0].include).toMatchObject({
      images: { select: { id: true } },
      dokumen: { select: { id: true } },
    });
    expect(dihapus()).toEqual(["img1", "g1", "g2", "pdf1"].map((id) => [id, "Pengumuman"]));
    expect(afterDb(prismaMock.pengumuman.delete)).toBe(true);
  });

  it("Pengumuman: delete gagal → berkas tidak disentuh", async () => {
    prismaMock.pengumuman.findUnique.mockResolvedValue({ id: "r1", imageId: "img1", images: [], dokumen: [] });
    prismaMock.pengumuman.delete.mockRejectedValue(new Error("db down"));
    await expect(pengumumanDelete(ctx())).rejects.toThrow("db down");
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });

  it("ArtikelKesehatan: gambar artikel; gagal delete → tidak disentuh", async () => {
    prismaMock.artikelKesehatan.findUnique.mockResolvedValue({ id: "r1", imageId: "img1" });
    prismaMock.artikelKesehatan.delete.mockResolvedValueOnce({ id: "r1" });
    expect(await artikelKesehatanDelete(ctx())).toMatchObject({ status: 200 });
    expect(dihapus()).toEqual([["img1", "ArtikelKesehatan"]]);
    expect(afterDb(prismaMock.artikelKesehatan.delete)).toBe(true);

    removeStoredFileMock.mockClear();
    prismaMock.artikelKesehatan.delete.mockRejectedValueOnce(new Error("db down"));
    await expect(artikelKesehatanDelete(ctx())).rejects.toThrow("db down");
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });

  it("ProgramInovasi: logo + galeri (dibaca sebelum delete)", async () => {
    prismaMock.programInovasi.findUnique.mockResolvedValue({ images: [{ id: "g1" }] });
    prismaMock.programInovasi.delete.mockResolvedValue({ id: "r1", imageId: "logo" });
    await programInovasiDelete(ctx());
    expect(prismaMock.programInovasi.findUnique.mock.invocationCallOrder[0]).toBeLessThan(
      prismaMock.programInovasi.delete.mock.invocationCallOrder[0],
    );
    expect(dihapus()).toEqual([
      ["logo", "ProgramInovasi"],
      ["g1", "ProgramInovasi"],
    ]);
    expect(afterDb(prismaMock.programInovasi.delete)).toBe(true);
  });

  it("ProgramInovasi: delete gagal → tidak disentuh", async () => {
    prismaMock.programInovasi.findUnique.mockResolvedValue({ images: [{ id: "g1" }] });
    prismaMock.programInovasi.delete.mockRejectedValue(new Error("db down"));
    await expect(programInovasiDelete(ctx())).rejects.toThrow("db down");
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });
});

// Handler update satu gambar: [pemilik, handler, delegate, body valid minimal, update gagal melempar?]
const ubahSederhana: [string, Handler, Delegate, Record<string, unknown>, boolean][] = [
  ["DataPerpustakaan", dataPerpustakaanUpdate, prismaMock.dataPerpustakaan, { judul: "Buku" }, true],
  ["KegiatanDesa", kegiatanDesaUpdate, prismaMock.kegiatanDesa, { judul: "Kerja bakti" }, false],
  ["MediaSosial", mediaSosialUpdate, prismaMock.mediaSosial, { name: "Instagram", iconUrl: "https://ig" }, false],
  ["PrestasiDesa", prestasiDesaUpdate, prismaMock.prestasiDesa, { name: "Juara" }, false],
  ["SdgsDesa", sdgsDesaUpdate, prismaMock.sdgsDesa, { name: "SDG 1" }, false],
];

describe("update ganti gambar → gambar lama dihapus permanen setelah update sukses", () => {
  it.each(ubahSederhana)("%s: gambar lama dihapus, baru tidak", async (owner, handler, db, body) => {
    db.findUnique.mockResolvedValue({ imageId: "lama" });
    db.findFirst.mockResolvedValue(null);
    db.update.mockResolvedValue({ id: "r1", imageId: "baru" });
    await handler(ctx({ ...body, imageId: "baru" }));
    expect(dihapus()).toEqual([["lama", owner]]);
    expect(afterDb(db.update)).toBe(true);
  });

  it.each(ubahSederhana)("%s: gambar sama → tidak ada yang dihapus", async (_owner, handler, db, body) => {
    db.findUnique.mockResolvedValue({ imageId: "sama" });
    db.findFirst.mockResolvedValue(null);
    db.update.mockResolvedValue({ id: "r1", imageId: "sama" });
    await handler(ctx({ ...body, imageId: "sama" }));
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });

  it.each(ubahSederhana)("%s: update gagal → gambar lama tetap aktif", async (_owner, handler, db, body, throws) => {
    db.findUnique.mockResolvedValue({ imageId: "lama" });
    db.findFirst.mockResolvedValue(null);
    db.update.mockRejectedValue(new Error("db down"));
    const run = handler(ctx({ ...body, imageId: "baru" }));
    if (throws) await expect(run).rejects.toThrow("db down");
    else expect(await run).toMatchObject({ success: false });
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });

  it("ArtikelKesehatan: gambar lama dihapus setelah update artikel", async () => {
    prismaMock.artikelKesehatan.findUnique.mockResolvedValue({ id: "r1", imageId: "lama" });
    prismaMock.artikelKesehatan.update.mockResolvedValueOnce({ id: "r1", imageId: "baru" });
    await artikelKesehatanUpdate(ctx({ title: "T", imageId: "baru" }));
    expect(dihapus()).toEqual([["lama", "ArtikelKesehatan"]]);
    expect(afterDb(prismaMock.artikelKesehatan.update)).toBe(true);

    removeStoredFileMock.mockClear();
    prismaMock.artikelKesehatan.update.mockRejectedValueOnce(new Error("db down"));
    await expect(artikelKesehatanUpdate(ctx({ title: "T", imageId: "baru" }))).rejects.toThrow("db down");
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });

  it("Pengumuman: gambar utama, galeri & dokumen yang dilepas dihapus; yang tetap dirujuk tidak", async () => {
    prismaMock.pengumuman.findUnique.mockResolvedValue({
      id: "r1",
      imageId: "lama",
      images: [{ id: "g1" }, { id: "g2" }],
      dokumen: [{ id: "pdf1" }],
    });
    prismaMock.fileStorage.findMany.mockResolvedValue([
      { id: "baru", mimeType: "image/png" },
      { id: "g2", mimeType: "image/png" },
    ]);
    prismaMock.pengumuman.update.mockResolvedValue({ id: "r1", imageId: "baru", images: [{ id: "g2" }], dokumen: [] });
    const body = { judul: "J", deskripsi: "D", content: "C", categoryPengumumanId: null };
    const res = (await pengumumanUpdate(ctx({ ...body, imageId: "baru", imageIds: ["g2"], dokumenIds: [] }))) as Response;
    expect(res.status).toBe(200);
    expect(dihapus()).toEqual(["lama", "g1", "pdf1"].map((id) => [id, "Pengumuman"]));
    expect(afterDb(prismaMock.pengumuman.update)).toBe(true);
  });

  it("Pengumuman: update gagal → 500 dan berkas lama tetap aktif", async () => {
    prismaMock.pengumuman.findUnique.mockResolvedValue({ id: "r1", imageId: "lama", images: [], dokumen: [] });
    prismaMock.pengumuman.update.mockRejectedValue(new Error("db down"));
    const body = { judul: "J", deskripsi: "D", content: "C", categoryPengumumanId: null, imageId: null };
    const res = (await pengumumanUpdate(ctx(body))) as Response;
    expect(res.status).toBe(500);
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });

  it("ProgramInovasi: logo & galeri yang dilepas dihapus; gagal update → tidak disentuh", async () => {
    prismaMock.programInovasi.findUnique.mockResolvedValue({ imageId: "logo", images: [{ id: "g1" }, { id: "g2" }] });
    prismaMock.programInovasi.update.mockResolvedValueOnce({ id: "r1", imageId: "logo2", images: [{ id: "g2" }] });
    expect(await programInovasiUpdate(ctx({ imageId: "logo2", imageIds: ["g2"] }))).toMatchObject({ success: true });
    expect(dihapus()).toEqual([
      ["logo", "ProgramInovasi"],
      ["g1", "ProgramInovasi"],
    ]);
    expect(afterDb(prismaMock.programInovasi.update)).toBe(true);

    removeStoredFileMock.mockClear();
    prismaMock.programInovasi.update.mockRejectedValueOnce(new Error("db down"));
    expect(await programInovasiUpdate(ctx({ imageId: "logo2" }))).toMatchObject({ success: false });
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });
});
