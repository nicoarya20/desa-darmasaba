// Unduh ZIP dokumen Desa Anti Korupsi dari browser (dipakai halaman publik & admin).
// Lewat fetch, bukan <a href>, supaya error 404/413 tampil sebagai pesan, bukan halaman JSON.

/** Hasil unduh ZIP: sukses, atau gagal dengan pesan siap tampil. */
export type UnduhZipResult = { ok: true; fileName: string } | { ok: false; message: string };

const ZIP_API_BASE = "/api/landingpage/desaantikorupsi";
const PESAN_DEFAULT = "Gagal mengunduh ZIP. Coba lagi atau unduh per dokumen.";

/** URL endpoint ZIP; `folder` = id folder, "umum", atau kosong untuk seluruh program. */
export function zipUrl(programId: string, folder?: string | null): string {
  const base = `${ZIP_API_BASE}/${encodeURIComponent(programId)}/zip`;
  return folder ? `${base}?${new URLSearchParams({ folder }).toString()}` : base;
}

/** Nama berkas dari header Content-Disposition (utamakan filename* UTF-8). */
export function fileNameFromDisposition(header: string | null, fallback = "dokumen.zip"): string {
  if (!header) return fallback;
  const star = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (star) {
    try {
      return decodeURIComponent(star[1].trim());
    } catch {
      // Header rusak (percent-encoding tidak valid): pakai filename="..." biasa di bawah.
    }
  }
  const plain = /filename="([^"]+)"/i.exec(header);
  return plain ? plain[1] : fallback;
}

/** Pesan gagal dari status + body JSON `{message}` endpoint (body boleh tidak ada). */
export function pesanGagalZip(status: number, body: unknown): string {
  const message =
    body && typeof body === "object" && "message" in body && typeof (body as { message: unknown }).message === "string"
      ? (body as { message: string }).message
      : null;
  if (message) return message;
  if (status === 404) return "Dokumen tidak ditemukan atau folder kosong.";
  if (status === 413) return "Ukuran ZIP terlalu besar. Silakan unduh per dokumen.";
  return PESAN_DEFAULT;
}

/** Simpan blob sebagai unduhan di browser. */
function simpanBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Unduh ZIP satu program (atau satu folder); tidak melempar error — hasil dikembalikan sebagai UnduhZipResult. */
export async function unduhZipDak(
  programId: string,
  folder?: string | null,
  deps: { fetchImpl?: typeof fetch; save?: (blob: Blob, fileName: string) => void } = {},
): Promise<UnduhZipResult> {
  const { fetchImpl = fetch, save = simpanBlob } = deps;
  let res: Response;
  try {
    res = await fetchImpl(zipUrl(programId, folder));
  } catch {
    return { ok: false, message: "Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi." };
  }
  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    return { ok: false, message: pesanGagalZip(res.status, body) };
  }
  const fileName = fileNameFromDisposition(res.headers.get("Content-Disposition"));
  save(await res.blob(), fileName);
  return { ok: true, fileName };
}
