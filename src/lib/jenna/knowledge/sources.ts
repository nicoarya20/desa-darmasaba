import type { Prisma } from "@prisma/client";
import { DESA_TIME_ZONE } from "@/app/(public)/_com/main-page/apbdes/apbdes.logic";
import { programOverlayHref } from "@/app/(public)/_com/main-page/landing-page/program-param.logic";
import { detailHref } from "@/app/(public)/_com/main-page/kabar-desa/kabar.logic";
import { BERITA_BASE_HREF, PENGUMUMAN_BASE_HREF } from "@/app/(public)/_com/main-page/kabar-desa/kabar.meta";
import { kegiatanDetailHref } from "@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/kegiatan-list.logic";
import { inovasiDetailHref } from "@/app/(public)/(pages)/inovasi/inovasi-teknologi-desa/_com/inovasi.logic";
import { INOVASI_TEKNOLOGI_HREF } from "@/app/(public)/(pages)/inovasi/inovasi-teknologi-desa/_com/inovasi.meta";
import { LAYANAN_LIST_HREF, layananDetailHref } from "@/app/(public)/(pages)/pemerintahan/layanan/_com/layanan.meta";
import { programHref } from "@/app/(public)/(tambahan)/desa-anti-korupsi/_lib/program-folder";
import { getSosmedHref } from "@/app/admin/(dashboard)/landing-page/profil/_lib/sosmed";
import { inovasiKategoriLabel } from "@/lib/inovasi-teknologi/kategori";
import { jadwalToText } from "@/lib/jadwal-pelayanan";
import { LABEL_PUSTU } from "@/lib/pustu/pustu.label";
import { bacaJadwal, bacaLayananUnggulan } from "@/lib/pustu/pustu.validation";
import { HARGA_MENYESUAIKAN } from "@/lib/umkm/harga-produk";
import { htmlToKnowledgeText } from "./html";

// Registry allowlist pengetahuan Jenna — DEFAULT DENY: hanya model + field di sini yang boleh
// dibaca snapshot maupun tool. `select` selalu eksplisit (tanpa include/omit) supaya kolom baru
// di schema tidak ikut bocor. `deletedAt: null` hanya untuk model yang deletedAt-nya nullable
// tanpa default (di model `@default(now())` filter itu mengosongkan hasil) — dijaga unit test via Prisma.dmmf.
// Sengaja TIDAK masuk: MigrasiPenduduk (nama per orang), RealisasiItem (keterangan bebas; total sudah
// ada di APBDesItem), JadwalKegiatan (di bawah menu data-kesehatan-warga, tanggal teks bebas),
// RingkasanKesehatanDesa, Posyandu.nomor (nomor HP kader), Umkm pemilik/alamat/kontak, PasarDesa kontak/alamatUsaha.

export type KnowledgeRow = Record<string, unknown>;

export type KnowledgeSelect = {
  [field: string]:
    | true
    | { select: KnowledgeSelect; where?: Record<string, unknown>; orderBy?: Record<string, unknown>[]; take?: number };
};

/** A = fakta inti, B = layanan & kontak, C = konten dinamis (judul terbaru), D = data angka. */
export type KnowledgeTier = "A" | "B" | "C" | "D";

export const KNOWLEDGE_DOMAINS = [
  "profil_desa",
  "pemerintahan",
  "ppid",
  "layanan",
  "berita",
  "pengumuman",
  "kegiatan_desa",
  "event_budaya",
  "potensi",
  "prestasi",
  "inovasi",
  "ekonomi",
  "umkm",
  "kesehatan",
  "keamanan",
  "lingkungan",
  "anti_korupsi",
  "apbdes",
  "kependudukan",
  "pendidikan",
] as const;

export type KnowledgeDomain = (typeof KNOWLEDGE_DOMAINS)[number];

export type KnowledgeField = readonly [label: string, value: (row: KnowledgeRow) => unknown];

export interface KnowledgeSource {
  key: string;
  domain: KnowledgeDomain;
  tier: KnowledgeTier;
  label: string;
  model: Prisma.ModelName;
  where: Record<string, unknown>;
  select: KnowledgeSelect;
  orderBy: Record<string, unknown>[];
  /** Batas baris yang masuk snapshot. */
  take: number;
  /** Kolom String top-level untuk `cari_konten` (contains, insensitive). */
  searchFields: readonly string[];
  /** Kolom tanggal untuk daftar Tier C. */
  dateField?: string;
  /** Batas karakter per sel tabel snapshot. */
  cellMax: number;
  fields: readonly KnowledgeField[];
  title(row: KnowledgeRow): string;
  toText(row: KnowledgeRow): string;
  href(row?: KnowledgeRow): string;
  /** Href submenu yang menentukan visibilitas sumber ini (hidden → sumber dibuang). */
  menuHref: string;
}

/** Tipe ikon MediaSosial yang berupa akun publik. Ikon kontak kantor ada di sumber `kontak_kantor`. */
export const SOCIAL_ICON_TYPES = ["facebook", "instagram", "tiktok", "youtube", "x", "telegram", "custom"] as const;

/** Ikon MediaSosial berisi kontak resmi kantor desa (nomor/email, bukan URL), diizinkan keputusan user 2026-11-14. */
export const OFFICE_CONTACT_ICON_TYPES = ["whatsapp", "telephone", "gmail"] as const;

const OFFICE_CONTACT_KIND: Record<string, string> = { whatsapp: "WhatsApp", telephone: "Telepon", gmail: "Email" };
const PLAIN_PHONE = /^[\d\s()+.-]+$/;
const EMAIL_IN_TEXT = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/;
const WA_ME_PREFIX = "https://wa.me/";

/**
 * Kontak kantor sebagai teks terbaca, setara yang dibuka pengunjung lewat ikon beranda (`getSosmedHref`):
 * nomor apa adanya bila polos, selain itu digit ternormalisasi `+62…`; email tanpa `mailto:`.
 */
export function officeContactValue(row: KnowledgeRow): string {
  const raw = formatKnowledgeValue(row.iconUrl).replace(/^(?:tel|mailto):/i, "");
  if (row.icon === "gmail") return EMAIL_IN_TEXT.exec(raw)?.[0] ?? "";
  if (PLAIN_PHONE.test(raw)) return raw;
  const href = getSosmedHref(String(row.icon), raw);
  return href?.startsWith(WA_ME_PREFIX) ? `+${href.slice(WA_ME_PREFIX.length)}` : "";
}

