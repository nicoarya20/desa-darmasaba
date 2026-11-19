// @vitest-environment node
// Jenis baru Arah Kebijakan Pembangunan Desa: APBDES & PELAPORAN_APBDES di lib dokumen-perencanaan
// (valid, label, field per jenis) dan tautan publik ke halaman baru. Jenis lama tetap valid (aditif).
import { describe, expect, it } from "vitest";
import {
  DOKUMEN_PERENCANAAN_PUBLIC_HREF,
  JENIS_DOKUMEN,
  JENIS_DOKUMEN_LABEL,
  formatPeriodeDokumen,
  isJenisDokumen,
  parseDokumenPerencanaanInput,
} from "@/lib/dokumen-perencanaan";

const apbdesBody = { jenis: "APBDES", judul: "APBDes Desa Contoh 2026", tahun: 2026 }; // test-only
const pelaporanBody = { jenis: "PELAPORAN_APBDES", judul: "Laporan Realisasi APBDes Semester I 2026", tahun: 2026 }; // test-only

describe("jenis dokumen perencanaan", () => {
  it("memuat lima jenis: tiga lama tetap ada, APBDES & PELAPORAN_APBDES ditambahkan", () => {
    expect([...JENIS_DOKUMEN].sort()).toEqual(
      ["APBDES", "BERITA_ACARA_MUSYAWARAH", "PELAPORAN_APBDES", "RKP", "RPJM"].sort(),
    );
  });

  it("jenis baru valid, jenis asing atau huruf kecil ditolak", () => {
    expect(isJenisDokumen("APBDES")).toBe(true);
    expect(isJenisDokumen("PELAPORAN_APBDES")).toBe(true);
    for (const asing of ["apbdes", "PELAPORAN", "", null, undefined, 7]) {
      expect(isJenisDokumen(asing), String(asing)).toBe(false);
    }
  });

  it("setiap jenis punya label, dan label jenis baru sesuai istilah desa", () => {
    for (const jenis of JENIS_DOKUMEN) expect(JENIS_DOKUMEN_LABEL[jenis]).toBeTruthy();
    expect(JENIS_DOKUMEN_LABEL.APBDES).toBe("APBDes");
    expect(JENIS_DOKUMEN_LABEL.PELAPORAN_APBDES).toBe("Pelaporan Realisasi APBDes");
    expect(JENIS_DOKUMEN_LABEL.RKP).toBe("RKP Desa");
  });
});

describe("parseDokumenPerencanaanInput — APBDES & PELAPORAN_APBDES", () => {
  it.each([apbdesBody, pelaporanBody])("$jenis wajib tahun dan menyimpan tahun saja", (body) => {
    expect(parseDokumenPerencanaanInput({ ...body, tahun: undefined }).ok).toBe(false);
    expect(parseDokumenPerencanaanInput({ ...body, tahun: 1999 }).ok).toBe(false);
    expect(parseDokumenPerencanaanInput({ ...body, tahun: "2026" }).ok).toBe(false);

    const r = parseDokumenPerencanaanInput({ ...body, tahunMulai: 2021, tahunSelesai: 2027, jenisMusyawarah: "MUSDES" });
    expect(r).toMatchObject({
      ok: true,
      data: { jenis: body.jenis, tahun: 2026, tahunMulai: null, tahunSelesai: null, jenisMusyawarah: null },
    });
  });

  it("pelaporan menerima ringkasan/periode opsional dan nomor Perdes opsional", () => {
    const r = parseDokumenPerencanaanInput({ ...pelaporanBody, ringkasan: "  Semester I (Januari-Juni)  " });
    expect(r).toMatchObject({ ok: true, data: { ringkasan: "Semester I (Januari-Juni)", nomorPerdes: null } });
    expect(parseDokumenPerencanaanInput({ ...pelaporanBody, ringkasan: "x".repeat(5001) }).ok).toBe(false);
  });

  it("fileId mengikuti aturan yang sama dengan jenis lain", () => {
    expect(parseDokumenPerencanaanInput({ ...apbdesBody, fileId: "file-1" })).toMatchObject({ ok: true, data: { fileId: "file-1" } }); // test-only
    expect(parseDokumenPerencanaanInput({ ...apbdesBody, fileId: 5 }).ok).toBe(false);
  });

  it("pesan galat jenis asing menyebut kelima jenis", () => {
    const r = parseDokumenPerencanaanInput({ ...apbdesBody, jenis: "APBDESA" });
    expect(r.ok).toBe(false);
    if (!r.ok) for (const jenis of JENIS_DOKUMEN) expect(r.message).toContain(jenis);
  });

  it("jenis lama tidak berubah: RPJM tetap butuh periode, berita acara tetap butuh musyawarah", () => {
    expect(parseDokumenPerencanaanInput({ jenis: "RPJM", judul: "RPJM Desa", tahun: 2026 }).ok).toBe(false);
    expect(parseDokumenPerencanaanInput({ jenis: "BERITA_ACARA_MUSYAWARAH", judul: "Berita Acara", tahun: 2026 }).ok).toBe(false);
  });
});

describe("tampilan tahun & tautan publik", () => {
  it("jenis baru menampilkan satu tahun, '-' bila kosong", () => {
    expect(formatPeriodeDokumen({ jenis: "APBDES", tahun: 2026 })).toBe("2026");
    expect(formatPeriodeDokumen({ jenis: "PELAPORAN_APBDES", tahun: 2025 })).toBe("2025");
    expect(formatPeriodeDokumen({ jenis: "APBDES" })).toBe("-");
  });

  it("DOKUMEN_PERENCANAAN_PUBLIC_HREF menunjuk halaman Arah Kebijakan, bukan lagi anchor Monev", () => {
    expect(DOKUMEN_PERENCANAAN_PUBLIC_HREF).toBe("/pemerintahan/arah-kebijakan-pembangunan-desa");
    expect(DOKUMEN_PERENCANAAN_PUBLIC_HREF).not.toContain("#");
  });
});
