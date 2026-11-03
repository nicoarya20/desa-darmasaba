// @vitest-environment node
// State admin BUMDes: validasi form sebelum request, payload create/update, unggah gambar, dan hapus.
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const unitById = { put: vi.fn(), get: vi.fn(), delete: vi.fn() };
  const unitRoot = Object.assign(vi.fn(() => unitById), {
    create: { post: vi.fn() },
    del: Object.assign(vi.fn(() => unitById), {}),
    "find-many": { get: vi.fn() },
  });
  return {
    unitById,
    unitRoot,
    profilGet: vi.fn(),
    profilPut: vi.fn(),
    upload: vi.fn(),
    toast: { success: vi.fn(), error: vi.fn() },
  };
});

vi.mock("@/lib/api-fetch", () => ({
  default: {
    api: {
      fileStorage: { create: { post: mocks.upload } },
      ekonomi: { bumdes: { profil: { get: mocks.profilGet, put: mocks.profilPut }, "unit-usaha": mocks.unitRoot } },
    },
  },
}));
vi.mock("react-toastify", () => ({ toast: mocks.toast }));

import profilBumdes from "@/app/admin/(dashboard)/_state/ekonomi/bumdes/profil";
import unitUsahaBumdes from "@/app/admin/(dashboard)/_state/ekonomi/bumdes/unit-usaha";

const ok = (data: unknown = {}) => ({ status: 200, data: { success: true, data } });

beforeEach(() => {
  vi.clearAllMocks();
  unitUsahaBumdes.resetForm();
  profilBumdes.data = null;
  profilBumdes.form = { nama: "", deskripsi: "", alamat: "", kontak: "", tahunBerdiri: null };
});

describe("unitUsahaBumdes.submit", () => {
  it("nama/deskripsi kosong → toast error dan tidak ada request", async () => {
    unitUsahaBumdes.form = { nama: "  ", deskripsi: "", urutan: null, isActive: true };
    expect(await unitUsahaBumdes.submit(null)).toBe(false);
    expect(mocks.toast.error).toHaveBeenCalled();
    expect(mocks.unitRoot.create.post).not.toHaveBeenCalled();
  });

  it("create: urutan kosong tidak dikirim (server mengisi), nama di-trim", async () => {
    mocks.unitRoot.create.post.mockResolvedValue(ok());
    unitUsahaBumdes.form = { nama: " Simpan Pinjam ", deskripsi: "Pinjaman warga", urutan: null, isActive: true };
    expect(await unitUsahaBumdes.submit(null)).toBe(true);
    expect(mocks.unitRoot.create.post).toHaveBeenCalledWith({
      nama: "Simpan Pinjam",
      deskripsi: "Pinjaman warga",
      imageId: null,
      isActive: true,
    });
  });

  it("edit: memakai PUT by id dan mempertahankan imageId lama bila tidak ada file baru", async () => {
    mocks.unitById.put.mockResolvedValue(ok());
    unitUsahaBumdes.editId = "u1";
    unitUsahaBumdes.currentImageId = "img-lama";
    unitUsahaBumdes.form = { nama: "Toko", deskripsi: "Sembako", urutan: 2, isActive: false };
    expect(await unitUsahaBumdes.submit(null)).toBe(true);
    expect(mocks.unitRoot).toHaveBeenCalledWith({ id: "u1" });
    expect(mocks.unitById.put).toHaveBeenCalledWith({
      nama: "Toko",
      deskripsi: "Sembako",
      imageId: "img-lama",
      isActive: false,
      urutan: 2,
    });
  });

  it("file baru diunggah dulu lalu id-nya dipakai", async () => {
    mocks.upload.mockResolvedValue({ status: 200, data: { data: { id: "img-baru" } } });
    mocks.unitRoot.create.post.mockResolvedValue(ok());
    unitUsahaBumdes.form = { nama: "Toko", deskripsi: "Sembako", urutan: null, isActive: true };
    const file = new File(["x"], "toko.png", { type: "image/png" });
    await unitUsahaBumdes.submit(file);
    expect(mocks.upload).toHaveBeenCalledWith({ file, name: "toko.png" });
    expect(mocks.unitRoot.create.post).toHaveBeenCalledWith(expect.objectContaining({ imageId: "img-baru" }));
  });

  it("gagal unggah gambar → false, unit usaha tidak dibuat", async () => {
    mocks.upload.mockResolvedValue({ status: 500, data: null });
    unitUsahaBumdes.form = { nama: "Toko", deskripsi: "Sembako", urutan: null, isActive: true };
    expect(await unitUsahaBumdes.submit(new File(["x"], "a.png"))).toBe(false);
    expect(mocks.unitRoot.create.post).not.toHaveBeenCalled();
    expect(mocks.toast.error).toHaveBeenCalled();
  });

  it("respons server non-200 → pesan server ditampilkan dan hasil false", async () => {
    mocks.unitRoot.create.post.mockResolvedValue({ status: 400, data: null, error: { value: { message: "Nama wajib" } } });
    unitUsahaBumdes.form = { nama: "Toko", deskripsi: "Sembako", urutan: null, isActive: true };
    expect(await unitUsahaBumdes.submit(null)).toBe(false);
    expect(mocks.toast.error).toHaveBeenCalledWith("Nama wajib");
  });
});

