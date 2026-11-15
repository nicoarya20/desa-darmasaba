// Validasi form pendaftaran beasiswa (modal di /pendidikan/beasiswa-desa). Server hanya menjaga tipe
// string per field; batas min/maks, format NIK/HP, dan tanggal lahir ditegakkan di sini (sisi klien form publik).

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

export type BeasiswaField = keyof BeasiswaForm;
export type BeasiswaErrors = Partial<Record<BeasiswaField, string>>;

/** Nilai enum `JenisKelamin` yang diterima API. */
export const JENIS_KELAMIN = ['LAKI_LAKI', 'PEREMPUAN'] as const;

/** Urutan field = urutan tampil di formulir (dipakai untuk menandai semua field saat kirim). */
export const BEASISWA_FIELDS: readonly BeasiswaField[] = [
  'namaLengkap', 'nis', 'kelas', 'jenisKelamin', 'tempatLahir', 'tanggalLahir', 'alamatDomisili',
  'namaOrtu', 'nik', 'pekerjaanOrtu', 'penghasilan', 'noHp',
];

export const EMPTY_BEASISWA_FORM: BeasiswaForm = {
  namaLengkap: '', nis: '', kelas: '', jenisKelamin: '', alamatDomisili: '', tempatLahir: '',
  tanggalLahir: '', namaOrtu: '', nik: '', pekerjaanOrtu: '', penghasilan: '', noHp: '',
};

const L = BEASISWA_LIMIT;

/** Pesan galat per field (bahasa pengunjung, bukan nama field API). */
export const BEASISWA_ERROR = {
  nama: `Nama minimal ${L.nama.min} karakter`,
  nisEmpty: 'NIS wajib diisi',
  nis: `NIS minimal ${L.nis.min} digit`,
  kelas: 'Kelas wajib diisi',
  jenisKelamin: 'Jenis kelamin wajib dipilih',
  alamat: `Alamat minimal ${L.alamat.min} karakter`,
  tempatLahir: `Tempat lahir minimal ${L.tempatLahir.min} karakter`,
  tanggalEmpty: 'Tanggal lahir wajib diisi',
  tanggalFuture: 'Tanggal lahir tidak boleh melewati hari ini',
  namaOrtu: `Nama orang tua/wali minimal ${L.namaOrtu.min} karakter`,
  nikEmpty: 'NIK wajib diisi',
  nik: `NIK harus ${L.nik.len} digit`,
  pekerjaanOrtu: `Pekerjaan minimal ${L.pekerjaanOrtu.min} karakter`,
  penghasilan: 'Penghasilan wajib diisi',
  noHpEmpty: 'Nomor HP wajib diisi',
  noHpLength: `Nomor HP ${L.noHp.min}–${L.noHp.max} digit`,
  noHpPrefix: 'Nomor HP diawali 08 atau 62',
} as const;

const digits = (v: string | undefined) => (v || '').replace(/\D/g, '');
const len = (v: string | undefined) => (v || '').trim().length;
const pad = (n: number) => String(n).padStart(2, '0');

/** Tanggal lokal `YYYY-MM-DD` (format nilai `<input type="date">`), dipakai sebagai batas `max` tanggal lahir. */
export function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const minLen = (value: string, min: number, message: string) => (len(value) < min ? message : null);

/** Pesan galat satu field, `null` bila valid. `today` bisa diganti untuk test. */
export function beasiswaFieldError(field: BeasiswaField, f: BeasiswaForm, today = new Date()): string | null {
  switch (field) {
    case 'namaLengkap': return minLen(f.namaLengkap, L.nama.min, BEASISWA_ERROR.nama);
    case 'nis': {
      const n = digits(f.nis).length;
      return n === 0 ? BEASISWA_ERROR.nisEmpty : n < L.nis.min ? BEASISWA_ERROR.nis : null;
    }
    case 'kelas': return minLen(f.kelas, L.kelas.min, BEASISWA_ERROR.kelas);
    case 'jenisKelamin':
      return (JENIS_KELAMIN as readonly string[]).includes(f.jenisKelamin) ? null : BEASISWA_ERROR.jenisKelamin;
    case 'alamatDomisili': return minLen(f.alamatDomisili, L.alamat.min, BEASISWA_ERROR.alamat);
    case 'tempatLahir': return minLen(f.tempatLahir, L.tempatLahir.min, BEASISWA_ERROR.tempatLahir);
    case 'tanggalLahir': {
      const v = (f.tanggalLahir || '').trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return BEASISWA_ERROR.tanggalEmpty;
      // String ISO tanggal bisa dibandingkan leksikal.
      return v > toDateInputValue(today) ? BEASISWA_ERROR.tanggalFuture : null;
    }
    case 'namaOrtu': return minLen(f.namaOrtu, L.namaOrtu.min, BEASISWA_ERROR.namaOrtu);
    case 'nik': {
      const n = digits(f.nik).length;
      return n === 0 ? BEASISWA_ERROR.nikEmpty : n !== L.nik.len ? BEASISWA_ERROR.nik : null;
    }
    case 'pekerjaanOrtu': return minLen(f.pekerjaanOrtu, L.pekerjaanOrtu.min, BEASISWA_ERROR.pekerjaanOrtu);
    case 'penghasilan': return minLen(f.penghasilan, L.penghasilan.min, BEASISWA_ERROR.penghasilan);
    case 'noHp': {
      const hp = digits(f.noHp);
      if (hp.length === 0) return BEASISWA_ERROR.noHpEmpty;
      if (!hp.startsWith('08') && !hp.startsWith('62')) return BEASISWA_ERROR.noHpPrefix;
      return hp.length < L.noHp.min || hp.length > L.noHp.max ? BEASISWA_ERROR.noHpLength : null;
    }
  }
}

/** Semua galat formulir; objek kosong = siap dikirim. */
export function beasiswaFormErrors(f: BeasiswaForm, today = new Date()): BeasiswaErrors {
  const errors: BeasiswaErrors = {};
  for (const field of BEASISWA_FIELDS) {
    const message = beasiswaFieldError(field, f, today);
    if (message) errors[field] = message;
  }
  return errors;
}

/** True bila semua field valid. */
export function isBeasiswaFormValid(f: BeasiswaForm, today = new Date()): boolean {
  return Object.keys(beasiswaFormErrors(f, today)).length === 0;
}

/** Badan POST `beasiswapendaftar/create`: teks di-trim, NIS/NIK/HP hanya digit. Field & tipe sama dengan kontrak API. */
export function toBeasiswaPayload(f: BeasiswaForm) {
  return {
    namaLengkap: f.namaLengkap.trim(),
    nis: digits(f.nis),
    kelas: f.kelas.trim(),
    jenisKelamin: f.jenisKelamin as (typeof JENIS_KELAMIN)[number],
    alamatDomisili: f.alamatDomisili.trim(),
    tempatLahir: f.tempatLahir.trim(),
    tanggalLahir: f.tanggalLahir.trim(),
    namaOrtu: f.namaOrtu.trim(),
    nik: digits(f.nik),
    pekerjaanOrtu: f.pekerjaanOrtu.trim(),
    penghasilan: f.penghasilan.trim(),
    noHp: digits(f.noHp),
  };
}

export type BeasiswaPayload = ReturnType<typeof toBeasiswaPayload>;

/** Hilangkan angka dari input nama (nama tidak mengandung digit). */
export const stripDigits = (v: string) => v.replace(/[0-9]/g, '');

/** Sisakan digit saja, dipotong ke panjang maksimum (NIS/NIK/HP). */
export const onlyDigits = (v: string, max: number) => v.replace(/\D/g, '').slice(0, max);
