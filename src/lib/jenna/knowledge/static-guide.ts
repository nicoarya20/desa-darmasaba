import { getWorkStatus } from "@/app/(public)/_com/main-page/landing-page/landing.logic";
import { LAYANAN_LIST_HREF } from "@/app/(public)/(pages)/pemerintahan/layanan/_com/layanan.meta";
import { isAllowedJennaHref } from "./sitemap";

export const DESA_ALAMAT_UMUM = "Desa Darmasaba, Kecamatan Abiansemal, Kabupaten Badung, Bali";

const NO_HOLIDAY = { isHoliday: false, holidayName: null } as const;

/** Jam layanan kantor per kelompok hari, diturunkan dari `getWorkStatus` (sumber yang sama dengan beranda). */
export function officeHoursLines(): string[] {
  const hours = (day: string) => getWorkStatus(day, "00:00", NO_HOLIDAY).message;
  return [
    `Senin–Kamis: ${hours("Senin")} WITA`,
    `Jumat: ${hours("Jumat")} WITA`,
    `Sabtu–Minggu: ${hours("Sabtu")}`,
    "Hari libur nasional: kantor tutup",
  ];
}

// Form publik (PUBLIC_POST_PATHS di src/lib/auth-policy.ts) → halaman tempat pengunjung mengisinya sendiri.
const PUBLIC_FORMS: readonly { name: string; href: string; note: string }[] = [
  { name: "Permohonan layanan surat keterangan", href: LAYANAN_LIST_HREF, note: "pilih jenis surat, lalu ajukan dari halaman detailnya" },
  { name: "Administrasi online (ajukan surat)", href: "/inovasi/layanan-online-desa/administrasi-online", note: "formulir pengajuan administrasi secara daring" },
  { name: "Pengaduan masyarakat", href: "/inovasi/layanan-online-desa/pengaduan-masyarakat", note: "laporan/keluhan kepada pemerintah desa" },
  { name: "Ajukan ide inovatif", href: "/inovasi/ajukan-ide-inovatif", note: "usulan ide untuk desa" },
  { name: "Laporan keamanan lingkungan", href: "/keamanan/laporan-publik", note: "laporan kejadian keamanan" },
  { name: "Survei Indeks Kepuasan Masyarakat", href: "/ppid/indeks-kepuasan-masyarakat", note: "penilaian layanan desa" },
  { name: "Peminjaman buku perpustakaan digital", href: "/pendidikan/perpustakaan-digital/semua", note: "pilih buku lalu isi form pinjam" },
  { name: "Pesan produk UMKM", href: "/ekonomi/umkm", note: "buka halaman produk lalu gunakan tombol pesan" },
  { name: "Pendaftaran kegiatan kesehatan", href: "/kesehatan/data-kesehatan-warga/jadwal-kegiatan-page", note: "pilih jadwal lalu daftar" },
];

const INFO_PAGES: readonly { name: string; href: string }[] = [
  { name: "Permohonan informasi publik (PPID)", href: "/ppid/permohonan-informasi-publik" },
  { name: "Keberatan informasi publik (PPID)", href: "/ppid/permohonan-keberatan-informasi-publik" },
  { name: "Daftar informasi publik", href: "/ppid/daftar-informasi-publik" },
  { name: "Kontak darurat", href: "/keamanan/kontak-darurat" },
];

/** Panduan statis (Bahasa Indonesia, ≤ 6 KB). Tautan ke halaman yang sedang disembunyikan dibuang. */
export function renderStaticGuide(routes: ReadonlySet<string>): string {
  const visible = <T extends { href: string }>(items: readonly T[]) => items.filter((item) => isAllowedJennaHref(item.href, routes));
  const forms = visible(PUBLIC_FORMS).map((form) => `- ${form.name} — ${form.href} (${form.note})`);
  const info = visible(INFO_PAGES).map((page) => `- ${page.name} — ${page.href}`);
  return [
    "## Panduan Umum",
    "",
    "### Kantor Desa",
    `- Alamat umum: ${DESA_ALAMAT_UMUM}.`,
    ...officeHoursLines().map((line) => `- ${line}`),
    "- Untuk alamat lengkap, nomor telepon, email, atau WhatsApp kantor: arahkan pengunjung ke halaman resmi di bawah atau datang langsung ke kantor desa pada jam layanan. Jangan menyebut nomor/email kantor.",
    "",
    "### Cara Mengurus Surat",
    `- Daftar layanan surat beserta persyaratan, estimasi waktu, dan biaya ada di ${LAYANAN_LIST_HREF}.`,
    "- Pengunjung mengajukan sendiri lewat formulir di website atau datang ke kantor desa; keputusan dan penerbitan surat oleh petugas kantor desa.",
    "",
    ...(forms.length ? ["### Formulir Publik di Website", ...forms, ""] : []),
    ...(info.length ? ["### Informasi & Kontak Resmi", ...info, ""] : []),
    "### Yang Tidak Dapat Dilakukan Asisten",
    "- Tidak dapat mengisi atau mengirim formulir atas nama pengunjung.",
    "- Tidak dapat melihat data pribadi, status permohonan, atau data kependudukan perorangan.",
    "- Tidak dapat memutuskan, menyetujui, atau menjanjikan urusan resmi desa — itu wewenang kantor desa.",
  ].join("\n");
}
