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
