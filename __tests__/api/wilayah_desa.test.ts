// @vitest-environment node
// Letak & Batas Wilayah Desa (Point 1.1): validasi boundary, shape GET publik,
// upsert singleton idempoten, dan kontrak output yang hanya boleh bertambah.
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  wilayahDesa: { findFirst: vi.fn(), upsert: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import wilayahDesaFind, {
  WILAYAH_DESA_SELECT,
} from "@/app/api/[[...slugs]]/_lib/desa/profile/profile_desa/wilayah/find";
import wilayahDesaUpsert from "@/app/api/[[...slugs]]/_lib/desa/profile/profile_desa/wilayah/upsert";
import {
  WILAYAH_DESA_ID,
  isHttpsUrl,
  parseWilayahDesaInput,
} from "@/app/api/[[...slugs]]/_lib/desa/profile/profile_desa/wilayah/validation";
import {
  toWilayahFormValues,
  toWilayahPayload,
} from "@/app/admin/(dashboard)/_state/desa/profile/wilayah-desa";
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
