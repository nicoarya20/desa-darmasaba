import type { PermohonanStep } from "@/app/(public)/(pages)/ppid/_com/permohonan.meta";
import { ADMINISTRASI_RULES as R } from "./administrasi.meta";

/** Label UI halaman Administrasi Online. */
export const ADMINISTRASI_TEXT = {
  title: "Administrasi Online",
  lead: "Ajukan surat keterangan dan dokumen desa secara daring tanpa perlu datang ke kantor desa.",
  /** Wajib diisi KabarListHeader; kolom cari & pil tidak dirender. */
  searchLabel: "Cari layanan administrasi",
  searchPlaceholder: "Cari layanan administrasi",
  kategoriLabel: "Kategori layanan administrasi",
  stepsTitle: "Alur pengajuan",
  jenisTitle: "Jenis layanan",
  jenisLoading: "Memuat jenis layanan",
  jenisError: "Daftar jenis layanan gagal dimuat. Coba muat ulang halaman.",
  jenisEmpty: "Belum ada jenis layanan yang bisa diajukan.",
  formTitle: "Formulir pengajuan",
  formLead: "Semua isian wajib diisi.",
  name: { label: "Nama lengkap", placeholder: "Nama sesuai KTP" },
  alamat: { label: "Alamat", placeholder: "Alamat tempat tinggal" },
  nomorTelepon: { label: "Nomor telepon", placeholder: "Contoh: 081234567890" },
  jenisLayanan: {
    label: "Jenis layanan",
    placeholder: "Pilih jenis layanan",
    loading: "Memuat jenis layanan",
    unavailable: "Jenis layanan belum tersedia",
  },
  submit: "Kirim pengajuan",
  failed: "Pengajuan gagal dikirim. Periksa koneksi Anda lalu coba lagi.",
  errors: {
    name: `Isi nama lengkap, minimal ${R.minName} huruf.`,
    alamat: `Isi alamat, minimal ${R.minAlamat} karakter.`,
    nomorTelepon: `Isi nomor telepon ${R.minPhone} sampai ${R.maxPhone} digit.`,
    jenisLayananId: "Pilih jenis layanan yang dibutuhkan.",
  },
  sentTitle: "Pengajuan terkirim",
  sentLead: (jenis: string | undefined) =>
    jenis
      ? `Terima kasih. Pengajuan ${jenis} sudah kami terima. Petugas desa akan menghubungi Anda melalui nomor telepon yang Anda cantumkan.`
      : "Terima kasih. Pengajuan Anda sudah kami terima. Petugas desa akan menghubungi Anda melalui nomor telepon yang Anda cantumkan.",
  sentAgain: "Ajukan layanan lain",
} as const;

/** Alur singkat di kolom kiri. */
export const ADMINISTRASI_STEPS: readonly PermohonanStep[] = [
  { title: "Isi formulir", desc: "Lengkapi nama, alamat, nomor telepon, dan jenis layanan yang Anda butuhkan." },
  { title: "Diperiksa petugas", desc: "Petugas desa menerima dan memeriksa pengajuan Anda." },
  { title: "Dihubungi petugas", desc: "Petugas menghubungi nomor telepon Anda untuk langkah berikutnya." },
];
