export interface ParsedRange {
  start: number;
  end: number;
  chunkSize: number;
}

// Parse header "Range: bytes=start-end" dan clamp ke batas ukuran file.
// Dipisah dari findUniq.ts supaya logikanya bisa di-unit-test tanpa
// DB/MinIO (dan tanpa environment jsdom yang saat ini bermasalah, lihat
// __tests__/api/fileStorage.test.ts).
//
// Browser <audio>/<video> selalu mengirim bentuk "bytes=<start>-" (open-ended)
// saat seek, jadi suffix-range spec ("bytes=-500") tidak ditangani secara
// RFC-lengkap di sini — di luar kebutuhan bug yang sedang diperbaiki (YAGNI).
export function parseRangeHeader(rangeHeader: string, totalSize: number): ParsedRange | null {
  const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
  if (!match || totalSize <= 0) return null;

  const rawStart = match[1] ? parseInt(match[1], 10) : 0;
  const rawEnd = match[2] ? parseInt(match[2], 10) : totalSize - 1;

  const start = Math.max(0, Math.min(rawStart, totalSize - 1));
  const end = Math.max(start, Math.min(rawEnd, totalSize - 1));
  const chunkSize = end - start + 1;

  return { start, end, chunkSize };
}
