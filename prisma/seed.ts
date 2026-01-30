/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import prisma from "@/lib/prisma";
import { seedVideo } from "./_seeder_list/desa/gallery/video/seed_video";
import { seedLayanan } from "./_seeder_list/desa/layanan/seed_layanan";
import { seedPenghargaan } from "./_seeder_list/desa/penghargaan/penghargaan";
import { seedPengumuman } from "./_seeder_list/desa/pengumuman/seed_pengumuman";
import { seedPotensi } from "./_seeder_list/desa/potensi/seed_potensi";
import { seedProfileDesa } from "./_seeder_list/desa/profile-desa/seed_profile_desa";
import { seedProfilePerbekel } from "./_seeder_list/desa/profile-desa/seed_profile_perbekel";
import { seedDesaAntiKorupsi } from "./_seeder_list/landing-page/desa-anti-korupsi/seed_desa_anti_korupsi";
import { seedPrestasiDesa } from "./_seeder_list/landing-page/prestasi-desa/seed_prestasi_desa";
import { seedMediaSosial } from "./_seeder_list/landing-page/profil_landing_page/seed_media_sosial";
import { seedProfileLP } from "./_seeder_list/landing-page/profil_landing_page/seed_profile_lp";
import { seedProgramInovasi } from "./_seeder_list/landing-page/profil_landing_page/seed_program_inovasi";
import { seedSDGSDesa } from "./_seeder_list/landing-page/sdgs/seed_sdgs";
import { seedDaftarInformasiPublikPpid } from "./_seeder_list/ppid/daftar-informasi-publik-ppid/seed_daftar_informasi_publik_ppid";
import { seedDasarHukumPpid } from "./_seeder_list/ppid/dasar-hukum-ppid/seed_dasar_hukum_ppid";
import { seedIkmPpid } from "./_seeder_list/ppid/ikm/seed_ikm";
import { seedPegawaiPpid } from "./_seeder_list/ppid/struktur-ppid/seed_struktur_ppid";
import { seedVisiMisiPpid } from "./_seeder_list/ppid/visi-misi-ppid/seed_visi_misi_ppid";
import dataPendidikan from "./data/pendidikan/data-pendidikan/data-pendidikan.json";
import roles from "./data/user/roles.json";
import users from "./data/user/users.json";
import { safeSeedUnique } from "./safeseedUnique";
import seedAssets from "./seed_assets";
import { seedBerita } from "./_seeder_list/desa/berita/seed_berita";
import { seedFoto } from "./_seeder_list/desa/gallery/foto/seed_foto";

