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
    pelayananPendudukNonPermanent,
    penghargaan
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
      ...pelayananSuratKeterangan.map((b) => ({ type: "pelayananSuratKeterangan", ...b })),
      ...pelayananPerizinanBerusaha.map((b) => ({ type: "pelayananPerizinanBerusaha", ...b })),
      ...pelayananTelunjukSaktiDesa.map((b) => ({ type: "pelayananTelunjukSaktiDesa", ...b })),
      ...pelayananPendudukNonPermanent.map((b) => ({ type: "pelayananPendudukNonPermanent", ...b })),
      ...penghargaan.map((b) => ({ type: "penghargaan", ...b })),
    ],
    nextPage: null, // bisa dibuat lebih kompleks kalau perlu
  };
}
