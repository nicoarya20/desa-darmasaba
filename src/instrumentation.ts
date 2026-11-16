// Hook start server Next.js. Memasang scheduler purge Sampah, retensi percakapan Jenna, dan penyapu sesi suara
// Jenna (runtime Node.js saja; Edge tidak punya Prisma/MinIO). Sampah: env SAMPAH_PURGE_SCHEDULER=on|off
// (default on di production). Jenna: selalu on di production, tanpa env.

/** Dipanggil Next.js sekali per proses server saat start. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startSampahScheduler } = await import("./lib/sampah/sampah-scheduler");
  startSampahScheduler({
    run: async () => {
      const { purgeSampah } = await import("./app/api/[[...slugs]]/_lib/sampah/sampah.purge");
      return purgeSampah();
    },
  });
  const { startJennaRetentionScheduler } = await import("./lib/jenna/chat/retention");
  startJennaRetentionScheduler();
  const { startJennaVoiceSweeper } = await import("./lib/jenna/voice/voice.sweeper");
  startJennaVoiceSweeper();
}
