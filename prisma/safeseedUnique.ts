/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";

type SafeSeedOptions = {
  skipUpdate?: boolean;
};

// prisma/safeseedUnique.ts
export async function safeSeedUnique<T extends keyof PrismaClient>(
  model: T,
  where: Record<string, any>,
  data: Record<string, any>,
  options: SafeSeedOptions = {}
) {
  const m = prisma[model] as any;
  if (!m) throw new Error(`Model ${String(model)} tidak ditemukan`);

  try {
    // Pastikan `where` berisi field yang benar-benar unique (misal: `id`)
    const result = await m.upsert({
      where,
      update: options.skipUpdate ? {} : data,
      create: data, // ✅ Jangan duplikasi `where` ke `create`
    });
    console.log(`✅ Seed ${String(model)}:`, where);
    return result;
  } catch (err) {
    console.error(`❌ Gagal seed ${String(model)}:`, where, err);
    throw err; // ✅ Rethrow agar seeding berhenti jika kritis
  }
}

// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// type SafeSeedOptions = {
//   skipUpdate?: boolean;
// };

// export async function safeSeedUnique<T extends keyof PrismaClient>(
//   model: T,
//   where: Record<string, any>,
//   data: Record<string, any>,
//   options: SafeSeedOptions = {}
// ) {
//   const m = prisma[model] as any;
//   if (!m) throw new Error(`Model ${String(model)} tidak ditemukan`);

//   try {
//     await m.upsert({
//       where,
//       update: options.skipUpdate ? {} : data,
//       create: { ...where, ...data },
//     });

//     console.log(`✅ Seed ${String(model)}:`, where);
//   } catch (err) {
//     console.error(`❌ Gagal seed ${String(model)}:`, where, err);
//   }
// }
