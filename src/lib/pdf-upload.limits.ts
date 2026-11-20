/**
 * Batas ukuran berkas PDF umum (MB). Sumber tunggal untuk dropzone admin (klien) dan guard
 * `/api/fileStorage/create` (server), supaya keduanya tidak pernah berbeda. Dokumen resmi desa
 * (RPJMDes 55,7 MB) bisa 20–56 MB, maka 60 MB. Dropzone peta wilayah punya batas 10 MB sendiri.
 */
export const PDF_MAX_SIZE_MB = 60;

/** Batas ukuran PDF umum dalam byte (`PDF_MAX_SIZE_MB` MB, basis 1024). */
export const PDF_MAX_SIZE_BYTES = PDF_MAX_SIZE_MB * 1024 ** 2;

/** Pesan penolakan PDF yang melebihi batas, dipakai server (413). */
export const PDF_TOO_LARGE_MESSAGE = `Berkas PDF melebihi batas ukuran ${PDF_MAX_SIZE_MB} MB`;
