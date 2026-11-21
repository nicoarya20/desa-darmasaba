import { PPID_FILE_SELECT } from "../ppid-file";

/** Relasi yang selalu ikut dikirim ke klien: berkas PDF dan gambar pendukung (keduanya null bila tidak ada). */
export const DAFTAR_INFORMASI_INCLUDE = {
  file: { select: PPID_FILE_SELECT },
  gambar: { select: PPID_FILE_SELECT },
} as const;
