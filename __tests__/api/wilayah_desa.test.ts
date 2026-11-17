// @vitest-environment node
// Letak & Batas Wilayah Desa (Point 1.1): validasi boundary, shape GET publik,
// upsert singleton idempoten, dan kontrak output yang hanya boleh bertambah.
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  wilayahDesa: { findFirst: vi.fn(), findUnique: vi.fn(), upsert: vi.fn() },
  fileStorage: { findFirst: vi.fn() },
}));
const removeReleasedFilesMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles", () => ({
  default: removeReleasedFilesMock,
}));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import wilayahDesaFind, {
  WILAYAH_DESA_SELECT,
} from "@/app/api/[[...slugs]]/_lib/desa/profile/profile_desa/wilayah/find";
import wilayahDesaUpsert from "@/app/api/[[...slugs]]/_lib/desa/profile/profile_desa/wilayah/upsert";
import {
  WILAYAH_DESA_ID,
  isHttpsUrl,
  jenisFilePeta,
  parseWilayahDesaInput,
  periksaFilePeta,
} from "@/lib/wilayah-desa";
import wilayahDesaState, {
  toWilayahFormValues,
  toWilayahPayload,
} from "@/app/admin/(dashboard)/_state/desa/profile/wilayah-desa";
import {
  periksaFilePilihan,
  petaFileDariApi,
  resolvePetaFileId,
  type PetaFileForm,
} from "@/app/admin/(dashboard)/pemerintahan/profil/wilayah-desa/_lib/peta-file.logic";
import { isPublicGetPath, isPublicPostPath } from "@/lib/auth-policy";

// Nilai uji murni fiktif (test-only), bukan data nyata desa.
const VALID_BODY = {
  batasUtara: "Utara-Uji",
  batasSelatan: "Selatan-Uji",
  batasTimur: "Timur-Uji",
  batasBarat: "Barat-Uji",
  luasWilayah: 12.5,
  keterangan: "Keterangan uji",
  petaEmbedUrl: "https://maps.example.test/embed?pb=abc",
};

const STORED_ROW = {
  id: WILAYAH_DESA_ID,
  ...VALID_BODY,
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("parseWilayahDesaInput — validasi input", () => {
  it("menerima body lengkap", () => {
    const result = parseWilayahDesaInput(VALID_BODY);
    expect(result).toEqual({ ok: true, data: VALID_BODY });
  });

  it.each(["batasUtara", "batasSelatan", "batasTimur", "batasBarat"])(
    "menolak %s kosong atau hanya spasi",
    (field) => {
      for (const value of ["", "   "]) {
        const result = parseWilayahDesaInput({ ...VALID_BODY, [field]: value });
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.message).toMatch(/wajib diisi/);
      }
    },
  );

  it("menolak arah yang tidak dikirim", () => {
    const { batasBarat: _omit, ...body } = VALID_BODY; // eslint-disable-line @typescript-eslint/no-unused-vars -- membuang field untuk skenario "tidak dikirim"
    expect(parseWilayahDesaInput(body).ok).toBe(false);
  });

  it("menolak luas negatif, nol, dan non-angka", () => {
    for (const luasWilayah of [-1, 0, "12", Number.NaN]) {
      expect(parseWilayahDesaInput({ ...VALID_BODY, luasWilayah }).ok).toBe(false);
    }
  });

  it("luas, keterangan, dan peta opsional → dinormalkan ke null", () => {
    const result = parseWilayahDesaInput({
      ...VALID_BODY,
      luasWilayah: null,
      keterangan: "  ",
      petaEmbedUrl: "",
    });
    expect(result).toEqual({
      ok: true,
      data: { ...VALID_BODY, luasWilayah: null, keterangan: null, petaEmbedUrl: null },
    });
  });

  it.each([
    "http://maps.example.test/embed",
    "javascript:alert(1)",
    "data:text/html,<b>x</b>",
    "ftp://maps.example.test/x",
    "//maps.example.test/embed",
    "bukan url",
    "https://user:pass@maps.example.test/embed",
  ])("menolak URL peta tidak aman: %s", (petaEmbedUrl) => {
    const result = parseWilayahDesaInput({ ...VALID_BODY, petaEmbedUrl });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/https/);
  });

  it("isHttpsUrl hanya true untuk https absolut", () => {
    expect(isHttpsUrl("https://maps.example.test/x")).toBe(true);
    expect(isHttpsUrl("http://maps.example.test/x")).toBe(false);
  });

  it("menolak body bukan objek", () => {
    expect(parseWilayahDesaInput(null).ok).toBe(false);
    expect(parseWilayahDesaInput("teks").ok).toBe(false);
  });
});

