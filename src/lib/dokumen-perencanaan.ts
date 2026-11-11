// Aturan Dokumen Perencanaan Desa (RPJM / RKP / Berita Acara Musyawarah) —
// fungsi & konstanta murni, tanpa I/O, dipakai bersama oleh API (Elysia),
// admin, dan halaman publik Monev & Pembangunan.

export const JENIS_DOKUMEN = ["RPJM", "RKP", "BERITA_ACARA_MUSYAWARAH"] as const;
export type JenisDokumen = (typeof JENIS_DOKUMEN)[number];

export const JENIS_DOKUMEN_LABEL: Record<JenisDokumen, string> = {
  RPJM: "RPJM Desa",
  RKP: "RKP Desa",
  BERITA_ACARA_MUSYAWARAH: "Berita Acara Musyawarah",
};

export const JENIS_MUSYAWARAH = ["MUSDES", "MUSRENBANGDES", "MMD", "LAINNYA"] as const;
export type JenisMusyawarah = (typeof JENIS_MUSYAWARAH)[number];

export const JENIS_MUSYAWARAH_LABEL: Record<JenisMusyawarah, string> = {
  MUSDES: "Musyawarah Desa (Musdes)",
  MUSRENBANGDES: "Musrenbang Desa",
  MMD: "Musyawarah Masyarakat Desa (MMD)",
  LAINNYA: "Musyawarah lainnya",
};

/** Anchor section di halaman Monev & Pembangunan, dan tautan publik ke sana (dipakai PPID). */
export const DOKUMEN_PERENCANAAN_SECTION_ID = "dokumen-perencanaan";
export const DOKUMEN_PERENCANAAN_PUBLIC_HREF = `/pemerintahan/monev-pembangunan#${DOKUMEN_PERENCANAAN_SECTION_ID}`;

export const TAHUN_MIN = 2000;
export const TAHUN_MAX = 2100;
export const JUDUL_MIN_LENGTH = 3;
export const JUDUL_MAX_LENGTH = 255;
export const NOMOR_PERDES_MAX_LENGTH = 100;
export const RINGKASAN_MAX_LENGTH = 5000;

/** Data siap simpan ke tabel DokumenPerencanaan (tanpa fileId — ditangani terpisah). */
export type DokumenPerencanaanFields = {
  jenis: JenisDokumen;
  judul: string;
  tahun: number | null;
  tahunMulai: number | null;
  tahunSelesai: number | null;
  nomorPerdes: string | null;
  ringkasan: string | null;
  jenisMusyawarah: JenisMusyawarah | null;
};

/** fileId: undefined = jangan ubah, null = lepas PDF, string = pakai file ini. */
export type DokumenPerencanaanData = DokumenPerencanaanFields & { fileId?: string | null };

export type DokumenParseResult =
  | { ok: true; data: DokumenPerencanaanData }
  | { ok: false; message: string };

/** Apakah nilai adalah jenis dokumen perencanaan yang valid. */
export function isJenisDokumen(value: unknown): value is JenisDokumen {
  return (JENIS_DOKUMEN as readonly unknown[]).includes(value);
}

/** Apakah nilai adalah jenis musyawarah yang valid. */
export function isJenisMusyawarah(value: unknown): value is JenisMusyawarah {
  return (JENIS_MUSYAWARAH as readonly unknown[]).includes(value);
}

const isBlank = (v: unknown) => v === undefined || v === null || v === "";

function isTahunValid(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= TAHUN_MIN && v <= TAHUN_MAX;
}

function optionalText(
  value: unknown,
  label: string,
  max: number,
): { ok: true; value: string | null } | { ok: false; message: string } {
  if (isBlank(value)) return { ok: true, value: null };
  if (typeof value !== "string") return { ok: false, message: `${label} harus berupa teks` };
  const trimmed = value.trim();
  if (trimmed.length > max) return { ok: false, message: `${label} maksimal ${max} karakter` };
  return { ok: true, value: trimmed === "" ? null : trimmed };
}

