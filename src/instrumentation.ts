// Hook start server Next.js. Saat ini hanya memasang scheduler purge Sampah (runtime Node.js saja;
// Edge tidak punya Prisma/MinIO). Saklar: env SAMPAH_PURGE_SCHEDULER=on|off (default on di production).

/** Dipanggil Next.js sekali per proses server saat start. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startSampahScheduler } = await import("./lib/sampah/sampah-scheduler");
  startSampahScheduler({
    run: async () => {
      const { purgeSampah } = await import("./app/api/[[...slugs]]/_lib/pengaturan/sampah/sampah.bulk");
      return purgeSampah();
    },
  });
}