describe("wilayahDesaFind — GET publik", () => {
  it("mengembalikan shape sukses dengan kolom terpilih", async () => {
    prismaMock.wilayahDesa.findFirst.mockResolvedValue(STORED_ROW);
    const res = await wilayahDesaFind();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ success: true, data: { id: WILAYAH_DESA_ID, luasWilayah: 12.5 } });
    expect(prismaMock.wilayahDesa.findFirst).toHaveBeenCalledWith({
      where: { id: WILAYAH_DESA_ID, isActive: true, deletedAt: null },
      select: WILAYAH_DESA_SELECT,
    });
  });

  it("belum diisi → 200 dengan data null (bukan error)", async () => {
    prismaMock.wilayahDesa.findFirst.mockResolvedValue(null);
    const res = await wilayahDesaFind();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, data: null });
  });

  it("error DB → 500 JSON { success:false, message }", async () => {
    prismaMock.wilayahDesa.findFirst.mockRejectedValue(new Error("db down"));
    const res = await wilayahDesaFind();
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ success: false });
  });
});

describe("wilayahDesaUpsert — PUT admin", () => {
  it("input tidak valid → 400 dan tidak menyentuh DB", async () => {
    const res = await wilayahDesaUpsert({ ...VALID_BODY, batasUtara: "" });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ success: false });
    expect(prismaMock.wilayahDesa.upsert).not.toHaveBeenCalled();
  });

  it("URL peta http → 400", async () => {
    const res = await wilayahDesaUpsert({ ...VALID_BODY, petaEmbedUrl: "http://x.test/e" });
    expect(res.status).toBe(400);
    expect(prismaMock.wilayahDesa.upsert).not.toHaveBeenCalled();
  });

  it("upsert memakai ID singleton tetap sehingga idempoten", async () => {
    prismaMock.wilayahDesa.upsert.mockResolvedValue(STORED_ROW);

    const first = await wilayahDesaUpsert(VALID_BODY);
    const second = await wilayahDesaUpsert(VALID_BODY);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(prismaMock.wilayahDesa.upsert).toHaveBeenCalledTimes(2);
    for (const [args] of prismaMock.wilayahDesa.upsert.mock.calls) {
      expect(args.where).toEqual({ id: WILAYAH_DESA_ID });
      expect(args.create).toEqual({ id: WILAYAH_DESA_ID, ...VALID_BODY });
      expect(args.update).toEqual({ ...VALID_BODY, isActive: true, deletedAt: null });
    }
    expect(prismaMock.wilayahDesa.upsert.mock.calls[0][0]).toEqual(
      prismaMock.wilayahDesa.upsert.mock.calls[1][0],
    );
  });

  it("error DB → 500 JSON", async () => {
    prismaMock.wilayahDesa.upsert.mockRejectedValue(new Error("db down"));
    const res = await wilayahDesaUpsert(VALID_BODY);
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ success: false });
  });
});

describe("kontrak aditif & akses", () => {
  it("kolom output minimal yang sudah dipublikasikan tidak boleh hilang", () => {
    const published = [
      "id", "batasUtara", "batasSelatan", "batasTimur", "batasBarat",
      "luasWilayah", "keterangan", "petaEmbedUrl", "updatedAt",
    ];
    // Menambah kolom boleh (aditif); menghapus/mengganti nama = melanggar AI-CONTRACT §10.
    for (const key of published) expect(WILAYAH_DESA_SELECT).toHaveProperty(key, true);
  });

  it("path wilayah tidak di whitelist publik → PUT tetap kena guard sesi default route.ts", () => {
    expect(isPublicPostPath("/api/desa/profile/wilayah")).toBe(false);
    expect(isPublicGetPath("/api/desa/profile/wilayah")).toBe(false);
  });
});

describe("helper form admin", () => {
  it("data null → form kosong", () => {
    expect(toWilayahFormValues(null)).toEqual({
      batasUtara: "", batasSelatan: "", batasTimur: "", batasBarat: "",
      luasWilayah: "", keterangan: "", petaEmbedUrl: "",
    });
  });

  it("luas kosong → null di payload, angka tetap angka", () => {
    const form = toWilayahFormValues(null);
    expect(toWilayahPayload(form).luasWilayah).toBeNull();
    expect(toWilayahPayload({ ...form, luasWilayah: "7.5" }).luasWilayah).toBe(7.5);
  });
});

