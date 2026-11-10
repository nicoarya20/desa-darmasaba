// Urut, cari, dan format ukuran dokumen Desa Anti Korupsi — fungsi murni untuk UI publik & admin.
import { fileExtension } from "./desa-anti-korupsi-dokumen";

export type DokumenSortKey = "urutan" | "judul" | "tanggal" | "tipe" | "ukuran";
export type SortDir = "asc" | "desc";

type SortableFile = { mimeType?: string; realName?: string; size?: number | null };
type Sortable = { judul: string; urutan: number; createdAt?: string; file?: SortableFile | null };

const collator = new Intl.Collator("id", { numeric: true, sensitivity: "base" });
const numberId = (maximumFractionDigits: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits });

/** Nilai pembanding per kunci; null = tidak diketahui (selalu di akhir, apa pun arahnya). */
function sortValue(item: Sortable, key: DokumenSortKey): string | number | null {
  switch (key) {
    case "urutan":
      return item.urutan;
    case "judul":
      return item.judul;
    case "tanggal": {
      const time = item.createdAt ? Date.parse(item.createdAt) : NaN;
      return Number.isNaN(time) ? null : time;
    }
    case "tipe":
      return fileExtension(item.file?.realName, item.file?.mimeType);
    case "ukuran":
      return item.file?.size ?? null;
  }
}

function compareValues(a: string | number, b: string | number): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return collator.compare(String(a), String(b));
}

/** Urutkan dokumen (stabil, tanpa mengubah input); nilai tak diketahui (mis. ukuran null) selalu di akhir. */
export function sortDokumen<
  T extends {
    judul: string;
    urutan: number;
    createdAt?: string;
    file?: { mimeType?: string; realName?: string; size?: number | null } | null;
  },
>(list: readonly T[], key: DokumenSortKey, dir: SortDir): T[] {
  const sign = dir === "asc" ? 1 : -1;
  return list
    .map((item, index) => ({ item, index, value: sortValue(item, key) }))
    .sort((a, b) => {
      if (a.value === null || b.value === null) {
        if (a.value === b.value) return a.index - b.index;
        return a.value === null ? 1 : -1;
      }
      return sign * compareValues(a.value, b.value) || a.index - b.index;
    })
    .map((entry) => entry.item);
}

/** Saring dokumen yang judul atau nama berkasnya memuat kata kunci (trim, tanpa beda kapital). */
export function filterDokumen<T extends { judul: string; file?: { realName?: string } | null }>(
  list: readonly T[],
  query: string,
): T[] {
  const q = query.trim().toLocaleLowerCase("id");
  if (!q) return [...list];
  return list.filter(
    (d) => d.judul.toLocaleLowerCase("id").includes(q) || (d.file?.realName ?? "").toLocaleLowerCase("id").includes(q),
  );
}

/** Ukuran berkas ramah baca format id-ID ("512 B", "12 KB", "3,4 MB"); "—" bila tidak diketahui. */
export function formatUkuran(bytes: number | null | undefined): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${numberId(0).format(bytes)} B`;
  const kb = bytes / 1024;
  if (Math.round(kb) < 1024) return `${numberId(0).format(kb)} KB`;
  const mb = kb / 1024;
  if (Math.round(mb * 10) / 10 < 1024) return `${numberId(1).format(mb)} MB`;
  return `${numberId(1).format(mb / 1024)} GB`;
}
