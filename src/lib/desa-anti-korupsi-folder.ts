// Aturan folder dokumen Desa Anti Korupsi (satu tingkat: Program → Folder → Dokumen) —
// fungsi & konstanta murni tanpa I/O, dipakai API, state admin, dan halaman publik.

export const FOLDER_MAX_PER_PROGRAM = 30;
export const FOLDER_NAMA_MAX_LENGTH = 100;
/** Key folder virtual "Umum" (dokumen tanpa folder; bukan baris DB) di URL & UI. */
export const FOLDER_UMUM_KEY = "umum";
export const FOLDER_UMUM_LABEL = "Umum";

/** Rujukan folder dari sebuah dokumen: folder tersimpan, folder baru (tempKey), atau null = "Umum". */
export type FolderRef = { id: string } | { tempKey: string } | null;

/** Satu folder di payload create/update: `id` = folder lama, `tempKey` = folder baru di request ini. */
export type FolderInput = { id?: string; tempKey?: string; nama: string; urutan: number };

/** Folder aktif yang sudah tersimpan di DB, bahan pembanding sinkronisasi. */
export type FolderTersimpan = { id: string; nama: string; urutan: number };

export type FolderSyncPlan = {
  create: { tempKey: string; nama: string; urutan: number }[];
  update: { id: string; nama: string; urutan: number }[];
  remove: string[];
};

type Fail = { ok: false; message: string };
export type FolderRefParseResult = { ok: true; ref: FolderRef } | Fail;
export type FolderParseResult = { ok: true; data: FolderInput[] } | Fail;
export type FolderSyncResult = { ok: true; plan: FolderSyncPlan } | Fail;

const fail = (message: string): Fail => ({ ok: false, message });
const isFilled = (value: unknown): value is string => typeof value === "string" && value.trim() !== "";

/** Kunci pembanding nama folder: abaikan spasi tepi & kapital ("Laporan" = " laporan "). */
export function folderNamaKey(nama: string): string {
  return nama.trim().toLowerCase();
}

type RefObjectResult = { ok: true; ref: NonNullable<FolderRef> } | Fail;

/** Tepat satu dari `id` / `tempKey` harus terisi. */
function parseRefObject(id: unknown, tempKey: unknown): RefObjectResult {
  const hasId = id !== undefined;
  if (hasId === (tempKey !== undefined)) return fail("folder harus berisi id atau tempKey");
  if (hasId) return isFilled(id) ? { ok: true, ref: { id } } : fail("id folder tidak valid");
  return isFilled(tempKey) ? { ok: true, ref: { tempKey } } : fail("tempKey folder tidak valid");
}

/** Validasi field `folder` dokumen: kosong/null → "Umum", objek dengan tepat satu `id` atau `tempKey`. */
export function parseFolderRef(raw: unknown): FolderRefParseResult {
  if (raw === undefined || raw === null) return { ok: true, ref: null };
  if (typeof raw !== "object" || Array.isArray(raw)) return fail("folder tidak valid");
  const { id, tempKey } = raw as Record<string, unknown>;
  return parseRefObject(id, tempKey);
}

/** Validasi daftar folder dari body request: bentuk, nama (wajib, ≤100, unik per program), urutan, batas. */
export function parseFolderList(input: unknown): FolderParseResult {
  if (!Array.isArray(input)) return fail("Daftar folder tidak valid");
  if (input.length > FOLDER_MAX_PER_PROGRAM) {
    return fail(`Maksimal ${FOLDER_MAX_PER_PROGRAM} folder per program`);
  }

  const data: FolderInput[] = [];
  const keys = new Set<string>();
  const names = new Set<string>();

  for (const [index, raw] of input.entries()) {
    const label = `Folder #${index + 1}`;
    if (!raw || typeof raw !== "object") return fail(`${label} tidak valid`);
    const { id, tempKey, nama, urutan } = raw as Record<string, unknown>;

    const ref = parseRefObject(id, tempKey);
    if (!ref.ok) return fail(`${label}: ${ref.message}`);
    if (typeof nama !== "string" || nama.trim() === "") return fail(`${label}: nama folder wajib diisi`);
    if (nama.trim().length > FOLDER_NAMA_MAX_LENGTH) {
      return fail(`${label}: nama folder maksimal ${FOLDER_NAMA_MAX_LENGTH} karakter`);
    }
    if (typeof urutan !== "number" || !Number.isInteger(urutan) || urutan < 0) {
      return fail(`${label}: urutan harus bilangan bulat >= 0`);
    }

    const key = "id" in ref.ref ? `id:${ref.ref.id}` : `tmp:${ref.ref.tempKey}`;
    if (keys.has(key)) return fail(`${label}: folder terkirim dua kali`);
    const namaKey = folderNamaKey(nama);
    if (names.has(namaKey)) return fail(`${label}: nama folder "${nama.trim()}" sudah dipakai`);

    keys.add(key);
    names.add(namaKey);
    data.push({ ...ref.ref, nama: nama.trim(), urutan });
  }

  return { ok: true, data };
}

/**
 * Hitung sinkronisasi folder (array = set final): `tempKey` → create, folder lama yang
 * nama/urutannya berubah → update, folder lama yang tidak dikirim → remove (dokumennya ke "Umum").
 */
export function planFolderSync(existing: FolderTersimpan[], incoming: FolderInput[]): FolderSyncResult {
  const byId = new Map(existing.map((f) => [f.id, f]));
  const plan: FolderSyncPlan = { create: [], update: [], remove: [] };
  const kept = new Set<string>();

  for (const item of incoming) {
    if (item.id === undefined) {
      plan.create.push({ tempKey: item.tempKey ?? "", nama: item.nama, urutan: item.urutan });
      continue;
    }
    const saved = byId.get(item.id);
    if (!saved) return fail("Folder tidak ditemukan pada program ini");
    kept.add(item.id);
    if (saved.nama !== item.nama || saved.urutan !== item.urutan) {
      plan.update.push({ id: item.id, nama: item.nama, urutan: item.urutan });
    }
  }

  plan.remove = existing.filter((f) => !kept.has(f.id)).map((f) => f.id);
  return { ok: true, plan };
}

/** Apakah rujukan folder dokumen menunjuk folder yang berbeda dari `folderId` tersimpan. */
export function isFolderChanged(savedFolderId: string | null, ref: FolderRef): boolean {
  if (ref === null) return savedFolderId !== null;
  if ("tempKey" in ref) return true;
  return ref.id !== savedFolderId;
}

/** Ubah rujukan folder menjadi `folderId` DB setelah folder baru dibuat (`createdIds`: tempKey → id). */
export function resolveFolderId(ref: FolderRef, createdIds: ReadonlyMap<string, string>): string | null {
  if (ref === null) return null;
  if ("id" in ref) return ref.id;
  const id = createdIds.get(ref.tempKey);
  if (!id) throw new Error(`Folder baru dengan tempKey "${ref.tempKey}" belum dibuat`);
  return id;
}