describe("file peta — parse body & aturan file", () => {
  it("petaFileId: tidak dikirim = tidak diubah, null/\"\"/spasi = hapus, string di-trim", () => {
    const absent = parseWilayahDesaInput(VALID_BODY);
    expect(absent.ok && "petaFileId" in absent.data).toBe(false);
    for (const [input, expected] of [
      [undefined, undefined],
      [null, null],
      ["", null],
      ["   ", null],
      [" file-1 ", "file-1"],
    ] as const) {
      const result = parseWilayahDesaInput({ ...VALID_BODY, petaFileId: input });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.petaFileId).toBe(expected);
    }
  });

  it("petaFileId bukan teks → ditolak", () => {
    const result = parseWilayahDesaInput({ ...VALID_BODY, petaFileId: 123 });
    expect(result).toEqual({ ok: false, message: "File peta tidak valid" });
  });

  it("jenisFilePeta: JPG/PNG/WebP = gambar, PDF = pdf, selain itu null", () => {
    for (const mime of ["image/jpeg", "image/png", "image/webp"]) expect(jenisFilePeta(mime)).toBe("gambar");
    expect(jenisFilePeta("application/pdf")).toBe("pdf");
    for (const mime of ["image/gif", "image/svg+xml", "application/gzip", "audio/mpeg", "", null, undefined]) {
      expect(jenisFilePeta(mime)).toBeNull();
    }
  });

  it("periksaFilePeta: harus ada (aktif) dan mime diizinkan", () => {
    expect(periksaFilePeta({ mimeType: "application/pdf" })).toEqual({ ok: true });
    expect(periksaFilePeta(null)).toEqual({ ok: false, message: "File peta tidak ditemukan atau sudah dihapus" });
    expect(periksaFilePeta({ mimeType: "application/gzip" })).toMatchObject({ ok: false, message: expect.stringMatching(/gambar .* atau PDF/) });
  });
});

describe("wilayahDesaUpsert — file peta", () => {
  const row = (petaFileId: string | null) => ({ ...STORED_ROW, petaFileId, petaFile: null });

  it("tanpa petaFileId → tidak cek FileStorage dan tidak melepas file lama", async () => {
    prismaMock.wilayahDesa.upsert.mockResolvedValue(row("lama"));
    const res = await wilayahDesaUpsert(VALID_BODY);
    expect(res.status).toBe(200);
    expect(prismaMock.fileStorage.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.wilayahDesa.findUnique).not.toHaveBeenCalled();
    expect(removeReleasedFilesMock).toHaveBeenCalledWith("WilayahDesa", [undefined], ["lama"]);
  });

  it("file valid → disimpan, file lama yang diganti dilepas", async () => {
    prismaMock.fileStorage.findFirst.mockResolvedValue({ mimeType: "image/webp" });
    prismaMock.wilayahDesa.findUnique.mockResolvedValue({ petaFileId: "lama" });
    prismaMock.wilayahDesa.upsert.mockResolvedValue(row("baru"));

    const res = await wilayahDesaUpsert({ ...VALID_BODY, petaFileId: "baru" });

    expect(res.status).toBe(200);
    expect(prismaMock.fileStorage.findFirst).toHaveBeenCalledWith({
      where: { id: "baru", isActive: true },
      select: { mimeType: true },
    });
    const [args] = prismaMock.wilayahDesa.upsert.mock.calls[0];
    expect(args.create.petaFileId).toBe("baru");
    expect(args.update.petaFileId).toBe("baru");
    expect(removeReleasedFilesMock).toHaveBeenCalledWith("WilayahDesa", ["lama"], ["baru"]);
  });

  it("null → file peta dihapus dari data lalu dilepas", async () => {
    prismaMock.wilayahDesa.findUnique.mockResolvedValue({ petaFileId: "lama" });
    prismaMock.wilayahDesa.upsert.mockResolvedValue(row(null));

    const res = await wilayahDesaUpsert({ ...VALID_BODY, petaFileId: null });

    expect(res.status).toBe(200);
    expect(prismaMock.fileStorage.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.wilayahDesa.upsert.mock.calls[0][0].update.petaFileId).toBeNull();
    expect(removeReleasedFilesMock).toHaveBeenCalledWith("WilayahDesa", ["lama"], [null]);
  });

  it.each([
    ["tidak ada / tidak aktif", null, /tidak ditemukan/],
    ["bukan gambar/PDF", { mimeType: "application/gzip" }, /gambar .* atau PDF/],
  ])("file %s → 400 tanpa menyentuh data", async (_label, file, message) => {
    prismaMock.fileStorage.findFirst.mockResolvedValue(file);
    const res = await wilayahDesaUpsert({ ...VALID_BODY, petaFileId: "x" });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ success: false, message: expect.stringMatching(message) });
    expect(prismaMock.wilayahDesa.upsert).not.toHaveBeenCalled();
    expect(removeReleasedFilesMock).not.toHaveBeenCalled();
  });

  it("output GET memuat petaFileId + petaFile (id, link, realName, mimeType, size)", () => {
    expect(WILAYAH_DESA_SELECT).toHaveProperty("petaFileId", true);
    expect(WILAYAH_DESA_SELECT.petaFile.select).toEqual({ id: true, link: true, realName: true, mimeType: true, size: true });
  });
});

