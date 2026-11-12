// @vitest-environment node
// State Valtio Struktur Perangkat Desa: validasi form (hanya field wajib), payload ke ApiFetch, toast, refresh list.
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const byId = { get: vi.fn(), put: vi.fn(), delete: vi.fn() };
  const resource = () =>
    Object.assign(vi.fn(() => byId), {
      create: { post: vi.fn() },
      del: vi.fn(() => byId),
      "find-many": { get: vi.fn() },
      "find-many-all": { get: vi.fn() },
    });
  return {
    byId,
    posisi: resource(),
    pegawai: resource(),
    toast: { success: vi.fn(), error: vi.fn() },
  };
});

vi.mock("@/lib/api-fetch", () => ({
  default: { api: { desa: { strukturperangkat: { posisi: mocks.posisi, pegawai: mocks.pegawai } } } },
}));
vi.mock("react-toastify", () => ({ toast: mocks.toast }));

import stateStrukturPerangkat, {
  templatePegawai,
  templatePosisi,
} from "@/app/admin/(dashboard)/_state/desa/struktur-perangkat";

const { posisi, pegawai } = stateStrukturPerangkat;
const ok = (data: unknown = {}) => ({ status: 200, data: { success: true, message: "ok", data } });
const listOk = () => ({ status: 200, data: { success: true, data: [], page: 1, limit: 10, total: 0, totalPages: 1 } });

beforeEach(() => {
  vi.clearAllMocks();
  pegawai.create.resetForm();
  pegawai.update.resetForm();
  posisi.create.resetForm();
  mocks.pegawai["find-many"].get.mockResolvedValue(listOk());
  mocks.posisi["find-many-all"].get.mockResolvedValue(ok([]));
});

describe("template zod", () => {
  it("pegawai: hanya namaLengkap + posisiId wajib", () => {
    expect(templatePegawai.safeParse({ namaLengkap: "A", posisiId: "pd-perbekel" }).success).toBe(true);
    expect(templatePegawai.safeParse({ namaLengkap: " ", posisiId: "pd-perbekel" }).success).toBe(false);
    expect(templatePegawai.safeParse({ namaLengkap: "A", posisiId: "" }).success).toBe(false);
    expect(templatePegawai.safeParse({ namaLengkap: "A", posisiId: "x", email: "" }).success).toBe(true);
    expect(templatePegawai.safeParse({ namaLengkap: "A", posisiId: "x", email: "salah" }).success).toBe(false);
    expect(templatePegawai.safeParse({ namaLengkap: "A", posisiId: "x", tanggalMasuk: "2024-02-30" }).success).toBe(false);
  });

  it("jabatan: nama + hierarki wajib", () => {
    expect(templatePosisi.safeParse({ nama: "Perbekel", hierarki: 1 }).success).toBe(true);
    expect(templatePosisi.safeParse({ nama: "Perbekel", hierarki: null }).success).toBe(false);
    expect(templatePosisi.safeParse({ nama: "", hierarki: 1 }).success).toBe(false);
  });
});

