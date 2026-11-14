/** Satu lowongan untuk daftar publik (hasil adapter dari item API). */
export type Lowongan = {
  id: string;
  posisi: string;
  /** `namaPerusahaan` (trim). */
  pemberiKerja: string;
  /** Kunci saring/URL pemberi kerja: huruf kecil, spasi dirapikan. */
  pemberiKey: string;
  /** `tipePekerjaan` apa adanya (trim, spasi dirapikan); kosong → null. */
  tipe: string | null;
  /** Kunci saring/URL tipe: huruf kecil; null bila `tipe` null. */
  tipeKey: string | null;
  /** Alamat teks bebas; kosong → null. */
  lokasi: string | null;
  /** Rupiah per bulan dari teks `gaji` ("2.500.000" → 2500000, "2000000" → 2000000); tanpa angka, lebih dari satu angka (rentang), atau di bawah GAJI_MIN_WAJAR → null. */
  gaji: number | null;
  /** `deskripsi` sebagai teks polos satu baris (htmlToText); boleh ''. */
  ringkasan: string;
  /** Waktu tayang (epoch ms) dari `createdAt`; tak terbaca → dari `tanggalPosting`; keduanya tak terbaca → 0. */
  tayangMs: number;
};
