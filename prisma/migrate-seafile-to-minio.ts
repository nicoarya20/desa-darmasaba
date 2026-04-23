/**
 * Script migrasi: download semua file dari Seafile public share → upload ke MinIO
 * Jalankan sekali: bun run prisma/migrate-seafile-to-minio.ts
 */
import { Client } from "minio";
import fileStorageData from "./data/file-storage.json";

const SEAFILE_BASE_URL = "https://cld-dkr-makuro-seafile.wibudev.com";
const SEAFILE_SHARE_TOKEN = "3a9a9ecb5e244f4da8ae";

const minio = new Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
  useSSL: process.env.MINIO_USE_SSL === "true",
});

const BUCKET = process.env.MINIO_BUCKET!;

function buildSeafileUrl(fileName: string): string {
  return `${SEAFILE_BASE_URL}/d/${SEAFILE_SHARE_TOKEN}/files/?p=${encodeURIComponent(fileName)}&raw=1`;
}

function guessMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    webp: "image/webp",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
  };
  return map[ext ?? ""] ?? "application/octet-stream";
}

async function migrateFile(name: string): Promise<"ok" | "skip" | "error"> {
  const objectName = `image/${name}`;

  // Cek apakah sudah ada di MinIO — skip jika sudah
  try {
    await minio.statObject(BUCKET, objectName);
    console.log(`  ⏭  sudah ada, skip: ${name}`);
    return "skip";
  } catch {
    // tidak ada, lanjut upload
  }

  const seafileUrl = buildSeafileUrl(name);

  try {
    const res = await fetch(seafileUrl);
    if (!res.ok) {
      console.error(`  ✗  gagal download (HTTP ${res.status}): ${name}`);
      return "error";
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    await minio.putObject(BUCKET, objectName, buffer, buffer.length, {
      "Content-Type": guessMimeType(name),
    });

    console.log(`  ✓  ${name} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return "ok";
  } catch (err) {
    console.error(`  ✗  error: ${name}`, err);
    return "error";
  }
}

async function main() {
  console.log(`\n🚀 Migrasi Seafile → MinIO`);
  console.log(`   Bucket  : ${BUCKET}`);
  console.log(`   Total   : ${fileStorageData.length} file\n`);

  let ok = 0, skip = 0, error = 0;

  for (const item of fileStorageData) {
    const result = await migrateFile(item.name);
    if (result === "ok") ok++;
    else if (result === "skip") skip++;
    else error++;
  }

  console.log(`\n📊 Hasil:`);
  console.log(`   ✓ Berhasil : ${ok}`);
  console.log(`   ⏭ Dilewati : ${skip}`);
  console.log(`   ✗ Gagal    : ${error}`);

  if (error > 0) {
    console.log(`\n⚠️  Ada ${error} file yang gagal. Jalankan ulang script untuk retry.`);
    process.exit(1);
  } else {
    console.log(`\n✅ Migrasi selesai!`);
  }
}

main();
