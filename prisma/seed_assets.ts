/* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// // prisma/seedAssets.ts
// import prisma from "@/lib/prisma";
// import AdmZip from "adm-zip";
// import fs from "fs/promises";
// import path from "path";
// import sharp from "sharp";
// import fetchWithRetry from "./data/fetchWithRetry";

// const UPLOADS_DIR = path.resolve(process.env.WIBU_UPLOAD_DIR || "uploads");

// // --- Helper: deteksi kategori file ---
// function detectCategory(filename: string): "image" | "document" | "other" {
//   const ext = path.extname(filename).toLowerCase();
//   if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return "image";
//   if ([".pdf", ".doc", ".docx"].includes(ext)) return "document";
//   return "other";
// }

// // --- Helper: recursive walk dir ---
// async function walkDir(
//   dir: string,
//   fileList: string[] = [],
// ): Promise<string[]> {
//   const entries = await fs.readdir(dir, { withFileTypes: true });

//   for (const entry of entries) {
//     const fullPath = path.join(dir, entry.name);

//     if (entry.isDirectory()) {
//       if (entry.name === "__MACOSX") continue; // skip folder sampah
//       await walkDir(fullPath, fileList);
//     } else {
//       if (entry.name.startsWith(".") || entry.name === ".DS_Store") continue; // skip file sampah
//       fileList.push(fullPath);
//     }
//   }

//   return fileList;
// }

// export default async function seedAssets() {
//   console.log("🚀 Seeding assets...");
//   console.log("📁 Upload dir:", UPLOADS_DIR);

//   await fs.mkdir(UPLOADS_DIR, { recursive: true });

//   // 1. Download zip
//   const url =
//     "https://cld-dkr-makuro-seafile.wibudev.com/f/03be4043989e4caeb36b/?dl=1";
//   const res = await fetchWithRetry(url, 3, 20000);

//   // Validasi content-type
//   const contentType = res.headers.get("content-type");
//   if (!contentType?.includes("zip")) {
//     throw new Error(`Invalid content-type (${contentType}). Expected ZIP file`);
//   }

//   const buffer = Buffer.from(await res.arrayBuffer());

//   // Validasi ukuran file
//   if (buffer.length < 100) {
//     throw new Error("Downloaded ZIP is empty or corrupted");
//   }

//   // Validasi signature ZIP ("PK")
//   if (buffer.toString("utf8", 0, 2) !== "PK") {
//     throw new Error("Invalid ZIP signature (PK not found)");
//   }

//   // 2. Extract zip ke folder tmp
//   const extractDir = path.join(process.cwd(), "tmp_assets");
//   await fs.rm(extractDir, { recursive: true, force: true });
//   await fs.mkdir(extractDir, { recursive: true });

//   let zip: AdmZip;

//   try {
//     zip = new AdmZip(buffer);
//   } catch (err) {
//     throw new Error("Failed to parse ZIP file (corrupted or invalid)");
//   }

//   try {
//     zip.extractAllTo(extractDir, true);
//   } catch (err) {
//     throw new Error("Failed to extract ZIP contents");
//   }

//   // 3. Cari semua file valid (recursive)
//   const files = await walkDir(extractDir);

//   // 4. Loop tiap file & simpan
//   for (const filePath of files) {
//     const entryName = path.basename(filePath);
//     const category = detectCategory(entryName);

//     let finalName = entryName;
//     let mimeType = "application/octet-stream";
//     let targetPath = "";

//     if (category === "image") {
//       const fileBaseName = path.parse(entryName).name;
//       finalName = `${fileBaseName}.webp`;
//       targetPath = path.join(UPLOADS_DIR, "images", finalName);
//       await fs.mkdir(path.dirname(targetPath), { recursive: true });
//       await sharp(filePath).webp({ quality: 80 }).toFile(targetPath);
//       mimeType = "image/webp";
//     } else if (category === "document") {
//       targetPath = path.join(UPLOADS_DIR, "documents", entryName);
//       await fs.mkdir(path.dirname(targetPath), { recursive: true });
//       await fs.copyFile(filePath, targetPath);
//       mimeType = "application/pdf";
//     } else {
//       targetPath = path.join(UPLOADS_DIR, "other", entryName);
//       await fs.mkdir(path.dirname(targetPath), { recursive: true });
//       await fs.copyFile(filePath, targetPath);
//     }

//     const existing = await prisma.fileStorage.findUnique({
//       where: { name: finalName },
//     });

//     if (existing) {
//       // Restore kalau soft deleted
//       await prisma.fileStorage.update({
//         where: { name: finalName },
//         data: {
//           path: targetPath,
//           realName: entryName,
//           mimeType,
//           link: `/uploads/${category}/${finalName}`,
//           category,
//           deletedAt: null,
//           isActive: true,
//         },
//       });

//       console.log(`♻️ restored: ${category}/${finalName}`);
//     } else {
//       await prisma.fileStorage.create({
//         data: {
//           name: finalName,
//           realName: entryName,
//           path: targetPath,
//           mimeType,
//           link: `/uploads/${category}/${finalName}`,
//           category,
//         },
//       });

//       console.log(`📂 created: ${category}/${finalName}`);
//     }

//     console.log(`📂 saved: ${category}/${finalName}`);
//   }

//   // 6. Cleanup
//   await fs.rm(extractDir, { recursive: true, force: true });

//   console.log("✅ Selesai seed assets!");
//   console.log("DB URL (asset):", process.env.DATABASE_URL);
// }

// // --- Auto run kalau dipanggil langsung ---
// if (import.meta.main) {
//   seedAssets()
//     .catch((err) => {
//       console.error("❌ Error seeding assets:", err);
//       process.exit(1);
//     })
//     .finally(async () => {
//       await prisma.$disconnect();
//     });
// }

// // prisma/seedAssets.ts
// // import prisma from "@/lib/prisma";
// // import AdmZip from "adm-zip";
// // import fs from "fs/promises";
// // import path from "path";
// // import sharp from "sharp";
// // import mime from "mime-types";
// // import fetchWithRetry from "./data/fetchWithRetry";

// // /* =========================
// //  * CONFIG
// //  * ========================= */
// // const UPLOADS_DIR = path.resolve(
// //   process.env.WIBU_UPLOAD_DIR || "uploads"
// // );