const DATE_FMT = new Intl.DateTimeFormat("en-CA", { timeZone: DESA_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });

/** Nilai field → teks satu baris (tanggal `YYYY-MM-DD` WITA, kosong untuk null). */
export function formatKnowledgeValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "" : DATE_FMT.format(value);
  if (Array.isArray(value)) return value.map(formatKnowledgeValue).filter(Boolean).join(", ");
  return String(value).replace(/\s+/g, " ").trim();
}

const ACTIVE = { isActive: true } as const;
const ACTIVE_NOT_DELETED = { isActive: true, deletedAt: null } as const;

const get = (key: string) => (row: KnowledgeRow) => row[key];
const html = (key: string) => (row: KnowledgeRow) => htmlToKnowledgeText(row[key] as string | null | undefined);
const rel = (relation: string, key: string) => (row: KnowledgeRow) =>
  (row[relation] as KnowledgeRow | null | undefined)?.[key];
const relList = (relation: string, key: string) => (row: KnowledgeRow) =>
  ((row[relation] as KnowledgeRow[] | undefined) ?? []).map((item) => item[key]);
const idOf = (row?: KnowledgeRow) => encodeURIComponent(String(row?.id ?? ""));

type SourceDef = Omit<KnowledgeSource, "toText" | "title" | "orderBy" | "take" | "searchFields" | "cellMax" | "href"> &
  Partial<Pick<KnowledgeSource, "title" | "orderBy" | "take" | "searchFields" | "cellMax">> & {
    href: string | ((row: KnowledgeRow) => string);
  };

function defineSource(def: SourceDef): KnowledgeSource {
  const { href } = def;
  return {
    orderBy: [{ createdAt: "asc" }],
    take: 50,
    searchFields: [],
    cellMax: 200,
    title: (row) => formatKnowledgeValue(def.fields[0][1](row)),
    ...def,
    // Tanpa row (mis. sumber nonaktif / sitemap) → halaman induk.
    href: (row) => (typeof href === "string" ? href : row ? href(row) : def.menuHref),
    toText: (row) =>
      def.fields
        .map(([label, value]) => {
          const text = formatKnowledgeValue(value(row));
          return text ? `${label}: ${text}` : "";
        })
        .filter(Boolean)
        .join("\n"),
  };
}

const PROFIL_HREF = "/pemerintahan/profil";