describe("form admin — file peta", () => {
  const tersimpan: PetaFileForm = { id: "lama", file: null, link: "/x", nama: "peta.pdf", size: 10, jenis: "pdf" };
  const upload = vi.fn(async () => "baru");

  it("resolvePetaFileId: tidak berubah → undefined, dihapus → null, file baru → id unggahan", async () => {
    expect(await resolvePetaFileId("lama", tersimpan, upload)).toBeUndefined();
    expect(await resolvePetaFileId(null, null, upload)).toBeUndefined();
    expect(await resolvePetaFileId("lama", null, upload)).toBeNull();
    expect(upload).not.toHaveBeenCalled();

    const file = new File(["x"], "peta.png", { type: "image/png" });
    expect(await resolvePetaFileId("lama", { ...tersimpan, id: null, file }, upload)).toBe("baru");
    expect(upload).toHaveBeenCalledWith(file);
  });

  it("resolvePetaFileId: unggah gagal → error berpesan nama file", async () => {
    const file = new File(["x"], "peta.pdf", { type: "application/pdf" });
    const gagal = vi.fn(async () => {
      throw new Error("server");
    });
    await expect(resolvePetaFileId(null, { ...tersimpan, id: null, file }, gagal)).rejects.toThrow(/peta\.pdf/);
  });

  it("periksaFilePilihan: jenis & batas ukuran (gambar 5 MB, PDF 10 MB)", () => {
    const MB = 1024 ** 2;
    expect(periksaFilePilihan({ type: "image/jpeg", size: 5 * MB })).toBeNull();
    expect(periksaFilePilihan({ type: "image/jpeg", size: 6 * MB })).toMatch(/gambar maksimal 5/);
    expect(periksaFilePilihan({ type: "application/pdf", size: 9 * MB })).toBeNull();
    expect(periksaFilePilihan({ type: "application/pdf", size: 11 * MB })).toMatch(/PDF maksimal 10/);
    expect(periksaFilePilihan({ type: "image/gif", size: 1 })).toMatch(/gambar .* atau PDF/);
  });

  it("petaFileDariApi: null → null, file → nilai form tersimpan", () => {
    expect(petaFileDariApi(null)).toBeNull();
    expect(
      petaFileDariApi({ id: "a", link: "/api/img/a.webp", realName: "a.jpg", mimeType: "image/webp", size: null }),
    ).toEqual({ id: "a", file: null, link: "/api/img/a.webp", nama: "a.jpg", size: null, jenis: "gambar" });
  });

  it("submit: petaFileId undefined tidak dikirim, null dikirim", async () => {
    const fetchMock = vi.fn(async () => Response.json({ success: true, data: STORED_ROW }));
    vi.stubGlobal("fetch", fetchMock);
    const form = toWilayahFormValues(STORED_ROW as never);
    try {
      await wilayahDesaState.update.submit(form);
      await wilayahDesaState.update.submit(form, null);
    } finally {
      vi.unstubAllGlobals();
    }
    const bodies = fetchMock.mock.calls.map((call) => JSON.parse((call as unknown as [string, RequestInit])[1].body as string));
    expect("petaFileId" in bodies[0]).toBe(false);
    expect(bodies[1].petaFileId).toBeNull();
  });
});
