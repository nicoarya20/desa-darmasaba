// @vitest-environment node
// Penjaga: script di prisma/ hanya boleh import alias `@/lib/...`.
// Tahap runner Dockerfile hanya menyalin prisma/ dan src/lib — bukan src/app dkk —
// jadi `bun run prisma/seed.ts` di container gagal "Cannot find module" kalau
// seeder meng-import alias lain (mis. `@/app/...`).
import { readdirSync, readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const PRISMA_DIR = path.resolve(__dirname, "../../prisma");
const IMPORT_SPECIFIER = /(?:\bfrom|\bimport|\brequire)\s*\(?\s*["'](@\/[^"']+)["']/g;
const ALLOWED_PREFIX = "@/lib/";

function listTsFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "node_modules") return [];
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listTsFiles(full);
    return entry.name.endsWith(".ts") ? [full] : [];
  });
}

function findForbiddenImports(source: string): string[] {
  return [...source.matchAll(IMPORT_SPECIFIER)]
    .map((match) => match[1])
    .filter((specifier) => !specifier.startsWith(ALLOWED_PREFIX));
}

describe("prisma seed imports", () => {
  it("menemukan script TypeScript di prisma/", () => {
    expect(listTsFiles(PRISMA_DIR).length).toBeGreaterThan(0);
  });

  it("pendeteksi menandai alias non-lib dan meloloskan @/lib", () => {
    const sample = [
      'import { A } from "@/app/api/x/validation";',
      "import type { B } from '@/lib/b';",
      'const c = await import("@/con/c");',
      'const d = require("@/lib/d");',
    ].join("\n");
    expect(findForbiddenImports(sample)).toEqual(["@/app/api/x/validation", "@/con/c"]);
  });

  it("tidak ada import alias @/ selain @/lib/... di prisma/", () => {
    const violations = listTsFiles(PRISMA_DIR).flatMap((file) =>
      findForbiddenImports(readFileSync(file, "utf8")).map(
        (specifier) => `${path.relative(process.cwd(), file)} -> ${specifier}`,
      ),
    );

    expect(
      violations,
      "Script di prisma/ hanya boleh import alias @/lib/... karena tahap runner Dockerfile " +
        "hanya menyalin prisma/ dan src/lib; import lain gagal 'Cannot find module' saat " +
        "`bun run prisma/seed.ts` di container. Pindahkan modul yang dibutuhkan ke src/lib. " +
        `Pelanggaran:\n${violations.join("\n")}`,
    ).toEqual([]);
  });
});
