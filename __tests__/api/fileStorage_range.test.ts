// @vitest-environment node
import { describe, it, expect } from "vitest";
import { parseRangeHeader } from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/parseRange";

describe("parseRangeHeader", () => {
  it("parse range tertutup 'bytes=0-99'", () => {
    expect(parseRangeHeader("bytes=0-99", 1000)).toEqual({ start: 0, end: 99, chunkSize: 100 });
  });

  it("parse range terbuka 'bytes=500-' (bentuk yang dikirim <audio> saat seek)", () => {
    expect(parseRangeHeader("bytes=500-", 1000)).toEqual({ start: 500, end: 999, chunkSize: 500 });
  });

  it("clamp end yang melebihi ukuran file ke byte terakhir", () => {
    expect(parseRangeHeader("bytes=900-2000", 1000)).toEqual({ start: 900, end: 999, chunkSize: 100 });
  });

  it("clamp start yang melebihi ukuran file ke byte terakhir (chunk 1 byte)", () => {
    expect(parseRangeHeader("bytes=5000-", 1000)).toEqual({ start: 999, end: 999, chunkSize: 1 });
  });

  it("header yang tidak valid mengembalikan null", () => {
    expect(parseRangeHeader("not-a-range", 1000)).toBeNull();
  });

  it("totalSize 0 mengembalikan null", () => {
    expect(parseRangeHeader("bytes=0-99", 0)).toBeNull();
  });
});
