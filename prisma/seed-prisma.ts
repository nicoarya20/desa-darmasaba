import basePrisma from "@/lib/prisma";

/**
 * Prisma client khusus seeder: `upsert` jadi create-only (baris yang id-nya sudah ada tidak disentuh)
 * supaya data hasil seed yang sudah diedit admin lewat CMS tidak tertimpa saat seed dijalankan ulang.
 * Set `SEED_OVERWRITE=true` untuk sengaja menimpa dengan isi JSON.
 *
 * Proxy dipilih (bukan `$extends`) agar tipenya tetap `PrismaClient`: `safeSeedUnique` yang mengindeks
 * `prisma[model]` dan semua seeder cukup ganti import tanpa perubahan lain.
 */

/** true bila seed diminta menimpa baris yang sudah ada dengan isi JSON. */
export function isSeedOverwrite(): boolean {
  return process.env.SEED_OVERWRITE === "true";
}

/** Argumen upsert yang dipakai seeder: `update` dikosongkan kecuali mode overwrite. */
export function seedUpsertArgs<A extends { update?: unknown }>(args: A): A {
  return isSeedOverwrite() ? args : { ...args, update: {} };
}

type Delegate = { upsert: (args: { update?: unknown }) => unknown };

function isDelegate(value: unknown): value is Delegate {
  return typeof value === "object" && value !== null && typeof (value as Delegate).upsert === "function";
}

const wrappedDelegates = new Map<PropertyKey, unknown>();

function wrapDelegate(delegate: Delegate) {
  return new Proxy(delegate, {
    get(target, prop) {
      if (prop === "upsert") return (args: { update?: unknown }) => target.upsert(seedUpsertArgs(args));
      const value = Reflect.get(target, prop, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

const seedPrisma = new Proxy(basePrisma, {
  get(target, prop) {
    const value = Reflect.get(target, prop, target);
    if (isDelegate(value)) {
      if (!wrappedDelegates.has(prop)) wrappedDelegates.set(prop, wrapDelegate(value));
      return wrappedDelegates.get(prop);
    }
    return typeof value === "function" ? value.bind(target) : value;
  },
});

export default seedPrisma;
