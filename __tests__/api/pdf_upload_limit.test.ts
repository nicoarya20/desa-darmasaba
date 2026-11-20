// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Mock I/O eksternal saja (MinIO + Prisma); guard ukuran dan alur PDF tetap asli.
vi.mock("@/lib/minio", () => ({
  default: { putObject: vi.fn().mockResolvedValue(undefined) },
  MINIO_BUCKET: "test-bucket",
}));
vi.mock("@/lib/prisma", () => ({
  default: { fileStorage: { create: vi.fn((args: { data: unknown }) => Promise.resolve(args.data)) } },
}));

import fileStorageCreate from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/create";
import minio from "@/lib/minio";
import { PDF_MAX_SIZE_BYTES, PDF_MAX_SIZE_MB, PDF_TOO_LARGE_MESSAGE } from "@/lib/pdf-upload.limits";
import { PDF_MAX_SIZE_MB as PDF_MAX_SIZE_MB_ADMIN } from "@/app/admin/_com/upload/pdf-upload";

const MB = 1024 ** 2;

/** File kecil yang melaporkan `size` palsu, supaya tes tidak mengalokasikan puluhan MB. */
function fakeSizedFile(type: string, size: number, name = "dokumen.pdf") {
  const file = new File([new Uint8Array(8)], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

function makeContext() {
  return { set: { status: 200 as number | string }, body: Promise.resolve({}) };
}

async function callCreate(file: File) {
  const context = makeContext();
  context.body = Promise.resolve({ name: file.name, file });
  const result = await fileStorageCreate(context as never);
  return { result, status: context.set.status };
}

describe("fileStorage/create — guard ukuran PDF", () => {
  beforeEach(() => {
    vi.mocked(minio.putObject).mockClear();
  });

  it("batas PDF adalah 60 MB", () => {
    expect(PDF_MAX_SIZE_MB).toBe(60);
    expect(PDF_MAX_SIZE_BYTES).toBe(60 * MB);
  });

  it("menolak PDF di atas batas dengan 413 dan pesan berisi batas MB, tanpa menyimpan", async () => {
    const { result, status } = await callCreate(fakeSizedFile("application/pdf", PDF_MAX_SIZE_BYTES + 1));

    expect(status).toBe(413);
    expect(result).toEqual({ success: false, message: PDF_TOO_LARGE_MESSAGE });
    expect(PDF_TOO_LARGE_MESSAGE).toContain(`${PDF_MAX_SIZE_MB} MB`);
    expect(minio.putObject).not.toHaveBeenCalled();
  });

  it("menolak sebelum membaca isi berkas ke memori", async () => {
    const file = fakeSizedFile("application/pdf", PDF_MAX_SIZE_BYTES + MB);
    const arrayBuffer = vi.spyOn(file, "arrayBuffer");

    await callCreate(file);

    expect(arrayBuffer).not.toHaveBeenCalled();
  });

  it("menerima PDF tepat di batas dan menyimpannya tanpa kompresi", async () => {
    const { result, status } = await callCreate(fakeSizedFile("application/pdf", PDF_MAX_SIZE_BYTES));

    expect(status).toBe(200);
    expect(minio.putObject).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      data: { mimeType: "application/pdf", size: PDF_MAX_SIZE_BYTES, category: "document", path: "document" },
    });
  });

  it("tidak membatasi dokumen non-PDF dengan batas PDF (perilaku lama tetap)", async () => {
    const { status, result } = await callCreate(
      fakeSizedFile("application/zip", PDF_MAX_SIZE_BYTES + MB, "arsip.zip"),
    );

    expect(status).toBe(200);
    expect(result).toMatchObject({ data: { mimeType: "application/gzip", category: "document" } });
  });
});

describe("batas PDF — satu sumber untuk klien dan server", () => {
  const read = (relative: string) => readFileSync(resolve(process.cwd(), relative), "utf8");

  it("pdf-upload admin memakai nilai yang sama dengan modul batas di src/lib", () => {
    expect(PDF_MAX_SIZE_MB_ADMIN).toBe(PDF_MAX_SIZE_MB);
    expect(read("src/app/admin/_com/upload/pdf-upload.ts")).toContain("@/lib/pdf-upload.limits");
  });

  it("server memakai konstanta dari modul batas, bukan angka sendiri", () => {
    const source = read("src/app/api/[[...slugs]]/_lib/fileStorage/_lib/create.ts");
    expect(source).toContain("@/lib/pdf-upload.limits");
    expect(source).not.toMatch(/\b(20|60)\s*\*\s*1024/);
  });

  it.each([
    "src/app/admin/_com/upload/PdfDropzoneField.tsx",
    "src/app/admin/_com/upload/PdfMultiDropzoneField.tsx",
  ])("%s membatasi dan melaporkan penolakan lewat PDF_MAX_SIZE_MB", (path) => {
    const source = read(path);
    expect(source).toContain("maxSize={PDF_MAX_SIZE_MB * 1024 ** 2}");
    expect(source).toContain("${PDF_MAX_SIZE_MB} MB");
    expect(source).not.toMatch(/\b\d+\s*MB\b(?!\})/);
  });
});
