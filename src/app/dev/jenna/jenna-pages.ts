/** Header + bentuk skeleton tiap sub-halaman Jenna (dirender oleh ./layout.tsx). */
export type JennaPageMeta = { title: string; subtitle: string; skeletonHeights: readonly number[] };

export const JENNA_PAGES: Readonly<Record<string, JennaPageMeta>> = {
  '/dev/jenna': {
    title: 'Jenna · Umum',
    subtitle: 'Status dan identitas asisten AI yang menjawab pertanyaan warga di website publik desa.',
    skeletonHeights: [120, 220],
  },
  '/dev/jenna/batas': {
    title: 'Jenna · Batas Pemakaian',
    subtitle: 'Batas panjang pesan, kuota pemakaian, dan lama penyimpanan riwayat percakapan.',
    skeletonHeights: [260],
  },
  '/dev/jenna/log-error': {
    title: 'Jenna · Log Error',
    subtitle: 'Giliran yang gagal dijawab Jenna, beserta sebab asli dari provider atau server.',
    skeletonHeights: [420],
  },
  '/dev/jenna/pengetahuan': {
    title: 'Jenna · Pengetahuan',
    subtitle: 'Data website publik yang dibaca Jenna dan tool yang bisa dipakainya saat menjawab. Hanya untuk dilihat.',
    skeletonHeights: [220, 420, 220],
  },
  '/dev/jenna/penggunaan': {
    title: 'Jenna · Penggunaan',
    subtitle: 'Jumlah pertanyaan, token, dan waktu respons Jenna dalam 24 jam dan 7 hari terakhir.',
    skeletonHeights: [160, 160, 260, 220],
  },
  '/dev/jenna/percakapan': {
    title: 'Jenna · Percakapan',
    subtitle:
      'Percakapan pengunjung dengan Jenna (data pribadi sudah disamarkan), disimpan selama masa retensi di Batas Pemakaian.',
    skeletonHeights: [120, 420],
  },
  '/dev/jenna/provider': {
    title: 'Jenna · Provider',
    subtitle: 'Layanan AI yang dipakai Jenna, beserta tes koneksinya.',
    skeletonHeights: [420],
  },
};

const FALLBACK: JennaPageMeta = {
  title: 'Jenna',
  subtitle: 'Asisten AI untuk menjawab pertanyaan warga di website publik desa.',
  skeletonHeights: [220],
};

export const jennaPageMeta = (pathname: string): JennaPageMeta => JENNA_PAGES[pathname] ?? FALLBACK;