// // const TMP_DIR = path.join(process.cwd(), "tmp_assets");

// // const CATEGORY_DIR: Record<FileCategory, string> = {
// //   image: "images",
// //   document: "documents",
// //   other: "other",
// // };

// // type FileCategory = "image" | "document" | "other";

// // /* =========================
// //  * HELPERS
// //  * ========================= */
// // function detectCategory(filename: string): FileCategory {
// //   const ext = path.extname(filename).toLowerCase();
// //   if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return "image";
// //   if ([".pdf", ".doc", ".docx", ".txt"].includes(ext)) return "document";
// //   return "other";
// // }

// // async function walkDir(
// //   dir: string,
// //   result: string[] = []
// // ): Promise<string[]> {
// //   const entries = await fs.readdir(dir, { withFileTypes: true });

// //   for (const entry of entries) {
// //     const fullPath = path.join(dir, entry.name);

// //     if (entry.isDirectory()) {
// //       if (entry.name === "__MACOSX") continue;
// //       await walkDir(fullPath, result);
// //     } else {
// //       if (entry.name.startsWith(".") || entry.name === ".DS_Store") continue;
// //       result.push(fullPath);
// //     }
// //   }

// //   return result;
// // }

// // async function ensureDir(dir: string) {
// //   await fs.mkdir(dir, { recursive: true });
// // }

// // /* =========================
// //  * FILE PROCESSORS
// //  * ========================= */
// // async function processImage(filePath: string, entryName: string) {
// //   const baseName = path.parse(entryName).name;
// //   const finalName = `${baseName}.webp`;
// //   const targetDir = path.join(UPLOADS_DIR, CATEGORY_DIR.image);
// //   const targetPath = path.join(targetDir, finalName);

// //   await ensureDir(targetDir);
// //   await sharp(filePath).webp({ quality: 80 }).toFile(targetPath);

