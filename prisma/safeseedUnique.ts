/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "./seed-prisma";
import { PrismaClient } from "@prisma/client";

type SafeSeedOptions = {
  skipUpdate?: boolean;
  silent?: boolean; // Opsional: untuk suppress log
};

/**
 * Safely upsert data with error handling
 * @param model - Prisma model name
 * @param where - Unique identifier(s)
 * @param data - Full data object (will be used for create)
 * @param options - Additional options
 */
export async function safeSeedUnique<T extends keyof PrismaClient>(
  model: T,
  where: Record<string, any>,
  data: Record<string, any>,
  options: SafeSeedOptions = {}
) {
  const m = prisma[model] as any;
  
  if (!m) {
    throw new Error(`❌ Model ${String(model)} tidak ditemukan di Prisma Client`);
  }

  try {
    const result = await m.upsert({
      where,
      update: options.skipUpdate ? {} : data,
      create: data,
    });

    if (!options.silent) {
      console.log(`✅ Seeded ${String(model)}:`, where);
    }
    
    return result;
  } catch (err: any) {
    // Handle specific Prisma errors
    if (err.code === "P2002") {
      console.warn(`⚠️ Duplicate ${String(model)} (skipped):`, where);
      return null;
    }
    
    if (err.code === "P2003") {
      console.error(`❌ Foreign key constraint failed for ${String(model)}:`, where);
      console.error("   Missing relation:", err.meta?.field_name);
      throw err;
    }
    
    if (err.code === "P2025") {
      console.error(`❌ Record not found for ${String(model)}:`, where);
      throw err;
    }

    // Log unexpected errors with full details
    console.error(`❌ Failed to seed ${String(model)}:`, where);
    console.error("   Error:", err.message);
    console.error("   Code:", err.code);
    
    throw err;
  }
}



//ini yang bener pertama

// /* eslint-disable @typescript-eslint/no-explicit-any */
// import prisma from "@/lib/prisma";
// import { PrismaClient } from "@prisma/client";

// type SafeSeedOptions = {
//   skipUpdate?: boolean;
// };

// // prisma/safeseedUnique.ts
// export async function safeSeedUnique<T extends keyof PrismaClient>(
//   model: T,
//   where: Record<string, any>,
//   data: Record<string, any>,
//   options: SafeSeedOptions = {}
// ) {
//   const m = prisma[model] as any;
//   if (!m) throw new Error(`Model ${String(model)} tidak ditemukan`);

//   try {
//     // Pastikan `where` berisi field yang benar-benar unique (misal: `id`)
//     const result = await m.upsert({
//       where,
//       update: options.skipUpdate ? {} : data,
//       create: data, // ✅ Jangan duplikasi `where` ke `create`
//     });
//     console.log(`✅ Seed ${String(model)}:`, where);
//     return result;
//   } catch (err) {
//     console.error(`❌ Gagal seed ${String(model)}:`, where, err);
//     throw err; // ✅ Rethrow agar seeding berhenti jika kritis
//   }
// }

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
