// @vitest-environment node
// Kontrak registry allowlist pengetahuan Jenna: snapshot model.field, regex PII, validasi Prisma.dmmf.
import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  KNOWLEDGE_DOMAINS,
  KNOWLEDGE_SOURCES,
  SOCIAL_ICON_TYPES,
  type KnowledgeSelect,
} from "@/lib/jenna/knowledge/sources";

type DmmfField = (typeof Prisma.dmmf.datamodel.models)[number]["fields"][number];
const MODELS = new Map(
  Prisma.dmmf.datamodel.models.map((model) => [model.name, new Map(model.fields.map((field) => [field.name, field]))]),
);

function fieldOf(model: string, name: string): DmmfField {
  const field = MODELS.get(model)?.get(name);
  if (!field) throw new Error(`${model}.${name} tidak ada di schema`);
  return field;
}

/** Semua `Model.field` yang dibaca registry, termasuk field relasi bersarang (`RelatedModel.field`). */
function selectedFields(model: string, select: KnowledgeSelect): string[] {
  return Object.entries(select).flatMap(([name, value]) => {
    const field = fieldOf(model, name);
    if (value === true) return [`${model}.${name}`];
    expect(field.kind, `${model}.${name} bukan relasi`).toBe("object");
    return [`${model}.${name}`, ...selectedFields(field.type, value.select)];
  });
}

/** `deletedAt: null` hanya sah bila kolomnya nullable TANPA default (analisis §2.3 butir 3). */
function deletedAtFilterIssues(model: string, where: Record<string, unknown> | undefined, path: string): string[] {
  if (!where) return [];
  return Object.entries(where).flatMap(([key, value]) => {
    if (key === "AND" || key === "OR" || key === "NOT") {
      const list = Array.isArray(value) ? value : [value];
      return list.flatMap((item, i) => deletedAtFilterIssues(model, item as Record<string, unknown>, `${path}.${key}[${i}]`));
    }
    const field = fieldOf(model, key);
    if (key === "deletedAt" && value === null && (field.isRequired || field.hasDefaultValue)) {
      return [`${path}: ${model}.deletedAt tidak boleh difilter null (required/default)`];
    }
    if (field.kind === "object" && value && typeof value === "object") {
      return deletedAtFilterIssues(field.type, value as Record<string, unknown>, `${path}.${key}`);
    }
    return [];
  });
}

function nestedWhereIssues(model: string, select: KnowledgeSelect, path: string): string[] {
  return Object.entries(select).flatMap(([name, value]) => {
    if (value === true) return [];
    const related = fieldOf(model, name).type;
    return [
      ...deletedAtFilterIssues(related, value.where, `${path}.${name}.where`),
      ...nestedWhereIssues(related, value.select, `${path}.${name}`),
    ];
  });
}

const PII_PATTERN = /nik|alamat|email|telepon|telp|noHp|nomorTelepon|tanggalLahir|catatan|penyakit|apiKey|password|token|ipAddress/i;

// Pengecualian eksplisit — kontak ORGANISASI yang diizinkan keputusan user 2026-11-13
// (KontakDarurat/KontakItem/PolsekTerdekat/Puskesmas boleh; email/WA kantor desa tidak).
const PII_EXCEPTIONS = new Set([
  "KontakItem.nomorTelepon", // nomor darurat publik (polisi, damkar, dll.) di /keamanan/kontak-darurat
  "PolsekTerdekat.alamat", // alamat kantor polsek
  "PolsekTerdekat.nomorTelepon", // telepon kantor polsek
  "Puskesmas.alamat", // alamat puskesmas; sumber ikut visibilitas menu /kesehatan/puskesmas
  "KontakPuskesmas.email", // email resmi puskesmas; ikut visibilitas menu /kesehatan/puskesmas
  // Catatan: KontakDarurat.whatsapp (nomor layanan darurat kesehatan) juga diizinkan — tidak cocok regex jadi tidak perlu dicantumkan.
]);

const ALL_FIELDS = KNOWLEDGE_SOURCES.flatMap((source) => selectedFields(source.model, source.select));

