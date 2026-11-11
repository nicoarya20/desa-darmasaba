/** Rute admin Struktur Perangkat Desa (menu: Pemerintahan → Struktur Perangkat Desa). */
const BASE = '/admin/pemerintahan/struktur-perangkat-desa';

export const STRUKTUR_PERANGKAT_ROUTES = {
  pegawai: `${BASE}/pegawai`,
  pegawaiCreate: `${BASE}/pegawai/create`,
  pegawaiDetail: (id: string) => `${BASE}/pegawai/${id}`,
  pegawaiEdit: (id: string) => `${BASE}/pegawai/${id}/edit`,
  jabatan: `${BASE}/jabatan`,
  jabatanCreate: `${BASE}/jabatan/create`,
  jabatanEdit: (id: string) => `${BASE}/jabatan/${id}/edit`,
  bagan: `${BASE}/bagan`,
} as const;

/** Jumlah pegawai per halaman daftar admin. */
export const PEGAWAI_PAGE_SIZE = 10;
