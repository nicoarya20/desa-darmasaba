import { BEASISWA_LIMIT as L, onlyDigits, stripDigits, type BeasiswaField } from '../../_lib/beasiswaForm';

/** Field teks formulir (jenis kelamin & tanggal lahir dirender terpisah). */
export type TextFieldDef = {
  name: Exclude<BeasiswaField, 'jenisKelamin' | 'tanggalLahir'>;
  label: string;
  placeholder: string;
  maxLength: number;
  inputMode?: 'numeric' | 'tel';
  autoComplete?: string;
  /** Pembersih nilai saat mengetik (buang angka dari nama, sisakan digit di NIS/NIK/HP). */
  sanitize?: (value: string) => string;
  description?: string;
};

const NAMA_SISWA: TextFieldDef = { name: 'namaLengkap', label: 'Nama lengkap siswa', placeholder: 'Sesuai rapor', maxLength: L.nama.max, sanitize: stripDigits };
const NIS: TextFieldDef = { name: 'nis', label: 'NIS', placeholder: 'Nomor induk siswa', maxLength: L.nis.max, inputMode: 'numeric', sanitize: (v) => onlyDigits(v, L.nis.max) };
const KELAS: TextFieldDef = { name: 'kelas', label: 'Kelas', placeholder: 'Contoh: 8B', maxLength: L.kelas.max };
const TEMPAT_LAHIR: TextFieldDef = { name: 'tempatLahir', label: 'Tempat lahir', placeholder: 'Kota/kabupaten', maxLength: L.tempatLahir.max };
const ALAMAT: TextFieldDef = { name: 'alamatDomisili', label: 'Alamat domisili', placeholder: 'Jalan, banjar, Desa Darmasaba', maxLength: L.alamat.max, autoComplete: 'street-address' };

const NAMA_ORTU: TextFieldDef = { name: 'namaOrtu', label: 'Nama orang tua / wali', placeholder: 'Sesuai KTP', maxLength: L.namaOrtu.max, sanitize: stripDigits };
const NIK: TextFieldDef = { name: 'nik', label: 'NIK orang tua / wali', placeholder: '16 digit sesuai KTP', maxLength: L.nik.len, inputMode: 'numeric', sanitize: (v) => onlyDigits(v, L.nik.len) };
const PEKERJAAN: TextFieldDef = { name: 'pekerjaanOrtu', label: 'Pekerjaan', placeholder: 'Contoh: Petani', maxLength: L.pekerjaanOrtu.max };
const PENGHASILAN: TextFieldDef = { name: 'penghasilan', label: 'Penghasilan per bulan', placeholder: 'Contoh: Rp 2.500.000', maxLength: L.penghasilan.max };
const NO_HP: TextFieldDef = {
  name: 'noHp', label: 'Nomor HP (WhatsApp)', placeholder: '08xxxxxxxxxx', maxLength: L.noHp.max, inputMode: 'tel',
  autoComplete: 'tel-national', sanitize: (v) => onlyDigits(v, L.noHp.max), description: 'Dipakai petugas desa untuk menghubungi Anda.',
};

/**
 * Susunan formulir: tiap baris berisi 1 field (selebar) atau 2 field (berdampingan di layar ≥735px).
 * `'tanggalLahir'` & `'jenisKelamin'` = slot field khusus.
 */
export type FormRow = readonly (TextFieldDef | 'tanggalLahir' | 'jenisKelamin')[];

export const SISWA_ROWS: readonly FormRow[] = [[NAMA_SISWA], [NIS, KELAS], ['jenisKelamin'], [TEMPAT_LAHIR, 'tanggalLahir'], [ALAMAT]];
export const ORTU_ROWS: readonly FormRow[] = [[NAMA_ORTU], [NIK], [PEKERJAAN, PENGHASILAN], [NO_HP]];
