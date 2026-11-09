import prisma from "./seed-prisma";
import { Client } from "minio";

const minio = new Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
  useSSL: process.env.MINIO_USE_SSL === "true",
});

const BUCKET = process.env.MINIO_BUCKET!;

function guessMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    webp: "image/webp",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    mp3: "audio/mpeg",
    mp4: "audio/mp4",
    pdf: "application/pdf",
  };
  return map[ext] ?? "application/octet-stream";
}

export default async function seedAssets() {
  console.log("📂 Seeding assets dari MinIO...");

  const stream = minio.listObjects(BUCKET, "image/", true);
  let seeded = 0;
  let updated = 0;
  let skipped = 0;

  for await (const obj of stream) {
    if (!obj.name) continue;
    const fileName = obj.name.replace("image/", "");
    if (!fileName) continue;

    const mimeType = guessMimeType(fileName);

    try {
      const existing = await prisma.fileStorage.findUnique({
        where: { name: fileName },
      });

      if (existing) {
        // Perbaiki link lama yang masih pakai Seafile URL atau format lama
        if (!existing.link?.startsWith("/api/img/")) {
          await prisma.fileStorage.update({
            where: { name: fileName },
            data: { link: `/api/img/${fileName}`, path: "image" },
          });
          console.log(`  🔄 Updated: ${fileName}`);
          updated++;
        } else {
          skipped++;
        }
        continue;
      }

      await prisma.fileStorage.create({
        data: {
          name: fileName,
          realName: fileName,
          path: "image",
          mimeType,
          category: "image",
          link: `/api/img/${fileName}`,
          isActive: true,
        },
      });
      console.log(`  ✓ Seeded: ${fileName}`);
      seeded++;
    } catch (err) {
      console.error(`  ✗ Error: ${fileName}`, err);
    }
  }

  console.log(`\n🎉 Asset seeding selesai — seeded: ${seeded}, updated: ${updated}, skipped: ${skipped}`);
}

if (import.meta.main) {
  seedAssets()
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error("gagal seed assets", err);
      prisma.$disconnect();
      process.exit(1);
    });
}
