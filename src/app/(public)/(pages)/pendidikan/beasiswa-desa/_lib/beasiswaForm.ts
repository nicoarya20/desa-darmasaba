// Validasi form pendaftaran beasiswa — dipakai bersama oleh halaman utama
// (page.tsx) dan halaman "Pelajari Lebih Lanjut" agar aturannya tunggal &
// tidak menyimpang antar-salinan. Server hanya menjaga min(1) per field; batas
// min/maks karakter yang lebih ketat ditegakkan di sini (sisi klien form publik).

export const BEASISWA_LIMIT = {
  nama: { min: 3, max: 100 },
  nis: { min: 4, max: 18 },
  kelas: { min: 1, max: 30 },
  alamat: { min: 5, max: 200 },
  tempatLahir: { min: 3, max: 50 },
  namaOrtu: { min: 3, max: 100 },
  pekerjaanOrtu: { min: 3, max: 60 },
  penghasilan: { min: 1, max: 30 },
  nik: { len: 16 },
  noHp: { min: 10, max: 13 },
} as const;

export type BeasiswaForm = {
  namaLengkap: string;
  nis: string;
  kelas: string;
  jenisKelamin: string;
  alamatDomisili: string;
  tempatLahir: string;
  tanggalLahir: string;
  namaOrtu: string;
  nik: string;
  pekerjaanOrtu: string;
  penghasilan: string;
  noHp: string;
};

const digits = (v: string | undefined) => (v || '').replace(/\D/g, '');
const len = (v: string | undefined) => (v || '').trim().length;

/**
 * True bila SEMUA field memenuhi batas min/maks. Dipakai untuk men-disable
 * tombol "Kirim". Sengaja hanya cek panjang: sanitasi input (strip digit di
 * nama, strip non-digit di NIS/NIK/HP) sudah ditangani di onChange masing-masing
 * field, jadi di sini cukup memverifikasi hasilnya.
 */
export function isBeasiswaFormValid(f: BeasiswaForm): boolean {
  const nik = digits(f.nik);
  const hp = digits(f.noHp);
  const nis = digits(f.nis);

  return (
    len(f.namaLengkap) >= BEASISWA_LIMIT.nama.min &&
    len(f.namaLengkap) <= BEASISWA_LIMIT.nama.max &&
    nis.length >= BEASISWA_LIMIT.nis.min &&
    len(f.kelas) >= BEASISWA_LIMIT.kelas.min &&
    f.jenisKelamin?.trim() !== '' &&
    len(f.alamatDomisili) >= BEASISWA_LIMIT.alamat.min &&
    len(f.alamatDomisili) <= BEASISWA_LIMIT.alamat.max &&
    len(f.tempatLahir) >= BEASISWA_LIMIT.tempatLahir.min &&
    f.tanggalLahir?.trim() !== '' &&
    len(f.namaOrtu) >= BEASISWA_LIMIT.namaOrtu.min &&
    nik.length === BEASISWA_LIMIT.nik.len &&
    len(f.pekerjaanOrtu) >= BEASISWA_LIMIT.pekerjaanOrtu.min &&
    len(f.penghasilan) >= BEASISWA_LIMIT.penghasilan.min &&
    hp.length >= BEASISWA_LIMIT.noHp.min
  );
}

/** Hilangkan angka dari input nama (nama tidak mengandung digit). */
export const stripDigits = (v: string) => v.replace(/[0-9]/g, '');
