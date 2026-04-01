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
import { seedPengelolaanSampah } from "./_seeder_list/lingkungan/seed_pengelolaan_sampah";
import { seedProgramPenghijauan } from "./_seeder_list/lingkungan/seed_program_penghijauan";
import { seedDataLingkunganDesa } from "./_seeder_list/lingkungan/seed_data_lingkungan_desa";
import { seedDataGotongRoyong } from "./_seeder_list/lingkungan/seed_data_gotong_royong";
import { seedEdukasiLingkungan } from "./_seeder_list/lingkungan/seed_edukasi_lingkungan";
import { seedKonservasiAdatBali } from "./_seeder_list/lingkungan/seed_konservasi_adat_bali";
import { seedInfoSekolah } from "./_seeder_list/pendidikan/seed_info_sekolah";
import { seedInfoProgramPendidikan } from "./_seeder_list/pendidikan/seed_info_program_pendidikan";
import { seedBimbinganBelajar } from "./_seeder_list/pendidikan/seed_bimbingan_belajar";
import { seedDataPendidikan } from "./_seeder_list/pendidikan/seed_data_pendidikan";
import { seedPendidikanNonFormal } from "./_seeder_list/pendidikan/seed_pendidikan_non_formal";
import { seedDataPerpustakaan } from "./_seeder_list/pendidikan/seed_data_perpustakaan";
import { seedProfilPpd } from "./_seeder_list/ppid/profil-ppid/seed_profil_ppd";

(async () => {
  // Always run seedAssets to handle new images without duplication
  console.log("📂 Checking for new assets to seed...");
  await seedAssets();

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

  // // =========== SUBMENU PROFIL PPID ===========
  await seedProfilPpd();

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
  await seedPengelolaanSampah();

  // // ==================== SUBMENU PROGRAM PENGHIJAUAN ==========
  await seedProgramPenghijauan();

  // // ==================== SUBMENU DATA LINGKUNGAN DESA ==========
  await seedDataLingkunganDesa();

  // // =========== SUBMENU GOTONG ROYONG ===========
  await seedDataGotongRoyong();

  // // =========== SUBMENU EDUKASI LINGKUNGAN ===========
  await seedEdukasiLingkungan();

  // // =========== SUBMENU KONSERVASI ADAT BALI ===========
  await seedKonservasiAdatBali();

  // // ====================== MENU PENDIDIKAN ==========================
  // // =========== SUBMENU INFO SEKOLAH =====================
  await seedInfoSekolah();

  // // =========== SUBMENU PROGRAM PENDIDIKAN ANAK =====================

  await seedInfoProgramPendidikan();

  // // =========== SUBMENU BIMBINGAN BELAJAR DESA =====================
  await seedBimbinganBelajar();

  // // =========== SUBMENU PENDIDIKAN NON FORMAL =====================
  await seedPendidikanNonFormal();
  // // =========== SUBMENU PERPUSTAKAAN DIGITAL =====================
  await seedDataPerpustakaan();

  // =========== SUBMENU DATA PENDIDIKAN =====================
  await seedDataPendidikan();
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
