import type { PermohonanStep } from "@/app/(public)/(pages)/ppid/_com/permohonan.meta";
import type { IdeField } from "./ajukan-ide.logic";

/** Label UI halaman Ajukan Ide Inovatif (tanpa em dash). */
export const AJUKAN_IDE_TEXT = {
  title: "Ajukan Ide Inovatif",
  lead: "Punya gagasan untuk memajukan Desa Darmasaba? Ceritakan lewat formulir ini; setiap ide warga dibaca dan dapat dibahas bersama di Musyawarah Desa.",
  /** Wajib diisi KabarListHeader walau kolom cari & pil tidak dirender. */
  searchLabel: "Cari",
  kategoriLabel: "Kategori",
  tujuanTitle: "Tujuan",
  tujuan: [
    "Mendorong partisipasi aktif masyarakat",
    "Memfasilitasi inovasi berbasis lokal",
    "Memecahkan tantangan komunal",
    "Mengembangkan potensi kreativitas warga",
  ],
  stepsTitle: "Setelah ide dikirim",
  formTitle: "Formulir ide inovatif",
  formLead: "Semua isian wajib diisi.",
  /** Pesan isian kosong per isian, senada Administrasi Online ("Isi nama lengkap, ..."). */
  required: {
    name: "Isi nama lengkap.",
    alamat: "Isi alamat atau banjar tempat tinggal.",
    namaIde: "Isi nama ide, cukup judul singkat.",
    deskripsi: "Jelaskan ide Anda.",
    masalah: "Isi masalah yang ingin dipecahkan ide ini.",
    benefit: "Isi manfaat ide bagi warga dan desa.",
  } satisfies Record<IdeField, string>,
  tooLong: (max: number) => `Maksimal ${max} karakter.`,
  count: (length: number, max: number) => `${length}/${max} karakter`,
  submit: "Kirim ide",
  error: "Ide gagal dikirim. Periksa koneksi lalu coba lagi; isian Anda masih tersimpan di formulir.",
  thanksTitle: "Terima kasih, ide Anda sudah terkirim",
  thanksText: "Admin desa akan meninjau ide Anda. Ide yang sesuai dapat dibawa ke Musyawarah Desa untuk dibahas bersama warga.",
  again: "Kirim ide lain",
} as const;

/** Alur singkat setelah kirim (kolom kiri). */
export const AJUKAN_IDE_STEPS: readonly PermohonanStep[] = [
  { title: "Diterima admin desa", desc: "Ide Anda tercatat dan dibaca oleh admin Desa Darmasaba." },
  { title: "Ditinjau", desc: "Ide dinilai kesesuaiannya dengan kebutuhan warga dan program desa." },
  { title: "Dibahas bersama warga", desc: "Ide yang sesuai dapat dibawa ke Musyawarah Desa atau Musrenbangdes." },
];

type FieldText = { label: string; placeholder: string; description?: string; multiline?: boolean };

/** Label, placeholder, dan keterangan tiap isian formulir. */
export const AJUKAN_IDE_FIELDS: Readonly<Record<IdeField, FieldText>> = {
  name: { label: "Nama lengkap", placeholder: "Nama Anda" },
  alamat: { label: "Alamat", placeholder: "Banjar atau alamat tempat tinggal" },
  namaIde: { label: "Nama ide", placeholder: "Judul singkat ide Anda" },
  deskripsi: {
    label: "Deskripsi ide",
    placeholder: "Jelaskan ide Anda. Pisahkan paragraf dengan baris kosong.",
    multiline: true,
  },
  masalah: {
    label: "Masalah yang ingin dipecahkan",
    placeholder: "Masalah atau tantangan apa yang dijawab ide ini?",
    multiline: true,
  },
  benefit: { label: "Manfaat", placeholder: "Manfaat ide ini bagi warga dan desa", multiline: true },
};