// //   return {
// //     finalName,
// //     targetPath,
// //     mimeType: "image/webp",
// //   };
// // }

// // async function processNonImage(
// //   filePath: string,
// //   entryName: string,
// //   category: FileCategory
// // ) {
// //   const targetDir = path.join(UPLOADS_DIR, CATEGORY_DIR[category]);
// //   const targetPath = path.join(targetDir, entryName);

// //   await ensureDir(targetDir);
// //   await fs.copyFile(filePath, targetPath);

// //   return {
// //     finalName: entryName,
// //     targetPath,
// //     mimeType: mime.lookup(entryName) || "application/octet-stream",
// //   };
// // }

// // /* =========================
// //  * MAIN
// //  * ========================= */
// // export default async function seedAssets() {
// //   console.log("🚀 Seeding assets...");
// //   console.log("📁 Upload dir:", UPLOADS_DIR);

// //   await ensureDir(UPLOADS_DIR);

// //   /* ===== Download ZIP ===== */
// //   const url =
// //     "https://cld-dkr-makuro-seafile.wibudev.com/f/e13d5429785640c098ae/?dl=1";
// //   const res = await fetchWithRetry(url, 3, 20000);

// //   if (!res.headers.get("content-type")?.includes("zip")) {
// //     throw new Error("Invalid ZIP content-type");
// //   }

// //   const buffer = Buffer.from(await res.arrayBuffer());
// //   if (buffer.length < 100 || buffer.toString("utf8", 0, 2) !== "PK") {
// //     throw new Error("Corrupted ZIP file");
// //   }

// //   /* ===== Extract ===== */
// //   await fs.rm(TMP_DIR, { recursive: true, force: true });
// //   await ensureDir(TMP_DIR);

// //   const zip = new AdmZip(buffer);
// //   zip.extractAllTo(TMP_DIR, true);

// //   /* ===== Process Files ===== */
// //   const files = await walkDir(TMP_DIR);

// //   for (const filePath of files) {
// //     const entryName = path.basename(filePath);
// //     const category = detectCategory(entryName);

// //     let result;

// //     if (category === "image") {
// //       result = await processImage(filePath, entryName);
// //     } else {
// //       result = await processNonImage(filePath, entryName, category);
// //     }

// //     const { finalName, targetPath, mimeType } = result;

// //     const existing = await prisma.fileStorage.findUnique({
// //       where: { name: finalName },
// //     });

// //     const data = {
// //       name: finalName,
// //       realName: entryName,
// //       path: targetPath,
// //       mimeType,
// //       link: `/uploads/${CATEGORY_DIR[category]}/${finalName}`,
// //       category,
// //       deletedAt: null,
// //       isActive: true,
// //     };

// //     if (existing) {
// //       await prisma.fileStorage.update({
// //         where: { name: finalName },
// //         data,
// //       });
// //       console.log(`♻️ restored: ${category}/${finalName}`);
// //     } else {
// //       await prisma.fileStorage.create({ data });
// //       console.log(`📂 created: ${category}/${finalName}`);
// //     }
// //   }

// //   /* ===== Cleanup ===== */
// //   await fs.rm(TMP_DIR, { recursive: true, force: true });

// //   console.log("✅ Selesai seed assets!");
// // }

// // /* ===== Auto Run ===== */
// // if (import.meta.main) {
// //   seedAssets()
// //     .catch((err) => {
// //       console.error("❌ Error seeding assets:", err);
// //       process.exit(1);
// //     })
// //     .finally(async () => {
// //       await prisma.$disconnect();
// //     });
// // }

import prisma from "@/lib/prisma";
import AdmZip from "adm-zip";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import fetchWithRetry from "./data/fetchWithRetry";
import { constants } from "fs";

// ✅ Gunakan env variable dengan fallback
const UPLOADS_DIR = path.join(process.cwd(), process.env.WIBU_UPLOAD_DIR || "uploads");


function detectCategory(filename: string): "image" | "document" | "other" {
  const ext = path.extname(filename).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return "image";
  if ([".pdf", ".doc", ".docx"].includes(ext)) return "document";
  return "other";
}

