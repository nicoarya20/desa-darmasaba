import prisma from "@/lib/prisma";
import profilePejabatDesa from "./data/landing-page/profile/profile.json";
import programInovasi from "./data/landing-page/profile/programInovasi.json";
import mediaSosial from "./data/landing-page/profile/mediaSosial.json";
import desaAntiKorupsi from "./data/landing-page/desa-anti-korupsi/desaantiKorpusi.json";
import kategoriDesaAntiKorupsi from "./data/landing-page/desa-anti-korupsi/kategoriDesaAntiKorupsi.json";
import sdgsDesa from "./data/landing-page/sdgs-desa/sdgs-desa.json";
import apbdes from "./data/landing-page/apbdes/apbdes.json";
import kategoriPrestasiDesa from "./data/landing-page/prestasi-desa/kategori-prestasi.json";
import prestasiDesa from "./data/landing-page/prestasi-desa/prestasi-desa.json";
import penghargaan from "./data/landing-page/penghargaan/penghargaan.json";
import profilePPID from "./data/ppid/profile-ppid/profilePPid.json";
import pegawaiPPID from "./data/ppid/struktur-ppid/pegawai-PPID.json";
import posisiOrganisasiPPID from "./data/ppid/struktur-ppid/posisi-organisasi-PPID.json";
import visiMisiPPID from "./data/ppid/visi-misi-ppid/visimisiPPID.json";
import dasarHukumPPID from "./data/ppid/dasar-hukum-ppid/dasarhukumPPID.json";
import jenisKelamin from "./data/ppid/ikm/jenis-kelamin/jenis-kelamin.json";
import daftarInformasiPublik from "./data/ppid/daftar-informasi-publik-desa-darmasaba/daftarInformasi.json"
import pilihanRatingResponden from "./data/ppid/ikm/pilihan-rating-responden/rating-responden.json";
import umurResponden from "./data/ppid/ikm/umur-responden/umur-responden.json";
import categoryPengumuman from "./data/category-pengumuman.json";
import pelayananPerizinanBerusaha from "./data/desa/layanan/pelayananPerizinanBerusaha.json";
import pelayananSuratKeterangan from "./data/desa/layanan/pelayananSuratKeterangan.json";
import pelayananTelunjukSaktiDesa from "./data/desa/layanan/pelayananTelunjukSaktiDesa.json";
import pelayananPendudukNonPermanen from "./data/desa/layanan/pelayanaPendudukNonPermanen.json";
import lambangDesa from "./data/desa/profile/lambang_desa.json";
import maskotDesa from "./data/desa/profile/maskot_desa.json";
import profilPerbekel from "./data/desa/profile/profil_perbekel.json";
import sejarahDesa from "./data/desa/profile/sejarah_desa.json";
import visiMisiDesa from "./data/desa/profile/visi_misi_desa.json";
import detailDataPengangguran from "./data/ekonomi/jumlah-pengangguran/detail-data-pengangguran.json";
import kategoriProduk from "./data/ekonomi/pasar-desa/kategori-produk.json";
import hubunganOrganisasi from "./data/ekonomi/struktur-organisasi/hubungan-organisasi.json";
import pegawai from "./data/ekonomi/struktur-organisasi/pegawai.json";
import posisiOrganisasi from "./data/ekonomi/struktur-organisasi/posisi-organisasi.json";
import kategoriBerita from "./data/kategori-berita.json";
import contohEdukasiLingkungan from "./data/lingkungan/edukasi-lingkungan/contoh-kegiatan-di-desa-darmasaba.json";
import materiEdukasiLingkungan from "./data/lingkungan/edukasi-lingkungan/materi-edukasi-yang-diberikan.json";
import tujuanEdukasiLingkungan from "./data/lingkungan/edukasi-lingkungan/tujuan-edukasi-lingkungan.json";
import bentukKonservasiBerdasarkanAdat from "./data/lingkungan/konservasi-adat-bali/bentuk-konservasi.json";
import filosofiTriHita from "./data/lingkungan/konservasi-adat-bali/filosofi-tri-hita.json";
import nilaiKonservasiAdat from "./data/lingkungan/konservasi-adat-bali/nilai-konservasi-adat.json";
import caraMemperolehInformasi from "./data/list-caraMemperolehInformasi.json";
import caraMemperolehSalinanInformasi from "./data/list-caraMemperolehSalinanInformasi.json";
import jenisInformasiDiminta from "./data/list-jenisInfromasi.json";
import potensi from "./data/list-potensi.json";
import fasilitasBimbinganBelajarDesa from "./data/pendidikan/bimbingan-belajar-desa/fasilitas-yang-disediakan.json";
import lokasiJadwalBimbinganBelajarDesa from "./data/pendidikan/bimbingan-belajar-desa/lokasi-dan-jadwal.json";
import tujuanBimbinganBelajarDesa from "./data/pendidikan/bimbingan-belajar-desa/tujuan-bimbingan-belajar-desa.json";
import jenisProgramYangDiselenggarakan from "./data/pendidikan/pendidikan-non-formal/jenis-program-yang-diselenggarakan.json";
import tempatKegiatan from "./data/pendidikan/pendidikan-non-formal/tempat-kegiatan.json";
import tujuanProgram2 from "./data/pendidikan/pendidikan-non-formal/tujuan-program2.json";
import programUnggulan from "./data/pendidikan/program-pendidikan-anak/program-unggulan.json";
import tujuanProgram from "./data/pendidikan/program-pendidikan-anak/tujuan-program.json";
import roles from "./data/user/roles.json";
import users from "./data/user/users.json";

