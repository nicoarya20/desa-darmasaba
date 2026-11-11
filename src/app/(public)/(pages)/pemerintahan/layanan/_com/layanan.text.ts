/** Label UI halaman daftar Layanan Desa (`/pemerintahan/layanan`). */
export const LAYANAN_TEXT = {
  title: "Layanan Desa Darmasaba",
  lead: "Informasi dan pelayanan administrasi desa secara digital.",
  surat: {
    title: "Layanan Surat Keterangan",
    lead: "Pilih surat keterangan sesuai kebutuhan Anda untuk melihat persyaratan, alur, dan mengajukan permohonan.",
    cta: "Lihat layanan",
    searchLabel: "Cari layanan surat keterangan",
    searchPlaceholder: "Cari surat keterangan",
    gridLabel: "Daftar layanan surat keterangan",
    loading: "Memuat layanan surat keterangan",
    empty: "Belum ada layanan surat keterangan.",
    noMatch: (query: string) => `Tidak ada surat keterangan yang cocok dengan “${query}”.`,
  },
  oss: {
    title: "Perizinan Berusaha Berbasis Risiko melalui OSS",
    lead: "Pendaftaran Nomor Induk Berusaha (NIB) melalui Online Single Submission (OSS).",
    stepsTitle: "Alur pendaftaran NIB",
    note: "Persyaratan dan prosedur dapat berubah sewaktu-waktu. Untuk informasi resmi terbaru, kunjungi situs OSS atau hubungi instansi pemerintah terkait.",
    cta: "Buka oss.go.id",
    empty: "Belum ada informasi perizinan berusaha.",
  },
  telunjuk: {
    title: "Layanan Telunjuk Sakti Desa",
    lead: "Terwujudnya sistem administrasi kependudukan terintegrasi berbasis elektronik, cerdas, dan aman.",
    listLabel: "Daftar layanan Telunjuk Sakti Desa",
    loading: "Memuat layanan Telunjuk Sakti Desa",
    empty: "Belum ada layanan Telunjuk Sakti Desa.",
    linkHint: "Buka di tab baru",
  },
  nonPermanen: {
    fallbackTitle: "Pelayanan Penduduk Non-Permanen",
    empty: "Deskripsi belum tersedia.",
  },
} as const;
