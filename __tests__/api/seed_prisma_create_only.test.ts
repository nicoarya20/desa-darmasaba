// @vitest-environment node
// Seed dijalankan manual di STG setelah admin mengedit data hasil seed lewat CMS.
// seed-prisma menjaga agar upsert seeder tidak menimpa editan itu, kecuali SEED_OVERWRITE=true.
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  berita: { upsert: vi.fn().mockResolvedValue({ id: "b1" }), findMany: vi.fn().mockResolvedValue([]) },
  $disconnect: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import seedPrisma, { isSeedOverwrite, seedUpsertArgs } from "../../prisma/seed-prisma";

const args = {
  where: { id: "b1" },
  create: { id: "b1", judul: "Judul JSON" },
  update: { judul: "Judul JSON" },
};

describe("seed-prisma", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllEnvs());

  it("default create-only: upsert dikirim dengan update kosong, create utuh", async () => {
    await seedPrisma.berita.upsert(args as never);
    expect(prismaMock.berita.upsert).toHaveBeenCalledWith({ where: args.where, create: args.create, update: {} });
    expect(isSeedOverwrite()).toBe(false);
  });

  it("SEED_OVERWRITE=true: upsert menimpa dengan isi JSON", async () => {
    vi.stubEnv("SEED_OVERWRITE", "true");
    await seedPrisma.berita.upsert(args as never);
    expect(prismaMock.berita.upsert).toHaveBeenCalledWith(args);
  });

  it("nilai SEED_OVERWRITE selain 'true' tetap create-only", () => {
    vi.stubEnv("SEED_OVERWRITE", "1");
    expect(seedUpsertArgs(args).update).toEqual({});
  });

  it("operasi lain dan method client diteruskan tanpa diubah", async () => {
    const query = { where: { judul: "x" } };
    await seedPrisma.berita.findMany(query as never);
    await seedPrisma.$disconnect();
    expect(prismaMock.berita.findMany).toHaveBeenCalledWith(query);
    expect(prismaMock.$disconnect).toHaveBeenCalledTimes(1);
  });
});

describe("jalur seed memakai seed-prisma", () => {
  const root = join(process.cwd(), "prisma");
  const files = [
    ...readdirSync(join(root, "_seeder_list"), { recursive: true, encoding: "utf8" })
      .filter((f) => f.endsWith(".ts"))
      .map((f) => join("_seeder_list", f)),
    "seed.ts",
    "seed_assets.ts",
    "safeseedUnique.ts",
  ];

  it("memindai seluruh seeder", () => {
    expect(files.length).toBeGreaterThan(90);
  });

  it("tidak ada file di jalur seed yang import @/lib/prisma langsung (upsert-nya akan menimpa editan admin)", () => {
    const pelanggar = files.filter((f) =>
      readFileSync(join(root, f), "utf8")
        .split("\n")
        .some((line) => !line.trimStart().startsWith("//") && line.includes('from "@/lib/prisma"')),
    );
    expect(pelanggar).toEqual([]);
  });
});
