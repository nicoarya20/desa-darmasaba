import type { StrukturState } from '@/app/admin/(dashboard)/_state/struktur-organisasi';

/** Jumlah pegawai per halaman daftar admin. */
export const PEGAWAI_PAGE_SIZE = 10;

/** Rute admin satu struktur di bawah `base` (mis. `/admin/ppid/struktur-ppid`): tab Pegawai · Jabatan · Bagan. */
export function strukturAdminRoutes(base: string) {
  return {
    pegawai: `${base}/pegawai`,
    pegawaiCreate: `${base}/pegawai/create`,
    pegawaiDetail: (id: string) => `${base}/pegawai/${id}`,
    pegawaiEdit: (id: string) => `${base}/pegawai/${id}/edit`,
    jabatan: `${base}/jabatan`,
    jabatanCreate: `${base}/jabatan/create`,
    jabatanEdit: (id: string) => `${base}/jabatan/${id}/edit`,
    bagan: `${base}/bagan`,
  } as const;
}

export type StrukturAdminRoutes = ReturnType<typeof strukturAdminRoutes>;

/** Teks halaman admin per struktur (label umum form/tabel ada di `struktur-admin.text.ts`). */
export type StrukturAdminText = {
  title: string;
  tabs: { pegawai: string; jabatan: string; bagan: string };
  pegawai: {
    listTitle: string;
    searchTitle: string;
    searchPlaceholder: string;
    createTitle: string;
    editTitle: string;
    detailTitle: string;
    hapusKonfirmasi: string;
    nonaktifKonfirmasi: string;
    aktifKonfirmasi: string;
    nonaktifTitle: string;
    aktifTitle: string;
  };
  jabatan: {
    listTitle: string;
    createTitle: string;
    editTitle: string;
    hapusKonfirmasi: (nama: string) => string;
  };
  bagan: { title: string; label: string };
};

/** Konfigurasi halaman admin satu struktur: state (dari `createStrukturState`), rute, dan teks. */
export type StrukturAdminConfig = {
  state: StrukturState;
  routes: StrukturAdminRoutes;
  text: StrukturAdminText;
};
