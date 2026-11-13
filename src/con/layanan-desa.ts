/** Tujuan layanan: halaman biasa, atau pemicu modal form pengaduan (bukan pindah halaman). */
export type LayananDesaTarget = { link: string } | { opensPengaduanModal: true };

export type LayananDesa = {
  id: 'administrasi' | 'sosial' | 'pengaduan' | 'informasi';
  title: string;
  description: string;
  /** Label aksi di kartu beranda; menyebut apa yang terjadi setelah diklik. */
  cta: string;
} & LayananDesaTarget;

/** Daftar layanan utama desa: satu sumber untuk footer "Layanan Desa" dan section "Layanan Masyarakat" beranda. */
export const LAYANAN_DESA: readonly LayananDesa[] = [
  {
    id: 'administrasi',
    title: 'Administrasi Kependudukan',
    description: 'Lihat persyaratan surat keterangan dan ajukan permohonan secara online.',
    cta: 'Lihat layanan surat',
    link: '/pemerintahan/layanan',
  },
  {
    id: 'sosial',
    title: 'Layanan Sosial',
    description: 'Kenali program bantuan dan pengentasan kemiskinan untuk warga desa.',
    cta: 'Lihat program bantuan',
    link: '/ekonomi/program-kemiskinan',
  },
  {
    id: 'pengaduan',
    title: 'Pengaduan Masyarakat',
    description: 'Sampaikan keluhan, aspirasi, atau laporan langsung kepada pemerintah desa.',
    cta: 'Sampaikan pengaduan',
    opensPengaduanModal: true,
  },
  {
    id: 'informasi',
    title: 'Informasi Publik',
    description: 'Telusuri dokumen dan informasi publik Desa Darmasaba.',
    cta: 'Buka informasi publik',
    link: '/ppid/daftar-informasi-publik',
  },
];
