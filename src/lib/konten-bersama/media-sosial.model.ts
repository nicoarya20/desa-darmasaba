/**
 * Model media sosial konten bersama (Bank Sampah, Lembaga Sekolah, PUSTU, Posyandu): daftar `{ platform, url }`
 * yang disimpan di kolom `Json?` per domain. Validasi ada di `media-sosial.validation.ts`.
 */
import { normalizeWaNumber } from "@/app/(public)/(pages)/ekonomi/umkm/_lib/pesanan";

/** Platform yang didukung, urut sesuai pilihan di admin. `website` = situs/tautan lainnya. */
export const PLATFORM_MEDIA_SOSIAL = ["instagram", "facebook", "tiktok", "youtube", "whatsapp", "website"] as const;

export type PlatformMediaSosial = (typeof PLATFORM_MEDIA_SOSIAL)[number];

/** Satu tautan media sosial. */
export type MediaSosialItem = { platform: PlatformMediaSosial; url: string };

/** Batas jumlah tautan per entri agar form & tampilan publik tetap ringkas. */
export const MAX_MEDIA_SOSIAL = 10;

/** Label platform untuk admin & teks aksesibilitas publik. */
export const LABEL_PLATFORM: Record<PlatformMediaSosial, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  whatsapp: "WhatsApp",
  website: "Website / Lainnya",
};

/** Ikon gambar platform (aset yang sama dengan pilihan sosmed admin); null = pakai ikon umum. */
export const IKON_PLATFORM: Record<PlatformMediaSosial, string | null> = {
  instagram: "/assets/images/sosmed/instagram.png",
  facebook: "/assets/images/sosmed/facebook.png",
  tiktok: "/assets/images/sosmed/tiktok.png",
  youtube: "/assets/images/sosmed/youtube.png",
  whatsapp: "/assets/images/sosmed/whatsapp.png",
  website: null,
};

// Awalan URL profil untuk isian berupa nama akun ("tps3r_pudakmesari" / "@akun").
const PROFIL_AKUN: Partial<Record<PlatformMediaSosial, (akun: string) => string>> = {
  instagram: (akun) => `https://www.instagram.com/${akun}`,
  facebook: (akun) => `https://www.facebook.com/${akun}`,
  tiktok: (akun) => `https://www.tiktok.com/@${akun}`,
  youtube: (akun) => `https://www.youtube.com/@${akun}`,
};

const BERSKEMA = /^[a-z][a-z0-9+.-]*:/i;
const NAMA_AKUN = /^@?[\w.-]+$/;
const AKHIRAN_DOMAIN = /\.(com|id|net|org|co|me|tv|gl)$/i;

/** True bila `value` salah satu platform yang didukung. */
export function isPlatformMediaSosial(value: unknown): value is PlatformMediaSosial {
  return typeof value === "string" && (PLATFORM_MEDIA_SOSIAL as readonly string[]).includes(value);
}

/**
 * Lengkapi isian admin menjadi URL: nama akun → URL profil platform, nomor HP (WhatsApp) → wa.me,
 * alamat tanpa skema ("instagram.com/akun") → https://. Isian berskema dibiarkan apa adanya agar
 * validasi tetap menolak skema selain http/https.
 */
export function lengkapiUrlMedsos(platform: PlatformMediaSosial, input: string): string {
  const isian = input.trim();
  if (!isian || BERSKEMA.test(isian)) return isian;

  if (platform === "whatsapp") {
    const wa = normalizeWaNumber(isian);
    if (wa) return `https://wa.me/${wa}`;
  }
  const profil = PROFIL_AKUN[platform];
  // Nama akun boleh bertitik ("nama.akun"), tetapi akhiran mirip domain ("x.com") dianggap alamat situs.
  if (profil && NAMA_AKUN.test(isian) && !AKHIRAN_DOMAIN.test(isian)) return profil(isian.replace(/^@/, ""));
  return `https://${isian}`;
}
