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
import { seedPosyandu } from "./_seeder_list/kesehatan/posyandu/seed_posyandu";
import { seedPuskesmas } from "./_seeder_list/kesehatan/puskesmas/seed_puskesmas";
import { seedProgramKesehatan } from "./_seeder_list/kesehatan/program-kesehatan/seed_program_kesehatan";
import { seedPenangananDarurat } from "./_seeder_list/kesehatan/penanganan-darurat/seed_penanganan_darurat";
import { seedKontakDarurat } from "./_seeder_list/kesehatan/kontak-darurat/seed_kontak_darurat";
import { seedInfoWabahPenyakit } from "./_seeder_list/kesehatan/info-wabah-penyakit/seed_info_wabah_penyakit";
import { seedKeamananLingkungan } from "./_seeder_list/keamanan/seed_keamanan_lingkungan";
import { seedPolsekTerdekat } from "./_seeder_list/keamanan/seed_polsek_terdekat";
import { seedKontakDaruratKeamanan } from "./_seeder_list/keamanan/seed_kontak_darurat";
import { seedPencegahanKriminalitas } from "./_seeder_list/keamanan/seed_pencegahan_kriminalitas";
import { seedLaporanPublik } from "./_seeder_list/keamanan/seed_laporan_publik";
import { seedPasarDesa } from "./_seeder_list/ekonomi/seed_pasar_desa";
import { seedLowonganKerjaLokal } from "./_seeder_list/ekonomi/seed_lowongan_kerja_lokal";
import { seedDemografiPekerjaan } from "./_seeder_list/ekonomi/seed_demografi_pekerjaan";
import { seedSektorUnggulanDesa } from "./_seeder_list/ekonomi/seed_sektor_unggulan_desa";
import { seedProgramKemiskinan } from "./_seeder_list/ekonomi/seed_program_kemiskinan";
import { seedJumlahPendudukMiskin } from "./_seeder_list/ekonomi/seed_jumlah_penduduk_miskin";
import { seedPendudukUsiaKerjaYangMenganggur } from "./_seeder_list/ekonomi/seed_penduduk_usia_kerja_yang_menganggur";
import { seedJumlahPengangguran } from "./_seeder_list/ekonomi/seed_jumlah_pengangguran";
import { seedPendapatanAsli } from "./_seeder_list/ekonomi/seed_pendapatan_asli";
import { seedStrukturBumdes } from "./_seeder_list/ekonomi/seed_struktur_bumdes";
import { seedAjukan } from "./_seeder_list/inovasi/seed_ajukan";
import { seedDesaDigital } from "./_seeder_list/inovasi/seed_desa_digital";
import { seedLayananOnlineDesa } from "./_seeder_list/inovasi/seed_layanan_online_desa";
import { seedProgramKreatifDesa } from "./_seeder_list/inovasi/seed_program_kreatif_desa";
import { seedKolaborasiInovasi } from "./_seeder_list/inovasi/seed_kolaborasi_inovasi";
import { seedInfoTeknologi } from "./_seeder_list/inovasi/seed_info_teknologi";

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
  await seedPosyandu();

  // // ==================== SUBMENU PUSKESMAS =========================
  await seedPuskesmas();

  // // ==================== SUBMENU PROGRAM KESEHATAN =========================
  await seedProgramKesehatan();

  // // ==================== SUBMENU PENANGANAN DARURAT =========================
  await seedPenangananDarurat();

  // // ==================== SUBMENU KONTAK DARURAT =========================
  await seedKontakDarurat();

  // // ==================== SUBMENU INFO WABAH PENYAKIT =========================
  await seedInfoWabahPenyakit();

  // // ====================== MENU KEAMANAN ========================
  // // ==================== SUBMENU KEAMANAN LINGKUNGAN ============
  await seedKeamananLingkungan();

  // // ==================== SUBMENU POLSEK TERDEKAT ================
  await seedPolsekTerdekat();

  // // ==================== SUBMENU KONTAK DARURAT =================
  await seedKontakDaruratKeamanan();

  // // ==================== SUBMENU PENCEGAHAN KRIMINALITAS ========
  await seedPencegahanKriminalitas();
  // // ==================== SUBMENU LAPORAN PUBLIK =================
  await seedLaporanPublik();

  // // ==================== SUBMENU TIPS KEAMANAN ==================
  await seedKeamananLingkungan();

  // // ====================== MENU EKONOMI ========================
  // // ==================== SUBMENU PASAR DESA ====================
  await seedPasarDesa();

  // // ==================== SUBMENU LOWONGAN KERJA LOKAL ==========
  await seedLowonganKerjaLokal();

  // // ==================== SUBMENU STRUKTUR ORGANISASI DAN SK PENGURUS BUMDES ==========
  await seedStrukturBumdes();

  // // ==================== SUBMENU PENDAPATAN ASLI DESA ==========
  await seedPendapatanAsli();

  // // ==================== SUBMENU JUMLAH PENGANGGURAN ==========
  await seedJumlahPengangguran();

  // // ==================== SUBMENU PENDUDUK USIA KERJA ==========
  await seedPendudukUsiaKerjaYangMenganggur();

  // // ==================== SUBMENU PENDUDUK MISKIN =============
  await seedJumlahPendudukMiskin();

  // // ==================== SUBMENU PROGRAM KEMISKINAN =============
  await seedProgramKemiskinan();

  // // ==================== SUBMENU SEKTOR UNGGULAN DESA =============
 await seedSektorUnggulanDesa();

  // // ==================== SUBMENU DEMOGRAFI PEKERJAAN =============
  await seedDemografiPekerjaan();

  // // ====================== MENU INOVASI ==========================
  // // ====================== SUBMENU AJUKAN IDE INOVATIF ===========
  await seedAjukan();
  // // ==================== SUBMENU DESA DIGITAL ====================
  await seedDesaDigital();

  // // ==================== SUBMENU LAYANAN ONLINE DESA ==========
  await seedLayananOnlineDesa();

  // // ==================== SUBMENU PROGRAM KREATIF ==========
  await seedProgramKreatifDesa();
  // // ==================== SUBMENU KOLABORASI INOVASI ==========
  await seedKolaborasiInovasi();

  // // ==================== SUBMENU INFO TEKNOLOGI TEPAT GUNA ==========
  await seedInfoTeknologi();

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
