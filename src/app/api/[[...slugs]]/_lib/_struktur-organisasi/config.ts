// Konfigurasi factory API struktur organisasi (Perangkat Desa, PPID, BUMDes): tiap struktur punya tabel sendiri,
// kode handler sama. Beda antar-tabel cukup diatur di sini (delegate Prisma, label pesan, soft-delete).

// Argumen query Prisma berbeda tipe per model; bentuk data dijaga oleh select bersama (`http.ts`).
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- delegate Prisma beda model tidak punya supertipe bersama
type DelegateArgs = any;

/** Operasi delegate Prisma yang dipakai handler (mis. `prisma.posisiPerangkatDesa`). */
export type StrukturDelegate = {
  findMany(args: DelegateArgs): Promise<unknown>;
  findUnique(args: DelegateArgs): Promise<unknown>;
  count(args: DelegateArgs): Promise<number>;
  create(args: DelegateArgs): Promise<unknown>;
  update(args: DelegateArgs): Promise<unknown>;
  delete(args: DelegateArgs): Promise<unknown>;
};

export type StrukturApiConfig = {
  /** Delegate tabel jabatan; dibaca saat request (lazy) agar mock prisma di test ikut terpakai. */
  posisi: () => StrukturDelegate;
  /** Delegate tabel pegawai. */
  pegawai: () => StrukturDelegate;
  /** Sebutan pegawai di awal kalimat pesan, mis. "Perangkat desa" / "Pegawai PPID". */
  pegawaiLabel: string;
  /** Sebutan pegawai di tengah kalimat, mis. "perangkat desa" / "pegawai PPID". */
  pegawaiLabelLower: string;
  /**
   * true bila tabel punya kolom `deletedAt` (PPID): hapus = isi `deletedAt` (+ nonaktif), semua baca
   * mengabaikan baris terhapus. false (Perangkat Desa, BUMDes): hapus baris sungguhan.
   */
  softDelete: boolean;
  /** Nama model pemilik foto untuk `removeStoredFile` (menentukan kelompok asal di Sampah, lihat FILE_OWNER_MENU). */
  fileOwner: string;
};

/** Filter baris yang belum dihapus (soft-delete); kosong bila tabel tidak memakai soft-delete. */
export function liveWhere(config: StrukturApiConfig): { deletedAt?: null } {
  return config.softDelete ? { deletedAt: null } : {};
}

/** Isi `_count` relasi: hitung semua baris, atau hanya yang belum dihapus (soft-delete). */
export function liveCount(config: StrukturApiConfig): true | { where: { deletedAt: null } } {
  return config.softDelete ? { where: { deletedAt: null } } : true;
}