describe("registry allowlist pengetahuan Jenna", () => {
  it("kontrak: daftar model.field yang dibaca tidak berubah diam-diam", () => {
    expect([...new Set(ALL_FIELDS)].sort()).toMatchSnapshot();
  });

  it("tidak ada field PII selain pengecualian eksplisit", () => {
    const offenders = [...new Set(ALL_FIELDS)].filter(
      (field) => PII_PATTERN.test(field.split(".")[1]) && !PII_EXCEPTIONS.has(field),
    );
    expect(offenders).toEqual([]);
    // Pengecualian yang tak lagi dipakai harus dihapus dari daftar.
    for (const exception of PII_EXCEPTIONS) expect(ALL_FIELDS).toContain(exception);
  });

  it("model yang ditolak keputusan user tidak pernah masuk registry", () => {
    const banned = [
      "User", "Session", "Account", "JennaProvider", "JennaSettings", "JennaConversation", "JennaMessage", "FileStorage",
      "Siswa", "Pengajar", "Balita", "IbuHamil", "BeasiswaPendaftar", "Kelahiran", "Kematian", "MigrasiPenduduk",
      "AjukanPermohonan", "PengaduanMasyarakat", "AdministrasiOnline", "AjukanIdeInovatif", "LaporanPublik",
      "PeminjamanBuku", "PendaftaranJadwalKegiatan", "Responden", "PenjualanProduk",
    ];
    const used = new Set(ALL_FIELDS.map((field) => field.split(".")[0]));
    expect(banned.filter((model) => used.has(model))).toEqual([]);
  });

  it("setiap model & field ada di Prisma.dmmf dan deletedAt null hanya pada kolom nullable", () => {
    const issues = KNOWLEDGE_SOURCES.flatMap((source) => [
      ...deletedAtFilterIssues(source.model, source.where, source.key),
      ...nestedWhereIssues(source.model, source.select, source.key),
    ]);
    expect(issues).toEqual([]);
  });

  it("model dengan deletedAt nullable tanpa default selalu memfilter deletedAt: null", () => {
    const missing = KNOWLEDGE_SOURCES.filter((source) => {
      const field = MODELS.get(source.model)?.get("deletedAt");
      return field && !field.isRequired && !field.hasDefaultValue && source.where.deletedAt !== null;
    }).map((source) => source.key);
    expect(missing).toEqual([]);
  });

  it("select selalu eksplisit (tanpa include/omit) dan field pencarian/tanggal adalah kolom skalar terpilih", () => {
    for (const source of KNOWLEDGE_SOURCES) {
      expect(source.select, source.key).not.toHaveProperty("include");
      expect(source.select, source.key).not.toHaveProperty("omit");
      expect(source.select.id, source.key).toBe(true);
      for (const field of source.searchFields) {
        expect(source.select[field], `${source.key}.${field}`).toBe(true);
        expect(fieldOf(source.model, field).type, `${source.key}.${field}`).toBe("String");
      }
      if (source.dateField) expect(fieldOf(source.model, source.dateField).type).toBe("DateTime");
    }
  });

  it("key unik, domain sah, href & menuHref adalah path internal", () => {
    const keys = KNOWLEDGE_SOURCES.map((source) => source.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const source of KNOWLEDGE_SOURCES) {
      expect(KNOWLEDGE_DOMAINS).toContain(source.domain);
      expect(source.menuHref.startsWith("/"), source.key).toBe(true);
      expect(source.href().startsWith("/"), source.key).toBe(true);
    }
  });

  it("media sosial tidak memuat tipe kontak (whatsapp/telepon/email)", () => {
    expect(SOCIAL_ICON_TYPES).not.toContain("whatsapp");
    expect(SOCIAL_ICON_TYPES).not.toContain("telephone");
    expect(SOCIAL_ICON_TYPES).not.toContain("gmail");
  });

  it("toText merender field berlabel, membuang HTML dan nilai kosong", () => {
    const source = KNOWLEDGE_SOURCES.find((s) => s.key === "layanan_surat_keterangan")!;
    const text = source.toText({ id: "c1", name: "Surat Domisili", deskripsi: "<p>Syarat: <b>KTP</b></p>", estimasiWaktu: null, biaya: 0 });
    expect(text).toBe("Layanan: Surat Domisili\nBiaya (Rp): 0\nKeterangan: Syarat: KTP");
    expect(source.href({ id: "c1" })).toBe("/pemerintahan/layanan/c1");
    expect(source.href()).toBe("/pemerintahan/layanan");
  });
});
