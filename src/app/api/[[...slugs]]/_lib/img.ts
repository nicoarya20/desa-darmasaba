import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

async function img({
  name,
  UPLOAD_DIR_IMAGE,
  ROOT,
  size,
}: {
  name: string;
  UPLOAD_DIR_IMAGE: string;
  ROOT: string;
  size?: number; // Ukuran opsional (tidak ada default)
}) {
  const completeName = path.basename(name); // Nama file lengkap
  const ext = path.extname(name).toLowerCase(); // Ekstensi file dalam huruf kecil
  //   const fileNameWithoutExt = path.basename(name, ext); // Nama file tanpa ekstensi

  // Default image jika terjadi kesalahan
  const noImage = path.join(ROOT, "public/no-image.jpg");

  // Validasi ekstensi file
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
    console.warn(`Ekstensi file tidak didukung: ${ext}`);
    const buffer = await fs.readFile(noImage);
    const uint8Array = new Uint8Array(buffer);
    return new Response(new Blob([uint8Array], { type: 'image/jpeg' }), {
      headers: { "Content-Type": "image/jpeg" },
    });
  }

  try {
    // Path ke file asli
    const filePath = path.join(UPLOAD_DIR_IMAGE, completeName);

    // Periksa apakah file ada
    await fs.stat(filePath);

    // Metadata gambar asli
    const metadata = await sharp(filePath).metadata();

    // Proses resize menggunakan sharp
    const resizedImageBuffer = await sharp(filePath)
      .resize(size || metadata.width) // Gunakan size jika diberikan, jika tidak gunakan width asli
      .toBuffer();

    const uint8Array = new Uint8Array(resizedImageBuffer);
    return new Response(new Blob([uint8Array], { type: 'image/jpeg' }), {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
        "Content-Type": "image/jpeg",
      },
    });
  } catch (error) {
    console.error(`Gagal memproses file: ${name}`, error);
    // Jika file tidak ditemukan atau gagal diproses, kembalikan default image
    const buffer = await fs.readFile(noImage);
    const uint8Array = new Uint8Array(buffer);
    return new Response(new Blob([uint8Array], { type: 'image/jpeg' }), {
      headers: { "Content-Type": "image/jpeg" },
    });
  }
}

export default img;
