/* eslint-disable @typescript-eslint/no-explicit-any */
import { Context } from "elysia";
import prisma from "@/lib/prisma";

export default async function searchFindMany(context: Context) {
  const { query, page = 1, limit = 10, type } = context.query as any;

  // Convert to numbers
  const pageNum = parseInt(String(page), 10) || 1;
  const limitNum = parseInt(String(limit), 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  if (!query || query.trim() === "") {
    return { data: [], nextPage: null };
  }

  // 🔍 kalau type dikirim → cari spesifik modul
  //========================================= MENU LANDING PAGE ========================================= //
  //========================================= PROFILE ========================================= //
  if (type === "pejabatdesa") {
    const data = await prisma.pejabatDesa.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return {
      data: data.map((b) => ({ type: "pejabatdesa", ...b })),
      nextPage: data.length < limitNum ? null : pageNum + 1,
    };
  }

  if (type === "programinovasi") {
    const data = await prisma.programInovasi.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  if (type === "mediasosial") {
    const data = await prisma.mediaSosial.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  //========================================= DESA ANTI KORUPSI ========================================= //

  if (type === "desaantikorupsi") {
    const data = await prisma.desaAntiKorupsi.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  //========================================= SDGS Desa ========================================= //
  if (type === "sdgsdesa") {
    const data = await prisma.sdgsDesa.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  //========================================= APBDes ========================================= //
  if (type === "apbdes") {
    const data = await prisma.aPBDes.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  //========================================= PRESTASI DESA ========================================= //
  if (type === "prestasidesa") {
    const data = await prisma.prestasiDesa.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  //========================================= INDEKS KEPUASAAN MASYARAKAT ========================================= //
  if (type === "responden") {
    const data = await prisma.responden.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  //========================================= MENU PPID ========================================= //
  //========================================= STRUKTUR PPID ========================================= //
  if (type === "strukturppid") {
    const data = await prisma.strukturPPID.findMany({
      where: {
        PegawaiPPID: { namaLengkap: { contains: query, mode: "insensitive" } },
      },
      include: {
        PosisiOrganisasiPPID: true,
        PegawaiPPID: true,
      },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= VISI MISI PPID ========================================= //
  if (type === "visimisippid") {
    const data = await prisma.visiMisiPPID.findMany({
      where: {
        visi: { contains: query, mode: "insensitive" },
        misi: { contains: query, mode: "insensitive" },
      },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  //

  // ========================================= DASAR HUKUM PPID ========================================= //
  if (type === "dasarhukumppid") {
    const data = await prisma.dasarHukumPPID.findMany({
      where: { judul: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= PROFILE PPID ========================================= //
  if (type === "profileppid") {
    const data = await prisma.profilePPID.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= DAFTAR INFORMASI PUBLIK ========================================= //
  if (type === "daftarinformasipublik") {
    const data = await prisma.daftarInformasiPublik.findMany({
      where: { jenisInformasi: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  //=========================================PERMOHONAN INFORMASI PUBLIK========================= //
  if (type === "permohonaninformasipublik") {
    const data = await prisma.permohonanInformasiPublik.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  //=========================================PERMOHONAN INFORMASI KEBERATAN PUBLIK========================= //
  if (type === "permohonaninformasikeberatanpublik") {
    const data = await prisma.formulirPermohonanKeberatan.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= IKM ========================================= //
  if (type === "ikm") {
    const data = await prisma.indeksKepuasanMasyarakat.findMany({
      where: { label: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= MENU DESA ========================================= //
  // ========================================= PROFILE DESA ========================================= //
  if (type === "sejarahdesa") {
    const data = await prisma.sejarahDesa.findMany({
      where: { judul: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  if (type === "visimisidesa") {
    const data = await prisma.visiMisiDesa.findMany({
      where: { visi: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  if (type === "lambangdesa") {
    const data = await prisma.lambangDesa.findMany({
      where: { judul: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  if (type === "maskotdesa") {
    const data = await prisma.maskotDesa.findMany({
      where: { judul: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  if (type === "profilperbekel") {
    const data = await prisma.profilPerbekel.findMany({
      where: { biodata: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  if (type === "perbekeldarmasaba") {
    const data = await prisma.perbekelDariMasaKeMasa.findMany({
      where: { nama: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= BERITA ========================================= //
  if (type === "berita") {
    const data = await prisma.berita.findMany({
      where: { judul: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  if (type === "kategoriBerita") {
    const data = await prisma.kategoriBerita.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= POTENSI DESA ========================================= //
  if (type === "potensi") {
    const data = await prisma.potensiDesa.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= PENGUMUMAN ========================================= //
  if (type === "pengumuman") {
    const data = await prisma.pengumuman.findMany({
      where: { judul: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= GALLERY ========================================= //
  if (type === "galleryFoto") {
    const data = await prisma.galleryFoto.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  if (type === "galleryVideo") {
    const data = await prisma.galleryVideo.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= LAYANAN DESA ========================================= //
  if (type === "pelayananSuratKeterangan") {
    const data = await prisma.pelayananSuratKeterangan.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  if (type === "pelayananPerizinanBerusaha") {
    const data = await prisma.pelayananPerizinanBerusaha.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  if (type === "pelayananTelunjukSaktiDesa") {
    const data = await prisma.pelayananTelunjukSaktiDesa.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  if (type === "pelayananPendudukNonPermanen") {
    const data = await prisma.pelayananPendudukNonPermanen.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= PENGHARGAAN ========================================= //
  if (type === "penghargaan") {
    const data = await prisma.penghargaan.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= MENU KESEHATAN ========================================= //
  // ========================================= POSYANDU ========================================= //
  if (type === "posyandu") {
    const data = await prisma.posyandu.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }
  // ========================================= DATA KESEHATAN WARGA ========================================= //
  // ========================================= FASILITAS KESEHATAN ========================================= //
  if (type === "fasilitasKesehatan") {
    const data = await prisma.fasilitasKesehatan.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
        informasiumum: { fasilitas: { contains: query, mode: "insensitive" } },
        layananunggulan: { content: { contains: query, mode: "insensitive" } },
        dokterdantenagamedis: {
          name: { contains: query, mode: "insensitive" },
        },
        fasilitaspendukung: {
          content: { contains: query, mode: "insensitive" },
        },
        prosedurpendaftaran: {
          content: { contains: query, mode: "insensitive" },
        },
        tarifdanlayanan: { layanan: { contains: query, mode: "insensitive" } },
      },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= JADWAL KEGIATAN ========================================= //
  if (type === "jadwalKegiatan") {
    const data = await prisma.jadwalKegiatan.findMany({
      where: {
        content: { contains: query, mode: "insensitive" },
        informasijadwalkegiatan: {
          name: { contains: query, mode: "insensitive" },
        },
        deskripsijadwalkegiatan: {
          deskripsi: { contains: query, mode: "insensitive" },
        },
        layananjadwalkegiatan: {
          content: { contains: query, mode: "insensitive" },
        },
        syaratketentuanjadwalkegiatan: {
          content: { contains: query, mode: "insensitive" },
        },
        dokumenjadwalkegiatan: {
          content: { contains: query, mode: "insensitive" },
        },
        pendaftaranjadwalkegiatan: {
          name: { contains: query, mode: "insensitive" },
        },
      },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= ARTIKEL KESEHATAN ========================================= //
  if (type === "artikelKesehatan") {
    const data = await prisma.artikelKesehatan.findMany({
      where: {
        title: { contains: query, mode: "insensitive" },
        content: { contains: query, mode: "insensitive" },
        introduction: {
          content: { contains: query, mode: "insensitive" },
        },
        symptom: {
          title: { contains: query, mode: "insensitive" },
        },
        prevention: {
          title: { contains: query, mode: "insensitive" },
        },
        firstaid: {
          title: { contains: query, mode: "insensitive" },
        },
        mythvsfact: {
          title: { contains: query, mode: "insensitive" },
        },
        doctorsign: {
          content: { contains: query, mode: "insensitive" },
        },
      },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= PUSKESMAS ========================================= //
  if (type === "puskesmas") {
    const data = await prisma.puskesmas.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= PROGRAM KESEHATAN ========================================= //
  if (type === "programKesehatan") {
    const data = await prisma.programKesehatan.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= PENANGANAN DARURAT ========================================= //
  if (type === "penangananDarurat") {
    const data = await prisma.penangananDarurat.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= KONTAK DARURAT ========================================= //
  if (type === "kontakDarurat") {
    const data = await prisma.kontakDarurat.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= INFO WABAH PENYAKIT ========================================= //
  if (type === "infoWabahPenyakit") {
    const data = await prisma.infoWabahPenyakit.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= MENU KEAMANAN ========================================= //
  // ========================================= KEAMANAN LINGKUNGAN ========================================= //
  if (type === "keamananLingkungan") {
    const data = await prisma.keamananLingkungan.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= POLSEK TERDEKAT ========================================= //
  if (type === "polsekTerdekat") {
    const data = await prisma.polsekTerdekat.findMany({
      where: { nama: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= KONTAK DARURAT ========================================= //
  if (type === "kontakDaruratKeamanan") {
    const data = await prisma.kontakDaruratKeamanan.findMany({
      where: { nama: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= PENCEGAHAN KRIMINALITAS ========================================= //
  if (type === "pencegahanKriminalitas") {
    const data = await prisma.pencegahanKriminalitas.findMany({
      where: { judul: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= LAPORAN PUBLIK ========================================= //
  if (type === "laporanPublik") {
    const data = await prisma.laporanPublik.findMany({
      where: { judul: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= TIPS KEAMANAN ========================================= //
  if (type === "tipsKeamanan") {
    const data = await prisma.menuTipsKeamanan.findMany({
      where: { judul: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= MENU EKONOMI ========================================= //
  // ========================================= PASAR DESA ========================================= //
  if (type === "pasarDesa") {
    const data = await prisma.pasarDesa.findMany({
      where: { nama: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= LOWONGAN KERJA LOKAL ========================================= //
  if (type === "lowonganKerjaLokal") {
    const data = await prisma.lowonganPekerjaan.findMany({
      where: { 
        OR: [
          { posisi: { contains: query, mode: "insensitive" } },
          { namaPerusahaan: { contains: query, mode: "insensitive" } },
          { lokasi: { contains: query, mode: "insensitive" } },
          { tipePekerjaan: { contains: query, mode: "insensitive" } },
          { gaji: { contains: query, mode: "insensitive" } },
          { deskripsi: { contains: query, mode: "insensitive" } },
          { kualifikasi: { contains: query, mode: "insensitive" } },
          { notelp: { contains: query, mode: "insensitive" } },
        ],
      },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }
  // ========================================= STRUKTUR ORGANISASI ========================================= //
  if (type === "strukturOrganisasi") {
    const data = await prisma.strukturBumDes.findMany({
      where: { 
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { PosisiOrganisasiBumDes: { nama: { contains: query, mode: "insensitive" } } },
          { PegawaiBumDes: { namaLengkap: { contains: query, mode: "insensitive" } } },
        ],
      },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }
 
  // ========================================= JUMLAH PENDUDUK USIA KERJA YANG MENGANGGUR ========================================= //
  if (type === "jumlahPendudukUsiaKerjaYangMenganggurUsia") {
    const data = await prisma.grafikMenganggurBerdasarkanUsia.findMany({
      where: { 
        OR: [
          { usia18_25: { contains: query, mode: "insensitive" } },
          { usia26_35: { contains: query, mode: "insensitive" } },
          { usia36_45: { contains: query, mode: "insensitive" } },
          { usia46_keatas: { contains: query, mode: "insensitive" } },
        ],
      },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= JUMLAH PENDUDUK USIA KERJA YANG MENGANGGUR ========================================= //
  if (type === "jumlahPendudukUsiaKerjaYangMenganggurPendidikan") {
    const data = await prisma.grafikMenganggurBerdasarkanPendidikan.findMany({
      where: { 
        OR: [
          { SD: { contains: query, mode: "insensitive" } },
          { SMP: { contains: query, mode: "insensitive" } },
          { SMA: { contains: query, mode: "insensitive" } },
          { D3: { contains: query, mode: "insensitive" } },
          { S1: { contains: query, mode: "insensitive" } },
        ],
      },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= JUMLAH PENDUDUK MISKIN ========================================= //
  if (type === "jumlahPendudukMiskin") {
    const data = await prisma.grafikJumlahPendudukMiskin.findMany({
      where: {
        OR: [
          // Convert year to string for partial matching
          ...(isNaN(Number(query)) ? [] : [
            { year: { equals: Number(query) } }
          ]),
          // Convert totalPoorPopulation to string for partial matching
          ...(isNaN(Number(query)) ? [] : [
            { totalPoorPopulation: { equals: Number(query) } }
          ])
        ].filter(Boolean), // Remove any empty arrays from the spread
      },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }
  // ========================================= PROGRAM KEMISKINAN ========================================= //
  if (type === "programKemiskinan") {
    const data = await prisma.programKemiskinan.findMany({
      where: { 
        OR: [
          { nama: { contains: query, mode: "insensitive" } },
          { deskripsi: { contains: query, mode: "insensitive" } },
        ],
      },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }


  // ========================================= SEKTOR UNGGULAN DESA ========================================= //
  if (type === "sektorUnggulanDesa") {
    const data = await prisma.sektorUnggulanDesa.findMany({
      where: { 
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } }
        ],
      },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // ========================================= DEMOGRAFI PEKERJAAN ========================================= //
  if (type === "demografiPekerjaan") {
    const data = await prisma.dataDemografiPekerjaan.findMany({
      where: { pekerjaan: { contains: query, mode: "insensitive" } },
      skip,
      take: limitNum,
    });
    return { data, nextPage: data.length < limitNum ? null : pageNum + 1 };
  }

  // 🌍 GLOBAL SEARCH — cari di beberapa modul sekaligus
  const [
    pejabatdesa,
    programinovasi,
    mediasosial,
    desaantikorupsi,
    sdgsdesa,
    apbdes,
    prestasidesa,
    responden,
    strukturppid,
    visimisippid,
    dasarhukumppid,
    profileppid,
    daftarinformasipublik,
    permohonaninformasipublik,
    permohonaninformasikeberatanpublik,
    ikm,
    sejarahdesa,
    visimisidesa,
    lambangdesa,
    maskotdesa,
    profilperbekel,
    perbekeldarmasaba,
    berita,
    kategoriBerita,
    potensi,
    pengumuman,
    galleryFoto,
    galleryVideo,
    pelayananSuratKeterangan,
    pelayananPerizinanBerusaha,
    pelayananTelunjukSaktiDesa,
    pelayananPendudukNonPermanen,
    penghargaan,
    posyandu,
    fasilitasKesehatan,
    jadwalKegiatan,
    artikelKesehatan,
    puskesmas,
    programKesehatan,
    penangananDarurat,
    kontakDarurat,
    infoWabahPenyakit,
    keamananLingkungan,
    polsekTerdekat,
    kontakDaruratKeamanan,
    pencegahanKriminalitas,
    laporanPublik,
    tipsKeamanan,
    pasarDesa,
    lowonganKerjaLokal,
    strukturOrganisasi,
    jumlahPendudukUsiaKerjaYangMenganggurUsia,
    jumlahPendudukUsiaKerjaYangMenganggurPendidikan,
    jumlahPendudukMiskin,
    programKemiskinan,
    sektorUnggulanDesa,
    demografiPekerjaan,
  ] = await Promise.all([
    prisma.pejabatDesa.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.programInovasi.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.mediaSosial.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.desaAntiKorupsi.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.sdgsDesa.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.aPBDes.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.prestasiDesa.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.responden.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    // ✅ FIXED
    prisma.strukturPPID.findMany({
      where: {
        PegawaiPPID: { namaLengkap: { contains: query, mode: "insensitive" } },
      },
      include: { PegawaiPPID: true },
      take: limitNum,
    }),
    prisma.visiMisiPPID.findMany({
      where: {
        OR: [
          { visi: { contains: query, mode: "insensitive" } },
          { misi: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limitNum,
    }),
    prisma.dasarHukumPPID.findMany({
      where: { judul: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.profilePPID.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.daftarInformasiPublik.findMany({
      where: { jenisInformasi: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.permohonanInformasiPublik.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.formulirPermohonanKeberatan.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.indeksKepuasanMasyarakat.findMany({
      where: { label: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.sejarahDesa.findMany({
      where: { judul: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.visiMisiDesa.findMany({
      where: {
        OR: [
          { visi: { contains: query, mode: "insensitive" } },
          { misi: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limitNum,
    }),
    prisma.lambangDesa.findMany({
      where: { judul: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.maskotDesa.findMany({
      where: { judul: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.profilPerbekel.findMany({
      where: { biodata: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.perbekelDariMasaKeMasa.findMany({
      where: { nama: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.berita.findMany({
      where: { judul: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.kategoriBerita.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.potensiDesa.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.pengumuman.findMany({
      where: { judul: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.galleryFoto.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.galleryVideo.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.pelayananSuratKeterangan.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.pelayananPerizinanBerusaha.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.pelayananTelunjukSaktiDesa.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.pelayananPendudukNonPermanen.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.penghargaan.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.posyandu.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.fasilitasKesehatan.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
        informasiumum: { fasilitas: { contains: query, mode: "insensitive" } },
        layananunggulan: { content: { contains: query, mode: "insensitive" } },
        dokterdantenagamedis: {
          name: { contains: query, mode: "insensitive" },
        },
        fasilitaspendukung: {
          content: { contains: query, mode: "insensitive" },
        },
        prosedurpendaftaran: {
          content: { contains: query, mode: "insensitive" },
        },
        tarifdanlayanan: { layanan: { contains: query, mode: "insensitive" } },
      },
      take: limitNum,
    }),
    prisma.jadwalKegiatan.findMany({
      where: {
        content: { contains: query, mode: "insensitive" },
        informasijadwalkegiatan: {
          name: { contains: query, mode: "insensitive" },
        },
        deskripsijadwalkegiatan: {
          deskripsi: { contains: query, mode: "insensitive" },
        },
        layananjadwalkegiatan: {
          content: { contains: query, mode: "insensitive" },
        },
        syaratketentuanjadwalkegiatan: {
          content: { contains: query, mode: "insensitive" },
        },
        dokumenjadwalkegiatan: {
          content: { contains: query, mode: "insensitive" },
        },
        pendaftaranjadwalkegiatan: {
          name: { contains: query, mode: "insensitive" },
        },
      },
      take: limitNum,
    }),
    prisma.artikelKesehatan.findMany({
      where: {
        title: { contains: query, mode: "insensitive" },
        content: { contains: query, mode: "insensitive" },
        introduction: {
          content: { contains: query, mode: "insensitive" },
        },
        symptom: {
          title: { contains: query, mode: "insensitive" },
        },
        prevention: {
          title: { contains: query, mode: "insensitive" },
        },
        firstaid: {
          title: { contains: query, mode: "insensitive" },
        },
        mythvsfact: {
          title: { contains: query, mode: "insensitive" },
        },
        doctorsign: {
          content: { contains: query, mode: "insensitive" },
        },
      },
      take: limitNum,
    }),
    prisma.puskesmas.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.programKesehatan.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.penangananDarurat.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.kontakDarurat.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.infoWabahPenyakit.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.keamananLingkungan.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.polsekTerdekat.findMany({
      where: { nama: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.kontakDaruratKeamanan.findMany({
      where: { nama: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.pencegahanKriminalitas.findMany({
      where: { judul: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.laporanPublik.findMany({
      where: { judul: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.menuTipsKeamanan.findMany({
      where: { judul: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.pasarDesa.findMany({
      where: { nama: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.lowonganPekerjaan.findMany({
      where: { posisi: { contains: query, mode: "insensitive" } },
      take: limitNum,
    }),
    prisma.strukturBumDes.findMany({
      where: { 
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { PosisiOrganisasiBumDes: { nama: { contains: query, mode: "insensitive" } } },
          { PegawaiBumDes: { namaLengkap: { contains: query, mode: "insensitive" } } },
        ],
      },
      take: limitNum,
    }),
    prisma.grafikMenganggurBerdasarkanUsia.findMany({
      where: { 
        OR: [
          { usia18_25: { contains: query, mode: "insensitive" } },
          { usia26_35: { contains: query, mode: "insensitive" } },
          { usia36_45: { contains: query, mode: "insensitive" } },
          { usia46_keatas: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limitNum,
    }),
    prisma.grafikMenganggurBerdasarkanPendidikan.findMany({
      where: { 
        OR: [
          { SD: { contains: query, mode: "insensitive" } },
          { SMP: { contains: query, mode: "insensitive" } },
          { SMA: { contains: query, mode: "insensitive" } },
          { D3: { contains: query, mode: "insensitive" } },
          { S1: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limitNum,
    }),
    prisma.grafikJumlahPendudukMiskin.findMany({
      where: { 
        OR: [
          ...(isNaN(Number(query)) ? [] : [
            { year: { equals: Number(query) } },
            { totalPoorPopulation: { equals: Number(query) } }
          ])
        ].filter(Boolean),
      },
      take: limitNum,
    }),
    prisma.programKemiskinan.findMany({
      where: { 
        OR: [
          { nama: { contains: query, mode: "insensitive" } },
          { deskripsi: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limitNum,
    }),
    prisma.sektorUnggulanDesa.findMany({
      where: { 
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } }
        ],
      },
      take: limitNum,
    }),
    prisma.dataDemografiPekerjaan.findMany({
      where: { 
        pekerjaan: { contains: query, mode: "insensitive" } 
      },
      take: limitNum,
    })
  ]);

  return {
    data: [
      ...pejabatdesa.map((b) => ({ type: "pejabatdesa", ...b })),
      ...programinovasi.map((b) => ({ type: "programinovasi", ...b })),
      ...mediasosial.map((b) => ({ type: "mediaSosial", ...b })),
      ...desaantikorupsi.map((b) => ({ type: "desaantikorupsi", ...b })),
      ...sdgsdesa.map((b) => ({ type: "sdgsdesa", ...b })),
      ...apbdes.map((b) => ({ type: "apbdes", ...b })),
      ...prestasidesa.map((b) => ({ type: "prestasidesa", ...b })),
      ...responden.map((b) => ({ type: "responden", ...b })),
      ...strukturppid.map((b) => ({ type: "strukturppid", ...b })),
      ...visimisippid.map((b) => ({ type: "visimisippid", ...b })),
      ...dasarhukumppid.map((b) => ({ type: "dasarhukumppid", ...b })),
      ...profileppid.map((b) => ({ type: "profileppid", ...b })),
      ...daftarinformasipublik.map((b) => ({
        type: "daftarinformasipublik",
        ...b,
      })),
      ...permohonaninformasipublik.map((b) => ({
        type: "permohonaninformasipublik",
        ...b,
      })),
      ...permohonaninformasikeberatanpublik.map((b) => ({
        type: "permohonaninformasikeberatanpublik",
        ...b,
      })),
      ...ikm.map((b) => ({ type: "ikm", ...b })),
      ...sejarahdesa.map((b) => ({ type: "sejarahdesa", ...b })),
      ...visimisidesa.map((b) => ({ type: "visimisidesa", ...b })),
      ...lambangdesa.map((b) => ({ type: "lambangdesa", ...b })),
      ...maskotdesa.map((b) => ({ type: "maskotdesa", ...b })),
      ...profilperbekel.map((b) => ({ type: "profilperbekel", ...b })),
      ...perbekeldarmasaba.map((b) => ({ type: "perbekeldarmasaba", ...b })),
      ...berita.map((b) => ({ type: "berita", ...b })),
      ...kategoriBerita.map((b) => ({ type: "kategoriBerita", ...b })),
      ...potensi.map((b) => ({ type: "potensi", ...b })),
      ...pengumuman.map((b) => ({ type: "pengumuman", ...b })),
      ...galleryFoto.map((b) => ({ type: "galleryFoto", ...b })),
      ...galleryVideo.map((b) => ({ type: "galleryVideo", ...b })),
      ...pelayananSuratKeterangan.map((b) => ({
        type: "pelayananSuratKeterangan",
        ...b,
      })),
      ...pelayananPerizinanBerusaha.map((b) => ({
        type: "pelayananPerizinanBerusaha",
        ...b,
      })),
      ...pelayananTelunjukSaktiDesa.map((b) => ({
        type: "pelayananTelunjukSaktiDesa",
        ...b,
      })),
      ...pelayananPendudukNonPermanen.map((b) => ({
        type: "pelayananPendudukNonPermanen",
        ...b,
      })),
      ...penghargaan.map((b) => ({ type: "penghargaan", ...b })),
      ...posyandu.map((b) => ({ type: "posyandu", ...b })),
      ...fasilitasKesehatan.map((b) => ({ type: "fasilitasKesehatan", ...b })),
      ...jadwalKegiatan.map((b) => ({ type: "jadwalKegiatan", ...b })),
      ...artikelKesehatan.map((b) => ({ type: "artikelKesehatan", ...b })),
      ...puskesmas.map((b) => ({ type: "puskesmas", ...b })),
      ...programKesehatan.map((b) => ({ type: "programKesehatan", ...b })),
      ...penangananDarurat.map((b) => ({ type: "penangananDarurat", ...b })),
      ...kontakDarurat.map((b) => ({ type: "kontakDarurat", ...b })),
      ...infoWabahPenyakit.map((b) => ({ type: "infoWabahPenyakit", ...b })),
      ...keamananLingkungan.map((b) => ({ type: "keamananLingkungan", ...b })),
      ...polsekTerdekat.map((b) => ({ type: "polsekTerdekat", ...b })),
      ...kontakDaruratKeamanan.map((b) => ({ type: "kontakDaruratKeamanan", ...b })),
      ...pencegahanKriminalitas.map((b) => ({ type: "pencegahanKriminalitas", ...b })),
      ...laporanPublik.map((b) => ({ type: "laporanPublik", ...b })),
      ...tipsKeamanan.map((b) => ({ type: "tipsKeamanan", ...b })),
      ...pasarDesa.map((b) => ({ type: "pasarDesa", ...b })),
      ...lowonganKerjaLokal.map((b) => ({ type: "lowonganKerjaLokal", ...b })),
      ...strukturOrganisasi.map((b) => ({ type: "strukturOrganisasi", ...b })),
      ...jumlahPendudukUsiaKerjaYangMenganggurUsia.map((b) => ({ type: "jumlahPendudukUsiaKerjaYangMenganggurUsia", ...b })),
      ...jumlahPendudukUsiaKerjaYangMenganggurPendidikan.map((b) => ({ type: "jumlahPendudukUsiaKerjaYangMenganggurPendidikan", ...b })),
      ...jumlahPendudukMiskin.map((b) => ({ type: "jumlahPendudukMiskin", ...b })),
      ...programKemiskinan.map((b) => ({ type: "programKemiskinan", ...b })),
      ...sektorUnggulanDesa.map((b) => ({ type: "sektorUnggulanDesa", ...b })),
      ...demografiPekerjaan.map((b) => ({ type: "demografiPekerjaan", ...b })),

    ],
    nextPage: null, // bisa dibuat lebih kompleks kalau perlu
  };
}
