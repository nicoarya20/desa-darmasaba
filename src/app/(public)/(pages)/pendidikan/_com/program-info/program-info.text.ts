/** Kalimat keadaan modul halaman program CMS (Pendidikan). */
export const PROGRAM_INFO_TEXT = {
  loading: (page: string) => `Memuat informasi ${page}`,
  pageEmpty: (page: string) => `Informasi ${page} belum tersedia.`,
  pageError: (page: string) => `Informasi ${page} gagal dimuat. Coba muat ulang halaman.`,
  sectionEmpty: (section: string) => `Belum ada informasi ${section}.`,
  sectionError: (section: string) => `Informasi ${section} gagal dimuat. Coba muat ulang halaman.`,
} as const;
