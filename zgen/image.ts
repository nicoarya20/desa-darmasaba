/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";

// Fungsi untuk membaca direktori secara rekursif
function readDirectoryRecursive(dir: string, callback: (filePath: string) => void) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      // Jika item adalah direktori, baca secara rekursif
      readDirectoryRecursive(fullPath, callback);
    } else if (item.isFile()) {
      // Jika item adalah file, panggil callback
      callback(fullPath);
    }
  }
}

// Fungsi untuk generate object image
function generateImageObject() {
  const publicFolderPath = path.join(process.cwd(), "public"); // Path ke folder public
  const imagesFolderPath = path.join(publicFolderPath, "assets", "images"); // Path ke folder images

  // Log path untuk debugging
  console.log("Images folder path:", imagesFolderPath);

  // Objek untuk menyimpan hasil
  const images: Record<string, any> = {};

  try {
    // Baca direktori secara rekursif
    readDirectoryRecursive(imagesFolderPath, (filePath) => {
      const ext = path.extname(filePath).toLowerCase(); // Ekstensi file
      const allowedExtensions = [".png", ".jpg", ".jpeg"];
      // Filter hanya file gambar
      if (allowedExtensions.includes(ext)) {
        const relativePath = path.relative(imagesFolderPath, filePath); // Path relatif terhadap folder images
        const dirName = path.dirname(relativePath); // Nama folder induk
        const fileNameWithoutExt = path.basename(filePath, ext); // Nama file tanpa ekstensi
        const relativeUrl = `/assets/images/${relativePath.replace(/\\/g, "/")}`; // Ganti \ dengan / untuk URL

        // Jika file berada langsung di folder images, tambahkan ke root objek
        if (dirName === ".") {
          images[fileNameWithoutExt] = relativeUrl;
        } else {
          // Jika file berada di subfolder, kelompokkan berdasarkan nama folder
          if (!images[dirName]) {
            images[dirName] = {};
          }
          images[dirName][fileNameWithoutExt] = relativeUrl;
        }

        console.log(`Processed file: ${dirName}/${fileNameWithoutExt} -> ${relativeUrl}`); // Log setiap file yang diproses
      }
    });

    // Simpan hasil ke file setelah semua file diproses
    const outputPath = path.join(process.cwd(), "src", "con", "images.ts");
    const content = `const images = ${JSON.stringify(images, null, 2)};\nexport default images;`;
    fs.writeFileSync(outputPath, content);
    console.log(`File generated successfully at: ${outputPath}`);
    console.log("Generated images object:", images); // Log hasil akhir
  } catch (error) {
    console.error("Error generating image object:", error);
  }
}

// Jalankan fungsi
generateImageObject();