export const KNOWLEDGE_SOURCES: readonly KnowledgeSource[] = [
  // ── Tier A: fakta inti ────────────────────────────────────────────────
  defineSource({
    key: "sejarah_desa", domain: "profil_desa", tier: "A", label: "Sejarah Desa", model: "SejarahDesa",
    where: ACTIVE_NOT_DELETED, select: { id: true, judul: true, deskripsi: true },
    fields: [["Judul", get("judul")], ["Isi", html("deskripsi")]],
    searchFields: ["judul", "deskripsi"], cellMax: 1500, href: PROFIL_HREF, menuHref: PROFIL_HREF,
  }),
  defineSource({
    key: "visi_misi_desa", domain: "profil_desa", tier: "A", label: "Visi & Misi Desa", model: "VisiMisiDesa",
    where: ACTIVE_NOT_DELETED, select: { id: true, visi: true, misi: true },
    fields: [["Visi", html("visi")], ["Misi", html("misi")]],
    searchFields: ["visi", "misi"], cellMax: 1200, href: PROFIL_HREF, menuHref: PROFIL_HREF,
  }),
  defineSource({
    key: "lambang_desa", domain: "profil_desa", tier: "A", label: "Lambang Desa", model: "LambangDesa",
    where: ACTIVE_NOT_DELETED, select: { id: true, judul: true, deskripsi: true },
    fields: [["Judul", get("judul")], ["Makna", html("deskripsi")]],
    searchFields: ["judul", "deskripsi"], cellMax: 1000, href: PROFIL_HREF, menuHref: PROFIL_HREF,
  }),
  defineSource({
    key: "maskot_desa", domain: "profil_desa", tier: "A", label: "Maskot Desa", model: "MaskotDesa",
    where: ACTIVE_NOT_DELETED, select: { id: true, judul: true, deskripsi: true },
    fields: [["Judul", get("judul")], ["Makna", html("deskripsi")]],
    searchFields: ["judul", "deskripsi"], cellMax: 1000, href: PROFIL_HREF, menuHref: PROFIL_HREF,
  }),
  defineSource({
    key: "wilayah_desa", domain: "profil_desa", tier: "A", label: "Wilayah Desa", model: "WilayahDesa",
    where: ACTIVE_NOT_DELETED,
    select: { id: true, batasUtara: true, batasSelatan: true, batasTimur: true, batasBarat: true, luasWilayah: true, keterangan: true },
    fields: [
      ["Batas utara", get("batasUtara")], ["Batas selatan", get("batasSelatan")],
      ["Batas timur", get("batasTimur")], ["Batas barat", get("batasBarat")],
      ["Luas wilayah", get("luasWilayah")], ["Keterangan", html("keterangan")],
    ],
    title: () => "Wilayah Desa Darmasaba", cellMax: 600, href: PROFIL_HREF, menuHref: PROFIL_HREF,
  }),
  defineSource({
    key: "profil_perbekel", domain: "pemerintahan", tier: "A", label: "Profil Perbekel (Kepala Desa)", model: "ProfilPerbekel",
    where: ACTIVE, select: { id: true, biodata: true, pengalaman: true, pengalamanOrganisasi: true, programUnggulan: true },
    fields: [
      ["Biodata", html("biodata")], ["Pengalaman", html("pengalaman")],
      ["Pengalaman organisasi", html("pengalamanOrganisasi")], ["Program unggulan", html("programUnggulan")],
    ],
    title: () => "Profil Perbekel", searchFields: ["biodata", "programUnggulan"], cellMax: 800,
    href: PROFIL_HREF, menuHref: PROFIL_HREF,
  }),
  defineSource({
    key: "perbekel_masa_ke_masa", domain: "pemerintahan", tier: "A", label: "Perbekel dari Masa ke Masa", model: "PerbekelDariMasaKeMasa",
    where: ACTIVE, select: { id: true, nama: true, periode: true, daerah: true },
    fields: [["Nama", get("nama")], ["Periode", get("periode")], ["Asal", get("daerah")]],
    searchFields: ["nama"], href: PROFIL_HREF, menuHref: PROFIL_HREF,
  }),
  defineSource({
    key: "perangkat_desa", domain: "pemerintahan", tier: "A", label: "Perangkat Desa (nama & jabatan)", model: "PerangkatDesa",
    where: { isActive: true, posisi: { isActive: true } },
    select: { id: true, namaLengkap: true, gelarAkademik: true, posisi: { select: { nama: true } } },
    orderBy: [{ posisi: { hierarki: "asc" } }, { posisi: { urutan: "asc" } }],
    fields: [["Nama", get("namaLengkap")], ["Gelar", get("gelarAkademik")], ["Jabatan", rel("posisi", "nama")]],
    searchFields: ["namaLengkap"], take: 60,
    href: "/pemerintahan/profil/struktur-perangkat-desa", menuHref: PROFIL_HREF,
  }),
  defineSource({
    key: "profil_ppid", domain: "ppid", tier: "A", label: "Profil PPID", model: "ProfilePPID",
    where: ACTIVE_NOT_DELETED, select: { id: true, name: true, biodata: true, riwayat: true, pengalaman: true, unggulan: true },
    fields: [
      ["Nama", get("name")], ["Biodata", html("biodata")], ["Riwayat", html("riwayat")],
      ["Pengalaman", html("pengalaman")], ["Unggulan", html("unggulan")],
    ],
    searchFields: ["name", "biodata"], cellMax: 600, href: "/ppid/profil-ppid", menuHref: "/ppid/profil-ppid",
  }),
  defineSource({
    key: "visi_misi_ppid", domain: "ppid", tier: "A", label: "Visi & Misi PPID", model: "VisiMisiPPID",
    where: ACTIVE_NOT_DELETED, select: { id: true, visi: true, misi: true },
    fields: [["Visi", html("visi")], ["Misi", html("misi")]],
    cellMax: 800, href: "/ppid/visi-misi-ppid", menuHref: "/ppid/visi-misi-ppid",
  }),
  defineSource({
    key: "dasar_hukum_ppid", domain: "ppid", tier: "A", label: "Dasar Hukum PPID", model: "DasarHukumPPID",
    where: ACTIVE_NOT_DELETED, select: { id: true, judul: true, content: true },
    fields: [["Judul", get("judul")], ["Isi", html("content")]],
    searchFields: ["judul", "content"], cellMax: 1200, href: "/ppid/dasar-hukum", menuHref: "/ppid/dasar-hukum",
  }),
  defineSource({
    key: "struktur_ppid", domain: "ppid", tier: "A", label: "Struktur PPID (jabatan & nama)", model: "PosisiOrganisasiPPID",
    where: ACTIVE_NOT_DELETED,
    select: {
      id: true, nama: true, deskripsi: true,
      pegawai: { select: { namaLengkap: true, gelarAkademik: true }, where: { isActive: true, deletedAt: null } },
    },
    orderBy: [{ hierarki: "asc" }, { urutan: "asc" }],
    fields: [["Jabatan", get("nama")], ["Pejabat", relList("pegawai", "namaLengkap")], ["Tugas", html("deskripsi")]],
    searchFields: ["nama"], cellMax: 160, href: "/ppid/struktur-ppid", menuHref: "/ppid/struktur-ppid",
  }),
  defineSource({
    key: "profil_bumdes", domain: "ekonomi", tier: "A", label: "Profil BUMDes", model: "ProfilBumDes",
    where: ACTIVE_NOT_DELETED, select: { id: true, nama: true, deskripsi: true, tahunBerdiri: true },
    fields: [["Nama", get("nama")], ["Tahun berdiri", get("tahunBerdiri")], ["Deskripsi", html("deskripsi")]],
    searchFields: ["nama", "deskripsi"], cellMax: 800,
    href: "/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes", menuHref: "/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes",
  }),
  defineSource({
    key: "media_sosial", domain: "profil_desa", tier: "A", label: "Media Sosial Resmi", model: "MediaSosial",
    // icon null = baris lama berikon unggahan; https:// menyingkirkan tel:/mailto:, NOT menyingkirkan tautan WhatsApp.
    where: {
      ...ACTIVE_NOT_DELETED,
      OR: [{ icon: { in: [...SOCIAL_ICON_TYPES] } }, { icon: null }],
      iconUrl: { startsWith: "https://" },
      NOT: [{ iconUrl: { contains: "wa.me", mode: "insensitive" } }, { iconUrl: { contains: "whatsapp", mode: "insensitive" } }],
    },
    select: { id: true, name: true, icon: true, iconUrl: true },
    fields: [["Nama", get("name")], ["Platform", get("icon")], ["Tautan", get("iconUrl")]],
    href: (row) => String(row.iconUrl ?? "/"), menuHref: "/",
  }),

  // ── Tier B: layanan & kontak ──────────────────────────────────────────
  defineSource({
    // Kontak kantor yang tampil sebagai ikon di beranda (form admin Media Sosial).
    key: "kontak_kantor", domain: "profil_desa", tier: "B", label: "Kontak Resmi Kantor Desa", model: "MediaSosial",
    where: { ...ACTIVE_NOT_DELETED, icon: { in: [...OFFICE_CONTACT_ICON_TYPES] } },
    select: { id: true, name: true, icon: true, iconUrl: true },
    fields: [
      ["Nama", get("name")], ["Jenis", (row) => OFFICE_CONTACT_KIND[String(row.icon)]], ["Kontak", officeContactValue],
    ],
    searchFields: ["name"], href: "/", menuHref: "/",
  }),
  defineSource({
    key: "layanan_surat_keterangan", domain: "layanan", tier: "B", label: "Layanan Surat Keterangan", model: "PelayananSuratKeterangan",
    where: ACTIVE, select: { id: true, name: true, deskripsi: true, estimasiWaktu: true, biaya: true },
    fields: [["Layanan", get("name")], ["Estimasi", get("estimasiWaktu")], ["Biaya (Rp)", get("biaya")], ["Keterangan", html("deskripsi")]],
    searchFields: ["name", "deskripsi"], cellMax: 300,
    href: (row) => layananDetailHref(idOf(row)), menuHref: LAYANAN_LIST_HREF,
  }),
  defineSource({
    key: "layanan_telunjuk_sakti", domain: "layanan", tier: "B", label: "Layanan Telunjuk Sakti Desa", model: "PelayananTelunjukSaktiDesa",
    where: ACTIVE, select: { id: true, name: true, deskripsi: true, estimasiWaktu: true, biaya: true },
    fields: [["Layanan", get("name")], ["Estimasi", get("estimasiWaktu")], ["Biaya (Rp)", get("biaya")], ["Keterangan", html("deskripsi")]],
    searchFields: ["name", "deskripsi"], cellMax: 300, href: LAYANAN_LIST_HREF, menuHref: LAYANAN_LIST_HREF,
  }),
  defineSource({
    key: "layanan_perizinan_berusaha", domain: "layanan", tier: "B", label: "Layanan Perizinan Berusaha", model: "PelayananPerizinanBerusaha",
    where: ACTIVE, select: { id: true, name: true, deskripsi: true, estimasiWaktu: true, biaya: true },
    fields: [["Layanan", get("name")], ["Estimasi", get("estimasiWaktu")], ["Biaya (Rp)", get("biaya")], ["Keterangan", html("deskripsi")]],
    searchFields: ["name", "deskripsi"], cellMax: 300, href: LAYANAN_LIST_HREF, menuHref: LAYANAN_LIST_HREF,
  }),
  defineSource({
    key: "layanan_penduduk_non_permanen", domain: "layanan", tier: "B", label: "Layanan Penduduk Non Permanen", model: "PelayananPendudukNonPermanen",
    where: ACTIVE, select: { id: true, name: true, deskripsi: true, estimasiWaktu: true, biaya: true },
    fields: [["Layanan", get("name")], ["Estimasi", get("estimasiWaktu")], ["Biaya (Rp)", get("biaya")], ["Keterangan", html("deskripsi")]],
    searchFields: ["name", "deskripsi"], cellMax: 300, href: LAYANAN_LIST_HREF, menuHref: LAYANAN_LIST_HREF,
  }),
  defineSource({
    key: "jenis_layanan_online", domain: "layanan", tier: "B", label: "Jenis Administrasi Online", model: "JenisLayanan",
    where: ACTIVE, select: { id: true, nama: true, deskripsi: true },
    fields: [["Jenis", get("nama")], ["Keterangan", html("deskripsi")]],
    searchFields: ["nama", "deskripsi"],
    href: "/inovasi/layanan-online-desa/administrasi-online", menuHref: "/inovasi/layanan-online-desa",
  }),
  defineSource({
    key: "daftar_informasi_publik", domain: "ppid", tier: "B", label: "Daftar Informasi Publik", model: "DaftarInformasiPublik",
    where: ACTIVE_NOT_DELETED, select: { id: true, jenisInformasi: true, deskripsi: true, tanggal: true },
    orderBy: [{ tanggal: "desc" }],
    fields: [["Jenis informasi", get("jenisInformasi")], ["Tanggal", get("tanggal")], ["Keterangan", html("deskripsi")]],
    searchFields: ["jenisInformasi", "deskripsi"], cellMax: 200,
    href: (row) => `/ppid/daftar-informasi-publik/${idOf(row)}`, menuHref: "/ppid/daftar-informasi-publik",
  }),
  defineSource({
    key: "posyandu", domain: "kesehatan", tier: "B", label: "Posyandu", model: "Posyandu",
    where: ACTIVE, select: { id: true, name: true, deskripsi: true, jadwalPelayanan: true, banjar: { select: { name: true } } },
    fields: [
      ["Nama", get("name")], ["Banjar", rel("banjar", "name")],
      ["Jadwal", (row) => jadwalToText(row.jadwalPelayanan as string | null)], ["Keterangan", html("deskripsi")],
    ],
    searchFields: ["name", "deskripsi"], cellMax: 200,
    href: (row) => `/kesehatan/posyandu/${idOf(row)}`, menuHref: "/kesehatan/posyandu",
  }),
  defineSource({
    // whatsapp = nomor layanan darurat organisasi (bukan personal), diizinkan keputusan user 2026-11-13.
    key: "kontak_darurat_kesehatan", domain: "kesehatan", tier: "B", label: "Kontak Darurat Kesehatan", model: "KontakDarurat",
    where: ACTIVE, select: { id: true, name: true, deskripsi: true, whatsapp: true },
    fields: [["Nama", get("name")], ["WhatsApp", get("whatsapp")], ["Keterangan", html("deskripsi")]],
    searchFields: ["name", "deskripsi"], cellMax: 200,
    href: (row) => `/kesehatan/kontak-darurat/${idOf(row)}`, menuHref: "/kesehatan/kontak-darurat",
  }),
  defineSource({
    key: "kontak_darurat_keamanan", domain: "keamanan", tier: "B", label: "Kontak Darurat", model: "KontakItem",
    where: ACTIVE, select: { id: true, nama: true, nomorTelepon: true },
    fields: [["Nama", get("nama")], ["Telepon", get("nomorTelepon")]],
    searchFields: ["nama"], href: "/keamanan/kontak-darurat", menuHref: "/keamanan/kontak-darurat",
  }),
  defineSource({
    key: "polsek_terdekat", domain: "keamanan", tier: "B", label: "Polsek Terdekat", model: "PolsekTerdekat",
    where: ACTIVE,
    select: {
      id: true, nama: true, jarakKeDesa: true, alamat: true, nomorTelepon: true, jamOperasional: true,
      layananPolsek: { select: { nama: true } },
    },
    fields: [
      ["Nama", get("nama")], ["Jarak", get("jarakKeDesa")], ["Alamat", get("alamat")],
      ["Telepon", get("nomorTelepon")], ["Jam operasional", get("jamOperasional")], ["Layanan", rel("layananPolsek", "nama")],
    ],
    searchFields: ["nama"], href: "/keamanan/polsek-terdekat", menuHref: "/keamanan/polsek-terdekat",
  }),
  defineSource({
    key: "puskesmas", domain: "kesehatan", tier: "B", label: LABEL_PUSTU, model: "Puskesmas",
    where: ACTIVE,
    select: {
      id: true, name: true, alamat: true, layananUnggulan: true, tarifBpjs: true, tarifUmum: true,
      jam: { select: { jadwal: true } },
      kontak: { select: { kontakPuskesmas: true, kontakUGD: true, email: true } },
    },
    fields: [
      ["Nama", get("name")], ["Alamat", get("alamat")],
      ["Jam operasional", (row) => bacaJadwal((row.jam as KnowledgeRow | null)?.jadwal).map((j) => `${j.hari} ${j.jam}`).join("; ")],
      ["Layanan unggulan", (row) => bacaLayananUnggulan(row.layananUnggulan).map((l) => l.judul).join(", ")],
      ["Tarif BPJS", html("tarifBpjs")], ["Tarif umum", html("tarifUmum")],
      ["Telepon", rel("kontak", "kontakPuskesmas")], ["Kontak darurat/ambulans", rel("kontak", "kontakUGD")], ["Email", rel("kontak", "email")],
    ],
    cellMax: 300,
    searchFields: ["name"],
    href: (row) => `/kesehatan/puskesmas/${idOf(row)}`, menuHref: "/kesehatan/puskesmas",
  }),
  defineSource({
    key: "penanganan_darurat", domain: "kesehatan", tier: "B", label: "Penanganan Darurat", model: "PenangananDarurat",
    where: ACTIVE, select: { id: true, name: true, deskripsi: true },
    fields: [["Nama", get("name")], ["Langkah", html("deskripsi")]],
    searchFields: ["name", "deskripsi"], cellMax: 300,
    href: (row) => `/kesehatan/penanganan-darurat/${idOf(row)}`, menuHref: "/kesehatan/penanganan-darurat",
  }),

  // ── Tier C: konten dinamis (snapshot = judul terbaru; isi via tool) ──
  defineSource({
    key: "berita", domain: "berita", tier: "C", label: "Berita", model: "Berita",
    where: ACTIVE,
    select: { id: true, judul: true, deskripsi: true, content: true, tanggalTerbit: true, kategoriBerita: { select: { name: true } } },
    orderBy: [{ tanggalTerbit: "desc" }], take: 12, dateField: "tanggalTerbit",
    fields: [
      ["Judul", get("judul")], ["Kategori", rel("kategoriBerita", "name")], ["Tanggal", get("tanggalTerbit")],
      ["Ringkasan", html("deskripsi")], ["Isi", html("content")],
    ],
    searchFields: ["judul", "deskripsi", "content"],
    href: (row) => detailHref(BERITA_BASE_HREF, rel("kategoriBerita", "name")(row) as string | undefined, idOf(row)),
    menuHref: "/pemerintahan/berita/semua",
  }),
  defineSource({
    key: "pengumuman", domain: "pengumuman", tier: "C", label: "Pengumuman", model: "Pengumuman",
    where: ACTIVE,
    select: { id: true, judul: true, deskripsi: true, content: true, tanggalTerbit: true, CategoryPengumuman: { select: { name: true } } },
    orderBy: [{ tanggalTerbit: "desc" }], take: 12, dateField: "tanggalTerbit",
    fields: [
      ["Judul", get("judul")], ["Kategori", rel("CategoryPengumuman", "name")], ["Tanggal", get("tanggalTerbit")],
      ["Ringkasan", html("deskripsi")], ["Isi", html("content")],
    ],
    searchFields: ["judul", "deskripsi", "content"],
    href: (row) => detailHref(PENGUMUMAN_BASE_HREF, rel("CategoryPengumuman", "name")(row) as string | undefined, idOf(row)),
    menuHref: "/pemerintahan/pengumuman",
  }),
  defineSource({
    key: "kegiatan_desa", domain: "kegiatan_desa", tier: "C", label: "Kegiatan Desa", model: "KegiatanDesa",
    where: ACTIVE,
    select: {
      id: true, judul: true, deskripsiSingkat: true, deskripsiLengkap: true, tanggal: true, lokasi: true, partisipan: true,
      anggaran: true, progres: true, statusPembangunan: true, sumberDana: true, kategoriKegiatan: { select: { nama: true } },
    },
    orderBy: [{ tanggal: "desc" }], take: 12, dateField: "tanggal",
    fields: [
      ["Judul", get("judul")], ["Kategori", rel("kategoriKegiatan", "nama")], ["Tanggal", get("tanggal")],
      ["Lokasi", get("lokasi")], ["Partisipan", get("partisipan")], ["Anggaran (Rp)", get("anggaran")],
      ["Progres (%)", get("progres")], ["Status", get("statusPembangunan")], ["Sumber dana", get("sumberDana")],
      ["Ringkasan", get("deskripsiSingkat")], ["Isi", html("deskripsiLengkap")],
    ],
    searchFields: ["judul", "deskripsiSingkat", "deskripsiLengkap", "lokasi"],
    href: (row) => kegiatanDetailHref(rel("kategoriKegiatan", "nama")(row) as string | undefined, idOf(row)),
    menuHref: "/pemerintahan/kegiatan-desa/semua",
  }),
  defineSource({
    key: "event_budaya", domain: "event_budaya", tier: "C", label: "Event Budaya", model: "EventBudaya",
    where: ACTIVE, select: { id: true, nama: true, tanggal: true, tanggalSelesai: true, kategori: true, lokasi: true, deskripsi: true },
    orderBy: [{ tanggal: "desc" }], take: 15, dateField: "tanggal",
    fields: [
      ["Nama", get("nama")], ["Tanggal", get("tanggal")], ["Selesai", get("tanggalSelesai")],
      ["Kategori", get("kategori")], ["Lokasi", get("lokasi")], ["Keterangan", html("deskripsi")],
    ],
    searchFields: ["nama", "lokasi", "deskripsi"], href: "/pemerintahan/event-budaya", menuHref: "/pemerintahan/event-budaya",
  }),
  defineSource({
    // Ditampilkan di beranda (tanpa submenu) → selalu terlihat; detail = overlay beranda `/?program={id}`.
    key: "program_inovasi", domain: "inovasi", tier: "C", label: "Program Inovasi", model: "ProgramInovasi",
    where: ACTIVE, select: { id: true, name: true, description: true, createdAt: true },
    orderBy: [{ createdAt: "desc" }], take: 10, dateField: "createdAt",
    fields: [["Nama", get("name")], ["Deskripsi", html("description")]],
    searchFields: ["name", "description"], href: (row) => programOverlayHref(String(row?.id ?? "")), menuHref: "/",
  }),
  defineSource({
    // Gabungan Desa Digital / Smart Village + Teknologi Tepat Guna; kategori dibaca agar keduanya bisa dibedakan.
    key: "inovasi_teknologi_desa", domain: "inovasi", tier: "C", label: "Inovasi Teknologi Desa", model: "InovasiTeknologiDesa",
    where: ACTIVE, select: { id: true, name: true, kategori: true, deskripsi: true, createdAt: true },
    orderBy: [{ createdAt: "desc" }], take: 15, dateField: "createdAt",
    fields: [["Nama", get("name")], ["Kategori", (row) => inovasiKategoriLabel(row.kategori)], ["Deskripsi", html("deskripsi")]],
    searchFields: ["name", "deskripsi"], href: (row) => inovasiDetailHref(String(row.id ?? "")), menuHref: INOVASI_TEKNOLOGI_HREF,
  }),
  defineSource({
    key: "program_kreatif", domain: "inovasi", tier: "C", label: "Program Kreatif Desa", model: "ProgramKreatif",
    where: ACTIVE, select: { id: true, name: true, slug: true, deskripsi: true, createdAt: true },
    orderBy: [{ createdAt: "desc" }], take: 10, dateField: "createdAt",
    fields: [["Nama", get("name")], ["Ringkasan", get("slug")], ["Deskripsi", html("deskripsi")]],
    searchFields: ["name", "slug", "deskripsi"],
    href: (row) => `/inovasi/program-kreatif-desa/${idOf(row)}`, menuHref: "/inovasi/program-kreatif-desa",
  }),
  defineSource({
    key: "potensi_desa", domain: "potensi", tier: "C", label: "Potensi Desa", model: "PotensiDesa",
    where: ACTIVE_NOT_DELETED, select: { id: true, name: true, deskripsi: true, content: true, createdAt: true, kategori: { select: { nama: true } } },
    orderBy: [{ createdAt: "desc" }], take: 15, dateField: "createdAt",
    fields: [["Nama", get("name")], ["Kategori", rel("kategori", "nama")], ["Ringkasan", html("deskripsi")], ["Isi", html("content")]],
    searchFields: ["name", "deskripsi", "content"],
    href: (row) => `/pemerintahan/potensi/${idOf(row)}`, menuHref: "/pemerintahan/potensi",
  }),
  defineSource({
    key: "prestasi_desa", domain: "prestasi", tier: "C", label: "Prestasi Desa", model: "PrestasiDesa",
    where: ACTIVE_NOT_DELETED, select: { id: true, name: true, deskripsi: true, juara: true, createdAt: true, kategori: { select: { name: true } } },
    orderBy: [{ createdAt: "desc" }], take: 15, dateField: "createdAt",
    fields: [["Nama", get("name")], ["Kategori", rel("kategori", "name")], ["Juara", get("juara")], ["Deskripsi", html("deskripsi")]],
    searchFields: ["name", "deskripsi", "juara"], href: (row) => `/prestasi-desa/${idOf(row)}`, menuHref: "/prestasi-desa",
  }),
  defineSource({
    key: "lowongan_kerja", domain: "ekonomi", tier: "C", label: "Lowongan Kerja Lokal", model: "LowonganPekerjaan",
    where: ACTIVE,
    select: {
      id: true, posisi: true, namaPerusahaan: true, lokasi: true, tipePekerjaan: true, gaji: true,
      deskripsi: true, kualifikasi: true, tanggalPosting: true,
    },
    orderBy: [{ tanggalPosting: "desc" }], take: 10, dateField: "tanggalPosting",
    fields: [
      ["Posisi", get("posisi")], ["Perusahaan", get("namaPerusahaan")], ["Lokasi", get("lokasi")], ["Tipe", get("tipePekerjaan")],
      ["Gaji", get("gaji")], ["Diposting", get("tanggalPosting")], ["Deskripsi", html("deskripsi")], ["Kualifikasi", html("kualifikasi")],
    ],
    title: (row) => `${formatKnowledgeValue(row.posisi)} — ${formatKnowledgeValue(row.namaPerusahaan)}`,
    searchFields: ["posisi", "namaPerusahaan", "lokasi", "deskripsi"],
    href: (row) => `/ekonomi/lowongan-kerja-lokal/${idOf(row)}`, menuHref: "/ekonomi/lowongan-kerja-lokal",
  }),
  defineSource({
    key: "kesejahteraan_masyarakat", domain: "ekonomi", tier: "C", label: "Kesejahteraan Masyarakat", model: "KesejahteraanMasyarakat",
    where: ACTIVE, select: { id: true, judul: true, deskripsi: true, content: true, createdAt: true },
    orderBy: [{ createdAt: "desc" }], take: 10, dateField: "createdAt",
    fields: [["Judul", get("judul")], ["Ringkasan", html("deskripsi")], ["Isi", html("content")]],
    searchFields: ["judul", "deskripsi", "content"],
    href: (row) => `/ekonomi/kesejahteraan-masyarakat/${idOf(row)}`, menuHref: "/ekonomi/kesejahteraan-masyarakat",
  }),
  defineSource({
    key: "umkm", domain: "umkm", tier: "C", label: "UMKM", model: "Umkm",
    where: ACTIVE_NOT_DELETED, select: { id: true, nama: true, deskripsi: true, createdAt: true, kategori: { select: { nama: true } } },
    orderBy: [{ createdAt: "desc" }], take: 20, dateField: "createdAt",
    fields: [["Nama usaha", get("nama")], ["Kategori", rel("kategori", "nama")], ["Deskripsi", html("deskripsi")]],
    searchFields: ["nama", "deskripsi"], href: (row) => `/ekonomi/umkm/${idOf(row)}`, menuHref: "/ekonomi/umkm",
  }),
  defineSource({
    key: "produk_umkm", domain: "umkm", tier: "C", label: "Produk UMKM", model: "PasarDesa",
    where: { ...ACTIVE_NOT_DELETED, umkm: { isActive: true, deletedAt: null } },
    select: { id: true, nama: true, harga: true, satuan: true, deskripsi: true, createdAt: true, umkm: { select: { nama: true } } },
    orderBy: [{ createdAt: "desc" }], take: 20, dateField: "createdAt",
    fields: [
      ["Produk", get("nama")], ["UMKM", rel("umkm", "nama")], ["Harga (Rp)", (row) => row.harga ?? HARGA_MENYESUAIKAN],
      ["Satuan", get("satuan")], ["Deskripsi", html("deskripsi")],
    ],
    searchFields: ["nama", "deskripsi"], href: (row) => `/ekonomi/umkm/produk/${idOf(row)}`, menuHref: "/ekonomi/umkm",
  }),
  defineSource({
    key: "program_kesehatan", domain: "kesehatan", tier: "C", label: "Program Kesehatan", model: "ProgramKesehatan",
    where: ACTIVE, select: { id: true, name: true, deskripsiSingkat: true, deskripsi: true, persentase: true, createdAt: true },
    orderBy: [{ createdAt: "desc" }], take: 10, dateField: "createdAt",
    fields: [["Nama", get("name")], ["Capaian (%)", get("persentase")], ["Ringkasan", get("deskripsiSingkat")], ["Isi", html("deskripsi")]],
    searchFields: ["name", "deskripsiSingkat", "deskripsi"],
    href: (row) => `/kesehatan/program-kesehatan/${idOf(row)}`, menuHref: "/kesehatan/program-kesehatan",
  }),
  defineSource({
    key: "info_wabah_penyakit", domain: "kesehatan", tier: "C", label: "Info Wabah/Penyakit", model: "InfoWabahPenyakit",
    where: ACTIVE, select: { id: true, name: true, deskripsiSingkat: true, deskripsiLengkap: true, createdAt: true },
    orderBy: [{ createdAt: "desc" }], take: 10, dateField: "createdAt",
    fields: [["Nama", get("name")], ["Ringkasan", get("deskripsiSingkat")], ["Isi", html("deskripsiLengkap")]],
    searchFields: ["name", "deskripsiSingkat", "deskripsiLengkap"],
    href: (row) => `/kesehatan/info-wabah-penyakit/${idOf(row)}`, menuHref: "/kesehatan/info-wabah-penyakit",
  }),
  defineSource({
    key: "pencegahan_kriminalitas", domain: "keamanan", tier: "C", label: "Pencegahan Kriminalitas", model: "PencegahanKriminalitas",
    where: ACTIVE, select: { id: true, judul: true, deskripsiSingkat: true, deskripsi: true, createdAt: true },
    orderBy: [{ createdAt: "desc" }], take: 10, dateField: "createdAt",
    fields: [["Judul", get("judul")], ["Ringkasan", get("deskripsiSingkat")], ["Isi", html("deskripsi")]],
    searchFields: ["judul", "deskripsiSingkat", "deskripsi"],
    href: (row) => `/keamanan/pencegahan-kriminalitas/${idOf(row)}`, menuHref: "/keamanan/pencegahan-kriminalitas",
  }),
  defineSource({
    key: "desa_anti_korupsi", domain: "anti_korupsi", tier: "C", label: "Program Desa Anti Korupsi", model: "DesaAntiKorupsi",
    where: ACTIVE, select: { id: true, name: true, deskripsi: true, createdAt: true, kategori: { select: { name: true } } },
    orderBy: [{ createdAt: "desc" }], take: 10, dateField: "createdAt",
    fields: [["Nama", get("name")], ["Kategori", rel("kategori", "name")], ["Deskripsi", html("deskripsi")]],
    searchFields: ["name", "deskripsi"], href: (row) => programHref(String(row.id ?? "")), menuHref: "/desa-anti-korupsi",
  }),

  // ── Tier D: data angka ────────────────────────────────────────────────
  defineSource({
    key: "apbdes", domain: "apbdes", tier: "D", label: "APBDes", model: "APBDes",
    where: ACTIVE_NOT_DELETED, select: { id: true, tahun: true, name: true, deskripsi: true, jumlah: true },
    orderBy: [{ tahun: "desc" }], take: 6,
    fields: [["Tahun", get("tahun")], ["Nama", get("name")], ["Jumlah", get("jumlah")], ["Keterangan", html("deskripsi")]],
    searchFields: ["name", "deskripsi"], href: "/apbdes", menuHref: "/apbdes",
  }),
  defineSource({
    key: "apbdes_item", domain: "apbdes", tier: "D", label: "Rincian APBDes", model: "APBDesItem",
    where: { ...ACTIVE_NOT_DELETED, apbdes: { isActive: true, deletedAt: null } },
    select: {
      id: true, kode: true, uraian: true, tipe: true, level: true, anggaran: true, totalRealisasi: true, persentase: true,
      apbdes: { select: { tahun: true } },
    },
    orderBy: [{ apbdes: { tahun: "desc" } }, { kode: "asc" }], take: 80,
    fields: [
      ["Tahun", rel("apbdes", "tahun")], ["Kode", get("kode")], ["Uraian", get("uraian")], ["Tipe", get("tipe")],
      ["Anggaran (Rp)", get("anggaran")], ["Realisasi (Rp)", get("totalRealisasi")], ["Realisasi (%)", get("persentase")],
    ],
    title: (row) => `${formatKnowledgeValue(row.kode)} ${formatKnowledgeValue(row.uraian)}`.trim(),
    searchFields: ["uraian", "kode"], href: "/apbdes", menuHref: "/apbdes",
  }),
  defineSource({
    key: "data_banjar", domain: "kependudukan", tier: "D", label: "Data per Banjar", model: "DataBanjar",
    where: ACTIVE_NOT_DELETED, select: { id: true, nama: true, penduduk: true, kk: true, miskin: true, tahun: true },
    orderBy: [{ tahun: "desc" }, { nama: "asc" }],
    fields: [["Banjar", get("nama")], ["Tahun", get("tahun")], ["Penduduk", get("penduduk")], ["KK", get("kk")], ["Penduduk miskin", get("miskin")]],
    searchFields: ["nama"], href: "/kependudukan/dashboard#banjar", menuHref: "/kependudukan/dashboard",
  }),
  defineSource({
    key: "dinamika_penduduk", domain: "kependudukan", tier: "D", label: "Dinamika Penduduk", model: "DinamikaPenduduk",
    where: ACTIVE_NOT_DELETED, select: { id: true, tahun: true, kelahiran: true, kematian: true, masuk: true, keluar: true },
    orderBy: [{ tahun: "desc" }], take: 10,
    fields: [["Tahun", get("tahun")], ["Kelahiran", get("kelahiran")], ["Kematian", get("kematian")], ["Pindah masuk", get("masuk")], ["Pindah keluar", get("keluar")]],
    href: "/kependudukan/dashboard#dinamika", menuHref: "/kependudukan/dashboard",
  }),
  defineSource({
    key: "distribusi_agama", domain: "kependudukan", tier: "D", label: "Distribusi Agama", model: "DistribusiAgama",
    where: ACTIVE_NOT_DELETED, select: { id: true, agama: true, jumlah: true, tahun: true },
    orderBy: [{ tahun: "desc" }, { jumlah: "desc" }],
    fields: [["Agama", get("agama")], ["Tahun", get("tahun")], ["Jumlah", get("jumlah")]],
    searchFields: ["agama"], href: "/kependudukan/dashboard#agama", menuHref: "/kependudukan/dashboard",
  }),
  defineSource({
    key: "distribusi_umur", domain: "kependudukan", tier: "D", label: "Distribusi Umur", model: "DistribusiUmur",
    where: ACTIVE_NOT_DELETED, select: { id: true, rentangUmur: true, jumlah: true, tahun: true },
    orderBy: [{ tahun: "desc" }, { rentangUmur: "asc" }],
    fields: [["Rentang umur", get("rentangUmur")], ["Tahun", get("tahun")], ["Jumlah", get("jumlah")]],
    href: "/kependudukan/dashboard#umur", menuHref: "/kependudukan/dashboard",
  }),
  defineSource({
    key: "demografi_pekerjaan", domain: "ekonomi", tier: "D", label: "Demografi Pekerjaan", model: "DataDemografiPekerjaan",
    where: ACTIVE, select: { id: true, pekerjaan: true, lakiLaki: true, perempuan: true },
    fields: [["Pekerjaan", get("pekerjaan")], ["Laki-laki", get("lakiLaki")], ["Perempuan", get("perempuan")]],
    searchFields: ["pekerjaan"], href: "/ekonomi/demografi-pekerjaan", menuHref: "/ekonomi/demografi-pekerjaan",
  }),
  defineSource({
    key: "data_pengangguran", domain: "ekonomi", tier: "D", label: "Jumlah Pengangguran", model: "DetailDataPengangguran",
    where: ACTIVE,
    select: {
      id: true, month: true, year: true, totalUnemployment: true, educatedUnemployment: true,
      uneducatedUnemployment: true, percentageChange: true,
    },
    orderBy: [{ year: "desc" }, { createdAt: "desc" }], take: 24,
    fields: [
      ["Bulan", get("month")], ["Tahun", get("year")], ["Total", get("totalUnemployment")],
      ["Berpendidikan", get("educatedUnemployment")], ["Tidak berpendidikan", get("uneducatedUnemployment")], ["Perubahan (%)", get("percentageChange")],
    ],
    title: (row) => `${formatKnowledgeValue(row.month)} ${formatKnowledgeValue(row.year)}`,
    href: "/ekonomi/jumlah-pengangguran", menuHref: "/ekonomi/jumlah-pengangguran",
  }),
  defineSource({
    key: "sektor_unggulan", domain: "ekonomi", tier: "D", label: "Sektor Unggulan Desa", model: "SektorUnggulanDesa",
    where: ACTIVE, select: { id: true, name: true, description: true, value: true, satuan: true, periode: true },
    fields: [["Sektor", get("name")], ["Nilai", get("value")], ["Satuan", get("satuan")], ["Periode", get("periode")], ["Keterangan", html("description")]],
    searchFields: ["name", "description"], href: "/ekonomi/sektor-unggulan-desa", menuHref: "/ekonomi/sektor-unggulan-desa",
  }),
  defineSource({
    key: "data_pendidikan", domain: "pendidikan", tier: "D", label: "Data Pendidikan", model: "DataPendidikan",
    where: ACTIVE, select: { id: true, name: true, jumlah: true },
    fields: [["Jenjang", get("name")], ["Jumlah", get("jumlah")]],
    searchFields: ["name"], href: "/pendidikan/data-pendidikan", menuHref: "/pendidikan/data-pendidikan",
  }),
  defineSource({
    key: "data_lingkungan", domain: "lingkungan", tier: "D", label: "Data Lingkungan Desa", model: "DataLingkunganDesa",
    where: ACTIVE, select: { id: true, name: true, jumlah: true, deskripsi: true },
    fields: [["Data", get("name")], ["Jumlah", get("jumlah")], ["Keterangan", html("deskripsi")]],
    searchFields: ["name", "deskripsi"], href: "/lingkungan/data-lingkungan-desa", menuHref: "/lingkungan/data-lingkungan-desa",
  }),
  defineSource({
    key: "pengelolaan_sampah", domain: "lingkungan", tier: "D", label: "Pengelolaan Sampah", model: "PengelolaanSampah",
    where: ACTIVE, select: { id: true, name: true },
    fields: [["Kegiatan", get("name")]],
    searchFields: ["name"], href: "/lingkungan/pengelolaan-sampah-bank-sampah", menuHref: "/lingkungan/pengelolaan-sampah-bank-sampah",
  }),
  defineSource({
    key: "sdgs_desa", domain: "profil_desa", tier: "D", label: "SDGs Desa", model: "SdgsDesa",
    where: ACTIVE, select: { id: true, name: true, jumlah: true },
    fields: [["Tujuan", get("name")], ["Skor", get("jumlah")]],
    searchFields: ["name"], href: "/sdgs-desa", menuHref: "/sdgs-desa",
  }),
];

/** Sumber per key; dibangun sekali. */
export const KNOWLEDGE_SOURCE_BY_KEY: ReadonlyMap<string, KnowledgeSource> = new Map(
  KNOWLEDGE_SOURCES.map((source) => [source.key, source]),
);

/** Semua sumber satu domain, urutan registry. */
export function sourcesOfDomain(domain: KnowledgeDomain): KnowledgeSource[] {
  return KNOWLEDGE_SOURCES.filter((source) => source.domain === domain);
}

/** Delegate Prisma (`prisma.beritaDesa`) untuk nama model PascalCase. */
export function delegateName(model: Prisma.ModelName): string {
  return model.charAt(0).toLowerCase() + model.slice(1);
}
