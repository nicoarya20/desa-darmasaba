// @vitest-environment node
// Logika murni struktur organisasi (src/lib/struktur-organisasi): normalisasi, hierarki, paginasi.
import { describe, it, expect } from "vitest";
import {
  formatDateOnly,
  MAX_PAGE_LIMIT,
  parseOptionalBoolean,
  parseOptionalDate,
  parseOptionalEmail,
  parseOptionalText,
  parsePaging,
  toNullableText,
  totalPagesOf,
  validateParent,
} from "@/lib/struktur-organisasi";

describe("normalize", () => {
  it('string kosong / spasi / null / undefined → null, sisanya di-trim', () => {
    expect(toNullableText("")).toBeNull();
    expect(toNullableText("   ")).toBeNull();
    expect(toNullableText(null)).toBeNull();
    expect(toNullableText(undefined)).toBeNull();
    expect(toNullableText("  S.Kom ")).toBe("S.Kom");
  });

  it("teks opsional ditolak bila melebihi batas", () => {
    expect(parseOptionalText("abc", { max: 3, label: "X" })).toEqual({ ok: true, value: "abc" });
    expect(parseOptionalText("abcd", { max: 3, label: "Telepon" })).toEqual({
      ok: false,
      message: "Telepon maksimal 3 karakter",
    });
  });

  it("email hanya divalidasi bila diisi", () => {
    expect(parseOptionalEmail("")).toEqual({ ok: true, value: null });
    expect(parseOptionalEmail("  ")).toEqual({ ok: true, value: null });
    expect(parseOptionalEmail(" a@desa.id ")).toEqual({ ok: true, value: "a@desa.id" });
    expect(parseOptionalEmail("bukan-email").ok).toBe(false);
    expect(parseOptionalEmail("a@b").ok).toBe(false);
  });

  it("tanggal YYYY-MM-DD valid → Date UTC; kosong → null", () => {
    const r = parseOptionalDate("2024-02-29");
    expect(r.ok && r.value?.toISOString()).toBe("2024-02-29T00:00:00.000Z");
    expect(parseOptionalDate("")).toEqual({ ok: true, value: null });
    expect(parseOptionalDate(null)).toEqual({ ok: true, value: null });
  });

  it("tanggal invalid ditolak (format salah / tanggal tidak ada)", () => {
    expect(parseOptionalDate("29-02-2024").ok).toBe(false);
    expect(parseOptionalDate("2024-02-30").ok).toBe(false);
    expect(parseOptionalDate("2023-02-29").ok).toBe(false);
    expect(parseOptionalDate("2024-13-01").ok).toBe(false);
    expect(parseOptionalDate("2024-01-01T10:00:00Z").ok).toBe(false);
  });

  it("formatDateOnly untuk isi form edit", () => {
    expect(formatDateOnly(new Date("2024-05-06T00:00:00.000Z"))).toBe("2024-05-06");
    expect(formatDateOnly("2024-05-06T00:00:00.000Z")).toBe("2024-05-06");
    expect(formatDateOnly(null)).toBe("");
    expect(formatDateOnly("ngawur")).toBe("");
  });

  it("parseOptionalBoolean: hanya true/false yang jadi filter", () => {
    expect(parseOptionalBoolean("true")).toBe(true);
    expect(parseOptionalBoolean("false")).toBe(false);
    expect(parseOptionalBoolean("")).toBeUndefined();
    expect(parseOptionalBoolean(undefined)).toBeUndefined();
  });
});

describe("hierarchy validateParent", () => {
  // A (puncak) → B → C
  const nodes = [
    { id: "A", parentId: null },
    { id: "B", parentId: "A" },
    { id: "C", parentId: "B" },
  ];

  it("tanpa parent selalu valid", () => {
    expect(validateParent({ id: "A", parentId: null, nodes })).toEqual({ ok: true });
    expect(validateParent({ parentId: undefined, nodes })).toEqual({ ok: true });
  });

  it("parent tidak ada ditolak", () => {
    expect(validateParent({ parentId: "Z", nodes })).toMatchObject({ ok: false, reason: "NOT_FOUND" });
    expect(validateParent({ id: "B", parentId: "Z", nodes })).toMatchObject({ ok: false, reason: "NOT_FOUND" });
  });

  it("parent = diri sendiri ditolak", () => {
    expect(validateParent({ id: "B", parentId: "B", nodes })).toMatchObject({ ok: false, reason: "SELF" });
  });

  it("siklus A→B→A ditolak (A dijadikan bawahan B padahal B bawahan A)", () => {
    expect(validateParent({ id: "A", parentId: "B", nodes })).toMatchObject({ ok: false, reason: "CYCLE" });
    expect(validateParent({ id: "A", parentId: "C", nodes })).toMatchObject({ ok: false, reason: "CYCLE" });
  });

  it("perpindahan valid diterima", () => {
    expect(validateParent({ id: "C", parentId: "A", nodes })).toEqual({ ok: true });
    expect(validateParent({ parentId: "C", nodes })).toEqual({ ok: true });
  });

  it("data lama yang sudah bersiklus tidak membuat loop tak berujung", () => {
    const broken = [
      { id: "X", parentId: "Y" },
      { id: "Y", parentId: "X" },
      { id: "N", parentId: null },
    ];
    expect(validateParent({ id: "N", parentId: "X", nodes: broken })).toEqual({ ok: true });
  });
});

describe("paging", () => {
  it("default page 1 limit 10", () => {
    expect(parsePaging({})).toEqual({ page: 1, limit: 10, skip: 0 });
  });

  it("menghitung skip dan membatasi limit", () => {
    expect(parsePaging({ page: "3", limit: "5" })).toEqual({ page: 3, limit: 5, skip: 10 });
    expect(parsePaging({ limit: "100000" }).limit).toBe(MAX_PAGE_LIMIT);
    expect(parsePaging({ page: "-2", limit: "abc" })).toEqual({ page: 1, limit: 10, skip: 0 });
  });

  it("totalPages minimal 1", () => {
    expect(totalPagesOf(0, 10)).toBe(1);
    expect(totalPagesOf(21, 10)).toBe(3);
  });
});