async function walkDir(
  dir: string,
  fileList: string[] = [],
): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__MACOSX") continue;
      await walkDir(fullPath, fileList);
    } else {
      if (entry.name.startsWith(".") || entry.name === ".DS_Store") continue;
      fileList.push(fullPath);
    }
  }
  return fileList;
}

export default async function seedAssets() {
  console.log("🚀 Seeding assets...");
  console.log("📁 Upload dir:", UPLOADS_DIR);

  try {
    await fs.access(UPLOADS_DIR, fs.constants.W_OK);
  } catch (err) {
    console.error("❌ Upload directory is not writable:", UPLOADS_DIR);
    throw new Error(
      `UPLOADS_DIR not writable: ${UPLOADS_DIR}. Check Docker volume or permissions`
    );
  }

  // ✅ Pastikan folder exist
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
 try {
  await fs.access(UPLOADS_DIR, constants.W_OK);
} catch {
  throw new Error(
    `UPLOADS_DIR not writable: ${UPLOADS_DIR}. Check Docker volume or permissions`
  );
}
  await fs.mkdir(path.join(UPLOADS_DIR, "images"), { recursive: true });
  await fs.mkdir(path.join(UPLOADS_DIR, "documents"), { recursive: true });
  await fs.mkdir(path.join(UPLOADS_DIR, "other"), { recursive: true });

  const url =
    "https://cld-dkr-makuro-seafile.wibudev.com/f/8e9e42e9f3e94c80919e/?dl=1";

  let buffer: Buffer;
  try {
    console.log("⬇️ Downloading ZIP from:", url);
    const res = await fetchWithRetry(url, 3, 20000);

    const contentType = res.headers.get("content-type");
    if (
      !contentType?.includes("zip") &&
      !contentType?.includes("octet-stream")
    ) {
      throw new Error(
        `Invalid content-type (${contentType}). Expected ZIP file`,
      );
    }

    buffer = Buffer.from(await res.arrayBuffer());

    if (buffer.length < 100) {
      throw new Error("Downloaded ZIP is empty or corrupted");
    }

    if (buffer.toString("utf8", 0, 2) !== "PK") {
      throw new Error("Invalid ZIP signature (PK not found)");
    }

    console.log(`✅ Downloaded ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
  } catch (err) {
    console.error("❌ Failed to download ZIP:", err);
    throw err;
  }

  // Extract ZIP
  const extractDir = path.join(process.cwd(), "tmp_assets");
  await fs.rm(extractDir, { recursive: true, force: true });
  await fs.mkdir(extractDir, { recursive: true });

  let zip: AdmZip;
  try {
    zip = new AdmZip(buffer);
    zip.extractAllTo(extractDir, true);
    console.log("✅ ZIP extracted successfully");
  } catch (err) {
    console.error("❌ Failed to extract ZIP:", err);
    throw err;
  }

  const files = await walkDir(extractDir);
  console.log(`📦 Found ${files.length} files to process`);

  // Process files
  for (const filePath of files) {
    const entryName = path.basename(filePath);
    const category = detectCategory(entryName);

    let finalName = entryName;
    let mimeType = "application/octet-stream";
    let targetPath = "";

    try {
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

      // ✅ Upsert ke database
      await prisma.fileStorage.upsert({
        where: { name: finalName },
        update: {
          path: path.dirname(targetPath),
          realName: entryName,
          mimeType,
          link: `/api/fileStorage/findUnique/${finalName}`,
          category,
          deletedAt: null,
          isActive: true,
        },
        create: {
          name: finalName,
          realName: entryName,
          path: path.dirname(targetPath),
          mimeType,
          link: `/api/fileStorage/findUnique/${finalName}`,
          category,
        },
      });

      console.log(`✅ Processed: ${category}/${finalName}`);
    } catch (err) {
      console.error(`❌ Failed to process ${entryName}`, err);
      throw err; // ⛔ penting
    }
  }

  // Cleanup
  await fs.rm(extractDir, { recursive: true, force: true });
  console.log("✅ Asset seeding completed!");
}

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