describe("unitUsahaBumdes.delete & findMany", () => {
  it("delete memanggil DELETE /del/:id dan melaporkan sukses", async () => {
    mocks.unitById.delete.mockResolvedValue(ok());
    expect(await unitUsahaBumdes.delete.byId("u9")).toBe(true);
    expect(mocks.unitRoot.del).toHaveBeenCalledWith({ id: "u9" });
  });

  it("findMany mengirim includeInactive & search hanya bila diminta", async () => {
    mocks.unitRoot["find-many"].get.mockResolvedValue({ status: 200, data: { data: [], page: 2, total: 0, totalPages: 1 } });
    await unitUsahaBumdes.findMany.load(2, 9);
    expect(mocks.unitRoot["find-many"].get).toHaveBeenLastCalledWith({ query: { page: 2, limit: 9 } });
    await unitUsahaBumdes.findMany.load(1, 10, "toko", true);
    expect(mocks.unitRoot["find-many"].get).toHaveBeenLastCalledWith({
      query: { page: 1, limit: 10, search: "toko", includeInactive: "true" },
    });
  });

  it("findMany gagal jaringan → daftar kosong, tidak melempar", async () => {
    mocks.unitRoot["find-many"].get.mockRejectedValue(new Error("offline"));
    await expect(unitUsahaBumdes.findMany.load()).resolves.toBeUndefined();
    expect(unitUsahaBumdes.findMany.data).toEqual([]);
  });
});

describe("profilBumdes", () => {
  it("load: profil belum diisi (data null) → loaded true, data null", async () => {
    mocks.profilGet.mockResolvedValue({ status: 200, data: { success: true, data: null } });
    await profilBumdes.load();
    expect(profilBumdes.loaded).toBe(true);
    expect(profilBumdes.data).toBeNull();
  });

  it("save: nama kosong → tidak ada request", async () => {
    profilBumdes.form = { nama: "", deskripsi: "Isi", alamat: "", kontak: "", tahunBerdiri: null };
    expect(await profilBumdes.save(null)).toBe(false);
    expect(mocks.profilPut).not.toHaveBeenCalled();
  });

  it("save: mengirim field opsional apa adanya (string kosong menghapus nilai di server)", async () => {
    mocks.profilPut.mockResolvedValue(ok());
    mocks.profilGet.mockResolvedValue({ status: 200, data: { success: true, data: null } });
    profilBumdes.form = { nama: " BUMDes ", deskripsi: " Usaha desa ", alamat: "", kontak: "0361", tahunBerdiri: 2018 };
    expect(await profilBumdes.save(null)).toBe(true);
    expect(mocks.profilPut).toHaveBeenCalledWith({
      nama: "BUMDes",
      deskripsi: "Usaha desa",
      alamat: "",
      kontak: "0361",
      tahunBerdiri: 2018,
      imageId: null,
    });
  });
});
