// Ukuran isi berkas FileStorage di MinIO + baca isi berkas siap-unduh (gzip dibuka).
// Klien MinIO di-inject supaya bisa dipakai skrip backfill, endpoint ZIP, dan diuji tanpa MinIO.
import zlib from "zlib";

/** Mime type penanda berkas yang disimpan ter-gzip oleh /api/fileStorage/create (dokumen non-PDF). */
export const GZIP_STORED_MIME = "application/gzip";

/** Bagian klien MinIO yang dibutuhkan untuk membaca ukuran & isi objek. */
export type StorageReader = {
  statObject(bucket: string, objectName: string): Promise<{ size: number }>;
  getPartialObject(bucket: string, objectName: string, offset: number, length?: number): Promise<AsyncIterable<unknown>>;
  getObject(bucket: string, objectName: string): Promise<AsyncIterable<unknown>>;
};

/** Baris FileStorage minimal untuk menemukan objeknya di MinIO. */
export type StoredFileRef = { path: string; name: string; mimeType: string };

/** Nama objek MinIO sebuah FileStorage (`<path>/<name>`, sama dengan findUniq/del). */
export function objectNameOf(file: Pick<StoredFileRef, "path" | "name">): string {
  return `${file.path}/${file.name}`;
}

/** Apakah objek disimpan ter-gzip (isi aslinya didapat setelah gunzip). */
export function isGzipStored(file: Pick<StoredFileRef, "mimeType">): boolean {
  return file.mimeType === GZIP_STORED_MIME;
}

async function readAll(stream: AsyncIterable<unknown>): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk as Uint8Array));
  return Buffer.concat(chunks);
}

/**
 * Ukuran isi berkas (byte) seperti yang diterima pengguna: objek biasa = ukuran objek;
 * objek ter-gzip = ISIZE dari 4 byte trailer gzip (ukuran asli mod 2^32, cukup untuk batas upload).
 */
export async function resolveStoredSize(storage: StorageReader, bucket: string, file: StoredFileRef): Promise<number> {
  const objectName = objectNameOf(file);
  const stat = await storage.statObject(bucket, objectName);
  if (!isGzipStored(file) || stat.size < 4) return stat.size;
  const trailer = await readAll(await storage.getPartialObject(bucket, objectName, stat.size - 4, 4));
  return trailer.readUInt32LE(0);
}

/** Isi berkas siap-unduh: objek ter-gzip dibuka, lainnya apa adanya. */
export async function readFileContent(storage: StorageReader, bucket: string, file: StoredFileRef): Promise<Buffer> {
  const raw = await readAll(await storage.getObject(bucket, objectNameOf(file)));
  return isGzipStored(file) ? zlib.gunzipSync(raw) : raw;
}
