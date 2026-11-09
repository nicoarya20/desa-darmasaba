import Elysia, { t } from "elysia";
import desaAntiKorupsiDelete from "./del";
import desaAntiKorupsiFindMany from "./findMany";
import desaAntiKorupsiFindUnique from "./findUnique";
import desaAntiKorupsiUpdate from "./updt";
import desaAntiKorupsiCreate from "./create";
import desaAntiKorupsiSalinKeProgram from "./salin";
import {
  desaAntiKorupsiSampahHapus,
  desaAntiKorupsiSampahList,
  desaAntiKorupsiSampahPulihkan,
} from "./sampah";
import desaAntiKorupsiZip from "./zip";
import { DOKUMEN_MAX_PER_PROGRAM } from "@/lib/desa-anti-korupsi-dokumen";

// Tipe dasar saja; aturan dokumen & folder (judul/nama wajib, urutan, duplikat, kepemilikan,
// batas folder, rujukan tempKey) divalidasi di planProgramSync supaya pesan error seragam (400).
const folderRefBody = t.Optional(
  t.Nullable(t.Object({ id: t.Optional(t.String()), tempKey: t.Optional(t.String()) }))
);

const dokumenBody = t.Array(
  t.Object({
    id: t.Optional(t.String()),
    fileId: t.String(),
    judul: t.String(),
    urutan: t.Number(),
    folder: folderRefBody, // null / tidak dikirim = folder virtual "Umum"
  }),
  { maxItems: DOKUMEN_MAX_PER_PROGRAM }
);

// Tanpa maxItems: batas 30 folder dicek planProgramSync agar respons tetap 400 + pesan.
const foldersBody = t.Array(
  t.Object({
    id: t.Optional(t.String()),
    tempKey: t.Optional(t.String()),
    nama: t.String(),
    urutan: t.Number(),
  })
);

const DesaAntiKorupsi = new Elysia({
  prefix: "/desaantikorupsi",
  tags: ["Landing Page/Desa Anti Korupsi"],
})

  // ✅ Find all
  .get("/findMany", desaAntiKorupsiFindMany)

  // ✅ Find by ID
  .get("/:id", desaAntiKorupsiFindUnique)

  // ✅ Tempat sampah dokumen (khusus admin; guard di handler, retensi DAK_SAMPAH_RETENSI_HARI)
  .get("/:id/sampah", desaAntiKorupsiSampahList)
  .post("/sampah/:dokumenId/pulihkan", desaAntiKorupsiSampahPulihkan)
  .delete("/sampah/:dokumenId", desaAntiKorupsiSampahHapus)

  // ✅ Salin dokumen ke program lain (khusus admin; langsung tersimpan). Aturan 1..50 id, kepemilikan
  // folder & batas dokumen dicek di handler supaya respons 400/409 + pesan.
  .post("/dokumen/salin-ke-program", desaAntiKorupsiSalinKeProgram, {
    body: t.Object({
      dokumenIds: t.Array(t.String()),
      targetProgramId: t.String(),
      targetFolderId: t.Nullable(t.String()),
    }),
  })

  // ✅ Unduh ZIP dokumen aktif (publik); ?folder=<id|umum> = satu folder saja
  .get("/:id/zip", desaAntiKorupsiZip, {
    query: t.Object({ folder: t.Optional(t.String()) }),
  })

  // ✅ Create
  .post("/create", desaAntiKorupsiCreate, {
    body: t.Object({
      name: t.String(),
      deskripsi: t.String(),
      kategoriId: t.String(),
      folders: t.Optional(foldersBody),
      dokumen: t.Optional(dokumenBody),
    }),
  })

  // ✅ Update
  .put("/:id", desaAntiKorupsiUpdate, {
    body: t.Object({
        name: t.String(),
        deskripsi: t.String(),
        kategoriId: t.String(),
        // tidak dikirim = dipertahankan; array = set final (folder hilang → dokumennya ke "Umum")
        folders: t.Optional(foldersBody),
        dokumen: t.Optional(dokumenBody),
    }),
  })
  // ✅ Delete
  .delete("/del/:id", desaAntiKorupsiDelete);

export default DesaAntiKorupsi;
