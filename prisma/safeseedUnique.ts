/* eslint-disable @typescript-eslint/no-explicit-any */
// helpers/safeSeedUnique.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Helper generic buat seed dengan upsert aman
 */
export async function safeSeedUnique<T extends keyof PrismaClient>(
  model: T,
  where: Record<string, any>,
  data: Record<string, any>
) {
  const m = prisma[model];

  if (!m) throw new Error(`Model ${String(model)} tidak ditemukan di PrismaClient`);

  try {
    // @ts-expect-error upsert dynamic
    await m.upsert({
      where,
      update: data,
      create: { ...where, ...data },
    });
    console.log(`✅ Seeded ${String(model)} -> ${JSON.stringify(where)}`);
  } catch (err) {
    console.error(`❌ Gagal seed ${String(model)} -> ${JSON.stringify(where)}`, err);
  }
}