(async () => {
  const totalFiles = await prisma.fileStorage.count();

  const hasImageAsset = await prisma.fileStorage.findFirst({
    where: { category: "image" },
    select: { id: true },
  });

  if (totalFiles === 0 || !hasImageAsset) {
    console.log("📂 fileStorage not ready, seeding assets...");
    await seedAssets();
  } else {
    console.log("ℹ️ fileStorage already initialized, skipping asset seed");
  }

  // // =========== FILE STORAGE ===========

  console.log("🔄 Seeding roles...");

  for (const r of roles) {
    try {
      // ✅ Destructure to remove permissions if exists
      const { permissions, ...roleData } = r as any;

      await safeSeedUnique(
        "role",
        { name: roleData.name },
        {
          id: roleData.id,
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions || {}, // ✅ Include permissions
          isActive: roleData.isActive,
        },
      );
      console.log(`✅ Seeded role -> ${roleData.name}`);
    } catch (error: any) {
      if (error.code === "P2002") {
        console.warn(`⚠️ Role already exists (skipping): ${r.name}`);
      } else {
        console.error(`❌ Failed to seed role ${r.name}:`, error.message);
      }
    }
  }
  console.log("✅ Roles seeding completed");

  // =========== USER ===========
  console.log("🔄 Seeding users...");
  for (const u of users) {
    try {
      // Verify role exists first
      const roleExists = await prisma.role.findUnique({
        where: { id: u.roleId.toString() },
        select: { id: true }, // Only select id to minimize query
      });

      if (!roleExists) {
        console.error(
          `❌ Role with id ${u.roleId} not found for user ${u.username}`,
        );
        continue;
      }

      await safeSeedUnique(
        "user",
        { nomor: u.nomor },
        {
          id: u.id,
          username: u.username,
          nomor: u.nomor,
          roleId: u.roleId.toString(),
          isActive: u.isActive,
          sessionInvalid: false,
        },
      );
      console.log(`✅ Seeded user -> ${u.username}`);
    } catch (error: any) {
      if (error.code === "P2003") {
        console.error(
          `❌ Foreign key constraint failed for user ${u.username}: Role ${u.roleId} does not exist`,
        );
      } else {
        console.error(`❌ Failed to seed user ${u.username}:`, error.message);
      }
    }
  }
  console.log("✅ Users seeding completed");
  // =========== LANDING PAGE ===========
  // =========== SUBMENU PROFILE ===========
  await seedProgramInovasi();
  await seedProfileLP();
  await seedMediaSosial();

  // // =========== SUBMENU DESA ANTI KORUPSI ===========
  await seedDesaAntiKorupsi();

  // // =========== SDGSDesa ===========
  await seedSDGSDesa();

  // // =========== APBDes ===========
  // for (const l of apbdes) {
  //   await prisma.aPBDes.upsert({
  //     where: {
  //       id: l.id,
  //     },
  //     update: {
  //       name: l.name,
  //       jumlah: l.jumlah,
  //     },
  //     create: {
  //       name: l.name,
  //       jumlah: l.jumlah,
  //     },
  //   });
  // }

  // console.log("apbdes success ...");

  // // =========== PRESTASI DESA===========
  await seedPrestasiDesa();

  // // =========== MENU PPID ===========

  // // =========== SUBMENU STRUKTUR PPID ===========
  await seedPegawaiPpid();

  // // =========== SUBMENU VISI MISI PPID ===========
  await seedVisiMisiPpid();

  // // =========== SUBMENU DASAR HUKUM PPID ===========
  await seedDasarHukumPpid();

  // // =========== SUBMENU DAFTAR INFORMASI PUBLIK PPID ===========
  await seedDaftarInformasiPublikPpid();

  // // =========== SUBMENU INDEKS KEPUASAN MASYARAKAT ===========
  await seedIkmPpid();

  // // =========== MENU DESA ===========
  // // =========== SUBMENU PROFILE ===========
  await seedProfileDesa();
  await seedProfilePerbekel();

  // // =========== SUBMENU POTENSI DESA ===========
  await seedPotensi();

  // // =========== SUBMENU BERITA ===========
  await seedBerita();

  // // ================== SUBMENU PENGUMUMAN ========================
  await seedPengumuman();

  // // ================== SUBMENU GALLERY ========================
  await seedVideo();
  await seedFoto();

  // // =========== SUBMENU LAYANAN ===========
  await seedLayanan();

  // // =========== PENGHARGAAN ===========
  await seedPenghargaan();

  // // ====================== MENU KESEHATAN ========================
  // // ==================== SUBMENU POSYANDU =========================
  // console.log("🔄 Seeding Posyandu...");
  // for (const p of posyandu) {
  //   const existing = await prisma.posyandu.findUnique({
  //     where: { id: p.id },
  //     select: { imageId: true },
  //   });

  //   let imageId = existing?.imageId; // Pertahankan existing

  //   // Kalau belum ada imageId, cari berdasarkan name/realName
  //   if (!imageId && p.imageId) {
  //     // ✅ Cari langsung berdasarkan ID yang ada di p.imageId
  //     const fileRecord = await prisma.fileStorage.findUnique({
  //       where: { id: p.imageId },
  //       select: { id: true, name: true },
  //     });

  //     if (fileRecord) {
  //       imageId = fileRecord.id;
  //       console.log(
  //         `✅ Found file by ID: ${fileRecord.name} (${fileRecord.id})`,
  //       );
  //     } else {
  //       console.warn(`⚠️ File with ID ${p.imageId} not found for ${p.name}`);
  //       imageId = null;
  //     }
  //   }

  //   await prisma.posyandu.upsert({
  //     where: { id: p.id },
  //     update: {
  //       name: p.name,
  //       nomor: p.nomor,
  //       deskripsi: p.deskripsi,
  //       jadwalPelayanan: p.jadwalPelayanan,
  //       imageId,
  //     },
  //     create: {
  //       id: p.id,
  //       name: p.name,
  //       nomor: p.nomor,
  //       deskripsi: p.deskripsi,
  //       jadwalPelayanan: p.jadwalPelayanan,
  //       imageId,
  //     },
  //   });
  // }
  // console.log("posyandu success ...");

  // // ==================== SUBMENU PUSKESMAS =========================
  // console.log("🔄 Seeding Kontak Puskesmas...");
  // for (const k of kontakPuskesmas) {
  //   await prisma.kontakPuskesmas.upsert({
  //     where: {
  //       id: k.id,
  //     },
  //     update: {
  //       kontakPuskesmas: k.kontakPuskesmas,
  //       email: k.email,
  //       facebook: k.facebook,
  //       kontakUGD: k.kontakUGD,
  //     },
  //     create: {
  //       id: k.id,
  //       kontakPuskesmas: k.kontakPuskesmas,
  //       email: k.email,
  //       facebook: k.facebook,
  //       kontakUGD: k.kontakUGD,
  //     },
  //   });
  // }
  // console.log("kontak puskesmas success ...");

  // console.log("🔄 Seeding Jam Puskesmas...");
  // for (const k of jamPuskesmas) {
  //   await prisma.jamOperasional.upsert({
  //     where: {
  //       id: k.id,
  //     },
  //     update: {
  //       workDays: k.workDays,
  //       weekDays: k.weekDays,
  //       holiday: k.holiday,
  //     },
  //     create: {
  //       id: k.id,
  //       workDays: k.workDays,
  //       weekDays: k.weekDays,
  //       holiday: k.holiday,
  //     },
  //   });
  // }
  // console.log("jam puskesmas success ...");

  // console.log("🔄 Seeding Puskesmas...");
  // for (const p of puskesmas) {
  //   const existing = await prisma.puskesmas.findUnique({
  //     where: { id: p.id },
  //     select: { imageId: true },
  //   });

  //   let imageId = existing?.imageId; // Pertahankan existing

  //   // Kalau belum ada imageId, cari berdasarkan name/realName
  //   if (!imageId && p.imageId) {
  //     // ✅ Cari langsung berdasarkan ID yang ada di p.imageId
  //     const fileRecord = await prisma.fileStorage.findUnique({
  //       where: { id: p.imageId },
  //       select: { id: true, name: true },
  //     });

  //     if (fileRecord) {
  //       imageId = fileRecord.id;
  //       console.log(
  //         `✅ Found file by ID: ${fileRecord.name} (${fileRecord.id})`,
  //       );
  //     } else {
  //       console.warn(`⚠️ File with ID ${p.imageId} not found for ${p.name}`);
  //       imageId = null;
  //     }
  //   }

  //   await prisma.puskesmas.upsert({
  //     where: { id: p.id },
  //     update: {
  //       name: p.name,
  //       alamat: p.alamat,
  //       jamId: p.jamId,
  //       imageId,
  //       kontakId: p.kontakId,
  //     },
  //     create: {
  //       id: p.id,
  //       name: p.name,
  //       alamat: p.alamat,
  //       jamId: p.jamId,
  //       imageId,
  //       kontakId: p.kontakId,
  //     },
  //   });
  // }
  // console.log("puskesmas success ...");

  // // ==================== SUBMENU PROGRAM KESEHATAN =========================
  // console.log("🔄 Seeding Program Kesehatan...");
  // for (const p of programKesehatan) {
  //   const existing = await prisma.programKesehatan.findUnique({
  //     where: { id: p.id },
  //     select: { imageId: true },
  //   });

  //   let imageId = existing?.imageId; // Pertahankan existing

  //   // Kalau belum ada imageId, cari berdasarkan name/realName
  //   if (!imageId && p.imageId) {
  //     // ✅ Cari langsung berdasarkan ID yang ada di p.imageId
  //     const fileRecord = await prisma.fileStorage.findUnique({
  //       where: { id: p.imageId },
  //       select: { id: true, name: true },
  //     });

  //     if (fileRecord) {
  //       imageId = fileRecord.id;
  //       console.log(
  //         `✅ Found file by ID: ${fileRecord.name} (${fileRecord.id})`,
  //       );
  //     } else {
  //       console.warn(`⚠️ File with ID ${p.imageId} not found for ${p.name}`);
  //       imageId = null;
  //     }
  //   }

  //   await prisma.programKesehatan.upsert({
  //     where: { id: p.id },
  //     update: {
  //       name: p.name,
  //       deskripsiSingkat: p.deskripsiSingkat,
  //       deskripsi: p.deskripsi,
  //       imageId,
  //     },
  //     create: {
  //       id: p.id,
  //       name: p.name,
  //       deskripsiSingkat: p.deskripsiSingkat,
  //       deskripsi: p.deskripsi,
  //       imageId,
  //     },
  //   });
  // }
  // console.log("program kesehatan success ...");

  // // ==================== SUBMENU PENANGANAN DARURAT =========================
  // console.log("🔄 Seeding Penanganan Darurat...");
  // for (const p of penangananDarurat) {
  //   const existing = await prisma.penangananDarurat.findUnique({
  //     where: { id: p.id },
  //     select: { imageId: true },
  //   });

  //   let imageId = existing?.imageId; // Pertahankan existing

  //   // Kalau belum ada imageId, cari berdasarkan name/realName
  //   if (!imageId && p.imageId) {
  //     // ✅ Cari langsung berdasarkan ID yang ada di p.imageId
  //     const fileRecord = await prisma.fileStorage.findUnique({
  //       where: { id: p.imageId },
  //       select: { id: true, name: true },
  //     });

  //     if (fileRecord) {
  //       imageId = fileRecord.id;
  //       console.log(
  //         `✅ Found file by ID: ${fileRecord.name} (${fileRecord.id})`,
  //       );
  //     } else {
  //       console.warn(`⚠️ File with ID ${p.imageId} not found for ${p.name}`);
  //       imageId = null;
  //     }
  //   }

  //   await prisma.penangananDarurat.upsert({
  //     where: { id: p.id },
  //     update: {
  //       name: p.name,
  //       deskripsi: p.deskripsi,
  //       imageId,
  //     },
  //     create: {
  //       id: p.id,
  //       name: p.name,
  //       deskripsi: p.deskripsi,
  //       imageId,
  //     },
  //   });
  // }
  // console.log("penanganan darurat success ...");

  // // ==================== SUBMENU KONTAK DARURAT =========================
  // console.log("🔄 Seeding Kontak Darurat...");
  // for (const p of kontakDarurat) {
  //   const existing = await prisma.kontakDarurat.findUnique({
  //     where: { id: p.id },
  //     select: { imageId: true },
  //   });

  //   let imageId = existing?.imageId; // Pertahankan existing

  //   // Kalau belum ada imageId, cari berdasarkan name/realName
  //   if (!imageId && p.imageId) {
  //     // ✅ Cari langsung berdasarkan ID yang ada di p.imageId
  //     const fileRecord = await prisma.fileStorage.findUnique({
  //       where: { id: p.imageId },
  //       select: { id: true, name: true },
  //     });

  //     if (fileRecord) {
  //       imageId = fileRecord.id;
  //       console.log(
  //         `✅ Found file by ID: ${fileRecord.name} (${fileRecord.id})`,
  //       );
  //     } else {
  //       console.warn(`⚠️ File with ID ${p.imageId} not found for ${p.name}`);
  //       imageId = null;
  //     }
  //   }

  //   await prisma.kontakDarurat.upsert({
  //     where: { id: p.id },
  //     update: {
  //       name: p.name,
  //       deskripsi: p.deskripsi,
  //       whatsapp: p.whatsapp,
  //       imageId,
  //     },
  //     create: {
  //       id: p.id,
  //       name: p.name,
  //       deskripsi: p.deskripsi,
  //       whatsapp: p.whatsapp,
  //       imageId,
  //     },
  //   });
  // }
  // console.log("kontak darurat success ...");

  // // ==================== SUBMENU INFO WABAH PENYAKIT =========================
  // console.log("🔄 Seeding Info Wabah Penyakit...");
  // for (const p of infoWabahPenyakit) {
  //   const existing = await prisma.infoWabahPenyakit.findUnique({
  //     where: { id: p.id },
  //     select: { imageId: true },
  //   });

  //   let imageId = existing?.imageId; // Pertahankan existing

  //   // Kalau belum ada imageId, cari berdasarkan name/realName
  //   if (!imageId && p.imageId) {
  //     // ✅ Cari langsung berdasarkan ID yang ada di p.imageId
  //     const fileRecord = await prisma.fileStorage.findUnique({
  //       where: { id: p.imageId },
  //       select: { id: true, name: true },
  //     });

  //     if (fileRecord) {
  //       imageId = fileRecord.id;
  //       console.log(
  //         `✅ Found file by ID: ${fileRecord.name} (${fileRecord.id})`,
  //       );
  //     } else {
  //       console.warn(`⚠️ File with ID ${p.imageId} not found for ${p.name}`);
  //       imageId = null;
  //     }
  //   }

  //   await prisma.infoWabahPenyakit.upsert({
  //     where: { id: p.id },
  //     update: {
  //       name: p.name,
  //       deskripsiSingkat: p.deskripsiSingkat,
  //       deskripsiLengkap: p.deskripsiLengkap,
  //       imageId,
  //     },
  //     create: {
  //       id: p.id,
  //       name: p.name,
  //       deskripsiSingkat: p.deskripsiSingkat,
  //       deskripsiLengkap: p.deskripsiLengkap,
  //       imageId,
  //     },
  //   });
  // }
  // console.log("info wabah penyakit success ...");

  // // ====================== MENU KEAMANAN ========================
  // // ==================== SUBMENU KEAMANAN LINGKUNGAN ============
  // console.log("🔄 Seeding Keamanan Lingkungan...");
  // for (const k of keamananLingkungan) {
  //   const existing = await prisma.keamananLingkungan.findUnique({
  //     where: { id: k.id },
  //     select: { imageId: true },
  //   });

  //   let imageId = existing?.imageId; // Pertahankan existing

  //   // Kalau belum ada imageId, cari berdasarkan name/realName
  //   if (!imageId && k.imageId) {
  //     // ✅ Cari langsung berdasarkan ID yang ada di p.imageId
  //     const fileRecord = await prisma.fileStorage.findUnique({
  //       where: { id: k.imageId },
  //       select: { id: true, name: true },
  //     });

  //     if (fileRecord) {
  //       imageId = fileRecord.id;
  //       console.log(
  //         `✅ Found file by ID: ${fileRecord.name} (${fileRecord.id})`,
  //       );
  //     } else {
  //       console.warn(`⚠️ File with ID ${k.imageId} not found for ${k.name}`);
  //       imageId = null;
  //     }
  //   }

  //   await prisma.keamananLingkungan.upsert({
  //     where: { id: k.id },
  //     update: {
  //       name: k.name,
  //       deskripsi: k.deskripsi,
  //       imageId,
  //     },
  //     create: {
  //       id: k.id,
  //       name: k.name,
  //       deskripsi: k.deskripsi,
  //       imageId,
  //     },
  //   });
  // }
  // console.log("info wabah penyakit success ...");

  // // ==================== SUBMENU POLSEK TERDEKAT ================
  // console.log("🔄 Seeding Layanan Polsek...");
  // for (const k of layananPolsek) {
  //   await prisma.layananPolsek.upsert({
  //     where: {
  //       id: k.id,
  //     },
  //     update: {
  //       nama: k.nama,
  //     },
  //     create: {
  //       id: k.id,
  //       nama: k.nama,
  //     },
  //   });
  // }

  // console.log("layanan polsek success ...");

  // console.log("🔄 Seeding Polsek Terdekat...");
  // for (const k of polsekTerdekat) {
  //   await prisma.polsekTerdekat.upsert({
  //     where: {
  //       id: k.id,
  //     },
  //     update: {
  //       nama: k.nama,
  //       jarakKeDesa: k.jarakKeDesa,
  //       alamat: k.alamat,
  //       nomorTelepon: k.nomorTelepon,
  //       jamOperasional: k.jamOperasional,
  //       embedMapUrl: k.embedMapUrl,
  //       namaTempatMaps: k.namaTempatMaps,
  //       alamatMaps: k.alamatMaps,
  //       linkPetunjukArah: k.linkPetunjukArah,
  //       layananPolsekId: k.layananPolsekId,
  //     },
  //     create: {
  //       id: k.id,
  //       nama: k.nama,
  //       jarakKeDesa: k.jarakKeDesa,
  //       alamat: k.alamat,
  //       nomorTelepon: k.nomorTelepon,
  //       jamOperasional: k.jamOperasional,
  //       embedMapUrl: k.embedMapUrl,
  //       namaTempatMaps: k.namaTempatMaps,
  //       alamatMaps: k.alamatMaps,
  //       linkPetunjukArah: k.linkPetunjukArah,
  //       layananPolsekId: k.layananPolsekId,
  //     },
  //   });
  // }

  // console.log("polsek terdekat success ...");

  // console.log("🔄 Seeding Layanan To Polsek...");
  // for (const k of layananToPolsek) {
  //   await prisma.layananToPolsek.upsert({
  //     where: {
  //       id: k.id,
  //     },
  //     update: {
  //       layananId: k.layananId,
  //       polsekTerdekatId: k.polsekTerdekatId,
  //     },
  //     create: {
  //       id: k.id,
  //       layananId: k.layananId,
  //       polsekTerdekatId: k.polsekTerdekatId,
  //     },
  //   });
  // }

  // console.log("layanan to polsek success ...");

  // // ==================== SUBMENU KONTAK DARURAT =================

  // console.log("🔄 Seeding Kontak Item...");
  // for (const e of kontakItem) {
  //   await prisma.kontakItem.upsert({
  //     where: {
  //       id: e.id,
  //     },
  //     update: {
  //       nama: e.nama,
  //       icon: e.icon,
  //       nomorTelepon: e.nomorTelepon,
  //     },
  //     create: {
  //       id: e.id, // ✅ WAJIB
  //       nama: e.nama,
  //       icon: e.icon,
  //       nomorTelepon: e.nomorTelepon,
  //     },
  //   });
  // }
  // console.log("✅ Kontak Item seeded successfully");

  // console.log("🔄 Seeding Kontak Darurat Keamanan...");
  // for (const d of kontakDaruratKeamanan) {
  //   await prisma.kontakDaruratKeamanan.upsert({
  //     where: {
  //       id: d.id,
  //     },
  //     update: {
  //       nama: d.nama,
  //       icon: d.icon,
  //       kategoriId: d.kategoriId,
  //     },
  //     create: {
  //       id: d.id,
  //       nama: d.nama,
  //       icon: d.icon,
  //       kategoriId: d.kategoriId,
  //     },
  //   });
  // }

  // console.log("✅ Kontak Darurat Keamanan seeded successfully");

  // console.log("🔄 Seeding Kontak Darurat To Item...");
  // for (const f of kontakDaruratToItem) {
  //   // ✅ Validasi foreign keys
  //   const kontakDaruratExists = await prisma.kontakDaruratKeamanan.findUnique({
  //     where: { id: f.kontakDaruratId },
  //   });

  //   const kontakItemExists = await prisma.kontakItem.findUnique({
  //     where: { id: f.kontakItemId },
  //   });

  //   if (!kontakDaruratExists) {
  //     console.warn(
  //       `⚠️ KontakDarurat ${f.kontakDaruratId} not found, skipping...`,
  //     );
  //     continue;
  //   }

  //   if (!kontakItemExists) {
  //     console.warn(`⚠️ KontakItem ${f.kontakItemId} not found, skipping...`);
  //     continue;
  //   }

  //   await prisma.kontakDaruratToItem.upsert({
  //     where: { id: f.id },
  //     update: {
  //       kontakDaruratId: f.kontakDaruratId,
  //       kontakItemId: f.kontakItemId,
  //     },
  //     create: {
  //       id: f.id,
  //       kontakDaruratId: f.kontakDaruratId,
  //       kontakItemId: f.kontakItemId,
  //     },
  //   });
  // }
  // console.log("✅ Kontak Darurat To Item seeded successfully");

  // // ==================== SUBMENU PENCEGAHAN KRIMINALITAS ========
  // console.log("🔄 Seeding Pencegahan Kriminalitas...");
  // for (const d of pencegahanKriminalitas) {
  //   await prisma.pencegahanKriminalitas.upsert({
  //     where: {
  //       id: d.id,
  //     },
  //     update: {
  //       judul: d.judul,
  //       deskripsi: d.deskripsi,
  //       deskripsiSingkat: d.deskripsiSingkat,
  //       linkVideo: d.linkVideo,
  //     },
  //     create: {
  //       id: d.id,
  //       judul: d.judul,
  //       deskripsi: d.deskripsi,
  //       deskripsiSingkat: d.deskripsiSingkat,
  //       linkVideo: d.linkVideo,
  //     },
  //   });
  // }

  // console.log("✅ Pencegahan Kriminalitas seeded successfully");
  // // ==================== SUBMENU LAPORAN PUBLIK =================
  // console.log("🔄 Seeding Laporan Publik...");
  // for (const l of laporanPublik) {
  //   await prisma.laporanPublik.upsert({
  //     where: {
  //       id: l.id,
  //     },
  //     update: {
  //       judul: l.judul,
  //       lokasi: l.lokasi,
  //       tanggalWaktu: l.tanggalWaktu,
  //       kronologi: l.kronologi,
  //     },
  //     create: {
  //       id: l.id,
  //       judul: l.judul,
  //       lokasi: l.lokasi,
  //       tanggalWaktu: l.tanggalWaktu,
  //       kronologi: l.kronologi,
  //     },
  //   });
  // }

  // console.log("laporan publik success ...");

  // console.log("🔄 Seeding Penanganan Laporan...");
  // for (const l of penangananLaporan) {
  //   await prisma.penangananLaporanPublik.upsert({
  //     where: {
  //       id: l.id,
  //     },
  //     update: {
  //       deskripsi: l.deskripsi,
  //       laporanId: l.laporanId,
  //     },
  //     create: {
  //       id: l.id,
  //       deskripsi: l.deskripsi,
  //       laporanId: l.laporanId,
  //     },
  //   });
  // }

  // console.log("penanganan laporan success ...");

  // // ==================== SUBMENU TIPS KEAMANAN ==================
  // console.log("🔄 Seeding Tips Keamanan...");
  // for (const t of tipsKeamanan) {
  //   await prisma.menuTipsKeamanan.upsert({
  //     where: {
  //       id: t.id,
  //     },
  //     update: {
  //       judul: t.judul,
  //       deskripsi: t.deskripsi,
  //       imageId: t.imageId,
  //     },
  //     create: {
  //       judul: t.judul,
  //       deskripsi: t.deskripsi,
  //       imageId: t.imageId,
  //     },
  //   });
  // }

  // console.log("✅ Tips Keamanan seeded successfully");

  // // ====================== MENU EKONOMI ========================
  // // ==================== SUBMENU PASAR DESA ====================
  // console.log("🔄 Seeding Kategori Produk...");
  // for (const k of kategoriProduk) {
  //   await prisma.kategoriProduk.upsert({
  //     where: {
  //       id: k.id,
  //     },
  //     update: {
  //       nama: k.nama,
  //     },
  //     create: {
  //       id: k.id,
  //       nama: k.nama,
  //     },
  //   });
  // }
  // console.log("✅ Kategori Produk seeded successfully");

  // console.log("🔄 Seeding Pasar Desa...");
  // for (const p of pasarDesa) {
  //   await prisma.pasarDesa.upsert({
  //     where: {
  //       id: p.id,
  //     },
  //     update: {
  //       nama: p.nama,
  //       imageId: p.imageId,
  //       harga: p.harga,
  //       rating: p.rating,
  //       alamatUsaha: p.alamatUsaha,
  //       kontak: p.kontak,
  //       deskripsi: p.deskripsi,
  //       kategoriProdukId: p.kategoriProdukId,
  //     },
  //     create: {
  //       id: p.id,
  //       nama: p.nama,
  //       imageId: p.imageId,
  //       harga: p.harga,
  //       rating: p.rating,
  //       alamatUsaha: p.alamatUsaha,
  //       kontak: p.kontak,
  //       deskripsi: p.deskripsi,
  //       kategoriProdukId: p.kategoriProdukId,
  //     },
  //   });
  // }
  // console.log("✅ Pasar Desa seeded successfully");

  // console.log("🔄 Seeding Kategori To Pasar...");
  // for (const p of kategoriToPasar) {
  //   await prisma.kategoriToPasar.upsert({
  //     where: {
  //       id: p.id,
  //     },
  //     update: {
  //       kategoriId: p.kategoriId,
  //       pasarDesaId: p.pasarDesaId,
  //     },
  //     create: {
  //       id: p.id,
  //       kategoriId: p.kategoriId,
  //       pasarDesaId: p.pasarDesaId,
  //     },
  //   });
  // }

  // // ==================== SUBMENU LOWONGAN KERJA LOKAL ==========
  // console.log("🔄 Seeding Lowongan Kerja Lokal...");
  // for (const k of lowonganKerjaLokal) {
  //   await prisma.lowonganPekerjaan.upsert({
  //     where: {
  //       id: k.id,
  //     },
  //     update: {
  //       posisi: k.posisi,
  //       namaPerusahaan: k.namaPerusahaan,
  //       lokasi: k.lokasi,
  //       tipePekerjaan: k.tipePekerjaan,
  //       gaji: k.gaji,
  //       deskripsi: k.deskripsi,
  //       kualifikasi: k.kualifikasi,
  //       notelp: k.notelp,
  //     },
  //     create: {
  //       id: k.id,
  //       posisi: k.posisi,
  //       namaPerusahaan: k.namaPerusahaan,
  //       lokasi: k.lokasi,
  //       tipePekerjaan: k.tipePekerjaan,
  //       gaji: k.gaji,
  //       deskripsi: k.deskripsi,
  //       kualifikasi: k.kualifikasi,
  //       notelp: k.notelp,
  //     },
  //   });
  // }
  // console.log("✅ Lowongan Kerja Lokal seeded successfully");

  // // ==================== SUBMENU STRUKTUR ORGANISASI DAN SK PENGURUS BUMDES ==========
  // const sortedPosisiBumdes = flattenedPosisiBumdes.sort(
  //   (a, b) => a.hierarki - b.hierarki,
  // );

  // for (const p of sortedPosisiBumdes) {
  //   console.log(`Seeding: ${p.nama} (id: ${p.id}, parent: ${p.parentId})`);

  //   if (p.parentId) {
  //     const parentExists = flattenedPosisi.some((pos) => pos.id === p.parentId);
  //     if (!parentExists) {
  //       console.warn(
  //         `⚠️ Parent tidak ditemukan: ${p.parentId} untuk ${p.nama}`,
  //       );
  //       continue;
  //     }
  //   }

  //   await prisma.posisiOrganisasiBumDes.upsert({
  //     where: { id: p.id },
  //     update: p,
  //     create: p,
  //   });
  // }
  // console.log("posisi organisasi berhasil");

  // for (const p of pegawai) {
  //   await prisma.pegawaiBumDes.upsert({
  //     where: {
  //       id: p.id,
  //     },
  //     update: {
  //       namaLengkap: p.namaLengkap,
  //       gelarAkademik: p.gelarAkademik,
  //       tanggalMasuk: new Date(p.tanggalMasuk),
  //       email: p.email,
  //       telepon: p.telepon,
  //       alamat: p.alamat,
  //       posisiId: p.posisiId,
  //       isActive: p.isActive,
  //     },
  //     create: {
  //       id: p.id,
  //       namaLengkap: p.namaLengkap,
  //       gelarAkademik: p.gelarAkademik,
  //       tanggalMasuk: new Date(p.tanggalMasuk),
  //       email: p.email,
  //       telepon: p.telepon,
  //       alamat: p.alamat,
  //       posisiId: p.posisiId,
  //       isActive: p.isActive,
  //     },
  //   });
  // }
  // console.log("pegawai success ...");

  // // ==================== SUBMENU PENDAPATAN ASLI DESA ==========

  // // ==================== SUBMENU JUMLAH PENGANGGURAN ==========
  // for (const d of detailDataPengangguran) {
  //   await prisma.detailDataPengangguran.upsert({
  //     where: {
  //       month_year: { month: d.month, year: d.year },
  //     },
  //     update: {
  //       totalUnemployment: d.totalUnemployment,
  //       educatedUnemployment: d.educatedUnemployment,
  //       uneducatedUnemployment: d.uneducatedUnemployment,
  //       percentageChange: d.percentageChange,
  //     },
  //     create: {
  //       month: d.month,
  //       year: d.year,
  //       totalUnemployment: d.totalUnemployment,
  //       educatedUnemployment: d.educatedUnemployment,
  //       uneducatedUnemployment: d.uneducatedUnemployment,
  //       percentageChange: d.percentageChange,
  //     },
  //   });
  // }
  // console.log("📊 detailDataPengangguran success ...");

  // // ==================== SUBMENU PENDUDUK USIA KERJA ==========
  // for (const p of grafikMenganggurBerdasarkanUsia) {
  //   await prisma.grafikMenganggurBerdasarkanUsia.upsert({
  //     where: {
  //       id: p.id,
  //     },
  //     update: {
  //       usia18_25: p.usia18_25,
  //       usia26_35: p.usia26_35,
  //       usia36_45: p.usia36_45,
  //       usia46_keatas: p.usia46_keatas,
  //     },
  //     create: {
  //       id: p.id,
  //       usia18_25: p.usia18_25,
  //       usia26_35: p.usia26_35,
  //       usia36_45: p.usia36_45,
  //       usia46_keatas: p.usia46_keatas,
  //     },
  //   });
  // }
  // console.log("📊 grafikMenganggurBerdasarkanUsia success ...");

  // for (const p of grafikMenganggurBerdasarkanPendidikan) {
  //   await prisma.grafikMenganggurBerdasarkanPendidikan.upsert({
  //     where: {
  //       id: p.id,
  //     },
  //     update: {
  //       SD: p.SD,
  //       SMP: p.SMP,
  //       SMA: p.SMA,
  //       D3: p.D3,
  //       S1: p.S1,
  //     },
  //     create: {
  //       id: p.id,
  //       SD: p.SD,
  //       SMP: p.SMP,
  //       SMA: p.SMA,
  //       D3: p.D3,
  //       S1: p.S1,
  //     },
  //   });
  // }
  // console.log("📊 grafikMenganggurBerdasarkanUsia success ...");

  // // ==================== SUBMENU PENDUDUK MISKIN =============
  // console.log("🔄 Seeding Jumlah Penduduk Miskin...");
  // for (const k of jumlahPendudukMiskin) {
  //   await prisma.grafikJumlahPendudukMiskin.upsert({
  //     where: {
  //       id: k.id,
  //     },
  //     update: {
  //       year: k.year,
  //       totalPoorPopulation: k.totalPoorPopulation,
  //     },
  //     create: {
  //       id: k.id,
  //       year: k.year,
  //       totalPoorPopulation: k.totalPoorPopulation,
  //     },
  //   });
  // }
  // console.log("✅ Jumlah Penduduk Miskin seeded successfully");

  // // ==================== SUBMENU PROGRAM KEMISKINAN =============
  // for (const s of statistikKemiskinan) {
  //   await prisma.statistikKemiskinan.upsert({
  //     where: { tahun: s.tahun }, // ✅ FIX
  //     update: {
  //       jumlah: s.jumlah,
  //     },
  //     create: {
  //       id: s.id, // id boleh tetap
  //       tahun: s.tahun,
  //       jumlah: s.jumlah,
  //     },
  //   });
  // }

  // console.log("📊 Statistik Kemiskinan seeded successfully");

  // console.log("🔄 Seeding Program Kemiskinan...");
  // for (const k of programKemiskinan) {
  //   await prisma.programKemiskinan.upsert({
  //     where: { id: k.id },
  //     update: {
  //       nama: k.nama,
  //       deskripsi: k.deskripsi,
  //       icon: k.icon,
  //       statistik: {
  //         connect: {
  //           tahun: k.tahun, // 👈 BUKAN ID
  //         },
  //       },
  //     },
  //     create: {
  //       id: k.id,
  //       nama: k.nama,
  //       deskripsi: k.deskripsi,
  //       icon: k.icon,
  //       statistik: {
  //         connect: {
  //           tahun: k.tahun,
  //         },
  //       },
  //     },
  //   });
  // }
  // console.log("✅ Program Kemiskinan seeded successfully");

  // // ==================== SUBMENU SEKTOR UNGGULAN DESA =============
  // console.log("🔄 Seeding Sektor Unggulan Desa...");
  // for (const k of sektorUnggulanDesa) {
  //   await prisma.sektorUnggulanDesa.upsert({
  //     where: {
  //       id: k.id,
  //     },
  //     update: {
  //       name: k.name,
  //       description: k.description,
  //       value: k.value,
  //     },
  //     create: {
  //       id: k.id,
  //       name: k.name,
  //       description: k.description,
  //       value: k.value,
  //     },
  //   });
  // }
  // console.log("✅ Sektor Unggulan Desa seeded successfully");

  // // ==================== SUBMENU DEMOGRAFI PEKERJAAN =============
  // console.log("🔄 Seeding Demografi Pekerjaan...");
  // for (const k of demografiPekerjaan) {
  //   await prisma.dataDemografiPekerjaan.upsert({
  //     where: {
  //       id: k.id,
  //     },
  //     update: {
  //       pekerjaan: k.pekerjaan,
  //       lakiLaki: k.lakiLaki,
  //       perempuan: k.perempuan,
  //     },
  //     create: {
  //       id: k.id,
  //       pekerjaan: k.pekerjaan,
  //       lakiLaki: k.lakiLaki,
  //       perempuan: k.perempuan,
  //     },
  //   });
  // }
  // console.log("✅ Demografi Pekerjaan seeded successfully");

  // // ====================== MENU INOVASI ==========================
  // // ====================== SUBMENU AJUKAN IDE INOVATIF ===========
  // console.log("🔄 Seeding Ajukan Ide Inovatif...");
  // for (const d of ajukanIde) {
  //   await prisma.ajukanIdeInovatif.upsert({
  //     where: {
  //       id: d.id,
  //     },
  //     update: {
  //       name: d.name,
  //       alamat: d.alamat,
  //       namaIde: d.namaIde,
  //       deskripsi: d.deskripsi,
  //       masalah: d.masalah,
  //       benefit: d.benefit,
  //     },
  //     create: {
  //       id: d.id,
  //       name: d.name,
  //       alamat: d.alamat,
  //       namaIde: d.namaIde,
  //       deskripsi: d.deskripsi,
  //       masalah: d.masalah,
  //       benefit: d.benefit,
  //     },
  //   });
  // }
  // console.log("✅ Ajukan Ide Inovatif seeded successfully");
  // // ==================== SUBMENU DESA DIGITAL ====================
  // console.log("🔄 Seeding Desa Digital...");
  // for (const d of desaDigital) {
  //   await prisma.desaDigital.upsert({
  //     where: {
  //       id: d.id,
  //     },
  //     update: {
  //       name: d.name,
  //       deskripsi: d.deskripsi,
  //       imageId: d.imageId,
  //     },
  //     create: {
  //       id: d.id,
  //       name: d.name,
  //       deskripsi: d.deskripsi,
  //       imageId: d.imageId,
  //     },
  //   });
  // }
  // console.log("✅ Desa Digital seeded successfully");

  // // ==================== SUBMENU LAYANAN ONLINE DESA ==========
  // console.log("🔄 Seeding Jenis Layanan...");
  // for (const j of jenisLayanan) {
  //   await prisma.jenisLayanan.upsert({
  //     where: {
  //       id: j.id,
  //     },
  //     update: {
  //       nama: j.nama,
  //       deskripsi: j.deskripsi,
  //     },
  //     create: {
  //       id: j.id,
  //       nama: j.nama,
  //       deskripsi: j.deskripsi,
  //     },
  //   });
  // }
  // console.log("✅ Jenis Layanan seeded successfully");

  // console.log("🔄 Seeding Administrasi Online...");
  // for (const d of administrasiOnline) {
  //   await prisma.administrasiOnline.upsert({
  //     where: {
  //       id: d.id,
  //     },
  //     update: {
  //       name: d.name,
  //       alamat: d.alamat,
  //       nomorTelepon: d.nomorTelepon,
  //       jenisLayananId: d.jenisLayananId,
  //     },
  //     create: {
  //       id: d.id,
  //       name: d.name,
  //       alamat: d.alamat,
  //       nomorTelepon: d.nomorTelepon,
  //       jenisLayananId: d.jenisLayananId,
  //     },
  //   });
  // }
  // console.log("✅ Administrasi Online seeded successfully");

  // console.log("🔄 Seeding Jenis Pengaduan Masyarakat...");
  // for (const d of jenisPengaduan) {
  //   await prisma.jenisPengaduan.upsert({
  //     where: {
  //       id: d.id,
  //     },
  //     update: {
  //       nama: d.nama,
  //     },
  //     create: {
  //       id: d.id,
  //       nama: d.nama,
  //     },
  //   });
  // }
  // console.log("✅ Jenis Pengaduan Masyarakat seeded successfully");

  // console.log("🔄 Seeding Pengaduan Masyarakat...");
  // for (const d of pengaduanMasyarakat) {
  //   await prisma.pengaduanMasyarakat.upsert({
  //     where: {
  //       id: d.id,
  //     },
  //     update: {
  //       name: d.name,
  //       email: d.email,
  //       nik: d.nik,
  //       nomorTelepon: d.nomorTelepon,
  //       judulPengaduan: d.judulPengaduan,
  //       lokasiKejadian: d.lokasiKejadian,
  //       imageId: d.imageId,
  //       deskripsiPengaduan: d.deskripsiPengaduan,
  //       jenisPengaduanId: d.jenisPengaduanId,
  //     },
  //     create: {
  //       id: d.id,
  //       name: d.name,
  //       email: d.email,
  //       nik: d.nik,
  //       nomorTelepon: d.nomorTelepon,
  //       judulPengaduan: d.judulPengaduan,
  //       lokasiKejadian: d.lokasiKejadian,
  //       imageId: d.imageId,
  //       deskripsiPengaduan: d.deskripsiPengaduan,
  //       jenisPengaduanId: d.jenisPengaduanId,
  //     },
  //   });
  // }
  // console.log("✅ Pengaduan Masyarakat seeded successfully");

  // // ==================== SUBMENU PROGRAM KREATIF ==========
  // console.log("🔄 Seeding Program Kreatif...");
  // for (const p of programKreatif) {
  //   await prisma.programKreatif.upsert({
  //     where: {
  //       id: p.id,
  //     },
  //     update: {
  //       name: p.name,
  //       deskripsi: p.deskripsi,
  //       icon: p.icon,
  //       slug: p.slug,
  //     },
  //     create: {
  //       id: p.id,
  //       name: p.name,
  //       deskripsi: p.deskripsi,
  //       icon: p.icon,
  //       slug: p.slug,
  //     },
  //   });
  // }
  // console.log("✅ Program Kreatif seeded successfully");

  // // ==================== SUBMENU KOLABORASI INOVASI ==========
  // console.log("🔄 Seeding Kolaborasi Inovasi...");
  // for (const p of kolaborasiInovasi) {
  //   await prisma.kolaborasiInovasi.upsert({
  //     where: {
  //       id: p.id,
  //     },
  //     update: {
  //       name: p.name,
  //       tahun: p.tahun,
  //       slug: p.slug,
  //       deskripsi: p.deskripsi,
  //       kolaborator: p.kolaborator,
  //     },
  //     create: {
  //       id: p.id,
  //       name: p.name,
  //       tahun: p.tahun,
  //       slug: p.slug,
  //       deskripsi: p.deskripsi,
  //       kolaborator: p.kolaborator,
  //     },
  //   });
  // }
  // console.log("✅ Kolaborasi Inovasi seeded successfully");

  // console.log("🔄 Seeding Mitra Kolaborasi...");
  // for (const p of mitraKolaborasi) {
  //   await prisma.mitraKolaborasi.upsert({
  //     where: {
  //       id: p.id,
  //     },
  //     update: {
  //       name: p.name,
  //       imageId: p.imageId,
  //     },
  //     create: {
  //       id: p.id,
  //       name: p.name,
  //       imageId: p.imageId,
  //     },
  //   });
  // }
  // console.log("✅ Mitra Kolaborasi seeded successfully");

  // // ==================== SUBMENU INFO TEKNOLOGI TEPAT GUNA ==========
  // console.log("🔄 Seeding Info Teknologi...");
  // for (const p of infoTeknologi) {
  //   await prisma.infoTekno.upsert({
  //     where: {
  //       id: p.id,
  //     },
  //     update: {
  //       name: p.name,
  //       deskripsi: p.deskripsi,
  //       imageId: p.imageId,
  //     },
  //     create: {
  //       id: p.id,
  //       name: p.name,
  //       deskripsi: p.deskripsi,
  //       imageId: p.imageId,
  //     },
  //   });
  // }
  // console.log("✅ Info Teknologi seeded successfully");

  // // ====================== MENU LINGKUNGAN ==========================
  // // ==================== SUBMENU PENGELOLAAN SAMPAH ==========
  // console.log("🔄 Seeding Pengelolaan Sampah...");
  // for (const p of pengelolaanSampah) {
  //   await prisma.pengelolaanSampah.upsert({
  //     where: {
  //       id: p.id,
  //     },
  //     update: {
  //       name: p.name,
  //       icon: p.icon,
  //     },
  //     create: {
  //       id: p.id,
  //       name: p.name,
  //       icon: p.icon,
  //     },
  //   });
  // }
  // console.log("✅ Pengelolaan Sampah seeded successfully");

  // console.log("🔄 Seeding Keterangan Bank Sampah...");
  // for (const p of keteranganBankSampah) {
  //   await prisma.keteranganBankSampahTerdekat.upsert({
  //     where: {
  //       id: p.id,
  //     },
  //     update: {
  //       name: p.name,
  //       alamat: p.alamat,
  //       namaTempatMaps: p.namaTempatMaps,
  //       linkPetunjukArah: p.linkPetunjukArah,
  //       lat: p.lat,
  //       lng: p.lng,
  //     },
  //     create: {
  //       id: p.id,
  //       name: p.name,
  //       alamat: p.alamat,
  //       namaTempatMaps: p.namaTempatMaps,
  //       linkPetunjukArah: p.linkPetunjukArah,
  //       lat: p.lat,
  //       lng: p.lng,
  //     },
  //   });
  // }
  // console.log("✅ Keterangan Bank Sampah seeded successfully");

  // // ==================== SUBMENU PROGRAM PENGHIJAUAN ==========
  // console.log("🔄 Seeding Program Penghijauan...");
  // for (const p of programPenghijauan) {
  //   await prisma.programPenghijauan.upsert({
  //     where: {
  //       id: p.id,
  //     },
  //     update: {
  //       name: p.name,
  //       judul: p.judul,
  //       deskripsi: p.deskripsi,
  //       icon: p.icon,
  //     },
  //     create: {
  //       id: p.id,
  //       name: p.name,
  //       judul: p.judul,
  //       deskripsi: p.deskripsi,
  //       icon: p.icon,
  //     },
  //   });
  // }
  // console.log("✅ Program Penghijauan seeded successfully");

  // // ==================== SUBMENU DATA LINGKUNGAN DESA ==========
  // console.log("🔄 Seeding Data Lingkungan Desa...");
  // for (const p of dataLingkunganDesa) {
  //   await prisma.dataLingkunganDesa.upsert({
  //     where: {
  //       id: p.id,
  //     },
  //     update: {
  //       name: p.name,
  //       jumlah: p.jumlah,
  //       deskripsi: p.deskripsi,
  //       icon: p.icon,
  //     },
  //     create: {
  //       id: p.id,
  //       name: p.name,
  //       jumlah: p.jumlah,
  //       deskripsi: p.deskripsi,
  //       icon: p.icon,
  //     },
  //   });
  // }
  // console.log("✅ Data Lingkungan Desa seeded successfully");

  // // =========== SUBMENU GOTONG ROYONG ===========
  // console.log("🔄 Seeding Kategori Gotong Royong...");

  // for (const k of kategoriGotongRoyong) {
  //   await prisma.kategoriKegiatan.upsert({
  //     where: {
  //       id: k.id,
  //     },
  //     update: {
  //       nama: k.nama,
  //     },
  //     create: {
  //       id: k.id,
  //       nama: k.nama,
  //     },
  //   });
  // }

  // console.log("✅ Kategori Gotong Royong seeded successfully");

  // console.log("🔄 Seeding Gotong Royong...");

  // for (const k of gotongRoyong) {
  //   await prisma.kegiatanDesa.upsert({
  //     where: {
  //       id: k.id,
  //     },
  //     update: {
  //       judul: k.judul,
  //       deskripsiSingkat: k.deskripsiSingkat,
  //       deskripsiLengkap: k.deskripsiLengkap,
  //       tanggal: k.tanggal,
  //       lokasi: k.lokasi,
  //       partisipan: k.partisipan,
  //       imageId: k.imageId,
  //       kategoriKegiatanId: k.kategoriKegiatanId,
  //     },
  //     create: {
  //       id: k.id,
  //       judul: k.judul,
  //       deskripsiSingkat: k.deskripsiSingkat,
  //       deskripsiLengkap: k.deskripsiLengkap,
  //       tanggal: k.tanggal,
  //       lokasi: k.lokasi,
  //       partisipan: k.partisipan,
  //       imageId: k.imageId,
  //       kategoriKegiatanId: k.kategoriKegiatanId,
  //     },
  //   });
  // }

  // console.log("✅ Kategori Gotong Royong seeded successfully");

  // // =========== SUBMENU EDUKASI LINGKUNGAN ===========

  // for (const e of tujuanEdukasiLingkungan) {
  //   await prisma.tujuanEdukasiLingkungan.upsert({
  //     where: {
  //       id: e.id,
  //     },
  //     update: {
  //       judul: e.judul,
  //       deskripsi: e.deskripsi,
  //     },
  //     create: {
  //       id: e.id,
  //       judul: e.judul,
  //       deskripsi: e.deskripsi,
  //     },
  //   });
  // }

  // console.log("tujuan edukasi lingkungan success ...");

  // for (const m of materiEdukasiLingkungan) {
  //   await prisma.materiEdukasiLingkungan.upsert({
  //     where: {
  //       id: m.id,
  //     },
  //     update: {
  //       judul: m.judul,
  //       deskripsi: m.deskripsi,
  //     },
  //     create: {
  //       id: m.id,
  //       judul: m.judul,
  //       deskripsi: m.deskripsi,
  //     },
  //   });
  // }

  // console.log("materi edukasi lingkungan success ...");

  // for (const c of contohEdukasiLingkungan) {
  //   await prisma.contohEdukasiLingkungan.upsert({
  //     where: {
  //       id: c.id,
  //     },
  //     update: {
  //       judul: c.judul,
  //       deskripsi: c.deskripsi,
  //     },
  //     create: {
  //       id: c.id,
  //       judul: c.judul,
  //       deskripsi: c.deskripsi,
  //     },
  //   });
  // }

  // console.log("contoh edukasi lingkungan success ...");

  // // =========== SUBMENU KONSERVASI ADAT BALI ===========

  // for (const f of filosofiTriHita) {
  //   await prisma.filosofiTriHita.upsert({
  //     where: {
  //       id: f.id,
  //     },
  //     update: {
  //       judul: f.judul,
  //       deskripsi: f.deskripsi,
  //     },
  //     create: {
  //       id: f.id,
  //       judul: f.judul,
  //       deskripsi: f.deskripsi,
  //     },
  //   });
  // }

  // console.log("filosofi tri hita success ...");

  // for (const b of bentukKonservasiBerdasarkanAdat) {
  //   await prisma.bentukKonservasiBerdasarkanAdat.upsert({
  //     where: {
  //       id: b.id,
  //     },
  //     update: {
  //       judul: b.judul,
  //       deskripsi: b.deskripsi,
  //     },
  //     create: {
  //       id: b.id,
  //       judul: b.judul,
  //       deskripsi: b.deskripsi,
  //     },
  //   });
  // }

  // console.log("bentuk konservasi berdasarkan adat success ...");

  // for (const n of nilaiKonservasiAdat) {
  //   await prisma.nilaiKonservasiAdat.upsert({
  //     where: {
  //       id: n.id,
  //     },
  //     update: {
  //       judul: n.judul,
  //       deskripsi: n.deskripsi,
  //     },
  //     create: {
  //       id: n.id,
  //       judul: n.judul,
  //       deskripsi: n.deskripsi,
  //     },
  //   });
  // }

  // console.log("nilai konservasi adat success ...");

  // // ====================== MENU PENDIDIKAN ==========================
  // // =========== SUBMENU INFO SEKOLAH =====================

  // for (const j of jenjangPendidikan) {
  //   await prisma.jenjangPendidikan.upsert({
  //     where: {
  //       id: j.id,
  //     },
  //     update: {
  //       nama: j.nama,
  //     },
  //     create: {
  //       id: j.id,
  //       nama: j.nama,
  //     },
  //   });
  // }

  // console.log("✅ Jenjang Pendidikan seeded successfully");

  // for (const j of lembagaPendidikan) {
  //   await prisma.lembaga.upsert({
  //     where: {
  //       id: j.id,
  //     },
  //     update: {
  //       nama: j.nama,
  //       jenjangId: j.jenjangId,
  //     },
  //     create: {
  //       id: j.id,
  //       nama: j.nama,
  //       jenjangId: j.jenjangId,
  //     },
  //   });
  // }

  // console.log("✅ Lembaga Pendidikan seeded successfully");

  // for (const j of siswa) {
  //   await prisma.siswa.upsert({
  //     where: {
  //       id: j.id,
  //     },
  //     update: {
  //       nama: j.nama,
  //       lembagaId: j.lembagaId,
  //     },
  //     create: {
  //       id: j.id,
  //       nama: j.nama,
  //       lembagaId: j.lembagaId,
  //     },
  //   });
  // }

  // console.log("✅ siswa seeded successfully");

  // for (const j of pengajar) {
  //   await prisma.pengajar.upsert({
  //     where: {
  //       id: j.id,
  //     },
  //     update: {
  //       nama: j.nama,
  //       lembagaId: j.lembagaId,
  //     },
  //     create: {
  //       id: j.id,
  //       nama: j.nama,
  //       lembagaId: j.lembagaId,
  //     },
  //   });
  // }

  // console.log("✅ pengajar seeded successfully");

  // // =========== SUBMENU PROGRAM PENDIDIKAN ANAK =====================

  // for (const t of tujuanProgram) {
  //   await prisma.tujuanProgram.upsert({
  //     where: { id: t.id },
  //     update: {
  //       judul: t.judul,
  //       deskripsi: t.deskripsi,
  //     },
  //     create: {
  //       id: t.id,
  //       judul: t.judul,
  //       deskripsi: t.deskripsi,
  //     },
  //   });
  // }
  // console.log("✅ tujuan program seeded (editable later via UI)");

  // for (const t of programUnggulan) {
  //   await prisma.programUnggulan.upsert({
  //     where: { id: t.id },
  //     update: {
  //       judul: t.judul,
  //       deskripsi: t.deskripsi,
  //     },
  //     create: {
  //       id: t.id,
  //       judul: t.judul,
  //       deskripsi: t.deskripsi,
  //     },
  //   });
  // }
  // console.log("✅ program unggulan seeded (editable later via UI)");

  // // =========== SUBMENU BIMBINGAN BELAJAR DESA =====================

  // for (const t of tujuanBimbinganBelajarDesa) {
  //   await prisma.tujuanBimbinganBelajarDesa.upsert({
  //     where: { id: t.id },
  //     update: {
  //       judul: t.judul,
  //       deskripsi: t.deskripsi,
  //     },
  //     create: {
  //       id: t.id,
  //       judul: t.judul,
  //       deskripsi: t.deskripsi,
  //     },
  //   });
  // }
  // console.log(
  //   "✅ tujuan bimbingan belajar desa seeded (editable later via UI)",
  // );

  // for (const t of lokasiJadwalBimbinganBelajarDesa) {
  //   await prisma.lokasiJadwalBimbinganBelajarDesa.upsert({
  //     where: { id: t.id },
  //     update: {
  //       judul: t.judul,
  //       deskripsi: t.deskripsi,
  //     },
  //     create: {
  //       id: t.id,
  //       judul: t.judul,
  //       deskripsi: t.deskripsi,
  //     },
  //   });
  // }
  // console.log(
  //   "✅ lokasi jadwal bimbingan belajar desa seeded (editable later via UI)",
  // );

  // for (const t of fasilitasBimbinganBelajarDesa) {
  //   await prisma.fasilitasBimbinganBelajarDesa.upsert({
  //     where: { id: t.id },
  //     update: {
  //       judul: t.judul,
  //       deskripsi: t.deskripsi,
  //     },
  //     create: {
  //       id: t.id,
  //       judul: t.judul,
  //       deskripsi: t.deskripsi,
  //     },
  //   });
  // }
  // console.log(
  //   "✅ fasilitas bimbingan belajar desa seeded (editable later via UI)",
  // );

  // // =========== SUBMENU PENDIDIKAN NON FORMAL =====================

  // for (const t of tujuanProgram2) {
  //   await prisma.tujuanPendidikanNonFormal.upsert({
  //     where: { id: t.id },
  //     update: {
  //       judul: t.judul,
  //       deskripsi: t.deskripsi,
  //     },
  //     create: {
  //       id: t.id,
  //       judul: t.judul,
  //       deskripsi: t.deskripsi,
  //     },
  //   });
  // }
  // console.log(
  //   "✅ fasilitas bimbingan belajar desa seeded (editable later via UI)",
  // );

  // for (const t of tempatKegiatan) {
  //   await prisma.tempatKegiatan.upsert({
  //     where: { id: t.id },
  //     update: {
  //       judul: t.judul,
  //       deskripsi: t.deskripsi,
  //     },
  //     create: {
  //       id: t.id,
  //       judul: t.judul,
  //       deskripsi: t.deskripsi,
  //     },
  //   });
  // }
  // console.log(
  //   "✅ fasilitas bimbingan belajar desa seeded (editable later via UI)",
  // );

  // for (const t of jenisProgramYangDiselenggarakan) {
  //   await prisma.jenisProgramYangDiselenggarakan.upsert({
  //     where: { id: t.id },
  //     update: {
  //       judul: t.judul,
  //       deskripsi: t.deskripsi,
  //     },
  //     create: {
  //       id: t.id,
  //       judul: t.judul,
  //       deskripsi: t.deskripsi,
  //     },
  //   });
  // }
  // console.log(
  //   "✅ fasilitas bimbingan belajar desa seeded (editable later via UI)",
  // );

  // // =========== SUBMENU PERPUSTAKAAN DIGITAL =====================
  // console.log("🔄 Seeding Kategori Buku...");
  // for (const k of kategoriBuku) {
  //   await prisma.kategoriBuku.upsert({
  //     where: {
  //       id: k.id,
  //     },
  //     update: {
  //       name: k.name,
  //     },
  //     create: {
  //       id: k.id,
  //       name: k.name,
  //     },
  //   });
  // }
  // console.log("✅ Kategori Buku seeded successfully");

  // console.log("🔄 Seeding Data perpustakaan...");
  // for (const k of dataPerpustakaan) {
  //   await prisma.dataPerpustakaan.upsert({
  //     where: {
  //       id: k.id,
  //     },
  //     update: {
  //       judul: k.judul,
  //       deskripsi: k.deskripsi,
  //       kategoriId: k.kategoriId,
  //       imageId: k.imageId,
  //     },
  //     create: {
  //       id: k.id,
  //       judul: k.judul,
  //       deskripsi: k.deskripsi,
  //       kategoriId: k.kategoriId,
  //       imageId: k.imageId,
  //     },
  //   });
  // }
  // console.log("✅ Data perpustakaan seeded successfully");

  // =========== SUBMENU DATA PENDIDIKAN =====================
  console.log("🔄 Seeding Data pendidikan...");
  for (const k of dataPendidikan) {
    await prisma.dataPendidikan.upsert({
      where: {
        id: k.id,
      },
      update: {
        name: k.name,
        jumlah: k.jumlah,
      },
      create: {
        id: k.id,
        name: k.name,
        jumlah: k.jumlah,
      },
    });
  }
  console.log("✅ Data pendidikan seeded successfully");
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