(async () => {
  // =========== USER & ROLE ===========
  for (const r of roles) {
    await prisma.role.upsert({
      where: { id: r.id },
      update: {
        name: r.name,
        description: r.description,
        permissions: r.permissions,
        isActive: true,
      },
      create: {
        id: r.id,
        name: r.name,
        description: r.description,
        permissions: r.permissions,
        isActive: true,
      },
    });
  }
  console.log("✅ Roles seeded");
  //users
  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        nama: u.nama,
        email: u.email,
        password: u.password,
        roleId: u.roleId,
        isActive: true,
      },
      create: {
        id: u.id,
        nama: u.nama,
        email: u.email,
        password: u.password,
        roleId: u.roleId,
        isActive: true,
      },
    });
  }
  console.log("✅ Users seeded");
  // =========== LANDING PAGE ===========
  // =========== SUBMENU PROFILE ===========
  // =========== PROFILE PEJABAT DESA ===========
  for (const p of profilePejabatDesa) {
    await prisma.pejabatDesa.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        position: p.position,
      },
      create: {
        id: p.id,
        name: p.name,
        position: p.position,
      },
    });
  }
  console.log(
    "✅ profilePejabatDesa seeded without imageId (editable later via UI)"
  );

  // =========== PROGRAM INOVASI ===========
  for (const p of programInovasi) {
    await prisma.programInovasi.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        description: p.description,
        link: p.link,
      },
      create: {
        id: p.id,
        name: p.name,
        description: p.description,
        link: p.link,
      },
    });
  }
  console.log("program inovasi success ...");

  // =========== MEDIA SOSIAL ===========
  for (const p of mediaSosial) {
    await prisma.mediaSosial.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        iconUrl: p.iconUrl,
      },
      create: {
        id: p.id,
        name: p.name,
        iconUrl: p.iconUrl,
      },
    });
  }
  console.log("media sosial success ...");

  // =========== SUBMENU DESA ANTI KORUPSI ===========
  // =========== KATEGORI DESA ANTI KORUPSI ===========
  for (const k of kategoriDesaAntiKorupsi) {
    await prisma.kategoriDesaAntiKorupsi.upsert({
      where: { id: k.id },
      update: {
        name: k.name,
      },
      create: {
        id: k.id,
        name: k.name,
      },
    });
  }
  console.log("kategori desa anti korupsi success ...");

  // =========== DESA ANTI KORUPSI ===========
  for (const p of desaAntiKorupsi) {
    await prisma.desaAntiKorupsi.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        deskripsi: p.deskripsi,
        kategoriId: p.kategoriId,
      },
      create: {
        id: p.id,
        name: p.name,
        deskripsi: p.deskripsi,
        kategoriId: p.kategoriId,
      },
    });
  }
  console.log("desa anti korupsi success ...");

  // =========== KATEGORI DESA ANTI KORUPSI ===========
  for (const p of kategoriDesaAntiKorupsi) {
    await prisma.kategoriDesaAntiKorupsi.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
      },
      create: {
        id: p.id,
        name: p.name,
      },
    });
  }
  console.log("desa anti korupsi success ...");

  // =========== KATEGORI PRESTASI DESA===========
  for (const c of kategoriPrestasiDesa) {
    await prisma.kategoriPrestasiDesa.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
      },
      create: {
        id: c.id,
        name: c.name,
      },
    });
  }
  console.log("kategori prestasi desa success ...");

  // =========== PRESTASI DESA===========
  for (const p of prestasiDesa) {
    await prisma.prestasiDesa.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        deskripsi: p.deskripsi,
        kategoriId: p.kategoriId,
      },
      create: {
        id: p.id,
        name: p.name,
        deskripsi: p.deskripsi,
        kategoriId: p.kategoriId,
      },
    });
  }
  console.log("prestasi desa success ...");

  // =========== PENGHARGAAN ===========
  for (const p of penghargaan) {
    await prisma.penghargaan.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        juara: p.juara,
        deskripsi: p.deskripsi,
      },
      create: {
        id: p.id,
        name: p.name,
        juara: p.juara,
        deskripsi: p.deskripsi,
      },
    });
  }
  console.log("penghargaan success ...");

  // =========== LAYANAN DESA ===========
  for (const p of pelayananSuratKeterangan) {
    await prisma.pelayananSuratKeterangan.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        deskripsi: p.deskripsi,
      },
      create: {
        id: p.id,
        name: p.name,
        deskripsi: p.deskripsi,
      },
    });
  }
  console.log("pelayanan surat keterangan success ...");

  for (const p of pelayananTelunjukSaktiDesa) {
    await prisma.pelayananTelunjukSaktiDesa.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        deskripsi: p.deskripsi,
        link: p.link,
      },
      create: {
        id: p.id,
        name: p.name,
        deskripsi: p.deskripsi,
        link: p.link,
      },
    });
  }
  console.log("pelayanan surat keterangan success ...");

  // =========== SDGSDesa ===========
  for (const l of sdgsDesa) {
    await prisma.sDGSDesa.upsert({
      where: {
        name: l.name,
        jumlah: l.jumlah,
      },
      update: {
        name: l.name,
        jumlah: l.jumlah,
      },
      create: {
        name: l.name,
        jumlah: l.jumlah,
      },
    });
  }

  console.log("sdgs desa success ...");

  // =========== APBDes ===========
  for (const l of apbdes) {
    await prisma.aPBDes.upsert({
      where: {
        name: l.name,
        jumlah: l.jumlah,
      },
      update: {
        name: l.name,
        jumlah: l.jumlah,
      },
      create: {
        name: l.name,
        jumlah: l.jumlah,
      },
    });
  }

  console.log("sdgs desa success ...");

  // =========== MENU DESA ===========
  // =========== SUBMENU PROFILE ===========
  // =========== SEJARAH DESA ===========
  for (const l of sejarahDesa) {
    await prisma.sejarahDesa.upsert({
      where: {
        id: l.id,
      },
      update: {
        judul: l.judul,
        deskripsi: l.deskripsi,
      },
      create: {
        id: l.id,
        judul: l.judul,
        deskripsi: l.deskripsi,
      },
    });
  }

  console.log("sejarah desa success ...");

  // =========== MASKOT DESA ===========
  for (const l of maskotDesa) {
    await prisma.maskotDesa.upsert({
      where: {
        id: l.id,
      },
      update: {
        judul: l.judul,
        deskripsi: l.deskripsi,
      },
      create: {
        id: l.id,
        judul: l.judul,
        deskripsi: l.deskripsi,
      },
    });
  }

  console.log("maskot desa success ...");

  // =========== LAMBANG DESA ===========
  for (const l of lambangDesa) {
    await prisma.lambangDesa.upsert({
      where: {
        id: l.id,
      },
      update: {
        judul: l.judul,
        deskripsi: l.deskripsi,
      },
      create: {
        id: l.id,
        judul: l.judul,
        deskripsi: l.deskripsi,
      },
    });
  }

  console.log("lambang desa success ...");

  // =========== PROFIL PERBEKEL ===========
  for (const c of profilPerbekel) {
    await prisma.profilPerbekel.upsert({
      where: { id: c.id },
      update: {
        biodata: c.biodata,
        pengalaman: c.pengalaman,
        pengalamanOrganisasi: c.pengalamanOrganisasi,
        programUnggulan: c.programUnggulan,
        // imageId tidak di-update
      },
      create: {
        id: c.id,
        biodata: c.biodata,
        pengalaman: c.pengalaman,
        pengalamanOrganisasi: c.pengalamanOrganisasi,
        programUnggulan: c.programUnggulan,
        // imageId tidak di-create
      },
    });
  }
  console.log(
    "✅ profilePerbekel seeded without imageId (editable later via UI)"
  );

  // =========== VISI MISI DESA ===========
  for (const l of visiMisiDesa) {
    await prisma.visiMisiDesa.upsert({
      where: {
        id: l.id,
      },
      update: {
        visi: l.visi,
        misi: l.misi,
      },
      create: {
        id: l.id,
        visi: l.visi,
        misi: l.misi,
      },
    });
  }

  console.log("visi misi desa success ...");

  // =========== MENU PPID ===========
  // =========== SUBMENU PROFILE PPID ===========
  for (const c of profilePPID) {
    await prisma.profilePPID.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        biodata: c.biodata,
        riwayat: c.riwayat,
        pengalaman: c.pengalaman,
        unggulan: c.unggulan,
        // imageId tidak di-update
      },
      create: {
        id: c.id,
        name: c.name,
        biodata: c.biodata,
        riwayat: c.riwayat,
        pengalaman: c.pengalaman,
        unggulan: c.unggulan,
        // imageId tidak di-create
      },
    });
  }
  console.log("✅ profilePPID seeded without imageId (editable later via UI)");

  // =========== SUBMENU STRUKTUR PPID ===========
  // =========== POSISI ORGANISASI PPID ===========

  const flattenedPosisi = posisiOrganisasiPPID.flat();

  // ✅ Urutkan berdasarkan hierarki
  const sortedPosisi = flattenedPosisi.sort((a, b) => a.hierarki - b.hierarki);

  for (const p of sortedPosisi) {
    console.log(`Seeding: ${p.nama} (id: ${p.id}, parent: ${p.parentId})`);

    if (p.parentId) {
      const parentExists = flattenedPosisi.some((pos) => pos.id === p.parentId);
      if (!parentExists) {
        console.warn(
          `⚠️ Parent tidak ditemukan: ${p.parentId} untuk ${p.nama}`
        );
        continue;
      }
    }

    await prisma.posisiOrganisasiPPID.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }
  console.log("posisi organisasi berhasil");

  // =========== PEGAWAI PPID ===========
  const flattenedPegawai = pegawaiPPID.flat();
  for (const p of flattenedPegawai) {
    await prisma.pegawaiPPID.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }
  console.log("pegawai berhasil");

  // =========== SUBMENU VISI MISI PPID ===========

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

  // =========== SUBMENU DASAR HUKUM PPID ===========
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

    // =========== SUBMENU DAFTAR INFORMASI PUBLIK PPID ===========
    for (const v of daftarInformasiPublik) {
      // Convert string date to Date object
      const tanggal = new Date(v.tanggal);
      
      await prisma.daftarInformasiPublik.upsert({
        where: {
          id: v.id,
        },
        update: {
          jenisInformasi: v.jenisInformasi,
          deskripsi: v.deskripsi,
          tanggal: tanggal,
        },
        create: {
          id: v.id,
          jenisInformasi: v.jenisInformasi,
          deskripsi: v.deskripsi,
          tanggal: tanggal,
        },
      });
    }
    console.log("daftar informasi publik PPID success ...");

  for (const l of pelayananPerizinanBerusaha) {
    await prisma.pelayananPerizinanBerusaha.upsert({
      where: {
        id: l.id,
      },
      update: {
        name: l.name,
        deskripsi: l.deskripsi,
        link: l.link,
      },
      create: {
        id: l.id,
        name: l.name,
        deskripsi: l.deskripsi,
        link: l.link,
      },
    });
  }

  console.log("pelayanan perizinan berusaha success ...");

  for (const l of pelayananPendudukNonPermanen) {
    await prisma.pelayananPendudukNonPermanen.upsert({
      where: {
        id: l.id,
      },
      update: {
        name: l.name,
        deskripsi: l.deskripsi,
      },
      create: {
        id: l.id,
        name: l.name,
        deskripsi: l.deskripsi,
      },
    });
  }
  console.log("pelayanan penduduk non permanen success ...");

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

  for (const j of jenisKelamin) {
    await prisma.jenisKelaminResponden.upsert({
      where: {
        id: j.id,
      },
      update: {
        name: j.name,
      },
      create: {
        id: j.id,
        name: j.name,
      },
    });
  }
  console.log("jenis kelamin responden success ...");

  for (const r of pilihanRatingResponden) {
    await prisma.pilihanRatingResponden.upsert({
      where: {
        id: r.id,
      },
      update: {
        name: r.name,
      },
      create: {
        id: r.id,
        name: r.name,
      },
    });
  }
  console.log("pilihan rating responden success ...");

  for (const u of umurResponden) {
    await prisma.umurResponden.upsert({
      where: {
        id: u.id,
      },
      update: {
        name: u.name,
      },
      create: {
        id: u.id,
        name: u.name,
      },
    });
  }
  console.log("umur responden success ...");

  for (const k of kategoriProduk) {
    await prisma.kategoriProduk.upsert({
      where: {
        id: k.id,
      },
      update: {
        nama: k.nama,
      },
      create: {
        id: k.id,
        nama: k.nama,
      },
    });
  }
  console.log("kategori produk success ...");

  for (const p of posisiOrganisasi) {
    await prisma.posisiOrganisasi.upsert({
      where: {
        id: p.id,
      },
      update: {
        nama: p.nama,
        deskripsi: p.deskripsi,
        hierarki: p.hierarki,
      },
      create: {
        id: p.id,
        nama: p.nama,
        deskripsi: p.deskripsi,
        hierarki: p.hierarki,
      },
    });
  }
  console.log("posisi organisasi success ...");

  for (const p of pegawai) {
    await prisma.pegawai.upsert({
      where: {
        id: p.id,
      },
      update: {
        namaLengkap: p.namaLengkap,
        gelarAkademik: p.gelarAkademik,
        tanggalMasuk: new Date(p.tanggalMasuk),
        email: p.email,
        telepon: p.telepon,
        alamat: p.alamat,
        posisiId: p.posisiId,
        isActive: p.isActive,
      },
      create: {
        id: p.id,
        namaLengkap: p.namaLengkap,
        gelarAkademik: p.gelarAkademik,
        tanggalMasuk: new Date(p.tanggalMasuk),
        email: p.email,
        telepon: p.telepon,
        alamat: p.alamat,
        posisiId: p.posisiId,
        isActive: p.isActive,
      },
    });
  }
  console.log("pegawai success ...");

  for (const p of hubunganOrganisasi) {
    await prisma.hubunganOrganisasi.upsert({
      where: {
        atasanId_bawahanId: {
          atasanId: p.atasanId,
          bawahanId: p.bawahanId,
        },
      },
      update: {
        tipe: p.tipe,
      },
      create: {
        atasanId: p.atasanId,
        bawahanId: p.bawahanId,
        tipe: p.tipe,
      },
    });
  }
  console.log("hubungan organisasi success ...");

  for (const d of detailDataPengangguran) {
    // Convert the year to a Date object (using January 1st of the year as the date)
    const yearAsDate = new Date(d.year, 0, 1);

    await prisma.detailDataPengangguran.upsert({
      where: {
        month_year: { month: d.month, year: yearAsDate },
      },
      update: {
        totalUnemployment: d.totalUnemployment,
        educatedUnemployment: d.educatedUnemployment,
        uneducatedUnemployment: d.uneducatedUnemployment,
        percentageChange: d.percentageChange,
      },
      create: {
        month: d.month,
        year: yearAsDate,
        totalUnemployment: d.totalUnemployment,
        educatedUnemployment: d.educatedUnemployment,
        uneducatedUnemployment: d.uneducatedUnemployment,
        percentageChange: d.percentageChange,
      },
    });
  }
  console.log("📊 detailDataPengangguran success ...");

  for (const e of tujuanEdukasiLingkungan) {
    await prisma.tujuanEdukasiLingkungan.upsert({
      where: {
        id: e.id,
      },
      update: {
        judul: e.judul,
        deskripsi: e.deskripsi,
      },
      create: {
        id: e.id,
        judul: e.judul,
        deskripsi: e.deskripsi,
      },
    });
  }

  console.log("tujuan edukasi lingkungan success ...");

  for (const m of materiEdukasiLingkungan) {
    await prisma.materiEdukasiLingkungan.upsert({
      where: {
        id: m.id,
      },
      update: {
        judul: m.judul,
        deskripsi: m.deskripsi,
      },
      create: {
        id: m.id,
        judul: m.judul,
        deskripsi: m.deskripsi,
      },
    });
  }

  console.log("materi edukasi lingkungan success ...");

  for (const c of contohEdukasiLingkungan) {
    await prisma.contohEdukasiLingkungan.upsert({
      where: {
        id: c.id,
      },
      update: {
        judul: c.judul,
        deskripsi: c.deskripsi,
      },
      create: {
        id: c.id,
        judul: c.judul,
        deskripsi: c.deskripsi,
      },
    });
  }

  console.log("contoh edukasi lingkungan success ...");

  for (const f of filosofiTriHita) {
    await prisma.filosofiTriHita.upsert({
      where: {
        id: f.id,
      },
      update: {
        judul: f.judul,
        deskripsi: f.deskripsi,
      },
      create: {
        id: f.id,
        judul: f.judul,
        deskripsi: f.deskripsi,
      },
    });
  }

  console.log("filosofi tri hita success ...");

  for (const b of bentukKonservasiBerdasarkanAdat) {
    await prisma.bentukKonservasiBerdasarkanAdat.upsert({
      where: {
        id: b.id,
      },
      update: {
        judul: b.judul,
        deskripsi: b.deskripsi,
      },
      create: {
        id: b.id,
        judul: b.judul,
        deskripsi: b.deskripsi,
      },
    });
  }

  console.log("bentuk konservasi berdasarkan adat success ...");

  for (const n of nilaiKonservasiAdat) {
    await prisma.nilaiKonservasiAdat.upsert({
      where: {
        id: n.id,
      },
      update: {
        judul: n.judul,
        deskripsi: n.deskripsi,
      },
      create: {
        id: n.id,
        judul: n.judul,
        deskripsi: n.deskripsi,
      },
    });
  }

  console.log("nilai konservasi adat success ...");

  for (const t of tujuanProgram) {
    await prisma.tujuanProgram.upsert({
      where: { id: t.id },
      update: {
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
      create: {
        id: t.id,
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
    });
  }
  console.log("✅ tujuan program seeded (editable later via UI)");

  for (const t of programUnggulan) {
    await prisma.programUnggulan.upsert({
      where: { id: t.id },
      update: {
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
      create: {
        id: t.id,
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
    });
  }
  console.log("✅ program unggulan seeded (editable later via UI)");

  for (const t of tujuanBimbinganBelajarDesa) {
    await prisma.tujuanBimbinganBelajarDesa.upsert({
      where: { id: t.id },
      update: {
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
      create: {
        id: t.id,
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
    });
  }
  console.log(
    "✅ tujuan bimbingan belajar desa seeded (editable later via UI)"
  );

  for (const t of lokasiJadwalBimbinganBelajarDesa) {
    await prisma.lokasiJadwalBimbinganBelajarDesa.upsert({
      where: { id: t.id },
      update: {
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
      create: {
        id: t.id,
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
    });
  }
  console.log(
    "✅ lokasi jadwal bimbingan belajar desa seeded (editable later via UI)"
  );

  for (const t of fasilitasBimbinganBelajarDesa) {
    await prisma.fasilitasBimbinganBelajarDesa.upsert({
      where: { id: t.id },
      update: {
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
      create: {
        id: t.id,
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
    });
  }
  console.log(
    "✅ fasilitas bimbingan belajar desa seeded (editable later via UI)"
  );

  for (const t of tujuanProgram2) {
    await prisma.tujuanPendidikanNonFormal.upsert({
      where: { id: t.id },
      update: {
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
      create: {
        id: t.id,
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
    });
  }
  console.log(
    "✅ fasilitas bimbingan belajar desa seeded (editable later via UI)"
  );

  for (const t of tempatKegiatan) {
    await prisma.tempatKegiatan.upsert({
      where: { id: t.id },
      update: {
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
      create: {
        id: t.id,
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
    });
  }
  console.log(
    "✅ fasilitas bimbingan belajar desa seeded (editable later via UI)"
  );

  for (const t of jenisProgramYangDiselenggarakan) {
    await prisma.jenisProgramYangDiselenggarakan.upsert({
      where: { id: t.id },
      update: {
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
      create: {
        id: t.id,
        judul: t.judul,
        deskripsi: t.deskripsi,
      },
    });
  }
  console.log(
    "✅ fasilitas bimbingan belajar desa seeded (editable later via UI)"
  );
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