/** Validasi bagian periode/tahun/musyawarah yang bergantung pada jenis. */
function parsePeriode(
  jenis: JenisDokumen,
  body: Record<string, unknown>,
):
  | { ok: true; value: Pick<DokumenPerencanaanFields, "tahun" | "tahunMulai" | "tahunSelesai" | "jenisMusyawarah"> }
  | { ok: false; message: string } {
  const rentang = `${TAHUN_MIN}-${TAHUN_MAX}`;
  const kosong = { tahun: null, tahunMulai: null, tahunSelesai: null, jenisMusyawarah: null };

  if (jenis === "RPJM") {
    if (!isTahunValid(body.tahunMulai)) {
      return { ok: false, message: `Tahun mulai RPJM wajib diisi (bilangan bulat ${rentang})` };
    }
    if (!isTahunValid(body.tahunSelesai)) {
      return { ok: false, message: `Tahun selesai RPJM wajib diisi (bilangan bulat ${rentang})` };
    }
    if (body.tahunSelesai < body.tahunMulai) {
      return { ok: false, message: "Tahun selesai tidak boleh lebih kecil dari tahun mulai" };
    }
    return { ok: true, value: { ...kosong, tahunMulai: body.tahunMulai, tahunSelesai: body.tahunSelesai } };
  }

  if (!isTahunValid(body.tahun)) {
    return { ok: false, message: `Tahun wajib diisi (bilangan bulat ${rentang})` };
  }
  if (jenis === "RKP") {
    return { ok: true, value: { ...kosong, tahun: body.tahun } };
  }

  if (!isJenisMusyawarah(body.jenisMusyawarah)) {
    return {
      ok: false,
      message: `Jenis musyawarah harus salah satu dari: ${JENIS_MUSYAWARAH.join(", ")}`,
    };
  }
  return { ok: true, value: { ...kosong, tahun: body.tahun, jenisMusyawarah: body.jenisMusyawarah } };
}

/**
 * Validasi & normalisasi body create/update dokumen perencanaan.
 * Field yang tidak relevan untuk jenisnya dikosongkan (mis. RKP tidak menyimpan tahunMulai).
 */
export function parseDokumenPerencanaanInput(body: Record<string, unknown>): DokumenParseResult {
  if (!isJenisDokumen(body.jenis)) {
    return { ok: false, message: `Jenis harus salah satu dari: ${JENIS_DOKUMEN.join(", ")}` };
  }

  const judul = typeof body.judul === "string" ? body.judul.trim() : "";
  if (judul.length < JUDUL_MIN_LENGTH || judul.length > JUDUL_MAX_LENGTH) {
    return {
      ok: false,
      message: `Judul wajib diisi (${JUDUL_MIN_LENGTH}-${JUDUL_MAX_LENGTH} karakter)`,
    };
  }

  const periode = parsePeriode(body.jenis, body);
  if (!periode.ok) return periode;

  const nomorPerdes = optionalText(body.nomorPerdes, "Nomor Perdes", NOMOR_PERDES_MAX_LENGTH);
  if (!nomorPerdes.ok) return nomorPerdes;
  const ringkasan = optionalText(body.ringkasan, "Ringkasan", RINGKASAN_MAX_LENGTH);
  if (!ringkasan.ok) return ringkasan;

  if (body.fileId !== undefined && body.fileId !== null && typeof body.fileId !== "string") {
    return { ok: false, message: "File harus berupa id file yang valid" };
  }

  const data: DokumenPerencanaanData = {
    jenis: body.jenis,
    judul,
    ...periode.value,
    nomorPerdes: nomorPerdes.value,
    ringkasan: ringkasan.value,
  };
  if (body.fileId !== undefined) data.fileId = body.fileId === "" ? null : (body.fileId as string | null);
  return { ok: true, data };
}

/** Teks periode/tahun untuk kartu & tabel: "2021 - 2027" (RPJM) atau "2026". */
export function formatPeriodeDokumen(item: {
  jenis: string;
  tahun?: number | null;
  tahunMulai?: number | null;
  tahunSelesai?: number | null;
}): string {
  if (item.jenis === "RPJM") {
    if (item.tahunMulai == null || item.tahunSelesai == null) return "-";
    return `${item.tahunMulai} - ${item.tahunSelesai}`;
  }
  return item.tahun == null ? "-" : String(item.tahun);
}

export type RkpRef = { id: string; judul: string; tahun: number | null; fileLink: string | null };

/** Indeks dokumen RKP per tahun (dokumen terbaru menang bila ada lebih dari satu per tahun). */
export function buildRkpIndex(
  docs: ReadonlyArray<{ id: string; judul: string; tahun?: number | null; file?: { link: string } | null }>,
): Map<number, RkpRef> {
  const index = new Map<number, RkpRef>();
  for (const d of docs) {
    if (d.tahun == null || index.has(d.tahun)) continue;
    index.set(d.tahun, { id: d.id, judul: d.judul, tahun: d.tahun, fileLink: d.file?.link ?? null });
  }
  return index;
}

/**
 * Label "Bersumber dari RKP Desa {tahun}" untuk kegiatan bertanggal `tanggal`.
 * Null bila tidak ada dokumen RKP di tahun itu (label disembunyikan, bukan klaim kosong).
 */
export function rkpSourceLabel(
  tanggal: string | Date | null | undefined,
  index: ReadonlyMap<number, RkpRef>,
): { label: string; tahun: number; fileLink: string | null } | null {
  if (!tanggal) return null;
  const date = new Date(tanggal);
  if (Number.isNaN(date.getTime())) return null;
  const tahun = date.getFullYear();
  const ref = index.get(tahun);
  if (!ref) return null;
  return { label: `Bersumber dari RKP Desa ${tahun}`, tahun, fileLink: ref.fileLink };
}