describe("pegawai state", () => {
  it("create tidak valid → toast error, tanpa request", async () => {
    expect(await pegawai.create.submit()).toBe(false);
    expect(mocks.toast.error).toHaveBeenCalled();
    expect(mocks.pegawai.create.post).not.toHaveBeenCalled();
  });

  it("create valid → kirim semua field, toast sukses, form direset, list dimuat ulang dengan filter terakhir", async () => {
    await pegawai.findMany.load(2, 20, "kelian", true);
    mocks.pegawai.create.post.mockResolvedValue(ok({ id: "p1" }));
    pegawai.create.form = { ...pegawai.create.form, namaLengkap: " Wayan ", posisiId: "pd-kelian-cabe" };

    expect(await pegawai.create.submit()).toBe(true);
    expect(mocks.pegawai.create.post).toHaveBeenCalledWith(
      expect.objectContaining({ namaLengkap: "Wayan", posisiId: "pd-kelian-cabe", email: "", imageId: "" })
    );
    expect(mocks.toast.success).toHaveBeenCalled();
    expect(pegawai.create.form.namaLengkap).toBe("");
    expect(mocks.pegawai["find-many"].get).toHaveBeenLastCalledWith({
      query: { page: 2, limit: 20, search: "kelian", isActive: "true" },
    });
  });

  it("gagal dari server → toast pesan server", async () => {
    mocks.pegawai.create.post.mockResolvedValue({
      status: 400,
      data: null,
      error: { status: 400, value: { success: false, message: "Jabatan tidak ditemukan" } },
    });
    pegawai.create.form = { ...pegawai.create.form, namaLengkap: "A", posisiId: "x" };
    expect(await pegawai.create.submit()).toBe(false);
    expect(mocks.toast.error).toHaveBeenCalledWith("Jabatan tidak ditemukan");
  });

  it("update.load mengisi form (tanggal → YYYY-MM-DD, null → '') lalu submit PUT ke id", async () => {
    mocks.byId.get.mockResolvedValue(
      ok({
        id: "p1",
        namaLengkap: "Made",
        gelarAkademik: null,
        imageId: "img1",
        image: { id: "img1", link: "/api/img/a.webp" },
        tanggalMasuk: new Date("2021-03-04T00:00:00.000Z"),
        email: null,
        telepon: null,
        alamat: null,
        posisiId: "pd-perbekel",
        isActive: true,
      })
    );
    expect(await pegawai.update.load("p1")).toBe(true);
    expect(pegawai.update.form).toMatchObject({ tanggalMasuk: "2021-03-04", gelarAkademik: "", imageId: "img1" });
    expect(pegawai.update.imageLink).toBe("/api/img/a.webp");

    mocks.byId.put.mockResolvedValue(ok({ id: "p1" }));
    pegawai.update.form.imageId = "";
    expect(await pegawai.update.submit()).toBe(true);
    expect(mocks.pegawai).toHaveBeenLastCalledWith({ id: "p1" });
    expect(mocks.byId.put).toHaveBeenCalledWith(expect.objectContaining({ imageId: "", tanggalMasuk: "2021-03-04" }));
  });

  it("delete → toast sukses", async () => {
    mocks.byId.delete.mockResolvedValue(ok({ id: "p1" }));
    expect(await pegawai.delete.byId("p1")).toBe(true);
    expect(mocks.pegawai.del).toHaveBeenCalledWith({ id: "p1" });
    expect(mocks.toast.success).toHaveBeenCalled();
  });
});

describe("posisi state", () => {
  it("create: urutan kosong tidak dikirim, parentId kosong dikirim '' (server → null)", async () => {
    mocks.posisi.create.post.mockResolvedValue(ok({ id: "baru" }));
    posisi.create.form = { ...posisi.create.form, nama: " Kasi ", hierarki: 2 };
    expect(await posisi.create.submit()).toBe(true);
    expect(mocks.posisi.create.post).toHaveBeenCalledWith({ nama: "Kasi", hierarki: 2, deskripsi: "", parentId: "" });
  });

  it("delete 409 → toast pesan server dan false", async () => {
    mocks.byId.delete.mockResolvedValue({
      status: 409,
      data: null,
      error: { status: 409, value: { success: false, message: "Jabatan masih dipakai 2 pegawai" } },
    });
    expect(await posisi.delete.byId("pd-perbekel")).toBe(false);
    expect(mocks.toast.error).toHaveBeenCalledWith("Jabatan masih dipakai 2 pegawai");
  });

  it("findManyAll menyimpan data dan filter isActive", async () => {
    mocks.posisi["find-many-all"].get.mockResolvedValue(ok([{ id: "pd-perbekel" }]));
    await posisi.findManyAll.load(true);
    expect(mocks.posisi["find-many-all"].get).toHaveBeenCalledWith({ query: { isActive: "true" } });
    expect(posisi.findManyAll.data).toEqual([{ id: "pd-perbekel" }]);
  });
});
