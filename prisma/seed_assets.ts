// prisma/seedAssets.ts
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import fetch from "node-fetch";
import AdmZip from "adm-zip";
import prisma from "@/lib/prisma";

const UPLOADS_DIR =
  process.env.WIBU_UPLOAD_DIR || path.join(process.cwd(), "uploads");

// --- Helper: deteksi kategori file ---
function detectCategory(filename: string): "image" | "document" | "other" {
  const ext = path.extname(filename).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return "image";
  if ([".pdf", ".doc", ".docx"].includes(ext)) return "document";
  return "other";
}

// --- Helper: recursive walk dir ---
async function walkDir(dir: string, fileList: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "__MACOSX") continue; // skip folder sampah
      await walkDir(fullPath, fileList);
    } else {
      if (entry.name.startsWith(".") || entry.name === ".DS_Store") continue; // skip file sampah
      fileList.push(fullPath);
    }
  }

  return fileList;
}

export default async function seedAssets() {
  console.log("🚀 Seeding assets...");

  // 1. Download zip
  const url =
    "https://cld-dkr-makuro-seafile.wibudev.com/f/ffd5a548a04f47939474/?dl=1";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gagal download assets: ${res.statusText}`);
  const buffer = Buffer.from(await res.arrayBuffer());

  // 2. Extract zip ke folder tmp
  const extractDir = path.join(process.cwd(), "tmp_assets");
  await fs.rm(extractDir, { recursive: true, force: true });
  await fs.mkdir(extractDir, { recursive: true });

  const zip = new AdmZip(buffer);
  zip.extractAllTo(extractDir, true);

  // 3. Cari semua file valid (recursive)
  const files = await walkDir(extractDir);

  // 4. Loop tiap file & simpan
  for (const filePath of files) {
    const entryName = path.basename(filePath);
    const category = detectCategory(entryName);

    let finalName = entryName;
    let mimeType = "application/octet-stream";
    let targetPath = "";

    if (category === "image") {
      const fileBaseName = path.parse(entryName).name;
      finalName = `${fileBaseName}.webp`;
      targetPath = path.join(UPLOADS_DIR, "images", finalName);
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await sharp(filePath).webp({ quality: 80 }).toFile(targetPath);
      mimeType = "image/webp";
    } else if (category === "document") {
      targetPath = path.join(UPLOADS_DIR, "documents", entryName);
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.copyFile(filePath, targetPath);
      mimeType = "application/pdf";
    } else {
      targetPath = path.join(UPLOADS_DIR, "other", entryName);
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.copyFile(filePath, targetPath);
    }

    // 5. Simpan ke DB
    await prisma.fileStorage.create({
      data: {
        name: finalName,
        realName: entryName,
        path: targetPath,
        mimeType,
        link: `/uploads/${category}/${finalName}`,
        category,
      },
    });

    console.log(`📂 saved: ${category}/${finalName}`);
  }

  // 6. Cleanup
  await fs.rm(extractDir, { recursive: true, force: true });

  console.log("✅ Selesai seed assets!");
}

// --- Auto run kalau dipanggil langsung ---
if (import.meta.main) {
  seedAssets()
    .catch((err) => {
      console.error("❌ Error seeding assets:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
