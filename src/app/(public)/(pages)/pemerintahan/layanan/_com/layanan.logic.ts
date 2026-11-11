/** Tipe & helper murni halaman daftar Layanan (tanpa React; dites di __tests__/api/layanan_page_logic.test.ts). */
import type { WaktuBiayaValue } from "@/lib/pelayanan-waktu-biaya";

/** Satu layanan surat keterangan dari `pelayanansuratketerangan/find-many`. */
export type SuratKeteranganItem = WaktuBiayaValue & {
  id: string;
  name: string;
  image?: { link: string } | null;
};

/** Satu layanan Telunjuk Sakti Desa; `deskripsi` dipakai sebagai label tautan dokumen petunjuk. */
export type TelunjukSaktiItem = WaktuBiayaValue & {
  id: string;
  name: string;
  deskripsi: string;
  link: string;
};

/** Rekaman tunggal (Perizinan Berusaha, Penduduk Non-Permanen); `deskripsi` berupa HTML editor admin. */
export type LayananSingleton = WaktuBiayaValue & {
  name: string;
  deskripsi: string;
};

/** Langkah alur pendaftaran NIB di OSS (konten statis). */
export type OssStep = { title: string; description: string };

/** Alur pendaftaran NIB di OSS — urutan tampil = urutan langkah. */
export const OSS_STEPS: readonly OssStep[] = [
  { title: "Daftar akun", description: "Membuat akun di portal OSS." },
  { title: "Isi data perusahaan", description: "Lengkapi informasi perusahaan, data pemegang saham, dan alamat." },
  { title: "Pilih KBLI", description: "Menentukan kode KBLI sesuai jenis usaha." },
  { title: "Unggah dokumen", description: "Unggah akta pendirian, surat izin, dan dokumen wajib lainnya." },
  { title: "Verifikasi instansi", description: "Menunggu verifikasi dan persetujuan dari pihak berwenang." },
  { title: "Terbit NIB", description: "Menerima NIB sebagai identitas resmi usaha." },
];

const normalize = (value: string) => value.toLocaleLowerCase("id").replace(/\s+/g, " ").trim();

/** Saring berdasarkan nama (tanpa beda huruf besar/kecil & spasi ganda); kata kunci kosong = semua item. */
export function filterByName<T extends { name: string }>(items: readonly T[], query: string): T[] {
  const needle = normalize(query);
  if (!needle) return [...items];
  return items.filter((item) => normalize(item.name).includes(needle));
}

/**
 * Tautan eksternal dari admin kadang tanpa skema (mis. "www.contoh.com") sehingga browser
 * menganggapnya rute relatif di situs ini. Tambahkan https:// bila skema tidak ada.
 */
export function externalHref(link: string): string {
  const trimmed = link.trim();
  if (!trimmed) return "";
  return /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed.replace(/^\/+/, "")}`;
}

/** Nomor langkah dua digit ("01"…"06"). */
export const stepNumber = (index: number) => String(index + 1).padStart(2, "0");
