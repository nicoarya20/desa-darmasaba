import prisma from "@/lib/prisma";
import categoryPengumuman from "./data/category-pengumuman.json";
import kategoriBerita from "./data/kategori-berita.json";
import caraMemperolehInformasi from "./data/list-caraMemperolehInformasi.json";
import caraMemperolehSalinanInformasi from "./data/list-caraMemperolehSalinanInformasi.json";
import jenisInformasiDiminta from "./data/list-jenisInfromasi.json";
import layanan from "./data/list-layanan.json";
import potensi from "./data/list-potensi.json";
import dasarHukumPPID from "./data/ppid/dasar-hukum-ppid/dasarhukumPPID.json";
import profilePPID from "./data/ppid/profile-ppid/profilePPid.json";
import visiMisiPPID from "./data/ppid/visi-misi-ppid/visimisiPPID.json";
import strukturPPID from "./data/ppid/struktur-ppid/strukturPPID.json";
import pelayananPerizinanBerusaha from "./data/desa/layanan/pelayananPerizinanBerusaha.json";
import pelayananPendudukNonPermanen from "./data/desa/layanan/pelayanaPendudukNonPermanen.json";
import sejarahDesa from "./data/desa/profile/sejarah_desa.json";
import visiMisiDesa from "./data/desa/profile/visi_misi_desa.json";
import lambangDesa from "./data/desa/profile/lambang_desa.json";
import maskotDesa from "./data/desa/profile/maskot_desa.json";
import profilPerbekel from "./data/desa/profile/profil_perbekel.json";
import kategoriProduk from "./data/ekonomi/pasar-desa/kategori-produk.json";
import hubunganOrganisasi from "./data/ekonomi/struktur-organisasi/hubungan-organisasi.json";
import posisiOrganisasi from "./data/ekonomi/struktur-organisasi/posisi-organisasi.json";
import pegawai from "./data/ekonomi/struktur-organisasi/pegawai.json";
import detailDataPengangguran from './data/ekonomi/jumlah-pengangguran/detail-data-pengangguran.json';
import ringkasanDataPengangguran from './data/ekonomi/jumlah-pengangguran/ringkasan-data-pengangguran.json';
import sedangMencariKerja from './data/ekonomi/jumlah-pengangguran/sedang-mencari-kerja.json';

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
  console.log("✅ profilePerbekel seeded without imageId (editable later via UI)");

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

  for (const s of strukturPPID) {
    await prisma.strukturPPID.upsert({
      where: {
        id: s.id,
      },
      update: {
        name: s.name,
      },
      create: {
        id: s.id,
        name: s.name,
      },
    });
  }
  console.log("struktur ppid success ...");

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
    await prisma.detailDataPengangguran.upsert({
      where: {
        month_year: { month: d.month, year: d.year },
      },
      update: {
        totalUnemployment: d.totalUnemployment,
        educatedUnemployment: d.educatedUnemployment,
        uneducatedUnemployment: d.uneducatedUnemployment,
        percentageChange: d.percentageChange,
      },
      create: {
        month: d.month,
        year: d.year,
        totalUnemployment: d.totalUnemployment,
        educatedUnemployment: d.educatedUnemployment,
        uneducatedUnemployment: d.uneducatedUnemployment,
        percentageChange: d.percentageChange,
      },
    });
  }
  console.log("📊 detailDataPengangguran success ...");
  
  // RingkasanDataPengangguran
  for (const r of ringkasanDataPengangguran) {
    await prisma.ringkasanDataPengangguran.upsert({
      where: {
        year: r.year,
      },
      update: {
        totalUnemployment: r.totalUnemployment,
        educatedUnemployment: r.educatedUnemployment,
        percentageEducatedOfTotal: r.percentageEducatedOfTotal,
        productiveAgePopulation: r.productiveAgePopulation,
        percentageProductiveOfTotal: r.percentageProductiveOfTotal,
        percentageChangeFromPreviousYear: r.percentageChangeFromPreviousYear,
      },
      create: {
        year: r.year,
        totalUnemployment: r.totalUnemployment,
        educatedUnemployment: r.educatedUnemployment,
        percentageEducatedOfTotal: r.percentageEducatedOfTotal,
        productiveAgePopulation: r.productiveAgePopulation,
        percentageProductiveOfTotal: r.percentageProductiveOfTotal,
        percentageChangeFromPreviousYear: r.percentageChangeFromPreviousYear,
      },
    });
  }
  console.log("📈 ringkasanDataPengangguran success ...");
  
  // SedangMencariKerja
  for (const s of sedangMencariKerja) {
    await prisma.sedangMencariKerja.upsert({
      where: {
        recordedDate: new Date(s.recordedDate),
      },
      update: {
        count: s.count,
        percentageOfTotal: s.percentageOfTotal,
      },
      create: {
        recordedDate: new Date(s.recordedDate),
        count: s.count,
        percentageOfTotal: s.percentageOfTotal,
      },
    });
  }
  console.log("💼 sedangMencariKerja success ...");
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
