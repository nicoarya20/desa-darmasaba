// @vitest-environment node
// Unit test helper penerjemah error duplikat (P2002) → response 409 seragam.
// Keputusan: gaya B (hanya nama field, tanpa nilai) — lihat
// .DISKUSI/2026-07-15/notif-duplikat-admin.md
import { describe, it, expect, vi } from "vitest";
import { Prisma } from "@prisma/client";
import {
  fieldLabel,
  extractDuplicateField,
  toDuplicateResponse,
  handlePrismaError,
} from "@/lib/prisma-error";

// Bangun error P2002 seperti yang dilempar Prisma.
function makeP2002(target: unknown) {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "6.3.1",
    meta: { target },
  });
}

describe("fieldLabel", () => {
  it("map field dikenal ke label ramah", () => {
    expect(fieldLabel("month")).toBe("Bulan");
    expect(fieldLabel("nik")).toBe("NIK");
    expect(fieldLabel("email")).toBe("Email");
  });
  it("fallback ke nama mentah / 'Data'", () => {
    expect(fieldLabel("kolomAneh")).toBe("kolomAneh");
    expect(fieldLabel(undefined)).toBe("Data");
  });
});

describe("extractDuplicateField", () => {
  it("target array (MySQL) → elemen pertama", () => {
    expect(extractDuplicateField(["email", "telepon"])).toBe("email");
  });
  it("target string constraint (Postgres) → token dikenal", () => {
    expect(extractDuplicateField("DetailDataPengangguran_month_year_key")).toBe(
      "month"
    );
    expect(extractDuplicateField("Warga_nik_key")).toBe("nik");
  });
  it("tak dikenal → undefined", () => {
    expect(extractDuplicateField("Model_foo_key")).toBeUndefined();
    expect(extractDuplicateField(undefined)).toBeUndefined();
  });
});

describe("toDuplicateResponse", () => {
  it("P2002 → { success:false, message:'<Field> sudah dipakai' }, TANPA nilai", () => {
    const res = toDuplicateResponse(makeP2002(["month"]));
    expect(res).toEqual({ success: false, message: "Bulan sudah dipakai" });
  });
  it("field sensitif tak bocorkan nilai (hanya nama field)", () => {
    const res = toDuplicateResponse(makeP2002(["nik"]));
    expect(res?.message).toBe("NIK sudah dipakai");
    expect(res?.message).not.toMatch(/\d/); // tidak ada digit NIK
  });
  it("error non-P2002 → null", () => {
    expect(toDuplicateResponse(new Error("boom"))).toBeNull();
    const other = new Prisma.PrismaClientKnownRequestError("x", {
      code: "P2025",
      clientVersion: "6.3.1",
    });
    expect(toDuplicateResponse(other)).toBeNull();
  });
});

describe("handlePrismaError", () => {
  it("P2002 → set status 409 + return response duplikat", () => {
    const context = { set: { status: 200 as number | string } };
    const res = handlePrismaError(makeP2002(["year"]), context);
    expect(context.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Tahun sudah dipakai" });
  });
  it("error lain → re-throw (tidak ditelan)", () => {
    const boom = new Error("kesalahan lain");
    expect(() => handlePrismaError(boom)).toThrow(boom);
  });
});
