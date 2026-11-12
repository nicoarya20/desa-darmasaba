// Skema body Elysia untuk isi folder dokumen (folder + dokumen) yang dipakai bersama oleh endpoint
// Desa Anti Korupsi dan APBDes. Tipe dasar saja; aturan detail (judul/nama wajib, urutan, duplikat,
// kepemilikan, batas folder, rujukan tempKey) divalidasi planProgramSync supaya pesan error seragam (400).
import { t } from "elysia";
import { DOKUMEN_MAX_PER_PROGRAM } from "./desa-anti-korupsi-dokumen";

const folderRefBody = t.Optional(
  t.Nullable(t.Object({ id: t.Optional(t.String()), tempKey: t.Optional(t.String()) }))
);

/** Daftar dokumen final: tanpa `id` = baru, `folder` null / tidak dikirim = folder virtual "Umum". */
export const dokumenBody = t.Array(
  t.Object({
    id: t.Optional(t.String()),
    fileId: t.String(),
    judul: t.String(),
    urutan: t.Number(),
    folder: folderRefBody,
  }),
  { maxItems: DOKUMEN_MAX_PER_PROGRAM }
);

/** Daftar folder final. Tanpa maxItems: batas folder dicek planProgramSync agar respons tetap 400 + pesan. */
export const foldersBody = t.Array(
  t.Object({
    id: t.Optional(t.String()),
    tempKey: t.Optional(t.String()),
    nama: t.String(),
    urutan: t.Number(),
  })
);
