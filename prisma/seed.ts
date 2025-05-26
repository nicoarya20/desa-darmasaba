import prisma from "@/lib/prisma";
import categoryPengumuman from "./data/category-pengumuman.json";
import kategoriBerita from "./data/kategori-berita.json";
import caraMemperolehInformasi from "./data/list-caraMemperolehInformasi.json";
import caraMemperolehSalinanInformasi from "./data/list-caraMemperolehSalinanInformasi.json";
import jenisInformasiDiminta from "./data/list-jenisInfromasi.json";
import layanan from "./data/list-layanan.json";
import potensi from "./data/list-potensi.json";
import visiMisiPPID from "./data/ppid/visi-misi-ppid/visimisiPPID.json";
import dasarHukumPPID from "./data/ppid/dasar-hukum-ppid/dasarhukumPPID.json";
import profileDesa from "./data/desa/profile/profile_desa.json";
import profilePerbekel from "./data/desa/profile/profil_perbekel.json";
import profilePPID from "./data/ppid/profile-ppid/profilePPid.json";
import path from "path";
import fs from "fs";
import { mkdir, writeFile } from "fs/promises";
import { v4 as uuid } from "uuid";

(async () => {
  for (const l of layanan) {
    await prisma.layanan.upsert({
      where: {
        name: l.name,
      },
      update: {
        name: l.name,
      },
      create: {
        name: l.name,
      },
    });
  }

  console.log("layanan success ...");

  for (const p of potensi) {
    await prisma.potensi.upsert({
      where: {
        name: p.name,
      },
      update: {
        name: p.name,
      },
      create: {
        name: p.name,
      },
    });
  }

  console.log("potensi success ...");

  for (const k of kategoriBerita) {
    await prisma.kategoriBerita.upsert({
      where: {
        name: k.name,
      },
      update: {
        name: k.name,
      },
      create: {
        name: k.name,
      },
    });
  }

  console.log("kategori berita success ...");

  for (const c of categoryPengumuman) {
    await prisma.categoryPengumuman.upsert({
      where: {
        name: c.name,
      },
      update: {
        name: c.name,
      },
      create: {
        name: c.name,
      },
    });
  }

  console.log("category pengumuman success ...");

  for (const j of jenisInformasiDiminta) {
    await prisma.jenisInformasiDiminta.upsert({
      where: {
        name: j.name,
      },
      update: {
        name: j.name,
      },
      create: {
        name: j.name,
      },
    });
  }
  console.log("jenis informasi diminta success ...");

  for (const c of caraMemperolehInformasi) {
    await prisma.caraMemperolehInformasi.upsert({
      where: {
        name: c.name,
      },
      update: {
        name: c.name,
      },
      create: {
        name: c.name,
      },
    });
  }
  console.log("cara memperoleh informasi success ...");

  for (const c of caraMemperolehSalinanInformasi) {
    await prisma.caraMemperolehSalinanInformasi.upsert({
      where: {
        name: c.name,
      },
      update: {
        name: c.name,
      },
      create: {
        name: c.name,
      },
    });
  }
  console.log("cara memperoleh salinan informasi success ...");

  const seedProfilePPID = async () => {
    const targetDir = path.resolve("public", "uploads", "seeded-images", "profile-ppid")
  
    // Buat folder hanya jika belum ada
    if (!fs.existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true })
    }
  
    for (const c of profilePPID) {
      let finalImageUrl = c.imageUrl
  
      if (c.imageUrl.startsWith("/uploads/seeded-images/")) {
        const filename = path.basename(c.imageUrl)
        const seedImagePath = path.resolve("prisma", "seed-images", filename)
  
        const targetFilename = `${uuid()}_${filename}`
        const targetPath = path.join(targetDir, targetFilename)
  
        const buffer = fs.readFileSync(seedImagePath)
        await writeFile(targetPath, buffer)
  
        finalImageUrl = `/uploads/seeded-images/profile-ppid/${targetFilename}`
      }
  
      await prisma.profilePPID.upsert({
        where: { id: c.id },
        update: {
          name: c.name,
          biodata: c.biodata,
          riwayat: c.riwayat,
          pengalaman: c.pengalaman,
          unggulan: c.unggulan,
          imageUrl: finalImageUrl,
        },
        create: {
          id: c.id,
          name: c.name,
          biodata: c.biodata,
          riwayat: c.riwayat,
          pengalaman: c.pengalaman,
          unggulan: c.unggulan,
          imageUrl: finalImageUrl,
        },
      })
    }
  
    console.log("✅ profilePPID seeded from JSON with image copying")
  }
  
  await seedProfilePPID()

  for (const v of visiMisiPPID) {
    await prisma.visiMisiPPID.upsert({
      where: {
        id: v.id,
      },
      update: {
        misi: v.misi,
        visi: v.visi,
      },
      create: {
        id: v.id,
        misi: v.misi,
        visi: v.visi,
      },
    });
  }
  console.log("visi misi PPID success ...");

  for (const v of dasarHukumPPID) {
    await prisma.dasarHukumPPID.upsert({
      where: {
        id: v.id,
      },
      update: {
        judul: v.judul,
        content: v.content,
      },
      create: {
        id: v.id,
        judul: v.judul,
        content: v.content,
      },
    });
  }
  console.log("dasar hukum PPID success ...");

  for (const v of profileDesa) {
    await prisma.profileDesa.upsert({
      where: {
        id: v.id,
      },
      update: {
        sejarah: v.sejarah,
        visi: v.visi,
        misi: v.misi,
        lambang: v.lambang,
        maskot: v.maskot,
        profilPerbekelId: v.profilPerbekelId,
      },
      create: {
        id: v.id,
        sejarah: v.sejarah,
        visi: v.visi,
        misi: v.misi,
        lambang: v.lambang,
        maskot: v.maskot,
        profilPerbekelId: v.profilPerbekelId,
      },
    });
  }
  console.log("profile desa success ...");

  for (const v of profilePerbekel) {
    await prisma.profilPerbekel.upsert({
      where: {
        id: v.id,
      },
      update: {
        biodata: v.biodata,
        pengalaman: v.pengalaman,
        pengalamanOrganisasi: v.pengalamanOrganisasi,
        programUnggulan: v.programUnggulan,
      },
      create: {
        id: v.id,
        biodata: v.biodata,
        pengalaman: v.pengalaman,
        pengalamanOrganisasi: v.pengalamanOrganisasi,
        programUnggulan: v.programUnggulan,
      },
    });
  }
  console.log("profile perbekel success ...");
})()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });

process.on("exit", () => {
  prisma.$disconnect();
});

process.on("SIGINT", () => {
  prisma.$disconnect();
  process.exit(0);
});
